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

## Case studies (`category: 'commercial-projects'`)
A case study is a normal `KnowledgeArticle` plus an optional, additive `caseStudy` block (`lib/knowledge/types.ts`) — same body/faq/images/related-links/seo/structured-data pipeline as any other article, with the extra structured fields a real installed-project write-up needs: `overview`, `clientSector`, `country`, `product`, `material`, `construction`, `size`, `timeline`, `manufacturingProcess`, `challenges`, `solution`, `testimonial`. `KnowledgeArticleView` renders these as a project-spec panel, a Challenge/Solution pair, a numbered manufacturing-process list, and (only if present) a testimonial blockquote — automatically, no per-article component work.

**Template, not real content:** `content/knowledge/_templates/case-study.template.json` has every field with a bracketed `[placeholder]` explaining what real fact belongs there. It lives in a subfolder so the loader (`fs.readdirSync` on `content/knowledge/` is non-recursive) never scans, validates or publishes it. To use it: copy to `content/knowledge/<real-slug>.json`, replace every bracket with a verified fact, delete the testimonial block entirely unless you hold the client's explicit written permission for that exact quote, then set `status: "published"`. `validateArticle` enforces the required `caseStudy` fields and that `caseStudy` only appears on `commercial-projects` articles.

## Writing AI-readable content (`definitions` / `comparisonTable`)
Two optional, generic fields make any article — not just materials or case studies — readable by both people and AI answer engines (Google AI Overviews, ChatGPT, Perplexity, Gemini, Bing Copilot):
- **`definitions`** — an array of `{ term, definition }`. Put the 2–4 terms a reader genuinely needs defined up front, in one clear sentence each. Reuse the exact wording already in `lib/tara/knowledge/glossary.ts` (`TARA_GLOSSARY`) wherever the term already exists there — don't write a second, slightly different definition of "Pile" or "KPSI"; one consistent definition per term, cited everywhere, is what builds the entity consistency AI systems look for.
- **`comparisonTable`** — `{ caption, columns, rows }`, rendered as a real HTML table. Only use it for a genuine comparison already grounded in existing data (e.g. the numeric durability/softness/luxury ratings already in `TARA_MATERIALS`), never invented figures.

Both render automatically via `KnowledgeArticleView` — no per-article component work.

**Avoiding keyword stuffing:** write the term once, clearly, and let the internal-linking system (`relatedMaterials`, `relatedProducts`, etc.) carry repetition instead of repeating the keyword phrase in every sentence. A `definitions` block that states a term once, precisely, reads better to a person and extracts more cleanly for an AI answer than the same phrase repeated five times across a paragraph.

## Scaling to thousands of articles
- Content is data, not code — add files (optionally per-category subfolders).
- The 13 categories partition the space; relationships (`related*`, `taraTags`) create the internal-link and retrieval graph.
- **Sitemap:** knowledge URLs are intentionally NOT auto-added to the sitemap yet (phased rollout, consistent with the project's indexation strategy). `getPublishedArticleSlugs()` is ready to wire into `app/sitemap.ts` when a batch is approved.
- Guardrails: keep content capability-safe (no invented prices/MOQ/certifications/delivery/claims) — the same rules TARA enforces.

## Strict build/CI validation
`scripts/validate-knowledge.mjs` (`npm run knowledge:validate`, and wired as
**`prebuild`** so `next build` fails on bad content) validates every file and
exits non-zero on: malformed JSON, missing/invalid required fields, invalid
`category`, invalid `body`/`faq`/`images`/`related*` structures, or **duplicate
slugs**. The same validator (`validateArticle` / `readAndValidateArticles` in
`lib/knowledge/content.ts`) backs both the gate and the runtime loader; at
runtime invalid files are skipped defensively, but the build gate guarantees bad
content never ships. Point `KNOWLEDGE_DIR` at another folder to validate it.

## Draft vs published
`status:"draft"` articles are excluded from the public routes, sitemap helpers and
TARA. Public code uses `getPublishedArticle(slug)` (returns `undefined` for drafts);
`getKnowledgeArticle(slug)` (any status) is for internal/admin use only.

## TARA retrieval (bounded body chunks)
`retrieveArticleContext(query, { maxChars, maxChunks })` ranks individual article
**body sections** — not just title+summary — and returns the most relevant chunks
joined, strictly capped by `maxChars` (default 1200) and `maxChunks` (default 4),
so TARA gets real article knowledge without the AI context ever ballooning.

## Tests
`npm run test:content` (35 assertions): file loading + validation, TARA retrieval
from content (incl. bounded body chunks), automatic internal-link resolution
(incl. dropping bogus refs), auto structured-data generation, strict validation of
malformed/duplicate/invalid content, and draft exclusion / published-only lookup.
