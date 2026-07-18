import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession, actorEmail } from '@/lib/crafttrack/require-admin-session'
import { addJourneySchema } from '@/lib/crafttrack/validation/journey'
import { createJourneyWithStages } from '@/lib/crafttrack/journey-creation'

export const runtime = 'nodejs'

export async function POST(request: Request, { params }: { params: { orderId: string } }) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const parsed = addJourneySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid request.' }, { status: 400 })
  }

  const order = await prisma.order.findUnique({ where: { id: params.orderId }, select: { id: true } })
  if (!order) {
    return NextResponse.json({ ok: false, error: 'Order not found.' }, { status: 404 })
  }

  const input = parsed.data
  const actor = actorEmail(auth.session)

  try {
    const { journey } = await prisma.$transaction((tx) =>
      createJourneyWithStages(tx, {
        orderId: order.id,
        journeyTemplateId: input.journeyTemplateId,
        productName: input.productName,
        productSlug: input.productSlug,
        actor,
      }),
    )

    return NextResponse.json({ ok: true, journey }, { status: 201 })
  } catch (err) {
    console.error('[crafttrack] journey creation failed', err)
    return NextResponse.json({ ok: false, error: 'Could not create the journey. Please try again.' }, { status: 500 })
  }
}
