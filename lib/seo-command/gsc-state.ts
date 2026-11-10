import { randomUUID } from 'node:crypto'
import { adminBinding, openSecret, safeEqualHex, sealSecret, hashState, stateForTokenError, type GscConnectionState } from './gsc-oauth'

/** Database side of the Search Console OAuth flow. Takes a plain query function so it can run against the SEO pool
 *  (lib/seo-command/db.ts) in the app and against a scratch Postgres in tests. Never logs tokens, states or verifiers.
 *  All time comparisons use the DATABASE clock in UTC (timezone('utc', now())), never the app clock, so Vercel
 *  clock skew or session time zones cannot extend or shorten a state's life. */
export type Q = (text: string, params?: unknown[]) => Promise<Record<string, any>[]>

export const OAUTH_STATE_TTL_MINUTES = 10

/** Called by /connect (authenticated admin). Stores only the hash of the state, the keyed admin binding and the
 *  encrypted PKCE verifier. */
export async function createOAuthState(q: Q, a: { state: string; verifier: string; adminEmail: string; env?: Record<string, string | undefined> }): Promise<void> {
  const env = a.env ?? process.env
  const v = sealSecret(a.verifier, env)
  await q(
    `INSERT INTO seo_oauth_states ("id","stateHash","adminHash","codeVerifierCipher","codeVerifierIv","codeVerifierTag","expiresAt")
     VALUES ($1,$2,$3,$4,$5,$6, timezone('utc', now()) + ($7 || ' minutes')::interval)`,
    [randomUUID(), hashState(a.state), adminBinding(a.adminEmail, env), v.cipher, v.iv, v.tag, String(OAUTH_STATE_TTL_MINUTES)],
  )
}

export type ConsumeResult = { ok: true; verifier: string } | { ok: false; reason: 'invalid_or_expired_or_replayed' | 'admin_mismatch' | 'verifier_unreadable' }

/** Exactly-once consumption. ONE atomic UPDATE both checks and marks the row, so two concurrent callbacks with the
 *  same state cannot both succeed (the second sees usedAt already set and matches zero rows). Expired, replayed and
 *  unknown states are indistinguishable by design. The row is burned BEFORE the admin comparison, so a mismatched
 *  identity also cannot be retried. */
export const CONSUME_SQL = `UPDATE seo_oauth_states
   SET "usedAt" = timezone('utc', now())
 WHERE "stateHash" = $1
   AND "usedAt" IS NULL
   AND "expiresAt" > timezone('utc', now())
RETURNING "adminHash","codeVerifierCipher","codeVerifierIv","codeVerifierTag"`

export async function consumeOAuthState(q: Q, a: { state: string; adminHashFromCookie: string; env?: Record<string, string | undefined> }): Promise<ConsumeResult> {
  const rows = await q(CONSUME_SQL, [hashState(a.state)])
  if (rows.length !== 1) return { ok: false, reason: 'invalid_or_expired_or_replayed' }
  const r = rows[0]
  if (!safeEqualHex(String(r.adminHash), a.adminHashFromCookie)) return { ok: false, reason: 'admin_mismatch' }
  const verifier = openSecret({ cipher: r.codeVerifierCipher, iv: r.codeVerifierIv, tag: r.codeVerifierTag }, a.env ?? process.env)
  return verifier === null ? { ok: false, reason: 'verifier_unreadable' } : { ok: true, verifier }
}

// ── connection lifecycle ────────────────────────────────────────────────────
export type TokenLookup =
  | { kind: 'token'; refreshToken: string }
  | { kind: 'none'; state: GscConnectionState } // never connected, revoked or disconnected
  | { kind: 'key_unavailable' } // ciphertext present but no configured key opens it; NOTHING is modified or deleted

/** Reads the refresh token for a sync. Only a CONNECTED connection yields a token. If decryption fails the row is
 *  flagged KEY_UNAVAILABLE (status only) and left intact so the correct key can still recover it. */
export async function loadRefreshToken(q: Q, siteId: string, env: Record<string, string | undefined> = process.env): Promise<TokenLookup> {
  const rows = await q(`SELECT "state","revokedAt","refreshTokenCipher","refreshTokenIv","refreshTokenTag","keyVersion" FROM seo_oauth_connections WHERE "siteId"=$1 AND provider='GSC'`, [siteId])
  const r = rows[0]
  if (!r) return { kind: 'none', state: 'DISCONNECTED' }
  if (r.revokedAt || !r.refreshTokenCipher || r.state === 'DISCONNECTED') return { kind: 'none', state: 'DISCONNECTED' }
  if (r.state === 'RECONNECT_REQUIRED') return { kind: 'none', state: 'RECONNECT_REQUIRED' }
  const token = openSecret({ cipher: r.refreshTokenCipher, iv: r.refreshTokenIv, tag: r.refreshTokenTag, keyVersion: r.keyVersion }, env)
  if (token === null) {
    await q(`UPDATE seo_oauth_connections SET "state"='KEY_UNAVAILABLE',"lastErrorAt"=timezone('utc', now()),"lastErrorCode"='key_unavailable',"updatedAt"=timezone('utc', now()) WHERE "siteId"=$1 AND provider='GSC'`, [siteId])
    return { kind: 'key_unavailable' }
  }
  return { kind: 'token', refreshToken: token }
}

/** Google said the grant is unusable (invalid_grant: expired, revoked, or the 7-day Testing limit). Status only:
 *  the sync stops and the dashboard shows "Reconnect required". Never retried in a loop. */
export async function recordTokenError(q: Q, siteId: string, errorCode: string | undefined): Promise<GscConnectionState> {
  const { state, code } = stateForTokenError(errorCode)
  await q(`UPDATE seo_oauth_connections SET "state"=$2,"lastErrorAt"=timezone('utc', now()),"lastErrorCode"=$3,"updatedAt"=timezone('utc', now()) WHERE "siteId"=$1 AND provider='GSC'`, [siteId, state, code])
  return state
}

/** User pressed Disconnect (after Google's revoke endpoint was called). Wipes the ciphertext and records revocation;
 *  already-synced data is kept. */
export async function recordRevoked(q: Q, siteId: string): Promise<void> {
  await q(
    `UPDATE seo_oauth_connections SET "state"='DISCONNECTED',"refreshTokenCipher"=NULL,"refreshTokenIv"=NULL,"refreshTokenTag"=NULL,
       "revokedAt"=timezone('utc', now()),"updatedAt"=timezone('utc', now()) WHERE "siteId"=$1 AND provider='GSC'`,
    [siteId],
  )
}

/** Connection is usable for a sync only in state CONNECTED. */
export const canSync = (state: string): boolean => state === 'CONNECTED'
