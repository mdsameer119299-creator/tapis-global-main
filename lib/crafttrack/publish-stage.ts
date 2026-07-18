import type { Prisma } from '@prisma/client'

type TxClient = Prisma.TransactionClient

type PublishStageInput = {
  stageId: string
  actor: string
}

/** The publish transaction itself, extracted from the route handler so it
 * can be unit-tested against an injected fake tx (see
 * scripts/crafttrack-publish-stage.test.mjs) the same way
 * lib/crafttrack/journey-creation.ts's createJourneyWithStages already is.
 * Must be called inside an existing prisma.$transaction — sending the
 * notification email is the caller's job, done strictly after this
 * transaction commits (see stages/[stageId]/publish/route.ts). */
export async function publishStage(tx: TxClient, input: PublishStageInput) {
  const stage = await tx.journeyStage.findUniqueOrThrow({
    where: { id: input.stageId },
    include: { journey: { include: { stages: { orderBy: { sequence: 'asc' } } } } },
  })

  const isFirstPublish = stage.publishedAt === null
  const fromStatus = stage.publishedStatus

  const updated = await tx.journeyStage.update({
    where: { id: input.stageId },
    data: {
      publishedName: stage.draftName,
      publishedMessage: stage.draftMessage,
      publishedStatus: stage.draftStatus,
      publishedAt: new Date(),
      publishedBy: input.actor,
    },
  })

  // Publish this stage's own media only — the journey-level cover has its
  // own always-live lifecycle (see journeys/[journeyId]/cover/route.ts).
  await tx.journeyMedia.updateMany({
    where: { stageId: input.stageId },
    data: { isPublished: true },
  })

  await tx.stageEvent.create({
    data: {
      stageId: input.stageId,
      type: 'STAGE_PUBLISHED',
      summary: `${updated.publishedName} published`,
      fromStatus: fromStatus ?? undefined,
      toStatus: updated.publishedStatus ?? undefined,
      actor: input.actor,
    },
  })

  // "Last stage" is determined by actual sequence position within this
  // journey's real stages, never a hardcoded count — a future
  // non-standard template must not silently break Journey.completedAt.
  const journeyStages = stage.journey.stages
  const isLastStage = journeyStages[journeyStages.length - 1]?.id === input.stageId

  if (isLastStage && updated.publishedStatus === 'COMPLETE') {
    await tx.journey.update({
      where: { id: stage.journeyId },
      data: { completedAt: new Date() },
    })
    await tx.stageEvent.create({
      data: { stageId: input.stageId, type: 'STAGE_COMPLETED', summary: 'Journey completed', actor: input.actor },
    })
  }

  return { stage: updated, isFirstPublish, journeyId: stage.journeyId }
}
