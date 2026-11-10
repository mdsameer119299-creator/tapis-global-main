import { NextResponse } from 'next/server'
import { seoApi } from '@/lib/seo-command/auth'
import { runAndStoreCrawl } from '@/lib/seo-command/store'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/** Starts a technical crawl of the configured site. Read-only against the website (GET requests only). */
export const POST = seoApi({ mutating: true }, async ({ actor }) => {
  const summary = await runAndStoreCrawl({ triggeredBy: actor, maxPages: 120, crawlOverrides: { concurrency: 6, timeoutMs: 10000 } })
  return NextResponse.json({ ok: summary.status !== 'FAILED', summary }, { status: summary.status === 'FAILED' ? 502 : 200 })
})
