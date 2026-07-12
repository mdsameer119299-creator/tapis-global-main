/**
 * Retrieval module — deterministic keyword/tag search across ALL knowledge
 * modules (no vector DB needed for now). Adding a knowledge file automatically
 * grows the corpus via the registry in index.ts. Returns the top verified
 * snippets for the AI's context — TARA never answers from unrestricted model
 * knowledge.
 */
import { TARA_CATEGORIES } from './categories'
import { TARA_MATERIALS } from './materials'
import { TARA_CONSTRUCTIONS } from './constructions'
import { COMPANY_MODULE } from './company'
import { BHADOHI_MODULE } from './bhadohi'
import { HISTORY_MODULE } from './history'
import { QUALITY_MODULE } from './quality'
import { TARA_MANUFACTURING_STEPS } from './manufacturing'
import { TARA_GLOSSARY } from './glossary'
import { TARA_FAQS } from './faq'
import { TARA_CARE } from './care'

export interface KnowledgeDoc { id: string; title: string; text: string; tags: string[] }

/** The searchable corpus, composed from every module. */
export const KNOWLEDGE_CORPUS: KnowledgeDoc[] = [
  ...TARA_CATEGORIES.map((c) => ({ id: `cat:${c.slug}`, title: c.name, text: `${c.name}. ${c.blurb}`, tags: c.tags ?? [] })),
  ...TARA_MATERIALS.map((m) => ({ id: `mat:${m.id}`, title: m.name, text: `${m.name} (${m.positioning}). ${m.notes} ${m.applications} ${(m.properties ?? []).join(', ')} ${m.maintenance ?? ''} ${m.priceFactors ?? ''}`, tags: m.tags ?? [] })),
  ...TARA_CONSTRUCTIONS.map((c) => ({ id: `con:${c.id}`, title: c.name, text: `${c.name}. ${c.notes} ${c.detail ?? ''}`, tags: c.tags ?? [] })),
  ...COMPANY_MODULE.map((f) => ({ id: f.id, title: f.title, text: f.body, tags: f.tags ?? [] })),
  ...BHADOHI_MODULE.map((f) => ({ id: f.id, title: f.title, text: f.body, tags: f.tags ?? [] })),
  ...HISTORY_MODULE.map((f) => ({ id: f.id, title: f.title, text: f.body, tags: f.tags ?? [] })),
  ...QUALITY_MODULE.map((f) => ({ id: f.id, title: f.title, text: f.body, tags: f.tags ?? [] })),
  { id: 'mfg', title: 'Manufacturing process', text: TARA_MANUFACTURING_STEPS.map((s) => `${s.name}: ${s.detail}`).join(' '), tags: ['manufacturing', 'process', 'production', 'weaving', 'dyeing', 'finishing'] },
  ...TARA_GLOSSARY.map((g) => ({ id: `gloss:${g.term}`, title: g.term, text: `${g.term}: ${g.definition}`, tags: ['glossary', g.term.toLowerCase()] })),
  ...TARA_FAQS.map((f, i) => ({ id: `faq:${i}`, title: f.q, text: `${f.q} ${f.a}`, tags: ['faq'] })),
  ...TARA_CARE.map((c) => ({ id: `care:${c.subject}`, title: `Care — ${c.subject}`, text: `${c.subject} care: ${c.tip}`, tags: ['care', 'maintenance', c.subject.toLowerCase()] })),
]

const STOP = new Set('a an the and or of to for in on with we our you your is are be as at by from that this it can do does what how which where when about me my i'.split(' '))
function tokens(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w))
}

/** Rank corpus docs against a query by token + tag overlap. */
export function searchKnowledge(query: string, limit = 6): KnowledgeDoc[] {
  const qt = tokens(query)
  if (qt.length === 0) return []
  const scored = KNOWLEDGE_CORPUS.map((d) => {
    const hay = (d.text + ' ' + d.tags.join(' ') + ' ' + d.title).toLowerCase()
    let score = 0
    for (const t of qt) {
      if (d.tags.some((tag) => tag.includes(t))) score += 3
      else if (hay.includes(t)) score += 1
    }
    return { d, score }
  }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map((x) => x.d)
}

/** Backward-compatible: returns a joined string of the top verified snippets. */
export function retrieveContext(query: string): string {
  return searchKnowledge(query, 6).map((d) => d.text).join('\n')
}
