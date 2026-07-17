// ─────────────────────────────────────────────────────────────────────────────
// lib/export-capability.ts
// Shared, capability-safe MOQ / production / delivery copy for country pages.
//
// These are genuinely company-wide policies — they do not vary by destination
// market — so they are written once here and reused identically across every
// country page, rather than inventing a different set of figures per country.
// Wording is deliberately non-numeric/enquiry-deferred, consistent with the
// claim discipline in docs/COMMERCIAL-CLAIMS-REGISTER.md: no fabricated MOQ
// unit counts, production-day counts or delivery-day counts are asserted here.
// ─────────────────────────────────────────────────────────────────────────────

export const EXPORT_CAPABILITY = {
  moq: {
    label: 'Minimum Order Quantity',
    body: 'Minimum order quantities depend on construction, size and customisation — hand-tufted, hand-knotted, flat-weave and wall-to-wall programmes each carry a different practical minimum. Share your project brief and our team will confirm the MOQ that applies.',
  },
  production: {
    label: 'Production',
    body: 'Production is scheduled around construction and order volume, with in-process quality checks at every stage and a documented pre-dispatch inspection before any shipment leaves Bhadohi. Confirmed production timelines are shared once specification and order size are set.',
  },
  delivery: {
    label: 'Delivery',
    body: 'Delivery is coordinated by sea or air freight to your preferred port or airport, with phased dispatch available for large or multi-lot orders. Transit time depends on destination, freight mode and shipping line — our team will confirm a schedule against your order.',
  },
} as const

export type ExportCapabilityKey = keyof typeof EXPORT_CAPABILITY
