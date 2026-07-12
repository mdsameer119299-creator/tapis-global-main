/**
 * lib/tara/knowledge.ts — backward-compatible entry point.
 *
 * The knowledge base is now MODULAR under ./knowledge/*. This file only
 * re-exports the composed API so existing imports (`@/lib/tara/knowledge`)
 * keep working. See ./knowledge/index.ts and docs/TARA-ARCHITECTURE.md.
 */
export * from './knowledge/index'
