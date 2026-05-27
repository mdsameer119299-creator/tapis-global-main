// ─── CATALOGUE PAGE — content ────────────────────────────────

export const CATALOGUE_HERO = {
  eyebrow:  'Digital Lookbook',
  title:    'Request Our Luxury',
  titleEm:  'Carpet Catalogue',
  lead:     'Discover our exclusive collection of handcrafted carpets, rugs, and premium flooring solutions tailored for luxury interiors and global projects.',
  image:    '/images/tgi-banner-6.png',
  imageAlt: 'Luxury carpet catalogue preview — Tapis Global International',
}

export const BUYER_TYPES = [
  'Interior Designer',
  'Architect',
  'Importer',
  'Retailer',
  'Hotel / Hospitality',
  'Wholesaler',
  'Builder / Developer',
  'Distributor',
  'Home Owner',
  'Other',
] as const

export type BuyerType = (typeof BUYER_TYPES)[number]

export const CATALOGUE_WHY = [
  {
    title: 'Latest Luxury Collections',
    desc:  'Seasonal hand tufted, knotted and flatweave programmes — trend-forward designs updated every quarter.',
  },
  {
    title: 'Premium Quality Standards',
    desc:  'Full specifications, MOQs, lead times and certification details for architects, project teams and procurement departments.',
  },
  {
    title: 'Custom Carpet Solutions',
    desc:  'Bespoke sizing, colour matching and private-label options documented for your project requirements.',
  },
  {
    title: 'Premium Materials & Craft',
    desc:  'Wool, silk, viscose and natural fibre constructions — with artisan process photography from our Bhadohi campus.',
  },
  {
    title: 'Hospitality & Commercial',
    desc:  'Fire-rated broadloom, corridor programmes and phased project collections for hotels and developers.',
  },
]

export const CATALOGUE_PREVIEW = [
  { src: '/images/handtufted-img-2.png', label: 'Hand Tufted Collection' },
  { src: '/images/tgi-banner-2.png', label: 'Hand Knotted Programme' },
  { src: '/images/rug4.jpg', label: 'Contemporary Living' },
  { src: '/images/tgi-banner-4.png', label: 'Hospitality Projects' },
]

export const CATALOGUE_TRUST = [
  { value: 'Pan', suffix: '',  label: 'India Projects' },
  { value: '9',   suffix: '',  label: 'Product Categories' },
  { value: '500', suffix: '+', label: 'Master Artisans' },
  { value: '100', suffix: '%', label: 'Pre-Dispatch QC' },
]

export const CATALOGUE_SUCCESS = {
  title:   'Thank You for Your Interest',
  message: 'Our catalogue will be sent to your email shortly.',
  subline: 'You will receive the catalogue in your email inbox.',
}

export const CATALOGUE_TRUST_CARDS = [
  {
    icon:  'globe',
    title: 'Pan India & Global Reach',
    desc:  'Trusted by architects, hospitality groups and buyers across India — with export programmes in 45+ countries.',
  },
  {
    icon:  'quality',
    title: 'Premium Quality',
    desc:  'ISO 9001:2015 and OEKO-TEX certified — rigorous QC on every production batch.',
  },
  {
    icon:  'craft',
    title: 'Handcrafted Excellence',
    desc:  '500+ master artisans in Bhadohi — generations of weaving and tufting mastery.',
  },
  {
    icon:  'custom',
    title: 'Custom Manufacturing',
    desc:  'Bespoke sizes, colours and private-label programmes tailored to your market.',
  },
]
