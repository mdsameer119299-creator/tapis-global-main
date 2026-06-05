// ─── HOMEPAGE COLLECTION STORY BLOCKS (HTML v12 parity) ───────

export type CollectionCategory = 'tufted' | 'knotted' | 'flatweave' | 'contract' | 'custom'
export type CollectionFilterId = 'all' | 'knotted' | 'tufted' | 'flatweave' | 'contract'
export type CollectionLayout = 'il' | 'ir'
export type CollectionVariant = 'default' | 'alt' | 'dark'
export type SlideTagVariant = 'gold' | 'dark' | 'light'

export type CollectionBullet = {
  label: string
  text:  string
}

export type CollectionItem = {
  id:           string
  category:     CollectionCategory
  collectionNum: number
  title:        string
  titleEm:      string
  tagline:      string
  bullets:      CollectionBullet[]
  leadTime:     string
  moq:          string
  ctaText:      string
  layout:       CollectionLayout
  variant:      CollectionVariant
  slideTag:     string
  slideTagVariant: SlideTagVariant
  images:       string[]
}

export const COLLECTION_FILTERS: { id: CollectionFilterId; label: string }[] = [
  { id: 'all',       label: 'All'       },
  { id: 'knotted',   label: 'Knotted'   },
  { id: 'tufted',    label: 'Tufted'    },
  { id: 'flatweave', label: 'Flatweave' },
  { id: 'contract',  label: 'Contract'  },
]

export function filterCollections(
  items: CollectionItem[],
  filter: CollectionFilterId,
): CollectionItem[] {
  if (filter === 'all') return items
  return items.filter((col) => col.category === filter)
}

export const COLLECTIONS: CollectionItem[] = [
  {
    id:            'tufted',
    category:      'tufted',
    collectionNum: 1,
    title:         'Hand Tufted',
    titleEm:       'Collection',
    tagline:       'Design-driven texture for contemporary luxury interiors',
    layout:        'il',
    variant:       'default',
    slideTag:      'Hand Tufted',
    slideTagVariant: 'gold',
    images: [
      '/images/collection-tufted-factory.webp',
      '/images/collection-tufted-dyeing.webp',
      '/images/collection-tufted-finishing.webp',
      '/images/collection-tufted-hotel.webp',
    ],
    bullets: [
      { label: 'Interior Applications', text: 'Living spaces, suites, boardrooms and boutique hospitality — rich pile and colour depth suited to specification-led residential and commercial interiors.' },
      { label: 'Material Range', text: 'New Zealand wool, viscose, cotton and blended constructions — curated for hand-feel, durability and design flexibility across project scales.' },
      { label: 'Hospitality Ready', text: 'Fire-rated options, high-traffic performance and custom colour development aligned to FF&E schedules and brand palettes.' },
      { label: 'Custom Development', text: 'Any dimension, shape or colour reference with lab-dip approval — ideal for architect-led programmes and private residential commissions.' },
      { label: 'Quality Positioning', text: 'ISO 9001:2015 and OEKO-TEX certified with full compliance documentation for India and international project supply.' },
    ],
    leadTime: '45–60 Days',
    moq:      '100 Pcs',
    ctaText:  'Explore Collections →',
  },
  {
    id:            'knotted',
    category:      'knotted',
    collectionNum: 2,
    title:         'Hand Knotted',
    titleEm:       'Rugs',
    tagline:       'Statement craftsmanship for distinguished spaces',
    layout:        'ir',
    variant:       'alt',
    slideTag:      'Hand Knotted',
    slideTagVariant: 'dark',
    images: [
      '/images/collection-knotted-weaving.webp',
      '/images/collection-knotted-dyeing.webp',
      '/images/collection-knotted-finishing.webp',
      '/images/collection-knotted-luxury-room.webp',
    ],
    bullets: [
      { label: 'Project Suitability', text: 'Grand residences, hotel suites, galleries and collector interiors — enduring presence and tactile luxury for spaces that demand permanence.' },
      { label: 'Material Integrity', text: 'Wool, silk and wool-silk blends specified to KPSI and construction requirements — developed with architects and interior designers.' },
      { label: 'Long-Term Value', text: 'Investment-grade pieces for hospitality flagships and private collections — supplied with documented provenance and quality assurance.' },
      { label: 'Bespoke Development', text: 'Custom patterns from mood boards or CAD with studio samples in 14–21 days and colour accuracy via lab-dip approval before bulk.' },
    ],
    leadTime: '90–180 Days',
    moq:      '50 Pcs',
    ctaText:  'Request Custom Development →',
  },
  {
    id:            'flatweave',
    category:      'flatweave',
    collectionNum: 3,
    title:         'Jute & Sisal',
    titleEm:       'Collection',
    tagline:       'Natural texture for conscious luxury environments',
    layout:        'il',
    variant:       'default',
    slideTag:      'Jute · Sisal',
    slideTagVariant: 'light',
    images: [
      '/images/collection-jute-factory.webp',
      '/images/collection-jute-dyeing.webp',
      '/images/collection-jute-interior.webp',
      '/images/collection-jute-artisan.webp',
    ],
    bullets: [
      { label: 'Design Applications', text: 'Coastal villas, boutique hotels, retail and lifestyle interiors — organic texture with a refined, contemporary sensibility.' },
      { label: 'Sustainable Positioning', text: 'Natural fibre programmes for eco-conscious specifications — biodegradable options with certification support for European and Australasian markets.' },
      { label: 'Commercial Suitability', text: 'Durable flatweave surfaces for high-traffic residential and hospitality zones — available in natural, bleached and custom-dyed finishes.' },
      { label: 'Retail & Wholesale', text: 'Private-label packing, custom borders and retail-ready dispatch for lifestyle brands and international distribution.' },
    ],
    leadTime: '30–45 Days',
    moq:      '200 Pcs',
    ctaText:  'Explore Collections →',
  },
  {
    id:            'hospitality',
    category:      'contract',
    collectionNum: 4,
    title:         'Hospitality',
    titleEm:       'Carpets',
    tagline:       'Specification-led flooring for 5-star environments',
    layout:        'ir',
    variant:       'dark',
    slideTag:      'Hospitality',
    slideTagVariant: 'dark',
    images: [
      '/images/tgi-banner-4.webp',
      '/images/tgi-banner-3.webp',
      '/images/tgi-banner-1.webp',
      '/images/tgi-banner-6.webp',
    ],
    bullets: [
      { label: 'Hotel & Resort', text: 'Suites, lobbies, corridors and banquet spaces — bespoke programmes for luxury hospitality brands across India, the GCC and international markets.' },
      { label: 'Compliance & Performance', text: 'Fire-rated constructions with test certificates for hotel specifications — engineered for high-traffic hospitality performance.' },
      { label: 'Brand Customisation', text: 'Medallions, crests and signature patterns developed in-house — translated to production-ready artwork within days.' },
      { label: 'Multi-Phase Roll-Outs', text: 'Phased delivery for openings and renovations with FF&E coordination, technical specifications and material samples.' },
    ],
    leadTime: '45–90 Days',
    moq:      '500 Sqm',
    ctaText:  'Discuss Your Project →',
  },
  {
    id:            'w2w',
    category:      'contract',
    collectionNum: 5,
    title:         'Wall-to-Wall',
    titleEm:       'Broadloom',
    tagline:       'Seamless flooring for large-scale commercial programmes',
    layout:        'il',
    variant:       'default',
    slideTag:      'Wall-to-Wall',
    slideTagVariant: 'dark',
    images: [
      '/images/collection-broadloom-ballroom.webp',
      '/images/collection-broadloom-lounge.webp',
      '/images/collection-broadloom-corridor.webp',
      '/images/collection-broadloom-production.webp',
    ],
    bullets: [
      { label: 'Project Capability', text: 'Corridors, banquet halls, offices and residential towers — broadloom programmes up to 4 metres wide, cut to project length.' },
      { label: 'Performance Specification', text: 'Cut, loop and cut-and-loop pile options with contract-grade backing — specified for traffic, acoustics and maintenance requirements.' },
      { label: 'Pattern Development', text: 'Geometric, traditional and brand-specific motifs — custom repeat design for architect and corporate interior programmes.' },
      { label: 'Compliance', text: 'Fire-rating and stain-resistant documentation for commercial and hospitality tenders — Class 1 ratings available on request.' },
    ],
    leadTime: '30–50 Days',
    moq:      '500 Sqm',
    ctaText:  'Request Project Consultation →',
  },
  {
    id:            'custom',
    category:      'custom',
    collectionNum: 6,
    title:         'Custom &',
    titleEm:       'Bespoke Rugs',
    tagline:       'Your vision. Our integrated manufacturing.',
    layout:        'ir',
    variant:       'alt',
    slideTag:      'Custom OEM',
    slideTagVariant: 'gold',
    images: [
      '/images/rug2.webp',
      '/images/videoframe_15503.webp',
      '/images/tgi-banner-5.webp',
      '/images/rug5.webp',
    ],
    bullets: [
      { label: 'Private Label Programmes', text: 'Produce under your brand with custom packaging and documentation — NDA-backed exclusivity and design registration available.' },
      { label: 'Design Development', text: 'Sketches, Pantone references, CAD files or mood boards converted to production-ready specifications with lab dips in 3–5 days.' },
      { label: 'Tailored Dimensions', text: 'Any shape or size — round, runner, stair or irregular — across knotted, tufted, flatweave and shaggy constructions.' },
      { label: 'Retail-Ready Supply', text: 'Barcoding, care labels and fulfilment-centre dispatch for wholesale, retail and international e-commerce programmes.' },
    ],
    leadTime: 'Sample: 7 Days',
    moq:      '100 Pcs',
    ctaText:  'Start Your Design Journey →',
  },
]
