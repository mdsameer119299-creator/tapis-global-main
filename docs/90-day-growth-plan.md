# Tapis Global International — 90-Day SEO & B2B Lead-Generation Foundation

**Goal:** turn the existing site into a lead engine for five B2B buyer types **without** creating mass programmatic pages. Focus effort on ~40 existing high-commercial-value URLs, give each a clear buyer + intent + CTA, and instrument conversions.

**Guardrails (apply to everything below):** No fabricated facts, certifications, customers, export history, production capacity, MOQs, prices or case studies. No scraping private data, no bypassing access controls, no spam automation.

---

## Priority buyer types & conversion paths

| Buyer | Primary CTA | Pipeline (`formType`) | Analytics event |
|---|---|---|---|
| Importer / Wholesaler | Request Wholesale Catalogue | `catalogue` | `catalogue_request` |
| Hotel / Hospitality Procurement | Request Project Quote | `inquiry` | `quote_request` |
| Interior Designer / Architect | Request Sample or Specification Pack | `inquiry` | `sample_request` |
| Private Label Brand | Start Custom Rug Development | `custom` | `custom_development_enquiry` |
| Large Buyer / Distributor | Request Factory Video Call | `inquiry` | `factory_call_request` |

Implemented in `lib/buyer-paths.ts` + `components/leads/*`. See `docs/analytics-events.md`.

---

## The 40 priority URLs

Status legend: **✅ done** (hub content + conversion path live) · **▶ reference-ready** (drop-in `LeadSection`/CTA available, page-level rollout pending) · **◻ pending**.

### Hubs (5)
| # | URL | Target buyer | Keyword cluster | Intent | Primary CTA | Supporting pages | Status |
|---|---|---|---|---|---|---|---|
|1|/products|All (routes to segment)|carpet manufacturer, rug types|Commercial/nav|Request Quote/Catalogue|category pages, construction guides|✅|
|2|/industries|Hospitality & commercial procurement|carpet by industry, contract carpet|Commercial|Request Project Quote|industry pages, buying guides|✅|
|3|/countries|Importer/distributor|carpet exporter India, import carpets|Commercial|Request Export Quote/Catalogue|country pages, import guides|✅|
|4|/solutions|All segments|wholesale/contract/custom carpet|Commercial|Segment CTA|solution pages, company pages|✅|
|5|/company|All (trust)|carpet manufacturer Bhadohi|Trust/consideration|Request Factory Video Call|factory, process, export pages|▶|

### Product categories (9)
| # | URL | Target buyer | Keyword cluster | Intent | Primary CTA | Supporting | Status |
|---|---|---|---|---|---|---|---|
|6|/products/hand-tufted-carpet|Hospitality, importer|hand tufted carpet manufacturer|Commercial|Request Quote|guide: tufted-vs-knotted|▶|
|7|/products/hand-knotted-carpet|Luxury, designer|hand knotted rug manufacturer|Commercial|Sample/Spec Pack|guide: knotted process|▶|
|8|/products/wall-to-wall-carpets|Hospitality, contract|wall to wall / broadloom supplier|Commercial|Request Project Quote|industries/hotel|▶|
|9|/products/carpet-tiles|Office/commercial|carpet tiles supplier India|Commercial|Request Project Quote|industries/office|▶|
|10|/products/area-rugs|Importer, retail|area rugs manufacturer/wholesale|Commercial|Wholesale Catalogue|solutions/wholesale|▶|
|11|/products/jute-sisal-rugs|Importer, retail|jute rug / sisal rug supplier|Commercial|Wholesale Catalogue|guide: jute-vs-sisal|▶|
|12|/products/kilim-rugs|Importer, designer|kilim rug manufacturer|Commercial|Wholesale Catalogue|guide: kilim-vs-dhurrie|▶|
|13|/products/dhurrie-rugs|Importer, govt|dhurrie manufacturer/supplier|Commercial|Wholesale Catalogue|dhurries/*|▶|
|14|/products/flat-weaves|Importer, designer|flatweave rug manufacturer|Commercial|Sample/Spec Pack|guide: handmade-vs-machine|▶|

### Industry pages (7)
| # | URL | Target buyer | Keyword cluster | Intent | Primary CTA | Supporting | Status |
|---|---|---|---|---|---|---|---|
|15|/industries/hotel-carpets|Hotel procurement|hotel carpet manufacturer/supplier|Commercial|Request Project Quote|guide: hotel-carpet|▶|
|16|/industries/hotel-lobby-carpets|Hotel procurement|hotel lobby carpet|Commercial|Request Project Quote|industries/hotel|▶|
|17|/industries/office-carpets|Corporate FM|office carpet supplier|Commercial|Request Project Quote|guide: office-carpet|▶|
|18|/industries/restaurant-carpets|Hospitality|restaurant carpet supplier|Commercial|Request Project Quote|industries/hotel|▶|
|19|/industries/hospital-carpets|Institutional|hospital/healthcare carpet|Commercial|Request Project Quote|company/quality-control|▶|
|20|/industries/mosque-carpets|Institutional|mosque carpet manufacturer|Commercial|Request Project Quote|guide: mosque-carpet|▶|
|21|/industries/auditorium-carpets|Institutional|auditorium carpet manufacturer|Commercial|Request Project Quote|guide: auditorium-carpet|▶|

### Export-market pages (6)
| # | URL | Target buyer | Keyword cluster | Intent | Primary CTA | Supporting | Status |
|---|---|---|---|---|---|---|---|
|22|/countries/usa|Importer/distributor|Indian carpets to USA importer|Commercial|Export Quote/Catalogue|guide: how-to-import|▶|
|23|/countries/uk|Importer/distributor|carpet supplier UK from India|Commercial|Export Quote/Catalogue|guide: how-to-import|▶|
|24|/countries/germany|Importer/distributor|carpet exporter Germany|Commercial|Export Quote/Catalogue|guide: how-to-import|▶|
|25|/countries/uae|Importer, hospitality|carpet supplier UAE / Dubai|Commercial|Export Quote/Catalogue|industries/hotel|▶|
|26|/countries/saudi-arabia|Importer, institutional|carpet supplier Saudi Arabia|Commercial|Export Quote/Catalogue|industries/mosque|▶|
|27|/countries/australia|Importer/distributor|carpet exporter Australia|Commercial|Export Quote/Catalogue|guide: how-to-import|▶|

### Solution pages (6)
| # | URL | Target buyer | Keyword cluster | Intent | Primary CTA | Supporting | Status |
|---|---|---|---|---|---|---|---|
|28|/solutions/carpet-exporter-india|Importer|carpet exporter India|Commercial|Wholesale Catalogue|countries/*|▶|
|29|/solutions/wholesale-carpet-supplier|Importer/wholesaler|wholesale carpet supplier|Commercial|Wholesale Catalogue|products/area-rugs|▶|
|30|/solutions/contract-carpet-supplier|Hospitality/commercial|contract carpet supplier|Commercial|Request Project Quote|industries/*|▶|
|31|/solutions/commercial-carpet-manufacturer|Commercial FM|commercial carpet manufacturer|Commercial|Request Project Quote|industries/office|▶|
|32|/solutions/custom-carpets|Designer, private label|custom carpet manufacturer|Commercial|Start Custom Development|company/custom-manufacturing|▶|
|33|/solutions/luxury-carpets|Designer, luxury|luxury carpet manufacturer|Commercial|Sample/Spec Pack|products/hand-knotted|▶|

### Company trust pages (3)
| # | URL | Target buyer | Keyword cluster | Intent | Primary CTA | Supporting | Status |
|---|---|---|---|---|---|---|---|
|34|/company/oem-private-label|Private label brand|OEM private label rugs|Consideration|Start Custom Development|solutions/custom-carpets|▶|
|35|/company/custom-manufacturing|Designer, private label|custom rug manufacturing|Consideration|Start Custom Development|guide: how-custom-works|▶|
|36|/company/export-process|Importer/distributor|carpet export process India|Consideration|Export Quote|countries/*|▶|

### Buyer-journey guides (4)
| # | URL | Target buyer | Keyword cluster | Intent | Primary CTA | Supporting | Status |
|---|---|---|---|---|---|---|---|
|37|/guides/how-to-import-carpets-from-india|Importer/distributor|how to import carpets from India|Informational→commercial|Export Catalogue|countries/*|▶|
|38|/guides/hotel-carpet-buying-guide|Hotel procurement|hotel carpet buying guide|Informational→commercial|Request Project Quote|industries/hotel|▶|
|39|/guides/hand-tufted-vs-hand-knotted-carpet|Importer, designer|hand tufted vs hand knotted|Informational|Request Sample|products/*|▶|
|40|/guides/why-buy-carpets-from-india|Importer/distributor|why buy carpets from India|Informational→commercial|Export Catalogue|guide: why-bhadohi|▶|

---

## 90-day sequence

**Phase 1 (Days 1–30) — Foundation & instrumentation**
- ✅ Reusable conversion architecture: `lib/buyer-paths.ts`, `components/leads/{QualificationForm,BuyerPaths,LeadSection,HubGuidance}.tsx`, `lib/analytics.ts`.
- ✅ 4 hub pages (products/industries/countries/solutions) upgraded with unique guidance + buyer paths + qualification form.
- ◻ Install GA4 tag (`NEXT_PUBLIC_GA_ID`) + verify events (`docs/analytics-events.md`).
- ◻ Roll `LeadSection`/segment CTA onto the 9 product + 7 industry pages (URLs 6–21).
- ◻ Off-page: Google Business Profile, trade-directory citations, request-indexing priority URLs in GSC.

**Phase 2 (Days 31–60) — Depth & rollout**
- ◻ Country (22–27), solution (28–33), company (34–36) pages: add segment CTA + internal links.
- ◻ Guides (37–40): add contextual CTA to the matching buyer path.
- ◻ Strengthen thin hub copy already started; add FAQ where genuinely useful.
- ◻ Backlinks: supplier listings, design/architecture directories, relevant PR.

**Phase 3 (Days 61–90) — Optimise & report**
- ◻ Weekly GSC + GA4 review against `docs/seo-reporting-spec.md`.
- ◻ A/B primary CTA copy per segment; tighten low-CTR titles/descriptions.
- ◻ Qualify + follow up leads via CRM schema (`docs/lead-data-schema.md`).

---

## What is deliberately NOT done
- No new programmatic page types created.
- No claims added about capacity, certifications, customers, MOQs, prices, export volumes or case studies.
- GA4 property/ID, off-page authority work, and per-page CTA rollout beyond the 4 hubs are tracked above as pending (owner: marketing/dev).
