// ─────────────────────────────────────────────────────────────────────────────
// lib/seo.ts  — Single source of truth for all SEO metadata
// Edit this file to update titles, descriptions, OG images, keywords etc.
// ─────────────────────────────────────────────────────────────────────────────

export const SEO_BASE_URL = 'https://www.tapisglobal.com'  // ← update to live domain

// ─── OG IMAGE ────────────────────────────────────────────────────────────────
// Replace with your actual hosted OG image (1200×630px recommended)
export const OG_IMAGE = {
  url:    `${SEO_BASE_URL}/images/tgi-banner-1.webp`,
  width:  1200,
  height: 630,
  alt:    'Tapis Global International — Premium Carpet & Flooring Solutions from Bhadohi, India',
  type:   'image/webp' as const,
}

// ─── BRAND IDENTITY ──────────────────────────────────────────────────────────
export const BRAND = {
  legalName:   'Tapis Global International Pvt Ltd',
  shortName:   'Tapis Global',
  tagline:     'Premium Carpets. Pan India. Worldwide.',
  established: 1998,
  country:     'IN',
  language:    'en',
  locale:      'en_US',

  // Contact
  phone:    '+91-84482-91631',
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

// ─── PRIMARY KEYWORDS (research-based, high-intent) ──────────────────────────
// Tier 1: High commercial intent — manufacturer & supplier searches
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

// Tier 2: Product-specific
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

// Tier 3: Brand / location
export const KEYWORDS_BRAND = [
  'Tapis Global International',
  'carpet manufacturer Bhadohi',
  'Bhadohi carpet supplier',
  'UP carpet manufacturer',
  'Indian handloom carpet manufacturer',
  'ISO certified carpet manufacturer India',
  'carpet manufacturer for hospitality projects',
]

// All keywords combined
export const KEYWORDS_ALL = [
  ...KEYWORDS_PRIMARY,
  ...KEYWORDS_PRODUCT,
  ...KEYWORDS_BRAND,
]

// ─── PAGE-LEVEL METADATA ─────────────────────────────────────────────────────
// Each page gets its own optimised title + description
export const PAGE_META = {

  home: {
    title:       'Carpet Manufacturer India | Handmade Carpets & Rugs — Tapis Global International',
    description: 'Tapis Global International — handmade carpet and rug manufacturer from Bhadohi, India. Supplying hand tufted carpets, hand knotted rugs, jute rugs, wall-to-wall carpets and custom flooring to architects, hotels, developers and interior designers across India and international markets.',
    keywords:    [
      'Carpet Manufacturer India',
      'Rug Manufacturer India',
      'Carpet Supplier India',
      'Handmade Carpet Manufacturer',
      'Bhadohi Carpet Manufacturer',
      'Hand Tufted Carpets',
      'Hand Knotted Rugs',
      'Jute Rugs',
      'Wall to Wall Carpets',
      'Custom Rugs',
      'Hotel Carpet Supplier',
      ...KEYWORDS_PRIMARY.slice(0, 4),
    ],
    canonical:   SEO_BASE_URL,
  },

  products: {
    title:       `Carpet & Rug Manufacturer India | Product Collections — Tapis Global International`,
    description: `Explore carpet and rug collections from Tapis Global International — hand tufted carpets, hand knotted rugs, jute & sisal rugs, wall-to-wall carpets, flat weaves, shaggy rugs, leather carpets, poufs and coco coir. Manufacturer, supplier and exporter from Bhadohi, India.`,
    keywords:    [
      'Carpet Manufacturer India',
      'Rug Manufacturer India',
      'Carpet Supplier India',
      'Bhadohi Carpet Manufacturer',
      ...KEYWORDS_PRODUCT,
    ],
    canonical:   `${SEO_BASE_URL}/products`,
  },

  about: {
    title:       `About Tapis Global International | Premium Carpet & Flooring Solutions`,
    description: `Established in 1998, Tapis Global is a premium handmade carpet manufacturer from Bhadohi — serving architects, hospitality projects, commercial interiors, pan India supply and international markets with ISO-certified quality.`,
    keywords:    KEYWORDS_BRAND,
    canonical:   `${SEO_BASE_URL}/about`,
  },

  contact: {
    title:       `Contact Tapis Global | Project Enquiries & Custom Carpet Solutions`,
    description: `Contact Tapis Global — corporate office New Delhi, manufacturing Bhadohi. Call +91 84482 91631 or email sales@tapisglobalinternational.com for projects, samples and enquiries.`,
    keywords:    [...KEYWORDS_PRIMARY, 'carpet project enquiry', 'custom rug supplier India'],
    canonical:   `${SEO_BASE_URL}/contact`,
  },

  gallery: {
    title:       `Carpet & Rug Gallery | Handmade Collections by Tapis Global International`,
    description: `Browse our gallery of handmade carpets, rugs and floor coverings. View hand tufted, hand knotted, kilim, jute and custom hospitality carpet installations from our Bhadohi factory.`,
    keywords:    [...KEYWORDS_PRODUCT, 'carpet gallery India', 'handmade rug photos'],
    canonical:   `${SEO_BASE_URL}/gallery`,
  },

  samples: {
    title:       `Carpet Sample Swatches | 1600+ Curated Shades — Tapis Global International`,
    description: `Browse 1600+ curated carpet colours across wool, silk, viscose, cotton and jute collections. Request colour cards and trade samples from Tapis Global International, Bhadohi, India.`,
    keywords:    [...KEYWORDS_PRODUCT, 'carpet sample swatches', 'rug colour samples wholesale', 'wool carpet samples India', 'free carpet samples trade'],
    canonical:   `${SEO_BASE_URL}/design-studio`,
  },

  designStudio: {
    title:       `Design Studio | 1600+ Colours & Custom Carpet Development — Tapis Global`,
    description: `Explore the Tapis Global Design Studio — 1600+ curated yarn colours, custom shade matching, premium materials and full design development for architects, hotels and luxury projects. Bhadohi, India.`,
    keywords:    [...KEYWORDS_PRODUCT, 'carpet design studio India', 'custom rug colour matching', 'yarn colour library', 'architect carpet samples', 'Pantone carpet matching'],
    canonical:   `${SEO_BASE_URL}/design-studio`,
  },

  blogs: {
    title:       `Carpet & Design Insights | Luxury Flooring Blog — Tapis Global`,
    description: `Expert articles on luxury carpets, hospitality flooring, architect specifications, Bhadohi craftsmanship, custom rug design and project sourcing from Tapis Global International.`,
    keywords:    [...KEYWORDS_BRAND, 'carpet design blog', 'hospitality flooring insights', 'luxury carpet guides'],
    canonical:   `${SEO_BASE_URL}/blogs`,
  },

  custom: {
    title:       `Custom Carpet Design | Bespoke Rugs for Architects & Luxury Projects — Tapis Global`,
    description: `Design custom carpets with Tapis Global. Bespoke size, colour, texture and material for hotels, offices, villas and designer interiors. Pan India execution and export quality from Bhadohi.`,
    keywords:    [...KEYWORDS_PRODUCT, 'custom carpet manufacturer', 'bespoke rug design India', 'architect custom carpet', 'hotel custom carpet'],
    canonical:   `${SEO_BASE_URL}/custom`,
  },

  catalogue: {
    title:       `Request Luxury Carpet Catalogue | Tapis Global International — Bhadohi, India`,
    description: `Request our premium digital carpet catalogue — collections for architects, hospitality projects, luxury interiors and international buyers. Delivered to your inbox within 24 hours.`,
    keywords:    [...KEYWORDS_PRODUCT, 'carpet catalogue download', 'luxury carpet lookbook', 'hospitality carpet catalogue India'],
    canonical:   `${SEO_BASE_URL}/catalogue`,
  },
}

// ─── DEFAULT TITLE TEMPLATE ───────────────────────────────────────────────────
// Used for sub-pages. %s is replaced with the page title.
export const TITLE_TEMPLATE = `%s | Tapis Global International — Handmade Carpet Manufacturer, Bhadohi`

// ─── TWITTER CARD CONFIG ──────────────────────────────────────────────────────
export const TWITTER_META = {
  card:        'summary_large_image' as const,
  site:        BRAND.social.twitter,
  creator:     BRAND.social.twitter,
  title:       PAGE_META.home.title,
  description: PAGE_META.home.description,
  images:      [OG_IMAGE.url],
}
