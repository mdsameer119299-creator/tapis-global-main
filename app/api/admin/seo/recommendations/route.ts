import { NextResponse } from 'next/server'
import { seoApi } from '@/lib/seo-command/auth'
import { listRecommendations } from '@/lib/seo-command/queries'

export const dynamic = 'force-dynamic'

export const GET = seoApi({ mutating: false }, async ({ siteId }, req: Request) => {
  const status = new URL(req.url).searchParams.get('status') ?? undefined
  return NextResponse.json({ ok: true, recommendations: await listRecommendations(siteId, status) })
})
