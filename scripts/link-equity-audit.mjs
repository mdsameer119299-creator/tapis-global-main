// scripts/link-equity-audit.mjs
// Internal link equity audit. Run: `npm run seo:audit:links`.
//
// For every landing page, counts how many OTHER pages' related*[] arrays
// reference its slug (the real inbound-internal-link signal for this
// data-driven site), and cross-references against a business-importance
// tier so "linked because present in nav" and "linked because important"
// can be told apart. Read-only, reports only — never fails the build,
// since some zero-inbound pages (e.g. Class-C country pages held back
// from the sitemap) are intentional. Re-run after adding new landing
// pages or related*[] entries to catch newly orphaned priority pages.

import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const require = createRequire(import.meta.url)
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const jiti = require('jiti')(fileURLToPath(import.meta.url), { interopDefault: true, alias: { '@': ROOT } })

const seo      = jiti('../lib/seo-landing.ts')
const products = jiti('../lib/products.ts')
const guides   = jiti('../lib/guides.ts')

const { INDUSTRIES, SOLUTIONS, COUNTRIES, DHURRIES, COMPANY_PAGES, INDIA_LOCATIONS, USA_STATES, USA_CITIES } = seo
const { PRODUCT_CATEGORIES } = products
const { GUIDES } = guides

const CLUSTERS = {
  products:   { base: '/products',   items: PRODUCT_CATEGORIES },
  industries: { base: '/industries', items: INDUSTRIES },
  solutions:  { base: '/solutions',  items: SOLUTIONS },
  countries:  { base: '/countries',  items: COUNTRIES },
  india:      { base: '/india',      items: INDIA_LOCATIONS },
  dhurries:   { base: '/dhurries',   items: DHURRIES },
  company:    { base: '/company',    items: COMPANY_PAGES },
  guides:     { base: '/guides',     items: GUIDES },
  'usa-states': { base: '/usa',      items: USA_STATES },
  'usa-cities': { base: '/usa',      items: USA_CITIES },
}

// Business-importance tier — Class A mirrors scripts/seo-audit.mjs
// PRIORITY_PAGES plus each cluster's hub-equivalent "flagship" entries.
const CLASS_A = new Set([
  'hand-knotted-carpet', 'hand-tufted-carpet', 'wall-to-wall-carpets',
  'custom-carpets', 'commercial-carpet-manufacturer', 'carpet-exporter-india',
  'wholesale-carpet-supplier', 'hotel-carpets', 'delhi-ncr', 'mumbai', 'bhadohi',
  'why-bhadohi', 'factory', 'quality-control',
])

const allSlugs = []
for (const [cluster, { items }] of Object.entries(CLUSTERS)) {
  for (const it of items) allSlugs.push({ cluster, slug: it.slug, item: it })
}

const inboundCount = new Map(allSlugs.map(({ slug }) => [slug, 0]))
const relatedFieldRe = /related[A-Za-z]*/

for (const { item } of allSlugs) {
  for (const key of Object.keys(item)) {
    if (!relatedFieldRe.test(key)) continue
    const val = item[key]
    if (!Array.isArray(val)) continue
    for (const ref of val) {
      if (typeof ref === 'string' && inboundCount.has(ref)) {
        inboundCount.set(ref, inboundCount.get(ref) + 1)
      }
    }
  }
}

const rows = allSlugs.map(({ cluster, slug }) => ({
  cluster, slug, inbound: inboundCount.get(slug) ?? 0, tier: CLASS_A.has(slug) ? 'A' : '',
}))

// Zero-inbound pages, Class A first, then rest grouped by cluster.
const zero = rows.filter(r => r.inbound === 0)
const zeroA = zero.filter(r => r.tier === 'A')
const zeroOther = zero.filter(r => r.tier !== 'A')

console.log(`\nTotal pages audited: ${rows.length}`)
console.log(`Pages with ZERO inbound related[] links: ${zero.length}`)
console.log(`\n=== ZERO-INBOUND: Class A (priority/money pages) — ${zeroA.length} ===`)
for (const r of zeroA) console.log(`  ${r.cluster}/${r.slug}`)

console.log(`\n=== ZERO-INBOUND: all others, by cluster — ${zeroOther.length} ===`)
const byCluster = {}
for (const r of zeroOther) (byCluster[r.cluster] ||= []).push(r.slug)
for (const [c, slugs] of Object.entries(byCluster)) {
  console.log(`  ${c} (${slugs.length}): ${slugs.slice(0, 12).join(', ')}${slugs.length > 12 ? ', ...' : ''}`)
}

console.log(`\n=== Class A pages — full inbound count (sanity check) ===`)
for (const r of rows.filter(r => r.tier === 'A')) console.log(`  ${r.cluster}/${r.slug}: ${r.inbound}`)

console.log(`\n=== Distribution (non-zero) ===`)
const nonZero = rows.filter(r => r.inbound > 0).map(r => r.inbound).sort((a, b) => a - b)
if (nonZero.length) {
  console.log(`  min=${nonZero[0]} median=${nonZero[Math.floor(nonZero.length/2)]} max=${nonZero[nonZero.length-1]}`)
}
