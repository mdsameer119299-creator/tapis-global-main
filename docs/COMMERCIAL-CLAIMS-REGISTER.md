# Commercial Claims Register — E-E-A-T / Trust

**Date:** 2026-07-12 · **Scope:** production `main` (@ eebb78c).
**Purpose:** record every commercial claim, its location, evidence status, risk and recommended action. **No legitimate claim is deleted here** — this is a verification register for the company. New pages added by prior SEO PRs are capability-based and introduce none of these (verified).

Evidence status: **VERIFIED** (proof in repo/known) · **UNVERIFIED** (needs a certificate/record the company holds outside the repo) · **CAPABILITY** (safe capability wording, no proof needed).
Risk: **HIGH** (named certification/specific figure — penalised hard if false) · **MED** · **LOW**.

| # | Claim | Representative source location(s) | Evidence | Risk | Recommended action |
|---|---|---|---|---|---|
| 1 | ISO 9001:2015 certified | `lib/structured-data.ts` (DEFAULT_FAQS), `lib/company.ts` (certifications), `lib/products.ts` (spec tables), `lib/about.ts`, `lib/catalogue.ts` | UNVERIFIED | HIGH | Attach current certificate on `/company/certifications` or soften to "quality-managed processes" |
| 2 | OEKO-TEX Standard 100 | `lib/structured-data.ts`, `lib/company.ts`, `lib/products.ts`, `lib/countries.ts` (germany, netherlands – existing) | UNVERIFIED | HIGH | Confirm valid certificate or reword to "AZO-free dyeing; OEKO-TEX-aligned; certification per requirement" |
| 3 | GoodWeave / GOTS | `lib/about.ts`, `lib/structured-data.ts`, `lib/company.ts` | UNVERIFIED | HIGH | Only claim with a current licence; else remove the mark name, keep "fair-labour practices" |
| 4 | "80,000 sq ft" facility | `lib/about.ts`, `lib/industries.ts`, `lib/solutions-seo.ts` | UNVERIFIED | MED | Verify area or soften to "large in-house manufacturing campus" |
| 5 | "45+ countries / markets" | `lib/structured-data.ts` (org + FAQ), `lib/data.ts`, `lib/catalogue.ts`, `lib/custom.ts`, `lib/company.ts`, `lib/products.ts` | UNVERIFIED | MED-HIGH | Verify from shipping records or replace with descriptive ranges (no number). Note: 29 country *pages* ≠ countries served |
| 6 | "200–500 employees" | `lib/structured-data.ts` (organizationSchema.numberOfEmployees) | UNVERIFIED | MED | Confirm or remove `numberOfEmployees` |
| 7 | "Since 1965" / "third generation" / "60+ years" | `lib/structured-data.ts`, `lib/about.ts`, `lib/data.ts`, `lib/seo.ts` | UNVERIFIED | MED | Confirm founding year/lineage; if the family lineage (not the legal entity) is meant, phrase as "family carpet-making heritage since 1965" |
| 8 | Artisan / production-capacity counts ("500+ artisans") | `lib/catalogue.ts`, various | UNVERIFIED | MED | Verify headcount or soften to "hundreds of skilled artisans" |
| 9 | Payment terms "Bank Transfer, LC, DA, DP" + currencies "USD, EUR, GBP, INR" | `lib/structured-data.ts` (localBusinessSchema); FAQs on existing `lib/countries.ts` markets | UNVERIFIED | MED | Confirm as standing policy or move to enquiry-based wording (as done on the new country/India pages) |
| 10 | Fire-rated / fire-rating certification | `lib/products.ts`, `lib/company.ts`, existing `lib/countries.ts` entries | UNVERIFIED | MED | Keep only as capability offered on request (per-project), never a blanket property |
| 11 | AZO-free / "held dye-lots" / "phased delivery" | existing `lib/countries.ts` entries | UNVERIFIED (AZO) / CAPABILITY | LOW-MED | AZO-free: confirm; delivery language: keep capability-based |
| 12 | Customer names / testimonials / project histories / awards | (none found as schema; any marketing testimonial should be attributed) | n/a | LOW | If any are added, they must be real, permissioned and attributed; **no** Review/Rating schema |
| 13 | Export history ("we export to X") | **existing** country pages (usa..qatar) | UNVERIFIED | MED | Existing pages use export-history phrasing; new pages (sweden..south-africa, all India) use **capability** wording ("we manufacture in Bhadohi for buyers in X") — recommend aligning existing pages in a future pass |

## New content added by prior SEO PRs — clean (verified)
The 17 new country pages and 17 India location pages are **capability-based**: no ISO/OEKO/GoodWeave/GOTS, no "80,000 sq ft"/"45+ countries"/employee/capacity figures, no hard payment-term/currency claims, no fire-rating-documentation guarantees, no per-city office/showroom/project claims, and **no LocalBusiness schema for any city** (Bhadohi is the only genuine, sitewide-addressed facility). Lead times are stated as made-to-order, confirmed per enquiry.

## Verified trust assets to lean on (no fabrication)
- Real Bhadohi manufacturing base (address in `lib/seo.ts`), corporate office New Delhi.
- Real catalogue/factory/product photography already in `public/` (recent "Populate product galleries with real catalogue photography" commit).
- Manufacturing/quality/custom/sampling process content in `/company/*`.
- Legal identity (Tapis Global International Pvt Ltd), privacy policy, terms, contact details.

## Priority actions for the company
1. Produce/locate current **ISO 9001**, **OEKO-TEX**, **GoodWeave/GOTS** certificates → keep claims + publish proof, or soften the four HIGH items at the exact locations above.
2. Confirm the **country count**, **facility area**, **employee count**, **founding year** — or replace figures with ranges / remove from schema.
3. Align **existing** country pages to capability wording (as the new pages already are).
