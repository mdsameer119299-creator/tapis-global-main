/**
 * lib/knowledge/types.ts — reusable schema for the Knowledge Centre.
 *
 * This is the scalable content model every future knowledge page will use. It is
 * intentionally decoupled from routing and rendering so the Knowledge Centre can
 * grow to thousands of articles/FAQs/countries/materials/industries by simply
 * adding data records — no schema or component rewrite. Articles also carry
 * `taraTags`, which link Knowledge Centre content into TARA's retrieval corpus.
 */

export type KnowledgeCategorySlug =
  | 'materials'
  | 'manufacturing'
  | 'carpet-history'
  | 'buying-guides'
  | 'carpet-care'
  | 'commercial-projects'
  | 'country-guides'
  | 'industry-guides'
  | 'glossary'
  | 'faq'
  | 'design-inspiration'
  | 'project-planning'
  | 'export-knowledge'

export interface KnowledgeCategory {
  slug: KnowledgeCategorySlug
  title: string
  description: string
}

export interface KnowledgeSection { h2: string; body: string }
export interface KnowledgeFaq { q: string; a: string }
export interface KnowledgeImage { src: string; alt: string }
export interface KnowledgeLink { label: string; href: string }
/** A short, self-contained term + definition — the kind of extractable block AI answer engines favour. */
export interface KnowledgeDefinition { term: string; definition: string }
/** A generic comparison table any article can use (e.g. "Hand-Tufted vs Hand-Knotted at a Glance"). Rows are plain objects keyed by column name so authors don't need code changes to add one. */
export interface KnowledgeComparisonTable {
  caption: string
  columns: string[]
  rows: Array<Record<string, string>>
}

/**
 * Structured fields specific to a `category: 'commercial-projects'` article
 * (a real, named, permissioned installed-project case study). Optional and
 * additive to KnowledgeArticle — a case study is still a normal article
 * (same body, faq, images, related-links, seo and structured-data pipeline);
 * this block only adds the project-specific facts a case study needs beyond
 * a regular article. Nothing here should ever be filled with an invented
 * client name, project detail or testimonial — see content/knowledge/_templates/.
 */
export interface CaseStudyTestimonial {
  quote: string
  /** e.g. "Procurement Lead, [Client Name]" — only ever a real, permissioned attribution. */
  attribution: string
}

export interface CaseStudyDetails {
  /** 2–4 sentence summary of what was manufactured, for whom (by sector, not necessarily named), and delivered. */
  overview: string
  /** Buyer sector, e.g. "Hospitality", "Government", "Corporate", "Residential Developer". */
  clientSector: string
  /** Country slug — cross-references the matching /countries/[slug] page via relatedCountries. */
  country: string
  /** Product category slug — cross-references the matching /products/[slug] page via relatedProducts. */
  product: string
  /** Material id, if a single primary material defined the project — cross-references /materials/[slug]. */
  material?: string
  /** Construction id — cross-references /constructions/[slug]. */
  construction?: string
  /** Free-text size description (area, room count, piece count) — varies too much per project for a single unit. */
  size: string
  /** Free-text project timeline, e.g. "14 weeks from order to installation". */
  timeline: string
  /** Step-by-step manufacturing narrative specific to this project (not a copy of the generic process pages). */
  manufacturingProcess: string[]
  /** What made this project non-routine — a real constraint, not a generic claim. */
  challenges: string
  /** How the challenge was actually addressed. */
  solution: string
  /** Only included with the client's explicit written permission. Omit entirely rather than paraphrase a quote that wasn't given. */
  testimonial?: CaseStudyTestimonial
}

export interface KnowledgeArticle {
  slug: string
  category: KnowledgeCategorySlug
  title: string
  summary: string
  seo: { title: string; description: string; keywords?: string[] }
  body?: KnowledgeSection[]
  faq?: KnowledgeFaq[]
  images?: KnowledgeImage[]
  /** Present only on category:'commercial-projects' articles that are real case studies. */
  caseStudy?: CaseStudyDetails
  /** Key terms defined up front — human-readable and a clean, quotable chunk for AI answer engines. */
  definitions?: KnowledgeDefinition[]
  /** An optional comparison table, e.g. contrasting two materials/constructions/products discussed in the article. */
  comparisonTable?: KnowledgeComparisonTable
  // Relationships — power internal linking + TARA context.
  relatedArticles?: string[]
  relatedProducts?: string[]
  relatedMaterials?: string[]
  relatedConstructions?: string[]
  relatedCountries?: string[]
  relatedIndustries?: string[]
  internalLinks?: KnowledgeLink[]
  /** Tags that surface this article inside TARA's retrieval. */
  taraTags?: string[]
  status?: 'draft' | 'published'
  updatedAt?: string
}
