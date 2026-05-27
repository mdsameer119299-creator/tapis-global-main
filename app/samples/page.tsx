import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { buildMetadata } from '@/lib/metadata'
import { PAGE_META, SEO_BASE_URL, OG_IMAGE } from '@/lib/seo'
import {
  webPageSchema,
  breadcrumbSchema,
  buildJsonLd,
} from '@/lib/structured-data'
import SamplesHero from '@/sections/samples/SamplesHero'

const SamplesStrip   = dynamic(() => import('@/sections/samples/SamplesStrip'))
const SamplesCatalog = dynamic(() => import('@/sections/samples/SamplesCatalog'))

export const metadata: Metadata = buildMetadata(PAGE_META.samples)

const PAGE_JSONLD = JSON.stringify(
  buildJsonLd(
    webPageSchema({
      title:       PAGE_META.samples.title,
      description: PAGE_META.samples.description,
      url:         PAGE_META.samples.canonical!,
      imageUrl:    OG_IMAGE.url,
    }),
    breadcrumbSchema([
      { name: 'Home',    url: SEO_BASE_URL },
      { name: 'Color', url: PAGE_META.samples.canonical! },
    ]),
  ),
)

export default function SamplesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }}
      />
      <SamplesHero />
      <SamplesStrip />
      <SamplesCatalog />
    </>
  )
}
