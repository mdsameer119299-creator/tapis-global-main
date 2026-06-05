# Tapis Global — Production Audit Checklist

**Project:** `tapis-global-main` (Next.js 14)  
**Audit date:** 2026-06-05  
**Status:** Audit complete — fixes applied 2026-06-05 (build passing)

---

## Phase 1 — Mobile Responsive

| ID | Severity | Issue | Location |
|----|----------|-------|----------|
| M1 | High | Who We Are badge uses `-right-6` — overflows viewport on iPhone SE | `sections/WhoWeAre.tsx` |
| M2 | Medium | Home `Contact.tsx` uses `px-12` without mobile override (contact page uses Inquiry with better padding) | `sections/Contact.tsx` (if used) |
| M3 | Low | Hero established badge hidden on mobile (`max-lg:hidden`) — trust signal only in chip | `sections/Hero.tsx` |
| M4 | Low | Trust ribbon horizontal scroll intentional; items not aligned to Phase 9 trust copy | `components/home/TrustRibbon.tsx` |
| M5 | Pass | `overflow-x: hidden` on body, mobile nav drawer, touch-target utilities present | `styles/globals.css` |
| M6 | Pass | Footer uses responsive grid and `footer-container` clamp padding | `components/layout/Footer.tsx` |

---

## Phase 2 — Premium Mobile UX

| ID | Severity | Issue | Location |
|----|----------|-------|----------|
| U1 | Pass | Mobile menu drawer + backdrop + animation classes | `Navbar.tsx`, `globals.css` |
| U2 | Pass | Hero uses `clamp()` typography and stacked CTAs | `sections/Hero.tsx` |
| U3 | High | Contact form: no mobile field; email required only; inline success (no modal) | `sections/Contact.tsx` |
| U4 | High | Inquiry form requires **both** email and mobile (should be OR) | `lib/enquiry-validation.ts`, `sections/Inquiry.tsx` |
| U5 | Medium | Form inputs need explicit `min-h-[48px]` on mobile for touch | `EnquiryTextField`, `Contact` FormField |

---

## Phase 3–4 — SEO Metadata

| ID | Severity | Issue | Location |
|----|----------|-------|----------|
| S1 | High | Home title/description do not match specified copy | `lib/seo.ts` `PAGE_META.home` |
| S2 | Medium | `BRAND.established` = 1994 vs `SITE.established` = 1998 (inconsistent) | `lib/seo.ts`, `lib/data.ts`, `app/og/route.tsx` |
| S3 | Pass | Per-page metadata via `buildMetadata` on all main routes | `app/*/page.tsx` |
| S4 | Pass | Open Graph + Twitter + canonical in `lib/metadata.ts` |
| S5 | Low | Google Search Console verification placeholders empty | `lib/metadata.ts` |

---

## Phase 5 — Structured Data

| ID | Severity | Issue | Location |
|----|----------|-------|----------|
| D1 | High | **Manufacturer** schema not implemented | — |
| D2 | High | **ContactPage** schema not on contact route | `app/contact/page.tsx` |
| D3 | Medium | `WebSite` `SearchAction` points to `/search` (404) | `lib/structured-data.ts` |
| D4 | Pass | Organization, LocalBusiness, WebSite, Breadcrumb, Product, FAQ in layout/pages |
| D5 | Risk | `AggregateRating` without visible reviews — rich-result policy risk | `app/page.tsx` |

---

## Phase 6 — Google Indexing

| ID | Severity | Issue | Location |
|----|----------|-------|----------|
| I1 | Pass | Dynamic `sitemap.ts` + `robots.ts` |
| I2 | High | Footer links to `/privacy-policy` and `/terms-and-conditions` — **pages missing** | `Footer.tsx` |
| I3 | Medium | No `favicon.ico` (PNG only); favicon has dark box not transparent monogram | `public/logos/`, `scripts/generate-favicon.mjs` |
| I4 | Pass | `site.webmanifest` + apple-touch + metadata icons |

---

## Phase 7–8 — Performance & Core Web Vitals

| ID | Severity | Issue | Location |
|----|----------|-------|----------|
| P1 | Critical | Header logo `tgi-header-logo1.png` ~1 MB — hurts LCP | `public/logos/` |
| P2 | High | Hero/gallery images use `quality={85–95}`; some `sizes="100vw"` on below-fold | Multiple sections |
| P3 | Pass | AVIF/WebP formats in production, lazy loading, dynamic imports on home |
| P4 | Pass | Custom cursor hidden on touch (`hover: none`) |
| P5 | Medium | Loader component may delay FCP — verify necessity | `components/layout/Loader.tsx` |

*Note: PageSpeed 95+/90+ requires production deploy + image asset optimization beyond CSS-only fixes.*

---

## Phase 9 — Trust Signals

| ID | Severity | Issue | Location |
|----|----------|-------|----------|
| T1 | Medium | Trust ribbon shows certifications, not user-specified trust lines (Est. 1998, Made in Bhadohi, etc.) | `lib/home.ts` |

---

## Phase 10 — Contact & Lead Generation

| ID | Severity | Issue | Location |
|----|----------|-------|----------|
| L1 | High | Email OR mobile not enforced on inquiry/contact | validation + API |
| L2 | Pass | Honeypot `website` field (client + server) |
| L3 | Pass | Rate limiting `lib/enquiry-rate-limit.ts` |
| L4 | Pass | Server validation + nodemailer acknowledgement/internal | `app/api/enquiry/route.ts` |
| L5 | Pass | `EnquirySuccessModal` on Inquiry; missing on legacy Contact section |

---

## Phase 11 — Favicon & Branding

| ID | Severity | Issue | Location |
|----|----------|-------|----------|
| F1 | High | Favicon generator adds dark rounded background — user wants transparent TG monogram only |
| F2 | Medium | Missing `favicon.ico` multi-size file |

---

## Phase 12 — Final Audit

| ID | Severity | Issue | Location |
|----|----------|-------|----------|
| A1 | Medium | Terms link in Contact form is `href="#"` | `sections/Contact.tsx` |
| A2 | Low | `samples` page exists but not in user SEO list (optional) | `app/samples/` |

---

## Fix status (2026-06-05)

| IDs | Status |
|-----|--------|
| M1, M4, M5, M6, U1, U2, U3–U5, S1–S2, S4, D1–D3, I1–I4, T1, L1–L5, F1–F2, A1 | **Fixed** |
| S5 | Pending — add Google Search Console token in `lib/metadata.ts` |
| D5 | Open — review `aggregateRatingSchema` before production SEO |
| P1 | Pending — compress `public/logos/tgi-header-logo1.png` (~1 MB) |
| P5 | Open — evaluate `Loader` impact on FCP in Lighthouse |
| Phase 7–8 scores | Requires deploy + PageSpeed run (not verifiable locally only) |
