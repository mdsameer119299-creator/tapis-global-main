// scripts/seo-rendered-links.test.mts — run: npm run test:seo-rendered
// Server-renders the REAL page templates (LandingPage, LandingHub, GuideArticle) with react-dom/server and
// asserts on the anchors that actually reach the HTML — not on related[] data. Needed because LandingPage
// caps its related-landing block at 5 links, so a slug present in data can still never be rendered.
//
import assert from 'assert'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import * as LPm from '@/components/landing/LandingPage'
import * as HUBm from '@/components/landing/LandingHub'
import * as GAm from '@/components/guides/GuideArticle'
import * as S from '@/lib/seo-landing'
import { GUIDES, getGuide } from '@/lib/guides'
import { getProductCategory as getProduct } from '@/lib/products'
import { SEO_BASE_URL } from '@/lib/seo'
import * as SMm from '@/app/sitemap'

const dflt = (m: any) => m.default?.default ?? m.default ?? m
const sitemapFn = dflt(SMm)
const LandingPage = dflt(LPm), LandingHub = dflt(HUBm), GuideArticle = dflt(GAm)

let passed = 0, failed = 0, skipped = 0
const t = (name: string, fn: () => void) => { try { fn(); passed++; console.log('  ok  ', name) } catch (e: any) { failed++; console.error('  FAIL', name, '\n      ', e.message) } }

const pathOf = (p: any) => p.kind === 'usa-city' ? `/usa/${p.parentUsaState}/${p.slug}` :
  `${({ industry: '/industries', solution: '/solutions', country: '/countries', dhurrie: '/dhurries', company: '/company', india: '/india', 'usa-state': '/usa' } as any)[p.kind]}/${p.slug}`

const pages: any[] = [
  ...S.getAllIndustrySlugs().map(S.getIndustry), ...S.getAllSolutionSlugs().map(S.getSolution),
  ...S.getAllCountrySlugs().map(S.getCountry), ...S.getAllDhurrieSlugs().map(S.getDhurrie),
  ...S.getAllCompanySlugs().map(S.getCompanyPage), ...S.getAllIndiaSlugs().map(S.getIndiaLocation),
  ...S.getAllUsaStateSlugs().map(S.getUsaState), ...S.USA_CITIES.map((c: any) => S.getUsaCity(c.slug)),
]
const html: Record<string, string> = {}
for (const p of pages) html[pathOf(p)] = renderToStaticMarkup(createElement(LandingPage, { page: p }))
for (const g of GUIDES) html['/guides/' + g.slug] = renderToStaticMarkup(createElement(GuideArticle, { guide: g }))

// hubs (what /industries, /countries … actually render)
const hubHtml: Record<string, string> = {}
const hubs: [string, any[]][] = [
  ['/industries', pages.filter((p) => p.kind === 'industry')], ['/solutions', pages.filter((p) => p.kind === 'solution')],
  ['/countries', pages.filter((p) => p.kind === 'country')], ['/dhurries', pages.filter((p) => p.kind === 'dhurrie')],
  ['/company', pages.filter((p) => p.kind === 'company')], ['/india', pages.filter((p) => p.kind === 'india')],
  ['/usa', pages.filter((p) => p.kind === 'usa-state')],
]
for (const [base, ps] of hubs) hubHtml[base] = renderToStaticMarkup(createElement(LandingHub, { eyebrow: 'e', title: 't', titleEm: 'm', intro: 'i', basePath: base, pages: ps }))

type Anchor = { href: string; inner: string; tag: string }
const anchors = (h: string): Anchor[] => [...h.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map((m) => ({
  tag: m[1], href: (m[1].match(/href="([^"]*)"/) || [])[1] ?? '', inner: m[2],
}))
const internal = (h: string) => [...new Set(anchors(h).map((a) => a.href).filter((x) => x.startsWith('/')))]
const sitemapPaths = new Set((sitemapFn() as any[]).map((e) => e.url.replace(SEO_BASE_URL, '') || '/'))
const known = new Set<string>([...Object.keys(html), ...hubs.map(([b]) => b), ...sitemapPaths])

console.log('Rendered anchors are valid and crawlable')
t('every rendered anchor has a non-empty href (no #, javascript:, empty) and visible text or aria-label', () => {
  for (const [src, h] of Object.entries({ ...html, ...hubHtml })) for (const a of anchors(h)) {
    assert(a.href && a.href !== '#' && !/^javascript:/i.test(a.href), `${src}: bad href "${a.href}"`)
    const text = a.inner.replace(/<[^>]+>/g, '').trim()
    assert(text || /aria-label="[^"]+"/.test(a.tag) || /alt="[^"]+"/.test(a.inner), `${src}: anchor to ${a.href} has no accessible text`)
  }
})
t('every internal rendered href resolves to a real route (no broken internal links)', () => {
  const staticOk = new Set(['/', '/catalogue', '/contact', '/custom', '/design-studio', '/about', '/gallery', '/products', '/guides', '/knowledge', '/materials', '/constructions', '/glossary', '/samples'])
  const broken: string[] = []
  for (const [src, h] of Object.entries(html)) for (const href of internal(h)) {
    const clean = href.split('#')[0].split('?')[0].replace(/\/$/, '') || '/'
    if (known.has(clean) || staticOk.has(clean)) continue
    if (/^\/products\/[^/]+$/.test(clean) && getProduct(clean.split('/')[2])) continue
    if (/^\/(knowledge|materials|constructions|glossary)(\/|$)/.test(clean)) continue // other clusters, covered by their own audits
    broken.push(`${src} -> ${href}`)
  }
  assert.deepStrictEqual(broken, [])
})
t('internal hrefs are canonical-form: lower-case, no trailing slash, no query string', () => {
  const bad: string[] = []
  for (const [src, h] of Object.entries(html)) for (const href of internal(h)) {
    const path = href.split('#')[0]
    if (path !== '/' && (path.endsWith('/') || path.includes('?') || path !== path.toLowerCase())) bad.push(`${src} -> ${href}`)
  }
  assert.deepStrictEqual(bad, [])
})

console.log('Intended contextual links are present in the rendered HTML')
// source, destination, why it is contextually relevant (all are pre-existing business facts / page topics)
const EDGES: [string, string, string][] = [
  ['/industries/casino-carpets', '/industries/cruise-yacht-carpets', 'hospitality & leisure venue'],
  ['/industries/airport-carpets', '/industries/cruise-yacht-carpets', 'passenger-transport / terminal environment'],
  ['/industries/conference-room-carpets', '/industries/exhibition-carpets', 'events & conference venue'],
  ['/industries/retail-carpets', '/industries/exhibition-carpets', 'commercial display / event floors'],
  ['/industries/office-carpets', '/industries/bank-carpets', 'corporate / financial office interiors'],
  ['/industries/government-carpets', '/industries/bank-carpets', 'institutional / formal public-facing interiors'],
  ['/countries/germany', '/countries/poland', 'neighbouring EU market'],
  ['/countries/australia', '/countries/new-zealand', 'neighbouring Oceania market'],
  ['/countries/uae', '/countries/bahrain', 'GCC neighbour'],
  ['/countries/saudi-arabia', '/countries/oman', 'GCC neighbour'],
  ['/dhurries/bulk-dhurrie-supplier', '/dhurries/dhurrie-manufacturer-bhadohi', 'bulk supply from the Bhadohi factory page'],
  ['/dhurries/dhurrie-exporter-india', '/dhurries/dhurrie-manufacturer-bhadohi', 'export origin page'],
  ['/dhurries/wool-dhurrie-manufacturer', '/dhurries/cotton-wool-dhurrie-manufacturer', 'blended fibre variant'],
  ['/dhurries/handloom-dhurrie-manufacturer', '/dhurries/red-black-stripe-dhurrie-manufacturer', 'classic handloom institutional stripe'],
  ['/dhurries/floor-seating-dhurrie-manufacturer', '/dhurries/red-black-stripe-dhurrie-manufacturer', 'floor-seating institutional product'],
  ['/guides/how-rugs-are-manufactured', '/guides/rug-manufacturing-process-explained', 'same manufacturing-process topic'],
]
for (const [src, dst, why] of EDGES)
  t(`${src} renders <a href="${dst}"> (${why})`, () => {
    assert(html[src], `source page ${src} did not render`)
    assert(known.has(dst), `destination ${dst} is not an existing page`)
    assert(internal(html[src]).includes(dst), `rendered HTML of ${src} does not contain a link to ${dst}`)
    const a = anchors(html[src]).find((x) => x.href === dst)!
    assert(a.inner.replace(/<[^>]+>/g, '').trim().length > 2, 'link has no descriptive anchor text')
  })
t('no added link is excessive: ≤1 new edge per source page; every page renders ≤ 25 distinct internal links', () => {
  const per: Record<string, number> = {}; EDGES.forEach(([s]) => (per[s] = (per[s] || 0) + 1))
  assert(Object.values(per).every((n) => n === 1), JSON.stringify(per))
  for (const [src, h] of Object.entries(html)) assert(internal(h).length <= 25, `${src} renders ${internal(h).length} internal links`)
})

console.log('Related-slug integrity (every related* slug resolves to an existing page)')
t('all related* slugs on landing pages resolve', () => {
  const R: Record<string, (s: string) => any> = {
    relatedIndustries: S.getIndustry, relatedSolutions: S.getSolution, relatedCountries: S.getCountry, relatedDhurries: S.getDhurrie,
    relatedCompany: S.getCompanyPage, relatedIndia: S.getIndiaLocation, relatedUsaStates: S.getUsaState, relatedUsaCities: S.getUsaCity,
    relatedProducts: getProduct as any,
  }
  const bad: string[] = []
  for (const p of pages) for (const [k, fn] of Object.entries(R)) for (const s of p[k] || []) if (!fn(s)) bad.push(`${pathOf(p)}.${k}: ${s}`)
  assert.deepStrictEqual(bad, [])
})
t('all relatedGuides / relatedProducts slugs on guides resolve', () => {
  const bad: string[] = []
  for (const g of GUIDES) { for (const s of g.relatedGuides) if (!getGuide(s)) bad.push(`${g.slug}: guide ${s}`); for (const s of g.relatedProducts) if (!getProduct(s)) bad.push(`${g.slug}: product ${s}`) }
  assert.deepStrictEqual(bad, [])
})

console.log('Orphan / inbound coverage from rendered HTML (landing pages + hubs + guides)')
const inbound: Record<string, Set<string>> = {}
for (const [src, h] of Object.entries({ ...html, ...hubHtml })) for (const href of internal(h)) if (href !== src) (inbound[href] ||= new Set()).add(src)
// NOTE: only landing pages, hubs and guides are rendered here (product pages, home, nav/footer are not), so
// this measures a lower bound. The live crawl showed additional inbound links from those other templates.
t('no sitemap-listed landing/guide page is an orphan in the rendered link graph (≥1 inbound)', () => {
  const orphans = Object.keys(html).filter((p) => sitemapPaths.has(p) && (inbound[p]?.size || 0) < 1)
  assert.deepStrictEqual(orphans, [])
})
t('every destination added by this change has ≥2 rendered inbound links (hub + the new contextual link); guides ≥1 (guides hub not rendered here)', () => {
  for (const [, dst] of EDGES) assert((inbound[dst]?.size || 0) >= (dst.startsWith('/guides/') ? 1 : 2), `${dst}: ${inbound[dst]?.size || 0} inbound`)
})
t('held-back country pages (austria, ireland, south-africa) are still linked from the /countries hub', () => {
  for (const s of ['austria', 'ireland', 'south-africa']) assert(inbound[`/countries/${s}`]?.has('/countries'), s)
})

console.log('Search Console "Crawled – currently not indexed" coverage')
// Group-level coverage of every page type named in the report; exact-URL checks: test:seo-gsc.
const GROUPS: [string, (p: string) => boolean][] = [
  ['USA state pages', (p) => /^\/usa\/[^/]+$/.test(p)], ['USA city pages', (p) => /^\/usa\/[^/]+\/[^/]+$/.test(p)],
  ['India location pages', (p) => /^\/india\/[^/]+$/.test(p)], ['Dhurrie pages', (p) => p.startsWith('/dhurries/')],
  ['Company pages', (p) => p.startsWith('/company/')], ['Guides', (p) => p.startsWith('/guides/')],
  ['Industry pages', (p) => p.startsWith('/industries/')], ['Solutions', (p) => p.startsWith('/solutions/')],
  ['UAE country page', (p) => p === '/countries/uae'],
]
function checkUrlPath(p: string) {
  assert(html[p], `${p} is not a known rendered route`)
  assert(sitemapPaths.has(p), `${p} is not in the sitemap`)
  assert((inbound[p]?.size || 0) >= 1, `${p} has no rendered inbound links`)
  assert(/<h1[\s>]/.test(html[p]) || p.startsWith('/guides/'), `${p} renders no H1`)
  assert(/<nav[^>]*aria-label="Breadcrumb"/.test(html[p]) || p.startsWith('/guides/'), `${p} renders no breadcrumb`)
  assert(/Contact|Enquir|Quote|Catalogue/i.test(html[p]) && internal(html[p]).some((h) => /^\/(contact|catalogue)/.test(h)), `${p} has no conversion link`)
}
for (const [name, test] of GROUPS)
  t(`${name}: every page resolves, is in the sitemap, has H1, breadcrumb, conversion link and ≥1 rendered inbound link`, () => {
    const ps = Object.keys(html).filter(test); assert(ps.length > 0, 'group empty')
    const fails: string[] = []; for (const p of ps) { try { checkUrlPath(p) } catch (e: any) { fails.push(e.message) } }
    assert.deepStrictEqual(fails, [])
  })
// Per-URL assertions for the exact 24 reported URLs live in scripts/seo-gsc-urls.test.mts (npm run test:seo-gsc).

console.log(`\n${passed} passed, ${failed} failed, ${skipped} skipped`)
process.exit(failed ? 1 : 0)
