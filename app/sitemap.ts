// app/sitemap.ts
// Next.js App Router auto-generates /sitemap.xml from this file.
// Add new routes here as you build them out.

import type { MetadataRoute } from 'next'
import { SEO_BASE_URL } from '@/lib/seo'
import { getAllProductSlugs } from '@/lib/products'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()

  // ── Static pages ─────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url:              SEO_BASE_URL,
      lastModified:     now,
      changeFrequency:  'weekly',
      priority:         1.0,
    },
    {
      url:              `${SEO_BASE_URL}/products`,
      lastModified:     now,
      changeFrequency:  'weekly',
      priority:         0.9,
    },
    {
      url:              `${SEO_BASE_URL}/about`,
      lastModified:     now,
      changeFrequency:  'monthly',
      priority:         0.8,
    },
    {
      url:              `${SEO_BASE_URL}/gallery`,
      lastModified:     now,
      changeFrequency:  'weekly',
      priority:         0.8,
    },
    {
      url:              `${SEO_BASE_URL}/blogs`,
      lastModified:     now,
      changeFrequency:  'weekly',
      priority:         0.75,
    },
    {
      url:              `${SEO_BASE_URL}/custom`,
      lastModified:     now,
      changeFrequency:  'monthly',
      priority:         0.9,
    },
    {
      url:              `${SEO_BASE_URL}/catalogue`,
      lastModified:     now,
      changeFrequency:  'monthly',
      priority:         0.85,
    },
    {
      url:              `${SEO_BASE_URL}/design-studio`,
      lastModified:     now,
      changeFrequency:  'weekly',
      priority:         0.9,
    },
    {
      url:              `${SEO_BASE_URL}/contact`,
      lastModified:     now,
      changeFrequency:  'monthly',
      priority:         0.7,
    },
    {
      url:              `${SEO_BASE_URL}/privacy-policy`,
      lastModified:     now,
      changeFrequency:  'yearly',
      priority:         0.3,
    },
    {
      url:              `${SEO_BASE_URL}/terms-and-conditions`,
      lastModified:     now,
      changeFrequency:  'yearly',
      priority:         0.3,
    },
  ]

  const productPages: MetadataRoute.Sitemap = getAllProductSlugs().map(slug => ({
    url:             `${SEO_BASE_URL}/products/${slug}`,
    lastModified:    now,
    changeFrequency: 'monthly' as const,
    priority:        0.85,
  }))

  return [...staticPages, ...productPages]
}
