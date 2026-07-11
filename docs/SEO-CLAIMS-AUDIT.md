# SEO Content Claims / EEAT Audit — Tapis Global International

**Date:** 2026-07-11
**Branch:** `seo/global-pan-india-expansion`
**Purpose:** Identify commercial/EEAT claims in the codebase, assess whether the repository contains supporting evidence, grade risk, and recommend action. Trust-critical because Google's EEAT and the FTC/ASCI-type advertising standards penalise unverifiable claims.

**Handling rules applied (per task Phase 8 + working rules 9/11):**
- No legitimate claim is auto-removed. The company is best placed to confirm claims about itself.
- No evidence is invented.
- **New content added on this branch was written conservatively and introduces none of these claims** (verified — see §4). This audit therefore focuses on *pre-existing* claims and stages recommendations for human review.

---

## 1. Claims register

Evidence column = whether the *repository* contains proof (it generally cannot — certificates/HR/shipping records live outside the repo). "None in repo" ≠ "false"; it means unverifiable from code and requires the company to confirm.

| # | Claim | Representative files | Routes affected | Evidence in repo | Risk | Recommendation |
|---|---|---|---|---|---|---|
| 1 | **ISO 9001:2015 certified** | `lib/structured-data.ts:328`, `lib/company.ts:158-161`, `lib/products.ts:194,260,326,392,458,524`, `lib/about.ts:153`, `lib/catalogue.ts:79` | most product pages, /company/certifications, /about, sitewide FAQ | None in repo | **HIGH** | Confirm a current ISO 9001:2015 certificate exists and is in the company's legal name. If yes, KEEP + link/serve the certificate on /company/certifications. If no/expired, soften to "quality-managed / ISO-aligned processes" (already the wording on `/company` pages) and remove the bare "certified" from product spec tables. |
| 2 | **OEKO-TEX Standard 100** | `lib/structured-data.ts:328`, `lib/company.ts`, `lib/products.ts`, `lib/countries.ts` (germany, netherlands) | product, company, some country pages | None in repo | **HIGH** | Confirm valid OEKO-TEX certificate. If not held, change assertions to capability/conditional wording ("AZO-free dyeing; OEKO-TEX-aligned; certification per requirement"). |
| 3 | **GoodWeave / GOTS certified/eligible** | `lib/about.ts:153`, `lib/structured-data.ts:328`, `lib/company.ts:160` | /about, /company/certifications | None in repo | **HIGH** | GoodWeave (no child-labour) and GOTS are audited certifications — only claim with a current licence. Otherwise remove or restate as "fair-labour practices" without the certification mark name. |
| 4 | **"80,000 sq ft campus"** | `lib/about.ts:153`, `lib/industries.ts:77`, `lib/solutions-seo.ts:190,207` | /about, several industry & solution pages | None in repo | **MEDIUM** | Verify facility area. If uncertain, soften to "large-scale in-house manufacturing campus" (no specific figure). |
| 5 | **"Export programmes to 45+ countries"** | `lib/structured-data.ts:26,336`, `lib/data.ts:15`, `lib/catalogue.ts:74`, `lib/custom.ts:68,131`, `lib/company.ts:124,127,143`, `lib/products.ts:1097` | sitewide schema, /company/export-process, /custom, /catalogue, product pages | None in repo (site has 29 country *pages*, which is not the same as 45+ served) | **MEDIUM-HIGH** | Verify the export-country count from shipping records. If unverifiable, restate as "export to markets across Europe, the Americas, the Middle East, Asia-Pacific and Africa" (no number). Note potential mismatch with the 29 published country pages. |
| 6 | **"200–500 employees"** (schema) | `lib/structured-data.ts:66-69` | sitewide Organization JSON-LD | None in repo | **MEDIUM** | Employee count in schema should be accurate or omitted. Recommend confirming or removing `numberOfEmployees`. |
| 7 | **"Since 1965" / "third-generation, family-owned"** | `lib/structured-data.ts:26-27`, `lib/about.ts:41,135`, `lib/data.ts:42,301`, `lib/seo.ts` (established: 1965) | sitewide, /about, footer | None in repo | **MEDIUM** | Heritage claims are common and usually genuine; confirm founding year and generational lineage. If confirmed, KEEP (strong EEAT). If the legal entity is newer than the family lineage, phrase as "family carpet-making heritage since 1965" (already largely the wording). |
| 8 | **"500+ master artisans"** | `lib/catalogue.ts:84` | /catalogue | None in repo | **MEDIUM** | Verify artisan headcount (incl. contracted weavers) or soften to "hundreds of skilled artisans". |
| 9 | **"2000+ / 1600+ colour shades"** | `lib/structured-data.ts:324`, `lib/seo.ts` (samples/design-studio) | /design-studio, FAQ schema | Partially — a swatch library exists in-repo (`/public` images) | **LOW-MEDIUM** | Likely supportable from the swatch dataset; confirm the count matches the actual library. |
| 10 | **"Fire-rated" carpets & fire-rating certification** | `lib/products.ts:524`, `lib/company.ts:147,159`, `lib/countries.ts`, some new pages use conditional "fire-safety construction where a project requires" | product, company, country, some india pages | None in repo | **MEDIUM** | Fire-rating is test-certified per batch/product. Keep only as a *capability offered on request* (conditional wording), never as a blanket property. New pages already use the conditional form. |
| 11 | **Client testimonial with specific project detail** | `lib/data.ts:245` ("corporate headquarters… 40,000 sq ft… Tapis managed…") | homepage / testimonial section | None in repo (attribution not shown) | **MEDIUM** | If a real, permissioned client quote, KEEP with attribution. If illustrative, label as representative or remove — unattributed specific testimonials read as fabricated and are an EEAT/advertising risk. **Not** rendered as Review/Rating schema (good — see structured-data audit). |
| 12 | **"Trusted by architects, hospitality groups and buyers"** | `lib/catalogue.ts:74`, `lib/data.ts:301` | /catalogue, sitewide | Generic, no named clients | **LOW** | Acceptable generic positioning; keep. Avoids naming specific clients/projects. |

---

## 2. Risk summary

- **HIGH (4):** ISO 9001, OEKO-TEX, GoodWeave/GOTS, and (borderline) the "45+ countries" figure — all are *named certifications or specific figures* that are penalised hard if unverifiable. These predate this branch and touch live pages; **flagged, not edited**.
- **MEDIUM:** facility size, employee count, heritage, artisan count, fire-rating, testimonial.
- **LOW:** generic trust language, swatch count.

## 3. Why nothing was auto-edited
Per working rules 9 and 11 and the Phase 8 brief, legitimate claims are not removed and evidence is not invented. Certifications and counts are assertions the **company can verify from documents held outside the repository**. The correct next step is a claims-verification pass with the company: for each HIGH item, either attach the certificate / restate conservatively. This audit gives the exact file + line to action each one.

## 4. New content on this branch — clean
Verified by grep across `lib/india.ts` and the 17 new `lib/countries.ts` entries:
- **No** ISO / OEKO-TEX / GoodWeave / GOTS certification assertions.
- **No** "80,000 sq ft" / capacity / employee-count / "45+ countries" claims.
- **No** claims of local offices, showrooms, warehouses, staff, completed projects or customers in any city or country (except Bhadohi, which is the genuine manufacturing base and is described as such).
- Fire-safety and material-standard references are **capability-conditional** ("where a project specifies", "align to a standard you specify"), never blanket properties.
- Production timeline stated as a norm ("typically ~3–4 weeks depending on specification"), never a guarantee.

## 5. Recommended priority actions (for humans)
1. Produce/locate current ISO 9001:2015, OEKO-TEX, GoodWeave/GOTS certificates → keep claims + publish proof, or restate the four HIGH items conservatively at the exact lines above.
2. Confirm the export-country figure and facility area, or replace the numbers with descriptive ranges.
3. Confirm the schema `numberOfEmployees` and founding year, or omit.
4. Attribute or relabel the homepage testimonial.
