import { NextResponse } from 'next/server'
import { bearerMatches } from '@/lib/seo-command/auth'
import { isSeoDbConfigured } from '@/lib/seo-command/db'
import { runAndStoreCrawl } from '@/lib/seo-command/store'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/** Scheduled crawl entry point. Not scheduled in vercel.json until approved; callable only with CRON_SECRET. */
export async function GET(req: Request) {
  if (!bearerMatches(req.headers.get('authorization'), process.env.CRON_SECRET)) return NextResponse.json({ ok: false }, { status: 401 })
  if (!isSeoDbConfigured()) return NextResponse.json({ ok: false, error: 'SEO database not configured' }, { status: 503 })
  try {
    const summary = await runAndStoreCrawl({ triggeredBy: 'system:cron', maxPages: 120, crawlOverrides: { concurrency: 6, timeoutMs: 10000 } })
    return NextResponse.json({ ok: summary.status !== 'FAILED', summary })
  } catch (e) {
    const busy = e instanceof Error && e.name === 'CrawlBusyError'
    return NextResponse.json({ ok: false, error: busy ? 'busy' : 'failed' }, { status: busy ? 409 : 500 })
  }
}
