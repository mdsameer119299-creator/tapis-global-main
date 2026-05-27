import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { buildMetadata } from '@/lib/metadata'
import { PAGE_META, SEO_BASE_URL, OG_IMAGE } from '@/lib/seo'
import {
  webPageSchema,
  breadcrumbSchema,
  buildJsonLd,
} from '@/lib/structured-data'
import PageHero from '@/components/layout/PageHero'

const Inquiry = dynamic(() => import('@/sections/Inquiry'))

export const metadata: Metadata = buildMetadata(PAGE_META.contact)

const PAGE_JSONLD = JSON.stringify(
  buildJsonLd(
    webPageSchema({
      title:       PAGE_META.contact.title,
      description: PAGE_META.contact.description,
      url:         PAGE_META.contact.canonical!,
      imageUrl:    OG_IMAGE.url,
    }),
    breadcrumbSchema([
      { name: 'Home',    url: SEO_BASE_URL },
      { name: 'Contact', url: PAGE_META.contact.canonical! },
    ]),
  ),
)

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }}
      />
      <PageHero
        eyebrow="Get in Touch"
        title={
          <>
            Request Your
            <br />
            <em style={{ fontStyle: 'italic', color: 'var(--gp)' }}>B2B Quote</em>
          </>
        }
        lead="Send us your requirements — our export team responds within 12 hours with pricing, sampling and lead time."
        image="/images/tgi-banner-5.png"
        imageAlt="Contact Tapis Global International — carpet exporter Bhadohi India"
      />
      <Inquiry />
    </>
  )
}
