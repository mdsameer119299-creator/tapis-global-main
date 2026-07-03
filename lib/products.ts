// ─── PRODUCTS — category system (main hub + premium landing pages) ─────
//
// Single source of truth for the dynamic /products/[slug] route.
// Each category is a full SEO landing page: manufacturer-first positioning,
// applications, manufacturing process, customization, technical specs, FAQs
// and related products. No duplicate routes — one rich data model drives all.

export type ProductGalleryImage = {
  src: string
  alt: string
}

export type ProductBullet = {
  label: string
  text:  string
}

export type ProductApplication = {
  title: string
  desc:  string
}

export type ProcessStep = {
  step:  string
  title: string
  desc:  string
}

export type TechSpec = {
  label: string
  value: string
}

export type ProductFaq = {
  q: string
  a: string
}

export type MaterialDetail = {
  name: string
  desc: string
}

export type UseCase = {
  title: string
  desc:  string
}

export type ProductCategory = {
  slug:        string
  name:        string
  cardImage:   string
  heroImage:   string
  tagline:     string
  /** Per-page SEO title tag (manufacturer → supplier → exporter) */
  seoTitle:    string
  /** Per-page meta description */
  seoDescription: string
  /** Per-page keyword set */
  seoKeywords: string[]
  /** On-page H1 — keyword-led, manufacturer positioning */
  h1:          string
  intro:       string
  body:        string
  /** Extra overview paragraph for depth (avoids thin content) */
  overview:    string
  bullets:     ProductBullet[]
  applications: ProductApplication[]
  process:     ProcessStep[]
  customization: string[]
  techSpecs:   TechSpec[]
  faqs:        ProductFaq[]
  idealFor:    string[]
  materials:   string[]
  moq:         string
  leadTime:    string
  /** Slugs of related categories for internal linking */
  related:     string[]
  gallery:     ProductGalleryImage[]
  // ── Depth fields (unique long-form content per page; no cross-page duplicates) ──
  /** 2–4 unique editorial paragraphs of additional depth */
  deepDive?:       string[]
  /** Per-material specification descriptions (unique to this product) */
  materialDetails?: MaterialDetail[]
  /** 2–3 unique paragraphs on export/supply for this product */
  exportInfo?:     string[]
  /** Detailed use-case scenarios beyond the applications grid */
  useCases?:       UseCase[]
  /** 3 guide slugs for related-guide internal links */
  relatedGuides?:  string[]
}

const POOL = [
  '/images/rug1.webp',
  '/images/rug2.webp',
  '/images/rug3.webp',
  '/images/rug4.webp',
  '/images/rug5.webp',
  '/images/tgi-banner-1.webp',
  '/images/tgi-banner-2.webp',
  '/images/tgi-banner-3.webp',
  '/images/tgi-banner-4.webp',
  '/images/tgi-banner-5.webp',
  '/images/tgi-banner-6.webp',
  '/images/tgi-banner-7.webp',
  '/images/handtufted-img-2.webp',
  '/images/tufting-carpet.webp',
  '/images/manufacturing-rug-img.webp',
  '/images/jute-rugs-manufacturing.webp',
  '/images/vibrant-wool-dying.webp',
  '/images/wool-drying-pic.webp',
  '/images/videoframe_15503.webp',
] as const

function gallery(primary: string[], name: string, captions: string[]): ProductGalleryImage[] {
  const imgs = [...primary, ...POOL.filter((p) => !primary.includes(p))]
  return Array.from({ length: 12 }, (_, i) => ({
    src: imgs[i % imgs.length],
    alt: captions[i % captions.length] ?? `${name} — Tapis Global International`,
  }))
}

export const PRODUCT_WHY_US = [
  { icon: 'craft',    title: 'Handmade in Bhadohi',        desc: 'Every piece passes through skilled artisan hands — tufters, weavers and finishers trained in Bhadohi\'s finest carpet-making traditions.' },
  { icon: 'export',   title: 'Premium Quality Standards',  desc: 'ISO 9001:2015, OEKO-TEX and multi-stage inspection — meeting architect, hospitality and project specification requirements.' },
  { icon: 'sustain',  title: 'Sustainable Materials',      desc: 'Ethically sourced wool, silk, jute and natural fibres with AZO-free dyes and GoodWeave fair-labour certification.' },
  { icon: 'custom',   title: 'Custom Manufacturing',       desc: 'Any size, colour, pattern or construction — from designer showrooms to multi-phase hotel and commercial programmes.' },
  { icon: 'delivery', title: 'Pan India Supply',           desc: 'Project dispatch across India for hotels, developers and commercial interiors — with documented QC and coordinated logistics.' },
  { icon: 'artisan',  title: '500+ Skilled Artisans',      desc: 'Master craftspeople across tufting, knotting, flatweave and finishing divisions under one Bhadohi roof.' },
]

// Two shared trust FAQs appended after each category's unique FAQs.
// Kept deliberately short so unique, category-specific content dominates each page.
function makeBaseFaqs(name: string): ProductFaq[] {
  return [
    {
      q: `Are you a manufacturer of ${name.toLowerCase()} or a reseller?`,
      a: `Tapis Global International is a direct manufacturer — every ${name.toLowerCase()} is produced at our own integrated facility in Bhadohi, India, rooted in a three-generation family carpet-making legacy since 1965. We are not a trading company or reseller; buying direct means better pricing, in-house quality control and full customisation.`,
    },
    {
      q: `Do you supply ${name.toLowerCase()} across India and internationally?`,
      a: `Yes. The majority of our supply serves projects across India — hotels, commercial interiors, builders and designers — alongside export programmes for international buyers. We handle documentation, packing and coordinated project delivery for both.`,
    },
  ]
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  // ─────────────────────────────────────────────────────────────── HAND TUFTED
  {
    slug:      'hand-tufted-carpet',
    name:      'Hand Tufted Carpet',
    cardImage: '/images/handtufted/handtufted-floral-carved-room.webp',
    heroImage: '/images/handtufted/handtufted-star-medallion-palace.webp',
    tagline:   'Hand tufted carpets crafted with precision, elegance and timeless artistry — manufactured in Bhadohi, India.',
    seoTitle:  'Hand Tufted Carpet Manufacturer in India | Bhadohi Supplier & Exporter — Tapis Global',
    seoDescription: 'Leading hand tufted carpet manufacturer and supplier in India. Custom wool & viscose hand tufted carpets from Bhadohi for hotels, architects, designers and commercial projects. Request a catalogue or quote.',
    seoKeywords: ['hand tufted carpet manufacturer India', 'hand tufted carpets', 'hand tufted carpet supplier India', 'Bhadohi hand tufted carpet', 'wool carpet manufacturer India', 'custom hand tufted carpet', 'hotel carpet supplier'],
    h1:        'Hand Tufted Carpet Manufacturer in India',
    intro:     'Tapis Global International is a leading hand tufted carpet manufacturer and supplier in India, combining the speed of modern tufting with the soul of handmade production — dense pile, rich colour and a luxurious hand feel for residential, hospitality and commercial interiors across India and worldwide.',
    body:      'Yarn is hand-guided through a primary backing using cut-pile, loop-pile and cut-and-loop constructions. The result is a versatile floor covering that accepts complex patterns, carved relief and multi-level textures at scale — without compromising the warmth of handcrafted production from our Bhadohi facility.',
    overview:  'As a manufacturer-direct supplier, we control every stage in-house — from yarn dyeing and tufting to washing, carving and binding. This gives architects, interior designers and procurement teams a single accountable partner for specification-led hand tufted carpets, with consistent quality across single statement rugs and multi-phase project roll-outs.',
    bullets: [
      { label: 'Craftsmanship', text: 'Hand-guided tufting operated by specialist teams — each piece finished with binding, shearing and washing for a premium hand feel.' },
      { label: 'Materials', text: 'New Zealand wool, Indian wool, viscose, cotton and polyester blends — batch-tested and OEKO-TEX compliant.' },
      { label: 'Customization', text: 'Any dimension, Pantone colour match, carved patterns and private-label OEM programmes with lab-dip approval.' },
      { label: 'Ideal Usage', text: 'Luxury residences, boutique hotels, retail showrooms and contract interiors across India and export markets.' },
    ],
    applications: [
      { title: 'Hotels & Hospitality', desc: 'Guest rooms, suites, lobbies and F&B areas — durable cut-pile constructions with custom medallions and fire-rated options.' },
      { title: 'Luxury Residences', desc: 'Statement living rooms, bedrooms and designer interiors with bespoke colour and carved texture detailing.' },
      { title: 'Corporate & Commercial', desc: 'Boardrooms, executive offices and retail showrooms requiring branded, design-led floor coverings.' },
      { title: 'Architect & Designer Projects', desc: 'Specification-led production to drawings, mood boards and Pantone references for residential and contract schemes.' },
    ],
    process: [
      { step: '01', title: 'Design & Lab-Dip', desc: 'Your design or our studio concept is translated to a tufting map; yarn shades are lab-dipped and approved against Pantone references.' },
      { step: '02', title: 'Hand Tufting', desc: 'Skilled artisans hand-guide tufting guns across the stretched backing, building cut and loop pile to the approved design.' },
      { step: '03', title: 'Latexing & Backing', desc: 'A secondary backing and latex coat lock every tuft in place for durability and dimensional stability.' },
      { step: '04', title: 'Carving, Washing & QC', desc: 'Pile is sheared and hand-carved, the carpet is washed and dried, then inspected against specification before dispatch.' },
    ],
    customization: [
      'Any custom size, shape and dimension (round, runner, oversized)',
      'Pantone and RAL colour matching with lab-dip approval',
      'Cut-pile, loop-pile, cut-and-loop and carved relief textures',
      'Custom pile height and yarn density (GSM)',
      'Logos, medallions and bespoke patterns for branded projects',
      'Private-label / OEM manufacturing for retailers and importers',
    ],
    techSpecs: [
      { label: 'Construction',   value: 'Hand Tufted (cut / loop / cut-and-loop)' },
      { label: 'Primary Materials', value: 'New Zealand Wool, Viscose, Cotton, Polyester' },
      { label: 'Pile Height',    value: '8 mm – 25 mm (customisable)' },
      { label: 'Weight (GSM)',   value: '2,500 – 5,500 GSM' },
      { label: 'Backing',        value: 'Cotton canvas + latex secondary backing' },
      { label: 'Certifications', value: 'ISO 9001:2015, OEKO-TEX, AZO-free dyes' },
    ],
    idealFor:  ['Luxury Homes', 'Hotels & Resorts', 'Architect Projects', 'Corporate Offices'],
    materials: ['New Zealand Wool', 'Viscose', 'Cotton', 'Wool-Viscose Blends'],
    moq:       '100 Pieces',
    leadTime:  '45–60 Days',
    related:   ['hand-knotted-carpet', 'wall-to-wall-carpets', 'shaggy-rugs'],
    faqs: [
      { q: 'What is the difference between hand tufted and hand knotted carpets?', a: 'Hand tufted carpets are made by punching yarn through a backing with a tufting tool and then latexing a secondary backing — faster to produce and ideal for bold designs at scale. Hand knotted carpets are individually knotted on a loom, taking far longer but lasting generations. As a manufacturer we produce both and can advise which suits your project, budget and durability needs.' },
      { q: 'Can you produce hand tufted carpets to my exact design and colours?', a: 'Yes. We are a custom hand tufted carpet manufacturer — share artwork, a mood board or Pantone references and our Bhadohi studio will create lab-dips and a sample for approval before bulk production.' },
      { q: 'Can you handle large hotel and hospitality carpet orders?', a: 'Yes. Hospitality is one of our core strengths — we produce hand tufted carpets for guest rooms, suites, lobbies and corridors at project scale, with fire-rated options, custom medallions and phased delivery aligned to your installation programme.' },
      { q: 'What yarn weight (GSM) do you recommend for high-traffic areas?', a: 'For high-traffic hospitality and commercial spaces we typically recommend 3,500–5,500 GSM with a dense cut-pile for durability. For residential rooms a lighter 2,500–3,500 GSM gives a luxurious feel. We advise the right specification for each zone of your project.' },
    ],
    gallery: [
      { src: '/images/handtufted/handtufted-star-medallion-palace.webp', alt: 'Gold and black star-medallion hand tufted carpet in a luxury room — Tapis Global International' },
      { src: '/images/handtufted/handtufted-floral-carved-room.webp',     alt: 'Carved floral hand tufted wool rug in a living room — Tapis Global International' },
      { src: '/images/handtufted/handtufted-leaf-vine-room.webp',         alt: 'Ivory hand tufted rug with green leaf-vine motif — Tapis Global International' },
      { src: '/images/handtufted/handtufted-botanical-room.webp',         alt: 'Botanical-pattern hand tufted wool rug — Tapis Global International' },
      { src: '/images/handtufted/handtufted-abstract-shaped-rug.webp',    alt: 'Free-form abstract shaped hand tufted rug — Tapis Global International' },
      { src: '/images/handtufted-img-2.webp',                             alt: 'Hand tufted cut-pile rug detail — Tapis Global International' },
      { src: '/images/tufting-carpet.webp',                               alt: 'Hand tufting in production at our Bhadohi facility — Tapis Global International' },
      { src: '/images/manufacturing-rug-img.webp',                        alt: 'Hand tufted carpet finishing at our Bhadohi facility — Tapis Global International' },
    ],
  },

  // ─────────────────────────────────────────────────────────────── HAND KNOTTED
  {
    slug:      'hand-knotted-carpet',
    name:      'Hand Knotted Carpet',
    cardImage: '/images/tgi-banner-2.webp',
    heroImage: '/images/tgi-banner-2.webp',
    tagline:   'Hand knotted carpets where patience, knot density and heritage weave floors of enduring beauty — made in Bhadohi, India.',
    seoTitle:  'Hand Knotted Carpet Manufacturer in India | Bhadohi Rug Supplier & Exporter — Tapis Global',
    seoDescription: 'Premium hand knotted carpet and rug manufacturer in India. Wool & silk hand knotted rugs from Bhadohi for luxury residences, hotels and collectors. Custom designs. Request a catalogue or quote.',
    seoKeywords: ['hand knotted carpet manufacturer India', 'hand knotted rugs', 'hand knotted rug supplier India', 'Bhadohi hand knotted carpet', 'silk carpet manufacturer India', 'Persian rug manufacturer India', 'luxury rug manufacturer'],
    h1:        'Hand Knotted Carpet & Rug Manufacturer in India',
    intro:     'Tapis Global International is a premium hand knotted carpet and rug manufacturer in India. Each knot is tied by hand on the loom — Persian, Tibetan and contemporary constructions in wool, silk and blended fibres for collectors, luxury residences and five-star hospitality across India and worldwide.',
    body:      'Our hand knotted rugs range from 40 to 300+ KPSI, offering everything from robust commercial-grade knotting to museum-quality silk masterpieces. Generational weavers in Bhadohi bring classical reproductions and trend-forward designs to life with unmatched consistency.',
    overview:  'Hand knotting is the most enduring of all carpet constructions — a single rug can take months to complete. As a manufacturer-direct supplier and exporter, we offer architects, designers and collectors complete control over knot density, materials and design, with the assurance of in-house quality control at every stage from loom to finishing.',
    bullets: [
      { label: 'Craftsmanship', text: 'Hand-knotted on vertical looms — every knot tied, trimmed and washed by master weavers with decades of experience.' },
      { label: 'Materials', text: 'Pure silk, New Zealand wool, wool-silk blends and high-altitude Tibetan wool — ethically sourced and batch-tested.' },
      { label: 'Customization', text: 'Classical Persian reproductions, contemporary abstracts, custom medallions and project-specific sizing.' },
      { label: 'Ideal Usage', text: 'Palatial residences, embassy interiors, luxury hotel suites and high-end retail collections.' },
    ],
    applications: [
      { title: 'Luxury Residences', desc: 'Heirloom-quality rugs for living rooms, formal spaces and palatial interiors that appreciate over time.' },
      { title: 'Five-Star Hospitality', desc: 'Signature lobby and suite pieces with custom medallions, borders and project-matched colourways.' },
      { title: 'Designer & Collector Projects', desc: 'Limited-run silk and wool-silk masterpieces for galleries, collectors and high-end interior schemes.' },
      { title: 'Embassy & Institutional', desc: 'Classical reproductions and bespoke commissions for prestige public and diplomatic interiors.' },
    ],
    process: [
      { step: '01', title: 'Mapping & Naqsha', desc: 'The design is charted into a knot-by-knot graph (naqsha) and yarn colours are dyed and approved.' },
      { step: '02', title: 'Hand Knotting', desc: 'Master weavers tie each knot by hand on a vertical loom — knot density determines the detail and value.' },
      { step: '03', title: 'Shearing & Washing', desc: 'The pile is clipped to an even height and the rug is hand-washed to bring out lustre and depth.' },
      { step: '04', title: 'Stretching & QC', desc: 'The rug is stretched flat, finished at the edges and inspected against specification before dispatch.' },
    ],
    customization: [
      'Custom knot density from 40 to 300+ KPSI',
      'Pure silk, wool, and wool-silk blend constructions',
      'Classical Persian, Tibetan and contemporary designs',
      'Bespoke sizes, medallions and border treatments',
      'Pantone-matched colour development',
      'One-of-a-kind commissions and limited editions',
    ],
    techSpecs: [
      { label: 'Construction',   value: 'Hand Knotted (Persian / Tibetan / contemporary)' },
      { label: 'Knot Density',   value: '40 – 300+ KPSI' },
      { label: 'Primary Materials', value: 'Pure Silk, NZ Wool, Wool-Silk, Tibetan Wool' },
      { label: 'Pile Height',    value: '5 mm – 12 mm (customisable)' },
      { label: 'Backing',        value: 'Cotton warp & weft foundation' },
      { label: 'Certifications', value: 'ISO 9001:2015, GoodWeave, AZO-free dyes' },
    ],
    idealFor:  ['Palatial Interiors', 'Luxury Hotels', 'Designer Residences', 'Fine Art Collectors'],
    materials: ['Pure Silk', 'New Zealand Wool', 'Wool-Silk Blend', 'Tibetan Wool'],
    moq:       '50 Pieces',
    leadTime:  '60–90 Days',
    related:   ['hand-tufted-carpet', 'flat-weaves', 'leather-carpets'],
    faqs: [
      { q: 'How long does a hand knotted carpet take to make?', a: 'A hand knotted carpet can take anywhere from several weeks to many months depending on size and knot density — a fine silk rug at 200+ KPSI represents thousands of hours of skilled work. We share realistic timelines at the quotation stage.' },
      { q: 'Why are hand knotted rugs considered an investment?', a: 'Because each rug is individually knotted from premium natural fibres, a well-made hand knotted carpet can last for generations and often appreciates in value. As a direct manufacturer we ensure authentic construction and full material transparency.' },
      { q: 'What knot density (KPSI) should I choose?', a: 'Knot density drives detail and value. 40–80 KPSI suits durable, larger-scale wool pieces; 100–150 KPSI gives refined detail in wool and wool-silk; 200–300+ KPSI is reserved for fine silk masterpieces. We help you balance design intricacy, budget and end use.' },
      { q: 'Can you reproduce a classical Persian or antique design?', a: 'Yes. Our master weavers in Bhadohi produce classical Persian, Tibetan and antique reproductions to a knot-by-knot graph, as well as bespoke contemporary commissions — matched to your colourway and size.' },
    ],
    gallery: gallery(
      ['/images/tgi-banner-2.webp', '/images/rug2.webp', '/images/tgi-banner-5.webp'],
      'Hand Knotted Carpet',
      ['Persian knotted rug detail', 'Silk knot density close-up', 'Master weaver at loom Bhadohi', 'Classical medallion knotted carpet', 'Contemporary knotted abstract', 'Hotel suite silk-wool rug', 'Tibetan construction knotted piece', 'Border pattern knot detail', 'Luxury living room knotted installation', 'Knotted runner corridor', 'Multi-colour knotted field', 'Finished knotted carpet QC inspection'],
    ),
  },

  // ─────────────────────────────────────────────────────────────── SHAGGY
  {
    slug:      'shaggy-rugs',
    name:      'Shaggy Rugs',
    cardImage: '/images/shaggy/shaggy-blue-3d-wave.webp',
    heroImage: '/images/shaggy/shaggy-abstract-wave-marble.webp',
    tagline:   'Shaggy rugs with plush depth, tactile warmth and contemporary comfort — manufactured in Bhadohi, India.',
    seoTitle:  'Shaggy Rugs Manufacturer in India | Bhadohi Supplier & Exporter — Tapis Global',
    seoDescription: 'Shaggy rug manufacturer and supplier in India. Plush high-pile shaggy rugs from Bhadohi for bedrooms, lounges and boutique hospitality. Custom sizes & colours. Request a catalogue or quote.',
    seoKeywords: ['shaggy rugs manufacturer India', 'shaggy rug supplier India', 'high pile rugs manufacturer', 'Bhadohi shaggy rugs', 'plush rug manufacturer India', 'custom shaggy rugs'],
    h1:        'Shaggy Rugs Manufacturer in India',
    intro:     'Tapis Global International is a shaggy rug manufacturer and supplier in India, producing long-pile shaggy constructions in wool, polyester and blended fibres — designed for bedrooms, lounges and boutique hospitality where texture and comfort define the experience.',
    body:      'Our shaggy range features high-pile tufting with premium yarn blends that maintain shape under use while delivering the sink-in softness that contemporary interiors demand. Available in solid, tonal and multi-texture programmes from our Bhadohi facility.',
    overview:  'Shaggy rugs are about feel as much as look. As a direct manufacturer we calibrate pile height, density and anti-shed treatment to your space — from ultra-plush bedroom rugs to harder-wearing lounge pieces for boutique hotels and residential developers across India and export markets.',
    bullets: [
      { label: 'Craftsmanship', text: 'High-pile tufting with precision shearing — pile height calibrated for comfort, durability and easy maintenance.' },
      { label: 'Materials', text: 'Micro-polyester, acrylic, wool blends and premium synthetic fibres — anti-shed treatments available.' },
      { label: 'Customization', text: 'Custom pile heights, tonal colourways, round and irregular shapes for designer specifications.' },
      { label: 'Ideal Usage', text: 'Master bedrooms, lounge areas, retail concept stores and contemporary hospitality suites.' },
    ],
    applications: [
      { title: 'Bedrooms & Lounges', desc: 'Ultra-soft underfoot comfort for master suites, reading nooks and relaxed living spaces.' },
      { title: 'Boutique Hospitality', desc: 'Tactile suite and lounge rugs that add warmth and contemporary character to guest experiences.' },
      { title: 'Retail & Concept Stores', desc: 'Statement texture pieces for fashion, lifestyle and concept retail environments.' },
      { title: 'Residential Developers', desc: 'Coordinated shaggy programmes for show flats, model homes and turnkey residential handovers.' },
    ],
    process: [
      { step: '01', title: 'Yarn Selection', desc: 'High-loft yarns are selected and dyed to your tonal palette for the desired softness and sheen.' },
      { step: '02', title: 'High-Pile Tufting', desc: 'Long pile is tufted to the calibrated height that balances plushness with everyday durability.' },
      { step: '03', title: 'Backing & Anti-Shed', desc: 'A secure backing and optional anti-shed treatment lock fibres for low-maintenance use.' },
      { step: '04', title: 'Shearing & QC', desc: 'Pile is evened, the rug is finished to shape and inspected for density and consistency.' },
    ],
    customization: [
      'Custom pile heights from plush to extra-long shag',
      'Solid, tonal and multi-texture colourways',
      'Round, oval and irregular custom shapes',
      'Anti-shed and easy-clean treatments',
      'Wool, micro-polyester and blended yarn options',
      'Project and contract volume programmes',
    ],
    techSpecs: [
      { label: 'Construction',   value: 'High-Pile Hand Tufted Shag' },
      { label: 'Primary Materials', value: 'Micro-Polyester, Acrylic, Wool Blends' },
      { label: 'Pile Height',    value: '30 mm – 70 mm (customisable)' },
      { label: 'Weight (GSM)',   value: '2,800 – 4,500 GSM' },
      { label: 'Backing',        value: 'Latex secondary backing, anti-shed optional' },
      { label: 'Certifications', value: 'ISO 9001:2015, OEKO-TEX' },
    ],
    idealFor:  ['Bedrooms & Lounges', 'Boutique Hotels', 'Retail Concepts', 'Residential Developers'],
    materials: ['Wool Blends', 'Micro-Polyester', 'Acrylic', 'Premium Synthetic'],
    moq:       '100 Pieces',
    leadTime:  '40–55 Days',
    related:   ['hand-tufted-carpet', 'flat-weaves', 'jute-sisal-rugs'],
    faqs: [
      { q: 'Are shaggy rugs easy to maintain?', a: 'Yes — we offer anti-shed treatments and recommend constructions that balance plush feel with practicality. Regular gentle vacuuming and occasional professional cleaning keep them looking new. We advise on the best specification for your use case.' },
      { q: 'Can you make shaggy rugs in custom sizes and shapes?', a: 'Absolutely. As a manufacturer we produce shaggy rugs in any custom size, plus round, oval and irregular shapes to suit designer and project specifications.' },
      { q: 'Which pile height is best for a bedroom versus a lounge?', a: 'For bedrooms we recommend a longer 50–70 mm shag for sink-in softness underfoot. For lounges and higher-traffic living areas a 30–45 mm pile keeps the plush feel while being easier to maintain. We tailor pile height to each room.' },
      { q: 'Do you supply shaggy rugs for residential development handovers?', a: 'Yes. We produce coordinated shaggy programmes for show flats, model homes and bulk residential handovers — consistent quality and colour across the full order, delivered to your project schedule.' },
    ],
    gallery: [
      { src: '/images/shaggy/shaggy-abstract-wave-marble.webp',     alt: 'Black and orange abstract-wave shaggy rug in a luxury lounge — Tapis Global International' },
      { src: '/images/shaggy/shaggy-blue-3d-wave.webp',             alt: 'Blue carved 3D-wave shaggy rug — Tapis Global International' },
      { src: '/images/shaggy/shaggy-grey-ivory-luxury-lounge.webp', alt: 'Grey and ivory two-tone shaggy rug in a penthouse lounge — Tapis Global International' },
      { src: '/images/shaggy/shaggy-ivory-flokati-room.webp',       alt: 'Ivory flokati-style plush shaggy rug — Tapis Global International' },
      { src: '/images/shaggy/shaggy-retro-multicolour.webp',        alt: 'Retro multicolour patterned shaggy rug — Tapis Global International' },
      { src: '/images/shaggy/shaggy-orange-brown-wave.webp',        alt: 'Orange and brown wave-pattern shaggy rug — Tapis Global International' },
      { src: '/images/shaggy/shaggy-ivory-plush-room.webp',         alt: 'Ivory high-pile plush shaggy rug in a styled room — Tapis Global International' },
      { src: '/images/shaggy/shaggy-grey-trellis.webp',            alt: 'Grey and ivory trellis-pattern shaggy rug — Tapis Global International' },
      { src: '/images/shaggy/shaggy-carved-organic-neutral.webp',   alt: 'Carved organic-pattern neutral shaggy rug — Tapis Global International' },
      { src: '/images/shaggy/shaggy-ivory-plush-coffee.webp',       alt: 'Ivory plush shaggy rug under a coffee table — Tapis Global International' },
      { src: '/images/shaggy/shaggy-terracotta-bedroom.webp',       alt: 'Terracotta high-pile shaggy rug in a bedroom — Tapis Global International' },
      { src: '/images/shaggy/shaggy-white-plush-lounge.webp',       alt: 'White plush shaggy rug in a contemporary lounge — Tapis Global International' },
    ],
  },

  // ─────────────────────────────────────────────────────────────── JUTE / SISAL
  {
    slug:      'jute-sisal-rugs',
    name:      'Jute / Sisal Rugs',
    cardImage: '/images/jute/jute-bordered-flatlay.webp',
    heroImage: '/images/jute/jute-living-room-bordered.webp',
    tagline:   'Jute and sisal rugs — natural fibre elegance for sustainable, design-forward interiors. Made in Bhadohi, India.',
    seoTitle:  'Jute Rugs Manufacturer in India | Sisal & Natural Fibre Rug Supplier — Tapis Global',
    seoDescription: 'Jute and sisal rug manufacturer and supplier in India. Eco-friendly natural fibre rugs from Bhadohi for sustainable homes, retail and hospitality. Custom sizes. Request a catalogue or quote.',
    seoKeywords: ['jute rugs manufacturer India', 'jute rug supplier India', 'sisal rugs manufacturer', 'natural fibre rugs India', 'Bhadohi jute rugs', 'eco friendly rugs manufacturer', 'seagrass rugs India'],
    h1:        'Jute & Sisal Rugs Manufacturer in India',
    intro:     'Tapis Global International is a jute and sisal rug manufacturer and supplier in India, producing eco-conscious flatweave and natural fibre floor coverings woven from jute, sisal and cotton — perfect for coastal homes, organic retail lines and hospitality projects seeking authentic texture.',
    body:      'Our Bhadohi natural fibre division produces braided, woven and bound constructions that celebrate raw material beauty. Each piece is finished with anti-shed binding and optional latex backing for commercial use, supplied across India and to international buyers.',
    overview:  'Natural fibre rugs are the sustainable choice for design-led interiors. As a direct manufacturer we source certified golden jute, sisal and seagrass and finish every piece to project standard — giving eco-retail brands, resorts and conscious developers a reliable supply partner with full material traceability.',
    bullets: [
      { label: 'Craftsmanship', text: 'Hand-woven and braided natural fibre constructions — reinforced edges and durable binding on every piece.' },
      { label: 'Materials', text: 'Golden jute, sisal, seagrass, cotton and hemp — sustainably sourced from certified suppliers.' },
      { label: 'Customization', text: 'Custom sizes, border treatments, dyed jute colourways and private-label natural collections.' },
      { label: 'Ideal Usage', text: 'Eco-retail brands, coastal resorts, organic interiors and sustainable hospitality programmes.' },
    ],
    applications: [
      { title: 'Sustainable Residences', desc: 'Warm, textural natural fibre rugs for eco-conscious homes and biophilic interior schemes.' },
      { title: 'Coastal & Resort Hospitality', desc: 'Hard-wearing jute and sisal pieces that suit relaxed, organic resort and villa aesthetics.' },
      { title: 'Eco & Lifestyle Retail', desc: 'Private-label natural fibre collections for sustainable retail and lifestyle brands.' },
      { title: 'Designer & Layering Projects', desc: 'Neutral natural bases for layering under statement rugs in styled interiors.' },
    ],
    process: [
      { step: '01', title: 'Fibre Sourcing', desc: 'Certified golden jute, sisal and seagrass are sourced and graded for colour and strength.' },
      { step: '02', title: 'Weaving & Braiding', desc: 'Fibres are hand-woven or braided into the chosen construction on traditional looms.' },
      { step: '03', title: 'Binding & Backing', desc: 'Edges are reinforced and an optional latex backing is added for commercial durability.' },
      { step: '04', title: 'Finishing & QC', desc: 'Each rug is anti-shed treated, finished to size and inspected before dispatch.' },
    ],
    customization: [
      'Custom sizes and runner lengths',
      'Natural and dyed jute colourways',
      'Bound, braided and flatwoven constructions',
      'Cotton border and leather-trim edge options',
      'Latex backing for contract and high-traffic use',
      'Private-label natural fibre collections',
    ],
    techSpecs: [
      { label: 'Construction',   value: 'Hand-woven / Braided natural fibre' },
      { label: 'Primary Materials', value: 'Golden Jute, Sisal, Seagrass, Cotton, Hemp' },
      { label: 'Backing',        value: 'Unbacked or latex (commercial grade)' },
      { label: 'Edge Finish',    value: 'Bound, braided or cotton border' },
      { label: 'Treatment',      value: 'Anti-shed, AZO-free dyes' },
      { label: 'Certifications', value: 'ISO 9001:2015, sustainably sourced fibres' },
    ],
    idealFor:  ['Eco Retail', 'Coastal Resorts', 'Organic Interiors', 'Sustainable Hospitality'],
    materials: ['Golden Jute', 'Sisal', 'Seagrass', 'Cotton & Hemp'],
    moq:       '200 Pieces',
    leadTime:  '30–45 Days',
    related:   ['flat-weaves', 'coco-coir', 'shaggy-rugs'],
    faqs: [
      { q: 'Are jute and sisal rugs suitable for high-traffic areas?', a: 'Sisal is highly durable and well-suited to hallways and high-traffic spaces; jute is softer and best for moderate-traffic living areas. For contract use we add a latex backing for stability. We will recommend the right fibre for your application.' },
      { q: 'Are your jute rugs eco-friendly?', a: 'Yes. Jute, sisal and seagrass are renewable, biodegradable natural fibres. We source from certified suppliers and use AZO-free dyes, making our natural fibre rugs a genuinely sustainable choice.' },
      { q: 'Can natural fibre rugs be used in coastal or humid climates?', a: 'Sisal and seagrass handle humidity better than jute and are well-suited to coastal resorts and villas. For damp-prone areas we recommend seagrass with a latex backing. We will advise the most resilient fibre for your location.' },
      { q: 'Do you offer private-label natural fibre collections for retail?', a: 'Yes. As a manufacturer we produce private-label jute, sisal and seagrass collections with custom sizes, borders and packaging for sustainable home and lifestyle retail brands.' },
    ],
    gallery: [
      { src: '/images/jute/jute-living-room-bordered.webp',       alt: 'Navy-bordered braided jute rug styled in a luxury living room — Tapis Global International' },
      { src: '/images/sisal/sisal-bordered-living-room.webp',     alt: 'Brown-bordered herringbone sisal rug in a styled living room — Tapis Global International' },
      { src: '/images/jute/jute-kitchen-runner-bordered.webp',    alt: 'Bordered jute runner in a marble kitchen — Tapis Global International' },
      { src: '/images/sisal/sisal-herringbone-bordered-room.webp',alt: 'Herringbone sisal rug with linen border in a living room — Tapis Global International' },
      { src: '/images/jute/jute-navy-border-living-room.webp',    alt: 'Navy-bordered natural jute area rug in a styled living room — Tapis Global International' },
      { src: '/images/sisal/sisal-ivory-styled-room.webp',        alt: 'Ivory bordered sisal rug in a contemporary interior — Tapis Global International' },
      { src: '/images/jute/jute-oval-scalloped-runner.webp',      alt: 'Scalloped-edge oval jute hallway runner — Tapis Global International' },
      { src: '/images/sisal/sisal-herringbone-runner.webp',       alt: 'Herringbone sisal hallway runner — Tapis Global International' },
      { src: '/images/jute/jute-bedroom-bordered-pair.webp',      alt: 'Charcoal-bordered braided jute rugs in a bedroom — Tapis Global International' },
      { src: '/images/sisal/sisal-herringbone-border.webp',       alt: 'Herringbone sisal rug with contrast cotton border — Tapis Global International' },
      { src: '/images/jute/jute-navy-border-runner.webp',         alt: 'Navy-bordered jute entryway runner — Tapis Global International' },
      { src: '/images/sisal/sisal-natural-runner-fold.webp',      alt: 'Natural flatweave sisal rug, edge detail — Tapis Global International' },
      { src: '/images/jute/jute-braided-weave-detail.webp',       alt: 'Hand-braided jute weave in natural and indigo — Tapis Global International' },
      { src: '/images/sisal/sisal-herringbone-detail.webp',       alt: 'Sisal herringbone weave, close-up detail — Tapis Global International' },
      { src: '/images/jute/jute-weave-macro.webp',                alt: 'Golden jute fibre weave, close-up texture — Tapis Global International' },
      { src: '/images/sisal/sisal-boucle-weave-macro.webp',       alt: 'Fine sisal bouclé weave, macro texture — Tapis Global International' },
    ],
  },

  // ─────────────────────────────────────────────────────────────── LEATHER
  {
    slug:      'leather-carpets',
    name:      'Leather Carpets',
    cardImage: '/images/leather/leather-chevron-patchwork-room.webp',
    heroImage: '/images/leather/leather-square-patchwork-loft.webp',
    tagline:   'Leather carpets with bold texture, artisan patchwork and statement luxury — handcrafted in Bhadohi, India.',
    seoTitle:  'Leather Carpets Manufacturer in India | Bhadohi Supplier & Exporter — Tapis Global',
    seoDescription: 'Leather carpet and rug manufacturer in India. Hand-stitched patchwork and hair-on-hide leather rugs from Bhadohi for luxury interiors, offices and retail. Custom designs. Request a catalogue or quote.',
    seoKeywords: ['leather carpets manufacturer India', 'leather rug supplier India', 'patchwork leather rugs', 'hair on hide rugs India', 'Bhadohi leather carpets', 'custom leather rugs manufacturer'],
    h1:        'Leather Carpets Manufacturer in India',
    intro:     'Tapis Global International is a leather carpet and rug manufacturer in India, producing premium leather and leather-composite carpets — patchwork, hair-on-hide and embossed constructions for high-impact residential, retail and hospitality environments.',
    body:      'Our leather programme combines traditional stitching techniques with modern backing systems for durability. Each piece is unique in character — ideal for designer showrooms, executive offices and luxury boutique spaces, manufactured to order in Bhadohi.',
    overview:  'Leather carpets make a statement no other floor covering can. As a direct manufacturer we hand-stitch patchwork and hair-on-hide pieces from certified-tannery leather, with custom layouts and embossing — giving designers and luxury brands a distinctive, durable and fully bespoke product.',
    bullets: [
      { label: 'Craftsmanship', text: 'Hand-stitched patchwork and precision-cut leather panels — finished with non-slip backing and edge binding.' },
      { label: 'Materials', text: 'Genuine leather, suede, leather-composite and hair-on-hide — sourced from certified tanneries.' },
      { label: 'Customization', text: 'Custom patchwork layouts, embossed logos, colour-dyed leather and bespoke size programmes.' },
      { label: 'Ideal Usage', text: 'Executive offices, luxury retail, penthouse interiors and boutique hotel lobbies.' },
    ],
    applications: [
      { title: 'Executive Offices', desc: 'Boardrooms and executive suites where rich leather signals prestige and permanence.' },
      { title: 'Luxury Retail', desc: 'Flagship and boutique retail floors that demand a distinctive, high-end material story.' },
      { title: 'Penthouse Interiors', desc: 'Statement patchwork and hair-on-hide pieces for high-design residential spaces.' },
      { title: 'Boutique Hotel Lobbies', desc: 'Durable, characterful leather floor coverings for memorable arrival experiences.' },
    ],
    process: [
      { step: '01', title: 'Leather Selection', desc: 'Hides are selected and graded from certified tanneries for colour, finish and consistency.' },
      { step: '02', title: 'Cutting & Layout', desc: 'Panels are precision-cut and arranged into the approved patchwork or hide layout.' },
      { step: '03', title: 'Hand Stitching', desc: 'Artisans hand-stitch panels with reinforced seams for strength and a refined finish.' },
      { step: '04', title: 'Backing & QC', desc: 'A non-slip backing is applied, edges are bound and the piece is inspected before dispatch.' },
    ],
    customization: [
      'Custom patchwork layouts and panel sizes',
      'Hair-on-hide, suede and embossed finishes',
      'Colour-dyed and tonal leather options',
      'Embossed logos and branded inlays',
      'Bespoke sizes and shapes',
      'Coordinated leather poufs and accessories',
    ],
    techSpecs: [
      { label: 'Construction',   value: 'Hand-stitched patchwork / hair-on-hide' },
      { label: 'Primary Materials', value: 'Genuine Leather, Suede, Hair-on-Hide, Composite' },
      { label: 'Backing',        value: 'Non-slip felt / latex backing' },
      { label: 'Edge Finish',    value: 'Bound / stitched edge' },
      { label: 'Sourcing',       value: 'Certified tanneries' },
      { label: 'Certifications', value: 'ISO 9001:2015' },
    ],
    idealFor:  ['Executive Offices', 'Luxury Retail', 'Penthouse Interiors', 'Boutique Lobbies'],
    materials: ['Genuine Leather', 'Suede', 'Hair-on-Hide', 'Leather Composite'],
    moq:       '50 Pieces',
    leadTime:  '50–70 Days',
    related:   ['hand-knotted-carpet', 'poufs', 'hand-tufted-carpet'],
    faqs: [
      { q: 'Is leather flooring durable enough for commercial use?', a: 'Yes — leather is remarkably durable and develops a beautiful patina over time. With our reinforced stitching and non-slip backing, our leather carpets are suitable for offices, retail and boutique hospitality. We advise on placement for best longevity.' },
      { q: 'Can you emboss our logo into a leather rug?', a: 'Yes. As a custom manufacturer we can emboss logos, create branded inlays and produce bespoke patchwork layouts for retail and corporate clients.' },
      { q: 'Is each leather patchwork rug unique?', a: 'Yes — because we work with natural hides, every patchwork and hair-on-hide piece has its own character and subtle variation. We can keep a layout consistent across an order or embrace the natural uniqueness, as your project prefers.' },
      { q: 'How do I care for a leather carpet?', a: 'Leather carpets are low-maintenance — regular dry dusting and occasional conditioning keep them supple, and they develop a beautiful patina over time. We provide care guidance with every order.' },
    ],
    gallery: [
      { src: '/images/leather/leather-square-patchwork-loft.webp',    alt: 'Cowhide leather square-patchwork rug in a bright city loft — Tapis Global International' },
      { src: '/images/leather/leather-chevron-patchwork-room.webp',   alt: 'Chevron leather patchwork rug in a luxury living room — Tapis Global International' },
      { src: '/images/leather/leather-hexagon-patchwork-room.webp',   alt: 'Hexagon leather patchwork rug in a modern interior — Tapis Global International' },
      { src: '/images/leather/leather-square-patchwork-cabin.webp',   alt: 'Leather square-patchwork rug in a cabin living room — Tapis Global International' },
      { src: '/images/leather/leather-gradient-square-patchwork.webp',alt: 'Gradient square leather patchwork rug — Tapis Global International' },
      { src: '/images/leather/leather-mono-square-patchwork.webp',    alt: 'Monochrome leather square-patchwork rug — Tapis Global International' },
      { src: '/images/leather/leather-square-patchwork-lounge.webp',  alt: 'Leather patchwork rug in a designer lounge — Tapis Global International' },
      { src: '/images/leather/leather-circular-disc-patchwork.webp',  alt: 'Circular-disc leather patchwork rug — Tapis Global International' },
      { src: '/images/leather/leather-chevron-patchwork-living.webp', alt: 'Chevron leather patchwork rug, full view — Tapis Global International' },
      { src: '/images/leather/leather-natural-brindle-cowhide.webp',  alt: 'Natural brindle cowhide leather rug — Tapis Global International' },
      { src: '/images/leather/leather-cowhide-ranch.webp',            alt: 'Black and white cowhide leather rug in a ranch interior — Tapis Global International' },
      { src: '/images/leather/leather-tan-cowhide.webp',              alt: 'Tan cowhide leather rug in a mid-century room — Tapis Global International' },
    ],
  },

  // ─────────────────────────────────────────────────────────────── PEBBLE CARPET
  {
    slug:      'pebble-carpet',
    name:      'Pebble Carpet',
    cardImage: '/images/rug4.webp',
    heroImage: '/images/rug4.webp',
    tagline:   'Pebble carpets — hundreds of hand-felted wool pebbles stitched into a sculptural, stone-textured floor. Made in Bhadohi, India.',
    seoTitle:  'Pebble Carpet Manufacturer in India | Felted Wool Pebble Rugs — Tapis Global',
    seoDescription: 'Pebble carpet manufacturer and supplier in India. Hand-felted 100% wool pebble rugs from Bhadohi — sculptural, stone-textured floor coverings for spas, bedrooms, boutique hotels and organic interiors. Custom colours & sizes. Request a catalogue or quote.',
    seoKeywords: ['pebble carpet manufacturer India', 'pebble carpet', 'felted wool pebble rug', 'pebble rug supplier India', 'stone rug manufacturer India', 'Bhadohi pebble carpet', 'felted stone rug', 'wool pebble mat'],
    h1:        'Pebble Carpet Manufacturer in India',
    intro:     'Tapis Global International is a pebble carpet manufacturer and supplier in India, hand-felting hundreds of individual wool "pebbles" and stitching them into a sculptural, three-dimensional floor covering that brings the calm texture of a riverbed indoors — crafted in 100% wool at our Bhadohi facility for spas, bedrooms, boutique hospitality and organic, biophilic interiors.',
    body:      'Each pebble is hand-rolled and wet-felted from carded wool, graded for size and tone, then hand-stitched onto a strong cotton backing to form a dense, tactile "stone" surface. The result is a soft yet robust rug with genuine 3D relief — a natural, meditative texture underfoot that no printed or machine-made floor covering can replicate.',
    overview:  'As a manufacturer-direct supplier we control every stage — wool sourcing, dyeing, felting, grading and stitching — giving designers, spa and wellness operators, hoteliers and conscious homeowners a single accountable partner for bespoke pebble carpets. Colourways range from natural undyed stone tones and soft greys to custom multi-colour blends, in any size or shape, with the consistency and documentation projects require.',
    bullets: [
      { label: 'Craftsmanship', text: 'Hundreds of individually hand-felted wool pebbles, graded and hand-stitched onto a reinforced cotton backing for a true 3D stone texture.' },
      { label: 'Materials', text: '100% felted wool pile on a durable cotton backing — natural, renewable and finished with AZO-free dyes.' },
      { label: 'Customization', text: 'Natural, tonal or custom multi-colour blends; any size, shape and pebble scale, with anti-slip backing on request.' },
      { label: 'Ideal Usage', text: 'Spas and wellness suites, bedrooms, bathrooms, reading nooks, boutique hotels and organic, biophilic interiors.' },
    ],
    applications: [
      { title: 'Spa & Wellness Interiors', desc: 'Soft, reflexology-like stone texture underfoot for spas, wellness suites and meditation rooms.' },
      { title: 'Bedrooms & Reading Nooks', desc: 'Warm, tactile wool pebbles that invite bare feet in calm, restful residential spaces.' },
      { title: 'Boutique Hospitality', desc: 'Signature sculptural floor pieces that give suites, lobbies and spas a distinctive, natural character.' },
      { title: 'Organic & Biophilic Design', desc: 'A nature-inspired surface for design schemes built around natural materials, texture and calm.' },
    ],
    process: [
      { step: '01', title: 'Wool Prep & Dyeing', desc: 'Carded wool is graded and dyed to natural stone tones or your custom palette with AZO-free dyes.' },
      { step: '02', title: 'Hand-Felting Pebbles', desc: 'Each pebble is hand-rolled and wet-felted into a dense, durable ball, then sorted by size and shade.' },
      { step: '03', title: 'Layout & Stitching', desc: 'Pebbles are arranged to the approved design and hand-stitched onto a reinforced cotton backing.' },
      { step: '04', title: 'Finishing & QC', desc: 'The backing is trimmed and finished (anti-slip optional), then inspected for density, colour and dimensions.' },
    ],
    customization: [
      'Natural undyed, tonal grey or custom multi-colour pebble blends',
      'Any custom size and shape (runner, round, oversized)',
      'Fine, medium or mixed pebble scale for subtler or bolder texture',
      'Pantone-guided colour matching with AZO-free dyes',
      'Anti-slip backing for bathrooms and high-use areas',
      'Coordinated bath mats, runners and matching accessories',
    ],
    techSpecs: [
      { label: 'Construction',   value: 'Hand-felted wool pebbles, hand-stitched' },
      { label: 'Primary Materials', value: '100% Felted Wool on Cotton Backing' },
      { label: 'Relief Height',  value: '15 mm – 30 mm (pebble dependent)' },
      { label: 'Backing',        value: 'Reinforced cotton (anti-slip optional)' },
      { label: 'Treatment',      value: 'Natural wool, AZO-free dyes' },
      { label: 'Certifications', value: 'ISO 9001:2015, OEKO-TEX, AZO-free dyes' },
    ],
    idealFor:  ['Spas & Wellness', 'Bedrooms & Bathrooms', 'Boutique Hotels', 'Organic Interiors'],
    materials: ['Felted New Zealand Wool', 'Felted Indian Wool', 'Cotton Backing', 'Wool Blends'],
    moq:       '50 Pieces',
    leadTime:  '45–70 Days',
    related:   ['shaggy-rugs', 'jute-sisal-rugs', 'hand-tufted-carpet'],
    faqs: [
      { q: 'What is a pebble carpet?', a: 'A pebble carpet (also called a pebble rug or stone rug) is a handmade floor covering built from hundreds of individually hand-felted wool "pebbles" stitched onto a cotton backing, creating a soft, three-dimensional stone-like texture underfoot.' },
      { q: 'What are pebble carpets made of?', a: 'Ours are made from 100% felted wool pebbles on a strong cotton backing, coloured with AZO-free dyes — a natural, renewable and biodegradable construction with no plastic pile.' },
      { q: 'Are pebble carpets comfortable and safe to walk on?', a: 'Yes. The felted wool pebbles are soft yet supportive, giving a gentle reflexology-like feel underfoot. For bathrooms and wellness areas we add an anti-slip backing for safety.' },
      { q: 'Can I order a pebble carpet in custom colours and sizes?', a: 'Yes. As a direct manufacturer we produce pebble carpets in any size or shape and in natural, tonal or custom multi-colour blends, with lab-matched colour approved before production.' },
    ],
    gallery: gallery(
      ['/images/rug4.webp', '/images/wool-drying-pic.webp', '/images/vibrant-wool-dying.webp'],
      'Pebble Carpet',
      ['Hand-felted wool pebble carpet detail', 'Natural stone-tone pebble rug', 'Grey felted pebble carpet in a spa', 'Multi-colour pebble rug texture', 'Pebble carpet in a serene bedroom', 'Felted wool pebbles close-up', 'Wet-felting wool pebbles in production', 'Pebble bath mat detail', 'Organic biophilic pebble floor', 'Round pebble rug', 'Pebble carpet edge and cotton backing', 'Pebble carpet grading and QC'],
    ),
  },

  // ─────────────────────────────────────────────────────────────── WALL TO WALL
  {
    slug:      'wall-to-wall-carpets',
    name:      'Wall to Wall Carpets',
    cardImage: '/images/tgi-banner-4.webp',
    heroImage: '/images/tgi-banner-4.webp',
    tagline:   'Wall to wall carpets — seamless broadloom elegance for hospitality, commercial and residential scale. Made in India.',
    seoTitle:  'Wall to Wall Carpet Manufacturer in India | Hotel & Broadloom Supplier — Tapis Global',
    seoDescription: 'Wall to wall carpet manufacturer and supplier in India. Broadloom & carpet tiles from Bhadohi for hotels, offices and commercial projects. Fire-rated, custom colours. Request a catalogue or quote.',
    seoKeywords: ['wall to wall carpet manufacturer India', 'broadloom carpet manufacturer India', 'hotel carpet supplier India', 'commercial carpet supplier India', 'carpet tiles manufacturer India', 'contract carpet manufacturer', 'Bhadohi wall to wall carpet'],
    h1:        'Wall to Wall Carpet Manufacturer in India',
    intro:     'Tapis Global International is a wall to wall carpet manufacturer and supplier in India, producing broadloom and carpet tile programmes engineered for hotels, offices and large-format residential projects — fire-rated, durable and available in custom colour runs.',
    body:      'Our wall-to-wall division produces axminster, tufted broadloom and carpet tile constructions with commercial-grade backing. Phased delivery, on-site measurement support and installation guidance are available for project buyers across India and internationally.',
    overview:  'For contract-scale flooring, supply reliability matters as much as quality. As a direct manufacturer we manage colour consistency across large production runs, fire-rating compliance and phased project delivery — making us a dependable wall to wall carpet supplier for hospitality groups, developers and commercial fit-out teams.',
    bullets: [
      { label: 'Craftsmanship', text: 'Broadloom tufting and axminster weaving on wide-width looms — precision dye matching across production runs.' },
      { label: 'Materials', text: 'Solution-dyed nylon, wool-nylon blends, polypropylene and recycled fibre options for contract specifications.' },
      { label: 'Customization', text: 'Custom colour runs, corridor patterns, lobby medallions and phased project delivery schedules.' },
      { label: 'Ideal Usage', text: 'Hotels, corporate offices, cruise ships, airports and large residential developments.' },
    ],
    applications: [
      { title: 'Hotels & Resorts', desc: 'Corridors, guest rooms, ballrooms and F&B areas with custom patterns and fire-rated backing.' },
      { title: 'Corporate Offices', desc: 'Broadloom and carpet tiles for headquarters, workspaces and high-traffic commercial floors.' },
      { title: 'Cruise & Aviation', desc: 'Specification-compliant contract carpets for cabins, lounges and transit interiors.' },
      { title: 'Large Residential Developments', desc: 'Coordinated wall-to-wall programmes for apartments, clubhouses and amenity spaces.' },
    ],
    process: [
      { step: '01', title: 'Specification & Colour', desc: 'Design, colour runs and performance specs (fire-rating, traffic class) are confirmed with the project team.' },
      { step: '02', title: 'Broadloom Production', desc: 'Carpet is tufted or woven on wide-width looms with strict dye-lot control for colour consistency.' },
      { step: '03', title: 'Backing & Treatment', desc: 'Commercial-grade backing and fire-retardant treatments are applied to specification.' },
      { step: '04', title: 'QC & Phased Dispatch', desc: 'Rolls are inspected and dispatched on a phased schedule aligned to the installation programme.' },
    ],
    customization: [
      'Custom colour runs and dye-lot matching',
      'Corridor patterns, lobby medallions and logos',
      'Broadloom rolls and modular carpet tiles',
      'Fire-rated and stain-resistant treatments',
      'Wool, nylon, polypropylene and recycled fibre',
      'Phased project delivery and installation support',
    ],
    techSpecs: [
      { label: 'Construction',   value: 'Tufted Broadloom / Axminster / Carpet Tile' },
      { label: 'Primary Materials', value: 'Solution-Dyed Nylon, Wool-Nylon, Polypropylene' },
      { label: 'Width',          value: 'Up to 4 m broadloom; 50×50 cm tiles' },
      { label: 'Backing',        value: 'Action-bac / bitumen / cushion backing' },
      { label: 'Performance',    value: 'Fire-rated & heavy-traffic options' },
      { label: 'Certifications', value: 'ISO 9001:2015, fire-rating on request' },
    ],
    idealFor:  ['Hotels & Resorts', 'Corporate Offices', 'Cruise & Aviation', 'Large Developments'],
    materials: ['Solution-Dyed Nylon', 'Wool-Nylon Blend', 'Polypropylene', 'Recycled Fibre'],
    moq:       '500 Sq M',
    leadTime:  '45–75 Days',
    related:   ['hand-tufted-carpet', 'coco-coir', 'flat-weaves'],
    faqs: [
      { q: 'Do your wall to wall carpets meet fire-safety requirements for hotels?', a: 'Yes. We manufacture fire-rated wall to wall carpets to the relevant contract standards and can provide test documentation. Share your project specification and we will match the required performance class.' },
      { q: 'Can you supply matching broadloom and carpet tiles for a large project?', a: 'Yes — as a manufacturer we control dye-lots across both broadloom rolls and carpet tiles, ensuring colour consistency for multi-phase hospitality and commercial projects with coordinated phased delivery.' },
      { q: 'Do you provide on-site measurement and installation support?', a: 'Yes. For wall-to-wall contract projects we offer measurement guidance, installation drawings and coordination with your fit-out team — so corridors, patterns and seams align correctly across the property.' },
      { q: 'What is the maximum order volume you can handle?', a: 'Our 80,000 sq ft Bhadohi campus handles large contract volumes with phased delivery for hotels, offices and developments. Share your total area and programme dates and we will confirm capacity and a delivery schedule.' },
    ],
    gallery: gallery(
      ['/images/tgi-banner-4.webp', '/images/tufting-carpet.webp', '/images/manufacturing-rug-img.webp'],
      'Wall to Wall Carpet',
      ['Hotel corridor broadloom installation', 'Lobby wall-to-wall carpet', 'Broadloom texture close-up', 'Corporate office carpet tile', 'Hospitality suite seamless flooring', 'Axminster pattern broadloom', 'Fire-rated contract carpet roll', 'Custom colour broadloom run', 'Resort hallway carpet programme', 'Carpet tile modular layout', 'Wide-width loom production', 'Broadloom roll finishing'],
    ),
  },

  // ─────────────────────────────────────────────────────────────── FLAT WEAVES
  {
    slug:      'flat-weaves',
    name:      'Flat Weaves',
    cardImage: '/images/rug5.webp',
    heroImage: '/images/rug5.webp',
    tagline:   'Flat weaves — kilims, dhurries and reversible elegance for contemporary global interiors. Woven in Bhadohi, India.',
    seoTitle:  'Flat Weave Rugs Manufacturer in India | Kilim & Dhurrie Supplier — Tapis Global',
    seoDescription: 'Flat weave rug manufacturer and supplier in India. Handwoven kilims and dhurries from Bhadohi for contemporary homes, retail and hospitality. Custom designs. Request a catalogue or quote.',
    seoKeywords: ['flat weave rugs manufacturer India', 'kilim manufacturer India', 'dhurrie manufacturer India', 'flatweave rug supplier India', 'reversible rugs manufacturer', 'Bhadohi flat weave rugs'],
    h1:        'Flat Weave Rugs Manufacturer in India',
    intro:     'Tapis Global International is a flat weave rug manufacturer and supplier in India, producing handwoven flatweave carpets, kilims and dhurries — lightweight, reversible and rich in pattern — suited to modern residential, retail and hospitality environments.',
    body:      'Woven on horizontal looms without pile, our flatweaves offer crisp geometric patterns, tribal motifs and contemporary abstractions in wool, cotton and jute. Ideal for layering and high-traffic areas, manufactured in Bhadohi and supplied across India and worldwide.',
    overview:  'Flat weaves are versatile, hard-wearing and increasingly central to contemporary interior schemes. As a direct manufacturer we offer custom geometric patterns, tribal reproductions and seasonal colour programmes — a reliable supply partner for designers, retailers and hospitality buyers seeking pile-free elegance.',
    bullets: [
      { label: 'Craftsmanship', text: 'Handwoven on traditional looms — reversible constructions with reinforced selvedges and durable finishing.' },
      { label: 'Materials', text: 'Wool, cotton, jute and recycled fibre blends — AZO-free vegetable and chrome dyes.' },
      { label: 'Customization', text: 'Custom geometric patterns, tribal reproductions, size ranges and seasonal colour programmes.' },
      { label: 'Ideal Usage', text: 'Contemporary homes, Scandinavian retail, boutique hotels and designer showrooms.' },
    ],
    applications: [
      { title: 'Contemporary Homes', desc: 'Lightweight, reversible rugs for modern living spaces, bedrooms and layered styling.' },
      { title: 'Lifestyle & Scandi Retail', desc: 'Pattern-led flatweave collections for lifestyle, home and Scandinavian retail brands.' },
      { title: 'Boutique Hospitality', desc: 'Characterful kilims and dhurries for relaxed, design-forward guest environments.' },
      { title: 'Designer Showrooms', desc: 'Bespoke geometric and tribal pieces developed to designer artwork and palettes.' },
    ],
    process: [
      { step: '01', title: 'Design & Dyeing', desc: 'The pattern is set out and yarns are dyed with AZO-free vegetable or chrome dyes.' },
      { step: '02', title: 'Flat Weaving', desc: 'Artisans interweave warp and weft on horizontal looms to build the pile-free, reversible weave.' },
      { step: '03', title: 'Selvedge Finishing', desc: 'Edges and selvedges are reinforced for durability and a clean reversible finish.' },
      { step: '04', title: 'Washing & QC', desc: 'The rug is washed, dried, squared to size and inspected against the approved design.' },
    ],
    customization: [
      'Custom geometric, tribal and contemporary patterns',
      'Reversible flatweave and dhurrie constructions',
      'Seasonal and bespoke colour programmes',
      'Custom sizes and runner lengths',
      'Wool, cotton, jute and recycled fibre blends',
      'Private-label collections for retail',
    ],
    techSpecs: [
      { label: 'Construction',   value: 'Handwoven Flatweave / Kilim / Dhurrie (reversible)' },
      { label: 'Primary Materials', value: 'Wool, Cotton, Jute, Recycled Fibre' },
      { label: 'Pile',           value: 'Pile-free (flat construction)' },
      { label: 'Edge Finish',    value: 'Reinforced selvedge' },
      { label: 'Dyes',           value: 'AZO-free vegetable & chrome dyes' },
      { label: 'Certifications', value: 'ISO 9001:2015, OEKO-TEX' },
    ],
    idealFor:  ['Contemporary Homes', 'Scandinavian Retail', 'Boutique Hotels', 'Designer Showrooms'],
    materials: ['Wool', 'Cotton', 'Jute', 'Recycled Fibre'],
    moq:       '150 Pieces',
    leadTime:  '35–50 Days',
    related:   ['hand-knotted-carpet', 'jute-sisal-rugs', 'shaggy-rugs'],
    faqs: [
      { q: 'What is the difference between a kilim and a dhurrie?', a: 'Both are flatwoven, pile-free rugs. Kilims traditionally use wool with tribal and geometric motifs, while dhurries are often cotton or wool with lighter, more contemporary patterns. As a manufacturer we produce both to custom designs.' },
      { q: 'Are flat weave rugs reversible?', a: 'Yes — most of our flatweaves are fully reversible, which extends their life and offers two looks in one rug. They are also lightweight and easy to move, making them ideal for layering.' },
      { q: 'Can you weave a custom geometric or tribal pattern?', a: 'Yes. As a flat weave manufacturer we translate custom geometric, tribal and contemporary artwork into woven designs, with bespoke colourways developed and sampled before production.' },
      { q: 'Are flat weaves durable enough for high-traffic areas?', a: 'Flat weaves are pile-free and hard-wearing, making them well-suited to hallways, dining areas and busy living spaces. Wool flatweaves in particular offer excellent durability and easy maintenance.' },
    ],
    gallery: gallery(
      ['/images/rug5.webp', '/images/rug3.webp', '/images/tgi-banner-3.webp'],
      'Flat Weave',
      ['Kilim flatweave living room', 'Geometric flatweave pattern detail', 'Reversible dhurrie close-up', 'Contemporary flatweave bedroom', 'Tribal motif kilim carpet', 'Flatweave loom weaving Bhadohi', 'Layered flatweave interior', 'Neutral tone flatweave runner', 'Colourful kilim collection', 'Hospitality flatweave suite', 'Cotton flatweave texture', 'Flatweave rug finishing'],
    ),
  },

  // ─────────────────────────────────────────────────────────────── POUFS
  {
    slug:      'poufs',
    name:      'Poufs',
    cardImage: '/images/rug2.webp',
    heroImage: '/images/tgi-banner-6.webp',
    tagline:   'Poufs — sculptural seating accents handcrafted in leather, wool and woven textiles. Made in Bhadohi, India.',
    seoTitle:  'Poufs & Floor Cushions Manufacturer in India | Bhadohi Supplier — Tapis Global',
    seoDescription: 'Pouf and floor cushion manufacturer and supplier in India. Hand-stitched leather, wool and woven poufs from Bhadohi for hotels, retail and homes. Custom & private-label. Request a catalogue or quote.',
    seoKeywords: ['poufs manufacturer India', 'floor cushions manufacturer India', 'leather pouf supplier India', 'ottoman pouf manufacturer', 'Bhadohi poufs', 'custom poufs manufacturer India'],
    h1:        'Poufs & Floor Cushions Manufacturer in India',
    intro:     'Tapis Global International is a pouf and floor cushion manufacturer and supplier in India, crafting luxury poufs — hand-stitched leather, embroidered wool and woven constructions — that complement our carpet collections for complete interior programmes.',
    body:      'Designed to coordinate with rug collections or stand alone as statement pieces, our poufs are filled with premium density foam or natural fibre stuffing and finished with hidden stitching and reinforced bases, manufactured to order in Bhadohi.',
    overview:  'Poufs complete a room and are a natural cross-sell for our carpet clients. As a direct manufacturer we offer colour-matched, custom and private-label poufs — a convenient single-source supply for hotels, retailers and designers furnishing complete interior schemes.',
    bullets: [
      { label: 'Craftsmanship', text: 'Hand-stitched and embroidered constructions — reinforced seams and premium inner filling for lasting form.' },
      { label: 'Materials', text: 'Leather, wool, cotton canvas, jute and embroidered textile covers — removable covers available.' },
      { label: 'Customization', text: 'Custom sizes, embroidery, logo branding and colour-matched to carpet collections.' },
      { label: 'Ideal Usage', text: 'Luxury lounges, hotel lobbies, retail display and residential accent seating.' },
    ],
    applications: [
      { title: 'Hotel Lobbies & Lounges', desc: 'Flexible sculptural seating that adds warmth and texture to hospitality social spaces.' },
      { title: 'Luxury Residences', desc: 'Accent poufs and floor cushions coordinated with rug collections for styled interiors.' },
      { title: 'Retail Display', desc: 'Coordinated pouf collections and private-label ranges for home and lifestyle retail.' },
      { title: 'Coworking & Breakout', desc: 'Soft, movable seating for relaxed breakout and informal meeting areas.' },
    ],
    process: [
      { step: '01', title: 'Material & Cover', desc: 'Leather, wool or woven covers are selected and colour-matched to the scheme or rug set.' },
      { step: '02', title: 'Stitching & Embroidery', desc: 'Covers are hand-stitched, with optional embroidery or logo branding applied.' },
      { step: '03', title: 'Filling & Base', desc: 'Premium-density filling and a reinforced base are added for lasting shape and stability.' },
      { step: '04', title: 'Finishing & QC', desc: 'Seams are checked, the pouf is finished and inspected before dispatch.' },
    ],
    customization: [
      'Custom sizes and shapes (round, cube, drum)',
      'Leather, wool, cotton canvas and woven covers',
      'Embroidery, logo branding and appliqué',
      'Colour-matched to carpet and rug collections',
      'Removable / washable cover options',
      'Private-label and OEM programmes',
    ],
    techSpecs: [
      { label: 'Construction',   value: 'Hand-stitched / embroidered upholstery' },
      { label: 'Primary Materials', value: 'Leather, Wool, Cotton Canvas, Woven Textile' },
      { label: 'Filling',        value: 'High-density foam / natural fibre' },
      { label: 'Cover',          value: 'Fixed or removable' },
      { label: 'Base',           value: 'Reinforced non-slip base' },
      { label: 'Certifications', value: 'ISO 9001:2015' },
    ],
    idealFor:  ['Hotel Lobbies', 'Luxury Lounges', 'Retail Display', 'Residential Accents'],
    materials: ['Leather', 'Wool', 'Cotton Canvas', 'Embroidered Textile'],
    moq:       '100 Pieces',
    leadTime:  '30–45 Days',
    related:   ['leather-carpets', 'hand-tufted-carpet', 'jute-sisal-rugs'],
    faqs: [
      { q: 'Can poufs be colour-matched to our carpets?', a: 'Yes. As a single-source manufacturer we colour-match poufs to your rug or carpet order, so hotels and designers can furnish a coordinated scheme from one supplier.' },
      { q: 'Do you offer private-label poufs for retail?', a: 'Yes — we produce private-label and OEM poufs with custom covers, branding and packaging for home and lifestyle retailers.' },
      { q: 'Are your poufs filled or supplied as covers only?', a: 'We can supply either — fully filled poufs with high-density filling and a reinforced base, or unfilled covers for cost-efficient shipping that are filled locally. Both are made to your specification.' },
      { q: 'Can poufs be ordered alongside a carpet project?', a: 'Yes. Many hotels and designers add colour-matched poufs to a carpet order so the whole scheme ships from one manufacturer — simplifying procurement and ensuring a coordinated finish.' },
    ],
    gallery: gallery(
      ['/images/rug2.webp', '/images/tgi-banner-6.webp', '/images/handtufted-img-2.webp'],
      'Pouf',
      ['Leather pouf luxury lounge', 'Embroidered wool pouf detail', 'Moroccan style floor cushion', 'Hotel lobby pouf arrangement', 'Woven jute pouf accent', 'Custom logo embroidered pouf', 'Round leather ottoman pouf', 'Contemporary pouf living room', 'Pouf coordinated with rug set', 'Hand-stitched pouf construction', 'Retail display pouf collection', 'Pouf finishing detail'],
    ),
  },

  // ─────────────────────────────────────────────────────────────── COCO COIR
  {
    slug:      'coco-coir',
    name:      'Coco Coir',
    cardImage: '/images/coir/coir-persian-medallion.webp',
    heroImage: '/images/coir/coir-monogram-hotel-entrance.webp',
    tagline:   'Coco coir products — natural coir mats, husk and eco floor solutions for entrances, hospitality and sustainable interiors. Made in India.',
    seoTitle:  'Coco Coir Products Manufacturer in India | Coir Mats & Matting Supplier — Tapis Global',
    seoDescription: 'Coco coir products manufacturer and supplier in India. Natural coir mats, matting, coco peat and eco floor solutions from Bhadohi for hospitality, retail and projects. Request a catalogue or quote.',
    seoKeywords: ['coco coir products manufacturer India', 'coir mats manufacturer India', 'coir matting supplier India', 'coco peat manufacturer India', 'natural coir mats India', 'eco floor solutions manufacturer'],
    h1:        'Coco Coir Products Manufacturer in India',
    intro:     'Tapis Global International is a coco coir products manufacturer and supplier in India, producing natural coir mats, coco peat, husk products and eco floor coverings — manufactured for pan India projects and international buyers seeking sustainable natural fibre solutions.',
    body:      'Our coir division processes coconut fibre into woven mats, entrance rugs, erosion-control products and horticultural coco peat — finished to premium quality with project-wise dispatch across India and worldwide.',
    overview:  'Coco coir is a renewable, hard-wearing natural fibre ideal for entrances and eco-conscious projects. As a direct manufacturer we supply branded coir matting, anti-slip backed mats and bulk coco peat — a dependable partner for hospitality, institutional and green-building procurement teams.',
    bullets: [
      { label: 'Craftsmanship', text: 'Machine and hand-woven coir constructions — latex backing, anti-slip treatments and UV-resistant options.' },
      { label: 'Materials', text: 'Natural coconut coir, rubber latex backing, biodegradable coco peat and husk chips.' },
      { label: 'Customization', text: 'Custom sizes, printed logos on coir mats, private-label packaging and bulk container programmes.' },
      { label: 'Ideal Usage', text: 'Entrance matting, eco retail, hospitality back-of-house and institutional green building projects.' },
    ],
    applications: [
      { title: 'Entrance Matting', desc: 'Durable, high-scrape coir mats for hotel, retail and commercial entrances — logo-printed options available.' },
      { title: 'Hospitality Projects', desc: 'Back-of-house and entrance coir solutions that combine practicality with a natural aesthetic.' },
      { title: 'Eco & Green Building', desc: 'Biodegradable coir and coco peat for sustainable and LEED-oriented building projects.' },
      { title: 'Horticulture & Erosion', desc: 'Coco peat, husk chips and coir logs for landscaping, horticulture and erosion control.' },
    ],
    process: [
      { step: '01', title: 'Fibre Processing', desc: 'Coconut husk is processed into clean coir fibre and graded for the chosen product.' },
      { step: '02', title: 'Weaving / Forming', desc: 'Fibre is machine or hand-woven into mats, or formed into coco peat blocks and husk products.' },
      { step: '03', title: 'Backing & Treatment', desc: 'Rubber latex backing, anti-slip and UV treatments are applied to specification.' },
      { step: '04', title: 'Printing & QC', desc: 'Logos are printed where required, products are packed in bulk and inspected before dispatch.' },
    ],
    customization: [
      'Custom mat sizes and thicknesses',
      'Logo and message printing on coir mats',
      'Anti-slip rubber latex backing',
      'UV-resistant outdoor treatments',
      'Coco peat blocks, husk chips and coir logs',
      'Private-label packaging and bulk containers',
    ],
    techSpecs: [
      { label: 'Construction',   value: 'Woven / brush / formed coir' },
      { label: 'Primary Materials', value: 'Natural Coconut Coir, Coco Peat, Husk' },
      { label: 'Backing',        value: 'Rubber latex / PVC / unbacked' },
      { label: 'Treatment',      value: 'Anti-slip, UV-resistant options' },
      { label: 'Branding',       value: 'Logo printing & inlay available' },
      { label: 'Certifications', value: 'ISO 9001:2015, biodegradable materials' },
    ],
    idealFor:  ['Entrance Matting', 'Eco Retail', 'Hospitality Projects', 'Institutional Interiors'],
    materials: ['Natural Coir', 'Coco Peat', 'Coco Husk', 'Rubber Latex Backing'],
    moq:       '500 Pieces',
    leadTime:  '25–40 Days',
    related:   ['jute-sisal-rugs', 'wall-to-wall-carpets', 'flat-weaves'],
    faqs: [
      { q: 'Can you print our logo on coir entrance mats?', a: 'Yes. As a manufacturer we print logos and custom messages onto coir mats and can produce branded entrance matting in custom sizes for hotels, retail and corporate clients.' },
      { q: 'Do you supply coco peat and husk products in bulk?', a: 'Yes — alongside coir matting we manufacture coco peat blocks, husk chips and coir logs for horticulture, landscaping and erosion control, available in bulk container quantities.' },
      { q: 'Are your coir entrance mats suitable for hotel and commercial use?', a: 'Yes. Our coir entrance mats are high-scrape, hard-wearing and available with anti-slip rubber backing and logo printing — ideal for hotel lobbies, retail entrances and commercial doorways with heavy footfall.' },
      { q: 'Can coir products be used outdoors?', a: 'Yes. We offer UV-resistant treatments and weather-appropriate constructions for covered outdoor entrances and landscaping. We will recommend the right specification for your exposure and climate.' },
    ],
    gallery: [
      { src: '/images/coir/coir-monogram-hotel-entrance.webp', alt: 'Monogrammed coir entrance mat at a luxury hotel doorway — Tapis Global International' },
      { src: '/images/coir/coir-persian-medallion.webp',       alt: 'Persian medallion printed coir entrance mat — Tapis Global International' },
      { src: '/images/coir/coir-designer-floral-bird.webp',    alt: 'Designer floral and songbird printed coir mat — Tapis Global International' },
      { src: '/images/coir/coir-medallion-bordered.webp',      alt: 'Bordered floral-medallion printed coir mat — Tapis Global International' },
      { src: '/images/coir/coir-ocean-wave-art.webp',          alt: 'Great-wave art-print coir mat — Tapis Global International' },
      { src: '/images/coir/coir-bird-botanical.webp',          alt: 'Botanical songbird printed coir mat — Tapis Global International' },
      { src: '/images/coir/coir-natural-coconut.webp',         alt: '100% natural coconut-fibre coir entrance mat — Tapis Global International' },
      { src: '/images/coir/coir-pvc-backed.webp',              alt: 'Anti-slip PVC-backed natural coir mat — Tapis Global International' },
      { src: '/images/coir/coir-welcome-bordered.webp',        alt: "Classic bordered 'Welcome' coir mat — Tapis Global International" },
      { src: '/images/coir/coir-wildflower-butterfly.webp',    alt: 'Wildflower and butterfly printed coir mat — Tapis Global International' },
      { src: '/images/coir/coir-owl-motif.webp',               alt: 'Decorative owl-motif printed coir mat — Tapis Global International' },
      { src: '/images/coir/coir-safari-welcome.webp',          alt: "Safari giraffe 'Welcome' coir mat — Tapis Global International" },
    ],
  },

  // ─────────────────────────────────────────────────────────────── KILIM RUGS
  {
    slug:      'kilim-rugs',
    name:      'Kilim Rugs',
    cardImage: '/images/kilim/kilim-tribal-diamond-room.webp',
    heroImage: '/images/kilim/kilim-medallion-runner-palace.webp',
    tagline:   'Handwoven kilim rugs — flatwoven, reversible and rich in tribal and geometric heritage. Made in Bhadohi, India.',
    seoTitle:  'Kilim Rug Manufacturer in India | Handwoven Kilim Supplier & Exporter — Tapis Global',
    seoDescription: 'Kilim rug manufacturer and supplier in India. Handwoven, reversible wool and cotton kilims from Bhadohi — tribal, geometric and contemporary designs. Custom sizes, bulk and export. Request a catalogue or quote.',
    seoKeywords: ['kilim rug manufacturer India', 'kilim manufacturer', 'handwoven kilim supplier India', 'wool kilim rugs', 'Bhadohi kilim rugs', 'tribal kilim manufacturer'],
    h1:        'Kilim Rug Manufacturer in India',
    intro:     'Tapis Global International is a kilim rug manufacturer and supplier in India, handweaving flatwoven, reversible kilims in our Bhadohi facility. Rooted in tribal and geometric tradition yet adaptable to contemporary interiors, our kilims serve designers, retailers and project buyers across India and international markets.',
    body:      'A kilim is woven on the loom without pile — the pattern is the structure itself, which is why a true kilim is reversible and remarkably hard-wearing. We weave kilims in wool and cotton with AZO-free dyes, producing classical tribal motifs, bold geometrics and restrained contemporary designs to order.',
    overview:  'As a direct manufacturer we control yarn dyeing and weaving in-house, so colour and pattern stay faithful from sample to bulk. Kilims layer beautifully, suit high-traffic areas and bring authentic handcraft character to a space — making them a versatile choice for residential, retail and boutique hospitality projects.',
    bullets: [
      { label: 'Craftsmanship', text: 'Handwoven on traditional looms — pile-free, reversible construction with reinforced selvedges and export finishing.' },
      { label: 'Materials', text: 'Wool, cotton and wool blends with AZO-free vegetable and chrome dyes.' },
      { label: 'Customization', text: 'Tribal reproductions, custom geometrics, contemporary palettes and bespoke sizes.' },
      { label: 'Ideal Usage', text: 'Layered interiors, boutique hospitality, lifestyle retail and high-traffic living spaces.' },
    ],
    applications: [
      { title: 'Contemporary & Boho Homes', desc: 'Reversible kilims that layer beautifully and add authentic handcraft character.' },
      { title: 'Lifestyle & Scandi Retail', desc: 'Tribal and geometric kilim collections for design-led retail brands.' },
      { title: 'Boutique Hospitality', desc: 'Characterful flatwoven pieces for relaxed, design-forward venues.' },
      { title: 'Designer Projects', desc: 'Bespoke kilim designs developed to artwork and palettes.' },
    ],
    process: [
      { step: '01', title: 'Design & Dyeing', desc: 'The motif is charted and yarns are dyed with AZO-free vegetable or chrome dyes.' },
      { step: '02', title: 'Flat Weaving', desc: 'Weavers interlace warp and weft on traditional looms to build the pile-free, reversible kilim.' },
      { step: '03', title: 'Selvedge Finishing', desc: 'Kilim selvedges and slit-weave joins are hand-reinforced so the tight geometric motifs hold their crisp edges and the rug stays fully reversible.' },
      { step: '04', title: 'Washing & QC', desc: 'The kilim is washed, squared to size and inspected against the approved design.' },
    ],
    customization: [
      'Classical tribal and bold geometric patterns',
      'Contemporary and restrained colour palettes',
      'Custom sizes and runner lengths',
      'Wool, cotton and wool-blend constructions',
      'AZO-free vegetable and chrome dyes',
      'Private-label collections for retail',
    ],
    techSpecs: [
      { label: 'Construction',   value: 'Handwoven Flatweave Kilim (reversible)' },
      { label: 'Primary Materials', value: 'Wool, Cotton, Wool Blends' },
      { label: 'Pile',           value: 'Pile-free (flat construction)' },
      { label: 'Edge Finish',    value: 'Reinforced selvedge' },
      { label: 'Dyes',           value: 'AZO-free vegetable & chrome dyes' },
      { label: 'Certifications', value: 'ISO 9001:2015, OEKO-TEX' },
    ],
    idealFor:  ['Contemporary Homes', 'Lifestyle Retail', 'Boutique Hotels', 'Designer Showrooms'],
    materials: ['Wool', 'Cotton', 'Wool Blends'],
    moq:       '150 Pieces',
    leadTime:  '35–50 Days',
    related:   ['flat-weaves', 'dhurrie-rugs', 'hand-knotted-carpet'],
    faqs: [
      { q: 'What is the difference between a kilim and a knotted rug?', a: 'A kilim is flatwoven with no pile — the pattern is the weave itself, making it reversible, lightweight and hard-wearing. A knotted rug has pile tied knot-by-knot. As a manufacturer we produce both and advise which suits your use and budget.' },
      { q: 'Are kilims durable for high-traffic areas?', a: 'Yes. Their tight flatweave construction is hard-wearing and well-suited to hallways, dining and busy living areas, and being reversible they wear evenly over time.' },
    ],
    gallery: [
      { src: '/images/kilim/kilim-medallion-runner-palace.webp', alt: 'Medallion kilim runner in a palatial marble interior — Tapis Global International' },
      { src: '/images/kilim/kilim-tribal-diamond-room.webp',     alt: 'Tribal diamond-motif wool kilim rug in a styled living room — Tapis Global International' },
      { src: '/images/kilim/kilim-medallion-runner-living.webp', alt: 'Terracotta medallion kilim runner in a living room — Tapis Global International' },
      { src: '/images/kilim/kilim-tribal-runner-kitchen.webp',   alt: 'Green and navy tribal kilim runner in a kitchen — Tapis Global International' },
      { src: '/images/kilim/kilim-stair-runner.webp',            alt: 'Colourful geometric kilim stair runner — Tapis Global International' },
      { src: '/images/kilim/kilim-geometric-designer-room.webp', alt: 'Contemporary geometric kilim rug in a designer interior — Tapis Global International' },
      { src: '/images/kilim/kilim-checkerboard-room.webp',       alt: 'Red and charcoal checkerboard kilim rug — Tapis Global International' },
      { src: '/images/kilim/kilim-red-border-tribal-room.webp',  alt: 'Red-bordered tribal kilim rug in a living room — Tapis Global International' },
      { src: '/images/kilim/kilim-jute-wool-medallion-room.webp',alt: 'Jute and wool medallion kilim in a warm interior — Tapis Global International' },
      { src: '/images/kilim/kilim-wool-tribal-runner.webp',      alt: 'New Zealand wool tribal kilim runner — Tapis Global International' },
      { src: '/images/kilim/kilim-handweaving-loom.webp',        alt: 'Artisan hand-weaving a kilim on the loom in Bhadohi — Tapis Global International' },
      { src: '/images/kilim/kilim-stepped-geometric-flatlay.webp',alt: 'Earth-tone stepped-geometric wool kilim, full view — Tapis Global International' },
    ],
  },

  // ─────────────────────────────────────────────────────────────── DHURRIE RUGS
  {
    slug:      'dhurrie-rugs',
    name:      'Dhurrie Rugs',
    cardImage: '/images/rug3.webp',
    heroImage: '/images/rug3.webp',
    tagline:   'Handwoven Indian dhurries — flatwoven cotton and wool rugs in clean, contemporary and traditional designs. Made in Bhadohi.',
    seoTitle:  'Dhurrie Rug Manufacturer in India | Handwoven Dhurrie Supplier & Exporter — Tapis Global',
    seoDescription: 'Dhurrie rug manufacturer and supplier in India. Handwoven cotton and wool dhurries from Bhadohi — striped, geometric and contemporary designs. Custom sizes, bulk and export. Request a catalogue or quote.',
    seoKeywords: ['dhurrie manufacturer India', 'dhurrie rug supplier India', 'cotton dhurrie manufacturer', 'handwoven dhurrie rugs', 'Bhadohi dhurrie rugs', 'Indian dhurrie exporter'],
    h1:        'Dhurrie Rug Manufacturer in India',
    intro:     'Tapis Global International is a dhurrie rug manufacturer and supplier in India, handweaving traditional Indian dhurries in our Bhadohi facility. Lightweight, flatwoven and versatile, our cotton and wool dhurries suit contemporary and classic interiors alike, supplied to designers, retailers and projects across India and worldwide.',
    body:      'The dhurrie is India\'s classic flatwoven rug — typically cotton or wool, prized for clean stripes, crisp geometrics and an easy, casual elegance. We weave dhurries to order with faithful pattern reproduction and durable selvedges, balancing heritage technique with contemporary design sensibility.',
    overview:  'As a direct manufacturer we develop dhurries from your artwork or our studio designs, dye in-house for colour accuracy and produce in volume with batch consistency. Dhurries are reversible, lightweight and easy to maintain — ideal for layering, casual living spaces and design-led retail collections.',
    bullets: [
      { label: 'Craftsmanship', text: 'Handwoven flatweave dhurries with crisp patterning and reinforced selvedges.' },
      { label: 'Materials', text: 'Cotton, wool and recycled-fibre blends with AZO-free dyes.' },
      { label: 'Customization', text: 'Stripes, geometrics, contemporary designs, custom sizes and colourways.' },
      { label: 'Ideal Usage', text: 'Casual living spaces, children\'s rooms, lifestyle retail and layered interiors.' },
    ],
    applications: [
      { title: 'Casual & Family Homes', desc: 'Lightweight, washable-friendly dhurries for relaxed everyday living.' },
      { title: 'Lifestyle Retail', desc: 'Striped and geometric dhurrie collections for home and lifestyle brands.' },
      { title: 'Children\'s & Bedrooms', desc: 'Soft, easy-care flatwoven rugs in cheerful colourways.' },
      { title: 'Designer Layering', desc: 'Clean flatwoven bases for layered, contemporary interior schemes.' },
    ],
    process: [
      { step: '01', title: 'Design & Dyeing', desc: 'Stripe or geometric patterns are set and cotton/wool yarns dyed for accuracy.' },
      { step: '02', title: 'Flat Weaving', desc: 'Artisans weave the pile-free dhurrie on traditional pit or frame looms.' },
      { step: '03', title: 'Selvedge & Fringe', desc: 'Edges, selvedges and optional fringes are finished for durability.' },
      { step: '04', title: 'Washing & QC', desc: 'The dhurrie is washed, squared and inspected before dispatch.' },
    ],
    customization: [
      'Classic stripes and contemporary geometrics',
      'Custom colourways and palettes',
      'Cotton, wool and recycled-fibre blends',
      'Custom sizes and runner lengths',
      'Optional fringe and border treatments',
      'Private-label retail collections',
    ],
    techSpecs: [
      { label: 'Construction',   value: 'Handwoven Flatweave Dhurrie (reversible)' },
      { label: 'Primary Materials', value: 'Cotton, Wool, Recycled-Fibre Blends' },
      { label: 'Pile',           value: 'Pile-free (flat construction)' },
      { label: 'Edge Finish',    value: 'Reinforced selvedge / optional fringe' },
      { label: 'Dyes',           value: 'AZO-free dyes' },
      { label: 'Certifications', value: 'ISO 9001:2015, OEKO-TEX' },
    ],
    idealFor:  ['Casual Homes', 'Lifestyle Retail', 'Children\'s Rooms', 'Designer Layering'],
    materials: ['Cotton', 'Wool', 'Recycled-Fibre Blends'],
    moq:       '150 Pieces',
    leadTime:  '30–45 Days',
    related:   ['flat-weaves', 'kilim-rugs', 'jute-sisal-rugs'],
    faqs: [
      { q: 'What is a dhurrie rug?', a: 'A dhurrie is a traditional Indian flatwoven rug, usually cotton or wool, known for clean stripes and geometric patterns. It is pile-free, reversible, lightweight and easy to maintain.' },
      { q: 'Are cotton dhurries washable?', a: 'Cotton dhurries are easy to maintain and tolerate gentle cleaning well, which makes them popular for casual living spaces and children\'s rooms. We advise on care per construction.' },
    ],
    gallery: gallery(
      ['/images/rug3.webp', '/images/rug5.webp', '/images/tgi-banner-3.webp'],
      'Dhurrie Rug',
      ['Striped cotton dhurrie living room', 'Geometric dhurrie detail', 'Reversible dhurrie close-up', 'Contemporary dhurrie bedroom', 'Classic Indian dhurrie', 'Dhurrie loom weaving Bhadohi', 'Layered dhurrie interior', 'Neutral dhurrie runner', 'Colourful dhurrie collection', 'Children\'s room dhurrie', 'Cotton dhurrie texture', 'Dhurrie rug finishing'],
    ),
  },

  // ─────────────────────────────────────────────────────────────── AREA RUGS
  {
    slug:      'area-rugs',
    name:      'Area Rugs',
    cardImage: '/images/rug1.webp',
    heroImage: '/images/rug1.webp',
    tagline:   'Custom area rugs in every construction — hand tufted, knotted, flatwoven and shaggy. Manufactured in Bhadohi, India.',
    seoTitle:  'Area Rug Manufacturer in India | Custom Area Rugs Supplier & Exporter — Tapis Global',
    seoDescription: 'Area rug manufacturer and supplier in India. Custom area rugs in hand tufted, hand knotted, flatweave and shaggy constructions from Bhadohi — any size, colour and design. Bulk and export. Request a catalogue or quote.',
    seoKeywords: ['area rug manufacturer India', 'area rugs supplier India', 'custom area rugs', 'large area rugs manufacturer', 'Bhadohi area rugs', 'designer area rugs India'],
    h1:        'Area Rug Manufacturer in India',
    intro:     'Tapis Global International is an area rug manufacturer and supplier in India, producing custom area rugs across every construction — hand tufted, hand knotted, flatwoven and shaggy — from our Bhadohi facility. Whatever the size, style or budget, we manufacture area rugs to specification for homes, projects and retail.',
    body:      'An area rug defines and anchors a space. Because we manufacture across all constructions in-house, we can match the right technique to your brief — plush tufted comfort, heirloom knotted luxury, casual flatwoven character or deep shaggy softness — in any size, shape and colourway.',
    overview:  'As a direct manufacturer we offer complete flexibility: custom dimensions including oversized and round, Pantone colour matching, and any design from classic to contemporary. This makes us a single-source partner for designers, hospitality buyers and retailers who need area rugs tailored exactly to each space.',
    bullets: [
      { label: 'Craftsmanship', text: 'All constructions in-house — tufted, knotted, flatwoven and shaggy — finished to premium standard.' },
      { label: 'Materials', text: 'Wool, silk, viscose, cotton, jute and blends, selected to suit each construction.' },
      { label: 'Customization', text: 'Any size and shape, Pantone colour matching, and designs from classic to contemporary.' },
      { label: 'Ideal Usage', text: 'Living rooms, bedrooms, hospitality, retail and designer interiors.' },
    ],
    applications: [
      { title: 'Living & Family Rooms', desc: 'Statement area rugs that anchor and define residential spaces.' },
      { title: 'Hospitality & Suites', desc: 'Custom area rugs for hotel rooms, lounges and feature spaces.' },
      { title: 'Retail & Showrooms', desc: 'Curated area rug collections, including private-label, for retail.' },
      { title: 'Designer Interiors', desc: 'Bespoke area rugs developed to each scheme and palette.' },
    ],
    process: [
      { step: '01', title: 'Brief & Construction', desc: 'We match the right construction — tufted, knotted, flatwoven or shaggy — to your design and budget.' },
      { step: '02', title: 'Lab-Dip & Sample', desc: 'Yarn colours are lab-dipped against Pantone and a sample is produced for approval.' },
      { step: '03', title: 'Manufacturing', desc: 'The rug is crafted to the approved specification with in-house QC at each stage.' },
      { step: '04', title: 'Finishing & QC', desc: 'The area rug is finished to size and shape and inspected before dispatch.' },
    ],
    customization: [
      'Any size and shape — including oversized and round',
      'All constructions: tufted, knotted, flatweave, shaggy',
      'Pantone and RAL colour matching',
      'Classic, transitional and contemporary designs',
      'Borders, medallions and bespoke patterns',
      'Private-label and OEM programmes',
    ],
    techSpecs: [
      { label: 'Construction',   value: 'Hand Tufted / Knotted / Flatweave / Shaggy' },
      { label: 'Primary Materials', value: 'Wool, Silk, Viscose, Cotton, Jute, Blends' },
      { label: 'Sizes',          value: 'Any custom size, shape (incl. round / oversized)' },
      { label: 'Colour',         value: 'Pantone / RAL matched, lab-dip approved' },
      { label: 'Backing',        value: 'Per construction (cotton canvas / latex / none)' },
      { label: 'Certifications', value: 'ISO 9001:2015, OEKO-TEX' },
    ],
    idealFor:  ['Luxury Homes', 'Hotels & Suites', 'Retail Collections', 'Designer Interiors'],
    materials: ['Wool', 'Silk', 'Viscose', 'Cotton', 'Jute'],
    moq:       '50 Pieces',
    leadTime:  '40–60 Days',
    related:   ['hand-tufted-carpet', 'shaggy-rugs', 'hand-knotted-carpet'],
    faqs: [
      { q: 'What size area rugs can you manufacture?', a: 'Any custom size and shape, including oversized and round. As a manufacturer we make area rugs to your exact dimensions for the space.' },
      { q: 'Which construction should I choose for an area rug?', a: 'It depends on use and budget — hand tufted for plush comfort and value, hand knotted for heirloom luxury, flatweave for casual durability, shaggy for softness. We make all four and advise per project.' },
    ],
    gallery: gallery(
      ['/images/rug1.webp', '/images/rug2.webp', '/images/handtufted-img-2.webp'],
      'Area Rug',
      ['Area rug anchoring living room', 'Area rug texture detail', 'Round area rug interior', 'Bedroom area rug', 'Custom colour area rug', 'Area rug production Bhadohi', 'Hospitality suite area rug', 'Neutral area rug', 'Designer area rug collection', 'Oversized area rug', 'Wool area rug close-up', 'Area rug finishing'],
    ),
  },

  // ─────────────────────────────────────────────────────────────── CARPET TILES
  {
    slug:      'carpet-tiles',
    name:      'Carpet Tiles',
    cardImage: '/images/tgi-banner-4.webp',
    heroImage: '/images/tgi-banner-4.webp',
    tagline:   'Modular carpet tiles manufactured for offices, commercial and high-traffic interiors — durable, replaceable, design-led.',
    seoTitle:  'Carpet Tiles Manufacturer in India | Modular Office Carpet Tile Supplier — Tapis Global',
    seoDescription: 'Carpet tiles manufacturer and supplier in India. Modular, durable commercial carpet tiles from Bhadohi for offices, retail and high-traffic spaces — custom colours, easy replacement, bulk supply. Request a catalogue or quote.',
    seoKeywords: ['carpet tiles manufacturer India', 'modular carpet tiles supplier', 'office carpet tiles India', 'commercial carpet tiles manufacturer', 'carpet tile supplier India'],
    h1:        'Carpet Tiles Manufacturer in India',
    intro:     'Tapis Global International is a carpet tiles manufacturer and supplier in India, producing modular commercial carpet tiles from our Bhadohi facility. Durable, replaceable and design-flexible, our carpet tiles serve offices, retail, institutions and high-traffic spaces across India and international markets.',
    body:      'Carpet tiles combine commercial-grade durability with practical modularity: individual tiles can be replaced in high-wear zones, lifted for access to under-floor cabling, and laid in patterns or directional schemes. We manufacture tiles with stable backing systems in custom colours, coordinated with broadloom for whole-project consistency.',
    overview:  'As a direct manufacturer we deliver contract-grade carpet tiles with dye-lot consistency across large runs, fire-rating where required, and the bulk capacity commercial fit-outs demand. Carpet tiles reduce installation waste and long-term maintenance cost, making them a smart specification for workplaces and public buildings.',
    bullets: [
      { label: 'Craftsmanship', text: 'Tufted modular tiles with dimensionally stable backing for precise, lay-flat installation.' },
      { label: 'Materials', text: 'Solution-dyed nylon, polypropylene and recycled-fibre faces on bitumen/PVC/cushion backing.' },
      { label: 'Customization', text: 'Custom colours, patterns, directional layouts and broadloom coordination.' },
      { label: 'Ideal Usage', text: 'Offices, retail, institutions, transport and high-traffic commercial interiors.' },
    ],
    applications: [
      { title: 'Offices & Workplaces', desc: 'Replaceable modular tiles for cabled, high-traffic open-plan floors.' },
      { title: 'Retail & Showrooms', desc: 'Design-led zoned tile layouts that guide customers and frame display.' },
      { title: 'Institutions & Public Buildings', desc: 'Durable, fire-rated tiles for schools, healthcare and civic spaces.' },
      { title: 'Transport & Aviation', desc: 'Heavy-duty modular flooring for terminals and transit interiors.' },
    ],
    process: [
      { step: '01', title: 'Specification & Colour', desc: 'Colour, pattern, performance class and backing are confirmed with the project team.' },
      { step: '02', title: 'Tufting', desc: 'Tile faces are tufted with strict dye-lot control for colour consistency.' },
      { step: '03', title: 'Backing & Cutting', desc: 'A dimensionally stable backing is applied and tiles are precision-cut to size.' },
      { step: '04', title: 'QC & Phased Dispatch', desc: 'Tiles are inspected and dispatched on a schedule aligned to the installation programme.' },
    ],
    customization: [
      'Custom colours and dye-lot matching',
      'Directional, quarter-turn and pattern layouts',
      'Coordination with broadloom for one scheme',
      'Fire-rated and stain-resistant treatments',
      'Solution-dyed nylon, polypropylene, recycled fibre',
      'Phased project delivery and bulk supply',
    ],
    techSpecs: [
      { label: 'Construction',   value: 'Tufted Modular Carpet Tile' },
      { label: 'Tile Size',      value: '50×50 cm (other sizes on request)' },
      { label: 'Primary Materials', value: 'Solution-Dyed Nylon, Polypropylene, Recycled Fibre' },
      { label: 'Backing',        value: 'Bitumen / PVC / cushion backing' },
      { label: 'Performance',    value: 'Heavy-traffic & fire-rated options' },
      { label: 'Certifications', value: 'ISO 9001:2015, fire-rating on request' },
    ],
    idealFor:  ['Offices', 'Retail', 'Institutions', 'Transport Hubs'],
    materials: ['Solution-Dyed Nylon', 'Polypropylene', 'Recycled Fibre'],
    moq:       '500 Sq M',
    leadTime:  '45–70 Days',
    related:   ['wall-to-wall-carpets', 'hand-tufted-carpet', 'flat-weaves'],
    faqs: [
      { q: 'Why choose carpet tiles over broadloom?', a: 'Carpet tiles let you replace individual worn tiles, access under-floor cabling and lay directional patterns, reducing waste and long-term maintenance cost. We coordinate tiles with broadloom so multi-area projects stay consistent.' },
      { q: 'Are your carpet tiles fire-rated for commercial use?', a: 'Yes. We manufacture fire-rated carpet tiles to the relevant contract standards and provide documentation for commercial and institutional buyers.' },
    ],
    gallery: gallery(
      ['/images/tgi-banner-4.webp', '/images/tufting-carpet.webp', '/images/manufacturing-rug-img.webp'],
      'Carpet Tiles',
      ['Office carpet tile floor', 'Carpet tile texture detail', 'Modular tile layout', 'Directional carpet tile pattern', 'Commercial carpet tiles install', 'Carpet tile production Bhadohi', 'Retail carpet tile zoning', 'Neutral carpet tile', 'Custom colour tile run', 'Fire-rated carpet tiles', 'Recycled-fibre carpet tile', 'Carpet tile QC'],
    ),
  },

  // ─────────────────────────────────────────────────────────────── TAT PATTI
  {
    slug:      'tat-patti',
    name:      'Tat Patti',
    cardImage: '/images/jute-rugs-manufacturing.webp',
    heroImage: '/images/jute-rugs-manufacturing.webp',
    tagline:   'Tat Patti floor matting — durable woven cotton and jute matting for schools, institutions and tender supply. Made in Bhadohi.',
    seoTitle:  'Tat Patti Manufacturer in India | School & Institutional Floor Matting — Tapis Global',
    seoDescription: 'Tat Patti manufacturer and supplier in India. Durable woven cotton and jute tat patti floor matting from Bhadohi for schools, hostels, NGOs and government tenders — bulk, economical, fast. Request a quote.',
    seoKeywords: ['tat patti manufacturer India', 'tat patti supplier', 'school tat patti', 'floor matting manufacturer India', 'cotton tat patti', 'jute tat patti'],
    h1:        'Tat Patti Manufacturer in India',
    intro:     'Tat Patti is a flat, hard-wearing woven floor matting used for floor seating and floor covering across schools, anganwadis, hostels, halls, places of worship and relief programmes. Tapis Global International manufactures Tat Patti in cotton and jute from our Bhadohi facility, at the economical bulk scale institutional and government buyers require.',
    body:      'Woven flat and tight for heavy floor-seating and foot traffic, Tat Patti is the practical, budget-friendly floor-covering choice for high-volume institutional use. We produce it in standard rolls and cut sizes, with custom widths and lengths to suit classroom, hall and tender specifications.',
    overview:  'As a direct manufacturer we supply Tat Patti in the large, repeatable volumes government schools, tribal welfare departments, anganwadis and NGOs procure — at genuine factory pricing, with batch consistency, tender documentation and the capacity to meet supply deadlines. For detailed buyer-intent information see our dedicated Dhurrie & Tat Patti silo.',
    bullets: [
      { label: 'Craftsmanship', text: 'Flat, tightly woven cotton and jute matting built for heavy floor seating and foot traffic.' },
      { label: 'Materials', text: 'Cotton, jute and cotton-jute blends with non-toxic, AZO-free dyes.' },
      { label: 'Customization', text: 'Standard rolls and cut sizes, plus custom widths and lengths to tender specification.' },
      { label: 'Ideal Usage', text: 'Government and public schools, anganwadis, hostels, NGOs, relief camps and halls.' },
    ],
    applications: [
      { title: 'Government & Public Schools', desc: 'Bulk floor-seating matting for classrooms and assemblies.' },
      { title: 'Anganwadis & Ashram Schools', desc: 'Economical matting for child and residential education.' },
      { title: 'NGOs & Relief Programmes', desc: 'Bulk Tat Patti for community, relief and rural supply.' },
      { title: 'Halls & Places of Worship', desc: 'Hard-wearing matting for congregational floor seating.' },
    ],
    process: [
      { step: '01', title: 'Fibre & Yarn', desc: 'Cotton and jute yarns are selected and prepared for flat, tight weaving.' },
      { step: '02', title: 'Flat Weaving', desc: 'The matting is woven flat and tight on looms for heavy floor-seating durability.' },
      { step: '03', title: 'Cutting & Finishing', desc: 'Rolls are cut to standard or custom sizes and edges finished for institutional use.' },
      { step: '04', title: 'QC & Bulk Dispatch', desc: 'Batch-consistent output is inspected and dispatched to tender programme dates.' },
    ],
    customization: [
      'Cotton, jute and cotton-jute blend constructions',
      'Standard rolls and cut sizes',
      'Custom widths and lengths to tender spec',
      'Specified or natural colourways (AZO-free)',
      'Bulk institutional and government volumes',
      'Tender documentation and samples',
    ],
    techSpecs: [
      { label: 'Construction',   value: 'Flat tight-woven matting' },
      { label: 'Primary Materials', value: 'Cotton, Jute, Cotton-Jute Blend' },
      { label: 'Format',         value: 'Rolls & cut sizes (custom widths/lengths)' },
      { label: 'Use',            value: 'Floor seating & floor covering' },
      { label: 'Dyes',           value: 'AZO-free, non-toxic' },
      { label: 'Certifications', value: 'ISO 9001:2015' },
    ],
    idealFor:  ['Government Schools', 'Anganwadis', 'Hostels & NGOs', 'Relief Programmes'],
    materials: ['Cotton', 'Jute', 'Cotton-Jute Blend'],
    moq:       'Bulk / Tender Volumes',
    leadTime:  '2–4 Weeks',
    related:   ['dhurrie-rugs', 'jute-sisal-rugs', 'flat-weaves'],
    faqs: [
      { q: 'What is Tat Patti and what is it used for?', a: 'Tat Patti is a flat woven floor matting used for floor seating and covering in schools, anganwadis, hostels, halls, places of worship and relief camps — economical, durable and ideal for high-volume institutional use.' },
      { q: 'Do you supply Tat Patti for government tenders?', a: 'Yes. We manufacture Tat Patti to tender specification in bulk with competitive pricing, samples and documentation, and capacity to meet government and NGO deadlines. See our Government Tender Tat Patti Supplier page.' },
    ],
    gallery: gallery(
      ['/images/jute-rugs-manufacturing.webp', '/images/wool-drying-pic.webp', '/images/manufacturing-rug-img.webp'],
      'Tat Patti',
      ['Tat patti floor matting school', 'Tat patti weave texture', 'Cotton tat patti roll', 'Jute tat patti matting', 'Classroom floor seating tat patti', 'Tat patti production Bhadohi', 'Bulk tat patti rolls', 'Anganwadi floor matting', 'Institutional tat patti', 'Tat patti cut sizes', 'Natural jute tat patti', 'Tat patti QC inspection'],
    ),
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// DEPTH CONTENT — unique long-form content per product (1800–2500 word target).
// Keyed by slug and merged below. Every paragraph is written for its specific
// product; no paragraph is shared across pages.
// ─────────────────────────────────────────────────────────────────────────────
type ProductDepth = {
  deepDive:        string[]
  materialDetails: MaterialDetail[]
  useCases:        UseCase[]
  exportInfo:      string[]
  relatedGuides:   string[]
  extraFaqs:       ProductFaq[]
}

const PRODUCT_DEPTH: Record<string, ProductDepth> = {
  'pebble-carpet': {
    deepDive: [
      'A pebble carpet is one of the few floor coverings people instinctively reach down to touch. Built from hundreds of individually hand-felted wool pebbles, it translates the calm of a riverbed or a raked stone garden into a soft, sculptural surface underfoot. The appeal is entirely tactile and visual at once — a genuine three-dimensional relief of rounded "stones" in graded tones that catches light and shadow the way flat, printed or machine-tufted floors never can. For designers working in organic, biophilic and wellness-led interiors, it is a signature piece rather than a background one.',
      'The craft is deceptively simple and genuinely slow. Each pebble is hand-rolled from carded wool and wet-felted — agitated with warm water until the fibres lock into a dense, resilient ball — then dried, graded by size and sorted by shade. Only then are the pebbles laid out to the approved design and hand-stitched, one by one, onto a strong cotton backing. A single rug can hold many hundreds of pebbles, so the piece is effectively assembled by hand from its smallest component up; this is why an authentic pebble carpet feels substantial and why no two are ever identical.',
      'Because it is pure wool on a natural cotton backing, a pebble carpet is as practical as it is beautiful when specified for the right room. Wool is naturally resilient, moisture-regulating, flame-resistant and dirt-shedding, and the felted pebbles spring back from compression rather than crushing flat like long pile. That makes it well suited to bedrooms, spas, bathrooms and low-to-moderate-traffic feature areas — spaces where people walk barefoot and value texture — while its handmade, all-natural construction answers the sustainability brief that increasingly drives premium specification.',
    ],
    materialDetails: [
      { name: 'Felted New Zealand Wool', desc: 'Premium long-staple wool that felts into dense, resilient pebbles with excellent shape retention and a soft, clean handle.' },
      { name: 'Felted Indian Wool', desc: 'Hard-wearing, cost-effective wool ideal for larger pieces and contract programmes where value and durability lead.' },
      { name: 'Natural Cotton Backing', desc: 'Strong, breathable natural backing that anchors every stitched pebble and keeps the carpet dimensionally stable.' },
      { name: 'Natural & AZO-Free Dyes', desc: 'Undyed stone tones or safe AZO-free colours enabling tonal greys and custom multi-colour pebble blends.' },
    ],
    useCases: [
      { title: 'Spa relaxation floor', desc: 'A tonal grey pebble carpet for a wellness suite where guests walk barefoot between treatments.' },
      { title: 'Serene bedroom', desc: 'A natural stone-tone pebble rug beside the bed for a tactile, grounding first step each morning.' },
      { title: 'Boutique hotel bathroom', desc: 'A wool pebble bath mat with anti-slip backing as a memorable, natural-material detail.' },
      { title: 'Biophilic living scheme', desc: 'A custom multi-colour pebble piece anchoring a nature-inspired, texture-rich interior.' },
    ],
    exportInfo: [
      'We export pebble carpets to designers, wellness brands, hospitality groups and natural-interior retailers across Europe, the UK, North America and the GCC, where demand for tactile, sustainable, handmade floor coverings is strongest. Each piece is made in pure wool with AZO-free dyes and documented for material composition and origin.',
      'Pebble carpets are rolled or flat-packed and protected for safe sea freight, with private-label and repeat programmes available. We work to your preferred Incoterms and accept TT, LC, DA and DP in USD, EUR, GBP and INR.',
    ],
    relatedGuides: ['how-rugs-are-manufactured', 'handmade-vs-machine-made-carpets', 'why-buy-carpets-from-india'],
    extraFaqs: [
      { q: 'How durable is a pebble carpet?', a: 'Very, for the right setting. Felted wool is naturally resilient and our pebbles are stitched to a reinforced cotton backing. With suction-only vacuuming and prompt spot-cleaning, a pebble carpet lasts for years in bedrooms, spas and feature areas — though it is not intended for heavy commercial circulation.' },
      { q: 'Can pebble carpets be used in bathrooms or wet areas?', a: 'As bath mats and near-shower pieces, yes — with an anti-slip backing and good ventilation, since wool naturally regulates moisture. We do not recommend permanently wet, submerged or outdoor locations.' },
      { q: 'How do I clean a felted wool pebble rug?', a: 'Vacuum on suction-only (no beater bar) around and between the pebbles, shake out smaller pieces, and blot spills promptly. For deep cleaning use a specialist wool-safe method rather than soaking.' },
      { q: 'What pebble sizes and colours can you produce?', a: 'We produce fine, medium and mixed pebble scales in natural undyed tones, tonal greys or custom multi-colour blends, colour-matched to your reference before production begins.' },
    ],
  },

  'hand-tufted-carpet': {
    deepDive: [
      'Hand tufting occupies a sweet spot in carpet manufacturing: it delivers the warmth, density and design freedom of handmade production at a price point and lead time that suit large residential and hospitality programmes. Because the yarn is hand-guided rather than mechanically driven, our artisans can shift colour, change pile height and introduce carved relief within a single piece — something mass-produced broadloom cannot replicate. This flexibility is why interior designers reach for hand tufted carpets when a space needs a bespoke statement without a hand-knotted budget.',
      'The character of a hand tufted carpet is decided by three variables: pile construction, yarn weight and finishing. Cut pile gives a soft, velvety surface that shows colour depth; loop pile is tighter and more hard-wearing; cut-and-loop combines both to sculpt texture and pattern. Yarn weight, measured in GSM, determines underfoot density and durability — we typically specify 2,500–5,500 GSM depending on whether the carpet serves a quiet bedroom or a busy hotel corridor. Finishing — washing, shearing and hand-carving — is where a flat tufted surface becomes a refined, multi-level design.',
      'Quality in hand tufting is invisible until it fails, which is why we control it at the latex and backing stage. A weak latex coat or thin secondary backing causes shedding and delamination over time; our carpets use a full latex lock and a bonded cotton scrim secondary backing for dimensional stability and a long service life. For project buyers, this is the difference between a carpet that looks tired in two years and one that performs for a decade.',
    ],
    materialDetails: [
      { name: 'New Zealand Wool', desc: 'Long-staple, naturally resilient wool with excellent crimp recovery and stain resistance — our premium choice for durability and a luxurious hand.' },
      { name: 'Indian Wool', desc: 'Hard-wearing, cost-effective wool ideal for high-traffic and contract programmes where value and resilience matter most.' },
      { name: 'Viscose / Art Silk', desc: 'Adds silk-like sheen and softness as highlight yarn; best blended with wool for low-to-moderate traffic decorative areas.' },
      { name: 'Cotton & Polyester Blends', desc: 'Used for backing and value constructions; polyester offers vivid colour retention and easy maintenance for budget-sensitive projects.' },
    ],
    useCases: [
      { title: 'Five-star suite programme', desc: 'Custom carved medallions in wool-viscose for a 200-key hotel, delivered in three colour-matched phases.' },
      { title: 'Designer residence', desc: 'Bespoke living-room rug developed from an artist\'s painting with Pantone-matched lab-dips.' },
      { title: 'Corporate reception', desc: 'Logo-inlaid cut-and-loop carpet at 4,500 GSM for a high-footfall headquarters lobby.' },
      { title: 'Retail flagship', desc: 'Tonal loop-pile broadloom that frames merchandise without competing with it.' },
    ],
    exportInfo: [
      'We export hand tufted carpets to designers, hospitality groups and importers across 45+ countries. Each export order is manufactured to destination-market requirements — including fire-rating where specified — and ships with the commercial and compliance documentation customs clearance requires.',
      'Carpets are rolled, wrapped and palletised for safe sea freight, with phased dispatch available for multi-phase hotel and contract projects. We work to your preferred Incoterms and accept TT, LC, DA and DP, in USD, EUR, GBP and INR.',
    ],
    relatedGuides: ['hand-tufted-carpet-manufacturing-process', 'hand-tufted-vs-hand-knotted-carpet', 'hotel-carpet-buying-guide'],
    extraFaqs: [
      { q: 'What GSM should I specify for a hand tufted hotel carpet?', a: 'For hotel corridors and lobbies we recommend 3,500–5,500 GSM dense cut-pile for durability; guest rooms can use 2,500–3,500 GSM for a softer, more economical specification. We advise per zone.' },
      { q: 'Will a hand tufted carpet shed?', a: 'A well-made hand tufted carpet sheds minimally and stops after initial settling. Shedding and delamination come from weak latex or backing — we use a full latex lock and bonded secondary backing to prevent this.' },
      { q: 'Can you carve a logo or pattern into the pile?', a: 'Yes. Hand-carving and cut-and-loop construction let us sculpt logos, borders and multi-level relief into the carpet — popular for branded reception and feature areas.' },
      { q: 'What is the maximum size for a seamless hand tufted carpet?', a: 'We produce large seamless pieces and, for very large areas, colour-matched panels joined on site. Share your room dimensions and we will advise the best approach.' },
    ],
  },

  'hand-knotted-carpet': {
    deepDive: [
      'A hand knotted carpet is the most labour-intensive object most buyers will ever purchase for a floor — and that labour is precisely its value. Every knot is tied individually around the warp by a master weaver, so a single 9×12 rug at 150 KPSI contains well over a million knots and represents months of skilled work. Nothing about the process can be rushed without showing in the finished piece, which is why authentic hand knotting commands a premium and why a genuine article appreciates rather than depreciates.',
      'Knot density (KPSI — knots per square inch) is the headline specification, but it must be read alongside material and design. A coarse 40–80 KPSI wool rug is robust, forgiving and well suited to family rooms; 100–150 KPSI in wool or wool-silk allows refined detail for formal interiors; 200–300+ KPSI is the realm of fine silk masterpieces where the design approaches the resolution of a painting. Higher density is not universally "better" — it is a trade-off between detail, durability, hand-feel and budget that we help each client balance.',
      'The foundation and finishing are what separate a rug that lies flat for generations from one that curls and wears unevenly. We hand-string cotton or silk warps under even tension, beat down each row of knots consistently, and finish with hand-shearing, washing and stretching. The wash in particular — sometimes repeated — is what develops the lustre and subtle abrash (colour variation) that collectors prize in a hand knotted carpet.',
    ],
    materialDetails: [
      { name: 'Pure Mulberry Silk', desc: 'The finest pile fibre — fine, strong and lustrous — enabling 200+ KPSI detail and a jewel-like sheen for collector and luxury pieces.' },
      { name: 'New Zealand Wool', desc: 'Premium long-staple wool with natural resilience and lanolin sheen; the durable backbone of most fine knotted carpets.' },
      { name: 'Wool-Silk Blend', desc: 'Wool ground with silk highlights — combining everyday durability with the sheen and definition of silk in pattern detail.' },
      { name: 'Tibetan Highland Wool', desc: 'High-altitude wool with exceptional resilience and a distinctive thick, lustrous handle for contemporary high-knot pieces.' },
    ],
    useCases: [
      { title: 'Heirloom commission', desc: 'A bespoke silk-on-silk rug at 260 KPSI developed over six months for a private collector.' },
      { title: 'Palatial residence', desc: 'Classical medallion reproductions in wool-silk for formal reception rooms.' },
      { title: 'Embassy interior', desc: 'A crest-bearing wool rug woven to protocol specifications for a state room.' },
      { title: 'Designer gallery piece', desc: 'A contemporary abstract translated knot-by-knot from original artwork.' },
    ],
    exportInfo: [
      'Hand knotted carpets are our most-exported category, shipped to collectors, designers and luxury retailers worldwide. Because each piece is unique and valuable, we document construction, knot count and material composition for every export, and provide certificates of origin and authenticity on request.',
      'Pieces are professionally rolled, protected and crated for international transit, with insured freight coordinated to your terms. We routinely supply markets including the USA, UK, Germany, Italy, France and the GCC, and accept LC, TT, DA and DP in major currencies.',
    ],
    relatedGuides: ['hand-knotted-carpet-manufacturing-process', 'hand-tufted-vs-hand-knotted-carpet', 'why-buy-carpets-from-india'],
    extraFaqs: [
      { q: 'How do I read the back of a hand knotted carpet?', a: 'On a genuine hand knotted carpet the design is clearly visible on the reverse and the knots show slight natural irregularity — there is no fabric secondary backing. The clarity and fineness of the back indicate the knot density.' },
      { q: 'What is abrash and is it a defect?', a: 'Abrash is the subtle colour variation that occurs across hand-dyed yarn batches. It is a hallmark of authentic handmade rugs, not a defect, and adds depth and character collectors value.' },
      { q: 'How should I care for a hand knotted silk rug?', a: 'Rotate periodically, keep out of prolonged direct sunlight, vacuum gently without a beater bar, and use a specialist hand-washer for deep cleaning. Well cared for, it lasts generations.' },
      { q: 'Can you reproduce an antique or museum design?', a: 'Yes. We chart classical Persian, Tibetan and antique designs into a knot-by-knot graph and reproduce them in your chosen size, colourway and knot density.' },
    ],
  },

  'shaggy-rugs': {
    deepDive: [
      'A shaggy rug is engineered around one sensation: the feel of deep pile underfoot. Achieving that plushness reliably is harder than it looks — the longer the pile, the more it wants to flatten, shed and tangle. Our shaggy constructions balance loft with resilience by selecting high-twist, high-loft yarns and calibrating pile height and density so the rug stays luxurious without matting after a few months of use.',
      'Pile height is the defining decision. A 30–45 mm pile keeps a plush feel while remaining practical for lounges and higher-traffic living areas; a 50–70 mm extra-long shag delivers maximum sink-in softness best reserved for bedrooms and reading nooks. We match pile height to the room, because a shag specified for the wrong setting either underwhelms or becomes a maintenance burden.',
      'Maintenance is the question every shaggy buyer should ask first, and the answer lies in construction. We offer anti-shed treatments and recommend yarn blends that release dust readily and recover from compression. For contract and boutique-hospitality use we steer clients toward harder-wearing wool-blend shags; for pure indulgence at home, micro-polyester delivers softness at value.',
    ],
    materialDetails: [
      { name: 'Micro-Polyester', desc: 'Ultra-soft, vividly colour-fast and budget-friendly; the most popular shaggy fibre for plush residential comfort.' },
      { name: 'Wool Blend', desc: 'Adds natural resilience and a more refined handle; the preferred choice for boutique hospitality and longer service life.' },
      { name: 'Acrylic', desc: 'Wool-like softness with good colour retention and easy care — a practical middle-ground fibre for shaggy pile.' },
      { name: 'Premium Synthetic Yarns', desc: 'High-twist heat-set fibres engineered to resist matting and shedding while holding loft.' },
    ],
    useCases: [
      { title: 'Master bedroom', desc: 'A 60 mm ivory shag for sink-in comfort beside the bed.' },
      { title: 'Boutique hotel suite', desc: 'A 40 mm wool-blend shag balancing plushness with hospitality durability.' },
      { title: 'Concept retail', desc: 'A tonal shag zone that signals a premium, tactile brand experience.' },
      { title: 'Show-flat lounge', desc: 'A statement round shag that sells the lifestyle in a developer model home.' },
    ],
    exportInfo: [
      'We supply shaggy rugs to retailers, e-commerce brands and hospitality buyers internationally, including private-label programmes with custom packaging. Export orders are produced with anti-shed treatment as standard and packed compressed to optimise freight volume.',
      'Bulk and repeat shaggy programmes ship by sea with consistent dye-lots held across reorders, on your preferred Incoterms and payment terms.',
    ],
    relatedGuides: ['how-rugs-are-manufactured', 'handmade-vs-machine-made-carpets', 'area-rugs-vs-wall-to-wall-carpets'],
    extraFaqs: [
      { q: 'How do I stop a shaggy rug from shedding?', a: 'Choose a rug with anti-shed treatment and high-twist heat-set yarn. Light initial shedding settles quickly; gentle suction-only vacuuming (no beater bar) keeps it minimal.' },
      { q: 'Which pile height is best for a living room?', a: 'A 30–45 mm pile keeps the plush look while staying practical for living-room traffic. Save 50–70 mm extra-long shag for bedrooms and low-traffic spaces.' },
      { q: 'Can shaggy rugs be made in round or irregular shapes?', a: 'Yes — we manufacture shaggy rugs in round, oval and custom irregular shapes to designer specification.' },
      { q: 'Are shaggy rugs suitable for boutique hotels?', a: 'Yes, when specified in harder-wearing wool blends with anti-shed treatment. We advise contract-appropriate constructions for hospitality use.' },
    ],
  },

  'jute-sisal-rugs': {
    deepDive: [
      'Natural fibre rugs have moved from niche to mainstream as interiors embrace texture and sustainability — and jute and sisal lead that shift. Both are plant fibres, renewable and biodegradable, but they behave differently underfoot and in use, so specifying the right one matters. As a manufacturer we weave both to project standard, and we guide clients to the fibre that fits the room rather than selling a one-size answer.',
      'Jute is the softer, warmer fibre, with a gentle golden tone that suits living rooms, bedrooms and relaxed coastal interiors. Sisal is firmer, crisper and significantly more durable, making it the choice for hallways, stairs and commercial spaces where a hard-wearing surface is essential. Seagrass and hemp round out the range with their own textures and resilience for specialist applications.',
      'Construction and finishing determine how a natural fibre rug performs over time. We reinforce edges with binding or cotton borders to prevent fraying, and apply a latex backing for dimensional stability in contract use. For high-traffic or moisture-prone settings we advise the appropriate fibre and backing, because natural fibres reward correct specification and punish careless placement.',
    ],
    materialDetails: [
      { name: 'Golden Jute', desc: 'Soft, warm-toned and renewable; ideal for moderate-traffic living spaces and a relaxed, organic aesthetic.' },
      { name: 'Sisal', desc: 'One of the toughest natural fibres — firm and crisp, excellent for hallways, stairs and commercial high-traffic areas.' },
      { name: 'Seagrass', desc: 'Smooth, hard-wearing and naturally water-resistant; handles humidity better than jute, suiting coastal and damp-prone spaces.' },
      { name: 'Cotton & Hemp', desc: 'Used for borders, blends and softer constructions; hemp adds strength while cotton enables coloured trims.' },
    ],
    useCases: [
      { title: 'Coastal villa', desc: 'A seagrass rug specified for a humid seaside living room where jute would struggle.' },
      { title: 'Eco-retail collection', desc: 'A private-label jute range with cotton-bordered finishes for a sustainable home brand.' },
      { title: 'Staircase runner', desc: 'A sisal runner chosen for durability on a high-use timber staircase.' },
      { title: 'Layered designer scheme', desc: 'A neutral jute base layered under a statement rug in a styled interior.' },
    ],
    exportInfo: [
      'Natural fibre rugs are in strong demand from sustainability-focused markets in Europe, the UK, the USA and Australia. We export jute, sisal and seagrass rugs with certified-fibre sourcing and AZO-free finishes, supporting the eco-credentials retail buyers require.',
      'Orders ship with anti-shed binding and optional latex backing for contract use, packed for sea freight with private-label and bulk programmes available on standard trade terms.',
    ],
    relatedGuides: ['jute-vs-sisal-rugs', 'how-rugs-are-manufactured', 'why-buy-carpets-from-india'],
    extraFaqs: [
      { q: 'Can jute or sisal rugs go in a kitchen or bathroom?', a: 'We do not recommend jute in wet areas as it absorbs moisture. Seagrass tolerates humidity better, but no natural fibre suits very wet zones. We advise on placement for longevity.' },
      { q: 'How do I clean a natural fibre rug?', a: 'Vacuum regularly and blot spills immediately — avoid soaking. Jute marks more easily than sisal; for deep cleaning use a specialist dry-clean method rather than wet washing.' },
      { q: 'Are dyed jute rugs colour-fast?', a: 'Yes — we use AZO-free dyes and test colour-fastness. Natural variation is part of the fibre\'s character, but fading from heavy sunlight should be managed as with any natural material.' },
      { q: 'Do you offer latex backing for commercial use?', a: 'Yes. For contract and high-traffic installations we add a latex backing for stability and add anti-slip options on request.' },
    ],
  },

  'leather-carpets': {
    deepDive: [
      'Leather is the most unexpected and tactile of floor coverings, and that rarity is exactly why designers specify it for spaces that need to feel singular. A leather carpet brings warmth, depth and a quiet luxury that textile cannot replicate, developing a richer patina with age. As a manufacturer we work leather into patchwork, hair-on-hide and embossed constructions, each hand-assembled from selected hides.',
      'Because we work with a natural material, no two leather carpets are identical — variation in grain, tone and marking is intrinsic and is what gives each piece its character. Clients choose how to treat that variation: a consistent, tonal patchwork layout for a refined look, or an embraced natural mix for organic richness. We map every layout before stitching so the result matches the design intent.',
      'Durability in leather carpets comes from construction, not just the hide. We hand-stitch panels with reinforced seams and bond a non-slip backing for stability and safety, producing a floor that withstands the foot traffic of offices, retail and boutique hospitality. With simple care, a leather carpet outlasts most textile alternatives while looking better as it ages.',
    ],
    materialDetails: [
      { name: 'Genuine Full-Grain Leather', desc: 'Premium hide retaining the natural grain; durable, characterful and ages into a rich patina.' },
      { name: 'Hair-on-Hide', desc: 'Hide with the natural hair retained for striking texture and pattern; a bold statement surface.' },
      { name: 'Suede', desc: 'Soft napped finish offering a matte, velvety surface for refined low-traffic feature areas.' },
      { name: 'Leather Composite', desc: 'Engineered leather for consistency and value in larger or budget-sensitive patchwork programmes.' },
    ],
    useCases: [
      { title: 'Executive boardroom', desc: 'A tonal patchwork leather floor signalling permanence and prestige.' },
      { title: 'Luxury retail', desc: 'A hair-on-hide statement zone in a flagship store fit-out.' },
      { title: 'Penthouse study', desc: 'An embossed leather rug as a tactile centrepiece in a high-design residence.' },
      { title: 'Boutique hotel lobby', desc: 'A durable leather entrance piece that ages gracefully under footfall.' },
    ],
    exportInfo: [
      'Leather carpets are supplied to designers, luxury retailers and corporate clients internationally. Hides are sourced from certified tanneries, and we provide material documentation for export compliance where required.',
      'Each piece is protected and crated for transit to avoid creasing, with freight coordinated to your terms. Custom embossing and branded inlays are available for OEM and corporate orders.',
    ],
    relatedGuides: ['handmade-vs-machine-made-carpets', 'how-carpets-are-manufactured', 'why-bhadohi-carpet-capital'],
    extraFaqs: [
      { q: 'How durable is a leather carpet?', a: 'Very durable — leather is naturally tough and, with reinforced stitching and a non-slip backing, suits offices, retail and boutique hospitality. It develops a desirable patina rather than wearing out.' },
      { q: 'How do I maintain a leather carpet?', a: 'Dust regularly, wipe with a barely-damp cloth and condition occasionally. Avoid soaking and prolonged direct sunlight. Maintenance is minimal compared with textile carpets.' },
      { q: 'Will every leather rug look the same?', a: 'No — natural hide variation means each piece is unique. We map patchwork layouts to your preference, whether consistent and tonal or naturally varied.' },
      { q: 'Can you emboss a logo into leather?', a: 'Yes. We emboss logos and create branded inlays for corporate and retail clients as part of our custom leather programme.' },
    ],
  },

  'wall-to-wall-carpets': {
    deepDive: [
      'Wall-to-wall carpet is a contract product first and a design product second — it has to perform under sustained traffic, meet fire-safety codes, and arrive on a construction programme without colour drift across thousands of square metres. That engineering discipline is what separates a hospitality-grade broadloom supplier from a domestic one, and it is where we focus. Every wall-to-wall order is treated as a project, with specification, dye-lot control and phased delivery managed end to end.',
      'The core specification decisions are fibre, construction and backing. Solution-dyed nylon resists fading and cleans easily, making it the workhorse of hotels and offices; wool-nylon blends add a premium handle for prestige areas; polypropylene and recycled fibres serve value and sustainability briefs. Tufted broadloom, axminster weaving and carpet tiles each suit different applications, and we match construction to traffic class and design intent.',
      'Colour consistency is the make-or-break of large installations. We hold dye-lots so that carpet delivered in a later project phase matches the first, and we coordinate broadloom with carpet tiles so that mixed-format schemes read as one. For project teams, this control — plus fire-rating documentation and on-site measurement support — is what de-risks a large carpet specification.',
    ],
    materialDetails: [
      { name: 'Solution-Dyed Nylon', desc: 'Colour locked into the fibre for outstanding fade, stain and bleach resistance — the contract standard for hotels and offices.' },
      { name: 'Wool-Nylon Blend', desc: 'Typically 80/20 — wool\'s premium handle and resilience with nylon\'s durability; favoured for prestige hospitality.' },
      { name: 'Polypropylene', desc: 'Economical, moisture- and stain-resistant fibre for value contract and high-traffic budget projects.' },
      { name: 'Recycled Fibre', desc: 'Sustainable face yarns for green-building and ESG-driven specifications without sacrificing durability.' },
    ],
    useCases: [
      { title: 'Hotel corridors', desc: 'Patterned axminster broadloom engineered to mask traffic across a full guest-floor programme.' },
      { title: 'Corporate HQ', desc: 'Solution-dyed nylon carpet tiles over an access floor for cabling flexibility.' },
      { title: 'Convention centre', desc: 'Fire-rated broadloom delivered in phases to a fixed fit-out schedule.' },
      { title: 'Cruise interior', desc: 'Marine-compliant contract carpet specified to vessel fire standards.' },
    ],
    exportInfo: [
      'We supply wall-to-wall carpet to international hospitality and commercial projects with fire-rating and performance documentation to destination standards. Broadloom is shipped in rolls and carpet tiles in cartons, with dye-lots held for multi-phase and multi-country roll-outs.',
      'Project freight is coordinated to your installation programme and Incoterms, with phased dispatch and on-site measurement guidance available for large contracts.',
    ],
    relatedGuides: ['carpet-manufacturing-process-explained', 'hotel-carpet-buying-guide', 'area-rugs-vs-wall-to-wall-carpets'],
    extraFaqs: [
      { q: 'What traffic classification do your wall-to-wall carpets meet?', a: 'We manufacture to heavy-contract traffic classes for hospitality and commercial use and specify the construction to your project\'s rating. Share your spec and we will match it.' },
      { q: 'Can you match broadloom and carpet tiles in one project?', a: 'Yes. We control dye-lots across both formats so broadloom areas and tiled areas read as a single coordinated scheme.' },
      { q: 'Do you provide fire-rating certificates?', a: 'Yes. We manufacture fire-rated contract carpet and supply the supporting test documentation required for public buildings.' },
      { q: 'Can you deliver in phases for a staged opening?', a: 'Yes — we hold dye-lots and phase production and dispatch to your construction programme so later phases match earlier ones exactly.' },
    ],
  },

  'flat-weaves': {
    deepDive: [
      'Flat weaves are having a sustained moment in contemporary interiors, and for good reason: they are lightweight, reversible, hard-wearing and rich in pattern, with none of the pile that traps soil in high-traffic areas. Woven without knots on horizontal looms, a flat weave is essentially structural pattern — the design is the weave itself, which is why a true flat weave is reversible and remarkably durable.',
      'The flat weave family spans kilims, dhurries and contemporary geometrics, in wool, cotton, jute and recycled blends. Wool flat weaves bring warmth and resilience for living spaces; cotton flat weaves are lighter and washable; jute and recycled-fibre weaves serve natural and sustainable briefs. Because there is no pile to specify, the design conversation centres on pattern, scale and colour — areas where our studio adds the most value.',
      'For specifiers, flat weaves solve practical problems: they layer beautifully over hard floors and other rugs, they suit underfloor heating, and their reversibility doubles their life. We reinforce selvedges for durability and finish edges cleanly, producing flat weaves that hold up in homes, boutique hospitality and design-led retail alike.',
    ],
    materialDetails: [
      { name: 'Wool', desc: 'Warm, resilient and naturally soil-resistant; the premium choice for durable, design-led flat weaves.' },
      { name: 'Cotton', desc: 'Lightweight and washable with crisp pattern definition; ideal for casual and contemporary interiors.' },
      { name: 'Jute', desc: 'Adds natural texture and sustainability to flatwoven constructions for organic, relaxed schemes.' },
      { name: 'Recycled Fibre Blends', desc: 'Eco-conscious yarns for sustainability briefs, woven for durability and vivid, consistent colour.' },
    ],
    useCases: [
      { title: 'Layered living room', desc: 'A reversible wool kilim layered over a natural base for textural depth.' },
      { title: 'Scandi retail line', desc: 'A private-label geometric flat weave collection for a lifestyle brand.' },
      { title: 'Boutique hotel', desc: 'Characterful dhurrie-style weaves for a relaxed, design-forward guest experience.' },
      { title: 'Underfloor-heated space', desc: 'A low-profile flat weave that suits radiant heating without trapping heat.' },
    ],
    exportInfo: [
      'Flat weaves export strongly to contemporary and Scandinavian markets that prize pattern, sustainability and lightweight construction. We ship wool, cotton and recycled-fibre flat weaves with AZO-free dyes and reinforced selvedges, including private-label collections.',
      'Lightweight construction optimises freight volume; bulk and repeat programmes ship with held dye-lots on standard trade terms.',
    ],
    relatedGuides: ['kilim-vs-dhurrie', 'how-rugs-are-manufactured', 'jute-vs-sisal-rugs'],
    extraFaqs: [
      { q: 'Are flat weaves durable enough for high-traffic areas?', a: 'Yes — with no pile to crush or trap soil, tightly woven flat weaves (especially wool) are excellent for hallways, dining and busy living areas, and being reversible they wear evenly.' },
      { q: 'Can flat weaves be used with underfloor heating?', a: 'Yes. Their low profile suits radiant heating well, allowing heat through without trapping it as thick pile can.' },
      { q: 'What is the difference between your flat weaves and kilims/dhurries?', a: 'Kilims and dhurries are specific flat weave traditions (we also make them as dedicated products). Our flat weave range spans these plus contemporary geometrics in mixed fibres.' },
      { q: 'Can you weave a custom geometric design?', a: 'Yes — we translate custom geometric and tribal artwork into woven flat weaves with bespoke colourways, sampled before production.' },
    ],
  },

  'poufs': {
    deepDive: [
      'A pouf is the accessory that completes an interior scheme, and for our carpet clients it is a natural single-source add-on — colour-matched to the rug, made in the same facility, shipped in the same order. We craft poufs as considered furniture pieces rather than afterthoughts, hand-stitching covers in leather, wool and woven textiles over a structured, durable form.',
      'The construction details decide whether a pouf holds its shape or sags within months. We use reinforced seams, a firm reinforced base and high-density filling so the pouf stays supportive as seating and stable as a footrest. For shipping efficiency we can supply filled or as covers for local filling, a practical option for export and retail programmes.',
      'Because poufs coordinate with our rug collections, hotels and designers use them to extend a colour story across a room — a lobby rug echoed in lounge poufs, or a residential rug matched to bedroom seating. This coordination, plus full customisation of size, shape and branding, is what makes our poufs a genuine cross-sell rather than a generic commodity.',
    ],
    materialDetails: [
      { name: 'Leather', desc: 'Premium hand-stitched leather covers that age beautifully; the luxury choice for lounges and lobbies.' },
      { name: 'Wool & Embroidered Textile', desc: 'Soft, characterful covers with optional embroidery and appliqué for bespoke, decorative pieces.' },
      { name: 'Cotton Canvas', desc: 'Durable, washable-friendly covers for casual and high-use residential and breakout settings.' },
      { name: 'Woven Jute', desc: 'Natural-texture covers that coordinate with our natural-fibre rug collections.' },
    ],
    useCases: [
      { title: 'Hotel lobby', desc: 'Leather drum poufs colour-matched to the lobby carpet for flexible social seating.' },
      { title: 'Residential scheme', desc: 'Wool cube poufs echoing a living-room rug\'s palette.' },
      { title: 'Retail private-label', desc: 'A branded pouf range with custom packaging for a home brand.' },
      { title: 'Coworking breakout', desc: 'Durable canvas poufs for informal, movable seating.' },
    ],
    exportInfo: [
      'Poufs export well as standalone accessories and as coordinated add-ons to rug orders. We offer private-label and OEM pouf programmes with custom branding and packaging, and can ship unfilled covers to reduce freight volume for international retail.',
      'Filled or cover-only, poufs are packed to protect shape and shipped on standard trade terms alongside or independently of carpet orders.',
    ],
    relatedGuides: ['handmade-vs-machine-made-carpets', 'how-rugs-are-manufactured', 'how-custom-rug-manufacturing-works'],
    extraFaqs: [
      { q: 'Do you supply poufs filled or as covers only?', a: 'Both. We supply fully filled poufs with high-density filling and a reinforced base, or unfilled covers for cost-efficient shipping and local filling.' },
      { q: 'Can poufs be colour-matched to my carpet order?', a: 'Yes — as a single-source manufacturer we colour-match poufs to your rug or carpet so the whole scheme coordinates from one supplier.' },
      { q: 'Can you produce private-label poufs for retail?', a: 'Yes. We offer OEM and private-label poufs with custom covers, branding and packaging for home and lifestyle retailers.' },
      { q: 'What shapes and sizes are available?', a: 'Round, cube, drum and custom shapes in any size, with embroidery and logo branding on request.' },
    ],
  },

  'coco-coir': {
    deepDive: [
      'Coco coir is the practical workhorse of natural fibre flooring — coarse, hard-wearing and made from the husk of the coconut, a renewable by-product that would otherwise be waste. Its toughness and scraping action make it the default for entrance matting, while its biodegradability makes it a favourite for green-building and horticultural applications. We process raw husk into woven mats, brush matting and formed products at scale.',
      'For entrance and high-scrape applications, the construction details matter: pile density, brush stiffness and backing determine how effectively a mat removes dirt and how long it lasts under heavy footfall. We add rubber or PVC backing for stability and anti-slip safety, UV treatments for covered outdoor use, and logo printing for branded hotel and retail entrances.',
      'Beyond matting, our coir division supplies the horticulture and landscaping trade with coco peat, husk chips and coir logs — sustainable growing media and erosion-control products exported in bulk. This breadth lets institutional and green-building buyers source both their entrance matting and their landscaping coir from one manufacturer.',
    ],
    materialDetails: [
      { name: 'Natural Coconut Coir', desc: 'Coarse, durable husk fibre with excellent scraping action; the core material for entrance and brush matting.' },
      { name: 'Rubber Latex Backing', desc: 'Adds dimensional stability and anti-slip safety for commercial entrance use.' },
      { name: 'Coco Peat', desc: 'Processed coir pith — a renewable, water-retentive growing medium for horticulture, supplied in blocks.' },
      { name: 'Coir Husk Chips', desc: 'Coarse husk pieces for landscaping, drainage and erosion-control applications.' },
    ],
    useCases: [
      { title: 'Hotel entrance', desc: 'A logo-printed, rubber-backed coir mat for a high-footfall lobby doorway.' },
      { title: 'Retail doorway', desc: 'High-scrape coir matting that protects interior floors from grit.' },
      { title: 'Green-building project', desc: 'Biodegradable coir and coco peat specified for a LEED-oriented development.' },
      { title: 'Landscaping supply', desc: 'Bulk coir logs and husk chips for erosion control and horticulture.' },
    ],
    exportInfo: [
      'Coco coir products export in bulk to matting distributors, hospitality suppliers and the horticulture trade worldwide. Coir mats ship with the specified backing and any logo printing; coco peat and husk products ship compressed in blocks and bales for container efficiency.',
      'We supply private-label coir matting and bulk container programmes on standard trade terms, with documentation for biodegradable-material and import requirements.',
    ],
    relatedGuides: ['jute-vs-sisal-rugs', 'why-buy-carpets-from-india', 'how-rugs-are-manufactured'],
    extraFaqs: [
      { q: 'Can coir mats be printed with a logo?', a: 'Yes. We print logos and messages onto coir entrance mats and produce branded matting in custom sizes for hotels, retail and corporate clients.' },
      { q: 'Are coir products suitable for outdoor use?', a: 'With UV-resistant treatment and appropriate backing, coir matting suits covered outdoor entrances. Fully exposed permanent outdoor use is best discussed per application.' },
      { q: 'Do you supply coco peat for horticulture in bulk?', a: 'Yes — alongside matting we manufacture coco peat blocks, husk chips and coir logs for horticulture, landscaping and erosion control in bulk container quantities.' },
      { q: 'What backing options are available for coir mats?', a: 'Rubber latex, PVC or unbacked, with anti-slip and UV-resistant options depending on the application and traffic.' },
    ],
  },

  'kilim-rugs': {
    deepDive: [
      'A kilim is flatweave at its most expressive — pattern and structure are one and the same, built up by interlacing dyed weft through the warp without any pile. That construction makes a genuine kilim reversible, lightweight and surprisingly hard-wearing, and it gives kilims their characteristic crisp, geometric motifs. We weave kilims in the Bhadohi tradition, blending heritage technique with the colour control modern interiors expect.',
      'Kilim character comes from the interplay of motif, colour and weave tension. Classic tribal and geometric designs carry cultural depth; contemporary palettes make them work in minimalist interiors; the slit-weave technique creates the sharp diagonal lines that distinguish kilims from softer flat weaves. Because each kilim is handwoven, subtle variation is part of its authenticity rather than a flaw.',
      'For buyers, kilims are versatile problem-solvers: they layer over hard floors and larger rugs, suit high-traffic areas thanks to their pile-free durability, and bring handcrafted warmth at a more accessible price than knotted pieces. We reinforce selvedges and finish edges for longevity, producing kilims that perform in homes, boutique hospitality and design retail.',
    ],
    materialDetails: [
      { name: 'Wool', desc: 'The traditional kilim fibre — warm, resilient and rich in colour depth; ideal for durable, characterful flat weaves.' },
      { name: 'Wool-Cotton', desc: 'A cotton warp with wool weft for crisp structure and pattern definition with warmth underfoot.' },
      { name: 'Vegetable-Dyed Yarn', desc: 'Traditional plant dyes for muted, time-honoured tones with natural depth and variation.' },
      { name: 'Chrome-Dyed Yarn', desc: 'Modern dyes for vivid, consistent contemporary colourways with strong colour-fastness.' },
    ],
    useCases: [
      { title: 'Boho living room', desc: 'A tribal wool kilim as a layered statement over a neutral base.' },
      { title: 'Minimalist apartment', desc: 'A restrained contemporary kilim adding geometric warmth to a pared-back scheme.' },
      { title: 'Lifestyle retail', desc: 'A private-label kilim collection blending tradition and trend.' },
      { title: 'Boutique hotel', desc: 'Characterful kilim runners for relaxed, design-forward corridors.' },
    ],
    exportInfo: [
      'Kilims export to design-led and craft-focused markets across Europe, the UK, the USA and Australia. We ship wool and wool-cotton kilims with AZO-free or vegetable dyes and reinforced selvedges, including private-label collections for retail brands.',
      'Lightweight, reversible construction makes kilims freight-efficient; bulk and repeat programmes ship with held dye-lots on standard trade terms.',
    ],
    relatedGuides: ['kilim-vs-dhurrie', 'how-rugs-are-manufactured', 'jute-vs-sisal-rugs'],
    extraFaqs: [
      { q: 'What makes a kilim different from a dhurrie?', a: 'Both are flat weaves, but kilims come from the Persian/Anatolian tradition (usually wool, tribal slit-weave motifs) while dhurries are Indian (often cotton, lighter patterns). We manufacture both as dedicated products.' },
      { q: 'Are kilims reversible?', a: 'Yes — genuine kilims are fully reversible, which extends their life and offers two looks in one rug.' },
      { q: 'Can vegetable-dyed kilims fade?', a: 'Vegetable dyes give beautiful muted tones with natural depth; like all natural dyes they should be kept from prolonged direct sunlight. We also offer colour-fast chrome dyes for vivid, stable colour.' },
      { q: 'Are kilims good for high-traffic areas?', a: 'Yes — their tight, pile-free weave is hard-wearing and well suited to hallways, dining and busy living areas.' },
    ],
  },

  'dhurrie-rugs': {
    deepDive: [
      'The dhurrie is India\'s own flatweave — woven for centuries in homes, palaces and institutions, and prized for its clean stripes, crisp geometry and easy, casual elegance. Lighter and more washable than a kilim, a dhurrie is the everyday flatweave: practical enough for a child\'s room or a school floor, refined enough for a designer scheme. We weave dhurries across cotton, wool and blends, from institutional bulk to bespoke retail.',
      'Cotton is the classic dhurrie fibre, giving the rug its characteristic lightness and washability; wool dhurries add warmth and a more premium handle; recycled-fibre blends serve sustainability briefs. The defining dhurrie aesthetic — stripes and clean geometrics — reads as both traditional and thoroughly contemporary, which is why dhurries move easily between heritage and modern interiors.',
      'Dhurries also anchor our institutional and tender supply, where their durability, washability and economy at scale make them the standard for floor seating in schools, hostels and community spaces. The same flatweave that suits a styled living room, woven in hard-wearing cotton at volume, becomes the practical choice for a government school order — a versatility few rugs share.',
    ],
    materialDetails: [
      { name: 'Cotton', desc: 'The classic dhurrie fibre — light, washable and crisp; ideal for casual homes, children\'s rooms and institutional use.' },
      { name: 'Wool', desc: 'Adds warmth and a premium handle for design-led and retail dhurrie collections.' },
      { name: 'Recycled-Fibre Blends', desc: 'Sustainable yarns woven for durability and consistent colour in eco-conscious programmes.' },
      { name: 'AZO-Free Dyes', desc: 'Non-toxic dyes safe for children and institutional environments, with reliable colour-fastness.' },
    ],
    useCases: [
      { title: 'Children\'s room', desc: 'A washable cotton stripe dhurrie that survives daily use and cleaning.' },
      { title: 'Designer layering', desc: 'A clean geometric dhurrie as a contemporary base in a styled interior.' },
      { title: 'School floor seating', desc: 'Hard-wearing cotton dhurries supplied in bulk to classroom dimensions.' },
      { title: 'Lifestyle retail', desc: 'A private-label dhurrie range in seasonal colourways.' },
    ],
    exportInfo: [
      'Dhurries export to retail and design markets internationally and serve large domestic institutional and tender supply. We ship cotton, wool and blended dhurries with AZO-free dyes, including private-label retail collections and bulk institutional orders.',
      'Lightweight construction keeps freight efficient; we hold dye-lots across reorders and supply on standard trade terms, with tender documentation for government and institutional buyers.',
    ],
    relatedGuides: ['kilim-vs-dhurrie', 'government-tender-dhurrie-buying-guide', 'how-rugs-are-manufactured'],
    extraFaqs: [
      { q: 'Are cotton dhurries washable?', a: 'Cotton dhurries tolerate gentle cleaning well, which makes them popular for casual living spaces, children\'s rooms and institutional use. We advise on care per construction.' },
      { q: 'Can you supply dhurries for schools and tenders in bulk?', a: 'Yes. We manufacture hard-wearing cotton dhurries in bulk to tender specification for schools, hostels and institutions, with samples and documentation. See our dedicated dhurrie & tat patti silo.' },
      { q: 'What is the classic red-black stripe dhurrie?', a: 'The red-black stripe is a traditional institutional dhurrie pattern widely specified for schools and public use. We weave it and other custom stripe and geometric designs to specification.' },
      { q: 'Do you make designer and retail dhurries too?', a: 'Yes — alongside institutional supply we produce wool and cotton designer dhurries and private-label retail collections in bespoke colourways.' },
    ],
  },

  'area-rugs': {
    deepDive: [
      'An area rug is the most flexible tool in an interior — it defines a zone, warms a hard floor, anchors furniture and sets a colour story, all without installation. Because "area rug" describes a use rather than a construction, the real decision is which technique to use, and as a manufacturer across all of them we match the construction to the brief rather than pushing one method.',
      'For plush comfort and bold custom design at value, hand tufted is the usual answer; for heirloom quality and the finest detail, hand knotted; for casual, reversible durability, flat weave; for deep softness, shaggy. Each delivers a different feel, lifespan and price, and the right choice depends on the room, the traffic and the budget — a conversation our studio has with every area-rug client.',
      'Custom sizing is where area rugs earn their place, because standard sizes rarely fit a real room. We produce any dimension and shape, including oversized and round, with Pantone-matched colour and bespoke design. For designers and hospitality buyers, this means a rug sized exactly to the space rather than a compromise pulled from stock.',
    ],
    materialDetails: [
      { name: 'Wool', desc: 'The all-round premium fibre — resilient, warm and stain-resistant across tufted, knotted and flatweave area rugs.' },
      { name: 'Silk & Viscose', desc: 'Sheen and fine detail for luxury and feature area rugs; best in lower-traffic settings.' },
      { name: 'Cotton', desc: 'Light, washable and crisp for flatweave and casual area rugs.' },
      { name: 'Jute & Natural Blends', desc: 'Texture and sustainability for natural-look area rugs and layering bases.' },
    ],
    useCases: [
      { title: 'Living-room anchor', desc: 'An oversized custom wool rug sized to seat the full furniture group.' },
      { title: 'Hotel suite feature', desc: 'A bespoke area rug coordinated with the room\'s broadloom and scheme.' },
      { title: 'Round dining rug', desc: 'A custom round rug matched to a circular dining table.' },
      { title: 'Designer commission', desc: 'A one-off area rug developed from a client\'s artwork in the chosen construction.' },
    ],
    exportInfo: [
      'Area rugs export across every market we serve, from luxury single pieces to private-label retail collections. We ship in any construction with full material documentation, and offer OEM programmes with custom branding and packaging.',
      'Single bespoke pieces are protected and crated; bulk and repeat collections ship with held dye-lots on standard trade terms to your Incoterms.',
    ],
    relatedGuides: ['area-rugs-vs-wall-to-wall-carpets', 'how-rugs-are-manufactured', 'how-custom-rug-manufacturing-works'],
    extraFaqs: [
      { q: 'What size area rug do I need?', a: 'As a rule, the rug should sit under at least the front legs of the furniture group, ideally all legs. We manufacture any custom size and shape, so we size to your exact room and layout.' },
      { q: 'Which construction is best for an area rug?', a: 'It depends on use and budget — hand tufted for plush value, hand knotted for heirloom luxury, flat weave for casual durability, shaggy for softness. We make all four and advise per project.' },
      { q: 'Can you make a round or irregular area rug?', a: 'Yes — round, oval and irregular custom shapes in any construction, to your dimensions.' },
      { q: 'Do you supply area rugs for retail collections?', a: 'Yes, including private-label and OEM with custom branding, packaging and held dye-lots for reorders.' },
    ],
  },

  'carpet-tiles': {
    deepDive: [
      'Carpet tiles solved the two biggest problems of broadloom in commercial buildings: serviceability and access. When a tile wears or stains, you replace that tile, not the floor; when you need to reach cabling under an access floor, you lift tiles rather than re-carpet. That practicality, plus design flexibility, is why modular carpet tiles dominate modern office and institutional fit-outs.',
      'The performance of a carpet tile lives in its backing. A dimensionally stable bitumen or PVC backing keeps tiles flat and tight without curling or gapping, which is what separates a contract-grade tile from a domestic one. We pair durable solution-dyed nylon, polypropylene or recycled-fibre faces with stable backings and offer fire-rating for public-building compliance.',
      'Design-wise, tiles unlock layouts broadloom cannot: quarter-turn and ashlar installation create texture from a single tile; directional and plank tiles guide circulation; and mixing two or three colourways zones an open floor without seams. We coordinate tile dye-lots with broadloom so mixed-format projects read as one, and hold lots for future replacements.',
    ],
    materialDetails: [
      { name: 'Solution-Dyed Nylon', desc: 'The contract face-fibre standard — exceptional fade, stain and bleach resistance for heavy office and retail traffic.' },
      { name: 'Polypropylene', desc: 'Economical, moisture- and stain-resistant face yarn for value and high-traffic budget projects.' },
      { name: 'Recycled Fibre', desc: 'Sustainable face yarns for green-building and ESG specifications without sacrificing durability.' },
      { name: 'Bitumen / PVC Backing', desc: 'Dimensionally stable backing that keeps tiles flat and tight for serviceable, lay-flat installation.' },
    ],
    useCases: [
      { title: 'Open-plan office', desc: 'Solution-dyed nylon tiles over an access floor for cabling flexibility and easy replacement.' },
      { title: 'Retail zoning', desc: 'Two-colour tile layout defining circulation and display areas without seams.' },
      { title: 'School corridors', desc: 'Fire-rated tiles with quick spot-replacement for high-wear institutional traffic.' },
      { title: 'Airport lounge', desc: 'Heavy-duty modular tiles engineered for relentless transit footfall.' },
    ],
    exportInfo: [
      'Carpet tiles export to commercial and institutional projects internationally with fire-rating and performance documentation to destination standards. Tiles ship in cartons with dye-lots held for multi-phase and multi-site roll-outs and future replacements.',
      'We coordinate freight to your fit-out programme and Incoterms, with private-label and bulk contract programmes available.',
    ],
    relatedGuides: ['office-carpet-buying-guide', 'carpet-manufacturing-process-explained', 'area-rugs-vs-wall-to-wall-carpets'],
    extraFaqs: [
      { q: 'Why choose carpet tiles over broadloom?', a: 'Tiles let you replace worn tiles individually, access under-floor cabling and lay directional patterns — reducing waste and long-term maintenance cost. We coordinate tiles with broadloom for consistency.' },
      { q: 'Are your carpet tiles fire-rated?', a: 'Yes. We manufacture fire-rated carpet tiles to contract standards and provide documentation for commercial and institutional buildings.' },
      { q: 'Can I get replacement tiles later?', a: 'Yes — we hold dye-lots so future replacement tiles match the original installation.' },
      { q: 'What installation layouts do you support?', a: 'Monolithic, quarter-turn, ashlar/brick, directional and multi-colour zoned layouts. We advise the best pattern for wear-masking and design.' },
    ],
  },

  'tat-patti': {
    deepDive: [
      'Tat patti is the unglamorous but indispensable floor covering of Indian institutions — the flat, tightly woven matting that covers school assembly halls, anganwadi floors, hostel common rooms and community gatherings. Its job is simple and demanding: provide comfortable, durable floor seating for large numbers of people at the lowest viable cost, repeatedly, at scale. We manufacture tat patti to exactly that brief.',
      'The material choice is between cotton and jute, and it is a genuine trade-off rather than a quality ladder. Cotton tat patti is softer and more comfortable for prolonged floor seating; jute is coarser, tougher and even more economical for the largest bulk orders. Many tenders specify a cotton-jute blend to balance comfort and cost, and we weave all three to the required weight and dimensions.',
      'Tat patti supply is fundamentally a tender and bulk-logistics discipline: the specification must be met exactly, the price must be competitive at volume, the quality must be consistent across thousands of pieces, and delivery must hit the programme date. As a direct manufacturer we control all four, which is why government schools, tribal welfare departments, anganwadis and NGOs source tat patti from us directly rather than through traders.',
    ],
    materialDetails: [
      { name: 'Cotton', desc: 'Softer, more comfortable matting for prolonged floor seating; preferred where comfort is prioritised in the specification.' },
      { name: 'Jute', desc: 'Coarser, tougher and the most economical fibre for the largest bulk and relief orders.' },
      { name: 'Cotton-Jute Blend', desc: 'Balances comfort and cost — a common tender specification for schools and institutions.' },
      { name: 'AZO-Free Dyes', desc: 'Non-toxic dyes safe for children and institutional environments where coloured matting is specified.' },
    ],
    useCases: [
      { title: 'Government school', desc: 'Bulk cotton tat patti supplied to classroom and assembly-hall dimensions on a tender.' },
      { title: 'Anganwadi centre', desc: 'Economical, child-safe matting for early-childhood floor seating.' },
      { title: 'Relief programme', desc: 'Rapid bulk jute tat patti for camps and emergency shelters.' },
      { title: 'Community hall', desc: 'Hard-wearing matting for congregational and event floor seating.' },
    ],
    exportInfo: [
      'While tat patti primarily serves domestic institutional and government supply, we also export it to institutional buyers and the diaspora trade. Export orders ship with documentation and are packed in bulk for container efficiency.',
      'For both domestic tenders and export, we provide samples, specification sheets and the documentation procurement requires, and deliver bulk volumes to fixed programme dates.',
    ],
    relatedGuides: ['school-carpet-buying-guide', 'government-tender-dhurrie-buying-guide', 'kilim-vs-dhurrie'],
    extraFaqs: [
      { q: 'What is tat patti used for?', a: 'Tat patti is flat woven floor matting for floor seating in schools, anganwadis, hostels, halls and relief programmes — economical, durable and ideal for high-volume institutional use.' },
      { q: 'Cotton or jute tat patti — which should a tender specify?', a: 'Cotton is softer and more comfortable; jute is tougher and more economical at scale; a cotton-jute blend balances both. We weave all three to the specified weight and size.' },
      { q: 'Can you meet large government tender volumes and deadlines?', a: 'Yes. As a direct manufacturer we produce bulk tat patti to specification with batch consistency, competitive pricing, documentation and phased dispatch to programme dates.' },
      { q: 'Do you provide samples for tat patti tenders?', a: 'Yes — we provide samples and specification sheets against the written tender requirement for evaluation and award.' },
    ],
  },
}

// One additional unique "specifying / buying considerations" paragraph per product
// — closes the 1800-word target on unique content alone. No paragraph is shared.
const PRODUCT_DEPTH_EXTRA: Record<string, string> = {
  'pebble-carpet': 'When specifying a pebble carpet, match the piece honestly to how the room is actually used. Its strength is texture and comfort in barefoot, low-to-moderate-traffic spaces — bedrooms, spas, bathrooms, reading nooks and feature zones — rather than busy corridors or under heavy furniture, where the sculptural relief is wasted and harder to clean. Decide the pebble scale deliberately: a finer, more uniform pebble reads as calm and refined, while a bolder, mixed-size layout feels more organic and rustic, and the two suit very different interiors. Agree the colour story up front — natural undyed stone tones, a tonal grey wash, or a custom multi-colour blend — and approve a physical sample, because the interplay of shade and shadow across a felted surface looks markedly different at full size than in a photograph. For bathrooms and wellness use, specify the anti-slip backing and confirm ventilation, since wool manages moisture well but should not sit permanently wet. Finally, because we felt, dye and stitch every pebble in-house, ask about coordinating a matching bath mat, runner or accessory in the same colourway — single-source production keeps the pebbles, tone and texture consistent across a scheme in a way that buying separately cannot.',
  'hand-tufted-carpet': 'When specifying hand tufted carpet, the most common mistake is treating GSM as the only quality marker. Yarn quality, latex integrity and finishing matter just as much: a high-GSM carpet built on thin latex will still shed and flatten, while a moderate-GSM carpet with a full latex lock and quality wool will outlast it. We encourage buyers to request a physical sample at the proposed specification, walk on it, and check the back for a clean, bonded secondary backing. For multi-room and multi-phase projects, agree the dye-lot strategy up front — confirm whether all phases will be produced from a single lot or matched across lots — because this single decision prevents the visible colour mismatch that undermines otherwise excellent installations. Budget realistically for sampling and approval time, typically two to three weeks, and build it into the project programme rather than the production window.',
  'hand-knotted-carpet': 'Buyers new to hand knotted carpet often anchor entirely on knot density, but the more useful question is fitness for purpose. A 300 KPSI silk rug is breathtaking and best suited to a low-traffic formal room or a wall; a family living room is better served by a robust 80–120 KPSI wool piece that hides everyday wear and cleans easily. Always verify authenticity by examining the reverse — the design should read clearly on the back with the natural slight irregularity of hand work, and there should be no secondary backing. Ask for the material composition in writing, since "silk" can mean pure mulberry silk, art silk (viscose) or a blend, and the difference is significant in both value and care. Finally, treat a fine knotted rug as an investment: keep documentation of its construction and origin, which supports both insurance and future resale value.',
  'shaggy-rugs': 'The decision that most affects satisfaction with a shaggy rug is honest assessment of the room. A long, luxurious pile is wonderful beside a bed but frustrating under a dining table or in a hallway, where it crushes and traps debris. Match the pile height to the traffic, and where the space sees real use, choose a wool-blend or high-twist heat-set construction with anti-shed treatment rather than the longest, softest option available. Consider cleaning access too: a shaggy rug needs suction-only vacuuming and occasional shake-out, so very large fitted shags in busy rooms can become a chore. For developers and hospitality buyers furnishing many rooms, we recommend a mid-length, durable specification that photographs as plush for marketing while standing up to guest use — the balance that keeps both the brand and the maintenance team happy.',
  'jute-sisal-rugs': 'Specifying natural fibre rugs well comes down to honestly mapping fibre to environment. Jute rewards moderate-traffic, dry rooms with softness and warmth; sisal handles stairs and hallways but shows water marks; seagrass tolerates humidity better than either. Before committing, consider the room\'s exposure to spills, sunlight and moisture, because no natural fibre suits a wet zone and all will lighten under intense direct sun. For contract use, always specify a latex backing and confirm the edge finish — a bound or cotton-bordered edge lasts far longer than a raw cut in a busy space. Buyers sourcing for sustainability claims should ask for confirmation of certified fibre sourcing and AZO-free finishing, which we provide, so the eco-credentials hold up to scrutiny. Sampling is especially worthwhile here, as natural tone and texture vary more than in synthetic products.',
  'leather-carpets': 'A leather carpet is a long-term, character-led specification rather than a disposable furnishing, so the buying conversation should start with placement and expectation-setting. Leather thrives in dry, climate-stable interiors — offices, retail, lounges — and is best kept away from wet entrances and intense direct sunlight. Because each hide is unique, agree up front how variation will be handled: a tightly tonal patchwork for a controlled look, or an embraced natural mix for organic richness, with a layout map approved before stitching. Ask about the hide source and finish, since full-grain, hair-on-hide, suede and composite age and perform differently. Maintenance is genuinely low — dusting, the occasional barely-damp wipe and periodic conditioning — but it should be communicated to the end client so the developing patina is understood as desirable rather than wear. Specified and placed well, a leather carpet is among the most distinctive and durable floors available.',
  'wall-to-wall-carpets': 'For wall-to-wall projects, the specification document does more to determine success than any single product choice. It should state fibre, construction, pile weight, backing, traffic classification and fire-rating, and it should name the dye-lot strategy for phased delivery. Insist on a physical sample approved against that written spec, and for large installations request a measurement and quantity review so wastage and seam placement are planned rather than improvised on site. Decide early between broadloom and tiles per zone — broadloom for a seamless premium feel in suites and feature areas, tiles for serviceability over access floors and in high-wear circulation. Confirm how future maintenance stock will be handled, since holding a small reserve of matched carpet or tiles from the same lot makes later repairs invisible. Engaging the manufacturer at specification stage, not just at order, is the single best way to de-risk a large contract carpet job.',
  'flat-weaves': 'Choosing a flat weave is mostly about matching pattern and fibre to the room\'s role. Wool flat weaves bring warmth and resilience for living spaces; cotton suits lighter, washable, casual settings; jute and recycled blends serve natural and sustainability briefs. Because the design is the structure, scale matters — a bold geometric that looks striking in a showroom can overwhelm a small room, so review the pattern at the intended size, ideally with a sample on the actual floor. Flat weaves are excellent over underfloor heating and ideal for layering, but their light weight means a quality anti-slip underlay is worth specifying in busy areas. For retail and contract buyers, confirm selvedge reinforcement and colour-fastness, and agree dye-lot handling for reorders so a successful line stays consistent across seasons. Their reversibility is a genuine practical bonus, effectively doubling service life when rotated.',
  'poufs': 'Buying poufs well is mostly about construction and coordination. A pouf lives or dies on its base and filling: a firm, reinforced base and high-density filling keep it supportive and shapely, while a soft or under-filled pouf sags within months of real use. Decide between filled and cover-only supply early — cover-only shipping cuts freight cost significantly for export and retail, with local filling, while filled units are turnkey for hospitality. For schemes, treat the pouf as part of the colour story rather than an afterthought: colour-matching poufs to the room\'s rug or carpet, which we can do as a single-source maker, lifts the whole space and is a frequent designer request. Retail and brand buyers should confirm cover durability and cleanability for their channel, and explore private-label options — custom covers, embroidery and packaging — which turn a generic accessory into a branded product line. It is also worth planning the order around the rest of the scheme: because we make poufs in the same facility as our rugs and carpets, ordering them together secures matched colour, a single shipment and one accountable supplier, which is simpler for hospitality fit-outs than sourcing seating separately. Confirm the intended use — occasional seating, footrest or purely decorative — as it informs the right filling density and base reinforcement.',
  'coco-coir': 'Specifying coir products is a practical, application-led exercise. For entrance matting, prioritise scraping performance and backing: a denser brush pile and a rubber or PVC backing remove more grit and stay put under heavy footfall, protecting the interior floors beyond. Decide whether the mat sits in a recessed matwell (which dictates exact thickness) or surface-laid (where an anti-slip backing and bevelled edge matter for safety). For covered outdoor positions, specify UV treatment; for fully exposed permanent outdoor use, discuss the application with us first, as coir has limits. Branded entrance mats with printed logos are an easy, high-impact option for hotels and retail, and we produce them to custom sizes. Horticultural and landscaping buyers sourcing coco peat, husk chips or coir logs should confirm compression format and volume for container efficiency. As with all natural fibre, request a sample to set realistic expectations on tone and texture.',
  'kilim-rugs': 'When buying a kilim, authenticity and fitness for the room are the two questions worth getting right. A genuine handwoven kilim is fully reversible with the slit-weave technique creating its characteristic sharp diagonals, and subtle irregularity is a sign of hand work, not a defect. Decide on dye type with eyes open: vegetable dyes give beautiful muted, time-honoured tones but should be kept from prolonged direct sun, while chrome dyes offer vivid, highly colour-fast contemporary colour. Because kilims are pile-free and hard-wearing, they suit high-traffic and layering use, but their flat, lightweight nature means an anti-slip underlay is worth adding on hard floors. For retail and contract buyers, confirm selvedge reinforcement and agree dye-lot handling so a popular design stays consistent across reorders. Sampling is especially valuable for kilims, since the interplay of motif, scale and colour reads very differently at full size than on a screen. Think too about the room\'s mood: tribal motifs in vegetable-dyed wool suit warm, layered, bohemian interiors, while restrained two-colour geometrics in chrome dyes work in minimalist, contemporary schemes. Because each kilim is handwoven to order, you are not limited to stock designs — share a reference or palette and we will weave a piece that fits the space precisely rather than approximately.',
  'dhurrie-rugs': 'Dhurrie buying splits cleanly into two very different conversations, and clarity about which you are having saves time. For design and retail, the priorities are pattern, fibre and colourway — cotton for light, washable, casual pieces; wool for warmth and a premium handle — with sampling to confirm the look at full size. For institutional and tender supply, the priorities shift entirely to specification compliance, durability, washability and price at volume, where hard-wearing cotton in a specified weight and the classic stripe patterns dominate. In both cases, confirm colour-fastness and, for children\'s and institutional environments, AZO-free dyes. Tender buyers should always require an approved sample against the written specification and confirm the supplier can hold consistency across thousands of pieces and deliver to the programme date — the areas where a direct manufacturer materially out-performs a trader. For deeper tender guidance, see our dedicated dhurrie and tat patti silo. One further point buyers value: because the same flatweave technique scales from a single bespoke designer piece to a several-thousand-unit institutional order, we can serve both a boutique retailer and a state education department from one facility, with the appropriate finish and price for each. When ordering for resale, confirm the fibre, weight and fringe or selvedge finish in writing, and request a strike-off in your chosen colourway so the production run matches expectations exactly.',
  'area-rugs': 'The two decisions that most affect an area rug\'s success are size and construction, and both are easy to get wrong from a screen. On size, the rug should at minimum sit under the front legs of the surrounding furniture and ideally under all of it; under-sizing is the most common and most visible error, which is exactly why we make any custom dimension. On construction, match the technique to the room rather than defaulting to one: hand tufted for plush value, hand knotted for heirloom quality, flat weave for casual durability, shaggy for softness. Consider the practicalities too — pile height versus chair movement, cleanability versus traffic, and an anti-slip underlay on hard floors. For designers commissioning bespoke pieces, approve a lab-dip and, for larger rugs, a strike-off sample before bulk, so the delivered rug matches the rendering. Sampling and correct sizing, more than anything else, separate a rug that anchors a room from one that looks like a mistake.',
  'carpet-tiles': 'Carpet tile specification rewards attention to the backing and the layout, not just the face fibre. A dimensionally stable bitumen or PVC backing is what keeps tiles flat and tight over years of access-floor lifting; a cheap backing curls and gaps, undoing the format\'s main advantage. Decide the installation pattern early — monolithic for a broadloom look, quarter-turn or ashlar to mask wear and ease replacement, directional or plank to guide circulation — because it affects both aesthetics and how invisibly future replacements blend in. Always retain attic stock from the same dye-lot so spot replacements match, and confirm fire-rating and traffic classification against the building\'s requirements. For ESG-driven projects, ask about recycled-content face yarns and end-of-life options. Engaging us at specification stage lets us coordinate tile and broadloom dye-lots across a mixed-format scheme so the whole floor reads as one — a detail that elevates corporate and institutional fit-outs. Consider acoustics and comfort underfoot as well as appearance: a cushion-backed tile improves sound absorption and walking comfort in open-plan offices, while a harder backing suits very high-traffic transit and retail circulation. For phased or multi-site roll-outs, agree how attic stock will be stored and labelled by lot, so that a replacement tile fitted two years later is indistinguishable from the original installation. Finally, weigh total cost of ownership rather than headline price: a serviceable, replaceable tile system that lets facilities teams swap individual worn tiles almost always costs less over a building\'s life than broadloom that must be replaced wholesale, which is why carpet tiles dominate modern commercial specification.',
  'tat-patti': 'Procuring tat patti is a tender and logistics discipline more than a design one, and the buyers who do it well treat it that way. The specification should state fibre (cotton, jute or blend), weave weight and exact dimensions, and it should require an approved physical sample against that written spec before award — this single step prevents most quality disputes. Because tat patti is bought in very large, recurring volumes for schools, anganwadis, hostels and relief programmes, the decisive factors are batch consistency, competitive per-unit pricing and reliable delivery to a fixed programme date, all of which favour a direct manufacturer over a trader. Confirm the supplier\'s genuine production capacity and ask how they hold quality across thousands of pieces. For children\'s environments, specify AZO-free dyes. Budget realistically for bulk lead times of two to four weeks, and for relief supply discuss expedited timelines explicitly. Full buyer guidance is set out in our government tender dhurrie buying guide.',
}

// Merge depth content + shared base FAQs (unique category FAQs + extras + 2 shared).
for (const cat of PRODUCT_CATEGORIES) {
  const depth = PRODUCT_DEPTH[cat.slug]
  const extra = PRODUCT_DEPTH_EXTRA[cat.slug]
  if (depth && extra) depth.deepDive = [...depth.deepDive, extra]
  if (depth) {
    cat.deepDive        = depth.deepDive
    cat.materialDetails = depth.materialDetails
    cat.useCases        = depth.useCases
    cat.exportInfo      = depth.exportInfo
    cat.relatedGuides   = depth.relatedGuides
    cat.faqs            = [...cat.faqs, ...depth.extraFaqs]
  }
  cat.faqs = [...cat.faqs, ...makeBaseFaqs(cat.name)]
}

export function getProductCategory(slug: string): ProductCategory | undefined {
  return PRODUCT_CATEGORIES.find((c) => c.slug === slug)
}

export function getAllProductSlugs(): string[] {
  return PRODUCT_CATEGORIES.map((c) => c.slug)
}

export function getRelatedCategories(slug: string): ProductCategory[] {
  const cat = getProductCategory(slug)
  if (!cat) return []
  return cat.related
    .map((s) => getProductCategory(s))
    .filter((c): c is ProductCategory => Boolean(c))
}

export const PRODUCT_DROPDOWN = PRODUCT_CATEGORIES.map((c) => ({
  label: c.name,
  href:  `/products/${c.slug}`,
}))
