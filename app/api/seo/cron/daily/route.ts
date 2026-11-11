import { NextResponse } from 'next/server'
import { bearerMatches } from '@/lib/seo-command/auth'
import { isSeoDbConfigured } from '@/lib/seo-command/db'
import { runDailyPipeline } from '@/lib/seo-command/daily-pipeline'
import { isDeliveryProblem } from '@/lib/seo-command/report-delivery'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/** Scheduled daily report entry point (08:00 Asia/Kolkata, triggered by the GitHub Actions workflow). Needs `Authorization: Bearer $CRON_SECRET`.
 *  Idempotent: a second call on the same IST day creates no second report and does not re-send an email already SENT. Returns step statuses only, never data or secrets. */
export async function GET(req: Request) {
  if (!bearerMatches(req.headers.get('authorization'), process.env.CRON_SECRET)) return NextResponse.json({ ok: false }, { status: 401 })
  if (!isSeoDbConfigured()) return NextResponse.json({ ok: false, error: 'SEO database not configured' }, { status: 503 })
  try {
    const r = await runDailyPipeline({ trigger: 'SCHEDULE', triggeredBy: 'system:cron-daily' })
    const failed = r.report.outcome === 'FAILED'
    const deliveryProblem = isDeliveryProblem(r.delivery.status)
    return NextResponse.json({ ok: !failed && !deliveryProblem && r.report.outcome !== 'BUSY', result: r }, { status: failed ? 500 : r.report.outcome === 'BUSY' ? 409 : deliveryProblem ? 502 : 200 })
  } catch { return NextResponse.json({ ok: false, error: 'failed' }, { status: 500 }) }
}
