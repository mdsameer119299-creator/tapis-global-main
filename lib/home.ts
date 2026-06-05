import type { ReactNode } from 'react'

// ─── TRUST RIBBON ─────────────────────────────────────────────
export type TrustItem = {
  text: string
  icon: ReactNode
}

export const TRUST_RIBBON_ITEMS: Omit<TrustItem, 'icon'>[] = [
  { text: 'Established 1998'              },
  { text: 'Made in Bhadohi'               },
  { text: 'Worldwide Export'              },
  { text: 'Custom Manufacturing'          },
  { text: 'Hospitality Projects'           },
  { text: 'Luxury Residential Projects'   },
  { text: 'ISO 9001:2015 Certified'       },
]

// ─── WHO WE ARE ───────────────────────────────────────────────
export type WhoPoint = {
  title: string
  body:  string
  icon:  'factory' | 'globe' | 'layers'
}

export const WHO_WE_ARE = {
  image:    '/images/tgi-banner-5.webp',
  badgeNum: '3rd',
  badgeLbl: 'Generation\nArtisans',
  headline: 'Crafted in Bhadohi.',
  headlineEm: 'Designed for Every Space.',
  lead:     'Tapis Global International Pvt. Ltd. combines generations of Bhadohi craftsmanship with contemporary manufacturing expertise to create premium flooring solutions for residential, hospitality, commercial and international markets. From bespoke rugs and handcrafted carpets to large-scale project flooring, every product is developed with precision, material integrity and an uncompromising commitment to quality.',
  lead2:    'Serving architects, interior designers, hospitality groups, developers and global buyers, we transform ideas into flooring solutions tailored to each project\'s vision, performance requirements and design language.',
  points: [
    {
      icon: 'factory' as const,
      title: 'Integrated Manufacturing',
      body:  'Specification-led production under one Bhadohi campus — material integrity, documented quality control and full traceability from development through dispatch for residential, hospitality and commercial programmes.',
    },
    {
      icon: 'globe' as const,
      title: 'Pan India & Global Supply',
      body:  'Project execution across India for hotels, corporate interiors, retail and luxury residences — alongside export-ready manufacturing and compliance documentation for international supply partnerships.',
    },
    {
      icon: 'layers' as const,
      title: 'Design-Led Custom Development',
      body:  'In-house studio support for bespoke dimensions, colour development, tender specifications and tailored solutions — from statement residential pieces to multi-phase hospitality roll-outs.',
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
  image: '/images/manufacturing-rug-img.webp',
  lead:  'An 80,000 sq ft integrated campus where specification-led production, quality control and batch consistency are managed end-to-end — giving architects, developers and project teams traceability, reliability and confidence at every milestone.',
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
  quote:     'From specification-led projects across India to luxury interiors in 45+ markets — one partner for design capability, project execution and global supply.',
  tickerTitle: 'Markets We Serve',
  tickerSubtitle: 'Pan India Projects & International Partnerships',
}
