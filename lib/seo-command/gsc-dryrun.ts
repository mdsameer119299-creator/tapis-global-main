import { refreshAccessToken } from './gsc-google'
import type { GscOAuthConfig } from './gsc-oauth'
import type { CallOutcome } from './gsc-connectivity'
import { FINGERPRINT_VERSION, dailyFingerprint, isStorableText, perfFingerprint, perfFingerprintByDate, type PerfRow } from './gsc-fingerprint'

/** TEMPORARY, READ-ONLY 90-day Search Console dry-run. Delete this file, its route
 *  (app/api/admin/seo/gsc/dry-run/route.ts) and its test to remove it; nothing else depends on it.
 *
 *  - Only the approved scope (webmasters.readonly) is used, via the existing refresh token.
 *  - Property and date range are FIXED here; the route accepts only a step name and a window index.
 *  - Nothing is stored. Results are AGGREGATE counts and safe diagnostics: no search query text, no page URLs,
 *    no tokens and no credentials ever appear in a result (distinct queries/pages are only counted).
 *  - Only Search Analytics queries and sitemaps.list are called. No URL Inspection, GA4 or PageSpeed. */
type Fetch = typeof fetch

export const DRYRUN_PROPERTY = 'sc-domain:tapisglobalinternational.com'
export const RANGE_START = '2026-08-11'
export const RANGE_END = '2026-11-08' // inclusive; the latest day with final data
export const ROW_LIMIT = 25_000
export const DETAIL_DIMENSIONS = ['date', 'page', 'query', 'country', 'device'] as const
export const MAX_PAGES_PER_CALL = 6
const API = 'https://www.googleapis.com/webmasters/v3'
const TIMEOUT_MS = 25_000
const DAY = 86_400_000

const ms = (d: string) => Date.parse(`${d}T00:00:00Z`)
const ymd = (t: number) => new Date(t).toISOString().slice(0, 10)

export interface DryRunWindow { index: number; startDate: string; endDate: string; days: number }

/** 13 windows covering RANGE_START..RANGE_END inclusive: twelve 7-day windows and a final 6-day window. */
export function buildWindows(): DryRunWindow[] {
  const out: DryRunWindow[] = []
  const last = ms(RANGE_END)
  for (let start = ms(RANGE_START), i = 1; start <= last; start += 7 * DAY, i++) {
    const end = Math.min(start + 6 * DAY, last)
    out.push({ index: i, startDate: ymd(start), endDate: ymd(end), days: (end - start) / DAY + 1 })
  }
  return out
}

export function expectedDates(): string[] {
  const out: string[] = []
  for (let t = ms(RANGE_START); t <= ms(RANGE_END); t += DAY) out.push(ymd(t))
  return out
}

async function post<T>(f: Fetch, at: string, url: string, body: unknown): Promise<CallOutcome<T>> {
  return send<T>(f, at, 'POST', url, body)
}

async function send<T>(f: Fetch, at: string, method: 'GET' | 'POST', url: string, body?: unknown): Promise<CallOutcome<T>> {
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS)
  try {
    const res = await f(url, {
      method,
      headers: { authorization: `Bearer ${at}`, ...(body === undefined ? {} : { 'content-type': 'application/json' }) },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: ctl.signal,
      cache: 'no-store',
    })
    const json = (await res.json().catch(() => ({}))) as any
    if (res.status >= 200 && res.status < 300) return { ok: true, httpStatus: res.status, data: json as T }
    const gs = typeof json?.error?.status === 'string' && /^[A-Z_]{1,40}$/.test(json.error.status) ? json.error.status : undefined
    const msg = typeof json?.error?.message === 'string' ? json.error.message.slice(0, 160) : undefined
    return { ok: false, httpStatus: res.status, googleStatus: gs, message: msg }
  } catch {
    return { ok: false, httpStatus: null, message: 'network error or timeout' }
  } finally {
    clearTimeout(timer)
  }
}

type Row = { keys?: string[]; clicks?: number; impressions?: number; ctr?: number; position?: number }
type SaResp = { rows?: Row[]; responseAggregationType?: string }
const n = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0)
const sa = (site: string) => `${API}/sites/${site}/searchAnalytics/query`

export type StepError = { ok: false; httpStatus: number | null; googleStatus?: string; message?: string }

export interface DailyReport {
  step: 'daily'; ok: true; property: string; startDate: string; endDate: string; apiRequests: number
  rowsReturned: number; rowLimit: number; hitRowLimit: boolean
  firstDate: string | null; lastDate: string | null; daysWithData: number; expectedDays: number; missingDates: string[]
  totals: { clicks: number; impressions: number }
  responseAggregationType: string | null
  /** Row-level set hash of the daily rows (hashes only; see gsc-fingerprint.ts). */
  fingerprint: { version: string; rows: number; set: string }
  daily: { date: string; clicks: number; impressions: number; ctr: number; position: number }[]
}

export interface WindowReport {
  step: 'window'; ok: true; property: string; window: DryRunWindow; apiRequests: number
  pages: { startRow: number; rows: number }[]
  rowsReturned: number; rowLimit: number
  complete: boolean // true only when the last page came back shorter than rowLimit (the API has nothing more to give)
  nextStartRow: number | null // set when stopped early (page cap): call again with this startRow
  hitRowLimitOnAnyPage: boolean
  distinctDates: number; maxRowsOnOneDate: number; distinctPages: number; distinctQueries: number; duplicateKeys: number
  detailTotals: { clicks: number; impressions: number }
  responseAggregationType: string | null
  /** Row-level fingerprint of EVERY detail row of the window (date,page,query,country,device,clicks,impressions,ctr,position). Hashes only: no query text or URL
   *  is returned. null unless the whole window arrived in this one call (complete and startRow 0). unstorableRows counts rows a Postgres TEXT column could not hold. */
  fingerprint: { version: string; rows: number; set: string; byDate: Record<string, string>; unstorableRows: number } | null
  note: string
}

export interface SitemapReport {
  step: 'sitemaps'; ok: true; property: string; apiRequests: number
  sitemaps: { path: string; type: string | null; isPending: boolean | null; isSitemapsIndex: boolean | null; lastSubmitted: string | null; lastDownloaded: string | null; errors: number | null; warnings: number | null; contents: { type: string; submitted: number | null; indexed: number | null }[] }[]
}

export type DryRunResult = (DailyReport | WindowReport | SitemapReport | (StepError & { step: string; apiRequests: number; partial?: Partial<WindowReport> })) & { tokenRefreshes: number; ranAtUtc: string }

export type DryRunStep = { step: 'daily' } | { step: 'window'; index: number; startRow?: number } | { step: 'sitemaps' }

export async function runDryRunStep(a: { refreshToken: string; cfg: Pick<GscOAuthConfig, 'clientId' | 'clientSecret' | 'property'>; req: DryRunStep; fetchImpl?: Fetch; now?: Date }): Promise<DryRunResult> {
  const f = a.fetchImpl ?? fetch
  const base = { ranAtUtc: (a.now ?? new Date()).toISOString(), tokenRefreshes: 1 }
  const step = a.req.step
  if (a.cfg.property !== DRYRUN_PROPERTY) return { ...base, tokenRefreshes: 0, step, ok: false, httpStatus: null, message: 'property is not the approved dry-run property', apiRequests: 0 }
  const tok = await refreshAccessToken(a.cfg, a.refreshToken, f)
  if (!tok.ok) return { ...base, step, ok: false, httpStatus: null, message: `token refresh failed: ${tok.error}`, apiRequests: 0 }
  const at = tok.accessToken
  const site = encodeURIComponent(DRYRUN_PROPERTY)

  if (a.req.step === 'daily') {
    const r = await post<SaResp>(f, at, sa(site), { startDate: RANGE_START, endDate: RANGE_END, dimensions: ['date'], type: 'web', dataState: 'final', rowLimit: ROW_LIMIT })
    if (!r.ok) return { ...base, step, ok: false, httpStatus: r.httpStatus, googleStatus: r.googleStatus, message: r.message, apiRequests: 1 }
    const rows = r.data?.rows ?? []
    const daily = rows.map((x) => ({ date: String(x.keys?.[0] ?? ''), clicks: n(x.clicks), impressions: n(x.impressions), ctr: n(x.ctr), position: n(x.position) }))
    const have = new Set(daily.map((d) => d.date))
    const dates = daily.map((d) => d.date).sort()
    return {
      ...base, step: 'daily', ok: true, property: DRYRUN_PROPERTY, startDate: RANGE_START, endDate: RANGE_END, apiRequests: 1,
      rowsReturned: rows.length, rowLimit: ROW_LIMIT, hitRowLimit: rows.length >= ROW_LIMIT,
      firstDate: dates[0] ?? null, lastDate: dates[dates.length - 1] ?? null, daysWithData: have.size, expectedDays: expectedDates().length,
      missingDates: expectedDates().filter((d) => !have.has(d)),
      totals: { clicks: daily.reduce((s, d) => s + d.clicks, 0), impressions: daily.reduce((s, d) => s + d.impressions, 0) },
      responseAggregationType: r.data?.responseAggregationType ?? null,
      fingerprint: { version: FINGERPRINT_VERSION, rows: daily.length, set: dailyFingerprint(daily) }, daily,
    }
  }

  if (a.req.step === 'sitemaps') {
    const r = await send<{ sitemap?: any[] }>(f, at, 'GET', `${API}/sites/${site}/sitemaps`)
    if (!r.ok) return { ...base, step, ok: false, httpStatus: r.httpStatus, googleStatus: r.googleStatus, message: r.message, apiRequests: 1 }
    const num = (v: unknown) => (v !== undefined && v !== null && Number.isFinite(Number(v)) ? Number(v) : null)
    return {
      ...base, step: 'sitemaps', ok: true, property: DRYRUN_PROPERTY, apiRequests: 1,
      sitemaps: (r.data?.sitemap ?? []).map((x) => ({
        path: String(x.path ?? ''), type: x.type ?? null, isPending: typeof x.isPending === 'boolean' ? x.isPending : null, isSitemapsIndex: typeof x.isSitemapsIndex === 'boolean' ? x.isSitemapsIndex : null,
        lastSubmitted: x.lastSubmitted ?? null, lastDownloaded: x.lastDownloaded ?? null, errors: num(x.errors), warnings: num(x.warnings),
        contents: (x.contents ?? []).map((c: any) => ({ type: String(c.type ?? ''), submitted: num(c.submitted), indexed: num(c.indexed) })),
      })),
    }
  }

  // detail window: pages through startRow until a page is shorter than ROW_LIMIT (or the per-call page cap is reached)
  const w = buildWindows().find((x) => x.index === (a.req as { index: number }).index)
  if (!w) return { ...base, step, ok: false, httpStatus: null, message: 'unknown window index', apiRequests: 0 }
  let startRow = Math.max(0, Math.floor((a.req as { startRow?: number }).startRow ?? 0))
  const pages: { startRow: number; rows: number }[] = []
  const perDate = new Map<string, number>()
  const pageSet = new Set<string>(); const querySet = new Set<string>(); const keySet = new Set<string>()
  const fpRows: PerfRow[] = []
  let unstorable = 0
  const firstStartRow = startRow
  let rowsReturned = 0, dup = 0, clicks = 0, imps = 0, hitLimit = false, complete = false, agg: string | null = null, requests = 0
  while (pages.length < MAX_PAGES_PER_CALL) {
    const r = await post<SaResp>(f, at, sa(site), { startDate: w.startDate, endDate: w.endDate, dimensions: [...DETAIL_DIMENSIONS], type: 'web', dataState: 'final', rowLimit: ROW_LIMIT, startRow })
    requests++
    if (!r.ok) return { ...base, step, ok: false, httpStatus: r.httpStatus, googleStatus: r.googleStatus, message: r.message, apiRequests: requests, partial: { window: w, pages, rowsReturned } }
    agg = r.data?.responseAggregationType ?? agg
    const rows = r.data?.rows ?? []
    pages.push({ startRow, rows: rows.length })
    for (const row of rows) {
      const k = row.keys ?? []
      const full = k.join('\u0001')
      if (keySet.has(full)) dup++; else keySet.add(full)
      perDate.set(k[0] ?? '', (perDate.get(k[0] ?? '') ?? 0) + 1)
      pageSet.add(k[1] ?? ''); querySet.add(k[2] ?? '')
      clicks += n(row.clicks); imps += n(row.impressions)
      const pr: PerfRow = { date: String(k[0] ?? ''), page: String(k[1] ?? ''), query: String(k[2] ?? ''), country: String(k[3] ?? ''), device: String(k[4] ?? ''), clicks: n(row.clicks), impressions: n(row.impressions), ctr: n(row.ctr), position: n(row.position) }
      if (!isStorableText(pr.page) || !isStorableText(pr.query) || !isStorableText(pr.country) || !isStorableText(pr.device)) unstorable++
      fpRows.push(pr)
    }
    rowsReturned += rows.length
    if (rows.length >= ROW_LIMIT) hitLimit = true
    startRow += rows.length
    if (rows.length < ROW_LIMIT) { complete = true; break }
  }
  return {
    ...base, step: 'window', ok: true, property: DRYRUN_PROPERTY, window: w, apiRequests: requests, pages, rowsReturned, rowLimit: ROW_LIMIT,
    complete, nextStartRow: complete ? null : startRow, hitRowLimitOnAnyPage: hitLimit,
    distinctDates: perDate.size, maxRowsOnOneDate: Math.max(0, ...Array.from(perDate.values())), distinctPages: pageSet.size, distinctQueries: querySet.size, duplicateKeys: dup,
    detailTotals: { clicks, impressions: imps }, responseAggregationType: agg,
    fingerprint: complete && firstStartRow === 0 ? { version: FINGERPRINT_VERSION, rows: fpRows.length, set: perfFingerprint(fpRows), byDate: perfFingerprintByDate(fpRows), unstorableRows: unstorable } : null,
    note: 'Search Console returns top rows only and omits anonymised queries; "complete" means the API returned no further rows for this window, not that every impression is represented.',
  }
}
