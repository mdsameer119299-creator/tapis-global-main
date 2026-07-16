import type { ReactNode } from 'react'

// ─── TRUST RIBBON ─────────────────────────────────────────────
export type TrustItem = {
  text: string
  icon: ReactNode
}

export const TRUST_RIBBON_ITEMS: Omit<TrustItem, 'icon'>[] = [
  { text: 'Family Heritage Since 1965'    },
  { text: 'Made in Bhadohi'               },
  { text: 'Worldwide Export'              },
  { text: 'Custom Manufacturing'          },
  { text: 'Hospitality Projects'           },
  { text: 'Luxury Residential Projects'   },
  { text: 'ISO 9001:2015-Aligned Processes' },
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
  headline: 'Handmade Carpet Manufacturer.',
  headlineEm: 'Bhadohi, India.',
  lead:     'Tapis Global International Pvt. Ltd. is a handmade carpet and rug manufacturer based in Bhadohi, India — combining generations of craft heritage with modern manufacturing capability. From hand tufted carpets and hand knotted rugs to jute rugs, wall-to-wall carpets and custom flooring, every product is developed with precision, material integrity and an uncompromising commitment to quality.',
  lead2:    'We serve architects, interior designers, hospitality groups, developers and procurement teams — supplying premium carpets and rugs across India and to international markets from our integrated Bhadohi manufacturing facility.',
  points: [
    {
      icon: 'factory' as const,
      title: 'Integrated Manufacturing Facility',
      body:  'A large in-house Bhadohi campus manufacturing hand tufted carpets, hand knotted rugs, jute rugs, wall-to-wall carpets and custom flooring — with documented quality control and full traceability from development to dispatch.',
    },
    {
      icon: 'globe' as const,
      title: 'Pan India Projects & International Supply',
      body:  'Supplying hotels, corporate interiors, luxury residences and retail spaces across India — alongside international market supply for architects, designers and procurement teams worldwide.',
    },
    {
      icon: 'layers' as const,
      title: 'Custom Rug & Carpet Development',
      body:  'In-house design studio for bespoke dimensions, Pantone-matched colour development and custom carpet specifications — from single statement pieces to large-scale hospitality and commercial roll-outs.',
    },
  ] satisfies WhoPoint[],
}

// ─── PROJECT INQUIRY ──────────────────────────────────────────
export const INQUIRY_LEGALS = [
  'GST: 09XXXXX000X1Z5',
  'IEC: TGIPXXXXX',
  'CIN: U17299UPXXXXPTC',
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
  { flag: null, label: 'Pan India Projects'                },
  { flag: null, label: 'Hospitality & Hotels'             },
  { flag: null, label: 'Luxury Residential'               },
  { flag: null, label: 'Corporate & Commercial'           },
  { flag: null, label: 'Architects & Designers'           },
  { flag: null, label: 'Developers & Tenders'             },
  { flag: null, label: 'International Markets'            },
]

export const MFG_HEADER = {
  image: '/images/manufacturing-rug-img.webp',
  lead:  'A large in-house integrated campus where specification-led production, quality control and batch consistency are managed end-to-end — giving architects, developers and project teams traceability, reliability and confidence at every milestone.',
}

export const EXPORT_INLINE_STATS = [
  { value: 'Pan', suffix: '',  label: 'India Projects'      },
  { value: '60',  suffix: '+', label: 'Years of Heritage' },
  { value: '500', suffix: '+', label: 'Specialist Artisans' },
  { value: '80',  suffix: 'K', label: 'Sq Ft Campus'        },
]

export const MARKETS_HEADER = {
  eyebrow:   'Projects Across India & International Markets',
  title:     'Trusted by Architects, Designers',
  titleEm:   'and Procurement Teams.',
  quote:     'Serving hospitality, commercial and residential spaces — from specification-led projects across India to premium supply for international markets.',
  tickerTitle: 'What We Manufacture',
  tickerSubtitle: 'Handmade Carpets & Rugs — Bhadohi, India',
}
