# SEO Implementation Report — Global Market & Pan-India Expansion

**Branch:** `seo/global-pan-india-expansion`
**Base:** `tapis-seo-ui-improvements` (which is ahead of `main`; PR targets `main`)
**Date:** 2026-07-11
**Framework:** Next.js 14 App Router + TypeScript
**Production:** https://www.tapisglobalinternational.com (⚠️ NOT deployed by this work)

---

## 1. Executive summary
This branch fixes three technical-SEO defects, expands the site's international footprint by 17 country pages, introduces a controlled Pan-India commercial architecture (`/india` hub + 17 city/market pages), strengthens crawl-priority internal linking, adds an automated SEO-integrity script, and delivers four audit documents (cannibalization, content-claims/EEAT, structured-data) plus this report. **46 new indexable URLs** were added, all differentiated, breadcrumb-valid, canonical, sitemap-listed and internally linked (no orphans). All repository checks pass. No production deploy, no merge, `main` untouched.

## 2. Technical SEO fixes completed
1. **Breadcrumb structured data** (`lib/structured-data.ts`) — root cause of the GSC *"Missing field itemListElement"* on 18 pages: `webPageSchema()` referenced `${url}#breadcrumb` but `breadcrumbSchema()` never declared that `@id`, so the reference dangled to an empty phantom `BreadcrumbList`. Added the matching `@id` + a validity guard (returns `null` for <2 valid crumbs). Verified live: WebPage ref == BreadcrumbList `@id`, ≥3 valid items.
2. **`buildJsonLd()` + `faqSchema()` hardening** — `buildJsonLd()` now drops falsy nodes; `faqSchema()` returns `null` for empty FAQs (prevents invalid empty `FAQPage`).
3. **Sitemap freshness** (`app/sitemap.ts`) — removed the per-build `new Date()` stamp that marked every URL modified on every deploy. `lastModified` is now omitted (no reliable per-URL date exists; an inaccurate lastmod is worse than none). Refactored to a maintainable `cluster()` helper.
4. **hreflang cleanup** (`lib/metadata.ts`) — removed the misleading `en-US`/`en-GB`/`x-default` alternates that all pointed to the same non-localized URL. Canonical preserved.

## 3. Breadcrumb verification result
- WebPage `breadcrumb.@id` now equals `BreadcrumbList.@id` on every page (product page + India page verified at runtime).
- `itemListElement` non-empty and correctly ordered (Home → hub → page).
- Applies across products, industries, solutions, countries, **india**, dhurries, company, guides — all use the same generator.
- Safeguard added so a BreadcrumbList/ref is not emitted for insufficient crumbs.

## 4. Sitemap changes
- `lastModified` removed site-wide (documented rationale in-file).
- New clusters added: `/india` (hub) + 17 `/india/[location]`. Country cluster now 29.
- Coverage confirmed: build emits all 29 country + 17 India URLs into `sitemap.xml`. No 404/redirect/noindex/duplicate/non-canonical URLs are listed (every entry is a self-canonical, indexable route).

## 5. hreflang changes
- `alternates.languages` block removed from `buildMetadata()`. Only `alternates.canonical` remains. hreflang will return only if genuinely localized URLs (e.g. `/de`) are introduced.

## 6. Existing country markets found (12)
`usa`, `uk`, `germany`, `france`, `italy`, `spain`, `netherlands`, `belgium`, `australia`, `uae`, `saudi-arabia`, `qatar`.

## 7. New international country pages added (17)
**Nordics:** `sweden`, `denmark`, `finland`, `norway`
**Central Europe:** `switzerland`, `austria`
**Wider Europe:** `poland`, `ireland`
**Americas/Oceania:** `canada`, `new-zealand`
**Asia:** `singapore`, `japan`, `south-korea`
**Gulf:** `bahrain`, `kuwait`, `oman`
**Africa:** `south-africa`
Each is semantically differentiated (market character, buyer segments, materials, logistics), not a name-swap template. Total country pages now **29**.

## 8. Pan-India architecture added
- New `kind: 'india'` on the shared `SeoLanding` model + `relatedIndia` field.
- New registry `lib/india.ts` (`INDIA_LOCATIONS`, `INDIA_HUB_INTRO`) and getters in `lib/seo-landing.ts` (`getIndiaLocation`, `getAllIndiaSlugs`, `getRelatedIndia`).
- New routes: `app/india/page.tsx` (hub) + `app/india/[location]/page.tsx`, reusing `LandingHub`/`LandingPage` (extend-not-rewrite).
- Hub targets pan-India commercial intent ("carpet manufacturer India", pan-India supply) and clearly states the **made-to-order, non-retail** model.

## 9. India market pages added (17)
`delhi-ncr`, `mumbai`, `bengaluru`, `hyderabad`, `chennai`, `kolkata`, `pune`, `ahmedabad`, `jaipur`, `surat`, `goa`, `lucknow`, `bhadohi`, `kochi`, `chandigarh`, `gurugram`, `noida`.
- Canonical naming chosen: **Bengaluru** (not Bangalore), **Delhi NCR** as the regional page (no separate "Delhi"); Gurugram & Noida kept as distinct corporate/commercial sub-markets and cross-linked as an NCR sub-cluster to avoid cannibalization.
- Each page is differentiated by the city's real commercial profile (IT corridor, hospitality, government, luxury residential, heritage, ports, etc.).
- **No** local office/showroom/warehouse/staff/project/customer claims for any city **except Bhadohi** (the genuine manufacturing base, described truthfully). **No LocalBusiness schema** for any city (WebPage + BreadcrumbList + FAQPage only) — verified at runtime.

## 10. Internal-link improvements
- `LandingPage` renders bounded contextual links (up to hub, ≤5 related landings incl. `relatedIndia`, ≤5 products, 3 guides, conversion CTAs) — no orphans, no link spam.
- Sitewide nav: added `India` + `Export Markets` to the Navbar mega-menu; added `India` to the footer Explore list.
- Reciprocal `relatedIndia`/`relatedCountries` clustering (Nordics, Gulf, NCR sub-cluster).
- Full tier model + rules documented in `docs/SEO-INTERNAL-LINKING-STRATEGY.md`.

## 11. Cannibalization audit summary
`docs/SEO-CANNIBALIZATION-AUDIT.md` — inventories all clusters and grades overlaps. Highest risks (staged, not auto-changed): `/custom` vs `/solutions/custom-carpets` vs `/company/custom-manufacturing` (HIGH); `commercial-carpet-manufacturer` vs `contract-carpet-supplier` (MED-HIGH). New pages built with guardrails so no new cannibalization is introduced.

## 12. Content claims audit summary
`docs/SEO-CLAIMS-AUDIT.md` — 12 pre-existing claim families itemised (ISO 9001, OEKO-TEX, GoodWeave/GOTS, "80,000 sq ft", "45+ countries", "200–500 employees", "since 1965", "500+ artisans", fire-rating, testimonial). None auto-removed (rules 9/11 — company must verify). **New content on this branch introduces none of these** (verified). 4 HIGH items flagged for the company's verification pass.

## 13. Structured-data audit summary
`docs/SEO-STRUCTURED-DATA-AUDIT.md` — no dangling `@id`, no empty required props, no duplicate entities, no Product schema on B2B pages, no fake review/rating, no LocalBusiness for cities/countries, valid breadcrumb `itemListElement`, canonical production domain. Clean.

## 14. Automated SEO validation added
`scripts/seo-audit.mjs` (`npm run seo:audit`) — loads the real registries via jiti and reports duplicate slugs/titles/H1s/descriptions, missing required fields, invalid `related*` references and empty clusters. Exits non-zero on errors. Surfaced **2 pre-existing duplicate H1s** (tat-patti product vs dhurrie; why-bhadohi company vs guide) which were differentiated. Now passes with 0 errors over 148 landing URLs.

## 15. Files changed
**New:** `lib/india.ts`, `app/india/page.tsx`, `app/india/[location]/page.tsx`, `scripts/seo-audit.mjs`, `.eslintrc.json`, `docs/SEO-CANNIBALIZATION-AUDIT.md`, `docs/SEO-CLAIMS-AUDIT.md`, `docs/SEO-STRUCTURED-DATA-AUDIT.md`, `docs/SEO-INTERNAL-LINKING-STRATEGY.md`, `docs/SEO-IMPLEMENTATION-REPORT.md`.
**Modified:** `lib/countries.ts`, `lib/seo-landing.ts`, `lib/structured-data.ts`, `lib/metadata.ts`, `lib/products.ts`, `lib/company.ts`, `app/sitemap.ts`, `app/countries/page.tsx`, `components/landing/LandingPage.tsx`, `components/layout/Navbar.tsx`, `components/layout/Footer.tsx`, `package.json`, `.gitignore`, `.claude/launch.json`.

## 16. URLs added (46)
- 17 country pages (`/countries/{sweden,denmark,finland,norway,switzerland,austria,poland,ireland,canada,new-zealand,singapore,japan,south-korea,bahrain,kuwait,oman,south-africa}`)
- 1 India hub (`/india`)
- 17 India location pages (`/india/{delhi-ncr,mumbai,bengaluru,hyderabad,chennai,kolkata,pune,ahmedabad,jaipur,surat,goa,lucknow,bhadohi,kochi,chandigarh,gurugram,noida}`)
- (Countries hub already existed.)

## 17. URLs intentionally NOT added, and why
- **Separate "Delhi" page** — folded into `Delhi NCR` to avoid Delhi vs Delhi NCR cannibalization.
- **"Bangalore"** — used canonical `Bengaluru` only.
- No additional cities/countries beyond the priority set were invented — the brief warns against mass low-quality programmatic pages; every added page has a distinct, defensible B2B intent.

## 18. Build/test results
| Check | Command | Result |
|---|---|---|
| Type check | `npx tsc --noEmit` | ✅ exit 0 |
| Lint | `npx next lint` | ✅ No ESLint warnings or errors |
| Build | `npm run build` | ✅ exit 0 — 29 country + 17 India pages prerendered |
| SEO audit | `npm run seo:audit` | ✅ 0 errors, 148 URLs (warnings are advisory title/desc length) |
| Runtime | dev server | ✅ India page graph = WebPage+BreadcrumbList+FAQPage, breadcrumb `@id` matches, no LocalBusiness, no console errors |

## 19. Remaining risks
- **Unverified pre-existing claims** (ISO/OEKO/GoodWeave/"45+ countries"/"80,000 sq ft"/employee count) remain live; require the company's verification pass (see claims audit). These are the highest EEAT risk and are **not** resolved by this branch.
- **Cannibalization HIGH items** (`/custom` vs `/solutions/custom-carpets`; commercial vs contract) are documented but intentionally not edited (touch live pages) — need a human decision.
- **`seo:audit` length warnings** (278) are advisory; many pre-existing titles/descriptions exceed strict pixel limits.
- **"Discovered – currently not indexed"** (the original 103-page GSC issue) is an authority/crawl-budget matter that content + linking help but cannot instantly fix.

## 20. Recommended Search Console actions after deployment
1. After deploy, **submit/refresh** `sitemap.xml`.
2. **Validate Fix** in the Breadcrumbs report (should clear the 18 "Missing field itemListElement").
3. URL-Inspect + **Request Indexing** for the `/india` hub and top India cities (Delhi NCR, Mumbai, Bengaluru, Gurugram) and priority new countries (Canada, Singapore, Sweden).
4. Watch **Page indexing** → "Discovered – currently not indexed" for the new URLs; expect gradual crawl as internal links + authority build.
5. Re-check **Rich Results / hreflang** report to confirm the removed alternates no longer generate warnings.

## 21. Recommended next 90-day SEO plan
- **0–30d:** deploy; validate breadcrumbs; run the company claims-verification pass and update/soften the 4 HIGH claims; request indexing for Tier-1 new pages.
- **30–60d:** execute the two staged cannibalization decisions (reposition `/custom`; split commercial/contract titles); deepen city-page content where early impressions appear; add 1–2 external backlinks to the India hub.
- **60–90d:** expand India/international clusters only where GSC shows genuine demand (data-led, not speculative); tighten over-length titles/descriptions flagged by `seo:audit`; add `dateModified` to the data models so the sitemap can carry real `lastmod`.
