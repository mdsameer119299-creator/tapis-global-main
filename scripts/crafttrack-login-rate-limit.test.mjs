// PR2.1 hardening: tests for lib/crafttrack/login-rate-limit.ts — the
// counter that protects /api/admin/crafttrack/login. Pure logic, no DB or
// network involved, so this is a plain functional test.

import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const require = createRequire(import.meta.url)
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const jiti = require('jiti')(fileURLToPath(import.meta.url), { interopDefault: true, alias: { '@': ROOT } })

let pass = 0, fail = 0
const ok = (n, c, d = '') => { if (c) { pass++; console.log(`  ok  ${n}`) } else { fail++; console.log(`  FAIL ${n} ${d}`) } }

const { checkLoginRateLimit, recordFailedLoginAttempt, resetLoginRateLimit } = jiti('../lib/crafttrack/login-rate-limit.ts')

// ── Allows attempts under the threshold ───────────────────────────────────
{
  const key = 'test-key-1'
  ok('a fresh key is allowed', checkLoginRateLimit(key).allowed === true)

  for (let i = 0; i < 4; i++) recordFailedLoginAttempt(key)
  ok('still allowed after 4 recorded failures (threshold is 5)', checkLoginRateLimit(key).allowed === true)
}

// ── Blocks once the threshold is reached ──────────────────────────────────
{
  const key = 'test-key-2'
  for (let i = 0; i < 5; i++) recordFailedLoginAttempt(key)
  const result = checkLoginRateLimit(key)
  ok('blocked after 5 recorded failures', result.allowed === false)
  ok('reports a retryAfterMs when blocked', typeof result.retryAfterMs === 'number' && result.retryAfterMs > 0)
}

// ── A successful login resets the counter ─────────────────────────────────
{
  const key = 'test-key-3'
  for (let i = 0; i < 5; i++) recordFailedLoginAttempt(key)
  ok('blocked before reset', checkLoginRateLimit(key).allowed === false)

  resetLoginRateLimit(key)
  ok('allowed again immediately after reset — a successful login should not stay penalized', checkLoginRateLimit(key).allowed === true)
}

// ── Keys are independent ───────────────────────────────────────────────────
{
  const attackerKey = 'ip:1.2.3.4'
  const victimEmailKey = 'email:admin@tapisglobalinternational.com'
  for (let i = 0; i < 5; i++) recordFailedLoginAttempt(attackerKey)

  ok('rate-limiting one IP does not block a different key (e.g. a different admin\'s email)', checkLoginRateLimit(victimEmailKey).allowed === true)
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)
