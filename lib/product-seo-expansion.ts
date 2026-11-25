// Additional buyer-focused content for product pages: extra keyword coverage, FAQs
// and two buyer-guide paragraphs per category. It builds on the existing page
// content (it never replaces it) and uses only what the site already states about
// Tapis Global: a family carpet and rug manufacturer in Bhadohi, India, working in
// custom sizes and designs for wholesale, hospitality, project and export buyers.
// Merged into PRODUCT_CATEGORIES at the end of lib/products.ts.

export type ProductSeoExpansion = {
  keywords: string[]
  faqs: { q: string; a: string }[]
  paragraphs: string[]
}

export const PRODUCT_SEO_EXPANSION: Record<string, ProductSeoExpansion> = {
  'hand-tufted-carpet': {
    keywords: ['custom hand tufted rugs manufacturer', 'hand tufted carpets wholesale', 'hotel carpet manufacturer India', 'hand tufted wool carpet exporter', 'bespoke hand tufted carpets for architects', 'hand tufted rug manufacturer Bhadohi'],
    faqs: [
      { q: 'Who buys hand tufted carpets from a manufacturer in India?', a: 'Typical buyers are carpet importers, rug wholesalers, hotel and hospitality groups, architects, interior designers and flooring contractors who need custom designs, sizes and colours made to a written specification rather than chosen from stock.' },
      { q: 'Can hand tufted carpets be made to an architect\'s drawing or mood board?', a: 'Yes. Hand tufting is well suited to custom artwork. Share the drawing, mood board or Pantone references with your size and quantity and we will advise on the construction, pile style and sampling route.' },
      { q: 'Is hand tufting a good choice for large hotel and project orders?', a: 'Hand tufting delivers the look and density of handmade production with design freedom, which is why it is used for hotel rooms, corridors, offices and residences. Quantities, lead times and phasing are confirmed per project.' },
      { q: 'What is the difference between a hand tufted rug and a hand tufted carpet?', a: 'They are made the same way. A rug is usually a finished, bordered piece for a defined area, while a carpet is often made to fill a room or a run of rooms. Both can be produced in custom sizes.' },
    ],
    paragraphs: [
      'Wholesale and project buyers usually settle three things before ordering hand tufted carpets: the pile construction (cut, loop or cut-and-loop), the fibre (wool, New Zealand wool, viscose, bamboo silk or a wool blend) and the finished size. Agreeing these in writing, with an approved sample, is the surest way to get a delivered carpet that matches the design.',
      'For hotels, architects and interior designers, the same hand tufted design can often be adapted across rooms, corridors and public areas. Importers and wholesalers can also use hand tufting for repeat collections, with colourways and sizes agreed per order.',
    ],
  },
  'hand-knotted-carpet': {
    keywords: ['hand knotted rugs wholesale', 'custom hand knotted carpets manufacturer', 'hand knotted wool and silk rugs India', 'luxury hand knotted rugs exporter', 'hand knotted rug manufacturer Bhadohi', 'bespoke knotted carpets for designers'],
    faqs: [
      { q: 'What should an importer or wholesaler specify for hand knotted rugs?', a: 'State the knot density, fibre (wool, New Zealand wool, viscose, bamboo silk or blends), size, design reference and colour palette. A written specification and an approved sample keep the delivered rug consistent with the order.' },
      { q: 'Are hand knotted rugs suitable for hotels and architects\' projects?', a: 'Yes, for feature areas such as lobbies, suites and boardrooms where longevity and detail matter. For larger areas, hand knotted pieces can be combined with hand tufted carpet.' },
      { q: 'What drives the price of a hand knotted rug?', a: 'Every knot is tied by hand, so price follows knot density, size, fibre and design complexity. Finer knotting takes longer, which is why the specification should match how the rug will be used.' },
      { q: 'Can I commission a custom-design hand knotted rug?', a: 'Yes. Custom sizes and designs are part of the range. Share your artwork or reference and the room dimensions to discuss construction and sampling.' },
    ],
    paragraphs: [
      'Hand knotted rugs are bought for longevity and detail. Importers and wholesalers often build collections around a handful of knot densities and fibres, while designers and architects commission single pieces to a drawing.',
      'Because larger sizes and finer knot densities take longer to produce, project buyers should confirm the programme early and order feature rugs ahead of the fit-out schedule.',
    ],
  },
  'wall-to-wall-carpets': {
    keywords: ['wall to wall carpet manufacturer', 'broadloom carpet manufacturer India', 'Axminster carpet manufacturer India', 'hand tufted broadloom carpet', 'commercial broadloom carpet manufacturer', 'hospitality carpet manufacturer', 'hotel corridor carpet', 'roll width carpet supplier', 'contract carpet manufacturer India', 'commercial flooring carpet India'],
    faqs: [
      { q: 'What is broadloom carpet?', a: 'Broadloom carpet is carpet made in wide rolls that is cut and fitted to cover a floor from wall to wall. It is the standard format for hotels, offices and large residences.' },
      { q: 'Do you make Axminster carpet?', a: 'Yes. Our wall to wall range includes Axminster, tufted broadloom and carpet tile constructions. Axminster suits detailed, repeating, multi-colour patterns across corridors and public areas.' },
      { q: 'Which broadloom method should a hotel choose, hand-tufted or Axminster?', a: 'Choose hand-tufted broadloom for bespoke, project-specific designs and custom colours. Choose Axminster when a repeating pattern is needed across large areas. We can advise on the better fit for your drawings.' },
      { q: 'Is wall to wall carpet suitable for hospitality and commercial flooring?', a: 'Yes. It is widely used for hotel corridors, guest rooms, ballrooms, offices and other high-traffic commercial floors. Share the project area and specification for a recommendation.' },
      { q: 'What is the difference between broadloom and carpet tiles?', a: 'Broadloom is laid from rolls and gives a seamless finish. Carpet tiles are modular squares that are easy to replace section by section. Many projects use both in different areas.' },
    ],
    paragraphs: [
      'Wall to wall carpet is specified by area rather than by piece, so buyers should have the floor plan, pattern repeat, colourways and delivery phasing to hand before requesting a quotation. Hotels, architects and flooring contractors usually ask for samples of both construction methods before choosing.',
      'Hand-tufted broadloom and Axminster broadloom serve different briefs. Hand-tufted suits bespoke artwork and custom colours; Axminster suits detailed, repeating patterns. Both are made to your specification.',
    ],
  },
  'carpet-tiles': {
    keywords: ['carpet tiles manufacturer India', 'modular carpet tiles supplier', 'commercial carpet tiles for offices', 'carpet tiles wholesale', 'office carpet tiles manufacturer', 'custom carpet tiles India', 'modular flooring carpet'],
    faqs: [
      { q: 'What are carpet tiles used for?', a: 'Carpet tiles are modular squares used for offices, retail, institutions and other commercial interiors where individual tiles may need replacing.' },
      { q: 'Why choose carpet tiles over broadloom?', a: 'Tiles allow section-by-section replacement, flexible patterns and easier installation in occupied buildings. Broadloom gives a seamless finish. Many projects use both.' },
      { q: 'Can carpet tiles be made in custom colours and patterns?', a: 'Yes. Custom colours and patterns can be discussed per project. Share the design, area and colour references.' },
      { q: 'Can carpet tiles be supplied together with broadloom?', a: 'Yes. Matching broadloom and tiles can be discussed for projects that use both, such as an office with a seamless reception and modular workspaces.' },
    ],
    paragraphs: [
      'Carpet tiles are ordered by area and format, so buyers should confirm the quantity, tile size, pattern layout and colourways with an approved sample. Buyers may wish to order a small overage so replacement tiles from the same run are available later.',
      'For architects and office fit-out teams, carpet tiles combine modular installation with flexible patterns. Wholesalers and distributors can also discuss collections and colourways for resale.',
    ],
  },
  'shaggy-rugs': {
    keywords: ['shaggy rugs wholesale', 'custom shaggy rugs manufacturer', 'high pile shaggy rugs exporter', 'shag rug supplier for retailers', 'shaggy rugs for boutique hotels'],
    faqs: [
      { q: 'Do you supply shaggy rugs to wholesalers and retailers?', a: 'Yes. Shaggy rugs are available in custom sizes and colours for wholesale and retail buyers. Share your size range, pile height and quantities for a quotation.' },
      { q: 'How should buyers choose pile height for shaggy rugs?', a: 'Longer pile feels softer but is harder to clean and better for low-traffic rooms such as bedrooms. Shorter pile is more practical for living areas and hospitality suites.' },
    ],
    paragraphs: [
      'Retailers and wholesalers usually choose shaggy rugs by pile height, density and colour range, while hospitality buyers look for durable, easy-care constructions. Agreeing these with an approved sample avoids surprises on delivery.',
    ],
  },
  'jute-sisal-rugs': {
    keywords: ['jute rugs wholesale', 'natural fibre rugs manufacturer', 'sisal rugs supplier India', 'custom jute rugs for retailers', 'eco-friendly jute rugs exporter'],
    faqs: [
      { q: 'Are jute and sisal rugs available wholesale?', a: 'Yes. Jute and sisal rugs are available for wholesale, retail and project buyers in custom sizes. Share your quantities and size range for a quotation.' },
      { q: 'What is the main difference between jute and sisal rugs?', a: 'Jute is softer and warmer underfoot; sisal is tougher and better suited to stairs and heavier traffic. Our jute vs sisal guide explains the trade-offs.' },
    ],
    paragraphs: [
      'Natural fibre rugs suit buyers building collections around texture and sustainability. Importers and designers typically specify the fibre, weave, size and colour first, then confirm an approved sample.',
    ],
  },
  'leather-carpets': {
    keywords: ['leather rugs manufacturer', 'patchwork leather rugs wholesale', 'hair on hide rugs supplier', 'custom leather carpets for designers'],
    faqs: [
      { q: 'Can leather carpets be made in custom sizes and layouts?', a: 'Yes. Custom sizes, patchwork layouts and finishes can be discussed per project. Share your drawing, dimensions and quantity.' },
      { q: 'Who buys leather carpets?', a: 'Designers, retailers, hotels and executive offices that want a distinctive natural-material floor covering.' },
    ],
    paragraphs: [
      'Leather carpets are specified for character: hide type, colour, patchwork layout and finish. Designers and buyers should agree these with a sample, remembering that natural hide varies from piece to piece.',
    ],
  },
  'pebble-carpet': {
    keywords: ['pebble rugs wholesale', 'felted wool pebble rug manufacturer', 'stone rug supplier India', 'custom pebble carpets for spas'],
    faqs: [
      { q: 'Can pebble carpets be made in custom sizes and colours?', a: 'Yes. Pebble carpets can be discussed in custom sizes, shapes and colourways. Share your dimensions and colour references.' },
      { q: 'Where are pebble carpets used?', a: 'Typically in bedrooms, spas, bathrooms and feature areas where people walk barefoot and value texture.' },
    ],
    paragraphs: [
      'Pebble carpets are a feature product. Buyers usually decide pebble scale, wool type and colour blend, then confirm the choice against a sample before ordering.',
    ],
  },
  'flat-weaves': {
    keywords: ['flatweave rugs wholesale', 'flat weave rug manufacturer India', 'reversible rugs supplier', 'handwoven flatweave exporter'],
    faqs: [
      { q: 'What are flatweave rugs?', a: 'Flatweave rugs are pile-free woven rugs, usually reversible and lightweight, including kilims and dhurries.' },
      { q: 'Are flatweaves suitable for wholesale and private-label ranges?', a: 'Yes. Their light weight and wide design range make them popular for wholesale and retail collections. Quantities and terms are confirmed per enquiry.' },
    ],
    paragraphs: [
      'Importers and retailers often use flatweave rugs to broaden a range at a lower price point than pile rugs. Specify the weave, fibre, size and colour, and approve a sample before bulk production.',
    ],
  },
  'poufs': {
    keywords: ['poufs manufacturer India', 'leather poufs wholesale', 'custom floor cushions supplier', 'pouf ottoman exporter'],
    faqs: [
      { q: 'Can poufs be made to match a rug or carpet order?', a: 'Yes. Poufs can be colour-matched to a rug or carpet order, so hotels and designers can coordinate a scheme from one manufacturer.' },
      { q: 'Can poufs be supplied filled or as covers only?', a: 'Yes. We can supply fully filled poufs or unfilled covers. Share size, material, filled or cover-only preference and quantity for hotels, retail or private-label requirements.' },
    ],
    paragraphs: [
      'Poufs round out a rug or carpet scheme. Buyers usually decide cover material, size, filled or cover-only supply, and colour, then confirm with a sample.',
    ],
  },
  'coco-coir': {
    keywords: ['coir mats manufacturer', 'coco coir products wholesale', 'coir matting supplier India', 'custom logo coir mats'],
    faqs: [
      { q: 'Can coir mats be made with a custom logo?', a: 'Yes. We print logos and custom messages on coir mats and can produce branded entrance matting in custom sizes. Share your logo, size and quantity.' },
      { q: 'Are coir mats available in bulk?', a: 'Yes. Coir mats and coir products are available for hospitality, retail and institutional projects, including bulk container programmes. Quantities and terms are confirmed per enquiry.' },
    ],
    paragraphs: [
      'Coir entrance matting is chosen for scraping performance and backing. Buyers typically confirm the backing, size and whether a logo is needed before ordering.',
    ],
  },
  'kilim-rugs': {
    keywords: ['kilim rugs wholesale', 'kilim rug manufacturer India', 'handwoven kilim exporter', 'custom kilim rugs for retailers'],
    faqs: [
      { q: 'Do you make custom kilim designs?', a: 'Yes. Custom designs, sizes and colourways can be discussed per project. Share a reference or palette.' },
      { q: 'Are kilims available for wholesale and export?', a: 'Yes. Kilim rugs are available for wholesale and export buyers. Quantities and terms are confirmed per enquiry.' },
    ],
    paragraphs: [
      'Importers and retailers value kilims for their design range and reversible construction. Confirm fibre, dye type, size and colourway, and approve a sample before ordering.',
    ],
  },
  'dhurrie-rugs': {
    keywords: ['dhurrie rugs wholesale', 'cotton dhurrie manufacturer India', 'dhurrie exporter', 'private label dhurrie rugs'],
    faqs: [
      { q: 'Can dhurries be made for retail and private-label ranges?', a: 'Yes. Dhurries are available in custom sizes and colourways, including private-label retail collections. Quantities and terms are confirmed per enquiry. For institutional floor matting, see our Tat Patti range.' },
      { q: 'What is the difference between a dhurrie and a kilim?', a: 'Both are flatweaves. Our kilim vs dhurrie guide explains the differences in origin, weave and look.' },
    ],
    paragraphs: [
      'Dhurrie buyers usually focus on pattern, fibre, size and colourway. Agree these in writing and confirm them with an approved sample before bulk production.',
    ],
  },
  'area-rugs': {
    keywords: ['area rugs wholesale', 'custom area rugs manufacturer India', 'large area rugs exporter', 'area rugs for hotels and designers'],
    faqs: [
      { q: 'Can area rugs be made in any size or shape?', a: 'Yes. Custom sizes and shapes, including round and oversized, can be discussed per project.' },
      { q: 'Which construction is best for an area rug?', a: 'It depends on use and budget. See our hand tufted, hand knotted, flatweave and shaggy pages for the trade-offs.' },
      { q: 'Can I order a stair runner or hallway runner?', a: 'Runners can be made as part of custom size and shape orders. For a hallway, give the length and width and leave a margin of floor on each side; for stairs, confirm the tread width and how the runner will be fixed before ordering. Our rug size guide has placement advice.' },
      { q: 'Do I need a rug pad under an area rug?', a: 'A pad is generally recommended on hard floors to reduce slipping and wear, and on carpeted floors to keep the rug from creeping. Choose a pad suited to your floor type and ask your installer or the pad maker for compatibility. See our carpet and rug care guide for maintenance advice.' },
    ],
    paragraphs: [
      'The two decisions that shape an area rug order are size and construction. Wholesalers and designers should confirm both with a sample and, for large rugs, a colour approval.',
    ],
  },
  'tat-patti': {
    keywords: ['tat patti manufacturer', 'tat patti for schools supplier', 'tat patti wholesale', 'institutional floor mats India'],
    faqs: [
      { q: 'Can tat patti be supplied for tenders?', a: 'We accept institutional and bulk enquiries for schools, anganwadis, hostels and similar buyers, and tender documentation and samples are available. Share the specification, quantity and delivery programme so the construction and schedule can be confirmed.' },
      { q: 'What materials is tat patti available in?', a: 'Cotton, jute and cotton-jute blend options are available. Fibre, widths, lengths and dyes are confirmed against the buyer specification.' },
    ],
    paragraphs: [
      'Tat patti is bought on specification and delivery date. State the fibre, format (rolls or cut sizes), dimensions and quantity, and ask for a sample against the written specification.',
    ],
  },
}
