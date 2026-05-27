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
}

export const SOLUTIONS_HEADER = {
  eyebrow: 'What We Do',
  title:     'Complete Carpet &',
  titleEm:   'Flooring Solutions.',
  lead:      'From architect-specified custom rugs to pan-India project execution, hospitality roll-outs and global export programmes — Tapis Global serves premium interiors across every scale.',
}

export const SOLUTION_PILLARS: SolutionPillar[] = [
  {
    id:      'architects',
    eyebrow: 'Architects & Designers',
    title:   'Solutions for',
    titleEm: 'Architects & Designers',
    desc:    'Collaborate with our in-house studio on custom sizes, Pantone colour matching, pattern development and sample approval — built for specification-led interiors.',
    points:  [
      'Bespoke rugs, runners and wall-to-wall programmes',
      'Lab-dip and physical sample sign-off before bulk',
      'Material boards for wool, silk, viscose and natural fibres',
      'Support for luxury residential and boutique commercial spaces',
    ],
    image:    '/images/tgi-banner-4.png',
    imageAlt: 'Luxury interior with custom carpet — architect specification',
  },
  {
    id:      'hospitality',
    eyebrow: 'Commercial & Hospitality',
    title:   'Commercial &',
    titleEm: 'Hospitality Projects',
    desc:    'Fire-rated constructions, corridor programmes, lobby medallions and phased delivery for hotels, resorts, corporate offices and retail environments.',
    points:  [
      'Hotel suites, lobbies, ballrooms and F&B zones',
      'High-traffic commercial and office flooring',
      'Institutional interiors with documented QC',
      'Bulk manufacturing with milestone-based dispatch',
    ],
    image:    '/images/tgi-banner-3.png',
    imageAlt: 'Hospitality carpet installation — hotel and commercial flooring',
  },
  {
    id:      'custom',
    eyebrow: 'Luxury Interiors',
    title:   'Custom Carpets for',
    titleEm: 'Luxury Interiors',
    desc:    'Hand tufted, knotted and flatweave carpets tailored to villas, penthouses, designer showrooms and statement residential spaces across India and abroad.',
    points:  [
      'Any dimension, shape, pile height and construction',
      'Classical reproductions and contemporary design language',
      'Logo, medallion and border customisation',
      'Low MOQ bespoke programmes with export-grade finishing',
    ],
    image:    '/images/handtufted-img-2.png',
    imageAlt: 'Custom luxury carpet in premium residential interior',
  },
  {
    id:      'pan-india',
    eyebrow: 'Pan India Operations',
    title:   'Pan India Supply',
    titleEm: '& Execution',
    desc:    'We supply premium handmade and contract carpets across India — supporting builders, developers, hospitality groups, retail brands and institutional buyers nationwide.',
    points:  [
      'Project supply to metros and tier cities across India',
      'Tender and institutional procurement capabilities',
      'Retail, wholesale and developer partnerships',
      'Dedicated logistics for phased domestic roll-outs',
    ],
    image:    '/images/manufacturing-rug-img.png',
    imageAlt: 'Carpet manufacturing and pan India project supply — Bhadohi',
  },
  {
    id:      'global',
    eyebrow: 'International Markets',
    title:   'Global Export',
    titleEm: 'Capabilities',
    desc:    'Export-quality manufacturing with ISO certification, OEKO-TEX compliance and full documentation — serving international buyers alongside our domestic project work.',
    points:  [
      'Handmade collections for importers and distributors',
      'FCL, LCL and air freight with export packing',
      'REACH, fire-rating and market-specific compliance',
      '45+ countries served from our Bhadohi campus',
    ],
    image:    '/images/jute-rugs-manufacturing.png',
    imageAlt: 'Export quality carpet manufacturing — global delivery',
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
