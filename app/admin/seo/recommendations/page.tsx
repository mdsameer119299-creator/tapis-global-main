import Link from 'next/link'
import { requireSeoPageSession, loadSeo } from '@/lib/seo-command/auth'
import { listRecommendations, recentAudit } from '@/lib/seo-command/queries'
import { Gate, Panel, Empty, fmtDate } from '@/components/seo-command/ui'
import { DecisionControls } from '@/components/seo-command/actions'

export const dynamic = 'force-dynamic'
const FILTERS = ['PROPOSED', 'DEFERRED', 'APPROVED', 'REJECTED', 'SUPERSEDED', 'ALL']

export default async function RecommendationsPage({ searchParams }: { searchParams: { status?: string } }) {
  await requireSeoPageSession()
  const status = FILTERS.includes(searchParams.status ?? '') ? searchParams.status! : 'PROPOSED'
  const result = await loadSeo(async (siteId) => ({ recs: await listRecommendations(siteId, status), audit: await recentAudit(siteId, 15) }))
  return (
    <>
      <h1 className="font-display text-2xl text-ink">Recommendations & approvals</h1>
      <p className="text-sm text-ink-s">Recommendations are generated from verified crawl findings. Approving records a decision only: <strong>nothing is changed on the public website</strong> from this screen. High-impact items need a designated SEO owner.</p>
      <nav className="flex flex-wrap gap-2 text-sm">{FILTERS.map((f) => <Link key={f} href={`/admin/seo/recommendations?status=${f}`} className={`rounded border px-3 py-1 ${f === status ? 'border-ink bg-ink text-white' : 'border-ivory-k bg-white text-ink'}`}>{f.charAt(0) + f.slice(1).toLowerCase()}</Link>)}</nav>
      <Gate result={result}>
        {({ recs, audit }: { recs: any[]; audit: any[] }) => (
          <>
            {recs.length === 0 ? <Empty>No recommendations with status {status.toLowerCase()}.</Empty> : recs.map((r) => (
              <Panel key={r.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2"><h3 className="font-medium text-ink">{r.title}</h3>
                      <span className={`rounded border px-2 py-0.5 text-2xs ${r.riskTier === 'HIGH_IMPACT' ? 'border-red-200 bg-red-50 text-red-800' : 'border-ivory-k bg-ivory text-ink-s'}`}>{r.riskTier === 'HIGH_IMPACT' ? 'High impact' : 'Routine'}</span>
                      <span className="text-2xs text-ink-m">Priority {r.priorityScore}</span></div>
                    <p className="mt-1 text-sm text-ink-s">{r.rationale}</p>
                    <p className="mt-1 text-xs text-ink-m">Evidence: {r.evidence?.affectedCount ?? '?'} affected URL(s) ({r.evidence?.source}). Expected impact: {r.expectedImpact ?? '–'}. Data quality: {r.dataQuality}.</p>
                    {(r.evidence?.exampleUrls ?? []).length > 0 && <ul className="mt-1 list-inside list-disc break-all text-xs text-ink-s">{r.evidence.exampleUrls.slice(0, 4).map((u: string) => <li key={u}><Link className="hover:underline" href={`/admin/seo/pages?url=${encodeURIComponent(u)}`}>{u}</Link></li>)}</ul>}
                  </div>
                  <span className="text-xs text-ink-m">{r.status}</span>
                </div>
                {['PROPOSED', 'IN_REVIEW', 'DEFERRED'].includes(r.status) ? <DecisionControls id={r.id} tier={r.riskTier} /> : (
                  <p className="mt-2 text-xs text-ink-s">Decided by {r.decidedBy ?? '–'} on {fmtDate(r.decidedAt)}{r.decisionNote ? `: “${r.decisionNote}”` : ''}</p>
                )}
              </Panel>
            ))}
            <Panel title="Audit trail">
              {audit.length === 0 ? <Empty>No activity yet.</Empty> : <ul className="space-y-1 text-xs text-ink-s">{audit.map((a: any, i: number) => <li key={i}>{fmtDate(a.at)} · {a.actor} · {a.action}</li>)}</ul>}
            </Panel>
          </>
        )}
      </Gate>
    </>
  )
}
