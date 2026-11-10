import { NextResponse, type NextRequest } from 'next/server'
import { originMatchesHost } from '@/lib/seo-command/auth'
import { SEO_SESSION_COOKIE, seoClearCookieOptions } from '@/lib/seo-command/auth-session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Clears the SEO session cookie. Works even when the session has already expired. */
export async function POST(request: NextRequest) {
  if (!originMatchesHost(request.headers)) return NextResponse.json({ ok: false, error: 'Cross-origin request refused' }, { status: 403, headers: { 'Cache-Control': 'no-store' } })
  const res = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
  res.cookies.set(SEO_SESSION_COOKIE, '', seoClearCookieOptions())
  return res
}
