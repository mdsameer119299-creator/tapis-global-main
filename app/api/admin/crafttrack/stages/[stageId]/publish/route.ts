import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession, actorEmail } from '@/lib/crafttrack/require-admin-session'
import { sendStagePublishedEmail } from '@/lib/crafttrack/notification-email'

export const runtime = 'nodejs'

// Bodyless POST — the stageId route param is the only input.
export async function POST(_request: Request, { params }: { params: { stageId: string } }) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const actor = actorEmail(auth.session)

  let result
  try {
    result = await prisma.$transaction(async (tx) => {
      const stage = await tx.journeyStage.findUniqueOrThrow({
        where: { id: params.stageId },
        include: { journey: { include: { stages: { orderBy: { sequence: 'asc' } } } } },
      })

      const isFirstPublish = stage.publishedAt === null
      const fromStatus = stage.publishedStatus

      const updated = await tx.journeyStage.update({
        where: { id: params.stageId },
        data: {
          publishedName: stage.draftName,
          publishedMessage: stage.draftMessage,
          publishedStatus: stage.draftStatus,
          publishedAt: new Date(),
          publishedBy: actor,
        },
      })

      // Publish this stage's own media only — the journey-level cover has
      // its own always-live lifecycle (see journeys/[journeyId]/cover/route.ts).
      await tx.journeyMedia.updateMany({
        where: { stageId: params.stageId },
        data: { isPublished: true },
      })

      await tx.stageEvent.create({
        data: {
          stageId: params.stageId,
          type: 'STAGE_PUBLISHED',
          summary: `${updated.publishedName} published`,
          fromStatus: fromStatus ?? undefined,
          toStatus: updated.publishedStatus ?? undefined,
          actor,
        },
      })

      // "Last stage" is determined by actual sequence position within this
      // journey's real stages, never a hardcoded count — a future
      // non-standard template must not silently break Journey.completedAt.
      const journeyStages = stage.journey.stages
      const isLastStage = journeyStages[journeyStages.length - 1]?.id === params.stageId

      if (isLastStage && updated.publishedStatus === 'COMPLETE') {
        await tx.journey.update({
          where: { id: stage.journeyId },
          data: { completedAt: new Date() },
        })
        await tx.stageEvent.create({
          data: { stageId: params.stageId, type: 'STAGE_COMPLETED', summary: 'Journey completed', actor },
        })
      }

      return { stage: updated, isFirstPublish, journeyId: stage.journeyId }
    })
  } catch (err) {
    console.error('[crafttrack] stage publish failed', err)
    return NextResponse.json({ ok: false, error: 'Could not publish this stage. Please try again.' }, { status: 500 })
  }

  // Notification email is sent OUTSIDE the transaction, deliberately: an
  // SMTP round-trip inside a DB transaction risks a slow/hanging mail
  // server blocking or timing out the transaction. The stage is already
  // published at this point — a failed notification is logged and
  // swallowed, never rolled back or reported as a publish failure.
  if (result.isFirstPublish) {
    try {
      const journey = await prisma.journey.findUniqueOrThrow({
        where: { id: result.journeyId },
        include: { order: { include: { customer: true } } },
      })

      await sendStagePublishedEmail({
        journey: {
          orderNumber: journey.order.orderNumber,
          customerEmail: journey.order.customer.email,
          customerName: journey.order.customer.name,
        },
        stageName: result.stage.publishedName!,
      })

      await prisma.notification.create({
        data: {
          journeyId: result.journeyId,
          type: 'STAGE_PUBLISHED',
          channel: 'EMAIL',
          recipientEmail: journey.order.customer.email,
        },
      })
    } catch (err) {
      console.error('[crafttrack] stage-published notification failed', err)
    }
  }

  return NextResponse.json({ ok: true, stage: result.stage })
}
