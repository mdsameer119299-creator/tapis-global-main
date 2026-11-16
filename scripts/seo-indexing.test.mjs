// scripts/seo-indexing.test.mjs  —  run: npm run test:seo-indexing
// Offline regression tests for Google-indexing hygiene. No framework: node + assert.
// Covers: sitemap generation, robots directives, canonical/metadata defaults,
// duplicate SEO metadata, internal-link integrity, dynamic route coverage.
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, resolve, join } from 'path'
import { readFileSync, readdirSync, statSync, existsSync } from 'fs'
import assert from 'assert'

const require = createRequire(import.meta.url)
const __filename = fileURLToPath(import.meta.url)
const ROOT = resolve(dirname(__filename), '..')
const jiti = require('jiti')(__filename, { interopDefault: true, alias: { '@': ROOT } })

const seo = jiti('../lib/seo-landing.ts')
const seoConst = jiti('../lib/seo.ts')
const sitemap = jiti('../app/sitemap.ts')()
const robots = jiti('../app/robots.ts')()
const { buildMetadata } = jiti('../lib/metadata.ts')
const BASE = seoConst.SEO_BASE_URL

let passed = 0
const t = (name, fn) => { try { fn(); passed++; console.log('  ok  ', name) } catch (e) { console.error('  FAIL', name, '\n      ', e.message); process.exitCode = 1 } }

console.log('Sitemap')
t('every URL is absolute https on the preferred www host, no query/fragment/trailing slash', () => {
  for (const e of sitemap) {
    assert(e.url.startsWith(BASE), `wrong host: ${e.url}`)
    assert(!/[?#]/.test(e.url), `query/fragment: ${e.url}`)
    assert(e.url === BASE || !e.url.endsWith('/'), `trailing slash: ${e.url}`)
  }
})
t('no duplicate URLs', () => {
  const seen = new Set(); for (const e of sitemap) { assert(!seen.has(e.url), `dup ${e.url}`); seen.add(e.url) }
})
t('no fabricated lastModified (policy: omit unless a real date exists)', () => {
  for (const e of sitemap) assert(e.lastModified === undefined, `lastModified on ${e.url}`)
})
t('no private/api/admin/crafttrack URLs listed', () => {
  for (const e of sitemap) assert(!/\/(api|admin|private|crafttrack|_next)(\/|$)/.test(e.url), e.url)
})
t('redirect sources from next.config are not listed', async () => {})
{
  const cfg = require(resolve(ROOT, 'next.config.js'))
  const redirects = await cfg.redirects()
  t('no redirecting URL is in the sitemap', () => {
    const urls = new Set(sitemap.map((e) => e.url))
    for (const r of redirects) assert(!urls.has(BASE + r.source), `redirect source in sitemap: ${r.source}`)
  })
}
t('every cluster page that is meant to be indexable is in the sitemap (except documented holdbacks)', () => {
  const urls = new Set(sitemap.map((e) => e.url))
  const HELD_BACK = new Set(['/countries/austria', '/countries/ireland', '/countries/south-africa'])
  const expect = [
    ...seo.getAllIndustrySlugs().map((s) => `/industries/${s}`),
    ...seo.getAllSolutionSlugs().map((s) => `/solutions/${s}`),
    ...seo.getAllCountrySlugs().map((s) => `/countries/${s}`),
    ...seo.getAllDhurrieSlugs().map((s) => `/dhurries/${s}`),
    ...seo.getAllCompanySlugs().map((s) => `/company/${s}`),
    ...seo.getAllUsaStateSlugs().map((s) => `/usa/${s}`),
    ...seo.USA_CITIES.map((c) => `/usa/${c.parentUsaState}/${c.slug}`),
  ]
  for (const p of expect) if (!HELD_BACK.has(p)) assert(urls.has(BASE + p), `missing from sitemap: ${p}`)
})

console.log('Robots')
t('robots allows / and does not block money/landing paths', () => {
  const rules = [].concat(robots.rules)
  const star = rules.find((r) => r.userAgent === '*')
  assert(star, 'no * rule')
  const dis = [].concat(star.disallow || [])
  assert(!dis.includes('/'), 'blocks entire site')
  for (const e of sitemap) {
    const p = e.url.replace(BASE, '') || '/'
    for (const d of dis) assert(!p.startsWith(d), `robots disallow ${d} blocks sitemap URL ${p}`)
  }
})
t('robots references the production sitemap', () => assert.strictEqual(robots.sitemap, `${BASE}/sitemap.xml`))

console.log('Canonical / metadata')
t('buildMetadata emits an explicit canonical and indexable robots by default', () => {
  const m = buildMetadata({ title: 'T', description: 'D', canonical: `${BASE}/x` })
  assert.strictEqual(m.alternates.canonical, `${BASE}/x`)
  assert.strictEqual(m.robots.index, true)
  assert.strictEqual(buildMetadata({ title: 'T', description: 'D', noIndex: true }).robots.index, false)
})
t('every page that calls buildMetadata supplies its own canonical (default falls back to HOMEPAGE)', () => {
  const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p] })
  const offenders = walk(join(ROOT, 'app')).filter((f) => /\.tsx?$/.test(f)).filter((f) => {
    const s = readFileSync(f, 'utf8')
    return s.includes('buildMetadata(') && !/canonical/.test(s) && !/PAGE_META|\.\.\./.test(s)
  })
  // app/page.tsx IS the homepage, so the default canonical is correct there.
  const bad = offenders.filter((f) => !f.endsWith(join('app', 'page.tsx')))
  assert.deepStrictEqual(bad, [])
})
t('noindex is never set on a page that is in the sitemap', () => {
  const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p] })
  const noidx = walk(join(ROOT, 'app')).filter((f) => /page\.tsx$/.test(f) && /noIndex:\s*true|index:\s*false/.test(readFileSync(f, 'utf8')))
  const urls = sitemap.map((e) => e.url.replace(BASE, ''))
  for (const f of noidx) {
    const route = '/' + f.replace(join(ROOT, 'app') + '/', '').replace(/\/?page\.tsx$/, '')
    assert(!urls.some((u) => u === route || (route.includes('[') && u.startsWith(route.split('[')[0].replace(/\/$/, '')) && u !== route.split('[')[0].replace(/\/$/, ''))), `noindex route ${route} appears in sitemap`)
  }
})

console.log('Duplicate SEO metadata + structure')
const all = [
  ...seo.getAllIndustrySlugs().map((s) => seo.getIndustry(s)),
  ...seo.getAllSolutionSlugs().map((s) => seo.getSolution(s)),
  ...seo.getAllCountrySlugs().map((s) => seo.getCountry(s)),
  ...seo.getAllDhurrieSlugs().map((s) => seo.getDhurrie(s)),
  ...seo.getAllCompanySlugs().map((s) => seo.getCompanyPage(s)),
  ...seo.getAllIndiaSlugs().map((s) => seo.getIndiaLocation(s)),
  ...seo.getAllUsaStateSlugs().map((s) => seo.getUsaState(s)),
].filter(Boolean)
t('landing pages were loaded', () => assert(all.length > 80, `only ${all.length}`))
t('seoTitle, seoDescription and h1 are unique across landing pages', () => {
  for (const k of ['seoTitle', 'seoDescription', 'h1']) {
    const m = new Map()
    for (const p of all) { const v = (p[k] || '').trim().toLowerCase(); assert(v, `${p.slug} missing ${k}`); assert(!m.has(v), `${k} duplicated: ${p.slug} & ${m.get(v)}`); m.set(v, p.slug) }
  }
})
t('every landing page has FAQs and at least one related link (renders internal links)', () => {
  for (const p of all) {
    assert((p.faqs || []).length >= 2, `${p.slug} <2 FAQs`)
    const rel = ['relatedProducts','relatedIndustries','relatedSolutions','relatedCountries','relatedDhurries','relatedCompany','relatedIndia','relatedUsaStates','relatedUsaCities'].reduce((n, k) => n + (p[k] || []).length, 0)
    assert(rel >= 3, `${p.slug} has ${rel} related links`)
  }
})
t('no empty/placeholder text in titles or descriptions', () => {
  for (const p of all) assert(!/lorem|TODO|TBD|\{\{|undefined/i.test(`${p.seoTitle}${p.seoDescription}${p.h1}`), p.slug)
})

console.log('Dynamic route coverage')
t('every dynamic route folder has generateStaticParams or dynamicParams=false and notFound handling', () => {
  const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p] })
  const pages = walk(join(ROOT, 'app')).filter((f) => /\[[^\]]+\][^/]*\/page\.tsx$|\[[^\]]+\]\/.*page\.tsx$/.test(f) && !/\/(admin|crafttrack|api)\//.test(f))
  const bad = pages.filter((f) => { const s = readFileSync(f, 'utf8'); return !/generateStaticParams/.test(s) || !/notFound\(\)/.test(s) })
  assert.deepStrictEqual(bad.map((f) => f.replace(ROOT, '')), [])
})

console.log(`\n${passed} checks passed${process.exitCode ? ' — WITH FAILURES' : ''}`)
