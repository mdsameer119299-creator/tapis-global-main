# Technical SEO Audit — Production (main @ eebb78c)

**Date:** 2026-07-12 · **Auditor role:** Senior Technical SEO / Next.js 14 App Router
**Production:** https://www.tapisglobalinternational.com
**Method:** static repo audit (`npm run seo:audit`) + live read-only audit (`npm run seo:audit:production`).

## 1. Route inventory
| Cluster | Route | Count | Sitemap | Indexable |
|---|---|---|---|---|
| Static/hubs | `/`, `/products`, `/industries`, `/solutions`, `/countries`, `/india`, `/dhurries`, `/company`, `/guides`, `/about`, `/gallery`, `/custom`, `/catalogue`, `/design-studio`, `/contact`, `/privacy-policy`, `/terms-and-conditions` | 17 | ✅ | ✅ |
| Products | `/products/[slug]` | 15 | ✅ all | ✅ |
| Industries | `/industries/[industry]` | 30 | ✅ all | ✅ |
| Solutions | `/solutions/[slug]` | 8 | ✅ all | ✅ |
| Countries | `/countries/[country]` | 29 | 23 (phased) | ✅ |
| India | `/india/[location]` | 17 | 7 (phased) | ✅ |
| Dhurries | `/dhurries/[slug]` | 18 | ✅ all | ✅ |
| Company | `/company/[slug]` | 10 | ✅ all | ✅ |
| Guides | `/guides/[slug]` | 22 | ✅ all | ✅ |
| **Sitemap total** | | **150** | | |

## 2. Redirects (`next.config.js`)
- `/samples` → `/design-studio` (301, permanent). Correctly **excluded** from sitemap.
- `/blogs` → `/guides` (301, permanent). Correctly **excluded** from sitemap. Note: `app/blogs/page.tsx` still exists but is **shadowed by the redirect** (dead code; its self-canonical `/blogs` is never served). *Low-priority cleanup; documented, not removed to avoid touching production.*
- These two account for the **3 "Page with redirect"** in GSC (plus likely a www/host variant). Expected, not a defect.

## 3. Robots / canonical / host
- `robots.ts`: allow `/`; disallow `/api/`, `/_next/`, `/admin/`, `/private/`; sitemap + host set. ✅
- Canonicals: self-referential per page via `buildMetadata`. Live audit: 40/40 sampled URLs had a canonical matching their own path. ✅
- hreflang: **removed** (PR #7) — country-targeted English pages are not localized language equivalents. ✅
- HTTPS + www enforced by host/domain config on Vercel; `SEO_BASE_URL = https://www.tapisglobalinternational.com`. No mixed www/non-www or http URLs in code.

## 4. Structured data
- Global (layout, all pages): Organization+Corporation, **LocalBusiness (Bhadohi facility only — real, physically addressed)**, WebSite. The sitewide LocalBusiness is the single genuine facility; it does **not** assert any per-city location.
- Per page: WebPage + BreadcrumbList + FAQPage; guides add Article; hubs add ItemList.
- **Breadcrumb: intrinsic safety** (PR #7): `breadcrumbSchema` null <2 crumbs; `buildJsonLd` strips a WebPage breadcrumb reference when no valid BreadcrumbList exists. **Live-verified**: `/india/delhi-ncr` WebPage.breadcrumb `@id` == BreadcrumbList `@id`, 3 items. The 18 GSC "Missing field itemListElement" are **historical** (pre-deploy).
- No Product/Offer/MerchantListing schema (correct for made-to-order B2B). No Review/AggregateRating. No fake ratings.

## 5. Duplicate / thin / cannibalization
- Duplicate exact H1 (pre-existing, production): `Tat Patti Manufacturer in India` (`/products/tat-patti` + `/dhurries/tat-patti-manufacturer`); `Why Bhadohi Is the Carpet Capital of India` (`/company/why-bhadohi` + `/guides/why-bhadohi-carpet-capital`). Reported as warnings; each page has distinct intent — recommend title/H1 differentiation in a content pass (not done here to avoid unrelated production edits).
- Near-duplicate content: worst-case cluster similarity (Jaccard) — countries 0.73 (bahrain/oman), india 0.58 (goa/kochi), solutions 0.23. All below the 0.90 fail / 0.74 warn gates.
- 282 advisory warnings = mostly title/description length on dhurries/company/guides.

## 6. Sitemap quality
- Phased (PR #7): no fake `lastModified`; only canonical, indexable, internally-linked pages. Live: 200 OK, 150 URLs. ✅
- No noindex/redirect/404 URLs in sitemap (static + live audits). ✅

## 7. Internal linking
- `LandingPage` renders bounded contextual links (up to hub, ≤5 related landings incl. `relatedIndia`, ≤5 products, 3 guides, CTAs). Navbar mega-menu links India + Export Markets + Industries + Solutions; footer links India + hubs. No orphan landing pages.

## 8. Forms / conversion infra (baseline)
- Enquiry pipeline exists: `lib/enquiry-{email,form,rate-limit,validation}.ts`, `lib/submit-enquiry.ts`, `app/api/enquiry/route.ts` (server validation + rate limiting).
- **No analytics** (GA4/Pixel/Clarity) in `main`. **Attribution/UTM + lead scoring live on the open PR #5** (`feat/b2b-lead-foundation`) — see §10.

## 9. Performance (static review)
- `next/image` used across landing/product components; hero video compressed (recent commit). Fonts via `lib/fonts`. Client components limited to nav/loader/sticky/WhatsApp. No obvious CWV regression introduced. Full Lighthouse pass deferred to a performance-focused change.

## 10. PR/branch hygiene (avoid duplication)
- **PR #7** merged (this baseline).
- **PR #6** (`seo/global-pan-india-expansion`) — superseded by #7; **should be closed**.
- **PR #5** (`feat/b2b-lead-foundation`) — contains a real lead-gen/analytics/attribution foundation but is **branched pre-#7**, so its diff reverts PR #7 (deletes `lib/india.ts`, `lib/countries.ts`, `scripts/seo-audit.mjs`). **Recommendation: rebase PR #5 onto current `main`** before merge. This branch deliberately does **not** reimplement lead-gen to avoid duplicating/contaminating that work.

## 11. This branch's changes (P0/P1, non-duplicative)
- Enhanced `scripts/seo-audit.mjs` with failing quality gates.
- Added `scripts/seo-audit-production.mjs` + `npm run seo:audit:production` (safe live audit).
- Added `scripts/seo-audit-production.test.mjs` + `npm run seo:audit:production:test` (behavior tests).
- Added `docs/INDEXATION-AUDIT.md`, `docs/COMMERCIAL-CLAIMS-REGISTER.md`, this file.

### Production audit semantics (strict by default — no false green)
`npm run seo:audit:production` is **read-only** (GET only, `redirect:'manual'`, per-request timeout via `AUDIT_TIMEOUT`, default 15s) and **strict by default**. Three distinct outcomes:

| Outcome | When | Exit |
|---|---|---|
| **PASS** | Production was reached, **every** sampled URL was inspected, and no critical error was found | `0` |
| **FAIL** | Production unreachable (network/DNS/timeout) **in strict mode**, OR sitemap non-2xx / unparseable / empty, OR any sampled URL could not be inspected (incomplete), OR a critical SEO error (non-200/redirect/noindex/canonical/multiple-H1/invalid-breadcrumb) | `1` |
| **SKIPPED** | **Only** with `--allow-offline` **and** production was truly unreachable. Prints `PRODUCTION AUDIT SKIPPED — OFFLINE MODE EXPLICITLY ENABLED`; never prints PASS | `0` |

- `npm run seo:audit:production` → strict; infrastructure failure **cannot** silently pass.
- `npm run seo:audit:production -- --allow-offline` → may SKIP (exit 0) **only** when unreachable; a reached-but-broken sitemap (non-2xx / unparseable / zero URLs) still **FAILS**.
- Checks per sampled URL: HTTP 200 (redirect/non-200 in sitemap = error), single self-referential canonical to the expected origin, meta-robots **and** `X-Robots-Tag` noindex (distinct from robots.txt crawl rules), exactly one `<h1>`, and BreadcrumbList validity incl. WebPage `breadcrumb` `@id` resolution.
- Sampling is deterministic: homepage first, then round-robin across every route cluster present in the sitemap (products, industries, solutions, countries, Phase-1 India, company, guides, dhurries, hubs). Bounded by `AUDIT_MAX` (default 60).
- Behavior is regression-tested by `scripts/seo-audit-production.test.mjs` (scenarios A–G) via a local mock server — no network or heavy deps.
