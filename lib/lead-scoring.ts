/**
 * lib/lead-scoring.ts — simple, explainable, deterministic lead scoring.
 *
 * No opaque AI scoring. Each positive signal adds points and a human-readable
 * reason. Output classifies HOT / WARM / NURTURE and stores the reasons so
 * sales can see WHY. Pure function — safe on server and client. No PII is
 * emitted to analytics from here; the score/temperature are non-PII.
 */

export type LeadTemperature = 'hot' | 'warm' | 'nurture'

export interface LeadScoreInput {
  businessEmail?: string
  company?: string
  buyerType?: string
  productInterests?: string[]
  materialInterests?: string[]
  constructionInterests?: string[]
  dimensions?: string
  quantity?: string
  requiredTimeline?: string
  destination?: string
  designAvailable?: boolean
  catalogueRequested?: boolean
  sampleRequested?: boolean
  quotationRequested?: boolean
  handoffRequested?: boolean
  repeatVisit?: boolean
  sourcePath?: string // e.g. '/solutions/custom-carpets'
}

export interface LeadScore {
  score: number
  temperature: LeadTemperature
  reasons: string[]
}

const FREE_EMAIL = /@(gmail|yahoo|hotmail|outlook|live|icloud|aol|proton(mail)?|gmx|mail|yandex|zoho)\./i
const B2B_BUYERS = new Set([
  'architect', 'interior designer', 'hotel / resort', 'hospitality procurement', 'builder / developer',
  'importer', 'distributor', 'wholesaler', 'carpet dealer', 'furniture retailer', 'sourcing company',
  'oem buyer', 'private label buyer', 'institutional buyer',
])
const HIGH_INTENT_SOURCES = ['/solutions/', '/custom', '/products/', '/india/', '/countries/', '/catalogue', '/contact']

export function scoreLead(input: LeadScoreInput): LeadScore {
  let score = 0
  const reasons: string[] = []
  const add = (pts: number, why: string) => { score += pts; reasons.push(`+${pts} ${why}`) }

  if (input.businessEmail && !FREE_EMAIL.test(input.businessEmail)) add(15, 'business (non-free) email')
  if (input.company) add(8, 'company provided')
  if (input.buyerType && B2B_BUYERS.has(input.buyerType.toLowerCase())) add(12, `B2B buyer type: ${input.buyerType}`)
  if (input.productInterests?.length) add(8, 'product category selected')
  if (input.materialInterests?.length) add(6, 'material/fibre selected')
  if (input.constructionInterests?.length) add(4, 'construction selected')
  if (input.dimensions) add(6, 'dimensions supplied')
  if (input.quantity) add(10, 'quantity supplied')
  if (input.requiredTimeline) add(8, 'timeline supplied')
  if (input.destination) add(5, 'destination supplied')
  if (input.designAvailable) add(6, 'own design available')
  if (input.catalogueRequested) add(8, 'catalogue requested')
  if (input.sampleRequested) add(12, 'sample requested')
  if (input.quotationRequested) add(18, 'quotation requested')
  if (input.handoffRequested) add(14, 'team handoff requested')
  if (input.repeatVisit) add(5, 'repeat visit')
  if (input.sourcePath && HIGH_INTENT_SOURCES.some((s) => input.sourcePath!.startsWith(s))) add(6, 'high-intent commercial source')

  const temperature: LeadTemperature = score >= 55 ? 'hot' : score >= 30 ? 'warm' : 'nurture'
  return { score, temperature, reasons }
}

/**
 * Server-side scoring from a raw enquiry `fields` map. The client's leadScore /
 * leadTemperature are NEVER trusted — the server recomputes authoritatively from
 * validated fields (email, company, buyerType, request flags, and any TARA
 * summary of categories/materials). Used by the enquiry API.
 */
export function scoreLeadFromFields(formType: string, fields: Record<string, string>): LeadScore {
  const summary = fields.taraSummary || ''
  const lower = summary.toLowerCase()
  const listFrom = (label: string): string[] => {
    const m = new RegExp(`${label}:\\s*([^|]+)`, 'i').exec(summary)
    return m ? m[1].split(',').map((s) => s.trim()).filter(Boolean) : []
  }
  return scoreLead({
    businessEmail: fields.email,
    company: fields.company,
    buyerType: fields.buyerType,
    productInterests: listFrom('Categories'),
    materialInterests: listFrom('Materials'),
    constructionInterests: listFrom('Constructions'),
    catalogueRequested: fields.catalogueRequested === 'yes' || formType === 'catalogue',
    sampleRequested: /sample/.test(lower),
    quotationRequested: /quotation|quote/.test(lower),
    handoffRequested: formType === 'tara',
    sourcePath: fields.landing_page,
  })
}
