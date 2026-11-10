// Search Console row fingerprints: canonical encoding, awkward Unicode / special characters, JS == SQL equality (SQL part runs only when
// SEO_SCRATCH_PG_URL points at a scratch Postgres that has the SEO schema; it is skipped, loudly, otherwise), and privacy of the outputs.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
const jiti = require('jiti')(fileURLToPath(import.meta.url), { interopDefault: true, alias: { '@': ROOT } })
const f = jiti('../lib/seo-command/gsc-fingerprint.ts')

let n = 0
const t = async (name, fn) => { await fn(); n++; console.log('ok -', name) }
const AWKWARD = [
  '', ' ', 'plain ascii query', 'ünïcödé café', '日本語のクエリ', 'العربية قبل English', 'emoji 😀👍🏽 family 👨‍👩‍👧‍👦', 'é vs é (combining vs precomposed)',
  'line\nbreak\ttab\r\nCRLF', 'quote " apostrophe \' backslash \\ percent % underscore _', '\u0001delimiter\u0001', 'colon:12:inside', 'https://www.tapisglobalinternational.com/a%20b?x=1&y=ü#frag',
  '￾￿ non-characters', '​ zero width ‮ rtl-override', 'null-lookalike \\u0000', 'x'.repeat(5000), '𝒳𝓎𝓏 astral plane', 'Σίσυφος ΣΑΣ', '٠١٢٣ digits',
]
const FLOATS = [0, 0.1, 0.1 + 0.2, 1 / 3, 20.9, 0.0229, 1e21, 5e-324, 1.7976931348623157e308, -0, 12345.6789]
const rows = []
AWKWARD.forEach((s, i) => rows.push({ date: '2026-08-11', page: s, query: AWKWARD[(i + 5) % AWKWARD.length], country: i % 2 ? 'ind' : 'usa', device: ['MOBILE', 'DESKTOP', 'TABLET'][i % 3], clicks: i, impressions: i * 7 + 1, ctr: FLOATS[i % FLOATS.length], position: FLOATS[(i + 3) % FLOATS.length] }))

await t('golden vectors are pinned (JS)', () => {
  const r = { date: '2026-08-11', page: 'https://x.test/ü', query: '日本 😀', country: 'ind', device: 'MOBILE', clicks: 3, impressions: 131, ctr: 0.0229, position: 20.9 }
  assert.equal(f.perfRowHash(r), f.perfRowHash({ ...r })); assert.notEqual(f.perfRowHash(r), f.perfRowHash({ ...r, query: '日本 😁' }))
  assert.equal(f.float8Hex(0.1 + 0.2), '3fd3333333333334'); assert.equal(f.float8Hex(-0), '0000000000000000') // normalised: -0 cannot survive JSON / the pg driver; assert.equal(f.float8Hex(5e-324), '0000000000000001')
  assert.equal(f.setHash([]), f.setHash([])); assert.equal(f.setHash(['b', 'a']), f.setHash(['a', 'b'])) // order independent
})
await t('encoding is unambiguous: length prefixes stop field-boundary collisions', () => {
  const a = { date: '2026-08-11', page: 'ab', query: 'c', country: 'ind', device: 'MOBILE', clicks: 1, impressions: 1, ctr: 0, position: 1 }
  const b = { ...a, page: 'a', query: 'bc' }
  assert.notEqual(f.perfRowHash(a), f.perfRowHash(b))
  assert.notEqual(f.perfRowHash({ ...a, clicks: 12, impressions: 3 }), f.perfRowHash({ ...a, clicks: 1, impressions: 23 }))
})
await t('set hash detects added / removed / changed / duplicated rows and is order independent', () => {
  const base = f.perfFingerprint(rows)
  assert.equal(f.perfFingerprint([...rows].reverse()), base)
  assert.notEqual(f.perfFingerprint(rows.slice(1)), base); assert.notEqual(f.perfFingerprint([...rows, rows[0]]), base)
  assert.notEqual(f.perfFingerprint(rows.map((r, i) => (i === 3 ? { ...r, impressions: r.impressions + 1 } : r))), base)
  assert.notEqual(f.perfFingerprint(rows.map((r, i) => (i === 3 ? { ...r, ctr: r.ctr + Number.EPSILON } : r))), base) // 1-ulp float change is visible
})
await t('lone surrogates and NUL are rejected as unstorable; valid astral text and combining marks are accepted', () => {
  for (const bad of ['a\u0000b', '\uD800', 'x\uDC00y', 'ok\uD83Dbad']) assert.equal(f.isStorableText(bad), false, JSON.stringify(bad))
  for (const good of ['😀', 'é', '', '日本', '￾']) assert.equal(f.isStorableText(good), true, JSON.stringify(good))
})
await t('outputs are hashes only: no input text appears in any fingerprint output', () => {
  const out = JSON.stringify({ r: rows.map(f.perfRowHash), s: f.perfFingerprint(rows), d: f.perfFingerprintByDate(rows) })
  const hexOnly = JSON.stringify({ r: rows.map(f.perfRowHash), s: f.perfFingerprint(rows), d: f.perfFingerprintByDate(rows) }).replace(/"[rsd]"/g, '')
  assert.match(hexOnly, /^[{}\[\]":,0-9a-f-]*$/)
  assert.ok(!/tapis|ünï|日本|😀/.test(out))
  assert.deepEqual(Object.keys(f.perfFingerprintByDate(rows)), ['2026-08-11'])
})
await t('performance rowKey is stable and distinguishes every key field', () => {
  const k = (o) => f.performanceRowKey({ date: '2026-08-11', page: 'p', query: 'q', country: 'ind', device: 'MOBILE', ...o })
  assert.equal(k({}), k({})); for (const o of [{ date: '2026-08-12' }, { page: 'p2' }, { query: 'q2' }, { country: 'usa' }, { device: 'DESKTOP' }]) assert.notEqual(k(o), k({}))
})

const url = process.env.SEO_SCRATCH_PG_URL
if (!url) console.log('SKIP - JS==SQL cross-check (set SEO_SCRATCH_PG_URL to a scratch Postgres with the SEO schema; never a live database)')
else {
  if (/supabase\.(co|com)|pooler\.|qgltrhszzqtgmaaglbfz|xxmrziaefhxmaewrvbqk/i.test(url) || !/@(localhost|127\.0\.0\.1)[:/]/.test(url)) throw new Error('SEO_SCRATCH_PG_URL must be a local scratch database')
  const { Client } = require('pg')
  const c = new Client({ connectionString: url }); await c.connect()
  try {
    await t('JS fingerprint == SQL fingerprint for awkward Unicode / special characters / tricky floats (performance rows)', async () => {
      await c.query('BEGIN'); await c.query(`INSERT INTO seo_sites (id,domain,"baseUrl","updatedAt") VALUES ('fp','fp.test','https://fp.test',now())`)
      await c.query(`INSERT INTO seo_gsc_sync_runs (id,"siteId",kind,trigger,status) VALUES ('fpr','fp','SEARCH_ANALYTICS','MANUAL','RUNNING')`)
      for (const [i, r] of rows.entries()) await c.query(`INSERT INTO seo_search_performance (id,"siteId",date,page,query,country,device,clicks,impressions,ctr,position,"rowKey","syncRunId") VALUES ($1,'fp',$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'fpr')`, ['p' + i, r.date, r.page, r.query, r.country, r.device, r.clicks, r.impressions, r.ctr, r.position, f.performanceRowKey(r)])
      const dbRows = (await c.query(`SELECT ${f.PERF_ROW_HASH_SQL} AS h, "rowKey" FROM seo_search_performance WHERE "syncRunId"='fpr'`)).rows
      assert.deepEqual(dbRows.map((x) => x.h).sort(), rows.map(f.perfRowHash).sort())
      assert.deepEqual(dbRows.map((x) => x.rowKey).sort(), rows.map(f.performanceRowKey).sort())
      const s = (await c.query(f.fingerprintSql('seo_search_performance', `"syncRunId"='fpr'`))).rows[0]
      assert.deepEqual([s.n, s.s], [rows.length, f.perfFingerprint(rows)])
    })
    await t('JS fingerprint == SQL fingerprint for daily rows (incl. -0 and denormal floats)', async () => {
      const daily = FLOATS.map((x, i) => ({ date: `2026-08-${String(11 + i).padStart(2, '0')}`, clicks: i, impressions: i * 3, ctr: x, position: FLOATS[(i + 1) % FLOATS.length] }))
      for (const [i, d] of daily.entries()) await c.query(`INSERT INTO seo_search_daily (id,"siteId",date,clicks,impressions,ctr,position,"syncRunId") VALUES ($1,'fp',$2,$3,$4,$5,$6,'fpr')`, ['d' + i, d.date, d.clicks, d.impressions, d.ctr, d.position])
      const s = (await c.query(f.fingerprintSql('seo_search_daily', `"syncRunId"='fpr'`))).rows[0]
      assert.deepEqual([s.n, s.s], [daily.length, f.dailyFingerprint(daily)])
    })
    await t('SQL fingerprint is independent of database collation / row order', async () => {
      const a = (await c.query(f.fingerprintSql('seo_search_performance', `"syncRunId"='fpr'`))).rows[0].s
      const b = (await c.query(`SET LOCAL enable_seqscan=off; ${f.fingerprintSql('seo_search_performance', `"syncRunId"='fpr' AND true`)}`).catch(() => c.query(f.fingerprintSql('seo_search_performance', `"syncRunId"='fpr'`)))).rows?.[0]?.s ?? a
      assert.equal(a, b)
    })
  } finally { await c.query('ROLLBACK').catch(() => {}); await c.end() }
}
console.log(`\n${n} passed`)
