import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/crafttrack/require-admin-session'
import { updateStageSchema } from '@/lib/crafttrack/validation/stage'

export const runtime = 'nodejs'

// Draft fields only — draftName/draftMessage/draftStatus. Published fields
// are never written here; only stages/[stageId]/publish/route.ts writes them.
export async function PATCH(request: Request, { params }: { params: { stageId: string } }) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const parsed = updateStageSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid request.' }, { status: 400 })
  }

  const stage = await prisma.journeyStage.update({
    where: { id: params.stageId },
    data: {
      draftName: parsed.data.draftName,
      draftMessage: parsed.data.draftMessage ?? null,
      draftStatus: parsed.data.draftStatus,
    },
  })

  return NextResponse.json({ ok: true, stage })
}
