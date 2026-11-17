#!/usr/bin/env node
// scripts/gsc-live-check.mjs — run: npm run seo:gsc:live   (LIVE production, read-only GET requests)
// Verifies the 24 Search Console "Crawled – currently not indexed" URLs against the DEPLOYED site:
// status, redirect behaviour, canonical, meta robots, X-Robots-Tag, H1 count, breadcrumb, JSON-LD validity,
// word count, and (for /sitemap.xml) Content-Type + valid <urlset> + coverage of the other 23 URLs.
// Also builds a link graph from the live sitemap to count contextual inbound links per URL.
// Requires outbound HTTPS to the production host. Exits 1 on any FAIL; an unreachable host is reported as
// SKIPPED (exit 3), never as a pass.
//   ORIGIN=https://www.tapisglobalinternational.com node scripts/gsc-live-check.mjs
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const ORIGIN = (process.env.ORIGIN || 'https://www.tapisglobalinternational.com').replace(/\/$/, '')
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const rows = readFileSync(resolve(root, 'docs/gsc/crawled-not-indexed.csv'), 'utf8').trim().split(/\r?\n/).slice(1).map((l) => l.split(',')[0])
const get = async (u) => { const r = await fetch(u, { redirect: 'manual', headers: { 'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' } }); return { r, body: await r.text() } }
const strip = (h) => h.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
const out = {}; let fails = 0
const rec = (u, c, ok, d) => { (out[u] ||= []).push({ c, ok, d }); if (ok === false) fails++ }

try { await get(ORIGIN + '/robots.txt') } catch (e) { console.log(`SKIPPED: cannot reach ${ORIGIN} (${e.message}). Live checks were NOT run.`); process.exit(3) }

// live sitemap + link graph (for inbound counts)
const sm = await get(ORIGIN + '/sitemap.xml')
const locs = [...sm.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
const inbound = {}
const pages = {}
let i = 0
await Promise.all(Array.from({ length: 6 }, async () => { while (i < locs.length) { const u = locs[i++]; try { const { r, body } = await get(u); pages[u] = { r, body }
  const main = (body.match(/<main[\s\S]*<\/main>/) || [body])[0]
  for (const h of new Set([...main.matchAll(/<a\b[^>]*href="([^"#?]+)"/g)].map((m) => m[1]))) { const t = h.startsWith('/') ? ORIGIN + h : h; if (t !== u) (inbound[t.replace(/\/$/, '')] ||= new Set()).add(u) } } catch {} } }))

for (const u of rows) {
  if (u.endsWith('/sitemap.xml')) {
    rec(u, 'status 200, no redirect', sm.r.status === 200, `status ${sm.r.status}${sm.r.headers.get('location') ? ' → ' + sm.r.headers.get('location') : ''}`)
    rec(u, 'content-type xml', /xml/.test(sm.r.headers.get('content-type') || ''), sm.r.headers.get('content-type'))
    rec(u, 'X-Robots-Tag absent/indexable', !/noindex/i.test(sm.r.headers.get('x-robots-tag') || ''), sm.r.headers.get('x-robots-tag') || 'none')
    rec(u, 'valid <urlset>', /<urlset[^>]*sitemaps\.org\/schemas\/sitemap\/0\.9/.test(sm.body), `${locs.length} URLs`)
    rec(u, 'lists the other 23 reported URLs', rows.filter((x) => x !== u).every((x) => locs.includes(x)), '')
    continue
  }
  const p = pages[u] || await get(u).then((x) => x).catch(() => null)
  if (!p) { rec(u, 'fetch', false, 'request failed'); continue }
  const { r, body } = p
  rec(u, 'status 200, no redirect', r.status === 200, `status ${r.status}${r.headers.get('location') ? ' → ' + r.headers.get('location') : ''}`)
  const can = (body.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/) || body.match(/<link[^>]*href="([^"]+)"[^>]*rel="canonical"/) || [])[1]
  rec(u, 'canonical = self', can === u, can || 'missing')
  const rb = (body.match(/<meta[^>]*name="robots"[^>]*content="([^"]*)"/) || body.match(/<meta[^>]*content="([^"]*)"[^>]*name="robots"/) || [])[1] || ''
  rec(u, 'meta robots indexable', !/noindex|nofollow/i.test(rb), rb || 'none (default index)')
  rec(u, 'X-Robots-Tag absent/indexable', !/noindex/i.test(r.headers.get('x-robots-tag') || ''), r.headers.get('x-robots-tag') || 'none')
  const h1 = [...body.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => strip(m[1]))
  rec(u, 'exactly one H1', h1.length === 1, h1.join(' | '))
  rec(u, 'breadcrumb nav', /<nav[^>]*aria-label="Breadcrumb"/.test(body), '')
  const ld = [...body.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1])
  let ldOk = ld.length > 0; try { ld.forEach((x) => JSON.parse(x)) } catch { ldOk = false }
  rec(u, 'JSON-LD present and parses', ldOk, `${ld.length} blocks`)
  const words = strip(body).split(' ').length
  rec(u, 'meaningful content (≥400 words)', words >= 400, `${words} words`)
  rec(u, 'contextual inbound link (from sitemap crawl)', (inbound[u]?.size || 0) >= 1, `${inbound[u]?.size || 0} pages link here from <main>`)
  rec(u, 'contact/catalogue link', /href="\/(contact|catalogue)/.test(body), '')
}
let n = 0
for (const [u, cs] of Object.entries(out)) { console.log(`${String(++n).padStart(2)}. ${u.replace(ORIGIN, '')}`); for (const c of cs) console.log(`      ${c.ok ? 'PASS' : 'FAIL'} ${c.c}  ${c.d ?? ''}`) }
console.log(`\nLIVE: ${Object.values(out).flat().filter((c) => c.ok).length} PASS, ${fails} FAIL.  This does not say whether Google will index any URL.`)
process.exit(fails ? 1 : 0)
