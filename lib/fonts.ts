import { Cormorant_Garamond, EB_Garamond, Outfit } from 'next/font/google'

export const outfit = Outfit({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '600'],
  display:  'swap',
  preload:  true,
  variable: '--font-outfit',
})

export const cormorant = Cormorant_Garamond({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '600'],
  style:    ['normal', 'italic'],
  display:  'swap',
  preload:  true,
  variable: '--font-cormorant',
})

export const ebGaramond = EB_Garamond({
  subsets:  ['latin'],
  weight:   ['400', '500'],
  style:    ['normal', 'italic'],
  display:  'swap',
  // Used only below the fold (footer / body copy) — don't eagerly preload it,
  // so its font files don't compete with the LCP hero image on first paint.
  preload:  false,
  variable: '--font-eb',
})

export const fontVariables = `${outfit.variable} ${cormorant.variable} ${ebGaramond.variable}`
