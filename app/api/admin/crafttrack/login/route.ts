import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/crafttrack/password'
import { signAdminSession } from '@/lib/crafttrack/session'
import { setAdminSessionCookie } from '@/lib/crafttrack/cookies'
import { loginSchema } from '@/lib/crafttrack/validation/auth'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Enter a valid email and password.' }, { status: 400 })
  }

  const { email, password } = parsed.data

  const admin = await prisma.adminUser.findUnique({ where: { email } })
  if (!admin) {
    return NextResponse.json({ ok: false, error: 'Incorrect email or password.' }, { status: 401 })
  }

  const valid = await verifyPassword(password, admin.passwordHash)
  if (!valid) {
    return NextResponse.json({ ok: false, error: 'Incorrect email or password.' }, { status: 401 })
  }

  const token = await signAdminSession({ type: 'admin', adminId: admin.id, email: admin.email })

  const response = NextResponse.json({ ok: true })
  setAdminSessionCookie(response, token)
  return response
}
