/**
 * lib/market-intelligence/style-library.ts — the shared regional Style Library.
 *
 * Six archetypes, each written once and linked from every country whose real
 * `popularStyles` data (lib/countries.ts) supports it — the grouping approved
 * in the country IA architecture. A country's own Market Intelligence page
 * adds local nuance (designPreferences.localNotes); the archetype description
 * stays here, once, so it is never duplicated per country.
 *
 * Each slug doubles as the eventual Knowledge Centre article slug
 * (category: 'design-inspiration') once that archetype is written up as a
 * full page — resolveMarketIntelligenceLinks() only links out to it once that
 * article is actually published, so nothing here creates a dead link.
 */

export interface StyleArchetype {
  slug: string
  title: string
  description: string
  countrySlugs: string[]
}

export const STYLE_ARCHETYPES: StyleArchetype[] = [
  {
    slug: 'scandinavian-style',
    title: 'Scandinavian Style',
    description: 'Pale woods, restrained pattern and natural fibre texture — the shared Nordic design language, where residential and hospitality buyers alike favour understated, light-filled interiors over ornamentation.',
    countrySlugs: ['sweden', 'denmark', 'finland', 'norway'],
  },
  {
    slug: 'minimalist-contemporary',
    title: 'Minimalist & Contemporary Interiors',
    description: 'Clean lines, low-pile textures and quiet colour palettes for markets where contract and residential buyers alike specify restraint over statement pattern.',
    countrySlugs: ['germany', 'netherlands', 'japan', 'south-korea'],
  },
  {
    slug: 'gulf-opulent-style',
    title: 'Gulf Opulent & Traditional Style',
    description: 'Grand-scale, richly patterned carpet for luxury residential, hospitality and mosque interiors — the shared design language across the Gulf markets.',
    countrySlugs: ['uae', 'saudi-arabia', 'qatar', 'kuwait', 'oman', 'bahrain'],
  },
  {
    slug: 'heritage-transitional',
    title: 'Heritage & Transitional Style',
    description: 'Traditional pattern language reworked for contemporary interiors — the shared thread across markets with a long history of Oriental and Persian-influenced carpet appreciation.',
    countrySlugs: ['uk', 'usa', 'australia'],
  },
  {
    slug: 'refined-fine-hand-knotted',
    title: 'Refined Fine Hand-Knotted',
    description: 'High knot-density, fine wool and silk-blend construction for markets with a strong decorative-arts and connoisseur furnishing tradition.',
    countrySlugs: ['france', 'italy'],
  },
  {
    slug: 'relaxed-natural-fibre',
    title: 'Relaxed Natural-Fibre',
    description: 'Jute, sisal and wool-blend textures for markets favouring a relaxed, natural-materials-forward residential aesthetic.',
    countrySlugs: ['australia', 'new-zealand', 'canada'],
  },
]

export function getStyleArchetype(slug: string): StyleArchetype | undefined {
  return STYLE_ARCHETYPES.find((s) => s.slug === slug)
}

export function getStyleArchetypeForCountry(countrySlug: string): StyleArchetype | undefined {
  return STYLE_ARCHETYPES.find((s) => s.countrySlugs.includes(countrySlug))
}
