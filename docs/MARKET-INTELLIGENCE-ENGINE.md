# Country Market Intelligence — Content Engine

A reusable content engine for the per-country Market Intelligence page approved in the country IA architecture. **Authors add a content file; the engine does the rest** — routing, internal linking, structured data, and the closing commercial section. No application code changes to publish a country. Mirrors the Knowledge Centre's content-engine pattern (`docs/CONTENT-ENGINE.md`).

## Status: schema + components only (no country content yet)

This is a deliberate two-step rollout, consistent with the site's own phased-indexation discipline (`docs/INDEXATION-AUDIT.md`): the schema, validator and render template ship now; real per-country JSON files are authored later, country by country, as research for each dimension is actually verified. `content/market-intelligence/` currently contains only a template (see below) — zero published entries, zero generated routes. That is expected, not a bug.

## Where content lives (outside application code)
`content/market-intelligence/*.json` — one JSON file per country, matching the `CountryMarketIntelligence` schema in `lib/market-intelligence/types.ts`. Add a file → a new country page at `/countries/[slug]/market-intelligence`. Set `"status": "draft"` to keep it out of the public route.

## The seven dimensions
Every entry has exactly these fixed sections — consistent scaffolding, genuinely different content per country:
1. `buyerBehaviour` — decision-makers, procurement cycle, sample expectations, negotiation norms
2. `designPreferences` — links to a shared Style Library archetype (`lib/market-intelligence/style-library.ts`) plus this country's own local notes
3. `climateMaterialFit` — real climate data, recommended `TARA_MATERIALS` ids, climate-driven care guidance
4. `architecturalContext` — building types and narrative this market actually buys carpet for
5. `sustainabilityExpectations` — only verified, sourced expectations; general/pending otherwise
6. `regulationsCompliance` — a short snapshot linking out to the full Import & Regulatory Guide (Knowledge Centre `export-knowledge` category) — never duplicated in-line
7. `procurementGuidance` — how to actually engage Tapis Global from this market

Plus a required closing `commercial` section (see below).

## The compliance guardrail: `SourcedClaim`
Every claim-bearing field is a `SourcedClaim`: `{ text, status, source? }`.
- `status: "verified"` — a specific, sourced fact. **Requires `source`.** `sustainabilityExpectations.summary` and `regulationsCompliance.snapshot` are validated in *strict* mode: `source` must be a real, specific citation (>= 8 characters), not a placeholder — these two fields carry the highest fabrication risk (naming a standard, directive or certification that hasn't actually been verified for that market).
- `status: "general"` — safe, non-specific guidance that doesn't need a citation.
- `status: "pending-research"` — honest and required when a dimension hasn't been researched yet. **The render template (`MarketIntelligenceView`'s `ClaimText`) never shows the raw `text` for a pending claim** — it renders a soft, generic fallback instead. This makes the guardrail structural: an author (or an AI assistant) cannot accidentally publish an unverified claim just by writing plausible-sounding prose into `text`, because the template won't surface it unless `status` is honestly set to `verified` or `general`.

This is the same discipline already applied in `docs/COMMERCIAL-CLAIMS-REGISTER.md` — softened/deferred wording over an unverified specific claim — now enforced at the schema and render layer, not just as an authoring instruction.

## The closing commercial section
Every entry requires a `commercial` block: `{ headline, supportingCopy, primaryCta, secondaryCta? }`. Tone mirrors `lib/export-capability.ts` — informative first, a single primary call-to-action (typically Request Catalogue / Get a Quote), no fabricated numbers, no stacked banners. This is enforced structurally: `validateMarketIntelligence` fails the build if `commercial` is missing, so a country page can never ship without a natural next step toward enquiry.

## What the engine does automatically
| Concern | How |
|---|---|
| **Loading** | `lib/market-intelligence/content.ts` reads + validates + memoizes the files (server-only, `fs`). Malformed/duplicate files are skipped at runtime; the build gate fails on any. |
| **Reusable template** | `components/countries/MarketIntelligenceView.tsx` renders every country's page — breadcrumb, seven sections, commercial section, related links. |
| **Route** | `app/countries/[country]/market-intelligence/page.tsx` — SSG via `generateStaticParams`, sourced only from published entries. |
| **Automatic internal linking** | `lib/market-intelligence/links.ts` resolves recommended materials, the Style Library archetype (only linked once its own Knowledge Centre write-up is published — never a dead link), the Import & Regulatory Guide, company/EEAT pages, related countries, related industries and glossary terms. |
| **Structured data** | `WebPage` + `BreadcrumbList` + `Service` (area = the country), via the existing `lib/structured-data.ts` helpers. |

## The Style Library
`lib/market-intelligence/style-library.ts` defines six shared regional archetypes (Scandinavian, Minimalist & Contemporary, Gulf Opulent, Heritage & Transitional, Refined Fine Hand-Knotted, Relaxed Natural-Fibre), each mapped to the real countries whose `popularStyles` data (`lib/countries.ts`) already supports it. A country's Market Intelligence page links to the shared archetype rather than re-explaining it — `designPreferences.localNotes` is where genuine local nuance goes instead. Each archetype's `slug` doubles as its eventual Knowledge Centre article slug (`category: 'design-inspiration'`).

## Template, not real content
`content/market-intelligence/_templates/country.template.json` has every field bracketed with an explanation of what real fact belongs there. It lives in a subfolder so the loader (`fs.readdirSync` on `content/market-intelligence/` is non-recursive) never scans, validates or publishes it. To use it: copy to `content/market-intelligence/<country-slug>.json`, replace every bracket with a verified fact (or an honest `pending-research` status), then set `status: "published"`.

## Strict build/CI validation
`scripts/validate-market-intelligence.mjs` (`npm run market-intelligence:validate`, wired into `prebuild` alongside the Knowledge Centre gate) validates every file and exits non-zero on: malformed JSON, missing/invalid required fields, an unrecognised `countrySlug` or `styleArchetypeSlug`, a `verified` claim missing `source`, a missing `commercial` section, or a duplicate `countrySlug`. **Unlike the Knowledge Centre gate, zero published entries does not fail the build** — this is expected during the schema-only phase. Point `MARKET_INTELLIGENCE_DIR` at another folder to validate it.

## Draft vs published
`status:"draft"` entries are excluded from the public route. Public code uses `getPublishedMarketIntelligence(slug)` (returns `undefined` for drafts); `getMarketIntelligence(slug)` (any status) is for internal/admin use only.
