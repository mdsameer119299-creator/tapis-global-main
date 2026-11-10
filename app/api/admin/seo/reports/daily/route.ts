import { NextResponse } from 'next/server'
import { seoApi, readJson } from '@/lib/seo-command/auth'
import { seoQuery } from '@/lib/seo-command/db'
import { runDailyPipeline } from '@/lib/seo-command/daily-pipeline'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/** Stored daily reports (newest first). */
export const GET = seoApi({ mutating: false }, async ({ siteId }) => {
  const rows = await seoQuery(`SELECT id, "periodStart"::text "reportDate", title, "createdAt", data->'delivery'->>'status' "deliveryStatus" FROM seo_reports WHERE "siteId"=$1 AND kind='DAILY' ORDER BY "periodStart" DESC LIMIT 30`, [siteId])
  return NextResponse.json({ ok: true, reports: rows })
})

/** Manual on-demand generation. { force: true } regenerates today's report; { deliver: true } also attempts email delivery (default: no email on manual runs). */
export const POST = seoApi({ mutating: true }, async ({ actor }, req: Request) => {
  const body = await readJson(req)
  const r = await runDailyPipeline({ trigger: 'MANUAL', triggeredBy: actor, force: body.force === true, deliver: body.deliver === true })
  return NextResponse.json({ ok: r.report.outcome !== 'FAILED' && r.report.outcome !== 'BUSY', result: r }, { status: r.report.outcome === 'FAILED' ? 500 : r.report.outcome === 'BUSY' ? 409 : 200 })
})
