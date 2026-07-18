import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/crafttrack/require-admin-session'
import { signCustomerPasswordSetupToken } from '@/lib/crafttrack/session'
import { sendPasswordSetupEmail } from '@/lib/crafttrack/notification-email'
import { SEO_BASE_URL } from '@/lib/seo'

export const runtime = 'nodejs'

// Admin-triggered only — there is no automatic email here. Doubles as both
// "first-time login setup" and "forgot password reset": same token, same
// email, the copy just adapts based on whether a password is already set.
export async function POST(_request: Request, { params }: { params: { customerId: string } }) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const customer = await prisma.customer.findUnique({ where: { id: params.customerId } })
  if (!customer) {
    return NextResponse.json({ ok: false, error: 'Customer not found.' }, { status: 404 })
  }

  const token = await signCustomerPasswordSetupToken(customer.id)
  const link = `${SEO_BASE_URL}/crafttrack/set-password?token=${encodeURIComponent(token)}`

  try {
    await sendPasswordSetupEmail({
      customerName: customer.name,
      customerEmail: customer.email,
      link,
      hasPassword: !!customer.passwordHash,
    })
  } catch (err) {
    console.error('[crafttrack] send-login-link failed', err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Could not send the email.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}
