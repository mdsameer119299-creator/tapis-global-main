import { createHash } from 'crypto'

/** Deterministic, privacy-safe fingerprints of Search Console rows. Pure functions; no I/O.
 *
 *  Canonical encoding (v1), identical in JavaScript (here) and SQL (the *_SQL builders below):
 *   - every field is written as `<UTF-8 byte length>:<value>` and the fields are concatenated in a fixed order;
 *   - integers use their decimal text, dates are YYYY-MM-DD, floats are the 8-byte big-endian IEEE-754 pattern as 16 hex chars
 *     (so 0.1+0.2 and 5e-324 are compared bit-for-bit; -0 is normalised to +0 because it cannot survive JSON/pg serialisation, never through a decimal round trip);
 *   - a row hash is SHA-256 (hex) of that string; a set hash is SHA-256 of `<count>:` + the row hashes sorted ascending and concatenated.
 *  A fingerprint therefore proves the exact set of rows without ever carrying a query, a URL or any other row text. */

export const FINGERPRINT_VERSION = 'sha256-v1'

export interface DailyRow { date: string; clicks: number; impressions: number; ctr: number; position: number }
export interface PerfRow extends DailyRow { page: string; query: string; country: string; device: string }

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex')
const field = (s: string): string => `${Buffer.byteLength(s, 'utf8')}:${s}`
export function float8Hex(x: number): string {
  const b = Buffer.alloc(8)
  b.writeDoubleBE(x === 0 ? 0 : x) // -0 is stored as +0 (JSON and the pg driver both serialise -0 as "0"), so both encode as +0
  return b.toString('hex')
}

export const dailyRowHash = (r: DailyRow): string => sha(field(r.date) + field(String(r.clicks)) + field(String(r.impressions)) + field(float8Hex(r.ctr)) + field(float8Hex(r.position)))
export const perfRowHash = (r: PerfRow): string =>
  sha(field(r.date) + field(r.page) + field(r.query) + field(r.country) + field(r.device) + field(String(r.clicks)) + field(String(r.impressions)) + field(float8Hex(r.ctr)) + field(float8Hex(r.position)))
export const setHash = (rowHashes: string[]): string => sha(`${rowHashes.length}:${rowHashes.slice().sort().join('')}`)
export const dailyFingerprint = (rows: DailyRow[]): string => setHash(rows.map(dailyRowHash))
export const perfFingerprint = (rows: PerfRow[]): string => setHash(rows.map(perfRowHash))

/** Per-date set hashes (hashes only) so a mismatch can be localised to a day without exposing any row text. */
export function perfFingerprintByDate(rows: PerfRow[]): Record<string, string> {
  const by: Record<string, string[]> = {}
  rows.forEach((r) => { (by[r.date] = by[r.date] || []).push(perfRowHash(r)) })
  const out: Record<string, string> = {}
  Object.keys(by).sort().forEach((d) => { out[d] = setHash(by[d]) })
  return out
}

/** Stable per-row key stored in seo_search_performance."rowKey" (unique per site). */
export const performanceRowKey = (r: Pick<PerfRow, 'date' | 'page' | 'query' | 'country' | 'device'>): string => sha(JSON.stringify([r.date, r.page, r.query, r.country, r.device]))

/** Text a Postgres TEXT column can hold and that encodes identically in JS and SQL: no NUL, no lone surrogates. */
export function isStorableText(s: unknown): s is string {
  return typeof s === 'string' && s.indexOf('\u0000') === -1 && !/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/.test(s)
}

// ---- SQL twins (run inside the importer's own transaction; they only SELECT) ----
const F = (expr: string) => `octet_length(${expr})||':'||${expr}`
/** Row hash expression for seo_search_performance columns (unqualified column names). */
export const PERF_ROW_HASH_SQL = `encode(sha256(convert_to(${F(`to_char(date,'YYYY-MM-DD')`)}||${F('page')}||${F('query')}||${F('country')}||${F('device')}||${F('clicks::text')}||${F('impressions::text')}||'16:'||encode(float8send(ctr),'hex')||'16:'||encode(float8send("position"),'hex'),'UTF8')),'hex')`
export const DAILY_ROW_HASH_SQL = `encode(sha256(convert_to(${F(`to_char(date,'YYYY-MM-DD')`)}||${F('clicks::text')}||${F('impressions::text')}||'16:'||encode(float8send(ctr),'hex')||'16:'||encode(float8send("position"),'hex'),'UTF8')),'hex')`
/** SELECT yielding one row (n, s): the row count and the set hash of `table` rows matching `where` (which may use $1.. params). */
export const fingerprintSql = (table: 'seo_search_performance' | 'seo_search_daily', where: string): string => {
  const h = table === 'seo_search_performance' ? PERF_ROW_HASH_SQL : DAILY_ROW_HASH_SQL
  return `WITH h AS (SELECT ${h} AS h FROM ${table} WHERE ${where}) SELECT count(*)::int AS n, encode(sha256(convert_to(count(*)||':'||coalesce(string_agg(h,'' ORDER BY h COLLATE "C"),''),'UTF8')),'hex') AS s FROM h`
}
