import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { buildMetadata } from '@/lib/metadata'
import { SEO_BASE_URL } from '@/lib/seo'
import {
  webPageSchema,
  breadcrumbSchema,
  faqSchema,
  buildJsonLd,
} from '@/lib/structured-data'
import { getSolution, getAllSolutionSlugs } from '@/lib/seo-landing'
import LandingPage from '@/components/landing/LandingPage'

type Props = { params: { slug: string } }

export function generateStaticParams() {
  return getAllSolutionSlugs().map((slug) => ({ slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const page = getSolution(params.slug)
  if (!page) return {}
  return buildMetadata({
    title:       page.seoTitle,
    description: page.seoDescription,
    keywords:    page.seoKeywords,
    canonical:   `${SEO_BASE_URL}/solutions/${page.slug}`,
  })
}

export default function SolutionPage({ params }: Props) {
  const page = getSolution(params.slug)
  if (!page) notFound()

  const url = `${SEO_BASE_URL}/solutions/${page.slug}`
  const PAGE_JSONLD = JSON.stringify(
    buildJsonLd(
      webPageSchema({
        title:       page.seoTitle,
        description: page.seoDescription,
        url,
        imageUrl:    `${SEO_BASE_URL}${page.heroImage}`,
      }),
      breadcrumbSchema([
        { name: 'Home',       url: SEO_BASE_URL },
        { name: 'Solutions',  url: `${SEO_BASE_URL}/solutions` },
        { name: page.label,   url },
      ]),
      faqSchema(page.faqs.map((f) => ({ q: f.q, a: f.a }))),
    ),
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }} />
      <LandingPage page={page} />
    </>
  )
}
