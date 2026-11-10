import Link from 'next/link'
import { requireSeoPageSession, loadSeo } from '@/lib/seo-command/auth'
import { listIssues } from '@/lib/seo-command/queries'
import { Gate, Panel, SeverityBadge, Empty, fmtDate, codeLabel } from '@/components/seo-command/ui'

export const dynamic = 'force-dynamic'
const SEVS = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']

export default async function IssuesPage({ searchParams }: { searchParams: { severity?: string; code?: string; status?: string; q?: string } }) {
  await requireSeoPageSession()
  const severity = SEVS.includes(searchParams.severity ?? '') ? searchParams.severity : undefined
  const status = ['OPEN', 'RESOLVED', 'IGNORED', 'ACKNOWLEDGED'].includes(searchParams.status ?? '') ? searchParams.status : 'OPEN'
  const code = /^[A-Z0-9_]{3,60}$/.test(searchParams.code ?? '') ? searchParams.code : undefined
  const q = (searchParams.q ?? '').slice(0, 100) || undefined
  const result = await loadSeo((siteId) => listIssues(siteId, { severity, status, code, q, limit: 300 }))
  return (
    <>
      <h1 className="font-display text-2xl text-ink">Crawl issues</h1>
      <form className="flex flex-wrap gap-2 text-sm" method="get">
        <select name="severity" defaultValue={severity ?? ''} className="rounded border border-ivory-k px-2 py-1"><option value="">All severities</option>{SEVS.map((s) => <option key={s}>{s}</option>)}</select>
        <select name="status" defaultValue={status} className="rounded border border-ivory-k px-2 py-1">{['OPEN', 'RESOLVED', 'IGNORED', 'ACKNOWLEDGED'].map((s) => <option key={s}>{s}</option>)}</select>
        <input name="q" defaultValue={q} placeholder="Filter by URL" className="rounded border border-ivory-k px-2 py-1" />
        {code && <input type="hidden" name="code" value={code} />}
        <button className="rounded bg-ink px-3 py-1 text-white">Filter</button>
        {code && <Link href="/admin/seo/issues" className="self-center text-gold">Clear “{codeLabel(code)}”</Link>}
      </form>
      <Gate result={result}>
        {(rows) => (
          <Panel>
            {rows.length === 0 ? <Empty>No issues match.</Empty> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-2xs uppercase text-ink-m"><tr><th className="py-2">Severity</th><th>Issue</th><th>URL</th><th>First seen</th><th>Last seen</th></tr></thead>
                  <tbody className="divide-y divide-ivory-k">
                    {rows.map((i) => (
                      <tr key={i.id} className="align-top">
                        <td className="py-2"><SeverityBadge severity={i.severity} /></td>
                        <td className="pr-3">{codeLabel(i.code)}</td>
                        <td className="max-w-md break-all pr-3">{i.url ? <Link className="hover:underline" href={`/admin/seo/pages?url=${encodeURIComponent(i.url)}`}>{i.url}</Link> : '–'}</td>
                        <td className="whitespace-nowrap text-ink-s">{fmtDate(i.firstSeenAt)}</td>
                        <td className="whitespace-nowrap text-ink-s">{fmtDate(i.lastSeenAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length >= 300 && <p className="mt-2 text-xs text-ink-m">Showing the first 300. Narrow the filter to see more.</p>}
              </div>
            )}
          </Panel>
        )}
      </Gate>
    </>
  )
}
