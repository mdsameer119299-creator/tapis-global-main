/**
 * lib/market-intelligence/types.ts — structured schema for the per-country
 * Market Intelligence page (see the approved country IA architecture and
 * docs/MARKET-INTELLIGENCE-ENGINE.md). One JSON file per country in
 * content/market-intelligence/*.json drives one reusable render template
 * (components/countries/MarketIntelligenceView.tsx) — the same content-engine
 * pattern already proven by the Knowledge Centre (lib/knowledge/types.ts).
 *
 * Seven fixed dimensions, identical scaffolding across every country, with
 * genuinely different content underneath. `SourcedClaim` carries an explicit
 * evidence status so a country with real, verified research renders
 * differently from one still pending it — the compliance guardrail is
 * structural (enforced by the validator + the render template), not just an
 * authoring instruction that can be forgotten.
 */

/**
 * 'verified'         — a specific, sourced fact (a named standard, a cited
 *                       figure, or the site's own real per-country data).
 *                       Requires `source`.
 * 'general'          — safe, non-specific guidance that doesn't need a
 *                       citation (e.g. "buyers typically request a physical
 *                       sample before committing to a large order").
 * 'pending-research' — the dimension applies to this country but hasn't been
 *                       researched yet. The template renders a soft, honest
 *                       fallback instead of `text` — never a guess dressed up
 *                       as fact.
 */
export type EvidenceStatus = 'verified' | 'general' | 'pending-research'

export interface SourcedClaim {
  /** The claim/guidance text. Still required when status is 'pending-research' — kept as an internal authoring note; the template does not render it verbatim in that state. */
  text: string
  status: EvidenceStatus
  /** Required when status === 'verified' — what backs the claim (a named standard, report, or cross-reference to real site data). */
  source?: string
}

export interface BuyerBehaviour {
  /** e.g. "Architects", "Procurement managers", "Homeowners" — who actually decides. */
  decisionMakers: string[]
  procurementCycle: SourcedClaim
  sampleExpectations: SourcedClaim
  negotiationNorms: SourcedClaim
}

export interface DesignPreferences {
  /** Slug into STYLE_ARCHETYPES (lib/market-intelligence/style-library.ts) — the shared regional hub this country links to instead of re-explaining the archetype. */
  styleArchetypeSlug: string
  /** What's genuinely different about this country within the shared archetype. */
  localNotes: SourcedClaim[]
}

export interface ClimateMaterialFit {
  climateSummary: SourcedClaim
  /** TARA_MATERIALS ids — cross-references /materials/[id]. */
  recommendedMaterialIds: string[]
  /** Climate-driven care guidance — replaces a separate per-country maintenance page. */
  careNotes: SourcedClaim
}

export interface ArchitecturalContext {
  /** e.g. "Hospitality towers", "Timber-frame residential", "Contract office stock". */
  buildingTypes: string[]
  narrative: SourcedClaim
}

export interface SustainabilityExpectations {
  summary: SourcedClaim
  /** Named regulations/programmes actually driving this market's expectations, where verified. */
  regulatoryDrivers?: string[]
}

export interface RegulationsCompliance {
  /** A short snapshot only — the full detail lives on the Import & Regulatory Guide this links out to. */
  snapshot: SourcedClaim
  /** Knowledge Centre slug (category: 'export-knowledge') for the full guide — shared EU guide + addendum, or a distinct non-EU guide. */
  importGuideSlug?: string
}

export interface ProcurementGuidance {
  steps: string[]
  leadTimeNote: SourcedClaim
  /** lib/company.ts slugs, e.g. 'why-bhadohi', 'export-process'. */
  relatedCompanyPages: string[]
}

/**
 * The commercial section every Market Intelligence page ends with. Tone
 * mirrors lib/export-capability.ts's discipline: informative first, a single
 * primary call-to-action, no fabricated numbers, no stacked banners — a
 * natural next step, not a hard sell.
 */
export interface CommercialPathway {
  headline: string
  supportingCopy: string
  primaryCta: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
  /** Informational hint only, for editorial context — never gates content and is not sent anywhere; real lead scoring stays server-side in lib/lead-scoring.ts. */
  leadIntentTag?: 'hot' | 'warm' | 'nurture'
}

export interface CountryMarketIntelligence {
  /** Must match an existing /countries/[slug] (lib/countries.ts). */
  countrySlug: string
  status?: 'draft' | 'published'
  updatedAt: string
  seo: { title: string; description: string; keywords?: string[] }

  buyerBehaviour: BuyerBehaviour
  designPreferences: DesignPreferences
  climateMaterialFit: ClimateMaterialFit
  architecturalContext: ArchitecturalContext
  sustainabilityExpectations: SustainabilityExpectations
  regulationsCompliance: RegulationsCompliance
  procurementGuidance: ProcurementGuidance
  /** Required — every page ends with this section. */
  commercial: CommercialPathway

  relatedCountries?: string[]
  relatedIndustries?: string[]
  relatedGlossaryTerms?: string[]
}
