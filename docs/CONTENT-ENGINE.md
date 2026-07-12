# Knowledge Centre — Content Engine

A reusable content engine for the Knowledge Centre. **Authors add a content file; the engine does the rest** — template, routing, internal linking, related sections, structured data and TARA retrieval. No application code changes to publish an article.

## Where content lives (outside application code)
`content/knowledge/*.json` — one JSON file per article, matching the `KnowledgeArticle` schema in `lib/knowledge/types.ts`. Add a file → a new article. Set `"status": "draft"` to keep it out of the site + sitemap + TARA.

Minimal article:
```json
{
  "slug": "my-article",
  "category": "materials",
  "status": "published",
  "title": "…",
  "summary": "…",
  "seo": { "title": "…", "description": "…", "keywords": ["…"] },
  "body": [{ "h2": "Section", "body": "Paragraph…" }],
  "faq": [{ "q": "…", "a": "…" }],
  "relatedProducts": ["hand-knotted-carpet"],
  "relatedCountries": ["usa"],
  "relatedIndustries": ["hotel-carpets"],
  "relatedArticles": ["another-slug"],
  "relatedMaterials": ["nz-wool"],
  "relatedConstructions": ["hand-knotted"],
  "taraTags": ["wool", "custom rug"],
  "updatedAt": "2026-07-12"
}
```
`category` must be one of the 13 in `lib/knowledge/registry.ts`.

## What the engine does automatically
| Concern | How |
|---|---|
| **Loading** | `lib/knowledge/content.ts` reads + validates + memoizes the files (server-only, `fs`). Malformed/duplicate files are skipped. |
| **Reusable template** | `components/knowledge/KnowledgeArticleView.tsx` renders every article (title, breadcrumb, sections, FAQ accordion, related blocks, CTAs). |
| **Routes** | `app/knowledge/page.tsx` (hub) + `app/knowledge/[slug]/page.tsx` (SSG via `generateStaticParams`). |
| **Automatic internal linking** | `lib/knowledge/links.ts` resolves `relatedProducts/Countries/Industries/Articles` to real on-site URLs (broken refs are dropped — no dead links). Materials/constructions render as chips. |
| **Structured data** | Auto-generated per article: `WebPage` + `BreadcrumbList` (breadcrumb `@id` intrinsically safe) + `Article` + `FAQPage`, via the existing `lib/structured-data.ts` helpers. |
| **FAQ schema ↔ visible FAQ** | Both come from the same `faq[]` — they can't drift. |
| **TARA retrieval** | The TARA route searches the same content files (`searchKnowledgeArticles`) and merges the top matches into the AI context. `taraTags` boost ranking. |

## Serverless bundling
`next.config.js` `outputFileTracingIncludes` traces `content/knowledge/**` into the `/api/tara` and `/knowledge` bundles so the files ship on Vercel.

## Scaling to thousands of articles
- Content is data, not code — add files (optionally per-category subfolders).
- The 13 categories partition the space; relationships (`related*`, `taraTags`) create the internal-link and retrieval graph.
- **Sitemap:** knowledge URLs are intentionally NOT auto-added to the sitemap yet (phased rollout, consistent with the project's indexation strategy). `getPublishedArticleSlugs()` is ready to wire into `app/sitemap.ts` when a batch is approved.
- Guardrails: keep content capability-safe (no invented prices/MOQ/certifications/delivery/claims) — the same rules TARA enforces.

## Tests
`npm run test:content` (20 assertions): file loading + validation, TARA retrieval from content, automatic internal-link resolution (incl. dropping bogus refs), and auto structured-data generation.
