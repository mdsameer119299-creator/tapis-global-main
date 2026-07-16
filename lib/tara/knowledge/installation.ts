/**
 * Installation module — capability-safe general guidance on how carpets and rugs
 * are laid/fitted. General best practice only; project-specific fitting, site
 * measurement and any guarantees are confirmed by the TAPIS GLOBAL team.
 */
import type { TaraFact } from './types'

export const INSTALLATION_MODULE: TaraFact[] = [
  {
    id: 'install-area-rug',
    title: 'Area rug placement',
    body: 'Area rugs are loose-laid, so no fitting is needed. As a general guide, size the rug so the main furniture sits at least partly on it to anchor the space; in living rooms the front legs of sofas commonly rest on the rug, and in bedrooms the rug typically extends beyond the sides of the bed. An anti-slip underlay is recommended on hard floors for grip and to protect the rug base.',
    tags: ['installation', 'area rug', 'placement', 'sizing', 'underlay', 'loose lay'],
  },
  {
    id: 'install-underlay',
    title: 'Underlay & anti-slip',
    body: 'An underlay adds comfort underfoot, reduces wear on the rug base and helps prevent slipping on hard floors. The right underlay depends on the floor type and the rug construction; the team can advise on a suitable option for your setting.',
    tags: ['installation', 'underlay', 'anti slip', 'padding', 'comfort', 'hard floor'],
  },
  {
    id: 'install-w2w',
    title: 'Wall-to-wall / broadloom fitting',
    body: 'Wall-to-wall (broadloom) carpet is fitted to the room, usually over an underlay, and secured at the edges. This is common in hotels, corridors and commercial interiors and normally involves accurate site measurement and professional fitting. TARA can help clarify the requirement; measurement, fitting and any commercial terms are confirmed by the TAPIS GLOBAL team.',
    tags: ['installation', 'wall to wall', 'broadloom', 'fitting', 'hospitality', 'commercial', 'site measurement'],
  },
  {
    id: 'install-stairs',
    title: 'Stairs & runners',
    body: 'Stair runners and hallway runners are fitted along the traffic path and, on stairs, secured over each tread and riser. Hard-wearing constructions and fibres are commonly chosen for these high-traffic routes. The team confirms the fitting approach and specification for your staircase.',
    tags: ['installation', 'stairs', 'staircase', 'runner', 'hallway', 'high traffic'],
  },
]
