/**
 * Constructions module. Describes method + design character only — no
 * durability/longevity/turnaround guarantees.
 */
import type { TaraConstruction } from './types'

export const TARA_CONSTRUCTIONS: TaraConstruction[] = [
  { id: 'hand-knotted', name: 'Hand-Knotted', pile: 'cut', notes: 'Woven knot-by-knot on a loom; highly customisable in design and detail.', detail: 'Knots are tied individually around warp threads. Knot density (KPSI) and yarn choice shape the look. A traditional, premium-tier method.', tags: ['hand knotted', 'premium', 'kpsi'] },
  { id: 'hand-tufted', name: 'Hand-Tufted', pile: 'cut', notes: 'Tufted to a backing; flexible for custom designs, carving and texture.', detail: 'Yarn is punched through a backing cloth with a tufting tool, then secured and finished. Well suited to bespoke artwork, carving and mixed textures.', tags: ['hand tufted', 'custom design', 'carving'] },
  { id: 'handloom', name: 'Handloom', pile: 'loop', notes: 'Loom-woven with a uniform pile.', detail: 'Woven on a handloom for an even, consistent surface; loop or cut finishes are possible.', tags: ['handloom', 'loop'] },
  { id: 'flatweave', name: 'Flatweave', pile: 'flat', notes: 'No pile, reversible and lightweight; wool or natural fibres.', detail: 'Warp and weft interlace with no pile, giving a thin, reversible rug.', tags: ['flatweave', 'reversible'] },
  { id: 'kilim', name: 'Kilim', pile: 'flat', notes: 'Flatwoven with geometric and tribal motifs.', detail: 'A flatweave tradition known for bold geometric and tribal patterning.', tags: ['kilim', 'geometric'] },
  { id: 'dhurrie', name: 'Dhurrie', pile: 'flat', notes: 'Handwoven cotton or wool flatweave.', detail: 'A handwoven flatweave, commonly in cotton or wool, used in residential and institutional interiors.', tags: ['dhurrie', 'cotton'] },
  { id: 'machine-made', name: 'Machine-Made', pile: 'mixed', notes: 'Power-loom woven for consistency and larger runs.', detail: 'Produced on power looms; consistent output for larger quantities. The team confirms availability and suitability per project.', tags: ['machine made', 'power loom', 'bulk'] },
  { id: 'shaggy', name: 'Shaggy', pile: 'high', notes: 'High, plush pile with a soft surface.', detail: 'A long, plush cut pile giving a soft, tactile surface for residential interiors.', tags: ['shaggy', 'high pile'] },
  { id: 'outdoor', name: 'Outdoor', pile: 'flat', notes: 'Styles intended for outdoor-capable use, subject to material choice.', detail: 'Outdoor-oriented styles typically use synthetic fibres (e.g. PET). Suitability for a specific outdoor setting is confirmed by the team.', tags: ['outdoor', 'pet', 'synthetic'] },
]

/** Pile & finish concepts referenced during qualification. */
export const PILE_TYPES = [
  { id: 'cut-pile', name: 'Cut Pile', detail: 'Yarn loops are cut, giving a soft, defined surface.' },
  { id: 'loop-pile', name: 'Loop Pile', detail: 'Loops are left uncut for a textured, structured surface.' },
  { id: 'high-pile', name: 'High Pile', detail: 'Longer pile for a plush, soft feel.' },
  { id: 'low-pile', name: 'Low Pile', detail: 'Shorter pile for a flatter, cleaner surface.' },
]
