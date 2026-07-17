import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { SEO_BASE_URL, OG_IMAGE } from '@/lib/seo'
import { webPageSchema, breadcrumbSchema, itemListSchema, buildJsonLd } from '@/lib/structured-data'
import { getAllMaterialsForHub } from '@/lib/materials-content'
import ReferenceHub from '@/components/reference/ReferenceHub'

export const metadata: Metadata = buildMetadata({
  title: 'Carpet & Rug Materials Guide | Fibres Explained — Tapis Global',
  description: 'A complete guide to carpet and rug materials — wool, viscose, silk, jute, sisal, leather and more. Advantages, care and typical applications for each fibre. Manufactured in Bhadohi, India.',
  keywords: ['carpet materials guide', 'rug fibre guide', 'wool vs viscose', 'natural fibre rugs', 'carpet material types'],
  canonical: `${SEO_BASE_URL}/materials`,
})

const PAGE_JSONLD = JSON.stringify(
  buildJsonLd(
    webPageSchema({
      title: 'Carpet & Rug Materials Guide — Tapis Global International',
      description: 'Every material Tapis Global manufactures with — properties, advantages, care and applications.',
      url: `${SEO_BASE_URL}/materials`,
      imageUrl: OG_IMAGE.url,
    }),
    breadcrumbSchema([
      { name: 'Home', url: SEO_BASE_URL },
      { name: 'Materials', url: `${SEO_BASE_URL}/materials` },
    ]),
    itemListSchema(getAllMaterialsForHub().map((m) => ({ name: m.name, url: `${SEO_BASE_URL}/materials/${m.id}` }))),
  ),
)

export default function MaterialsHub() {
  const items = getAllMaterialsForHub()
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }} />
      <ReferenceHub
        eyebrow="Materials Guide"
        title="Carpet &"
        titleEm="Rug Materials"
        intro="Every fibre we manufacture with, explained — properties, advantages, care and where each material is commonly used. Manufacturer-verified, capability-safe guidance for architects, designers and buyers."
        basePath="/materials"
        heroImage="/images/wool-drying-pic.webp"
        items={items.map((m) => ({ id: m.id, name: m.name, blurb: m.blurb, heroImage: m.heroImage, tag: m.positioning }))}
      />
    </>
  )
}
