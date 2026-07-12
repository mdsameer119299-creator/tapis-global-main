/**
 * lib/crm-pipeline.ts — structured B2B sales pipeline model.
 *
 * Defines the canonical stages, allowed transitions, entry/exit criteria and
 * SLAs used to move a lead from first contact to close. The live CRM
 * (HubSpot/Zoho/Pipedrive/sheet) is external; this module is the shared spec +
 * helpers that map an incoming scored lead to its starting stage and priority.
 * See docs/crm-pipeline.md.
 */
import type { LeadTier } from '@/lib/lead-scoring'

export const PIPELINE_STAGES = [
  'New',
  'Qualified',
  'Sample',
  'Quote',
  'Negotiation',
  'Won',
  'Lost',
] as const

export type PipelineStage = (typeof PIPELINE_STAGES)[number]

export interface StageDefinition {
  stage: PipelineStage
  order: number
  definition: string
  /** What must be true to enter this stage. */
  entry: string
  /** What moves the lead out of this stage. */
  exit: string
  owner: string
  /** Target time to first action / next stage, in hours. */
  slaHours: number
}

export const STAGE_DEFINITIONS: StageDefinition[] = [
  {
    stage: 'New',
    order: 1,
    definition: 'Enquiry received via the qualification form or a direct channel; not yet reviewed.',
    entry: 'Form submitted / message received.',
    exit: 'Sales reviews fit and either qualifies or disqualifies.',
    owner: 'Sales (triage)',
    slaHours: 24,
  },
  {
    stage: 'Qualified',
    order: 2,
    definition: 'Legitimate buyer with a real requirement, budget signal or clear intent.',
    entry: 'Buyer type, product interest and a genuine need confirmed.',
    exit: 'A sample/spec or a quote is requested/started.',
    owner: 'Sales',
    slaHours: 48,
  },
  {
    stage: 'Sample',
    order: 3,
    definition: 'Sample or specification pack requested, prepared or shipped.',
    entry: 'Sample/spec agreed; construction, colour and size defined.',
    exit: 'Sample approved and a formal quote is requested.',
    owner: 'Sales + Production',
    slaHours: 120,
  },
  {
    stage: 'Quote',
    order: 4,
    definition: 'Formal quotation issued (pricing, lead time, Incoterms).',
    entry: 'Specification finalised enough to price.',
    exit: 'Buyer accepts, negotiates, or declines.',
    owner: 'Sales',
    slaHours: 72,
  },
  {
    stage: 'Negotiation',
    order: 5,
    definition: 'Commercial terms in discussion — price, MOQ, terms, logistics.',
    entry: 'Buyer engaged on the quote with open points.',
    exit: 'Agreement reached (Won) or discussions end (Lost).',
    owner: 'Sales / Management',
    slaHours: 168,
  },
  {
    stage: 'Won',
    order: 6,
    definition: 'Order confirmed / PO received.',
    entry: 'Terms agreed and order placed.',
    exit: 'Handover to production/fulfilment.',
    owner: 'Sales → Ops',
    slaHours: 24,
  },
  {
    stage: 'Lost',
    order: 7,
    definition: 'Opportunity closed without an order.',
    entry: 'Buyer declines, goes silent past follow-up, or disqualified.',
    exit: 'Archived with a reason (re-engage later if appropriate).',
    owner: 'Sales',
    slaHours: 0,
  },
]

/** Allowed forward/again transitions between stages. */
export const STAGE_TRANSITIONS: Record<PipelineStage, PipelineStage[]> = {
  New: ['Qualified', 'Lost'],
  Qualified: ['Sample', 'Quote', 'Lost'],
  Sample: ['Quote', 'Negotiation', 'Lost'],
  Quote: ['Negotiation', 'Won', 'Lost'],
  Negotiation: ['Won', 'Lost'],
  Won: [],
  Lost: ['Qualified'], // re-engagement
}

export function canTransition(from: PipelineStage, to: PipelineStage): boolean {
  return STAGE_TRANSITIONS[from]?.includes(to) ?? false
}

/** Every lead starts at 'New'. */
export function initialStage(): PipelineStage {
  return 'New'
}

/** Map lead tier → work priority so Hot leads are triaged first. */
export function priorityForTier(tier: LeadTier): 'P1' | 'P2' | 'P3' {
  return tier === 'Hot' ? 'P1' : tier === 'Warm' ? 'P2' : 'P3'
}

/** First-touch SLA target (hours) by tier — Hot leads get the fastest response. */
export function firstTouchSlaHours(tier: LeadTier): number {
  return tier === 'Hot' ? 4 : tier === 'Warm' ? 24 : 72
}
