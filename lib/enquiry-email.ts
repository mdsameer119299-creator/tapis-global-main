import nodemailer from 'nodemailer'
import type { EnquiryFormType } from '@/lib/submit-enquiry'
import { SEO_BASE_URL, BRAND } from '@/lib/seo'

const FORM_LABELS: Record<EnquiryFormType, string> = {
  contact:   'Website Contact Enquiry',
  inquiry:   'Homepage Project Enquiry',
  custom:    'Custom Carpet Enquiry',
  catalogue: 'Catalogue Request',
}

const LOGO_URL = `${SEO_BASE_URL}/logos/tgi-header-logo1.png`
const REPLY_TO = BRAND.emailEnquiry

export type EmailDeliveryResult = {
  kind: 'internal' | 'acknowledgement'
  to: string
  status: 'sent' | 'skipped' | 'failed'
  messageId?: string
  response?: string
  reason?: string
}

export type EnquiryEmailResult = {
  internal: EmailDeliveryResult
  acknowledgement: EmailDeliveryResult
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

function logEmail(event: string, data: Record<string, unknown>) {
  console.info(`[enquiry-email] ${event}`, data)
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
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
      <h1 style="margin:0;font-size: 20px;color:#EDD99A;font-weight:normal;">${escapeHtml(FORM_LABELS[formType])}</h1>
      <p style="margin:8px 0 0;font-size: 14px;color:rgba(255,255,255,0.6);">Tapis Global International — Website</p>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size: 16px;">
      ${rows}
    </table>
    <p style="padding:16px 24px;margin:0;font-size: 13px;color:#888;">Sent ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
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

export function buildAcknowledgementEmailHtml(contactName: string) {
  const greeting = contactName.trim() || 'there'

  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:Georgia,'Times New Roman',serif;background:#f8f4ee;">
  <div style="max-width:600px;margin:0 auto;padding:32px 20px;">
    <div style="background:#fff;border:1px solid #e0d3bc;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#4A1414 0%,#6B1F1F 100%);padding:28px 32px;text-align:center;border-bottom:3px solid #C09B4A;">
        <img src="${LOGO_URL}" alt="Tapis Global International" width="180" style="max-width:180px;height:auto;margin-bottom:16px;" />
        <p style="margin:0;font-size: 13px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(237,217,154,0.75);">Premium Carpets · Pan India · Worldwide</p>
      </div>
      <div style="padding:36px 32px 28px;">
        <h1 style="margin:0 0 20px;font-size:26px;font-weight:normal;color:#4A1414;font-family:Georgia,serif;">Thank You for Contacting Us</h1>
        <p style="margin:0 0 16px;font-size: 17px;line-height:1.75;color:#3A2A20;">Dear ${escapeHtml(greeting)},</p>
        <p style="margin:0 0 16px;font-size: 17px;line-height:1.75;color:#3A2A20;">
          We have received your enquiry and appreciate your interest in Tapis Global International. Our project team is reviewing your requirements and will contact you within <strong style="color:#896828;">12 working hours</strong>.
        </p>
        <div style="margin:28px 0;padding:20px 22px;background:#faf6ef;border-left:3px solid #C09B4A;">
          <p style="margin:0 0 10px;font-size: 15px;letter-spacing:0.12em;text-transform:uppercase;color:#896828;font-weight:600;">What happens next</p>
          <p style="margin:0;font-size: 16px;line-height:1.7;color:#3A2A20;">
            A dedicated project consultant will reach out to discuss your specifications, design preferences, timeline and the best flooring solution for your project.
          </p>
        </div>
        <p style="margin:0 0 8px;font-size: 16px;line-height:1.7;color:#6B5545;">
          For urgent enquiries, call us at <a href="tel:+918448291631" style="color:#896828;text-decoration:none;">+91 84482 91631</a> or reply to
          <a href="mailto:${REPLY_TO}" style="color:#896828;text-decoration:none;"> ${REPLY_TO}</a>.
        </p>
      </div>
      <div style="padding:20px 32px;background:#1A1310;text-align:center;">
        <p style="margin:0 0 6px;font-size: 14px;color:rgba(237,217,154,0.85);">Tapis Global International Pvt Ltd</p>
        <p style="margin:0;font-size: 13px;color:rgba(255,255,255,0.35);">Bhadohi, India · Crafting premium carpets since 1995</p>
      </div>
    </div>
  </div>
</body>
</html>`
}

export function buildAcknowledgementEmailText(contactName: string) {
  const greeting = contactName.trim() || 'there'

  return `Dear ${greeting},

Thank you for contacting Tapis Global International.

We have received your enquiry and our project team will contact you within 12 working hours.

For urgent enquiries:
Phone: +91 84482 91631
Email: ${REPLY_TO}

—
Tapis Global International Pvt Ltd
Premium Carpets. Pan India. Worldwide.`
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

function getLeadDisplayName(fields: Record<string, string>): string {
  return fields.fullName ?? fields.contactPerson ?? fields.name ?? 'New lead'
}

function getCustomerEmail(fields: Record<string, string>): string | undefined {
  const raw = fields.email?.trim()
  if (!raw) return undefined
  if (!isValidEmail(raw)) return undefined
  return raw.toLowerCase()
}

async function sendCustomerAcknowledgement(
  transporter: nodemailer.Transporter,
  opts: { fromEmail: string; fromName: string; customerEmail: string; contactName: string },
): Promise<EmailDeliveryResult> {
  const subject = 'Thank You for Contacting Tapis Global International'

  logEmail('ack_send_start', {
    to: opts.customerEmail,
    from: opts.fromEmail,
    contactName: opts.contactName,
  })

  const info = await transporter.sendMail({
    from: `"Tapis Global International" <${opts.fromEmail}>`,
    to: opts.customerEmail,
    replyTo: REPLY_TO,
    subject,
    text: buildAcknowledgementEmailText(opts.contactName),
    html: buildAcknowledgementEmailHtml(opts.contactName),
  })

  const result: EmailDeliveryResult = {
    kind: 'acknowledgement',
    to: opts.customerEmail,
    status: 'sent',
    messageId: info.messageId,
    response: info.response,
  }

  logEmail('ack_send_success', {
    to: opts.customerEmail,
    messageId: info.messageId,
    response: info.response,
    accepted: info.accepted,
    rejected: info.rejected,
  })

  return result
}

export async function sendEnquiryEmail(opts: {
  formType: EnquiryFormType
  fields: Record<string, string>
  attachment?: { filename: string; content: Buffer; contentType?: string }
}): Promise<EnquiryEmailResult> {
  const transporter = getTransporter()
  if (!transporter) {
    throw new Error(
      'Email is not configured on the server. Add SMTP settings to .env (see .env.example).',
    )
  }

  const notifyTo = getNotifyEmails()
  const fromEmail = process.env.SMTP_FROM ?? process.env.SMTP_USER!
  const fromName = process.env.SMTP_FROM_NAME ?? 'Tapis Global Website'
  const replyTo = getCustomerEmail(opts.fields) ?? fromEmail
  const customerEmail = getCustomerEmail(opts.fields)

  logEmail('send_start', {
    formType: opts.formType,
    notifyTo,
    customerEmail: customerEmail ?? null,
    rawEmailField: opts.fields.email ?? null,
    hasAttachment: Boolean(opts.attachment),
  })

  const subject = `[${FORM_LABELS[opts.formType]}] ${getLeadDisplayName(opts.fields)} — Tapis Global`

  logEmail('internal_send_start', { to: notifyTo, subject })

  const internalInfo = await transporter.sendMail({
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

  const internalResult: EmailDeliveryResult = {
    kind: 'internal',
    to: notifyTo.join(', '),
    status: 'sent',
    messageId: internalInfo.messageId,
    response: internalInfo.response,
  }

  logEmail('internal_send_success', {
    to: notifyTo,
    messageId: internalInfo.messageId,
    response: internalInfo.response,
    accepted: internalInfo.accepted,
    rejected: internalInfo.rejected,
  })

  let acknowledgementResult: EmailDeliveryResult

  if (!customerEmail) {
    acknowledgementResult = {
      kind: 'acknowledgement',
      to: opts.fields.email?.trim() || '(none)',
      status: 'skipped',
      reason: opts.fields.email?.trim()
        ? 'Invalid email address format — acknowledgement not sent.'
        : 'No email address provided — acknowledgement not sent.',
    }
    logEmail('ack_skipped', acknowledgementResult)
  } else {
    try {
      acknowledgementResult = await sendCustomerAcknowledgement(transporter, {
        fromEmail,
        fromName,
        customerEmail,
        contactName: getLeadDisplayName(opts.fields),
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown acknowledgement error'
      acknowledgementResult = {
        kind: 'acknowledgement',
        to: customerEmail,
        status: 'failed',
        reason: message,
      }
      logEmail('ack_send_failed', {
        to: customerEmail,
        error: message,
        code: err instanceof Error && 'code' in err ? (err as NodeJS.ErrnoException).code : undefined,
      })
    }
  }

  logEmail('send_complete', {
    internal: internalResult.status,
    acknowledgement: acknowledgementResult.status,
    acknowledgementTo: acknowledgementResult.to,
  })

  return {
    internal: internalResult,
    acknowledgement: acknowledgementResult,
  }
}
