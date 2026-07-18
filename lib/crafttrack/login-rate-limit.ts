// Reuses lib/enquiry-rate-limit.ts's getClientIp (env-agnostic, nothing
// CraftTrack-specific about extracting a client IP) but keeps its own
// sliding-window counter with thresholds appropriate for brute-force
// login protection rather than public-form spam protection — a login
// endpoint needs a much tighter window than an enquiry form.
export { getClientIp } from '@/lib/enquiry-rate-limit'

type RateEntry = { timestamps: number[] }

const WINDOW_MS = 15 * 60 * 1000
const MAX_FAILED_ATTEMPTS = 5

const store = new Map<string, RateEntry>()

function prune(entry: RateEntry, now: number): RateEntry {
  return { timestamps: entry.timestamps.filter((t) => now - t < WINDOW_MS) }
}

/** Checked BEFORE verifying credentials. Only failed attempts count
 * against the limit (see recordFailedLoginAttempt) — a legitimate user
 * who mistypes their password twice then succeeds isn't penalized, but a
 * script hammering wrong passwords gets locked out. */
export function checkLoginRateLimit(key: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now()
  const entry = prune(store.get(key) ?? { timestamps: [] }, now)
  store.set(key, entry)

  if (entry.timestamps.length >= MAX_FAILED_ATTEMPTS) {
    const oldest = entry.timestamps[0] ?? now
    return { allowed: false, retryAfterMs: WINDOW_MS - (now - oldest) }
  }

  return { allowed: true }
}

export function recordFailedLoginAttempt(key: string): void {
  const now = Date.now()
  const entry = prune(store.get(key) ?? { timestamps: [] }, now)
  entry.timestamps.push(now)
  store.set(key, entry)
}

export function resetLoginRateLimit(key: string): void {
  store.delete(key)
}
