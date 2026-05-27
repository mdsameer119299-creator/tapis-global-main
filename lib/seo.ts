// ─────────────────────────────────────────────────────────────────────────────
// lib/seo.ts  — Single source of truth for all SEO metadata
// Edit this file to update titles, descriptions, OG images, keywords etc.
// ─────────────────────────────────────────────────────────────────────────────

export const SEO_BASE_URL = 'https://www.tapisglobal.com'  // ← update to live domain

// ─── OG IMAGE ────────────────────────────────────────────────────────────────
// Replace with your actual hosted OG image (1200×630px recommended)
export const OG_IMAGE = {
  url:    `${SEO_BASE_URL}/images/tgi-banner-1.png`,
  width:  1200,
  height: 630,
  alt:    'Tapis Global International — Premium Carpet & Flooring Solutions from Bhadohi, India',
  type:   'image/png' as const,
}

// ─── BRAND IDENTITY ──────────────────────────────────────────────────────────
export const BRAND = {
  legalName:   'Tapis Global International Pvt Ltd',
  shortName:   'Tapis Global',
  tagline:     'Premium Carpets. Pan India. Worldwide.',
  established: 1994,
  country:     'IN',
  language:    'en',
  locale:      'en_US',

  // Contact
  phone:    '+91-9415-234-567',
  email:    'exports@tapisglobal.com',
  whatsapp: 'https://wa.me/919415234567',

  // Address (structured)
  address: {
    street:   'Carpet Mandi',
    city:     'Bhadohi',
    state:    'Uttar Pradesh',
    postal:   '221 401',
    country:  'IN',
    region:   'UP',
  },

  // Social handles
  social: {
    linkedin:  'https://www.linkedin.com/company/tapis-global-international',
    instagram: 'https://www.instagram.com/tapisglobal',
    facebook:  'https://www.facebook.com/tapisglobal',
    twitter:   '@TapisGlobal',
  },

  // Geographic coords of Bhadohi
  geo: { lat: 25.3928, lng: 82.5661 },
}

// ─── PRIMARY KEYWORDS (research-based, high-intent) ──────────────────────────
// Tier 1: High commercial intent — buyer searches
export const KEYWORDS_PRIMARY = [
  'luxury carpet manufacturer India',
  'custom carpet manufacturer India',
  'pan India carpet supplier',
  'architect carpet solutions India',
  'interior designer carpet supplier',
  'hospitality carpet manufacturer India',
  'commercial flooring solutions India',
  'handmade carpet manufacturer Bhadohi',
  'hotel carpet supplier India',
  'premium rugs manufacturer India',
  'hand tufted carpet manufacturer',
  'hand knotted carpet manufacturer India',
]

// Tier 2: Product-specific
export const KEYWORDS_PRODUCT = [
  'luxury carpets wholesale',
  'custom carpets for hotels',
  'hospitality carpet supplier',
  'commercial flooring carpets',
  'hand tufted carpets manufacturer',
  'hand knotted rugs luxury',
  'wool carpet manufacturer India',
  'silk carpet custom design',
  'jute rug manufacturer',
  'flat weave carpet India',
  'wall to wall carpet commercial',
  'hotel carpet manufacturer India',
  'architect specified carpets',
  'export quality carpets India',
]

// Tier 3: Brand / location
export const KEYWORDS_BRAND = [
  'Tapis Global International',
  'carpet manufacturer Bhadohi India',
  'Bhadohi carpet exporter',
  'Mirzapur carpet manufacturer',
  'UP carpet exporter',
  'Indian handloom carpet exporter',
  'ISO certified carpet manufacturer India',
  'OEKO-TEX certified carpet India',
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
    title:       `${BRAND.legalName} | Premium Carpet Manufacturer — Pan India & Global Projects`,
    description: `Tapis Global International — luxury handmade carpet and flooring solutions from Bhadohi. Custom carpets for architects, interior designers, hospitality, commercial projects and tenders across India — with export-quality manufacturing for international buyers.`,
    keywords:    KEYWORDS_ALL,
    canonical:   SEO_BASE_URL,
  },

  products: {
    title:       `Luxury Carpet Collections | Hotels, Homes & Commercial Projects — Tapis Global`,
    description: `Nine premium carpet categories — hand tufted, knotted, shaggy, jute, leather, wall-to-wall, flat weaves, poufs and coco coir. For hotels, villas, offices, retail and designer interiors across India and worldwide.`,
    keywords:    KEYWORDS_PRODUCT,
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
    description: `Contact Tapis Global for custom carpet projects, hospitality supply, pan India enquiries, tender specifications and international orders. Our team responds within 12 hours. Call +91-9415-234-567.`,
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
    title:       `Carpet Sample Swatches | 430+ Pom Pom Shades — Tapis Global International`,
    description: `Browse 430+ pom pom carpet swatches across wool, silk, viscose, cotton and jute collections. Request free trade samples dispatched within 3–5 working days. Tapis Global International, Bhadohi, India.`,
    keywords:    [...KEYWORDS_PRODUCT, 'carpet sample swatches', 'rug colour samples wholesale', 'wool carpet samples India', 'free carpet samples trade'],
    canonical:   `${SEO_BASE_URL}/samples`,
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
export const TITLE_TEMPLATE = `%s | Tapis Global International — Carpet Manufacturer India`

// ─── TWITTER CARD CONFIG ──────────────────────────────────────────────────────
export const TWITTER_META = {
  card:        'summary_large_image' as const,
  site:        BRAND.social.twitter,
  creator:     BRAND.social.twitter,
  title:       PAGE_META.home.title,
  description: PAGE_META.home.description,
  images:      [OG_IMAGE.url],
}
