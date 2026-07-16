/**
 * Constructions module. Describes method + design character only — no
 * durability/longevity/turnaround guarantees.
 *
 * Each construction also carries a structured `profile` (Product Knowledge
 * Engine): description, manufacturing method, commonly suitable materials, best
 * applications, a RELATIVE traffic-suitability band, a typical pile-height
 * descriptor and maintenance. Capability-safe — the team confirms suitability
 * per project.
 */
import type { TaraConstruction } from './types'

export const TARA_CONSTRUCTIONS: TaraConstruction[] = [
  { id: 'hand-knotted', name: 'Hand-Knotted', pile: 'cut', notes: 'Woven knot-by-knot on a loom; highly customisable in design and detail.', detail: 'Knots are tied individually around warp threads. Knot density (KPSI) and yarn choice shape the look. A traditional, premium-tier method.', tags: ['hand knotted', 'premium', 'kpsi'],
    profile: {
      description: 'A traditional, premium method woven knot-by-knot on a loom, giving the finest detail and longevity.',
      method: 'Individual knots are tied by hand around warp threads; knot density (KPSI) and yarn choice shape the design and durability.',
      suitableMaterials: ['nz-wool', 'indian-wool', 'bamboo-silk', 'wool-viscose'],
      bestApplications: ['Premium and heritage rugs', 'Luxury living rooms', 'Hotel lobbies and suites'],
      trafficSuitability: 'high', pileHeight: 'Low to medium cut pile',
      maintenance: 'Gentle vacuuming; professional cleaning. Very long-lived when cared for.',
    } },

  { id: 'hand-tufted', name: 'Hand-Tufted', pile: 'cut', notes: 'Tufted to a backing; flexible for custom designs, carving and texture.', detail: 'Yarn is punched through a backing cloth with a tufting tool, then secured and finished. Well suited to bespoke artwork, carving and mixed textures.', tags: ['hand tufted', 'custom design', 'carving'],
    profile: {
      description: 'A flexible, faster method that punches yarn into a backing — ideal for bespoke artwork, carving and mixed textures.',
      method: 'Yarn is punched through a backing cloth with a tufting tool, then secured with a scrim backing and sheared/finished.',
      suitableMaterials: ['indian-wool', 'nz-wool', 'wool-viscose', 'viscose'],
      bestApplications: ['Custom artwork and carved designs', 'Residential rugs', 'Hospitality feature areas'],
      trafficSuitability: 'high', pileHeight: 'Medium cut pile',
      maintenance: 'Regular vacuuming; professional cleaning. Wool tufts wear well in everyday use.',
    } },

  { id: 'handloom', name: 'Handloom', pile: 'loop', notes: 'Loom-woven with a uniform pile.', detail: 'Woven on a handloom for an even, consistent surface; loop or cut finishes are possible.', tags: ['handloom', 'loop'],
    profile: {
      description: 'Loom-woven for an even, consistent surface with a clean contemporary look; loop or cut finishes are possible.',
      method: 'Woven on a handloom, producing a uniform pile with a smooth, modern character.',
      suitableMaterials: ['indian-wool', 'wool-viscose', 'viscose', 'tencel'],
      bestApplications: ['Plain and textured contemporary rugs', 'Residential interiors', 'Design-led spaces'],
      trafficSuitability: 'moderate', pileHeight: 'Low to medium loop or cut pile',
      maintenance: 'Gentle vacuuming; professional cleaning as needed.',
    } },

  { id: 'flatweave', name: 'Flatweave', pile: 'flat', notes: 'No pile, reversible and lightweight; wool or natural fibres.', detail: 'Warp and weft interlace with no pile, giving a thin, reversible rug.', tags: ['flatweave', 'reversible'],
    profile: {
      description: 'A thin, reversible, pile-less rug where warp and weft interlace directly — light and easy to handle.',
      method: 'Warp and weft yarns interlace with no knots or pile, producing a flat, reversible weave.',
      suitableMaterials: ['indian-wool', 'cotton'],
      bestApplications: ['Reversible lightweight rugs', 'Layering', 'Casual and everyday interiors'],
      trafficSuitability: 'moderate', pileHeight: 'No pile (flat)',
      maintenance: 'Easy to shake out and vacuum; many can be gently cleaned — the team advises.',
    } },

  { id: 'kilim', name: 'Kilim', pile: 'flat', notes: 'Flatwoven with geometric and tribal motifs.', detail: 'A flatweave tradition known for bold geometric and tribal patterning.', tags: ['kilim', 'geometric'],
    profile: {
      description: 'A flatweave tradition known for bold geometric and tribal patterning, with a slim, reversible body.',
      method: 'A tapestry-style flatweave where coloured weft yarns build the pattern directly; no pile.',
      suitableMaterials: ['indian-wool', 'cotton'],
      bestApplications: ['Geometric and tribal decorative rugs', 'Casual living rooms', 'Layering pieces'],
      trafficSuitability: 'moderate', pileHeight: 'No pile (flat)',
      maintenance: 'Shake out and gently vacuum; professional cleaning for deeper care.',
    } },

  { id: 'dhurrie', name: 'Dhurrie', pile: 'flat', notes: 'Handwoven cotton or wool flatweave.', detail: 'A handwoven flatweave, commonly in cotton or wool, used in residential and institutional interiors.', tags: ['dhurrie', 'cotton'],
    profile: {
      description: 'A handwoven Indian flatweave, commonly in cotton or wool, valued for a light, casual and versatile character.',
      method: 'Handwoven flatweave, traditionally in cotton or wool, with a flat reversible body.',
      suitableMaterials: ['cotton', 'indian-wool'],
      bestApplications: ['Residential rugs', 'Institutional interiors', 'Casual and value-conscious projects'],
      trafficSuitability: 'moderate', pileHeight: 'No pile (flat)',
      maintenance: 'Light and easy to handle; many cotton dhurries tolerate gentle washing — the team advises.',
    } },

  { id: 'machine-made', name: 'Machine-Made', pile: 'mixed', notes: 'Power-loom woven for consistency and larger runs.', detail: 'Produced on power looms; consistent output for larger quantities. The team confirms availability and suitability per project.', tags: ['machine made', 'power loom', 'bulk'],
    profile: {
      description: 'Power-loom woven for consistent output and larger runs — the usual route for broadloom and wall-to-wall.',
      method: 'Produced on power looms for uniform, repeatable output across large quantities.',
      suitableMaterials: ['pet', 'blended-wool', 'wool-viscose'],
      bestApplications: ['Broadloom and wall-to-wall', 'Hotel corridors and guestrooms', 'Commercial and high-volume projects'],
      trafficSuitability: 'very-high', pileHeight: 'Varies (loop or cut)',
      maintenance: 'Routine vacuuming; commercial cleaning suited to the fibre. Built for consistent high-traffic use.',
    } },

  { id: 'shaggy', name: 'Shaggy', pile: 'high', notes: 'High, plush pile with a soft surface.', detail: 'A long, plush cut pile giving a soft, tactile surface for residential interiors.', tags: ['shaggy', 'high pile'],
    profile: {
      description: 'A long, plush cut pile giving a very soft, tactile surface — a comfort-first look for calm residential rooms.',
      method: 'A long cut pile is tufted or woven for a deep, soft surface.',
      suitableMaterials: ['indian-wool', 'pet', 'viscose'],
      bestApplications: ['Bedrooms', 'Lounges and reading corners', 'Soft residential interiors'],
      trafficSuitability: 'low', pileHeight: 'High (long) pile',
      maintenance: 'Needs regular gentle care to keep the pile open; not suited to heavy traffic.',
    } },

  { id: 'outdoor', name: 'Outdoor', pile: 'flat', notes: 'Styles intended for outdoor-capable use, subject to material choice.', detail: 'Outdoor-oriented styles typically use synthetic fibres (e.g. PET). Suitability for a specific outdoor setting is confirmed by the team.', tags: ['outdoor', 'pet', 'synthetic'],
    profile: {
      description: 'Outdoor-oriented styles built from moisture-tolerant synthetic fibres for patios, terraces and indoor–outdoor use.',
      method: 'Typically flat-woven or machine-made in synthetic fibres (e.g. PET) chosen to tolerate moisture and sun.',
      suitableMaterials: ['pet'],
      bestApplications: ['Patios and terraces', 'Indoor–outdoor living areas', 'High-traffic casual spaces'],
      trafficSuitability: 'high', pileHeight: 'Low, flat',
      maintenance: 'Tolerant of damp wiping and rinsing; the team confirms suitability for a specific outdoor setting.',
    } },
]

/** Pile & finish concepts referenced during qualification. */
export const PILE_TYPES = [
  { id: 'cut-pile', name: 'Cut Pile', detail: 'Yarn loops are cut, giving a soft, defined surface.' },
  { id: 'loop-pile', name: 'Loop Pile', detail: 'Loops are left uncut for a textured, structured surface.' },
  { id: 'high-pile', name: 'High Pile', detail: 'Longer pile for a plush, soft feel.' },
  { id: 'low-pile', name: 'Low Pile', detail: 'Shorter pile for a flatter, cleaner surface.' },
]
