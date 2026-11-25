// ────────────────────────────────────────────────────────────────────────────
// lib/guides-v31.ts — the 11 standalone guides approved in the V3.1 keyword master
// (docs/seo-strategy/keyword-master-v3.1.csv). They use the existing Guide model and
// the existing guide template (components/guides/GuideArticle.tsx); no new component,
// style or image. Informational intent only: commercial terms stay on the product,
// industry and solution pages these guides link to.
//
// Content rules: general industry knowledge is stated in qualified terms; statements
// about Tapis Global reuse only what the site already says (Bhadohi factory, in-house
// production, wall-to-wall specifications, carpet-tile specifications, OEM and custom
// services, ISO 9001 and OEKO-TEX references, MOQ and lead times on product pages).
// No test standards, prices, GSM figures, customs duties or legal advice are invented.
// ────────────────────────────────────────────────────────────────────────────
import type { Guide } from './guides'

export const V31_GUIDES: Guide[] = [
  // ─────────────────────────────────── 1. HOW TO CHOOSE A CARPET MANUFACTURER
  {
    slug: 'how-to-choose-a-carpet-manufacturer', category: 'buying',
    title: 'How to Choose a Carpet Manufacturer', heroImage: '/images/collection-tufted-factory.webp',
    seoTitle: 'How to Choose a Carpet Manufacturer | Buyer\'s Checklist',
    seoDescription: 'How to find and verify a carpet manufacturer: what to ask, manufacturer vs trader, factory visits, samples and documents. A buyer\'s guide from Bhadohi, India.',
    seoKeywords: ['how to find a carpet manufacturer', 'how to choose a carpet manufacturer', 'what to ask a carpet supplier', 'how to verify a carpet manufacturer', 'carpet manufacturer vs trader', 'factory direct vs wholesaler carpets'],
    h1: 'How to Choose a Carpet Manufacturer: A Buyer\'s Checklist',
    intro: 'Importers, wholesalers, retailers and procurement teams often compare many suppliers before placing a carpet or rug order. The cheapest quotation is rarely the best signal. This checklist explains how to find a carpet manufacturer, how to tell a manufacturer from a trader or agent, and which questions and documents separate a dependable supplier from a risky one.',
    sections: [
      { h2: 'Manufacturer, Trader or Agent: Know Which You Are Talking To', body: 'A manufacturer owns or operates the production process: dyeing, tufting or knotting, finishing and inspection. A trader buys finished goods from one or more factories and resells them. An agent introduces buyers to factories for a commission. All three can be legitimate, but they carry different risks. With a trader or agent, the factory making your order may change between orders, and quality problems pass through an extra layer. Ask directly which company will actually produce your goods and where.' },
      { h2: 'How to Find a Carpet Manufacturer', body: 'Start with the production region. Bhadohi in Uttar Pradesh is India\'s best-known hand-made carpet belt, so manufacturers there are a natural first search for hand-tufted, hand-knotted and flatweave rugs. Trade fairs, export promotion councils, buyer referrals and direct enquiries to manufacturer websites are all common routes. Shortlist companies that describe their own production in specific terms (constructions, materials, sizes, process stages) rather than listing every product category without detail.' },
      { h2: 'Questions to Ask Any Carpet Supplier', body: 'Useful questions are concrete. Which constructions do you make in your own facility? Which materials and fibre blends are available? What are the minimum order and the usual lead time for this product? How are colours matched and approved before bulk production? What does inspection involve, and at which stages? Can you share references for similar orders, and can I visit the factory? A manufacturer that answers clearly and consistently is easier to trust than one that answers every question with a yes.' },
      { h2: 'How to Verify a Carpet Manufacturer', body: 'Verification is a process, not a single document. Ask for company registration details, check that the facility address matches the one you were given, and request recent photographs or a video walk-through of production. Where certifications are cited, ask for the scope and validity of each certificate and what it covers: a management-system certificate and a product-safety certificate answer different questions. A factory visit, by you or by an independent inspector, remains the strongest check available.' },
      { h2: 'Samples, Approvals and Quality Control', body: 'Approve a sample before bulk production and keep it as the reference. Confirm how colour will be matched (for example by lab-dip approval), how dye-lots are controlled across a large order, and what pre-dispatch inspection includes. Put the approved sample, size tolerances and packing method into the written order so that any dispute can be settled against an agreed standard.' },
      { h2: 'Minimum Order, Lead Time and Terms', body: 'Minimum orders and lead times depend on construction, size and design. Ask for them per product, in writing, and check how they change for custom colours or sizes. Agree payment terms, packing, the shipping term you will use and who is responsible for each document before production starts. Be cautious if a quotation looks far below others without a clear explanation, such as a simpler construction or different materials.' },
      { h2: 'Red Flags to Watch For', body: 'Warning signs include refusing a factory visit or video call, unclear answers about who makes the goods, certificates that cannot be verified, pressure to pay in full before samples are approved, and promises of every construction at every price. None of these proves a problem on its own, but several together justify slowing down.' },
      { h2: 'How We Work at TAPIS GLOBAL INTERNATIONAL', body: 'TAPIS GLOBAL INTERNATIONAL is a third-generation family carpet business with roots dating back to 1965, manufacturing carpets and rugs in Bhadohi, India. Production stages run in-house, buyers are invited to visit the factory, and quality control, certifications, minimum orders and lead times are published on the website for each product. Use the checklist above with any supplier, including us.' },
    ],
    takeaways: [
      'Confirm whether the company is a manufacturer, trader or agent before comparing prices.',
      'Ask concrete questions about constructions, materials, minimum order, lead time and inspection.',
      'Verify certificates by scope and validity, and visit the factory or commission an inspection.',
      'Approve a sample first and write the approved standard into the order.',
    ],
    faqs: [
      { q: 'How can I check whether a carpet supplier is really a manufacturer?', a: 'Ask which facility will produce your order, request photographs or a video walk-through of production, check that the address matches company records, and visit or arrange an independent inspection. A genuine manufacturer can describe its own process stages in detail.' },
      { q: 'Is a trader the same as a manufacturer?', a: 'No. A manufacturer operates the production process, while a trader resells goods made by other factories. Traders can be reliable, but you should know who actually makes your goods because quality control and repeat-order consistency depend on it.' },
      { q: 'Can I visit the factory before ordering?', a: 'A factory visit is the strongest verification step. TAPIS GLOBAL INTERNATIONAL welcomes buyers at its Bhadohi factory; see the factory page to request a visit.' },
      { q: 'What should a sample approval include?', a: 'The approved design, colour reference, size and tolerance, material and construction, and the packing method. Keep the approved sample as the reference for bulk production and inspection.' },
      { q: 'What documents should I ask a carpet manufacturer for?', a: 'Company registration details, any certificates the supplier cites together with their scope and validity, a written quotation with specification, and a proforma invoice before production. Ask which export documents will accompany the shipment.' },
    ],
    relatedGuides: ['how-to-import-carpets-from-india', 'handmade-vs-machine-made-carpets', 'why-bhadohi-carpet-capital'],
    relatedProducts: ['hand-tufted-carpet', 'hand-knotted-carpet', 'area-rugs'],
  },

  // ─────────────────────────────────── 2. AXMINSTER CARPETS
  {
    slug: 'axminster-carpets-manufacturing-types-applications', category: 'manufacturing',
    title: 'Axminster Carpets: Manufacturing, Types and Applications', heroImage: '/images/collection-broadloom-corridor.webp',
    seoTitle: 'What Is Axminster Carpet? Manufacturing, Types & Uses',
    seoDescription: 'What is Axminster carpet? How it is woven, how it compares with Wilton, hand-tufted and other woven carpet, and where Axminster suits hotel corridors and halls.',
    seoKeywords: ['what is Axminster carpet', 'Axminster vs Wilton carpet', 'Axminster carpet for hotels', 'Axminster vs hand tufted carpet', 'Axminster or tufted carpet for hotel corridors', 'tufted vs woven carpet', 'what is woven carpet', 'difference between tufted and Axminster carpet'],
    h1: 'Axminster Carpets: Manufacturing, Types and Applications',
    intro: 'Axminster is one of the best-known names in patterned broadloom, yet it is often confused with tufted carpet and with Wilton. This guide explains what Axminster carpet is, how it is manufactured, how it differs from Wilton, tufted and other woven carpet, and where it is typically specified, including hotel corridors, banquet halls and other commercial interiors. Axminster is a machine-woven construction, so it is not described as handmade.',
    sections: [
      { h2: 'What Is Axminster Carpet?', body: 'Axminster is a woven carpet. The pile yarn and the backing are formed together on a loom, rather than the pile being punched into an existing backing as it is in tufting. The name comes from the English town of Axminster, where carpet weaving began in the eighteenth century, but the term is now used for a loom construction rather than a place. Its main strength is design freedom: a pattern can use many colours and detailed motifs without a limit on pattern repeat that other woven constructions impose.' },
      { h2: 'What Is Woven Carpet?', body: 'In a woven carpet, warp and weft yarns are interlaced with the pile yarn on a loom, so the pile is locked into the structure during weaving. Axminster and Wilton are the two best-known machine-woven constructions. Hand-knotted carpet is also woven, but it is built knot by knot by hand on a vertical or horizontal loom, which is a different process with a different cost and lead time.' },
      { h2: 'How Axminster Carpet Is Manufactured', body: 'Colour planning comes first: each tuft position in the design is assigned a yarn colour. On the loom, yarns of the required colours are presented in the planned sequence and inserted as pile tufts, then secured into the backing as the carpet is woven. Spool and gripper looms are the two traditional systems. After weaving, the carpet is back-coated for stability, sheared if required, inspected and cut to the ordered width or length. Because the colour sequence is controlled by the loom set-up, repeat orders of the same design are consistent.' },
      { h2: 'Axminster vs Wilton Carpet', body: 'Wilton is also machine woven, but its pile yarns of several colours run through the body of the carpet and are brought to the surface as the pattern requires. This usually limits a Wilton design to a small number of colours, while Axminster can carry a wide palette and larger, more detailed repeats. Wilton is often described as dense and well suited to defined, traditional patterns; Axminster is often chosen where a rich, multi-colour design is the priority. Both are used in contract interiors.' },
      { h2: 'Axminster vs Hand Tufted Carpet, and Tufted vs Woven Carpet', body: 'Tufting is a different process. A tufting tool punches pile yarn through a primary backing, a secondary backing is applied, and the pile is cut or looped. Hand-tufted carpet uses a hand-held tool, which allows custom shapes, sculpted pile and flexible design changes in smaller runs. Axminster is woven on a loom, which suits repeating patterns across long lengths of broadloom. In general terms: choose tufted when design flexibility, carving or smaller custom runs matter; choose woven when a repeating multi-colour pattern is needed across large areas. The difference between tufted and Axminster carpet is therefore the construction method, not simply the look.' },
      { h2: 'Axminster or Tufted Carpet for Hotel Corridors and Halls', body: 'Corridors, lobbies and banquet halls combine heavy foot traffic with a need for a coordinated pattern across long runs. Axminster is commonly specified for these areas because patterns repeat evenly along the length, while hand-tufted broadloom is often chosen where a custom, one-off design or sculpted effect is wanted. The right choice also depends on fibre (wool, wool-nylon blend or nylon), backing and the fire-rating the project requires, so confirm each with the manufacturer for the intended zone.' },
      { h2: 'Axminster at TAPIS GLOBAL INTERNATIONAL', body: 'TAPIS GLOBAL INTERNATIONAL produces tufted broadloom, Axminster and carpet tiles for wall-to-wall projects, with broadloom widths up to 4 m. The wall-to-wall carpets page lists the construction, materials, backing options, minimum order and lead time for contract buyers.' },
    ],
    takeaways: [
      'Axminster is a machine-woven construction known for rich multi-colour patterns; it is not handmade.',
      'Wilton is also woven, but usually carries fewer colours; tufted carpet is built by punching yarn into a backing.',
      'Choose woven for repeating patterns across long lengths and tufted for design flexibility and custom runs.',
      'Always confirm fibre, backing and fire-rating for the specific area of use.',
    ],
    faqs: [
      { q: 'What is Axminster carpet?', a: 'Axminster carpet is a machine-woven carpet in which the pile yarn and backing are formed together on a loom. It is known for supporting many colours and detailed pattern repeats.' },
      { q: 'What is the difference between Axminster and Wilton carpet?', a: 'Both are machine woven. Wilton usually carries a limited number of colours in the pile, while Axminster can carry a wide palette and larger pattern repeats.' },
      { q: 'What is the difference between tufted and Axminster carpet?', a: 'Tufted carpet is made by punching pile yarn into a backing and then adding a secondary backing. Axminster is woven on a loom, with the pile and backing formed together. The construction method affects design options, repeat length and production runs.' },
      { q: 'Is Axminster carpet good for hotel corridors?', a: 'Axminster is commonly specified for corridors and halls because patterns repeat evenly over long lengths. Suitability also depends on fibre, backing and the fire-rating required, which should be confirmed for the project.' },
      { q: 'Is Axminster carpet handmade?', a: 'No. Axminster is made on a loom by machine. Hand-tufted and hand-knotted carpets are the handmade constructions.' },
    ],
    relatedGuides: ['hand-tufted-vs-hand-knotted-carpet', 'area-rugs-vs-wall-to-wall-carpets', 'carpet-manufacturing-process-explained'],
    relatedProducts: ['wall-to-wall-carpets', 'hand-tufted-carpet', 'carpet-tiles'],
  },

  // ─────────────────────────────────── 3. CARPET TILES
  {
    slug: 'carpet-tiles-types-applications-selection', category: 'buying',
    title: 'Carpet Tiles: Types, Applications and Selection', heroImage: '/images/tgi-banner-4.webp',
    seoTitle: 'Carpet Tiles vs Broadloom: Types, Sizes & Selection',
    seoDescription: 'Carpet tiles vs broadloom: how each works, where each suits offices and hotels, tile sizes, backing, layout and installation basics for specifiers and contractors.',
    seoKeywords: ['carpet tiles vs broadloom', 'broadloom vs carpet tiles', 'what is broadloom carpet', 'are carpet tiles good for offices', 'how to install carpet tiles', 'carpet tile sizes'],
    h1: 'Carpet Tiles vs Broadloom: Types, Applications and Selection',
    intro: 'Carpet tiles and broadloom are the two main ways to carpet a commercial floor. Each has clear strengths. This guide explains what broadloom and carpet tiles are, how they compare for offices and hotels, what tile sizes and backings to ask about, and the basics of layout and installation.',
    sections: [
      { h2: 'What Is Broadloom Carpet?', body: 'Broadloom is carpet produced in wide rolls, historically wider than about 2 metres, and cut to length for the room. It is installed as a continuous surface, fixed to the floor with adhesive or tackless gripper strips over underlay. Broadloom is available in tufted and woven (including Axminster) constructions and suits large, uninterrupted areas, patterned corridors and spaces where a seamless look is wanted.' },
      { h2: 'What Are Carpet Tiles?', body: 'Carpet tiles are modular squares of carpet with a firm backing, laid individually. Because each tile can be lifted, damaged or worn tiles can be replaced without renewing the whole floor, and tiles can be lifted to reach under-floor cabling or services. They can be laid in a monolithic (all the same direction), brick, ashlar or quarter-turn layout, which changes the look of the same product.' },
      { h2: 'Carpet Tiles vs Broadloom: Side-by-Side', body: 'Replacement: tiles are replaced individually; broadloom repairs usually involve patching or re-laying a section. Waste: tiles cut with less offcut waste on regular floor plans, while broadloom wastes more where roll width and room size do not match. Pattern: broadloom, especially woven, can carry a continuous pattern; tiles create pattern by layout and colour mix. Access floors and cabling: tiles suit raised floors and service access. Seams: broadloom has fewer seams but each is visible if poorly made; tiles have many joints by design. Cost depends on construction, fibre, backing and project size, so compare quotations for the same specification rather than the format alone.' },
      { h2: 'Are Carpet Tiles Good for Offices?', body: 'For offices, tiles are often a practical choice. Desk and workstation areas wear unevenly, so replacing a few tiles is easier than replacing a floor, and reconfigured layouts or under-floor services are easier to handle. Broadloom still suits executive floors, boardrooms and reception areas where a continuous, patterned surface is preferred. Many offices combine both.' },
      { h2: 'Carpet Tile Sizes and Backings', body: 'The most common tile format is a 50 x 50 cm square. At TAPIS GLOBAL INTERNATIONAL carpet tiles are made in 50 x 50 cm, with other sizes on request. The backing affects how flat the tile lies and how it behaves under traffic: bitumen, PVC and cushion backings are the options listed on the carpet tiles page. Ask which backing suits your subfloor, whether tiles will be loose-laid or adhesive-fixed, and what the manufacturer recommends for your traffic level.' },
      { h2: 'How to Install Carpet Tiles', body: 'Preparation decides the result. The subfloor should be clean, dry, level and sound. Plan the layout from the centre of the room so cut tiles at the edges are not too small, and follow any directional arrows on the back of the tiles if the pile is directional. Tiles can be loose-laid or fixed with a suitable adhesive or tackifier, depending on the product and the site; follow the manufacturer\'s instructions and use a qualified installer. Order extra tiles for cuts and for future replacement, and keep spare tiles from the same dye-lot.' },
      { h2: 'Choosing Between Tiles and Broadloom for Hotels and Offices', body: 'Choose tiles where wear is uneven, services need access, or phased installation and later replacement matter. Choose broadloom where a seamless, patterned or custom-designed surface is the priority, such as hotel corridors, ballrooms and lobbies. For mixed projects, specify both from the same manufacturer so colours and dye-lots coordinate.' },
    ],
    takeaways: [
      'Broadloom gives a continuous patterned surface; tiles give modular replacement and access.',
      'Tiles are often practical for offices, and broadloom for corridors, ballrooms and lobbies.',
      'Check tile size, backing and layout, and order extra from the same dye-lot.',
      'Compare quotations on the same specification, not on format alone.',
    ],
    faqs: [
      { q: 'What is broadloom carpet?', a: 'Broadloom is carpet made in wide rolls and cut to length, installed as a continuous surface. It is available in tufted and woven constructions, including Axminster.' },
      { q: 'Are carpet tiles better than broadloom?', a: 'Neither is better in every case. Tiles suit uneven wear, services access and later replacement; broadloom suits seamless, patterned or custom-designed floors. The right choice depends on the area and the specification.' },
      { q: 'Are carpet tiles good for offices?', a: 'Often yes. Individual tiles can be replaced in high-wear zones and lifted for access to under-floor services. Many offices use tiles for open areas and broadloom for reception and executive spaces.' },
      { q: 'What size are carpet tiles?', a: 'The most common size is 50 x 50 cm. TAPIS GLOBAL INTERNATIONAL carpet tiles are made in 50 x 50 cm, with other sizes available on request.' },
      { q: 'How do I install carpet tiles?', a: 'Prepare a clean, dry, level subfloor, plan the layout from the centre, lay tiles loose or with a suitable adhesive as the manufacturer recommends, and keep spare tiles from the same dye-lot. Use a qualified installer for commercial projects.' },
    ],
    relatedGuides: ['office-carpet-buying-guide', 'area-rugs-vs-wall-to-wall-carpets', 'carpet-manufacturing-process-explained'],
    relatedProducts: ['carpet-tiles', 'wall-to-wall-carpets', 'hand-tufted-carpet'],
  },

  // ─────────────────────────────────── 4. COMMERCIAL AND HOSPITALITY FLOORING GUIDE
  {
    slug: 'commercial-hospitality-flooring-guide', category: 'buying',
    title: 'Commercial and Hospitality Flooring Guide', heroImage: '/images/solutions-hospitality-commercial.webp',
    seoTitle: 'Hotel Carpet Specification & Commercial Flooring Guide',
    seoDescription: 'A technical hotel carpet specification guide for architects and procurement: construction, fibre, backing, pile, traffic zones, samples, approvals and documents.',
    seoKeywords: ['hotel carpet specification', 'hotel carpet specification checklist', 'carpet specification for architects'],
    h1: 'Commercial and Hospitality Flooring Guide: Writing a Carpet Specification',
    intro: 'This guide is a technical companion for architects, specifiers and procurement teams who must write a carpet specification for a hotel, office or other commercial project. It covers the items a specification should state, how to match construction and fibre to each zone, and how to run samples, approvals and documents. For a buyer-oriented overview of choosing hotel carpet, see the hotel carpet buying guide.',
    sections: [
      { h2: 'What a Carpet Specification Should State', body: 'A usable specification is unambiguous. State the area and quantity by zone; the construction (tufted broadloom, Axminster or carpet tile); face fibre and blend; pile type and pile height; backing system; width or tile size; colour and pattern references; and any performance requirements such as fire-rating, acoustic behaviour, stain or soil resistance and the expected traffic. Avoid requesting performance classes you cannot verify: where a standard or class is required, name the one your project, region or insurer demands and ask the supplier to confirm what it can document.' },
      { h2: 'Match Construction to the Zone', body: 'Guest rooms, corridors, lobbies, ballrooms, meeting rooms and back-of-house areas place different demands on carpet. Corridors and lobbies see the heaviest and most continuous traffic. Ballrooms and meeting rooms often need large patterned areas that can be seamed accurately. Guest rooms prioritise comfort and acoustics. Offices and retail often favour modular tiles for uneven wear. Record the zone for each product so the supplier can propose the right construction rather than a single product for everything.' },
      { h2: 'Fibre, Pile and Backing', body: 'Wool, wool-nylon blends and nylon are common contract fibres, and polypropylene is also used in some commercial specifications. The fibre influences resilience, appearance retention, cleaning behaviour and cost. Pile height and density affect appearance retention and comfort. Backing affects stability, installation and, for tiles, how flat they lie: the wall-to-wall carpets page lists action-bac, bitumen and cushion backing options. Ask the manufacturer to confirm the combination for each zone.' },
      { h2: 'Fire-Rating, Acoustics and Other Performance Requests', body: 'Fire-rating requirements depend on the country, the building type and the authority having jurisdiction. State the requirement explicitly and ask the supplier which test reports it can provide for the proposed construction. TAPIS GLOBAL INTERNATIONAL states that fire-rating is available on request. For acoustics and underfoot comfort, discuss pile construction and underlay with the manufacturer and installer; do not assume a figure without supporting data.' },
      { h2: 'Colour, Pattern and Dye-Lot Control', body: 'Large projects need colour consistency across rolls and delivery phases. Ask for lab-dip or colour approval before bulk production, confirm how dye-lots are controlled, and require that phased deliveries come from approved lots. For patterned broadloom, agree the repeat, the layout drawings and how pattern match at seams will be handled.' },
      { h2: 'Samples, Approvals and Submittals', body: 'Specify the sample stages before production: a colour and design sample, a construction sample, and, if required, a full-size or strike-off sample. Record who approves each, how many days approval takes, and how the approved sample becomes the reference for bulk production and inspection.' },
      { h2: 'Procurement Information the Manufacturer Needs', body: 'To quote accurately, send the floor plan or total area, product type, pattern and colour references, performance requirements, delivery location and programme dates, and installation sequence. The wall-to-wall carpets page gives the published minimum order and lead time for contract buyers. Confirm packing, phased delivery and documents (including test reports and origin documents) in the order.' },
      { h2: 'Installation Coordination', body: 'Plan subfloor preparation, climate conditions and installer access before delivery. Agree measurement and installation drawings, who cuts and seams patterned areas, and how waste and spare stock will be handled. Keep leftover material from the approved dye-lot for future repairs.' },
    ],
    takeaways: [
      'A specification should name construction, fibre, pile, backing, size, colour and the performance requirements by zone.',
      'Ask suppliers to document what they can verify; do not request classes or figures nobody can support.',
      'Control colour with approvals, dye-lot management and phased delivery from approved lots.',
      'Give the manufacturer area, programme dates and zone details so the quotation matches the project.',
    ],
    faqs: [
      { q: 'What should a hotel carpet specification include?', a: 'Zones and areas, construction, face fibre, pile type and height, backing, width or tile size, colour and pattern references, performance requirements such as fire-rating, and sample and approval stages.' },
      { q: 'Which construction suits hotel corridors?', a: 'Corridors need a durable construction and a pattern that repeats evenly over long lengths. Axminster and tufted broadloom are both used; the choice depends on fibre, backing, design and the fire-rating required.' },
      { q: 'What does fire-rating on request mean?', a: 'It means the required fire performance is confirmed against the project specification and supporting documentation is supplied where available. State the requirement your project needs.' },
      { q: 'How do I keep colour consistent across a large hotel project?', a: 'Approve colour before bulk production, require dye-lot control and make sure phased deliveries come from approved lots. Keep spare material from the same lot for repairs.' },
      { q: 'What information do manufacturers need for a quotation?', a: 'Floor plan or area, product type, pattern and colour references, performance requirements, delivery location, programme dates and installation sequence.' },
    ],
    relatedGuides: ['hotel-carpet-buying-guide', 'office-carpet-buying-guide', 'carpet-manufacturing-process-explained'],
    relatedProducts: ['wall-to-wall-carpets', 'carpet-tiles', 'hand-tufted-carpet'],
  },

  // ─────────────────────────────────── 5. CARPET AND RUG CARE GUIDE
  {
    slug: 'carpet-and-rug-care-guide', category: 'buying',
    title: 'Carpet and Rug Care Guide', heroImage: '/images/collection-knotted-luxury-room.webp',
    seoTitle: 'Carpet & Rug Care Guide | How to Maintain Handmade Rugs',
    seoDescription: 'How to maintain handmade rugs and carpets: vacuuming, spot cleaning, rotation, shag and hand-tufted care, and how often hotels should clean carpet.',
    seoKeywords: ['how to maintain handmade rugs', 'how to care for hand tufted rug', 'how often to clean hotel carpet', 'how to vacuum a shag rug'],
    h1: 'Carpet and Rug Care Guide: How to Maintain Handmade Rugs',
    intro: 'Good maintenance protects both appearance and lifespan. This guide gives general care advice for handmade rugs (hand-tufted and hand-knotted), shag rugs and commercial carpet. It is general guidance: always follow the care instructions supplied with your specific rug or carpet, and use a professional cleaner for valuable, delicate or heavily soiled pieces.',
    sections: [
      { h2: 'Start With the Construction and Fibre', body: 'Care depends on how a rug is made and what it is made from. Hand-tufted rugs have yarn punched into a backing and usually a latex or similar secondary backing; hand-knotted rugs have each knot tied by hand into the foundation. Wool is resilient and naturally soil-resistant but can shed fluff in the first weeks; viscose and other silk-like fibres have a sheen that is sensitive to moisture and rough handling; jute and sisal are natural fibres that dislike soaking. Identify the fibre before choosing any cleaning method.' },
      { h2: 'How to Maintain Handmade Rugs: Routine Care', body: 'Vacuum regularly with the suction set for the pile, and avoid a rotating beater bar on delicate, fringed or high-pile rugs. Vacuum in the direction of the pile, and do not pull on loose yarn ends: trim them level with scissors. Rotate the rug periodically so sunlight and foot traffic wear it evenly, and keep it out of prolonged direct sun to limit fading. Use a suitable rug pad or underlay to reduce slipping and wear, checking that it is suitable for your floor type.' },
      { h2: 'Spot Cleaning Spills', body: 'Act quickly and blot, never rub. Lift solids gently, press absorbent white cloth or paper onto the liquid from the outside in, and repeat with fresh cloth. For most wool rugs a small amount of lukewarm water or a mild, wool-safe cleaner may be used sparingly; test any product on a hidden corner first. Avoid soaking the rug, because moisture can reach the backing and foundation. For viscose and silk-like fibres, avoid water and use a professional cleaner.' },
      { h2: 'How to Care for a Hand Tufted Rug', body: 'Hand-tufted rugs are glued or backed, so avoid over-wetting and do not steam-clean or machine-wash them unless the maker says it is safe. Light shedding of loose fibres is normal on new wool rugs and usually settles with regular vacuuming. Use a rug pad, keep furniture legs on protective cups to avoid crushing, and shift furniture occasionally so the pile recovers.' },
      { h2: 'How to Vacuum a Shag Rug', body: 'Shag and other high-pile rugs trap dust and crumbs deep in the pile. Use a vacuum with adjustable height and switch off the beater bar, since it can catch and pull long yarn. Work slowly with suction only, or use a hose attachment. Shake out small rugs outdoors if the maker allows it, and rake the pile gently with a wide-toothed comb or soft brush to lift flattened areas.' },
      { h2: 'How Often to Clean Hotel and Commercial Carpet', body: 'There is no single schedule. Frequency depends on traffic, soiling and the manufacturer\'s guidance. As a general approach, high-traffic areas such as lobbies and corridors are vacuumed daily, with spots treated promptly, while periodic deep cleaning is scheduled by the facilities team or a specialist contractor according to traffic and appearance. Keep the care instructions and approved cleaning methods from the supplier, and stay consistent so the warranty and appearance are not compromised.' },
      { h2: 'When to Call a Professional', body: 'Use a professional rug cleaner for hand-knotted rugs, silk-like fibres, antiques, large stains, pet damage or mould, and for any rug where the dye might run. Ask the cleaner which method they use and whether they have experience with the construction and fibre of your rug.' },
    ],
    takeaways: [
      'Identify the construction and fibre first; care methods differ between wool, viscose, jute and sisal.',
      'Vacuum regularly, avoid beater bars on delicate or high-pile rugs, and rotate the rug.',
      'Blot spills, do not rub, and avoid soaking; test any cleaner on a hidden corner.',
      'Commercial cleaning schedules depend on traffic and manufacturer guidance; use professionals for delicate pieces.',
    ],
    faqs: [
      { q: 'How do I maintain a handmade rug?', a: 'Vacuum regularly with suitable settings, rotate it, keep it out of prolonged direct sun, blot spills promptly and use a rug pad. Follow the care instructions for the specific fibre and construction.' },
      { q: 'How do I care for a hand-tufted rug?', a: 'Vacuum gently, avoid over-wetting and steam-cleaning, use a rug pad and furniture cups, and accept some initial shedding on new wool rugs. Check the maker\'s guidance before any deep cleaning.' },
      { q: 'How should I vacuum a shag rug?', a: 'Use suction only with the beater bar switched off, work slowly, and gently rake the pile to lift flattened areas.' },
      { q: 'How often should hotel carpet be cleaned?', a: 'It depends on traffic and the manufacturer\'s guidance. High-traffic areas are typically vacuumed daily and spot-treated promptly, with deeper cleaning scheduled according to traffic and appearance.' },
      { q: 'Can I wash a viscose rug?', a: 'Viscose and similar silk-like fibres are sensitive to moisture, so avoid soaking and use a professional cleaner familiar with the fibre.' },
    ],
    relatedGuides: ['wool-vs-viscose-carpets', 'hand-tufted-vs-hand-knotted-carpet', 'carpet-manufacturing-process-explained'],
    relatedProducts: ['hand-tufted-carpet', 'shaggy-rugs', 'hand-knotted-carpet'],
  },

  // ─────────────────────────────────── 6. RUG SIZE GUIDE
  {
    slug: 'rug-size-guide', category: 'buying',
    title: 'Rug Size Guide', heroImage: '/images/rug3.webp',
    seoTitle: 'Rug Size Guide | How to Choose the Right Rug Size',
    seoDescription: 'How to choose rug size for living rooms, bedrooms and dining rooms: placement rules, standard sizes, runners and when to order a custom size.',
    seoKeywords: ['how to choose rug size', 'what size rug for living room', 'rug size for bedroom', 'standard rug sizes'],
    h1: 'Rug Size Guide: How to Choose the Right Rug Size',
    intro: 'A rug that is too small makes a room look unsettled; the right size anchors the furniture and defines the space. This guide gives practical placement rules by room, common standard sizes and guidance on when a custom size is worth ordering. The measurements are general design guidelines rather than fixed rules, so adjust to your room and furniture.',
    sections: [
      { h2: 'Start by Measuring', body: 'Measure the room and the furniture group the rug will sit under. Mark the planned rug outline on the floor with painter\'s tape and live with it for a day. Allow for doors that must clear the rug, and leave a visible margin of floor around the edge in most rooms.' },
      { h2: 'What Size Rug for a Living Room', body: 'The common approaches are all-legs-on, front-legs-on and none-on. In an all-legs-on layout the rug is large enough for every piece of seating to sit fully on it, which looks generous and unified. In a front-legs-on layout the front legs of sofas and chairs rest on the rug, which works well in medium rooms. Avoid a rug that floats in the middle with all furniture off it unless the room is small and the rug is intended as a feature. A frequent range of margin is roughly 20 to 50 cm of bare floor around the rug, adjusted to the room.' },
      { h2: 'Rug Size for a Bedroom', body: 'Under a bed, the rug usually extends beyond the sides and foot of the bed so that your feet land on it when you stand up. A common layout places the rug under the lower two thirds of the bed, extending well to both sides. Alternatively use two runners along the sides of the bed or a single rug sized to the bed and bedside tables. Bed size drives the choice, so measure the bed plus the walking space you want covered.' },
      { h2: 'Rug Size for a Dining Room', body: 'The rug should be large enough that chairs stay on it even when pulled out. Measure the table and add at least about 60 cm on every side for chair movement. Round tables suit round or square rugs; rectangular tables suit rectangular rugs. A low, flat pile is easier for chairs to slide across.' },
      { h2: 'Hallways, Stairs and Runners', body: 'Runners fit hallways, corridors and stairs. Leave a margin of floor on each side and choose a length that nearly fills the hallway, leaving a small gap at each end. For stairs, the width is set by the treads and the fixing method, so confirm measurements before ordering.' },
      { h2: 'Standard Rug Sizes and Custom Sizes', body: 'Common rug sizes vary by market: metric sizes such as 160 x 230 cm and 200 x 300 cm are widely used, and imperial sizes such as 5 x 8 ft, 8 x 10 ft and 9 x 12 ft are common in North America. Because sizes vary between countries and collections, confirm the exact dimensions before buying. TAPIS GLOBAL INTERNATIONAL manufactures to standard dimensions and to fully custom sizes and shapes, including round, runner and oversized rugs, with samples approved before bulk production.' },
      { h2: 'Size, Pile and Shape Together', body: 'High-pile and shaggy rugs make a room feel softer and often need slightly more clearance for doors. Round rugs soften rectangular rooms; irregular shapes suit feature areas. Match shape to the furniture arrangement as well as the room outline.' },
    ],
    takeaways: [
      'Measure the room and furniture, and test the outline with tape before ordering.',
      'In living rooms, at least the front legs of seating should sit on the rug.',
      'Bedroom rugs should extend beyond the bed so feet land on them; dining rugs need room for pulled-out chairs.',
      'Confirm exact dimensions, because standard sizes differ between markets; order custom when no standard size fits.',
    ],
    faqs: [
      { q: 'How do I choose rug size?', a: 'Measure the room and the furniture group, test the outline with tape, and choose a rug that anchors the furniture. In most rooms at least the front legs of seating should sit on the rug.' },
      { q: 'What size rug should I use in a living room?', a: 'A rug large enough for at least the front legs of the sofa and chairs to sit on it, with a visible border of floor, is a common guide. Larger rooms often suit an all-legs-on layout.' },
      { q: 'What size rug goes under a bed?', a: 'Choose a rug that extends beyond the sides and foot of the bed so your feet land on it when you step out; the bed size and the space you want covered decide the dimensions.' },
      { q: 'How big should a dining room rug be?', a: 'Large enough that chairs stay on the rug when pulled out. Add roughly 60 cm or more around the table on every side.' },
      { q: 'Can I get a rug in a custom size?', a: 'Yes. TAPIS GLOBAL INTERNATIONAL makes custom sizes and shapes, including round, runner and oversized rugs, with samples approved before bulk production.' },
    ],
    relatedGuides: ['area-rugs-vs-wall-to-wall-carpets', 'how-to-choose-a-carpet-manufacturer', 'carpet-pile-types-explained'],
    relatedProducts: ['area-rugs', 'hand-tufted-carpet', 'shaggy-rugs'],
  },

  // ─────────────────────────────────── 7. DENSITY / GSM / BACKING
  {
    slug: 'carpet-density-gsm-backing-explained', category: 'manufacturing',
    title: 'Carpet Density, GSM and Backing Explained', heroImage: '/images/tufting-carpet.webp',
    seoTitle: 'Carpet GSM Guide | Density, Weight & Backing Explained',
    seoDescription: 'Carpet GSM guide: what pile weight, density and backing mean, how they affect durability, and what to ask a manufacturer to confirm for your specification.',
    seoKeywords: ['carpet GSM guide', 'carpet density explained', 'carpet backing types'],
    h1: 'Carpet GSM Guide: Density, Weight and Backing Explained',
    intro: 'Carpet specifications often quote weight, density or backing, yet buyers rarely get a clear explanation of what each term means or how it affects performance. This guide explains pile weight (often quoted as GSM), density and backing in plain terms, and lists what to ask a manufacturer to confirm. It gives no universal pass or fail numbers, because suitable values depend on construction, fibre and use.',
    sections: [
      { h2: 'What GSM Means', body: 'GSM stands for grams per square metre. Applied to carpet, it normally describes the weight of the pile yarn per square metre, although some suppliers quote total carpet weight including backing. Because the same word can describe different things, always ask which weight is being quoted: pile weight, or total weight with backing.' },
      { h2: 'Density: How Tightly the Pile Is Packed', body: 'Density describes how closely the tufts or knots are placed. A dense pile resists crushing and holds its appearance better under traffic, while a loose pile can flatten and show the backing sooner. Density depends on the number of stitches or knots per unit of length, the yarn count, and the pile height. Two carpets with the same pile weight can feel different if one has a short, dense pile and the other a taller, looser one.' },
      { h2: 'How Weight, Density and Pile Height Interact', body: 'Pile weight, density and pile height are linked. A higher weight at the same height usually means a denser pile. A taller pile at the same weight is usually less dense. Because they interact, compare carpets on all three together, along with the fibre and the construction, rather than on a single number.' },
      { h2: 'Types of Carpet Backing', body: 'The backing holds the pile in place and gives the carpet stability. In tufted carpet a primary backing carries the yarn and a secondary backing is bonded on to lock it in. The wall-to-wall carpets page lists action-bac, bitumen and cushion backing options, and the carpet tiles page lists bitumen, PVC and cushion backings. Cushion backing adds underfoot comfort; bitumen and PVC backings give tiles dimensional stability; the right choice depends on the use, the subfloor and whether the carpet will be fixed or loose-laid.' },
      { h2: 'Why Backing Matters for Installation and Life Span', body: 'A stable backing keeps carpet flat, supports seams and helps resist stretching or curling. For commercial areas, backing should be matched to traffic, the installation method and any moisture or heat from the subfloor. Ask the manufacturer how the backing is bonded and what it recommends for your area.' },
      { h2: 'What to Ask a Manufacturer to Confirm', body: 'For each product ask which fibre is used, whether the quoted weight is pile or total, the pile height and density, the construction, the backing type, the widths or tile sizes available, and the performance information supported by test reports. For hand-tufted and hand-knotted products, also ask about knots or stitches per area where applicable. Record the agreed values in the order so they can be checked on inspection.' },
      { h2: 'Using the Numbers Sensibly', body: 'Numbers help compare like with like, but they do not replace a sample. Judge a carpet on a sample of the exact construction, in the intended space, alongside the specification. Be wary of comparing quotations that list different measurements or leave out backing details.' },
    ],
    takeaways: [
      'GSM can describe pile weight or total weight; always ask which one is quoted.',
      'Density, pile height and weight are linked, so compare them together with fibre and construction.',
      'Backing affects stability, comfort and installation; choose it for the use and subfloor.',
      'Record agreed values in the order and verify them against an approved sample.',
    ],
    faqs: [
      { q: 'What does GSM mean for carpet?', a: 'GSM is grams per square metre. For carpet it usually describes pile yarn weight per square metre, though some suppliers quote total weight with backing, so confirm which is meant.' },
      { q: 'Is a higher GSM carpet always better?', a: 'Not always. Weight is one factor; density, pile height, fibre, construction and backing also decide performance and suitability for the use.' },
      { q: 'What is carpet density?', a: 'Density is how closely the tufts or knots are packed. Dense pile resists crushing and keeps its appearance better under traffic.' },
      { q: 'What backing options are available for contract carpet?', a: 'TAPIS GLOBAL INTERNATIONAL lists action-bac, bitumen and cushion backing for wall-to-wall carpet, and bitumen, PVC and cushion backing for carpet tiles. The right choice depends on the use and the subfloor.' },
      { q: 'What should I ask a manufacturer about weight and backing?', a: 'Ask whether the weight quoted is pile or total, the pile height and density, the construction and backing type, and which test reports support any performance claims.' },
    ],
    relatedGuides: ['carpet-manufacturing-process-explained', 'wool-vs-viscose-carpets', 'carpet-pile-types-explained'],
    relatedProducts: ['wall-to-wall-carpets', 'carpet-tiles', 'hand-tufted-carpet'],
  },

  // ─────────────────────────────────── 8. PILE TYPES
  {
    slug: 'carpet-pile-types-explained', category: 'comparison',
    title: 'Carpet Pile Types Explained', heroImage: '/images/handtufted-img-2.webp',
    seoTitle: 'Cut Pile vs Loop Pile Carpet | Carpet Pile Types Explained',
    seoDescription: 'Cut pile vs loop pile carpet explained: saxony, cut-and-loop, carved and shag pile, how each looks and wears, and how to choose pile for homes and projects.',
    seoKeywords: ['cut pile vs loop pile', 'types of carpet pile', 'what is carved pile carpet'],
    h1: 'Cut Pile vs Loop Pile: Carpet Pile Types Explained',
    intro: 'Pile is the visible surface of a carpet or rug, and its type shapes appearance, comfort and how it wears. This guide explains cut pile, loop pile, cut-and-loop, carved and shag pile, what each is best suited to, and how to choose between them for homes, hotels and offices.',
    sections: [
      { h2: 'What Is Pile?', body: 'Pile is the layer of yarn that stands up from the backing. Its look and feel depend on whether the yarn loops are cut or left intact, how tall the pile is, how densely it is packed, and the fibre used. Pile type is a design decision as much as a performance one.' },
      { h2: 'Cut Pile', body: 'In cut pile the yarn loops are cut so the tips of the yarn stand upright. The surface is soft and plush and shows footprints and vacuum marks more easily. Variants include velvet or plush, which is smooth and dense, and saxony, a longer, twisted cut pile with a textured finish. Cut pile suits bedrooms, living rooms and formal areas where softness is a priority.' },
      { h2: 'Loop Pile', body: 'In loop pile the yarn forms uncut loops. The surface is firm, textured and generally resistant to showing traffic marks, which is why loop constructions are common in offices and high-traffic areas. Level loop has loops of equal height; multi-level loop varies the height for a patterned, textured look. Loops can snag on sharp objects, so avoid them where pets with claws or heavy furniture dragging are a concern.' },
      { h2: 'Cut-and-Loop Pile', body: 'Cut-and-loop combines cut and looped yarn in the same carpet to create texture and pattern, often sculpted into geometric or tonal designs. It offers softness and a more forgiving surface than plain cut pile. Hand-tufted constructions are well suited to it because cut and loop heights can be set deliberately.' },
      { h2: 'Carved and Sculpted Pile', body: 'Carved pile is shaped by hand or by carving after tufting, creating raised and recessed outlines for borders, motifs and medallions. It is a signature of hand-tufted rugs and is used for design-led pieces where tactile relief matters. The detail needs regular gentle vacuuming to keep edges crisp.' },
      { h2: 'Shag and High Pile', body: 'Shag has a long, loose pile that feels deep and soft. It suits low-traffic living spaces and bedrooms and needs careful vacuuming without a beater bar. Long pile traps dust more readily and may flatten in high-traffic zones.' },
      { h2: 'How to Choose Pile for Your Space', body: 'Match pile to use. Choose loop or a dense low cut pile for corridors and offices; choose cut or cut-and-loop for bedrooms and lounges; reserve shag and carved pieces for lower-traffic or feature areas. Consider fibre as well, since wool and nylon behave differently in the same pile type. Ask for a sample of the exact construction and look at it in the room\'s light.' },
    ],
    takeaways: [
      'Cut pile is soft and plush; loop pile is firm and good at hiding traffic marks.',
      'Cut-and-loop and carved piles add texture and pattern, and suit hand-tufted construction.',
      'Shag feels deep and soft but suits lower-traffic areas and needs gentle vacuuming.',
      'Choose pile by use, fibre and a sample viewed in the real space.',
    ],
    faqs: [
      { q: 'What is the difference between cut pile and loop pile?', a: 'In cut pile the yarn loops are cut so the yarn tips stand up, giving a soft, plush surface. In loop pile the loops stay uncut, giving a firmer, more textured surface that shows traffic marks less.' },
      { q: 'Which is better for high traffic, cut or loop pile?', a: 'Loop pile and dense low cut piles are commonly chosen for high-traffic areas, but fibre, density and backing also matter.' },
      { q: 'What is carved pile?', a: 'Carved or sculpted pile is shaped to create raised and recessed outlines, borders and motifs, commonly seen on hand-tufted rugs.' },
      { q: 'What is cut-and-loop pile?', a: 'It combines cut and looped yarn in one carpet to create texture and pattern, balancing softness and a more forgiving surface.' },
      { q: 'How do I vacuum a high pile or shag rug?', a: 'Use suction without a beater bar, work slowly, and lift the pile gently with a soft brush or wide-toothed comb.' },
    ],
    relatedGuides: ['hand-tufted-carpet-manufacturing-process', 'wool-vs-viscose-carpets', 'carpet-density-gsm-backing-explained'],
    relatedProducts: ['hand-tufted-carpet', 'shaggy-rugs', 'wall-to-wall-carpets'],
  },

  // ─────────────────────────────────── 9. CARPET VS RUG VS FLOOR COVERING
  {
    slug: 'carpet-vs-rug-vs-floor-covering', category: 'comparison',
    title: 'Carpet vs Rug vs Floor Covering', heroImage: '/images/collection-broadloom-lounge.webp',
    seoTitle: 'Carpet vs Rug: What\'s the Difference? Floor Covering Guide',
    seoDescription: 'Carpet vs rug: the difference between wall-to-wall carpet, area rugs, runners and mats, plus other floor coverings, and how to choose for each space.',
    seoKeywords: ['carpet vs rug difference', 'what is floor covering', 'difference between carpet and rug'],
    h1: 'Carpet vs Rug: The Difference and How to Choose Floor Coverings',
    intro: 'People use the words carpet, rug, mat and floor covering interchangeably, but they describe different things. This guide explains the difference between carpet and rug, where each fits, and how both sit within the wider category of floor coverings.',
    sections: [
      { h2: 'What Is a Floor Covering?', body: 'Floor covering is the general term for any finish laid over a structural floor: carpet, rugs, mats, vinyl, laminate, tiles and similar products. Soft floor coverings, such as carpet and rugs, add warmth, sound absorption and comfort. Hard floor coverings add durability and easy cleaning.' },
      { h2: 'What Is Carpet?', body: 'Carpet usually means a textile floor covering installed to cover a whole floor or room, often called wall-to-wall carpet. It is supplied as broadloom rolls or carpet tiles, fixed in place, and cut to the room. Carpet is chosen for continuous coverage, acoustic comfort and a uniform look, especially in hotels, offices and bedrooms.' },
      { h2: 'What Is a Rug?', body: 'A rug is a loose, finished piece of floor covering that covers part of a floor and can be moved. It has defined edges, finished with binding, fringes or serging, and comes in standard, custom and special shapes such as round or runner. Rugs define zones, add colour and design, and can be changed without refitting the floor.' },
      { h2: 'Carpet vs Rug: Key Differences', body: 'Coverage: carpet covers the whole floor; a rug covers part of it. Installation: carpet is fitted, often with underlay and fixings; rugs are loose-laid. Mobility: rugs can be moved, cleaned elsewhere or replaced; carpet is semi-permanent. Edges: rugs have finished edges; carpet is cut to fit. Use: rugs suit zoning and decoration; carpet suits whole-room comfort and consistency. A rug can be made from the same construction as carpet, so the difference is mainly size, finishing and installation.' },
      { h2: 'Mats, Runners and Other Pieces', body: 'Mats are small floor coverings, usually for entrances or functional spots. Runners are long, narrow rugs for corridors, hallways and stairs. Poufs and floor cushions are related soft furnishings rather than floor coverings. Each has its own role, and all can be made from natural fibres such as jute and sisal as well as wool and viscose.' },
      { h2: 'Choosing Between Carpet and Rugs', body: 'Choose carpet where continuous coverage, noise reduction and a uniform look matter, as in hotels and offices. Choose rugs where you want flexibility, zoning, easy replacement or a design statement, or where the floor itself is attractive. Many spaces use both: carpet in bedrooms and corridors, rugs in living areas. Our guide on area rugs vs wall-to-wall carpets goes into the comparison in more detail.' },
      { h2: 'Hand-Made, Machine-Made and Fibre Choices', body: 'Both carpet and rugs can be hand-tufted, hand-knotted, woven or machine-made, and made from wool, nylon, viscose, jute, sisal and other fibres. The construction and fibre affect cost, lifespan and care more than the label of carpet or rug does.' },
    ],
    takeaways: [
      'Floor covering is the broad category; carpet and rugs are soft floor coverings.',
      'Carpet is fitted and covers the floor; a rug is loose, finished and covers part of it.',
      'The same constructions and fibres can be used for both.',
      'Choose carpet for continuous coverage; choose rugs for flexibility and design.',
    ],
    faqs: [
      { q: 'What is the difference between carpet and a rug?', a: 'Carpet is a textile floor covering fitted over a whole floor or room. A rug is a loose, finished piece that covers part of the floor and can be moved.' },
      { q: 'Is wall-to-wall carpet the same as broadloom?', a: 'Wall-to-wall carpet describes how a carpet is laid, covering the floor edge to edge. Broadloom describes carpet supplied in wide rolls. Broadloom is commonly used to create wall-to-wall carpet.' },
      { q: 'What is a floor covering?', a: 'Floor covering is any finish laid over a structural floor, including carpet, rugs, mats, vinyl, laminate and tiles.' },
      { q: 'Can a rug be made from carpet?', a: 'Yes. Rugs can be made with the same constructions and fibres as carpet, then finished with bound or fringed edges.' },
      { q: 'Should I choose a rug or carpet for a bedroom?', a: 'Both work. Carpet gives continuous coverage and quiet; a large rug gives flexibility and lets the floor show at the edges. The choice depends on use and style.' },
    ],
    relatedGuides: ['area-rugs-vs-wall-to-wall-carpets', 'handmade-vs-machine-made-carpets', 'rug-size-guide'],
    relatedProducts: ['area-rugs', 'wall-to-wall-carpets', 'carpet-tiles'],
  },

  // ─────────────────────────────────── 10. WOOL VS SYNTHETIC
  {
    slug: 'wool-vs-synthetic-carpet', category: 'comparison',
    title: 'Wool vs Synthetic Carpet', heroImage: '/images/vibrant-wool-dying.webp',
    seoTitle: 'Nylon vs Wool Carpet | Wool vs Synthetic Carpet Guide',
    seoDescription: 'Nylon vs wool carpet: how wool, nylon, polypropylene and polyester compare for durability, feel, stain behaviour, maintenance and where each fibre is used.',
    seoKeywords: ['nylon vs wool carpet', 'wool vs synthetic carpet', 'is wool carpet better than nylon'],
    h1: 'Nylon vs Wool Carpet: Wool vs Synthetic Carpet Compared',
    intro: 'Fibre is the biggest decision after construction. Wool is a natural fibre; nylon, polypropylene and polyester are synthetics. Each has strengths and trade-offs. This guide compares them in general terms and explains how blends combine their benefits. Individual products vary, so use it as a starting point and confirm specifications with the manufacturer.',
    sections: [
      { h2: 'Wool Carpet', body: 'Wool is a natural, renewable fibre known for resilience, natural crimp and a soft, warm feel. Its fibres tend to spring back after compression, hold dye well and are often chosen for premium residential, hospitality and designer interiors. Wool needs a little more care than some synthetics with spills and sunlight, and quality varies by origin and grade.' },
      { h2: 'Nylon Carpet', body: 'Nylon is a strong synthetic fibre widely used in commercial carpet because it resists abrasion and recovers well from traffic. It accepts solution dyeing, which builds colour into the fibre and supports colour retention. It is a common choice for corridors, offices and hotel public areas.' },
      { h2: 'Polypropylene and Polyester', body: 'Polypropylene is a lower-cost synthetic that is naturally resistant to moisture and many stains, often used in loop-pile commercial carpet and some rugs. Polyester offers soft, vibrant colour in many residential carpets and rugs; recycled-fibre versions are available. Both generally recover less well from heavy crushing than wool or nylon, so they suit lighter traffic or specific applications.' },
      { h2: 'Nylon vs Wool Carpet', body: 'Durability: nylon is very resistant to abrasion, and wool is resilient with good recovery, so both can suit demanding use when well constructed. Feel: wool is typically softer and warmer. Appearance: wool can give a rich, deep colour; solution-dyed nylon is strong on colour retention. Cost depends on grade and construction. Care: both respond to prompt blotting and regular vacuuming, and cleaning guidance depends on the product. Choose by use and budget, not by fibre alone.' },
      { h2: 'Wool-Nylon Blends', body: 'Blends combine wool\'s feel and appearance with nylon\'s strength. Wool-nylon blends are common in contract carpet, and the wall-to-wall carpets page lists solution-dyed nylon, wool-nylon, polypropylene and recycled fibre options for contract specifications. A blend can give a good balance of performance, look and cost for hotels and offices.' },
      { h2: 'Which Fibre for Which Space?', body: 'Hotel corridors and lobbies often use wool-nylon blends or nylon for traffic performance. Offices commonly use solution-dyed nylon or other synthetics, in broadloom or tiles. Bedrooms, lounges and designer interiors often use wool for its softness. Light-traffic or feature areas can use viscose or other decorative fibres, with appropriate care. Our wool vs viscose guide covers silk-like fibres.' },
      { h2: 'What to Confirm With the Manufacturer', body: 'Ask for the exact fibre composition, whether it is solution-dyed, the fibre origin and grade where relevant, any treatments applied, and test documentation for performance claims. A sample of the real construction is better evidence than a fibre name.' },
    ],
    takeaways: [
      'Wool is soft, resilient and premium; nylon is very durable and common in commercial carpet.',
      'Polypropylene and polyester suit lighter traffic or specific uses, including recycled options.',
      'Wool-nylon blends balance look, feel and performance for contract projects.',
      'Choose by use, budget and sample, and confirm composition in writing.',
    ],
    faqs: [
      { q: 'Is wool carpet better than nylon?', a: 'Neither is better in every case. Wool is softer and resilient with a rich look; nylon is very durable and well suited to heavy commercial traffic. Blends combine both.' },
      { q: 'What is the most durable carpet fibre?', a: 'Nylon is widely regarded as very abrasion-resistant, and wool recovers well from compression. Construction, density and backing also decide how a carpet performs.' },
      { q: 'What is a wool-nylon blend?', a: 'A blend of wool and nylon fibres that combines wool\'s feel and appearance with nylon\'s strength, common in contract carpet.' },
      { q: 'What is solution-dyed nylon?', a: 'Solution-dyed nylon has colour added to the fibre during production, rather than dyeing the finished yarn, which supports colour retention.' },
      { q: 'Which fibres can TAPIS GLOBAL INTERNATIONAL supply for wall-to-wall carpet?', a: 'The wall-to-wall carpets page lists solution-dyed nylon, wool-nylon blends, polypropylene and recycled fibre options.' },
    ],
    relatedGuides: ['wool-vs-viscose-carpets', 'carpet-manufacturing-process-explained', 'hotel-carpet-buying-guide'],
    relatedProducts: ['wall-to-wall-carpets', 'hand-tufted-carpet', 'carpet-tiles'],
  },

  // ─────────────────────────────────── 11. PRIVATE LABEL RUGS FROM INDIA
  {
    slug: 'private-label-rugs-from-india', category: 'export',
    title: 'Private Label Rugs from India', heroImage: '/images/tgi-banner-6.webp',
    seoTitle: 'Private Label Rug Sourcing from India | Buyer\'s Guide',
    seoDescription: 'How to source private label rugs from India: planning a range, design, samples, packaging, minimums, quality control and confidentiality for brands and retailers.',
    seoKeywords: ['private label rug sourcing', 'private label rugs from India'],
    h1: 'Private Label Rug Sourcing from India: A Buyer\'s Guide',
    intro: 'Retailers, e-commerce brands and designers often source rugs under their own label from India. Done well, private label gives control over design and margin; done poorly, it creates quality and inventory risk. This guide sets out how the sourcing process typically works, what to define up front and what to check before bulk production.',
    sections: [
      { h2: 'What Private Label Means', body: 'In private label sourcing, a manufacturer produces rugs to your designs or selected from a development range, finished with your branding, labelling and packaging. The goods are sold under your name. The terms OEM and white label are used in similar ways, though contracts differ, so define what you mean in writing.' },
      { h2: 'Why Source From India', body: 'India has deep hand-made rug expertise, and Bhadohi in Uttar Pradesh is a major carpet cluster. Hand-tufted, hand-knotted, flatweave and natural-fibre constructions can be made in custom designs, colours and sizes. For brands, this means design flexibility and a range of price and quality tiers.' },
      { h2: 'Plan the Range First', body: 'Decide the constructions, fibres, sizes, colour palette and price positioning before approaching manufacturers. A focused core range is easier to launch and reorder than a wide, shallow one. Prepare reference images, mood boards or artwork and note the markets and channels you will sell into.' },
      { h2: 'Design, Samples and Approvals', body: 'Share artwork or references and expect the manufacturer to develop colour lab-dips and a sample for approval. Approve construction, pile, size, colour and finishing before bulk. Keep the approved sample as the reference for production and inspection. Allow time for iteration; rushing approvals is a common source of problems.' },
      { h2: 'Branding, Labels and Packaging', body: 'Specify labels, hangtags, care instructions and packaging early, including any legal labelling your destination market requires. Check country-specific labelling and product regulations with your own advisers or official sources, because requirements differ between markets.' },
      { h2: 'Minimums, Lead Times and Reorders', body: 'Minimum quantities and lead times depend on construction, size and design. Ask for them in writing per product. For reorders, confirm that dye-lots and specifications can be held so later batches match the first. Plan inventory against lead times, so you are not caught short in peak season.' },
      { h2: 'Confidentiality and Quality Control', body: 'Protect your designs with a confidentiality agreement before sharing artwork. Agree inspection points, tolerances and what happens if goods do not match the approved sample. Consider a pre-shipment inspection for first orders.' },
      { h2: 'OEM and Private Label at TAPIS GLOBAL INTERNATIONAL', body: 'TAPIS GLOBAL INTERNATIONAL manufactures under retailers\' and brands\' own labels with custom branding, packaging and confidentiality, producing to your designs with lab-dips and samples approved before bulk. See the OEM and private label page for details, and the guide to importing carpets from India for shipment planning.' },
    ],
    takeaways: [
      'Define the range, constructions, sizes and positioning before approaching manufacturers.',
      'Approve lab-dips and samples before bulk, and keep the approved sample as the reference.',
      'Specify labels and packaging early and check destination-market labelling rules from official sources.',
      'Use a confidentiality agreement and clear quality terms; confirm reorder consistency.',
    ],
    faqs: [
      { q: 'What is private label rug sourcing?', a: 'It is sourcing rugs made by a manufacturer to your designs or from a development range, finished with your own labels and packaging and sold under your brand.' },
      { q: 'How do I start sourcing private label rugs from India?', a: 'Define your range, constructions, sizes and positioning, prepare design references, shortlist manufacturers, and approve lab-dips and samples before any bulk order.' },
      { q: 'Will my designs be kept confidential?', a: 'TAPIS GLOBAL INTERNATIONAL works under confidentiality agreements to protect designs and commercial relationships. Agree this before sharing artwork.' },
      { q: 'Can I reorder the same design later?', a: 'Reorders should be agreed in advance, including how dye-lots and specifications will be held so later batches match the approved sample.' },
      { q: 'Do I need to check labelling rules for my market?', a: 'Yes. Labelling and product rules differ by country, so confirm them with your advisers or the official authority in your destination market.' },
    ],
    relatedGuides: ['how-to-import-carpets-from-india', 'how-to-choose-a-carpet-manufacturer', 'why-buy-carpets-from-india'],
    relatedProducts: ['hand-tufted-carpet', 'shaggy-rugs', 'jute-sisal-rugs'],
  },
]
