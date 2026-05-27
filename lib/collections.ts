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
    tagline:       'Crafted for modern luxury interiors',
    layout:        'il',
    variant:       'default',
    slideTag:      'Hand Tufted',
    slideTagVariant: 'gold',
    images: [
      '/images/tgi-banner-1.png',
      '/images/handtufted-img-2.png',
      '/images/tufting-carpet.png',
      '/images/rug1.jpg',
      '/images/vibrant-wool-dying.png',
    ],
    bullets: [
      { label: 'Tufting Process', text: 'Yarn is punched through a fabric backing using a tufting gun, creating a dense, even pile. Faster than knotting with equal visual impact — ideal for large-volume collections with complex colour patterns.' },
      { label: 'Materials', text: 'Premium New Zealand wool, Indian wool, viscose, cotton, polyester and blended constructions. Each material is sourced ethically and tested before production entry.' },
      { label: 'Hospitality Ready', text: 'Our hospitality-grade tufted carpets meet fire-rating requirements, withstand high-traffic use and are available in custom colour specifications matched to your interior palette.' },
      { label: 'Fully Customisable', text: 'Any size (1×1 ft to 20×30 ft), any shape, any colour via Pantone reference. Lab-dip approval before bulk. Private label and OEM packing available.' },
      { label: 'Premium Quality', text: 'ISO 9001:2015 and OEKO-TEX certified — meeting architect, hospitality and project specifications with full compliance documentation for India and international markets.' },
    ],
    leadTime: '45–60 Days',
    moq:      '100 Pcs',
    ctaText:  'Request Quote →',
  },
  {
    id:            'knotted',
    category:      'knotted',
    collectionNum: 2,
    title:         'Hand Knotted',
    titleEm:       'Rugs',
    tagline:       'The highest form of carpet craftsmanship',
    layout:        'ir',
    variant:       'alt',
    slideTag:      'Hand Knotted',
    slideTagVariant: 'dark',
    images: [
      '/images/rug2.jpg',
      '/images/rug3.jpg',
      '/images/tgi-banner-2.png',
      '/images/tgi-banner-5.png',
    ],
    bullets: [
      { label: 'The Craft', text: 'Every knot tied by hand — Persian, Tibetan or Afghan construction. A single 9×12 ft rug can contain over 1.3 million individual knots, each placed by an artisan over months of patient work.' },
      { label: 'Materials', text: 'New Zealand wool, Indian handspun wool, pure silk, and wool-silk blends. KPSI from 40 to 300+ depending on intricacy and specification.' },
      { label: 'Longevity', text: 'Hand knotted carpets gain value with age. Supplied to luxury hotels, collectors and interior designers globally. Pieces that outlast generations — not seasons.' },
      { label: 'Bespoke Available', text: 'Custom patterns from your CAD files or mood boards. Design studio samples delivered in 14–21 days. Colour accuracy via lab-dip approval before bulk.' },
    ],
    leadTime: '90–180 Days',
    moq:      '50 Pcs',
    ctaText:  'Request Quote →',
  },
  {
    id:            'flatweave',
    category:      'flatweave',
    collectionNum: 3,
    title:         'Jute & Sisal',
    titleEm:       'Collection',
    tagline:       'Eco-conscious flooring for conscious markets',
    layout:        'il',
    variant:       'default',
    slideTag:      'Jute · Sisal',
    slideTagVariant: 'light',
    images: [
      '/images/jute-rugs-manufacturing.png',
      '/images/rug4.jpg',
      '/images/rug5.jpg',
      '/images/manufacturing-rug-img.png',
    ],
    bullets: [
      { label: 'Natural Fibres', text: 'Jute, sisal, coir and seagrass — sustainably harvested natural fibres that are fully biodegradable. Zero synthetic content options available for eco-certification compliance in European markets.' },
      { label: 'Construction', text: 'Flatweave, braided and hand-loomed constructions. Available in bleached, natural and dyed finishes. Dense, durable surfaces for high-traffic residential and commercial use.' },
      { label: 'Market Demand', text: 'Jute and natural fibre rugs are among the fastest-growing SKUs in Australian, Scandinavian and US e-commerce markets. Strong wholesale demand from eco and lifestyle retail buyers.' },
      { label: 'Customisation', text: 'Custom border colours, bound edges, latex backing options, and private label packing for retail-ready supply to online platforms including Amazon and Wayfair.' },
    ],
    leadTime: '30–45 Days',
    moq:      '200 Pcs',
    ctaText:  'Request Quote →',
  },
  {
    id:            'hospitality',
    category:      'contract',
    collectionNum: 4,
    title:         'Hospitality',
    titleEm:       'Carpets',
    tagline:       'Built for 5-star floors. Engineered to endure.',
    layout:        'ir',
    variant:       'dark',
    slideTag:      'Hospitality',
    slideTagVariant: 'dark',
    images: [
      '/images/tgi-banner-4.png',
      '/images/tgi-banner-3.png',
      '/images/tgi-banner-1.png',
      '/images/tgi-banner-6.png',
    ],
    bullets: [
      { label: 'Hotel & Resort', text: 'Custom area rugs, corridor runners, lobby statement pieces and banquet hall carpets. We have supplied 5-star hotels in Dubai, Singapore, London and across the GCC with bespoke programmes.' },
      { label: 'Fire-Rating Compliance', text: 'All hospitality-grade constructions available with fire-retardant treatment and test certificates (BS 4790, ISO 9239, IMO standards) for hotel project compliance.' },
      { label: 'Custom Medallions & Patterns', text: "Your hotel brand's crest, custom geometric or floral medallions, bespoke border treatments — all designed in-house and translated to production within 7 working days." },
      { label: 'Project Delivery', text: 'Phased delivery schedules for large hotel openings and renovations. FF&E procurement team support with full technical specifications and material samples.' },
    ],
    leadTime: '45–90 Days',
    moq:      '500 Sqm',
    ctaText:  'Project Inquiry →',
  },
  {
    id:            'w2w',
    category:      'contract',
    collectionNum: 5,
    title:         'Wall-to-Wall',
    titleEm:       'Broadloom',
    tagline:       'Seamless flooring for large-scale commercial projects',
    layout:        'il',
    variant:       'default',
    slideTag:      'Wall-to-Wall',
    slideTagVariant: 'dark',
    images: [
      '/images/tgi-banner-3.png',
      '/images/tgi-banner-1.png',
      '/images/tgi-banner-4.png',
      '/images/rug4.jpg',
    ],
    bullets: [
      { label: 'Project Capability', text: 'Broadloom carpet up to 4 metres wide, cut to any length. Ideal for hotel corridors, banquet halls, offices, retail spaces and residential high-rises.' },
      { label: 'Construction', text: 'Polypropylene, nylon and wool-blend pile in cut, loop and cut-and-loop formats. Specification-grade backing options including action-bac, secondary jute and bitumen.' },
      { label: 'Pattern Capabilities', text: 'Custom patterns using Axminster-style repeat design. Geometric, traditional, contemporary and brand-specific motifs all available.' },
      { label: 'Compliance', text: 'Fire-rating documentation for commercial and hospitality projects. Class 1 fire ratings available. Stain-resistant constructions for high-traffic environments.' },
    ],
    leadTime: '30–50 Days',
    moq:      '500 Sqm',
    ctaText:  'Request Quote →',
  },
  {
    id:            'custom',
    category:      'custom',
    collectionNum: 6,
    title:         'Custom &',
    titleEm:       'Bespoke Rugs',
    tagline:       'Your design. Your label. Our manufacturing.',
    layout:        'ir',
    variant:       'alt',
    slideTag:      'Custom OEM',
    slideTagVariant: 'gold',
    images: [
      '/images/rug2.jpg',
      '/images/videoframe_15503.png',
      '/images/tgi-banner-5.png',
      '/images/rug5.jpg',
    ],
    bullets: [
      { label: 'OEM Manufacturing', text: 'We produce rugs under your brand name with your swing tags, your packaging and your documentation. NDA available. Exclusive designs registered to your account. Minimum 100 pieces per design.' },
      { label: 'Design Development', text: 'Send us your artwork — a sketch, a Pantone reference, a CAD file or a mood board. Our in-house design team converts any concept into a production-ready pattern with colour-accurate lab dips within 3–5 days.' },
      { label: 'Any Shape or Size', text: 'Round, oval, rectangular, runner, stair carpet, irregular — any dimension from 1×1 ft to 20×30 ft. Any construction: knotted, tufted, flatweave, shaggy, braided.' },
      { label: 'Retail Compliance', text: 'Amazon, Wayfair and boutique retail-compliant packing. Individual barcoding, care labels, country-of-origin labelling. Ready to ship direct to your fulfilment centre.' },
    ],
    leadTime: 'Sample: 7 Days',
    moq:      '100 Pcs',
    ctaText:  'Start Your Design →',
  },
]
