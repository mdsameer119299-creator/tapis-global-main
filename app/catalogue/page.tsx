import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { buildMetadata } from '@/lib/metadata'
import { PAGE_META, SEO_BASE_URL, OG_IMAGE } from '@/lib/seo'
import {
  webPageSchema,
  breadcrumbSchema,
  buildJsonLd,
} from '@/lib/structured-data'
import CatalogueHero from '@/components/catalogue/CatalogueHero'

const CatalogueForm = dynamic(() => import('@/components/catalogue/CatalogueForm'))
const CatalogueWhy = dynamic(() => import('@/components/catalogue/CatalogueWhy'))
const CataloguePreview = dynamic(() => import('@/components/catalogue/CataloguePreview'))
const CatalogueTrust = dynamic(() => import('@/components/catalogue/CatalogueTrust'))

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
