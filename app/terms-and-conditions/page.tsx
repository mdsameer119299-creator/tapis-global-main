import type { Metadata } from 'next'
import Link from 'next/link'
import { buildMetadata } from '@/lib/metadata'
import { SEO_BASE_URL, OG_IMAGE } from '@/lib/seo'
import { webPageSchema, breadcrumbSchema, buildJsonLd } from '@/lib/structured-data'
import PageHero from '@/components/layout/PageHero'

const TITLE = 'Terms & Conditions | Tapis Global International'
const DESCRIPTION =
  'Terms and conditions for enquiries, quotations and supply from Tapis Global International Pvt Ltd, carpet manufacturer Bhadohi, India.'
const CANONICAL = `${SEO_BASE_URL}/terms-and-conditions`

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  canonical: CANONICAL,
})

const PAGE_JSONLD = JSON.stringify(
  buildJsonLd(
    webPageSchema({ title: TITLE, description: DESCRIPTION, url: CANONICAL, imageUrl: OG_IMAGE.url }),
    breadcrumbSchema([
      { name: 'Home',               url: SEO_BASE_URL },
      { name: 'Terms & Conditions', url: CANONICAL },
    ]),
  ),
)

export default function TermsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }} />
      <PageHero
        eyebrow="Legal"
        title="Terms & Conditions"
        lead="Standard terms governing enquiries and commercial discussions."
        image="/images/tgi-banner-5.webp"
        imageAlt="Tapis Global International terms and conditions"
        priority
      />
      <section className="section-pad max-w-3xl mx-auto">
        <p className="text-[17px] leading-relaxed mb-6" style={{ color: 'var(--inks)' }}>
          By submitting an enquiry on this website, you confirm that the information provided is accurate and that you
          authorise Tapis Global International Pvt Ltd to contact you regarding carpets, rugs, flooring and related services.
        </p>
        <p className="text-[17px] leading-relaxed mb-6" style={{ color: 'var(--inks)' }}>
          Quotations, lead times, specifications and pricing are subject to confirmation in writing. Production commences
          only upon agreed purchase order, sampling approval and payment terms.
        </p>
        <p className="text-[17px] leading-relaxed mb-8" style={{ color: 'var(--inks)' }}>
          Images and content on this website are proprietary. Unauthorised reproduction is prohibited.
        </p>
        <Link href="/" className="text-[15px] tracking-[0.14em] uppercase" style={{ color: 'var(--c)' }}>
          ← Back to home
        </Link>
      </section>
    </>
  )
}
