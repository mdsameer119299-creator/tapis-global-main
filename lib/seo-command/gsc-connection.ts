import { randomUUID } from 'node:crypto'
import { sealSecret, gscOAuthConfig, type GscConnectionState, type GscOAuthConfig } from './gsc-oauth'
import { loadRefreshToken, recordRevoked, recordTokenError, type Q } from './gsc-state'
import { refreshAccessToken, revokeToken } from './gsc-google'

/** Connection lifecycle on top of gsc-state.ts. Query function and fetch are injected (tests use a scratch DB and a
 *  fake Google). Nothing here calls the Search Console API. */
type Env = Record<string, string | undefined>
type Fetch = typeof fetch

/** While the Google OAuth app is in "Testing" publishing status, refresh tokens stop working after 7 days. */
export const TESTING_TOKEN_LIFETIME_DAYS = 7
export const EXPIRY_WARNING_HOURS = 48

export function testingExpiry(grantedAtEpochSec: number | null, nowMs = Date.now()): { expiresAtMs: number; msLeft: number; level: 'ok' | 'soon' | 'expired' } | null {
  if (grantedAtEpochSec === null) return null
  const expiresAtMs = grantedAtEpochSec * 1000 + TESTING_TOKEN_LIFETIME_DAYS * 86_400_000
  const msLeft = expiresAtMs - nowMs
  return { expiresAtMs, msLeft, level: msLeft <= 0 ? 'expired' : msLeft <= EXPIRY_WARNING_HOURS * 3_600_000 ? 'soon' : 'ok' }
}

/** Stores (or replaces) the encrypted refresh token and resets all error/revocation markers. Reconnecting is the
 *  documented recovery from RECONNECT_REQUIRED, KEY_UNAVAILABLE and ERROR. */
export async function storeConnection(q: Q, a: { siteId: string; refreshToken: string; scope: string; property: string; env?: Env }): Promise<void> {
  const s = sealSecret(a.refreshToken, a.env ?? process.env)
  await q(
    `INSERT INTO seo_oauth_connections ("id","siteId","provider","state","scope","propertyUrl","refreshTokenCipher","refreshTokenIv","refreshTokenTag","keyVersion","grantedAt","lastRefreshAt","lastSuccessAt","lastErrorAt","lastErrorCode","revokedAt","updatedAt")
     VALUES ($1,$2,'GSC','CONNECTED',$3,$4,$5,$6,$7,$8, timezone('utc',now()), NULL, NULL, NULL, NULL, NULL, timezone('utc',now()))
     ON CONFLICT ("siteId","provider") DO UPDATE SET
       "state"='CONNECTED',"scope"=EXCLUDED."scope","propertyUrl"=EXCLUDED."propertyUrl",
       "refreshTokenCipher"=EXCLUDED."refreshTokenCipher","refreshTokenIv"=EXCLUDED."refreshTokenIv","refreshTokenTag"=EXCLUDED."refreshTokenTag","keyVersion"=EXCLUDED."keyVersion",
       "grantedAt"=EXCLUDED."grantedAt","lastRefreshAt"=NULL,"lastSuccessAt"=NULL,"lastErrorAt"=NULL,"lastErrorCode"=NULL,"revokedAt"=NULL,"updatedAt"=EXCLUDED."updatedAt"`,
    [randomUUID(), a.siteId, a.scope, a.property, s.cipher, s.iv, s.tag, s.keyVersion],
  )
}

export interface GscConnectionView {
  state: GscConnectionState
  propertyUrl: string | null
  scope: string | null
  grantedAtEpoch: number | null
  lastRefreshEpoch: number | null
  lastErrorEpoch: number | null
  lastErrorCode: string | null
  revokedEpoch: number | null
  keyVersion: number | null
}

const EPOCH = (c: string) => `extract(epoch from ("${c}" at time zone 'utc'))::bigint`

/** Status only. Never selects token columns. */
export async function getConnectionView(q: Q, siteId: string): Promise<GscConnectionView> {
  const rows = await q(
    `SELECT "state","propertyUrl","scope","keyVersion","lastErrorCode",
            ${EPOCH('grantedAt')} AS "g", ${EPOCH('lastRefreshAt')} AS "r", ${EPOCH('lastErrorAt')} AS "e", ${EPOCH('revokedAt')} AS "v"
       FROM seo_oauth_connections WHERE "siteId"=$1 AND provider='GSC'`,
    [siteId],
  )
  const r = rows[0]
  const n = (v: unknown) => (v === null || v === undefined ? null : Number(v))
  if (!r) return { state: 'DISCONNECTED', propertyUrl: null, scope: null, grantedAtEpoch: null, lastRefreshEpoch: null, lastErrorEpoch: null, lastErrorCode: null, revokedEpoch: null, keyVersion: null }
  return { state: r.state as GscConnectionState, propertyUrl: r.propertyUrl ?? null, scope: r.scope ?? null, grantedAtEpoch: n(r.g), lastRefreshEpoch: n(r.r), lastErrorEpoch: n(r.e), lastErrorCode: r.lastErrorCode ?? null, revokedEpoch: n(r.v), keyVersion: n(r.keyVersion) }
}

export type AccessResult =
  | { ok: true; accessToken: string }
  | { ok: false; state: GscConnectionState; reason: 'not_connected' | 'reconnect_required' | 'key_unavailable' | 'config_error' | 'transient' }

/** Obtains a short-lived access token (kept in memory only, never stored). A permanent Google rejection
 *  (invalid_grant: expired, revoked or the 7-day Testing limit) flips the state to RECONNECT_REQUIRED and the caller
 *  must stop; transient failures (network, 5xx, 429) change nothing so the next attempt can simply retry.
 *  Not called by any route yet: no Google API request is made until the connectivity test is approved. */
export async function getAccessToken(q: Q, siteId: string, opts: { cfg?: Pick<GscOAuthConfig, 'clientId' | 'clientSecret'> | null; env?: Env; fetchImpl?: Fetch } = {}): Promise<AccessResult> {
  const env = opts.env ?? process.env
  const cfg = opts.cfg === undefined ? gscOAuthConfig(env) : opts.cfg
  if (!cfg) return { ok: false, state: 'ERROR', reason: 'config_error' }
  const t = await loadRefreshToken(q, siteId, env)
  if (t.kind === 'key_unavailable') return { ok: false, state: 'KEY_UNAVAILABLE', reason: 'key_unavailable' }
  if (t.kind === 'none') return { ok: false, state: t.state, reason: t.state === 'RECONNECT_REQUIRED' ? 'reconnect_required' : 'not_connected' }
  const r = await refreshAccessToken(cfg, t.refreshToken, opts.fetchImpl ?? fetch)
  if (r.ok) {
    await q(`UPDATE seo_oauth_connections SET "lastRefreshAt"=timezone('utc',now()),"updatedAt"=timezone('utc',now()) WHERE "siteId"=$1 AND provider='GSC'`, [siteId])
    return { ok: true, accessToken: r.accessToken }
  }
  if (r.transient) return { ok: false, state: 'CONNECTED', reason: 'transient' }
  const state = await recordTokenError(q, siteId, r.error)
  return { ok: false, state, reason: state === 'RECONNECT_REQUIRED' ? 'reconnect_required' : 'config_error' }
}

export type DisconnectResult = { ok: true; revokedAtGoogle: boolean } | { ok: false; reason: 'key_unavailable' }

/** Disconnect: revoke at Google (best effort), then wipe the ciphertext locally. Synced data is kept. If the stored
 *  token cannot be decrypted we refuse to destroy it (see docs/seo-gsc-key-rotation.md): restore the key, or Reconnect,
 *  which replaces the token. */
export async function disconnect(q: Q, siteId: string, opts: { env?: Env; fetchImpl?: Fetch } = {}): Promise<DisconnectResult> {
  const t = await loadRefreshToken(q, siteId, opts.env ?? process.env)
  if (t.kind === 'key_unavailable') return { ok: false, reason: 'key_unavailable' }
  let revoked = false
  if (t.kind === 'token') revoked = await revokeToken(t.refreshToken, opts.fetchImpl ?? fetch)
  await recordRevoked(q, siteId)
  return { ok: true, revokedAtGoogle: revoked }
}
