import { Cormorant_Garamond, EB_Garamond, Outfit } from 'next/font/google'

export const outfit = Outfit({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '600', '700'],
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
  preload:  false,
  variable: '--font-eb',
})

export const fontVariables = `${outfit.variable} ${cormorant.variable} ${ebGaramond.variable}`
