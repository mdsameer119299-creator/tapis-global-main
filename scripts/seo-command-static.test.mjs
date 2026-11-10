import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
const jiti = require('jiti')(fileURLToPath(import.meta.url), { interopDefault: true, alias: { '@': ROOT } })
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]))
const read = (f) => fs.readFileSync(f, 'utf8')
let n = 0
const t = (name, fn) => { fn(); n++; console.log('ok -', name) }

const apiFiles = walk(path.join(ROOT, 'app/api/admin/seo')).filter((f) => f.endsWith('route.ts'))
const pageFiles = walk(path.join(ROOT, 'app/admin/seo')).filter((f) => /page\.tsx$/.test(f))
const libFiles = walk(path.join(ROOT, 'lib/seo-command')).filter((f) => f.endsWith('.ts'))
const allSeo = [...apiFiles, ...pageFiles, ...libFiles, ...walk(path.join(ROOT, 'components/seo-command')), path.join(ROOT, 'app/api/seo/cron/route.ts')]

t('there are routes and pages to check', () => { assert.ok(apiFiles.length >= 7); assert.ok(pageFiles.length >= 7) })

t('every admin SEO API handler is wrapped in seoApi, mutating ones flagged', () => {
  const PUBLIC_AUTH_ROUTES = ['auth/login/route.ts', 'auth/logout/route.ts']
  for (const f of apiFiles) {
    if (PUBLIC_AUTH_ROUTES.some((x) => f.endsWith(x))) continue
    const s = read(f)
    for (const m of s.matchAll(/export (?:const|async function) (GET|POST|PUT|PATCH|DELETE)\b([^\n]*)/g)) {
      assert.match(m[0], /seoApi\(\{ mutating: (true|false) \}/, `${path.relative(ROOT, f)} ${m[1]} must use seoApi`)
      if (m[1] !== 'GET') assert.match(m[0], /mutating: true/, `${path.relative(ROOT, f)} ${m[1]} must be mutating:true`)
      else assert.match(m[0], /mutating: false/)
    }
  }
})

t('every SEO page checks the SEO session itself (not only the layout); only the login page is open', () => {
  for (const f of pageFiles) {
    if (f.endsWith('seo/login/page.tsx')) continue
    assert.match(read(f), /requireSeoPageSession\(\)/, path.relative(ROOT, f))
  }
  assert.match(read(path.join(ROOT, 'app/admin/seo/(dashboard)/layout.tsx')), /requireSeoPageSession\(\)/)
  assert.ok(!fs.existsSync(path.join(ROOT, 'app/admin/seo/layout.tsx')), 'a root layout guard would loop the login page')
  const login = read(path.join(ROOT, 'app/admin/seo/login/page.tsx'))
  assert.match(login, /robots: \{ index: false/)
})

t('login/logout routes are same-origin protected and the only unguarded SEO API routes', () => {
  for (const r of ['auth/login', 'auth/logout']) assert.match(read(path.join(ROOT, `app/api/admin/seo/${r}/route.ts`)), /originMatchesHost\(/)
  const open = apiFiles.filter((f) => !/seoApi\(/.test(read(f)))
  assert.deepEqual(open.map((f) => path.relative(path.join(ROOT, 'app/api/admin/seo'), f)).sort(), ['auth/login/route.ts', 'auth/logout/route.ts'])
})

t('SEO authentication has NO dependency on CraftTrack code, cookies, secrets or login pages', () => {
  for (const f of allSeo.filter((x) => /\.(ts|tsx)$/.test(x))) {
    const s = read(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
    assert.ok(!/crafttrack/i.test(s), `${path.relative(ROOT, f)} references CraftTrack`)
    assert.ok(!/CRAFTTRACK_SESSION_SECRET/.test(s))
  }
  const a = read(path.join(ROOT, 'lib/seo-command/auth.ts'))
  assert.match(a, /from '\.\/auth-session'/)
  assert.match(a, /SEO_LOGIN_PATH = '\/admin\/seo\/login'/)
  assert.ok(!/@\/lib\/(prisma|crafttrack)/.test(read(path.join(ROOT, 'lib/seo-command/auth-session.ts'))))
})

t('SEO code never touches DATABASE_URL, Prisma or the website database', () => {
  for (const f of allSeo) {
    const s = read(f).replace(/\/\/.*$/gm, '')
    assert.ok(!/@prisma\/client|lib\/prisma|from '@\/lib\/db'/.test(s), `${path.relative(ROOT, f)} imports Prisma`)
    if (!f.endsWith('lib/seo-command/db.ts')) assert.ok(!/process\.env\.DATABASE_URL/.test(s), `${path.relative(ROOT, f)} reads DATABASE_URL`)
  }
  const db = read(path.join(ROOT, 'lib/seo-command/db.ts'))
  assert.match(db, /process\.env\.SEO_DATABASE_URL/)
  assert.ok(!/console\.(log|error|warn)\([^)]*(url|URL)/.test(db), 'db.ts must not log connection strings')
})

t('SEO code does not write to the public website or other projects', () => {
  for (const f of allSeo) {
    const s = read(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
    assert.ok(!/method:\s*['"](PUT|PATCH)['"]/.test(s.replace(/call\('DELETE'/g, '')), 'no website mutation calls')
    assert.ok(!/crafttrack/i.test(s), `${path.relative(ROOT, f)} references CraftTrack`)
  }
})

t('crawler only issues GET requests and identifies itself', () => {
  const s = read(path.join(ROOT, 'lib/seo-command/crawler.ts'))
  assert.ok(!/method:\s*['"](POST|PUT|PATCH|DELETE)['"]/.test(s))
  assert.match(s, /CRAWLER_UA/)
})

t('cron route requires a bearer secret and is not scheduled in vercel.json', () => {
  assert.match(read(path.join(ROOT, 'app/api/seo/cron/route.ts')), /bearerMatches\(/)
  assert.ok(!/seo/i.test(read(path.join(ROOT, 'vercel.json'))), 'no SEO cron may be scheduled before approval')
  const { bearerMatches } = jiti('../lib/seo-command/auth.ts')
  assert.equal(bearerMatches('Bearer abcdefghijklmnopqrstuvwxyz', 'abcdefghijklmnopqrstuvwxyz'), true)
  assert.equal(bearerMatches('Bearer wrong-secret-value-123456', 'abcdefghijklmnopqrstuvwxyz'), false)
  assert.equal(bearerMatches('Bearer anything', undefined), false)
  assert.equal(bearerMatches('Bearer short', 'short'), false, 'short secrets are rejected')
  assert.equal(bearerMatches(null, 'abcdefghijklmnopqrstuvwxyz'), false)
})

t('migrations: additive only, RLS enabled, nothing granted to anon/authenticated/PUBLIC', () => {
  for (const f of ['0001_seo_foundation.sql', '0002_seo_tracking.sql']) {
    const s = read(path.join(ROOT, 'db/seo', f))
    assert.ok(!/DROP\s+(TABLE|SCHEMA|COLUMN)/i.test(s), f + ' must not drop anything')
    assert.ok(!/\bTRUNCATE\b|DELETE\s+FROM/i.test(s), f + ' must not delete data')
    assert.ok(!/GRANT[^;]*\bTO\s+(anon|authenticated|PUBLIC)\b/i.test(s), f + ' must not grant to anon/authenticated/PUBLIC')
    assert.match(s, /ENABLE ROW LEVEL SECURITY/)
    assert.match(s, /REVOKE ALL ON public\.%I FROM PUBLIC/)
    const created = [...s.matchAll(/CREATE TABLE "([^"]+)"/g)].map((m) => m[1])
    assert.ok(created.every((c) => c.startsWith('seo_')), 'only seo_* tables: ' + created.join(','))
    const altered = [...s.matchAll(/ALTER TABLE "([^"]+)"/g)].map((m) => m[1])
    assert.ok(altered.every((c) => c.startsWith('seo_')), 'only seo_* tables altered')
  }
  assert.ok(!/DATABASE_URL|\bPASSWORD\s+'|\bLOGIN\b/i.test(read(path.join(ROOT, 'db/seo/0001_seo_foundation.sql')).replace(/--.*$/gm, '')), 'no embedded credentials or login roles')
})

t('no secrets or connection strings are committed in SEO files', () => {
  for (const f of [...allSeo, ...walk(path.join(ROOT, 'db/seo')), ...fs.readdirSync(path.join(ROOT, 'scripts')).filter((x) => x.startsWith('seo-')).map((x) => path.join(ROOT, 'scripts', x))]) {
    const s = read(f)
    if (!f.endsWith('.test.mjs')) assert.ok(!/postgres(ql)?:\/\/[^\s'"`$]+:[^\s'"`@$]+@[a-z0-9.-]+\.(supabase\.(co|com)|pooler)/i.test(s), `${path.relative(ROOT, f)} contains a connection string`)
    assert.ok(!/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/.test(s), `${path.relative(ROOT, f)} contains a JWT`)
    assert.ok(!/AIza[0-9A-Za-z_-]{30,}/.test(s), `${path.relative(ROOT, f)} contains a Google API key`)
  }
})

t('no fabricated Google data: GSC/GA4 shown as pending, rank column only read from seo_keyword_ranks', () => {
  const ui = read(path.join(ROOT, 'components/seo-command/ui.tsx'))
  assert.match(ui, /Connection pending/)
  const kw = read(path.join(ROOT, 'app/admin/seo/(dashboard)/keywords/page.tsx'))
  assert.match(kw, /Connection pending/)
  const lib = libFiles.map(read).join('\n')
  assert.ok(!/Math\.random\(\)/.test(lib), 'no random data generation in library code')
  const inserts = [...lib.matchAll(/INSERT INTO seo_keyword_ranks/g)]
  assert.equal(inserts.length, 0, 'ranks are only inserted by the future GSC integration')
})

t('noindex on the admin area', () => {
  assert.match(read(path.join(ROOT, 'app/admin/seo/(dashboard)/layout.tsx')), /index: false/)
})

console.log(`\n${n} static tests passed`)
