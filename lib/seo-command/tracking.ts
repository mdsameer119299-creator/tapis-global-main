import { randomUUID } from 'crypto'
import { lookup } from 'dns/promises'
import { isIP } from 'net'
import { withSeoTx, seoQuery } from './db'
import { audit } from './store'
import { extractPageFacts } from './html-audit'
import { parseSitemap } from './sitemap-xml'
import { CRAWLER_UA } from './crawler'

// ---------- keywords ----------
export function cleanKeyword(raw: string): string {
  return raw.normalize('NFKC').replace(/\s+/g, ' ').trim().toLowerCase().slice(0, 120)
}

export async function addKeywords(siteId: string, actor: string, keywords: string[], opts: { country?: string; targetUrl?: string | null } = {}) {
  const list = Array.from(new Set(keywords.map(cleanKeyword).filter((k) => k.length >= 2))).slice(0, 100)
  if (!list.length) return { added: 0 }
  const country = (opts.country ?? 'ALL').toUpperCase().slice(0, 3) || 'ALL'
  const target = opts.targetUrl ? opts.targetUrl.slice(0, 500) : null
  return withSeoTx(async (c) => {
    let added = 0
    for (const k of list) {
      const r = await c.query(`INSERT INTO seo_keywords (id,"siteId",keyword,"targetUrl",country,"updatedAt") VALUES ($1,$2,$3,$4,$5,now()) ON CONFLICT ("siteId",keyword,country) DO NOTHING`, [randomUUID(), siteId, k, target, country])
      added += r.rowCount ?? 0
    }
    await audit(c, siteId, actor, 'keywords.added', 'seo_keywords', null, { count: added })
    return { added }
  })
}

export async function removeKeyword(siteId: string, id: string, actor: string) {
  return withSeoTx(async (c) => {
    const r = await c.query(`DELETE FROM seo_keywords WHERE id=$1 AND "siteId"=$2`, [id, siteId])
    if (r.rowCount) await audit(c, siteId, actor, 'keyword.removed', 'seo_keywords', id, null)
    return { removed: r.rowCount ?? 0 }
  })
}

// ---------- competitors ----------
export class CompetitorError extends Error {}

const PRIVATE_V4 = [/^10\./, /^127\./, /^169\.254\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./, /^0\./, /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, /^192\.0\.0\./, /^198\.1[89]\./, /^2(2[4-9]|[3-5]\d)\./]
export function isPrivateAddress(ip: string): boolean {
  if (isIP(ip) === 4) return PRIVATE_V4.some((r) => r.test(ip))
  const l = ip.toLowerCase()
  if (l === '::1' || l === '::' || l.startsWith('fc') || l.startsWith('fd') || l.startsWith('fe80')) return true
  const m = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(l)
  return m ? isPrivateAddress(m[1]) : false
}

export function normaliseCompetitorDomain(raw: string): string {
  let d = raw.trim().toLowerCase()
  d = d.replace(/^https?:\/\//, '').split(/[/?#]/)[0].replace(/:\d+$/, '').replace(/^www\./, '')
  if (!/^(?=.{4,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(d)) throw new CompetitorError('Enter a valid public domain, e.g. example.com')
  if (/\.(local|internal|localhost|lan|home|corp)$/.test(d)) throw new CompetitorError('Internal hostnames are not allowed')
  return d
}

type Resolver = (host: string) => Promise<string[]>
const defaultResolver: Resolver = async (h) => (await lookup(h, { all: true })).map((a) => a.address)

/** SSRF guard: every hop's host must resolve only to public addresses. */
export async function assertPublicHost(host: string, resolve: Resolver = defaultResolver): Promise<void> {
  if (isIP(host)) throw new CompetitorError('IP addresses are not allowed')
  let addrs: string[]
  try {
    addrs = await resolve(host)
  } catch {
    throw new CompetitorError('Domain does not resolve')
  }
  if (!addrs.length || addrs.some(isPrivateAddress)) throw new CompetitorError('Domain resolves to a non-public address')
}

export async function addCompetitor(siteId: string, actor: string, domainRaw: string, label?: string | null, resolve?: Resolver) {
  const domain = normaliseCompetitorDomain(domainRaw)
  await assertPublicHost(domain, resolve)
  return withSeoTx(async (c) => {
    const r = await c.query(`INSERT INTO seo_competitors (id,"siteId",domain,label) VALUES ($1,$2,$3,$4) ON CONFLICT ("siteId",domain) DO NOTHING RETURNING id`, [randomUUID(), siteId, domain, label?.trim().slice(0, 80) || null])
    if (r.rowCount) await audit(c, siteId, actor, 'competitor.added', 'seo_competitors', r.rows[0].id, { domain })
    return { id: (r.rows[0]?.id as string | undefined) ?? null, domain, created: !!r.rowCount }
  })
}

export async function removeCompetitor(siteId: string, id: string, actor: string) {
  return withSeoTx(async (c) => {
    const r = await c.query(`DELETE FROM seo_competitors WHERE id=$1 AND "siteId"=$2`, [id, siteId])
    if (r.rowCount) await audit(c, siteId, actor, 'competitor.removed', 'seo_competitors', id, null)
    return { removed: r.rowCount ?? 0 }
  })
}

export interface CompetitorSnapshotData {
  httpStatus: number | null
  responseMs: number | null
  title: string | null
  metaDescription: string | null
  h1: string | null
  wordCount: number | null
  jsonLdTypes: string[]
  hasHreflang: boolean
  sitemapUrlCount: number | null
  robotsFound: boolean
  error: string | null
}

async function safeGet(f: typeof fetch, url: string, timeoutMs: number, resolve?: Resolver, maxText = 1_500_000): Promise<{ status: number; text: string; ms: number; finalUrl: string }> {
  let current = url
  const t0 = Date.now()
  for (let hop = 0; hop < 5; hop++) {
    await assertPublicHost(new URL(current).hostname, resolve)
    const ctl = new AbortController()
    const timer = setTimeout(() => ctl.abort(), timeoutMs)
    try {
      const res = await f(current, { redirect: 'manual', signal: ctl.signal, headers: { 'user-agent': CRAWLER_UA, accept: 'text/html,application/xml;q=0.9,*/*;q=0.5' } })
      if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
        current = new URL(res.headers.get('location')!, current).toString()
        await res.body?.cancel().catch(() => undefined)
        if (!/^https?:/.test(current)) throw new CompetitorError('Unsupported redirect')
        continue
      }
      const text = (await res.text()).slice(0, maxText)
      return { status: res.status, text, ms: Date.now() - t0, finalUrl: current }
    } finally {
      clearTimeout(timer)
    }
  }
  throw new CompetitorError('Too many redirects')
}

/** Collects only public on-page facts. No traffic or ranking estimates are ever fabricated. */
export async function fetchCompetitorSnapshot(domain: string, f: typeof fetch = fetch, resolve?: Resolver): Promise<CompetitorSnapshotData> {
  const snap: CompetitorSnapshotData = { httpStatus: null, responseMs: null, title: null, metaDescription: null, h1: null, wordCount: null, jsonLdTypes: [], hasHreflang: false, sitemapUrlCount: null, robotsFound: false, error: null }
  const origin = `https://${domain}`
  try {
    const home = await safeGet(f, origin + '/', 12000, resolve)
    snap.httpStatus = home.status
    snap.responseMs = home.ms
    if (home.status === 200) {
      const facts = extractPageFacts(home.text, home.finalUrl)
      Object.assign(snap, { title: facts.title, metaDescription: facts.metaDescription, h1: facts.h1s[0] ?? null, wordCount: facts.wordCount, jsonLdTypes: facts.jsonLdTypes.filter((t) => t !== 'INVALID_JSON'), hasHreflang: facts.hreflangCount > 0 })
    }
    let sitemapSeed = `${origin}/sitemap.xml`
    try {
      const robots = await safeGet(f, origin + '/robots.txt', 8000, resolve, 200_000)
      snap.robotsFound = robots.status === 200
      const m = /^\s*sitemap:\s*(\S+)/im.exec(robots.text)
      if (robots.status === 200 && m) {
        const host = new URL(m[1]).hostname.replace(/^www\./, '')
        if (host === domain) sitemapSeed = m[1]
      }
    } catch { /* robots are optional */ }
    try {
      const sm = await safeGet(f, sitemapSeed, 10000, resolve)
      if (sm.status === 200) {
        const parsed = parseSitemap(sm.text)
        if (parsed.kind === 'urlset') snap.sitemapUrlCount = parsed.entries.length
        else if (parsed.kind === 'index') snap.sitemapUrlCount = null // size of an index is not the URL count; do not guess
      }
    } catch { /* sitemap optional */ }
  } catch (e) {
    snap.error = (e instanceof Error ? e.message : String(e)).slice(0, 300)
  }
  return snap
}

export async function snapshotCompetitor(siteId: string, id: string, actor: string, f: typeof fetch = fetch, resolve?: Resolver) {
  const rows = await seoQuery<{ domain: string }>(`SELECT domain FROM seo_competitors WHERE id=$1 AND "siteId"=$2`, [id, siteId])
  if (!rows.length) throw new CompetitorError('Competitor not found')
  const s = await fetchCompetitorSnapshot(rows[0].domain, f, resolve)
  await withSeoTx(async (c) => {
    await c.query(
      `INSERT INTO seo_competitor_snapshots (id,"competitorId","httpStatus","responseMs",title,"metaDescription",h1,"wordCount","jsonLdTypes","hasHreflang","sitemapUrlCount","robotsFound",error) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [randomUUID(), id, s.httpStatus, s.responseMs, s.title, s.metaDescription, s.h1, s.wordCount, s.jsonLdTypes, s.hasHreflang, s.sitemapUrlCount, s.robotsFound, s.error],
    )
    await audit(c, siteId, actor, 'competitor.snapshot', 'seo_competitors', id, { domain: rows[0].domain, httpStatus: s.httpStatus, error: s.error })
  })
  return s
}
