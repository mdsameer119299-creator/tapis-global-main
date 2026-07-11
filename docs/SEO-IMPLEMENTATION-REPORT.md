# SEO Implementation Report — Clean Global + Pan-India SEO

**Branch:** `clean-global-india-seo` (created fresh from latest `origin/main`)
**Supersedes:** PR #6 (contaminated with inherited/unrelated commits)
**Date:** 2026-07-11 · **Framework:** Next.js 14 App Router + TypeScript
**Production:** https://www.tapisglobalinternational.com — ⚠️ NOT deployed, NOT merged.

## 1. Problem with PR #6
PR #6 was based on `tapis-seo-ui-improvements`, so its diff against `main` carried **14 inherited commits** unrelated to global/India SEO (1800-word product long-form expansion, `CategoryDeepDive` changes, large `lib/dhurries.ts` expansion, guide changes, `.claude/launch.json` incl. a local `/Users/mohammadsameer/fei-urban-export` path). It also used export-history and hard payment-term wording on the new pages. It should not be merged as-is.

## 2. Clean branch strategy
Branched directly from the **latest `origin/main`** (base `0fba0f0`) and **re-implemented** only the intended SEO changes. No cherry-picking of contaminated commits. Result: a minimal diff that touches only SEO files.

## 3. SEO changes included
- **Intrinsic breadcrumb safety** (`lib/structured-data.ts`): `breadcrumbSchema` returns `null` for <2 valid crumbs with a matching `@id`; `faqSchema` returns `null` when empty; **`buildJsonLd` now strips the WebPage `breadcrumb` reference whenever the graph has no matching valid `BreadcrumbList`** — so the `#breadcrumb` reference can never dangle, without any caller passing `hasBreadcrumb:false`. (Verified deterministically.)
- **Sitemap** (`app/sitemap.ts`): removed the `new Date()` `lastModified` on every URL (now omitted — no fake freshness); **phased inclusion** of new clusters (see `docs/SEO-SITEMAP-ROLLOUT.md`).
- **hreflang** (`lib/metadata.ts`): removed `en-US`/`en-GB`/`x-default` self-alternates (country-targeted English pages are not localized language equivalents). Canonical preserved.
- **International expansion**: +17 country pages, capability-based wording.
- **Pan-India architecture**: `/india` hub + 17 city pages; `kind:'india'` + `relatedIndia` on the shared model; routes reuse `LandingHub`/`LandingPage`.
- **Internal linking**: `India` + `Export Markets` in the Navbar mega-menu; `India` in the footer; reciprocal `relatedIndia`/`relatedCountries` clusters.
- **SEO audit script** (`scripts/seo-audit.mjs`, `npm run seo:audit`): duplicate slugs / missing fields / invalid related refs / non-URL-safe slugs / **sitemap↔route resolution** as errors; duplicate titles/H1s/descriptions and length as warnings; phased-exclusions as notes.
- **Docs**: this report + claims audit + sitemap rollout.

## 4. Inherited / unrelated changes EXCLUDED
Not present in this branch's diff vs `main`: product long-form expansion, `CategoryDeepDive` changes, `lib/dhurries.ts` expansion, guide changes, `.claude/launch.json` (unmodified), and the `/Users/mohammadsameer/fei-urban-export` path (grep-verified absent from all tracked files). `.DS_Store` added to `.gitignore`.

## 5. Commercial claims corrected
New pages are **capability-based** and free of payment-term/currency, certification, capacity, export-history and per-city presence claims (see `docs/SEO-CLAIMS-AUDIT.md` §B). Pre-existing production claims are reported (§A) but not modified.

## 6. Country-page export claims fixed
Changed from *"We export handmade carpets and rugs from Bhadohi to X"* → *"We manufacture handmade carpets and rugs to order in Bhadohi for buyers and projects in X."* FAQs changed from *"Do you export to X?"* → *"Can you supply buyers and projects in X?"* answered with capability wording.

## 7. India content
Priority pages (Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Pune, Bhadohi) carry market-specific commercial context (IT corridors, hospitality, heritage-luxury, government, ports, etc.). Repeated boilerplate reduced (varied intro/overview/FAQ phrasing; lead time stated as made-to-order, confirmed per enquiry — no fixed promise). No LocalBusiness schema for any city; Bhadohi is the only city described as a physical base (accurate).

## 8. Sitemap rollout strategy
Phase 1 in the sitemap: `/india` + 7 India cities; 12 existing + 11 new countries (23). Phase 2 (routes live, not in sitemap): 10 India cities + 6 countries. See `docs/SEO-SITEMAP-ROLLOUT.md`.

## 9. Validation results
| Check | Command | Result |
|---|---|---|
| TypeScript | `npx tsc --noEmit` | ✅ exit 0 |
| Lint | `npx next lint` | ✅ No ESLint warnings or errors |
| Build | `npm run build` | ✅ exit 0 — 17 India + 29 country pages prerendered |
| SEO audit | `npm run seo:audit` | ✅ 0 errors (149 URLs; 282 advisory warnings, 2 phased notes) |
| Breadcrumb (intrinsic) | direct schema check | ✅ ref==@id on normal page; ref stripped when breadcrumb <2 items |
| Sitemap | built `sitemap.xml` | ✅ phased subset only; **0** `lastmod` entries |

## 10. Route / link validation
- No duplicate slugs; no invalid related-page references (audit-enforced).
- Sitemap contains only URLs that resolve to real routes (audit-enforced); no redirected/404 URLs listed.
- Canonicals are self-referential (`/india/<slug>`, `/countries/<slug>`); no country-page is treated as a language variant (hreflang removed).
- Every India/country page is internally linked (hub grid + reciprocal related links + nav/footer) — no orphans.

## 11. Known limitations / follow-up
- **Pre-existing claims** (ISO/OEKO/GoodWeave/"45+ countries"/"80,000 sq ft"/employees/payment terms in LocalBusiness) remain live — company verification pass needed (claims audit §A).
- **`/blogs`** is an indexable placeholder page that is not in the sitemap and not internally linked (pre-existing on `main`). Recommend either `noindex` until it has content, or add content + link + sitemap entry. Left unchanged here to avoid touching unrelated production content.
- **Two pre-existing duplicate H1s** (`tat-patti` product vs dhurrie; `why-bhadohi` company vs guide) are reported by the audit as warnings; not fixed here (they live in production files outside this PR's scope).
- **Phase-2** India/country pages await promotion into the sitemap once Phase-1 indexes.
