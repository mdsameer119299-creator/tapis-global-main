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
//   WARNINGS (reported, non-fatal):
//     - duplicate SEO titles / H1s / meta descriptions across pages
//     - over-length titles / descriptions
//     - dynamic pages intentionally excluded from the sitemap (phased rollout)
//
// Intentionally small: no framework, no network, no crawler.

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
  if (entry && entry.lastModified) warn(`sitemap entry ${path} has lastModified (should be omitted unless backed by a real content date)`)
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
