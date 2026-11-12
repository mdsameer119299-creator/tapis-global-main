import { createHash, timingSafeEqual } from 'crypto'
import type { SeoSession } from './auth-session'
import { getSeoPool, SeoDbNotConfiguredError } from './db'

/** TEMPORARY diagnostic (to be removed in a separately reviewed change). Reports which database login the application's SEO pool actually uses.
 *  Returns ONLY the two role names. No connection string, host, username-from-URL, environment value, error text, query diagnostics or other metadata.
 *  Writes nothing and logs nothing. */
export const ROLE_DIAGNOSTIC_SQL = 'SELECT current_user::text AS current_user, session_user::text AS session_user;'

export type RoleQuery = (sql: string) => Promise<{ rows: Array<Record<string, unknown>> }>
export type RoleDiagnosticResult =
  | { status: 200; body: { ok: true; current_user: string; session_user: string } }
  | { status: 401 | 403 | 500 | 503; body: { ok: false; error: string } }

const defaultQuery: RoleQuery = (sql) => getSeoPool().query(sql)
const digest = (e: string) => createHash('sha256').update(e.toLowerCase().trim()).digest()
/** Same comparison rule as the login (auth-password.ts): the session email must still be the configured SEO admin email. Fails closed when none is configured. */
const isConfiguredAdmin = (session: SeoSession, adminEmail: string | undefined) => !!adminEmail && timingSafeEqual(digest(session.email), digest(adminEmail))
const validRole = (v: unknown): v is string => typeof v === 'string' && v.length > 0 && v.length <= 63

export async function handleRoleDiagnostic(args: { session: SeoSession | null; adminEmail?: string; query?: RoleQuery }): Promise<RoleDiagnosticResult> {
  if (!args.session) return { status: 401, body: { ok: false, error: 'Unauthorized' } } // checked first: no database access without a valid admin session
  if (!isConfiguredAdmin(args.session, args.adminEmail)) return { status: 403, body: { ok: false, error: 'Forbidden' } } // a valid session for any other identity (e.g. admin email changed since sign-in) never reaches the database
  try {
    const r = await (args.query ?? defaultQuery)(ROLE_DIAGNOSTIC_SQL)
    const row = r.rows[0]
    if (r.rows.length !== 1 || !row || !validRole(row.current_user) || !validRole(row.session_user)) return { status: 500, body: { ok: false, error: 'Diagnostic failed' } }
    return { status: 200, body: { ok: true, current_user: row.current_user, session_user: row.session_user } }
  } catch (e) {
    if (e instanceof SeoDbNotConfiguredError) return { status: 503, body: { ok: false, error: 'SEO database is not configured' } }
    return { status: 500, body: { ok: false, error: 'Diagnostic failed' } } // fixed message; the driver error is never returned or logged
  }
}
