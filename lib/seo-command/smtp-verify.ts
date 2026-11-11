/** VERIFY-ONLY check of the dedicated SEO report sender (SEO_SMTP_*). It opens an SMTP connection, negotiates TLS and authenticates, then closes.
 *  It NEVER sends a message: this module does not reference sendMail, the delivery function, the pipeline or the database, and it writes nothing.
 *  The response is built from an allowlist: no password, no environment values beyond the non-secret connection settings, no provider text, no stack. */
import { deliveryConfig, smtpTransportOptions } from './report-delivery'

export const EXPECTED_SENDER = 'seo-reports@reports.tapisglobalinternational.com'
export const EXPECTED_RECIPIENT = 'tapisglobalinternational@gmail.com'
type Env = Record<string, string | undefined>
type Smtp = { host: string; port: number; secure: boolean; user: string; pass: string }
/** Resolves when connection, TLS and authentication succeed; rejects otherwise. Nothing is sent. */
export type Verifier = (cfg: Smtp) => Promise<void>

export const smtpVerifyOnly: Verifier = async (cfg) => {
  const mod = await import('nodemailer')
  const nodemailer = mod.default ?? (mod as unknown as typeof mod.default)
  const t = nodemailer.createTransport(smtpTransportOptions(cfg))
  try { await t.verify() } finally { t.close() }
}

const SAFE_CODES = new Set(['EAUTH', 'ECONNECTION', 'ETIMEDOUT', 'ESOCKET', 'EDNS', 'ETLS', 'EREQUIRETLS', 'EPROTOCOL', 'ECONNREFUSED', 'ENOTFOUND', 'ECONNRESET', 'EENVELOPE', 'EDEADLINE'])
/** A fixed-vocabulary code, never the library or provider message. */
export function sanitizeVerifyError(e: unknown): { code: string; smtpResponseCode?: number } {
  const raw = e && typeof e === 'object' ? (e as { code?: unknown; responseCode?: unknown }) : {}
  const code = typeof raw.code === 'string' && SAFE_CODES.has(raw.code) ? raw.code : 'UNKNOWN_ERROR'
  const rc = typeof raw.responseCode === 'number' && Number.isInteger(raw.responseCode) && raw.responseCode >= 400 && raw.responseCode <= 599 ? raw.responseCode : undefined
  return rc ? { code, smtpResponseCode: rc } : { code }
}

const withDeadline = <T,>(p: Promise<T>, ms: number): Promise<T> => new Promise<T>((res, rej) => { const id = setTimeout(() => rej(Object.assign(new Error('deadline'), { code: 'EDEADLINE' })), ms); p.then((v) => { clearTimeout(id); res(v) }, (e) => { clearTimeout(id); rej(e) }) })

export interface VerifyResponse {
  ok: boolean
  configured: boolean
  missing?: string[]
  smtp?: { host: string; port: number; tlsMode: 'implicit-tls' | 'starttls-or-plain'; username: string; passwordConfigured: boolean }
  senderMatchesExpected: boolean
  recipientMatchesExpected: boolean
  verify: { attempted: boolean; ok: boolean; code?: string; smtpResponseCode?: number }
  emailSent: false
}

export async function verifySmtpConfig(env: Env = process.env, verify: Verifier = smtpVerifyOnly, deadlineMs = 30_000): Promise<{ status: number; body: VerifyResponse }> {
  const senderMatchesExpected = (env.SEO_SMTP_FROM ?? '').trim() === EXPECTED_SENDER
  const recipientMatchesExpected = (env.SEO_REPORT_RECIPIENT ?? '').trim() === EXPECTED_RECIPIENT
  const cfg = deliveryConfig(env)
  if (!cfg.ok) return { status: 503, body: { ok: false, configured: false, missing: cfg.missing, senderMatchesExpected, recipientMatchesExpected, verify: { attempted: false, ok: false }, emailSent: false } }
  const smtp = { host: cfg.smtp.host, port: cfg.smtp.port, tlsMode: cfg.smtp.secure ? ('implicit-tls' as const) : ('starttls-or-plain' as const), username: cfg.smtp.user, passwordConfigured: cfg.smtp.pass.length > 0 }
  try {
    await withDeadline(verify(cfg.smtp), deadlineMs)
    return { status: 200, body: { ok: true, configured: true, smtp, senderMatchesExpected, recipientMatchesExpected, verify: { attempted: true, ok: true }, emailSent: false } }
  } catch (e) {
    return { status: 502, body: { ok: false, configured: true, smtp, senderMatchesExpected, recipientMatchesExpected, verify: { attempted: true, ok: false, ...sanitizeVerifyError(e) }, emailSent: false } }
  }
}

/** Authorisation applied before anything is read from the environment or any connection is opened. */
export async function handleSmtpVerify(a: { session: unknown | null; sameOrigin: boolean; env?: Env; verify?: Verifier; deadlineMs?: number }): Promise<{ status: number; body: VerifyResponse | { ok: false; error: string } }> {
  if (!a.session) return { status: 401, body: { ok: false, error: 'Unauthorized' } }
  if (!a.sameOrigin) return { status: 403, body: { ok: false, error: 'Cross-origin request refused' } }
  return verifySmtpConfig(a.env ?? process.env, a.verify ?? smtpVerifyOnly, a.deadlineMs)
}
