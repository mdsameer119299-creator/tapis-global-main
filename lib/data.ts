// ─── SITE METADATA ────────────────────────────────────────────
export const SITE = {
  name:        'Tapis Global International Pvt Ltd',
  tagline:     'Premium Carpets. Pan India. Worldwide.',
  description: 'Premium handmade carpet and flooring solutions from Bhadohi, India — serving architects, interior designers, hospitality projects, commercial interiors, tenders and international buyers across India and 45+ countries.',
  phone:       '+91 9415 234 567',
  email:       'exports@tapisglobal.com',
  address:     'Carpet Mandi, Bhadohi – 221 401, Uttar Pradesh, India',
  whatsapp:    'https://wa.me/919415234567',
  established: '1998',
}

// ─── NAV LINKS ────────────────────────────────────────────────
export type NavLink = {
  label:     string
  href:      string
  dropdown?: boolean
  highlight?: boolean
  cta?:      boolean
}

export const NAV_LINKS: NavLink[] = [
  { label: 'About',      href: '/about' },
  { label: 'Products',   href: '/products', dropdown: true },
  { label: 'Custom',     href: '/custom' },
  { label: 'Gallery',    href: '/gallery' },
  { label: 'Catalogue',  href: '/catalogue' },
  { label: 'Blogs',      href: '/blogs' },
  { label: 'Color',      href: '/samples', highlight: true },
  { label: 'Contact Us', href: '/contact', cta: true },
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

// ─── HERO SLIDES ─────────────────────────────────────────────
export const HERO_SLIDES = [
  {
    id: 0,
    label: 'Artisan Loom Weaving',
    poster: '/images/tgi-banner-1.png',
  },
  {
    id: 1,
    label: 'Hand Knotted Texture',
    poster: '/images/tgi-banner-2.png',
  },
  {
    id: 2,
    label: 'Dyeing & Colour Lab',
    poster: '/images/tgi-banner-3.png',
  },
  {
    id: 3,
    label: 'Luxury Hotel Installation',
    poster: '/images/tgi-banner-4.png',
  },
  {
    id: 4,
    label: 'Master Artisan — Bhadohi',
    poster: '/images/tgi-banner-5.png',
  },
  {
    id: 5,
    label: 'Finished Collection',
    poster: '/images/tgi-banner-6.png',
  },
]

export const HERO_STATS = [
  { value: '25',  suffix: '+', label: 'Years of Craft'      },
  { value: '500', suffix: '+', label: 'Master Artisans'     },
  { value: '80',  suffix: 'K', label: 'Sq Ft Facility'      },
  { value: '45',  suffix: '+', label: 'Countries & India'   },
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
  { value: '25',  suffix: '+', label: 'Years of Excellence' },
  { value: '500', suffix: '+', label: 'Master Artisans'     },
  { value: '80',  suffix: 'K', label: 'Sq Ft Campus'        },
  { value: '45',  suffix: '+', label: 'Global Markets'      },
  { value: 'Pan', suffix: '',  label: 'India Projects'      },
]

export const EXPORT_SEGMENTS = [
  {
    icon: 'hotel',
    title: 'Architects & Interior Designers',
    desc:  'Custom carpets, colour matching, sample development and specification support for luxury residential, boutique commercial and designer-led interiors across India and abroad.',
  },
  {
    icon: 'truck',
    title: 'Hospitality & Commercial Projects',
    desc:  'Fire-rated broadloom, corridor programmes, lobby installations and phased delivery for hotels, resorts, corporate offices, retail spaces and institutional interiors.',
  },
  {
    icon: 'label',
    title: 'Tenders, Developers & Global Buyers',
    desc:  'Bulk project execution, tender supply, builder partnerships and export programmes — with documented QC, compliance and reliable dispatch timelines.',
  },
]

export const REGIONS = [
  { flag: '🇺🇸', country: 'United States' },
  { flag: '🇬🇧', country: 'United Kingdom' },
  { flag: '🇩🇪', country: 'Germany' },
  { flag: '🇫🇷', country: 'France' },
  { flag: '🇦🇺', country: 'Australia' },
  { flag: '🇦🇪', country: 'UAE' },
  { flag: '🇸🇦', country: 'Saudi Arabia' },
  { flag: '🇨🇦', country: 'Canada' },
  { flag: '🇮🇹', country: 'Italy' },
  { flag: '🇳🇱', country: 'Netherlands' },
  { flag: '🇸🇪', country: 'Sweden' },
  { flag: '🇧🇪', country: 'Belgium' },
  { flag: '🇯🇵', country: 'Japan' },
  { flag: '🇰🇷', country: 'South Korea' },
  { flag: '🇿🇦', country: 'South Africa' },
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
    title: 'Raw Material',
    desc:  'NZ Wool, Indian Silk, certified AZO-free dyes — every batch tested before production entry. No shortcuts on input quality.',
    img:   '/images/wool-drying-pic.png',
  },
  {
    num:   '02',
    title: 'Dyeing & Colour Lab',
    desc:  'Pantone-matched dyeing. Lab-dip approval before bulk starts. Colour consistency guaranteed across the full order.',
    img:   '/images/vibrant-wool-dying.png',
  },
  {
    num:   '03',
    title: 'Weaving & Knotting',
    desc:  '500+ skilled artisans across hand knotting, tufting, flatweave and broadloom on traditional and modern looms.',
    img:   '/images/tufting-carpet.png',
  },
  {
    num:   '04',
    title: 'Washing & Finishing',
    desc:  'Hand washing, stretching, trimming, pile calibration and backing for a premium hand feel on every finished piece.',
    img:   '/images/rug4.jpg',
  },
  {
    num:   '05',
    title: 'QC & Project Dispatch',
    desc:  'Multi-stage inspection, measurement logs, project-wise packing and coordinated dispatch — for pan-India deliveries and international shipments alike.',
    img:   '/images/videoframe_15503.png',
  },
]

// ─── WHY CHOOSE US (homepage .why) ───────────────────────────
export type WhyIcon = 'shield' | 'check' | 'globe' | 'flag' | 'layers' | 'users'

export const WHY_ITEMS: { title: string; desc: string; icon: WhyIcon }[] = [
  {
    icon:  'shield',
    title: 'Third-Generation Craftsmanship',
    desc:  "Twenty-five years of manufacturing excellence passed through three generations. We honour Bhadohi's weaving heritage while delivering the precision architects, designers and project teams expect.",
  },
  {
    icon:  'check',
    title: 'Specification-Led Quality',
    desc:  'What you approve in the sample is what arrives on site. Photographic QC, measurement logs and documented inspection at every stage — for residential, commercial and export orders.',
  },
  {
    icon:  'globe',
    title: 'Pan India & Global Reach',
    desc:  'Project supply across India — metros, hospitality corridors and institutional sites — alongside export programmes to 45+ countries with full compliance documentation.',
  },
  {
    icon:  'flag',
    title: 'Trusted Project Partner',
    desc:  'From first sample to multi-phase hospitality roll-outs and tender fulfilment. Our client retention reflects partnerships built on reliability, design support and on-time execution.',
  },
  {
    icon:  'layers',
    title: 'Custom at Every Scale',
    desc:  'Bespoke rugs for a single penthouse or bulk manufacturing for a hotel chain. Your artwork, your palette, your timeline — with lab-dip approval and NDA-backed exclusivity.',
  },
  {
    icon:  'users',
    title: '500+ Master Artisans',
    desc:  'GoodWeave-certified fair labour across tufting, knotting, flatweave and finishing. Ethical sourcing documentation available for CSR and project compliance requirements.',
  },
]
