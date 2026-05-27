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

const GalleryGrid = dynamic(() => import('@/sections/gallery/GalleryGrid'))

export const metadata: Metadata = buildMetadata(PAGE_META.gallery)

const PAGE_JSONLD = JSON.stringify(
  buildJsonLd(
    webPageSchema({
      title:       PAGE_META.gallery.title,
      description: PAGE_META.gallery.description,
      url:         PAGE_META.gallery.canonical!,
      imageUrl:    OG_IMAGE.url,
    }),
    breadcrumbSchema([
      { name: 'Home',    url: SEO_BASE_URL },
      { name: 'Gallery', url: PAGE_META.gallery.canonical! },
    ]),
  ),
)

export default function GalleryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }}
      />
      <PageHero
        eyebrow="Our Work"
        title={
          <>
            Craft That
            <br />
            <em style={{ fontStyle: 'italic', color: 'var(--gp)' }}>Speaks</em> for Itself
          </>
        }
        lead="Handcrafted carpets and rugs from our Bhadohi factory — installed across hotels, residences and bespoke commissions worldwide."
        image="/images/tgi-banner-4.png"
        imageAlt="Handmade carpet gallery — Tapis Global International"
        priority
      />
      <GalleryGrid />
    </>
  )
}
