type RateEntry = {
  timestamps: number[]
}

const WINDOW_MS = 60 * 60 * 1000
const MAX_PER_WINDOW = 8
const MIN_INTERVAL_MS = 30_000

const store = new Map<string, RateEntry>()

function prune(entry: RateEntry, now: number): RateEntry {
  const timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS)
  return { timestamps }
}

export function checkEnquiryRateLimit(key: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now()
  const entry = prune(store.get(key) ?? { timestamps: [] }, now)

  if (entry.timestamps.length >= MAX_PER_WINDOW) {
    const oldest = entry.timestamps[0] ?? now
    return { allowed: false, retryAfterMs: WINDOW_MS - (now - oldest) }
  }

  const last = entry.timestamps[entry.timestamps.length - 1]
  if (last && now - last < MIN_INTERVAL_MS) {
    return { allowed: false, retryAfterMs: MIN_INTERVAL_MS - (now - last) }
  }

  entry.timestamps.push(now)
  store.set(key, entry)
  return { allowed: true }
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? 'unknown'
  return req.headers.get('x-real-ip') ?? 'unknown'
}
