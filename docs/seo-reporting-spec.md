# SEO & Lead Reporting Specification (GSC + GA4)

A repeatable weekly/monthly report combining Google Search Console (acquisition) and GA4 (behaviour + conversions), scoped to the 40 priority URLs in `docs/90-day-growth-plan.md`.

## Data sources
- **Google Search Console** — Performance (Search) + Pages (Indexing).
- **GA4** — the eight lead events in `docs/analytics-events.md`, marked as Key events.
- Optional: export both to BigQuery / Looker Studio for a single dashboard.

## Metrics & definitions

### A. Search acquisition (GSC)
| Metric | Source | Segment/breakdown |
|---|---|---|
| Clicks | GSC Performance | total + per priority URL + per country |
| Impressions | GSC Performance | total + per priority URL |
| CTR | GSC Performance | per priority URL (flag < 1.5% with position ≤ 10) |
| Average position | GSC Performance | per priority URL + per target query cluster |
| Indexed priority URLs | GSC Pages / URL Inspection | count of the 40 that are "Indexed" vs "Discovered/Crawled – not indexed" |

### B. Engagement & conversion (GA4)
| Metric | Source | Notes |
|---|---|---|
| Organic sessions to priority URLs | GA4 (session default channel = Organic Search) | landing-page = priority URL |
| Landing-page conversion rate | GA4 | key events ÷ sessions, per landing page |
| Organic conversions | GA4 | count of the 8 lead events from organic sessions |
| Enquiries by country | GA4 | event param `country`/geo + `destination` |
| Enquiries by product | GA4 | event param `product` |
| Enquiries by buyer type | GA4 | event param `buyer_type` |

### C. Pipeline (CRM — manual/CRM-sourced)
| Metric | Source | Notes |
|---|---|---|
| Qualified leads | CRM `lead_status=qualified` | after human review |
| Quotations sent | CRM | |
| Samples/spec packs sent | CRM | |
| Orders won | CRM | tie back to `source`/buyer_type where possible |

## Report layout (weekly)
1. **Headline:** clicks, impressions, avg position, organic conversions vs prior week (Δ%).
2. **Indexing health:** # of 40 priority URLs indexed; list any newly "not indexed".
3. **Top movers:** priority URLs with biggest click/position change.
4. **Low-CTR opportunities:** position ≤ 10 but CTR < 1.5% → title/description rewrite candidates.
5. **Conversions:** organic conversions by event, by buyer_type, by country, by product.
6. **Landing-page conversion table:** the 40 URLs × sessions × conversion rate.
7. **Pipeline:** qualified leads → quotes → samples → orders.
8. **Actions for next week.**

## Build steps
1. **GA4:** mark the 8 events as Key events; create a "Priority URLs" comparison (landing page matches the 40 paths); build an "Organic → Lead" funnel exploration.
2. **GSC:** filter Performance to the priority pages (or a regex of their paths); track avg position for each query cluster.
3. **Looker Studio (recommended):** connect GSC + GA4; one page per section above; date control + Organic-only filter.
4. **Cadence:** weekly ops review; monthly trend review against the 90-day phases.

## Success criteria (90-day targets — set with baseline in week 1)
- Priority URLs indexed: baseline → target (aim ≥ 90% of the 40).
- Organic clicks to priority URLs: +X% (set from week-1 baseline).
- Organic conversions (8 events): establish baseline, then growth trend.
- At least one qualified lead per active buyer segment by day 90.

> Baselines cannot be pre-filled here — capture them in week 1 from live GSC/GA4 data.
