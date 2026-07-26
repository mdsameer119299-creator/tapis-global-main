/**
 * lib/market-intelligence/links.ts — automatic internal linking for a
 * country's Market Intelligence page. Mirrors lib/knowledge/links.ts: resolves
 * every related-* reference to a real on-site URL and silently drops broken
 * refs (a typo never renders a dead link) rather than guessing.
 */
import { getCountry, getIndustry, getCompanyPage } from '../seo-landing'
import { TARA_MATERIALS, TARA_GLOSSARY } from '../tara/knowledge'
import { getPublishedArticle } from '../knowledge/content'
import { getStyleArchetype } from './style-library'
import type { CountryMarketIntelligence } from './types'
import type { KnowledgeLink } from '../knowledge/types'

const glossarySlug = (term: string) => term.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const uniq = (arr: KnowledgeLink[]) => {
  const seen = new Set<string>()
  return arr.filter((l) => (seen.has(l.href) ? false : (seen.add(l.href), true)))
}

export interface ResolvedMarketIntelligenceLinks {
  styleArchetype: KnowledgeLink | null
  recommendedMaterials: KnowledgeLink[]
  importGuide: KnowledgeLink | null
  companyPages: KnowledgeLink[]
  countries: KnowledgeLink[]
  industries: KnowledgeLink[]
  glossaryTerms: KnowledgeLink[]
}

export function resolveMarketIntelligenceLinks(entry: CountryMarketIntelligence): ResolvedMarketIntelligenceLinks {
  const archetype = getStyleArchetype(entry.designPreferences.styleArchetypeSlug)
  // Only link out once the archetype's own Knowledge Centre write-up is
  // actually published — otherwise this stays a plain (unlinked) label rather
  // than a dead link to a page that doesn't exist yet.
  const archetypeArticle = archetype ? getPublishedArticle(archetype.slug) : undefined
  const styleArchetype: KnowledgeLink | null = archetype
    ? { label: archetype.title, href: archetypeArticle ? `/knowledge/${archetype.slug}` : '' }
    : null

  const recommendedMaterials = uniq(
    entry.climateMaterialFit.recommendedMaterialIds
      .map((id) => TARA_MATERIALS.find((m) => m.id === id))
      .filter((m): m is NonNullable<typeof m> => Boolean(m))
      .map((m) => ({ label: m.name, href: `/materials/${m.id}` })),
  )

  const guideSlug = entry.regulationsCompliance.importGuideSlug
  const guideArticle = guideSlug ? getPublishedArticle(guideSlug) : undefined
  const importGuide: KnowledgeLink | null = guideArticle ? { label: guideArticle.title, href: `/knowledge/${guideArticle.slug}` } : null

  const companyPages = uniq(
    entry.procurementGuidance.relatedCompanyPages
      .map((slug) => getCompanyPage(slug))
      .filter((x): x is NonNullable<typeof x> => Boolean(x))
      .map((x) => ({ label: x.label, href: `/company/${x.slug}` })),
  )

  const countries = uniq(
    (entry.relatedCountries ?? [])
      .map((slug) => getCountry(slug))
      .filter((x): x is NonNullable<typeof x> => Boolean(x))
      .map((x) => ({ label: x.label, href: `/countries/${x.slug}` })),
  )

  const industries = uniq(
    (entry.relatedIndustries ?? [])
      .map((slug) => getIndustry(slug))
      .filter((x): x is NonNullable<typeof x> => Boolean(x))
      .map((x) => ({ label: x.label, href: `/industries/${x.slug}` })),
  )

  const glossaryTerms = uniq(
    (entry.relatedGlossaryTerms ?? [])
      .map((term) => TARA_GLOSSARY.find((g) => g.term === term))
      .filter((g): g is NonNullable<typeof g> => Boolean(g))
      .map((g) => ({ label: g.term, href: `/glossary#${glossarySlug(g.term)}` })),
  )

  return { styleArchetype, recommendedMaterials, importGuide, companyPages, countries, industries, glossaryTerms }
}
