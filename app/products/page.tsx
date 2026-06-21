import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { PAGE_META, SEO_BASE_URL, OG_IMAGE } from '@/lib/seo'
import {
  webPageSchema,
  breadcrumbSchema,
  itemListSchema,
  buildJsonLd,
} from '@/lib/structured-data'
import { PRODUCT_CATEGORIES } from '@/lib/products'
import ProductsHero from '@/components/products/ProductsHero'
import CategoryGrid from '@/components/products/CategoryGrid'

export const metadata: Metadata = buildMetadata(PAGE_META.products)

const PAGE_JSONLD = JSON.stringify(
  buildJsonLd(
    webPageSchema({
      title:       PAGE_META.products.title,
      description: PAGE_META.products.description,
      url:         PAGE_META.products.canonical!,
      imageUrl:    OG_IMAGE.url,
    }),
    breadcrumbSchema([
      { name: 'Home',     url: SEO_BASE_URL },
      { name: 'Products', url: PAGE_META.products.canonical! },
    ]),
    // ItemList of category pages — valid, warning-free hub markup
    // (no ecommerce Product/Offer fields required).
    itemListSchema(
      PRODUCT_CATEGORIES.map((cat) => ({
        name: cat.name,
        url:  `${SEO_BASE_URL}/products/${cat.slug}`,
      })),
    ),
  ),
)

export default function ProductsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }}
      />
      <ProductsHero />
      <CategoryGrid />
    </>
  )
}
