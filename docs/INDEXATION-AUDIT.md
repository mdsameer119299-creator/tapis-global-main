# Indexation Audit — "Discovered – currently not indexed" (103 URLs)

**Date:** 2026-07-12
**GSC snapshot (predates the latest deploy):** 27 indexed · 106 not indexed (103 "Discovered – currently not indexed", 3 "Page with redirect") · sitemap success · previous sitemap discovered 131 URLs.

> The GSC data is **pre-deployment** of PR #7. It must **not** be read as proof the deployed breadcrumb fix failed — live audit confirms breadcrumbs are valid on production.

## 1. Root-cause analysis (not just crawl budget)
The prompt's instruction to look beyond authority/crawl-budget is correct. Repository/signal analysis:

| Signal | Finding | Effect on indexing |
|---|---|---|
| Sitemap size churn | Previous sitemap discovered **131** URLs; new phased sitemap = **150** high-value URLs | Rapid growth of new, low-authority URLs → Google defers crawl (classic "discovered not indexed") |
| New-page freshness | Country/India pages are recent; low internal-link equity and no external links yet | Deprioritised crawl |
| Template similarity | Country cluster worst-case Jaccard 0.73 (bahrain/oman); India 0.58 | Moderate; near-duplication risk if unmanaged (now gated at 0.90 fail / 0.74 warn) |
| Click depth | City/country pages are 2 clicks from home (hub in nav) | Acceptable; not the bottleneck |
| Breadcrumb errors | 18 historical GSC errors, fixed & live-verified | Was a quality signal; now resolved |
| Thin/duplicate hub risk | Hub pages strong; some dhurrie/company titles overlong | Minor |

**Conclusion:** the dominant cause is **a burst of new, low-equity URLs on a young domain**, compounded by moderate template similarity — **not** a technical blocker. The correct response is **quality + phasing + internal-link equity**, and explicitly **NOT adding more URLs**.

## 2. Per-cluster classification (A–E)
Legend: **A** priority-index · **B** improve-before-indexing · **C** keep-live-but-hold-from-sitemap · **D** consolidate/canonicalise · **E** redirect/remove.

| URL / cluster | Class | Rationale |
|---|---|---|
| `/`, `/products`, `/industries`, `/solutions`, `/countries`, `/india`, `/company`, `/guides`, `/custom`, `/catalogue`, `/design-studio`, `/contact` | **A** | Hubs + conversion pages; highest business value; already in sitemap |
| `/products/*` (15), `/industries/*` (30), `/solutions/*` (8) | **A** | Core money pages; unique intent; keep indexed |
| `/countries/{usa,uk,germany,france,uae,saudi-arabia,qatar,australia,…}` + Phase-1 new (sweden,denmark,finland,norway,poland,switzerland,canada,singapore,bahrain,kuwait,oman) | **A** | Real B2B export intent; in sitemap |
| `/india/{delhi-ncr,mumbai,bengaluru,hyderabad,chennai,pune,bhadohi}` | **A** | Priority national markets; in sitemap |
| `/countries/{austria,ireland,new-zealand,japan,south-korea,south-africa}` | **C** | Live routes held from sitemap until content depth/links verified (Phase 2 rollout) |
| `/india/{kolkata,ahmedabad,jaipur,surat,goa,lucknow,kochi,chandigarh,gurugram,noida}` | **C** | Live routes held from sitemap; promote after uniqueness + linking pass |
| `bahrain` vs `oman`, `goa` vs `kochi` | **B** | Improve differentiation before/if similarity rises; currently within gate |
| `/dhurries/*` (18) | **A/B** | Institutional/tender niche is valuable; trim overlong titles (B) |
| `/company/*` (10) | **A** | EEAT/trust pages support money pages |
| `/guides/*` (22) | **A** | Topical authority; ensure each links to a commercial page |
| `/blogs`, `/samples` | **E** (done) | Already 301'd to `/guides` and `/design-studio`; excluded from sitemap |
| `/products/tat-patti` ↔ `/dhurries/tat-patti-manufacturer`; `/company/why-bhadohi` ↔ `/guides/why-bhadohi-carpet-capital` | **D** | Differentiate H1/title (distinct intents) to remove cannibalisation |

## 3. Phased indexation strategy (do NOT add URLs)
**Phase 1 (now):** keep the 150-URL sitemap. Strengthen internal links to the Class-A set. Ensure each guide links to ≥1 commercial page and vice-versa. Request indexing (manually, by the site owner) only for the top ~15 Class-A pages.

**Phase 2 (after Phase-1 pages index / show impressions):** promote Class-C India cities + countries into the sitemap **one small batch at a time**, only after each passes the audit gates (uniqueness < 0.90 similarity, conversion path present, unique metadata). Controlled via `INDIA_SITEMAP_SLUGS` / `COUNTRY_SITEMAP_EXCLUDE` in `app/sitemap.ts`.

**Phase 3:** resolve the Class-D duplicates (title/H1 differentiation) in a content pass; add external links/PR to raise domain authority (off-repo).

**Guardrail:** the enhanced `seo-audit.mjs` now fails the build on near-duplicate content, redirect/noindex/lastmod-in-sitemap, and missing conversion paths — so promotion cannot reintroduce low-quality URLs.

## 4. Measurement
- Re-run `npm run seo:audit:production` weekly to confirm 200/canonical/breadcrumb health.
- In GSC: watch "Discovered – currently not indexed" trend down as Phase-1 pages index; only then promote Phase-2 batches.
