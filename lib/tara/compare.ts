/**
 * lib/tara/compare.ts — capability-safe product comparison engine.
 *
 * Detects when a buyer is comparing two materials (e.g. wool vs viscose, bamboo
 * silk vs viscose) or two constructions (hand-tufted vs hand-knotted, kilim vs
 * dhurrie) and builds a natural, structured comparison ENTIRELY from the
 * verified `profile` data — nothing is hardcoded into the prompt. The result is
 * injected as guidance so TARA explains it in her own words, and is also usable
 * as a deterministic reply when no AI key is configured.
 */
import { TARA_MATERIALS } from './knowledge/materials'
import { TARA_CONSTRUCTIONS } from './knowledge/constructions'
import { detectMaterialIds, detectConstructionIds } from './knowledge/detect'
import { DURABILITY_WORDS as DUR, SOFTNESS_WORDS as SOFT, LUXURY_WORDS as LUX } from './knowledge/types'
import type { ConversationSignals } from './conversation-intelligence'

const COMPARE_CUE = /\b(vs|versus|compare|comparison|difference|differ|different|better|or)\b/
const TRAFFIC_RANK: Record<string, number> = { low: 1, moderate: 2, high: 3, 'very-high': 4 }

const mat = (id: string) => TARA_MATERIALS.find((m) => m.id === id)
const con = (id: string) => TARA_CONSTRUCTIONS.find((c) => c.id === id)

export interface Comparison { kind: 'material' | 'construction'; a: string; b: string; text: string }

function compareMaterials(aId: string, bId: string): Comparison | null {
  const A = mat(aId)
  const B = mat(bId)
  if (!A?.profile || !B?.profile) return null
  const pa = A.profile
  const pb = B.profile
  const line = (name: string, positioning: string, p: typeof pa) =>
    `${name}: ${p.description} (${LUX[p.luxuryLevel]} luxury, ${SOFT[p.softness]} underfoot, ${DUR[p.durability]} durability; ${positioning} tier)`
  const harder = pa.durability >= pb.durability ? A : B
  const softer = pa.softness >= pb.softness ? A : B
  const verdict = harder.id === softer.id
    ? `${harder.name} leads on both durability and feel here, while ${(harder.id === A.id ? B : A).name} suits a more specific, decorative look.`
    : `For durability and higher-traffic use, ${harder.name} is the safer pick; for softness and sheen, ${softer.name} stands out.`
  const text = `${A.name} vs ${B.name}. ${line(A.name, A.positioning, pa)}. ${line(B.name, B.positioning, pb)}. ${verdict} The TAPIS GLOBAL team can confirm the best fit for your project.`
  return { kind: 'material', a: aId, b: bId, text }
}

function compareConstructions(aId: string, bId: string): Comparison | null {
  const A = con(aId)
  const B = con(bId)
  if (!A?.profile || !B?.profile) return null
  const pa = A.profile
  const pb = B.profile
  const line = (name: string, p: typeof pa) =>
    `${name}: ${p.description} Made by ${p.method} (traffic suitability: ${p.trafficSuitability}; pile: ${p.pileHeight.toLowerCase()})`
  const heavier = TRAFFIC_RANK[pa.trafficSuitability] >= TRAFFIC_RANK[pb.trafficSuitability] ? A : B
  const lighter = heavier.id === A.id ? B : A
  const verdict = TRAFFIC_RANK[pa.trafficSuitability] === TRAFFIC_RANK[pb.trafficSuitability]
    ? `Both handle similar traffic, so choose on look — ${A.name} for ${pa.bestApplications[0].toLowerCase()}, ${B.name} for ${pb.bestApplications[0].toLowerCase()}.`
    : `For heavier traffic, ${heavier.name} copes better; ${lighter.name} is often chosen for ${lighter.profile!.bestApplications[0].toLowerCase()}.`
  const text = `${A.name} vs ${B.name}. ${line(A.name, pa)}. ${line(B.name, pb)}. ${verdict} The TAPIS GLOBAL team can confirm the best fit for your project.`
  return { kind: 'construction', a: aId, b: bId, text }
}

/** Detect a two-way material or construction comparison, or null. */
export function detectComparison(signals: ConversationSignals): Comparison | null {
  const text = signals.recentUserContext
  if (!COMPARE_CUE.test(text)) return null
  const mats = detectMaterialIds(text)
  if (mats.length >= 2) return compareMaterials(mats[0], mats[1])
  const cons = detectConstructionIds(text)
  if (cons.length >= 2) return compareConstructions(cons[0], cons[1])
  return null
}

/** The natural comparison text for the route guidance / fallback, or null. */
export function buildComparison(signals: ConversationSignals): string | null {
  return detectComparison(signals)?.text ?? null
}
