/** Manufacturing module — general step-by-step process (educational, no capacity claims). */
import type { TaraManufacturingStep } from './types'

export const TARA_MANUFACTURING_STEPS: TaraManufacturingStep[] = [
  { step: 1, name: 'Raw material sourcing', detail: 'Wool or other fibres are sourced to the required grade for the project.' },
  { step: 2, name: 'Sorting', detail: 'Fibres are sorted by grade and quality before processing.' },
  { step: 3, name: 'Washing', detail: 'Raw fibre is cleaned to remove impurities.' },
  { step: 4, name: 'Carding', detail: 'Fibres are combed to align them for spinning.' },
  { step: 5, name: 'Spinning', detail: 'Fibres are spun into yarn of the required count.' },
  { step: 6, name: 'Dyeing', detail: 'Yarn is dyed to the approved colours / shade card.' },
  { step: 7, name: 'Loom preparation', detail: 'Warp threads are set on the loom for the design.' },
  { step: 8, name: 'Weaving / knotting / tufting', detail: 'The rug is made by hand-knotting, hand-tufting, handloom or flatweaving per the chosen construction.' },
  { step: 9, name: 'Carving', detail: 'Where the design calls for it, the pile is carved for relief and definition.' },
  { step: 10, name: 'Latexing / binding', detail: 'Tufted rugs receive a latex coat and backing; edges are bound/finished.' },
  { step: 11, name: 'Stretching & drying', detail: 'The rug is stretched to shape and dried.' },
  { step: 12, name: 'Finishing', detail: 'Clipping, washing and final finishing bring out the surface and colour.' },
  { step: 13, name: 'Inspection', detail: 'Quality checks review size, design, colour and finish against the specification.' },
  { step: 14, name: 'Packing & export', detail: 'Rugs are packed for transit; export orders are prepared with the relevant documentation and container loading.' },
]
