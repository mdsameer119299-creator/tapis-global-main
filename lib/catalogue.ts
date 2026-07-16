// ─── CATALOGUE PAGE — content ────────────────────────────────

export const CATALOGUE_HERO = {
  eyebrow:  'Digital Lookbook',
  title:    'Request Our Luxury',
  titleEm:  'Carpet Catalogue',
  lead:     'Discover our exclusive collection of handcrafted carpets, rugs, and premium flooring solutions tailored for luxury interiors and global projects.',
  image:    '/images/tgi-banner-6.webp',
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
  { src: '/images/handtufted-img-2.webp', label: 'Hand Tufted Collection' },
  { src: '/images/tgi-banner-2.webp', label: 'Hand Knotted Programme' },
  { src: '/images/rug4.webp', label: 'Contemporary Living' },
  { src: '/images/tgi-banner-4.webp', label: 'Hospitality Projects' },
]

export const CATALOGUE_TRUST = [
  { value: 'Pan', suffix: '',  label: 'India Projects' },
  { value: '9',   suffix: '',  label: 'Product Categories' },
  { value: 'Skilled', suffix: '', label: 'Artisan Workforce' },
  { value: '100', suffix: '%', label: 'Pre-Dispatch QC' },
]

export const CATALOGUE_SUCCESS = {
  // Truthful copy: the system records the request and notifies the team, which
  // then sends the relevant catalogue. We do NOT auto-attach/auto-email a
  // catalogue file, so we must not claim it has already been sent.
  title:   'Thank You for Your Interest',
  message: 'Your catalogue request has been received.',
  subline: 'Our team will send you the relevant catalogue at the email address you provided.',
}

export const CATALOGUE_TRUST_CARDS = [
  {
    icon:  'globe',
    title: 'Pan India & Global Reach',
    desc:  'Trusted by architects, hospitality groups and buyers across India — with export programmes across international markets.',
  },
  {
    icon:  'quality',
    title: 'Premium Quality',
    desc:  'ISO 9001:2015-aligned and OEKO-TEX-aligned processes — rigorous QC on every production batch.',
  },
  {
    icon:  'craft',
    title: 'Handcrafted Excellence',
    desc:  'Hundreds of master artisans in Bhadohi — generations of weaving and tufting mastery.',
  },
  {
    icon:  'custom',
    title: 'Custom Manufacturing',
    desc:  'Bespoke sizes, colours and private-label programmes tailored to your market.',
  },
]
