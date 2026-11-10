import { NextResponse } from 'next/server'
import { seoApi, readJson, str } from '@/lib/seo-command/auth'
import { measurePageSpeed } from '@/lib/seo-command/psi'
import { latestPageSpeed } from '@/lib/seo-command/queries'
import { configuredBaseUrl } from '@/lib/seo-command/store'
import { sameSite } from '@/lib/seo-command/html-audit'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export const GET = seoApi({ mutating: false }, async ({ siteId }) => NextResponse.json({ ok: true, results: await latestPageSpeed(siteId) }))

/** Body: { url, strategy }. Only URLs on the configured site may be measured. */
export const POST = seoApi({ mutating: true }, async ({ siteId, actor }, req: Request) => {
  const b = await readJson(req)
  const url = str(b.url, 500)
  const strategy = b.strategy === 'desktop' ? 'desktop' : 'mobile'
  if (!/^https:\/\//.test(url) || !sameSite(url, configuredBaseUrl())) return NextResponse.json({ ok: false, error: 'URL must be an https page on the configured site' }, { status: 400 })
  const r = await measurePageSpeed({ siteId, url, strategy, actor })
  return NextResponse.json({ ok: !r.error, ...r })
})
