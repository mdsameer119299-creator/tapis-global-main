import { GSC_REVOKE_ENDPOINT, GSC_SCOPE, GSC_TOKEN_ENDPOINT, type GscOAuthConfig } from './gsc-oauth'

/** Google OAuth token-endpoint client (code exchange, refresh, revoke). Talks ONLY to accounts/oauth2 endpoints:
 *  no Search Console API request is made here. `fetch` is injectable so tests never touch the network.
 *  Tokens, codes, verifiers and client secrets are never logged and never included in returned error values. */
type Fetch = typeof fetch
const TIMEOUT_MS = 10_000

/** Google's `error` field is a short snake_case code. Anything else is collapsed so free text can never leak through. */
export function safeErrorCode(v: unknown): string {
  return typeof v === 'string' && /^[a-z_]{1,40}$/.test(v) ? v : 'token_error'
}

async function postForm(url: string, body: URLSearchParams, f: Fetch): Promise<{ status: number; json: Record<string, unknown> } | null> {
  const ctl = new AbortController()
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS)
  try {
    const res = await f(url, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body, signal: ctl.signal, cache: 'no-store' })
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>
    return { status: res.status, json: json && typeof json === 'object' ? json : {} }
  } catch {
    return null // network failure or timeout
  } finally {
    clearTimeout(t)
  }
}

export type ExchangeResult = { ok: true; refreshToken: string; scope: string } | { ok: false; error: string }

/** Exchanges the authorization code (PKCE) for tokens. Only the refresh token is returned; the short-lived access
 *  token from this response is discarded. The granted scope must be exactly the read-only Search Console scope. */
export async function exchangeCode(cfg: GscOAuthConfig, code: string, verifier: string, f: Fetch = fetch): Promise<ExchangeResult> {
  const r = await postForm(GSC_TOKEN_ENDPOINT, new URLSearchParams({
    grant_type: 'authorization_code', code, redirect_uri: cfg.redirectUri, client_id: cfg.clientId, client_secret: cfg.clientSecret, code_verifier: verifier,
  }), f)
  if (!r) return { ok: false, error: 'network' }
  if (r.status !== 200) return { ok: false, error: safeErrorCode(r.json.error) }
  const refresh = r.json.refresh_token
  const scope = r.json.scope
  if (typeof refresh !== 'string' || refresh.length < 10 || refresh.length > 4096) return { ok: false, error: 'no_refresh_token' }
  const scopes = typeof scope === 'string' ? scope.split(/\s+/).filter(Boolean) : []
  if (scopes.length !== 1 || scopes[0] !== GSC_SCOPE) {
    await revokeToken(refresh, f) // never keep a grant broader or different than requested
    return { ok: false, error: 'scope_mismatch' }
  }
  return { ok: true, refreshToken: refresh, scope: GSC_SCOPE }
}

export type RefreshResult = { ok: true; accessToken: string; expiresIn: number } | { ok: false; error: string; transient: boolean }

/** `transient` = network/5xx: the grant is not known to be bad, so the connection state must not change. */
export async function refreshAccessToken(cfg: Pick<GscOAuthConfig, 'clientId' | 'clientSecret'>, refreshToken: string, f: Fetch = fetch): Promise<RefreshResult> {
  const r = await postForm(GSC_TOKEN_ENDPOINT, new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken, client_id: cfg.clientId, client_secret: cfg.clientSecret }), f)
  if (!r) return { ok: false, error: 'network', transient: true }
  if (r.status >= 500 || r.status === 429) return { ok: false, error: r.status === 429 ? 'rate_limited' : 'google_unavailable', transient: true }
  if (r.status !== 200) return { ok: false, error: safeErrorCode(r.json.error), transient: false }
  const at = r.json.access_token
  if (typeof at !== 'string' || !at) return { ok: false, error: 'token_error', transient: false }
  return { ok: true, accessToken: at, expiresIn: typeof r.json.expires_in === 'number' ? r.json.expires_in : 3600 }
}

/** Best-effort revocation of a refresh token at Google. Returns true only if Google confirmed (HTTP 200). */
export async function revokeToken(token: string, f: Fetch = fetch): Promise<boolean> {
  const r = await postForm(GSC_REVOKE_ENDPOINT, new URLSearchParams({ token }), f)
  return !!r && r.status === 200
}
