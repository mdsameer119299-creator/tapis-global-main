import { NextResponse, type NextRequest } from 'next/server'
import { GSC_FLOW_COOKIE, flowCookieOptions, gscOAuthConfig, verifyFlowCookie, callbackResultHtml } from '@/lib/seo-command/gsc-oauth'

export const dynamic = 'force-dynamic'

/** Google redirects here (a cross-site top-level GET). The Strict admin session cookie is NOT sent on this request,
 *  so authority comes from the short-lived SameSite=Lax flow cookie issued by an authenticated /connect call.
 *  Every check below happens BEFORE any database or Google call, and every failure is a fixed generic message. */
function html(status: number, ok: boolean, message: string) {
  const res = new NextResponse(callbackResultHtml({ ok, message, continueHref: '/admin/seo' }), {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'referrer-policy': 'no-referrer', 'x-robots-tag': 'noindex' },
  })
  // The flow cookie is single-use: always clear it, whatever the outcome.
  res.cookies.set(GSC_FLOW_COOKIE, '', { ...flowCookieOptions(), maxAge: 0 })
  return res
}

export async function GET(req: NextRequest) {
  if (!gscOAuthConfig()) return html(503, false, 'Search Console connection is not configured.')
  const q = req.nextUrl.searchParams
  if (q.get('error')) return html(400, false, 'Google did not grant access. No connection was made.')
  const state = q.get('state')
  const code = q.get('code')
  if (!state || !code || code.length > 2048) return html(400, false, 'Invalid connection attempt.')
  const claims = await verifyFlowCookie(req.cookies.get(GSC_FLOW_COOKIE)?.value, state)
  if (!claims) return html(400, false, 'This connection attempt is invalid or has expired. Start again from the dashboard.')
  // Step 5 (single-use state row, PKCE exchange, sites.list check, encrypted token storage) is intentionally not
  // enabled until the database migration is reviewed and approved.
  return html(503, false, 'Connection storage is not enabled yet.')
}
