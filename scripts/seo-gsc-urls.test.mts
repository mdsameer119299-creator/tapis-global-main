// scripts/seo-gsc-urls.test.mts — run: npm run test:seo-gsc
// SOURCE-LEVEL, per-URL verification of the exact 24 URLs in Search Console's
// "Crawled – currently not indexed" report (docs/gsc/crawled-not-indexed.csv).
//
// Everything here runs against the repository source (page modules are imported and server-rendered with
// react-dom/server). It does NOT touch the network. HTTP status, response headers and the deployed HTML are
// verified separately by `npm run seo:gsc:live` (scripts/gsc-live-check.mjs). Passing here does not mean Google
// will index a URL — it only means nothing in the source blocks or weakens it.
//
// Result vocabulary: PASS | FAIL | N/A (check does not apply, reason given) | SKIP (could not run, NOT a pass).
import assert from 'assert'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import * as LPm from '@/components/landing/LandingPage'
import * as GAm from '@/components/guides/GuideArticle'
import * as HUBm from '@/components/landing/LandingHub'
import * as S from '@/lib/seo-landing'
import { GUIDES, getGuide } from '@/lib/guides'
import * as SMm from '@/app/sitemap'
import * as ROBm from '@/app/robots'
import { SEO_BASE_URL } from '@/lib/seo'

const dflt = (m: any) => m.default?.default ?? m.default ?? m
const ROOT = process.cwd()
const BASE = SEO_BASE_URL

type Status = 'PASS' | 'FAIL' | 'N/A' | 'SKIP'
type Res = { status: Status; detail: string }
const CHECKS = ['route', 'sitemap', 'status/redirect', 'canonical', 'robots', 'h1', 'breadcrumb', 'content', 'inbound', 'cta', 'structured-data'] as const
type Check = typeof CHECKS[number]
const results: Record<string, Record<Check, Res>> = {}

// ── fixture ──────────────────────────────────────────────────────────────────
const csvPath = resolve(ROOT, 'docs/gsc/crawled-not-indexed.csv')
if (!existsSync(csvPath)) { console.error('FATAL: docs/gsc/crawled-not-indexed.csv missing'); process.exit(2) }
const rows = readFileSync(csvPath, 'utf8').trim().split(/\r?\n/).slice(1).map((l) => { const [url, last] = l.split(','); return { url, last } })
assert.strictEqual(rows.length, 24, 'fixture must contain exactly 24 URLs')
assert.strictEqual(new Set(rows.map((r) => r.url)).size, 24, 'fixture URLs must be unique')
for (const r of rows) assert(r.url.startsWith(BASE + '/') && /^\d{4}-\d{2}-\d{2}$/.test(r.last), `bad fixture row ${r.url},${r.last}`)

// ── route resolution ─────────────────────────────────────────────────────────
const ROUTES: { re: RegExp; file: string; params: (m: RegExpMatchArray) => Record<string, string>; kind: string }[] = [
  { re: /^\/usa\/([^/]+)\/([^/]+)$/, file: 'app/usa/[state]/[city]/page.tsx', params: (m) => ({ state: m[1], city: m[2] }), kind: 'usa-city' },
  { re: /^\/usa\/([^/]+)$/, file: 'app/usa/[state]/page.tsx', params: (m) => ({ state: m[1] }), kind: 'usa-state' },
  { re: /^\/india\/([^/]+)$/, file: 'app/india/[location]/page.tsx', params: (m) => ({ location: m[1] }), kind: 'india' },
  { re: /^\/dhurries\/([^/]+)$/, file: 'app/dhurries/[slug]/page.tsx', params: (m) => ({ slug: m[1] }), kind: 'dhurrie' },
  { re: /^\/countries\/([^/]+)$/, file: 'app/countries/[country]/page.tsx', params: (m) => ({ country: m[1] }), kind: 'country' },
  { re: /^\/industries\/([^/]+)$/, file: 'app/industries/[industry]/page.tsx', params: (m) => ({ industry: m[1] }), kind: 'industry' },
  { re: /^\/company\/([^/]+)$/, file: 'app/company/[slug]/page.tsx', params: (m) => ({ slug: m[1] }), kind: 'company' },
  { re: /^\/solutions\/([^/]+)$/, file: 'app/solutions/[slug]/page.tsx', params: (m) => ({ slug: m[1] }), kind: 'solution' },
  { re: /^\/guides\/([^/]+)$/, file: 'app/guides/[slug]/page.tsx', params: (m) => ({ slug: m[1] }), kind: 'guide' },
]

// ── whole-site rendered link graph (landing pages + guides), same method as seo-rendered-links.test.mts ──
const LandingPage = dflt(LPm), GuideArticle = dflt(GAm), LandingHub = dflt(HUBm)
const sitemapEntries: any[] = (dflt(SMm) as any)()
const sitemapPaths = new Set(sitemapEntries.map((e) => e.url.replace(BASE, '') || '/'))
const pathOf = (p: any) => p.kind === 'usa-city' ? `/usa/${p.parentUsaState}/${p.slug}` :
  `${({ industry: '/industries', solution: '/solutions', country: '/countries', dhurrie: '/dhurries', company: '/company', india: '/india', 'usa-state': '/usa' } as any)[p.kind]}/${p.slug}`
const allPages: any[] = [
  ...S.getAllIndustrySlugs().map(S.getIndustry), ...S.getAllSolutionSlugs().map(S.getSolution), ...S.getAllCountrySlugs().map(S.getCountry),
  ...S.getAllDhurrieSlugs().map(S.getDhurrie), ...S.getAllCompanySlugs().map(S.getCompanyPage), ...S.getAllIndiaSlugs().map(S.getIndiaLocation),
  ...S.getAllUsaStateSlugs().map(S.getUsaState), ...S.USA_CITIES.map((c: any) => S.getUsaCity(c.slug)),
]
const graphHtml: Record<string, string> = {}
for (const p of allPages) graphHtml[pathOf(p)] = renderToStaticMarkup(createElement(LandingPage, { page: p }))
for (const g of GUIDES) graphHtml['/guides/' + g.slug] = renderToStaticMarkup(createElement(GuideArticle, { guide: g }))
const hubHtml: Record<string, string> = {}
for (const [base, kind] of [['/industries', 'industry'], ['/solutions', 'solution'], ['/countries', 'country'], ['/dhurries', 'dhurrie'], ['/company', 'company'], ['/india', 'india'], ['/usa', 'usa-state']] as const)
  hubHtml[base] = renderToStaticMarkup(createElement(LandingHub, { eyebrow: 'e', title: 't', titleEm: 'm', intro: 'i', basePath: base, pages: allPages.filter((p) => p.kind === kind) }))
const hrefs = (h: string) => [...new Set([...h.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map((m) => m[1]).filter((x) => x.startsWith('/')))]
const contextualInbound: Record<string, string[]> = {}, hubInbound: Record<string, string[]> = {}
for (const [src, h] of Object.entries(graphHtml)) for (const href of hrefs(h)) if (href !== src) (contextualInbound[href] ||= []).push(src)
for (const [src, h] of Object.entries(hubHtml)) for (const href of hrefs(h)) (hubInbound[href] ||= []).push(src)

const shingles = (t: string) => { const w = t.toLowerCase().split(/\W+/).filter(Boolean); const s = new Set<string>(); for (let i = 0; i < w.length - 4; i++) s.add(w.slice(i, i + 5).join(' ')); return s }
const text = (h: string) => h.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ').trim()

// ── next.config / middleware (status, redirect and header behaviour at source level) ──
const nextCfg = (await import('../next.config.js')).default as any
const cfg = nextCfg?.default ?? nextCfg
const redirects: any[] = await cfg.redirects()
const headerRules: any[] = await cfg.headers()
const middlewareSrc = readFileSync(resolve(ROOT, 'middleware.ts'), 'utf8')
const middlewareMatchers: string[] = [...middlewareSrc.matchAll(/matcher:\s*\[([^\]]*)\]/g)].flatMap((m) => [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]))
const matchesPattern = (src: string, path: string) => new RegExp('^' + src.replace(/:[a-z]+\*/gi, '.*').replace(/:[a-z]+/gi, '[^/]+') + '$').test(path)

const set = (url: string, c: Check, status: Status, detail: string) => { (results[url] ||= {} as any)[c] = { status, detail } }
const guard = async (url: string, c: Check, fn: () => string | void | Promise<string | void>) => {
  try { const d = await fn(); set(url, c, 'PASS', d || 'ok') } catch (e: any) { set(url, c, e?.skip ? 'SKIP' : e?.na ? 'N/A' : 'FAIL', e.message) }
}
const na = (m: string) => Object.assign(new Error(m), { na: true })

// ── per-URL checks ───────────────────────────────────────────────────────────
for (const { url } of rows) {
  const path = url.replace(BASE, '')
  const isSitemap = path === '/sitemap.xml'
  const route = ROUTES.find((r) => r.re.test(path))
  const m = route && path.match(route.re)!
  const params = route ? route.params(m!) : {}
  let mod: any, markup = '', meta: any

  await guard(url, 'route', async () => {
    if (isSitemap) { assert(existsSync(resolve(ROOT, 'app/sitemap.ts')), 'app/sitemap.ts missing'); return 'app/sitemap.ts (metadata route → /sitemap.xml)' }
    assert(route, `no route pattern matches ${path}`)
    assert(existsSync(resolve(ROOT, route.file)), `${route.file} missing`)
    mod = await import('../' + route.file)
    const sp: any[] = await mod.generateStaticParams()
    assert(sp.some((p) => Object.entries(params).every(([k, v]) => p[k] === v)), `generateStaticParams() does not include ${JSON.stringify(params)}`)
    meta = await mod.generateMetadata({ params })
    assert(meta && meta.title, 'generateMetadata returned no title for these params (page would 404 / have no metadata)')
    markup = renderToStaticMarkup(await mod.default({ params }))
    return `${route.file} + generateStaticParams includes ${JSON.stringify(params)}; renders without notFound()`
  })

  await guard(url, 'sitemap', () => {
    if (isSitemap) return 'resource, not a listed URL (tested as a sitemap resource below)'
    assert(sitemapPaths.has(path), 'not listed in app/sitemap.ts output')
    return 'listed once in sitemap'
  })
  if (!isSitemap) await guard(url, 'sitemap', () => { assert.strictEqual(sitemapEntries.filter((e) => e.url === url).length, 1, 'listed more than once'); })

  await guard(url, 'status/redirect', () => {
    // Source-level expectation: 200, no redirect. Real status codes need the deployment: see gsc-live-check.mjs.
    assert(!redirects.some((r) => matchesPattern(r.source, path)), 'a next.config redirect matches this path')
    assert(!cfg.trailingSlash, 'trailingSlash enabled: canonical form would differ')
    assert(!middlewareMatchers.some((mm) => matchesPattern(mm, path)), 'middleware matches this path (auth/redirect logic)')
    if (!isSitemap) assert(!ROUTES.every((r) => !r.re.test(path)), 'no route')
    return 'no next.config redirect, no trailingSlash, middleware does not match → expected 200 (LIVE status NOT verified here)'
  })

  await guard(url, 'canonical', () => {
    if (isSitemap) throw na('a sitemap is an XML resource, it has no <link rel=canonical>')
    assert.strictEqual(meta.alternates?.canonical, url, `canonical is ${meta.alternates?.canonical}`)
    assert(!/[?#]/.test(url) && !url.endsWith('/'), 'non-canonical URL form')
    return `canonical = ${url}`
  })

  await guard(url, 'robots', () => {
    if (isSitemap) {
      const rob: any = dflt(ROBm)(); assert.strictEqual(rob.sitemap, url, 'robots.txt does not reference this sitemap')
      const star = [].concat(rob.rules).find((r: any) => r.userAgent === '*') as any
      assert(!(star.disallow || []).some((d: string) => '/sitemap.xml'.startsWith(d)), 'robots.txt disallows the sitemap')
      assert(!headerRules.some((h) => matchesPattern(h.source, '/sitemap.xml') && h.headers.some((x: any) => /x-robots-tag/i.test(x.key))), 'next.config sets X-Robots-Tag on sitemap')
      return 'robots.txt references it, does not disallow it, no X-Robots-Tag rule (LIVE header NOT verified here)'
    }
    const r = meta.robots
    assert(r && r.index === true && r.follow === true, `meta robots = ${JSON.stringify(r)}`)
    assert(!r.googleBot || (r.googleBot.index !== false && r.googleBot.follow !== false), 'googleBot noindex')
    assert(!/noindex/i.test(markup), 'noindex appears in rendered markup')
    assert(!headerRules.some((h) => matchesPattern(h.source, path) && h.headers.some((x: any) => /x-robots-tag/i.test(x.key))), 'next.config sets X-Robots-Tag for this path')
    assert(!/X-Robots-Tag/i.test(middlewareSrc), 'middleware sets X-Robots-Tag')
    return 'index,follow; no X-Robots-Tag rule in next.config/middleware (LIVE header NOT verified here)'
  })

  await guard(url, 'h1', () => {
    if (isSitemap) throw na('XML resource')
    const h1s = [...markup.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map((x) => text(x[1]))
    assert.strictEqual(h1s.length, 1, `${h1s.length} H1 elements`)
    assert(h1s[0].split(' ').length >= 4 && h1s[0].length >= 25, `H1 not meaningful: "${h1s[0]}"`)
    return `"${h1s[0]}"`
  })

  await guard(url, 'breadcrumb', () => {
    if (isSitemap) throw na('XML resource')
    const nav = markup.match(/<nav[^>]*aria-label="Breadcrumb"[\s\S]*?<\/nav>/)
    assert(nav, 'no <nav aria-label="Breadcrumb"> in rendered HTML')
    const links = [...nav[0].matchAll(/<a\b[^>]*href="([^"]+)"/g)].map((x) => x[1])
    assert(links[0] === '/' && links.length >= 2, `breadcrumb links: ${links.join(', ')}`)
    assert(/aria-current="page"/.test(nav[0]), 'current page not marked aria-current')
    return `Home › ${links.slice(1).join(' › ')} › (current)`
  })

  await guard(url, 'content', () => {
    if (isSitemap) throw na('XML resource')
    const words = text(markup).split(' ').length
    assert(words >= 400, `only ${words} words rendered`)
    // differentiation: highest 5-word-shingle Jaccard against the other pages of the same template/kind
    const self = shingles(text(markup)); let best = 0, bestP = ''
    for (const [p, h] of Object.entries(graphHtml)) {
      if (p === path || !route || !route.re.test(p)) continue
      const o = shingles(text(h)); let i = 0; self.forEach((x) => o.has(x) && i++)
      const j = i / (self.size + o.size - i); if (j > best) { best = j; bestP = p }
    }
    assert(best < 0.7, `near-duplicate of ${bestP} (similarity ${best.toFixed(2)})`)
    return `${words} words; most similar sibling ${bestP || 'n/a'} @ ${best.toFixed(2)}`
  })

  await guard(url, 'inbound', () => {
    if (isSitemap) throw na('sitemap is discovered through robots.txt/GSC, not through page links')
    const ctx = contextualInbound[path] || [], hub = hubInbound[path] || []
    assert(ctx.length >= 1, `no contextual inbound link from any rendered landing/guide page (hub links: ${hub.length})`)
    return `${ctx.length} contextual (${ctx.slice(0, 3).join(', ')}${ctx.length > 3 ? ', …' : ''}) + ${hub.length} hub`
  })

  await guard(url, 'cta', () => {
    if (isSitemap) throw na('XML resource')
    const h = hrefs(markup)
    assert(h.some((x) => /^\/(contact|catalogue)(\/|$|\?)/.test(x)), 'no /contact or /catalogue link')
    return `links: ${h.filter((x) => /^\/(contact|catalogue)/.test(x)).slice(0, 3).join(', ')}`
  })

  await guard(url, 'structured-data', () => {
    if (isSitemap) throw na('XML resource')
    const blocks = [...markup.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((x) => x[1])
    assert(blocks.length >= 1, 'no JSON-LD in rendered HTML')
    const nodes: any[] = []
    for (const b of blocks) { const j = JSON.parse(b.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')); (j['@graph'] ? j['@graph'] : [j]).forEach((n: any) => nodes.push(n)); assert(!j['@graph'] || j['@context'], 'missing @context') }
    const types = nodes.map((n) => [].concat(n['@type']).join('/'))
    const bc = nodes.find((n) => n['@type'] === 'BreadcrumbList'); assert(bc, `no BreadcrumbList (types: ${types})`)
    const items = bc.itemListElement; assert(items.length >= 2 && items.every((it: any, i: number) => it.position === i + 1 && it.name && it.item), 'breadcrumb list malformed')
    assert.strictEqual(items[items.length - 1].item, url, `last breadcrumb item ${items[items.length - 1].item} ≠ page URL`)
    assert(nodes.some((n) => n['@type'] === 'WebPage'), 'no WebPage node')
    const faq = nodes.find((n) => n['@type'] === 'FAQPage')
    const dataFaqs = (route?.kind === 'guide' ? getGuide(params.slug)?.faqs : (allPages.find((p) => pathOf(p) === path) || {}).faqs) || []
    if (dataFaqs.length) { assert(faq, 'page has FAQs but no FAQPage JSON-LD'); assert.strictEqual(faq.mainEntity.length, dataFaqs.length, 'FAQPage count ≠ visible FAQs'); assert(faq.mainEntity.every((q: any) => q.name && q.acceptedAnswer?.text)) }
    const urls = JSON.stringify(nodes).match(/"https?:\/\/[^"]+"/g) || []
    assert(urls.every((u) => /tapisglobalinternational\.com|schema\.org|wa\.me/.test(u)), 'foreign URL in structured data')
    return `types: ${types.join(', ')}`
  })
}

// ── /sitemap.xml tested as a sitemap resource ────────────────────────────────
const SM = `${BASE}/sitemap.xml`
await guard(SM, 'status/redirect', async () => {
  let xml = ''
  try { const { resolveSitemap } = await import('next/dist/build/webpack/loaders/metadata/resolve-route-data') as any; xml = resolveSitemap(sitemapEntries) } catch { const e: any = new Error('Next sitemap serializer not importable'); e.skip = true; throw e }
  assert(/^<\?xml/.test(xml) && /<urlset[^>]*sitemaps\.org\/schemas\/sitemap\/0\.9/.test(xml), 'not a valid <urlset> document')
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1])
  assert.strictEqual(locs.length, sitemapEntries.length, 'serialised URL count mismatch')
  assert(locs.length >= 250 && locs.length <= 50000, `${locs.length} URLs`)
  assert(!/<lastmod>/.test(xml), 'unexpected lastmod')
  for (const r of rows) if (r.url !== SM) assert(locs.includes(r.url), `sitemap lacks ${r.url}`)
  return `valid urlset, ${locs.length} URLs incl. the other 23 reported URLs (LIVE status/Content-Type NOT verified here)`
})

// ── report ───────────────────────────────────────────────────────────────────
const order = rows.map((r) => r.url)
const tally: Record<Status, number> = { PASS: 0, FAIL: 0, 'N/A': 0, SKIP: 0 }
console.log('SOURCE-LEVEL results for the 24 Search Console URLs (live HTTP/headers: npm run seo:gsc:live)\n')
order.forEach((u, i) => {
  const last = rows[i].last
  console.log(`${String(i + 1).padStart(2)}. ${u.replace(BASE, '')}  (last crawled ${last})`)
  for (const c of CHECKS) { const r = results[u]?.[c]; if (!r) continue; tally[r.status]++; console.log(`      ${r.status.padEnd(4)} ${c.padEnd(16)} ${r.detail}`) }
})
console.log(`\nTOTAL checks: ${tally.PASS} PASS, ${tally.FAIL} FAIL, ${tally['N/A']} N/A, ${tally.SKIP} SKIP (SKIP and N/A are not counted as passes)`)
if (process.env.GSC_REPORT_JSON) { (await import('fs')).writeFileSync(process.env.GSC_REPORT_JSON, JSON.stringify(results, null, 2)) }
process.exit(tally.FAIL || tally.SKIP ? 1 : 0)
