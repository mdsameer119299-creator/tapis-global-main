import { requireSeoPageSession, loadSeo } from '@/lib/seo-command/auth'
import { listKeywords } from '@/lib/seo-command/queries'
import { Gate, Panel, Empty, ConnectionBadge } from '@/components/seo-command/ui'
import { KeywordForm, DeleteButton } from '@/components/seo-command/actions'

export const dynamic = 'force-dynamic'

export default async function KeywordsPage() {
  await requireSeoPageSession()
  const result = await loadSeo((siteId) => listKeywords(siteId))
  return (
    <>
      <h1 className="font-display text-2xl text-ink">Keyword tracking</h1>
      <ConnectionBadge name="Search Console rankings" status="PENDING" />
      <Gate result={result}>
        {(rows: any[]) => (
          <>
            <Panel title="Add keywords"><KeywordForm /></Panel>
            <Panel title={`Tracked keywords (${rows.length})`}>
              {rows.length === 0 ? <Empty>No keywords yet. Add the terms you want to rank for.</Empty> : (
                <div className="overflow-x-auto"><table className="w-full text-left text-sm">
                  <thead className="text-2xs uppercase text-ink-m"><tr><th className="py-2">Keyword</th><th>Position</th><th title="Pages whose title contains the keyword">In title</th><th>In H1</th><th>In meta</th><th>Target page</th><th /></tr></thead>
                  <tbody className="divide-y divide-ivory-k">
                    {rows.map((k) => (
                      <tr key={k.id}>
                        <td className="py-2 font-medium">{k.keyword}</td>
                        <td>{k.latestPosition == null ? <span className="text-amber-700">Connection pending</span> : Number(k.latestPosition).toFixed(1)}</td>
                        <td>{k.inTitle ?? '–'}</td><td>{k.inH1 ?? '–'}</td><td>{k.inMeta ?? '–'}</td>
                        <td className="max-w-xs break-all text-ink-s">{k.targetUrl ? `${k.targetUrl} (${k.targetStatus ?? 'not crawled'})` : '–'}</td>
                        <td><DeleteButton url="/api/admin/seo/keywords" id={k.id} /></td>
                      </tr>
                    ))}
                  </tbody></table></div>
              )}
              <p className="mt-3 text-xs text-ink-m">Positions come only from Google Search Console and show once access is authorised. “In title / H1 / meta” counts pages from the latest crawl that contain the keyword: an on-page coverage check, not a ranking.</p>
            </Panel>
          </>
        )}
      </Gate>
    </>
  )
}
