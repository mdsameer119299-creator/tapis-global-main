import { NextResponse } from 'next/server'
import { seoApi, readJson, str } from '@/lib/seo-command/auth'
import { addCompetitor, removeCompetitor, snapshotCompetitor } from '@/lib/seo-command/tracking'
import { listCompetitors } from '@/lib/seo-command/queries'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export const GET = seoApi({ mutating: false }, async ({ siteId }) => NextResponse.json({ ok: true, competitors: await listCompetitors(siteId) }))

/** Body: { domain, label? } adds; { snapshotId } fetches a fresh public snapshot. */
export const POST = seoApi({ mutating: true }, async ({ siteId, actor }, req: Request) => {
  const b = await readJson(req)
  if (b.snapshotId) {
    const snap = await snapshotCompetitor(siteId, str(b.snapshotId, 100), actor)
    return NextResponse.json({ ok: !snap.error, snapshot: snap })
  }
  const r = await addCompetitor(siteId, actor, str(b.domain, 253), str(b.label, 80) || null)
  return NextResponse.json({ ok: true, ...r })
})

export const DELETE = seoApi({ mutating: true }, async ({ siteId, actor }, req: Request) => {
  const id = str((await readJson(req)).id, 100)
  if (!id) return NextResponse.json({ ok: false, error: 'id required' }, { status: 400 })
  return NextResponse.json({ ok: true, ...(await removeCompetitor(siteId, id, actor)) })
})
