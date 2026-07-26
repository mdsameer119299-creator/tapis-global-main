/**
 * lib/reference-links.ts — internal-linking logic for the /materials and
 * /constructions authority hub. Turns the verified relationship fields already
 * present in TARA's knowledge (alternatives, suitableMaterials, recommendedProjects)
 * into real on-site links, and connects to the EXISTING comparison guides
 * rather than creating competing pages for the same query intent.
 */
import { TARA_MATERIALS } from './tara/knowledge/materials'
import { TARA_CONSTRUCTIONS } from './tara/knowledge/constructions'
import { getIndustry, getSolution } from './seo-landing'
import { COUNTRIES } from './countries'
import { PRODUCT_CATEGORIES } from './products'
import { TARA_GLOSSARY } from './tara/knowledge/glossary'
import type { Rating } from './tara/knowledge/types'
import type { KnowledgeLink } from './knowledge/types'

const glossarySlug = (term: string) => term.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

// Material/construction id pair -> the existing comparison guide that already
// covers that exact query intent. Linking here (instead of building a new
// "X vs Y" page) reinforces the guide's authority rather than competing with it.
const MATERIAL_GUIDE_PAIRS: Record<string, string> = {
  'indian-wool|viscose': 'wool-vs-viscose-carpets', 'viscose|indian-wool': 'wool-vs-viscose-carpets',
  'nz-wool|viscose': 'wool-vs-viscose-carpets', 'viscose|nz-wool': 'wool-vs-viscose-carpets',
  'jute|sisal': 'jute-vs-sisal-rugs', 'sisal|jute': 'jute-vs-sisal-rugs',
}
// Materials with a direct (non-paired) relevant comparison guide — needed
// because the *specific* alternatives listed per material (e.g. indian-wool's
// alternatives are other wools, not viscose) don't always include the exact
// counterpart a guide compares against, even though the guide is still the
// right read for that material's page.
const MATERIAL_DIRECT_GUIDES: Record<string, string> = {
  'indian-wool': 'wool-vs-viscose-carpets', 'nz-wool': 'wool-vs-viscose-carpets', 'blended-wool': 'wool-vs-viscose-carpets', 'wool-viscose': 'wool-vs-viscose-carpets',
  viscose: 'wool-vs-viscose-carpets',
  jute: 'jute-vs-sisal-rugs', sisal: 'jute-vs-sisal-rugs',
}
const CONSTRUCTION_GUIDE_PAIRS: Record<string, string> = {
  'hand-tufted|hand-knotted': 'hand-tufted-vs-hand-knotted-carpet', 'hand-knotted|hand-tufted': 'hand-tufted-vs-hand-knotted-carpet',
  'kilim|dhurrie': 'kilim-vs-dhurrie', 'dhurrie|kilim': 'kilim-vs-dhurrie',
}
// Constructions with a direct (non-paired) relevant comparison guide.
const CONSTRUCTION_DIRECT_GUIDES: Record<string, string[]> = {
  'machine-made': ['handmade-vs-machine-made-carpets', 'area-rugs-vs-wall-to-wall-carpets'],
}

// recommendedProjects tag -> relevant existing industries/solutions slugs.
// Deliberately conservative — only mapped where a genuine, existing match exists.
const PROJECT_TO_INDUSTRY: Record<string, string[]> = {
  hospitality: ['hotel-carpets'], residential: ['villa-carpets'], commercial: ['office-carpets'],
}
const PROJECT_TO_SOLUTION: Record<string, string[]> = {
  premium: ['luxury-carpets'], hospitality: ['commercial-carpet-manufacturer'], commercial: ['commercial-carpet-manufacturer'],
  decorative: ['designer-rugs'], budget: ['wholesale-carpet-supplier'],
}

const uniq = (arr: KnowledgeLink[]) => {
  const seen = new Set<string>()
  return arr.filter((l) => (seen.has(l.href) ? false : (seen.add(l.href), true)))
}

/** Alternative material pages, plus a comparison guide link when one genuinely applies. */
export function getMaterialAlternativeLinks(materialId: string, alternatives: string[]): { materials: KnowledgeLink[]; guide: KnowledgeLink | null } {
  const materials = alternatives
    .map((id) => TARA_MATERIALS.find((m) => m.id === id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m))
    .map((m) => ({ label: m.name, href: `/materials/${m.id}` }))
  const guideSlug = alternatives.map((altId) => MATERIAL_GUIDE_PAIRS[`${materialId}|${altId}`]).find(Boolean) ?? MATERIAL_DIRECT_GUIDES[materialId]
  return { materials: uniq(materials), guide: guideSlug ? { label: 'Read the full comparison guide', href: `/guides/${guideSlug}` } : null }
}

/** Suitable-material links for a construction page, plus reciprocal construction links for a material. */
export function getSuitableMaterialLinks(materialIds: string[]): KnowledgeLink[] {
  return uniq(
    materialIds
      .map((id) => TARA_MATERIALS.find((m) => m.id === id))
      .filter((m): m is NonNullable<typeof m> => Boolean(m))
      .map((m) => ({ label: m.name, href: `/materials/${m.id}` })),
  )
}

/** Which construction pages use a given material (reverse of suitableMaterials). */
export function getConstructionsUsingMaterial(materialId: string): KnowledgeLink[] {
  return uniq(
    TARA_CONSTRUCTIONS
      .filter((c) => c.profile?.suitableMaterials.includes(materialId))
      .map((c) => ({ label: c.name, href: `/constructions/${c.id}` })),
  )
}

/** Comparison guide(s) directly relevant to a construction (not requiring a specific pair). */
export function getConstructionGuideLinks(constructionId: string, otherConstructionIds: string[]): KnowledgeLink[] {
  const paired = otherConstructionIds
    .map((id) => CONSTRUCTION_GUIDE_PAIRS[`${constructionId}|${id}`])
    .filter((s): s is string => Boolean(s))
  const direct = CONSTRUCTION_DIRECT_GUIDES[constructionId] ?? []
  const slugs = Array.from(new Set([...paired, ...direct]))
  return slugs.map((slug) => ({ label: 'Read the full comparison guide', href: `/guides/${slug}` }))
}

/** recommendedProjects tags -> real industry/solution links. */
export function getProjectLinks(recommendedProjects: string[]): { industries: KnowledgeLink[]; solutions: KnowledgeLink[] } {
  const industrySlugs = Array.from(new Set(recommendedProjects.flatMap((p) => PROJECT_TO_INDUSTRY[p] ?? [])))
  const solutionSlugs = Array.from(new Set(recommendedProjects.flatMap((p) => PROJECT_TO_SOLUTION[p] ?? [])))
  const industries = industrySlugs.map((s) => getIndustry(s)).filter((x): x is NonNullable<typeof x> => Boolean(x)).map((x) => ({ label: x.label, href: `/industries/${x.slug}` }))
  const solutions = solutionSlugs.map((s) => getSolution(s)).filter((x): x is NonNullable<typeof x> => Boolean(x)).map((x) => ({ label: x.label, href: `/solutions/${x.slug}` }))
  return { industries: uniq(industries), solutions: uniq(solutions) }
}

// Product slug -> its natural, 1:1 construction/material match. Deliberately
// conservative — only mapped where a genuine, unambiguous correspondence
// exists (e.g. /products/hand-tufted-carpet IS the hand-tufted construction).
// Products without an unambiguous match (pebble-carpet, poufs, coco-coir,
// area-rugs) are intentionally left unmapped rather than forcing a thin link.
const PRODUCT_TO_CONSTRUCTION: Record<string, string> = {
  'hand-tufted-carpet': 'hand-tufted', 'hand-knotted-carpet': 'hand-knotted', 'shaggy-rugs': 'shaggy',
  'wall-to-wall-carpets': 'machine-made', 'carpet-tiles': 'machine-made', 'flat-weaves': 'flatweave',
  'kilim-rugs': 'kilim', 'dhurrie-rugs': 'dhurrie', 'tat-patti': 'dhurrie',
}
const PRODUCT_TO_MATERIALS: Record<string, string[]> = {
  'jute-sisal-rugs': ['jute', 'sisal'], 'leather-carpets': ['leather'], 'dhurrie-rugs': ['cotton'], 'tat-patti': ['cotton', 'jute'],
}

/** Materials/construction guide links for a product category page, where a genuine 1:1 match exists. */
export function getReferenceLinksForProduct(productSlug: string): { construction: KnowledgeLink | null; materials: KnowledgeLink[] } {
  const constructionId = PRODUCT_TO_CONSTRUCTION[productSlug]
  const construction = constructionId && TARA_CONSTRUCTIONS.find((c) => c.id === constructionId)
    ? { label: `${TARA_CONSTRUCTIONS.find((c) => c.id === constructionId)!.name} Construction Guide`, href: `/constructions/${constructionId}` }
    : null
  const materials = (PRODUCT_TO_MATERIALS[productSlug] ?? [])
    .map((id) => TARA_MATERIALS.find((m) => m.id === id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m))
    .map((m) => ({ label: `${m.name} Material Guide`, href: `/materials/${m.id}` }))
  return { construction, materials: uniq(materials) }
}

/**
 * Which product category pages a material is genuinely relevant to — the
 * reverse of PRODUCT_TO_MATERIALS, plus the construction chain (a product's
 * mapped construction's suitableMaterials). Both sources are real, existing
 * relationship data already authored elsewhere in the codebase; nothing here
 * invents a new correspondence.
 */
export function getProductsUsingMaterial(materialId: string): KnowledgeLink[] {
  const direct = Object.entries(PRODUCT_TO_MATERIALS)
    .filter(([, materials]) => materials.includes(materialId))
    .map(([productSlug]) => productSlug)
  const viaConstruction = Object.entries(PRODUCT_TO_CONSTRUCTION)
    .filter(([, constructionId]) => TARA_CONSTRUCTIONS.find((c) => c.id === constructionId)?.profile?.suitableMaterials.includes(materialId))
    .map(([productSlug]) => productSlug)
  const slugs = Array.from(new Set([...direct, ...viaConstruction]))
  const products = slugs
    .map((slug) => PRODUCT_CATEGORIES.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => ({ label: p.name, href: `/products/${p.slug}` }))
  return uniq(products)
}

/**
 * Export markets that explicitly recommend a material — read from each
 * country page's own materialRecommendations field (authored in lib/countries.ts
 * for the Phase-1 depth batch). Countries without that field yet are simply
 * absent here rather than guessed.
 */
export function getCountriesRecommendingMaterial(materialId: string): KnowledgeLink[] {
  const countries = COUNTRIES
    .filter((c) => c.materialRecommendations?.includes(materialId))
    .map((c) => ({ label: c.label, href: `/countries/${c.slug}` }))
  return uniq(countries)
}

// Material id -> glossary terms genuinely relevant to how that fibre is used
// (e.g. flatweave fibres link to the Flatweave definition). Conservative and
// hand-verified against each material's own typicalApplications wording,
// not a keyword match — avoids linking, say, "leather" to "knot density".
const MATERIAL_TO_GLOSSARY_TERMS: Record<string, string[]> = {
  cotton: ['Flatweave'], jute: ['Flatweave'], sisal: ['Flatweave'], hemp: ['Flatweave'], linen: ['Flatweave'],
  'nz-wool': ['Pile', 'Cut pile'], 'indian-wool': ['Pile', 'Cut pile'], 'blended-wool': ['Pile'],
  viscose: ['Cut pile'], 'bamboo-silk': ['Cut pile'], 'wool-viscose': ['Cut pile'], tencel: ['Cut pile'],
  pet: ['Backing', 'Latex'],
}

/** Glossary definitions genuinely relevant to a material, linking to the live /glossary anchors. */
export function getGlossaryLinksForMaterial(materialId: string): KnowledgeLink[] {
  const terms = MATERIAL_TO_GLOSSARY_TERMS[materialId] ?? []
  const links = terms
    .map((term) => TARA_GLOSSARY.find((g) => g.term === term))
    .filter((g): g is NonNullable<typeof g> => Boolean(g))
    .map((g) => ({ label: g.term, href: `/glossary#${glossarySlug(g.term)}` }))
  return uniq(links)
}

/**
 * A same-tier or same-fibre-type comparison table's row data for a material
 * against its own listed alternatives — real numeric ratings already in each
 * material's profile, no new claims introduced.
 */
export function getMaterialComparisonRows(materialId: string, alternativeIds: string[]): Array<{
  id: string; name: string; href: string; durability: Rating; softness: Rating; luxuryLevel: Rating; isCurrent: boolean
}> {
  const ids = Array.from(new Set([materialId, ...alternativeIds]))
  return ids
    .map((id) => TARA_MATERIALS.find((m) => m.id === id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m && m.profile))
    .map((m) => ({
      id: m.id, name: m.name, href: `/materials/${m.id}`, isCurrent: m.id === materialId,
      durability: m.profile!.durability, softness: m.profile!.softness, luxuryLevel: m.profile!.luxuryLevel,
    }))
}
