import Link from 'next/link'
import { requireSeoPageSession, loadSeo } from '@/lib/seo-command/auth'
import { listPages, getPageDetail, latestPageSpeed } from '@/lib/seo-command/queries'
import { Gate, Panel, SeverityBadge, Empty, fmtDate, codeLabel } from '@/components/seo-command/ui'
import { PageSpeedForm } from '@/components/seo-command/actions'
import { configuredBaseUrl } from '@/lib/seo-command/store'

export const dynamic = 'force-dynamic'

export default async function PagesPage({ searchParams }: { searchParams: { url?: string; q?: string; status?: string } }) {
  await requireSeoPageSession()
  const url = (searchParams.url ?? '').slice(0, 500)
  if (url) {
    const result = await loadSeo(async (siteId) => ({ d: await getPageDetail(siteId, url), speed: (await latestPageSpeed(siteId)).filter((s: any) => s.url === url) }))
    return (
      <>
        <Link href="/admin/seo/pages" className="text-sm text-gold">← All pages</Link>
        <h1 className="break-all font-display text-xl text-ink">{url}</h1>
        <Gate result={result}>
          {({ d, speed }) => {
            const cur: any = d.history[0]
            return (
              <>
                {!cur ? <Empty>This URL was not found in any crawl.</Empty> : (
                  <Panel title="Latest crawl">
                    <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm md:grid-cols-2">
                      {([['Status', cur.statusCode ?? 'no response'], ['Title', cur.title ?? '–'], ['Meta description', cur.metaDescription ?? '–'], ['H1', cur.h1 ?? '–'], ['Canonical', cur.canonicalUrl ?? '–'], ['Robots meta', cur.robotsMeta ?? '–'], ['Words', cur.wordCount ?? '–'], ['Response', cur.responseMs == null ? '–' : `${cur.responseMs} ms`], ['Internal links in / out', `${cur.internalLinksIn ?? '–'} / ${cur.internalLinksOut ?? '–'}`], ['Structured data', (cur.jsonLdTypes ?? []).join(', ') || 'none']] as [string, any][]).map(([k, v]) => (
                        <div key={k}><dt className="text-2xs uppercase text-ink-m">{k}</dt><dd className="break-words">{String(v)}</dd></div>
                      ))}
                    </dl>
                  </Panel>
                )}
                <Panel title="Issues on this page">
                  {d.issues.length === 0 ? <Empty>No issues recorded.</Empty> : (
                    <ul className="divide-y divide-ivory-k text-sm">
                      {d.issues.map((i: any) => (
                        <li key={i.id} className="flex items-center justify-between py-2"><span className="flex items-center gap-3"><SeverityBadge severity={i.severity} />{codeLabel(i.code)}</span><span className="text-ink-s">{i.status}</span></li>
                      ))}
                    </ul>
                  )}
                </Panel>
                <Panel title="Page speed">
                  <PageSpeedForm defaultUrl={url} />
                  {speed.length > 0 && (
                    <table className="mt-3 w-full text-left text-sm"><thead className="text-2xs uppercase text-ink-m"><tr><th>Device</th><th>Score</th><th>LCP</th><th>CLS</th><th>TBT</th><th>Measured</th></tr></thead><tbody>
                      {speed.map((s: any) => (<tr key={s.strategy}><td>{s.strategy}</td><td>{s.error ? <span className="text-red-700">unavailable: {s.error}</span> : s.perfScore}</td><td>{s.lcpMs ?? '–'} ms</td><td>{s.cls ?? '–'}</td><td>{s.tbtMs ?? '–'} ms</td><td>{fmtDate(s.fetchedAt)}</td></tr>))}
                    </tbody></table>
                  )}
                  <p className="mt-2 text-xs text-ink-m">Lab data from Google PageSpeed Insights (Lighthouse). Field data (real users) appears only when Google has enough traffic data for the URL.</p>
                </Panel>
                <Panel title="History">
                  {d.history.length < 2 ? <Empty>History builds up with each crawl.</Empty> : (
                    <table className="w-full text-left text-sm"><thead className="text-2xs uppercase text-ink-m"><tr><th>Crawled</th><th>Status</th><th>Title</th><th>Words</th></tr></thead><tbody className="divide-y divide-ivory-k">
                      {d.history.map((h: any, i: number) => (<tr key={i}><td className="py-1">{fmtDate(h.startedAt)}</td><td>{h.statusCode ?? '–'}</td><td className="max-w-sm truncate">{h.title ?? '–'}</td><td>{h.wordCount ?? '–'}</td></tr>))}
                    </tbody></table>
                  )}
                </Panel>
              </>
            )
          }}
        </Gate>
      </>
    )
  }
  const status = searchParams.status === 'error' || searchParams.status === 'redirect' ? searchParams.status : undefined
  const q = (searchParams.q ?? '').slice(0, 100) || undefined
  const result = await loadSeo((siteId) => listPages(siteId, { q, status, limit: 300 }))
  return (
    <>
      <h1 className="font-display text-2xl text-ink">Page-level audit</h1>
      <form className="flex flex-wrap gap-2 text-sm" method="get">
        <input name="q" defaultValue={q} placeholder="Filter by URL" className="rounded border border-ivory-k px-2 py-1" />
        <select name="status" defaultValue={status ?? ''} className="rounded border border-ivory-k px-2 py-1"><option value="">All pages</option><option value="error">Errors (4xx/5xx/no response)</option><option value="redirect">Redirects</option></select>
        <button className="rounded bg-ink px-3 py-1 text-white">Filter</button>
      </form>
      <Gate result={result}>
        {({ run, pages }) => (
          <Panel title={run ? `Latest crawl · ${fmtDate(run.finishedAt)}` : undefined}>
            {!run ? <Empty>No crawl has completed yet.</Empty> : pages.length === 0 ? <Empty>No pages match.</Empty> : (
              <div className="overflow-x-auto"><table className="w-full text-left text-sm">
                <thead className="text-2xs uppercase text-ink-m"><tr><th className="py-2">URL</th><th>Status</th><th>Title</th><th>Words</th><th>ms</th><th>In</th><th>Issues</th></tr></thead>
                <tbody className="divide-y divide-ivory-k">
                  {pages.map((p: any) => (
                    <tr key={p.url}><td className="max-w-xs break-all py-2 pr-3"><Link className="hover:underline" href={`/admin/seo/pages?url=${encodeURIComponent(p.url)}`}>{p.url.replace(/^https?:\/\/[^/]+/, '') || '/'}</Link></td><td>{p.statusCode ?? '–'}</td><td className="max-w-xs truncate pr-3">{p.title ?? '–'}</td><td>{p.wordCount ?? '–'}</td><td>{p.responseMs ?? '–'}</td><td>{p.internalLinksIn ?? 0}</td><td className={p.openIssues ? 'font-medium text-amber-700' : 'text-ink-m'}>{p.openIssues}</td></tr>
                  ))}
                </tbody></table></div>
            )}
          </Panel>
        )}
      </Gate>
      <p className="text-xs text-ink-m">Page speed can be measured on each page’s detail view. Site: {configuredBaseUrl()}</p>
    </>
  )
}
