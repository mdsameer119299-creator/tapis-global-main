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
      a: `Tapis Global International is a direct manufacturer — every ${name.toLowerCase()} is produced at our own integrated facility in Bhadohi, India, established in 1995. We are not a trading company or reseller; buying direct means better pricing, in-house quality control and full customisation.`,
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
    cardImage: '/images/handtufted-img-2.webp',
    heroImage: '/images/tgi-banner-1.webp',
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
    gallery: gallery(
      ['/images/handtufted-img-2.webp', '/images/tufting-carpet.webp', '/images/rug1.webp'],
      'Hand Tufted Carpet',
      ['Hand tufted wool rug in luxury living room', 'Close-up cut pile texture', 'Contemporary tufted pattern detail', 'Hospitality suite installation', 'Tufting production line Bhadohi', 'Carved pattern hand tufted carpet', 'Neutral tone tufted broadloom', 'Viscose blend luxury tuft', 'Custom colour tufted medallion', 'Hotel corridor tufted runner', 'Showroom display tufted collection', 'Artisan finishing hand tufted rug'],
    ),
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
    cardImage: '/images/rug4.webp',
    heroImage: '/images/rug4.webp',
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
    gallery: gallery(
      ['/images/rug4.webp', '/images/rug5.webp', '/images/handtufted-img-2.webp'],
      'Shaggy Rug',
      ['Plush shaggy rug living room', 'Long pile texture close-up', 'Neutral shaggy bedroom rug', 'Contemporary grey shaggy carpet', 'Tonal shaggy lounge installation', 'Shaggy round accent rug', 'High pile comfort detail', 'Boutique hotel shaggy suite', 'Multi-tone shaggy collection', 'Shaggy rug under modern furniture', 'Warm ivory shaggy carpet', 'Shaggy rug production finishing'],
    ),
  },

  // ─────────────────────────────────────────────────────────────── JUTE / SISAL
  {
    slug:      'jute-sisal-rugs',
    name:      'Jute / Sisal Rugs',
    cardImage: '/images/jute-rugs-manufacturing.webp',
    heroImage: '/images/jute-rugs-manufacturing.webp',
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
    gallery: gallery(
      ['/images/jute-rugs-manufacturing.webp', '/images/rug3.webp', '/images/rug5.webp'],
      'Jute Sisal Rug',
      ['Natural jute rug living space', 'Jute weave texture close-up', 'Sisal bound edge detail', 'Coastal interior jute carpet', 'Braided jute round rug', 'Natural fibre manufacturing Bhadohi', 'Organic retail jute display', 'Neutral jute runner hallway', 'Dyed jute colour collection', 'Sustainable hotel jute flooring', 'Handwoven sisal flatweave', 'Natural fibre rug finishing'],
    ),
  },

  // ─────────────────────────────────────────────────────────────── LEATHER
  {
    slug:      'leather-carpets',
    name:      'Leather Carpets',
    cardImage: '/images/rug3.webp',
    heroImage: '/images/tgi-banner-6.webp',
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
    gallery: gallery(
      ['/images/rug3.webp', '/images/tgi-banner-6.webp', '/images/rug1.webp'],
      'Leather Carpet',
      ['Leather patchwork rug luxury office', 'Hair-on-hide texture detail', 'Embossed leather carpet panel', 'Executive boardroom leather floor', 'Patchwork leather living room', 'Leather rug stitching close-up', 'Dark tone leather statement rug', 'Boutique retail leather flooring', 'Custom logo leather inlay', 'Leather composite hospitality rug', 'Tonal leather patchwork collection', 'Leather carpet finishing QC'],
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
    cardImage: '/images/wool-drying-pic.webp',
    heroImage: '/images/manufacturing-rug-img.webp',
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
    gallery: gallery(
      ['/images/wool-drying-pic.webp', '/images/manufacturing-rug-img.webp', '/images/jute-rugs-manufacturing.webp'],
      'Coco Coir',
      ['Natural coir entrance mat', 'Coir weave texture close-up', 'Coco peat export bags', 'Woven coir rug natural tone', 'Coir mat logo printing', 'Horticultural coco husk chips', 'Eco retail coir display', 'Coir manufacturing facility', 'Rubber backed coir mat', 'Bulk coir packing', 'Natural coir runner hallway', 'Coir product QC inspection'],
    ),
  },
]

// Append shared base FAQs after the category-specific ones for richer FAQ sections.
for (const cat of PRODUCT_CATEGORIES) {
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
