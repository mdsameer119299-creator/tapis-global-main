import { createSign, randomUUID } from 'node:crypto'

/** Google Analytics 4 (Data API v1beta) read-only integration for the SEO Command Centre.
 *  Auth: a Google SERVICE ACCOUNT that the owner adds as a Viewer on the GA4 property. This needs no OAuth consent flow and does not widen the
 *  Search Console OAuth grant (which stays webmasters.readonly). Scope used: analytics.readonly (read only).
 *  Nothing here invents data: when the property / key is missing the sync returns NOT_CONFIGURED and writes nothing.
 *  Search Console CLICKS and GA4 SESSIONS are different measurements and are never summed or compared as equals. */
export type Fetch = typeof fetch
export type Q = (text: string, params?: unknown[]) => Promise<Record<string, any>[]>
type Env = Record<string, string | undefined>

export const GA4_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly'
export const GA4_TOKEN_URL = 'https://oauth2.googleapis.com/token'
export const GA4_REPORT_URL = (propertyId: string) => `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`
export const GA4_MAX_ROWS_PER_PAGE = 10000
export const GA4_MAX_PAGES = 20

export interface Ga4Config { propertyId: string; clientEmail: string; privateKey: string }
export type Ga4ConfigResult = { ok: true; config: Ga4Config } | { ok: false; reason: 'NOT_CONFIGURED' | 'INVALID_PROPERTY_ID' | 'INVALID_SERVICE_ACCOUNT' }

/** GA4_PROPERTY_ID = numeric property id (not the G-… measurement id). GA4_SERVICE_ACCOUNT_JSON = the service-account key JSON, raw or base64. */
export function readGa4Config(env: Env = process.env): Ga4ConfigResult {
  const pid = (env.GA4_PROPERTY_ID ?? '').trim().replace(/^properties\//, '')
  const raw = (env.GA4_SERVICE_ACCOUNT_JSON ?? '').trim()
  if (!pid && !raw) return { ok: false, reason: 'NOT_CONFIGURED' }
  if (!/^\d{5,15}$/.test(pid)) return { ok: false, reason: pid ? 'INVALID_PROPERTY_ID' : 'NOT_CONFIGURED' }
  if (!raw) return { ok: false, reason: 'NOT_CONFIGURED' }
  try {
    const text = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8')
    const j = JSON.parse(text)
    if (typeof j.client_email !== 'string' || typeof j.private_key !== 'string' || !j.private_key.includes('PRIVATE KEY')) return { ok: false, reason: 'INVALID_SERVICE_ACCOUNT' }
    return { ok: true, config: { propertyId: pid, clientEmail: j.client_email, privateKey: j.private_key } }
  } catch { return { ok: false, reason: 'INVALID_SERVICE_ACCOUNT' } }
}

const b64u = (b: Buffer | string) => Buffer.from(b).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

/** Signed JWT for the service-account token exchange (RS256). */
export function signServiceAccountJwt(cfg: Pick<Ga4Config, 'clientEmail' | 'privateKey'>, nowSec = Math.floor(Date.now() / 1000)): string {
  const head = b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const body = b64u(JSON.stringify({ iss: cfg.clientEmail, scope: GA4_SCOPE, aud: GA4_TOKEN_URL, iat: nowSec, exp: nowSec + 3300 }))
  const sig = createSign('RSA-SHA256').update(`${head}.${body}`).sign(cfg.privateKey)
  return `${head}.${body}.${b64u(sig)}`
}

export type Ga4Token = { ok: true; accessToken: string } | { ok: false; code: string; transient: boolean }
export async function getGa4AccessToken(cfg: Ga4Config, f: Fetch = fetch): Promise<Ga4Token> {
  try {
    const r = await f(GA4_TOKEN_URL, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: signServiceAccountJwt(cfg) }) })
    const j: any = await r.json().catch(() => ({}))
    if (r.ok && typeof j.access_token === 'string') return { ok: true, accessToken: j.access_token }
    return { ok: false, code: safeCode(j?.error) || `HTTP_${r.status}`, transient: r.status >= 500 || r.status === 429 }
  } catch { return { ok: false, code: 'NETWORK', transient: true } }
}

/** Only fixed, short, alphanumeric error codes are ever stored or shown (never Google's free text, never tokens). */
export function safeCode(v: unknown): string { return typeof v === 'string' && /^[A-Za-z0-9_.-]{1,60}$/.test(v) ? v.toUpperCase() : '' }

export interface Ga4Row { date: string; landingPage: string; channelGroup: string; country: string; device: string; sessions: number; engagedSessions: number; keyEvents: number; rowKey: string }

export function buildOrganicReportRequest(startDate: string, endDate: string, offset = 0) {
  return {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'date' }, { name: 'landingPagePlusQueryString' }, { name: 'sessionDefaultChannelGroup' }, { name: 'country' }, { name: 'deviceCategory' }],
    metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }, { name: 'keyEvents' }],
    dimensionFilter: { filter: { fieldName: 'sessionDefaultChannelGroup', stringFilter: { matchType: 'EXACT', value: 'Organic Search' } } },
    limit: GA4_MAX_ROWS_PER_PAGE, offset, keepEmptyRows: false,
  }
}

const ymd = (d: string) => (/^\d{8}$/.test(d) ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}` : '')
/** Normalises a runReport response. Rows with an unparsable date or non-numeric metrics are DROPPED and counted, never coerced. */
export function parseOrganicReport(resp: any): { rows: Ga4Row[]; dropped: number; rowCount: number } {
  const out: Ga4Row[] = []; let dropped = 0
  for (const r of resp?.rows ?? []) {
    const d = (r.dimensionValues ?? []).map((x: any) => String(x?.value ?? '')); const m = (r.metricValues ?? []).map((x: any) => Number(x?.value))
    const date = ymd(d[0] ?? '')
    if (!date || d.length < 5 || m.length < 3 || m.some((x: number) => !Number.isFinite(x) || x < 0)) { dropped++; continue }
    const landingPage = d[1].slice(0, 2000), channelGroup = d[2].slice(0, 100), country = d[3].slice(0, 100), device = d[4].slice(0, 50)
    out.push({ date, landingPage, channelGroup, country, device, sessions: Math.round(m[0]), engagedSessions: Math.round(m[1]), keyEvents: Math.round(m[2]), rowKey: [date, landingPage, channelGroup, country, device].join('|') })
  }
  return { rows: out, dropped, rowCount: Number(resp?.rowCount ?? out.length) }
}

export type Ga4Sync =
  | { status: 'NOT_CONFIGURED'; reason: string }
  | { status: 'FAILED'; code: string; rowsFetched: number; rowsWritten: number }
  | { status: 'SUCCEEDED' | 'PARTIAL'; rowsFetched: number; rowsWritten: number; dropped: number; startDate: string; endDate: string; keyEventsRecorded: boolean }

/** Pull organic-search landing-page rows for [startDate, endDate] and upsert them (idempotent: unique (siteId, rowKey)). Records the integration state only; no secret is stored. */
export async function syncGa4(q: Q, a: { siteId: string; startDate: string; endDate: string; env?: Env; fetchImpl?: Fetch; sleep?: (ms: number) => Promise<void> }): Promise<Ga4Sync> {
  const f = a.fetchImpl ?? fetch, sleep = a.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)))
  const cfg = readGa4Config(a.env ?? process.env)
  if (!cfg.ok) { await mark(q, a.siteId, cfg.reason === 'NOT_CONFIGURED' ? 'NOT_CONFIGURED' : 'ERROR', cfg.reason, false); return { status: 'NOT_CONFIGURED', reason: cfg.reason } }
  const tok = await getGa4AccessToken(cfg.config, f)
  if (!tok.ok) { await mark(q, a.siteId, 'ERROR', tok.code, false); return { status: 'FAILED', code: tok.code, rowsFetched: 0, rowsWritten: 0 } }
  let fetched = 0, written = 0, dropped = 0, partial = false, keyEvents = 0, offset = 0
  for (let page = 0; page < GA4_MAX_PAGES; page++) {
    let resp: any = null, code = ''
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const r = await f(GA4_REPORT_URL(cfg.config.propertyId), { method: 'POST', headers: { authorization: `Bearer ${tok.accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(buildOrganicReportRequest(a.startDate, a.endDate, offset)) })
        const j: any = await r.json().catch(() => ({}))
        if (r.ok) { resp = j; break }
        code = safeCode(j?.error?.status) || `HTTP_${r.status}`
        if (!(r.status === 429 || r.status >= 500)) break // permission / quota-exhausted-for-day / bad request: do not retry
      } catch { code = 'NETWORK' }
      await sleep(500 * 2 ** attempt)
    }
    if (!resp) { await mark(q, a.siteId, 'ERROR', code, false); return { status: 'FAILED', code, rowsFetched: fetched, rowsWritten: written } }
    const p = parseOrganicReport(resp); fetched += p.rows.length; dropped += p.dropped
    for (const r of p.rows) {
      keyEvents += r.keyEvents
      await q(`INSERT INTO seo_ga4_landing_daily ("id","siteId","date","landingPage","channelGroup","country","device","sessions","engagedSessions","keyEvents","rowKey")
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
               ON CONFLICT ("siteId","rowKey") DO UPDATE SET "sessions"=EXCLUDED."sessions","engagedSessions"=EXCLUDED."engagedSessions","keyEvents"=EXCLUDED."keyEvents","fetchedAt"=now()`,
        [randomUUID(), a.siteId, r.date, r.landingPage, r.channelGroup, r.country, r.device, r.sessions, r.engagedSessions, r.keyEvents, r.rowKey]); written++
    }
    offset += GA4_MAX_ROWS_PER_PAGE
    if (offset >= p.rowCount) break
    if (page === GA4_MAX_PAGES - 1) partial = true
  }
  const status = partial || dropped > 0 ? 'PARTIAL' : 'SUCCEEDED'
  await mark(q, a.siteId, 'CONFIGURED', null, true)
  return { status, rowsFetched: fetched, rowsWritten: written, dropped, startDate: a.startDate, endDate: a.endDate, keyEventsRecorded: keyEvents > 0 }
}

async function mark(q: Q, siteId: string, status: 'CONFIGURED' | 'ERROR' | 'NOT_CONFIGURED', error: string | null, ok: boolean): Promise<void> {
  await q(`INSERT INTO seo_integrations ("id","siteId","provider","status","lastError","lastSyncAt","updatedAt") VALUES ($1,$2,'GA4',$3::"SeoIntegrationStatus",$4, CASE WHEN $5 THEN now() END, now())
           ON CONFLICT DO NOTHING`, [randomUUID(), siteId, status, error, ok])
  await q(`UPDATE seo_integrations SET "status"=$3::"SeoIntegrationStatus","lastError"=$4,"lastSyncAt"=CASE WHEN $5 THEN now() ELSE "lastSyncAt" END,"updatedAt"=now() WHERE "siteId"=$1 AND "provider"=$2::"SeoIntegrationProvider"`, [siteId, 'GA4', status, error, ok])
}
