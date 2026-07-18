import { NextResponse } from 'next/server'
import { del } from '@vercel/blob'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/crafttrack/require-admin-session'
import { updateMediaSchema } from '@/lib/crafttrack/validation/media'

export const runtime = 'nodejs'

export async function PATCH(request: Request, { params }: { params: { mediaId: string } }) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const parsed = updateMediaSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid request.' }, { status: 400 })
  }

  // Setting a media row as hero un-sets any other hero on the same
  // stage/journey — only one hero image at a time.
  if (parsed.data.isHero) {
    const current = await prisma.journeyMedia.findUnique({ where: { id: params.mediaId } })
    if (current) {
      await prisma.journeyMedia.updateMany({
        where: current.stageId ? { stageId: current.stageId } : { journeyId: current.journeyId },
        data: { isHero: false },
      })
    }
  }

  const media = await prisma.journeyMedia.update({
    where: { id: params.mediaId },
    data: {
      ...(parsed.data.caption !== undefined ? { caption: parsed.data.caption } : {}),
      ...(parsed.data.isHero !== undefined ? { isHero: parsed.data.isHero } : {}),
    },
  })

  return NextResponse.json({ ok: true, media })
}

export async function DELETE(_request: Request, { params }: { params: { mediaId: string } }) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const media = await prisma.journeyMedia.findUnique({ where: { id: params.mediaId } })
  if (!media) {
    return NextResponse.json({ ok: false, error: 'Image not found.' }, { status: 404 })
  }

  await prisma.journeyMedia.delete({ where: { id: params.mediaId } })
  await del(media.url).catch((err) => console.error('[crafttrack] failed to delete blob', err))

  return NextResponse.json({ ok: true })
}
