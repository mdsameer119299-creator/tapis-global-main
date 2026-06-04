import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { buildMetadata } from '@/lib/metadata'
import { PAGE_META, SEO_BASE_URL, OG_IMAGE } from '@/lib/seo'
import {
  webPageSchema,
  breadcrumbSchema,
  buildJsonLd,
} from '@/lib/structured-data'
import DesignStudioHero from '@/components/design-studio/DesignStudioHero'
import DesignStudioSubNav from '@/components/design-studio/DesignStudioSubNav'
import ColorLibrary from '@/components/design-studio/ColorLibrary'
import DesignStudioFeatures from '@/components/design-studio/DesignStudioFeatures'
import DesignStudioHowItWorks from '@/components/design-studio/DesignStudioHowItWorks'
import DesignStudioCTA from '@/components/design-studio/DesignStudioCTA'

const SamplesStrip   = dynamic(() => import('@/sections/samples/SamplesStrip'))
const SamplesCatalog = dynamic(() => import('@/sections/samples/SamplesCatalog'))

export const metadata: Metadata = buildMetadata(PAGE_META.designStudio)

const PAGE_JSONLD = JSON.stringify(
  buildJsonLd(
    webPageSchema({
      title:       PAGE_META.designStudio.title,
      description: PAGE_META.designStudio.description,
      url:         PAGE_META.designStudio.canonical!,
      imageUrl:    OG_IMAGE.url,
    }),
    breadcrumbSchema([
      { name: 'Home',          url: SEO_BASE_URL },
      { name: 'Design Studio', url: PAGE_META.designStudio.canonical! },
    ]),
  ),
)

export default function DesignStudioPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }}
      />
      <DesignStudioHero />
      <DesignStudioSubNav />
      <ColorLibrary />
      <DesignStudioFeatures />
      <DesignStudioHowItWorks />
      <DesignStudioCTA />
      <SamplesStrip />
      <SamplesCatalog />
    </>
  )
}
