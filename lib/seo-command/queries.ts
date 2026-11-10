import { seoQuery } from './db'

export interface RunRow {
  id: string
  status: string
  startedAt: Date
  finishedAt: Date | null
  pagesFetched: number
  healthScore: number | null
  severityCounts: Record<string, number> | null
  truncated: boolean
  error: string | null
  triggeredBy: string | null
}

export async function latestSiteId(): Promise<string | null> {
  const r = await seoQuery<{ id: string }>(`SELECT id FROM seo_sites ORDER BY "createdAt" ASC LIMIT 1`)
  return r[0]?.id ?? null
}

export async function listRuns(siteId: string, limit = 30): Promise<RunRow[]> {
  return seoQuery<RunRow>(`SELECT id,status,"startedAt","finishedAt","pagesFetched","healthScore","severityCounts",truncated,error,"triggeredBy" FROM seo_crawl_runs WHERE "siteId"=$1 ORDER BY "startedAt" DESC LIMIT $2`, [siteId, limit])
}

export async function getOverview(siteId: string) {
  const runs = await listRuns(siteId, 2)
  const done = runs.filter((r) => r.status === 'SUCCEEDED' || r.status === 'PARTIAL')
  const latest = done[0] ?? null
  const previous = done[1] ?? null
  const [issueCounts, topCodes, statusDist, integrations, pending, pageStats, issuePages] = await Promise.all([
    seoQuery<{ severity: string; n: string }>(`SELECT severity::text, count(*)::text n FROM seo_technical_issues WHERE "siteId"=$1 AND status='OPEN' GROUP BY severity`, [siteId]),
    seoQuery<{ code: string; severity: string; n: string }>(`SELECT code, min(severity::text) severity, count(*)::text n FROM seo_technical_issues WHERE "siteId"=$1 AND status='OPEN' AND severity <> 'INFO' GROUP BY code ORDER BY min(CASE severity WHEN 'CRITICAL' THEN 0 WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END), count(*) DESC LIMIT 8`, [siteId]),
    latest ? seoQuery<{ bucket: string; n: string }>(`SELECT CASE WHEN "statusCode" IS NULL THEN 'no response' WHEN "statusCode" < 300 THEN '2xx' WHEN "statusCode" < 400 THEN '3xx' WHEN "statusCode" < 500 THEN '4xx' ELSE '5xx' END bucket, count(*)::text n FROM seo_crawl_pages WHERE "crawlRunId"=$1 GROUP BY 1`, [latest.id]) : Promise.resolve([]),
    seoQuery<{ provider: string; status: string; lastSyncAt: Date | null }>(`SELECT provider::text, status::text, "lastSyncAt" FROM seo_integrations WHERE "siteId"=$1`, [siteId]).catch(() => []),
    seoQuery<{ n: string }>(`SELECT count(*)::text n FROM seo_recommendations WHERE "siteId"=$1 AND status='PROPOSED'`, [siteId]),
    latest ? seoQuery<{ total: string; indexable: string; noindex: string; sitemap_missing: string }>(
      `SELECT count(*)::text total,
              count(*) FILTER (WHERE "statusCode"=200 AND COALESCE("robotsMeta",'') !~* 'noindex')::text indexable,
              count(*) FILTER (WHERE COALESCE("robotsMeta",'') ~* 'noindex')::text noindex,
              '0' sitemap_missing
       FROM seo_crawl_pages WHERE "crawlRunId"=$1`, [latest.id]) : Promise.resolve([]),
    seoQuery<{ n: string }>(`SELECT count(DISTINCT url)::text n FROM seo_technical_issues WHERE "siteId"=$1 AND status='OPEN' AND severity <> 'INFO' AND url IS NOT NULL`, [siteId]),
  ])
  const provider = (p: string) => integrations.find((i) => i.provider === p)
  const conn = (p: string) => {
    const i = provider(p)
    return !i || i.status === 'NOT_CONFIGURED' ? 'PENDING' : i.status
  }
  return {
    latest,
    previous,
    scoreDelta: latest && previous && latest.healthScore !== null && previous.healthScore !== null ? latest.healthScore - previous.healthScore : null,
    issueCounts: Object.fromEntries(issueCounts.map((r) => [r.severity, Number(r.n)])) as Record<string, number>,
    topCodes: topCodes.map((r) => ({ code: r.code, severity: r.severity, count: Number(r.n) })),
    statusDist: statusDist.map((r) => ({ bucket: r.bucket, count: Number(r.n) })),
    issuePages: Number(issuePages[0]?.n ?? 0),
    pendingRecommendations: Number(pending[0]?.n ?? 0),
    pages: pageStats[0] ? { total: Number(pageStats[0].total), indexable: Number(pageStats[0].indexable), noindex: Number(pageStats[0].noindex) } : null,
    connections: { GSC: conn('GSC'), GA4: conn('GA4') },
  }
}

export async function getTrend(siteId: string, limit = 30) {
  const rows = await seoQuery<{ id: string; startedAt: Date; healthScore: number; pagesFetched: number; severityCounts: Record<string, number> | null }>(
    `SELECT id,"startedAt","healthScore","pagesFetched","severityCounts" FROM seo_crawl_runs WHERE "siteId"=$1 AND status IN ('SUCCEEDED','PARTIAL') AND "healthScore" IS NOT NULL ORDER BY "startedAt" DESC LIMIT $2`,
    [siteId, limit],
  )
  return rows.reverse()
}

export async function listIssues(siteId: string, f: { severity?: string; code?: string; status?: string; q?: string; limit?: number; offset?: number }) {
  const where = [`"siteId"=$1`]
  const p: unknown[] = [siteId]
  if (f.severity) { p.push(f.severity); where.push(`severity::text=$${p.length}`) }
  if (f.code) { p.push(f.code); where.push(`code=$${p.length}`) }
  p.push(f.status || 'OPEN'); where.push(`status::text=$${p.length}`)
  if (f.q) { p.push('%' + f.q.replace(/[%_\\]/g, '\\$&') + '%'); where.push(`url ILIKE $${p.length}`) }
  p.push(Math.min(f.limit ?? 100, 500), f.offset ?? 0)
  return seoQuery<{ id: string; code: string; severity: string; status: string; url: string | null; detail: unknown; dataQuality: string; firstSeenAt: Date; lastSeenAt: Date; resolvedAt: Date | null }>(
    `SELECT id,code,severity::text,status::text,url,detail,"dataQuality"::text,"firstSeenAt","lastSeenAt","resolvedAt" FROM seo_technical_issues WHERE ${where.join(' AND ')}
     ORDER BY CASE severity WHEN 'CRITICAL' THEN 0 WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 WHEN 'LOW' THEN 3 ELSE 4 END, "lastSeenAt" DESC LIMIT $${p.length - 1} OFFSET $${p.length}`,
    p,
  )
}

export async function listPages(siteId: string, f: { q?: string; status?: string; limit?: number; offset?: number }) {
  const runs = await listRuns(siteId, 5)
  const run = runs.find((r) => r.status === 'SUCCEEDED' || r.status === 'PARTIAL')
  if (!run) return { run: null, pages: [] as any[] }
  const where = [`p."crawlRunId"=$1`]
  const p: unknown[] = [run.id]
  if (f.q) { p.push('%' + f.q.replace(/[%_\\]/g, '\\$&') + '%'); where.push(`p.url ILIKE $${p.length}`) }
  if (f.status === 'error') where.push(`(p."statusCode" IS NULL OR p."statusCode" >= 400)`)
  if (f.status === 'redirect') where.push(`p."statusCode" BETWEEN 300 AND 399 OR jsonb_array_length(COALESCE(p."redirectChain",'[]'::jsonb)) > 0`)
  p.push(Math.min(f.limit ?? 100, 500), f.offset ?? 0)
  const pages = await seoQuery(
    `SELECT p.url,p."statusCode",p.title,p."metaDescription",p.h1,p."wordCount",p."canonicalUrl",p."robotsMeta",p."responseMs",p."internalLinksIn",p."internalLinksOut",
            (SELECT count(*) FROM seo_technical_issues i WHERE i."siteId"=$${p.length + 1} AND i.url=p.url AND i.status='OPEN' AND i.severity <> 'INFO')::int AS "openIssues"
     FROM seo_crawl_pages p WHERE ${where.join(' AND ')} ORDER BY "openIssues" DESC, p.url ASC LIMIT $${p.length - 1} OFFSET $${p.length}`,
    [...p, siteId],
  )
  return { run, pages }
}

export async function getPageDetail(siteId: string, url: string) {
  const [history, issues] = await Promise.all([
    seoQuery(
      `SELECT r."startedAt", p."statusCode", p.title, p."metaDescription", p.h1, p."wordCount", p."canonicalUrl", p."robotsMeta", p."responseMs", p."redirectChain", p."jsonLdTypes", p."internalLinksIn", p."internalLinksOut"
       FROM seo_crawl_pages p JOIN seo_crawl_runs r ON r.id=p."crawlRunId" WHERE r."siteId"=$1 AND p.url=$2 ORDER BY r."startedAt" DESC LIMIT 20`, [siteId, url]),
    seoQuery(`SELECT id,code,severity::text,status::text,detail,"firstSeenAt","lastSeenAt","resolvedAt" FROM seo_technical_issues WHERE "siteId"=$1 AND url=$2 ORDER BY CASE severity WHEN 'CRITICAL' THEN 0 WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 WHEN 'LOW' THEN 3 ELSE 4 END`, [siteId, url]),
  ])
  return { history, issues }
}

/** What changed between the latest two completed crawls. */
export async function getChanges(siteId: string) {
  const runs = (await listRuns(siteId, 10)).filter((r) => r.status === 'SUCCEEDED' || r.status === 'PARTIAL')
  if (runs.length < 2) return null
  const [cur, prev] = runs
  const [fieldChanges, added, removed, newIssues, resolvedIssues] = await Promise.all([
    seoQuery(
      `SELECT c.url, p.title ptitle, c.title ctitle, p."statusCode" pstatus, c."statusCode" cstatus, p."canonicalUrl" pcanon, c."canonicalUrl" ccanon, p."metaDescription" pdesc, c."metaDescription" cdesc
       FROM seo_crawl_pages c JOIN seo_crawl_pages p ON p.url=c.url AND p."crawlRunId"=$2
       WHERE c."crawlRunId"=$1 AND (c.title IS DISTINCT FROM p.title OR c."statusCode" IS DISTINCT FROM p."statusCode" OR c."canonicalUrl" IS DISTINCT FROM p."canonicalUrl" OR c."metaDescription" IS DISTINCT FROM p."metaDescription") LIMIT 100`, [cur.id, prev.id]),
    seoQuery(`SELECT url FROM seo_crawl_pages c WHERE "crawlRunId"=$1 AND NOT EXISTS (SELECT 1 FROM seo_crawl_pages p WHERE p."crawlRunId"=$2 AND p.url=c.url) LIMIT 100`, [cur.id, prev.id]),
    seoQuery(`SELECT url FROM seo_crawl_pages p WHERE "crawlRunId"=$2 AND NOT EXISTS (SELECT 1 FROM seo_crawl_pages c WHERE c."crawlRunId"=$1 AND c.url=p.url) LIMIT 100`, [cur.id, prev.id]),
    seoQuery(`SELECT code,severity::text,url FROM seo_technical_issues WHERE "siteId"=$1 AND "firstSeenAt" >= (SELECT "startedAt" FROM seo_crawl_runs WHERE id=$2) ORDER BY CASE severity WHEN 'CRITICAL' THEN 0 WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END LIMIT 100`, [siteId, cur.id]),
    seoQuery(`SELECT code,severity::text,url FROM seo_technical_issues WHERE "siteId"=$1 AND "resolvedAt" >= (SELECT "startedAt" FROM seo_crawl_runs WHERE id=$2) LIMIT 100`, [siteId, cur.id]),
  ])
  return { current: cur, previous: prev, fieldChanges, added, removed, newIssues, resolvedIssues }
}

export async function listRecommendations(siteId: string, status?: string) {
  const p: unknown[] = [siteId]
  let w = `"siteId"=$1`
  if (status && status !== 'ALL') { p.push(status); w += ` AND status::text=$2` }
  return seoQuery(
    `SELECT id,"changeType","riskTier"::text,title,rationale,"targetUrl",evidence,"priorityScore","expectedImpact",status::text,"decidedBy","decidedAt","decisionNote","createdAt","updatedAt","dataQuality"::text
     FROM seo_recommendations WHERE ${w} ORDER BY CASE status::text WHEN 'PROPOSED' THEN 0 WHEN 'IN_REVIEW' THEN 1 WHEN 'DEFERRED' THEN 2 ELSE 3 END, "priorityScore" DESC, "updatedAt" DESC LIMIT 300`, p)
}

/** Keywords with on-page coverage from the latest crawl. Rankings come ONLY from Search Console rows; none are invented. */
export async function listKeywords(siteId: string) {
  const runs = (await listRuns(siteId, 5)).filter((r) => r.status === 'SUCCEEDED' || r.status === 'PARTIAL')
  const runId = runs[0]?.id ?? null
  return seoQuery(
    `SELECT k.id,k.keyword,k.country,k."targetUrl",k.notes,k.active,k."createdAt",
       CASE WHEN $2::text IS NULL THEN NULL ELSE (SELECT count(*) FROM seo_crawl_pages p WHERE p."crawlRunId"=$2 AND p."statusCode"=200 AND p.title ILIKE '%'||k.keyword||'%')::int END AS "inTitle",
       CASE WHEN $2::text IS NULL THEN NULL ELSE (SELECT count(*) FROM seo_crawl_pages p WHERE p."crawlRunId"=$2 AND p."statusCode"=200 AND p.h1 ILIKE '%'||k.keyword||'%')::int END AS "inH1",
       CASE WHEN $2::text IS NULL THEN NULL ELSE (SELECT count(*) FROM seo_crawl_pages p WHERE p."crawlRunId"=$2 AND p."statusCode"=200 AND p."metaDescription" ILIKE '%'||k.keyword||'%')::int END AS "inMeta",
       CASE WHEN k."targetUrl" IS NULL OR $2::text IS NULL THEN NULL ELSE (SELECT p."statusCode" FROM seo_crawl_pages p WHERE p."crawlRunId"=$2 AND p.url=k."targetUrl" LIMIT 1) END AS "targetStatus",
       (SELECT r.position FROM seo_keyword_ranks r WHERE r."keywordId"=k.id ORDER BY r.date DESC LIMIT 1) AS "latestPosition",
       (SELECT r.date FROM seo_keyword_ranks r WHERE r."keywordId"=k.id ORDER BY r.date DESC LIMIT 1) AS "latestRankDate",
       (SELECT r.impressions FROM seo_keyword_ranks r WHERE r."keywordId"=k.id ORDER BY r.date DESC LIMIT 1) AS "latestImpressions"
     FROM seo_keywords k WHERE k."siteId"=$1 ORDER BY k.keyword`, [siteId, runId])
}

export async function listCompetitors(siteId: string) {
  return seoQuery(
    `SELECT c.id,c.domain,c.label,c.active,c."createdAt",
       (SELECT row_to_json(s) FROM (SELECT * FROM seo_competitor_snapshots WHERE "competitorId"=c.id ORDER BY "fetchedAt" DESC LIMIT 1) s) AS latest,
       (SELECT row_to_json(s) FROM (SELECT * FROM seo_competitor_snapshots WHERE "competitorId"=c.id ORDER BY "fetchedAt" DESC OFFSET 1 LIMIT 1) s) AS previous
     FROM seo_competitors c WHERE c."siteId"=$1 ORDER BY c.domain`, [siteId])
}

export async function latestPageSpeed(siteId: string) {
  return seoQuery(
    `SELECT DISTINCT ON (url,strategy) url,strategy,"fetchedAt","perfScore","lcpMs",cls,"inpMs","tbtMs","fcpMs","fieldDataAvailable","dataQuality"::text,error
     FROM seo_page_speed WHERE "siteId"=$1 ORDER BY url,strategy,"fetchedAt" DESC LIMIT 100`, [siteId])
}

export async function recentAudit(siteId: string, limit = 50) {
  return seoQuery(`SELECT at,"actorType"::text,actor,action,"entityType","entityId",metadata FROM seo_audit_log WHERE "siteId"=$1 ORDER BY at DESC LIMIT $2`, [siteId, limit])
}

/** Historical report assembled live from stored runs; persisted copies live in seo_reports. */
export async function buildReport(siteId: string, days: number) {
  const d = Math.max(1, Math.min(Math.floor(days), 730))
  const [runs, opened, resolved, byCode, decisions] = await Promise.all([
    seoQuery<{ startedAt: Date; healthScore: number; pagesFetched: number }>(`SELECT "startedAt","healthScore","pagesFetched" FROM seo_crawl_runs WHERE "siteId"=$1 AND status IN ('SUCCEEDED','PARTIAL') AND "startedAt" >= now() - make_interval(days => $2) ORDER BY "startedAt"`, [siteId, d]),
    seoQuery<{ n: string }>(`SELECT count(*)::text n FROM seo_technical_issues WHERE "siteId"=$1 AND "firstSeenAt" >= now() - make_interval(days => $2)`, [siteId, d]),
    seoQuery<{ n: string }>(`SELECT count(*)::text n FROM seo_technical_issues WHERE "siteId"=$1 AND "resolvedAt" >= now() - make_interval(days => $2)`, [siteId, d]),
    seoQuery<{ code: string; n: string }>(`SELECT code, count(*)::text n FROM seo_technical_issues WHERE "siteId"=$1 AND status='OPEN' AND severity <> 'INFO' GROUP BY code ORDER BY count(*) DESC LIMIT 10`, [siteId]),
    seoQuery<{ status: string; n: string }>(`SELECT status::text, count(*)::text n FROM seo_recommendations WHERE "siteId"=$1 AND "decidedAt" >= now() - make_interval(days => $2) GROUP BY status`, [siteId, d]),
  ])
  return {
    days: d,
    runs: runs.length,
    firstScore: runs[0]?.healthScore ?? null,
    lastScore: runs[runs.length - 1]?.healthScore ?? null,
    issuesOpened: Number(opened[0]?.n ?? 0),
    issuesResolved: Number(resolved[0]?.n ?? 0),
    topOpenCodes: byCode.map((r) => ({ code: r.code, count: Number(r.n) })),
    decisions: Object.fromEntries(decisions.map((r) => [r.status, Number(r.n)])),
    series: runs.map((r) => ({ at: r.startedAt, score: r.healthScore, pages: r.pagesFetched })),
  }
}
