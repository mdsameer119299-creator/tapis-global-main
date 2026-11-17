#!/usr/bin/env node
// scripts/gsc-live-check.mjs — run: npm run seo:gsc:live
// LIVE, READ-ONLY verification of the 24 Search Console "Crawled – currently not indexed" URLs
// (docs/gsc/crawled-not-indexed.csv) against the deployed site.
//
// Safety guarantees
//   * Only HTTP GET is ever issued. No forms are submitted, no cookies are sent, nothing on production is changed.
//   * Only URLs whose origin is exactly ORIGIN (default https://www.tapisglobalinternational.com) are fetched.
//     Any other URL found in the sitemap or in page links is never requested; foreign sitemap entries are reported as a FAIL.
//     ORIGIN may be overridden only with a loopback http(s) origin (used by scripts/gsc-live-check.test.mjs).
//   * Redirects are NOT followed (a 3xx on a reported URL is a FAIL).
//
// Exit codes (a non-zero code is never a pass)
//   0  every check passed
//   1  one or more page checks FAILED
//   3  NOT RUN – host unreachable (DNS/TLS/connection/timeout). Nothing was verified.
//   4  NOT RUN – preflight failed: robots.txt or sitemap.xml returned an HTTP error or an invalid response
//
// Passing does not mean Google will index a URL; it only means the deployed page is technically indexable.
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const PROD = 'https://www.tapisglobalinternational.com'
const ORIGIN = (process.env.ORIGIN || PROD).replace(/\/$/, '')
const originUrl = new URL(ORIGIN)
const isLoopback = ['127.0.0.1', 'localhost', '[::1]'].includes(originUrl.hostname)
if (ORIGIN !== PROD && !isLoopback) { console.error(`REFUSED: ORIGIN may only be ${PROD} or a loopback address (got ${ORIGIN}).`); process.exit(2) }

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const csvPath = process.env.GSC_CSV || resolve(root, 'docs/gsc/crawled-not-indexed.csv')
const rows = readFileSync(csvPath, 'utf8').trim().split(/\r?\n/).slice(1).map((l) => l.split(',')[0]).filter(Boolean)
const TIMEOUT = Number(process.env.GSC_TIMEOUT_MS || 15000)
const UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'

const sameOrigin = (u) => { try { return new URL(u).origin === originUrl.origin } catch { return false } }
const norm = (u) => { const x = new URL(u); return x.origin + (x.pathname.replace(/\/$/, '') || '') }

// The ONLY network primitive. GET only, same origin only, no redirects, no body, no credentials.
async function get(u) {
  if (!sameOrigin(u)) throw Object.assign(new Error(`blocked non-origin URL ${u}`), { blocked: true })
  const r = await fetch(u, { method: 'GET', redirect: 'manual', credentials: 'omit', headers: { 'user-agent': UA }, signal: AbortSignal.timeout(TIMEOUT) })
  return { r, body: await r.text() }
}

const strip = (h) => h.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ').trim()
// content area = <main> only, with any nested header/nav/footer/aside removed. No <main> => no content (never the whole document).
function mainOf(html) {
  const s = html.indexOf('<main'); const e = html.lastIndexOf('</main>')
  if (s === -1 || e === -1 || e < s) return null
  return html.slice(s, e + 7).replace(/<(header|nav|footer|aside)\b[\s\S]*?<\/\1>/g, ' ')
}

// ── preflight: host reachable, robots.txt and sitemap.xml explicit statuses ──
function preflightFail(code, label, msg) { console.log(`NOT RUN (${label}): ${msg}\nNo page was verified. This is not a pass.`); process.exit(code) }
async function fetchPre(path) {
  try { return await get(ORIGIN + path) } catch (e) {
    preflightFail(3, 'host unreachable', `GET ${ORIGIN}${path} failed: ${e.cause?.code || e.name}: ${e.message}`)
  }
}
const robots = await fetchPre('/robots.txt')
if (robots.r.status !== 200) preflightFail(4, 'HTTP error', `robots.txt returned HTTP ${robots.r.status}${robots.r.headers.get('location') ? ' → ' + robots.r.headers.get('location') : ''}`)
if (!/^\s*user-agent:/im.test(robots.body)) preflightFail(4, 'invalid response', 'robots.txt has no User-agent directive (not a robots file)')
if (!new RegExp(`^\\s*sitemap:\\s*${ORIGIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/sitemap\\.xml\\s*$`, 'im').test(robots.body)) preflightFail(4, 'invalid response', `robots.txt does not reference ${ORIGIN}/sitemap.xml`)
const sm = await fetchPre('/sitemap.xml')
if (sm.r.status !== 200) preflightFail(4, 'HTTP error', `sitemap.xml returned HTTP ${sm.r.status}${sm.r.headers.get('location') ? ' → ' + sm.r.headers.get('location') : ''}`)
if (!/xml/i.test(sm.r.headers.get('content-type') || '')) preflightFail(4, 'invalid response', `sitemap.xml Content-Type is "${sm.r.headers.get('content-type')}", not XML`)
if (!/<urlset[^>]*sitemaps\.org\/schemas\/sitemap\/0\.9/.test(sm.body)) preflightFail(4, 'invalid response', 'sitemap.xml is not a valid <urlset> document')
const allLocs = [...sm.body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1])
if (allLocs.length === 0) preflightFail(4, 'invalid response', 'sitemap.xml contains no <loc> entries')
const locs = allLocs.filter(sameOrigin)
const foreign = allLocs.filter((u) => !sameOrigin(u))

const out = {}
const rec = (u, c, ok, d = '') => { (out[u] ||= []).push({ c, ok: ok === true, d }) }

// ── crawl ONLY same-origin sitemap URLs (read-only GETs) to build the contextual-link graph ──
const pages = {}, inbound = {}, crawlErrors = []
let idx = 0
await Promise.all(Array.from({ length: 4 }, async () => {
  while (idx < locs.length) {
    const u = locs[idx++]
    try {
      const { r, body } = await get(u); pages[norm(u)] = { r, body }
      if (r.status !== 200) continue
      const main = mainOf(body); if (!main) continue
      for (const m of main.matchAll(/<a\b[^>]*href="([^"#?]+)"/g)) {
        const t = m[1].startsWith('/') ? ORIGIN + m[1] : m[1]
        if (!sameOrigin(t) || norm(t) === norm(u)) continue // external/self links are not contextual internal links
        ;(inbound[norm(t)] ||= new Set()).add(norm(u))
      }
    } catch (e) { crawlErrors.push(`${u}: ${e.name}`) }
  }
}))

for (const u of rows) {
  if (!sameOrigin(u)) { rec(u, 'URL is on the production origin', false, 'fixture URL is off-origin; NOT fetched'); continue }
  const isSm = new URL(u).pathname === '/sitemap.xml'
  if (isSm) {
    rec(u, 'HTTP 200, no redirect', sm.r.status === 200, `HTTP ${sm.r.status}`)
    rec(u, 'Content-Type is XML', /xml/i.test(sm.r.headers.get('content-type') || ''), sm.r.headers.get('content-type') || 'none')
    rec(u, 'X-Robots-Tag not noindex', !/noindex/i.test(sm.r.headers.get('x-robots-tag') || ''), sm.r.headers.get('x-robots-tag') || 'none')
    rec(u, 'valid <urlset>', true, `${allLocs.length} URLs`)
    rec(u, 'lists the other reported URLs', rows.filter((x) => x !== u).every((x) => allLocs.includes(x)), '')
    rec(u, 'lists only production-origin URLs', foreign.length === 0, foreign.length ? `${foreign.length} foreign entries (never fetched), e.g. ${foreign[0]}` : 'all same-origin')
    continue
  }
  let p = pages[norm(u)]
  if (!p) { try { p = await get(u) } catch (e) { rec(u, 'fetch', false, `request failed: ${e.name}`); continue } }
  const { r, body } = p
  rec(u, 'HTTP 200, no redirect', r.status === 200, `HTTP ${r.status}${r.headers.get('location') ? ' → ' + r.headers.get('location') : ''}`)
  if (r.status !== 200) { for (const c of ['canonical = self', 'meta robots indexable', 'exactly one H1', 'breadcrumb nav', 'JSON-LD valid', '≥400 words in <main>', '≥1 contextual inbound link', 'contact/catalogue link']) rec(u, c, false, `not evaluated: HTTP ${r.status}`); continue }
  const can = (body.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/) || body.match(/<link[^>]*href="([^"]+)"[^>]*rel="canonical"/) || [])[1]
  rec(u, 'canonical = self', can === u, can || 'missing')
  const rb = (body.match(/<meta[^>]*name="robots"[^>]*content="([^"]*)"/) || body.match(/<meta[^>]*content="([^"]*)"[^>]*name="robots"/) || [])[1] || ''
  rec(u, 'meta robots indexable', !/noindex|nofollow/i.test(rb) , rb || 'none (default index)')
  rec(u, 'X-Robots-Tag not noindex', !/noindex/i.test(r.headers.get('x-robots-tag') || ''), r.headers.get('x-robots-tag') || 'none')
  const h1 = [...body.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => strip(m[1]))
  rec(u, 'exactly one H1', h1.length === 1, h1.join(' | ') || 'none')
  rec(u, 'breadcrumb nav', /<nav[^>]*aria-label="Breadcrumb"/.test(body), '')
  const ld = [...body.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1])
  let ldOk = ld.length > 0; try { ld.forEach((x) => JSON.parse(x)) } catch { ldOk = false }
  rec(u, 'JSON-LD valid', ldOk, `${ld.length} blocks`)
  const main = mainOf(body)
  const words = main ? strip(main).split(' ').filter(Boolean).length : 0
  rec(u, '≥400 words in <main>', main !== null && words >= 400, main ? `${words} words in <main> (nav/header/footer excluded)` : 'no <main> element found')
  rec(u, '≥1 contextual inbound link', (inbound[norm(u)]?.size || 0) >= 1, `${inbound[norm(u)]?.size || 0} same-origin pages link here from <main>`)
  rec(u, 'contact/catalogue link', !!main && /href="\/(contact|catalogue)/.test(main), '')
}

let n = 0, pass = 0, fail = 0
for (const [u, cs] of Object.entries(out)) {
  console.log(`${String(++n).padStart(2)}. ${u.replace(ORIGIN, '') || '/'}`)
  for (const c of cs) { c.ok ? pass++ : fail++; console.log(`      ${c.ok ? 'PASS' : 'FAIL'} ${c.c}  ${c.d}`) }
}
if (foreign.length) console.log(`\nNote: ${foreign.length} sitemap entries are off-origin and were never fetched.`)
if (crawlErrors.length) console.log(`Note: ${crawlErrors.length} same-origin sitemap URLs could not be fetched for the link graph (inbound counts may be understated): ${crawlErrors.slice(0, 3).join('; ')}`)
console.log(`\nLIVE RESULT: ${pass} PASS, ${fail} FAIL, 0 SKIPPED. ${fail ? 'NOT a pass.' : ''} This does not say whether Google will index any URL.`)
process.exit(fail ? 1 : 0)
