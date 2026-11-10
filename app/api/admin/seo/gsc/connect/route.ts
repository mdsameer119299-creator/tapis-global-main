import { NextResponse } from 'next/server'
import { seoApi } from '@/lib/seo-command/auth'
import { seoQuery } from '@/lib/seo-command/db'
import { GSC_FLOW_COOKIE, buildAuthUrl, flowCookieOptions, gscOAuthConfig, newCodeVerifier, newState, signFlowCookie } from '@/lib/seo-command/gsc-oauth'
import { createOAuthState } from '@/lib/seo-command/gsc-state'

export const dynamic = 'force-dynamic'

/** Starts the Google consent flow. Admin session + same-origin required (seoApi, mutating). Returns the Google URL as
 *  JSON; the browser navigates to it. The response also sets the short-lived flow cookie (Lax, callback path only). */
export const POST = seoApi({ mutating: true }, async ({ actor }) => {
  const cfg = gscOAuthConfig()
  if (!cfg) return NextResponse.json({ ok: false, error: 'Search Console connection is not configured for this environment.' }, { status: 503 })
  const state = newState()
  const verifier = newCodeVerifier()
  await createOAuthState(seoQuery, { state, verifier, adminEmail: actor })
  const res = NextResponse.json({ ok: true, authUrl: buildAuthUrl(cfg, state, verifier) }, { headers: { 'cache-control': 'no-store' } })
  res.cookies.set(GSC_FLOW_COOKIE, await signFlowCookie(state, actor), flowCookieOptions())
  return res
})
