import { NextResponse } from 'next/server'
import { seoApi } from '@/lib/seo-command/auth'
import { buildReport, getTrend, getChanges } from '@/lib/seo-command/queries'

export const dynamic = 'force-dynamic'

export const GET = seoApi({ mutating: false }, async ({ siteId }, req: Request) => {
  const days = Number(new URL(req.url).searchParams.get('days') ?? 30)
  return NextResponse.json({ ok: true, report: await buildReport(siteId, Number.isFinite(days) ? days : 30), trend: await getTrend(siteId), changes: await getChanges(siteId) })
})
