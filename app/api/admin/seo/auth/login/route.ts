import { NextResponse, type NextRequest } from 'next/server'
import { originMatchesHost } from '@/lib/seo-command/auth'
import { SEO_SESSION_COOKIE, seoCookieOptions, signSeoSession, isSeoSessionConfigured } from '@/lib/seo-command/auth-session'
import { isLoginConfigured, verifyAdminCredentials } from '@/lib/seo-command/auth-password'
import { checkLogin, clientIp, recordLoginFailure, recordLoginSuccess } from '@/lib/seo-command/auth-rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const json = (body: Record<string, unknown>, status: number, extra: Record<string, string> = {}) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store', ...extra } })

/** SEO-only login. Verifies against SEO_ADMIN_EMAIL / SEO_ADMIN_PASSWORD_HASH and issues the seo_admin_session cookie.
 * Touches no database and no other authentication system. */
export async function POST(request: NextRequest) {
  if (!originMatchesHost(request.headers)) return json({ ok: false, error: 'Cross-origin request refused' }, 403)
  if (!isLoginConfigured() || !isSeoSessionConfigured()) return json({ ok: false, error: 'SEO login is not configured for this environment.' }, 503)

  const text = await request.text()
  let body: { email?: unknown; password?: unknown } = {}
  try {
    if (text.length <= 2000) body = JSON.parse(text)
  } catch { /* handled below */ }
  const email = typeof body.email === 'string' ? body.email.trim().slice(0, 254) : ''
  const password = typeof body.password === 'string' ? body.password : ''
  if (!email || !password || password.length > 200) return json({ ok: false, error: 'Enter your email and password.' }, 400)

  const ip = clientIp(request.headers)
  const gate = checkLogin(ip, email)
  if (!gate.allowed) return json({ ok: false, error: 'Too many attempts. Please try again later.' }, 429, { 'Retry-After': String(gate.retryAfterSeconds) })

  if (!verifyAdminCredentials(email, password)) {
    recordLoginFailure(ip, email)
    await new Promise((r) => setTimeout(r, 400)) // slows online guessing further
    return json({ ok: false, error: 'Incorrect email or password.' }, 401) // identical for unknown email and wrong password
  }

  recordLoginSuccess(email)
  const token = await signSeoSession(email)
  const res = json({ ok: true }, 200)
  res.cookies.set(SEO_SESSION_COOKIE, token, seoCookieOptions())
  return res
}
