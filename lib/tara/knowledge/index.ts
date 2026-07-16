/**
 * lib/tara/knowledge/index.ts — barrel for the modular TARA knowledge system.
 *
 * TARA is powered by these composable modules, not one huge prompt. To expand
 * TARA's knowledge, add/extend a module file and (if it should be searchable)
 * include it in retrieval.ts's KNOWLEDGE_CORPUS — no prompt rewrite required.
 * This scales to many materials, constructions, facts, glossary terms and FAQs.
 */

export * from './types'
export * from './categories'
export * from './materials'
export * from './constructions'
export * from './company'
export * from './bhadohi'
export * from './history'
export * from './manufacturing'
export * from './quality'
export * from './care'
export * from './glossary'
export * from './faq'
export * from './segments'
export * from './installation'
export * from './applications'
export * from './commercial-safety'
export * from './personality'
export * from './prompt'
export * from './retrieval'

/** Registry of knowledge modules (for docs/introspection & future UI). */
export const TARA_KNOWLEDGE_MODULES = [
  'company', 'bhadohi', 'history', 'categories', 'materials', 'constructions',
  'manufacturing', 'quality', 'care', 'glossary', 'faq', 'segments', 'installation', 'applications', 'commercial-safety', 'personality',
] as const
