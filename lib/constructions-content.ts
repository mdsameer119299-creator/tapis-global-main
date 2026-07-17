/**
 * lib/constructions-content.ts — thin, page-specific metadata layer for the
 * public /constructions hub + /constructions/[slug] pages.
 *
 * Same principle as lib/materials-content.ts: no fact duplication. Every fact
 * (description, method, suitable materials, best applications, traffic
 * suitability, pile height, maintenance) is read live from the existing,
 * already-verified `TARA_CONSTRUCTIONS` (lib/tara/knowledge/constructions.ts).
 * This file adds only real hero photography and SEO metadata.
 */
import { TARA_CONSTRUCTIONS } from './tara/knowledge/constructions'
import { SEO_BASE_URL } from './seo'

export interface ConstructionPageMeta {
  heroImage: string
  seoTitle: string
  seoDescription: string
  seoKeywords: string[]
  blurb: string
}

const META: Record<string, ConstructionPageMeta> = {
  'hand-knotted': {
    heroImage: '/images/knotted/knotted-01.webp',
    seoTitle: 'Hand-Knotted Rugs | Construction Guide — Tapis Global',
    seoDescription: 'Hand-knotted rug construction explained — method, knot density, suitable materials, traffic suitability and care. Manufactured in Bhadohi, India by Tapis Global International.',
    seoKeywords: ['hand knotted rug construction', 'hand knotted carpet method', 'knot density KPSI', 'hand knotted rug guide'],
    blurb: 'Woven knot-by-knot on a loom; the traditional, premium-tier construction method.',
  },
  'hand-tufted': {
    heroImage: '/images/handtufted/handtufted-photo-01.webp',
    seoTitle: 'Hand-Tufted Rugs | Construction Guide — Tapis Global',
    seoDescription: 'Hand-tufted rug construction explained — method, suitable materials, traffic suitability, pile and care. Manufactured in Bhadohi, India by Tapis Global International.',
    seoKeywords: ['hand tufted rug construction', 'hand tufted carpet method', 'tufting process guide'],
    blurb: 'Tufted to a backing; flexible for custom designs, carving and mixed textures.',
  },
  handloom: {
    heroImage: '/images/flatweave/flatweave-02.webp',
    seoTitle: 'Handloom Rugs | Construction Guide — Tapis Global',
    seoDescription: 'Handloom rug construction explained — method, suitable materials, traffic suitability and care. Manufactured in Bhadohi, India by Tapis Global International.',
    seoKeywords: ['handloom rug construction', 'handloom carpet method', 'loom woven rug guide'],
    blurb: 'Loom-woven for an even, consistent surface with a clean, contemporary look.',
  },
  flatweave: {
    heroImage: '/images/flatweave/flatweave-04.webp',
    seoTitle: 'Flatweave Rugs | Construction Guide — Tapis Global',
    seoDescription: 'Flatweave rug construction explained — method, suitable materials, traffic suitability and care. Manufactured in Bhadohi, India by Tapis Global International.',
    seoKeywords: ['flatweave rug construction', 'flat weave carpet method', 'reversible rug guide'],
    blurb: 'No pile, reversible and lightweight — warp and weft interlace directly.',
  },
  kilim: {
    heroImage: '/images/kilim/kilim-geometric-designer-room.webp',
    seoTitle: 'Kilim Rugs | Construction Guide — Tapis Global',
    seoDescription: 'Kilim rug construction explained — method, suitable materials, traffic suitability and care. Manufactured in Bhadohi, India by Tapis Global International.',
    seoKeywords: ['kilim rug construction', 'kilim weave method', 'geometric flatweave guide'],
    blurb: 'A flatweave tradition known for bold geometric and tribal patterning.',
  },
  dhurrie: {
    heroImage: '/images/flatweave/flatweave-05.webp',
    seoTitle: 'Dhurrie Rugs | Construction Guide — Tapis Global',
    seoDescription: 'Dhurrie rug construction explained — method, suitable materials, traffic suitability and care. Manufactured in Bhadohi, India by Tapis Global International.',
    seoKeywords: ['dhurrie rug construction', 'dhurrie weave method', 'cotton flatweave guide'],
    blurb: 'A handwoven Indian flatweave, commonly in cotton or wool.',
  },
  'machine-made': {
    heroImage: '/images/wall-to-wall/w2w-02.webp',
    seoTitle: 'Machine-Made Carpets | Construction Guide — Tapis Global',
    seoDescription: 'Machine-made carpet construction explained — method, suitable materials, traffic suitability and care. Manufactured in Bhadohi, India by Tapis Global International.',
    seoKeywords: ['machine made carpet construction', 'power loom carpet method', 'broadloom carpet guide'],
    blurb: 'Power-loom woven for consistent output and larger runs — broadloom and wall-to-wall.',
  },
  shaggy: {
    heroImage: '/images/shaggy/shaggy-blue-3d-wave.webp',
    seoTitle: 'Shaggy Rugs | Construction Guide — Tapis Global',
    seoDescription: 'Shaggy rug construction explained — method, suitable materials, traffic suitability and care. Manufactured in Bhadohi, India by Tapis Global International.',
    seoKeywords: ['shaggy rug construction', 'high pile rug method', 'plush rug guide'],
    blurb: 'A long, plush cut pile giving a very soft, tactile surface.',
  },
  outdoor: {
    heroImage: '/images/pebble/pebble-01.webp',
    seoTitle: 'Outdoor Rugs | Construction Guide — Tapis Global',
    seoDescription: 'Outdoor rug construction explained — method, suitable materials, traffic suitability and care. Manufactured in Bhadohi, India by Tapis Global International.',
    seoKeywords: ['outdoor rug construction', 'indoor outdoor carpet method', 'patio rug guide'],
    blurb: 'Outdoor-oriented styles built from moisture-tolerant synthetic fibres.',
  },
}

export interface ConstructionPageData {
  id: string
  name: string
  meta: ConstructionPageMeta
  canonical: string
}

export function getAllConstructionSlugs(): string[] {
  return TARA_CONSTRUCTIONS.filter((c) => c.profile && META[c.id]).map((c) => c.id)
}

export function getConstructionPage(id: string): ConstructionPageData | undefined {
  const c = TARA_CONSTRUCTIONS.find((x) => x.id === id)
  const meta = META[id]
  if (!c || !c.profile || !meta) return undefined
  return { id: c.id, name: c.name, meta, canonical: `${SEO_BASE_URL}/constructions/${c.id}` }
}

export function getAllConstructionsForHub(): Array<{ id: string; name: string; heroImage: string; blurb: string }> {
  return TARA_CONSTRUCTIONS.filter((c) => c.profile && META[c.id]).map((c) => ({
    id: c.id, name: c.name, heroImage: META[c.id].heroImage, blurb: META[c.id].blurb,
  }))
}
