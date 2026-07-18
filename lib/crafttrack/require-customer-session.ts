import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { CUSTOMER_SESSION_COOKIE, verifyCustomerSession, type CustomerSessionPayload } from './session'

export type RequireCustomerResult =
  | { ok: true; session: CustomerSessionPayload }
  | { ok: false; response: NextResponse }

/** API-route gate — mirrors lib/crafttrack/require-admin-session.ts exactly.
 * middleware.ts already protects /crafttrack/dashboard/* page routes via
 * redirect, but API routes need their own explicit check since a redirect
 * isn't a sensible API response. */
export async function requireCustomerSession(): Promise<RequireCustomerResult> {
  const token = cookies().get(CUSTOMER_SESSION_COOKIE)?.value
  const session = token ? await verifyCustomerSession(token) : null

  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 }),
    }
  }

  return { ok: true, session }
}

/** Server-component page gate — a page can't return a NextResponse, so this
 * redirects directly instead of returning a result the caller has to check.
 * Defensive fallback behind middleware.ts, same relationship as
 * app/admin/crafttrack/(dashboard)/layout.tsx's own redirect-if-absent. */
export async function requireCustomerSessionOrRedirect(): Promise<CustomerSessionPayload> {
  const token = cookies().get(CUSTOMER_SESSION_COOKIE)?.value
  const session = token ? await verifyCustomerSession(token) : null

  if (!session) {
    redirect('/crafttrack/access')
  }

  return session
}
