# Analytics Events — Lead Instrumentation

All events are fired through `lib/analytics.ts → trackEvent(name, params)`, which pushes to **GA4 (`gtag`)** and the **GTM `dataLayer`** when present, and is a safe no-op otherwise. No secrets live in the analytics layer.

## Installing the GA4 tag (prerequisite)

Events are dispatched but go nowhere until a GA4 tag is loaded. Add it once in `app/layout.tsx` using a **public** Measurement ID from an environment variable — never hard-code an ID or any secret:

```tsx
// requires NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX in the environment (public by design)
{process.env.NEXT_PUBLIC_GA_ID && (
  <>
    <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} strategy="afterInteractive" />
    <Script id="ga4" strategy="afterInteractive">{`
      window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date()); gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
    `}</Script>
  </>
)}
```

(GTM works too — if a container is present, `dataLayer` pushes are picked up automatically.)

## Event catalogue

| Event name | Fires when | Key params |
|---|---|---|
| `catalogue_request` | Importer/Wholesaler path chosen or catalogue form submitted | `buyer_type`, `source` |
| `quote_request` | Hospitality path chosen or project-quote submitted | `buyer_type`, `source`, `destination` |
| `sample_request` | Designer path chosen or sample/spec-pack submitted | `buyer_type`, `source` |
| `custom_development_enquiry` | Private-label path chosen or custom form submitted | `buyer_type`, `source` |
| `factory_call_request` | Large-buyer path chosen or factory-call submitted | `buyer_type`, `source` |
| `whatsapp_click` | Any WhatsApp link/button clicked | `buyer_type?`, `source` |
| `email_click` | Any `mailto:` link clicked | `source` |
| `form_submit_success` | Any qualification form submits successfully | `buyer_type`, `source`, `form_type` |

Common params: `buyer_type` (`importer`/`hospitality`/`designer`/`private-label`/`large-buyer`), `product` (e.g. `hand-tufted-carpet`), `source` (page path, e.g. `/products`), `destination` (country/port). All events also carry `event_category: 'lead'`.

Names are the single source of truth in `lib/analytics.ts` (`LEAD_EVENTS`). Do not rename without updating this doc and the GA4 config.

## Where each event is wired
- `components/leads/BuyerPaths.tsx` — segment CTA click → the path's event + `whatsapp_click`.
- `components/leads/QualificationForm.tsx` — successful submit → path event **and** `form_submit_success`.
- `components/leads/LeadSection.tsx` — direct WhatsApp/email → `whatsapp_click` / `email_click`.
- Rollout: reuse `trackEvent` on existing CTAs (`CategoryCTA`, `StickyBar`, `FloatingWhatsApp`, footer) — pending per plan Phase 1/2.

## Testing procedure

**Local / pre-GA4 (no ID set):**
1. `npm run build && npx next start`.
2. Open a hub page, run in the console: `window.dataLayer=window.dataLayer||[]`.
3. Click a buyer CTA / submit the form. Confirm `window.dataLayer` receives `{event:'catalogue_request', …}` etc. (The layer captures pushes even before GA4 loads.)

**With GA4 installed:**
1. Set `NEXT_PUBLIC_GA_ID`, rebuild, deploy to a preview.
2. GA4 → **Admin → DebugView**; enable debug (GA Debugger extension or `?_gl` debug). Trigger each CTA/submit and confirm events + params appear.
3. Verify in **Realtime → Events**.
4. Mark the eight events above as **Key events (conversions)** in GA4 Admin → Events, so they feed the reporting spec.

**Regression check:** after any form/CTA change, re-run the local dataLayer test for the affected event before deploy.
