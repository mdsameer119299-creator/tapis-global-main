import { seoQuery, withSeoTx } from './db'
import { getOrCreateSiteId } from './store'
import { generateDailyReport, istDate, addDays, type Q, type WithTx, type GenerateResult } from './daily-report'
import { syncGa4, readGa4Config, type Ga4Sync } from './ga4'
import { deliverReport, type DeliveryResult, type Send } from './report-delivery'

/** The daily pipeline in the agreed order: verify integrations -> GA4 sync (if configured) -> generate report from stored data -> deliver -> record results.
 *  Each step's result is returned and the report records delivery separately from generation. A failing step never discards the others.
 *  The Search Console daily sync and the crawl are NOT run here: GSC ingestion is gated behind migration 0005 / import approval, and the crawl has its own endpoint (/api/seo/cron). */
const DELIVERY_CLAIM_MINUTES = 15
export const appQ: Q = (t, p) => seoQuery(t, p)
export const appWithTx: WithTx = (fn) => withSeoTx((c) => fn((t, p) => c.query(t, p).then((r) => r.rows)))

export interface PipelineResult { reportDate: string; ga4: Ga4Sync | { status: 'SKIPPED'; reason: string }; report: GenerateResult; delivery: DeliveryResult | { status: 'NOT_ATTEMPTED'; reason: string } }

export async function runDailyPipeline(a: { trigger: 'SCHEDULE' | 'MANUAL'; triggeredBy: string; force?: boolean; deliver?: boolean; now?: Date; q?: Q; withTx?: WithTx; siteId?: string; env?: Record<string, string | undefined>; send?: Send; fetchImpl?: typeof fetch }): Promise<PipelineResult> {
  const q = a.q ?? appQ, withTx = a.withTx ?? appWithTx, env = a.env ?? process.env, now = a.now ?? new Date()
  const siteId = a.siteId ?? (await getOrCreateSiteId()); const reportDate = istDate(now)
  let ga4: PipelineResult['ga4']
  const cfg = readGa4Config(env)
  if (!cfg.ok) ga4 = { status: 'SKIPPED', reason: cfg.reason }
  else { try { ga4 = await syncGa4(q, { siteId, startDate: addDays(reportDate, -4), endDate: addDays(reportDate, -1), env, fetchImpl: a.fetchImpl }) } catch (e) { ga4 = { status: 'FAILED', code: e instanceof Error ? e.name : 'Error', rowsFetched: 0, rowsWritten: 0 } } }
  const report = await generateDailyReport({ withTx, q, siteId, trigger: a.trigger, triggeredBy: a.triggeredBy, force: a.force, now })
  let delivery: PipelineResult['delivery'] = { status: 'NOT_ATTEMPTED', reason: report.outcome === 'DUPLICATE' ? 'report already exists for today' : report.outcome }
  const deliverable = (report.outcome === 'CREATED' || report.outcome === 'REGENERATED' || (report.outcome === 'DUPLICATE' && a.deliver !== false)) && report.reportId
  if (deliverable && a.deliver !== false) {
    const row = (await q(`SELECT title, "summaryMd", data->'delivery'->>'status' ds FROM seo_reports WHERE id=$1`, [report.reportId]))[0]
    if (row) {
      // Atomic claim: only one caller may send. A concurrent call, or a scheduler retry after a client timeout, sees SENDING/SENT and does not email again.
      // A claim older than DELIVERY_CLAIM_MINUTES is treated as abandoned (the sender crashed) and may be retried.
      const claim = await q(`UPDATE seo_reports SET data = jsonb_set(data, '{delivery}', $2::jsonb) WHERE id=$1 AND COALESCE(data->'delivery'->>'status','') <> 'SENT' AND (COALESCE(data->'delivery'->>'status','') <> 'SENDING' OR COALESCE((data->'delivery'->>'attemptedAt')::timestamptz, '-infinity') < now() - make_interval(mins => $3::int)) RETURNING id`, [report.reportId, JSON.stringify({ status: 'SENDING', attemptedAt: new Date().toISOString() }), DELIVERY_CLAIM_MINUTES])
      if (claim.length === 0) {
        const cur = (await q(`SELECT data->'delivery'->>'status' ds FROM seo_reports WHERE id=$1`, [report.reportId]))[0]?.ds
        delivery = { status: cur === 'SENT' ? 'SKIPPED_ALREADY_SENT' : 'SKIPPED_IN_PROGRESS', attemptedAt: new Date().toISOString() }
      } else delivery = await deliverReport({ title: row.title, summaryMd: row.summaryMd }, env, a.send)
      if (delivery.status !== 'SKIPPED_ALREADY_SENT' && delivery.status !== 'SKIPPED_IN_PROGRESS') await q(`UPDATE seo_reports SET data = jsonb_set(data, '{delivery}', $2::jsonb) WHERE id=$1`, [report.reportId, JSON.stringify(delivery)])
    }
  }
  return { reportDate, ga4, report, delivery }
}
