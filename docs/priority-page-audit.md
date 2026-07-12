# Priority-Page SEO & Conversion Audit (40 URLs)

Audited live production HTML across a representative page of every template (product hub/detail, industry, country, solution, company, guide). Findings generalise to the 40 priority URLs in `docs/90-day-growth-plan.md`.

## What is already healthy ✅
| Check | Result |
|---|---|
| Canonicals | Self-referential, absolute, https-www on all templates |
| Meta robots | `index, follow` everywhere (nothing blocked) |
| Breadcrumbs | Exactly one valid `BreadcrumbList` per page with `itemListElement`, `@id` resolves the WebPage reference (fixed & deployed in the prior change) |
| Structured data | Organization/LocalBusiness, WebSite, WebPage, FAQPage, Article (guides), ItemList (hubs) — parse clean; Product/Offer intentionally omitted (B2B quote model) |
| H1 | Exactly one per page |
| Image alt text | 100% coverage on sampled pages (0 images missing alt) |
| CTAs (detail pages) | Get Quote / Request Catalogue / Request Sample / WhatsApp present |

## Prioritized issues

### P0 — none outstanding
The only P0 (breadcrumb `itemListElement` missing → GSC error) was fixed and deployed in the prior change.

### P1 — fixed in this change ✅
| Issue | Pages | Fix |
|---|---|---|
| Thin hub content | /products, /industries, /countries, /solutions | Added unique buyer-guidance sections (`HubGuidance`) — real decision guidance, no fabricated claims |
| No buyer-specific conversion path on hubs | same 4 hubs | Added `LeadSection` (5 buyer paths → qualification form + WhatsApp/email), analytics-instrumented |
| Weak hub → detail/guide internal linking | same 4 hubs | Added contextual internal links to guides, categories, industries, countries, solutions, company pages |

### P1 — documented, recommend a reviewed batch edit (NOT mass-edited here)
| Issue | Evidence | Recommendation |
|---|---|---|
| **Meta titles too long** | 85–92 chars on most priority pages (e.g. hotel-carpets 92, hand-tufted 91) | Trim to ≤ ~60 chars / ~575px so they don't truncate in SERPs; keep the primary keyword + "Tapis Global" and drop secondary qualifiers. Sources: `lib/seo.ts` `PAGE_META`, per-item `seoTitle` in `lib/industries.ts`/`countries.ts`/`solutions.ts`, and dynamic `buildMetadata` calls. |
| **Meta descriptions too long** | 208–276 chars (/products = 276) | Trim to ~150–155 chars, lead with the buyer value + a soft CTA. Same sources as above. |

These are ranking/CTR-affecting copy changes across ~40 records; per the "do not deploy until reviewed" guardrail they are best done as a single reviewed batch rather than bulk-edited blind. Not implemented in this change.

### P2 — future
| Item | Note |
|---|---|
| Roll `LeadSection`/segment CTA to the 32 non-hub priority pages | Reference implementation is live on the 4 hubs; reuse the same components (plan Phase 1–2) |
| Add contextual CTA in guides to the matching buyer path | e.g. import guide → export catalogue |
| Instrument existing global CTAs (`CategoryCTA`, `StickyBar`, `FloatingWhatsApp`, footer) with `trackEvent` | So all conversion clicks are measured, not just the new sections |
| Sitemap `lastmod` is build-time for all URLs | Use real per-page modified dates (from the earlier SEO audit) |

## Method note
Titles/descriptions were measured on live production HTML; content-usefulness, internal-link and CTA checks combine live inspection with the code changes in this branch. No page content was fabricated; where source data was missing, nothing was invented.
