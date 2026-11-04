import type { CountryDesignGuide } from './seo-landing'

export const COUNTRY_DESIGN_GUIDES: Record<string, CountryDesignGuide> = {
  uk: {
    intro: 'UK briefs often combine period architecture, contemporary additions and practical everyday use. These 2026 references are design context, not a fixed national style.',
    trends: [
      { title: 'Modern organic and tactile finishes', desc: 'Houzz UK 2026 research records rising interest in modern-organic interiors and tactile finishes. Wool texture, restrained pattern and natural tonal variation can soften stone, timber and plaster.' },
      { title: 'Dark, cocooning rooms', desc: 'The same report identifies interest in moody rooms, forest green and dark timber. Consider deep green, ink and tobacco grounds while checking the effect in low-light rooms.' },
      { title: 'Period character with contemporary function', desc: 'Interest in period-home references alongside modern upgrades creates opportunities for heritage motifs, softened borders and hand-knotted textures.' },
    ],
    architectConsiderations: [
      { title: 'Respect the building fabric', desc: 'Record thresholds, floor build-ups, skirtings, hearths and door clearances before fixing rug thickness or underlay.' },
      { title: 'Plan for contract requirements', desc: 'For hotels and public interiors, confirm applicable fire, slip, accessibility and indoor-air requirements with the project team; verify documentation for the exact construction.' },
      { title: 'Specify fibre and maintenance', desc: 'Choose pile, density, backing and cleaning regime against traffic and operator requirements.' },
      { title: 'Approve samples in context', desc: 'Review colour and texture in actual lighting alongside timber, stone, paint and upholstery; document the approved sample.' },
    ],
    palette: ['Chocolate & espresso', 'Forest & olive green', 'Terracotta & rust', 'Warm beige & limestone', 'Ink blue', 'Burgundy accents'],
    productFit: [
      { title: 'Period and townhouse interiors', desc: 'Hand-knotted wool rugs and custom runners sized around circulation and architectural details.' },
      { title: 'Boutique hotels', desc: 'Area rugs and contract carpet selected for traffic, housekeeping and acoustic expectations.' },
      { title: 'Trade and retail', desc: 'Coordinated wool and natural-fibre collections with repeatable colourways and sizes.' },
      { title: 'Workplace and multi-residential', desc: 'Durability-led carpet packages with documented maintenance and performance.' },
    ],
    sources: [
      { label: 'Houzz Research — 2026 UK Emerging Trends Report (June 3, 2026)', url: 'https://www.houzz.co.uk/magazine/2026-houzz-uk-emerging-trends-report-stsetivw-vs~185312726' },
      { label: 'FCI London — 2026 Interior Design Industry Survey', url: 'https://www.fcilondon.co.uk/reports/fci-london-renovation-reckoning-2026/' },
      { label: 'British Vogue — 2026 Interiors Trends', url: 'https://www.vogue.co.uk/article/interiors-trends-2026' },
    ],
  },
,
  germany: {
    intro: 'German residential and commercial briefs often emphasise function, material integrity, durability and clear detailing. The 2026 references below point to material honesty, circular thinking and warm tonal interiors; project specifications take precedence over trend language.',
    trends: [
      { title: 'Material honesty and visible craft', desc: 'The German Design Award 2026 trend radar highlights natural structures, visible making processes and separable material cycles. Legible weave, honest fibre character and well-resolved edges can support this direction.' },
      { title: 'Warm natural colours', desc: 'The German furniture-industry association’s 2026 outlook points to warm natural colours, tone-on-tone concepts and light woods. Consider sand, greige, clay and muted brown palettes.' },
      { title: 'Durable and responsible design', desc: 'Circular design features in German design reporting. For flooring, ask about service life, repairability, cleaning, fibre composition and independently verified environmental documentation.' },
    ],
    architectConsiderations: [
      { title: 'Define performance first', desc: 'Record traffic class, rolling loads, acoustic objectives, underfloor heating compatibility, cleaning method and expected service life.' },
      { title: 'Document material composition', desc: 'Record fibre content, backing, treatments, care instructions and verified emissions or environmental documentation where relevant.' },
      { title: 'Plan maintenance and replacement', desc: 'For offices and hotels, consider spare material, replacement zones, edge details and the maintenance plan.' },
      { title: 'Check applicable standards', desc: 'Identify the standards and evidence required for the building use and verify reports for the exact supplied construction.' },
    ],
    palette: ['Warm greige', 'Sand & limestone', 'Natural oak & wheat', 'Clay & terracotta', 'Moss & sage', 'Graphite accents'],
    productFit: [
      { title: 'Contemporary residential', desc: 'Wool and wool-blend rugs with tonal texture and controlled dimensions.' },
      { title: 'Workplace', desc: 'Contract carpet solutions where acoustic, rolling-load, cleaning and replacement requirements are documented.' },
      { title: 'Hospitality', desc: 'Custom carpet and rugs matched to traffic, maintenance and the operator’s concept.' },
      { title: 'Retail and trade', desc: 'Consistent collections with transparent material data and approved samples.' },
    ],
    sources: [
      { label: 'German Design Award — Design That Works: 2026 Trends (February 5, 2026)', url: 'https://www.german-design-award.com/en/news/detail/design-that-works-the-five-key-design-trends-for-2026' },
      { label: 'Association of the German Furniture Industry — Furniture Trends 2026 (January 16, 2026)', url: 'https://www.moebelindustrie.de/en/press-releases/4873/die-moebeltrends-des-jahres-2026-wecken-lust-auf-eine-neue-einrichtung.html' },
      { label: 'Pfleiderer — Decor Trends 2026 (November 17, 2025)', url: 'https://www.pfleiderer.com/fileadmin/content/Images/Press/Decor_Trends_2026/251106_PM_Decor_Trends_2026_EN.pdf' },
    ],
  },
  france: {
    intro: 'French interiors range from restrained contemporary apartments to richly layered heritage spaces, with a strong role for material, craft and considered colour. These 2026 references are drawn from French design coverage and should be interpreted against each project and its architecture.',
    trends: [
      { title: 'Earthy colours and deeper reds', desc: 'AD France’s 2026 coverage highlights intense earth tones, terracotta and chocolate browns. Rugs can carry these colours as a grounding field or a controlled accent.' },
      { title: 'Craft and material richness', desc: 'French design reporting points to savoir-faire, unique pieces and tactile materials. Hand-knotted or hand-tufted rugs with considered texture can act as a focal element without excess ornament.' },
      { title: 'Organic forms and historical references', desc: 'Soft forms and reinterpretations of historical styles appear in 2026 coverage. Organic outlines and contemporary readings of classic motifs can bridge period architecture and modern furniture.' },
    ],
    architectConsiderations: [
      { title: 'Read the architecture first', desc: 'For historic apartments, map room proportions, parquet patterns, fireplaces, mouldings and circulation before choosing rug scale and motif.' },
      { title: 'Balance statement and restraint', desc: 'Where a scheme already includes ornate plasterwork, art or patterned surfaces, control rug pattern scale and contrast.' },
      { title: 'Specify fibre and finish', desc: 'Confirm pile height, density, edge finish, backing and care requirements against intended use.' },
      { title: 'Approve physical samples', desc: 'Review yarn colour and texture in natural and artificial light alongside stone, wood, metal and textile finishes.' },
    ],
    palette: ['Terracotta & burnt sienna', 'Chocolate & tobacco', 'Parchment & warm ivory', 'Dusty rose', 'Celadon & blue-green', 'Aged brass accents'],
    productFit: [
      { title: 'Parisian apartments', desc: 'Hand-knotted wool or wool-silk rugs with nuanced motifs and dimensions suited to parquet layouts.' },
      { title: 'Design-led residences', desc: 'Custom rugs developed around artwork, furniture and material palettes.' },
      { title: 'Boutique hospitality', desc: 'Area rugs and contract carpets selected around traffic, cleaning and performance needs.' },
      { title: 'Interior design studios', desc: 'Sampling-led programmes with clear colour, size and construction approvals.' },
    ],
    sources: [
      { label: 'AD Magazine France — Six Decoration Trends for 2026 (January 22, 2026)', url: 'https://www.admagazine.fr/article/decoration-tendances-2026-inspiration' },
      { label: 'AD Magazine France — Ten Decoration Trends for 2026 (December 22, 2025)', url: 'https://www.admagazine.fr/article/decoration-tendances-pressenties-2026-experts' },
      { label: 'AD Magazine France — Red and Blue in Contemporary Interiors (September 2, 2026)', url: 'https://www.admagazine.fr/article/duo-rouge-bleu-tendance-deco' },
    ],
  }
,
  australia: {
    intro: 'Australian projects balance indoor-outdoor living, strong natural light, varied climates and relaxed material palettes. 2026 design coverage points to individuality, tactile finishes and grounded natural materials; suitability depends on location and use.',
    trends: [
      { title: 'Warmth with individual colour', desc: 'Australian 2026 interiors commentary describes personal colour including burgundy, muted jade, pistachio and powder blue, balanced by warm beige and cream.' },
      { title: 'Texture as comfort', desc: 'Tactile textiles and matte natural-looking finishes recur in Australian coverage. Wool pile and woven structures can soften timber, stone and polished concrete.' },
      { title: 'Organic forms', desc: 'Curved forms and natural material references influence Australian interiors. Organic rug shapes and landscape-inspired palettes can connect living areas with outdoor settings.' },
    ],
    architectConsiderations: [
      { title: 'Account for climate and exposure', desc: 'Clarify whether the rug is in a conditioned interior, covered outdoor area or exposed to direct sun or moisture. Do not use indoor construction outdoors without confirmation.' },
      { title: 'Plan open layouts by zones', desc: 'Use rug dimensions to define living and dining zones while preserving furniture clearances and accessible pathways.' },
      { title: 'Specify household maintenance', desc: 'Discuss pets, children, beach sand, spills, vacuuming and professional cleaning before choosing fibre and pile.' },
      { title: 'Check performance evidence', desc: 'For commercial settings, confirm applicable fire, slip, accessibility and maintenance requirements and obtain evidence for the exact construction.' },
    ],
    palette: ['Warm sand & cream', 'Muted jade & eucalyptus', 'Burgundy accents', 'Powder blue', 'Clay & ochre', 'Natural wool tones'],
    productFit: [
      { title: 'Open-plan homes', desc: 'Area rugs sized to anchor furniture groupings and distinguish living and dining zones.' },
      { title: 'Coastal residences', desc: 'Textured constructions selected for actual indoor conditions and care requirements.' },
      { title: 'Hotels and resorts', desc: 'Custom carpet and rugs specified around guest turnover, traffic and cleaning.' },
      { title: 'Retail and trade', desc: 'Coordinated collections with repeatable sizes, colourways and product-care information.' },
    ],
    sources: [
      { label: 'Henley Homes Australia — Top Five Interior Trends for 2026 (December 18, 2025)', url: 'https://www.henley.com.au/news/top-five-interior-trends-for-2026' },
      { label: 'ABI Interiors — Interior Design Trends to Watch in 2026 (January 4, 2026)', url: 'https://www.abiinteriors.com.au/the-interior-edit/top-interior-design-trends/' },
      { label: 'BUILD Australia — Interior Trends Shaping Australian Homes in 2026', url: 'https://build.com.au/the-interior-trends-set-to-shape-australian-homes-in-2026/' },
    ],
  }
,
  canada: {
    intro: 'Canadian projects range from urban homes to mountain properties and hospitality spaces. Local 2026 design reporting points to warmer, more personal interiors and layered materials; project specifications must still respond to climate and use.',
    trends: [
      { title: 'Modern heritage', desc: 'A Canadian furniture-industry survey identified a Future Heirloom theme for 2026, combining heritage details, rich finishes and imperfection.' },
      { title: 'Confident colour', desc: 'The same report points to renewed interest in expressive colour. Deep green, burgundy, warm brown and selective blue can be balanced with flexible neutrals.' },
      { title: 'Earthy texture', desc: 'British Columbia designer commentary highlights earthy tones, layered textures and organic forms. Wool texture and grounded palettes can complement timber and stone.' },
    ],
    architectConsiderations: [
      { title: 'Plan for seasonal conditions', desc: 'Snow, moisture and grit affect entry-zone wear. Clarify whether the rug is in a protected room or a high-traffic transition area.' },
      { title: 'Check radiant heating compatibility', desc: 'Confirm the construction, backing and underlay suit the flooring and heating system.' },
      { title: 'Resolve dimensions early', desc: 'Record furniture footprints, circulation and door clearances before confirming rug dimensions.' },
      { title: 'Verify project requirements', desc: 'For commercial spaces, identify applicable fire, slip, accessibility and maintenance requirements and verify evidence for the exact product.' },
    ],
    palette: ['Warm taupe & oatmeal', 'Walnut & chocolate', 'Moss & evergreen', 'Burgundy', 'Slate blue', 'Clay & muted rust'],
    productFit: [
      { title: 'Family living spaces', desc: 'Wool and wool-blend rugs selected for pile, cleanability and furniture scale.' },
      { title: 'Mountain and cottage homes', desc: 'Textured palettes that coordinate with timber and stone.' },
      { title: 'Urban condominiums', desc: 'Custom sizes and low-profile constructions for compact layouts.' },
      { title: 'Hospitality and commercial', desc: 'Contract carpets with documented performance and maintenance plans.' },
    ],
    sources: [
      { label: 'HomeGoodsOnline Canada — Design Themes for 2026 (January 20, 2026)', url: 'https://homegoodsonline.ca/design-themes-that-will-define-2026-report/' },
      { label: 'BC Living — 2026 Interior Design Trends from BC Designers (January 21, 2026)', url: 'https://bcliving.ca/home/decor/9-interior-design-trends-in-2026/' },
      { label: 'Wood Industry Canada — 2026 Design Trends Report (January 28, 2026)', url: 'https://woodindustry.ca/the-design-trends-shaping-2026-report/' },
    ],
  }
,
  'uae': {
    intro: 'UAE projects range from contemporary villas and apartments to destination hospitality, retail and workplace environments. Regional 2026 design commentary points toward warmer material palettes, culturally grounded detailing and experiential hospitality. Carpet specifications must account for climate, occupancy and maintenance.',
    trends: [
      { title: 'Warm minimalism and natural materials', desc: 'Dubai-focused 2026 reporting describes warm neutrals, natural stone, timber and tactile surfaces replacing colder, high-gloss schemes. Sand, bone and taupe rugs can add softness and continuity.' },
      { title: 'Contemporary regional identity', desc: 'Modern Arabic interiors reinterpret regional geometry, screens and gathering spaces through contemporary detailing. Bespoke geometric pattern can reference this language when developed with the client and design team.' },
      { title: 'Hospitality with emotional character', desc: 'Middle East design coverage for 2026 places emphasis on meaning, longevity, local craft and guest experience. Carpet can contribute to wayfinding, acoustic comfort and a distinct sense of place.' },
      { title: 'Biophilic and climate-aware interiors', desc: 'UAE project commentary highlights natural references and climate-responsive planning. Natural-looking palettes can connect interiors to landscape, while fibre and construction must suit indoor conditions and cleaning.' },
    ],
    architectConsiderations: [
      { title: 'Account for heat, dust and cleaning', desc: 'Clarify whether spaces are fully conditioned or near entrances. Specify pile, colour and fibre around dust loading and the operator’s cleaning equipment.' },
      { title: 'Coordinate hospitality traffic', desc: 'For lobbies, corridors and guest floors, define traffic intensity, trolley movement, cleaning cycles, acoustic goals and replacement strategy.' },
      { title: 'Use cultural references with context', desc: 'Develop requested geometric motifs with the client around project narrative, scale and setting rather than applying generic decorative references.' },
      { title: 'Confirm performance documentation', desc: 'Identify applicable project and operator requirements, then obtain valid evidence for the precise construction before specification.' },
    ],
    palette: ['Sand & warm ivory', 'Travertine beige', 'Date-palm brown', 'Terracotta & burnt ochre', 'Olive & mineral green', 'Bronze accents'],
    productFit: [
      { title: 'Luxury villas and residences', desc: 'Custom hand-knotted and hand-tufted rugs for majlis, living rooms and bedrooms.' },
      { title: 'Hotels and resorts', desc: 'Contract carpet and area-rug programmes planned for guest traffic, cleaning and brand identity.' },
      { title: 'Retail and F&B', desc: 'Custom statement rugs aligned with concept, customer flow and operational needs.' },
      { title: 'Workplace and mixed-use', desc: 'Specification-led carpet packages for reception, collaboration and circulation areas.' },
    ],
    sources: [
      { label: 'identity — 2026 and Beyond: The Identity Trend Report (January 9, 2026)', url: 'https://identity.ae/2026-and-beyond-the-identity-trend-report/' },
      { label: 'Tarmeer — 2026 Dubai Interior Design Trends (July 3, 2026)', url: 'https://www.tarmeer.com/insights/dubai-interior-design-trends-2026' },
      { label: 'Studio by Three — Dubai Hotel Interior Design Trends (August 29, 2026)', url: 'https://www.studiobythree.com/journal/hotel-interior-design-trends-dubai-2026/' },
    ],
  }
}
