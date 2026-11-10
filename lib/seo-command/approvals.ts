import { randomUUID } from 'crypto'
import { withSeoTx } from './db'
import { audit } from './store'

export type Decision = 'APPROVE' | 'REJECT' | 'DEFER'

export class ApprovalError extends Error {
  constructor(public code: 'NOT_FOUND' | 'FORBIDDEN' | 'CONFLICT' | 'INVALID', message: string) {
    super(message)
  }
}

/** The existing admin session carries no role, so ownership comes from an allow-list env var.
 * Unset means nobody may approve HIGH_IMPACT changes (safe default). */
export function isSeoOwner(email: string, env: string | undefined = process.env.SEO_OWNER_EMAILS): boolean {
  return (env ?? '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase())
}

/** Recording a decision NEVER changes the public website. APPROVED means "cleared to be implemented"; APPLIED is a separate, manual step. */
export async function decideRecommendation(input: { id: string; decision: Decision; note?: string | null; actorEmail: string }) {
  const { id, decision, actorEmail } = input
  const note = (input.note ?? '').trim().slice(0, 1000) || null
  if (!['APPROVE', 'REJECT', 'DEFER'].includes(decision)) throw new ApprovalError('INVALID', 'Invalid decision')
  if (decision === 'REJECT' && !note) throw new ApprovalError('INVALID', 'A note is required when rejecting')

  return withSeoTx(async (c) => {
    const r = await c.query(`SELECT id,"siteId",status,"riskTier","dedupeKey" FROM seo_recommendations WHERE id=$1 FOR UPDATE`, [id])
    if (!r.rowCount) throw new ApprovalError('NOT_FOUND', 'Recommendation not found')
    const rec = r.rows[0]
    if (!['PROPOSED', 'IN_REVIEW', 'DEFERRED'].includes(rec.status)) throw new ApprovalError('CONFLICT', `Recommendation is already ${rec.status}`)
    if (decision === 'APPROVE' && rec.riskTier === 'HIGH_IMPACT' && !isSeoOwner(actorEmail)) {
      throw new ApprovalError('FORBIDDEN', 'High-impact changes can only be approved by a designated SEO owner')
    }
    const newStatus = decision === 'APPROVE' ? 'APPROVED' : decision === 'REJECT' ? 'REJECTED' : 'DEFERRED'
    await c.query(`UPDATE seo_recommendations SET status=$2::"SeoRecStatus","decidedBy"=$3,"decidedAt"=now(),"decisionNote"=$4,"updatedAt"=now() WHERE id=$1`, [id, newStatus, actorEmail, note])
    if (decision !== 'DEFER') {
      await c.query(
        `INSERT INTO seo_approval_requests (id,"recommendationId","requiredRole",status,"decidedBy","decidedAt",note) VALUES ($1,$2,$3::"AdminRole",$4::"SeoApprovalStatus",$5,now(),$6)`,
        [randomUUID(), id, rec.riskTier === 'HIGH_IMPACT' ? 'OWNER' : 'PUBLISHER', decision === 'APPROVE' ? 'APPROVED' : 'REJECTED', actorEmail, note],
      )
    }
    await audit(c, rec.siteId, actorEmail, `recommendation.${newStatus.toLowerCase()}`, 'seo_recommendations', id, { riskTier: rec.riskTier, dedupeKey: rec.dedupeKey, note })
    return { id, status: newStatus as 'APPROVED' | 'REJECTED' | 'DEFERRED' }
  })
}
