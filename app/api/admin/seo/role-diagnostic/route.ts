import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SEO_SESSION_COOKIE, verifySeoSession } from '@/lib/seo-command/auth-session'
import { handleRoleDiagnostic } from '@/lib/seo-command/role-diagnostic'

export const dynamic = 'force-dynamic'

/** TEMPORARY, admin-only, read-only. Returns current_user and session_user of the SEO pool connection and nothing else.
 *  Uses the existing SEO admin session; deliberately not the standard API wrapper (that one calls getOrCreateSiteId, which can write). To be removed after use. */
export async function GET() {
  const session = await verifySeoSession(cookies().get(SEO_SESSION_COOKIE)?.value)
  const r = await handleRoleDiagnostic({ session, adminEmail: process.env.SEO_ADMIN_EMAIL })
  return NextResponse.json(r.body, { status: r.status, headers: { 'cache-control': 'no-store' } })
}
