import { SignJWT, jwtVerify } from 'jose'

/** SEO admin session. Fully independent of every other authentication system in this repo:
 * its own secret (SEO_SESSION_SECRET), cookie name, token type, issuer and audience. */

export const SEO_SESSION_COOKIE = 'seo_admin_session'
export const SEO_SESSION_TTL_SECONDS = 8 * 60 * 60 // 8 hours, absolute (no sliding renewal)
const ISSUER = 'tapis-seo-command'
const AUDIENCE = 'seo-admin'
const TYPE = 'seo-admin'
const MIN_SECRET_LENGTH = 32

export interface SeoSession {
  email: string
  expiresAt: number // epoch seconds
}

type Env = Record<string, string | undefined>

/** Returns the signing key, or null when the secret is missing or too weak. Never throws, never logs the secret. */
function key(env: Env): Uint8Array | null {
  const s = env.SEO_SESSION_SECRET
  return s && s.length >= MIN_SECRET_LENGTH ? new TextEncoder().encode(s) : null
}

export function isSeoSessionConfigured(env: Env = process.env): boolean {
  return key(env) !== null
}

export async function signSeoSession(email: string, opts: { env?: Env; now?: Date; ttlSeconds?: number } = {}): Promise<string> {
  const k = key(opts.env ?? process.env)
  if (!k) throw new Error('SEO_SESSION_SECRET is missing or shorter than 32 characters')
  const iat = Math.floor((opts.now ?? new Date()).getTime() / 1000)
  return new SignJWT({ type: TYPE, email: email.toLowerCase() })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt(iat)
    .setExpirationTime(iat + (opts.ttlSeconds ?? SEO_SESSION_TTL_SECONDS))
    .sign(k)
}

export async function verifySeoSession(token: string | undefined | null, opts: { env?: Env; now?: Date } = {}): Promise<SeoSession | null> {
  if (!token || token.length > 4096) return null
  const k = key(opts.env ?? process.env)
  if (!k) return null
  try {
    const { payload } = await jwtVerify(token, k, { issuer: ISSUER, audience: AUDIENCE, algorithms: ['HS256'], currentDate: opts.now, requiredClaims: ['exp', 'iat'] })
    if (payload.type !== TYPE || typeof payload.email !== 'string' || !payload.email || typeof payload.exp !== 'number') return null
    return { email: payload.email, expiresAt: payload.exp }
  } catch {
    return null
  }
}

export function seoCookieOptions(env: Env = process.env) {
  return {
    httpOnly: true,
    secure: env.NODE_ENV !== 'development', // always Secure except local http development
    sameSite: 'strict' as const,
    path: '/',
    maxAge: SEO_SESSION_TTL_SECONDS,
  }
}

export function seoClearCookieOptions(env: Env = process.env) {
  return { ...seoCookieOptions(env), maxAge: 0 }
}
