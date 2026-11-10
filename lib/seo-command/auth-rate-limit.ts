/** In-memory sliding-window limiter for SEO logins. State lives per server instance (serverless instances do not share
 * memory), so this is a speed bump layered with: scrypt cost, a delay on failure, and Vercel Deployment Protection. */

export interface RateLimiterOptions { max: number; windowMs: number; now?: () => number; maxKeys?: number }

export class RateLimiter {
  private hits = new Map<string, number[]>()
  private readonly now: () => number
  constructor(private opts: RateLimiterOptions) {
    this.now = opts.now ?? Date.now
  }
  private recent(key: string): number[] {
    const cutoff = this.now() - this.opts.windowMs
    const arr = (this.hits.get(key) ?? []).filter((t) => t > cutoff)
    if (arr.length) this.hits.set(key, arr)
    else this.hits.delete(key)
    return arr
  }
  check(key: string): { allowed: boolean; retryAfterSeconds: number } {
    const arr = this.recent(key)
    if (arr.length < this.opts.max) return { allowed: true, retryAfterSeconds: 0 }
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((arr[0] + this.opts.windowMs - this.now()) / 1000)) }
  }
  recordFailure(key: string): void {
    const arr = this.recent(key)
    arr.push(this.now())
    this.hits.set(key, arr)
    const cap = this.opts.maxKeys ?? 5000
    if (this.hits.size > cap) {
      const oldest = this.hits.keys().next().value
      if (oldest !== undefined) this.hits.delete(oldest)
    }
  }
  reset(key: string): void {
    this.hits.delete(key)
  }
  clear(): void {
    this.hits.clear()
  }
}

export const LOGIN_WINDOW_MS = 15 * 60 * 1000
export const loginLimiter = new RateLimiter({ max: 5, windowMs: LOGIN_WINDOW_MS }) // per IP and per email
export const globalLoginLimiter = new RateLimiter({ max: 40, windowMs: LOGIN_WINDOW_MS }) // whole instance

export function clientIp(headers: { get(name: string): string | null }): string {
  const raw = headers.get('x-vercel-forwarded-for') ?? headers.get('x-real-ip') ?? headers.get('x-forwarded-for') ?? 'unknown'
  return raw.split(',')[0].trim().slice(0, 64) || 'unknown'
}

export function checkLogin(ip: string, email: string): { allowed: boolean; retryAfterSeconds: number } {
  for (const r of [loginLimiter.check(`ip:${ip}`), loginLimiter.check(`email:${email.toLowerCase()}`), globalLoginLimiter.check('all')]) {
    if (!r.allowed) return r
  }
  return { allowed: true, retryAfterSeconds: 0 }
}
export function recordLoginFailure(ip: string, email: string): void {
  loginLimiter.recordFailure(`ip:${ip}`)
  loginLimiter.recordFailure(`email:${email.toLowerCase()}`)
  globalLoginLimiter.recordFailure('all')
}
export function recordLoginSuccess(email: string): void {
  loginLimiter.reset(`email:${email.toLowerCase()}`)
}
