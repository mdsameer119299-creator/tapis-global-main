import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { PAGE_META, SEO_BASE_URL, OG_IMAGE } from '@/lib/seo'
import {
  webPageSchema,
  breadcrumbSchema,
  faqSchema,
  buildJsonLd,
} from '@/lib/structured-data'
import { CUSTOM_FAQ } from '@/lib/custom'
import CustomHero from '@/components/custom/CustomHero'
import CustomIntro from '@/components/custom/CustomIntro'
import CustomGallery from '@/components/custom/CustomGallery'
import CustomForm from '@/components/custom/CustomForm'
import CustomTrust from '@/components/custom/CustomTrust'
import CustomProcess from '@/components/custom/CustomProcess'
import CustomTestimonials from '@/components/custom/CustomTestimonials'
import CustomFAQ from '@/components/custom/CustomFAQ'
import CustomFinalCTA from '@/components/custom/CustomFinalCTA'

export const metadata: Metadata = buildMetadata(PAGE_META.custom)

const PAGE_JSONLD = JSON.stringify(
  buildJsonLd(
    webPageSchema({
      title:       PAGE_META.custom.title,
      description: PAGE_META.custom.description,
      url:         PAGE_META.custom.canonical!,
      imageUrl:    OG_IMAGE.url,
    }),
    breadcrumbSchema([
      { name: 'Home',   url: SEO_BASE_URL },
      { name: 'Custom', url: PAGE_META.custom.canonical! },
    ]),
    faqSchema(
      CUSTOM_FAQ.map((f) => ({ q: f.q, a: f.a })),
    ),
  ),
)

export default function CustomPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }}
      />
      <CustomHero />
      <CustomIntro />
      <CustomGallery />
      <CustomForm />
      <CustomTrust />
      <CustomProcess />
      <CustomTestimonials />
      <CustomFAQ />
      <CustomFinalCTA />
    </>
  )
}
