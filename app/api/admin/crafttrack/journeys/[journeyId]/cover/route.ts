import { NextResponse } from 'next/server'
import { put, del } from '@vercel/blob'
import { prisma } from '@/lib/prisma'
import { requireAdminSession, actorEmail } from '@/lib/crafttrack/require-admin-session'

export const runtime = 'nodejs'

const MAX_FILE_BYTES = 8 * 1024 * 1024

/** Uploads/replaces the single journey-level cover photo. Unlike stage
 * media, the cover has no Draft/Published cycle of its own — it publishes
 * immediately on upload (see docs/CRAFTTRACK-PRODUCT-DESIGN.md §14's
 * judgment call: §7's Draft/Published model is written entirely in terms
 * of stages, and "Edit Journey Cover" has no described publish step). A
 * journey has at most one COVER row in practice — enforced here at the
 * application layer by deleting any prior one on new upload. */
export async function POST(request: Request, { params }: { params: { journeyId: string } }) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const journey = await prisma.journey.findUnique({ where: { id: params.journeyId }, select: { id: true } })
  if (!journey) {
    return NextResponse.json({ ok: false, error: 'Journey not found.' }, { status: 404 })
  }

  const formData = await request.formData().catch(() => null)
  const file = formData?.get('file')
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'No image was uploaded.' }, { status: 400 })
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ ok: false, error: 'Only image files are supported.' }, { status: 400 })
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ ok: false, error: 'Image is too large (8MB max).' }, { status: 400 })
  }

  const existingCover = await prisma.journeyMedia.findFirst({
    where: { journeyId: params.journeyId, role: 'COVER' },
  })

  const blob = await put(`crafttrack/journeys/${params.journeyId}/cover-${Date.now()}-${file.name}`, file, {
    access: 'public',
  })

  const media = await prisma.journeyMedia.create({
    data: {
      journeyId: params.journeyId,
      mediaType: 'IMAGE',
      url: blob.url,
      role: 'COVER',
      isHero: true,
      isPublished: true,
      uploadedBy: actorEmail(auth.session),
    },
  })

  if (existingCover) {
    await prisma.journeyMedia.delete({ where: { id: existingCover.id } })
    await del(existingCover.url).catch((err) => console.error('[crafttrack] failed to delete old cover blob', err))
  }

  return NextResponse.json({ ok: true, media }, { status: 201 })
}
