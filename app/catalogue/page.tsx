import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { PAGE_META, SEO_BASE_URL, OG_IMAGE } from '@/lib/seo'
import {
  webPageSchema,
  breadcrumbSchema,
  buildJsonLd,
} from '@/lib/structured-data'
import CatalogueHero from '@/components/catalogue/CatalogueHero'
import CatalogueForm from '@/components/catalogue/CatalogueForm'
import CatalogueWhy from '@/components/catalogue/CatalogueWhy'
import CataloguePreview from '@/components/catalogue/CataloguePreview'
import CatalogueTrust from '@/components/catalogue/CatalogueTrust'

export const metadata: Metadata = buildMetadata(PAGE_META.catalogue)

const PAGE_JSONLD = JSON.stringify(
  buildJsonLd(
    webPageSchema({
      title:       PAGE_META.catalogue.title,
      description: PAGE_META.catalogue.description,
      url:         PAGE_META.catalogue.canonical!,
      imageUrl:    OG_IMAGE.url,
    }),
    breadcrumbSchema([
      { name: 'Home',      url: SEO_BASE_URL },
      { name: 'Catalogue', url: PAGE_META.catalogue.canonical! },
    ]),
  ),
)

export default function CataloguePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }}
      />
      <CatalogueHero />
      <CatalogueForm />
      <CatalogueWhy />
      <CataloguePreview />
      <CatalogueTrust />
    </>
  )
}
