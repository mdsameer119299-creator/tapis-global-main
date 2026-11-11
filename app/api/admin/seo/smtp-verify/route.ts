import { cookies, headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { SEO_SESSION_COOKIE, verifySeoSession } from '@/lib/seo-command/auth-session'
import { originMatchesHost } from '@/lib/seo-command/auth'
import { handleSmtpVerify } from '@/lib/seo-command/smtp-verify'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/** Admin-only, same-origin, VERIFY-ONLY check of the dedicated SEO report sender (connect + TLS + authenticate). Never sends mail.
 *  Deliberately does not use the standard API wrapper: it needs no database, and this route must write nothing (no seo_sites, no seo_reports, no delivery record). */
export async function POST() {
  const session = await verifySeoSession(cookies().get(SEO_SESSION_COOKIE)?.value)
  const r = await handleSmtpVerify({ session, sameOrigin: originMatchesHost(headers()) })
  return NextResponse.json(r.body, { status: r.status, headers: { 'cache-control': 'no-store' } })
}
