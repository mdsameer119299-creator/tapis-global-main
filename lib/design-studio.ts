// ─── DESIGN STUDIO PAGE CONTENT ───────────────────────────────

export const DESIGN_STUDIO_STATS = {
  colors: '1600+',
  colorsLabel: 'Curated Colors',
  matching: 'Custom Shade Matching',
  yarns: 'Premium Yarns & Fibers',
  expert: 'Expert Color Development',
} as const

export const DESIGN_STUDIO_SUBNAV = [
  { id: 'color-library',      label: 'Color Library',      icon: 'palette' },
  { id: 'materials',          label: 'Materials',          icon: 'yarn' },
  { id: 'dyeing',             label: 'Dyeing Process',     icon: 'dye' },
  { id: 'custom-matching',    label: 'Custom Matching',    icon: 'match' },
  { id: 'design-development', label: 'Design Development', icon: 'design' },
] as const

export const DESIGN_STUDIO_FEATURES = [
  {
    id: 'materials',
    title: 'Materials We Work With',
    image: '/images/wool-drying-pic.webp',
    imageAlt: 'Premium yarn materials — Tapis Global',
    bullets: [
      'New Zealand Wool',
      'Silk & Viscose',
      'Cotton & Jute',
      'Linen & Natural Fibres',
      'Recycled & Eco Yarns',
    ],
    cta: { label: 'Explore Materials', href: '#materials' },
  },
  {
    id: 'dyeing',
    title: 'Dyeing & Color Process',
    image: '/images/vibrant-wool-dying.webp',
    imageAlt: 'Dyeing and colour development — Bhadohi',
    bullets: [
      'High-quality AZO-free dyes',
      'Lab-dip colour approval',
      'Batch consistency across bulk',
      'Environment-conscious processes',
    ],
    cta: { label: 'Our Process', href: '#dyeing' },
  },
  {
    id: 'custom-matching',
    title: 'Custom Color Matching',
    image: '/images/tgi-banner-3.webp',
    imageAlt: 'Custom colour matching for interiors',
    bullets: [
      'Pantone & RAL matching',
      'Paint code matching',
      'Physical sample matching',
      'Architect specification support',
    ],
    cta: { label: 'Learn More', href: '/contact' },
  },
  {
    id: 'design-development',
    title: 'Design Development',
    image: '/images/tgi-banner-5.webp',
    imageAlt: 'Design development and custom carpets',
    bullets: [
      'Concept & moodboard',
      'CAD & technical drawings',
      'Sample weaving & approval',
      'Production-ready artwork',
    ],
    cta: { label: 'Our Process', href: '/custom' },
  },
  {
    id: 'color-card-service',
    title: 'Color Card Service',
    image: '/images/tgi-banner-6.webp',
    imageAlt: 'Tapis Global colour card service',
    bullets: [
      'Physical pom pom samples',
      'Material-specific shade cards',
      'Worldwide courier delivery',
      'Trade & project programmes',
    ],
    cta: { label: 'Request Now', href: '/contact' },
  },
] as const

export const DESIGN_STUDIO_PROCESS = [
  { step: '01', title: 'Share Your Requirement', desc: 'Send references, Pantone codes or project briefs.' },
  { step: '02', title: 'Color Development', desc: 'Lab dips and shade development in our Bhadohi studio.' },
  { step: '03', title: 'Sample Creation', desc: 'Physical samples for sign-off before bulk production.' },
  { step: '04', title: 'Production', desc: 'Handcrafted manufacturing with documented QC.' },
  { step: '05', title: 'Global Delivery', desc: 'Pan India project dispatch and worldwide export.' },
] as const

export const MATERIAL_FILTER_OPTIONS = [
  { value: 'all', label: 'All Materials' },
  { value: 'bsl', label: 'Botanical Silk Light' },
  { value: 'bsh', label: 'Botanical Silk Heavy' },
  { value: 'cpp', label: 'Cotton Pom Pom' },
  { value: 'wt', label: 'Wool & Tencel' },
  { value: 'vl', label: 'Viscose Loop' },
  { value: 'jn', label: 'Jute Natural' },
] as const

export const TONE_FILTER_OPTIONS = [
  { value: 'all', label: 'All Tones' },
  { value: 'neutral', label: 'Neutrals' },
  { value: 'warm', label: 'Warm' },
  { value: 'cool', label: 'Cool' },
  { value: 'deep', label: 'Deep / Dark' },
] as const
