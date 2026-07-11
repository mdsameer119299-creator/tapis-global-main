// app/sitemap.ts
// Next.js App Router auto-generates /sitemap.xml from this file.
//
// lastModified policy
// ───────────────────
// We intentionally OMIT `lastModified`. None of the content models
// (products, industries, solutions, countries, india, dhurries, company,
// guides) carry a real, stable modification date, and the previous
// implementation stamped `new Date()` on every URL on every build — which
// told Google that the entire site changed on each deploy (noise that erodes
// trust in the signal). Per Google guidance, an inaccurate lastmod is worse
// than none, so we omit it until a genuine per-URL content date exists (e.g.
// a `dateModified` field on the data models or a CMS). When that lands, set
// `lastModified` from that real value in the relevant mapper below.
//
// changeFrequency / priority are retained as coarse, honest hints only; they
// are not a substitute for the internal-linking architecture that actually
// drives crawl prioritisation (see docs/SEO-INTERNAL-LINKING-STRATEGY.md).

import type { MetadataRoute } from 'next'
import { SEO_BASE_URL } from '@/lib/seo'
import { getAllProductSlugs } from '@/lib/products'
import {
  getAllIndustrySlugs,
  getAllSolutionSlugs,
  getAllCountrySlugs,
  getAllDhurrieSlugs,
  getAllCompanySlugs,
  getAllIndiaSlugs,
} from '@/lib/seo-landing'
import { getAllGuideSlugs } from '@/lib/guides'

type Entry = MetadataRoute.Sitemap[number]
type Freq = NonNullable<Entry['changeFrequency']>

/** Build entries for a dynamic cluster: `${base}/${slug}` at a fixed priority. */
function cluster(base: string, slugs: string[], priority: number, changeFrequency: Freq = 'monthly'): MetadataRoute.Sitemap {
  return slugs.map((slug) => ({
    url: `${SEO_BASE_URL}${base}/${slug}`,
    changeFrequency,
    priority,
  }))
}

export default function sitemap(): MetadataRoute.Sitemap {
  // ── Static / hub pages ───────────────────────────────────────────────────
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
    { url: `${SEO_BASE_URL}/about`,                 changeFrequency: 'monthly', priority: 0.8  },
    { url: `${SEO_BASE_URL}/gallery`,               changeFrequency: 'weekly',  priority: 0.8  },
    { url: `${SEO_BASE_URL}/custom`,                changeFrequency: 'monthly', priority: 0.9  },
    { url: `${SEO_BASE_URL}/catalogue`,             changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SEO_BASE_URL}/design-studio`,         changeFrequency: 'weekly',  priority: 0.9  },
    { url: `${SEO_BASE_URL}/contact`,               changeFrequency: 'monthly', priority: 0.7  },
    { url: `${SEO_BASE_URL}/privacy-policy`,        changeFrequency: 'yearly',  priority: 0.3  },
    { url: `${SEO_BASE_URL}/terms-and-conditions`,  changeFrequency: 'yearly',  priority: 0.3  },
  ]

  return [
    ...staticPages,
    ...cluster('/products',   getAllProductSlugs(),   0.85),
    ...cluster('/industries', getAllIndustrySlugs(),  0.8),
    ...cluster('/solutions',  getAllSolutionSlugs(),  0.8),
    ...cluster('/countries',  getAllCountrySlugs(),   0.75),
    ...cluster('/india',      getAllIndiaSlugs(),     0.8),
    ...cluster('/dhurries',   getAllDhurrieSlugs(),   0.8),
    ...cluster('/company',    getAllCompanySlugs(),   0.7),
    ...cluster('/guides',     getAllGuideSlugs(),     0.7),
  ]
}
