import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { buildMetadata } from '@/lib/metadata'
import { PAGE_META, SEO_BASE_URL, OG_IMAGE } from '@/lib/seo'
import {
  webPageSchema,
  breadcrumbSchema,
  buildJsonLd,
} from '@/lib/structured-data'
import PageHero from '@/components/layout/PageHero'

const BlogGrid = dynamic(() => import('@/sections/blogs/BlogGrid'))

export const metadata: Metadata = buildMetadata(PAGE_META.blogs)

const PAGE_JSONLD = JSON.stringify(
  buildJsonLd(
    webPageSchema({
      title:       PAGE_META.blogs.title,
      description: PAGE_META.blogs.description,
      url:         PAGE_META.blogs.canonical!,
      imageUrl:    OG_IMAGE.url,
    }),
    breadcrumbSchema([
      { name: 'Home',  url: SEO_BASE_URL },
      { name: 'Blogs', url: PAGE_META.blogs.canonical! },
    ]),
  ),
)

export default function BlogsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }}
      />
      <PageHero
        eyebrow="Blog"
        title={
          <>
            Stories, Guides
            <br />
            <em style={{ fontStyle: 'italic', color: 'var(--gp)' }}>& Industry Insights</em>
          </>
        }
        lead="Expert perspectives on handmade carpets, export sourcing, hospitality projects and the craft behind every Tapis Global collection."
        image="/images/tgi-banner-3.webp"
        imageAlt="Carpet manufacturing and design insights — Tapis Global International blog"
        priority
      />
      <BlogGrid />
    </>
  )
}
