import nodemailer from 'nodemailer'
import type { EnquiryFormType } from '@/lib/submit-enquiry'

const FORM_LABELS: Record<EnquiryFormType, string> = {
  contact:   'Website Contact Enquiry',
  inquiry:   'Homepage Project Enquiry',
  custom:    'Custom Carpet Enquiry',
  catalogue: 'Catalogue Request',
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatFieldLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function buildEnquiryEmailHtml(formType: EnquiryFormType, fields: Record<string, string>) {
  const rows = Object.entries(fields)
    .filter(([, v]) => v.trim().length > 0)
    .map(
      ([key, value]) =>
        `<tr><td style="padding:10px 14px;border-bottom:1px solid #eee;font-weight:600;color:#4A1414;vertical-align:top;width:180px;">${escapeHtml(formatFieldLabel(key))}</td><td style="padding:10px 14px;border-bottom:1px solid #eee;color:#333;">${escapeHtml(value).replace(/\n/g, '<br>')}</td></tr>`,
    )
    .join('')

  return `
<!DOCTYPE html>
<html>
<body style="font-family:Georgia,serif;background:#f8f4ee;padding:24px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e0d3bc;">
    <div style="background:#4A1414;padding:20px 24px;">
      <h1 style="margin:0;font-size:18px;color:#EDD99A;font-weight:normal;">${escapeHtml(FORM_LABELS[formType])}</h1>
      <p style="margin:8px 0 0;font-size:12px;color:rgba(255,255,255,0.6);">Tapis Global International — Website</p>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${rows}
    </table>
    <p style="padding:16px 24px;margin:0;font-size:11px;color:#888;">Sent ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
  </div>
</body>
</html>`
}

export function buildEnquiryEmailText(formType: EnquiryFormType, fields: Record<string, string>) {
  const lines = Object.entries(fields)
    .filter(([, v]) => v.trim().length > 0)
    .map(([key, value]) => `${formatFieldLabel(key)}: ${value}`)

  return `${FORM_LABELS[formType]}\n${'—'.repeat(40)}\n\n${lines.join('\n')}\n\n—\nTapis Global International Website`
}

function getNotifyEmails(): string[] {
  const raw = process.env.ENQUIRY_NOTIFY_EMAIL ?? 'enquiry@tapisglobalinternational.com,sales@tapisglobalinternational.com'
  return raw.split(',').map((e) => e.trim()).filter(Boolean)
}

function getTransporter() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT ?? 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    auth: { user, pass },
  })
}

export async function sendEnquiryEmail(opts: {
  formType: EnquiryFormType
  fields: Record<string, string>
  attachment?: { filename: string; content: Buffer; contentType?: string }
}) {
  const transporter = getTransporter()
  if (!transporter) {
    throw new Error(
      'Email is not configured on the server. Add SMTP settings to .env (see .env.example).',
    )
  }

  const notifyTo = getNotifyEmails()
  const fromEmail = process.env.SMTP_FROM ?? process.env.SMTP_USER!
  const fromName = process.env.SMTP_FROM_NAME ?? 'Tapis Global Website'
  const replyTo = opts.fields.email?.trim() || fromEmail

  const subject = `[${FORM_LABELS[opts.formType]}] ${opts.fields.name ?? opts.fields.company ?? 'New lead'} — Tapis Global`

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: notifyTo,
    replyTo,
    subject,
    text: buildEnquiryEmailText(opts.formType, opts.fields),
    html: buildEnquiryEmailHtml(opts.formType, opts.fields),
    attachments: opts.attachment
      ? [
          {
            filename: opts.attachment.filename,
            content: opts.attachment.content,
            contentType: opts.attachment.contentType,
          },
        ]
      : undefined,
  })
}
