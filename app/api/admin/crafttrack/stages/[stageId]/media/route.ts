import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'
import { requireAdminSession, actorEmail } from '@/lib/crafttrack/require-admin-session'

export const runtime = 'nodejs'

const MAX_FILE_BYTES = 8 * 1024 * 1024

// KNOWN LIMITATION (reviewed in PR2.1, tracked as a follow-up rather than
// fixed here): put() below uses access:'public'. isPublished correctly
// gates what the database returns to a customer-facing query, but the
// underlying Blob URL is fetchable by anyone who has it the instant it's
// uploaded — a draft (unpublished) image is not actually access-controlled,
// only hidden from the UI. @vercel/blob does support access:'private', but
// switching requires a new authenticated streaming-proxy route and rewiring
// every <img> that reads a Blob URL, including PublishedJourneyView (shared
// with PR3's future customer portal) — a real feature addition, not a
// hardening change, so it's scoped as its own follow-up alongside PR3.

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
