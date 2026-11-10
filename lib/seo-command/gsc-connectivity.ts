import { openSecret, type GscOAuthConfig } from './gsc-oauth'
import { refreshAccessToken } from './gsc-google'
import type { Q } from './gsc-state'

/** One-off, READ-ONLY connectivity test of the Search Console API. Three GET/POST-query calls, nothing stored:
 *   1. sites.list            2. searchAnalytics.query (<=10 rows)            3. sitemaps.list
 *  No URL Inspection, no Analytics, no PageSpeed. The database is only READ (the caller runs this in a
 *  `SET TRANSACTION READ ONLY` transaction, so Postgres itself rejects any write) and the access token lives in memory
 *  for the duration of the request. Results are returned to the caller only; tokens never appear in them. */
type Env = Record<string, string | undefined>
type Fetch = typeof fetch

const API = 'https://www.googleapis.com/webmasters/v3'
const TIMEOUT_MS = 15_000
export const ANALYTICS_ROW_LIMIT = 10

export type TokenRead = { ok: true; refreshToken: string } | { ok: false; reason: 'not_connected' | 'reconnect_required' | 'key_unavailable' | 'property_mismatch' }

/** SELECT only. Does NOT flag KEY_UNAVAILABLE or touch any status column (unlike gsc-state.loadRefreshToken). */
export async function readRefreshTokenReadOnly(q: Q, siteId: string, property: string, env: Env = process.env): Promise<TokenRead> {
  const rows = await q(`SELECT "state","propertyUrl","revokedAt","refreshTokenCipher","refreshTokenIv","refreshTokenTag","keyVersion" FROM seo_oauth_connections WHERE "siteId"=$1 AND provider='GSC'`, [siteId])
  const r = rows[0]
  if (!r || r.revokedAt || !r.refreshTokenCipher || r.state === 'DISCONNECTED') return { ok: false, reason: 'not_connected' }
  if (r.state === 'RECONNECT_REQUIRED') return { ok: false, reason: 'reconnect_required' }
  if (r.propertyUrl !== property) return { ok: false, reason: 'property_mismatch' }
  const t = openSecret({ cipher: r.refreshTokenCipher, iv: r.refreshTokenIv, tag: r.refreshTokenTag, keyVersion: r.keyVersion }, env)
  return t === null ? { ok: false, reason: 'key_unavailable' } : { ok: true, refreshToken: t }
}

export interface CallOutcome<T> { ok: boolean; httpStatus: number | null; googleStatus?: string; message?: string; data?: T }

async function call<T>(f: Fetch, accessToken: string, method: 'GET' | 'POST', url: string, body?: unknown): Promise<CallOutcome<T>> {
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS)
  try {
    const res = await f(url, {
      method,
      headers: { authorization: `Bearer ${accessToken}`, ...(body === undefined ? {} : { 'content-type': 'application/json' }) },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: ctl.signal,
      cache: 'no-store',
    })
    const json = (await res.json().catch(() => ({}))) as any
    if (res.status >= 200 && res.status < 300) return { ok: true, httpStatus: res.status, data: json as T }
    const gs = typeof json?.error?.status === 'string' && /^[A-Z_]{1,40}$/.test(json.error.status) ? json.error.status : undefined
    const msg = typeof json?.error?.message === 'string' ? json.error.message.slice(0, 200) : undefined
    return { ok: false, httpStatus: res.status, googleStatus: gs, message: msg }
  } catch {
    return { ok: false, httpStatus: null, message: 'network error or timeout' }
  } finally {
    clearTimeout(timer)
  }
}

const ymd = (d: Date) => d.toISOString().slice(0, 10)
const num = (v: unknown) => (typeof v === 'number' ? v : null)

export interface ConnectivityReport {
  ranAtUtc: string
  property: string
  token: { ok: boolean; reason?: string; error?: string }
  sites?: CallOutcome<never> & { propertyAccessible?: boolean; permissionLevel?: string | null; propertiesVisibleToAccount?: number }
  searchAnalytics?: CallOutcome<never> & { request: { startDate: string; endDate: string; dimensions: string[]; rowLimit: number; dataState: string }; rows?: { date: string; clicks: number | null; impressions: number | null; ctr: number | null; position: number | null }[]; rowCount?: number }
  sitemaps?: CallOutcome<never> & { sitemaps?: { path: string; type: string | null; isPending: boolean | null; isSitemapsIndex: boolean | null; lastSubmitted: string | null; lastDownloaded: string | null; errors: number | null; warnings: number | null; contents: { type: string; submitted: number | null; indexed: number | null }[] }[] }
}

export async function runConnectivityTest(a: { refreshToken: string; cfg: Pick<GscOAuthConfig, 'clientId' | 'clientSecret' | 'property'>; fetchImpl?: Fetch; now?: Date }): Promise<ConnectivityReport> {
  const f = a.fetchImpl ?? fetch
  const now = a.now ?? new Date()
  const property = a.cfg.property
  const report: ConnectivityReport = { ranAtUtc: now.toISOString(), property, token: { ok: false } }

  const tok = await refreshAccessToken(a.cfg, a.refreshToken, f)
  if (!tok.ok) { report.token = { ok: false, error: tok.error }; return report }
  report.token = { ok: true }
  const at = tok.accessToken
  const site = encodeURIComponent(property)

  // 1. sites.list: report only the configured property's entry (other properties the account can see are only counted)
  const s = await call<{ siteEntry?: { siteUrl?: string; permissionLevel?: string }[] }>(f, at, 'GET', `${API}/sites`)
  const entries = s.data?.siteEntry ?? []
  const mine = entries.find((e) => e.siteUrl === property)
  report.sites = { ok: s.ok, httpStatus: s.httpStatus, googleStatus: s.googleStatus, message: s.message, propertyAccessible: s.ok ? !!mine : undefined, permissionLevel: mine?.permissionLevel ?? null, propertiesVisibleToAccount: s.ok ? entries.length : undefined }

  // 2. searchAnalytics.query: final data only; the three days ending 3 days ago (Search Console data lags ~2-3 days)
  const request = { startDate: ymd(new Date(now.getTime() - 5 * 86_400_000)), endDate: ymd(new Date(now.getTime() - 3 * 86_400_000)), dimensions: ['date'], rowLimit: ANALYTICS_ROW_LIMIT, dataState: 'final' }
  const sa = await call<{ rows?: { keys?: string[]; clicks?: number; impressions?: number; ctr?: number; position?: number }[] }>(f, at, 'POST', `${API}/sites/${site}/searchAnalytics/query`, request)
  const rows = (sa.data?.rows ?? []).slice(0, ANALYTICS_ROW_LIMIT).map((r) => ({ date: String(r.keys?.[0] ?? ''), clicks: num(r.clicks), impressions: num(r.impressions), ctr: num(r.ctr), position: num(r.position) }))
  report.searchAnalytics = { ok: sa.ok, httpStatus: sa.httpStatus, googleStatus: sa.googleStatus, message: sa.message, request, rows: sa.ok ? rows : undefined, rowCount: sa.ok ? rows.length : undefined }

  // 3. sitemaps.list
  const sm = await call<{ sitemap?: any[] }>(f, at, 'GET', `${API}/sites/${site}/sitemaps`)
  report.sitemaps = {
    ok: sm.ok, httpStatus: sm.httpStatus, googleStatus: sm.googleStatus, message: sm.message,
    sitemaps: sm.ok ? (sm.data?.sitemap ?? []).map((x) => ({
      path: String(x.path ?? ''), type: x.type ?? null, isPending: typeof x.isPending === 'boolean' ? x.isPending : null, isSitemapsIndex: typeof x.isSitemapsIndex === 'boolean' ? x.isSitemapsIndex : null,
      lastSubmitted: x.lastSubmitted ?? null, lastDownloaded: x.lastDownloaded ?? null, errors: x.errors !== undefined ? Number(x.errors) : null, warnings: x.warnings !== undefined ? Number(x.warnings) : null,
      contents: (x.contents ?? []).map((c: any) => ({ type: String(c.type ?? ''), submitted: c.submitted !== undefined ? Number(c.submitted) : null, indexed: c.indexed !== undefined ? Number(c.indexed) : null })),
    })) : undefined,
  }
  return report
}
