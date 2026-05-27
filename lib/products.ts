// ─── PRODUCTS — category system (main hub + detail pages) ─────

export type ProductGalleryImage = {
  src: string
  alt: string
}

export type ProductBullet = {
  label: string
  text:  string
}

export type ProductCategory = {
  slug:        string
  name:        string
  cardImage:   string
  heroImage:   string
  tagline:     string
  intro:       string
  body:        string
  bullets:     ProductBullet[]
  idealFor:    string[]
  materials:   string[]
  moq:         string
  leadTime:    string
  gallery:     ProductGalleryImage[]
}

const POOL = [
  '/images/rug1.jpg',
  '/images/rug2.jpg',
  '/images/rug3.jpg',
  '/images/rug4.jpg',
  '/images/rug5.jpg',
  '/images/tgi-banner-1.png',
  '/images/tgi-banner-2.png',
  '/images/tgi-banner-3.png',
  '/images/tgi-banner-4.png',
  '/images/tgi-banner-5.png',
  '/images/tgi-banner-6.png',
  '/images/tgi-banner-7.jpg',
  '/images/handtufted-img-2.png',
  '/images/tufting-carpet.png',
  '/images/manufacturing-rug-img.png',
  '/images/jute-rugs-manufacturing.png',
  '/images/vibrant-wool-dying.png',
  '/images/wool-drying-pic.png',
  '/images/videoframe_15503.png',
] as const

function gallery(primary: string[], name: string, captions: string[]): ProductGalleryImage[] {
  const imgs = [...primary, ...POOL.filter((p) => !primary.includes(p))]
  return Array.from({ length: 12 }, (_, i) => ({
    src: imgs[i % imgs.length],
    alt: captions[i % captions.length] ?? `${name} — Tapis Global International`,
  }))
}

export const PRODUCT_WHY_US = [
  { icon: 'craft',    title: 'Handmade Excellence',       desc: 'Every piece passes through skilled artisan hands — tufters, weavers and finishers trained in Bhadohi\'s finest traditions.' },
  { icon: 'export',   title: 'Premium Quality Standards', desc: 'ISO 9001:2015, OEKO-TEX and multi-stage inspection — meeting architect, hospitality and project specification requirements.' },
  { icon: 'sustain',  title: 'Sustainable Materials',     desc: 'Ethically sourced wool, silk, jute and natural fibres with AZO-free dyes and GoodWeave fair-labour certification.' },
  { icon: 'custom',   title: 'Custom Manufacturing',      desc: 'Any size, colour, pattern or construction — from designer showrooms to multi-phase hotel and commercial programmes.' },
  { icon: 'delivery', title: 'Pan India & Global Delivery', desc: 'Project dispatch across India and international freight to 45+ countries — with documented QC and coordinated logistics.' },
  { icon: 'artisan',  title: 'Skilled Artisans',          desc: '500+ master craftspeople across tufting, knotting, flatweave and finishing divisions under one roof.' },
]

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    slug:      'hand-tufted-carpet',
    name:      'Hand Tufted Carpet',
    cardImage: '/images/handtufted-img-2.png',
    heroImage: '/images/tgi-banner-1.png',
    tagline:   'Hand Tufted Carpets crafted with precision, elegance, and timeless artistry.',
    intro:     'Our hand tufted carpets combine the speed of modern tufting with the soul of handmade production — dense pile, rich colour and a luxurious hand feel suited to residential and hospitality interiors worldwide.',
    body:      'Yarn is punched through a primary backing by skilled tufters using cut-pile, loop-pile and cut-and-loop constructions. The result is a versatile floor covering that accepts complex patterns, carved relief and multi-level textures at scale — without compromising the warmth of handcrafted production.',
    bullets: [
      { label: 'Craftsmanship', text: 'Hand-guided tufting guns operated by specialist teams — each piece finished with binding, shearing and washing for a premium hand feel.' },
      { label: 'Materials', text: 'New Zealand wool, Indian wool, viscose, cotton and polyester blends — batch-tested and OEKO-TEX compliant.' },
      { label: 'Customization', text: 'Any dimension, Pantone colour match, carved patterns and private-label OEM programmes with lab-dip approval.' },
      { label: 'Ideal Usage', text: 'Luxury residences, boutique hotels, retail showrooms and wholesale collections for importers worldwide.' },
    ],
    idealFor:  ['Luxury Homes', 'Hotels & Resorts', 'Architect Projects', 'Corporate Offices'],
    materials: ['New Zealand Wool', 'Viscose', 'Cotton', 'Wool-Viscose Blends'],
    moq:       '100 Pieces',
    leadTime:  '45–60 Days',
    gallery: gallery(
      ['/images/handtufted-img-2.png', '/images/tufting-carpet.png', '/images/rug1.jpg'],
      'Hand Tufted Carpet',
      ['Hand tufted wool rug in luxury living room', 'Close-up cut pile texture', 'Contemporary tufted pattern detail', 'Hospitality suite installation', 'Tufting production line Bhadohi', 'Carved pattern hand tufted carpet', 'Neutral tone tufted broadloom', 'Viscose blend luxury tuft', 'Custom colour tufted medallion', 'Hotel corridor tufted runner', 'Showroom display tufted collection', 'Artisan finishing hand tufted rug'],
    ),
  },
  {
    slug:      'hand-knotted-carpet',
    name:      'Hand Knotted Carpet',
    cardImage: '/images/tgi-banner-2.png',
    heroImage: '/images/tgi-banner-2.png',
    tagline:   'Hand Knotted Carpets — where patience, knot density and heritage weave floors of enduring beauty.',
    intro:     'Each knot is tied by hand on the loom — Persian, Tibetan and contemporary constructions in wool, silk and blended fibres for collectors, luxury residences and five-star hospitality.',
    body:      'Our knotted carpets range from 40 to 300+ KPSI, offering everything from robust commercial-grade knotting to museum-quality silk masterpieces. Generational weavers in Bhadohi bring classical reproductions and trend-forward designs to life with unmatched consistency.',
    bullets: [
      { label: 'Craftsmanship', text: 'Hand-knotted on vertical looms — every knot tied, trimmed and washed by master weavers with decades of experience.' },
      { label: 'Materials', text: 'Pure silk, New Zealand wool, wool-silk blends and high-altitude Tibetan wool — ethically sourced and batch-tested.' },
      { label: 'Customization', text: 'Classical Persian reproductions, contemporary abstracts, custom medallions and project-specific sizing for hospitality.' },
      { label: 'Ideal Usage', text: 'Palatial residences, embassy interiors, luxury hotel suites and high-end retail collections.' },
    ],
    idealFor:  ['Palatial Interiors', 'Luxury Hotels', 'Designer Residences', 'Fine Art Collectors'],
    materials: ['Pure Silk', 'New Zealand Wool', 'Wool-Silk Blend', 'Tibetan Wool'],
    moq:       '50 Pieces',
    leadTime:  '60–90 Days',
    gallery: gallery(
      ['/images/tgi-banner-2.png', '/images/rug2.jpg', '/images/tgi-banner-5.png'],
      'Hand Knotted Carpet',
      ['Persian knotted rug detail', 'Silk knot density close-up', 'Master weaver at loom Bhadohi', 'Classical medallion knotted carpet', 'Contemporary knotted abstract', 'Hotel suite silk-wool rug', 'Tibetan construction knotted piece', 'Border pattern knot detail', 'Luxury living room knotted installation', 'Knotted runner corridor', 'Multi-colour knotted field', 'Finished knotted carpet QC inspection'],
    ),
  },
  {
    slug:      'shaggy-rugs',
    name:      'Shaggy Rugs',
    cardImage: '/images/rug4.jpg',
    heroImage: '/images/rug4.jpg',
    tagline:   'Shaggy Rugs — plush depth, tactile warmth and contemporary comfort for modern luxury spaces.',
    intro:     'Long-pile shaggy constructions in wool, polyester and blended fibres — designed for bedrooms, lounges and boutique hospitality where texture and comfort define the experience.',
    body:      'Our shaggy range features high-pile tufting with premium yarn blends that maintain shape under use while delivering the sink-in softness that contemporary interiors demand. Available in solid, tonal and multi-texture programmes.',
    bullets: [
      { label: 'Craftsmanship', text: 'High-pile tufting with precision shearing — pile height calibrated for comfort, durability and easy maintenance.' },
      { label: 'Materials', text: 'Micro-polyester, acrylic, wool blends and premium synthetic fibres — anti-shed treatments available.' },
      { label: 'Customization', text: 'Custom pile heights, tonal colourways, round and irregular shapes for designer specifications.' },
      { label: 'Ideal Usage', text: 'Master bedrooms, lounge areas, retail concept stores and contemporary hospitality suites.' },
    ],
    idealFor:  ['Bedrooms & Lounges', 'Boutique Hotels', 'Retail Concepts', 'Residential Developers'],
    materials: ['Wool Blends', 'Micro-Polyester', 'Acrylic', 'Premium Synthetic'],
    moq:       '100 Pieces',
    leadTime:  '40–55 Days',
    gallery: gallery(
      ['/images/rug4.jpg', '/images/rug5.jpg', '/images/handtufted-img-2.png'],
      'Shaggy Rug',
      ['Plush shaggy rug living room', 'Long pile texture close-up', 'Neutral shaggy bedroom rug', 'Contemporary grey shaggy carpet', 'Tonal shaggy lounge installation', 'Shaggy round accent rug', 'High pile comfort detail', 'Boutique hotel shaggy suite', 'Multi-tone shaggy collection', 'Shaggy rug under modern furniture', 'Warm ivory shaggy carpet', 'Shaggy rug production finishing'],
    ),
  },
  {
    slug:      'jute-sisal-rugs',
    name:      'Jute / Sisal Rugs',
    cardImage: '/images/jute-rugs-manufacturing.png',
    heroImage: '/images/jute-rugs-manufacturing.png',
    tagline:   'Jute & Sisal Rugs — natural fibre elegance for sustainable, design-forward interiors.',
    intro:     'Eco-conscious flatweave and natural fibre floor coverings woven from jute, sisal and cotton — perfect for coastal homes, organic retail lines and hospitality projects seeking authentic texture.',
    body:      'Bhadohi\'s natural fibre division produces braided, woven and bound constructions that celebrate raw material beauty. Each piece is finished for export with anti-shed binding and optional latex backing for commercial use.',
    bullets: [
      { label: 'Craftsmanship', text: 'Hand-woven and braided natural fibre constructions — reinforced edges and export-grade binding on every piece.' },
      { label: 'Materials', text: 'Golden jute, sisal, seagrass, cotton and hemp — sustainably sourced from certified suppliers.' },
      { label: 'Customization', text: 'Custom sizes, border treatments, dyed jute colourways and private-label natural collections.' },
      { label: 'Ideal Usage', text: 'Eco-retail brands, coastal resorts, organic interiors and sustainable hospitality programmes.' },
    ],
    idealFor:  ['Eco Retail', 'Coastal Resorts', 'Organic Interiors', 'Sustainable Hospitality'],
    materials: ['Golden Jute', 'Sisal', 'Seagrass', 'Cotton & Hemp'],
    moq:       '200 Pieces',
    leadTime:  '30–45 Days',
    gallery: gallery(
      ['/images/jute-rugs-manufacturing.png', '/images/rug3.jpg', '/images/rug5.jpg'],
      'Jute Sisal Rug',
      ['Natural jute rug living space', 'Jute weave texture close-up', 'Sisal bound edge detail', 'Coastal interior jute carpet', 'Braided jute round rug', 'Natural fibre manufacturing Bhadohi', 'Organic retail jute display', 'Neutral jute runner hallway', 'Dyed jute colour collection', 'Sustainable hotel jute flooring', 'Handwoven sisal flatweave', 'Export packing natural fibre rugs'],
    ),
  },
  {
    slug:      'leather-carpets',
    name:      'Leather Carpets',
    cardImage: '/images/rug3.jpg',
    heroImage: '/images/tgi-banner-6.png',
    tagline:   'Leather Carpets — bold texture, artisan patchwork and statement luxury for distinctive interiors.',
    intro:     'Premium leather and leather-composite carpets — patchwork, hair-on-hide and embossed constructions for high-impact residential, retail and hospitality environments.',
    body:      'Our leather programme combines traditional stitching techniques with modern backing systems for durability. Each piece is unique in character — ideal for designer showrooms, executive offices and luxury boutique spaces.',
    bullets: [
      { label: 'Craftsmanship', text: 'Hand-stitched patchwork and precision-cut leather panels — finished with non-slip backing and edge binding.' },
      { label: 'Materials', text: 'Genuine leather, suede, leather-composite and hair-on-hide — sourced from certified tanneries.' },
      { label: 'Customization', text: 'Custom patchwork layouts, embossed logos, colour-dyed leather and bespoke size programmes.' },
      { label: 'Ideal Usage', text: 'Executive offices, luxury retail, penthouse interiors and boutique hotel lobbies.' },
    ],
    idealFor:  ['Executive Offices', 'Luxury Retail', 'Penthouse Interiors', 'Boutique Lobbies'],
    materials: ['Genuine Leather', 'Suede', 'Hair-on-Hide', 'Leather Composite'],
    moq:       '50 Pieces',
    leadTime:  '50–70 Days',
    gallery: gallery(
      ['/images/rug3.jpg', '/images/tgi-banner-6.png', '/images/rug1.jpg'],
      'Leather Carpet',
      ['Leather patchwork rug luxury office', 'Hair-on-hide texture detail', 'Embossed leather carpet panel', 'Executive boardroom leather floor', 'Patchwork leather living room', 'Leather rug stitching close-up', 'Dark tone leather statement rug', 'Boutique retail leather flooring', 'Custom logo leather inlay', 'Leather composite hospitality rug', 'Tonal leather patchwork collection', 'Leather carpet finishing QC'],
    ),
  },
  {
    slug:      'wall-to-wall-carpets',
    name:      'Wall to Wall Carpets',
    cardImage: '/images/tgi-banner-4.png',
    heroImage: '/images/tgi-banner-4.png',
    tagline:   'Wall to Wall Carpets — seamless broadloom elegance for hospitality, commercial and residential scale.',
    intro:     'Broadloom and tile carpet programmes engineered for hotels, offices and large-format residential projects — fire-rated, durable and available in custom colour runs.',
    body:      'Our wall-to-wall division produces axminster, tufted broadloom and carpet tile constructions with commercial-grade backing. Phased delivery, on-site measurement support and installation guidance available for project buyers.',
    bullets: [
      { label: 'Craftsmanship', text: 'Broadloom tufting and axminster weaving on wide-width looms — precision dye matching across production runs.' },
      { label: 'Materials', text: 'Solution-dyed nylon, wool-nylon blends, polypropylene and recycled fibre options for contract specifications.' },
      { label: 'Customization', text: 'Custom colour runs, corridor patterns, lobby medallions and phased project delivery schedules.' },
      { label: 'Ideal Usage', text: 'Hotels, corporate offices, cruise ships, airports and large residential developments.' },
    ],
    idealFor:  ['Hotels & Resorts', 'Corporate Offices', 'Cruise & Aviation', 'Large Developments'],
    materials: ['Solution-Dyed Nylon', 'Wool-Nylon Blend', 'Polypropylene', 'Recycled Fibre'],
    moq:       '500 Sq M',
    leadTime:  '45–75 Days',
    gallery: gallery(
      ['/images/tgi-banner-4.png', '/images/tufting-carpet.png', '/images/manufacturing-rug-img.png'],
      'Wall to Wall Carpet',
      ['Hotel corridor broadloom installation', 'Lobby wall-to-wall carpet', 'Broadloom texture close-up', 'Corporate office carpet tile', 'Hospitality suite seamless flooring', 'Axminster pattern broadloom', 'Fire-rated contract carpet roll', 'Custom colour broadloom run', 'Resort hallway carpet programme', 'Carpet tile modular layout', 'Wide-width loom production', 'Broadloom export packing'],
    ),
  },
  {
    slug:      'flat-weaves',
    name:      'Flat Weaves',
    cardImage: '/images/rug5.jpg',
    heroImage: '/images/rug5.jpg',
    tagline:   'Flat Weaves — kilims, dhurries and reversible elegance for contemporary global interiors.',
    intro:     'Handwoven flatweave carpets and kilims — lightweight, reversible and rich in pattern — suited to modern residential, retail and hospitality environments.',
    body:      'Woven on horizontal looms without pile, our flatweaves offer crisp geometric patterns, tribal motifs and contemporary abstractions in wool, cotton and jute. Ideal for layering and high-traffic areas.',
    bullets: [
      { label: 'Craftsmanship', text: 'Handwoven on traditional looms — reversible constructions with reinforced selvedges and export finishing.' },
      { label: 'Materials', text: 'Wool, cotton, jute and recycled fibre blends — AZO-free vegetable and chrome dyes.' },
      { label: 'Customization', text: 'Custom geometric patterns, tribal reproductions, size ranges and seasonal colour programmes.' },
      { label: 'Ideal Usage', text: 'Contemporary homes, Scandinavian retail, boutique hotels and designer showrooms.' },
    ],
    idealFor:  ['Contemporary Homes', 'Scandinavian Retail', 'Boutique Hotels', 'Designer Showrooms'],
    materials: ['Wool', 'Cotton', 'Jute', 'Recycled Fibre'],
    moq:       '150 Pieces',
    leadTime:  '35–50 Days',
    gallery: gallery(
      ['/images/rug5.jpg', '/images/rug3.jpg', '/images/tgi-banner-3.png'],
      'Flat Weave',
      ['Kilim flatweave living room', 'Geometric flatweave pattern detail', 'Reversible dhurrie close-up', 'Contemporary flatweave bedroom', 'Tribal motif kilim carpet', 'Flatweave loom weaving Bhadohi', 'Layered flatweave interior', 'Neutral tone flatweave runner', 'Colourful kilim collection', 'Hospitality flatweave suite', 'Cotton flatweave texture', 'Flatweave export finishing'],
    ),
  },
  {
    slug:      'poufs',
    name:      'Poufs',
    cardImage: '/images/rug2.jpg',
    heroImage: '/images/tgi-banner-6.png',
    tagline:   'Poufs — sculptural seating accents handcrafted in leather, wool and woven textiles.',
    intro:     'Luxury poufs and floor cushions — hand-stitched leather, embroidered wool and woven constructions — complementing our carpet collections for complete interior programmes.',
    body:      'Designed to coordinate with rug collections or stand alone as statement pieces, our poufs are filled with premium density foam or natural fibre stuffing and finished with hidden stitching and reinforced bases.',
    bullets: [
      { label: 'Craftsmanship', text: 'Hand-stitched and embroidered constructions — reinforced seams and premium inner filling for lasting form.' },
      { label: 'Materials', text: 'Leather, wool, cotton canvas, jute and embroidered textile covers — removable covers available.' },
      { label: 'Customization', text: 'Custom sizes, embroidery, logo branding and colour-matched to carpet collections.' },
      { label: 'Ideal Usage', text: 'Luxury lounges, hotel lobbies, retail display and residential accent seating.' },
    ],
    idealFor:  ['Hotel Lobbies', 'Luxury Lounges', 'Retail Display', 'Residential Accents'],
    materials: ['Leather', 'Wool', 'Cotton Canvas', 'Embroidered Textile'],
    moq:       '100 Pieces',
    leadTime:  '30–45 Days',
    gallery: gallery(
      ['/images/rug2.jpg', '/images/tgi-banner-6.png', '/images/handtufted-img-2.png'],
      'Pouf',
      ['Leather pouf luxury lounge', 'Embroidered wool pouf detail', 'Moroccan style floor cushion', 'Hotel lobby pouf arrangement', 'Woven jute pouf accent', 'Custom logo embroidered pouf', 'Round leather ottoman pouf', 'Contemporary pouf living room', 'Pouf coordinated with rug set', 'Hand-stitched pouf construction', 'Retail display pouf collection', 'Pouf export packaging'],
    ),
  },
  {
    slug:      'coco-coir',
    name:      'Coco Coir',
    cardImage: '/images/wool-drying-pic.png',
    heroImage: '/images/manufacturing-rug-img.png',
    tagline:   'Coco Coir Products — natural coir mats, husk and eco floor solutions for entrances, hospitality and sustainable interiors.',
    intro:     'Natural coir mats, coco peat, husk products and eco floor coverings — manufactured for pan India projects and international buyers seeking sustainable natural fibre solutions.',
    body:      'Our coir division processes coconut fibre into woven mats, entrance rugs, erosion control products and horticultural coco peat — finished to premium quality with project-wise dispatch across India and worldwide.',
    bullets: [
      { label: 'Craftsmanship', text: 'Machine and hand-woven coir constructions — latex backing, anti-slip treatments and UV-resistant options.' },
      { label: 'Materials', text: 'Natural coconut coir, rubber latex backing, biodegradable coco peat and husk chips.' },
      { label: 'Customization', text: 'Custom sizes, printed logos on coir mats, private-label packaging and bulk container programmes.' },
      { label: 'Ideal Usage', text: 'Entrance matting, eco retail, hospitality back-of-house and institutional green building projects.' },
    ],
    idealFor:  ['Entrance Matting', 'Eco Retail', 'Hospitality Projects', 'Institutional Interiors'],
    materials: ['Natural Coir', 'Coco Peat', 'Coco Husk', 'Rubber Latex Backing'],
    moq:       '500 Pieces',
    leadTime:  '25–40 Days',
    gallery: gallery(
      ['/images/wool-drying-pic.png', '/images/manufacturing-rug-img.png', '/images/jute-rugs-manufacturing.png'],
      'Coco Coir',
      ['Natural coir entrance mat', 'Coir weave texture close-up', 'Coco peat export bags', 'Woven coir rug natural tone', 'Coir mat logo printing', 'Horticultural coco husk chips', 'Eco retail coir display', 'Coir manufacturing facility', 'Rubber backed coir mat', 'Bulk coir container loading', 'Natural coir runner hallway', 'Coir product QC inspection'],
    ),
  },
]

export function getProductCategory(slug: string): ProductCategory | undefined {
  return PRODUCT_CATEGORIES.find((c) => c.slug === slug)
}

export function getAllProductSlugs(): string[] {
  return PRODUCT_CATEGORIES.map((c) => c.slug)
}

export const PRODUCT_DROPDOWN = PRODUCT_CATEGORIES.map((c) => ({
  label: c.name,
  href:  `/products/${c.slug}`,
}))
