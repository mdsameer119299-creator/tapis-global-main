// ─────────────────────────────────────────────────────────────────────────────
// lib/seo.ts — Single source of truth for SEO metadata and keyword research.
// Keyword arrays are used for editorial planning and metadata only; Google does
// not use the meta-keywords tag as a ranking signal.
// ─────────────────────────────────────────────────────────────────────────────

export const SEO_BASE_URL = 'https://www.tapisglobalinternational.com'  // Production domain

// ─── OG IMAGE ────────────────────────────────────────────────────────────────
// Replace with your actual hosted OG image (1200×630px recommended)
export const OG_IMAGE = {
  url:    `${SEO_BASE_URL}/images/tgi-banner-1.webp`,
  width:  1200,
  height: 630,
  alt:    'Tapis Global International — Handmade Carpets and Rugs from Bhadohi, India',
  type:   'image/webp' as const,
}

// ─── BRAND IDENTITY ──────────────────────────────────────────────────────────
export const BRAND = {
  legalName:   'Tapis Global International Pvt Ltd',
  shortName:   'Tapis Global',
  tagline:     'Premium Carpets. Pan India. Worldwide.',
  established: 1965,
  country:     'IN',
  language:    'en',
  locale:      'en_US',

  // Contact
  phone:    '+91-84482-91631',
  landline: '+91-11-4558-7243',
  email:    'sales@tapisglobalinternational.com',
  emailEnquiry: 'enquiry@tapisglobalinternational.com',
  whatsapp: 'https://wa.me/918448291631',

  // Address (structured — manufacturing facility)
  address: {
    street:   'Industrial Estate',
    city:     'Bhadohi',
    state:    'Uttar Pradesh',
    postal:   '221401',
    country:  'IN',
    region:   'UP',
  },

  corporateOffice: {
    street:   '438/13, TKD Extension',
    city:     'New Delhi',
    state:    'Delhi',
    postal:   '110019',
    country:  'IN',
  },

  // Social handles
  social: {
    linkedin:  'https://www.linkedin.com/company/tapis-global-international',
    instagram: 'https://www.instagram.com/tapisglobalinternational',
    facebook:  'https://www.facebook.com/Tapisglobalinternational/',
    twitter:   '@TapisGlobal',
  },

  // Geographic coords of Bhadohi
  geo: { lat: 25.3928, lng: 82.5661 },
}

// ─── KEYWORD RESEARCH GROUPS ─────────────────────────────────────────────────
// These groups guide page targeting and content briefs. Avoid placing every
// keyword on every page: each URL should own one clear search intent.
export const KEYWORDS_PRIMARY = [
  'carpet manufacturer India',
  'rug manufacturer India',
  'carpet supplier India',
  'handmade carpet manufacturer India',
  'Bhadohi carpet manufacturer',
  'custom rug manufacturer India',
  'hotel carpet supplier India',
  'wall to wall carpet manufacturer India',
  'hand tufted carpet manufacturer India',
  'hand knotted carpet manufacturer India',
  'jute rug manufacturer India',
  'luxury carpet manufacturer Bhadohi',
]

export const KEYWORDS_PRODUCT = [
  'hand tufted carpets',
  'hand knotted rugs',
  'jute rugs India',
  'custom rugs manufacturer',
  'wall to wall carpets',
  'hotel carpet supplier',
  'hospitality carpet manufacturer',
  'commercial carpet supplier India',
  'wool carpet manufacturer India',
  'custom carpet design India',
  'broadloom carpet manufacturer',
  'bespoke rug manufacturer India',
  'carpet supplier for architects',
  'carpet manufacturer for interior designers',
]

export const KEYWORDS_BRAND = [
  'Tapis Global International',
  'carpet manufacturer Bhadohi',
  'Bhadohi carpet supplier',
  'UP carpet manufacturer',
  'Indian handmade carpet manufacturer',
  'carpet manufacturer for hospitality projects',
]

export const KEYWORDS_INDIA = [
  'carpet manufacturer Delhi NCR',
  'wholesale carpet supplier Mumbai',
  'carpet supplier Bengaluru',
  'hotel carpet supplier Hyderabad',
  'custom rugs Chennai',
  'carpet manufacturer Jaipur',
  'carpet supplier Ahmedabad',
  'carpet manufacturer Kolkata',
  'carpet wholesaler Pune',
  'carpet manufacturer Lucknow',
  'carpet supplier Gurugram',
  'carpet manufacturer Bhadohi',
]

export const KEYWORDS_INTERNATIONAL = [
  'India carpet exporter',
  'Indian rug manufacturer wholesale',
  'handmade rugs supplier for importers',
  'private label rug manufacturer India',
  'hotel carpet manufacturer for international projects',
  'custom area rug manufacturer India',
  'contract carpet supplier',
]

export const KEYWORDS_ALL = [
  ...KEYWORDS_PRIMARY,
  ...KEYWORDS_PRODUCT,
  ...KEYWORDS_BRAND,
  ...KEYWORDS_INDIA,
  ...KEYWORDS_INTERNATIONAL,
]

// ─── PAGE-LEVEL METADATA ─────────────────────────────────────────────────────
// Each page gets a unique title and description aligned to its primary intent.
export const PAGE_META = {

  home: {
    title:       'Carpet Manufacturer in India | Tapis Global',
    description: 'Tapis Global manufactures handmade carpets and rugs in Bhadohi, India for wholesale buyers, hotels, architects, interior designers and international projects.',
    keywords:    [
      'carpet manufacturer India',
      'handmade carpet manufacturer India',
      'rug manufacturer India',
      'carpet exporter India',
      'Bhadohi carpet manufacturer',
      'wholesale carpet supplier India',
      'hand tufted carpet manufacturer',
      'hand knotted rug manufacturer',
      'hotel carpet supplier India',
      'custom rug manufacturer India',
    ],
    canonical:   SEO_BASE_URL,
  },

  products: {
    title:       'Handmade Carpets & Rugs | Product Collections | Tapis Global',
    description: 'Explore hand-tufted carpets, hand-knotted rugs, wool and jute rugs, flatweaves and commercial flooring from Tapis Global, a manufacturer in Bhadohi, India.',
    keywords:    [
      'handmade carpet collections',
      'hand tufted carpet manufacturer',
      'hand knotted rugs wholesale',
      'wool carpet manufacturer India',
      'jute rug manufacturer India',
      'commercial carpet supplier',
      ...KEYWORDS_PRODUCT,
    ],
    canonical:   `${SEO_BASE_URL}/products`,
  },

  about: {
    title:       `About Tapis Global International | Carpet Manufacturer`,
    description: `Learn about Tapis Global International, a carpet and rug manufacturer based in Bhadohi, Uttar Pradesh, with a corporate office in New Delhi, India.`,
    keywords:    KEYWORDS_BRAND,
    canonical:   `${SEO_BASE_URL}/about`,
  },

  contact: {
    title:       `Contact Tapis Global | Carpet & Rug Enquiries`,
    description: `Contact Tapis Global for wholesale carpets, custom rugs, hospitality projects and export enquiries. Call +91 84482 91631 or email sales@tapisglobalinternational.com.`,
    keywords:    [...KEYWORDS_PRIMARY, 'carpet project enquiry', 'custom rug supplier India'],
    canonical:   `${SEO_BASE_URL}/contact`,
  },

  gallery: {
    title:       `Carpet & Rug Gallery | Tapis Global International`,
    description: `Explore handmade carpet and rug designs, including hand-tufted, hand-knotted, kilim, jute and hospitality flooring collections from Tapis Global, Bhadohi, India.`,
    keywords:    [...KEYWORDS_PRODUCT, 'carpet gallery India', 'handmade rug designs'],
    canonical:   `${SEO_BASE_URL}/gallery`,
  },

  samples: {
    title:       `Carpet Sample Swatches | Tapis Global International`,
    description: `Explore carpet colour and material options and enquire about trade samples from Tapis Global International, a carpet manufacturer in Bhadohi, India.`,
    keywords:    [...KEYWORDS_PRODUCT, 'carpet sample swatches', 'rug colour samples wholesale', 'wool carpet samples India'],
    canonical:   `${SEO_BASE_URL}/design-studio`,
  },

  designStudio: {
    title:       `Carpet Design Studio | Custom Colours & Rugs | Tapis Global`,
    description: `Explore carpet colour options, shade matching, materials and design development for architects, hotels and interior projects with Tapis Global, India.`,
    keywords:    [...KEYWORDS_PRODUCT, 'carpet design studio India', 'custom rug colour matching', 'yarn colour library', 'architect carpet samples'],
    canonical:   `${SEO_BASE_URL}/design-studio`,
  },

  custom: {
    title:       `Custom Carpet Manufacturer | Bespoke Rugs | Tapis Global`,
    description: `Develop custom carpets and bespoke rugs by size, colour, texture and material for hotels, offices, villas and design projects. Manufactured in Bhadohi, India.`,
    keywords:    [...KEYWORDS_PRODUCT, 'custom carpet manufacturer', 'bespoke rug design India', 'architect custom carpet', 'hotel custom carpet'],
    canonical:   `${SEO_BASE_URL}/custom`,
  },

  catalogue: {
    title:       `Carpet Manufacturer Catalogue | Tapis Global International`,
    description: `Request the Tapis Global carpet and rug catalogue for wholesale sourcing, architects, hospitality projects, luxury interiors and international buyers.`,
    keywords:    [...KEYWORDS_PRODUCT, 'carpet catalogue', 'wholesale rug catalogue', 'hospitality carpet catalogue India'],
    canonical:   `${SEO_BASE_URL}/catalogue`,
  },
}

// ─── DEFAULT TITLE TEMPLATE ───────────────────────────────────────────────────
// Keep the template concise; page-specific titles should carry the key intent.
export const TITLE_TEMPLATE = `%s | Tapis Global`

// ─── TWITTER CARD CONFIG ──────────────────────────────────────────────────────
export const TWITTER_META = {
  card:        'summary_large_image' as const,
  site:        BRAND.social.twitter,
  creator:     BRAND.social.twitter,
  title:       PAGE_META.home.title,
  description: PAGE_META.home.description,
  images:      [OG_IMAGE.url],
}
