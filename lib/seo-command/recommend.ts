import { randomUUID } from 'crypto'
import type { PoolClient } from 'pg'

type Tier = 'ROUTINE' | 'HIGH_IMPACT'

interface Rule {
  title: string
  rationale: string
  tier: Tier
  impact: string
}

// Codes whose fix changes crawling/indexing behaviour or URLs are HIGH_IMPACT; copy-level metadata fixes are ROUTINE.
const RULES: Record<string, Rule> = {
  MISSING_TITLE: { title: 'Add missing page titles', rationale: 'Pages without a <title> lose their main ranking and click-through signal.', tier: 'ROUTINE', impact: 'Better snippets and relevance' },
  TITLE_TOO_SHORT: { title: 'Lengthen very short titles', rationale: 'Short titles waste space to describe the page and target keywords.', tier: 'ROUTINE', impact: 'Minor CTR gains' },
  TITLE_TOO_LONG: { title: 'Shorten over-long titles', rationale: 'Titles beyond ~60 characters are commonly truncated in results.', tier: 'ROUTINE', impact: 'Cleaner snippets' },
  DUPLICATE_TITLE: { title: 'Make duplicated titles unique', rationale: 'Identical titles make pages compete and blur which page should rank.', tier: 'ROUTINE', impact: 'Clearer page targeting' },
  MISSING_META_DESCRIPTION: { title: 'Write missing meta descriptions', rationale: 'Search engines fall back to arbitrary text when no description exists.', tier: 'ROUTINE', impact: 'CTR improvement' },
  META_DESCRIPTION_TOO_SHORT: { title: 'Expand very short meta descriptions', rationale: 'Short descriptions leave snippet space unused.', tier: 'ROUTINE', impact: 'Minor CTR gains' },
  META_DESCRIPTION_TOO_LONG: { title: 'Trim over-long meta descriptions', rationale: 'Descriptions beyond ~160 characters are truncated.', tier: 'ROUTINE', impact: 'Cleaner snippets' },
  DUPLICATE_META_DESCRIPTION: { title: 'Make duplicated meta descriptions unique', rationale: 'Repeated descriptions add no page-specific information.', tier: 'ROUTINE', impact: 'Clearer snippets' },
  MISSING_H1: { title: 'Add a single H1 to pages without one', rationale: 'The H1 states the page topic to users and crawlers.', tier: 'ROUTINE', impact: 'Topical clarity' },
  MULTIPLE_H1: { title: 'Reduce pages with several H1 headings', rationale: 'Several H1s dilute the page topic signal.', tier: 'ROUTINE', impact: 'Minor' },
  IMAGES_MISSING_ALT: { title: 'Add alt text to images', rationale: 'Alt text drives image search visibility and accessibility.', tier: 'ROUTINE', impact: 'Image search + accessibility' },
  THIN_CONTENT: { title: 'Expand thin pages', rationale: 'Pages under ~150 words rarely satisfy search intent on their own.', tier: 'ROUTINE', impact: 'Depth and relevance' },
  MISSING_OPEN_GRAPH: { title: 'Add Open Graph title and image', rationale: 'Missing OG tags produce poor link previews when shared.', tier: 'ROUTINE', impact: 'Social CTR' },
  MISSING_LANG: { title: 'Declare the page language', rationale: 'The lang attribute helps language targeting and accessibility.', tier: 'ROUTINE', impact: 'Minor' },
  MISSING_VIEWPORT: { title: 'Add a viewport meta tag', rationale: 'Without it, pages are not treated as mobile friendly.', tier: 'HIGH_IMPACT', impact: 'Mobile usability' },
  INVALID_STRUCTURED_DATA: { title: 'Fix invalid JSON-LD', rationale: 'Invalid structured data is ignored and forfeits rich results.', tier: 'ROUTINE', impact: 'Rich result eligibility' },
  MISSING_CANONICAL: { title: 'Add canonical tags', rationale: 'Canonicals consolidate duplicate URLs onto the preferred version.', tier: 'HIGH_IMPACT', impact: 'Duplicate consolidation' },
  CANONICAL_NOT_SELF: { title: 'Review canonicals pointing to other URLs', rationale: 'A page that canonicalises elsewhere asks Google not to index it.', tier: 'HIGH_IMPACT', impact: 'Index coverage' },
  CANONICAL_TARGET_BAD_STATUS: { title: 'Fix canonicals that point to non-200 pages', rationale: 'Canonicals to redirected or broken URLs are ignored.', tier: 'HIGH_IMPACT', impact: 'Index coverage' },
  BROKEN_LINK: { title: 'Fix or redirect broken URLs', rationale: '404 pages that are linked or in the sitemap waste crawl budget and frustrate users.', tier: 'HIGH_IMPACT', impact: 'Crawl efficiency + UX' },
  HTTP_4XX: { title: 'Resolve client-error responses', rationale: 'Linked pages that return 4xx cannot be indexed.', tier: 'HIGH_IMPACT', impact: 'Index coverage' },
  HTTP_5XX: { title: 'Resolve server errors', rationale: 'Server errors block indexing and can reduce crawl rate.', tier: 'HIGH_IMPACT', impact: 'Availability + indexing' },
  FETCH_ERROR: { title: 'Investigate unreachable URLs', rationale: 'URLs that fail to load (timeouts, loops, DNS) cannot be crawled.', tier: 'HIGH_IMPACT', impact: 'Availability' },
  REDIRECT: { title: 'Link directly to final URLs instead of redirects', rationale: 'Redirecting internal links and sitemap entries waste crawl budget.', tier: 'ROUTINE', impact: 'Crawl efficiency' },
  REDIRECT_CHAIN: { title: 'Collapse redirect chains', rationale: 'Chains of 3+ hops slow users and dilute signals.', tier: 'HIGH_IMPACT', impact: 'Speed + crawl efficiency' },
  REDIRECT_LOOP: { title: 'Break redirect loops', rationale: 'Loops make pages permanently unreachable.', tier: 'HIGH_IMPACT', impact: 'Availability' },
  SLOW_RESPONSE: { title: 'Investigate slow server responses', rationale: 'Slow responses hurt Core Web Vitals and crawl rate.', tier: 'HIGH_IMPACT', impact: 'Speed' },
  NOINDEX: { title: 'Review pages marked noindex', rationale: 'Noindex pages listed in the sitemap send contradictory signals.', tier: 'HIGH_IMPACT', impact: 'Index coverage' },
  SITEMAP_URL_BLOCKED_BY_ROBOTS: { title: 'Unblock sitemap URLs disallowed by robots.txt', rationale: 'Listing URLs in the sitemap that robots.txt blocks is contradictory.', tier: 'HIGH_IMPACT', impact: 'Index coverage' },
  ORPHAN_PAGE: { title: 'Add internal links to orphan pages', rationale: 'Pages reachable only via the sitemap receive weak internal authority.', tier: 'ROUTINE', impact: 'Discovery + authority' },
  DUPLICATE_CONTENT: { title: 'Differentiate or consolidate duplicate content', rationale: 'Pages with identical body text compete with one another.', tier: 'HIGH_IMPACT', impact: 'Index coverage' },
  MIXED_INTERNAL_HTTP_LINKS: { title: 'Update internal links to HTTPS', rationale: 'Internal http:// links force avoidable redirects.', tier: 'ROUTINE', impact: 'Minor' },
  NOT_HTTPS: { title: 'Serve pages over HTTPS', rationale: 'HTTPS is a baseline trust and ranking requirement.', tier: 'HIGH_IMPACT', impact: 'Trust + ranking' },
  ROBOTS_MISSING: { title: 'Add a robots.txt with a Sitemap directive', rationale: 'A robots.txt lets you declare your sitemap and crawl rules.', tier: 'HIGH_IMPACT', impact: 'Discovery' },
  ROBOTS_NO_SITEMAP: { title: 'Declare the sitemap in robots.txt', rationale: 'A Sitemap: line helps all crawlers find your URLs.', tier: 'ROUTINE', impact: 'Discovery' },
  ROBOTS_DISALLOWS_ALL: { title: 'Remove "Disallow: /" from robots.txt', rationale: 'This blocks all crawling of the site.', tier: 'HIGH_IMPACT', impact: 'Critical: site invisible' },
  ROBOTS_SERVER_ERROR: { title: 'Fix robots.txt server error', rationale: 'A 5xx on robots.txt can cause crawlers to stop crawling.', tier: 'HIGH_IMPACT', impact: 'Critical: crawling halted' },
  SITEMAP_UNREACHABLE: { title: 'Make the sitemap reachable', rationale: 'Search engines cannot use a sitemap they cannot fetch.', tier: 'HIGH_IMPACT', impact: 'Discovery' },
  SITEMAP_INVALID_XML: { title: 'Fix invalid sitemap XML', rationale: 'Invalid sitemaps are ignored.', tier: 'HIGH_IMPACT', impact: 'Discovery' },
  SITEMAP_EMPTY: { title: 'Populate the sitemap', rationale: 'An empty sitemap provides no discovery value.', tier: 'HIGH_IMPACT', impact: 'Discovery' },
  SITEMAP_WRONG_HOST: { title: 'Remove other-host URLs from the sitemap', rationale: 'Sitemaps may only list URLs on their own host.', tier: 'HIGH_IMPACT', impact: 'Index coverage' },
}

const SEV_WEIGHT: Record<string, number> = { CRITICAL: 40, HIGH: 25, MEDIUM: 12, LOW: 4 }

/** Turns open technical issues into at most one PROPOSED recommendation per issue code. Idempotent: re-runs refresh evidence/priority of
 * still-PROPOSED items, never touch decided ones, and supersede PROPOSED items whose issues are all gone. Never applies anything. */
export async function buildRecommendations(c: PoolClient, siteId: string, runId: string): Promise<{ upserted: number; superseded: number }> {
  const groups = await c.query<{ code: string; severity: string; n: string; examples: string[] }>(
    `SELECT code, (array_agg(severity ORDER BY CASE severity WHEN 'CRITICAL' THEN 0 WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END))[1]::text AS severity,
            count(*)::text AS n, (array_agg(url) FILTER (WHERE url IS NOT NULL))[1:8] AS examples
     FROM seo_technical_issues WHERE "siteId"=$1 AND status='OPEN' AND severity <> 'INFO' GROUP BY code`,
    [siteId],
  )
  const live = new Set<string>()
  let upserted = 0
  for (const g of groups.rows) {
    const rule = RULES[g.code]
    if (!rule) continue
    const n = Number(g.n)
    live.add(`issue:${g.code}`)
    const priority = Math.min(100, (SEV_WEIGHT[g.severity] ?? 4) + Math.min(30, Math.round(Math.log2(n + 1) * 8)))
    const r = await c.query(
      `INSERT INTO seo_recommendations (id,"siteId","runId",agent,"changeType","riskTier",title,rationale,"targetUrl","proposedChange",evidence,"dataQuality","priorityScore","expectedImpact","dedupeKey","updatedAt")
       VALUES ($1,$2,$3,'TECHNICAL',$4,$5::"SeoRiskTier",$6,$7,$8,NULL,$9,'VERIFIED',$10,$11,$12,now())
       ON CONFLICT ("siteId","dedupeKey") DO UPDATE SET
         "runId"=EXCLUDED."runId", evidence=EXCLUDED.evidence, "priorityScore"=EXCLUDED."priorityScore", "updatedAt"=now(),
         status = CASE WHEN seo_recommendations.status = 'SUPERSEDED' THEN 'PROPOSED'::"SeoRecStatus" ELSE seo_recommendations.status END
       WHERE seo_recommendations.status IN ('PROPOSED','SUPERSEDED')`,
      [randomUUID(), siteId, runId, `FIX_${g.code}`, rule.tier, rule.title, rule.rationale, g.examples?.[0] ?? null, JSON.stringify({ code: g.code, severity: g.severity, affectedCount: n, exampleUrls: g.examples ?? [], source: 'technical crawl' }), priority, rule.impact, `issue:${g.code}`],
    )
    upserted += r.rowCount ?? 0
  }
  const sup = await c.query(
    `UPDATE seo_recommendations SET status='SUPERSEDED', "updatedAt"=now()
     WHERE "siteId"=$1 AND status='PROPOSED' AND "dedupeKey" LIKE 'issue:%' AND NOT ("dedupeKey" = ANY($2::text[]))`,
    [siteId, Array.from(live)],
  )
  return { upserted, superseded: sup.rowCount ?? 0 }
}

export const RECOMMENDATION_RULE_CODES = Object.keys(RULES)
