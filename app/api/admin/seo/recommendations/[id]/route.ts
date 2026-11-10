import { NextResponse } from 'next/server'
import { seoApi, readJson, str } from '@/lib/seo-command/auth'
import { decideRecommendation, type Decision } from '@/lib/seo-command/approvals'

export const dynamic = 'force-dynamic'

/** Body: { decision: 'APPROVE'|'REJECT'|'DEFER', note? }. Records a decision only; never edits the public website. */
export const POST = seoApi({ mutating: true }, async ({ actor }, req: Request, { params }: { params: { id: string } }) => {
  const b = await readJson(req)
  const r = await decideRecommendation({ id: params.id, decision: str(b.decision, 10) as Decision, note: str(b.note, 1000), actorEmail: actor })
  return NextResponse.json({ ok: true, ...r })
})
