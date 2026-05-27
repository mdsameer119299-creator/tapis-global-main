import type { Metadata } from 'next'
import Link from 'next/link'
import { buildMetadata } from '@/lib/metadata'
import { PAGE_META, SEO_BASE_URL, OG_IMAGE } from '@/lib/seo'
import {
  webPageSchema,
  breadcrumbSchema,
  buildJsonLd,
} from '@/lib/structured-data'
import { ABOUT_SECTIONS } from '@/lib/about'
import AboutHero from '@/components/about/AboutHero'
import AboutSplitSection from '@/components/about/AboutSplitSection'

export const metadata: Metadata = buildMetadata(PAGE_META.about)

const PAGE_JSONLD = JSON.stringify(
  buildJsonLd(
    webPageSchema({
      title:       PAGE_META.about.title,
      description: PAGE_META.about.description,
      url:         PAGE_META.about.canonical!,
      imageUrl:    OG_IMAGE.url,
    }),
    breadcrumbSchema([
      { name: 'Home',  url: SEO_BASE_URL },
      { name: 'About', url: PAGE_META.about.canonical! },
    ]),
  ),
)

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }}
      />

      <AboutHero />

      {ABOUT_SECTIONS.map((block, index) => (
        <AboutSplitSection key={block.id} block={block} index={index} />
      ))}

      {/* Closing CTA strip */}
      <section
        className="py-16 px-12 max-lg:px-6 text-center"
        style={{ background: '#080605', borderTop: '1px solid rgba(192,155,74,0.2)' }}
      >
        <p
          className="text-[10px] tracking-[0.38em] uppercase mb-4"
          style={{ color: 'var(--gl)' }}
        >
          Ready to Source?
        </p>
        <h2
          className="font-display font-light mb-6"
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(28px, 3.5vw, 44px)',
            color: 'rgba(255,255,255,0.88)',
          }}
        >
          Partner with Bhadohi&apos;s Finest Export House.
        </h2>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/contact"
            className="px-10 py-4 text-[11px] tracking-[0.2em] uppercase font-medium"
            style={{ background: 'var(--g)', color: 'var(--ink)' }}
          >
            Request B2B Quote
          </Link>
          <Link
            href="/products"
            className="px-10 py-4 text-[11px] tracking-[0.2em] uppercase font-medium border transition-colors duration-300 hover:border-[var(--g)] hover:text-[var(--gp)]"
            style={{ borderColor: 'rgba(192,155,74,0.35)', color: 'rgba(255,255,255,0.55)' }}
          >
            View Collections
          </Link>
        </div>
      </section>
    </>
  )
}
