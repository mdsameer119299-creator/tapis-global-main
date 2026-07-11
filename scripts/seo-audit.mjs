// scripts/seo-audit.mjs
// Static SEO integrity check over the route registries. Run: `npm run seo:audit`.
//
// Loads the real TypeScript data modules (via jiti, already a Next dependency)
// and reports:
//   ERRORS (exit non-zero):
//     - duplicate slugs within a cluster
//     - missing required SEO fields (seoTitle / seoDescription / h1)
//     - invalid internal related-page references (related* -> unknown slug)
//     - non-URL-safe slugs (canonical/route mismatch risk)
//     - sitemap URLs that do not resolve to a known route/slug
//     - a next.config redirect SOURCE listed in the sitemap (redirect URL in sitemap)
//     - lastModified present on a sitemap entry (no fake freshness policy)
//     - near-duplicate landing pages within a cluster (content similarity gate)
//     - a priority commercial page missing (or lacking a conversion path)
//     - a noindex page listed in the sitemap
//   WARNINGS (reported, non-fatal):
//     - duplicate SEO titles / H1s / meta descriptions across pages
//     - over-length titles / descriptions
//     - moderate content similarity between sibling pages
//   NOTES:
//     - dynamic pages intentionally excluded from the sitemap (phased rollout)
//
// Intentionally small: no framework, no network, no crawler. See
// scripts/seo-audit-production.mjs for the live HTTP audit.

import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const require = createRequire(import.meta.url)
const __filename = fileURLToPath(import.meta.url)
const ROOT = resolve(dirname(__filename), '..')
// alias '@' -> project root so modules importing '@/lib/...' (e.g. app/sitemap.ts) resolve.
const jiti = require('jiti')(__filename, { interopDefault: true, alias: { '@': ROOT } })

const seo      = jiti('../lib/seo-landing.ts')
const products = jiti('../lib/products.ts')
const guides   = jiti('../lib/guides.ts')
const seoConst = jiti('../lib/seo.ts')
const sitemapMod = jiti('../app/sitemap.ts')

// next.config redirects (CJS). Failure to load is non-fatal (skips that gate).
let REDIRECT_SOURCES = new Set()
try {
  const nextConfig = require(resolve(ROOT, 'next.config.js'))
  const cfg = typeof nextConfig === 'function' ? nextConfig({}, {}) : nextConfig
  const redirects = cfg && typeof cfg.redirects === 'function' ? await cfg.redirects() : []
  REDIRECT_SOURCES = new Set((redirects || []).map((r) => r.source))
} catch { /* redirects gate skipped */ }

// Priority commercial pages that MUST exist and expose a conversion path.
// (Conversion CTAs are rendered by the shared LandingPage template; here we
// verify the page exists and carries related products + FAQs — the data-level
// signals of a real conversion path.)
const PRIORITY_PAGES = [
  ['solutions', 'custom-carpets'],
  ['solutions', 'commercial-carpet-manufacturer'],
  ['solutions', 'carpet-exporter-india'],
  ['solutions', 'wholesale-carpet-supplier'],
  ['products', 'hand-knotted-carpet'],
  ['products', 'hand-tufted-carpet'],
  ['products', 'wall-to-wall-carpets'],
  ['industries', 'hotel-carpets'],
  ['india', 'delhi-ncr'],
  ['india', 'mumbai'],
  ['india', 'bhadohi'],
]

// Content-similarity thresholds (Jaccard over content word-sets within a cluster).
const SIM_ERROR = 0.90 // near-duplicate -> fail
const SIM_WARN  = 0.74 // high overlap -> warn

const { INDUSTRIES, SOLUTIONS, COUNTRIES, DHURRIES, COMPANY_PAGES, INDIA_LOCATIONS } = seo
const { PRODUCT_CATEGORIES } = products
const { GUIDES } = guides
const { SEO_BASE_URL } = seoConst

const errors = []
const warnings = []
const notes = []
const err  = (m) => errors.push(m)
const warn = (m) => warnings.push(m)
const note = (m) => notes.push(m)

// ── Clusters under audit ─────────────────────────────────────────────────────
const LANDING_CLUSTERS = {
  products:   { base: '/products',   items: PRODUCT_CATEGORIES },
  industries: { base: '/industries', items: INDUSTRIES },
  solutions:  { base: '/solutions',  items: SOLUTIONS },
  countries:  { base: '/countries',  items: COUNTRIES },
  india:      { base: '/india',      items: INDIA_LOCATIONS },
  dhurries:   { base: '/dhurries',   items: DHURRIES },
  company:    { base: '/company',    items: COMPANY_PAGES },
  guides:     { base: '/guides',     items: GUIDES },
}

const slugSet = (arr) => new Set(arr.map((x) => x.slug))
const SLUGS = {
  relatedProducts:   slugSet(PRODUCT_CATEGORIES),
  relatedIndustries: slugSet(INDUSTRIES),
  relatedSolutions:  slugSet(SOLUTIONS),
  relatedCountries:  slugSet(COUNTRIES),
  relatedIndia:      slugSet(INDIA_LOCATIONS),
  relatedDhurries:   slugSet(DHURRIES),
  relatedCompany:    slugSet(COMPANY_PAGES),
  relatedGuides:     slugSet(GUIDES),
}
// cluster base path -> valid slug set, for sitemap route resolution
const BASE_TO_SLUGS = Object.fromEntries(
  Object.values(LANDING_CLUSTERS).map(({ base, items }) => [base, slugSet(items)]),
)

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// ── 1. Duplicate slugs + slug format ─────────────────────────────────────────
for (const [name, { items }] of Object.entries(LANDING_CLUSTERS)) {
  if (!Array.isArray(items) || items.length === 0) { err(`[${name}] cluster empty or failed to load`); continue }
  const seen = new Map()
  for (const it of items) {
    if (!it.slug) { err(`[${name}] item with no slug: ${it.seoTitle || it.name || '?'}`); continue }
    if (!SLUG_RE.test(it.slug)) err(`[${name}] non-URL-safe slug "${it.slug}"`)
    seen.set(it.slug, (seen.get(it.slug) || 0) + 1)
  }
  for (const [slug, n] of seen) if (n > 1) err(`[${name}] duplicate slug "${slug}" (${n}x)`)
}

// ── 2. Duplicate titles / H1s / descriptions (warnings) ──────────────────────
const titleMap = new Map(), h1Map = new Map(), descMap = new Map()
const push = (map, key, where) => { if (!key) return; const a = map.get(key.trim()) || []; a.push(where); map.set(key.trim(), a) }
for (const [, { base, items }] of Object.entries(LANDING_CLUSTERS)) {
  for (const it of items) {
    const where = `${base}/${it.slug}`
    push(titleMap, it.seoTitle, where)
    push(h1Map, it.h1, where)
    push(descMap, it.seoDescription, where)
  }
}
const dupWarn = (map, label) => { for (const [k, w] of map) if (w.length > 1) warn(`Duplicate ${label} across ${w.length} pages: "${k.slice(0,55)}..." -> ${w.join(', ')}`) }
dupWarn(titleMap, 'SEO title'); dupWarn(h1Map, 'H1'); dupWarn(descMap, 'meta description')

// ── 3. Missing required fields + length advisories ───────────────────────────
for (const [name, { base, items }] of Object.entries(LANDING_CLUSTERS)) {
  const needsH1 = name !== 'products' && name !== 'guides'
  for (const it of items) {
    const where = `${base}/${it.slug}`
    if (!it.seoTitle)       err(`[${where}] missing seoTitle`)
    if (!it.seoDescription) err(`[${where}] missing seoDescription`)
    if (needsH1 && !it.h1)  err(`[${where}] missing h1`)
    if (Array.isArray(it.faqs) && it.faqs.length === 0) warn(`[${where}] empty faqs[] (FAQ schema omitted)`)
    if (it.seoTitle && it.seoTitle.length > 65) warn(`[${where}] seoTitle ${it.seoTitle.length} chars (>65 may truncate)`)
    if (it.seoDescription && it.seoDescription.length > 165) warn(`[${where}] meta description ${it.seoDescription.length} chars (>165 may truncate)`)
  }
}

// ── 4. Invalid related-page references ───────────────────────────────────────
for (const [name, { base, items }] of Object.entries(LANDING_CLUSTERS)) {
  for (const it of items) {
    const where = `${base}/${it.slug}`
    for (const field of Object.keys(SLUGS)) {
      const refs = it[field]
      if (!Array.isArray(refs)) continue
      for (const ref of refs) if (!SLUGS[field].has(ref)) err(`[${where}] ${field} -> "${ref}" does not resolve to a known slug`)
    }
  }
}

// ── 5. Sitemap <-> route validation ──────────────────────────────────────────
let sitemapEntries = []
try {
  const fn = sitemapMod.default || sitemapMod
  sitemapEntries = typeof fn === 'function' ? fn() : []
} catch (e) { err(`could not evaluate app/sitemap.ts: ${e.message}`) }

const sitemapPaths = new Set()
for (const entry of sitemapEntries) {
  const url = typeof entry === 'string' ? entry : entry.url
  if (!url) continue
  const path = url.startsWith(SEO_BASE_URL) ? url.slice(SEO_BASE_URL.length) || '/' : url
  sitemapPaths.add(path)
  // Dynamic cluster URLs must resolve to a real slug.
  const m = path.match(/^(\/[a-z-]+)\/([a-z0-9-]+)$/)
  if (m && BASE_TO_SLUGS[m[1]]) {
    if (!BASE_TO_SLUGS[m[1]].has(m[2])) err(`sitemap lists ${path} but "${m[2]}" is not a valid ${m[1]} slug (404/redirect risk)`)
  }
  // No fake freshness: lastModified must never be hardcoded in the sitemap.
  if (entry && entry.lastModified) err(`sitemap entry ${path} has a hardcoded lastModified (no-fake-freshness policy)`)
  // A configured redirect source must never be listed in the sitemap.
  if (REDIRECT_SOURCES.has(path)) err(`sitemap lists ${path} which is a configured redirect source (redirect URL in sitemap)`)
}

// ── 5b. noindex pages must not be in the sitemap ─────────────────────────────
for (const [name, { base, items }] of Object.entries(LANDING_CLUSTERS)) {
  for (const it of items) {
    if (it && it.noIndex === true && sitemapPaths.has(`${base}/${it.slug}`)) {
      err(`noindex page ${base}/${it.slug} is listed in the sitemap`)
    }
  }
}

// ── 6. Priority commercial pages: must exist and expose a conversion path ─────
for (const [cluster, slug] of PRIORITY_PAGES) {
  const item = LANDING_CLUSTERS[cluster]?.items.find((i) => i.slug === slug)
  const where = `/${cluster === 'products' ? 'products' : cluster}/${slug}`
  if (!item) { err(`priority page ${where} is missing from the registry`); continue }
  const hasProducts = Array.isArray(item.relatedProducts) && item.relatedProducts.length > 0
  const hasFaqs = Array.isArray(item.faqs) && item.faqs.length > 0
  if (!hasProducts && !hasFaqs) err(`priority page ${where} has no conversion-path signals (no related products or FAQs)`)
}

// ── 7. Near-duplicate detection within country / india / solution clusters ───
const STOP = new Set('a an the and or of to for in on with we our you your is are be as at by from that this it made rug rugs carpet carpets order india bhadohi buyers projects manufacturer supply custom'.split(' '))
const wordSet = (it) => {
  const text = [it.intro, it.overview, ...(it.sections || []).map((s) => s.body), ...(it.whyPoints || []).map((w) => w.desc), ...(it.applications || []).map((a) => a.desc)].join(' ').toLowerCase()
  return new Set(text.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3 && !STOP.has(w)))
}
const jaccard = (a, b) => { let inter = 0; for (const x of a) if (b.has(x)) inter++; const uni = a.size + b.size - inter; return uni ? inter / uni : 0 }
for (const name of ['countries', 'india', 'solutions']) {
  const items = LANDING_CLUSTERS[name].items
  const sets = items.map((it) => ({ slug: it.slug, ws: wordSet(it) }))
  let worst = { sim: 0, a: '', b: '' }
  for (let i = 0; i < sets.length; i++) for (let j = i + 1; j < sets.length; j++) {
    const sim = jaccard(sets[i].ws, sets[j].ws)
    if (sim > worst.sim) worst = { sim, a: sets[i].slug, b: sets[j].slug }
    if (sim >= SIM_ERROR) err(`[${name}] near-duplicate content: ${sets[i].slug} vs ${sets[j].slug} (Jaccard ${sim.toFixed(2)} >= ${SIM_ERROR})`)
    else if (sim >= SIM_WARN) warn(`[${name}] high content similarity: ${sets[i].slug} vs ${sets[j].slug} (Jaccard ${sim.toFixed(2)})`)
  }
  note(`${name}: worst-case content similarity ${worst.sim.toFixed(2)} (${worst.a} vs ${worst.b})`)
}

// Dynamic pages intentionally excluded from sitemap (phased rollout) -> note.
for (const [name, { base, items }] of Object.entries(LANDING_CLUSTERS)) {
  const excluded = items.map((i) => `${base}/${i.slug}`).filter((p) => !sitemapPaths.has(p))
  if (excluded.length) note(`${name}: ${excluded.length} page(s) not in sitemap (phased rollout): ${excluded.map((p) => p.split('/').pop()).join(', ')}`)
}

// ── Report ───────────────────────────────────────────────────────────────────
const total = Object.values(LANDING_CLUSTERS).reduce((n, c) => n + c.items.length, 0)
console.log(`\nSEO audit - ${total} landing URLs across ${Object.keys(LANDING_CLUSTERS).length} clusters; ${sitemapPaths.size} sitemap URLs`)
for (const [name, { items }] of Object.entries(LANDING_CLUSTERS)) console.log(`  ${name.padEnd(11)} ${items.length}`)
if (notes.length)    { console.log(`\nNOTES (${notes.length}):`);       for (const n of notes) console.log(`   - ${n}`) }
if (warnings.length) { console.log(`\nWARNINGS (${warnings.length}):`); for (const w of warnings) console.log(`   - ${w}`) }
if (errors.length) {
  console.log(`\nERRORS (${errors.length}):`)
  for (const e of errors) console.log(`   - ${e}`)
  console.log('')
  process.exit(1)
}
console.log(`\nOK - no errors. ${warnings.length} warning(s), ${notes.length} note(s).\n`)
