import assert from 'node:assert/strict'
import http from 'node:http'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const jiti = require('jiti')(fileURLToPath(import.meta.url), { interopDefault: true })
const { extractPageFacts, normaliseUrl } = jiti('../lib/seo-command/html-audit.ts')
const { parseRobots, isPathAllowed, validateRobots } = jiti('../lib/seo-command/robots-txt.ts')
const { parseSitemap, validateSitemapEntries } = jiti('../lib/seo-command/sitemap-xml.ts')
const { detectIssues, healthScore } = jiti('../lib/seo-command/issues.ts')
const { crawlSite } = jiti('../lib/seo-command/crawler.ts')

let n = 0
const t = async (name, fn) => { await fn(); n++; console.log('ok -', name) }

await t('normaliseUrl strips fragments, tracking params, trailing slash', () => {
  assert.equal(normaliseUrl('https://a.com/x/?utm_source=z&b=1#top'), 'https://a.com/x?b=1')
  assert.equal(normaliseUrl('https://a.com/'), 'https://a.com/')
  assert.equal(normaliseUrl('mailto:a@b.com'), null)
})

await t('extractPageFacts reads metadata, headings, alt text, JSON-LD', () => {
  const html = `<html lang="en"><head><title> My  Rugs </title><meta name="description" content="Desc here"><link rel="canonical" href="/p"><meta name="robots" content="noindex,follow">
  <meta name="viewport" content="width=device-width"><script type="application/ld+json">{"@graph":[{"@type":"Organization"},{"@type":["Product","Thing"]}]}</script></head>
  <body><h1>One</h1><h2>a</h2><img src="a.jpg"><img src="b.jpg" alt=""><img src="c.jpg" alt="ok"><a href="/about#x">in</a><a href="https://other.com">out</a><a href="mailto:x@y.z">m</a>
  <script>var hidden="should not count"</script><p>four words right here</p></body></html>`
  const f = extractPageFacts(html, 'https://site.com/p')
  assert.equal(f.title, 'My Rugs')
  assert.equal(f.canonical, 'https://site.com/p')
  assert.equal(f.robotsMeta, 'noindex,follow')
  assert.deepEqual(f.h1s, ['One'])
  assert.equal(f.imageCount, 3)
  assert.equal(f.imagesMissingAlt, 1, 'empty alt is decorative, only missing attribute counts')
  assert.deepEqual(f.jsonLdTypes, ['Organization', 'Product', 'Thing'])
  assert.deepEqual(f.internalLinks, ['https://site.com/about'])
  assert.equal(f.externalLinkCount, 1)
  assert.ok(!/hidden/.test(JSON.stringify(f)))
  assert.equal(f.lang, 'en')
})

await t('robots.txt: longest match wins, Allow wins ties, wildcards', () => {
  const r = parseRobots('User-agent: *\nDisallow: /private/\nAllow: /private/ok\nDisallow: /*.pdf$\nSitemap: https://a.com/s.xml')
  assert.equal(isPathAllowed(r, 'bot', '/private/x'), false)
  assert.equal(isPathAllowed(r, 'bot', '/private/ok/y'), true)
  assert.equal(isPathAllowed(r, 'bot', '/a.pdf'), false)
  assert.equal(isPathAllowed(r, 'bot', '/a.pdf?x=1'), true)
  assert.equal(isPathAllowed(r, 'bot', '/home'), true)
  assert.deepEqual(r.sitemaps, ['https://a.com/s.xml'])
})

await t('robots.txt: specific agent group overrides *', () => {
  const r = parseRobots('User-agent: *\nDisallow: /\n\nUser-agent: tapisseobot\nAllow: /')
  assert.equal(isPathAllowed(r, 'TapisSEOBot/1.0', '/x'), true)
  assert.equal(isPathAllowed(r, 'other', '/x'), false)
})

await t('robots validation findings', () => {
  const codes = (s, txt) => validateRobots(s, txt, 'https://a.com').map((f) => f.code)
  assert.deepEqual(codes(503, null), ['ROBOTS_SERVER_ERROR'])
  assert.deepEqual(codes(404, null), ['ROBOTS_MISSING'])
  assert.deepEqual(codes(null, null), ['ROBOTS_UNREACHABLE'])
  assert.ok(codes(200, 'User-agent: *\nDisallow: /').includes('ROBOTS_DISALLOWS_ALL'))
  assert.ok(codes(200, 'User-agent: *\nDisallow: /x').includes('ROBOTS_NO_SITEMAP'))
  assert.ok(codes(200, 'User-agent: *\nSitemap: https://evil.com/s.xml').includes('ROBOTS_SITEMAP_OFFSITE'))
  assert.deepEqual(codes(200, 'User-agent: *\nDisallow: /x\nSitemap: https://www.a.com/s.xml'), [])
})

await t('sitemap parse + validate', () => {
  const idx = parseSitemap('<sitemapindex><sitemap><loc>https://a.com/1.xml</loc></sitemap></sitemapindex>')
  assert.equal(idx.kind, 'index')
  const us = parseSitemap('<urlset><url><loc>https://a.com/x?a=1&amp;b=2</loc><lastmod>2026-01-01</lastmod></url><url><loc>http://b.com/y</loc><lastmod>nope</lastmod></url><url><loc>https://a.com/x?a=1&amp;b=2</loc></url></urlset>')
  assert.equal(us.entries[0].loc, 'https://a.com/x?a=1&b=2')
  const codes = validateSitemapEntries(us.entries, 'https://a.com', 'https://a.com/s.xml').map((f) => f.code).sort()
  assert.deepEqual(codes, ['SITEMAP_BAD_LASTMOD', 'SITEMAP_DUPLICATE_URLS', 'SITEMAP_NON_HTTPS', 'SITEMAP_WRONG_HOST'])
  assert.equal(parseSitemap('<html>').kind, 'invalid')
  assert.equal(validateSitemapEntries([], 'https://a.com', 'x')[0].code, 'SITEMAP_EMPTY')
})

const goodFacts = (o = {}) => ({ title: 'A perfectly reasonable title here', metaDescription: 'x'.repeat(100), canonical: null, robotsMeta: null, h1s: ['h'], h2Count: 1, lang: 'en', hreflangCount: 0, jsonLdTypes: [], ogTitle: 't', ogImage: 'i', hasViewport: true, imageCount: 0, imagesMissingAlt: 0, internalLinks: ['https://a.com/'], externalLinkCount: 0, wordCount: 400, textHash: 'h' + Math.random(), ...o })
const page = (url, o = {}) => ({ url, finalUrl: url, statusCode: 200, redirectChain: [], responseMs: 100, contentType: 'text/html', facts: goodFacts(o.facts), inSitemap: false, disallowedByRobots: false, error: null, linkedFrom: ['https://a.com/'], ...o, facts: o.facts === null ? null : goodFacts(o.facts) })

await t('issue detection covers metadata, status, duplicates, orphans', () => {
  const pages = [
    page('https://a.com/1', { facts: { title: null, metaDescription: null, h1s: [], imagesMissingAlt: 2, imageCount: 2, canonical: 'https://a.com/other', textHash: 'dup' } }),
    page('https://a.com/2', { facts: { title: 'Same title for two pages', textHash: 'dup' } }),
    page('https://a.com/3', { facts: { title: 'Same title for two pages' } }),
    page('https://a.com/gone', { statusCode: 404, facts: null, inSitemap: true }),
    page('https://a.com/err', { statusCode: 500, facts: null }),
    page('https://a.com/r', { redirectChain: [{ url: 'https://a.com/r', status: 301 }, { url: 'https://a.com/r2', status: 302 }, { url: 'https://a.com/r3', status: 301 }], inSitemap: true }),
    page('https://a.com/noidx', { facts: { robotsMeta: 'noindex', title: null }, inSitemap: true }),
    page('https://a.com/orph', { inSitemap: true, linkedFrom: [] }),
  ]
  const codes = new Set(detectIssues(pages).map((i) => i.code))
  for (const c of ['MISSING_TITLE', 'MISSING_META_DESCRIPTION', 'MISSING_H1', 'IMAGES_MISSING_ALT', 'CANONICAL_NOT_SELF', 'DUPLICATE_TITLE', 'DUPLICATE_CONTENT', 'BROKEN_LINK', 'HTTP_5XX', 'REDIRECT', 'REDIRECT_CHAIN', 'NOINDEX', 'ORPHAN_PAGE']) assert.ok(codes.has(c), 'missing ' + c)
  const noidx = detectIssues(pages).filter((i) => i.url === 'https://a.com/noidx').map((i) => i.code)
  assert.deepEqual(noidx.sort(), ['NOINDEX'], 'noindex pages skip metadata checks')
  const broken = detectIssues(pages).find((i) => i.code === 'BROKEN_LINK')
  assert.equal(broken.severity, 'CRITICAL', 'broken sitemap URL is critical')
  const fps = detectIssues(pages).map((i) => i.fingerprint)
  assert.equal(new Set(fps).size, fps.length, 'fingerprints are unique')
})

await t('health score is bounded and monotonic', () => {
  const clean = healthScore([], 10).score
  const some = healthScore([{ severity: 'HIGH' }, { severity: 'MEDIUM' }], 10).score
  const worse = healthScore(Array.from({ length: 50 }, () => ({ severity: 'CRITICAL' })), 10).score
  assert.equal(clean, 100)
  assert.ok(some < clean && worse < some && worse >= 0)
  assert.equal(healthScore([], 0).score, 0)
})

// ---- crawler against a local mock site
const site = {
  '/robots.txt': { type: 'text/plain', body: 'User-agent: *\nDisallow: /secret\nSitemap: ORIGIN/sitemap.xml' },
  '/sitemap.xml': { type: 'application/xml', body: '<urlset><url><loc>ORIGIN/</loc></url><url><loc>ORIGIN/about</loc></url><url><loc>ORIGIN/missing</loc></url><url><loc>ORIGIN/secret</loc></url></urlset>' },
  '/': { type: 'text/html', body: '<html lang="en"><head><title>Home page of the mock rug store</title><meta name="description" content="' + 'd'.repeat(90) + '"><meta name="viewport" content="x"><link rel="canonical" href="ORIGIN/"></head><body><h1>Home</h1><a href="/about">about</a><a href="/old">old</a><a href="/secret">s</a><a href="/loop1">l</a><img src="x.jpg"><p>' + 'word '.repeat(200) + '</p></body></html>' },
  '/about': { type: 'text/html', body: '<html><head><title>About</title></head><body><a href="/">home</a></body></html>' },
}
let origin = ''
const server = http.createServer((req, res) => {
  const u = req.url.split('?')[0]
  if (u === '/old') { res.writeHead(301, { location: '/about' }); return res.end() }
  if (u === '/loop1') { res.writeHead(302, { location: '/loop2' }); return res.end() }
  if (u === '/loop2') { res.writeHead(302, { location: '/loop1' }); return res.end() }
  const r = site[u]
  if (!r) { res.writeHead(404, { 'content-type': 'text/html' }); return res.end('<html><title>nf</title></html>') }
  res.writeHead(200, { 'content-type': r.type }); res.end(r.body.replaceAll('ORIGIN', origin))
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
origin = `http://127.0.0.1:${server.address().port}`
const requested = []
const spy = (url, init) => { requested.push(new URL(url).pathname); return fetch(url, init) }

await t('crawler end-to-end on mock site', async () => {
  const out = await crawlSite({ origin, allowInsecureOrigin: true, fetchImpl: spy, timeoutMs: 3000 })
  const by = Object.fromEntries(out.issues.map((i) => [i.code + '|' + (i.url ?? ''), i]))
  assert.ok(!requested.includes('/secret'), 'robots-disallowed URL must never be fetched')
  assert.ok(by[`BROKEN_LINK|${origin}/missing`], '404 sitemap URL flagged')
  assert.equal(by[`BROKEN_LINK|${origin}/missing`].severity, 'CRITICAL')
  assert.ok(by[`SITEMAP_URL_BLOCKED_BY_ROBOTS|${origin}/secret`], 'blocked sitemap URL flagged')
  assert.ok(by[`REDIRECT|${origin}/old`], 'redirect recorded')
  assert.ok(out.issues.some((i) => i.code === 'FETCH_ERROR' && i.url === `${origin}/loop1`), 'redirect loop surfaced as error')
  assert.ok(by[`MISSING_META_DESCRIPTION|${origin}/about`])
  assert.ok(by[`IMAGES_MISSING_ALT|${origin}/`])
  assert.ok(out.pages.find((p) => p.url === `${origin}/about`).linkedFrom.includes(`${origin}/`))
  assert.equal(out.robots.found, true)
  assert.equal(out.sitemapUrls.length, 4)
  assert.equal(new Set(out.pages.map((p) => p.url)).size, out.pages.length, 'no URL is crawled twice')
  assert.equal(out.pages.filter((p) => new URL(p.url).pathname === '/').length, 1, 'homepage crawled exactly once')
  assert.ok(out.score >= 0 && out.score <= 100)
})

await t('crawler respects maxPages and refuses http origin by default', async () => {
  const out = await crawlSite({ origin, allowInsecureOrigin: true, maxPages: 2 })
  assert.ok(out.pages.length <= 2 + 1)
  assert.equal(out.truncated, true)
  await assert.rejects(crawlSite({ origin }), /https/)
})

await t('crawler survives unreachable host', async () => {
  const out = await crawlSite({ origin: 'http://127.0.0.1:1', allowInsecureOrigin: true, timeoutMs: 800 })
  assert.ok(out.issues.some((i) => i.code === 'ROBOTS_UNREACHABLE'))
  assert.ok(out.issues.some((i) => i.code === 'FETCH_ERROR'))
})

await t('orphans are not reported from a partial (truncated) crawl', () => {
  const pages = [page('https://a.com/orph', { inSitemap: true, linkedFrom: [] })]
  assert.ok(detectIssues(pages).some((i) => i.code === 'ORPHAN_PAGE'))
  assert.ok(!detectIssues(pages, { partial: true }).some((i) => i.code === 'ORPHAN_PAGE'))
})

await t('crawl page limit is configurable, clamped, and defaults to 120', () => {
  const { crawlMaxPages } = jiti('../lib/seo-command/config.ts')
  assert.equal(crawlMaxPages({}), 120)
  assert.equal(crawlMaxPages({ SEO_CRAWL_MAX_PAGES: 'abc' }), 120)
  assert.equal(crawlMaxPages({ SEO_CRAWL_MAX_PAGES: '400' }), 400)
  assert.equal(crawlMaxPages({ SEO_CRAWL_MAX_PAGES: '5' }), 20)
  assert.equal(crawlMaxPages({ SEO_CRAWL_MAX_PAGES: '99999' }), 1000)
})

await t('DB error messages shown to admins never contain connection details', () => {
  const { safeDbErrorMessage } = jiti('../lib/seo-command/db.ts')
  const secret = 'postgresql://postgres.abc:SuperSecret@host.example.com:5432/postgres'
  for (const msg of ['password authentication failed for user "postgres.abc"', 'Invalid URL', 'Connection terminated due to connection timeout', 'getaddrinfo ENOTFOUND host.example.com', 'SEO_DATABASE_URL does not match SEO_DATABASE_EXPECTED_REF', 'weird ' + secret]) {
    const out = safeDbErrorMessage(new Error(msg))
    assert.ok(out.length > 20)
    assert.ok(!/SuperSecret|host\.example\.com|postgres\.abc|postgresql:\/\//.test(out), 'leak in: ' + out)
  }
})

server.close()
console.log(`\n${n} tests passed`)
