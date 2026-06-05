import type { Metadata } from 'next'
import Link from 'next/link'
import { buildMetadata } from '@/lib/metadata'
import { SEO_BASE_URL } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title:       'Page Not Found | Tapis Global International',
  description: 'The page you requested could not be found. Explore luxury handmade carpets, custom rugs and hospitality flooring from Tapis Global International.',
  canonical:   `${SEO_BASE_URL}/404`,
  noIndex:     true,
})

export default function NotFound() {
  return (
    <main
      className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-24 text-center"
      style={{ background: 'var(--cream)' }}
    >
      <p
        className="text-[14px] tracking-[0.32em] uppercase font-medium mb-4"
        style={{ color: 'var(--gd)' }}
      >
        404
      </p>
      <h1
        className="font-normal leading-[1.1] mb-5 max-w-xl"
        style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize:   'clamp(36px, 6vw, 56px)',
          color:      'var(--ink)',
        }}
      >
        This page could not be found
      </h1>
      <p
        className="text-[17px] font-light leading-relaxed max-w-md mb-10"
        style={{ color: 'var(--inkm)' }}
      >
        The link may be outdated or the page may have moved. Continue exploring our collections and bespoke flooring solutions.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <Link
          href="/"
          className="px-8 py-3.5 text-[15px] tracking-[0.18em] uppercase font-medium transition-all duration-300 hover:brightness-110 min-h-[48px] inline-flex items-center justify-center"
          style={{ background: 'var(--g)', color: 'var(--ink)' }}
        >
          Return Home
        </Link>
        <Link
          href="/contact"
          className="px-8 py-3.5 text-[15px] tracking-[0.18em] uppercase font-medium border transition-all duration-300 min-h-[48px] inline-flex items-center justify-center"
          style={{ borderColor: 'var(--bd)', color: 'var(--inkm)' }}
        >
          Contact Us
        </Link>
      </div>
    </main>
  )
}
