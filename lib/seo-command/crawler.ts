import { extractPageFacts, isCrawlableHref, normaliseUrl, sameSite } from './html-audit'
import { isPathAllowed, parseRobots, validateRobots, type ParsedRobots } from './robots-txt'
import { parseSitemap, validateSitemapEntries } from './sitemap-xml'
import { detectIssues, healthScore } from './issues'
import type { Issue, PageResult, Severity } from './types'

export const CRAWLER_UA = 'TapisSEOBot/1.0 (+site-owner audit; read-only)'

export interface CrawlOptions {
  origin: string // e.g. https://www.tapisglobalinternational.com
  maxPages?: number
  concurrency?: number
  timeoutMs?: number
  maxRedirects?: number
  fetchImpl?: typeof fetch
  now?: () => number
  /** Permit non-https / private hosts (tests only). */
  allowInsecureOrigin?: boolean
}

export interface CrawlOutput {
  startedAt: Date
  finishedAt: Date
  origin: string
  robots: { status: number | null; found: boolean; sitemaps: string[] }
  sitemapUrls: string[]
  pages: PageResult[]
  issues: Issue[]
  score: number
  severityCounts: Record<Severity, number>
  truncated: boolean
}

async function fetchWithTimeout(f: typeof fetch, url: string, timeoutMs: number, init: RequestInit = {}): Promise<Response> {
  const ctl = new AbortController()
  const t = setTimeout(() => ctl.abort(), timeoutMs)
  try {
    return await f(url, { ...init, signal: ctl.signal, redirect: 'manual', headers: { 'user-agent': CRAWLER_UA, accept: 'text/html,application/xml;q=0.9,*/*;q=0.5', ...(init.headers ?? {}) } })
  } finally {
    clearTimeout(t)
  }
}

interface Fetched {
  finalUrl: string
  status: number | null
  chain: { url: string; status: number }[]
  ms: number | null
  contentType: string | null
  body: string | null
  error: string | null
}

async function fetchFollow(f: typeof fetch, url: string, o: Required<Pick<CrawlOptions, 'timeoutMs' | 'maxRedirects'>>, now: () => number, wantBody: boolean): Promise<Fetched> {
  const chain: { url: string; status: number }[] = []
  let current = url
  const t0 = now()
  try {
    for (let hop = 0; hop <= o.maxRedirects; hop++) {
      const res = await fetchWithTimeout(f, current, o.timeoutMs)
      if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
        chain.push({ url: current, status: res.status })
        await res.body?.cancel().catch(() => undefined)
        const next = normaliseUrl(res.headers.get('location')!, current)
        if (!next) return { finalUrl: current, status: res.status, chain, ms: now() - t0, contentType: null, body: null, error: 'invalid redirect target' }
        if (chain.some((c) => c.url === next)) {
          chain.push({ url: next, status: res.status })
          return { finalUrl: next, status: res.status, chain, ms: now() - t0, contentType: null, body: null, error: 'redirect loop' }
        }
        current = next
        continue
      }
      const ct = res.headers.get('content-type')
      const ms = now() - t0
      let body: string | null = null
      if (wantBody && (ct === null || /html|xml|text\/plain/i.test(ct))) {
        const buf = await res.text()
        body = buf.length > 2_000_000 ? buf.slice(0, 2_000_000) : buf
      } else {
        await res.body?.cancel().catch(() => undefined)
      }
      return { finalUrl: current, status: res.status, chain, ms, contentType: ct, body, error: null }
    }
    return { finalUrl: current, status: null, chain, ms: now() - t0, contentType: null, body: null, error: `too many redirects (>${o.maxRedirects})` }
  } catch (e) {
    const msg = e instanceof Error ? (e.name === 'AbortError' ? `timeout after ${o.timeoutMs}ms` : e.message) : String(e)
    return { finalUrl: current, status: null, chain, ms: null, contentType: null, body: null, error: msg }
  }
}

async function loadSitemaps(f: typeof fetch, seeds: string[], origin: string, o: Required<Pick<CrawlOptions, 'timeoutMs' | 'maxRedirects'>>, now: () => number, issues: Issue[]): Promise<string[]> {
  const urls = new Set<string>()
  const queue = [...seeds]
  const seen = new Set<string>()
  let n = 0
  while (queue.length && n < 25) {
    const sm = queue.shift()!
    if (seen.has(sm)) continue
    seen.add(sm)
    n++
    const r = await fetchFollow(f, sm, o, now, true)
    const mkIssue = (code: string, severity: Severity, detail: Record<string, unknown>) => issues.push({ code, severity, url: sm, detail, dataQuality: 'VERIFIED', fingerprint: `${code}|${sm}` })
    if (r.status !== 200 || !r.body) {
      mkIssue('SITEMAP_UNREACHABLE', 'HIGH', { status: r.status, error: r.error })
      continue
    }
    const parsed = parseSitemap(r.body)
    if (parsed.kind === 'invalid') {
      mkIssue('SITEMAP_INVALID_XML', 'HIGH', {})
      continue
    }
    if (parsed.kind === 'index') {
      for (const e of parsed.entries) queue.push(e.loc)
      continue
    }
    for (const fnd of validateSitemapEntries(parsed.entries, origin, sm)) {
      issues.push({ code: fnd.code, severity: fnd.severity, url: sm, detail: { message: fnd.message, ...(fnd.detail ?? {}) }, dataQuality: 'VERIFIED', fingerprint: `${fnd.code}|${sm}` })
    }
    for (const e of parsed.entries) {
      const u = normaliseUrl(e.loc)
      if (u) urls.add(u)
    }
  }
  return Array.from(urls)
}

export async function crawlSite(opts: CrawlOptions): Promise<CrawlOutput> {
  const f = opts.fetchImpl ?? fetch
  const now = opts.now ?? (() => Date.now())
  const maxPages = Math.min(opts.maxPages ?? 150, 1000)
  const conc = Math.min(opts.concurrency ?? 4, 8)
  const o = { timeoutMs: opts.timeoutMs ?? 12000, maxRedirects: opts.maxRedirects ?? 6 }
  const startedAt = new Date()

  const originUrl = normaliseUrl(opts.origin)
  if (!originUrl) throw new Error('Invalid origin')
  const origin = new URL(originUrl).origin
  if (!opts.allowInsecureOrigin && !origin.startsWith('https://')) throw new Error('Crawler origin must be https')

  const crawlIssues: Issue[] = []

  // robots.txt
  const robotsRes = await fetchFollow(f, `${origin}/robots.txt`, o, now, true)
  const robotsText = robotsRes.status === 200 ? robotsRes.body : null
  const parsedRobots: ParsedRobots = robotsText ? parseRobots(robotsText) : { groups: [], sitemaps: [] }
  for (const fnd of validateRobots(robotsRes.status, robotsText, origin)) {
    crawlIssues.push({ code: fnd.code, severity: fnd.severity, url: `${origin}/robots.txt`, detail: { message: fnd.message, ...(fnd.detail ?? {}) }, dataQuality: 'VERIFIED', fingerprint: `${fnd.code}|robots` })
  }

  // sitemaps (declared, falling back to /sitemap.xml)
  const sitemapSeeds = parsedRobots.sitemaps.length ? parsedRobots.sitemaps : [`${origin}/sitemap.xml`]
  const sitemapUrls = await loadSitemaps(f, sitemapSeeds, origin, o, now, crawlIssues)
  const inSitemap = new Set(sitemapUrls)

  // BFS crawl
  const results = new Map<string, PageResult>()
  const linkedFrom = new Map<string, Set<string>>()
  const queue: string[] = []
  const queued = new Set<string>()
  const enqueue = (u: string) => {
    if (queued.has(u) || !sameSite(u, origin) || !isCrawlableHref(u)) return
    queued.add(u)
    queue.push(u)
  }
  enqueue(normaliseUrl(origin + '/') ?? origin)
  for (const u of sitemapUrls) enqueue(u)
  let truncated = false

  const allowedByRobots = (u: string) => {
    try {
      const x = new URL(u)
      return isPathAllowed(parsedRobots, CRAWLER_UA, x.pathname + x.search)
    } catch {
      return true
    }
  }

  let active = 0
  await new Promise<void>((resolve) => {
    const pump = () => {
      while (active < conc && queue.length && results.size + active < maxPages) {
        const url = queue.shift()!
        active++
        void crawlOne(url).finally(() => {
          active--
          pump()
        })
      }
      if (queue.length && results.size + active >= maxPages && active === 0) truncated = true
      if (active === 0 && (queue.length === 0 || results.size >= maxPages)) resolve()
    }
    const crawlOne = async (url: string) => {
      const disallowed = !allowedByRobots(url)
      // Robots-disallowed URLs are recorded but never fetched.
      if (disallowed) {
        results.set(url, { url, finalUrl: url, statusCode: null, redirectChain: [], responseMs: null, contentType: null, facts: null, inSitemap: inSitemap.has(url), disallowedByRobots: true, error: 'blocked by robots.txt (not fetched)', linkedFrom: [] })
        return
      }
      const r = await fetchFollow(f, url, o, now, true)
      let facts = null
      if (r.status === 200 && r.body && /html/i.test(r.contentType ?? 'text/html')) {
        facts = extractPageFacts(r.body, r.finalUrl)
        for (const l of facts.internalLinks) {
          let s = linkedFrom.get(l)
          if (!s) linkedFrom.set(l, (s = new Set()))
          s.add(url)
          enqueue(l)
        }
      }
      results.set(url, { url, finalUrl: r.finalUrl, statusCode: r.status, redirectChain: r.chain, responseMs: r.ms, contentType: r.contentType, facts, inSitemap: inSitemap.has(url), disallowedByRobots: false, error: r.error, linkedFrom: [] })
    }
    pump()
  })
  if (queue.length > 0) truncated = true

  const pages = Array.from(results.values()).map((p) => ({ ...p, linkedFrom: Array.from(linkedFrom.get(p.url) ?? []).filter((x) => x !== p.url).slice(0, 25) }))
  // Robots-blocked pages are never fetched, so they get no page-level audit; a blocked URL that the sitemap lists is a real problem.
  const fetched = pages.filter((p) => !p.disallowedByRobots)
  const blockedInSitemap: Issue[] = pages
    .filter((p) => p.disallowedByRobots && p.inSitemap)
    .map((p) => ({ code: 'SITEMAP_URL_BLOCKED_BY_ROBOTS', severity: 'HIGH' as Severity, url: p.url, detail: {}, dataQuality: 'VERIFIED' as const, fingerprint: `SITEMAP_URL_BLOCKED_BY_ROBOTS|${p.url}` }))
  const issues = [...crawlIssues, ...blockedInSitemap, ...detectIssues(fetched)]
  const { score, breakdown } = healthScore(issues, fetched.length)
  return { startedAt, finishedAt: new Date(), origin, robots: { status: robotsRes.status, found: robotsRes.status === 200, sitemaps: parsedRobots.sitemaps }, sitemapUrls, pages, issues, score, severityCounts: breakdown, truncated }
}
