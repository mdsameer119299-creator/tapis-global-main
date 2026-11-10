import { NextResponse, type NextRequest } from 'next/server'
import { GSC_FLOW_COOKIE, flowCookieOptions, gscOAuthConfig, verifyFlowCookie, callbackResultHtml } from '@/lib/seo-command/gsc-oauth'
import { consumeOAuthState } from '@/lib/seo-command/gsc-state'
import { exchangeCode, revokeToken } from '@/lib/seo-command/gsc-google'
import { storeConnection } from '@/lib/seo-command/gsc-connection'
import { isSeoDbConfigured, withSeoTx } from '@/lib/seo-command/db'
import { audit, configuredBaseUrl, ensureSite } from '@/lib/seo-command/store'

export const dynamic = 'force-dynamic'

/** Google redirects here (a cross-site top-level GET). The Strict admin session cookie is NOT sent on this request,
 *  so authority comes from the short-lived SameSite=Lax flow cookie issued by an authenticated /connect call.
 *  Order: configuration, query shape, signed flow cookie (all before any database or Google call), then the atomic
 *  single-use state row, PKCE code exchange, encrypted storage. Every failure is a fixed generic message. */
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
  const cfg = gscOAuthConfig()
  if (!cfg) return html(503, false, 'Search Console connection is not configured.')
  const q = req.nextUrl.searchParams
  if (q.get('error')) return html(400, false, 'Google did not grant access. No connection was made.')
  const state = q.get('state')
  const code = q.get('code')
  if (!state || !code || code.length > 2048) return html(400, false, 'Invalid connection attempt.')
  const claims = await verifyFlowCookie(req.cookies.get(GSC_FLOW_COOKIE)?.value, state)
  if (!claims) return html(400, false, 'This connection attempt is invalid or has expired. Start again from the dashboard.')
  if (!isSeoDbConfigured()) return html(503, false, 'The SEO database is not configured.')

  try {
    // Burns the state row (atomic UPDATE) BEFORE anything else, so a replay, a concurrent duplicate or an admin
    // mismatch can never be retried.
    const rows = (c: { query: (t: string, p?: unknown[]) => Promise<{ rows: Record<string, any>[] }> }) => (t: string, p?: unknown[]) => c.query(t, p).then((x) => x.rows)
    const consumed = await withSeoTx(async (c) => consumeOAuthState(rows(c), { state, adminHashFromCookie: claims.adminHash }))
    if (!consumed.ok) return html(400, false, 'This connection attempt is invalid, expired or already used. Start again from the dashboard.')

    const ex = await exchangeCode(cfg, code, consumed.verifier)
    if (!ex.ok) {
      console.error('[seo-command] gsc code exchange failed:', ex.error)
      return html(502, false, ex.error === 'scope_mismatch' ? 'Google returned permissions other than read-only Search Console access. Nothing was stored.'
        : ex.error === 'no_refresh_token' ? 'Google did not return offline access. Remove the app at myaccount.google.com/permissions and connect again.'
        : 'Google rejected the connection. No connection was made.')
    }

    try {
      await withSeoTx(async (c) => {
        const siteId = await ensureSite(c, configuredBaseUrl())
        await storeConnection(rows(c), { siteId, refreshToken: ex.refreshToken, scope: ex.scope, property: cfg.property })
        await audit(c, siteId, 'oauth-callback', 'gsc.connect', 'seo_oauth_connections', null, { scope: ex.scope, property: cfg.property }, 'SYSTEM')
      })
    } catch (e) {
      // Do not leave a usable grant at Google that we failed to store.
      await revokeToken(ex.refreshToken)
      console.error('[seo-command] gsc store failed:', e instanceof Error ? e.name : 'unknown')
      return html(500, false, 'The connection could not be saved. Access was revoked at Google; start again.')
    }
    return html(200, true, 'Search Console access was granted (read-only). No data has been requested yet.')
  } catch (e) {
    console.error('[seo-command] gsc callback failed:', e instanceof Error ? e.name : 'unknown')
    return html(500, false, 'The connection attempt failed. No connection was made.')
  }
}
