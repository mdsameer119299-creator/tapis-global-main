import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { buildMetadata } from '@/lib/metadata'
import { SEO_BASE_URL } from '@/lib/seo'
import {
  webPageSchema,
  breadcrumbSchema,
  productSchema,
  faqSchema,
  buildJsonLd,
} from '@/lib/structured-data'
import {
  getProductCategory,
  getAllProductSlugs,
} from '@/lib/products'
import CategorySidebar from '@/components/products/CategorySidebar'
import CategoryHero from '@/components/products/CategoryHero'
import CategoryContent from '@/components/products/CategoryContent'
import CategoryTrustSignals from '@/components/products/CategoryTrustSignals'
import CategoryApplications from '@/components/products/CategoryApplications'
import CategoryManufacturing from '@/components/products/CategoryManufacturing'
import CategorySpecs from '@/components/products/CategorySpecs'
import CategoryGallery from '@/components/products/CategoryGallery'
import CategoryFAQ from '@/components/products/CategoryFAQ'
import CategoryCTA from '@/components/products/CategoryCTA'
import RelatedProducts from '@/components/products/RelatedProducts'
import CategoryWhyUs from '@/components/products/CategoryWhyUs'

type Props = {
  params: { slug: string }
}

export function generateStaticParams() {
  return getAllProductSlugs().map((slug) => ({ slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const category = getProductCategory(params.slug)
  if (!category) return {}

  return buildMetadata({
    title:       category.seoTitle,
    description: category.seoDescription,
    keywords:    category.seoKeywords,
    canonical:   `${SEO_BASE_URL}/products/${category.slug}`,
  })
}

export default function ProductCategoryPage({ params }: Props) {
  const category = getProductCategory(params.slug)
  if (!category) notFound()

  const PAGE_JSONLD = JSON.stringify(
    buildJsonLd(
      webPageSchema({
        title:       category.seoTitle,
        description: category.seoDescription,
        url:         `${SEO_BASE_URL}/products/${category.slug}`,
        imageUrl:    `${SEO_BASE_URL}${category.heroImage}`,
      }),
      breadcrumbSchema([
        { name: 'Home',     url: SEO_BASE_URL },
        { name: 'Products', url: `${SEO_BASE_URL}/products` },
        { name: category.name, url: `${SEO_BASE_URL}/products/${category.slug}` },
      ]),
      productSchema({
        name:        `${category.name} — Manufacturer & Supplier India, Tapis Global International`,
        description: category.intro,
        imageUrl:    `${SEO_BASE_URL}${category.cardImage}`,
        url:         `${SEO_BASE_URL}/products/${category.slug}`,
        material:    category.materials.join(', '),
        moq:         category.moq,
      }),
      faqSchema(category.faqs.map((f) => ({ q: f.q, a: f.a }))),
    ),
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }}
      />

      <div
        className="flex flex-col lg:flex-row gap-0 lg:gap-10 px-6 lg:px-10 py-8 lg:py-12 max-w-[1400px] mx-auto"
        style={{ background: 'var(--iv)' }}
      >
        <CategorySidebar activeSlug={category.slug} />

        <div className="flex-1 min-w-0 rounded-xl overflow-hidden" style={{ border: '1px solid var(--bd)' }}>
          <CategoryHero category={category} />
          <CategoryContent category={category} />
          <CategoryTrustSignals />
          <CategoryApplications category={category} />
          <CategoryManufacturing category={category} />
          <CategorySpecs category={category} />
          <CategoryGallery images={category.gallery} title={category.name} />
          <CategoryFAQ category={category} />
          <CategoryCTA category={category} />
          <RelatedProducts slug={category.slug} />
          <CategoryWhyUs />
        </div>
      </div>
    </>
  )
}
