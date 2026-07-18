import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/crafttrack/require-admin-session'
import { sendAndRecordStageNotification } from '@/lib/crafttrack/send-stage-notification'

export const runtime = 'nodejs'

// Bodyless POST — the notificationId route param is the only input. Every
// retry creates its own new Notification row (append, never mutate) so the
// Notifications tab keeps a complete history of every attempt.
export async function POST(_request: Request, { params }: { params: { notificationId: string } }) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const original = await prisma.notification.findUnique({ where: { id: params.notificationId } })

  if (!original) {
    return NextResponse.json({ ok: false, error: 'Notification not found.' }, { status: 404 })
  }
  if (original.status !== 'FAILED') {
    return NextResponse.json({ ok: false, error: 'Only a failed notification can be retried.' }, { status: 400 })
  }
  if (!original.stageId || !original.stageName) {
    return NextResponse.json({ ok: false, error: 'This notification predates retry support and cannot be resent.' }, { status: 400 })
  }

  const journey = await prisma.journey.findUnique({
    where: { id: original.journeyId },
    include: { order: { include: { customer: true } } },
  })

  if (!journey) {
    return NextResponse.json({ ok: false, error: 'Journey not found.' }, { status: 404 })
  }

  const result = await sendAndRecordStageNotification({
    journeyId: original.journeyId,
    stageId: original.stageId,
    stageName: original.stageName,
    orderNumber: journey.order.orderNumber,
    customerEmail: journey.order.customer.email,
    customerName: journey.order.customer.name,
  })

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: 'The retry also failed — see the new entry in Notifications for details.' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
