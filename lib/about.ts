// ─── ABOUT PAGE — premium carpet & flooring solutions brand ───

export type AboutBullet = {
  label: string
  text:  string
}

export type AboutProductLine = {
  name: string
  desc: string
}

export type AboutSplitBlock = {
  id:        string
  sectionNum: string
  eyebrow:   string
  title:     string
  titleEm?:  string
  lead:      string
  body?:     string
  bullets?:  AboutBullet[]
  products?: AboutProductLine[]
  pillars?:  string[]
  stats?:    { value: string; suffix?: string; label: string }[]
  cta?:      { label: string; href: string }
  image:     string
  imageAlt:  string
  layout:    'image-left' | 'image-right'
  variant:   'dark' | 'ivory' | 'ink'
}

export const ABOUT_HERO = {
  eyebrow:   'About Us',
  subtitle:  'Tapis Global International Pvt Ltd · Bhadohi, India',
  title:     'Premium Carpet &',
  titleEm:   'Flooring Solutions.',
  lead:      'We are a luxury handmade carpet manufacturer serving architects, interior designers, hospitality groups, developers, institutional buyers and international clients — with pan India project execution and export-quality craftsmanship from Bhadohi.',
  image:     '/images/tgi-banner-1.png',
  imageAlt:  'Premium handmade carpet manufacturing — Tapis Global International Bhadohi',
  stats: [
    { value: '1998', suffix: '',  label: 'Established'           },
    { value: 'Pan',  suffix: '',  label: 'India Operations'      },
    { value: '500',  suffix: '+', label: 'Master Artisans'       },
    { value: '45',   suffix: '+', label: 'Global Markets Served' },
  ],
}

export const ABOUT_SECTIONS: AboutSplitBlock[] = [
  {
    id:         'about-us',
    sectionNum: '01',
    eyebrow:    'About Us',
    title:      'A Complete Luxury',
    titleEm:    'Carpet Brand.',
    lead:       'Tapis Global International Pvt Ltd is a premium carpet and flooring solutions manufacturer — not limited to exports, but built for every scale of interior ambition across India and the world.',
    body:       'From architect-specified custom rugs and hospitality roll-outs to luxury residential programmes, commercial flooring, tender supply and international collections, we manufacture hand tufted, hand knotted, flat weave, jute, broadloom and bespoke floor coverings in Bhadohi — the carpet capital of India. Our craftsmen honour traditional weaving while delivering the design precision, documentation and project execution that modern interiors demand.',
    pillars: [
      'Pan India supply for projects, retail and institutional buyers',
      'Architect and interior designer collaboration from concept to installation',
      'Hospitality, commercial and luxury residential applications',
      'Export-quality manufacturing with global compliance documentation',
    ],
    image:    '/images/manufacturing-rug-img.png',
    imageAlt: 'Handmade carpet manufacturing — Tapis Global Bhadohi',
    layout:   'image-left',
    variant:  'ivory',
  },
  {
    id:         'why-us',
    sectionNum: '02',
    eyebrow:    'Why Tapis Global',
    title:      'Built for Design-Led',
    titleEm:    'Projects.',
    lead:       'TGI combines manufacturing depth, design innovation and project execution — supporting specification teams, procurement departments and buyers who require more than a catalogue.',
    body:       'Our in-house studio translates mood boards, Pantone references and architectural drawings into production-ready carpets. With custom sizing, material selection, fire-rating options and phased dispatch, we serve luxury homes, hotel groups, corporate offices, retail environments and tender requirements across India — while maintaining the export standards international buyers expect.',
    stats: [
      { value: '3',  suffix: '–4 Wks', label: 'Production Lead Time' },
      { value: '7',  suffix: ' Days',  label: 'Sample Dispatch'      },
      { value: '100', suffix: '%',     label: 'Pre-Dispatch Inspection' },
    ],
    image:    '/images/tgi-banner-6.png',
    imageAlt: 'Luxury carpet collections for interiors and projects',
    layout:   'image-right',
    variant:  'dark',
  },
  {
    id:         'success',
    sectionNum: '03',
    eyebrow:    'Our Strength',
    title:      'What Sets Us',
    titleEm:    'Apart.',
    lead:       'Our reputation rests on consistent quality, design capability and dependable execution — for a penthouse rug, a 200-room hotel programme or an international container order.',
    body:       'Vertically integrated manufacturing, capacious warehousing and a disciplined project team allow us to deliver at scale without compromising the handmade character that defines premium flooring.',
    pillars: [
      'Comprehensive range — residential, hospitality and commercial grades',
      'On-time project delivery with milestone-based coordination',
      'Ethically sourced materials and certified fair-labour practices',
      'Climate-controlled warehousing and secure dispatch',
      'Transparent dealings with architects, developers and procurement teams',
      'In-house designers, master weavers and dedicated QC personnel',
      'Advanced infrastructure across tufting, weaving, dyeing and finishing',
      'Pan India network alongside international distribution partnerships',
    ],
    image:    '/images/tgi-banner-4.png',
    imageAlt: 'Hospitality and commercial carpet projects — Tapis Global',
    layout:   'image-left',
    variant:  'ink',
  },
  {
    id:         'quality',
    sectionNum: '04',
    eyebrow:    'Quality & Assurance',
    title:      'Luxury You Can',
    titleEm:    'Measure.',
    lead:       'Every carpet passes rigorous quality control — because premium interiors, hospitality audits and project specifications leave no room for compromise.',
    body:       'From batch-tested raw materials to finishing inspection and documented pre-dispatch review, our quality systems support architect submissions, hotel brand standards, tender compliance and export import requirements alike.',
    bullets: [
      { label: 'Premium Raw Materials', text: 'New Zealand wool, pure silk, viscose, cotton and jute — tested before production entry.' },
      { label: 'OEKO-TEX Standard 100', text: 'Certified safe textiles tested for harmful substances at every stage.' },
      { label: 'Multi-Stage QC', text: 'In-process checks, finishing inspection and 100% pre-dispatch review on every order.' },
      { label: 'Project & Export Standards', text: 'Fire ratings, REACH, hospitality compliance and international import documentation.' },
    ],
    image:    '/images/vibrant-wool-dying.png',
    imageAlt: 'Wool dyeing and quality control — Tapis Global International',
    layout:   'image-right',
    variant:  'ivory',
  },
  {
    id:         'team',
    sectionNum: '05',
    eyebrow:    'Our Team',
    title:      'The Heart of',
    titleEm:    'Our Organization.',
    lead:       'Creative designers, master craftspeople and project coordinators work as one team — translating vision into floors that define spaces.',
    body:       'Rooted in Bhadohi\'s textile heritage, Tapis Global is a family business evolved into a modern flooring solutions brand. Generations of weaving knowledge inform every collection — whether destined for a Mumbai hotel lobby or a designer showroom in London.',
    bullets: [
      { label: 'Design Studio', text: 'Translating architect and designer briefs into production-ready artwork and sample programmes.' },
      { label: 'Master Artisans', text: '500+ skilled craftspeople across tufting, knotting, flatweave and finishing.' },
      { label: 'Quality Controllers', text: 'Dedicated QC at every production stage — from fibre to final packing.' },
      { label: 'Project & Logistics', text: 'Coordination for pan India dispatch, phased hospitality roll-outs and international shipments.' },
    ],
    image:    '/images/tgi-banner-5.png',
    imageAlt: 'Master artisans weaving premium carpets — Bhadohi',
    layout:   'image-left',
    variant:  'dark',
  },
  {
    id:         'infrastructure',
    sectionNum: '06',
    eyebrow:    'Infrastructure',
    title:      'World-Class',
    titleEm:    'Production Under One Roof.',
    lead:       'ISO 9001:2015, OEKO-TEX and GoodWeave certified — our 80,000 sq ft campus integrates every division required for defect-free manufacturing at project scale.',
    body:       'Technically upgraded machinery and specialist teams execute orders on time — from a single bespoke rug to bulk tender supply. Each division operates with the tools, climate control and workflow needed for seamless production.',
    bullets: [
      { label: 'Tufting Division', text: 'Cut pile, loop pile and cut-and-loop lines for hospitality and residential programmes.' },
      { label: 'Weaving Division', text: 'Hand knotted, flat weave, kilim and dhurrie looms operated by specialist teams.' },
      { label: 'Dyeing & Finishing', text: 'In-house colour lab, washing, shearing, binding and fire-rating treatments.' },
      { label: 'Project Packing', text: 'Roll-packed, flat-packed and custom crating for site delivery and international freight.' },
    ],
    pillars: [
      'Tufting, weaving, dyeing and finishing under one roof',
      'Continuous upgradation to match global design and compliance standards',
      'Capacity for bulk hospitality, commercial and export programmes',
    ],
    image:    '/images/tufting-carpet.png',
    imageAlt: 'Modern carpet manufacturing unit — Tapis Global Bhadohi',
    layout:   'image-right',
    variant:  'ink',
  },
  {
    id:         'products',
    sectionNum: '07',
    eyebrow:    'Our Range',
    title:      'Carpets',
    titleEm:    '& Floor Coverings.',
    lead:       'Nine product disciplines — each suited to luxury homes, hotels, offices, retail spaces, designer interiors and international collections.',
    products: [
      { name: 'Hand Tufted Carpets',     desc: 'Wool, viscose and cotton — for residences, hotels and commercial interiors.' },
      { name: 'Hand Knotted Rugs',       desc: 'Persian, Tibetan and contemporary knotting for luxury and collector spaces.' },
      { name: 'Flat Weaves & Kilims',    desc: 'Reversible dhurries and natural flatweaves for modern architectural interiors.' },
      { name: 'Wall-to-Wall Broadloom',  desc: 'Contract-grade flooring for hotels, corridors and commercial environments.' },
      { name: 'Jute & Natural Rugs',     desc: 'Sustainable floor coverings for retail, hospitality and eco-conscious projects.' },
      { name: 'Custom & Bespoke',        desc: 'Architect collaborations, logo carpets and fully specified project programmes.' },
    ],
    image:    '/images/handtufted-img-2.png',
    imageAlt: 'Luxury hand tufted carpet collection — Tapis Global',
    layout:   'image-left',
    variant:  'ivory',
  },
  {
    id:         'warehousing',
    sectionNum: '08',
    eyebrow:    'Execution & Dispatch',
    title:      'Project Supply.',
    titleEm:    'Secure Delivery.',
    lead:       'Spacious warehousing, barcode inventory and project-wise packing ensure bulk quantities are stored safely and dispatched on schedule — across India and internationally.',
    body:       'From tender fulfilment and hospitality phased delivery to export cartons and air freight, our logistics team coordinates every dispatch with the documentation your project or import market requires.',
    pillars: [
      'Climate-controlled storage for fibre preservation',
      'Project-wise batch tracking and inventory management',
      'Pan India logistics coordination for site delivery',
      'Export-grade cartons, poly-wrap and palletization',
      'Fire safety and secure handling throughout the facility',
      'Documentation for tenders, hospitality audits and customs clearance',
    ],
    cta: { label: 'Discuss Your Project', href: '/contact' },
    image:    '/images/wool-drying-pic.png',
    imageAlt: 'Carpet finishing, storage and project dispatch — Tapis Global',
    layout:   'image-right',
    variant:  'dark',
  },
]
