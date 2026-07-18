import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/crafttrack/require-admin-session'
import { updateJourneySchema } from '@/lib/crafttrack/validation/journey'

export const runtime = 'nodejs'

export async function GET(_request: Request, { params }: { params: { journeyId: string } }) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const journey = await prisma.journey.findUnique({
    where: { id: params.journeyId },
    include: {
      order: { include: { customer: true } },
      journeyTemplate: { select: { name: true } },
      currentStage: { select: { id: true } },
      media: { where: { stageId: null }, orderBy: { sortOrder: 'asc' } },
      stages: {
        orderBy: { sequence: 'asc' },
        include: { media: { orderBy: { sortOrder: 'asc' } } },
      },
      messages: { orderBy: { createdAt: 'desc' } },
      notifications: { orderBy: { sentAt: 'desc' } },
    },
  })

  if (!journey) {
    return NextResponse.json({ ok: false, error: 'Journey not found.' }, { status: 404 })
  }

  return NextResponse.json({ ok: true, journey })
}

export async function PATCH(request: Request, { params }: { params: { journeyId: string } }) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const parsed = updateJourneySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid request.' }, { status: 400 })
  }

  const journey = await prisma.journey.update({
    where: { id: params.journeyId },
    data: { productName: parsed.data.productName, productSlug: parsed.data.productSlug ?? null },
  })

  return NextResponse.json({ ok: true, journey })
}
