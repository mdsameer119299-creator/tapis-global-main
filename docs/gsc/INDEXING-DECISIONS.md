# Search Console indexing — decisions & evidence (2026-11-17)

Source of truth for the 24 reported URLs: `docs/gsc/crawled-not-indexed.csv` (GSC "Crawled – currently not indexed",
last-crawled dates as exported). Technical tests passing does **not** mean Google will index a page — "Crawled – currently
not indexed" is Google's own quality/prioritisation decision after a successful fetch.

## Test layers (kept separate on purpose)
| Layer | Command | Network | What it proves |
|---|---|---|---|
| Source-level, per URL | `npm run test:seo-gsc` | none | route exists + is statically generated, in sitemap, canonical, robots meta, no X-Robots-Tag rule in config, one H1, breadcrumb, content size/differentiation, contextual inbound link, contact/catalogue link, JSON-LD validity |
| Source-level, site-wide | `npm run test:seo-indexing`, `npm run test:seo-rendered` | none | sitemap/robots/canonical invariants; rendered anchors |
| **Live production** | `npm run seo:gsc:live` | yes | real HTTP status, redirects, response headers (X-Robots-Tag), deployed HTML, sitemap Content-Type |

Source-level tests print "LIVE … NOT verified here" wherever only the source could be checked. SKIP is never counted as a pass
(`test:seo-gsc` exits non-zero on any FAIL or SKIP).

## Country pages: Austria, Ireland, South Africa, Poland
* **Austria, Ireland, South Africa — live routes, held out of the sitemap.** Reason (docs/SEO-SITEMAP-ROLLOUT.md, `COUNTRY_SITEMAP_EXCLUDE` in
  `app/sitemap.ts`): Phase-2 markets, held until they receive the deep-dive content the promoted markets have. Verified: none of the three has
  buyer segments, popular styles or material recommendations, and each has 5 FAQs vs 8 (about 360–390 words of page data vs 570–850).
  They remain linked from the `/countries` hub, are not noindexed, and are **not** removed. `test:seo-indexing` fails if one of them gains the
  deep-dive content, as a prompt to promote it.
* **Poland — in the sitemap but as shallow as those three** (same missing sections, 5 FAQs). It was promoted with the Phase-1 batch. Decision
  recorded, not changed: demoting it or writing its deep-dive needs the owner's verified Poland-market information; nothing was invented.
  `test:seo-indexing` pins this state so it cannot drift silently.

## Content changes
Only one text change was justified by evidence: the H1 of `/company/production-capacity` was the 3-word "Our Production Capacity"
(failed the "meaningful H1" check). It now reads "Our Carpet Production Capacity in Bhadohi" — wording already used by that page's own title,
description and intro. No claims, figures, certifications or capabilities were added anywhere.
