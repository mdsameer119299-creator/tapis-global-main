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

export function isSeoDbConfigured(): boolean {
  return !!process.env.SEO_DATABASE_URL
}

const g = globalThis as unknown as { __seoPool?: Pool }

export function getSeoPool(): Pool {
  if (g.__seoPool) return g.__seoPool
  const url = assertSafeSeoDbUrl(process.env.SEO_DATABASE_URL)
  const local = /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(url)
  g.__seoPool = new Pool({
    connectionString: url,
    max: 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 8_000,
    statement_timeout: 20_000,
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
