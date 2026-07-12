/** Quality & pricing-factor module. NEVER quote actual prices/MOQ — factors only. */
import type { TaraFact } from './types'

export const QUALITY_MODULE: TaraFact[] = [
  { id: 'quality-grades', title: 'Quality tiers', body: 'Rugs span economy, premium and luxury positioning depending on fibre, construction and finish. The right tier is chosen around the project\'s look, setting and budget — the team advises on the best fit.', tags: ['quality', 'grade', 'luxury', 'commercial'] },
  { id: 'quality-selection', title: 'Choosing material & construction', body: 'Material and construction are chosen together: the fibre sets the look and feel, and the construction (hand-knotted, tufted, handloom, flatweave, etc.) sets the detail and finish. The team recommends combinations suited to your project.', tags: ['quality', 'material', 'construction', 'selection'] },
  { id: 'quality-pile', title: 'Pile & density', body: 'Pile height (low, high) and density (knots/tufts per unit area) influence the surface look and feel. Higher density generally means finer detail. The team advises on suitable density for a design.', tags: ['pile', 'density', 'kpsi', 'gsm'] },
  { id: 'quality-price-factors', title: 'What affects price', body: 'Pricing depends on fibre grade, construction, pile density, size, number of colours, design complexity, quantity and shipping. We do not quote fixed prices here — the team prepares a quotation to your exact specification.', tags: ['price', 'cost', 'quotation', 'factors'] },
]
