import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'
import { requireAdminSession, actorEmail } from '@/lib/crafttrack/require-admin-session'

export const runtime = 'nodejs'

const MAX_FILE_BYTES = 8 * 1024 * 1024

export async function GET(_request: Request, { params }: { params: { stageId: string } }) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const media = await prisma.journeyMedia.findMany({
    where: { stageId: params.stageId },
    orderBy: { sortOrder: 'asc' },
  })

  return NextResponse.json({ ok: true, media })
}

export async function POST(request: Request, { params }: { params: { stageId: string } }) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const stage = await prisma.journeyStage.findUnique({ where: { id: params.stageId }, select: { id: true } })
  if (!stage) {
    return NextResponse.json({ ok: false, error: 'Stage not found.' }, { status: 404 })
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

  const existingCount = await prisma.journeyMedia.count({ where: { stageId: params.stageId } })

  const blob = await put(`crafttrack/stages/${params.stageId}/${Date.now()}-${file.name}`, file, {
    access: 'public',
  })

  const media = await prisma.journeyMedia.create({
    data: {
      stageId: params.stageId,
      mediaType: 'IMAGE',
      url: blob.url,
      role: existingCount === 0 ? 'HERO' : 'GALLERY',
      isHero: existingCount === 0,
      sortOrder: existingCount,
      uploadedBy: actorEmail(auth.session),
    },
  })

  return NextResponse.json({ ok: true, media }, { status: 201 })
}
