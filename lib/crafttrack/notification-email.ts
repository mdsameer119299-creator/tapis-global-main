import nodemailer from 'nodemailer'
import { SEO_BASE_URL } from '@/lib/seo'

// A small, standalone transporter — deliberately not sharing
// lib/enquiry-email.ts's private getTransporter() to avoid touching a
// working, already-shipped email flow for this. Same SMTP env vars, same
// pattern, ~15 lines of intentional duplication.
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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

type StagePublishedEmailInput = {
  journey: {
    orderNumber: string
    customerEmail: string
    customerName: string
  }
  stageName: string
}

/** The one notification email v1 sends: a customer's order has moved to a
 * new stage, first publish only (see stages/[stageId]/publish/route.ts —
 * this function is called after the DB transaction commits, never inside
 * it, so a slow/failing SMTP server can never block or roll back a
 * publish). Throws on failure — the caller catches, logs, and swallows. */
export async function sendStagePublishedEmail(input: StagePublishedEmailInput): Promise<void> {
  const transporter = getTransporter()
  if (!transporter) {
    throw new Error('Email is not configured on the server. Add SMTP settings to .env (see docs/CRAFTTRACK-SETUP.md).')
  }

  const fromEmail = process.env.SMTP_FROM ?? process.env.SMTP_USER!
  const fromName = process.env.SMTP_FROM_NAME ?? 'Tapis Global Website'
  const dashboardUrl = `${SEO_BASE_URL}/crafttrack/dashboard/${encodeURIComponent(input.journey.orderNumber)}`

  const subject = `Your CraftTrack™ order has moved to a new stage`

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:Georgia,'Times New Roman',serif;background:#F8F4EE;">
  <div style="max-width:480px;margin:0 auto;padding:32px 20px;">
    <div style="background:#fff;border:1px solid #E0D3BC;overflow:hidden;">
      <div style="background:#1A1310;padding:24px;text-align:center;">
        <span style="font-family:Georgia,serif;font-size:19px;color:#C09B4A;">CraftTrack&trade;</span>
      </div>
      <div style="padding:28px;text-align:center;">
        <p style="margin:0 0 10px;font-size:13px;color:#6B5545;">Order ${escapeHtml(input.journey.orderNumber)}</p>
        <h1 style="margin:0 0 16px;font-size:22px;font-weight:normal;color:#1A1310;">${escapeHtml(input.stageName)}</h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#3A2A20;">
          Dear ${escapeHtml(input.journey.customerName)}, your order has moved to a new stage. New photos and an update from our team are ready to view.
        </p>
        <a href="${dashboardUrl}" style="display:inline-block;background:#1A1310;color:#EDD99A;padding:12px 28px;text-decoration:none;font-size:14px;">View your CraftTrack&trade;</a>
      </div>
    </div>
  </div>
</body>
</html>`

  const text = `${input.journey.orderNumber} — ${input.stageName}\n\nDear ${input.journey.customerName}, your order has moved to a new stage.\n\nView your CraftTrack: ${dashboardUrl}`

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: input.journey.customerEmail,
    subject,
    text,
    html,
  })
}

type PasswordSetupEmailInput = {
  customerName: string
  customerEmail: string
  link: string
  /** Changes the copy from "set up your login" to "reset your password" —
   * same link, same token, just honest about which situation the
   * recipient is in. */
  hasPassword: boolean
}

/** Sent only when an admin clicks "Send login setup link" / "Send password
 * reset link" on a customer record — never automatic. Same
 * send-after-commit-and-swallow-on-failure discipline as
 * sendStagePublishedEmail: the caller (the admin API route) reports the
 * failure back to the admin directly, since this one has no DB write to
 * protect from a slow SMTP server in the first place. */
export async function sendPasswordSetupEmail(input: PasswordSetupEmailInput): Promise<void> {
  const transporter = getTransporter()
  if (!transporter) {
    throw new Error('Email is not configured on the server. Add SMTP settings to .env (see docs/CRAFTTRACK-SETUP.md).')
  }

  const fromEmail = process.env.SMTP_FROM ?? process.env.SMTP_USER!
  const fromName = process.env.SMTP_FROM_NAME ?? 'Tapis Global Website'
  const action = input.hasPassword ? 'Reset your password' : 'Set up your login'
  const subject = input.hasPassword ? 'Reset your CraftTrack™ password' : 'Set up your CraftTrack™ login'
  const bodyCopy = input.hasPassword
    ? 'Use the link below to set a new password for your CraftTrack™ account.'
    : 'Use the link below to set up a password and access your CraftTrack™ account — you’ll be able to follow your order’s progress any time.'

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:Georgia,'Times New Roman',serif;background:#F8F4EE;">
  <div style="max-width:480px;margin:0 auto;padding:32px 20px;">
    <div style="background:#fff;border:1px solid #E0D3BC;overflow:hidden;">
      <div style="background:#1A1310;padding:24px;text-align:center;">
        <span style="font-family:Georgia,serif;font-size:19px;color:#C09B4A;">CraftTrack&trade;</span>
      </div>
      <div style="padding:28px;text-align:center;">
        <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#3A2A20;">
          Dear ${escapeHtml(input.customerName)}, ${escapeHtml(bodyCopy)}
        </p>
        <a href="${input.link}" style="display:inline-block;background:#1A1310;color:#EDD99A;padding:12px 28px;text-decoration:none;font-size:14px;">${escapeHtml(action)}</a>
        <p style="margin:24px 0 0;font-size:12px;color:#8A7362;">This link expires in 24 hours. If you didn't request this, you can ignore this email.</p>
      </div>
    </div>
  </div>
</body>
</html>`

  const text = `${action}\n\nDear ${input.customerName}, ${bodyCopy}\n\n${input.link}\n\nThis link expires in 24 hours. If you didn't request this, you can ignore this email.`

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: input.customerEmail,
    subject,
    text,
    html,
  })
}
