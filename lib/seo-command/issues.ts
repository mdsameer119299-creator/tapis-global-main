import { createHash } from 'crypto'
import type { DataQuality, Issue, PageResult, Severity } from './types'

function fp(code: string, url: string | null, extra = ''): string {
  return createHash('sha1').update(`${code}|${url ?? ''}|${extra}`).digest('hex').slice(0, 24)
}

function mk(code: string, severity: Severity, url: string | null, detail: Record<string, unknown> = {}, dq: DataQuality = 'VERIFIED', extra = ''): Issue {
  return { code, severity, url, detail, dataQuality: dq, fingerprint: fp(code, url, extra) }
}

const TITLE_MIN = 20
const TITLE_MAX = 60
const DESC_MIN = 70
const DESC_MAX = 160
const SLOW_MS = 2500

function stripSlash(u: string): string {
  try {
    const x = new URL(u)
    if (x.pathname.length > 1 && x.pathname.endsWith('/')) x.pathname = x.pathname.slice(0, -1)
    x.hash = ''
    return x.toString()
  } catch {
    return u
  }
}

/** Pure function: derives every page-level issue from crawl results. Crawl-level (robots/sitemap) issues are added by the caller. */
export function detectIssues(pages: PageResult[]): Issue[] {
  const out: Issue[] = []
  const titles = new Map<string, string[]>()
  const descs = new Map<string, string[]>()
  const hashes = new Map<string, string[]>()
  const byUrl = new Map(pages.map((p) => [p.url, p]))

  for (const p of pages) {
    if (p.error || p.statusCode === null) {
      out.push(mk('FETCH_ERROR', 'HIGH', p.url, { error: p.error ?? 'no response', linkedFrom: p.linkedFrom.slice(0, 5) }))
      continue
    }
    if (p.statusCode >= 500) out.push(mk('HTTP_5XX', 'CRITICAL', p.url, { status: p.statusCode, linkedFrom: p.linkedFrom.slice(0, 5) }))
    else if (p.statusCode >= 400) {
      out.push(mk(p.statusCode === 404 || p.statusCode === 410 ? 'BROKEN_LINK' : 'HTTP_4XX', p.inSitemap ? 'CRITICAL' : 'HIGH', p.url, { status: p.statusCode, inSitemap: p.inSitemap, linkedFrom: p.linkedFrom.slice(0, 5) }))
    }

    if (p.redirectChain.length > 0) {
      out.push(mk('REDIRECT', p.inSitemap ? 'MEDIUM' : 'LOW', p.url, { hops: p.redirectChain.length, finalUrl: p.finalUrl, chain: p.redirectChain }))
      if (p.redirectChain.length > 2) out.push(mk('REDIRECT_CHAIN', 'MEDIUM', p.url, { hops: p.redirectChain.length, chain: p.redirectChain }))
      const loop = new Set(p.redirectChain.map((h) => h.url)).size !== p.redirectChain.length
      if (loop) out.push(mk('REDIRECT_LOOP', 'HIGH', p.url, { chain: p.redirectChain }))
    }

    if (p.responseMs !== null && p.responseMs > SLOW_MS) {
      out.push(mk('SLOW_RESPONSE', 'LOW', p.url, { responseMs: p.responseMs, thresholdMs: SLOW_MS }, 'VERIFIED'))
    }
    if (p.url.startsWith('https://') === false && p.url.startsWith('http://')) out.push(mk('NOT_HTTPS', 'MEDIUM', p.url))

    if (p.inSitemap && p.disallowedByRobots) out.push(mk('SITEMAP_URL_BLOCKED_BY_ROBOTS', 'HIGH', p.url))

    const f = p.facts
    if (!f || p.statusCode !== 200) continue
    const robots = (f.robotsMeta ?? '').toLowerCase()
    const noindex = /noindex/.test(robots)
    if (noindex) out.push(mk('NOINDEX', p.inSitemap ? 'HIGH' : 'INFO', p.url, { robotsMeta: f.robotsMeta, inSitemap: p.inSitemap }))
    if (noindex) continue // metadata quality checks are irrelevant for deliberately unindexed pages

    // Titles
    if (!f.title) out.push(mk('MISSING_TITLE', 'HIGH', p.url))
    else {
      if (f.title.length < TITLE_MIN) out.push(mk('TITLE_TOO_SHORT', 'LOW', p.url, { length: f.title.length, title: f.title }))
      if (f.title.length > TITLE_MAX) out.push(mk('TITLE_TOO_LONG', 'LOW', p.url, { length: f.title.length, title: f.title }))
      titles.set(f.title.toLowerCase(), [...(titles.get(f.title.toLowerCase()) ?? []), p.url])
    }
    // Descriptions
    if (!f.metaDescription) out.push(mk('MISSING_META_DESCRIPTION', 'MEDIUM', p.url))
    else {
      if (f.metaDescription.length < DESC_MIN) out.push(mk('META_DESCRIPTION_TOO_SHORT', 'LOW', p.url, { length: f.metaDescription.length }))
      if (f.metaDescription.length > DESC_MAX) out.push(mk('META_DESCRIPTION_TOO_LONG', 'LOW', p.url, { length: f.metaDescription.length }))
      descs.set(f.metaDescription.toLowerCase(), [...(descs.get(f.metaDescription.toLowerCase()) ?? []), p.url])
    }
    // Headings
    if (f.h1s.length === 0) out.push(mk('MISSING_H1', 'MEDIUM', p.url))
    if (f.h1s.length > 1) out.push(mk('MULTIPLE_H1', 'LOW', p.url, { count: f.h1s.length }))
    // Images
    if (f.imagesMissingAlt > 0) out.push(mk('IMAGES_MISSING_ALT', 'MEDIUM', p.url, { missing: f.imagesMissingAlt, total: f.imageCount }))
    // Canonical
    if (!f.canonical) out.push(mk('MISSING_CANONICAL', 'MEDIUM', p.url))
    else {
      const self = stripSlash(f.canonical) === stripSlash(p.finalUrl)
      if (!self) {
        const target = byUrl.get(f.canonical) ?? byUrl.get(stripSlash(f.canonical))
        out.push(mk('CANONICAL_NOT_SELF', 'MEDIUM', p.url, { canonical: f.canonical }))
        if (target && target.statusCode !== null && target.statusCode >= 300) {
          out.push(mk('CANONICAL_TARGET_BAD_STATUS', 'HIGH', p.url, { canonical: f.canonical, status: target.statusCode }))
        }
      }
    }
    if (!f.hasViewport) out.push(mk('MISSING_VIEWPORT', 'MEDIUM', p.url))
    if (!f.lang) out.push(mk('MISSING_LANG', 'LOW', p.url))
    if (!f.ogTitle || !f.ogImage) out.push(mk('MISSING_OPEN_GRAPH', 'LOW', p.url, { ogTitle: !!f.ogTitle, ogImage: !!f.ogImage }))
    if (f.jsonLdTypes.includes('INVALID_JSON')) out.push(mk('INVALID_STRUCTURED_DATA', 'MEDIUM', p.url))
    if (f.wordCount < 150) out.push(mk('THIN_CONTENT', 'LOW', p.url, { wordCount: f.wordCount }, 'DERIVED'))
    hashes.set(f.textHash, [...(hashes.get(f.textHash) ?? []), p.url])

    if (p.url.startsWith('https://') && f.internalLinks.some((l) => l.startsWith('http://'))) {
      out.push(mk('MIXED_INTERNAL_HTTP_LINKS', 'LOW', p.url, { count: f.internalLinks.filter((l) => l.startsWith('http://')).length }))
    }
    if (f.internalLinks.length === 0 && p.linkedFrom.length >= 0) out.push(mk('NO_INTERNAL_LINKS', 'LOW', p.url))
  }

  const group = (map: Map<string, string[]>, code: string, sev: Severity, dq: DataQuality) => {
    for (const [key, urls] of Array.from(map.entries())) {
      const uniq = Array.from(new Set(urls))
      if (uniq.length < 2) continue
      for (const u of uniq) out.push(mk(code, sev, u, { sharedWith: uniq.filter((x) => x !== u).slice(0, 10), groupSize: uniq.length }, dq, key.slice(0, 80)))
    }
  }
  group(titles, 'DUPLICATE_TITLE', 'MEDIUM', 'VERIFIED')
  group(descs, 'DUPLICATE_META_DESCRIPTION', 'LOW', 'VERIFIED')
  group(hashes, 'DUPLICATE_CONTENT', 'MEDIUM', 'DERIVED')

  // Orphans: crawlable sitemap pages that no crawled page links to.
  for (const p of pages) {
    if (p.inSitemap && p.statusCode === 200 && p.linkedFrom.length === 0) out.push(mk('ORPHAN_PAGE', 'MEDIUM', p.url, {}, 'DERIVED'))
  }
  return out
}

const WEIGHT: Record<Severity, number> = { CRITICAL: 10, HIGH: 5, MEDIUM: 2, LOW: 0.5, INFO: 0 }

/** Health score 0-100: starts at 100, subtracts severity-weighted issue density per page, capped per severity. Deterministic and explainable. */
export function healthScore(issues: Issue[], pageCount: number): { score: number; breakdown: Record<Severity, number> } {
  const counts: Record<Severity, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 }
  for (const i of issues) counts[i.severity]++
  if (pageCount <= 0) return { score: 0, breakdown: counts }
  let penalty = 0
  for (const sev of ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as Severity[]) {
    const density = (counts[sev] * WEIGHT[sev]) / pageCount
    penalty += Math.min(density * 10, sev === 'CRITICAL' ? 40 : sev === 'HIGH' ? 30 : sev === 'MEDIUM' ? 20 : 10)
  }
  return { score: Math.max(0, Math.round(100 - penalty)), breakdown: counts }
}
