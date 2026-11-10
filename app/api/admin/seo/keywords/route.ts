import { NextResponse } from 'next/server'
import { seoApi, readJson, str } from '@/lib/seo-command/auth'
import { addKeywords, removeKeyword } from '@/lib/seo-command/tracking'
import { listKeywords } from '@/lib/seo-command/queries'

export const dynamic = 'force-dynamic'

export const GET = seoApi({ mutating: false }, async ({ siteId }) => NextResponse.json({ ok: true, keywords: await listKeywords(siteId) }))

/** Body: { keywords: string[] | string (newline/comma separated), country?, targetUrl? } */
export const POST = seoApi({ mutating: true }, async ({ siteId, actor }, req: Request) => {
  const b = await readJson(req)
  const raw = Array.isArray(b.keywords) ? b.keywords.map((k) => str(k, 120)) : str(b.keywords, 5000).split(/[\n,]+/)
  const r = await addKeywords(siteId, actor, raw, { country: str(b.country, 3) || 'ALL', targetUrl: str(b.targetUrl) || null })
  return NextResponse.json({ ok: true, ...r })
})

export const DELETE = seoApi({ mutating: true }, async ({ siteId, actor }, req: Request) => {
  const id = str((await readJson(req)).id, 100)
  if (!id) return NextResponse.json({ ok: false, error: 'id required' }, { status: 400 })
  return NextResponse.json({ ok: true, ...(await removeKeyword(siteId, id, actor)) })
})
