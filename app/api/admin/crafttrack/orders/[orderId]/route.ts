import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/crafttrack/require-admin-session'

export const runtime = 'nodejs'

export async function GET(_request: Request, { params }: { params: { orderId: string } }) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: {
      customer: true,
      journeys: {
        orderBy: { createdAt: 'asc' },
        include: {
          journeyTemplate: { select: { name: true } },
          currentStage: { select: { id: true, publishedName: true, draftName: true } },
          stages: { select: { id: true, draftStatus: true, publishedStatus: true }, orderBy: { sequence: 'asc' } },
        },
      },
    },
  })

  if (!order) {
    return NextResponse.json({ ok: false, error: 'Order not found.' }, { status: 404 })
  }

  return NextResponse.json({ ok: true, order })
}
