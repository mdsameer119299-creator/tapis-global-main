// ─── HOMEPAGE SOLUTION PILLARS ───────────────────────────────

export type SolutionPillar = {
  id:      string
  eyebrow: string
  title:   string
  titleEm: string
  desc:    string
  points:  string[]
  image:   string
  imageAlt: string
  cta:     string
}

export const SOLUTIONS_HEADER = {
  eyebrow: 'What We Do',
  title:     'Complete Flooring &',
  titleEm:   'Carpet Solutions.',
  lead:      'Design-driven carpets and flooring for architects, hospitality groups, developers, retailers and international buyers — from bespoke residential statements to multi-phase commercial roll-outs across India and worldwide.',
}

export const SOLUTION_PILLARS: SolutionPillar[] = [
  {
    id:      'architects',
    eyebrow: 'Architects & Designers',
    title:   'Solutions for',
    titleEm: 'Architects & Designers',
    desc:    'Specification-led collaboration on custom dimensions, colour development, material boards and sample approval — built for luxury interiors and boutique commercial environments.',
    points:  [
      'Bespoke rugs, runners and wall-to-wall programmes',
      'Lab-dip and physical sample sign-off before bulk',
      'Material palettes for wool, silk, viscose and natural fibres',
      'Tender documentation and FF&E coordination support',
    ],
    image:    '/images/solutions-architects-designers.webp',
    imageAlt: 'Design studio collaboration — architects reviewing carpet samples and digital specifications',
    cta:      'Request Project Consultation',
  },
  {
    id:      'hospitality',
    eyebrow: 'Commercial & Hospitality',
    title:   'Commercial &',
    titleEm: 'Hospitality Projects',
    desc:    'Tailored flooring for hotels, resorts, corporate headquarters, institutional interiors and retail environments — with fire-rated constructions, corridor programmes and phased project execution.',
    points:  [
      'Hotels, resorts and serviced apartment programmes',
      'Corporate offices, lobbies and boardroom environments',
      'Institutional and public-sector interior specifications',
      'Multi-phase roll-outs with milestone-based dispatch',
    ],
    image:    '/images/solutions-hospitality-commercial.webp',
    imageAlt: 'Luxury hotel corridor with bespoke carpet runner — commercial and hospitality flooring project',
    cta:      'Discuss Your Project',
  },
  {
    id:      'custom',
    eyebrow: 'Luxury Interiors',
    title:   'Custom Carpets for',
    titleEm: 'Luxury Interiors',
    desc:    'Bespoke carpets for villas, penthouses, designer residences and statement spaces — custom dimensions, custom colours and design language aligned to your interior vision.',
    points:  [
      'Villas, penthouses and luxury residential programmes',
      'Designer-led projects with exclusive development',
      'Custom dimensions, shapes and colour development',
      'Classical, contemporary and brand-specific interpretations',
    ],
    image:    '/images/solutions-luxury-interiors.webp',
    imageAlt: 'Bespoke custom carpet in a luxury penthouse living room with designer furnishings',
    cta:      'Request Custom Development',
  },
  {
    id:      'pan-india',
    eyebrow: 'Pan India Operations',
    title:   'Pan India Supply',
    titleEm: '& Execution',
    desc:    'Nationwide project execution for builders, developers, hospitality groups, retail brands and institutional buyers — with logistics, QC documentation and on-site coordination.',
    points:  [
      'Metro and tier-city project supply across India',
      'Developer and hospitality procurement programmes',
      'Tender and institutional specification fulfilment',
      'Phased domestic roll-outs with dedicated logistics',
    ],
    image:    '/images/manufacturing-rug-img.webp',
    imageAlt: 'Pan India carpet project supply — Bhadohi',
    cta:      'Discuss Your Project',
  },
  {
    id:      'global',
    eyebrow: 'International Markets',
    title:   'Global Export',
    titleEm: 'Programmes',
    desc:    'Export-ready manufacturing with international compliance, full documentation and reliable dispatch — supporting global supply partnerships alongside domestic project work.',
    points:  [
      'Curated collections for importers and distributors',
      'FCL, LCL and air freight with export-grade packing',
      'REACH, fire-rating and market-specific compliance',
      'Long-term supply partnerships across 45+ markets',
    ],
    image:    '/images/jute-rugs-manufacturing.webp',
    imageAlt: 'Global carpet supply programme — Tapis Global',
    cta:      'Request Project Consultation',
  },
]

export const AUDIENCE_TAGS = [
  'Architects',
  'Interior Designers',
  'Builders & Developers',
  'Hotels & Hospitality',
  'Corporate Offices',
  'Government & Private Tenders',
  'Retail & Wholesale',
  'Luxury Residential',
  'International Buyers',
]
