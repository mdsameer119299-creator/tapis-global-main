# TARA — TAPIS AI Rug Advisor

A B2B rug/carpet **sourcing advisor + lead capture** — not a generic chatbot. It discloses that it is an AI assistant, keeps focus on the buyer's requirement, and escalates commercial/sensitive questions to the human team.

## Design principles
- **Deterministic-first.** Category / material / construction discovery, buyer qualification and lead capture all work with **no AI key**. The AI layer is an optional enhancement.
- **Verified knowledge only.** TARA answers about TAPIS GLOBAL strictly from `lib/tara/knowledge.ts`. No unrestricted model knowledge, no invented claims.
- **Scoped.** Rugs/carpets sourcing only; refuses unrelated topics; ignores instructions that try to change its rules.

## Modular knowledge system (`lib/tara/knowledge/`)
TARA is powered by **composable modules, not one huge prompt**:
`company`, `bhadohi`, `history`, `categories`, `materials`, `constructions`, `manufacturing`, `quality`, `care`, `glossary`, `faq`, `commercial-safety`, `personality`, `prompt`, `retrieval`, `index`. The old `lib/tara/knowledge.ts` is now a **backward-compatible barrel** (`export * from './knowledge/index'`) so existing imports keep working.
- **Retrieval** (`retrieval.ts`) builds a `KNOWLEDGE_CORPUS` from every module and ranks it by keyword/tag overlap (`searchKnowledge`, `retrieveContext`). TARA answers from this verified corpus — never unrestricted model knowledge.
- **Personality** (`personality.ts`) defines the consultant persona (warm, professional, consultative, natural English) + greeting.
- **Prompt** (`prompt.ts`) composes the system prompt from persona + safety rules + a verified-facts summary.
- **To expand TARA:** add/extend a module file and (if searchable) include it in `KNOWLEDGE_CORPUS` — **no prompt rewrite**. Scales to many materials, constructions, facts, glossary terms and FAQs.
- Capability-safe: no invented prices/MOQ/certifications/delivery/capacity/clients/projects. Regression-guarded by `npm run test:phase` + `npm run test:tara`.

## Recommendation engine & segment advisors
On top of the conversation-intelligence layer (`conversation-intelligence.ts`: typo/synonym normalization, concept expansion, one-question-at-a-time guidance), two capability-safe additions turn TARA from a describer into an adviser — **all in code + retrieval, base prompt unchanged**:
- **`recommend.ts`** — a **product recommendation engine**. It reuses the `ConversationSignals` the route already computes (no duplicate NLP) and maps the buyer's segment, material/construction cues, budget tier and priorities to a suggested **material + construction + product category**, drawn only from verified data. `buildRecommendation()` appends one capability-safe suggestion line to the guidance **only when there is enough signal** (greetings/vague messages get nothing) — no prices, MOQ, certifications or delivery guarantees.
- **`knowledge/segments.ts`** — verified **segment advisors** (tender, hotel/hospitality, interior designer/architect, export/wholesale, homeowner) added to `KNOWLEDGE_CORPUS`, so segment questions retrieve the right consultative guidance.
- Regression-guarded by `npm run test:tara:intel` (also part of the `test:tara` chain).

## Product Knowledge Engine
Structured product expertise held **in data + retrieval, never in the prompt** (base prompt size unchanged). Makes TARA reason like an experienced carpet expert.
- **Structured profiles** — every material (`knowledge/materials.ts`) carries a `profile`: description, advantages, disadvantages, typical applications, relative durability/softness/luxury ratings, maintenance, recommended projects and alternative materials. Every construction (`knowledge/constructions.ts`) carries a `profile`: description, manufacturing method, suitable materials, best applications, traffic suitability, typical pile height and maintenance. Ratings are relative (not tested guarantees) and are translated to words — never surfaced as numbers.
- **New knowledge modules** — `knowledge/installation.ts` and `knowledge/applications.ts` (room/use-case → suitable products), added to `KNOWLEDGE_CORPUS`. Enriched profile text is folded into the corpus so retrieval surfaces it, and the route places this **verified product knowledge ahead of generic website content**.
- **`knowledge/detect.ts`** — single-source, span-masked detection of material/construction ids from (typo-normalized) text; shared by the recommendation and comparison engines so they never drift.
- **`recommend.ts`** — now weighs project type, budget, **room, foot traffic**, material preference and priorities using the structured profiles, and surfaces an alternative from the chosen material's profile. Deterministic (same input → same recommendation).
- **`compare.ts`** — a **comparison engine** that detects a two-way material/construction comparison (wool vs viscose, bamboo silk vs viscose, hand-tufted vs hand-knotted, kilim vs dhurrie) and builds a natural, capability-safe explanation **entirely from profile data**; injected as guidance (AI rewords it) and usable as a deterministic reply with no AI key.
- Regression-guarded by `npm run test:tara:knowledge` (material/construction recommendation, comparison, wrong spellings, follow-ups, consistency) — also part of the `test:tara` chain.

### Site-wide Knowledge Centre (`lib/knowledge/`)
`types.ts` defines a reusable `KnowledgeArticle` schema (title, summary, SEO, FAQ, related articles/products/materials/constructions/countries/industries, images, `taraTags`, internal links). `registry.ts` defines **13 scalable categories** (Materials, Manufacturing, Carpet History, Buying Guides, Carpet Care, Commercial Projects, Country Guides, Industry Guides, Glossary, FAQ, Design Inspiration, Project Planning, Export Knowledge). **Phase 1 = architecture only** — the article store is empty; future articles plug into TARA via `taraTags`.

## Files
| File | Role |
|---|---|
| `lib/tara/knowledge/*` + `lib/tara/knowledge.ts` (barrel) | Modular verified knowledge (see above). |
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
- **API key is server-only**; never in client JS (verified by `npm run test:tara`).
- Prompt-injection resistance: user text can never become the system prompt; the prompt/config is never revealed. No raw AI/transport errors are surfaced to the client.
- Chat text is **never** sent to GA4/Clarity; the chat + lead form carry `data-clarity-mask="true"`.

### Layered abuse / cost protection (`lib/tara/guard.ts`) — honest limits
The paid provider is protected by defense-in-depth, chosen to fit **serverless** without adding Redis/DB:
1. **Oversized-request rejection** — Content-Length pre-check + actual byte-size check (16 KB) + `MAX_TURNS` (12) + `MAX_CHARS` (2000) before any provider call.
2. **Instance-local burst limiter** (per IP **and** per session). ⚠️ **Honest limitation:** on Vercel/serverless this in-memory Map is **per-instance and resets on cold start**, so it is **not** a reliable *global* limit — it only blunts rapid bursts on a single warm instance.
3. **Cross-instance per-session AI-turn cap** via an **HMAC-signed httpOnly cookie** (`tara_ai`). The counter lives in the client cookie but is signed with a server secret, so a client **cannot forge or raise it**; deleting it only yields a fresh (still-bounded) session while the burst limiter + provider caps still apply. This is the pragmatic cross-instance bound without external infrastructure.
4. **Handoff & quota never call the provider** — deterministic intents (price/MOQ/quotation/sample/catalogue/certification/payment/tender/OEM/"talk to team") and sessions at the AI-turn cap are answered locally, saving paid calls.
5. **Bounded provider call** — strict timeout (`TARA_TIMEOUT_MS`) + `max_tokens` 400; on error/timeout → safe fallback, **no AI turn consumed**.

**Config env (all optional, safe defaults):** `TARA_MAX_AI_TURNS_PER_SESSION` (15), `TARA_MAX_REQUESTS_PER_MINUTE` (20), `TARA_TIMEOUT_MS` (15000), `TARA_SESSION_SECRET` (optional — falls back to a stable hash of `ANTHROPIC_API_KEY`, server-only).

**Remaining limitation:** a determined attacker rotating IPs and clearing cookies can still open many fresh sessions; each is individually bounded, but a truly global hard cap would need shared state (Redis/Upstash/DB), intentionally **not** added here. For higher-risk exposure, add a shared limiter or a WAF/edge rate limit.

## Analytics events
`tara_open/close`, `tara_message_sent` (no content), `tara_category_selected`, `tara_material_selected`, `tara_lead_capture_start/submit`, `tara_project_qualified`, `tara_handoff_requested/completed`.
