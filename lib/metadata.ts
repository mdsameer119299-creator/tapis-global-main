// ─────────────────────────────────────────────────────────────────────────────
// lib/metadata.ts
// Reusable generateMetadata factory.  Import and call on any page:
//
//   export const metadata = buildMetadata(PAGE_META.products)
//
// Or with overrides:
//
//   export const metadata = buildMetadata({
//     ...PAGE_META.products,
//     title: 'Custom Title',
//   })
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next'
import {
  BRAND,
  OG_IMAGE,
  SEO_BASE_URL,
  TITLE_TEMPLATE,
} from './seo'

type PageMetaInput = {
  title:       string
  description: string
  keywords?:   string[]
  canonical?:  string
  ogImage?:    string
  noIndex?:    boolean
}

export function buildMetadata(input: PageMetaInput): Metadata {
  const {
    title,
    description,
    keywords    = [],
    canonical   = SEO_BASE_URL,
    ogImage     = OG_IMAGE.url,
    noIndex     = false,
  } = input

  return {
    // ── Core ──────────────────────────────────────────────────────────────
    title,
    description,
    keywords,
    authors: [{ name: BRAND.legalName, url: SEO_BASE_URL }],
    creator: BRAND.legalName,
    publisher: BRAND.legalName,

    // ── Canonical & alternate ────────────────────────────────────────────
    alternates: {
      canonical,
      languages: {
        'en-US': canonical,
        'en-GB': canonical,
        'x-default': canonical,
      },
    },

    // ── Robots ───────────────────────────────────────────────────────────
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index:            true,
          follow:           true,
          googleBot: {
            index:              true,
            follow:             true,
            'max-image-preview': 'large',
            'max-snippet':       -1,
            'max-video-preview': -1,
          },
        },

    // ── Open Graph ───────────────────────────────────────────────────────
    openGraph: {
      type:        'website',
      siteName:    BRAND.legalName,
      title,
      description,
      url:         canonical,
      locale:      BRAND.locale,
      images: [
        {
          url:    ogImage,
          width:  OG_IMAGE.width,
          height: OG_IMAGE.height,
          alt:    OG_IMAGE.alt,
          type:   OG_IMAGE.type,
        },
      ],
    },

    // ── Twitter / X ──────────────────────────────────────────────────────
    twitter: {
      card:        'summary_large_image',
      site:        BRAND.social.twitter,
      creator:     BRAND.social.twitter,
      title,
      description,
      images: [ogImage],
    },

    // ── Verification (add when you have these) ───────────────────────────
    verification: {
      // google:  'YOUR_GOOGLE_SEARCH_CONSOLE_TOKEN',
      // yandex:  'YOUR_YANDEX_TOKEN',
      // bing:    'YOUR_BING_WEBMASTER_TOKEN',
    },

    // ── App / PWA meta ────────────────────────────────────────────────────
    applicationName: BRAND.shortName,
    appleWebApp: {
      capable:           true,
      title:             BRAND.shortName,
      statusBarStyle:    'black-translucent',
    },
    formatDetection: {
      telephone: false,   // Prevents iOS auto-linking phone numbers
      address:   false,
      email:     false,
    },

    // ── Icons ─────────────────────────────────────────────────────────────
    icons: {
      icon: [
        { url: '/logos/tgi-header-logo1.png' },
      ],
      apple: [
        { url: '/logos/tgi-header-logo1.png', sizes: '180x180', type: 'image/png' },
      ],
    },

    // ── Manifest ──────────────────────────────────────────────────────────
    manifest: '/site.webmanifest',

    // ── Category ──────────────────────────────────────────────────────────
    category: 'Business & Industrial',

    // ── Other ─────────────────────────────────────────────────────────────
    other: {
      // Export / trade specific
      'business:contact_data:street_address':  BRAND.address.street,
      'business:contact_data:locality':        BRAND.address.city,
      'business:contact_data:region':          BRAND.address.state,
      'business:contact_data:postal_code':     BRAND.address.postal,
      'business:contact_data:country_name':    'India',
      'business:contact_data:email':           BRAND.email,
      'business:contact_data:phone_number':    BRAND.phone,
      'business:contact_data:website':         SEO_BASE_URL,

      // Geo tags (used by some local search engines)
      'geo.region':      `${BRAND.address.country}-${BRAND.address.region}`,
      'geo.placename':   BRAND.address.city,
      'geo.position':    `${BRAND.geo.lat};${BRAND.geo.lng}`,
      'ICBM':            `${BRAND.geo.lat}, ${BRAND.geo.lng}`,

      // Dublin Core (B2B / trade directories)
      'DC.title':        title,
      'DC.description':  description,
      'DC.publisher':    BRAND.legalName,
      'DC.type':         'InteractiveResource',
      'DC.format':       'text/html',
      'DC.language':     'en',
      'DC.subject':      'Handmade Carpet Manufacturer India; Rug Exporter Bhadohi',
    },
  }
}

// ─── TITLE TEMPLATE ──────────────────────────────────────────────────────────
// Set this in root layout so all child pages auto-suffix their titles
export { TITLE_TEMPLATE }
