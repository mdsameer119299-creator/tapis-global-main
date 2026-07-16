/**
 * lib/materials-content.ts — thin, page-specific metadata layer for the public
 * /materials hub + /materials/[slug] pages.
 *
 * Deliberately does NOT duplicate any factual content. Every fact (description,
 * advantages, disadvantages, typical applications, durability/softness/luxury
 * positioning, maintenance, recommended projects, alternatives) is read live
 * from the existing, already-verified `TARA_MATERIALS` (lib/tara/knowledge/
 * materials.ts) — the same data TARA's chat already uses. This file adds only
 * what's genuinely page-specific and absent from that chat-oriented model:
 * a real hero image (existing repository photography, nothing new/invented),
 * plus SEO title/description/keywords. If TARA's knowledge base is ever
 * updated, both the chat and these public pages update automatically.
 */
import { TARA_MATERIALS } from './tara/knowledge/materials'
import { SEO_BASE_URL } from './seo'

export interface MaterialPageMeta {
  heroImage: string
  seoTitle: string
  seoDescription: string
  seoKeywords: string[]
  blurb: string
}

const META: Record<string, MaterialPageMeta> = {
  'nz-wool': {
    heroImage: '/images/wool-drying-pic.webp',
    seoTitle: 'New Zealand Wool Rugs & Carpets | Material Guide — Tapis Global',
    seoDescription: 'New Zealand wool for handmade rugs and carpets — properties, advantages, care and where it is commonly used. Manufactured in Bhadohi, India by Tapis Global International.',
    seoKeywords: ['New Zealand wool rugs', 'NZ wool carpet', 'wool rug material guide', 'luxury wool carpet India'],
    blurb: 'A premium wool prized for bright colour take-up and a soft, resilient hand-feel.',
  },
  'indian-wool': {
    heroImage: '/images/vibrant-wool-dying.webp',
    seoTitle: 'Indian Wool Rugs & Carpets | Material Guide — Tapis Global',
    seoDescription: 'Indian wool for handmade rugs and carpets — a versatile, warm-feel natural fibre used across constructions. Properties, advantages, care and applications. Manufactured in Bhadohi.',
    seoKeywords: ['Indian wool rugs', 'wool carpet manufacturer India', 'wool rug material guide'],
    blurb: 'A versatile, widely used natural wool that works across almost every construction.',
  },
  'blended-wool': {
    heroImage: '/images/collection-tufted-dyeing.webp',
    seoTitle: 'Blended Wool Rugs & Carpets | Material Guide — Tapis Global',
    seoDescription: 'Blended wool for handmade rugs and carpets — wool combined with other fibres to balance feel and budget. Properties, advantages and applications. Manufactured in Bhadohi.',
    seoKeywords: ['blended wool rugs', 'wool blend carpet', 'wool rug material guide'],
    blurb: 'Wool combined with other fibres to balance appearance, hand-feel and budget.',
  },
  viscose: {
    heroImage: '/images/handtufted/handtufted-photo-05.webp',
    seoTitle: 'Viscose Rugs | Material Guide — Sheen & Softness — Tapis Global',
    seoDescription: 'Viscose for handmade rugs — a silk-like sheen fibre for decorative, lower-traffic interiors. Properties, care and where it works best. Manufactured in Bhadohi, India.',
    seoKeywords: ['viscose rugs', 'viscose carpet material', 'silk-like rug fibre', 'viscose rug care'],
    blurb: 'A silk-like fibre with a high sheen and soft hand-feel, popular for decorative pieces.',
  },
  'bamboo-silk': {
    heroImage: '/images/handtufted/handtufted-star-medallion-palace.webp',
    seoTitle: 'Bamboo Silk Rugs | Material Guide — Luxury Sheen — Tapis Global',
    seoDescription: 'Bamboo silk for handmade rugs — a lustrous, plant-based fibre for luxury decorative pieces. Properties, care and applications. Manufactured in Bhadohi, India.',
    seoKeywords: ['bamboo silk rugs', 'bamboo silk carpet', 'luxury rug material', 'plant based silk rug'],
    blurb: 'A plant-based fibre with an especially lustrous, silk-like surface.',
  },
  'wool-viscose': {
    heroImage: '/images/handtufted/handtufted-botanical-room.webp',
    seoTitle: 'Wool-Viscose Blend Rugs | Material Guide — Tapis Global',
    seoDescription: 'Wool-viscose blend for handmade rugs — a durable wool body with viscose sheen highlights. Properties, care and applications. Manufactured in Bhadohi, India.',
    seoKeywords: ['wool viscose rug', 'wool viscose blend carpet', 'design led rug material'],
    blurb: 'A blend combining a durable wool base with viscose sheen for design depth.',
  },
  cotton: {
    heroImage: '/images/flatweave/flatweave-01.webp',
    seoTitle: 'Cotton Rugs & Dhurries | Material Guide — Tapis Global',
    seoDescription: 'Cotton for handmade flatweaves and dhurries — a soft, colour-friendly natural fibre at an economical tier. Properties, care and applications. Manufactured in Bhadohi, India.',
    seoKeywords: ['cotton rugs', 'cotton dhurrie material', 'cotton flatweave carpet'],
    blurb: 'A soft, colour-friendly natural fibre used mainly in flatweaves and dhurries.',
  },
  jute: {
    heroImage: '/images/jute/jute-bordered-flatlay.webp',
    seoTitle: 'Jute Rugs | Natural Fibre Material Guide — Tapis Global',
    seoDescription: 'Jute for handmade rugs — a natural plant fibre with an organic, textured look for relaxed interiors. Properties, care and applications. Manufactured in Bhadohi, India.',
    seoKeywords: ['jute rugs', 'jute rug material', 'natural fibre rug', 'jute carpet manufacturer India'],
    blurb: 'A natural plant fibre with a warm, organic texture for relaxed, natural-look interiors.',
  },
  sisal: {
    heroImage: '/images/sisal/sisal-herringbone-detail.webp',
    seoTitle: 'Sisal Rugs | Natural Fibre Material Guide — Tapis Global',
    seoDescription: 'Sisal for handmade rugs — a hard-wearing natural plant fibre with a structured, matte surface. Properties, care and applications. Manufactured in Bhadohi, India.',
    seoKeywords: ['sisal rugs', 'sisal rug material', 'natural fibre floor covering', 'sisal carpet manufacturer India'],
    blurb: 'A hard-wearing natural plant fibre with a structured, matte surface.',
  },
  leather: {
    heroImage: '/images/leather/leather-chevron-patchwork-room.webp',
    seoTitle: 'Leather Rugs | Material Guide — Statement Texture — Tapis Global',
    seoDescription: 'Leather for handmade rugs — woven or patchwork leather chosen for texture and statement design. Properties, care and applications. Manufactured in Bhadohi, India.',
    seoKeywords: ['leather rugs', 'patchwork leather carpet', 'statement rug material'],
    blurb: 'Woven or patchwork leather chosen for its distinct texture and bold, statement look.',
  },
  pet: {
    heroImage: '/images/wall-to-wall/w2w-01.webp',
    seoTitle: 'PET (Recycled Polyester) Rugs | Material Guide — Tapis Global',
    seoDescription: 'PET recycled polyester for handmade rugs — a hard-wearing, moisture-tolerant synthetic fibre for indoor-outdoor use. Properties, care and applications. Manufactured in Bhadohi.',
    seoKeywords: ['PET rug material', 'recycled polyester carpet', 'indoor outdoor rug fibre'],
    blurb: 'A hard-wearing, moisture-tolerant synthetic fibre for indoor-outdoor styles.',
  },
  tencel: {
    heroImage: '/images/handtufted/handtufted-photo-10.webp',
    seoTitle: 'Tencel (Lyocell) Rugs | Material Guide — Tapis Global',
    seoDescription: 'Tencel (Lyocell) for handmade rugs — a wood-pulp-based fibre with a soft, subtle sheen for decorative pieces. Properties, care and applications. Manufactured in Bhadohi.',
    seoKeywords: ['tencel rug', 'lyocell carpet material', 'soft sheen rug fibre'],
    blurb: 'A wood-pulp-based fibre with a silky feel and subtle, refined sheen.',
  },
  linen: {
    heroImage: '/images/flatweave/flatweave-03.webp',
    seoTitle: 'Linen Rugs | Natural Fibre Material Guide — Tapis Global',
    seoDescription: 'Linen for handmade rugs — a natural flax fibre with a relaxed, matte character for understated interiors. Properties, care and applications. Manufactured in Bhadohi.',
    seoKeywords: ['linen rug material', 'flax fibre carpet', 'natural look rug'],
    blurb: 'A natural flax fibre with a relaxed, matte character for understated pieces.',
  },
  hemp: {
    heroImage: '/images/sisal/sisal-boucle-weave-macro.webp',
    seoTitle: 'Hemp Rugs | Natural Fibre Material Guide — Tapis Global',
    seoDescription: 'Hemp for handmade rugs — a rugged, hard-wearing natural plant fibre with an organic texture. Properties, care and applications. Manufactured in Bhadohi, India.',
    seoKeywords: ['hemp rug material', 'hemp carpet fibre', 'rustic natural rug'],
    blurb: 'A rugged, hard-wearing natural plant fibre with a coarse, organic texture.',
  },
}

export interface MaterialPageData {
  id: string
  name: string
  positioning: 'Economy' | 'Premium' | 'Luxury'
  meta: MaterialPageMeta
  canonical: string
}

export function getAllMaterialSlugs(): string[] {
  return TARA_MATERIALS.filter((m) => m.profile && META[m.id]).map((m) => m.id)
}

export function getMaterialPage(id: string): MaterialPageData | undefined {
  const m = TARA_MATERIALS.find((x) => x.id === id)
  const meta = META[id]
  if (!m || !m.profile || !meta) return undefined
  return { id: m.id, name: m.name, positioning: m.positioning, meta, canonical: `${SEO_BASE_URL}/materials/${m.id}` }
}

export function getAllMaterialsForHub(): Array<{ id: string; name: string; positioning: string; heroImage: string; blurb: string }> {
  return TARA_MATERIALS.filter((m) => m.profile && META[m.id]).map((m) => ({
    id: m.id, name: m.name, positioning: m.positioning, heroImage: META[m.id].heroImage, blurb: META[m.id].blurb,
  }))
}
