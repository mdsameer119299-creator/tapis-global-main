# SEO Commercial-Claims Audit — clean-global-india-seo

**Date:** 2026-07-11
**Branch:** `clean-global-india-seo` (from latest `origin/main`)
**Scope:** Claims relevant to this SEO PR. Two goals: (1) **report** every flagged claim and its file location; (2) confirm the **new** pages added by this PR introduce **no** unsupported claims.

Rules honoured: legitimate claims already present in `main`/production are **not** removed (they are the company's to verify); no evidence is invented; **new** content is written conservatively.

---

## A. Pre-existing claims in `main` (reported, NOT modified by this PR)

These live in production files this PR does not touch. Listed for the company's verification pass.

| Claim | Representative file locations (on `main`) | Risk |
|---|---|---|
| **ISO 9001:2015 certified** | `lib/structured-data.ts` (DEFAULT_FAQS), `lib/company.ts` (certifications), `lib/products.ts` (spec tables), `lib/about.ts`, `lib/catalogue.ts` | HIGH |
| **OEKO-TEX Standard 100** | `lib/structured-data.ts`, `lib/company.ts`, `lib/products.ts`, `lib/countries.ts` (germany, netherlands — existing) | HIGH |
| **GoodWeave / GOTS** | `lib/about.ts`, `lib/structured-data.ts`, `lib/company.ts` | HIGH |
| **"80,000 sq ft campus"** | `lib/about.ts`, `lib/industries.ts`, `lib/solutions-seo.ts` | MEDIUM |
| **"45+ countries"** | `lib/structured-data.ts` (organization + FAQ), `lib/data.ts`, `lib/catalogue.ts`, `lib/custom.ts`, `lib/company.ts`, `lib/products.ts` | MEDIUM-HIGH |
| **"200–500 employees"** | `lib/structured-data.ts` (organizationSchema.numberOfEmployees) | MEDIUM |
| **"Since 1965" / "third-generation"** | `lib/structured-data.ts`, `lib/about.ts`, `lib/data.ts`, `lib/seo.ts` | MEDIUM |
| **Payment terms "Bank Transfer, LC, DA, DP" + currencies "USD, EUR, GBP, INR"** | `lib/structured-data.ts` (localBusinessSchema) | MEDIUM |
| **Payment/currency FAQs ("We accept TT, LC, DA, DP… in EUR/USD")** | `lib/countries.ts` — **existing** markets only (usa, uk, germany, france, italy, spain, netherlands, belgium, australia, uae, saudi-arabia, qatar) | MEDIUM |
| **"Fire-rated" carpets / fire-rating certification** | `lib/products.ts`, `lib/company.ts`, existing `lib/countries.ts` entries | MEDIUM |
| **AZO-free / "held dye-lots" / "phased delivery"** | existing `lib/countries.ts` entries | LOW-MEDIUM |

**Recommendation:** for each HIGH item, either attach the current certificate/evidence or soften the wording at the listed location. Out of scope for this PR (would modify unrelated production files).

---

## B. New pages added by this PR — verified claim-safe

The 17 new country pages and 17 India location pages were written to **capability-based** wording and audited. Confirmed **absent** from all new content (grep-verified):

- ❌ No `ISO 9001` / `OEKO-TEX` / `GoodWeave` / `GOTS` / `AZO-free` certification assertions.
- ❌ No `80,000 sq ft` / production-capacity / employee-count / `45+ countries` claims.
- ❌ No hard payment-term (`TT / LC / DA / DP`) or accepted-currency (`USD / EUR / GBP`) claims — replaced with: *"Payment and commercial terms are agreed per order based on value, buyer profile, destination and arrangement; our team will share the terms applicable to your enquiry."*
- ❌ No `held dye-lots` / `phased delivery` / `full export documentation` guarantees — softened to *"we can advise on export documentation and logistics relevant to your enquiry"* and *"production can be planned around your installation programme."*
- ❌ No `fire-rated`/`fire-rating documentation` guarantees — restated as capability: *"fire-safety requirements can be specified per project."*
- ❌ No established-export-history phrasing (*"We export … to X"*). Replaced with capability wording: *"We manufacture handmade carpets and rugs to order in Bhadohi for buyers and projects in X."*
- ❌ No local office / showroom / warehouse / staff / completed-project / customer claims per city or country — **except Bhadohi**, the genuine manufacturing base, described as such.
- ❌ No `LocalBusiness` structured data for any city or country (route emits WebPage + BreadcrumbList + FAQPage only).

Lead times are described as made-to-order and *"confirmed per enquiry"* — never a fixed promise.

---

## C. Note on inherited PR #6
PR #6 (contaminated branch) had introduced payment-term and export-history phrasing on the new pages. This clean re-implementation removes all of it, as documented in §B.
