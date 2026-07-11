// scripts/seo-audit-production.mjs
// SAFE, STRICT-BY-DEFAULT live audit of the deployed site.
//   npm run seo:audit:production                    # strict: must reach & audit production
//   npm run seo:audit:production -- --allow-offline # may SKIP (exit 0) ONLY if unreachable
//
// READ-ONLY: GET requests only (redirect:'manual'). It NEVER submits forms,
// mutates data, or hits non-GET endpoints. No POST/PUT/PATCH/DELETE, no
// indexing/Search-Console/deploy/repo mutations.
//
// Outcomes:
//   PASS    — production was reached AND every sampled URL audited AND no critical errors.  exit 0
//   FAIL    — production could not be reached (strict), the audit was incomplete, the
//             sitemap was missing/non-2xx/unparseable/empty, or critical SEO errors found.  exit 1
//   SKIPPED — ONLY when --allow-offline was supplied AND production was unreachable
//             (network/DNS/timeout). Prints a loud banner; never prints PASS/SUCCESS.       exit 0
//
// A non-2xx / unparseable / empty sitemap is treated as a REACHED-but-broken failure and
// FAILS even with --allow-offline (that flag only rescues true unreachability).
//
// Env:
//   AUDIT_BASE_URL         override the audited origin (default SEO_BASE_URL)
//   AUDIT_EXPECTED_ORIGIN  expected canonical origin (default: origin of SEO_BASE_URL)
//   AUDIT_MAX              cap number of URLs checked (default 60)
//   AUDIT_TIMEOUT          per-request timeout ms (default 15000)
//   AUDIT_ALLOW_OFFLINE=1  same as --allow-offline

import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const require = createRequire(import.meta.url)
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const jiti = require('jiti')(fileURLToPath(import.meta.url), { interopDefault: true, alias: { '@': ROOT } })
const { SEO_BASE_URL } = jiti('../lib/seo.ts')

const argv = process.argv.slice(2)
const ALLOW_OFFLINE = argv.includes('--allow-offline') || process.env.AUDIT_ALLOW_OFFLINE === '1'
const BASE = (process.env.AUDIT_BASE_URL || SEO_BASE_URL).replace(/\/$/, '')
const EXPECTED_ORIGIN = process.env.AUDIT_EXPECTED_ORIGIN || new URL(SEO_BASE_URL).origin
const MAX = Number(process.env.AUDIT_MAX || 60)
const TIMEOUT = Number(process.env.AUDIT_TIMEOUT || 15000)
const UA = 'TapisGlobal-SEO-Audit/2.0 (+read-only)'

const errors = []
const warnings = []
const err = (m) => errors.push(m)
const warn = (m) => warnings.push(m)

// ── Final-outcome reporters (single source of truth for exit codes) ──────────
function fail(reason, { incomplete = false } = {}) {
  if (warnings.length) { console.log(`\nWARNINGS (${warnings.length}):`); for (const w of warnings) console.log(`   - ${w}`) }
  if (errors.length)   { console.log(`\nERRORS (${errors.length}):`);   for (const e of errors) console.log(`   - ${e}`) }
  console.log(`\n==================================================`)
  console.log(`PRODUCTION AUDIT FAILED — ${reason}${incomplete ? ' (audit INCOMPLETE)' : ''}`)
  console.log(`==================================================\n`)
  process.exit(1)
}
function skipped(reason) {
  console.log(`\n==================================================`)
  console.log(`PRODUCTION AUDIT SKIPPED — OFFLINE MODE EXPLICITLY ENABLED`)
  console.log(`reason: ${reason}`)
  console.log(`(no production audit was performed — this is NOT a pass)`)
  console.log(`==================================================\n`)
  process.exit(0)
}
function pass(count) {
  if (warnings.length) { console.log(`\nWARNINGS (${warnings.length}):`); for (const w of warnings) console.log(`   - ${w}`) }
  console.log(`\n==================================================`)
  console.log(`PRODUCTION AUDIT PASSED — ${count} URL(s) audited, 0 critical errors`)
  console.log(`==================================================\n`)
  process.exit(0)
}

// ── Read-only fetch with timeout. Returns {reached, network, status, ...} ─────
async function get(url, method = 'GET') {
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), TIMEOUT)
  try {
    const res = await fetch(url, { method, redirect: 'manual', headers: { 'User-Agent': UA }, signal: ac.signal })
    const body = method === 'GET' && res.status >= 200 && res.status < 300 ? await res.text() : ''
    return { reached: true, status: res.status, location: res.headers.get('location'), xRobots: (res.headers.get('x-robots-tag') || '').toLowerCase(), body }
  } catch (e) {
    return { reached: false, network: true, reason: e.name === 'AbortError' ? `timeout after ${TIMEOUT}ms` : e.message }
  } finally {
    clearTimeout(timer)
  }
}

function stripSlash(p) { return p.length > 1 ? p.replace(/\/$/, '') : p }

function extract(html) {
  const canonMatches = [...html.matchAll(/<link[^>]+rel=["']canonical["'][^>]*>/gi)]
  const canonicalCount = canonMatches.length
  const canonical = canonicalCount ? (canonMatches[0][0].match(/href=["']([^"']+)["']/i)?.[1] || null) : null
  const robotsMeta = (html.match(/<meta[^>]+name=["']robots["'][^>]*>/i) || [''])[0].toLowerCase()
  const noindexMeta = /noindex/.test(robotsMeta)
  const jsonLd = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1])
  let hasBreadcrumb = false, breadcrumbValid = false
  const breadcrumbIds = new Set()
  const webpageRefs = []
  for (const raw of jsonLd) {
    try {
      const data = JSON.parse(raw)
      const nodes = data['@graph'] || [data]
      for (const n of nodes) {
        if (n['@type'] === 'BreadcrumbList') {
          hasBreadcrumb = true
          const okList = Array.isArray(n.itemListElement) && n.itemListElement.length >= 2
          if (okList) breadcrumbValid = true
          if (n['@id'] && okList) breadcrumbIds.add(n['@id'])
        }
        if (n['@type'] === 'WebPage' && n.breadcrumb && n.breadcrumb['@id']) webpageRefs.push(n.breadcrumb['@id'])
      }
    } catch { /* unparseable node ignored */ }
  }
  // Every WebPage breadcrumb reference must resolve to a valid BreadcrumbList node.
  const danglingRefs = webpageRefs.filter((id) => !breadcrumbIds.has(id))
  const h1Count = (html.match(/<h1[\s>]/gi) || []).length
  return { canonical, canonicalCount, noindexMeta, hasBreadcrumb, breadcrumbValid, danglingRefs, h1Count }
}

async function main() {
  console.log(`\nProduction SEO audit -> ${BASE}  (strict=${!ALLOW_OFFLINE}, timeout=${TIMEOUT}ms)`)

  // ── 1. Sitemap ─────────────────────────────────────────────────────────────
  const sm = await get(`${BASE}/sitemap.xml`)
  if (!sm.reached) {
    // True unreachability (network/DNS/timeout) — the ONLY case --allow-offline rescues.
    if (ALLOW_OFFLINE) skipped(`could not reach ${BASE}/sitemap.xml (${sm.reason})`)
    fail(`could not reach ${BASE}/sitemap.xml (${sm.reason})`, { incomplete: true })
  }
  if (sm.status < 200 || sm.status >= 300) fail(`sitemap.xml returned HTTP ${sm.status} (reached but non-2xx)`, { incomplete: true })
  if (!/<urlset|<sitemapindex|<loc>/i.test(sm.body)) fail(`sitemap.xml is not valid sitemap XML (unparseable)`, { incomplete: true })
  const sitemapUrls = [...sm.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim()).filter(Boolean)
  if (sitemapUrls.length === 0) fail(`sitemap.xml contained 0 <loc> URLs`, { incomplete: true })
  console.log(`  sitemap.xml: ${sm.status} OK, ${sitemapUrls.length} URLs`)

  // ── 2. Deterministic sample: homepage first, then round-robin every cluster ─
  const byPrefix = new Map()
  for (const u of sitemapUrls) {
    let pathname
    try { pathname = new URL(u).pathname } catch { fail(`sitemap contains a malformed URL: ${u}`, { incomplete: true }) }
    const p = pathname.split('/')[1] || 'root'
    byPrefix.set(p, [...(byPrefix.get(p) || []), u])
  }
  const prefixes = [...byPrefix.keys()]
  const sample = []
  const home = sitemapUrls.find((u) => { try { return new URL(u).pathname === '/' } catch { return false } })
  if (home) { sample.push(home); const list = byPrefix.get('root') || []; const i = list.indexOf(home); if (i >= 0) list.splice(i, 1) }
  let idx = 0
  while (sample.length < Math.min(MAX, sitemapUrls.length)) {
    const list = byPrefix.get(prefixes[idx % prefixes.length])
    if (list && list.length) sample.push(list.shift())
    idx++
    if (prefixes.every((k) => (byPrefix.get(k) || []).length === 0)) break
  }
  const coveredClusters = new Set(sample.map((u) => new URL(u).pathname.split('/')[1] || 'root'))
  console.log(`  sampling ${sample.length} URLs across ${coveredClusters.size} clusters: ${[...coveredClusters].join(', ')}`)

  // ── 3. Audit each sampled URL (read-only GET). Incompleteness => FAIL. ───────
  let ok = 0, incomplete = 0
  for (const url of sample) {
    const path = new URL(url).pathname
    let r = await get(url)
    if (!r.reached) { r = await get(url) } // single retry to absorb a transient blip
    if (!r.reached) { err(`${path} -> NETWORK FAIL (${r.reason}) — could not inspect (audit incomplete)`); incomplete++; continue }
    if (r.status >= 300 && r.status < 400) { err(`${path} -> HTTP ${r.status} redirect to ${r.location} (redirecting URL in sitemap)`); continue }
    if (r.status !== 200) { err(`${path} -> HTTP ${r.status} (non-200 URL in sitemap)`); continue }

    const x = extract(r.body)
    // robots / indexability (meta robots and X-Robots-Tag are distinct from robots.txt).
    if (x.noindexMeta) err(`${path} has meta robots noindex but is in the sitemap`)
    if (/noindex/.test(r.xRobots)) err(`${path} sends X-Robots-Tag noindex but is in the sitemap`)
    // canonical
    if (x.canonicalCount === 0) err(`${path} has no canonical tag`)
    else if (x.canonicalCount > 1) err(`${path} has ${x.canonicalCount} canonical tags`)
    else {
      let cu
      try { cu = new URL(x.canonical) } catch { cu = null }
      if (!cu) err(`${path} has a malformed canonical: "${x.canonical}"`)
      else if (cu.origin !== EXPECTED_ORIGIN) err(`${path} canonical points to unexpected origin ${cu.origin} (expected ${EXPECTED_ORIGIN})`)
      else if (stripSlash(cu.pathname) !== stripSlash(path)) err(`${path} canonical path mismatch -> ${cu.pathname}`)
    }
    // h1
    if (x.h1Count === 0) err(`${path} has no <h1>`)
    else if (x.h1Count > 1) err(`${path} has ${x.h1Count} <h1> tags`)
    // breadcrumb
    if (x.hasBreadcrumb && !x.breadcrumbValid) err(`${path} BreadcrumbList has <2 itemListElement (Missing field risk)`)
    if (x.danglingRefs.length) err(`${path} WebPage.breadcrumb @id ${x.danglingRefs.join(', ')} resolves to no valid BreadcrumbList node`)
    ok++
  }

  console.log(`  audited ${sample.length} URLs; ${ok} clean 200 responses; ${incomplete} unreachable`)
  if (incomplete > 0) fail(`${incomplete} sampled URL(s) could not be inspected`, { incomplete: true })
  if (errors.length)  fail(`${errors.length} critical SEO error(s) on production`)
  pass(ok)
}

main().catch((e) => fail(`fatal runtime error: ${e && e.stack ? e.stack.split('\n')[0] : e}`, { incomplete: true }))
