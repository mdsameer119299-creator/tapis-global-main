import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/crafttrack/require-admin-session'
import { createCustomerSchema } from '@/lib/crafttrack/validation/customer'

export const runtime = 'nodejs'

const SEARCH_MAX_LENGTH = 200

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const q = (request.nextUrl.searchParams.get('q') ?? '').trim().slice(0, SEARCH_MAX_LENGTH)

  const customers = await prisma.customer.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        }
      : undefined,
    orderBy: { name: 'asc' },
    take: 20,
    select: { id: true, name: true, email: true, createdAt: true },
  })

  return NextResponse.json({ ok: true, customers })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const parsed = createCustomerSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid request.' }, { status: 400 })
  }

  const existing = await prisma.customer.findUnique({ where: { email: parsed.data.email } })
  if (existing) {
    return NextResponse.json({ ok: false, error: 'A customer with this email already exists.' }, { status: 409 })
  }

  const customer = await prisma.customer.create({ data: parsed.data })
  return NextResponse.json({ ok: true, customer }, { status: 201 })
}
