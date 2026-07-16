/**
 * lib/knowledge/links.ts — automatic internal linking for the content engine.
 *
 * Resolves an article's related-* references to real, on-site URLs (products,
 * countries, industries, sibling articles) + material/construction chips.
 * Server-only (reads the content loader). Broken refs are silently dropped so a
 * typo never renders a dead link.
 */
import { getProductCategory } from '@/lib/products'
import { getCountry, getIndustry } from '@/lib/seo-landing'
import { TARA_MATERIALS, TARA_CONSTRUCTIONS } from '@/lib/tara/knowledge'
import { getKnowledgeArticle, getPublishedArticles } from './content'
import type { KnowledgeArticle, KnowledgeLink } from './types'

export interface ResolvedLinks {
  articles: KnowledgeLink[]
  products: KnowledgeLink[]
  countries: KnowledgeLink[]
  industries: KnowledgeLink[]
  materials: string[]
  constructions: string[]
  extra: KnowledgeLink[]
}

const uniq = (arr: KnowledgeLink[]) => {
  const seen = new Set<string>()
  return arr.filter((l) => (seen.has(l.href) ? false : (seen.add(l.href), true)))
}

export function resolveArticleLinks(a: KnowledgeArticle): ResolvedLinks {
  const articles = (a.relatedArticles ?? [])
    .map((s) => getKnowledgeArticle(s))
    .filter((x): x is KnowledgeArticle => Boolean(x) && x!.status !== 'draft')
    .map((x) => ({ label: x.title, href: `/knowledge/${x.slug}` }))

  const products = (a.relatedProducts ?? [])
    .map((s) => getProductCategory(s))
    .filter((x): x is NonNullable<typeof x> => Boolean(x))
    .map((x) => ({ label: x.name, href: `/products/${x.slug}` }))

  const countries = (a.relatedCountries ?? [])
    .map((s) => getCountry(s))
    .filter((x): x is NonNullable<typeof x> => Boolean(x))
    .map((x) => ({ label: x.label, href: `/countries/${x.slug}` }))

  const industries = (a.relatedIndustries ?? [])
    .map((s) => getIndustry(s))
    .filter((x): x is NonNullable<typeof x> => Boolean(x))
    .map((x) => ({ label: x.label, href: `/industries/${x.slug}` }))

  const materials = (a.relatedMaterials ?? [])
    .map((id) => TARA_MATERIALS.find((m) => m.id === id)?.name)
    .filter((x): x is string => Boolean(x))

  const constructions = (a.relatedConstructions ?? [])
    .map((id) => TARA_CONSTRUCTIONS.find((c) => c.id === id)?.name)
    .filter((x): x is string => Boolean(x))

  return {
    articles: uniq(articles),
    products: uniq(products),
    countries: uniq(countries),
    industries: uniq(industries),
    materials: Array.from(new Set(materials)),
    constructions: Array.from(new Set(constructions)),
    extra: uniq(a.internalLinks ?? []),
  }
}

/**
 * Reverse lookup: which published Knowledge Centre articles reference a given
 * product / industry / country. Closes the loop the other way — knowledge
 * articles link OUT to products/industries/countries (above), but nothing
 * linked back IN, leaving articles reachable only from the /knowledge hub.
 * Used by product and landing pages to surface a small "Related Reading"
 * block, scaling automatically as the Knowledge Centre grows.
 */
export function getKnowledgeArticlesFor(target: { product?: string; industry?: string; country?: string }): KnowledgeLink[] {
  const matches = getPublishedArticles().filter((a) =>
    (target.product && (a.relatedProducts ?? []).includes(target.product)) ||
    (target.industry && (a.relatedIndustries ?? []).includes(target.industry)) ||
    (target.country && (a.relatedCountries ?? []).includes(target.country)),
  )
  return uniq(matches.map((a) => ({ label: a.title, href: `/knowledge/${a.slug}` })))
}
