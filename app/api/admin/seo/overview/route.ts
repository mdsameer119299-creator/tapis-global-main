import { NextResponse } from 'next/server'
import { seoApi } from '@/lib/seo-command/auth'
import { getOverview } from '@/lib/seo-command/queries'

export const dynamic = 'force-dynamic'

export const GET = seoApi({ mutating: false }, async ({ siteId }) => NextResponse.json({ ok: true, overview: await getOverview(siteId) }))
