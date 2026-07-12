# Analytics Setup — GA4 + Microsoft Clarity

Both are **optional and env-driven**. With no IDs set, nothing loads and no data is sent — the site is fully functional and privacy-clean.

## Environment variables
| Var | Purpose | Absent behavior |
|---|---|---|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 (e.g. `G-XXXXXXXXXX`) | GA4 script not injected; `trackEvent`/`trackPageView` no-op |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | Clarity project id | Clarity script not injected |

Set in Vercel project env (Production/Preview) or `.env.local`. These are public IDs by design — **no secrets here**.

## How it works (`components/analytics/Analytics.tsx`)
- Loads GA4 + Clarity via `next/script strategy="afterInteractive"` only when the IDs exist (no duplicate injection across renders).
- GA4 `config` sends the initial page_view; App-Router client navigation fires a **manual** `page_view` via `usePathname` (skipping the first effect) — **exactly one initial page_view and exactly one per client navigation; no duplicates**.
- `anonymize_ip: true` on GA4.

## Canonical single dispatch (no double-counting)
`lib/analytics.ts` sends each event through **one** sink, never both:
- **Default (`gtag` mode):** events go through `gtag('event', …)` only. gtag manages `dataLayer` internally, so we **must not** also `dataLayer.push()` the same event — that fixed a double-processing bug.
- **`NEXT_PUBLIC_ANALYTICS_MODE=gtm`:** set **only** if a Google Tag Manager container is installed; then events are pushed to `dataLayer` as GTM custom events and `gtag` is not called directly. The two modes are never mixed. Verified by `npm run test:tara` (one `trackEvent` → one gtag call, zero dataLayer pushes).

## Event taxonomy (`lib/analytics.ts`)
Fire with `trackEvent(EVENTS.x, params)`. Canonical names:
`catalogue_request_open/submit`, `catalogue_delivery_success/failure`, `quotation_start/submit`, `sample_request_start/submit`, `contact_form_start/submit`, `whatsapp_click`, `phone_click`, `email_click`, `product_cta_click`, `industry_cta_click`, `country_enquiry_click`, `india_enquiry_click`, `guide_to_commercial_click`, and TARA: `tara_open/close/message_sent/category_selected/material_selected/project_qualified/lead_capture_start/lead_capture_submit/handoff_requested/handoff_completed`.

## PII policy (enforced)
- **Never** pass name/email/phone/WhatsApp/chat text/file contents to analytics. Only low-cardinality categorical params (`buyer_type`, `category`, `material`, `source`, `destination`, `lead_temperature`).
- `sanitizeParams()` is a defensive backstop: it drops any value matching an email or phone pattern before sending. Verified by `npm run test:leads`.

## Clarity masking (PII in recordings)
- Clarity attribute masking is applied in code: the **TARA chat panel** and **its lead form** carry `data-clarity-mask="true"`, so chat text and lead fields are masked in session recordings. The **catalogue form** inputs are standard text/email/tel fields; Clarity masks input values by default in Balanced/Strict.
- **Defense-in-depth (manual, required):** in the Clarity dashboard, set masking to **Balanced or Strict** and confirm form inputs + chat text render as masked. Attribute masking in code should not be the only layer — dashboard-level masking must also be enabled manually. Neither GA4 nor Clarity receives name/email/phone/WhatsApp/chat text or PII-bearing attribution (categorical params only; email/phone backstop in `sanitizeParams`).

## Verification
1. **GA4 DebugView**: set the ID, open the site with the GA Debug extension (or `?debug_mode=1`), confirm `page_view` on navigation and lead events fire with **no PII** in parameters.
2. **Clarity dashboard**: confirm sessions record and that lead-form/chat content is masked.
3. Attribution: navigate with `?utm_source=test&gclid=abc`, submit a catalogue/TARA lead, confirm the sales email/lead carries `utm_source`/`gclid`/`landing_page` (server-side only).
