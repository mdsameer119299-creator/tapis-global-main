import { buildSeoTlsOptions, isLocalDbUrl } from './db-tls'
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

/** Maps a connection/query error to an admin-safe message. Never includes connection details, hostnames, usernames or any part of the URL. */
export function safeDbErrorMessage(e: unknown): string {
  const m = e instanceof Error ? e.message : ''
  if (/password authentication failed|authentication failed/i.test(m)) return 'The SEO database rejected the credentials. Check the password in SEO_DATABASE_URL.'
  if (/Invalid URL|not a postgres:\/\//i.test(m)) return 'SEO_DATABASE_URL is not a valid connection string. If the password has special characters, URL-encode them.'
  if (/does not match SEO_DATABASE_EXPECTED_REF|not allowed for SEO data|must not point at the same database/i.test(m)) return 'SEO_DATABASE_URL failed the project safety check (expected project reference).'
  if (/timeout|timed out|ETIMEDOUT/i.test(m)) return 'The SEO database did not respond in time. Check that the project is active and the pooler host and port are correct.'
  if (/ENOTFOUND|EAI_AGAIN|ECONNREFUSED|getaddrinfo/i.test(m)) return 'The SEO database host could not be reached. Check the host in SEO_DATABASE_URL.'
  if (/relation .* does not exist/i.test(m)) return 'The SEO database schema is missing or out of date. Apply the SEO migrations.'
  return 'The SEO database could not be reached. Check the SEO_DATABASE_URL setting and database status.'
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
  const local = isLocalDbUrl(url)
  g.__seoPool = new Pool({
    connectionString: stripSslParams(url),
    max: 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 8_000,
    // Client-side timeout. A statement_timeout *startup parameter* is rejected by some poolers, so it is not used.
    query_timeout: 25_000,
    ssl: buildSeoTlsOptions(local), // strict: verifies the chain against the pinned Supabase CA and the hostname; fails closed
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
