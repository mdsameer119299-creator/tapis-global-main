// app/robots.ts
// Next.js App Router auto-generates /robots.txt from this file.

import type { MetadataRoute } from 'next'
import { SEO_BASE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Allow all crawlers
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/admin/',
          '/private/',
        ],
      },
      {
        // GPTBot — allow indexing for AI search (Bing / Copilot)
        // Comment out to block ChatGPT training data usage
        userAgent: 'GPTBot',
        allow: '/',
      },
    ],
    sitemap:  `${SEO_BASE_URL}/sitemap.xml`,
    host:     SEO_BASE_URL,
  }
}
