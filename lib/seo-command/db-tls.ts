import { createHash, X509Certificate } from 'node:crypto'
import type { ConnectionOptions } from 'node:tls'
import { SUPABASE_CA_PEM, SUPABASE_CA_SHA256 } from './supabase-ca'

/** Strict TLS for the SEO Postgres pools (SEO_DATABASE_URL and SEO_IMPORT_DATABASE_URL).
 *  - The server certificate chain must verify against the pinned Supabase CA certificate(s): rejectUnauthorized is ALWAYS true.
 *  - The hostname in the connection string must match the certificate (node:tls checkServerIdentity; pg sends it as SNI). No override.
 *  - There is NO "unverified" mode and no escape hatch. If the CA is missing or malformed the pool fails CLOSED with a clear, URL-free error.
 *  - Each certificate in the bundle must match a SHA-256 fingerprint pinned in code, so a swapped PEM (or env value) cannot silently widen trust.
 *  - CA rotation: add the new certificate + fingerprint to supabase-ca.ts (a reviewed code change); an emergency override is SEO_DB_CA_PEM (a CA bundle,
 *    verified the same way against SEO_DB_CA_SHA256, a comma-separated pin list). Both still verify; neither can disable verification. */
export class SeoDbTlsError extends Error {
  constructor(message: string) { super(message); this.name = 'SeoDbTlsError' }
}

const PEM_RE = /-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g

export function splitPem(bundle: string): string[] { return bundle.match(PEM_RE) ?? [] }

export function fingerprintOf(pem: string): string {
  return createHash('sha256').update(new X509Certificate(pem).raw).digest('hex').toUpperCase()
}

/** Throws unless the bundle holds >=1 parseable, currently-valid certificate, each of whose SHA-256 fingerprint is in `pins`. */
export function validateCaBundle(bundle: string, pins: string[], now: Date = new Date()): string[] {
  const certs = splitPem(bundle)
  if (certs.length === 0) throw new SeoDbTlsError('Database TLS CA certificate is not configured; refusing to connect without verification')
  const allowed = new Set(pins.map((p) => p.replace(/[^0-9a-f]/gi, '').toUpperCase()).filter(Boolean))
  if (allowed.size === 0) throw new SeoDbTlsError('Database TLS CA pin list is empty; refusing to connect')
  for (const pem of certs) {
    let x: X509Certificate
    try { x = new X509Certificate(pem) } catch { throw new SeoDbTlsError('Database TLS CA certificate is malformed') }
    if (!allowed.has(createHash('sha256').update(x.raw).digest('hex').toUpperCase())) throw new SeoDbTlsError('Database TLS CA certificate does not match a pinned fingerprint')
    if (new Date(x.validTo) < now || new Date(x.validFrom) > now) throw new SeoDbTlsError('Database TLS CA certificate is outside its validity period')
  }
  return certs
}

/** True only when the connection string's HOST is loopback. Parsed, not pattern-matched against the whole string, so a query string or path
 *  containing "@localhost/" can never switch TLS off for a remote host. Anything unparseable is NOT local (=> strict TLS). */
export function isLocalDbUrl(url: string): boolean {
  try {
    const h = new URL(url).hostname.toLowerCase()
    return h === 'localhost' || h === '127.0.0.1' || h === '[::1]' || h === '::1'
  } catch {
    return false
  }
}

/** Returns undefined for local development databases (no TLS), otherwise strict verifying options. Never returns rejectUnauthorized:false. */
export function buildSeoTlsOptions(local: boolean, env: Record<string, string | undefined> = process.env, now: Date = new Date()): ConnectionOptions | undefined {
  if (local) return undefined
  const override = env.SEO_DB_CA_PEM
  const certs = override
    ? validateCaBundle(override.replace(/\\n/g, '\n'), (env.SEO_DB_CA_SHA256 ?? '').split(','), now)
    : validateCaBundle(SUPABASE_CA_PEM, SUPABASE_CA_SHA256, now)
  return { ca: certs, rejectUnauthorized: true, minVersion: 'TLSv1.2' }
}
