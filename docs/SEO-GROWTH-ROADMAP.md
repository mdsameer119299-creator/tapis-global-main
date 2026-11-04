# Pan-India and International Organic Search Growth Plan

**Repository:** `tapis-global-main`  
**Implementation branch:** `seo/pan-india-global-growth`  
**Production safety:** all changes are proposed through a pull request; do not deploy directly from this branch.

## Objective

Grow qualified organic visibility for Tapis Global's actual B2B audiences: Indian wholesalers and distributors, architects and interior designers, hospitality procurement teams, commercial project buyers, importers, and private-label/OEM buyers.

The goal is qualified enquiries and catalogue requests, not raw URL count or traffic from unrelated consumer searches.

## 1. Pan-India search architecture

Retain the existing `/india` hub and `/india/[location]` pages. Improve and maintain these as a connected market cluster rather than generating a thin page for every pin code or locality.

Priority market groups:

- **Tier 1 commercial markets:** Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Pune, Ahmedabad, Kolkata.
- **Tier 2 regional and industrial markets:** Surat, Jaipur, Lucknow, Noida, Gurugram, Faridabad, Indore, Nagpur, Coimbatore, Kochi, Visakhapatnam, Bhubaneswar, Raipur, Chandigarh, Ludhiana, Amritsar, Vadodara, Nashik, Kanpur, Bhopal, Goa.
- **Manufacturing-origin authority:** Bhadohi — clearly distinguish the real manufacturing base from cities served remotely.

Each city page should answer genuinely local B2B questions: relevant buyer segments, likely project applications, suitable product constructions, procurement/specification considerations, sample/approval process, delivery coordination, and how to request a quotation. Never imply an office, showroom, warehouse, customer, completed project, or local team where none exists.

## 2. International search architecture

Retain the existing `/countries` hub and country pages. Prioritise markets based on actual sales capacity, buyer fit, Search Console impressions, qualified enquiries, and export feasibility—not a blanket page-count target.

Initial market groups for ongoing content and conversion optimisation:

- **Core English-language markets:** United States, United Kingdom, Canada, Australia, New Zealand, Singapore.
- **European markets:** Germany, France, Italy, Spain, Netherlands, Belgium, Sweden, Denmark, Finland, Norway, Switzerland, Poland.
- **Gulf markets:** UAE, Saudi Arabia, Qatar, Bahrain, Kuwait, Oman.
- **Additional markets:** Japan, South Korea, Austria, Ireland, South Africa.

Country pages must contain market-specific value: buyer types, product fit, specification questions, sampling and approval workflow, shipping/documentation considerations, and clear enquiry paths. Do not state that Tapis has local offices, local inventory, customers, completed projects, established export history, certifications, or guaranteed shipping/lead times unless the company has current evidence.

## 3. Page-to-intent mapping

Give every indexable URL one primary search intent. Avoid making the homepage, product hub, country pages, and city pages compete for the same broad phrase.

| Page cluster | Primary intent |
|---|---|
| Homepage | Carpet and rug manufacturer in India |
| Product categories | Specific construction/material/product sourcing |
| Industry pages | Carpet and rug procurement for a buyer segment |
| Solution pages | Contract, wholesale, OEM/private-label and custom requirements |
| India city pages | Supplier/manufacturer serving a named Indian market |
| Country pages | Indian carpet/rug manufacturer serving a named export market |
| Guides and knowledge | Research, specification and procurement questions |
| Company pages | Manufacturing, quality process, capabilities and evidence |

Use descriptive internal anchor text that explains the destination. Every priority page should have relevant contextual links from its hub, related products, related buyer/industry pages, and useful guides. Avoid repetitive sitewide exact-match anchors.

## 4. International language strategy

Keep English as the source language until translated pages are complete and reviewed. Prioritise translation only where commercial evidence supports it:

1. German for Germany, Austria and relevant Swiss buyers.
2. French for France and French-speaking Swiss/Belgian buyers.
3. Spanish for Spain.
4. Arabic for relevant Gulf buyer journeys.
5. Japanese and Korean only after market validation.

For each translated page, translate the substantive page content, navigation, metadata, forms, validation messages and conversion journey. Add reciprocal, self-referencing `hreflang` annotations only between genuinely equivalent language/region URLs, plus an appropriate x-default where applicable. Do not add hreflang alternates that point to the same English URL.

## 5. Content quality and trust requirements

- Use original manufacturing knowledge, real product photographs, material/construction details, and documented processes.
- Include an identified author or technical reviewer on substantive guides where appropriate.
- Keep contact, corporate-office and manufacturing-location information consistent.
- Verify all claims about certifications, heritage dates, facility size, employee count, production capacity, export destinations, fire performance, payment terms and delivery schedules before publishing.
- Use structured data only when it accurately describes visible page content and a supported entity.
- Do not add fabricated reviews, aggregate ratings, customer logos, case studies or project references.
- Do not publish near-duplicate city/country pages merely by replacing place names.

## 6. Measurement and release gates

Use Google Search Console and GA4 to assess:

- Impressions, clicks, CTR and average position by query, page, country and device.
- Indexing status and sitemap discovery for each page cluster.
- Qualified enquiries, catalogue requests and contact conversions by landing page and market.
- Query cannibalisation between homepage, product, industry, city and country pages.
- Core Web Vitals and mobile usability on high-value landing pages.

Before a page enters the sitemap or a cluster is expanded, verify: unique intent, useful differentiated content, valid metadata/canonical, one clear H1, crawlable internal links, valid structured data, working enquiry path, and successful production response.

## 7. Implementation sequence

1. Validate the existing open SEO expansion work and its branch ancestry before merging it. Do not merge a branch that carries unrelated or unreviewed commits.
2. Fix high-impact metadata and canonical inconsistencies on existing money pages.
3. Audit India and international pages for content overlap, unsupported claims, broken links and weak buyer relevance.
4. Strengthen the top commercial city and country pages using Search Console demand and qualified lead data.
5. Expand contextual internal links and buyer-specific paths.
6. Add translated language clusters only after complete translation and reciprocal hreflang validation.
7. Run code, SEO-integrity and production URL audits on the Vercel preview before merging.

## Current implementation note

The first change in this branch tightens the global page metadata and adds separate India/international keyword research groups for planning. Keyword arrays are editorial guidance; the `meta keywords` field is not a Google ranking signal. Ranking improvements must come from relevant pages, useful content, crawlability, internal links, performance, and genuine market authority.
