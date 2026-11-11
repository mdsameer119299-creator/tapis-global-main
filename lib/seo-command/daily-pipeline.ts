import { seoQuery, withSeoTx } from './db'
import { getOrCreateSiteId } from './store'
import { generateDailyReport, istDate, addDays, type Q, type WithTx, type GenerateResult } from './daily-report'
import { syncGa4, readGa4Config, type Ga4Sync } from './ga4'
import { deliverReport, deliveryStaleMinutes, type DeliveryResult, type Send } from './report-delivery'

/** The daily pipeline in the agreed order: verify integrations -> GA4 sync (if configured) -> generate report from stored data -> deliver -> record results.
 *  Each step's result is returned and the report records delivery separately from generation. A failing step never discards the others.
 *  The Search Console daily sync and the crawl are NOT run here: GSC ingestion is gated behind migration 0005 / import approval, and the crawl has its own endpoint (/api/seo/cron). */
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
      // Delivery state machine (stored in seo_reports.data.delivery.status):
      //   NOT_ATTEMPTED | NOT_CONFIGURED | FAILED --claim--> SENDING --> SENT | FAILED | UNKNOWN | NOT_CONFIGURED
      //   SENDING older than SEO_DELIVERY_STALE_MINUTES --> UNKNOWN (the sender may have died after SMTP accepted the message)
      //   SENT and UNKNOWN are terminal for automatic runs; only a manual forced regenerate + deliver resets them.
      // The claim is one conditional UPDATE, so only one caller can ever hold it.
      const stale = deliveryStaleMinutes(env)
      const claim = await q(`UPDATE seo_reports SET data = jsonb_set(data, '{delivery}', $2::jsonb) WHERE id=$1 AND COALESCE(data->'delivery'->>'status','') NOT IN ('SENT','SENDING','UNKNOWN') RETURNING id`, [report.reportId, JSON.stringify({ status: 'SENDING', attemptedAt: new Date().toISOString() })])
      if (claim.length === 0) delivery = await explainSkippedClaim(q, report.reportId!, stale)
      else {
        delivery = await deliverReport({ title: row.title, summaryMd: row.summaryMd }, env, a.send)
        // Record the outcome with a few retries. If the database stays unreachable the row remains SENDING and later reads as UNKNOWN: it is never re-sent automatically.
        let recorded = false
        for (let i = 0; i < 3 && !recorded; i++) { try { await q(`UPDATE seo_reports SET data = jsonb_set(data, '{delivery}', $2::jsonb) WHERE id=$1`, [report.reportId, JSON.stringify(delivery)]); recorded = true } catch { await new Promise((r) => setTimeout(r, 200 * (i + 1))) } }
        if (!recorded) delivery = { ...delivery, recordFailed: true }
      }
    }
  }
  return { reportDate, ga4, report, delivery }
}

/** The claim was refused: report why, and turn an abandoned SENDING claim into UNKNOWN (conditional, so concurrent callers agree). */
async function explainSkippedClaim(q: Q, reportId: string, staleMinutes: number): Promise<DeliveryResult> {
  const attemptedAt = new Date().toISOString()
  const cur = (await q(`SELECT data->'delivery'->>'status' ds, (data->'delivery'->>'attemptedAt') at FROM seo_reports WHERE id=$1`, [reportId]))[0]
  if (cur?.ds === 'SENT') return { status: 'SKIPPED_ALREADY_SENT', attemptedAt }
  if (cur?.ds === 'UNKNOWN') return { status: 'UNKNOWN', code: 'REVIEW_REQUIRED', attemptedAt }
  if (cur?.ds === 'SENDING') {
    const flipped = await q(`UPDATE seo_reports SET data = jsonb_set(data, '{delivery}', $2::jsonb) WHERE id=$1 AND data->'delivery'->>'status'='SENDING' AND COALESCE((data->'delivery'->>'attemptedAt')::timestamptz, '-infinity') < now() - make_interval(mins => $3::int) RETURNING id`, [reportId, JSON.stringify({ status: 'UNKNOWN', code: 'ABANDONED_CLAIM', attemptedAt }), staleMinutes])
    return flipped.length ? { status: 'UNKNOWN', code: 'ABANDONED_CLAIM', attemptedAt } : { status: 'SKIPPED_IN_PROGRESS', attemptedAt }
  }
  return { status: 'SKIPPED_IN_PROGRESS', attemptedAt }
}
