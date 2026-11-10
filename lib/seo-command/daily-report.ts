import { createHash, randomUUID } from 'node:crypto'
import { analyseKeywords, type KeywordIntel } from './keyword-intel'
import { buildFindings, type Finding } from './analyst'
import { getConnectionView, testingExpiry, type GscConnectionView } from './gsc-connection'

/** Daily SEO report: reads ONLY stored data (Search Console, GA4, crawler, sitemap, competitor snapshots, recommendations, run history).
 *  It never calls Google, never crawls and never writes to the website. Every section carries a status, a source, a period and an as-of time.
 *  A section with no data is UNAVAILABLE (never zero); a section whose newest data is too old is STALE. A report is never presented as healthy when its inputs are stale or missing. */
export type Q = (text: string, params?: unknown[]) => Promise<Record<string, any>[]>
export type SectionStatus = 'OK' | 'STALE' | 'PARTIAL' | 'UNAVAILABLE'
export interface Section<T = unknown> { status: SectionStatus; source: string; period: string | null; asOf: string | null; note?: string; data?: T }

export const REPORT_TZ = 'Asia/Kolkata'
export const STALE_DAYS = { gsc: 4, crawl: 3, ga4Hours: 36, sitemapDays: 4 } as const
export const istDate = (d: Date): string => new Intl.DateTimeFormat('en-CA', { timeZone: REPORT_TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
export const addDays = (ymd: string, n: number): string => { const d = new Date(`${ymd}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10) }
const dayDiff = (a: string, b: string): number => Math.round((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / 86_400_000)
const num = (v: unknown): number => (v === null || v === undefined ? 0 : Number(v))
const iso = (v: unknown): string | null => (v ? new Date(v as any).toISOString() : null)

export interface Totals { clicks: number; impressions: number; ctrPct: number; position: number | null; days: number }
function totals(rows: { clicks: number; impressions: number; position: number }[]): Totals {
  const clicks = rows.reduce((s, r) => s + r.clicks, 0), impressions = rows.reduce((s, r) => s + r.impressions, 0)
  const wp = rows.reduce((s, r) => s + r.position * r.impressions, 0)
  return { clicks, impressions, ctrPct: impressions ? Math.round((clicks / impressions) * 10000) / 100 : 0, position: impressions ? Math.round((wp / impressions) * 10) / 10 : null, days: rows.length }
}

export interface ReportData {
  reportDate: string; generatedAt: string; timezone: string
  gsc: Section<{ latestDate: string; latestDay: Totals | null; previousDay: Totals | null; last7: Totals; prev7: Totals; byDay: { date: string; clicks: number; impressions: number }[]; topQueries: any[]; topPages: any[]; countries: any[]; devices: any[]; detailCoveragePct: number | null; missingDays: string[] }>
  ga4: Section<{ latestDate: string; last7: { sessions: number; engagedSessions: number; engagementRatePct: number | null; keyEvents: number; days: number }; prev7: { sessions: number; engagedSessions: number; keyEvents: number; days: number }; topLandingPages: any[]; countries: any[]; devices: any[]; keyEventsNote: string }>
  technical: Section<{ run: { id: string; finishedAt: string | null; pagesFetched: number; healthScore: number | null; truncated: boolean }; open: Record<string, number>; newHighSeverity: any[]; resolvedRecently: number }>
  sitemap: Section<{ sitemaps: any[]; urlInspection: string }>
  keywords: Section<KeywordIntel>
  competitors: Section<{ tracked: number; withSnapshot: number; changes: any[] }>
  recommendations: Section<{ proposed: number; highImpact: number; top: any[] }>
  system: { gsc: GscConnectionView | null; gscTokenExpiry: { level: string; hoursLeft: number } | null; integrations: any[]; lastRuns: any[]; failedRecent: any[]; errors: string[] }
}

const unavailable = (source: string, note: string): Section<never> => ({ status: 'UNAVAILABLE', source, period: null, asOf: null, note })

async function guard<T>(errors: string[], label: string, f: () => Promise<T>, source: string): Promise<T | Section<never>> {
  try { return await f() } catch (e) { const n = e instanceof Error ? e.name : 'Error'; errors.push(`${label}: ${n}`); return unavailable(source, `This section could not be read (${n}).`) }
}

export async function collectReportData(q: Q, siteId: string, now: Date = new Date()): Promise<ReportData> {
  const reportDate = istDate(now); const errors: string[] = []

  const gsc = await guard(errors, 'gsc', async (): Promise<ReportData['gsc']> => {
    const mx = (await q(`SELECT max(date)::text d FROM seo_search_daily WHERE "siteId"=$1`, [siteId]))[0]?.d as string | null
    if (!mx) return unavailable('Google Search Console (seo_search_daily)', 'No Search Console rows are stored yet (historical import and daily sync are not active).')
    const rows = (await q(`SELECT date::text d, clicks, impressions, position FROM seo_search_daily WHERE "siteId"=$1 AND date > ($2::date - 14) AND date <= $2::date ORDER BY date`, [siteId, mx])).map((r) => ({ d: r.d as string, clicks: num(r.clicks), impressions: num(r.impressions), position: num(r.position) }))
    const by = new Map(rows.map((r) => [r.d, r])); const win = (from: number, to: number) => { const o = []; for (let i = from; i <= to; i++) { const r = by.get(addDays(mx, -i)); if (r) o.push(r) } return o }
    const missingDays: string[] = []; for (let i = 0; i < 14; i++) if (!by.has(addDays(mx, -i))) missingDays.push(addDays(mx, -i))
    const w7s = addDays(mx, -6)
    const detailWhere = `"siteId"=$1 AND date >= $2::date AND date <= $3::date`
    const [tq, tp, tc, td, cov] = await Promise.all([
      q(`SELECT query, sum(clicks)::int clicks, sum(impressions)::int impressions, round((sum(position*impressions)/nullif(sum(impressions),0))::numeric,1) position FROM seo_search_performance WHERE ${detailWhere} AND query <> '' GROUP BY query ORDER BY sum(clicks) DESC, sum(impressions) DESC LIMIT 10`, [siteId, w7s, mx]),
      q(`SELECT page, sum(clicks)::int clicks, sum(impressions)::int impressions FROM seo_search_performance WHERE ${detailWhere} GROUP BY page ORDER BY sum(clicks) DESC, sum(impressions) DESC LIMIT 10`, [siteId, w7s, mx]),
      q(`SELECT country, sum(clicks)::int clicks, sum(impressions)::int impressions FROM seo_search_performance WHERE ${detailWhere} GROUP BY country ORDER BY sum(clicks) DESC, sum(impressions) DESC LIMIT 10`, [siteId, w7s, mx]),
      q(`SELECT device, sum(clicks)::int clicks, sum(impressions)::int impressions FROM seo_search_performance WHERE ${detailWhere} GROUP BY device ORDER BY sum(clicks) DESC`, [siteId, w7s, mx]),
      q(`SELECT coalesce(sum(clicks),0)::int c, count(*)::int n FROM seo_search_performance WHERE ${detailWhere}`, [siteId, w7s, mx]),
    ])
    const last7 = totals(win(0, 6)), prev7 = totals(win(7, 13)); const detailClicks = num(cov[0]?.c); const detailRows = num(cov[0]?.n)
    const age = dayDiff(reportDate, mx)
    return { status: age > STALE_DAYS.gsc ? 'STALE' : missingDays.some((d) => dayDiff(mx, d) < 7) ? 'PARTIAL' : 'OK', source: 'Google Search Console (seo_search_daily, seo_search_performance)', period: `${addDays(mx, -6)} to ${mx} (latest available date ${mx}; Search Console data lags 2-3 days)`, asOf: mx,
      note: age > STALE_DAYS.gsc ? `Newest stored Search Console date is ${age} days before the report date.` : undefined,
      data: { latestDate: mx, latestDay: by.has(mx) ? totals([by.get(mx)!]) : null, previousDay: by.has(addDays(mx, -1)) ? totals([by.get(addDays(mx, -1))!]) : null, last7, prev7, byDay: rows.map((r) => ({ date: r.d, clicks: r.clicks, impressions: r.impressions })), topQueries: tq, topPages: tp, countries: tc, devices: td,
        detailCoveragePct: detailRows > 0 && last7.clicks > 0 ? Math.round((detailClicks / last7.clicks) * 1000) / 10 : null, missingDays } }
  }, 'Google Search Console')

  const ga4 = await guard(errors, 'ga4', async (): Promise<ReportData['ga4']> => {
    const integ = (await q(`SELECT status::text, "lastSyncAt", "lastError" FROM seo_integrations WHERE "siteId"=$1 AND provider='GA4'`, [siteId]))[0]
    const mx = (await q(`SELECT max(date)::text d FROM seo_ga4_landing_daily WHERE "siteId"=$1`, [siteId]))[0]?.d as string | null
    if (!mx) return unavailable('Google Analytics 4 (seo_ga4_landing_daily)', !integ || integ.status === 'NOT_CONFIGURED' ? 'GA4 is not connected (no property id / service account configured), so no sessions are available.' : `GA4 is configured but no rows are stored (${integ.lastError ?? 'no sync yet'}).`)
    const sum = async (from: string, to: string) => { const r = (await q(`SELECT coalesce(sum(sessions),0)::int s, coalesce(sum("engagedSessions"),0)::int e, coalesce(sum("keyEvents"),0)::int k, count(DISTINCT date)::int d FROM seo_ga4_landing_daily WHERE "siteId"=$1 AND date >= $2::date AND date <= $3::date`, [siteId, from, to]))[0]; return { sessions: num(r.s), engagedSessions: num(r.e), keyEvents: num(r.k), days: num(r.d) } }
    const l7 = await sum(addDays(mx, -6), mx), p7 = await sum(addDays(mx, -13), addDays(mx, -7)); const w = `"siteId"=$1 AND date >= $2::date AND date <= $3::date`; const a = [siteId, addDays(mx, -6), mx]
    const [pages, ctry, dev] = await Promise.all([
      q(`SELECT "landingPage" page, sum(sessions)::int sessions, sum("engagedSessions")::int engaged, sum("keyEvents")::int "keyEvents" FROM seo_ga4_landing_daily WHERE ${w} GROUP BY 1 ORDER BY 2 DESC LIMIT 10`, a),
      q(`SELECT country, sum(sessions)::int sessions FROM seo_ga4_landing_daily WHERE ${w} GROUP BY 1 ORDER BY 2 DESC LIMIT 10`, a),
      q(`SELECT device, sum(sessions)::int sessions FROM seo_ga4_landing_daily WHERE ${w} GROUP BY 1 ORDER BY 2 DESC`, a)])
    const syncAgeH = integ?.lastSyncAt ? (now.getTime() - new Date(integ.lastSyncAt).getTime()) / 3_600_000 : null
    const stale = syncAgeH === null || syncAgeH > STALE_DAYS.ga4Hours
    return { status: stale ? 'STALE' : 'OK', source: 'Google Analytics 4 Data API (seo_ga4_landing_daily), channel group = Organic Search', period: `${addDays(mx, -6)} to ${mx}`, asOf: iso(integ?.lastSyncAt), note: stale ? 'The last successful GA4 sync is older than 36 hours or unknown.' : undefined,
      data: { latestDate: mx, last7: { ...l7, engagementRatePct: l7.sessions ? Math.round((l7.engagedSessions / l7.sessions) * 1000) / 10 : null }, prev7: p7, topLandingPages: pages, countries: ctry, devices: dev,
        keyEventsNote: l7.keyEvents > 0 ? 'Key events are as configured in GA4.' : 'No key events were recorded in this period. This does not prove key events are configured; it only means none were counted.' } }
  }, 'Google Analytics 4')

  const technical = await guard(errors, 'technical', async (): Promise<ReportData['technical']> => {
    const run = (await q(`SELECT id, status::text, "finishedAt", "pagesFetched", "healthScore", truncated FROM seo_crawl_runs WHERE "siteId"=$1 AND status IN ('SUCCEEDED','PARTIAL') ORDER BY "startedAt" DESC LIMIT 1`, [siteId]))[0]
    if (!run) return unavailable('Crawler (seo_crawl_runs, seo_technical_issues)', 'No completed crawl is stored.')
    const open = await q(`SELECT severity::text, count(*)::int n FROM seo_technical_issues WHERE "siteId"=$1 AND status='OPEN' GROUP BY 1`, [siteId])
    const fresh = await q(`SELECT code, severity::text, url FROM seo_technical_issues WHERE "siteId"=$1 AND status='OPEN' AND severity IN ('CRITICAL','HIGH') AND "firstSeenAt" > $2::timestamp - interval '36 hours' ORDER BY severity, code LIMIT 10`, [siteId, now.toISOString()])
    const res = await q(`SELECT count(*)::int n FROM seo_technical_issues WHERE "siteId"=$1 AND status='RESOLVED' AND "resolvedAt" > $2::timestamp - interval '36 hours'`, [siteId, now.toISOString()])
    const age = run.finishedAt ? (now.getTime() - new Date(run.finishedAt).getTime()) / 86_400_000 : 99
    return { status: age > STALE_DAYS.crawl ? 'STALE' : run.status === 'PARTIAL' || run.truncated ? 'PARTIAL' : 'OK', source: 'Own crawler observations (public pages only; not Google-confirmed indexing)', period: `crawl finished ${iso(run.finishedAt)}`, asOf: iso(run.finishedAt), note: age > STALE_DAYS.crawl ? `Newest completed crawl is ${Math.floor(age)} days old.` : undefined,
      data: { run: { id: run.id, finishedAt: iso(run.finishedAt), pagesFetched: num(run.pagesFetched), healthScore: run.healthScore === null ? null : num(run.healthScore), truncated: !!run.truncated }, open: Object.fromEntries(open.map((r) => [r.severity, num(r.n)])), newHighSeverity: fresh, resolvedRecently: num(res[0]?.n) } }
  }, 'Crawler')

  const sitemap = await guard(errors, 'sitemap', async (): Promise<ReportData['sitemap']> => {
    const rows = await q(`SELECT DISTINCT ON (path) path, errors, warnings, "submittedUrls", "indexedUrls", "lastDownloaded", "fetchedAt" FROM seo_sitemap_status WHERE "siteId"=$1 ORDER BY path, "fetchedAt" DESC`, [siteId])
    if (!rows.length) return unavailable('Google Search Console sitemaps (seo_sitemap_status)', 'No Search Console sitemap status is stored (sitemap sync is not active). The crawler-side sitemap checks appear under Technical SEO.')
    const newest = rows.reduce((m, r) => (new Date(r.fetchedAt) > m ? new Date(r.fetchedAt) : m), new Date(0)); const age = (now.getTime() - newest.getTime()) / 86_400_000
    return { status: age > STALE_DAYS.sitemapDays ? 'STALE' : 'OK', source: 'Google Search Console sitemaps API', period: 'latest fetch', asOf: newest.toISOString(), data: { sitemaps: rows.map((r) => ({ path: r.path, errors: num(r.errors), warnings: num(r.warnings), submitted: r.submittedUrls === null ? null : num(r.submittedUrls), indexed: r.indexedUrls === null ? null : num(r.indexedUrls), lastDownloaded: iso(r.lastDownloaded) })), urlInspection: 'Google-confirmed per-URL indexing (URL Inspection) is not enabled; a URL in a sitemap is NOT reported as indexed.' } }
  }, 'Search Console sitemaps')

  const keywords = await guard(errors, 'keywords', async (): Promise<ReportData['keywords']> => {
    const mx = (gsc as any).data?.latestDate as string | undefined
    if (!mx) return unavailable('Google Search Console query data', 'Keyword intelligence needs stored Search Console query rows; none are available yet.')
    const cs = addDays(mx, -27), ps = addDays(mx, -55), pe = addDays(mx, -28)
    const agg = (s: string, e: string) => q(`SELECT query, sum(clicks)::int clicks, sum(impressions)::int impressions, coalesce(sum(position*impressions)/nullif(sum(impressions),0),0)::float position FROM seo_search_performance WHERE "siteId"=$1 AND date >= $2::date AND date <= $3::date AND query <> '' GROUP BY query`, [siteId, s, e])
    const [cur, prev, qp, ct] = await Promise.all([agg(cs, mx), agg(ps, pe),
      q(`SELECT query, page, sum(clicks)::int clicks, sum(impressions)::int impressions FROM seo_search_performance WHERE "siteId"=$1 AND date >= $2::date AND date <= $3::date AND query <> '' GROUP BY query, page ORDER BY 4 DESC LIMIT 400`, [siteId, cs, mx]),
      q(`SELECT country, sum(clicks)::int clicks, sum(impressions)::int impressions, coalesce(sum(position*impressions)/nullif(sum(impressions),0),0)::float position FROM seo_search_performance WHERE "siteId"=$1 AND date >= $2::date AND date <= $3::date GROUP BY country`, [siteId, cs, mx])])
    if (!cur.length) return unavailable('Google Search Console query data', 'No query-level rows are stored for the last 28 days.')
    const n = (r: any) => ({ ...r, clicks: num(r.clicks), impressions: num(r.impressions), position: num(r.position) })
    const data = analyseKeywords({ window: { start: cs, end: mx, previousStart: ps, previousEnd: pe }, current: cur.map(n), previous: prev.map(n), queryPages: qp.map(n), countries: ct.map(n) })
    return { status: prev.length ? 'OK' : 'PARTIAL', source: 'Google Search Console query data (first-party; average positions, not exact ranks)', period: `${cs} to ${mx} vs ${ps} to ${pe}`, asOf: mx, note: prev.length ? undefined : 'No data for the previous 28-day period, so declines cannot be computed.', data }
  }, 'Keyword intelligence')

  const competitors = await guard(errors, 'competitors', async (): Promise<ReportData['competitors']> => {
    const comps = await q(`SELECT id, domain, label FROM seo_competitors WHERE "siteId"=$1 AND active`, [siteId])
    if (!comps.length) return unavailable('Competitor public-page snapshots', 'No competitors are being tracked yet. Add public competitor domains in the Competitors page.')
    const snaps = await q(`SELECT s."competitorId", s."fetchedAt", s."httpStatus", s.title, s."metaDescription", s.h1, s."wordCount", s.error, row_number() OVER (PARTITION BY s."competitorId" ORDER BY s."fetchedAt" DESC) rn FROM seo_competitor_snapshots s JOIN seo_competitors c ON c.id = s."competitorId" WHERE c."siteId"=$1`, [siteId])
    const changes: any[] = []; let withSnap = 0; let newest = new Date(0)
    for (const c of comps) {
      const mine = snaps.filter((s) => s.competitorId === c.id && num(s.rn) <= 2).sort((a, b) => num(a.rn) - num(b.rn)); if (!mine.length) continue; withSnap++
      if (new Date(mine[0].fetchedAt) > newest) newest = new Date(mine[0].fetchedAt)
      if (mine.length === 2) { const [a, b] = mine; const diffs = (['title', 'metaDescription', 'h1', 'httpStatus'] as const).filter((k) => (a as any)[k] !== (b as any)[k]); if (diffs.length) changes.push({ domain: c.domain, changed: diffs, since: iso(b.fetchedAt) }) }
    }
    return { status: withSnap === 0 ? 'UNAVAILABLE' : withSnap < comps.length ? 'PARTIAL' : 'OK', source: 'Public homepage snapshots (title, description, H1, status, word count). No competitor traffic or ranking data is available or implied.', period: 'latest two snapshots per competitor', asOf: withSnap ? newest.toISOString() : null, data: { tracked: comps.length, withSnapshot: withSnap, changes } }
  }, 'Competitors')

  const recommendations = await guard(errors, 'recommendations', async (): Promise<ReportData['recommendations']> => {
    const r = await q(`SELECT title, "riskTier"::text tier, "priorityScore", "targetUrl", "dataQuality"::text dq FROM seo_recommendations WHERE "siteId"=$1 AND status='PROPOSED' ORDER BY "priorityScore" DESC LIMIT 5`, [siteId])
    const c = (await q(`SELECT count(*)::int n, count(*) FILTER (WHERE "riskTier"='HIGH_IMPACT')::int h FROM seo_recommendations WHERE "siteId"=$1 AND status='PROPOSED'`, [siteId]))[0]
    return { status: 'OK', source: 'Rule-based recommendations awaiting owner approval (seo_recommendations)', period: 'currently open', asOf: now.toISOString(), data: { proposed: num(c?.n), highImpact: num(c?.h), top: r } }
  }, 'Recommendations')

  const system: ReportData['system'] = { gsc: null, gscTokenExpiry: null, integrations: [], lastRuns: [], failedRecent: [], errors }
  try { system.gsc = await getConnectionView(q, siteId); const ex = testingExpiry(system.gsc.grantedAtEpoch, now.getTime()); if (ex && system.gsc.state === 'CONNECTED') system.gscTokenExpiry = { level: ex.level, hoursLeft: Math.round(ex.msLeft / 3_600_000) } } catch (e) { errors.push(`gsc-connection: ${e instanceof Error ? e.name : 'Error'}`) }
  try {
    system.integrations = (await q(`SELECT provider::text, status::text, "lastSyncAt", "lastError" FROM seo_integrations WHERE "siteId"=$1`, [siteId])).map((r) => ({ provider: r.provider, status: r.status, lastSyncAt: iso(r.lastSyncAt), lastError: r.lastError }))
    system.lastRuns = (await q(`SELECT kind, status::text, "rowsFetched", "rowsWritten", "rangeStart"::text "rangeStart", "rangeEnd"::text "rangeEnd", "startedAt", "errorCode" FROM seo_gsc_sync_runs WHERE "siteId"=$1 ORDER BY "startedAt" DESC LIMIT 5`, [siteId])).map((r) => ({ ...r, startedAt: iso(r.startedAt) }))
    system.failedRecent = (await q(`SELECT agent::text, status::text, "startedAt", error FROM seo_agent_runs WHERE "siteId"=$1 AND status IN ('FAILED','PARTIAL') AND "createdAt" > $2::timestamp - interval '3 days' ORDER BY "createdAt" DESC LIMIT 5`, [siteId, now.toISOString()])).map((r) => ({ ...r, startedAt: iso(r.startedAt), error: typeof r.error === 'string' ? r.error.slice(0, 80) : null }))
  } catch (e) { errors.push(`system: ${e instanceof Error ? e.name : 'Error'}`) }

  return { reportDate, generatedAt: now.toISOString(), timezone: REPORT_TZ, gsc, ga4, technical, sitemap, keywords, competitors, recommendations, system }
}

// ---------------------------------------------------------------- rendering
const delta = (now: number, before: number): string => (before === 0 ? (now === 0 ? '0' : 'n/a (no baseline)') : `${now >= before ? '+' : ''}${Math.round(((now - before) / before) * 1000) / 10}%`)
const badge = (s: Section<any>): string => `[${s.status}]`
const dash = (path: string, base = process.env.SEO_PUBLIC_BASE_URL ?? '') => `${base.replace(/\/$/, '')}/admin/seo${path}`

export function renderReportMarkdown(d: ReportData, findings: Finding[]): { title: string; summaryMd: string } {
  const L: string[] = []; const unavailableList: string[] = []
  const note = (s: Section<any>, name: string) => { if (s.status === 'UNAVAILABLE') unavailableList.push(`${name}: ${s.note ?? 'unavailable'}`); else if (s.status === 'STALE' || s.status === 'PARTIAL') unavailableList.push(`${name} (${s.status}): ${s.note ?? ''}`) }
  ;[['Search Console', d.gsc], ['GA4', d.ga4], ['Technical SEO', d.technical], ['Sitemaps', d.sitemap], ['Keywords', d.keywords], ['Competitors', d.competitors]].forEach(([n, s]) => note(s as Section<any>, n as string))
  const title = `TAPIS GLOBAL SEO daily report - ${d.reportDate} (${d.timezone})`
  L.push(`# ${title}`, `Generated ${d.generatedAt} from stored data only. Section labels: OK = fresh, STALE = old data, PARTIAL = incomplete, UNAVAILABLE = no data (not zero).`, '')
  L.push('## 1. Executive summary')
  const degraded = unavailableList.length
  L.push(degraded === 0 ? '- Data status: all sections are fresh.' : `- Data status: **${degraded} section(s) are not fully available** - see section 9. This report must not be read as a complete picture.`)
  if (d.technical.data) L.push(`- Technical health score (own crawler): ${d.technical.data.run.healthScore ?? 'n/a'} - open critical ${d.technical.data.open.CRITICAL ?? 0}, high ${d.technical.data.open.HIGH ?? 0}.`)
  if (d.gsc.data) L.push(`- Search Console last 7 available days (${d.gsc.period}): ${d.gsc.data.last7.clicks} clicks, ${d.gsc.data.last7.impressions} impressions (clicks ${delta(d.gsc.data.last7.clicks, d.gsc.data.prev7.clicks)} vs the 7 days before).`)
  else L.push('- Search Console: no data available (see section 2).')
  L.push('', 'Top priorities:'); findings.slice(0, 3).forEach((f, i) => L.push(`${i + 1}. [${f.priority}] ${f.finding}`)); if (!findings.length) L.push('1. No findings: nothing exceeded a rule threshold (this is not proof that nothing is wrong when sections are unavailable).')
  L.push('', `## 2. Google Search Console ${badge(d.gsc)}`, `Source: ${d.gsc.source}. Period: ${d.gsc.period ?? 'n/a'}.`)
  if (d.gsc.note) L.push(`Note: ${d.gsc.note}`)
  if (d.gsc.data) {
    const g = d.gsc.data; const fmt = (t: Totals | null) => (t ? `${t.clicks} clicks, ${t.impressions} impressions, CTR ${t.ctrPct}%, avg position ${t.position ?? 'n/a'}` : 'no row stored for that date')
    L.push(`- Latest available day (${g.latestDate}): ${fmt(g.latestDay)}`, `- Previous day: ${fmt(g.previousDay)}`, `- Last 7 days (${g.last7.days} days with data): ${fmt(g.last7)}`, `- Previous 7 days (${g.prev7.days} days with data): ${fmt(g.prev7)}`)
    if (g.missingDays.length) L.push(`- Days with no stored row in the last 14: ${g.missingDays.join(', ')} (missing, not zero).`)
    L.push(g.detailCoveragePct === null ? '- Query-level (detail) rows: none stored for this period.' : `- Query-level rows cover ${g.detailCoveragePct}% of the daily clicks; Search Console omits anonymized queries, so detail totals are lower than daily totals.`)
    const tbl = (title: string, rows: any[], key: string) => { if (rows.length) { L.push('', `${title}:`); rows.forEach((r) => L.push(`- ${r[key]}: ${r.clicks} clicks, ${r.impressions} impressions`)) } }
    tbl('Top queries (7d)', g.topQueries, 'query'); tbl('Top landing pages (7d)', g.topPages, 'page'); tbl('Countries (7d)', g.countries, 'country'); tbl('Devices (7d)', g.devices, 'device')
  }
  L.push('', `## 3. Google Analytics 4 ${badge(d.ga4)}`, `Source: ${d.ga4.source}. Period: ${d.ga4.period ?? 'n/a'}. GA4 sessions are a different measure from Search Console clicks.`)
  if (d.ga4.note) L.push(`Note: ${d.ga4.note}`)
  if (d.ga4.data) { const a = d.ga4.data; L.push(`- Organic sessions (7d): ${a.last7.sessions} (${delta(a.last7.sessions, a.prev7.sessions)} vs prior 7d); engaged sessions ${a.last7.engagedSessions}; engagement rate ${a.last7.engagementRatePct ?? 'n/a'}%; key events ${a.last7.keyEvents}. ${a.keyEventsNote}`, '- Organic users: not available (the stored GA4 table has no users column).'); a.topLandingPages.forEach((r: any) => L.push(`- ${r.page}: ${r.sessions} sessions, ${r.engaged} engaged`)) }
  L.push('', `## 4. Technical SEO ${badge(d.technical)}`, `Source: ${d.technical.source}.`)
  if (d.technical.note) L.push(`Note: ${d.technical.note}`)
  if (d.technical.data) { const t = d.technical.data; L.push(`- Last crawl: ${t.run.finishedAt}, ${t.run.pagesFetched} pages${t.run.truncated ? ' (crawl was truncated)' : ''}.`, `- Open issues: ${Object.entries(t.open).map(([k, v]) => `${k} ${v}`).join(', ') || 'none'}; resolved in the last 36h: ${t.resolvedRecently}.`); t.newHighSeverity.forEach((i: any) => L.push(`- NEW ${i.severity} ${i.code}: ${i.url ?? 'site-wide'}`)); L.push(`Dashboard: ${dash('/issues')}`) }
  L.push('', `## 5. Indexing and sitemap health ${badge(d.sitemap)}`, `Source: ${d.sitemap.source}.`)
  if (d.sitemap.note) L.push(`Note: ${d.sitemap.note}`)
  if (d.sitemap.data) { d.sitemap.data.sitemaps.forEach((s: any) => L.push(`- ${s.path}: errors ${s.errors}, warnings ${s.warnings}, submitted ${s.submitted ?? 'n/a'}, indexed ${s.indexed ?? 'n/a'}`)); L.push(d.sitemap.data.urlInspection) } else L.push('Google-confirmed indexing is unavailable; do not infer indexing from the sitemap.')
  L.push('', `## 6. Keyword performance ${badge(d.keywords)}`, `Source: ${d.keywords.source}. Period: ${d.keywords.period ?? 'n/a'}.`)
  if (d.keywords.note) L.push(`Note: ${d.keywords.note}`)
  if (d.keywords.data) { const k = d.keywords.data; const list = (t: string, rows: any[], f: (r: any) => string) => { if (rows.length) { L.push('', t); rows.slice(0, 8).forEach((r) => L.push(`- ${f(r)}`)) } }
    list('High-impression, low-CTR (heuristic: >=50 impressions, CTR <2%, position <=10):', k.lowCtr, (r) => `${r.query}: ${r.impressions} impr, CTR ${r.ctrPct}%, pos ${r.position}`)
    list('Positions 4-20 (heuristic):', k.striking, (r) => `${r.query}: pos ${r.position}, ${r.impressions} impr`)
    list('Declining (impressions down >=30% vs previous 28 days):', k.declining, (r) => `${r.query}: ${r.impressionsBefore} -> ${r.impressionsNow} impr (-${r.dropPct}%)`)
    list('Product categories (query text classification):', k.categories, (r) => `${r.category}: ${r.queries} queries, ${r.clicks} clicks, ${r.impressions} impr`)
    list('Countries:', k.countries, (r) => `${r.country}: ${r.impressions} impr, CTR ${r.ctrPct}%, pos ${r.position}${r.flag ? ' (low CTR)' : ''}`); L.push(`Dashboard: ${dash('/keywords')}`) }
  L.push('', `## 7. Competitor intelligence ${badge(d.competitors)}`, `Source: ${d.competitors.source}.`)
  if (d.competitors.note) L.push(`Note: ${d.competitors.note}`)
  if (d.competitors.data) { L.push(`- Tracked ${d.competitors.data.tracked}, with snapshots ${d.competitors.data.withSnapshot}.`); d.competitors.data.changes.forEach((c: any) => L.push(`- ${c.domain}: changed ${c.changed.join(', ')} since ${c.since}`)) }
  L.push('', '## 8. AI findings and recommendations (rule-based analyst; nothing is published without owner approval)')
  if (!findings.length) L.push('No findings.')
  findings.forEach((f, i) => L.push('', `### ${i + 1}. [${f.priority}] ${f.finding}`, `- Evidence: ${f.evidence.join(' | ')}`, `- Business impact: ${f.businessImpact}`, `- Confidence: ${f.confidence}`, `- Suggested fix: ${f.suggestedFix}`, `- Approval required: ${f.approvalRequired ? 'YES - ' : 'No - '}${f.approvalNote}`))
  L.push(`Open approval queue: ${dash('/recommendations')}`)
  L.push('', '## 9. System and integration health')
  const s = d.system
  L.push(`- Search Console connection: ${s.gsc?.state ?? 'unknown'}${s.gsc?.propertyUrl ? ` (${s.gsc.propertyUrl})` : ''}${s.gscTokenExpiry ? `; consent expires in about ${s.gscTokenExpiry.hoursLeft} h (${s.gscTokenExpiry.level})` : ''}.`)
  s.integrations.forEach((i) => L.push(`- ${i.provider}: ${i.status}, last sync ${i.lastSyncAt ?? 'never'}${i.lastError ? `, last error code ${i.lastError}` : ''}`))
  L.push(s.lastRuns.length ? `- Last Search Console sync runs: ${s.lastRuns.map((r: any) => `${r.kind} ${r.status} ${r.startedAt}`).join('; ')}` : '- No Search Console sync runs recorded.')
  s.failedRecent.forEach((r: any) => L.push(`- Failed/partial job: ${r.agent} ${r.status} ${r.startedAt ?? ''}`))
  if (s.errors.length) L.push(`- Sections that could not be read: ${s.errors.join('; ')}`)
  if (unavailableList.length) { L.push('', 'Unavailable / stale / partial data:'); unavailableList.forEach((u) => L.push(`- ${u}`)) }
  return { title, summaryMd: L.join('\n') }
}

export function reportOverallStatus(d: ReportData): 'SUCCEEDED' | 'PARTIAL' {
  const secs = [d.gsc, d.ga4, d.technical, d.sitemap, d.keywords, d.competitors]
  return secs.every((s) => s.status === 'OK') && d.system.errors.length === 0 ? 'SUCCEEDED' : 'PARTIAL'
}

// ---------------------------------------------------------------- generation (idempotent, locked, logged)
export type WithTx = <T>(fn: (q: Q) => Promise<T>) => Promise<T>
export interface GenerateResult { outcome: 'CREATED' | 'REGENERATED' | 'DUPLICATE' | 'BUSY' | 'FAILED'; reportId?: string; reportDate: string; status?: 'SUCCEEDED' | 'PARTIAL'; findings?: number; error?: string }

/** One report per site per IST calendar day (unique index siteId+kind+periodStart). A second call the same day returns DUPLICATE and changes nothing, unless force=true (manual regenerate).
 *  Overlapping calls are refused (BUSY) by a transaction-level advisory lock. The agent run (job log) commits with the report; failures are logged afterwards in their own statement. */
export async function generateDailyReport(a: { withTx: WithTx; q: Q; siteId: string; trigger: 'SCHEDULE' | 'MANUAL'; triggeredBy: string; force?: boolean; now?: Date }): Promise<GenerateResult> {
  const now = a.now ?? new Date(); const reportDate = istDate(now)
  try {
    return await a.withTx(async (q) => {
      const lock = (await q(`SELECT pg_try_advisory_xact_lock(hashtext($1)) ok`, [`seo-daily-report:${a.siteId}`]))[0]?.ok
      if (!lock) return { outcome: 'BUSY', reportDate }
      const existing = (await q(`SELECT id FROM seo_reports WHERE "siteId"=$1 AND kind='DAILY' AND "periodStart"=$2::date`, [a.siteId, reportDate]))[0]
      if (existing && !a.force) return { outcome: 'DUPLICATE', reportId: existing.id as string, reportDate }
      const runId = randomUUID()
      await q(`INSERT INTO seo_agent_runs ("id","siteId","agent","trigger","status","triggeredBy","startedAt","inputSummary") VALUES ($1,$2,'REPORTING',$3::"SeoTrigger",'RUNNING',$4,now(),$5::jsonb)`, [runId, a.siteId, a.trigger, a.triggeredBy.slice(0, 100), JSON.stringify({ reportDate, force: !!a.force })])
      const data = await collectReportData(a.q, a.siteId, now); const findings = buildFindings(data); const md = renderReportMarkdown(data, findings); const status = reportOverallStatus(data)
      const payload = JSON.stringify({ ...data, findings, schema: 1, contentSha256: createHash('sha256').update(md.summaryMd).digest('hex'), delivery: { status: 'NOT_ATTEMPTED' } })
      const id = existing?.id ?? randomUUID()
      if (existing) await q(`UPDATE seo_reports SET "title"=$2,"summaryMd"=$3,"data"=$4::jsonb,"runId"=$5 WHERE id=$1`, [id, md.title, md.summaryMd, payload, runId])
      else await q(`INSERT INTO seo_reports ("id","siteId","kind","periodStart","periodEnd","title","summaryMd","data","runId") VALUES ($1,$2,'DAILY',$3::date,$3::date,$4,$5,$6::jsonb,$7)`, [id, a.siteId, reportDate, md.title, md.summaryMd, payload, runId])
      await q(`UPDATE seo_agent_runs SET status=$2::"SeoRunStatus","finishedAt"=now(),"outputSummary"=$3::jsonb WHERE id=$1`, [runId, status, JSON.stringify({ reportId: id, sections: { gsc: data.gsc.status, ga4: data.ga4.status, technical: data.technical.status, sitemap: data.sitemap.status, keywords: data.keywords.status, competitors: data.competitors.status }, findings: findings.length })])
      return { outcome: existing ? 'REGENERATED' : 'CREATED', reportId: id, reportDate, status, findings: findings.length }
    })
  } catch (e) {
    const name = e instanceof Error ? e.name : 'Error'
    await a.q(`INSERT INTO seo_agent_runs ("id","siteId","agent","trigger","status","triggeredBy","startedAt","finishedAt","error") VALUES ($1,$2,'REPORTING',$3::"SeoTrigger",'FAILED',$4,now(),now(),$5)`, [randomUUID(), a.siteId, a.trigger, a.triggeredBy.slice(0, 100), `generation failed (${name})`]).catch(() => undefined)
    return { outcome: 'FAILED', reportDate, error: name }
  }
}
