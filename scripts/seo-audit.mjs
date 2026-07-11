// scripts/seo-audit.mjs
// Static SEO integrity check over the route registries. Run: `npm run seo:audit`.
//
// Loads the real TypeScript data modules (via jiti, already a Next dependency)
// and reports, per cluster and across the site:
//   - duplicate slugs
//   - duplicate SEO titles / H1s / meta descriptions
//   - missing required SEO fields
//   - invalid internal related-page references (related* → unknown slug)
//   - sitemap registry inconsistencies (empty cluster / count mismatch)
//
// Exits non-zero if any ERROR-level problem is found, so it can gate CI/builds.
// Intentionally small: no framework, no network, no build step.

import { createRequire } from 'module'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const __filename = fileURLToPath(import.meta.url)
const jiti = require('jiti')(__filename, { interopDefault: true })

const seo      = jiti('../lib/seo-landing.ts')
const products = jiti('../lib/products.ts')
const guides   = jiti('../lib/guides.ts')

const { INDUSTRIES, SOLUTIONS, COUNTRIES, DHURRIES, COMPANY_PAGES, INDIA_LOCATIONS } = seo
const { PRODUCT_CATEGORIES } = products
const { GUIDES } = guides

const errors = []
const warnings = []
const err  = (m) => errors.push(m)
const warn = (m) => warnings.push(m)

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

// Valid slug sets for related-reference resolution.
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

// ── 1. Duplicate slugs (within cluster) + sitemap consistency ────────────────
for (const [name, { items }] of Object.entries(LANDING_CLUSTERS)) {
  if (!Array.isArray(items) || items.length === 0) {
    err(`[${name}] cluster is empty or failed to load`)
    continue
  }
  const seen = new Map()
  for (const it of items) {
    if (!it.slug) { err(`[${name}] item with no slug: ${it.seoTitle || it.name || '?'}`); continue }
    seen.set(it.slug, (seen.get(it.slug) || 0) + 1)
  }
  for (const [slug, n] of seen) if (n > 1) err(`[${name}] duplicate slug "${slug}" (${n}×)`)
}

// ── 2. Duplicate SEO titles / H1s / meta descriptions (site-wide) ────────────
const titleMap = new Map()
const h1Map    = new Map()
const descMap  = new Map()
const pushDup = (map, key, where) => { if (!key) return; const a = map.get(key.trim()) || []; a.push(where); map.set(key.trim(), a) }

for (const [name, { base, items }] of Object.entries(LANDING_CLUSTERS)) {
  for (const it of items) {
    const where = `${base}/${it.slug}`
    pushDup(titleMap, it.seoTitle, where)
    pushDup(h1Map,   it.h1,        where) // products use `name` instead of h1; skipped if absent
    pushDup(descMap, it.seoDescription, where)
  }
}
const reportDup = (map, label) => {
  for (const [key, where] of map) {
    if (where.length > 1) err(`Duplicate ${label} across ${where.length} pages: "${key.slice(0, 60)}…" → ${where.join(', ')}`)
  }
}
reportDup(titleMap, 'SEO title')
reportDup(h1Map,    'H1')
reportDup(descMap,  'meta description')

// ── 3. Missing required SEO fields ───────────────────────────────────────────
// Products carry `name` instead of `h1`; landing clusters require `h1`.
for (const [name, { base, items }] of Object.entries(LANDING_CLUSTERS)) {
  const needsH1 = name !== 'products' && name !== 'guides'
  for (const it of items) {
    const where = `${base}/${it.slug}`
    if (!it.seoTitle)       err(`[${where}] missing seoTitle`)
    if (!it.seoDescription) err(`[${where}] missing seoDescription`)
    if (needsH1 && !it.h1)  err(`[${where}] missing h1`)
    if (Array.isArray(it.faqs) && it.faqs.length === 0) warn(`[${where}] empty faqs[] (FAQ schema will be omitted)`)
    if (it.seoTitle && it.seoTitle.length > 65) warn(`[${where}] seoTitle ${it.seoTitle.length} chars (>65 may truncate)`)
    if (it.seoDescription && it.seoDescription.length > 165) warn(`[${where}] meta description ${it.seoDescription.length} chars (>165 may truncate)`)
  }
}

// ── 4. Invalid internal related-page references ──────────────────────────────
const RELATED_FIELDS = Object.keys(SLUGS)
for (const [name, { base, items }] of Object.entries(LANDING_CLUSTERS)) {
  for (const it of items) {
    const where = `${base}/${it.slug}`
    for (const field of RELATED_FIELDS) {
      const refs = it[field]
      if (!Array.isArray(refs)) continue
      for (const ref of refs) {
        if (!SLUGS[field].has(ref)) err(`[${where}] ${field} → "${ref}" does not resolve to a known slug`)
        if (field === `related${name[0].toUpperCase()}${name.slice(1)}` && ref === it.slug) warn(`[${where}] ${field} references itself`)
      }
    }
  }
}

// ── Report ───────────────────────────────────────────────────────────────────
const total = Object.values(LANDING_CLUSTERS).reduce((n, c) => n + c.items.length, 0)
console.log(`\nSEO audit — ${total} landing URLs across ${Object.keys(LANDING_CLUSTERS).length} clusters`)
for (const [name, { items }] of Object.entries(LANDING_CLUSTERS)) console.log(`  ${name.padEnd(11)} ${items.length}`)

if (warnings.length) {
  console.log(`\n⚠️  ${warnings.length} warning(s):`)
  for (const w of warnings) console.log(`   - ${w}`)
}
if (errors.length) {
  console.log(`\n❌ ${errors.length} error(s):`)
  for (const e of errors) console.log(`   - ${e}`)
  console.log('')
  process.exit(1)
}
console.log(`\n✅ No errors. ${warnings.length} warning(s).\n`)
