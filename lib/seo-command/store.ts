import { randomUUID } from 'crypto'
import type { PoolClient } from 'pg'
import { withSeoTx, seoQuery } from './db'
import { crawlSite, type CrawlOptions } from './crawler'
import { buildRecommendations } from './recommend'
import type { Issue } from './types'

export class CrawlBusyError extends Error {
  constructor() {
    super('A crawl is already running for this site')
    this.name = 'CrawlBusyError'
  }
}

export const DEFAULT_SITE_DOMAIN = 'tapisglobalinternational.com'
export const DEFAULT_SITE_BASE_URL = 'https://www.tapisglobalinternational.com'

export function configuredBaseUrl(): string {
  return process.env.SEO_CRAWL_BASE_URL || DEFAULT_SITE_BASE_URL
}

export async function ensureSite(c: PoolClient, baseUrl: string): Promise<string> {
  const domain = new URL(baseUrl).hostname.replace(/^www\./, '')
  const r = await c.query(
    `INSERT INTO seo_sites (id, domain, "baseUrl", "updatedAt") VALUES ($1,$2,$3,now())
     ON CONFLICT (domain) DO UPDATE SET "baseUrl" = EXCLUDED."baseUrl", "updatedAt" = now() RETURNING id`,
    [randomUUID(), domain, baseUrl],
  )
  return r.rows[0].id
}

export async function getOrCreateSiteId(baseUrl = configuredBaseUrl()): Promise<string> {
  return withSeoTx((c) => ensureSite(c, baseUrl))
}

async function audit(c: PoolClient, siteId: string | null, actor: string, action: string, entityType: string, entityId: string | null, metadata: unknown, actorType: 'ADMIN' | 'SYSTEM' = 'ADMIN') {
  await c.query(`INSERT INTO seo_audit_log (id,"siteId","actorType",actor,action,"entityType","entityId",metadata) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, [randomUUID(), siteId, actorType, actor, action, entityType, entityId, metadata === undefined ? null : JSON.stringify(metadata)])
}
export { audit }

export interface CrawlSummary {
  runId: string
  siteId: string
  status: 'SUCCEEDED' | 'PARTIAL' | 'FAILED'
  pagesFetched: number
  healthScore: number | null
  issueCount: number
  newIssues: number
  resolvedIssues: number
  truncated: boolean
  error?: string
}

/** Runs a crawl and persists everything. Always leaves the run row in a terminal state. */
export async function runAndStoreCrawl(opts: { baseUrl?: string; maxPages?: number; triggeredBy: string; crawlOverrides?: Partial<CrawlOptions> }): Promise<CrawlSummary> {
  const baseUrl = opts.baseUrl ?? configuredBaseUrl()
  const { siteId, runId } = await withSeoTx(async (c) => {
    const siteId = await ensureSite(c, baseUrl)
    // One crawl at a time per site: a RUNNING run younger than 15 minutes blocks a new one.
    await c.query(`SELECT pg_advisory_xact_lock(hashtext($1))`, ['seo-crawl:' + siteId])
    const busy = await c.query(`SELECT id FROM seo_crawl_runs WHERE "siteId"=$1 AND status='RUNNING' AND "startedAt" > now() - interval '15 minutes' LIMIT 1`, [siteId])
    if (busy.rowCount) throw new CrawlBusyError()
    await c.query(`UPDATE seo_crawl_runs SET status='FAILED', error='abandoned (no completion within 15 minutes)', "finishedAt"=now() WHERE "siteId"=$1 AND status='RUNNING'`, [siteId])
    const runId = randomUUID()
    await c.query(`INSERT INTO seo_crawl_runs (id,"siteId","baseUrl",status,"triggeredBy") VALUES ($1,$2,$3,'RUNNING',$4)`, [runId, siteId, baseUrl, opts.triggeredBy])
    await audit(c, siteId, opts.triggeredBy, 'crawl.started', 'seo_crawl_runs', runId, { baseUrl })
    return { siteId, runId }
  })

  try {
    const out = await crawlSite({ origin: baseUrl, maxPages: opts.maxPages, ...opts.crawlOverrides })
    const fetchedOk = out.pages.filter((p) => p.statusCode !== null).length
    const status: 'SUCCEEDED' | 'PARTIAL' | 'FAILED' = fetchedOk === 0 ? 'FAILED' : out.truncated ? 'PARTIAL' : 'SUCCEEDED'
    return await withSeoTx(async (c) => {
      const rows = out.pages.map((p) => ({
        url: p.url,
        statusCode: p.statusCode,
        redirectChain: p.redirectChain.length ? p.redirectChain : null,
        canonicalUrl: p.facts?.canonical ?? null,
        robotsMeta: p.facts?.robotsMeta ?? null,
        title: p.facts?.title ?? null,
        metaDescription: p.facts?.metaDescription ?? null,
        h1: p.facts?.h1s[0] ?? null,
        wordCount: p.facts?.wordCount ?? null,
        hasHreflang: (p.facts?.hreflangCount ?? 0) > 0,
        jsonLdTypes: p.facts?.jsonLdTypes ?? [],
        internalLinksOut: p.facts?.internalLinks.length ?? null,
        internalLinksIn: p.linkedFrom.length,
        responseMs: p.responseMs === null ? null : Math.round(p.responseMs),
      }))
      if (rows.length) {
        await c.query(
          `INSERT INTO seo_crawl_pages (id,"crawlRunId",url,"statusCode","redirectChain","canonicalUrl","robotsMeta",title,"metaDescription",h1,"wordCount","hasHreflang","jsonLdTypes","internalLinksOut","internalLinksIn","responseMs")
           SELECT gen_random_uuid()::text, $1, x.url, x."statusCode", x."redirectChain", x."canonicalUrl", x."robotsMeta", x.title, x."metaDescription", x.h1, x."wordCount", x."hasHreflang",
                  COALESCE(ARRAY(SELECT jsonb_array_elements_text(x."jsonLdTypes")), '{}'), x."internalLinksOut", x."internalLinksIn", x."responseMs"
           FROM jsonb_to_recordset($2::jsonb) AS x(url text,"statusCode" int,"redirectChain" jsonb,"canonicalUrl" text,"robotsMeta" text,title text,"metaDescription" text,h1 text,"wordCount" int,"hasHreflang" boolean,"jsonLdTypes" jsonb,"internalLinksOut" int,"internalLinksIn" int,"responseMs" int)
           ON CONFLICT ("crawlRunId", url) DO NOTHING`,
          [runId, JSON.stringify(rows)],
        )
      }

      const byFp = new Map<string, Issue>()
      for (const i of out.issues) if (!byFp.has(i.fingerprint)) byFp.set(i.fingerprint, i)
      const issues = Array.from(byFp.values())
      let newIssues = 0
      if (issues.length) {
        const r = await c.query(
          `INSERT INTO seo_technical_issues (id,"siteId",fingerprint,code,severity,url,detail,"dataQuality")
           SELECT gen_random_uuid()::text, $1, x.fingerprint, x.code, x.severity::"SeoSeverity", x.url, x.detail, x."dataQuality"::"SeoDataQuality"
           FROM jsonb_to_recordset($2::jsonb) AS x(fingerprint text, code text, severity text, url text, detail jsonb, "dataQuality" text)
           ON CONFLICT ("siteId", fingerprint) DO UPDATE SET
             "lastSeenAt" = now(), severity = EXCLUDED.severity, detail = EXCLUDED.detail,
             status = CASE WHEN seo_technical_issues.status = 'RESOLVED' THEN 'OPEN'::"SeoIssueStatus" ELSE seo_technical_issues.status END,
             "resolvedAt" = NULL
           RETURNING (xmax = 0) AS inserted`,
          [siteId, JSON.stringify(issues.map((i) => ({ fingerprint: i.fingerprint, code: i.code, severity: i.severity, url: i.url, detail: i.detail, dataQuality: i.dataQuality })))],
        )
        newIssues = r.rows.filter((x) => x.inserted).length
      }

      // Resolve issues that were not re-observed. Never when nothing could be fetched; when truncated, only for URLs we actually crawled.
      let resolved = 0
      if (status !== 'FAILED') {
        const crawled = out.pages.map((p) => p.url)
        const res = await c.query(
          `UPDATE seo_technical_issues SET status='RESOLVED', "resolvedAt"=now()
           WHERE "siteId"=$1 AND status IN ('OPEN','ACKNOWLEDGED') AND "lastSeenAt" < (SELECT "startedAt" FROM seo_crawl_runs WHERE id=$2)
             AND ($3::boolean = false OR url IS NULL OR url = ANY($4::text[]))`,
          [siteId, runId, out.truncated, crawled],
        )
        resolved = res.rowCount ?? 0
      }

      await c.query(
        `UPDATE seo_crawl_runs SET status=$2::"SeoRunStatus", "pagesPlanned"=$3, "pagesFetched"=$4, "healthScore"=$5, "severityCounts"=$6, truncated=$7, "finishedAt"=now(), error=$8 WHERE id=$1`,
        [runId, status, out.pages.length + (out.truncated ? 1 : 0), fetchedOk, status === 'FAILED' ? null : out.score, JSON.stringify(out.severityCounts), out.truncated, status === 'FAILED' ? 'No page could be fetched' : null],
      )
      if (status !== 'FAILED') {
        const agentRunId = randomUUID()
        await c.query(
          `INSERT INTO seo_agent_runs (id,"siteId",agent,trigger,status,"triggeredBy","startedAt","finishedAt","outputSummary") VALUES ($1,$2,'TECHNICAL',$3::"SeoTrigger",'SUCCEEDED',$4,now(),now(),$5)`,
          [agentRunId, siteId, opts.triggeredBy === 'system:cron' ? 'SCHEDULE' : 'MANUAL', opts.triggeredBy, JSON.stringify({ crawlRunId: runId, pages: out.pages.length, score: out.score })],
        )
        await buildRecommendations(c, siteId, agentRunId)
      }
      await audit(c, siteId, opts.triggeredBy, 'crawl.completed', 'seo_crawl_runs', runId, { status, pages: out.pages.length, score: out.score, newIssues, resolved }, 'SYSTEM')
      return { runId, siteId, status, pagesFetched: fetchedOk, healthScore: status === 'FAILED' ? null : out.score, issueCount: issues.length, newIssues, resolvedIssues: resolved, truncated: out.truncated }
    })
  } catch (e) {
    const msg = (e instanceof Error ? e.message : String(e)).slice(0, 500)
    await seoQuery(`UPDATE seo_crawl_runs SET status='FAILED', error=$2, "finishedAt"=now() WHERE id=$1 AND status='RUNNING'`, [runId, msg]).catch(() => undefined)
    return { runId, siteId, status: 'FAILED', pagesFetched: 0, healthScore: null, issueCount: 0, newIssues: 0, resolvedIssues: 0, truncated: false, error: msg }
  }
}
