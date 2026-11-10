import { requireSeoPageSession, loadSeo } from '@/lib/seo-command/auth'
import { buildReport, getTrend, getChanges, listRuns } from '@/lib/seo-command/queries'
import { Gate, Panel, Stat, Sparkline, Empty, SeverityBadge, fmtDate, codeLabel } from '@/components/seo-command/ui'

export const dynamic = 'force-dynamic'

export default async function ReportsPage({ searchParams }: { searchParams: { days?: string } }) {
  await requireSeoPageSession()
  const days = [7, 30, 90].includes(Number(searchParams.days)) ? Number(searchParams.days) : 30
  const result = await loadSeo(async (siteId) => ({ report: await buildReport(siteId, days), trend: await getTrend(siteId, 60), changes: await getChanges(siteId), runs: await listRuns(siteId, 15) }))
  return (
    <>
      <div className="flex items-center justify-between"><h1 className="font-display text-2xl text-ink">Reports & history</h1>
        <form method="get"><select name="days" defaultValue={days} className="rounded border border-ivory-k px-2 py-1 text-sm">{[7, 30, 90].map((d) => <option key={d} value={d}>Last {d} days</option>)}</select> <button className="rounded bg-ink px-3 py-1 text-sm text-white">Apply</button></form></div>
      <Gate result={result}>
        {({ report, trend, changes, runs }) => (
          <>
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
