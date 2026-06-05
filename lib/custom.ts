// ─── CUSTOM CARPET PAGE — content & data ─────────────────────

export const CUSTOM_HERO = {
  eyebrow:  'Bespoke Manufacturing',
  title:    'Design Your',
  titleEm:  'Custom Carpet.',
  lead:     'We transform your ideas into handcrafted luxury carpets tailored to your style, brand, and space.',
  cta:      'Request Custom Design',
  ctaHref:  '#custom-form',
  image:    '/images/tgi-banner-7.webp',
  imageAlt: 'Luxury custom carpet in premium interior — Tapis Global International',
}

export const CUSTOM_INTRO = {
  eyebrow: 'Made to Your Specification',
  title:   'Your Vision.',
  titleEm: 'Our Craft.',
  lead:     'At Tapis Global International, every custom carpet begins with your brief — not our catalogue. Send a sketch, photograph, Pantone reference or mood board. Our Bhadohi studio and production teams engineer size, colour, texture, material and pattern to your exact requirement.',
  body:    'From a statement rug for a luxury villa to phased hospitality roll-outs across multiple properties — or tender-specified bulk supply — we manufacture at premium quality with documented QC, sample approval and coordinated pan India or international dispatch.',
  capabilities: [
    'Custom size & shape — any dimension, round, runner or irregular',
    'Colour matching — Pantone, RAL and lab-dip approval before bulk',
    'Texture & pile — cut pile, loop, carved, shaggy and flatweave',
    'Material selection — wool, silk, viscose, cotton, jute and blends',
    'Pattern & logo carpets — medallions, borders and branded inlays',
    'Hotel, office & luxury residential programmes',
  ],
  highlights: [
    { value: '50',  suffix: '+', label: 'Piece MOQ' },
    { value: '7',   suffix: ' Days', label: 'Sample Turnaround' },
    { value: 'Pan', suffix: '',  label: 'India Projects' },
    { value: '45',  suffix: '+', label: 'Global Markets' },
  ],
}

export type CustomGalleryItem = {
  src:     string
  alt:     string
  caption: string
  span:    'tall' | 'wide' | 'square'
}

export const CUSTOM_GALLERY: CustomGalleryItem[] = [
  { src: '/images/handtufted-img-2.webp', alt: 'Modern luxury hand tufted carpet', caption: 'Contemporary Hand Tufted', span: 'wide' },
  { src: '/images/rug1.webp', alt: 'Luxury handmade wool rug texture', caption: 'Wool Texture Detail', span: 'tall' },
  { src: '/images/tgi-banner-4.webp', alt: 'Hotel lobby custom carpet installation', caption: 'Hospitality Installation', span: 'square' },
  { src: '/images/tgi-banner-5.webp', alt: 'Artisan weaving custom carpet Bhadohi', caption: 'Master Artisan at Work', span: 'square' },
  { src: '/images/rug3.webp', alt: 'Custom patterned luxury rug close-up', caption: 'Pattern & Colour Detail', span: 'tall' },
  { src: '/images/tufting-carpet.webp', alt: 'Tufting production custom carpet', caption: 'In-House Tufting Line', span: 'square' },
  { src: '/images/rug2.webp', alt: 'Premium knotted carpet collection', caption: 'Hand Knotted Excellence', span: 'square' },
  { src: '/images/manufacturing-rug-img.webp', alt: 'Custom carpet manufacturing workshop', caption: 'Premium Project Finishing', span: 'wide' },
]

export const CUSTOM_TRUST = [
  {
    icon:  'design',
    title: 'Custom Design Support',
    desc:  'In-house studio translates references into production-ready artwork with revision rounds until you approve.',
  },
  {
    icon:  'material',
    title: 'Premium Quality Materials',
    desc:  'New Zealand wool, pure silk, viscose and GOTS cotton — ethically sourced and batch-tested before weaving.',
  },
  {
    icon:  'globe',
    title: 'Pan India & Global Delivery',
    desc:  'Project dispatch across India and international freight to 45+ countries — with full documentation and coordinated logistics.',
  },
  {
    icon:  'craft',
    title: 'Skilled Craftsmanship',
    desc:  '500+ master weavers and tufters in Bhadohi — generational skills applied to every custom order.',
  },
  {
    icon:  'sample',
    title: 'Fast Sampling',
    desc:  'Approved lab dips and physical samples dispatched within 7 working days for sign-off before bulk.',
  },
  {
    icon:  'scale',
    title: 'Bulk Production Capacity',
    desc:  '80,000 sq ft vertically integrated campus — from single bespoke pieces to multi-container programmes.',
  },
]

export const CUSTOM_PROCESS = [
  { step: '01', title: 'Share Your Design',   desc: 'Send sketches, photos, Pantone refs or inspiration files — our team reviews within 24 hours.' },
  { step: '02', title: 'Discuss Requirements', desc: 'Size, material, construction, application and timeline aligned in a dedicated project consultation.' },
  { step: '03', title: 'Sampling & Approval',  desc: 'Lab dips and physical samples for colour, texture and hand-feel sign-off before production starts.' },
  { step: '04', title: 'Production',           desc: 'Handcrafted manufacturing with in-process QC, photographic records and milestone updates.' },
  { step: '05', title: 'Delivery & Installation Support', desc: 'Project packing, pre-dispatch inspection and coordinated delivery to your site, warehouse or international destination.' },
]

export const CUSTOM_TESTIMONIALS = [
  {
    quote:  'We needed a custom medallion for a Dubai hotel lobby — exact dimensions, fire-rated backing, gold thread accents. Tapis delivered sample in 6 days and bulk matched perfectly across three phases.',
    name:   'Rami Al-Farsi',
    role:   'Director — Mirage Interiors, UAE',
    type:   'Hospitality',
  },
  {
    quote:  'Our studio sends Pantone boards and CAD layouts. Tapis translates them into production files and never misses a colour match. They are our go-to for bespoke residential projects in Singapore.',
    name:   'Sarah Lim',
    role:   'Principal Designer — Prestige Floors',
    type:   'Interior Design',
  },
  {
    quote:  'Private-label custom collections with our branding, low MOQ and consistent reorder quality. Eight seasons in and not a single container dispute — that reliability is everything in wholesale.',
    name:   'Marcus Hoffmann',
    role:   'Head of Sourcing — Wohnart GmbH, Germany',
    type:   'Importer',
  },
]

export const CUSTOM_FAQ = [
  {
    q: 'Can I send my own design?',
    a: 'Yes. Send sketches, photographs, CAD files, mood boards or physical samples. Our design studio converts your reference into a production-ready specification with size, construction and material recommendations.',
  },
  {
    q: 'What is the minimum order quantity?',
    a: 'Custom programmes typically start from 50 pieces depending on construction and size. Single bespoke rugs and hospitality pilot rooms can be accommodated — contact us with your brief for an exact MOQ.',
  },
  {
    q: 'Do you supply projects across India?',
    a: 'Yes. We execute pan India project supply for hotels, corporate offices, luxury residential developments, retail environments and institutional tenders — with phased delivery and on-site coordination where required.',
  },
  {
    q: 'Do you export internationally?',
    a: 'We export to 45+ countries across Europe, the Americas, Middle East, Asia-Pacific and Africa. Full export documentation, FCL/LCL shipping and DDP options are available.',
  },
  {
    q: 'Can you customize size and colours?',
    a: 'Absolutely. Any dimension, shape or colour reference — Pantone, RAL or physical swatch. Lab-dip approval ensures bulk production matches your approved sample exactly.',
  },
  {
    q: 'How long does production take?',
    a: 'Samples: 5–7 working days after brief approval. Bulk production: typically 45–60 days depending on construction, quantity and finishing requirements. Phased hospitality deliveries can be scheduled.',
  },
]

export const CUSTOM_FINAL_CTA = {
  title:    'Bring Your Carpet',
  titleEm:  'Vision to Life.',
  lead:     'Share your design today — our project team responds within 12 hours with feasibility, sampling timeline and quotation.',
  cta:      'Start Your Custom Order',
  ctaHref:  '#custom-form',
}
