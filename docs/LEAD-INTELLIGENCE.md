# Lead Intelligence — Attribution, Scoring, Catalogue Gating

## PR #5 audit (what was reused vs discarded)
`feat/b2b-lead-foundation` (PR #5) was branched **before PR #7/#8** and, diffed against current `main`, would **revert** them (it deletes `lib/india.ts`, `lib/countries.ts`, `scripts/seo-audit*.mjs`, PR #8 docs). It was therefore **not merged/rebased**.
- **Reused (adapted, re-implemented on this branch):** the *ideas* of `lib/analytics.ts`, `lib/attribution.ts`, `lib/lead-scoring.ts`.
- **Changed vs PR #5:** analytics event names match the required B2B taxonomy + a PII backstop; attribution adds `gclid`/`fbclid` + explicit last-touch and **drops fingerprinting** (screen/timezone/device); scoring is explainable with stored reasons.
- **Discarded:** PR #5's SEO-file reverts, `crm-pipeline.ts`/`email-sequences.ts` (out of scope for a safe PR), and its SEO-branch-coupled `components/leads/*`.

## Attribution (`lib/attribution.ts`)
First-party `localStorage`, privacy-conscious:
- **First-touch** (persisted once): landing page, referrer, UTMs, gclid, fbclid, timestamp.
- **Last-touch** (updated on a new campaign signal): current landing, UTMs, gclid, fbclid, timestamp.
- `captureAttribution()` returns a flat, PII-free snapshot merged into the lead **server-side**; not re-exposed to the browser after submit. No exact location, no fingerprinting.

## Lead model & scoring (`lib/lead-scoring.ts`)
Canonical lead fields flow through the existing `/api/enquiry` payload (name, email, mobile, country, buyerType, product/material/construction interests, catalogue/sample/quotation flags, attribution, TARA summary, score/temperature/reasons, handoff reason).

**Scoring is deterministic & explainable** (no opaque AI). Positive signals add points + a reason: business (non-free) email, company, B2B buyer type, category/material/construction, dimensions, quantity, timeline, destination, own design, catalogue/sample/quotation, handoff, repeat visit, high-intent source. Classified **HOT (≥55) / WARM (≥30) / NURTURE**. Reasons are stored so sales sees *why*.

## Catalogue gating (Part 4)
- **No public catalogue PDF exists** in `public/` and no direct download link exists in the UI (asserted by `npm run test:leads`). The catalogue is delivered by request only.
- `/catalogue` → `CatalogueForm` with **mandatory Name, Email, Country/Location, Phone/WhatsApp** + buyer type. Server-side validation + rate limiting via the existing enquiry pipeline.
- **Truthful confirmation:** the system records the request and notifies the team (and sends the buyer an acknowledgement). It does **not** auto-email a catalogue file, so the copy now says *"Your catalogue request has been received. Our team will send you the relevant catalogue…"* — it never claims a catalogue was already emailed.
- If SMTP is unconfigured the enquiry API returns failure (no false "sent"); TARA/catalogue show the truthful error.

## Sales notifications
Reuses the existing SMTP enquiry pipeline (`ENQUIRY_NOTIFY_EMAIL`). TARA leads arrive as `TARA Advisor Lead` with the summary, attribution and score. No new provider introduced; no CRM built this phase.

## Privacy & retention (recommendations)
- Analytics never receives PII (categorical params only; email/phone backstop).
- Attribution stored first-party only; cleared with site data.
- Leads/emails contain only necessary business info; do not log full chat transcripts to third parties.
- Recommend a documented retention window for lead emails/records (e.g. 24 months) and a deletion-on-request process, aligned with the site privacy policy.

## Deferred (documented, not built — keeps the PR safe)
CRM pipeline, email drip sequences, and an admin lead dashboard (P2). Authorized staff currently view leads via the sales inbox (`ENQUIRY_NOTIFY_EMAIL`).
