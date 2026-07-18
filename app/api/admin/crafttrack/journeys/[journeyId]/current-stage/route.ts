import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/crafttrack/require-admin-session'
import { currentStageSchema } from '@/lib/crafttrack/validation/journey'

export const runtime = 'nodejs'

export async function PATCH(request: Request, { params }: { params: { journeyId: string } }) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const parsed = currentStageSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid request.' }, { status: 400 })
  }

  const stage = await prisma.journeyStage.findUnique({
    where: { id: parsed.data.stageId },
    select: { id: true, journeyId: true, publishedAt: true },
  })

  if (!stage || stage.journeyId !== params.journeyId) {
    return NextResponse.json({ ok: false, error: 'Stage not found on this journey.' }, { status: 404 })
  }

  // The current-stage pointer may only reference a stage that has a
  // Published version (docs/CRAFTTRACK-PRODUCT-DESIGN.md §7) — a
  // freshly-created stage's publishedAt is null until first publish.
  if (!stage.publishedAt) {
    return NextResponse.json({ ok: false, error: 'Publish this stage before setting it as current.' }, { status: 409 })
  }

  const journey = await prisma.journey.update({
    where: { id: params.journeyId },
    data: { currentStageId: stage.id },
  })

  return NextResponse.json({ ok: true, journey })
}
