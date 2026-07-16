/**
 * lib/tara/recommend.ts — capability-safe product recommendation engine.
 *
 * Consumes the ConversationSignals that conversation-intelligence.ts already
 * computes (reusing that NLP rather than duplicating it) and recommends a
 * verified material + construction + product category drawn ONLY from the
 * knowledge data. It weighs project type, budget, room, foot traffic, material
 * preference and customer priorities. It positions ("a strong starting point")
 * and never guarantees performance, price, MOQ or delivery — the team confirms.
 *
 * Material/construction detection is shared with the comparison engine via
 * knowledge/detect.ts; the ranking here reads the structured `profile` fields.
 */
import { TARA_MATERIALS } from './knowledge/materials'
import { TARA_CONSTRUCTIONS } from './knowledge/constructions'
import { TARA_CATEGORIES } from './knowledge/categories'
import { firstMaterialId, firstConstructionId } from './knowledge/detect'
import type { ConversationSignals } from './conversation-intelligence'

type Tier = 'Economy' | 'Premium' | 'Luxury'
type SegmentKey = 'hotel' | 'home' | 'office' | 'tender' | 'export'

interface Detected {
  segment?: SegmentKey
  materialId?: string
  constructionId?: string
  tier?: Tier
  room?: string
  traffic?: 'low' | 'high'
  priorities: string[] // 'durable' | 'soft' | 'natural'
}

export interface Recommendation {
  material?: { id: string; name: string; positioning: string }
  construction?: { id: string; name: string }
  category?: { name: string; slug: string }
  segment?: SegmentKey
  /** Alternative material ids worth considering (from the chosen material's profile). */
  alternatives?: string[]
}

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

  let room: string | undefined
  if (/\b(stair|staircase|hallway|corridor|landing|entrance|foyer)\b/.test(text)) room = 'stairs'
  else if (/\b(bedroom|master bedroom)\b/.test(text)) room = 'bedroom'
  else if (/\b(living room|lounge|drawing room|sitting room|family room)\b/.test(text)) room = 'living'
  else if (/\bdining\b/.test(text)) room = 'dining'
  else if (/\b(bathroom|washroom)\b/.test(text)) room = 'bathroom'
  else if (/\b(outdoor|patio|terrace|balcony|garden)\b/.test(text)) room = 'outdoor'
  else if (/\b(kids|children|nursery|playroom)\b/.test(text)) room = 'kids'

  let tier: Tier | undefined
  if (/\b(budget|cheap|cheapest|economical|affordable|low[ -]?cost|inexpensive)\b/.test(text)) tier = 'Economy'
  else if (/\b(luxury|luxurious|premium|high[ -]?end|exclusive|finest|top quality)\b/.test(text)) tier = 'Luxury'

  let traffic: 'low' | 'high' | undefined
  if (priorities.includes('durable') || room === 'stairs' || isContract(segment)) traffic = 'high'
  else if (room === 'bedroom') traffic = 'low'

  return { segment, materialId: firstMaterialId(text), constructionId: firstConstructionId(text), tier, room, traffic, priorities }
}

function pickMaterialId(d: Detected): string {
  if (d.room === 'outdoor') return 'pet'
  if (d.materialId) {
    if (d.materialId === 'indian-wool' && d.tier === 'Luxury') return 'nz-wool'
    return d.materialId
  }
  if (d.tier === 'Luxury') return 'nz-wool'
  if (d.priorities.includes('natural')) return d.traffic === 'high' ? 'sisal' : 'jute'
  if (d.tier === 'Economy') return 'cotton'
  return 'indian-wool' // wool: the versatile, contract-capable all-round default
}

function pickConstructionId(d: Detected): string {
  if (d.constructionId) return d.constructionId
  if (d.room === 'outdoor') return 'outdoor'
  if (d.segment === 'hotel' || d.segment === 'office') return 'machine-made' // broadloom / wall-to-wall territory
  if (d.room === 'bedroom' && d.priorities.includes('soft')) return 'shaggy'
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
  return Boolean(d.segment || d.materialId || d.constructionId || d.tier || d.room || d.priorities.length)
}

/** Structured recommendation from verified data (used by tests + the route). */
export function recommend(signals: ConversationSignals): Recommendation | null {
  const d = detect(signals)
  if (!(d.segment || d.materialId || d.constructionId || d.tier || d.room || d.priorities.length)) return null
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
    alternatives: m?.profile?.alternatives,
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
  const altId = r.alternatives?.find((id) => id !== r.material?.id)
  const alt = altId && mat(altId) ? ` If they prefer an alternative, ${mat(altId)!.name} is also worth considering.` : ''
  return [
    'SUGGESTED RECOMMENDATION (offer warmly as a suggestion, not a hard sell):',
    `${r.material.name} (${r.material.positioning}) in a ${r.construction.name} construction is a strong starting point${seg}${category}.${alt}`,
    'Present it in your own words, explain briefly why it suits their need, and invite them to refine colour, size and design.',
  ].join(' ')
}
