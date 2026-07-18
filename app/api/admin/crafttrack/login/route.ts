import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/crafttrack/password'
import { signAdminSession } from '@/lib/crafttrack/session'
import { setAdminSessionCookie } from '@/lib/crafttrack/cookies'
import { loginSchema } from '@/lib/crafttrack/validation/auth'
import {
  checkLoginRateLimit,
  recordFailedLoginAttempt,
  resetLoginRateLimit,
  getClientIp,
} from '@/lib/crafttrack/login-rate-limit'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Enter a valid email and password.' }, { status: 400 })
  }

  const { email, password } = parsed.data

  // Two independent rate-limit keys: by IP (stops one machine hammering
  // any account) and by email (stops a distributed attempt against one
  // specific admin from many IPs). Either being limited blocks the
  // attempt, with a generic message — never revealing which.
  const ipKey = `ip:${getClientIp(request)}`
  const emailKey = `email:${email.toLowerCase()}`

  if (!checkLoginRateLimit(ipKey).allowed || !checkLoginRateLimit(emailKey).allowed) {
    return NextResponse.json({ ok: false, error: 'Too many attempts. Please try again later.' }, { status: 429 })
  }

  let admin
  try {
    admin = await prisma.adminUser.findUnique({ where: { email } })
  } catch (err) {
    // A database outage must never surface as a raw 500/HTML error page on
    // the one endpoint that gates the entire admin panel — same generic
    // JSON shape as every other failure here.
    console.error('[crafttrack] login lookup failed', err)
    return NextResponse.json({ ok: false, error: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  const valid = admin ? await verifyPassword(password, admin.passwordHash) : false

  if (!admin || !valid) {
    recordFailedLoginAttempt(ipKey)
    recordFailedLoginAttempt(emailKey)
    // Deliberately identical whether the email doesn't exist or the
    // password is wrong — never reveal which.
    return NextResponse.json({ ok: false, error: 'Incorrect email or password.' }, { status: 401 })
  }

  resetLoginRateLimit(ipKey)
  resetLoginRateLimit(emailKey)

  const token = await signAdminSession({ type: 'admin', adminId: admin.id, email: admin.email })

  const response = NextResponse.json({ ok: true })
  setAdminSessionCookie(response, token)
  return response
}
