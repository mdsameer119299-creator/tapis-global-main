import { requireSeoPageSession, loadSeo } from '@/lib/seo-command/auth'
import { buildReport, getTrend, getChanges, listRuns } from '@/lib/seo-command/queries'
import { seoQuery } from '@/lib/seo-command/db'
import { istDate } from '@/lib/seo-command/daily-report'
import { effectiveDeliveryStatus } from '@/lib/seo-command/report-delivery'
import { DailyReportButton } from '@/components/seo-command/actions'
import { Gate, Panel, Stat, Sparkline, Empty, SeverityBadge, fmtDate, codeLabel } from '@/components/seo-command/ui'

export const dynamic = 'force-dynamic'

export default async function ReportsPage({ searchParams }: { searchParams: { days?: string } }) {
  await requireSeoPageSession()
  const days = [7, 30, 90].includes(Number(searchParams.days)) ? Number(searchParams.days) : 30
  const result = await loadSeo(async (siteId) => ({ report: await buildReport(siteId, days), trend: await getTrend(siteId, 60), changes: await getChanges(siteId), runs: await listRuns(siteId, 15), daily: await seoQuery<{ id: string; reportDate: string; title: string; summaryMd: string; createdAt: string; delivery: string | null; attemptedAt: string | null }>(`SELECT id, "periodStart"::text "reportDate", title, "summaryMd", "createdAt", data->'delivery'->>'status' "delivery", data->'delivery'->>'attemptedAt' "attemptedAt" FROM seo_reports WHERE "siteId"=$1 AND kind='DAILY' ORDER BY "periodStart" DESC LIMIT 14`, [siteId]) }))
  return (
    <>
      <div className="flex items-center justify-between"><h1 className="font-display text-2xl text-ink">Reports & history</h1>
        <form method="get"><select name="days" defaultValue={days} className="rounded border border-ivory-k px-2 py-1 text-sm">{[7, 30, 90].map((d) => <option key={d} value={d}>Last {d} days</option>)}</select> <button className="rounded bg-ink px-3 py-1 text-sm text-white">Apply</button></form></div>
      <Gate result={result}>
        {({ report, trend, changes, runs, daily }) => (
          <>
            <Panel title="Daily SEO report (08:00 IST)">
              <p className="mb-2 text-xs text-ink-m">Generated from stored data only. Every metric shows its source, period and freshness; missing data is marked unavailable, never zero. Scheduling is not active until a scheduled run has been verified — see docs/seo-command-centre.md.</p>
              <DailyReportButton hasToday={daily[0]?.reportDate === istDate(new Date())} />
              {daily.length === 0 ? <Empty>No daily report has been generated yet.</Empty> : (
                <>
                  <table className="mt-3 w-full text-left text-sm"><thead className="text-2xs uppercase text-ink-m"><tr><th className="py-1">Date (IST)</th><th>Delivery</th><th>Generated</th></tr></thead><tbody>{daily.map((d: any) => <tr key={d.id} className="border-t border-ivory-k"><td className="py-1">{d.reportDate}</td><td>{effectiveDeliveryStatus(d.delivery, d.attemptedAt)}</td><td>{fmtDate(d.createdAt)}</td></tr>)}</tbody></table>
                  <details className="mt-3" open><summary className="cursor-pointer text-sm font-medium">Latest report — {daily[0].reportDate}</summary><pre className="mt-2 max-h-[600px] overflow-auto whitespace-pre-wrap rounded bg-ivory p-3 text-xs">{daily[0].summaryMd}</pre></details>
                </>
              )}
            </Panel>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Stat label="Crawls" value={report.runs} />
              <Stat label="Score" value={report.lastScore ?? '–'} sub={report.firstScore !== null && report.lastScore !== null ? `from ${report.firstScore}` : undefined} />
              <Stat label="Issues opened" value={report.issuesOpened} />
              <Stat label="Issues resolved" value={report.issuesResolved} />
            </div>
            <Panel title="Health score trend"><Sparkline values={trend.map((t) => t.healthScore)} width={520} height={80} /></Panel>
            <Panel title="Most common open issues">
              {report.topOpenCodes.length === 0 ? <Empty>No open issues.</Empty> : <ul className="divide-y divide-ivory-k text-sm">{report.topOpenCodes.map((c) => <li key={c.code} className="flex justify-between py-1"><span>{codeLabel(c.code)}</span><span>{c.count}</span></li>)}</ul>}
            </Panel>
            {changes && (
              <Panel title="What changed in the latest crawl">
                <div className="grid gap-4 text-sm md:grid-cols-2">
                  <div><h3 className="font-medium">New issues ({changes.newIssues.length})</h3><ul className="mt-1 space-y-1 text-xs">{changes.newIssues.slice(0, 15).map((i: any, k: number) => <li key={k} className="break-all"><SeverityBadge severity={i.severity} /> {codeLabel(i.code)} {i.url ?? ''}</li>)}</ul></div>
                  <div><h3 className="font-medium">Resolved ({changes.resolvedIssues.length})</h3><ul className="mt-1 space-y-1 text-xs">{changes.resolvedIssues.slice(0, 15).map((i: any, k: number) => <li key={k} className="break-all">{codeLabel(i.code)} {i.url ?? ''}</li>)}</ul></div>
                  <div className="md:col-span-2"><h3 className="font-medium">Pages with changed metadata or status ({changes.fieldChanges.length})</h3><ul className="mt-1 space-y-1 text-xs">{changes.fieldChanges.slice(0, 15).map((c: any) => <li key={c.url} className="break-all">{c.url}: {c.pstatus !== c.cstatus ? `status ${c.pstatus} → ${c.cstatus}; ` : ''}{c.ptitle !== c.ctitle ? 'title changed; ' : ''}{c.pdesc !== c.cdesc ? 'description changed; ' : ''}{c.pcanon !== c.ccanon ? 'canonical changed' : ''}</li>)}</ul></div>
                </div>
              </Panel>
            )}
            <Panel title="Crawl history">
              {runs.length === 0 ? <Empty>No crawls yet.</Empty> : <table className="w-full text-left text-sm"><thead className="text-2xs uppercase text-ink-m"><tr><th className="py-1">Started</th><th>Status</th><th>Pages</th><th>Score</th><th>By</th></tr></thead><tbody className="divide-y divide-ivory-k">{runs.map((r) => <tr key={r.id}><td className="py-1">{fmtDate(r.startedAt)}</td><td>{r.status}{r.error ? ` (${r.error})` : ''}</td><td>{r.pagesFetched}</td><td>{r.healthScore ?? '–'}</td><td className="text-ink-s">{r.triggeredBy ?? '–'}</td></tr>)}</tbody></table>}
            </Panel>
          </>
        )}
      </Gate>
    </>
  )
}
