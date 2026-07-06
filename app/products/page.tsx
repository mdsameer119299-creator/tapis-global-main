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
import HubGuidance from '@/components/leads/HubGuidance'
import LeadSection from '@/components/leads/LeadSection'

export const metadata: Metadata = buildMetadata(PAGE_META.products)

const PRODUCTS_GUIDANCE = {
  eyebrow: 'How to choose',
  heading: 'Match the construction to how the space is used',
  intro:
    'The right carpet depends on traffic, budget, look and how it will be installed. Use this as a quick orientation before you request a quote — sharing these decisions up front lets us specify accurately and price your project the first time.',
  points: [
    {
      title: 'Construction: tufted, knotted or flat-woven',
      body: 'Hand-tufted carpets balance design freedom and cost and suit most interiors; hand-knotted pieces are the most durable and collectible; flat-weaves (dhurries, kilims) are reversible and lighter. Choose by durability needed, look and budget.',
    },
    {
      title: 'Material: wool, viscose or blends',
      body: 'Wool is resilient and naturally soil-resistant for high-traffic areas; viscose/art-silk adds sheen for low-traffic, decorative pieces; blends trade some durability for price. Match the fibre to the room, not just the look.',
    },
    {
      title: 'Sizes, custom and wall-to-wall',
      body: 'Rugs can be made to standard or bespoke sizes; broadloom and carpet tiles suit continuous commercial floors. Custom colour, pattern and size are available — tell us the exact dimensions and any installation constraints.',
    },
    {
      title: 'What to include in your enquiry',
      body: 'Construction and material, size or area (sqm), quantity, destination country/port and timeline. The more specific you are, the faster we can turn around an accurate quote or sample plan.',
    },
  ],
  links: [
    { href: '/guides/hand-tufted-vs-hand-knotted-carpet', label: 'Hand-tufted vs hand-knotted', note: 'which construction fits' },
    { href: '/guides/wool-vs-viscose-carpets', label: 'Wool vs viscose', note: 'choosing the fibre' },
    { href: '/guides/handmade-vs-machine-made-carpets', label: 'Handmade vs machine-made' },
    { href: '/guides/how-custom-rug-manufacturing-works', label: 'How custom rug development works' },
    { href: '/products/hand-tufted-carpet', label: 'Hand Tufted Carpets' },
    { href: '/products/hand-knotted-carpet', label: 'Hand Knotted Carpets' },
    { href: '/products/wall-to-wall-carpets', label: 'Wall-to-Wall & Broadloom' },
    { href: '/products/carpet-tiles', label: 'Carpet Tiles' },
  ],
}

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
      <HubGuidance {...PRODUCTS_GUIDANCE} />
      <LeadSection source="/products" heading="Request a quote or catalogue" />
    </>
  )
}
