# Recommended Site Structure — Product Landing Pages

**Architecture decision:** Single dynamic route `/products/[slug]` driven by a rich data model
(`lib/products.ts`). No duplicate URLs, no duplicate content, no redirects. Each slug is a full
premium SEO landing page.

**Positioning everywhere:** Manufacturer → Supplier → Exporter. Business focus ~70% India / 30%
international — India-first, exports secondary.

---

## Canonical product URLs (the 9 categories)

| Category | URL |
|----------|-----|
| Hand Tufted Carpets | `/products/hand-tufted-carpet` |
| Hand Knotted Carpets | `/products/hand-knotted-carpet` |
| Shaggy Rugs | `/products/shaggy-rugs` |
| Jute & Sisal Rugs | `/products/jute-sisal-rugs` |
| Leather Carpets | `/products/leather-carpets` |
| Wall to Wall Carpets | `/products/wall-to-wall-carpets` |
| Flat Weaves | `/products/flat-weaves` |
| Poufs | `/products/poufs` |
| Coco Coir Products | `/products/coco-coir` |

> "Custom Rugs" intentionally maps to the dedicated `/custom` page (bespoke programme), not a
> product category — avoids a thin duplicate.

---

## How each page is structured (top → bottom)

1. **Hero** — breadcrumb, "Manufacturer · Supplier · Exporter" eyebrow, keyword-led H1, Request
   Catalogue + Get Quote CTAs
2. **Product Overview** (H2) — intro + body + overview paragraphs, key bullets, MOQ/lead-time/materials panel
3. **Applications** (H2 + H3 cards) — hotels, residential, commercial, architects/designers
4. **Manufacturing Capabilities** (H2) — 4-step process + customisation checklist
5. **Technical Specifications** (H2) — spec table + MOQ/lead time
6. **Gallery** (H2) — 12-image lightbox grid
7. **FAQ** (H2 + H3) — category-specific + shared buyer FAQs (drives FAQ schema)
8. **CTA band** — Request Catalogue + Get Quote + WhatsApp
9. **Related Products** — 3 internally-linked sibling categories + "All Collections" link
10. **Why Tapis Global** — trust block

**Schema per page:** WebPage + BreadcrumbList + Product + FAQPage (JSON-LD).

---

## Internal linking map

### From Homepage
- Hero "Explore Products" → `/products`
- (Existing) Collections / Solutions sections → `/products` and `/custom`

### From Products Menu (navbar dropdown — `lib/data.ts` `PRODUCT_DROPDOWN`)
- Direct links to all 9 `/products/[slug]` pages
- "Products" parent → `/products` hub

### From Products Hub (`/products`)
- `CategoryGrid` cards → every `/products/[slug]` page (primary internal-link hub)

### From Footer (`components/layout/Footer.tsx`)
- Hand Knotted, Hand Tufted, Wall-to-Wall, Jute/Natural Fibre → respective `/products/[slug]`
- Custom Rugs → `/custom`

### From each Product page (cross-linking)
- **Related Products** section → 3 sibling categories (see `related` field in `lib/products.ts`)
- Breadcrumb → Home + Products hub
- CTAs → `/catalogue`, `/contact`, WhatsApp
- "View All Collections" → `/products`

### Related-products graph (sibling links)
```
hand-tufted-carpet   → hand-knotted-carpet, wall-to-wall-carpets, shaggy-rugs
hand-knotted-carpet  → hand-tufted-carpet, flat-weaves, leather-carpets
shaggy-rugs          → hand-tufted-carpet, flat-weaves, jute-sisal-rugs
jute-sisal-rugs      → flat-weaves, coco-coir, shaggy-rugs
leather-carpets      → hand-knotted-carpet, poufs, hand-tufted-carpet
wall-to-wall-carpets → hand-tufted-carpet, coco-coir, flat-weaves
flat-weaves          → hand-knotted-carpet, jute-sisal-rugs, shaggy-rugs
poufs                → leather-carpets, hand-tufted-carpet, jute-sisal-rugs
coco-coir            → jute-sisal-rugs, wall-to-wall-carpets, flat-weaves
```
Every page links to and is linked from at least 3 others — no orphans, even internal-link distribution.

---

## Where to extend
- **Add a category:** append one object to `PRODUCT_CATEGORIES` in `lib/products.ts`. It is
  automatically picked up by the dynamic route, sitemap, hub grid, sidebar, dropdown and related-products graph.
- **Edit content/SEO:** all per-page title tags, meta descriptions, H1s, FAQs, specs live in the data model.
