/**
 * lib/knowledge/registry.ts — Knowledge Centre category registry + article store.
 *
 * PHASE 1 = ARCHITECTURE ONLY. The 13 scalable categories are defined; the
 * article store is intentionally empty (no mass content generated yet). Future
 * knowledge simply pushes `KnowledgeArticle` records here (or imports per-category
 * data files), and everything — routing, internal linking, TARA retrieval — reads
 * from this registry. Designed to scale to thousands of articles.
 */
import type { KnowledgeArticle, KnowledgeCategory, KnowledgeCategorySlug } from './types'

export const KNOWLEDGE_CATEGORIES: KnowledgeCategory[] = [
  { slug: 'materials', title: 'Materials & Fibres', description: 'Wool, viscose, bamboo silk, jute, sisal, cotton, leather and more — properties, considerations and applications.' },
  { slug: 'manufacturing', title: 'Manufacturing', description: 'How carpets and rugs are made, step by step, from fibre to finished piece.' },
  { slug: 'carpet-history', title: 'Carpet History', description: 'Origins, Persian and Mughal influence, and the story of Indian and Bhadohi weaving.' },
  { slug: 'buying-guides', title: 'Buying Guides', description: 'How to specify, sample and source custom carpets and rugs for a project.' },
  { slug: 'carpet-care', title: 'Carpet Care', description: 'Cleaning, maintenance and storage guidance by material and construction.' },
  { slug: 'commercial-projects', title: 'Commercial Projects', description: 'Guidance for hospitality, contract and institutional carpet projects.' },
  { slug: 'country-guides', title: 'Country Guides', description: 'Sourcing and export considerations by destination market.' },
  { slug: 'industry-guides', title: 'Industry Guides', description: 'Requirements by sector — hotels, offices, mosques, healthcare and more.' },
  { slug: 'glossary', title: 'Glossary', description: 'Carpet and rug terminology explained.' },
  { slug: 'faq', title: 'FAQ', description: 'Answers to common carpet sourcing and manufacturing questions.' },
  { slug: 'design-inspiration', title: 'Design Inspiration', description: 'Palettes, patterns and styles for custom rug design.' },
  { slug: 'project-planning', title: 'Project Planning', description: 'Timelines, quantities, sizing and the requirement checklist for quotation.' },
  { slug: 'export-knowledge', title: 'Export Knowledge', description: 'Export process, documentation and logistics for international buyers.' },
]

/** Phase-1: empty by design — architecture is in place; content lands later. */
export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = []

export function getKnowledgeCategory(slug: string): KnowledgeCategory | undefined {
  return KNOWLEDGE_CATEGORIES.find((c) => c.slug === slug)
}
export function getKnowledgeArticle(slug: string): KnowledgeArticle | undefined {
  return KNOWLEDGE_ARTICLES.find((a) => a.slug === slug)
}
export function getAllKnowledgeArticleSlugs(): string[] {
  return KNOWLEDGE_ARTICLES.filter((a) => a.status !== 'draft').map((a) => a.slug)
}
export function articlesByCategory(category: KnowledgeCategorySlug): KnowledgeArticle[] {
  return KNOWLEDGE_ARTICLES.filter((a) => a.category === category && a.status !== 'draft')
}
