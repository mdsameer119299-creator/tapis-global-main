import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/crafttrack/require-admin-session'
import { createMessageSchema } from '@/lib/crafttrack/validation/message'

export const runtime = 'nodejs'

export async function GET(_request: Request, { params }: { params: { journeyId: string } }) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const messages = await prisma.journeyMessage.findMany({
    where: { journeyId: params.journeyId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ ok: true, messages })
}

// authorType is always ADMIN here — SYSTEM messages (if any are ever
// generated) and CUSTOMER messages (reserved, two-way messaging is a
// listed future item) would each need their own writer, not this route.
export async function POST(request: Request, { params }: { params: { journeyId: string } }) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const parsed = createMessageSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid request.' }, { status: 400 })
  }

  const message = await prisma.journeyMessage.create({
    data: { journeyId: params.journeyId, body: parsed.data.body, authorType: 'ADMIN' },
  })

  return NextResponse.json({ ok: true, message }, { status: 201 })
}
