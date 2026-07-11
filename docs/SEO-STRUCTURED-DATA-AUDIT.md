# Structured Data (JSON-LD) Audit — Tapis Global International

**Date:** 2026-07-11
**Branch:** `seo/global-pan-india-expansion`
**Files:** `lib/structured-data.ts` (generators), `app/layout.tsx` (global graph), per-route `page.tsx` (page graphs).

---

## 1. Schema inventory

| Type | Generator | Where emitted | `@id` |
|---|---|---|---|
| Organization + Corporation | `organizationSchema()` | layout (sitewide) | `#organization` |
| LocalBusiness | `localBusinessSchema()` | layout (sitewide) | `#localbusiness` |
| WebSite | `websiteSchema()` | layout (sitewide) | `#website` |
| WebPage | `webPageSchema()` | every content route | `${url}#webpage` |
| BreadcrumbList | `breadcrumbSchema()` | every content route | `${url}#breadcrumb` |
| FAQPage | `faqSchema()` | product/industry/solution/country/india/company/dhurrie pages | (anon) |
| Article | `articleSchema()` | `/guides/[slug]` | `${url}#article` |
| ItemList | `itemListSchema()` | hub pages (/products, /countries, /india, …) | (anon) |
| ContactPage | `contactPageSchema()` | `/contact` | `#contactpage` |

---

## 2. Findings against the Phase 9 checklist

### ✅ 1. No dangling `@id` references
All references resolve:
- `#organization`, `#website`, `#localbusiness` are emitted by `app/layout.tsx` on **every** page, so the many `{ '@id': …/#organization }` / `#website` references (from WebPage, WebSite, LocalBusiness, ContactPage, Article) always resolve.
- `WebPage.breadcrumb → ${url}#breadcrumb` now resolves to `BreadcrumbList.@id = ${url}#breadcrumb` — **this was the original bug** (WebPage referenced an `@id` the BreadcrumbList never declared, producing "Missing field itemListElement"). **Fixed** in `breadcrumbSchema()`.
- `Article.mainEntityOfPage → ${url}#webpage` resolves — `/guides/[slug]` emits both `webPageSchema()` and `articleSchema()` in the same graph (verified).

### ✅ 2. No empty required properties
- `breadcrumbSchema()` returns **null** when < 2 valid crumbs (avoids single-item/empty `itemListElement`).
- `faqSchema()` returns **null** when there are 0 valid Q&A pairs (avoids an empty `mainEntity` FAQPage). **Added this branch.**
- `buildJsonLd()` filters out null/undefined nodes, so a null generator result can never crash the graph or emit an empty node.

### ✅ 3. No duplicate / conflicting entities
- Single `#organization` node (typed `["Organization","Corporation"]`), single `#website`, single `#localbusiness`, one `#webpage` + one `#breadcrumb` per page. No duplicate `@id`s within a graph.

### ✅ 4. No Product schema on generic B2B pages
- Product/Offer schema was **removed sitewide** (documented in code). Category pages use WebPage + BreadcrumbList + FAQPage; hubs use ItemList. Correct for a quote-based B2B catalogue (no public price/availability), and avoids Merchant/Product-snippet warnings.

### ✅ 5. No fake review / rating schema
- No `Review`, `AggregateRating`, `ratingValue` or `reviewCount` anywhere. `aggregateRatingSchema` was previously removed (self-serving ratings are a Google violation). The homepage testimonial is **plain marketing text, not Review schema** — correct (flagged separately in the claims audit for attribution).

### ✅ 6. No LocalBusiness for cities/countries without a physical location
- The **only** LocalBusiness node is the genuine Bhadohi manufacturing facility (in the sitewide graph).
- New `/india/[location]` and `/countries/[country]` pages emit **only** WebPage + BreadcrumbList + FAQPage — **no** LocalBusiness, no per-city GeoCoordinates, no fabricated local presence. This is deliberate and enforced in the route files.

### ✅ 7. BreadcrumbList `itemListElement` valid
- Every breadcrumb has ≥2 `ListItem`s with `position`, `name`, `item`, and a matching `@id`. Verified live earlier (WebPage ref == BreadcrumbList `@id`, 3 items on a product page).

### ✅ 8. Canonical production domain
- All schema URLs derive from `SEO_BASE_URL = https://www.tapisglobalinternational.com`. No localhost/staging URLs.

---

## 3. Claim-bearing schema (cross-reference to claims audit)
Some JSON-LD **content** repeats unverified claims (not a validity defect, but an EEAT/accuracy risk):
- `organizationSchema()` — "since 1965", "third-generation", "export programmes to 45+ countries", `numberOfEmployees` 200–500.
- Default FAQ (`DEFAULT_FAQS`) — "ISO 9001:2015 certified", "OEKO-TEX", "GOTS-eligible", "45+ countries".

These are **pre-existing** and are itemised in `docs/SEO-CLAIMS-AUDIT.md` (items 1–7). Not edited here per working rules 9/11; staged for the company's claims-verification pass. If the certifications/figures cannot be verified, update these two generators alongside the page copy.

---

## 4. Changes made on this branch
1. `breadcrumbSchema()` — added matching `@id` + validity guard (fixes the GSC "Missing field itemListElement" error and hardens against thin/empty breadcrumbs).
2. `faqSchema()` — null guard against empty FAQPage.
3. `buildJsonLd()` — drops falsy nodes so generators can safely opt out.
4. New India/country routes — WebPage + BreadcrumbList + FAQPage only; **no** LocalBusiness for cities/countries.

No schema-validity defects remain. Residual items are content-accuracy (claims), tracked in the claims audit.
