import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession, actorEmail } from '@/lib/crafttrack/require-admin-session'
import { publishStage } from '@/lib/crafttrack/publish-stage'
import { sendAndRecordStageNotification } from '@/lib/crafttrack/send-stage-notification'

export const runtime = 'nodejs'

// Bodyless POST — the stageId route param is the only input.
export async function POST(_request: Request, { params }: { params: { stageId: string } }) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const actor = actorEmail(auth.session)

  let result
  try {
    result = await prisma.$transaction((tx) => publishStage(tx, { stageId: params.stageId, actor }))
  } catch (err) {
    console.error('[crafttrack] stage publish failed', err)
    return NextResponse.json({ ok: false, error: 'Could not publish this stage. Please try again.' }, { status: 500 })
  }

  // Notification email is sent OUTSIDE the transaction, deliberately: an
  // SMTP round-trip inside a DB transaction risks a slow/hanging mail
  // server blocking or timing out the transaction. The stage is already
  // published at this point — sendAndRecordStageNotification always
  // records what happened (SENT or FAILED) and never throws, so a failed
  // send can never roll back or be reported as a publish failure, and is
  // no longer silent either (PR2.1) — it's a real row an admin can see
  // and retry from the Notifications tab.
  if (result.isFirstPublish) {
    const journey = await prisma.journey.findUniqueOrThrow({
      where: { id: result.journeyId },
      include: { order: { include: { customer: true } } },
    })

    await sendAndRecordStageNotification({
      journeyId: result.journeyId,
      stageId: params.stageId,
      stageName: result.stage.publishedName!,
      orderNumber: journey.order.orderNumber,
      customerEmail: journey.order.customer.email,
      customerName: journey.order.customer.name,
    })
  }

  return NextResponse.json({ ok: true, stage: result.stage })
}
