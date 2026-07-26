import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { buildMetadata } from '@/lib/metadata'
import { SEO_BASE_URL } from '@/lib/seo'
import { webPageSchema, breadcrumbSchema, faqSchema, buildJsonLd } from '@/lib/structured-data'
import { TARA_MATERIALS } from '@/lib/tara/knowledge/materials'
import { DURABILITY_WORDS, ratingWord } from '@/lib/tara/knowledge/types'
import { getAllMaterialSlugs, getMaterialPage } from '@/lib/materials-content'
import MaterialDetailView from '@/components/materials/MaterialDetailView'

type Props = { params: { slug: string } }

export function generateStaticParams() {
  return getAllMaterialSlugs().map((slug) => ({ slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const page = getMaterialPage(params.slug)
  if (!page) return {}
  return buildMetadata({
    title: page.meta.seoTitle,
    description: page.meta.seoDescription,
    keywords: page.meta.seoKeywords,
    canonical: page.canonical,
  })
}

export default function MaterialPage({ params }: Props) {
  const page = getMaterialPage(params.slug)
  if (!page) notFound()
  const material = TARA_MATERIALS.find((m) => m.id === params.slug)!
  const profile = material.profile!

  const PAGE_JSONLD = JSON.stringify(
    buildJsonLd(
      webPageSchema({
        title: page.meta.seoTitle,
        description: page.meta.seoDescription,
        url: page.canonical,
        imageUrl: `${SEO_BASE_URL}${page.meta.heroImage}`,
      }),
      breadcrumbSchema([
        { name: 'Home', url: SEO_BASE_URL },
        { name: 'Materials', url: `${SEO_BASE_URL}/materials` },
        { name: material.name, url: page.canonical },
      ]),
      faqSchema([
        { q: `What is ${material.name} rug material like?`, a: profile.description },
        { q: `What are the advantages of ${material.name}?`, a: profile.advantages.join('; ') + '.' },
        { q: `What is ${material.name} commonly used for?`, a: `${material.name} is commonly used for ${profile.typicalApplications.join(', ').toLowerCase()}.` },
        { q: `How durable is ${material.name} compared to other rug fibres?`, a: `${material.name} is generally considered ${ratingWord(DURABILITY_WORDS, profile.durability)} for durability. ${profile.disadvantages[0] ?? ''}`.trim() },
        { q: `How do I care for a ${material.name} rug?`, a: profile.maintenance },
      ]),
    ),
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }} />
      <MaterialDetailView material={material} meta={page.meta} />
    </>
  )
}
