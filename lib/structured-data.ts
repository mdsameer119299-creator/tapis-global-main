// ─────────────────────────────────────────────────────────────────────────────
// lib/structured-data.ts
// Generates Schema.org JSON-LD for all page types.
// All schemas validated against Google Rich Results requirements.
// ─────────────────────────────────────────────────────────────────────────────

import { BRAND, SEO_BASE_URL, OG_IMAGE } from './seo'

// ─── ORGANIZATION ────────────────────────────────────────────────────────────
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'Corporation'],
    '@id': `${SEO_BASE_URL}/#organization`,
    name: BRAND.legalName,
    alternateName: [BRAND.shortName, 'Tapis Global', 'TGI Carpets'],
    url: SEO_BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SEO_BASE_URL}/logos/tgi-header-logo1.png`,
      width: 320,
      height: 100,
    },
    image: OG_IMAGE.url,
    description:
      'Tapis Global International Pvt Ltd is a premium handmade carpet and flooring solutions manufacturer based in Bhadohi, Uttar Pradesh, India. Serving architects, hospitality projects, commercial interiors and pan India supply — with export programmes to 45+ countries since 1998.',
    foundingDate: String(BRAND.established),
    foundingLocation: {
      '@type': 'Place',
      name: 'Bhadohi, Uttar Pradesh, India',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress:   BRAND.address.street,
      addressLocality: BRAND.address.city,
      addressRegion:   BRAND.address.state,
      postalCode:      BRAND.address.postal,
      addressCountry:  BRAND.address.country,
    },
    geo: {
      '@type':     'GeoCoordinates',
      latitude:    BRAND.geo.lat,
      longitude:   BRAND.geo.lng,
    },
    contactPoint: [
      {
        '@type':          'ContactPoint',
        telephone:        BRAND.phone,
        contactType:      'sales',
        areaServed:       'Worldwide',
        availableLanguage: ['English', 'Hindi'],
        email:            BRAND.email,
      },
      {
        '@type':     'ContactPoint',
        telephone:   BRAND.phone,
        contactType: 'customer service',
        areaServed:  'Worldwide',
      },
    ],
    sameAs: [
      BRAND.social.linkedin,
      BRAND.social.instagram,
      BRAND.social.facebook,
    ],
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      minValue: 200,
      maxValue: 500,
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Worldwide',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name:    'Handmade Carpet & Rug Collections',
      url:     `${SEO_BASE_URL}/products`,
    },
  }
}

// ─── LOCAL BUSINESS ───────────────────────────────────────────────────────────
export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'Store', 'ExportCompany'],
    '@id': `${SEO_BASE_URL}/#localbusiness`,
    name: BRAND.legalName,
    image: [OG_IMAGE.url, `${SEO_BASE_URL}/images/manufacturing-rug-img.png`],
    url:  SEO_BASE_URL,
    telephone: BRAND.phone,
    email:     BRAND.email,
    address: {
      '@type':           'PostalAddress',
      streetAddress:     BRAND.address.street,
      addressLocality:   BRAND.address.city,
      addressRegion:     BRAND.address.state,
      postalCode:        BRAND.address.postal,
      addressCountry:    BRAND.address.country,
    },
    geo: {
      '@type':    'GeoCoordinates',
      latitude:   BRAND.geo.lat,
      longitude:  BRAND.geo.lng,
    },
    openingHoursSpecification: [
      {
        '@type':     'OpeningHoursSpecification',
        dayOfWeek:   ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
        opens:       '09:00',
        closes:      '18:00',
      },
    ],
    priceRange: '₹₹₹',
    currenciesAccepted: 'USD, EUR, GBP, INR',
    paymentAccepted:    'Bank Transfer, LC, DA, DP',
    servesCuisine:      undefined,
    keywords: 'handmade carpet manufacturer, rug exporter, Bhadohi carpet, hand knotted rugs',
  }
}

// ─── WEBSITE ─────────────────────────────────────────────────────────────────
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type':    'WebSite',
    '@id':      `${SEO_BASE_URL}/#website`,
    name:       BRAND.legalName,
    alternateName: BRAND.shortName,
    url:        SEO_BASE_URL,
    description: 'Premium handmade carpet manufacturer, wholesaler and exporter from Bhadohi, India.',
    inLanguage: 'en-US',
    publisher: {
      '@id': `${SEO_BASE_URL}/#organization`,
    },
    potentialAction: {
      '@type':       'SearchAction',
      target:        `${SEO_BASE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

// ─── WEB PAGE ────────────────────────────────────────────────────────────────
export function webPageSchema({
  title,
  description,
  url,
  imageUrl,
  datePublished = '2024-01-01',
  dateModified,
}: {
  title:       string
  description: string
  url:         string
  imageUrl?:   string
  datePublished?: string
  dateModified?:  string
}) {
  return {
    '@context':     'https://schema.org',
    '@type':        'WebPage',
    '@id':          `${url}#webpage`,
    url,
    name:           title,
    description,
    inLanguage:     'en-US',
    isPartOf:       { '@id': `${SEO_BASE_URL}/#website` },
    about:          { '@id': `${SEO_BASE_URL}/#organization` },
    datePublished,
    dateModified:   dateModified ?? new Date().toISOString().split('T')[0],
    ...(imageUrl && {
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url:     imageUrl,
        width:   OG_IMAGE.width,
        height:  OG_IMAGE.height,
      },
    }),
    breadcrumb: {
      '@id': `${url}#breadcrumb`,
    },
  }
}

// ─── BREADCRUMB ───────────────────────────────────────────────────────────────
export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type':   'ListItem',
      position:  index + 1,
      name:      item.name,
      item:      item.url,
    })),
  }
}

// ─── PRODUCT (carpet/rug item) ────────────────────────────────────────────────
export function productSchema({
  name,
  description,
  imageUrl,
  url,
  material,
  moq,
}: {
  name:        string
  description: string
  imageUrl:    string
  url:         string
  material:    string
  moq:         string
}) {
  return {
    '@context':   'https://schema.org',
    '@type':      'Product',
    name,
    description,
    image:        imageUrl,
    url,
    brand: {
      '@type': 'Brand',
      name:    BRAND.legalName,
    },
    manufacturer: {
      '@id': `${SEO_BASE_URL}/#organization`,
    },
    material,
    countryOfOrigin: {
      '@type': 'Country',
      name:    'India',
    },
    offers: {
      '@type':           'Offer',
      availability:      'https://schema.org/InStock',
      priceCurrency:     'USD',
      priceSpecification: {
        '@type':    'UnitPriceSpecification',
        priceCurrency: 'USD',
        unitText:      'piece',
        description:   `Minimum order quantity: ${moq}`,
      },
      seller: {
        '@id': `${SEO_BASE_URL}/#organization`,
      },
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name:    'Minimum Order Quantity',
        value:   moq,
      },
      {
        '@type': 'PropertyValue',
        name:    'Country of Manufacture',
        value:   'India',
      },
    ],
  }
}

// ─── FAQ PAGE ─────────────────────────────────────────────────────────────────
type FaqItem = { q: string; a: string }

const DEFAULT_FAQS: FaqItem[] = [
    {
      q: 'What is the minimum order quantity for handmade carpets?',
      a: 'Our minimum order quantities vary by product: Hand Knotted Carpets start at 50 pieces, Hand Tufted Carpets at 100 pieces, Flat Weaves at 200 pieces, and Wall-to-Wall carpets at 500 square meters.',
    },
    {
      q: 'Do you offer custom sizes and designs for carpets?',
      a: 'Yes. Tapis Global International offers full customisation including size, shape, pile height, colour, pattern and material. We have an in-house design studio with 2000+ colour shades. Custom samples are available within 2–3 weeks.',
    },
    {
      q: 'What certifications do your carpets carry?',
      a: 'Our carpets and manufacturing processes are ISO 9001:2015 certified. We comply with OEKO-TEX Standard 100 for textile safety and use AZO-free dyes throughout our production. Fire-rated and GOTS-eligible certifications are available for specific product ranges.',
    },
    {
      q: 'What are your typical lead times for bulk carpet orders?',
      a: 'Standard lead times are: Hand Tufted Carpets 45–60 days, Hand Knotted Carpets 60–90 days, Flat Weaves and Braided 30–45 days, Wall-to-Wall carpets 45–60 days. Express production may be available subject to factory capacity.',
    },
    {
      q: 'Which countries does Tapis Global International export to?',
      a: 'We export handmade carpets to 45+ countries including the United States, United Kingdom, Germany, France, Australia, UAE, Saudi Arabia, Canada, Italy, Netherlands, Sweden, Belgium, Japan, South Korea and South Africa among others.',
    },
    {
      q: 'What payment terms are accepted?',
      a: 'We accept bank transfers (TT), Letters of Credit (LC), Documents against Acceptance (DA) and Documents against Payment (DP). Payment terms are negotiable for established buyers. We deal in USD, EUR, GBP and INR.',
    },
    {
      q: 'Can you produce private-label or OEM carpets?',
      a: 'Yes. We offer complete private-label and OEM manufacturing services. This includes custom branding, labelling, packaging design and confidentiality agreements for retail and interior design clients.',
    },
    {
      q: 'How do I request a sample from Tapis Global International?',
      a: 'You can request samples by emailing sales@tapisglobalinternational.com or enquiry@tapisglobalinternational.com, or via our website contact form. Standard samples are dispatched within 5–7 working days. Custom samples require 2–3 weeks production time.',
    },
  ]

export function faqSchema(faqs: FaqItem[] = DEFAULT_FAQS) {
  return {
    '@context':  'https://schema.org',
    '@type':     'FAQPage',
    mainEntity:  faqs.map(({ q, a }) => ({
      '@type':          'Question',
      name:             q,
      acceptedAnswer: {
        '@type': 'Answer',
        text:    a,
      },
    })),
  }
}

// ─── AGGREGATE RATING ──────────────────────────────────────────────────────
export function aggregateRatingSchema() {
  return {
    '@context': 'https://schema.org',
    '@type':    'Organization',
    '@id':      `${SEO_BASE_URL}/#organization`,
    name:       BRAND.legalName,
    aggregateRating: {
      '@type':       'AggregateRating',
      ratingValue:   '4.9',
      bestRating:    '5',
      worstRating:   '1',
      ratingCount:   '87',
      reviewCount:   '87',
    },
  }
}

// ─── HELPER: combine multiple schemas into a @graph ──────────────────────────
export function buildJsonLd(...schemas: object[]) {
  return {
    '@context': 'https://schema.org',
    '@graph':   schemas.map(s => {
      // Remove duplicate @context from individual schemas when combining
      const { '@context': _ctx, ...rest } = s as Record<string, unknown>
      return rest
    }),
  }
}
