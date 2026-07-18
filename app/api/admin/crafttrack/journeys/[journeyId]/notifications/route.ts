import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/crafttrack/require-admin-session'

export const runtime = 'nodejs'

export async function GET(_request: Request, { params }: { params: { journeyId: string } }) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const notifications = await prisma.notification.findMany({
    where: { journeyId: params.journeyId },
    orderBy: { sentAt: 'desc' },
  })

  return NextResponse.json({ ok: true, notifications })
}
