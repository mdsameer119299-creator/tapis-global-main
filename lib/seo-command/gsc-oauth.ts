import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { SignJWT, jwtVerify } from 'jose'

/** Google Search Console OAuth helpers (read-only scope). No network, no database: pure and unit-testable.
 *
 *  Why a separate flow cookie: the SEO admin session cookie is SameSite=Strict on purpose. Google redirects
 *  the browser back from another site, and browsers do not attach Strict cookies to that navigation, so the
 *  callback cannot see the admin session. Instead, /connect (which DOES have the admin session) issues a
 *  short-lived, signed, HttpOnly, SameSite=Lax cookie that is scoped to the callback path only and bound to
 *  the random `state`. The callback accepts a request only if the cookie, the `state` query value and a
 *  single-use database row all agree, plus PKCE. The admin session cookie itself is unchanged. */

export const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'
export const GSC_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'
export const GSC_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
export const GSC_REVOKE_ENDPOINT = 'https://oauth2.googleapis.com/revoke'
export const GSC_CALLBACK_PATH = '/api/admin/seo/gsc/callback'
export const GSC_FLOW_COOKIE = 'seo_gsc_flow'
export const GSC_FLOW_TTL_SECONDS = 10 * 60

type Env = Record<string, string | undefined>

export interface GscOAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  property: string
}

/** Reads a GSC_* configuration value with leading/trailing whitespace (tabs, spaces, newlines) removed. Values pasted
 *  into a dashboard often carry an invisible tab or newline; it must never reach Google or the database. Only the GSC_*
 *  values read in this file go through here: no other configuration is touched. An all-whitespace value counts as unset. */
export function gscEnv(env: Env, name: string): string | undefined {
  const v = env[name]?.trim()
  return v ? v : undefined
}

/** A Search Console property: a domain property (sc-domain:example.com) or a URL-prefix property (https://example.com/). */
export function isValidGscProperty(p: string): boolean {
  return /^sc-domain:[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/i.test(p) || /^https?:\/\/[^\s/]+(\/\S*)?$/i.test(p)
}

/** Returns null unless every required Preview variable is present and valid. Never throws, never logs values. */
export function gscOAuthConfig(env: Env = process.env): GscOAuthConfig | null {
  const clientId = gscEnv(env, 'GSC_OAUTH_CLIENT_ID')
  const clientSecret = gscEnv(env, 'GSC_OAUTH_CLIENT_SECRET')
  const redirectUri = gscEnv(env, 'GSC_OAUTH_REDIRECT_URI')
  const property = gscEnv(env, 'GSC_SITE_URL')
  if (!clientId || !clientSecret || !redirectUri || !property || !gscEncryptionKey(env)) return null
  if (!redirectUri.startsWith('https://') || !redirectUri.endsWith(GSC_CALLBACK_PATH)) return null
  if (!isValidGscProperty(property)) return null
  return { clientId, clientSecret, redirectUri, property }
}

/** The redirect URI is registered exactly once with Google. It must match byte for byte. */
export function isAllowedRedirectUri(uri: string, allowed: string): boolean {
  return uri === allowed
}

// ── PKCE + state ────────────────────────────────────────────────────────────
const b64url = (b: Buffer) => b.toString('base64url')

export function newState(): string {
  return b64url(randomBytes(32))
}
export function newCodeVerifier(): string {
  return b64url(randomBytes(48)) // 64 chars, within RFC 7636 43..128
}
export function codeChallenge(verifier: string): string {
  return b64url(createHash('sha256').update(verifier).digest())
}
/** Only the hash of the state is stored in the database. */
export function hashState(state: string): string {
  return createHash('sha256').update(state).digest('hex')
}

export function buildAuthUrl(cfg: Pick<GscOAuthConfig, 'clientId' | 'redirectUri'>, state: string, verifier: string, loginHint?: string): string {
  const p = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    response_type: 'code',
    scope: GSC_SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'false',
    state,
    code_challenge: codeChallenge(verifier),
    code_challenge_method: 'S256',
  })
  if (loginHint) p.set('login_hint', loginHint)
  return `${GSC_AUTH_ENDPOINT}?${p.toString()}`
}

// ── Flow cookie (SameSite=Lax, callback path only) ──────────────────────────
const FLOW_ISSUER = 'tapis-seo-command'
const FLOW_AUDIENCE = 'seo-gsc-flow'

/** Keys derived from SEO_SESSION_SECRET with a purpose label each, so a flow cookie can never be replayed as a
 *  session token (different key AND audience), and the admin binding key is separate from the signing key. */
function derive(env: Env, label: string): Buffer | null {
  const s = env.SEO_SESSION_SECRET
  if (!s || s.length < 32) return null
  return createHmac('sha256', s).update(label).digest()
}
function flowKey(env: Env): Uint8Array | null {
  const k = derive(env, 'seo-gsc-flow-cookie-v1')
  return k ? new Uint8Array(k) : null
}

/** Keyed binding of an OAuth attempt to the admin who started it. HMAC-SHA256 under a key derived from
 *  SEO_SESSION_SECRET: a database leak alone cannot be used to confirm or forge which admin an attempt belongs to. */
export function adminBinding(adminEmail: string, env: Env = process.env): string {
  const k = derive(env, 'seo-gsc-admin-binding-v1')
  if (!k) throw new Error('SEO_SESSION_SECRET is missing or shorter than 32 characters')
  return createHmac('sha256', k).update(adminEmail.trim().toLowerCase()).digest('hex')
}

/** Constant-time equality for hex digests of equal length. */
export function safeEqualHex(a: string, b: string): boolean {
  const x = Buffer.from(a, 'hex'), y = Buffer.from(b, 'hex')
  return x.length > 0 && x.length === y.length && timingSafeEqual(x, y)
}

export function flowCookieOptions(env: Env = process.env) {
  return {
    httpOnly: true,
    secure: env.NODE_ENV !== 'development',
    sameSite: 'lax' as const, // Lax is sent on top-level GET navigations from Google; never on cross-site subrequests
    path: GSC_CALLBACK_PATH, // not sent to any other route
    maxAge: GSC_FLOW_TTL_SECONDS,
  }
}

export async function signFlowCookie(state: string, adminEmail: string, opts: { env?: Env; now?: Date } = {}): Promise<string> {
  const k = flowKey(opts.env ?? process.env)
  if (!k) throw new Error('SEO_SESSION_SECRET is missing or shorter than 32 characters')
  const iat = Math.floor((opts.now ?? new Date()).getTime() / 1000)
  return new SignJWT({ type: 'gsc-flow', sh: hashState(state), ae: adminBinding(adminEmail, opts.env ?? process.env) })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(FLOW_ISSUER)
    .setAudience(FLOW_AUDIENCE)
    .setIssuedAt(iat)
    .setExpirationTime(iat + GSC_FLOW_TTL_SECONDS)
    .sign(k)
}

export interface FlowClaims {
  stateHash: string
  adminHash: string
}

/** Valid only if signature, audience, expiry AND the `state` query value all match. Constant-time compare. */
export async function verifyFlowCookie(token: string | undefined | null, stateFromQuery: string | null | undefined, opts: { env?: Env; now?: Date } = {}): Promise<FlowClaims | null> {
  if (!token || token.length > 2048 || !stateFromQuery || stateFromQuery.length > 256) return null
  const k = flowKey(opts.env ?? process.env)
  if (!k) return null
  try {
    const { payload } = await jwtVerify(token, k, { issuer: FLOW_ISSUER, audience: FLOW_AUDIENCE, algorithms: ['HS256'], currentDate: opts.now, requiredClaims: ['exp', 'iat'] })
    if (payload.type !== 'gsc-flow' || typeof payload.sh !== 'string' || typeof payload.ae !== 'string') return null
    const a = Buffer.from(payload.sh, 'hex')
    const b = Buffer.from(hashState(stateFromQuery), 'hex')
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null
    return { stateHash: payload.sh, adminHash: payload.ae }
  } catch {
    return null
  }
}

// ── Token encryption at rest: AES-256-GCM, versioned keys ───────────────────
export interface SealedSecret {
  cipher: Buffer
  iv: Buffer
  tag: Buffer
  keyVersion: number
}

/** Key slots (see docs/seo-gsc-key-rotation.md):
 *   current  = GSC_TOKEN_ENCRYPTION_KEY           version GSC_TOKEN_KEY_VERSION            (default 1)
 *   previous = GSC_TOKEN_ENCRYPTION_KEY_PREVIOUS  version GSC_TOKEN_KEY_PREVIOUS_VERSION   (only during rotation)
 *  Each key must be 32 random bytes, base64 or hex. New secrets are always sealed with the current key and stamped
 *  with its version. A stored secret is opened with the key whose version it carries: a key is never guessed or
 *  silently substituted. */
function parseKey(rawIn: string | undefined): Buffer | null {
  const raw = rawIn?.trim()
  if (!raw) return null
  const b = /^[0-9a-fA-F]{64}$/.test(raw) ? Buffer.from(raw, 'hex') : Buffer.from(raw, 'base64')
  return b.length === 32 ? b : null
}
function version(raw: string | undefined, dflt: number): number {
  const n = Number(raw?.trim())
  return Number.isInteger(n) && n > 0 ? n : dflt
}
export function currentKeyVersion(env: Env = process.env): number {
  return version(env.GSC_TOKEN_KEY_VERSION, 1)
}
export function gscEncryptionKey(env: Env = process.env): Buffer | null {
  return parseKey(env.GSC_TOKEN_ENCRYPTION_KEY)
}
export function keyForVersion(v: number, env: Env = process.env): Buffer | null {
  if (v === currentKeyVersion(env)) return gscEncryptionKey(env)
  const prevV = version(env.GSC_TOKEN_KEY_PREVIOUS_VERSION, 0)
  if (prevV > 0 && v === prevV && prevV !== currentKeyVersion(env)) return parseKey(env.GSC_TOKEN_ENCRYPTION_KEY_PREVIOUS)
  return null
}

export function sealSecret(plain: string, env: Env = process.env): SealedSecret {
  const key = gscEncryptionKey(env)
  if (!key) throw new Error('GSC_TOKEN_ENCRYPTION_KEY is missing or not 32 bytes')
  const iv = randomBytes(12) // fresh nonce for every write
  const c = createCipheriv('aes-256-gcm', key, iv)
  const cipher = Buffer.concat([c.update(plain, 'utf8'), c.final()])
  return { cipher, iv, tag: c.getAuthTag(), keyVersion: currentKeyVersion(env) }
}

/** Returns null on any failure (no key for that version, wrong key, tampering, truncation). Never throws, never
 *  reveals why. Callers must treat null as "cannot decrypt" (state ERROR / key problem), NOT as "token revoked". */
export function openSecret(s: Pick<SealedSecret, 'cipher' | 'iv' | 'tag'> & { keyVersion?: number }, env: Env = process.env): string | null {
  const key = keyForVersion(s.keyVersion ?? currentKeyVersion(env), env)
  if (!key || s.iv.length !== 12 || s.tag.length !== 16) return null
  try {
    const d = createDecipheriv('aes-256-gcm', key, s.iv)
    d.setAuthTag(s.tag)
    return Buffer.concat([d.update(s.cipher), d.final()]).toString('utf8')
  } catch {
    return null
  }
}

/** Re-encrypts a stored secret under the current key (rotation step). Fails closed: returns null if it cannot be opened. */
export function resealSecret(s: Pick<SealedSecret, 'cipher' | 'iv' | 'tag' | 'keyVersion'>, env: Env = process.env): SealedSecret | null {
  const plain = openSecret(s, env)
  return plain === null ? null : sealSecret(plain, env)
}

// ── Connection state / safe errors ──────────────────────────────────────────
export type GscConnectionState = 'DISCONNECTED' | 'CONNECTED' | 'RECONNECT_REQUIRED' | 'ERROR' | 'KEY_UNAVAILABLE'

/** KEY_UNAVAILABLE = the stored token is intact but no configured key can open it (key replaced/lost). The row is never
 *  overwritten or deleted automatically; see docs/seo-gsc-key-rotation.md. */
/** Maps a Google token-endpoint error to a state transition. Only `error` codes are inspected, never tokens. */
export function stateForTokenError(errorCode: string | undefined): { state: GscConnectionState; code: string } {
  if (errorCode === 'invalid_grant') return { state: 'RECONNECT_REQUIRED', code: 'invalid_grant' } // expired, revoked or 7-day Testing limit
  if (errorCode === 'invalid_client' || errorCode === 'unauthorized_client') return { state: 'ERROR', code: errorCode }
  return { state: 'ERROR', code: errorCode ? 'token_error' : 'unknown' }
}

/** HTML for the callback result. Served as 200 so that the follow-up link is a same-site navigation
 *  and the Strict admin session cookie is attached again (a 302 here would stay "cross-site" and bounce to login). */
export function callbackResultHtml(opts: { ok: boolean; message: string; continueHref: string }): string {
  const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><title>Search Console connection</title></head><body style="font-family:system-ui;max-width:32rem;margin:4rem auto;padding:0 1rem"><h1>${opts.ok ? 'Connected' : 'Not connected'}</h1><p>${esc(opts.message)}</p><p><a href="${esc(opts.continueHref)}">Continue to the SEO dashboard</a></p></body></html>`
}
