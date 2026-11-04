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
}
