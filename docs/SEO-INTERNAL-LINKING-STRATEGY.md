# SEO Internal-Linking Strategy — Tapis Global International

**Date:** 2026-07-11
**Branch:** `seo/global-pan-india-expansion`
**Goal:** Improve crawl prioritisation and topical authority flow to money pages **without** sitewide link spam. Every indexable URL must have ≥1 crawlable internal link (no orphans).

---

## 1. Tier model

Crawl priority is expressed through *where* and *how often* a URL is linked from high-authority pages — not through `priority`/`changefreq` in the sitemap (which Google largely ignores).

### Tier 1 — Highest commercial priority
Linked from the homepage, global nav (Navbar mega-menu), footer, and cross-linked from most landing pages.

- `/` (Home)
- `/products` (hub)
- `/industries` (hub)
- `/solutions` (hub)
- `/countries` (Export Markets hub)
- `/india` (Pan-India hub) — **new**
- `/company` (EEAT hub)
- Money product pages: `/products/hand-knotted-carpet`, `/products/hand-tufted-carpet`, `/products/wall-to-wall-carpets`
- Money solution pages: `/solutions/custom-carpets`, `/solutions/commercial-carpet-manufacturer`, `/solutions/luxury-carpets`, `/solutions/carpet-exporter-india`, `/solutions/contract-carpet-supplier`, `/solutions/wholesale-carpet-supplier`
- Priority industries: `/industries/hotel-carpets`, `/industries/office-carpets`, `/industries/mosque-carpets`
- Priority international markets: `/countries/usa`, `/countries/uk`, `/countries/germany`, `/countries/uae`, `/countries/saudi-arabia`, `/countries/canada`, `/countries/singapore`
- Priority India markets: `/india/delhi-ncr`, `/india/mumbai`, `/india/bengaluru`, `/india/gurugram`, `/india/bhadohi`

### Tier 2 — Secondary
Linked from their hub grid + contextual related-links on sibling and parent pages.

- Secondary country pages (Nordics, Poland, Ireland, NZ, Japan, South Korea, Bahrain, Kuwait, Oman, South Africa, plus remaining EU)
- Secondary India location pages (Hyderabad, Chennai, Kolkata, Pune, Ahmedabad, Jaipur, Surat, Goa, Lucknow, Kochi, Chandigarh, Noida)
- Remaining industry pages (30 total)
- Remaining solution pages
- High-value guides (comparison + buying cluster)

### Tier 3 — Long-tail / supporting
Linked from hub grids, related-guide blocks and contextual mentions.

- Remaining guides (22 total)
- Dhurrie silo pages (`/dhurries/*`)
- Company sub-pages beyond the priority set
- Legal pages (`/privacy-policy`, `/terms-and-conditions`) — footer only

---

## 2. Hub → spoke relationships

| Hub | Spokes | Spoke → hub link |
|---|---|---|
| `/products` | 14 product pages | breadcrumb + "All Products" |
| `/industries` | 30 industry pages | breadcrumb + "All Industries" |
| `/solutions` | 8 solution pages | breadcrumb + "All Solutions" |
| `/countries` | 29 country pages | breadcrumb + "All Export Markets" |
| `/india` | 17 city/market pages | breadcrumb + "All India" |
| `/company` | 10 company pages | breadcrumb + "All Company" |
| `/dhurries` | 18 dhurrie pages | breadcrumb + "All Dhurries & Tat Patti" |
| `/guides` | 22 guides | breadcrumb + related-guides |

Every hub renders a card grid linking to all its spokes (`LandingHub`), so **no spoke is an orphan**. Every spoke (`LandingPage`) links back up to its hub, across to 3–5 related landings, down to ≤5 related products, and out to 3 guides.

---

## 3. Contextual linking rules (enforced in `LandingPage`)

Each landing page emits a bounded, contextual link set — no page dumps 50+ links:

1. **Up:** breadcrumb → Home → hub. Plus a text "All {hub}" link.
2. **Sideways (related markets/landings):** max 5, drawn from the page's own `relatedIndia` / `relatedCountries` / `relatedIndustries` / `relatedSolutions` / `relatedCompany` / `relatedDhurries` fields. Curated per page, not global.
3. **Down (products):** ≤5 related product collections (page-specific first, topped up from the core catalogue, deduped).
4. **Guides:** exactly 3 contextual guides.
5. **Conversion:** Catalogue + Contact/RFQ + WhatsApp (every page).

**Related-market conventions applied on this branch:**
- Nordic country pages link to each other (Sweden ⇄ Denmark ⇄ Finland ⇄ Norway).
- Gulf country pages link to each other (UAE ⇄ Saudi Arabia ⇄ Qatar ⇄ Bahrain ⇄ Kuwait ⇄ Oman).
- Poland → Germany, Austria, Netherlands (regional trade cluster).
- India city pages link to 3 related India markets + relevant industries/solutions/products; NCR ⇄ Gurugram ⇄ Noida form a regional sub-cluster.
- `/india/bhadohi` links to `/company/why-bhadohi` and `/company/factory` (source/EEAT reinforcement).

---

## 4. Sitewide-nav additions (this branch)
- **Navbar mega-menu:** added `India` and `Export Markets` alongside `By Industry` / `By Solution` (4 hub links, not a link farm).
- **Footer "Explore":** added a single `India` link next to `Export Markets`.

These give the two hubs a sitewide crawlable path without inflating link counts on any page.

---

## 5. Anchor-text principles
1. **Descriptive, not generic** — link text names the destination ("Hand Knotted Carpets", "Carpet Manufacturer for Delhi NCR"), never "click here".
2. **Keyword-aligned but natural** — anchors reflect the target's primary keyword without exact-match stuffing.
3. **Consistent labels** — a page is linked by its `label` field everywhere, so anchor text is stable across the site.
4. **One primary anchor per target per page** — avoid multiple competing anchors to the same URL from a single page.
5. **No manipulative anchors** — no hidden links, no anchor lists dumped in the footer beyond the curated Explore set.

---

## 6. Orphan check
Guaranteed non-orphan by construction:
- Hubs are linked from nav + footer + sitemap.
- Spokes are linked from their hub grid + related blocks on siblings.
- `scripts/seo-audit.ts` validates that every `related*` reference resolves to a real slug, catching broken contextual links before build.

**Residual risk:** a brand-new cluster with no inbound `related*` references from existing pages would rely only on its hub grid. Mitigated because each new India/country page carries reciprocal `relatedIndia`/`relatedCountries` links, and hubs are in nav.
