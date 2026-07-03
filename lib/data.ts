// ─── SITE METADATA ────────────────────────────────────────────
export type ContactLocation = {
  label: string
  lines: string[]
}

export type ContactEmail = {
  label: string
  address: string
}

export const SITE = {
  name:        'Tapis Global International Pvt Ltd',
  tagline:     'Premium Carpets. Pan India. Worldwide.',
  description: 'Premium handmade carpet and flooring solutions from Bhadohi, India — serving architects, interior designers, hospitality projects, commercial interiors, tenders and international buyers across India and 45+ countries.',
  phone:       '+91 84482 91631',
  phoneTel:    '+918448291631',
  landline:    '+91 11 4558 7243',
  landlineTel: '+911145587243',
  email:       'sales@tapisglobalinternational.com',
  emails: [
    { label: 'Sales',   address: 'sales@tapisglobalinternational.com' },
    { label: 'Enquiry', address: 'enquiry@tapisglobalinternational.com' },
  ] satisfies ContactEmail[],
  whatsapp:    'https://wa.me/918448291631',
  corporateOffice: {
    label: 'Corporate Office',
    lines: [
      '438/13, TKD Extension,',
      'Kalkaji, New Delhi – 110019,',
      'India',
    ],
  } satisfies ContactLocation,
  manufacturingFacility: {
    label: 'Manufacturing Facility',
    lines: [
      'Industrial Estate,',
      'Bhadohi – 221401,',
      'Uttar Pradesh, India',
    ],
  } satisfies ContactLocation,
  /** Primary address (manufacturing) — used where a single line is required */
  address: 'Industrial Estate, Bhadohi – 221401, Uttar Pradesh, India',
  established: '1965',
}

// ─── NAV LINKS ────────────────────────────────────────────────
export type NavLink = {
  label:     string
  href:      string
  dropdown?: boolean
  highlight?: boolean
  cta?:      boolean
  badge?:    string
}

export const NAV_LINKS: NavLink[] = [
  { label: 'About',         href: '/about' },
  { label: 'Products',      href: '/products', dropdown: true },
  { label: 'Custom',        href: '/custom' },
  { label: 'Gallery',       href: '/gallery' },
  { label: 'Catalogue',     href: '/catalogue' },
  { label: 'Design Studio', href: '/design-studio', highlight: true, badge: 'New' },
  { label: 'Contact Us',    href: '/contact', cta: true },
]

export const PRODUCT_DROPDOWN = [
  { label: 'Hand Tufted Carpet',   href: '/products/hand-tufted-carpet' },
  { label: 'Hand Knotted Carpet',  href: '/products/hand-knotted-carpet' },
  { label: 'Shaggy Rugs',          href: '/products/shaggy-rugs' },
  { label: 'Jute / Sisal Rugs',    href: '/products/jute-sisal-rugs' },
  { label: 'Leather Carpets',      href: '/products/leather-carpets' },
  { label: 'Wall to Wall Carpets', href: '/products/wall-to-wall-carpets' },
  { label: 'Flat Weaves',          href: '/products/flat-weaves' },
  { label: 'Poufs',                href: '/products/poufs' },
  { label: 'Coco Coir',            href: '/products/coco-coir' },
]

// ─── PRODUCTS MEGA MENU (grouped, with imagery) ──────────────────
export type MegaMenuItem = {
  label: string
  href:  string
  image: string
}

export type MegaMenuGroup = {
  heading: string
  items:   MegaMenuItem[]
}

export const PRODUCT_MEGA_MENU: MegaMenuGroup[] = [
  {
    heading: 'Carpets',
    items: [
      { label: 'Hand Tufted',   href: '/products/hand-tufted-carpet',  image: '/images/handtufted/handtufted-floral-carved-room.webp' },
      { label: 'Hand Knotted',  href: '/products/hand-knotted-carpet', image: '/images/tgi-banner-2.webp' },
      { label: 'Wall-to-Wall',  href: '/products/wall-to-wall-carpets', image: '/images/tgi-banner-4.webp' },
      { label: 'Carpet Tiles',  href: '/products/carpet-tiles',        image: '/images/tufting-carpet.webp' },
      { label: 'Leather',       href: '/products/leather-carpets',     image: '/images/leather/leather-square-patchwork-loft.webp' },
      { label: 'Pebble Carpet', href: '/products/pebble-carpet',       image: '/images/rug4.webp' },
    ],
  },
  {
    heading: 'Rugs',
    items: [
      { label: 'Area Rugs',     href: '/products/area-rugs',      image: '/images/rug1.webp' },
      { label: 'Shaggy',        href: '/products/shaggy-rugs',    image: '/images/shaggy/shaggy-ivory-flokati-room.webp' },
      { label: 'Flat Weaves',   href: '/products/flat-weaves',    image: '/images/rug5.webp' },
    ],
  },
  {
    heading: 'Lifestyle',
    items: [
      { label: 'Poufs',         href: '/products/poufs',          image: '/images/rug2.webp' },
    ],
  },
  {
    heading: 'Natural Fibre Products',
    items: [
      { label: 'Coco Coir',     href: '/products/coco-coir',      image: '/images/coir/coir-natural-coconut.webp' },
      { label: 'Jute & Sisal',  href: '/products/jute-sisal-rugs', image: '/images/jute/jute-living-room-bordered.webp' },
    ],
  },
]

// ─── HERO SLIDES ─────────────────────────────────────────────
export type HeroSlide = {
  id: number
  label: string
  /** Still image (also used as the <video> poster for video slides) */
  poster: string
  /** Slide kind — defaults to 'image' */
  type?: 'image' | 'video'
  /** MP4 (H.264/AAC) source — required when type === 'video' */
  video?: string
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 0,
    label: 'Luxury Interiors',
    poster: '/images/tgi-banner-1.webp',
  },
  {
    id: 1,
    label: 'Signature Collections',
    poster: '/images/tgi-banner-2.webp',
  },
  {
    id: 2,
    label: 'Colour & Material Library',
    poster: '/images/tgi-banner-3.webp',
  },
  {
    // 4th & final slide — cinematic brand video (plays after the three image slides)
    id: 3,
    label: 'Craft in Motion',
    type: 'video',
    video: '/videos/hero-banner.mp4',
    poster: '/images/tgi-banner-4.webp',
  },
]

export const HERO_STATS = [
  { value: '60',  suffix: '+', label: 'Years of Heritage'  },
  { value: '500', suffix: '+', label: 'Specialist Artisans'  },
  { value: '80',  suffix: 'K', label: 'Sq Ft Campus'         },
  { value: '45',  suffix: '+', label: 'Markets Served'       },
]

// ─── COLLECTIONS (homepage story blocks) ─────────────────────
export { COLLECTIONS, COLLECTION_FILTERS, filterCollections } from '@/lib/collections'
export type {
  CollectionItem,
  CollectionFilterId,
  CollectionCategory,
} from '@/lib/collections'

// ─── STATS / EXPORT ──────────────────────────────────────────
export const EXPORT_STATS = [
  { value: '60',  suffix: '+', label: 'Years of Craft Legacy' },
  { value: '500', suffix: '+', label: 'Specialist Artisans'    },
  { value: '80',  suffix: 'K', label: 'Sq Ft Campus'           },
  { value: 'Pan', suffix: '',  label: 'India Projects'         },
  { value: '45',  suffix: '+', label: 'International Markets'  },
]

export const EXPORT_SEGMENTS = [
  {
    icon: 'hotel',
    title: 'Hotels, Resorts & Hospitality',
    desc:  'Lobby statements, suite programmes, corridors and F&B zones — specification-led carpets with fire-rated options, custom medallions and multi-phase roll-outs for 5-star hotel projects across India and internationally.',
  },
  {
    icon: 'truck',
    title: 'Corporate & Institutional Interiors',
    desc:  'Boardrooms, headquarters, retail flagships and public-sector spaces — durable, design-driven flooring supplied across India with documented QC, coordinated delivery and full traceability.',
  },
  {
    icon: 'label',
    title: 'Architects, Designers & Developers',
    desc:  'Bespoke carpets and custom rugs for luxury residential, villa and mixed-use projects — with in-house design studio support, Pantone-matched colour development and pan India project execution.',
  },
]

export const REGIONS = [
  { country: 'Hand Tufted Carpets'        },
  { country: 'Hand Knotted Rugs'          },
  { country: 'Jute & Natural Fibre Rugs'  },
  { country: 'Wall-to-Wall Carpets'       },
  { country: 'Custom Rugs & Bespoke'      },
  { country: 'Shaggy Rugs'               },
  { country: 'Flatweave & Kilim'          },
  { country: 'Hotel & Hospitality Carpet' },
  { country: 'Leather Carpets'            },
  { country: 'Broadloom Carpets'          },
  { country: 'Wool Carpets'              },
  { country: 'Silk & Viscose Rugs'        },
  { country: 'Poufs & Accessories'        },
  { country: 'Contract Flooring'         },
  { country: 'Coco Coir Matting'          },
]

// ─── TESTIMONIALS ─────────────────────────────────────────────
export const TESTIMONIALS = [
  {
    quote: "Tapis Global understood our architect's specification immediately — custom sizes, exact Pantone match, and flawless installation across our Mumbai hospitality project. A true project partner, not just a supplier.",
    name:      'Ananya Mehta',
    role:      'Principal Designer — Studio Forma, Mumbai',
    initials:  'AM',
    stars:     5,
  },
  {
    quote: 'We specified Tapis carpets across three hotel properties in Dubai. Fire-rated backing, custom medallions, phased delivery — every milestone was met with the same precision.',
    name:      'Rami Al-Farsi',
    role:      'Director — Mirage Interiors, Dubai',
    initials:  'RA',
    stars:     5,
  },
  {
    quote: 'For our luxury villa programme in Delhi NCR, Tapis delivered hand-knotted and tufted collections that elevated every room. Their design studio and sample process made specification effortless.',
    name:      'Vikram Sethi',
    role:      'Founder — Sethi Developments, New Delhi',
    initials:  'VS',
    stars:     5,
  },
  {
    quote: 'Our corporate headquarters needed durable, elegant broadloom across 40,000 sq ft. Tapis managed bulk manufacturing, QC documentation and on-site coordination professionally.',
    name:      'Priya Nair',
    role:      'Head of Facilities — Meridian Group, Bengaluru',
    initials:  'PN',
    stars:     5,
  },
  {
    quote: "We've imported from Tapis for 12 years in Europe. Consistent quality, full compliance documentation, and collections that sell in our showrooms — alongside the domestic project work they handle equally well.",
    name:      'Marcus Hoffmann',
    role:      'Managing Director — Wohnart GmbH, Frankfurt',
    initials:  'MH',
    stars:     5,
  },
]

// ─── MANUFACTURING STEPS ─────────────────────────────────────
export const MFG_STEPS = [
  {
    num:   '01',
    title: 'Integrated Campus',
    desc:  'Single-roof production with full material traceability — premium fibres and specification-grade inputs approved before every programme begins.',
    img:   '/images/wool-drying-pic.webp',
  },
  {
    num:   '02',
    title: 'Colour & Specification Control',
    desc:  'Lab-dip development, batch consistency and documented shade approval — aligned to architect palettes and hospitality brand standards.',
    img:   '/images/vibrant-wool-dying.webp',
  },
  {
    num:   '03',
    title: 'Production Programme',
    desc:  'Coordinated manufacturing across bespoke, hospitality and contract volumes — managed to agreed timelines with milestone visibility.',
    img:   '/images/tufting-carpet.webp',
  },
  {
    num:   '04',
    title: 'Finishing Standard',
    desc:  'Premium hand-feel, surface consistency and backing specifications calibrated for residential luxury and high-traffic commercial use.',
    img:   '/images/rug4.webp',
  },
  {
    num:   '05',
    title: 'QC & Project Dispatch',
    desc:  'Multi-stage inspection, measurement logs and phased dispatch — pan-India project delivery and international supply with full documentation.',
    img:   '/images/videoframe_15503.webp',
  },
]

// ─── WHY CHOOSE US (homepage .why) ───────────────────────────
export type WhyIcon = 'shield' | 'check' | 'globe' | 'flag' | 'layers' | 'users'

export const WHY_ITEMS: { title: string; desc: string; icon: WhyIcon }[] = [
  {
    icon:  'shield',
    title: 'Heritage & Design Integrity',
    desc:  'Three generations of Bhadohi craftsmanship underpin a contemporary, specification-led studio — trusted by architects, designers and project teams for material integrity and finish.',
  },
  {
    icon:  'check',
    title: 'Specification-Led Quality',
    desc:  'What you approve in the sample is what arrives on site. Documented QC, measurement logs and traceability at every stage — for residential, hospitality and international programmes.',
  },
  {
    icon:  'globe',
    title: 'Pan India & Global Reach',
    desc:  'Project execution across India alongside global supply partnerships in 45+ markets — with compliance documentation tailored to each destination.',
  },
  {
    icon:  'flag',
    title: 'Project Execution Partner',
    desc:  'From concept development to multi-phase hospitality roll-outs and tender fulfilment — partnerships built on reliability, design support and disciplined delivery.',
  },
  {
    icon:  'layers',
    title: 'Bespoke at Every Scale',
    desc:  'Statement pieces for a single penthouse or coordinated volumes for a hotel group — your design language, your palette, your timeline, with NDA-backed exclusivity available.',
  },
  {
    icon:  'users',
    title: 'Dedicated Specialist Teams',
    desc:  'GoodWeave-certified fair labour and skilled production teams — with ethical sourcing documentation for CSR, hospitality and institutional compliance requirements.',
  },
]
