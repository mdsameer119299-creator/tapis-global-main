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

export interface KnowledgeArticle {
  slug: string
  category: KnowledgeCategorySlug
  title: string
  summary: string
  seo: { title: string; description: string; keywords?: string[] }
  body?: KnowledgeSection[]
  faq?: KnowledgeFaq[]
  images?: KnowledgeImage[]
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
