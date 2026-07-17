# SEO Sitemap Rollout Plan — clean-global-india-seo

**Why phased:** Google Search Console currently reports many "Discovered – currently not indexed" URLs. Publishing dozens of brand-new landing pages into the sitemap at once competes for limited crawl budget and can slow indexing of the whole set. So new clusters are exposed in the sitemap in phases. **Every page still exists as a valid, crawlable, internally-linked route** — phase control only governs sitemap listing.

Controlled in `app/sitemap.ts`:
- `INDIA_SITEMAP_SLUGS` — India city pages listed now.
- `COUNTRY_SITEMAP_EXCLUDE` — new country pages held back for Phase 2.

## India — fully promoted

**India (hub + 30 commercial cities + bhadohi):** all `/india/[location]` routes are
now listed in the sitemap. The Commercial SEO Domination project (see
`.claude/plans/adaptive-sauteeing-bird.md`) brought all 30 commercial city
pages to full depth (buyer segments, materials/constructions, EEAT links,
market-similarity internal linking) across four content batches — the
original Phase-1/Phase-2 split that gated on content depth no longer
applies, since every commercial page now meets the same bar. `bhadohi`
(our manufacturing-origin page, not a commercial-market page) stays listed
as it always was.

## Phase 1 (this PR) — in the sitemap now

**International — existing markets (unchanged):**
`/countries/{usa, uk, germany, france, italy, spain, netherlands, belgium, australia, uae, saudi-arabia, qatar}`

**International — new Phase-1 markets (11):**
`/countries/{sweden, denmark, finland, norway, poland, switzerland, canada, singapore, bahrain, kuwait, oman}`

## Phase 2 (later, after Phase-1 pages index) — routes live, not yet in sitemap

**International (6):** austria, ireland, new-zealand, japan, south-korea, south-africa

## How to promote a page to the sitemap
- India: add its slug to `INDIA_SITEMAP_SLUGS` in `app/sitemap.ts`.
- Country: remove its slug from `COUNTRY_SITEMAP_EXCLUDE` in `app/sitemap.ts`.

Recommended trigger: promote once Phase-1 pages show "Indexed" in GSC and/or begin receiving impressions.

## Verification
`npm run seo:audit` reports, as NOTES, every dynamic page currently excluded from the sitemap, and errors if the sitemap ever lists a URL that does not resolve to a real slug.
