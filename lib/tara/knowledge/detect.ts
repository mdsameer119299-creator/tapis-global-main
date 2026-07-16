/**
 * lib/tara/knowledge/detect.ts — shared, single-source detection of material and
 * construction ids from (already normalised) buyer text. Central alias tables so
 * the recommendation and comparison engines stay consistent and DRY.
 *
 * Tables are ordered specific → generic. Detection masks claimed spans, so a
 * specific phrase ("new zealand wool") is not also double-counted by a generic
 * token ("wool"). Returns ids ordered by where they appear in the text.
 */

/** [materialId, alias regex] — specific patterns first. */
export const MATERIAL_ALIASES: Array<[string, RegExp]> = [
  ['nz-wool', /\b(new zealand wool|nz wool)\b/],
  ['wool-viscose', /\bwool[ -]?viscose\b/],
  ['blended-wool', /\b(blended wool|wool blend)\b/],
  ['bamboo-silk', /\b(bamboo silk|banana silk|sari silk)\b/],
  ['tencel', /\b(tencel|lyocell)\b/],
  ['viscose', /\b(viscose|rayon|art silk|artificial silk)\b/],
  ['bamboo-silk', /\bsilk\b/],
  ['indian-wool', /\bwool\b/],
  ['jute', /\bjute\b/],
  ['sisal', /\bsisal\b/],
  ['cotton', /\bcotton\b/],
  ['leather', /\bleather\b/],
  ['linen', /\blinen\b/],
  ['hemp', /\bhemp\b/],
  ['pet', /\b(pet|recycled polyester|polyester|polypropylene|nylon|synthetic)\b/],
]

/** [constructionId, alias regex] — specific patterns first. */
export const CONSTRUCTION_ALIASES: Array<[string, RegExp]> = [
  ['hand-knotted', /\b(hand[ -]?knotted|knotted|kpsi)\b/],
  ['hand-tufted', /\b(hand[ -]?tufted|tufted|carved|carving)\b/],
  ['flatweave', /\b(flat[ -]?weave|flatwoven|reversible)\b/],
  ['kilim', /\bkilim\b/],
  ['dhurrie', /\b(dhurrie|durry|durrie)\b/],
  ['handloom', /\bhandloom\b/],
  ['shaggy', /\b(shaggy|shag|high pile|plush)\b/],
  ['machine-made', /\b(broadloom|wall[ -]?to[ -]?wall|w2w|fitted carpet|machine[ -]?made|power ?loom)\b/],
  ['outdoor', /\boutdoor\b/],
]

function detect(text: string, table: Array<[string, RegExp]>): string[] {
  const claimed: Array<[number, number]> = []
  const found: Array<{ id: string; index: number }> = []
  for (const [id, re] of table) {
    const m = re.exec(text)
    if (!m) continue
    const start = m.index
    const end = start + m[0].length
    if (claimed.some(([s, e]) => start < e && end > s)) continue // overlaps a more specific claim
    claimed.push([start, end])
    if (!found.some((f) => f.id === id)) found.push({ id, index: start })
  }
  return found.sort((a, b) => a.index - b.index).map((f) => f.id)
}

/** Material ids present in the text, ordered by appearance (unique). */
export function detectMaterialIds(text: string): string[] {
  return detect(text, MATERIAL_ALIASES)
}
/** Construction ids present in the text, ordered by appearance (unique). */
export function detectConstructionIds(text: string): string[] {
  return detect(text, CONSTRUCTION_ALIASES)
}
export function firstMaterialId(text: string): string | undefined {
  return detectMaterialIds(text)[0]
}
export function firstConstructionId(text: string): string | undefined {
  return detectConstructionIds(text)[0]
}
