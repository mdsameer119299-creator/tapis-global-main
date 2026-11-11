import { Pool } from 'pg'
import { stripSslParams } from './db'
import { buildSeoTlsOptions, isLocalDbUrl } from './db-tls'

/** The one-time Search Console import uses its OWN database login, taken ONLY from SEO_IMPORT_DATABASE_URL.
 *  - There is NO fallback: if the variable is missing or unsafe, the importer refuses. It never reads SEO_DATABASE_URL or DATABASE_URL to connect.
 *  - The login is the pinned, non-superuser, NOBYPASSRLS role below, a member of `seo_importer` only (WITH INHERIT FALSE, SET TRUE).
 *  - SEO_DATABASE_URL / DATABASE_URL are read here ONLY to prove the import URL is different from them; they are never connected to.
 *  - Error messages never contain the URL, host, user or password. */
export const IMPORT_LOGIN_ROLE = 'seo_import_app'
export const IMPORT_DB_ENV = 'SEO_IMPORT_DATABASE_URL'
const FORBIDDEN_REFS = ['qgltrhszzqtgmaaglbfz' /* CraftTrack production */, 'sliftmuqfxzcafedlbat' /* paused legacy project */]

export class ImportDbNotConfiguredError extends Error {
  constructor(message = 'SEO_IMPORT_DATABASE_URL is not configured') { super(message); this.name = 'ImportDbNotConfiguredError' }
}
export class ImportDbUnsafeError extends Error {
  constructor(message: string) { super(message); this.name = 'ImportDbUnsafeError' }
}

interface Others { seoUrl?: string; mainUrl?: string; expectedRef: string }
const parse = (u: string) => { try { return new URL(u) } catch { return null } }

/** Throws unless `url` is the approved restricted importer login on the approved project and differs from the other two database URLs. Exported for tests. */
export function assertSafeImportDbUrl(url: string | undefined, o: Others): string {
  if (!url) throw new ImportDbNotConfiguredError()
  if (!/^postgres(ql)?:\/\//i.test(url)) throw new ImportDbUnsafeError('SEO_IMPORT_DATABASE_URL must be a postgres:// connection string')
  const u = parse(url)
  if (!u) throw new ImportDbUnsafeError('SEO_IMPORT_DATABASE_URL is not a valid connection string')
  const ref = o.expectedRef.toLowerCase(), lower = url.toLowerCase()
  if (!ref || !lower.includes(ref)) throw new ImportDbUnsafeError('SEO_IMPORT_DATABASE_URL is not on the approved SEO development project')
  for (const f of FORBIDDEN_REFS) if (lower.includes(f)) throw new ImportDbUnsafeError('SEO_IMPORT_DATABASE_URL points at a project that is not allowed')
  // Login name: exactly the pinned role. Supabase poolers append ".<project-ref>"; nothing else is accepted.
  const [base, ...rest] = decodeURIComponent(u.username).split('.')
  if (base !== IMPORT_LOGIN_ROLE || (rest.length > 0 && (rest.length !== 1 || rest[0].toLowerCase() !== ref))) throw new ImportDbUnsafeError('SEO_IMPORT_DATABASE_URL must use the dedicated import login')
  for (const other of [o.seoUrl, o.mainUrl]) {
    if (!other) continue
    const ou = parse(other)
    if (other === url) throw new ImportDbUnsafeError('SEO_IMPORT_DATABASE_URL must differ from the other database URLs')
    if (ou && u.password && ou.password && decodeURIComponent(u.password) === decodeURIComponent(ou.password)) throw new ImportDbUnsafeError('SEO_IMPORT_DATABASE_URL must not reuse another connection password')
    if (ou && decodeURIComponent(ou.username).split('.')[0] === IMPORT_LOGIN_ROLE) throw new ImportDbUnsafeError('SEO_IMPORT_DATABASE_URL must differ from the other database URLs')
  }
  return url
}

export function isImportDbConfigured(): boolean { return !!process.env.SEO_IMPORT_DATABASE_URL }

const g = globalThis as unknown as { __seoImportPool?: Pool }

/** The importer's own pool. Never falls back to getSeoPool()/DATABASE_URL. Throws ImportDbNotConfiguredError / ImportDbUnsafeError (messages are URL-free). */
export function getImportPool(env: NodeJS.ProcessEnv = process.env): Pool {
  if (g.__seoImportPool) return g.__seoImportPool
  const url = assertSafeImportDbUrl(env.SEO_IMPORT_DATABASE_URL, { seoUrl: env.SEO_DATABASE_URL, mainUrl: env.DATABASE_URL, expectedRef: env.SEO_DATABASE_EXPECTED_REF ?? '' })
  const local = isLocalDbUrl(url)
  g.__seoImportPool = new Pool({
    connectionString: stripSslParams(url),
    max: 2,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 8_000,
    query_timeout: 25_000,
    ssl: buildSeoTlsOptions(local, env), // strict: verifies the chain against the pinned Supabase CA and the hostname; fails closed
  })
  g.__seoImportPool.on('error', () => undefined)
  return g.__seoImportPool
}

/** For tests only. */
export function __setImportPoolForTests(p: Pool | undefined): void { g.__seoImportPool = p }
