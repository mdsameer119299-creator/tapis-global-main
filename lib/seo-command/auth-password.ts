import { createHash, scryptSync, timingSafeEqual } from 'crypto'

/** Hash format (generated locally by scripts/seo-generate-admin-hash.mjs):
 *   scrypt:<N>:<r>:<p>:<saltHex>:<hashHex>
 * Uses only Node's built-in crypto (no dependency on any other auth code). */

interface Parsed { N: number; r: number; p: number; salt: Buffer; hash: Buffer }

export function parseHash(stored: string | undefined): Parsed | null {
  if (!stored) return null
  const m = /^scrypt:(\d+):(\d+):(\d+):([0-9a-f]{16,128}):([0-9a-f]{32,256})$/.exec(stored.trim())
  if (!m) return null
  const N = Number(m[1]), r = Number(m[2]), p = Number(m[3])
  // Bounds protect the server from a mistakenly configured, absurdly expensive hash.
  if (N < 16384 || N > 262144 || (N & (N - 1)) !== 0 || r < 8 || r > 16 || p < 1 || p > 4) return null
  return { N, r, p, salt: Buffer.from(m[4], 'hex'), hash: Buffer.from(m[5], 'hex') }
}

const sha = (s: string) => createHash('sha256').update(s.toLowerCase().trim()).digest()

// Work-equalising dummy so a wrong email costs as much time as a wrong password.
const DUMMY = { N: 16384, r: 8, p: 1, salt: Buffer.alloc(16, 7), hash: Buffer.alloc(32, 9) }

function scrypt(password: string, x: { N: number; r: number; p: number; salt: Buffer; hash: Buffer }): Buffer {
  return scryptSync(password.normalize('NFKC'), x.salt, x.hash.length, { N: x.N, r: x.r, p: x.p, maxmem: 256 * 1024 * 1024 })
}

/** Constant-time-ish check of email AND password. Always performs one scrypt derivation. */
export function verifyAdminCredentials(email: string, password: string, env: Record<string, string | undefined> = process.env): boolean {
  const configuredEmail = env.SEO_ADMIN_EMAIL
  const parsed = parseHash(env.SEO_ADMIN_PASSWORD_HASH)
  if (!configuredEmail || !parsed) return false
  const emailOk = timingSafeEqual(sha(email), sha(configuredEmail))
  const derived = scrypt(password.slice(0, 200), emailOk ? parsed : { ...DUMMY, hash: Buffer.alloc(parsed.hash.length, 9) })
  const hashOk = emailOk && derived.length === parsed.hash.length && timingSafeEqual(derived, parsed.hash)
  return emailOk && hashOk
}

export function isLoginConfigured(env: Record<string, string | undefined> = process.env): boolean {
  return !!env.SEO_ADMIN_EMAIL && parseHash(env.SEO_ADMIN_PASSWORD_HASH) !== null
}
