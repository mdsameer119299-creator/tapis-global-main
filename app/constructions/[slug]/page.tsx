import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { buildMetadata } from '@/lib/metadata'
import { SEO_BASE_URL } from '@/lib/seo'
import { webPageSchema, breadcrumbSchema, faqSchema, buildJsonLd } from '@/lib/structured-data'
import { TARA_CONSTRUCTIONS } from '@/lib/tara/knowledge/constructions'
import { getAllConstructionSlugs, getConstructionPage } from '@/lib/constructions-content'
import ConstructionDetailView from '@/components/constructions/ConstructionDetailView'

type Props = { params: { slug: string } }

export function generateStaticParams() {
  return getAllConstructionSlugs().map((slug) => ({ slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const page = getConstructionPage(params.slug)
  if (!page) return {}
  return buildMetadata({
    title: page.meta.seoTitle,
    description: page.meta.seoDescription,
    keywords: page.meta.seoKeywords,
    canonical: page.canonical,
  })
}

export default function ConstructionPage({ params }: Props) {
  const page = getConstructionPage(params.slug)
  if (!page) notFound()
  const construction = TARA_CONSTRUCTIONS.find((c) => c.id === params.slug)!
  const profile = construction.profile!

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
        { name: 'Constructions', url: `${SEO_BASE_URL}/constructions` },
        { name: construction.name, url: page.canonical },
      ]),
      faqSchema([
        { q: `What is ${construction.name} rug construction?`, a: profile.description },
        { q: `How is ${construction.name} made?`, a: profile.method },
        { q: `How do I care for a ${construction.name} rug?`, a: profile.maintenance },
      ]),
    ),
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }} />
      <ConstructionDetailView construction={construction} meta={page.meta} />
    </>
  )
}
