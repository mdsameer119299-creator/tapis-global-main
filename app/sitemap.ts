// app/sitemap.ts
// Next.js App Router auto-generates /sitemap.xml from this file.
//
// lastModified policy
// ───────────────────
// `lastModified` is intentionally OMITTED. None of the content models carry a
// real modification date, and stamping `new Date()` on every URL (the previous
// behaviour) told Google the whole site changed on every deploy — an inaccurate
// signal that is worse than none. Add `lastModified` only when a genuine
// per-URL content date exists (e.g. a `dateModified` field on the data models).
//
// Phased rollout
// ──────────────
// GSC currently shows many "Discovered – currently not indexed" URLs, so we do
// NOT expose every new landing page at once. New clusters are rolled out in
// phases (see docs/SEO-SITEMAP-ROLLOUT.md). Excluded pages still exist as valid,
// crawlable routes and are internally linked — they are simply not yet listed in
// the sitemap. Existing/production pages are retained.

import type { MetadataRoute } from 'next'
import { SEO_BASE_URL } from '@/lib/seo'
import { getAllProductSlugs } from '@/lib/products'
import {
  getAllIndustrySlugs,
  getAllSolutionSlugs,
  getAllCountrySlugs,
  getAllDhurrieSlugs,
  getAllCompanySlugs,
} from '@/lib/seo-landing'
import { getAllGuideSlugs } from '@/lib/guides'
import { getPublishedArticleSlugs } from '@/lib/knowledge/content'
import { getAllMaterialSlugs } from '@/lib/materials-content'
import { getAllConstructionSlugs } from '@/lib/constructions-content'

type Entry = MetadataRoute.Sitemap[number]
type Freq = NonNullable<Entry['changeFrequency']>

// ── Phased-rollout allow/deny lists ──────────────────────────────────────────
// India: only Phase-1 city pages are listed (all India routes still build).
const INDIA_SITEMAP_SLUGS = ['delhi-ncr', 'mumbai', 'bengaluru', 'hyderabad', 'chennai', 'pune', 'bhadohi']
// International: existing markets stay; among the newly added markets only the
// Phase-1 set is listed. The Phase-2 new markets below are excluded for now.
const COUNTRY_SITEMAP_EXCLUDE = new Set(['austria', 'ireland', 'new-zealand', 'japan', 'south-korea', 'south-africa'])

function cluster(base: string, slugs: string[], priority: number, changeFrequency: Freq = 'monthly'): MetadataRoute.Sitemap {
  return slugs.map((slug) => ({ url: `${SEO_BASE_URL}${base}/${slug}`, changeFrequency, priority }))
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SEO_BASE_URL,                            changeFrequency: 'weekly',  priority: 1.0  },
    { url: `${SEO_BASE_URL}/products`,              changeFrequency: 'weekly',  priority: 0.9  },
    { url: `${SEO_BASE_URL}/industries`,            changeFrequency: 'weekly',  priority: 0.9  },
    { url: `${SEO_BASE_URL}/solutions`,             changeFrequency: 'weekly',  priority: 0.9  },
    { url: `${SEO_BASE_URL}/countries`,             changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${SEO_BASE_URL}/india`,                 changeFrequency: 'weekly',  priority: 0.9  },
    { url: `${SEO_BASE_URL}/dhurries`,              changeFrequency: 'weekly',  priority: 0.9  },
    { url: `${SEO_BASE_URL}/company`,               changeFrequency: 'monthly', priority: 0.8  },
    { url: `${SEO_BASE_URL}/guides`,                changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${SEO_BASE_URL}/knowledge`,             changeFrequency: 'weekly',  priority: 0.8  },
    { url: `${SEO_BASE_URL}/materials`,             changeFrequency: 'monthly', priority: 0.8  },
    { url: `${SEO_BASE_URL}/constructions`,         changeFrequency: 'monthly', priority: 0.8  },
    { url: `${SEO_BASE_URL}/glossary`,              changeFrequency: 'monthly', priority: 0.7  },
    { url: `${SEO_BASE_URL}/about`,                 changeFrequency: 'monthly', priority: 0.8  },
    { url: `${SEO_BASE_URL}/gallery`,               changeFrequency: 'weekly',  priority: 0.8  },
    { url: `${SEO_BASE_URL}/custom`,                changeFrequency: 'monthly', priority: 0.9  },
    { url: `${SEO_BASE_URL}/catalogue`,             changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SEO_BASE_URL}/design-studio`,         changeFrequency: 'weekly',  priority: 0.9  },
    { url: `${SEO_BASE_URL}/contact`,               changeFrequency: 'monthly', priority: 0.7  },
    { url: `${SEO_BASE_URL}/privacy-policy`,        changeFrequency: 'yearly',  priority: 0.3  },
    { url: `${SEO_BASE_URL}/terms-and-conditions`,  changeFrequency: 'yearly',  priority: 0.3  },
  ]

  const countrySlugs = getAllCountrySlugs().filter((s) => !COUNTRY_SITEMAP_EXCLUDE.has(s))

  return [
    ...staticPages,
    ...cluster('/products',   getAllProductSlugs(),   0.85),
    ...cluster('/industries', getAllIndustrySlugs(),  0.8),
    ...cluster('/solutions',  getAllSolutionSlugs(),  0.8),
    ...cluster('/countries',  countrySlugs,           0.75),
    ...cluster('/india',      INDIA_SITEMAP_SLUGS,    0.8),
    ...cluster('/dhurries',   getAllDhurrieSlugs(),   0.8),
    ...cluster('/company',    getAllCompanySlugs(),   0.7),
    ...cluster('/guides',     getAllGuideSlugs(),     0.7),
    ...cluster('/knowledge',  getPublishedArticleSlugs(), 0.7),
    ...cluster('/materials',     getAllMaterialSlugs(),     0.75),
    ...cluster('/constructions', getAllConstructionSlugs(), 0.75),
  ]
}
