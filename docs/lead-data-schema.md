# CRM-Ready Lead Data Schema & Ethical Prospecting Workflow

## 1. Lead schema

Every enquiry maps to this record. Field names match the keys submitted by `components/leads/QualificationForm.tsx` so leads can be piped into any CRM (HubSpot, Zoho, Pipedrive, a sheet) with a 1:1 mapping.

| Field | Key | Source | Type | Notes |
|---|---|---|---|---|
| Full name | `fullName` | form | string (required) | |
| Business email | `email` | form | string (required) | validated server-side |
| Company name | `companyName` | form | string | |
| Company website | `companyWebsite` | form | url string | distinct from spam honeypot |
| Country | `country` | form | string (required) | |
| WhatsApp | `whatsapp` | form | string | optional |
| Buyer type | `buyerType` | form | enum label | Importer/Wholesaler, Hospitality, Designer/Architect, Private Label, Large Buyer |
| Product interest | `productInterest` | form/preset | string | |
| Quantity / project size | `quantity` | form | string | e.g. "500 sqm", "1 container" |
| Destination country/port | `destination` | form | string | |
| Timeline | `timeline` | form | enum | Immediate … Just researching |
| Message / specifications | `message` | form | text | |
| Intent | `intent` | derived | string | from buyer path (e.g. "Wholesale catalogue request") |
| Consent | `consent` | form | "Yes — agreed to Privacy Policy" | required checkbox |
| Source page | `sourcePage` | form | string | e.g. `/products` |
| Form type | `formType` | system | enum | contact/inquiry/custom/catalogue |
| Submitted at | server time | system | datetime | from email/CRM ingest |
| Client IP | `ip` | server log | string | rate-limit/abuse only; **not** marketing data |

### Scoring & pipeline fields (auto-attached — see `docs/crm-pipeline.md`)
`leadScore` (0–100), `leadTier` (Hot/Warm/Cold), `leadReasons`, and CRM-side `stage` (New→…→Won/Lost), `priority`.

### Conversion-attribution & context fields (captured silently, read-only)
Merged into the payload by `lib/attribution.ts` (client) + `/api/enquiry` (server geo). Not user-editable; used to attribute enquiries — and ultimately revenue — to source/campaign/page rather than raw traffic.

| Field | Key | Source |
|---|---|---|
| Landing page (first touch) | `landingPage` | client (session-persisted) |
| Current page URL | `currentUrl` | client |
| Referrer | `referrer` | client (first touch) |
| UTM source/medium/campaign/term/content | `utmSource`/`utmMedium`/`utmCampaign`/`utmTerm`/`utmContent` | client (first-touch persisted) |
| Language | `language` | client (`navigator.language`) |
| Timezone | `timezone` | client (`Intl…timeZone`) |
| Screen size | `screenSize` | client |
| Device | `device` | client (Mobile/Tablet/Desktop) |
| Browser | `browser` | client |
| Submitted at | `submittedAt` | client (ISO) |
| Visitor country / city / region | `visitorCountry`/`visitorCity`/`visitorRegion` | server (Vercel edge geo headers) |

These make "which product page generates the most revenue / qualified leads" answerable (join `landingPage` + `utm*` + `leadTier` + CRM outcome), not just "which page gets the most traffic".

### Derived/enrichment fields (added in CRM, not collected covertly)
`lead_status`, `owner`, `region`, `estimated_value`, `next_action`.

### Email personalization
On submit, the buyer receives a **buyer-type-specific acknowledgement** (`lib/email-sequences.ts`): Importer→wholesale catalogue, Hotel→hospitality, Designer/Architect→samples & specification, Private Label→OEM, Large Buyer→capabilities/factory call. Every resource link points to a real page — no fabricated brochures. A multi-touch drip would be continued by an ESP using the same templates.

### Storage & retention
- Leads arrive by email (`lib/enquiry-email.ts`) today; the same JSON payload can POST to a CRM webhook later.
- Retain only what's needed to serve the enquiry and the business relationship. Honour deletion/opt-out requests (see consent).
- Do not store card/payment data. Client IP is operational (spam/rate-limit) — keep it out of marketing exports.

## 2. Consent, privacy & spam handling (implemented)
- **Consent:** explicit required checkbox linking to `/privacy-policy`; recorded as `consent`.
- **Spam:** hidden honeypot (`website`), server-side rate limiting (`lib/enquiry-rate-limit.ts`), field validation and junk-message filtering (`lib/enquiry-validation.ts`).
- **No client-side secrets:** submissions go to `/api/enquiry`; email credentials/keys stay server-side.

## 3. Legal, ethical buyer-prospecting workflow

**Principle:** attract and qualify inbound buyers, and reach out only via legitimate, permission-respecting channels. **Never** scrape private data, bypass access controls, violate site/platform terms, or automate spam.

**Allowed / recommended**
1. **Inbound first** — the conversion paths in this repo capture buyers who arrive via SEO/ads and self-identify their segment and need.
2. **Public business directories & trade bodies** — use export promotion councils, trade-fair exhibitor lists and public B2B directories *within their terms*, for business (not personal) contact details.
3. **Opt-in channels** — LinkedIn outreach that follows LinkedIn's terms (no automation/scraping tools), trade-show connections, and referrals.
4. **Permission-based email** — contact business addresses with a clear, relevant, single offer and an easy opt-out; comply with the recipient's jurisdiction (GDPR/CAN-SPAM/PECR etc.). Honour unsubscribes immediately.
5. **Content & retargeting** — guides/catalogue gated by the qualification form; retarget consented site visitors per your privacy policy.

**Prohibited**
- Scraping personal/private data or content behind logins/paywalls.
- Circumventing rate limits, captchas, robots directives or platform terms.
- Buying/using unlawful contact lists; sending unsolicited bulk mail; bulk automated messaging.
- Misrepresenting identity or the business.

**Per-contact checklist:** business contact? · lawful basis/permission? · relevant offer? · easy opt-out? · records of consent/source kept? If any answer is "no", don't send.
