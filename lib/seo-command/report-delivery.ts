/** Delivery of a generated daily report by email. Reuses the project's existing SMTP configuration names (SMTP_HOST / SMTP_PORT / SMTP_SECURE / SMTP_USER / SMTP_PASS / SMTP_FROM / SMTP_FROM_NAME)
 *  but NEVER the enquiry recipient: the recipient must be set explicitly in SEO_REPORT_RECIPIENT. With no confirmed recipient or no SMTP config nothing is sent and the status is NOT_CONFIGURED.
 *  Generation and delivery are separate statuses. The recipient address is never logged or stored. */
type Env = Record<string, string | undefined>
export type DeliveryStatus = 'NOT_CONFIGURED' | 'SENT' | 'FAILED' | 'SKIPPED_ALREADY_SENT'
export interface DeliveryResult { status: DeliveryStatus; missing?: string[]; code?: string; messageId?: string; attemptedAt: string }
export interface Mail { to: string; from: string; subject: string; text: string; html: string }
export type Send = (cfg: { host: string; port: number; secure: boolean; user: string; pass: string }, mail: Mail) => Promise<{ messageId?: string }>

const EMAIL = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/
export function deliveryConfig(env: Env = process.env): { ok: true; to: string; from: string; smtp: { host: string; port: number; secure: boolean; user: string; pass: string } } | { ok: false; missing: string[] } {
  const missing: string[] = []
  const to = (env.SEO_REPORT_RECIPIENT ?? '').trim(); if (!EMAIL.test(to)) missing.push('SEO_REPORT_RECIPIENT')
  const host = (env.SMTP_HOST ?? '').trim(), user = (env.SMTP_USER ?? '').trim(), pass = env.SMTP_PASS ?? ''; const from = (env.SMTP_FROM ?? '').trim()
  if (!host) missing.push('SMTP_HOST'); if (!user) missing.push('SMTP_USER'); if (!pass) missing.push('SMTP_PASS'); if (!EMAIL.test(from)) missing.push('SMTP_FROM')
  if (missing.length) return { ok: false, missing }
  const port = Number(env.SMTP_PORT ?? 587)
  return { ok: true, to, from: env.SMTP_FROM_NAME ? `"${env.SMTP_FROM_NAME.replace(/["\r\n]/g, '')}" <${from}>` : from, smtp: { host, port: Number.isInteger(port) ? port : 587, secure: env.SMTP_SECURE === 'true' || port === 465, user, pass } }
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
/** Minimal markdown -> HTML (headings, bullets, paragraphs) so the email is readable without extra dependencies. */
export function markdownToHtml(md: string): string {
  const out: string[] = []; let list = false
  for (const raw of md.split('\n')) {
    const line = raw.trimEnd(); const li = /^- (.*)$/.exec(line)
    if (li) { if (!list) { out.push('<ul>'); list = true } out.push(`<li>${esc(li[1]).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')}</li>`); continue }
    if (list) { out.push('</ul>'); list = false }
    const h = /^(#{1,3}) (.*)$/.exec(line)
    out.push(h ? `<h${h[1].length + 1}>${esc(h[2])}</h${h[1].length + 1}>` : line ? `<p>${esc(line).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')}</p>` : '')
  }
  if (list) out.push('</ul>')
  return `<div style="font-family:Arial,sans-serif;font-size:14px;color:#222;max-width:720px">${out.join('\n')}</div>`
}

export const smtpSend: Send = async (cfg, mail) => {
  const nodemailer = (await import('nodemailer')).default
  const t = nodemailer.createTransport({ host: cfg.host, port: cfg.port, secure: cfg.secure, auth: { user: cfg.user, pass: cfg.pass }, connectionTimeout: 15000, socketTimeout: 20000 })
  const r = await t.sendMail({ to: mail.to, from: mail.from, subject: mail.subject, text: mail.text, html: mail.html })
  return { messageId: r.messageId }
}

export async function deliverReport(r: { title: string; summaryMd: string; previousDeliveryStatus?: string | null; force?: boolean }, env: Env = process.env, send: Send = smtpSend): Promise<DeliveryResult> {
  const attemptedAt = new Date().toISOString()
  if (r.previousDeliveryStatus === 'SENT' && !r.force) return { status: 'SKIPPED_ALREADY_SENT', attemptedAt }
  const cfg = deliveryConfig(env)
  if (!cfg.ok) return { status: 'NOT_CONFIGURED', missing: cfg.missing, attemptedAt }
  for (let attempt = 0; attempt < 2; attempt++) {
    try { const res = await send(cfg.smtp, { to: cfg.to, from: cfg.from, subject: r.title, text: r.summaryMd, html: markdownToHtml(r.summaryMd) }); return { status: 'SENT', messageId: res.messageId, attemptedAt } }
    catch (e) { if (attempt === 1) return { status: 'FAILED', code: safeCode(e), attemptedAt } }
  }
  return { status: 'FAILED', code: 'UNKNOWN', attemptedAt }
}
function safeCode(e: unknown): string { const c = (e as any)?.code; return typeof c === 'string' && /^[A-Z0-9_]{2,30}$/.test(c) ? c : 'SEND_ERROR' }
