/**
 * lib/tara/recommend.ts — capability-safe product recommendation engine.
 *
 * Main's PR #20 gave TARA understanding (typo/synonym normalization, concept
 * expansion) + conversation guidance. This adds the missing "give a confident
 * recommendation" capability on top of it: it consumes the ConversationSignals
 * that conversation-intelligence.ts already computes (so it reuses that NLP
 * rather than duplicating it) and suggests a verified material + construction +
 * product category drawn ONLY from the knowledge data. It positions
 * ("a strong starting point") and never guarantees performance, price, MOQ or
 * delivery — the team confirms specifics.
 */
import { TARA_MATERIALS } from './knowledge/materials'
import { TARA_CONSTRUCTIONS } from './knowledge/constructions'
import { TARA_CATEGORIES } from './knowledge/categories'
import type { ConversationSignals } from './conversation-intelligence'

type Tier = 'Economy' | 'Premium' | 'Luxury'
type SegmentKey = 'hotel' | 'home' | 'office' | 'tender' | 'export'

interface Detected {
  segment?: SegmentKey
  materialId?: string
  constructionId?: string
  tier?: Tier
  priorities: string[] // 'durable' | 'soft' | 'natural'
}

export interface Recommendation {
  material?: { id: string; name: string; positioning: string }
  construction?: { id: string; name: string }
  category?: { name: string; slug: string }
  segment?: SegmentKey
}

// Matched against the already-normalised (typo-corrected) buyer text.
const MATERIAL_MATCH: Array<[RegExp, string]> = [
  [/\b(new zealand wool|nz wool)\b/, 'nz-wool'],
  [/\bwool\b/, 'indian-wool'],
  [/\b(viscose|rayon|art silk|artificial silk)\b/, 'viscose'],
  [/\b(bamboo silk|banana silk|sari silk|silk)\b/, 'bamboo-silk'],
  [/\bjute\b/, 'jute'],
  [/\bsisal\b/, 'sisal'],
  [/\bcotton\b/, 'cotton'],
  [/\bleather\b/, 'leather'],
  [/\b(pet|polyester|polypropylene|nylon|synthetic)\b/, 'pet'],
]
const CONSTRUCTION_MATCH: Array<[RegExp, string]> = [
  [/\b(hand[ -]?knotted|knotted|kpsi)\b/, 'hand-knotted'],
  [/\b(hand[ -]?tufted|tufted|carved|carving)\b/, 'hand-tufted'],
  [/\b(flat[ -]?weave|flatwoven|reversible)\b/, 'flatweave'],
  [/\bkilim\b/, 'kilim'],
  [/\b(dhurrie|durry|durrie)\b/, 'dhurrie'],
  [/\bhandloom\b/, 'handloom'],
  [/\b(shaggy|shag|high pile|plush)\b/, 'shaggy'],
  [/\b(broadloom|wall[ -]?to[ -]?wall|w2w|fitted carpet)\b/, 'machine-made'],
  [/\b(machine[ -]?made|power ?loom)\b/, 'machine-made'],
  [/\boutdoor\b/, 'outdoor'],
]
const CATEGORY_BY_CONSTRUCTION: Record<string, string> = {
  'hand-knotted': 'hand-knotted-carpet', 'hand-tufted': 'hand-tufted-carpet', flatweave: 'flat-weaves',
  kilim: 'kilim-rugs', dhurrie: 'dhurrie-rugs', shaggy: 'shaggy-rugs',
}
const SEGMENT_LABEL: Record<SegmentKey, string> = {
  hotel: 'hotel / hospitality', home: 'residential', office: 'commercial', tender: 'tender / contract', export: 'export / wholesale',
}

const mat = (id: string) => TARA_MATERIALS.find((m) => m.id === id)
const con = (id: string) => TARA_CONSTRUCTIONS.find((c) => c.id === id)
const cat = (slug: string) => TARA_CATEGORIES.find((c) => c.slug === slug)
const isContract = (s?: SegmentKey) => s === 'hotel' || s === 'office' || s === 'tender' || s === 'export'
const firstMatch = (pairs: Array<[RegExp, string]>, text: string) => pairs.find(([re]) => re.test(text))?.[1]

function detect(signals: ConversationSignals): Detected {
  const text = signals.recentUserContext
  const concepts = new Set(signals.concepts)
  const priorities: string[] = []
  if (/\b(durable|durability|heavy traffic|high traffic|hard[ -]?wearing|tough|long[ -]?lasting)\b/.test(text) || concepts.has('traffic') || concepts.has('durability')) priorities.push('durable')
  if (/\b(soft|plush|cozy|cosy|comfortable)\b/.test(text) || concepts.has('soft')) priorities.push('soft')
  if (/\b(natural|eco|eco[ -]?friendly|sustainable|organic)\b/.test(text)) priorities.push('natural')

  let segment: SegmentKey | undefined
  if (concepts.has('hotel') || concepts.has('hospitality') || /\b(hotel|hospitality|resort|lobby|guest ?room|banquet|restaurant)\b/.test(text)) segment = 'hotel'
  else if (concepts.has('tender') || concepts.has('procurement') || /\b(tender|bid|rfq|rfp|procurement|government|gem)\b/.test(text)) segment = 'tender'
  else if (/\b(export|import|wholesale|overseas|distributor|buying house|container)\b/.test(text)) segment = 'export'
  else if (/\b(office|commercial|corporate|retail|showroom|workspace)\b/.test(text)) segment = 'office'
  else if (concepts.has('residential') || /\b(home|house|apartment|villa|residence|bedroom|living room|drawing room)\b/.test(text)) segment = 'home'

  let tier: Tier | undefined
  if (/\b(budget|cheap|cheapest|economical|affordable|low[ -]?cost|inexpensive)\b/.test(text)) tier = 'Economy'
  else if (/\b(luxury|luxurious|premium|high[ -]?end|exclusive|finest|top quality)\b/.test(text)) tier = 'Luxury'

  return { segment, materialId: firstMatch(MATERIAL_MATCH, text), constructionId: firstMatch(CONSTRUCTION_MATCH, text), tier, priorities }
}

function pickMaterialId(d: Detected): string {
  if (d.materialId) {
    if (d.materialId === 'indian-wool' && d.tier === 'Luxury') return 'nz-wool'
    return d.materialId
  }
  if (d.tier === 'Luxury') return 'nz-wool'
  if (d.priorities.includes('natural')) return 'jute'
  if (d.tier === 'Economy') return 'cotton'
  return 'indian-wool' // wool: the versatile, contract-capable all-round default
}

function pickConstructionId(d: Detected): string {
  if (d.constructionId) return d.constructionId
  if (d.segment === 'hotel' || d.segment === 'office') return 'machine-made' // broadloom / wall-to-wall territory
  if (d.priorities.includes('natural')) return 'flatweave'
  if (d.tier === 'Economy') return 'dhurrie'
  if (d.tier === 'Luxury') return 'hand-knotted'
  return 'hand-tufted'
}

function pickCategorySlug(materialId: string, constructionId: string, segment?: SegmentKey): string {
  if (segment === 'hotel' || segment === 'office') return 'wall-to-wall-carpets'
  if (materialId === 'jute' || materialId === 'sisal') return 'jute-sisal-rugs'
  if (materialId === 'leather') return 'leather-carpets'
  return CATEGORY_BY_CONSTRUCTION[constructionId] || 'area-rugs'
}

/** True when there is enough signal to offer a confident suggestion. */
export function hasRecommendation(signals: ConversationSignals): boolean {
  const d = detect(signals)
  return Boolean(d.segment || d.materialId || d.constructionId || d.tier || d.priorities.length)
}

/** Structured recommendation from verified data (used by tests + the route). */
export function recommend(signals: ConversationSignals): Recommendation | null {
  const d = detect(signals)
  if (!(d.segment || d.materialId || d.constructionId || d.tier || d.priorities.length)) return null
  const materialId = pickMaterialId(d)
  const constructionId = pickConstructionId(d)
  const category = cat(pickCategorySlug(materialId, constructionId, d.segment))
  const m = mat(materialId)
  const c = con(constructionId)
  return {
    material: m && { id: m.id, name: m.name, positioning: m.positioning },
    construction: c && { id: c.id, name: c.name },
    category: category && { name: category.name, slug: category.slug },
    segment: d.segment,
  }
}

/**
 * One capability-safe line appended to the conversation guidance, or null when
 * there is not enough to suggest (so greetings/vague messages get nothing).
 */
export function buildRecommendation(signals: ConversationSignals): string | null {
  const r = recommend(signals)
  if (!r || !r.material || !r.construction) return null
  const seg = r.segment ? ` for a ${SEGMENT_LABEL[r.segment]} project` : ''
  const category = r.category ? `, from our ${r.category.name} range` : ''
  return [
    'SUGGESTED RECOMMENDATION (offer warmly as a suggestion, not a hard sell):',
    `${r.material.name} (${r.material.positioning}) in a ${r.construction.name} construction is a strong starting point${seg}${category}.`,
    'Present it in your own words, explain briefly why it suits their need, and invite them to refine colour, size and design.',
  ].join(' ')
}
