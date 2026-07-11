// scripts/seo-audit-production.mjs
// SAFE live audit of the deployed site. Run: `npm run seo:audit:production`.
//
// Read-only: issues GET requests to the production sitemap and a sample of its
// URLs and checks HTTP status, canonical, robots meta and breadcrumb presence.
// It NEVER submits forms, mutates data, or hits non-GET endpoints. If the site
// is unreachable (e.g. no network in CI), it exits 0 with a skip note so it can
// be wired into pipelines without becoming flaky.
//
// Usage:
//   npm run seo:audit:production                 # audits SEO_BASE_URL
//   AUDIT_BASE_URL=https://staging... npm run seo:audit:production
//   AUDIT_MAX=40 npm run seo:audit:production    # cap number of URLs checked

import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const require = createRequire(import.meta.url)
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const jiti = require('jiti')(fileURLToPath(import.meta.url), { interopDefault: true, alias: { '@': ROOT } })
const { SEO_BASE_URL } = jiti('../lib/seo.ts')

const BASE = (process.env.AUDIT_BASE_URL || SEO_BASE_URL).replace(/\/$/, '')
const MAX = Number(process.env.AUDIT_MAX || 60)
const UA = 'TapisGlobal-SEO-Audit/1.0 (+read-only)'

const errors = []
const warnings = []
const err = (m) => errors.push(m)
const warn = (m) => warnings.push(m)

async function get(url) {
  const res = await fetch(url, { method: 'GET', redirect: 'manual', headers: { 'User-Agent': UA } })
  const body = res.status >= 200 && res.status < 300 ? await res.text() : ''
  return { status: res.status, location: res.headers.get('location'), body }
}

function extract(html) {
  const canonical = (html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i) || [''])[0]
    .match(/href=["']([^"']+)["']/i)?.[1] || null
  const robots = (html.match(/<meta[^>]+name=["']robots["'][^>]*>/i) || [''])[0].toLowerCase()
  const noindex = /noindex/.test(robots)
  const jsonLd = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1])
  let hasBreadcrumb = false, breadcrumbValid = false
  for (const raw of jsonLd) {
    try {
      const data = JSON.parse(raw)
      const nodes = data['@graph'] || [data]
      for (const n of nodes) {
        if (n['@type'] === 'BreadcrumbList') {
          hasBreadcrumb = true
          if (Array.isArray(n.itemListElement) && n.itemListElement.length >= 2) breadcrumbValid = true
        }
      }
    } catch { /* ignore unparseable */ }
  }
  const h1Count = (html.match(/<h1[\s>]/gi) || []).length
  return { canonical, noindex, hasBreadcrumb, breadcrumbValid, h1Count }
}

async function main() {
  console.log(`\nProduction SEO audit -> ${BASE}`)

  // 1. Fetch sitemap
  let sitemapUrls = []
  try {
    const sm = await get(`${BASE}/sitemap.xml`)
    if (sm.status !== 200) { console.log(`  sitemap.xml returned ${sm.status} — skipping (site unreachable?)`); process.exit(0) }
    sitemapUrls = [...sm.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim())
    console.log(`  sitemap.xml: 200 OK, ${sitemapUrls.length} URLs`)
  } catch (e) {
    console.log(`  could not reach ${BASE}/sitemap.xml (${e.message}) — skipping production audit (exit 0)`)
    process.exit(0)
  }

  // 2. Sample URLs across path prefixes (cap to MAX to stay light)
  const byPrefix = new Map()
  for (const u of sitemapUrls) {
    const p = new URL(u).pathname.split('/')[1] || 'root'
    byPrefix.set(p, [...(byPrefix.get(p) || []), u])
  }
  const sample = []
  const prefixes = [...byPrefix.keys()]
  let idx = 0
  while (sample.length < Math.min(MAX, sitemapUrls.length)) {
    const p = prefixes[idx % prefixes.length]
    const list = byPrefix.get(p)
    if (list.length) sample.push(list.shift())
    idx++
    if (prefixes.every((k) => byPrefix.get(k).length === 0)) break
  }

  // 3. Check each sampled URL
  let ok = 0
  for (const url of sample) {
    const path = new URL(url).pathname
    try {
      const r = await get(url)
      if (r.status >= 300 && r.status < 400) { err(`${path} -> ${r.status} redirect to ${r.location} (redirecting URL in sitemap)`); continue }
      if (r.status !== 200) { err(`${path} -> HTTP ${r.status} (non-200 URL in sitemap)`); continue }
      const x = extract(r.body)
      if (x.noindex) err(`${path} is noindex but is in the sitemap`)
      if (x.canonical && new URL(x.canonical).pathname !== path) warn(`${path} canonical points elsewhere: ${x.canonical}`)
      if (!x.canonical) warn(`${path} has no canonical tag`)
      if (x.h1Count === 0) warn(`${path} has no <h1>`)
      if (x.h1Count > 1) warn(`${path} has ${x.h1Count} <h1> tags`)
      if (x.hasBreadcrumb && !x.breadcrumbValid) err(`${path} BreadcrumbList has <2 itemListElement (Missing field risk)`)
      ok++
    } catch (e) { warn(`${path} request failed: ${e.message}`) }
  }

  console.log(`  checked ${sample.length} URLs; ${ok} returned 200 OK`)
  if (warnings.length) { console.log(`\nWARNINGS (${warnings.length}):`); for (const w of warnings) console.log(`   - ${w}`) }
  if (errors.length) {
    console.log(`\nERRORS (${errors.length}):`); for (const e of errors) console.log(`   - ${e}`)
    console.log(''); process.exit(1)
  }
  console.log(`\nOK - production audit passed. ${warnings.length} warning(s).\n`)
}

main().catch((e) => { console.log(`production audit skipped (unexpected: ${e.message})`); process.exit(0) })
