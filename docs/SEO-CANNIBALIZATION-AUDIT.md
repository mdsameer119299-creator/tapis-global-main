# SEO Cannibalization Audit — Tapis Global International

**Date:** 2026-07-11
**Branch:** `seo/global-pan-india-expansion`
**Scope:** All SEO landing datasets — Products, Industries, Solutions, Countries, Dhurries, Company, Guides — plus top-level marketing routes and the newly-added India cluster.
**Rule:** This is a *documentation-first* audit. No existing page is deleted or redirected here. Recommendations are staged for human review.

---

## 1. Method

For each cluster we record page type, primary search intent, primary keyword target and secondary targets, then cross-reference for overlapping intent. Severity is graded:

- **HIGH** — two+ URLs compete for the *same* head keyword with the *same* intent; likely to split rankings/CTR.
- **MEDIUM** — meaningful keyword overlap but separable by intent with tighter positioning.
- **LOW** — incidental keyword co-occurrence; distinct intent; no action needed beyond cross-linking.

Recommendation verbs: **KEEP** (differentiated, leave as is), **STRENGTHEN** (keep but sharpen title/H1/intro to own a distinct query), **REPOSITION** (shift the page's target intent to remove overlap), **MERGE** (candidate for consolidation + 301 — *proposal only, not executed*).

---

## 2. URL Inventory (by cluster)

### 2.1 Top-level marketing routes
| URL | Type | Primary intent | Primary keyword | Notes |
|---|---|---|---|---|
| `/` | Home | Brand + category entry | carpet manufacturer India | Brand head term owner |
| `/products` | Hub | Category browse | carpet & rug collections India | Product hub |
| `/custom` | Conversion | Bespoke enquiry / process | custom carpet design India | Overlaps `/solutions/custom-carpets` — see §3.1 |
| `/design-studio` | Conversion | Colour/spec tooling | carpet design studio, colour matching | Distinct (tool) |
| `/catalogue` | Conversion | Catalogue request | carpet catalogue India | Distinct (lead magnet) |
| `/gallery` | Support | Visual proof | carpet gallery India | Distinct |
| `/about` | Trust | Brand story | about Tapis Global | Distinct |
| `/contact` | Conversion | Contact/RFQ | contact carpet manufacturer | Distinct |

### 2.2 Products (`/products/[slug]`) — 14
`hand-knotted-carpet`, `hand-tufted-carpet`, `wall-to-wall-carpets`, `carpet-tiles`, `flat-weaves`, `kilim-rugs`, `dhurrie-rugs`, `jute-sisal-rugs`, `coco-coir`, `shaggy-rugs`, `area-rugs`, `leather-carpets`, `poufs`, `tat-patti`.
**Intent:** product-type/manufacturing query (e.g. "hand knotted carpet manufacturer"). Generally well-separated by construction/material. Overlaps to watch: `dhurrie-rugs` & `tat-patti` vs the Dhurrie silo (§3.4); `wall-to-wall-carpets` vs `carpet-tiles` (both "commercial flooring") — LOW, distinct format.

### 2.3 Industries (`/industries/[industry]`) — 30
Airport, apartment, auditorium, bank, banquet-hall, bar-lounge, casino, church, clubhouse, conference-room, coworking, cruise-yacht, embassy, exhibition, government, hospital, **hotel**, **hotel-lobby**, **hotel-room**, library, mosque, museum-gallery, office, restaurant, retail, school, senior-living, spa-wellness, temple, villa.
**Intent:** end-use vertical ("hotel carpet manufacturer"). Strong long-tail differentiation. Internal-overlap cluster: `hotel-carpets` ↔ `hotel-lobby-carpets` ↔ `hotel-room-carpets` (§3.3).

### 2.4 Solutions (`/solutions/[slug]`) — 8
| Slug | H1 | Primary keyword |
|---|---|---|
| `luxury-carpets` | Luxury Carpet & Rug Manufacturer in India | luxury carpet manufacturer India |
| `designer-rugs` | Designer Rug Manufacturer for Architects & Interior Designers | designer rug manufacturer India / for architects |
| `custom-carpets` | Custom Carpet & Rug Manufacturer in India | custom carpet manufacturer India |
| `modern-rugs` | Modern & Contemporary Rug Manufacturer in India | modern/contemporary rug manufacturer |
| `commercial-carpet-manufacturer` | Commercial Carpet Manufacturer in India | commercial carpet manufacturer India |
| `wholesale-carpet-supplier` | Wholesale Carpet & Rug Supplier in India | wholesale/bulk carpet supplier India |
| `carpet-exporter-india` | Carpet & Rug Exporter from India | carpet exporter India |
| `contract-carpet-supplier` | Contract Carpet Supplier for Projects & Tenders | contract carpet supplier India |
Highest-density overlap cluster in the site — see §3.1, §3.2.

### 2.5 Countries (`/countries/[country]`) — 12
`usa`, `uk`, `germany`, `france`, `italy`, `spain`, `netherlands`, `belgium`, `australia`, `uae`, `saudi-arabia`, `qatar`.
**Intent:** "carpet exporter to {country}". Differentiated by market. Overlap only with `/solutions/carpet-exporter-india` at the head-term level (§3.2). **+17 new markets added on this branch** (see §5) — each targets "carpet exporter to {country}", disjoint from each other.

### 2.6 India (`/india`, `/india/[location]`) — NEW
Hub + priority city/market pages (Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad, Jaipur, Goa, Bhadohi …). **Intent:** "carpet manufacturer in {city}" / pan-India commercial supply. New head-term risk with Home/Products — mitigated in §3.5.

### 2.7 Dhurries (`/dhurries/[slug]`) — 18
Manufacturer/exporter + tender/bulk supplier variants (school, hostel, NGO, relief-camp, government-tender, tat-patti …). **Intent:** B2B/institutional dhurrie & tat-patti supply. Tight tender/bulk niche, well-separated from the retail `products/dhurrie-rugs`.

### 2.8 Company (`/company/[slug]`) — 10
`factory`, `manufacturing-process`, `custom-manufacturing`, `quality-control`, `certifications`, `production-capacity`, `oem-private-label`, `export-process`, `sustainability`, `why-bhadohi`.
**Intent:** EEAT / trust / capability. Supports money pages; low keyword competition among themselves. Note `custom-manufacturing` (company) vs `custom-carpets` (solution) vs `/custom` — see §3.1.

### 2.9 Guides (`/guides/[slug]`) — 22
Informational cluster (manufacturing / comparison / buying / export). Informational intent; feeds authority to money pages. No commercial cannibalization; watch comparison guides that mirror product pages (informational vs transactional — acceptable and desirable).

---

## 3. Overlap Register (actionable)

### 3.1 "Custom carpet manufacturer" — `/custom` vs `/solutions/custom-carpets` vs `/company/custom-manufacturing` — **HIGH**
Three URLs touch custom/bespoke manufacturing.
- **Recommendation:**
  - `/solutions/custom-carpets` → **STRENGTHEN** as the SEO keyword owner for **"custom carpet manufacturer India"** (informational-commercial).
  - `/custom` → **REPOSITION** toward transactional intent: "start a custom carpet project / bespoke design service" (funnels to design-studio + RFQ). Trim generic "custom carpet manufacturer" phrasing from its H1/title so it stops competing on the head term.
  - `/company/custom-manufacturing` → **KEEP** as EEAT capability proof; ensure it targets "custom carpet manufacturing capabilities/process", not the head term. Cross-link all three.
- **Not executed** (touches existing live pages); staged for human review.

### 3.2 "Carpet exporter India" — `/solutions/carpet-exporter-india` vs `/countries` (hub) — **MEDIUM**
- **Recommendation:** `carpet-exporter-india` = keyword landing (owns "carpet exporter India"); `/countries` = navigational hub (owns "carpet export markets" + funnels to per-country pages). Already differing titles. **KEEP + STRENGTHEN** cross-links (hub → solution, solution → hub). No change required to URLs.

### 3.3 "Commercial" vs "Contract" carpet — `commercial-carpet-manufacturer` vs `contract-carpet-supplier` — **MEDIUM-HIGH**
The `commercial-carpet-manufacturer` seoTitle currently *also* contains "Contract Carpet Supplier", directly competing with the dedicated contract page.
- **Recommendation:** **REPOSITION** titles so each owns one term: commercial → corporate/commercial interiors (offices, retail, workspaces); contract → specification-led project & **tender** procurement. Remove "contract" from the commercial page's title. Staged (existing pages).

### 3.4 Hotel sub-cluster — `hotel-carpets` vs `hotel-lobby-carpets` vs `hotel-room-carpets` — **MEDIUM**
- **Recommendation:** **KEEP**; treat `hotel-carpets` as the parent hub, `hotel-lobby`/`hotel-room` as intent-specific children. Ensure parent links down and children link up (removes cannibalization by hierarchy). "hospitality carpet manufacturer" is intentionally owned by `hotel-carpets` — no separate hospitality page exists, so no conflict.

### 3.5 India hub vs Home/Products — "carpet manufacturer India" — **MEDIUM (new, mitigated at design time)**
- **Mitigation applied on this branch:** `/india` H1/title target **pan-India multi-city commercial supply** ("Carpet & Rug Manufacturer — Pan-India Supply for Projects"), not the bare brand head term. Home keeps the brand head term; Products keeps "collections". City pages own "carpet manufacturer in {city}", which neither Home nor Products target. No two India pages share a city.

### 3.6 Designer / Luxury / Modern rugs — **LOW-MEDIUM**
- **Recommendation:** **KEEP**; separable by buyer intent (luxury = premium/HNI residential; designer = trade/architect spec; modern = style/aesthetic query). Add explicit cross-links and ensure intros lead with the distinct angle.

### 3.7 `products/dhurrie-rugs` & `products/tat-patti` vs Dhurrie silo — **LOW**
- **Recommendation:** **KEEP**; product pages = catalogue/material intent, silo = institutional/tender/bulk B2B intent. Cross-link product ↔ silo.

---

## 4. Summary of Recommendations

| Cluster | Severity | Action | Executed on this branch? |
|---|---|---|---|
| /custom vs solutions/custom-carpets vs company/custom-manufacturing | HIGH | REPOSITION /custom; STRENGTHEN solution | No — staged (live pages) |
| commercial vs contract solution | MED-HIGH | REPOSITION titles | No — staged (live pages) |
| carpet-exporter-india vs /countries | MEDIUM | KEEP + cross-link | Cross-links strengthened |
| hotel / hotel-lobby / hotel-room | MEDIUM | KEEP (hierarchy) | No — staged |
| India hub vs Home/Products | MEDIUM | Differentiated at design | Yes — India pages built distinct |
| designer/luxury/modern | LOW-MED | KEEP + cross-link | Cross-links in new data |
| dhurrie product vs silo | LOW | KEEP + cross-link | No change needed |

**Nothing was deleted or redirected.** The two HIGH/MED-HIGH items involve existing production pages and are explicitly staged for human review before any title/redirect change, per working rules 3, 10 and 11.

---

## 5. Guardrails applied to NEW pages (this branch)

To avoid *introducing* cannibalization while expanding:
1. Every new country page targets a unique "carpet exporter to {country}" head term — no two overlap.
2. Every India city page targets a unique "carpet manufacturer in {city}" term; the India hub targets pan-India supply, not the bare brand term.
3. New pages cross-link *up* to their hub and *sideways* to 2–4 related markets only (no link spam).
4. No new page duplicates an existing slug (validated by `scripts/seo-audit.ts`).
