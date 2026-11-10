import Link from 'next/link'
import { requireSeoPageSession, loadSeo } from '@/lib/seo-command/auth'
import { getOverview, getTrend, getChanges } from '@/lib/seo-command/queries'
import { Gate, Panel, Stat, ConnectionBadge, SeverityBadge, Sparkline, Empty, fmtDate, codeLabel } from '@/components/seo-command/ui'
import { CrawlButton } from '@/components/seo-command/actions'

export const dynamic = 'force-dynamic'

export default async function SeoOverviewPage() {
  await requireSeoPageSession()
  const result = await loadSeo(async (siteId) => ({ ov: await getOverview(siteId), trend: await getTrend(siteId, 30), changes: await getChanges(siteId) }))
  return (
    <Gate result={result}>
      {({ ov, trend, changes }) => (
        <>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl text-ink">Technical SEO overview</h1>
              <p className="text-sm text-ink-s">tapisglobalinternational.com · last crawl {ov.latest ? fmtDate(ov.latest.finishedAt) : 'never'}</p>
            </div>
            <CrawlButton />
          </div>

          {!ov.latest ? (
            <Empty>No crawl has completed yet. Press “Run crawl now” to audit the site.</Empty>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Stat label="Health score" value={ov.latest.healthScore ?? '–'} sub={ov.scoreDelta === null ? 'No previous crawl to compare' : `${ov.scoreDelta >= 0 ? '+' : ''}${ov.scoreDelta} since previous crawl`} />
                <Stat label="Pages crawled" value={ov.latest.pagesFetched} sub={ov.latest.truncated ? 'Crawl limit reached: partial coverage' : 'Full coverage'} />
                <Stat label="Indexable (derived)" value={ov.pages?.indexable ?? '–'} sub={`${ov.pages?.noindex ?? 0} noindex. From on-page signals, not Google's index.`} />
                <Stat label="Open issues" value={Object.entries(ov.issueCounts).filter(([s]) => s !== 'INFO').reduce((a, [, n]) => a + n, 0)} sub={`${ov.issueCounts.CRITICAL ?? 0} critical · ${ov.issueCounts.HIGH ?? 0} high · across ${ov.issuePages} pages`} />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Panel title="Health score trend">
                  <Sparkline values={trend.map((t) => t.healthScore)} />
                </Panel>
                <Panel title="HTTP status of crawled pages">
                  <ul className="space-y-1 text-sm">
                    {ov.statusDist.map((s) => (
                      <li key={s.bucket} className="flex justify-between"><span>{s.bucket}</span><span className="font-medium">{s.count}</span></li>
                    ))}
                  </ul>
                </Panel>
              </div>

              <Panel title="Top open issues" action={<Link href="/admin/seo/issues" className="text-sm text-gold">All issues →</Link>}>
                {ov.topCodes.length === 0 ? (
                  <Empty>No open issues.</Empty>
                ) : (
                  <ul className="divide-y divide-ivory-k text-sm">
                    {ov.topCodes.map((c) => (
                      <li key={c.code} className="flex items-center justify-between py-2">
                        <span className="flex items-center gap-3"><SeverityBadge severity={c.severity} /><Link href={`/admin/seo/issues?code=${c.code}`} className="hover:underline">{codeLabel(c.code)}</Link></span>
                        <span className="text-ink-s">{c.count} {c.count === 1 ? 'URL' : 'URLs'}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>

              {changes && (
                <Panel title="Changes since previous crawl">
                  <p className="text-sm text-ink-s">
                    {changes.newIssues.length} new issue(s) · {changes.resolvedIssues.length} resolved · {changes.fieldChanges.length} page(s) with changed title, description, canonical or status · {changes.added.length} new URL(s) · {changes.removed.length} URL(s) no longer found.
                  </p>
                  <Link href="/admin/seo/reports" className="mt-2 inline-block text-sm text-gold">Full report →</Link>
                </Panel>
              )}
            </>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <ConnectionBadge name="Google Search Console" status={ov.connections.GSC} />
            <ConnectionBadge name="Google Analytics 4" status={ov.connections.GA4} />
            <Panel title="Recommendations">
              <p className="text-sm text-ink-s">{ov.pendingRecommendations} awaiting review.</p>
              <Link href="/admin/seo/recommendations" className="text-sm text-gold">Review →</Link>
            </Panel>
          </div>
        </>
      )}
    </Gate>
  )
}
