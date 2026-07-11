// scripts/seo-audit-production.test.mjs
// Deterministic behavior tests for the strict production audit.
// No test framework: a local http mock server + child_process + assert.
//   node scripts/seo-audit-production.test.mjs   (or: npm run seo:audit:production:test)
//
// Verifies:
//   A. unreachable origin               -> exit != 0 (FAILED)
//   B. unreachable + --allow-offline    -> exit 0 (SKIPPED)
//   C. sitemap HTTP 500                 -> exit != 0
//   D. malformed sitemap               -> exit != 0
//   E. zero sitemap URLs               -> exit != 0
//   F. successful audit                -> exit 0 (PASSED)
//   G. critical SEO error (noindex)    -> exit != 0 (FAILED)

import http from 'http'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import assert from 'assert'

const SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), 'seo-audit-production.mjs')

function startServer(handler) {
  return new Promise((res) => {
    const srv = http.createServer(handler)
    srv.listen(0, '127.0.0.1', () => res({ srv, port: srv.address().port }))
  })
}
function closedPort() {
  // Bind then immediately close to obtain a port guaranteed not to be listening.
  return new Promise((res) => {
    const srv = http.createServer()
    srv.listen(0, '127.0.0.1', () => { const p = srv.address().port; srv.close(() => res(p)) })
  })
}
function runAudit(env, args = []) {
  return new Promise((res) => {
    const child = spawn(process.execPath, [SCRIPT, ...args], {
      env: { ...process.env, AUDIT_TIMEOUT: '1500', AUDIT_MAX: '10', ...env },
    })
    let out = ''
    child.stdout.on('data', (d) => (out += d))
    child.stderr.on('data', (d) => (out += d))
    child.on('close', (code) => res({ code, out }))
  })
}

function page({ origin, path, noindex = false, h1 = 1, breadcrumb = 'valid' }) {
  const canonical = `<link rel="canonical" href="${origin}${path}">`
  const robots = noindex ? `<meta name="robots" content="noindex">` : ''
  let ld = ''
  if (breadcrumb === 'valid') {
    ld = `<script type="application/ld+json">${JSON.stringify({
      '@graph': [
        { '@type': 'WebPage', '@id': `${origin}${path}#webpage`, breadcrumb: { '@id': `${origin}${path}#breadcrumb` } },
        { '@type': 'BreadcrumbList', '@id': `${origin}${path}#breadcrumb`, itemListElement: [{ position: 1 }, { position: 2 }] },
      ],
    })}</script>`
  }
  const h1s = Array.from({ length: h1 }).map(() => '<h1>Title</h1>').join('')
  return `<!doctype html><html><head>${canonical}${robots}${ld}</head><body>${h1s}</body></html>`
}
function sitemapXml(origin, paths) {
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((p) => `<loc>${origin}${p}</loc>`).join('')}</urlset>`
}

let passed = 0, failed = 0
function check(name, cond, detail = '') {
  if (cond) { passed++; console.log(`  ok  ${name}`) }
  else { failed++; console.log(`  FAIL ${name} ${detail}`) }
}

async function main() {
  console.log('production-audit behavior tests\n')

  // A + B: unreachable origin
  const dead = await closedPort()
  const baseDead = `http://127.0.0.1:${dead}`
  const a = await runAudit({ AUDIT_BASE_URL: baseDead, AUDIT_EXPECTED_ORIGIN: baseDead })
  check('A unreachable -> non-zero', a.code !== 0, `(code ${a.code})`)
  check('A prints FAILED', /PRODUCTION AUDIT FAILED/.test(a.out))
  const b = await runAudit({ AUDIT_BASE_URL: baseDead, AUDIT_EXPECTED_ORIGIN: baseDead }, ['--allow-offline'])
  check('B unreachable + --allow-offline -> exit 0', b.code === 0, `(code ${b.code})`)
  check('B prints SKIPPED', /PRODUCTION AUDIT SKIPPED/.test(b.out))
  check('B never prints PASSED', !/PRODUCTION AUDIT PASSED/.test(b.out))

  // C: sitemap 500
  const c = await startServer((req, r) => { r.writeHead(500); r.end('err') })
  const cBase = `http://127.0.0.1:${c.port}`
  const cr = await runAudit({ AUDIT_BASE_URL: cBase, AUDIT_EXPECTED_ORIGIN: cBase })
  check('C sitemap 500 -> non-zero', cr.code !== 0, `(code ${cr.code})`)
  // even with --allow-offline (reached-but-broken must still fail)
  const cr2 = await runAudit({ AUDIT_BASE_URL: cBase, AUDIT_EXPECTED_ORIGIN: cBase }, ['--allow-offline'])
  check('C sitemap 500 + --allow-offline -> still non-zero', cr2.code !== 0, `(code ${cr2.code})`)
  c.srv.close()

  // D: malformed sitemap
  const d = await startServer((req, r) => { r.writeHead(200, { 'content-type': 'text/html' }); r.end('<html>not a sitemap</html>') })
  const dBase = `http://127.0.0.1:${d.port}`
  const dr = await runAudit({ AUDIT_BASE_URL: dBase, AUDIT_EXPECTED_ORIGIN: dBase })
  check('D malformed sitemap -> non-zero', dr.code !== 0, `(code ${dr.code})`)
  d.srv.close()

  // E: zero URLs
  const e = await startServer((req, r) => { r.writeHead(200, { 'content-type': 'application/xml' }); r.end(sitemapXml('', [])) })
  const eBase = `http://127.0.0.1:${e.port}`
  const er = await runAudit({ AUDIT_BASE_URL: eBase, AUDIT_EXPECTED_ORIGIN: eBase })
  check('E zero sitemap URLs -> non-zero', er.code !== 0, `(code ${er.code})`)
  e.srv.close()

  // F: successful audit
  const f = await startServer((req, r) => {
    const origin = `http://${req.headers.host}`
    if (req.url === '/sitemap.xml') { r.writeHead(200, { 'content-type': 'application/xml' }); return r.end(sitemapXml(origin, ['/', '/products/x'])) }
    r.writeHead(200, { 'content-type': 'text/html' }); r.end(page({ origin, path: req.url }))
  })
  const fBase = `http://127.0.0.1:${f.port}`
  const fr = await runAudit({ AUDIT_BASE_URL: fBase, AUDIT_EXPECTED_ORIGIN: fBase })
  check('F success -> exit 0', fr.code === 0, `(code ${fr.code})\n${fr.out}`)
  check('F prints PASSED', /PRODUCTION AUDIT PASSED/.test(fr.out))
  f.srv.close()

  // G: critical error (noindex page in sitemap)
  const g = await startServer((req, r) => {
    const origin = `http://${req.headers.host}`
    if (req.url === '/sitemap.xml') { r.writeHead(200, { 'content-type': 'application/xml' }); return r.end(sitemapXml(origin, ['/', '/products/x'])) }
    r.writeHead(200, { 'content-type': 'text/html' }); r.end(page({ origin, path: req.url, noindex: req.url === '/products/x' }))
  })
  const gBase = `http://127.0.0.1:${g.port}`
  const gr = await runAudit({ AUDIT_BASE_URL: gBase, AUDIT_EXPECTED_ORIGIN: gBase })
  check('G noindex-in-sitemap -> non-zero', gr.code !== 0, `(code ${gr.code})`)
  check('G prints FAILED', /PRODUCTION AUDIT FAILED/.test(gr.out))
  g.srv.close()

  console.log(`\n${passed} passed, ${failed} failed`)
  process.exit(failed === 0 ? 0 : 1)
}
main().catch((e) => { console.error(e); process.exit(1) })
