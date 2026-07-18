import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_SESSION_COOKIE, verifyAdminSession, type AdminSessionPayload } from './session'

export type RequireAdminResult =
  | { ok: true; session: AdminSessionPayload }
  | { ok: false; response: NextResponse }

/** Every mutating/reading admin API route starts with this — middleware.ts
 * only protects page routes (via redirect), API routes need their own
 * explicit 401 since a redirect isn't a sensible API response. */
export async function requireAdminSession(): Promise<RequireAdminResult> {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value
  const session = token ? await verifyAdminSession(token) : null

  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 }),
    }
  }

  return { ok: true, session }
}

/** publishedBy/actor/uploadedBy are deliberately plain admin-email strings
 * (see schema comments) — never adminId. Centralized so call sites can't
 * drift between the two. */
export function actorEmail(session: AdminSessionPayload): string {
  return session.email
}
