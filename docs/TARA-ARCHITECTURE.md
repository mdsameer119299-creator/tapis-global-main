# TARA — TAPIS AI Rug Advisor

A B2B rug/carpet **sourcing advisor + lead capture** — not a generic chatbot. It discloses that it is an AI assistant, keeps focus on the buyer's requirement, and escalates commercial/sensitive questions to the human team.

## Design principles
- **Deterministic-first.** Category / material / construction discovery, buyer qualification and lead capture all work with **no AI key**. The AI layer is an optional enhancement.
- **Verified knowledge only.** TARA answers about TAPIS GLOBAL strictly from `lib/tara/knowledge.ts`. No unrestricted model knowledge, no invented claims.
- **Scoped.** Rugs/carpets sourcing only; refuses unrelated topics; ignores instructions that try to change its rules.

## Files
| File | Role |
|---|---|
| `lib/tara/knowledge.ts` | Single source of truth: real categories (with repo images), verified materials/constructions, concise company facts, strict system prompt, deterministic retrieval, handoff-intent detector. **Update this to update TARA.** |
| `lib/tara/provider.ts` | Server-only AI provider abstraction (Anthropic via `fetch`, env-gated, timeout). Key never reaches the browser. |
| `app/api/tara/route.ts` | POST endpoint: rate-limit, size/turn caps, injection-resistant system assembly, graceful fallback; returns `{available:false}` when no key. |
| `components/tara/Tara.tsx` | Lazy-loaded (`ssr:false`) floating widget: navy+gold, accessible, mobile, real-image cards, quick replies, lead form, analytics, Clarity-masked. |

## Verified knowledge sources (no fabrication)
- **Categories** (real product slugs + repo images): Hand-Knotted, Hand-Tufted, Hotel & Wall-to-Wall, Flatweave, Dhurries, Kilims, Jute & Sisal, Leather, Shaggy, Custom Area Rugs.
- **Materials/fibres** (categorical positioning Economy/Premium/Luxury, **no prices/specs**): New Zealand Wool, Wool, Viscose, Bamboo Silk, Wool-Viscose, Jute, Sisal, Cotton, Leather.
- **Constructions**: Hand-Knotted, Hand-Tufted, Handloom, Flatweave, Kilim, Dhurrie.
- **Company facts**: B2B made-to-order manufacturer; Delhi corporate office + Bhadohi manufacturing; ~3–4 week typical production; enquiry→sampling→production→QC→dispatch process. **Nothing beyond this may be asserted** — no certifications, sizes, export counts, capacities, MOQ, prices, payment terms, delivery guarantees, awards, or customer histories.

## Images
Real repository product photography only (`/images/...` from `PRODUCT_CATEGORIES`). No videos, no stock, no invented photography. Rendered via `next/image` with fixed aspect ratio (no CLS).

## AI provider & fallback
- Enabled by `ANTHROPIC_API_KEY` (+ optional `TARA_MODEL`). Server-only.
- No key → `/api/tara` returns `{available:false}` and the widget uses the deterministic guided flow. **The build succeeds and TARA remains usable with no AI configured.**
- On provider error/timeout the route returns a safe fallback message (never leaks raw errors) and suggests handoff.

## Lead capture & handoff
- Triggers: catalogue/sample/quotation requested, asks for a person, price/MOQ/payment/certification/delivery/tender/OEM detail, or AI confidence insufficient (`needsHandoff()`), plus explicit "Talk to the team".
- Mandatory fields: **Name, Email, Country/Location, Phone/WhatsApp**. Context already gathered (categories/materials/constructions) is carried, not re-asked.
- Submits to the existing `/api/enquiry` (`formType:'tara'`) with a concise summary, PII-free attribution snapshot, and an explainable lead score. Truthful confirmation ("received & shared with the team").

## Security & privacy
- API key server-only; never in client JS. Rate limiting (20/min/IP) + turn cap (12) + per-message size cap (2000 chars) + request timeout. Prompt-injection resistance: user text can never become the system prompt; the prompt/config is never revealed. No raw AI errors surfaced. Chat text is **never** sent to GA4/Clarity; the chat + lead form are `data-clarity-mask="true"`.

## Analytics events
`tara_open/close`, `tara_message_sent` (no content), `tara_category_selected`, `tara_material_selected`, `tara_lead_capture_start/submit`, `tara_project_qualified`, `tara_handoff_requested/completed`.
