import { requireSeoPageSession, loadSeo } from '@/lib/seo-command/auth'
import { listCompetitors } from '@/lib/seo-command/queries'
import { Gate, Panel, Empty, fmtDate } from '@/components/seo-command/ui'
import { CompetitorForm, SnapshotButton, DeleteButton } from '@/components/seo-command/actions'

export const dynamic = 'force-dynamic'

export default async function CompetitorsPage() {
  await requireSeoPageSession()
  const result = await loadSeo((siteId) => listCompetitors(siteId))
  return (
    <>
      <h1 className="font-display text-2xl text-ink">Competitor tracking</h1>
      <Gate result={result}>
        {(rows: any[]) => (
          <>
            <Panel title="Add competitor"><CompetitorForm /></Panel>
            {rows.length === 0 ? <Empty>No competitors tracked yet.</Empty> : rows.map((c) => {
              const s = c.latest, p = c.previous
              const diff = (a: unknown, b: unknown) => (p && a !== b ? <span className="ml-2 rounded bg-amber-100 px-1 text-2xs text-amber-800">changed</span> : null)
              return (
                <Panel key={c.id} title={c.domain} action={<span className="flex gap-2"><SnapshotButton id={c.id} /><DeleteButton url="/api/admin/seo/competitors" id={c.id} /></span>}>
                  {!s ? <p className="text-sm text-ink-s">No snapshot yet. Press “Refresh snapshot”.</p> : s.error ? <p className="text-sm text-red-700">Last snapshot failed: {s.error}</p> : (
                    <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm md:grid-cols-2">
                      <div><dt className="text-2xs uppercase text-ink-m">Homepage title</dt><dd>{s.title ?? '–'}{diff(s.title, p?.title)}</dd></div>
                      <div><dt className="text-2xs uppercase text-ink-m">Meta description</dt><dd>{s.metaDescription ?? '–'}{diff(s.metaDescription, p?.metaDescription)}</dd></div>
                      <div><dt className="text-2xs uppercase text-ink-m">H1</dt><dd>{s.h1 ?? '–'}</dd></div>
                      <div><dt className="text-2xs uppercase text-ink-m">Sitemap URLs</dt><dd>{s.sitemapUrlCount ?? 'n/a'}{diff(s.sitemapUrlCount, p?.sitemapUrlCount)}</dd></div>
                      <div><dt className="text-2xs uppercase text-ink-m">Structured data</dt><dd>{(s.jsonLdTypes ?? []).join(', ') || 'none'}</dd></div>
                      <div><dt className="text-2xs uppercase text-ink-m">Hreflang · robots.txt · HTTP · response</dt><dd>{s.hasHreflang ? 'yes' : 'no'} · {s.robotsFound ? 'yes' : 'no'} · {s.httpStatus} · {s.responseMs} ms</dd></div>
                      <div className="md:col-span-2 text-xs text-ink-m">Snapshot {fmtDate(s.fetchedAt)}</div>
                    </dl>
                  )}
                </Panel>
              )
            })}
            <p className="text-xs text-ink-m">Only public on-page facts are collected. Traffic, authority and ranking figures for competitors are not available without a paid data provider and are never estimated.</p>
          </>
        )}
      </Gate>
    </>
  )
}
