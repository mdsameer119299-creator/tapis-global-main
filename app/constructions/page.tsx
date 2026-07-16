import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { SEO_BASE_URL, OG_IMAGE } from '@/lib/seo'
import { webPageSchema, breadcrumbSchema, itemListSchema, buildJsonLd } from '@/lib/structured-data'
import { getAllConstructionsForHub } from '@/lib/constructions-content'
import ReferenceHub from '@/components/reference/ReferenceHub'

export const metadata: Metadata = buildMetadata({
  title: 'Carpet & Rug Construction Guide | Weaving Methods — Tapis Global',
  description: 'A complete guide to carpet and rug constructions — hand-knotted, hand-tufted, flatweave, kilim, dhurrie and more. Method, traffic suitability and care for each. Manufactured in Bhadohi, India.',
  keywords: ['carpet construction guide', 'rug weaving methods', 'hand knotted vs hand tufted', 'flatweave carpet guide', 'carpet construction types'],
  canonical: `${SEO_BASE_URL}/constructions`,
})

const PAGE_JSONLD = JSON.stringify(
  buildJsonLd(
    webPageSchema({
      title: 'Carpet & Rug Construction Guide — Tapis Global International',
      description: 'Every construction method Tapis Global manufactures with — how it is made, traffic suitability, pile and care.',
      url: `${SEO_BASE_URL}/constructions`,
      imageUrl: OG_IMAGE.url,
    }),
    breadcrumbSchema([
      { name: 'Home', url: SEO_BASE_URL },
      { name: 'Constructions', url: `${SEO_BASE_URL}/constructions` },
    ]),
    itemListSchema(getAllConstructionsForHub().map((c) => ({ name: c.name, url: `${SEO_BASE_URL}/constructions/${c.id}` }))),
  ),
)

export default function ConstructionsHub() {
  const items = getAllConstructionsForHub()
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }} />
      <ReferenceHub
        eyebrow="Construction Guide"
        title="Carpet &"
        titleEm="Rug Constructions"
        intro="Every weaving and tufting method we manufacture with, explained — how it is made, traffic suitability, pile and care. Manufacturer-verified, capability-safe guidance for architects, designers and buyers."
        basePath="/constructions"
        heroImage="/images/knotted/knotted-01.webp"
        items={items.map((c) => ({ id: c.id, name: c.name, blurb: c.blurb, heroImage: c.heroImage }))}
      />
    </>
  )
}
