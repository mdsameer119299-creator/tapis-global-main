import { NextResponse } from 'next/server'
import { requireCustomerSession } from '@/lib/crafttrack/require-customer-session'
import { clearCustomerSessionCookie } from '@/lib/crafttrack/cookies'

export const runtime = 'nodejs'

export async function POST() {
  const auth = await requireCustomerSession()
  if (!auth.ok) return auth.response

  const response = NextResponse.json({ ok: true })
  clearCustomerSessionCookie(response)
  return response
}
