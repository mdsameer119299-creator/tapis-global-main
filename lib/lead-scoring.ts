/**
 * lib/lead-scoring.ts — deterministic Hot/Warm/Cold lead classification.
 *
 * Scores ONLY on data the buyer actually submitted (buyer type, timeline,
 * quantity, business vs free email, company details, destination, message
 * depth). No enrichment, no third-party lookups, no fabricated signals. Pure and
 * unit-testable; used both server-side (added to the lead email + CRM payload)
 * and client-side (to tag the analytics event with lead_tier).
 */

export type LeadTier = 'Hot' | 'Warm' | 'Cold'

export interface LeadScore {
  score: number // 0–100
  tier: LeadTier
  reasons: string[]
}

/** Free/consumer email providers — a non-listed domain signals a business address. */
const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.in', 'ymail.com', 'rocketmail.com',
  'hotmail.com', 'outlook.com', 'live.com', 'msn.com', 'aol.com', 'icloud.com', 'me.com',
  'proton.me', 'protonmail.com', 'gmx.com', 'mail.com', 'rediffmail.com', 'zoho.com',
])

const lc = (v?: string) => (v ?? '').trim().toLowerCase()

/** Classify a lead from its submitted qualification fields. Never throws. */
export function scoreLead(fields: Record<string, string>): LeadScore {
  let score = 0
  const reasons: string[] = []
  const add = (n: number, why?: string) => {
    score += n
    if (why) reasons.push(why)
  }

  // Buyer segment — commercial intent varies by type.
  const buyer = lc(fields.buyerType)
  if (/large buyer|distributor/.test(buyer)) add(25, 'Large buyer / distributor')
  else if (/hospitality|hotel/.test(buyer)) add(22, 'Hospitality procurement')
  else if (/private label/.test(buyer)) add(20, 'Private-label brand')
  else if (/importer|wholesaler/.test(buyer)) add(18, 'Importer / wholesaler')
  else if (/designer|architect/.test(buyer)) add(14, 'Designer / architect')

  // Timeline — the strongest purchase-readiness signal.
  const timeline = lc(fields.timeline)
  if (/immediate/.test(timeline)) add(25, 'Immediate timeline')
  else if (/within 1 month/.test(timeline)) add(20, 'Buying within a month')
  else if (/1.?3 month/.test(timeline)) add(12, '1–3 month timeline')
  else if (/3.?6 month/.test(timeline)) add(6)
  else if (/research/.test(timeline)) add(-5, 'Just researching')

  // Quantity / project size.
  const qty = lc(fields.quantity)
  if (qty) {
    add(8, 'Quantity specified')
    if (/container|pallet|\broll\b|\b[1-9]\d{2,}\b/.test(qty)) add(10, 'Substantial volume')
  }

  // Business email domain.
  const domain = lc(fields.email).split('@')[1] ?? ''
  if (domain && !FREE_EMAIL_DOMAINS.has(domain)) add(12, 'Business email domain')

  // Company signals.
  if (lc(fields.companyWebsite)) add(8, 'Company website provided')
  if (lc(fields.companyName)) add(4)

  // Logistics + detail.
  if (lc(fields.destination)) add(4, 'Destination specified')
  if ((fields.message ?? '').trim().length >= 60) add(6, 'Detailed requirements')

  score = Math.max(0, Math.min(100, score))
  const tier: LeadTier = score >= 60 ? 'Hot' : score >= 35 ? 'Warm' : 'Cold'
  return { score, tier, reasons }
}

/** Attach scoring fields to a lead payload for the email + CRM ingest. */
export function withLeadScore(fields: Record<string, string>): Record<string, string> {
  const { score, tier, reasons } = scoreLead(fields)
  return {
    ...fields,
    leadScore: String(score),
    leadTier: tier,
    leadReasons: reasons.join('; '),
  }
}
