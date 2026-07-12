/** Product categories — real slugs + real repository images (link to product pages). */
import type { TaraCategory } from './types'

export const TARA_CATEGORIES: TaraCategory[] = [
  { slug: 'hand-knotted-carpet', name: 'Hand-Knotted Rugs', image: '/images/knotted/knotted-02.webp', blurb: 'Traditional knot-by-knot rugs for premium and heritage projects.', tags: ['hand knotted', 'premium', 'wool', 'silk'] },
  { slug: 'hand-tufted-carpet', name: 'Hand-Tufted Rugs', image: '/images/handtufted/handtufted-floral-carved-room.webp', blurb: 'Design-flexible tufted rugs and carved textures, made to your artwork.', tags: ['hand tufted', 'custom design', 'carving'] },
  { slug: 'wall-to-wall-carpets', name: 'Hotel & Wall-to-Wall Carpets', image: '/images/wall-to-wall/w2w-03.webp', blurb: 'Broadloom and wall-to-wall carpet, commonly specified for hospitality and commercial interiors.', tags: ['hotel', 'hospitality', 'broadloom', 'commercial'] },
  { slug: 'flat-weaves', name: 'Flatweave Rugs', image: '/images/flatweave/flatweave-06.webp', blurb: 'Reversible, low-pile flatweaves in wool and natural fibres.', tags: ['flatweave', 'wool', 'natural fibre'] },
  { slug: 'dhurrie-rugs', name: 'Dhurries', image: '/images/rug3.webp', blurb: 'Handwoven cotton or wool dhurries, commonly used in residential and institutional interiors.', tags: ['dhurrie', 'cotton', 'institutional'] },
  { slug: 'kilim-rugs', name: 'Kilims', image: '/images/kilim/kilim-tribal-diamond-room.webp', blurb: 'Flatwoven kilims with geometric and tribal motifs.', tags: ['kilim', 'geometric', 'flatweave'] },
  { slug: 'jute-sisal-rugs', name: 'Jute & Sisal Rugs', image: '/images/jute/jute-bordered-flatlay.webp', blurb: 'Natural-fibre rugs with a relaxed, organic look.', tags: ['jute', 'sisal', 'natural fibre'] },
  { slug: 'leather-carpets', name: 'Leather Rugs', image: '/images/leather/leather-chevron-patchwork-room.webp', blurb: 'Patchwork and woven leather rugs for statement spaces.', tags: ['leather', 'statement'] },
  { slug: 'shaggy-rugs', name: 'Shaggy Rugs', image: '/images/shaggy/shaggy-blue-3d-wave.webp', blurb: 'High-pile, tactile rugs for residential interiors.', tags: ['shaggy', 'high pile', 'residential'] },
  { slug: 'area-rugs', name: 'Custom Area Rugs', image: '/images/rug1.webp', blurb: 'Made-to-size area rugs in your design, colour and material.', tags: ['area rug', 'custom size'] },
]
