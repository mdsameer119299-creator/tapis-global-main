import type { ReactNode } from 'react'

// ─── TRUST RIBBON ─────────────────────────────────────────────
export type TrustItem = {
  text: string
  icon: ReactNode
}

export const TRUST_RIBBON_ITEMS: Omit<TrustItem, 'icon'>[] = [
  { text: 'ISO 9001:2015 Certified'           },
  { text: 'OEKO-TEX Standard 100'             },
  { text: 'Pan India Project Supply'          },
  { text: 'Architect & Designer Support'      },
  { text: 'Hospitality & Commercial Flooring' },
  { text: 'GoodWeave Fair Labour'             },
  { text: 'Export Quality Manufacturing'      },
]

// ─── WHO WE ARE ───────────────────────────────────────────────
export type WhoPoint = {
  title: string
  body:  string
  icon:  'factory' | 'globe' | 'layers'
}

export const WHO_WE_ARE = {
  image:    '/images/tgi-banner-5.png',
  badgeNum: '3rd',
  badgeLbl: 'Generation\nArtisans',
  headline: 'Crafted in Bhadohi.',
  headlineEm: 'Designed for Every Space.',
  lead:     'From a single loom in 1998 to an 80,000 sq ft vertically integrated campus, Tapis Global has evolved into a complete luxury carpet and flooring solutions brand — serving architects, interior designers, hospitality groups, developers, institutional buyers and international clients with equal dedication.',
  points: [
    {
      icon: 'factory' as const,
      title: 'Vertically Integrated Manufacturing',
      body:  'Raw fibre to finished carpet — dyeing, weaving, tufting, washing, QC and project packing under one roof in Bhadohi. Full traceability for residential, commercial and export programmes.',
    },
    {
      icon: 'globe' as const,
      title: 'Pan India & International Operations',
      body:  'Project execution across India for hotels, offices, retail and luxury homes — alongside export-quality manufacturing and documentation for buyers in 45+ countries worldwide.',
    },
    {
      icon: 'layers' as const,
      title: 'Design-Led Custom Capabilities',
      body:  'In-house studio support for architects and designers. Pantone colour matching, sample development, tender specifications and bespoke manufacturing at any scale.',
    },
  ] satisfies WhoPoint[],
}

// ─── PROJECT INQUIRY ──────────────────────────────────────────
export const INQUIRY_LEGALS = [
  'GST: 09XXXXX000X1Z5',
  'IEC: TGIPXXXXX',
  'CIN: U17299UP1998PTC',
  'MSME: UDYAM-UP-XX',
]

export const BUYER_TYPES = [
  'Architect / Interior Designer',
  'Builder / Developer',
  'Hotel / Hospitality Group',
  'Corporate / Commercial Project',
  'Government / Institutional Tender',
  'Retail / Wholesale Buyer',
  'Luxury Residential Client',
  'International Importer',
  'Other',
]

export const ORDER_SIZES = [
  'Single custom piece',
  '10–50 pieces',
  '50–200 pieces',
  '200–500 pieces',
  '500+ pieces / bulk project',
  'Full project / tender scope',
]

export const INQUIRY_PRODUCTS = [
  'Hand Knotted',
  'Hand Tufted',
  'Flatweave / Kilim',
  'Wall-to-Wall / Contract',
  'Custom / Bespoke Design',
  'Multiple Categories',
]

// ─── MARKET REACH TAGS ────────────────────────────────────────
export const EXPORT_DESTINATION_TAGS = [
  { flag: '🇮🇳', label: 'Pan India'     },
  { flag: '🇺🇸', label: 'USA'           },
  { flag: '🇬🇧', label: 'UK'            },
  { flag: '🇩🇪', label: 'Germany'       },
  { flag: '🇦🇪', label: 'UAE'           },
  { flag: '🇦🇺', label: 'Australia'     },
  { flag: '🇸🇦', label: 'KSA'           },
  { flag: '🇫🇷', label: 'France'        },
  { flag: '🇨🇦', label: 'Canada'        },
  { flag: '🇸🇬', label: 'Singapore'     },
  { flag: '🇮🇹', label: 'Italy'         },
  { flag: null,   label: '+ 35 markets'  },
]

export const MFG_HEADER = {
  image: '/images/manufacturing-rug-img.png',
  lead:  '80,000 sq ft. 500+ artisans. Zero subcontracting. Every step from fibre to finished floor covering happens under our roof — giving architects, project teams and buyers complete quality control and supply chain transparency.',
}

export const EXPORT_INLINE_STATS = [
  { value: 'Pan', suffix: '',  label: 'India Supply'        },
  { value: '45',  suffix: '+', label: 'Global Markets'      },
  { value: '25',  suffix: '+', label: 'Years of Excellence' },
  { value: '80',  suffix: '%', label: 'Client Retention'    },
]

export const MARKETS_HEADER = {
  eyebrow:   'India & Global Reach',
  title:     'Serving Premium Interiors',
  titleEm:   'Across India & Worldwide.',
  quote:     'From architect-specified projects in India to luxury floors across 45 countries — one manufacturer, complete solutions.',
  tickerTitle: 'Markets We Serve',
  tickerSubtitle: 'Pan India Projects & International Partnerships',
}
