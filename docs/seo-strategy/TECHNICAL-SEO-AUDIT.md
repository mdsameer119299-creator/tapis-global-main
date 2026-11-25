# Technical SEO and indexing audit (deliverable 6)
Method: source-level audit of the local branch plus the existing suites; live HTTP checks are not possible from this sandbox, so items marked LIVE need `npm run seo:gsc:live` (exists in repo) or Search Console.

| Check | Result | Evidence / action |
|---|---|---|
| robots.txt blocks | PASS | Disallows only /api/, /_next/, /admin/, /private/. No product, guide or location path is blocked. |
| Unintended noindex | PASS | `robots: noindex` appears only on crafttrack/admin pages. No public SEO page sets noindex. |
| Canonicals | PASS (source) | `buildMetadata` sets canonical per page; `test:seo-gsc` checks canonical on 257 checks. LIVE check for www/https consistency pending. |
| Sitemap coverage | PASS with intended holds | 277 URLs. Austria, Ireland and South Africa country pages are live and linked but deliberately held out of the sitemap (phased rollout). |
| Sitemap status codes | LIVE | Not testable here. Run `npm run seo:gsc:live`. |
| Internal links | PASS | `test:seo-rendered` 34/34: every sitemap page has at least one rendered inbound link; links use canonical paths. |
| Redirects | Inactive by design | Host/protocol variants redirect (4 URLs show "page with redirect", correct). Content redirects proposed but NOT active (see redirect-proposals-inactive.md). |
| 404 / soft 404 | 1 known | `/guides/wool-viscose-carpets` returns 404; owner decision pending (needs Git history). |
| JS-rendered content | PASS (source) | Pages are server-rendered React; `test:seo-rendered` inspects rendered HTML. |
| Metadata and structured data | PASS | `seo:audit`: 0 errors, 0 warnings after C15. JSON-LD types WebPage, BreadcrumbList, Article, FAQPage validated by the GSC test. |
| Duplicate URL versions | PASS (source), LIVE pending | Canonical host is www https. 3 variant URLs correctly redirect. |
| Template similarity | NOTE | Worst pairs: USA states 62%, India cities 58%, countries 57%, USA cities 51%. Primary driver of "crawled/discovered, not indexed" in these clusters. |
| New pages in sitemap | RULE | Every new page is added to sitemap and internal links in the same change; `test:seo-indexing` enforces coverage. |

## Non-indexed URLs (deliverable 7)
`non-indexed-urls.csv`: 83 URLs from the 25 Nov snapshot with page type, status, impressions, content metrics, reason class, likely reasons and a recommended action.
- Crawl priority / authority (discovered, not indexed): 49. Mostly large template clusters (industries 14, dhurrie suppliers 8, guides 8, products 5, solutions 5, USA).
- Quality / differentiation (crawled, not indexed): 26. Action: add distinct content and links; do not request indexing until improved.
- Intended exclusions: 4 redirect variants, 2 legal/utility pages. Transient: 1 (4xx on Nov 13–14, now 200). Broken/legacy: 1.
Do not force-index these. The branch adds extra FAQ items, keywords and deep-dive paragraphs (inside existing components) and metadata cleanups to many of them (products, solutions, industries, guides). Contextual link blocks and hub buyer guides were reverted for design protection and are not part of this branch.

## Ongoing monitoring (system)
1. Weekly: Search Console Pages report (indexed, discovered, crawled, duplicate, redirect, 404, server error) compared with the CSV.
2. After each deploy: `npm run seo:gsc:live` and the four local suites.
3. Monthly: sitemap submission status; URL Inspection on the 10 highest-value non-indexed URLs; review of the similarity notes.
4. Alert conditions: any valuable URL gaining noindex, canonical mismatch, 4xx/5xx, or dropping from the sitemap.
