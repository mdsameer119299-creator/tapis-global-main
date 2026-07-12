/**
 * Materials module. Capability-safe: describes what a fibre is COMMONLY chosen
 * for and general considerations — never guarantees of durability, traffic
 * suitability, washability, sustainability or tested performance. Positioning is
 * categorical, never a price. The team confirms suitability per project.
 */
import type { TaraMaterial } from './types'

/** Shared, non-price pricing drivers (never quote actual prices). */
const PRICE = 'Cost depends on fibre grade, construction, knot/tuft density, size, number of colours, design complexity and quantity — the team prepares a quotation to your spec.'

export const TARA_MATERIALS: TaraMaterial[] = [
  { id: 'nz-wool', name: 'New Zealand Wool', positioning: 'Luxury', fibreType: 'natural',
    notes: 'A wool fibre commonly chosen for clean colour take-up and a soft hand-feel.',
    applications: 'Commonly considered for residential and hospitality, in hand-knotted & hand-tufted rugs.',
    properties: ['Natural protein fibre', 'Bright, even colour take-up', 'Soft, full hand-feel'],
    advantages: ['Refined appearance', 'Wide colour range', 'Suits premium projects'],
    limitations: ['A premium fibre — positioned at the higher tier', 'The team advises on use-case suitability'],
    maintenance: 'Regular gentle vacuuming; professional cleaning for deeper care.', priceFactors: PRICE, tags: ['wool', 'luxury', 'residential', 'hospitality'] },

  { id: 'indian-wool', name: 'Indian Wool', positioning: 'Premium', fibreType: 'natural',
    notes: 'A widely used natural wool with a warm hand-feel, common across many rug types.',
    applications: 'Commonly considered for residential and commercial rugs at a premium tier.',
    properties: ['Natural protein fibre', 'Warm hand-feel', 'Versatile'],
    advantages: ['Good all-round choice', 'Broad availability', 'Works across constructions'],
    limitations: ['Character varies by grade — the team advises on selection'],
    maintenance: 'Gentle vacuuming; professional cleaning as needed.', priceFactors: PRICE, tags: ['wool', 'premium', 'versatile'] },

  { id: 'blended-wool', name: 'Blended Wool', positioning: 'Premium', fibreType: 'blend',
    notes: 'Wool combined with other fibres to balance appearance, feel and budget.',
    applications: 'Commonly considered where a balance of look and value is wanted.',
    properties: ['Wool base with blend fibres', 'Tunable appearance'], advantages: ['Balances feel and budget', 'Design flexibility'],
    limitations: ['Exact blend affects character — confirmed per project'],
    maintenance: 'Gentle vacuuming; professional cleaning as needed.', priceFactors: PRICE, tags: ['wool', 'blend'] },

  { id: 'viscose', name: 'Viscose', positioning: 'Premium', fibreType: 'synthetic',
    notes: 'A fibre with a silk-like sheen and soft hand-feel, often chosen for decorative pieces.',
    applications: 'Commonly considered for feature rugs and decorative, lower-traffic interiors.',
    properties: ['Silk-like sheen', 'Soft hand-feel', 'Vivid colours'], advantages: ['Luxurious look at a friendlier tier', 'Rich colour depth'],
    limitations: ['Best kept to decorative, lower-traffic settings', 'Sensitive to moisture — the team advises on care'],
    maintenance: 'Dry-clean approach; avoid soaking. The team can share care guidance.', priceFactors: PRICE, tags: ['viscose', 'sheen', 'decorative'] },

  { id: 'bamboo-silk', name: 'Bamboo Silk', positioning: 'Luxury', fibreType: 'synthetic',
    notes: 'A plant-based fibre with a lustrous, silk-like appearance.',
    applications: 'Commonly considered for decorative and luxury residential rugs.',
    properties: ['Lustrous sheen', 'Fine, soft surface'], advantages: ['High-shine, luxurious look'],
    limitations: ['Decorative use is typical; the team advises on placement'],
    maintenance: 'Gentle, dry-focused cleaning; the team can advise.', priceFactors: PRICE, tags: ['bamboo silk', 'sheen', 'luxury'] },

  { id: 'wool-viscose', name: 'Wool-Viscose Blend', positioning: 'Premium', fibreType: 'blend',
    notes: 'A blend combining a wool base with viscose sheen for design depth.',
    applications: 'Commonly considered for design-led residential and hospitality rugs.',
    properties: ['Wool body + viscose highlights', 'Depth of colour'], advantages: ['Combines matte and sheen', 'Design richness'],
    limitations: ['Care follows the viscose component — the team advises'],
    maintenance: 'Gentle vacuuming; professional cleaning as needed.', priceFactors: PRICE, tags: ['blend', 'wool', 'viscose'] },

  { id: 'cotton', name: 'Cotton', positioning: 'Economy', fibreType: 'natural',
    notes: 'A soft natural fibre used in flatweaves and dhurries.',
    applications: 'Commonly considered for dhurries and flatweave rugs.',
    properties: ['Soft natural fibre', 'Takes colour well'], advantages: ['Friendly tier', 'Good for flatweaves'],
    limitations: ['Character suits lighter constructions — the team advises'],
    maintenance: 'The team can share care guidance for your construction.', priceFactors: PRICE, tags: ['cotton', 'dhurrie', 'flatweave'] },

  { id: 'jute', name: 'Jute', positioning: 'Economy', fibreType: 'natural',
    notes: 'A natural plant fibre with an organic, textured appearance.',
    applications: 'Commonly considered for relaxed, natural-look interiors.',
    properties: ['Natural plant fibre', 'Organic texture'], advantages: ['Natural, casual aesthetic'],
    limitations: ['Sensitive to moisture — the team advises on placement'],
    maintenance: 'Keep dry; gentle dry cleaning. The team can advise.', priceFactors: PRICE, tags: ['jute', 'natural fibre'] },

  { id: 'sisal', name: 'Sisal', positioning: 'Economy', fibreType: 'natural',
    notes: 'A natural plant fibre with a structured weave and matte look.',
    applications: 'Commonly considered for natural-fibre floor coverings; suitability confirmed per project.',
    properties: ['Natural plant fibre', 'Structured, matte surface'], advantages: ['Textured natural look'],
    limitations: ['Sensitive to moisture — the team advises'],
    maintenance: 'Keep dry; dry cleaning methods. The team can advise.', priceFactors: PRICE, tags: ['sisal', 'natural fibre'] },

  { id: 'leather', name: 'Leather', positioning: 'Premium', fibreType: 'natural',
    notes: 'Woven or patchwork leather chosen for texture and statement design.',
    applications: 'Commonly considered for feature and statement interiors.',
    properties: ['Natural material', 'Distinct texture'], advantages: ['Bold, statement look'],
    limitations: ['Specialist care; the team advises on placement'],
    maintenance: 'Specialist leather care; keep away from moisture.', priceFactors: PRICE, tags: ['leather', 'statement'] },

  { id: 'pet', name: 'PET (Recycled Polyester)', positioning: 'Economy', fibreType: 'synthetic',
    notes: 'A synthetic fibre often chosen for colour vibrancy and indoor–outdoor styles.',
    applications: 'Commonly considered for casual, indoor–outdoor and value-tier rugs.',
    properties: ['Synthetic fibre', 'Vivid colours'], advantages: ['Colour vibrancy', 'Value tier'],
    limitations: ['Look differs from natural fibres — the team advises'],
    maintenance: 'The team can share care guidance for your setting.', priceFactors: PRICE, tags: ['pet', 'synthetic', 'outdoor'] },

  { id: 'tencel', name: 'Tencel (Lyocell)', positioning: 'Premium', fibreType: 'synthetic',
    notes: 'A wood-pulp-based fibre with a soft, subtle sheen.',
    applications: 'Commonly considered for soft, decorative rugs.',
    properties: ['Soft surface', 'Subtle sheen'], advantages: ['Silky feel', 'Refined look'],
    limitations: ['Decorative use is typical — the team advises'],
    maintenance: 'Gentle, dry-focused care; the team can advise.', priceFactors: PRICE, tags: ['tencel', 'lyocell', 'sheen'] },

  { id: 'linen', name: 'Linen', positioning: 'Premium', fibreType: 'natural',
    notes: 'A natural flax fibre with a relaxed, matte character.',
    applications: 'Commonly considered for understated, natural-look pieces.',
    properties: ['Natural flax fibre', 'Matte, relaxed texture'], advantages: ['Natural, calm aesthetic'],
    limitations: ['Character suits lighter constructions — the team advises'],
    maintenance: 'The team can share care guidance.', priceFactors: PRICE, tags: ['linen', 'natural fibre'] },

  { id: 'hemp', name: 'Hemp', positioning: 'Economy', fibreType: 'natural',
    notes: 'A natural plant fibre with a rugged, organic texture.',
    applications: 'Commonly considered for natural-look, casual interiors.',
    properties: ['Natural plant fibre', 'Coarse, organic texture'], advantages: ['Rustic natural look'],
    limitations: ['Texture is coarse by nature — the team advises on fit'],
    maintenance: 'Keep dry; dry cleaning methods. The team can advise.', priceFactors: PRICE, tags: ['hemp', 'natural fibre'] },
]
