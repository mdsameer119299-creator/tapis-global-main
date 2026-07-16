import type { Metadata } from 'next'
import Link from 'next/link'
import { buildMetadata } from '@/lib/metadata'
import { SEO_BASE_URL, OG_IMAGE } from '@/lib/seo'
import { webPageSchema, breadcrumbSchema, buildJsonLd } from '@/lib/structured-data'
import PageHero from '@/components/layout/PageHero'

const TITLE = 'Privacy Policy | Tapis Global International'
const DESCRIPTION =
  'Privacy policy for Tapis Global International Pvt Ltd — how we collect, use and protect enquiry and project information.'
const CANONICAL = `${SEO_BASE_URL}/privacy-policy`

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  canonical: CANONICAL,
  noIndex: false,
})

const PAGE_JSONLD = JSON.stringify(
  buildJsonLd(
    webPageSchema({ title: TITLE, description: DESCRIPTION, url: CANONICAL, imageUrl: OG_IMAGE.url }),
    breadcrumbSchema([
      { name: 'Home',           url: SEO_BASE_URL },
      { name: 'Privacy Policy', url: CANONICAL },
    ]),
  ),
)

export default function PrivacyPolicyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }} />
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        lead="How we handle your personal and project information."
        image="/images/tgi-banner-5.webp"
        imageAlt="Tapis Global International privacy policy"
        priority
      />
      <section className="section-pad max-w-3xl mx-auto prose-policy">
        <p className="text-[17px] leading-relaxed mb-6" style={{ color: 'var(--inks)' }}>
          Tapis Global International Pvt Ltd respects your privacy. Information submitted through our website
          enquiry forms is used solely to respond to your request, prepare quotations, samples and project documentation.
        </p>
        <h2 className="font-display text-2xl mb-3" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
          Information we collect
        </h2>
        <p className="text-[17px] leading-relaxed mb-6" style={{ color: 'var(--inks)' }}>
          Name, company, email, mobile number, location, project requirements and optional file attachments you choose to upload.
        </p>
        <h2 className="font-display text-2xl mb-3" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
          Contact
        </h2>
        <p className="text-[17px] leading-relaxed mb-8" style={{ color: 'var(--inks)' }}>
          For privacy-related questions, email{' '}
          <a href="mailto:sales@tapisglobalinternational.com" className="underline" style={{ color: 'var(--c)' }}>
            sales@tapisglobalinternational.com
          </a>.
        </p>
        <Link href="/" className="text-[15px] tracking-[0.14em] uppercase" style={{ color: 'var(--c)' }}>
          ← Back to home
        </Link>
      </section>
    </>
  )
}
