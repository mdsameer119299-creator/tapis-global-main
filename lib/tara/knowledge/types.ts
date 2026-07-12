/**
 * lib/tara/knowledge/types.ts — shared shapes for TARA's modular knowledge.
 * Every module below is data-only and capability-safe (no invented commercial
 * claims). Future modules just add records of these shapes — no prompt rewrite.
 */

export interface TaraCategory { slug: string; name: string; image: string; blurb: string; tags?: string[] }

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
}

export interface TaraConstruction {
  id: string
  name: string
  notes: string
  pile?: 'cut' | 'loop' | 'flat' | 'high' | 'mixed'
  detail?: string
  tags?: string[]
}

export interface TaraManufacturingStep { step: number; name: string; detail: string }
export interface TaraGlossaryTerm { term: string; definition: string }
export interface TaraFaq { q: string; a: string }
export interface TaraCareTip { subject: string; tip: string }
export interface TaraFact { id: string; title: string; body: string; tags?: string[] }
