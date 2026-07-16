/**
 * Applications module — capability-safe guidance mapping common spaces/use-cases
 * to the materials and constructions COMMONLY considered for them. It never
 * guarantees performance; it helps TARA (and the recommendation engine) talk
 * about fit by room and traffic. The team confirms the final specification.
 */
import type { TaraFact } from './types'

export const APPLICATIONS_MODULE: TaraFact[] = [
  {
    id: 'app-living-room',
    title: 'Living room rugs',
    body: 'Living rooms see regular but moderate traffic, so wool or wool-blend rugs in hand-tufted or hand-knotted constructions are commonly considered for a balance of comfort and durability. Viscose or wool-viscose can add sheen for a more formal, lower-traffic look.',
    tags: ['living room', 'lounge', 'residential', 'wool', 'hand tufted', 'application'],
  },
  {
    id: 'app-bedroom',
    title: 'Bedroom rugs',
    body: 'Bedrooms prioritise softness underfoot over heavy durability, so soft wool, shaggy (high-pile) or silk-like fibres such as viscose, bamboo silk or tencel are commonly considered. A rug that extends beyond the sides of the bed is a common choice.',
    tags: ['bedroom', 'residential', 'soft', 'shaggy', 'viscose', 'application'],
  },
  {
    id: 'app-hallway-stairs',
    title: 'Hallways, stairs & high-traffic routes',
    body: 'Hallways, corridors and stairs are high-traffic, so hard-wearing choices are commonly considered — durable wool, sisal or synthetic (PET) fibres in low-pile, tightly constructed runners. High-pile or delicate decorative fibres are usually avoided here.',
    tags: ['hallway', 'stairs', 'corridor', 'runner', 'high traffic', 'durable', 'sisal', 'application'],
  },
  {
    id: 'app-hotel',
    title: 'Hotel & hospitality areas',
    body: 'Hospitality interiors span guestrooms, corridors, lobbies and banquet halls. Wall-to-wall / broadloom or hand-tufted rugs in wool or wool-blends are commonly specified for a hard-wearing, custom-design result. Fire performance, certifications and quantities are always confirmed by the team.',
    tags: ['hotel', 'hospitality', 'lobby', 'guestroom', 'banquet', 'broadloom', 'contract', 'application'],
  },
  {
    id: 'app-office',
    title: 'Offices & commercial spaces',
    body: 'Offices and commercial spaces need consistent, hard-wearing floor coverings, so machine-made broadloom or durable wool-blend constructions are commonly considered for higher traffic. Design is typically kept practical and brand-appropriate.',
    tags: ['office', 'commercial', 'corporate', 'broadloom', 'durable', 'high traffic', 'application'],
  },
  {
    id: 'app-outdoor',
    title: 'Outdoor & indoor–outdoor areas',
    body: 'Outdoor and indoor–outdoor areas need moisture-tolerant, fade-resistant materials, so synthetic (PET) fibres in outdoor-oriented, low-pile constructions are commonly considered. Natural fibres are generally avoided where moisture is a factor. The team confirms suitability for a specific outdoor setting.',
    tags: ['outdoor', 'patio', 'terrace', 'indoor outdoor', 'pet', 'synthetic', 'application'],
  },
  {
    id: 'app-kids',
    title: 'Kids’ rooms & pet-friendly spaces',
    body: 'For children’s rooms and pet-friendly spaces, easy-care and forgiving materials are commonly considered — washable cotton flatweaves/dhurries or hard-wearing, cleanable synthetic (PET) styles. Delicate high-sheen fibres are usually avoided in these settings.',
    tags: ['kids', 'children', 'pet friendly', 'washable', 'cotton', 'pet', 'application'],
  },
]
