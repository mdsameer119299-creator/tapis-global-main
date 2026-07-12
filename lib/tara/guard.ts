/**
 * lib/tara/guard.ts — serverless-safe abuse/cost protection for the paid TARA
 * AI endpoint. Pure + testable (no next/server imports).
 *
 * LAYERS
 *  1. Oversized-request rejection (Content-Length + turn/char caps).
 *  2. Instance-local burst limiter (defense-in-depth). NOTE: on Vercel/serverless
 *     this Map is per-instance and resets on cold start — it is NOT a reliable
 *     global limit. It only blunts rapid bursts hitting one warm instance.
 *  3. Cross-instance per-SESSION AI-turn cap via an HMAC-SIGNED httpOnly cookie.
 *     The counter lives in the client cookie but is signed with a server secret,
 *     so a client cannot forge/raise it. Deleting the cookie only yields a fresh
 *     session (still bounded), and the burst limiter + provider caps still apply.
 *  4. Deterministic handoff intents never reach the paid provider.
 *
 * No Redis/DB is added: within current constraints the signed-cookie counter is
 * the pragmatic cross-instance bound. Remaining limitation is documented above
 * and in docs/TARA-ARCHITECTURE.md.
 */

import crypto from 'crypto'

function clampInt(v: string | undefined, def: number, min: number, max: number): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return def
  return Math.min(max, Math.max(min, Math.floor(n)))
}

export const TARA_LIMITS = {
  maxAiTurnsPerSession: () => clampInt(process.env.TARA_MAX_AI_TURNS_PER_SESSION, 15, 1, 100),
  maxRequestsPerMinute: () => clampInt(process.env.TARA_MAX_REQUESTS_PER_MINUTE, 20, 1, 120),
  timeoutMs: () => clampInt(process.env.TARA_TIMEOUT_MS, 15000, 1000, 60000),
  maxBodyBytes: 16 * 1024,
  maxTurns: 12,
  maxChars: 2000,
}

function secret(): string {
  if (process.env.TARA_SESSION_SECRET) return process.env.TARA_SESSION_SECRET
  // Stable across instances without a new required var: derive from the
  // server-only API key. Never exposed to the browser.
  if (process.env.ANTHROPIC_API_KEY) return crypto.createHash('sha256').update('tara:' + process.env.ANTHROPIC_API_KEY).digest('hex')
  return 'tara-local-dev-secret'
}

export function newSessionId(): string {
  return crypto.randomBytes(16).toString('hex')
}
export function isValidSid(sid: string | undefined): sid is string {
  return typeof sid === 'string' && /^[a-f0-9]{32}$/.test(sid)
}

/** Sign the AI-turn counter for a session: `count.hmac`. */
export function signCounter(sid: string, count: number): string {
  const mac = crypto.createHmac('sha256', secret()).update(`${sid}.${count}`).digest('hex').slice(0, 32)
  return `${count}.${mac}`
}
/** Verify + read the counter. Returns 0 if missing/invalid/tampered. */
export function verifyCounter(sid: string, token: string | undefined): number {
  if (!token) return 0
  const dot = token.lastIndexOf('.')
  if (dot <= 0) return 0
  const count = Number(token.slice(0, dot))
  const mac = token.slice(dot + 1)
  if (!Number.isInteger(count) || count < 0) return 0
  const expected = crypto.createHmac('sha256', secret()).update(`${sid}.${count}`).digest('hex').slice(0, 32)
  if (mac.length !== expected.length) return 0
  try {
    if (!crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return 0
  } catch { return 0 }
  return count
}

// ── Instance-local burst limiter (defense-in-depth only) ─────────────────────
const HITS = new Map<string, number[]>()
export function burst(key: string): boolean {
  const now = Date.now()
  const max = TARA_LIMITS.maxRequestsPerMinute()
  const arr = (HITS.get(key) || []).filter((t) => now - t < 60_000)
  if (arr.length >= max) { HITS.set(key, arr); return true }
  arr.push(now); HITS.set(key, arr); return false
}
export function _resetBurst(): void { HITS.clear() } // test hook

export interface Turn { role: 'user' | 'assistant'; content: string }
export function sanitizeTurns(input: unknown): Turn[] {
  if (!Array.isArray(input)) return []
  return input
    .filter((t): t is { role: string; content: string } => Boolean(t) && typeof t === 'object' && typeof (t as { content?: unknown }).content === 'string')
    .map((t): Turn => ({ role: t.role === 'assistant' ? 'assistant' : 'user', content: String(t.content).slice(0, TARA_LIMITS.maxChars) }))
    .filter((t) => t.content.trim().length > 0)
    .slice(-TARA_LIMITS.maxTurns)
}

export type Decision = 'handoff' | 'quota' | 'proceed'
/** Decide whether to call the paid provider. Handoff & quota never call it. */
export function decide(handoffIntent: boolean, aiTurns: number): Decision {
  if (handoffIntent) return 'handoff'
  if (aiTurns >= TARA_LIMITS.maxAiTurnsPerSession()) return 'quota'
  return 'proceed'
}

export function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {}
  if (!header) return out
  for (const part of header.split(';')) {
    const i = part.indexOf('=')
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim())
  }
  return out
}
