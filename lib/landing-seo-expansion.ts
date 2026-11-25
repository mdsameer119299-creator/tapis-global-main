import type { SeoLanding } from './seo-landing'

// Additive SEO content for solution and industry landing pages: extra keywords,
// buyer FAQs (rendered by the existing FAQ component; no new sections). Uses only what the site already says about
// Tapis Global (a family carpet and rug manufacturer in Bhadohi, India serving
// wholesale, hospitality, contract and export buyers). Merged by lib/solutions-seo.ts
// and lib/industries.ts; existing content is never replaced.

type Extra = { keywords: string[]; faqs: { q: string; a: string }[] }

export const LANDING_SEO_EXPANSION: Record<string, Extra> = {
  'commercial-carpet-manufacturer': {
    keywords: ['commercial flooring carpet manufacturer', 'carpet manufacturer for offices and hotels', 'broadloom and carpet tiles manufacturer India', 'contract flooring supplier India'],
    faqs: [
      { q: 'Which commercial carpet products can you manufacture?', a: 'Wall to wall broadloom (hand-tufted and Axminster), carpet tiles and hand-tufted carpets for offices, hotels, retail and institutions. See our wall to wall and carpet tile pages for details.' },
      { q: 'What should a flooring contractor send to get a commercial carpet quotation?', a: 'The floor plan or total area, product type (broadloom or tiles), pattern and colour references, delivery phasing and destination.' },
      { q: 'What information speeds up a commercial carpet quotation?', a: 'Flooring contractors, architects and procurement teams get faster, more accurate quotations when the enquiry includes the area by zone, product type, pattern and colour references, target dates and destination. Samples are agreed before bulk production.' },
    ],
  },
  'wholesale-carpet-supplier': {
    keywords: ['wholesale carpets and rugs India', 'bulk rug manufacturer for importers', 'carpet wholesaler India', 'rug importer sourcing India'],
    faqs: [
      { q: 'What should an importer or rug wholesaler send to start a wholesale enquiry?', a: 'Product categories, target sizes, material preference, estimated quantities per design, destination country and any private-label requirements. Terms are confirmed per enquiry.' },
      { q: 'Can wholesale buyers combine several product categories in one order?', a: 'Yes. Hand tufted, hand knotted, flatweave and natural-fibre rugs can be combined in one programme. Share the mix and quantities for a quotation.' },
      { q: 'How do importers and wholesalers usually build a range from Bhadohi?', a: 'A practical approach is to start with a core range across two or three constructions and widen it as the range proves itself. Sizes, colourways and designs can be adapted per order.' },
    ],
  },
  'carpet-exporter-india': {
    keywords: ['carpet exporter Bhadohi', 'rug export from India', 'Indian carpet manufacturer exporter', 'export carpets to USA UK Europe', 'wool carpet exporter India', 'wool rug exporter India'],
    faqs: [
      { q: 'Which markets do you export carpets and rugs to?', a: 'Tapis Global supplies buyers in North America, the UK, Europe, the Gulf and Asia-Pacific. See our export-by-country pages for market notes.' },
      { q: 'Do you export wool carpets and rugs?', a: 'Yes. Wool is the core fibre of the hand-knotted and hand-tufted carpets and rugs we manufacture in Bhadohi for export. Buyers can specify Indian wool, a versatile natural wool that works across almost every construction, or New Zealand wool, prized for bright colour take-up and a soft, resilient hand-feel. Share the construction, size, wool type and destination country with your enquiry.' },
      { q: 'What documentation is needed to import carpets from India?', a: 'Requirements vary by destination. Share the destination country and incoterm preference and we will advise on the documents for your order.' },
      { q: 'How should an importer plan a carpet import from India?', a: 'A sensible order is to agree specification and sample first, then production schedule, packing and freight. Destination-specific documentation is discussed per order.' },
    ],
  },
  'contract-carpet-supplier': {
    keywords: ['contract carpet manufacturer India', 'hospitality contract carpets', 'tender carpet supplier India', 'project carpet manufacturer'],
    faqs: [
      { q: 'How should a contractor request a contract carpet quotation?', a: 'Send the specification, area, product type, pattern references and programme dates. Samples are agreed before production.' },
      { q: 'Do you supply hotels and architects for contract projects?', a: 'Yes. Hotels and architects can specify custom hand-tufted, Axminster and carpet tile programmes. Share the specification and programme dates.' },
    ],
  },
  'luxury-carpets': {
    keywords: ['luxury hand knotted carpets', 'luxury wool and silk carpets', 'bespoke luxury rugs manufacturer'],
    faqs: [{ q: 'Can luxury carpets be made to a bespoke design?', a: 'Yes. Custom sizes, designs and materials, including wool, New Zealand wool, viscose and bamboo silk, are available. Share your reference and dimensions.' }],
  },
  'designer-rugs': {
    keywords: ['designer rugs manufacturer', 'custom designer rugs for interior designers', 'bespoke rugs from India'],
    faqs: [{ q: 'Can interior designers commission rugs from a drawing or mood board?', a: 'Yes. Share the drawing or references with size and colours and we will advise on construction and sampling.' }],
  },
  'custom-carpets': {
    keywords: ['custom carpet manufacturer', 'custom size carpets and rugs', 'custom logo carpets'],
    faqs: [{ q: 'What do I need to start a custom carpet enquiry?', a: 'Design or reference, size, preferred material and construction, quantity and destination. Our team will advise on sampling.' }],
  },
  'modern-rugs': {
    keywords: ['modern rugs manufacturer', 'contemporary rugs wholesale', 'modern wool rugs India'],
    faqs: [{ q: 'Can contemporary designs be produced in custom colours?', a: 'Yes. Colourways and sizes can be agreed per order with a sample.' }],
  },
  'hotel-carpets': {
    keywords: ['hotel carpet manufacturer India', 'hospitality carpets for hotels', 'hotel corridor and guest room carpet', 'custom hotel carpets for architects'],
    faqs: [
      { q: 'What information do hotel designers and architects need to give for a carpet quotation?', a: 'Areas by zone (corridors, rooms, public areas), design references, colourways, construction preference (hand-tufted or Axminster broadloom) and delivery phasing.' },
      { q: 'Can the same design be produced for corridors, rooms and public areas?', a: 'Yes. A design can be adapted across zones. Share the layout and we will advise.' },
      { q: 'How are hotel carpets specified by zone?', a: 'Specifications can differ for corridors, guest rooms, ballrooms and lobbies. Agreeing the pattern repeat, colourways and delivery phasing with an approved sample keeps multi-area projects consistent.' },
    ],
  },
  'office-carpets': {
    keywords: ['office carpet manufacturer India', 'commercial office flooring carpet', 'carpet tiles for offices', 'corporate carpet supplier'],
    faqs: [
      { q: 'Should an office use broadloom or carpet tiles?', a: 'Tiles suit open-plan floors where sections may need replacing; broadloom gives a seamless finish for reception and executive areas. Both can be used in the same office.' },
      { q: 'Can offices have a logo or brand colours in the carpet?', a: 'Yes. Custom designs, logos and colours can be discussed per project.' },
      { q: 'Should office flooring use broadloom, carpet tiles or both?', a: 'Carpet tiles can be used in workspaces with broadloom or hand-tufted carpet in reception and boardrooms. Share the floor areas and brand references for a recommendation.' },
    ],
  },
}

export function applyLandingExpansion(list: SeoLanding[]): void {
  for (const p of list) {
    const x = LANDING_SEO_EXPANSION[p.slug]
    if (!x) continue
    p.seoKeywords = Array.from(new Set([...p.seoKeywords, ...x.keywords]))
    const have = new Set(p.faqs.map((f) => f.q))
    p.faqs = [...p.faqs, ...x.faqs.filter((f) => !have.has(f.q))]
  }
}
