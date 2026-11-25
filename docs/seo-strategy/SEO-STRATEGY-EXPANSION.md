# TAPIS GLOBAL: expanded SEO strategy (India + worldwide)

Status: strategy and roadmap, built on the 25 Nov 2026 Search Console snapshot (277 sitemap URLs, 283 audited URLs), the repository, and the owner's direction that all existing site content and claims stay. Nothing here removes or weakens an existing claim. **Final branch state (what is actually implemented):** SEO metadata rewrites; extra keywords and extra FAQ items rendered by the existing FAQ components (landing, industry, guide and product pages); extra deep-dive paragraphs inside the existing product deep-dive area; JSON-LD heritage wording ("roots dating back to 1965"); footer image alt text (image unchanged); the SEO quality test; and these documents. Everything else in this document is a proposal or a roadmap. **Permanent restriction:** SEO only; the visual design, layout, CSS and images are not changed, and anything that needs a visible new section, component or link block waits for explicit owner approval.

**Data honesty.** I have no keyword-volume, difficulty or CPC data and have not invented any. Keywords are grouped by intent and mapped to pages. Validate priority with Google Keyword Planner and Search Console queries before committing writing time. Search Console query data is thin for most pages (low impressions), so the roadmap leans on intent and on what already earns impressions: the home page (2,575 impressions, position 6.8, 129 clicks), `/guides/how-carpets-are-manufactured` (1,570 impressions, position 9.4), `/guides/wool-vs-viscose-carpets` (812), and `/countries` (620, position 23).

## 1. Keyword research and mapping (deliverable 1)
**Approved keyword master: `keyword-master-v3.1.csv`** (687 keywords, 124 target URLs, exactly one Primary per URL; qualitative priority only; volume, difficulty and CPC are blank because no keyword-volume data was available). This file is the authority. `keyword-research-and-mapping-v1-HISTORICAL-470.csv` is the first-pass 470-keyword mapping (groups A-Q) kept for history only; it is superseded by the V3.1 master and must not be used for decisions. Final inventory: 124 active target URLs = 72 existing pages to optimise + 41 existing pages to deepen and differentiate + 11 proposed standalone guides (unpublished, pending approval). Separate from those 124: 10 guide proposals folded into existing pages and 6 earlier guide proposals consolidated into 3 broad guides; none of these 16 is a target URL and none is created.

Principles: one primary target page per keyword (no cannibalisation); the manufacturer / exporter / factory terms go to the pages that already carry manufacturer positioning; informational queries go to guides that then link to the commercial page.

Key gaps found by the mapping (no page or only a thin match today):
1. Axminster explanations ("what is Axminster", Axminster vs Wilton): only an anchor section exists. New guide.
2. Carpet tiles buyer guidance (tiles vs broadloom, sizes, installation).
3. Carpet care and maintenance (no guide exists today): about 8 queries.
4. Pile types, GSM, density, backing: educational group.
5. "Floor covering" / "flooring manufacturer" / "carpet flooring" wording: add naturally to the wall-to-wall, carpet-tile and commercial pages and to one hub explainer.
6. Trade buyers by role: rug sourcing agents, private-label brands, interior-design trade.

## 2. India and international plan (deliverables 2 and 4)
**Current footprint:** 31 India pages (30 cities + Bhadohi), 29 country pages, 51 USA state and 19 USA city pages. The site audit shows high template similarity in these clusters (worst pairs: USA states 62%, India 58%, countries 57%, USA cities 51%), and 49 of the 83 non-indexed URLs are in large template clusters. **So the next gain is depth and differentiation, not more URLs.**

**Rules for every location page:** only state what is true (Tapis Global manufactures in Bhadohi and supplies buyers; no local offices, local customers or local projects unless the owner supplies them); distinct buyer value per page; at least one local-market section that other pages cannot reuse.

**India (pan-India) plan**
- Keep the 31 city pages. Raise depth on the highest-value metros first: Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Pune, Ahmedabad, Jaipur (hospitality, builder, interior-design demand).
- Differentiate each with: local building and hotel/office demand types, climate and wool/viscose/jute suitability, how orders ship from Bhadohi (transit realities, no fabricated local depots), and 3 distinct FAQs. Indore/Nagpur-style near-duplicates (58%) need a rewrite of the body, not synonyms.
- Add **8 state hub pages** only if each carries distinct sourcing content (Uttar Pradesh, Maharashtra, Gujarat, Karnataka, Tamil Nadu, Telangana, Rajasthan, West Bengal), linking down to the city pages. Not before the city pages are differentiated.
- Add an India sourcing explainer: "Buying carpets in India: factory-direct vs wholesaler vs retailer."

**International plan**
- Priority markets (largest buyer fit, verified existing pages): USA, UK, Germany, France, UAE, Australia, Canada, Netherlands, Belgium, Saudi Arabia. For each: import route and documentation overview, shipping modes, typical buyer segments (importer, hotel group, designer, contractor), styles and materials in demand, and 8+ FAQs. Where we lack verified facts (duties, regulations) link to the official customs source and say "check current rules", rather than state numbers.
- Pages held out of the sitemap today (Austria, Ireland, South Africa) and thin Poland: promote only after the deep-dive sections exist, using owner-verified market information (existing project decision).
- New markets: the site already covers the Nordics, GCC and Asia-Pacific. Add further markets (owner's choice) only once Search Console shows demand.
- USA states/cities (70 pages, highest duplication): freeze new additions. Consolidate effort into the 10 highest-demand states with distinct sections; leave the rest live and linked but low priority.

## 3. Blog and guide editorial roadmap (deliverable 3)
Principle: about 60 genuinely useful articles over 6 months, not a mass of AI pages. Each article: researched, original, 1,000–2,000 words where the topic needs it, a named section that adds something a competitor page lacks (a table, checklist, specification template), FAQs, contextual links to 1 product page, 1 solution/industry page, 1 guide and the enquiry/catalogue page. All claims about Tapis Global use only existing site facts. Technical statements are checked against standards bodies and manufacturer sources before publishing.

Wave 1 (months 1–2): highest commercial value and clear gaps. **Approved first batch (V3.1, all unpublished):** four broad guides replace items 1-5 and 6 as follows: How to choose a carpet manufacturer (item 6); Axminster carpets: manufacturing, types and applications (items 1, 2, plus tufted vs woven); Carpet tiles: types, applications and selection (items 3, 4); Commercial and hospitality flooring guide (item 5, hotel specification checklist). The table below is the original roadmap.
| # | Working title | Target keyword group | Links to |
|---|---|---|---|
| 1 | What is Axminster carpet? Construction, uses and how it differs from Wilton and tufted | G | wall-to-wall (anchor), hotel carpets |
| 2 | Axminster vs hand-tufted broadloom: which to specify for a hotel | G, D | wall-to-wall, hotel buying guide |
| 3 | Broadloom vs carpet tiles for offices and hotels | G, H | carpet tiles, office carpets |
| 4 | Carpet tiles buying guide: sizes, backing, layout and overage | H | carpet tiles |
| 5 | Hotel carpet specification checklist for architects and procurement | D, M | hotel carpets, contract supplier |
| 6 | How to choose a carpet manufacturer in India: 12 questions to ask | N, A | factory, quality control, certifications |
| 7 | Carpet vs rug vs floor covering: terms explained for buyers | C, N | products hub, glossary |
| 8 | Pile types explained: cut, loop, cut-and-loop (and what GSM means) | I | hand-tufted |
| 9 | Wool vs viscose vs bamboo silk: choosing a fibre | I | existing wool-vs-viscose guide |
| 10 | Hand-tufted vs hand-knotted: cost, lead time, durability (refresh existing) | F | both product pages |
| 11 | How to import rugs from India: steps, documents and Incoterms | K | export process, countries hub |
| 12 | Private-label rugs from India: how brands brief a manufacturer | L, J | OEM page, custom |

Wave 2 (months 2–4): sourcing, applications, maintenance
| # | Working title | Group |
|---|---|---|
| 13–18 | Sourcing guides: USA, UK, Germany, France, UAE, Australia (one per country, each with that market's import notes, not a template) | K, Q |
| 19–24 | Hospitality: hotel lobby, guest rooms, corridors, ballrooms, spa, restaurant carpet guides | D, M |
| 25–28 | Offices: office flooring selection, co-working, conference room, acoustics (carefully sourced) | D |
| 29–32 | Residential: living room rug size guide, bedroom rugs, stair runners, rugs for underfloor heating | B |
| 33–38 | Care and maintenance: cleaning wool, viscose, jute, shaggy, hand-tufted; stain guide; rug pads | N |
| 39–42 | Materials: New Zealand wool, bamboo silk, jute and sisal, wool-blend rugs (extend existing material pages) | I |

Note (V3.1 master): the roadmap tables are an editorial ideas list, not the keyword-mapped inventory; where they differ, the master wins. The import guides for USA, UK, Germany, UAE, Australia and Canada are not created (their keywords are sections of the country pages); stair-runner and rug-pad content is a section of /products/area-rugs; wool and viscose cleaning are sections of /materials/indian-wool and /materials/viscose.

Wave 3 (months 4–6): authority and long tail
| # | Working title | Group |
|---|---|---|
| 43–48 | Bhadohi: history of the carpet belt, process by stage, why buyers source here (extend existing page; sourced history) | A, N |
| 49–52 | City guides for 4 metros with distinct content (hospitality, builder, designer demand) | P |
| 53–56 | Design: rug patterns by style, colour palettes for hotels, custom logo rugs | O, J |
| 57–60 | Trade: how to read a rug specification; MOQ and sampling explained; lead-time planning; quality checks | N, L |

Quality gate before publishing any article: unique angle vs top results; every fact verified; no duplicate FAQs; at least 4 contextual links; passes `test:seo-quality` similarity check (35% limit); appears in sitemap and in the guides hub.

## 4. Country and city content roadmap (deliverable 4)
| Order | Action | Pages |
|---|---|---|
| 1 | Differentiate high-similarity India city pairs (Indore/Nagpur 58%, others above 50%) | 8–10 pages |
| 2 | Deepen priority country pages (USA, UK, Germany, France, UAE, Australia, Canada, Netherlands, Belgium, Saudi Arabia) with import notes, segments, styles, 8+ FAQs | 10 pages |
| 3 | Promote Austria, Ireland, South Africa, Poland only after owner-verified inputs | 4 pages |
| 4 | Country sourcing guides (blog, wave 2) | 6 articles |
| 5 | State hubs (India) once cities are differentiated | up to 8 pages |
| 6 | Freeze new USA state/city pages; deepen the top 10 states | 10 pages |

## 5. Product and category SEO plan (deliverable 5)
Implemented in the final branch (SEO text only, inside existing components): extra keywords on the category pages; extra FAQ items (existing FAQ component) and extra deep-dive paragraphs (existing deep-dive area) on the product categories; extra FAQs and keywords on the solution and industry landing pages and on guides; title and description cleanups.
NOT implemented (reverted to production by owner decision on design protection; do not treat as completed features): the hub buyer-guide blocks on /products, /catalogue and /contact; the "Explore" and "Next steps" link blocks on the home, category and landing pages; the per-category "methods" sections; the "Why Buy ... from Tapis Global" heading change. Their copy, where useful, is held in `08-HELD-copy-for-approval.md` (outside the repo) pending approval.
Next (each item that needs a visible block, heading or new link element is HELD until the owner approves it):
1. Rewrite meta descriptions to include a synonym pair per category (for example "floor covering", "broadloom", "wholesale") where natural.
2. Image alt text: descriptive alt for every product photo that actually shows the product; flag the 3 alts that mention QC/production for photo verification.
3. HELD (new visible block): a "which construction should I choose" comparison block on /products linking all categories.
4. HELD (new visible block): per-category "Specification checklist for buyers" (what to send in an enquiry), unique per product.
5. Category cross-links (only as links inside existing text, so the visual presentation is unchanged): hand-tufted <-> wall-to-wall <-> carpet tiles <-> area rugs; flatweaves <-> kilim <-> dhurrie <-> tat patti; natural fibre group. Proposed in `04-internal-linking-plan.csv`; not yet applied.
6. Link technical terms (KPSI, GSM, pile, selvedge) to the glossary from existing text only; not yet applied.

## 6. Conversion plan (deliverable 8 part)
Every informational article should end with a role-specific call to action (importer, hotel, designer, contractor) to catalogue or enquiry; every product page already has CTA and WhatsApp. A short "send us this information" checklist on the hubs was proposed but is NOT implemented (reverted; it needs a new visible block and owner approval). Track enquiries by source page using the existing attribution.

## 7. Internal-linking plan (deliverable 8)
- **Silo flow:** guide → category → solution/industry → enquiry. Each guide links to exactly 1–2 products, 1 solution/industry, 1 related guide and the catalogue/contact.
- **Anchor text:** descriptive, varied (for example "hand-tufted hotel carpets", "Axminster broadloom"), never exact-match repeated sitewide.
- **Limits (for any links approved later):** no more than 3 contextual links to the same target per page. The "Next steps" block was reverted and does not exist on the live branch.
- **New pages:** each new page gets 3+ inbound contextual links on the day it ships and is added to the sitemap in the same change.
- **Orphans:** `test:seo-rendered` enforces at least one inbound rendered link per sitemap page.

## 8. Rollout (deliverable 8)
Phase A (weeks 1-2): owner review of the net patch; differentiation of 8-10 India city pages; prepare the four approved broad guides (they stay unpublished until approved). Phase B (weeks 3-6): further guides; deepen 5 countries. Phase C (months 2-4): wave 2, deepen remaining priority countries, state hubs if justified. Phase D (months 4-6): wave 3, review Search Console results.
Every phase: run all SEO tests; submit new URLs via the sitemap; inspect the 5 most important new URLs in Search Console; do not request indexing in bulk.

## 9. Success measures
Indexed share of intended URLs (target: all valuable pages; utility pages and redirects excluded by design); impressions and clicks per cluster; enquiries by source page; average position for the primary keyword per target page. No volume targets are promised.

## 10. Blockers and decisions
- Search volumes and difficulty: need Keyword Planner or an SEO tool; none were available.
- Live indexing status can only be read from Search Console; my list reflects the 25 Nov snapshot.
- Market facts (duties, regulations) and any local claims need owner or official sources.
- Build verification (`next build`) still blocked here by Google Fonts and Prisma downloads.
