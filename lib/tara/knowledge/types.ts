/**
 * lib/tara/knowledge/types.ts — shared shapes for TARA's modular knowledge.
 * Every module below is data-only and capability-safe (no invented commercial
 * claims). Future modules just add records of these shapes — no prompt rewrite.
 */

export interface TaraCategory { slug: string; name: string; image: string; blurb: string; tags?: string[] }

/**
 * Relative, capability-safe rating (NOT a tested/guaranteed metric). Used only
 * by the recommendation + comparison engines to rank options; it is translated
 * into words before it ever reaches the buyer, never surfaced as a number.
 */
export type Rating = 1 | 2 | 3 | 4 | 5

/**
 * Shared rating -> word vocabulary. Single source of truth so TARA chat
 * (lib/tara/compare.ts, recommend.ts) and the public materials/constructions
 * pages (lib/materials-content.ts) always describe a fibre identically —
 * never surfaced as a raw number in either surface.
 */
export const DURABILITY_WORDS = ['', 'low', 'limited', 'moderate', 'strong', 'excellent'] as const
export const SOFTNESS_WORDS = ['', 'coarse', 'firm', 'moderately soft', 'soft', 'very soft'] as const
export const LUXURY_WORDS = ['', 'value', 'entry', 'mid', 'high', 'top-tier'] as const

export const ratingWord = (words: readonly string[], r: Rating): string => words[r]

/** Structured product profile — the core of the Product Knowledge Engine. */
export interface MaterialProfile {
  description: string
  advantages: string[]
  disadvantages: string[]
  typicalApplications: string[]
  durability: Rating
  softness: Rating
  luxuryLevel: Rating
  maintenance: string
  /** Project types this fibre is commonly considered for. */
  recommendedProjects: string[]
  /** Material ids commonly considered as alternatives. */
  alternatives: string[]
}

export interface TaraMaterial {
  id: string
  name: string
  positioning: 'Economy' | 'Premium' | 'Luxury'
  /** Short line used in chat replies (kept for backward compatibility). */
  notes: string
  /** Short "commonly considered for…" line (kept for backward compatibility). */
  applications: string
  fibreType?: 'natural' | 'synthetic' | 'blend'
  properties?: string[]
  advantages?: string[]
  limitations?: string[]
  maintenance?: string
  priceFactors?: string
  tags?: string[]
  /** Structured, capability-safe product knowledge (Product Knowledge Engine). */
  profile?: MaterialProfile
}

export interface ConstructionProfile {
  description: string
  /** How it is made. */
  method: string
  /** Material ids commonly used for this construction. */
  suitableMaterials: string[]
  bestApplications: string[]
  trafficSuitability: 'low' | 'moderate' | 'high' | 'very-high'
  /** Typical pile-height descriptor (capability-safe, not an exact spec). */
  pileHeight: string
  maintenance: string
}

export interface TaraConstruction {
  id: string
  name: string
  notes: string
  pile?: 'cut' | 'loop' | 'flat' | 'high' | 'mixed'
  detail?: string
  tags?: string[]
  /** Structured, capability-safe product knowledge (Product Knowledge Engine). */
  profile?: ConstructionProfile
}

export interface TaraManufacturingStep { step: number; name: string; detail: string }
export interface TaraGlossaryTerm { term: string; definition: string }
export interface TaraFaq { q: string; a: string }
export interface TaraCareTip { subject: string; tip: string }
export interface TaraFact { id: string; title: string; body: string; tags?: string[] }
