// scripts/gsc-live-check.test.mjs — run: npm run seo:gsc:live:test
// Behaviour tests for scripts/gsc-live-check.mjs against local mock servers (no production traffic).
import http from 'http'
import { spawn } from 'child_process'
import { writeFileSync, mkdtempSync } from 'fs'
import { tmpdir } from 'os'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import assert from 'assert'

const SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), 'gsc-live-check.mjs')
const listen = (h) => new Promise((res) => { const s = http.createServer(h); s.listen(0, '127.0.0.1', () => res({ s, port: s.address().port })) })
const words = (n) => Array.from({ length: n }, (_, i) => `word${i}`).join(' ')
const page = ({ origin, path, mainWords = 500, noindex = false, links = [], nav = 0 }) => `<!doctype html><html><head>
<link rel="canonical" href="${origin}${path}">${noindex ? '<meta name="robots" content="noindex">' : '<meta name="robots" content="index, follow">'}
<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage"}</script></head><body>
<header><nav>${words(nav)}</nav></header><main><nav aria-label="Breadcrumb"><a href="/">Home</a></nav><h1>Meaningful heading here</h1><p>${words(mainWords)}</p>
${links.map((l) => `<a href="${l}">x</a>`).join('')}<a href="/contact">Contact</a></main><footer>${words(nav)}</footer></body></html>`

// scenario → behaviour
async function run(scn) {
  const hits = { method: [], foreign: 0 }
  const foreign = await listen((q, r) => { hits.foreign++; r.end('x') })
  const origin = { v: '' }
  const A = '/a', B = '/b'
  const srv = await listen((q, r) => {
    hits.method.push(q.method)
    const u = q.url
    if (u === '/robots.txt') { if (scn.robots === 500) { r.statusCode = 500; return r.end('err') } if (scn.robots === 'html') return r.end('<html>hi</html>'); return r.end(`User-agent: *\nAllow: /\nSitemap: ${origin.v}/sitemap.xml\n`) }
    if (u === '/sitemap.xml') {
      if (scn.sitemap === 404) { r.statusCode = 404; return r.end('nf') }
      if (scn.sitemap === 'bad') { r.setHeader('content-type', 'application/xml'); return r.end('<html>not a sitemap</html>') }
      r.setHeader('content-type', 'application/xml')
      return r.end(`<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin.v}${A}</loc></url><url><loc>${origin.v}${B}</loc></url><url><loc>${origin.v}/sitemap.xml</loc></url>${scn.noForeign ? '' : `<url><loc>http://127.0.0.1:${foreign.port}/evil</loc></url>`}</urlset>`)
    }
    if (u === A) return r.end(page({ origin: origin.v, path: A, mainWords: scn.mainWords ?? 500, noindex: scn.noindex, nav: scn.nav ?? 0, links: [B] }))
    if (u === B) return r.end(page({ origin: origin.v, path: B, links: [A, `http://127.0.0.1:${foreign.port}/ext`] }))
    r.statusCode = 404; r.end('nf')
  })
  origin.v = `http://127.0.0.1:${srv.port}`
  const dir = mkdtempSync(join(tmpdir(), 'gsc-'))
  const csv = join(dir, 'u.csv'); writeFileSync(csv, `url,last_crawled\n${origin.v}${A},2026-01-01\n${origin.v}${B},2026-01-01\n${origin.v}/sitemap.xml,2026-01-01\n`)
  const env = { ...process.env, ORIGIN: scn.unreachable ? 'http://127.0.0.1:1' : origin.v, GSC_CSV: csv, GSC_TIMEOUT_MS: '2000' }
  if (scn.unreachable) writeFileSync(csv, `url,last_crawled\nhttp://127.0.0.1:1/a,2026-01-01\n`)
  const res = await new Promise((done) => { let out = ''; const c = spawn(process.execPath, [SCRIPT], { env }); c.stdout.on('data', (d) => (out += d)); c.stderr.on('data', (d) => (out += d)); c.on('close', (code) => done({ code, out })) })
  srv.s.close(); foreign.s.close()
  return { ...res, hits }
}

let ok = 0
const t = async (name, fn) => { try { await fn(); ok++; console.log('  ok  ', name) } catch (e) { console.error('  FAIL', name, '\n      ', e.message); process.exitCode = 1 } }

await t('A. unreachable host → exit 3, "NOT RUN", no pass claimed', async () => { const r = await run({ unreachable: true }); assert.strictEqual(r.code, 3); assert(/NOT RUN \(host unreachable\)/.test(r.out)); assert(!/PASS/.test(r.out)) })
await t('B. robots.txt HTTP 500 → exit 4 (HTTP error)', async () => { const r = await run({ robots: 500 }); assert.strictEqual(r.code, 4); assert(/NOT RUN \(HTTP error\).*robots\.txt returned HTTP 500/.test(r.out)) })
await t('C. robots.txt that is HTML → exit 4 (invalid response)', async () => { const r = await run({ robots: 'html' }); assert.strictEqual(r.code, 4); assert(/NOT RUN \(invalid response\)/.test(r.out)) })
await t('D. sitemap.xml HTTP 404 → exit 4 (HTTP error)', async () => { const r = await run({ sitemap: 404 }); assert.strictEqual(r.code, 4); assert(/sitemap\.xml returned HTTP 404/.test(r.out)) })
await t('E. sitemap.xml not a urlset → exit 4 (invalid response)', async () => { const r = await run({ sitemap: 'bad' }); assert.strictEqual(r.code, 4); assert(/not a valid <urlset>/.test(r.out)) })
await t('F. healthy site → pages pass, but off-origin sitemap entry is a FAIL (exit 1) and is never fetched', async () => {
  const r = await run({}); assert.strictEqual(r.hits.foreign, 0, `foreign server received ${r.hits.foreign} requests`)
  assert(/FAIL lists only production-origin URLs/.test(r.out)); assert.strictEqual(r.code, 1)
  assert(/PASS ≥400 words in <main>/.test(r.out) && /PASS ≥1 contextual inbound link/.test(r.out))
})
await t('F2. fully healthy site (no foreign entries) → exit 0, 0 FAIL', async () => { const r = await run({ noForeign: true }); assert.strictEqual(r.code, 0, r.out); assert(!/FAIL/.test(r.out.replace(/0 FAIL/, ''))); assert(/LIVE RESULT: \d+ PASS, 0 FAIL/.test(r.out)) })
await t('G. only GET requests are ever issued', async () => { const r = await run({}); assert(r.hits.method.length > 0 && r.hits.method.every((m) => m === 'GET'), r.hits.method.join()) })
await t('H. words are counted inside <main> only (huge nav/footer must not rescue a thin page)', async () => {
  const r = await run({ mainWords: 50, nav: 3000 }); assert(/FAIL ≥400 words in <main>\s+\d+ words in <main>/.test(r.out), r.out); assert.strictEqual(r.code, 1)
})
await t('I. noindex page → FAIL, exit 1', async () => { const r = await run({ noindex: true }); assert(/FAIL meta robots indexable/.test(r.out)); assert.strictEqual(r.code, 1) })
await t('J. ORIGIN override to a non-production, non-loopback host is refused', async () => {
  const code = await new Promise((d) => { const c = spawn(process.execPath, [SCRIPT], { env: { ...process.env, ORIGIN: 'https://evil.example.com' } }); c.on('close', d) }); assert.strictEqual(code, 2)
})
console.log(`\n${ok} passed${process.exitCode ? ', WITH FAILURES' : ''}`)
