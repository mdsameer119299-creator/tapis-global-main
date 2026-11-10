import { Pool, type PoolClient, type QueryResultRow } from 'pg'

/** The SEO Command Centre talks ONLY to the SEO database via SEO_DATABASE_URL.
 * It never reads or writes DATABASE_URL (the live website / CraftTrack database). */

// Project refs that must never be used as the SEO database.
const FORBIDDEN_REFS = ['qgltrhszzqtgmaaglbfz' /* CraftTrack production */, 'sliftmuqfxzcafedlbat' /* paused legacy project */]

export class SeoDbNotConfiguredError extends Error {
  constructor(message = 'SEO_DATABASE_URL is not configured') {
    super(message)
    this.name = 'SeoDbNotConfiguredError'
  }
}

function dbIdentity(url: string): string {
  try {
    const u = new URL(url)
    return `${u.hostname}:${u.port || '5432'}${u.pathname}`
  } catch {
    return ''
  }
}

/** Throws if the URL is unsafe to use for SEO data. Exported for tests. Error messages never include the URL. */
export function assertSafeSeoDbUrl(seoUrl: string | undefined, mainUrl: string | undefined = process.env.DATABASE_URL): string {
  if (!seoUrl) throw new SeoDbNotConfiguredError()
  if (!/^postgres(ql)?:\/\//i.test(seoUrl)) throw new Error('SEO_DATABASE_URL must be a postgres:// connection string')
  if (mainUrl && (seoUrl === mainUrl || (dbIdentity(seoUrl) && dbIdentity(seoUrl) === dbIdentity(mainUrl)))) {
    throw new Error('SEO_DATABASE_URL must not point at the same database as DATABASE_URL')
  }
  const lower = seoUrl.toLowerCase()
  for (const ref of FORBIDDEN_REFS) {
    if (lower.includes(ref)) throw new Error('SEO_DATABASE_URL points at a project that is not allowed for SEO data')
  }
  const expected = process.env.SEO_DATABASE_EXPECTED_REF
  if (expected && !lower.includes(expected.toLowerCase())) {
    throw new Error('SEO_DATABASE_URL does not match SEO_DATABASE_EXPECTED_REF')
  }
  return seoUrl
}

/** Value-free description of how SEO_DATABASE_URL is shaped, for diagnosing connection failures.
 * Never returns the password or the URL itself; only host/port/database, the user *form*, and password shape hints. */
export function describeSeoDbUrl(url: string | undefined = process.env.SEO_DATABASE_URL): string {
  if (!url) return 'SEO_DATABASE_URL missing'
  try {
    const u = new URL(url)
    const user = decodeURIComponent(u.username)
    const ref = (process.env.SEO_DATABASE_EXPECTED_REF || '').toLowerCase()
    const userForm = user === 'postgres' ? 'postgres (no project suffix)' : ref && user.toLowerCase() === `postgres.${ref}` ? 'postgres.<expected ref>' : user.startsWith('postgres.') ? 'postgres.<other ref>' : 'other'
    const hostKind = /\.pooler\.supabase\.com$/i.test(u.hostname) ? 'pooler' : /^db\..+\.supabase\.co$/i.test(u.hostname) ? 'direct' : 'other'
    const pw = u.password
    const hints = [`len=${pw.length}`, /^\[.*\]$/.test(decodeURIComponent(pw)) ? 'wrapped in [ ] (placeholder brackets)' : '', /[\s"']/.test(decodeURIComponent(pw)) ? 'contains space/quote' : ''].filter(Boolean).join(', ')
    return `host=${u.hostname} (${hostKind}) port=${u.port || '5432'} db=${u.pathname.replace('/', '')} user=${userForm} password: ${hints}`
  } catch {
    return 'SEO_DATABASE_URL is not a parseable URL'
  }
}

export function isSeoDbConfigured(): boolean {
  return !!process.env.SEO_DATABASE_URL
}

/** Removes libpq-style ssl* parameters so they cannot override the explicit `ssl` option below
 * (pg 8.x treats sslmode=require as verify-full, which fails against Supabase's certificate chain). Exported for tests. */
export function stripSslParams(url: string): string {
  try {
    const u = new URL(url)
    for (const k of Array.from(u.searchParams.keys())) if (/^ssl/i.test(k) || k === 'uselibpqcompat') u.searchParams.delete(k)
    return u.toString()
  } catch {
    return url
  }
}

const g = globalThis as unknown as { __seoPool?: Pool }

export function getSeoPool(): Pool {
  if (g.__seoPool) return g.__seoPool
  const url = assertSafeSeoDbUrl(process.env.SEO_DATABASE_URL)
  const local = /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(url)
  g.__seoPool = new Pool({
    connectionString: stripSslParams(url),
    max: 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 8_000,
    // Client-side timeout. A statement_timeout *startup parameter* is rejected by some poolers, so it is not used.
    query_timeout: 25_000,
    ssl: local ? undefined : { rejectUnauthorized: false }, // Supabase poolers present a Supabase-issued chain
  })
  g.__seoPool.on('error', () => undefined) // idle-client errors must not crash the server
  return g.__seoPool
}

export async function seoQuery<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []): Promise<T[]> {
  const r = await getSeoPool().query<T>(text, params)
  return r.rows
}

export async function withSeoTx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const c = await getSeoPool().connect()
  try {
    await c.query('BEGIN')
    const out = await fn(c)
    await c.query('COMMIT')
    return out
  } catch (e) {
    await c.query('ROLLBACK').catch(() => undefined)
    throw e
  } finally {
    c.release()
  }
}

/** For tests: use a specific pool instead of the env-configured one. */
export function __setSeoPoolForTests(p: Pool | undefined): void {
  g.__seoPool = p
}
