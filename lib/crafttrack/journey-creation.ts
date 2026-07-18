import type { Prisma } from '@prisma/client'

type TxClient = Prisma.TransactionClient

type CreateJourneyWithStagesInput = {
  orderId: string
  journeyTemplateId: string
  productName: string
  productSlug?: string | null
  actor: string
}

/** Creates a Journey + copies its template's TemplateStage blueprints into
 * real JourneyStage rows (Draft-only — nothing is published here). Stage 1
 * (lowest sequence) starts IN_PROGRESS since "Order Confirmed" is already
 * true the instant the order exists; every other stage starts PENDING.
 *
 * Deliberately does NOT set Journey.currentStageId — a fresh JourneyStage
 * has no Published version yet, and the current-stage pointer may only
 * ever reference a stage that has been published (enforced by the
 * current-stage API route, not here). Callers/UI must render a "no current
 * stage yet — publish a stage to set one" empty state for a brand-new
 * journey rather than assuming one is set.
 *
 * Must be called inside an existing `prisma.$transaction` — this function
 * does not open its own, so it composes into the combined order-creation
 * transaction and the "add another journey" transaction alike. */
export async function createJourneyWithStages(tx: TxClient, input: CreateJourneyWithStagesInput) {
  const template = await tx.journeyTemplate.findUniqueOrThrow({
    where: { id: input.journeyTemplateId },
    include: { stages: { orderBy: { sequence: 'asc' } } },
  })

  if (template.stages.length === 0) {
    throw new Error(`Journey template "${template.name}" has no stages configured`)
  }

  const journey = await tx.journey.create({
    data: {
      orderId: input.orderId,
      journeyTemplateId: template.id,
      productName: input.productName,
      productSlug: input.productSlug ?? null,
    },
  })

  const createdStages = await Promise.all(
    template.stages.map((templateStage, index) =>
      tx.journeyStage.create({
        data: {
          journeyId: journey.id,
          templateStageId: templateStage.id,
          sequence: templateStage.sequence,
          draftName: templateStage.name,
          draftMessage: templateStage.description ?? null,
          draftStatus: index === 0 ? 'IN_PROGRESS' : 'PENDING',
        },
      }),
    ),
  )

  await tx.stageEvent.create({
    data: {
      stageId: createdStages[0].id,
      type: 'STAGE_STARTED',
      summary: `${createdStages[0].draftName} started`,
      actor: input.actor,
    },
  })

  return { journey, stages: createdStages }
}

/** Generic unique-constraint check, used to detect an orderNumber collision
 * so the caller can retry with a freshly generated number (see
 * lib/crafttrack/order-number.ts's own "collision risk handled by the
 * caller retrying" comment). */
export function isUniqueConstraintError(err: unknown, field: string): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: string }).code === 'P2002' &&
    'meta' in err &&
    Boolean((err as { meta?: { target?: string[] } }).meta?.target?.includes(field))
  )
}
