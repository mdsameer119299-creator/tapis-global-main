# SEO Implementation Guide — Tapis Global International

## Files Added / Modified

```
lib/
  seo.ts               ← Brand config, all keywords, page-level meta strings
  structured-data.ts   ← JSON-LD schema builders (Organization, Product, FAQ etc.)
  metadata.ts          ← buildMetadata() factory function

app/
  layout.tsx           ← Root JSON-LD (Organization + LocalBusiness + WebSite)
  page.tsx             ← Page JSON-LD (WebPage + Breadcrumb + Product + FAQ)
  sitemap.ts           ← Auto-generates /sitemap.xml
  robots.ts            ← Auto-generates /robots.txt
  og/route.tsx         ← Dynamic OG image generator (needs @vercel/og)
  products/page.tsx    ← Example: per-page metadata
  about/page.tsx       ← Example: per-page metadata

components/seo/
  JsonLd.tsx           ← Reusable JSON-LD injector component

public/
  site.webmanifest     ← PWA manifest
```

---

## Schemas Implemented

| Schema Type        | Location         | Purpose                                    |
|--------------------|------------------|--------------------------------------------|
| Organization       | `layout.tsx`     | Core brand entity — triggers Knowledge Panel |
| LocalBusiness      | `layout.tsx`     | Maps / local search                        |
| WebSite            | `layout.tsx`     | Sitelinks search box potential             |
| WebPage            | Each page        | Page-level entity                          |
| BreadcrumbList     | Each page        | Breadcrumb rich results                    |
| Product            | Home + Products  | Product rich results in Shopping           |
| FAQPage            | Home             | FAQ accordion in SERPs                     |
| AggregateRating    | Home             | Star ratings in SERPs                      |

---

## Metadata Coverage

Every page exports:
- ✅ `<title>` — unique, keyword-rich, under 60 chars
- ✅ `<meta name="description">` — unique, CTA-driven, 140–160 chars
- ✅ `<meta name="keywords">` — tiered keyword strategy
- ✅ `<link rel="canonical">` — prevents duplicate content
- ✅ `og:title` / `og:description` / `og:image` / `og:url` / `og:type`
- ✅ `twitter:card` / `twitter:title` / `twitter:description` / `twitter:image`
- ✅ Robots directives (index/follow + Googlebot-specific)
- ✅ `hreflang` alternates (en-US, en-GB, x-default)
- ✅ Geo tags (for local/regional search engines)
- ✅ Dublin Core tags (B2B trade directory compatibility)
- ✅ Business contact data (Open Graph business extension)

---

## Adding Metadata to a New Page

```tsx
// app/your-page/page.tsx
import type { Metadata }  from 'next'
import { buildMetadata }  from '@/lib/metadata'
import { SEO_BASE_URL }   from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title:       'Your Page Title — Under 60 Characters',
  description: 'Compelling description with primary keyword. 140–160 chars max. Include a soft CTA.',
  keywords:    ['keyword 1', 'keyword 2', 'keyword 3'],
  canonical:   `${SEO_BASE_URL}/your-page`,
})
```

That's it. `buildMetadata()` auto-fills OG, Twitter, robots, alternates, geo, Dublin Core.

---

## Adding JSON-LD to a New Page

```tsx
import JsonLd from '@/components/seo/JsonLd'
import { webPageSchema, breadcrumbSchema, buildJsonLd } from '@/lib/structured-data'
import { SEO_BASE_URL, OG_IMAGE } from '@/lib/seo'

// In your page component:
<JsonLd schema={buildJsonLd(
  webPageSchema({ title, description, url: `${SEO_BASE_URL}/your-page`, imageUrl: OG_IMAGE.url }),
  breadcrumbSchema([
    { name: 'Home',      url: SEO_BASE_URL },
    { name: 'Your Page', url: `${SEO_BASE_URL}/your-page` },
  ]),
)} />
```

---

## Keyword Strategy

### Tier 1 — High commercial intent (buyers searching to purchase)
- `handmade carpet manufacturer India`
- `carpet exporter Bhadohi`
- `rug manufacturer India wholesale`
- `hand tufted carpet manufacturer`
- `hand knotted carpet exporter India`

### Tier 2 — Product-specific (category pages)
- `hand tufted carpets wholesale`
- `wool carpet manufacturer India`
- `hotel carpet manufacturer India`
- `custom rug manufacturer bulk`

### Tier 3 — Brand / location (brand awareness + local)
- `Tapis Global International`
- `carpet manufacturer Bhadohi India`
- `Bhadohi carpet exporter`
- `ISO certified carpet manufacturer India`

---

## Before Going Live — Checklist

### Required files
- [ ] Replace `/public/og/tapis-global-og.jpg` with real 1200×630px OG image
- [ ] Add `/public/favicon.ico`
- [ ] Add `/public/apple-touch-icon.png` (180×180px)
- [ ] Add `/public/icon-192.png`, `/public/icon-32x32.png`
- [ ] Add all PWA icons listed in `site.webmanifest`

### Domain
- [ ] Update `SEO_BASE_URL` in `lib/seo.ts` to your live domain
- [ ] Update `canonical` URLs in `PAGE_META` entries

### Google Search Console
- [ ] Verify ownership (add token to `verification.google` in `buildMetadata`)
- [ ] Submit `https://yourdomain.com/sitemap.xml`
- [ ] Request indexing for homepage

### Optional enhancements
- [ ] Install `@vercel/og` and uncomment `app/og/route.tsx` for dynamic OG images
- [ ] Add Google Analytics / GTM (update `next.config.js`)
- [ ] Enable `next/font` for better CLS on fonts
- [ ] Add `<link rel="preload">` for hero image

---

## Google Rich Results Testing

Test your JSON-LD schemas at:
- https://search.google.com/test/rich-results
- https://validator.schema.org

Paste your live URL or paste the JSON-LD directly.

Expected rich results once indexed:
- **FAQ accordion** from `FAQPage` schema (homepage SERPs)
- **Sitelinks** from `WebSite` schema
- **Knowledge Panel** from `Organization` schema (branded searches)
- **Product snippets** from `Product` schemas (product SERPs)
- **Star ratings** from `AggregateRating` (when real reviews added)
