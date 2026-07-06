# CRM Pipeline & Lead Scoring

Two connected systems: **automatic lead scoring** (Hot/Warm/Cold) and a **structured sales pipeline**. Both are implemented as code (`lib/lead-scoring.ts`, `lib/crm-pipeline.ts`) so any CRM (HubSpot/Zoho/Pipedrive/sheet) can ingest a consistent, pre-classified lead.

## 1. Lead scoring (Hot / Warm / Cold)

Every enquiry is scored server-side in `/api/enquiry` from **submitted data only** — no enrichment, lookups or fabricated signals. The score (0–100), tier and reasons are attached to the lead email and CRM payload (`leadScore`, `leadTier`, `leadReasons`), and the tier is also sent to GA4 as `lead_tier`.

### Signals & weights
| Signal | Points |
|---|---|
| Buyer type: Large buyer/distributor / Hospitality / Private label / Importer / Designer | +25 / +22 / +20 / +18 / +14 |
| Timeline: Immediate / ≤1 month / 1–3 months / 3–6 months / Just researching | +25 / +20 / +12 / +6 / −5 |
| Quantity specified (+ substantial volume: container/pallet/roll/3-digit qty) | +8 (+10) |
| Business email domain (not gmail/yahoo/…) | +12 |
| Company website provided | +8 |
| Company name provided | +4 |
| Destination specified | +4 |
| Detailed message (≥ 60 chars) | +6 |

### Tiers → priority & SLA
| Tier | Score | Priority | First-touch SLA |
|---|---|---|---|
| **Hot** | ≥ 60 | P1 | 4 hours |
| **Warm** | 35–59 | P2 | 24 hours |
| **Cold** | < 35 | P3 | 72 hours |

Thresholds live in `lib/lead-scoring.ts`; tune with real data. Verified by `scripts/verify-lead-scoring.ts`.

## 2. Sales pipeline

`New → Qualified → Sample → Quote → Negotiation → Won / Lost`

| Stage | Definition | Entry | Exit | Owner | SLA (h) |
|---|---|---|---|---|---|
| **New** | Enquiry received, not yet reviewed | Form/message received | Triage: qualify or disqualify | Sales (triage) | 24 |
| **Qualified** | Real buyer + real requirement | Buyer type, product & need confirmed | Sample or quote requested | Sales | 48 |
| **Sample** | Sample/spec pack requested/prepared/shipped | Construction, colour, size defined | Sample approved → quote | Sales + Production | 120 |
| **Quote** | Formal quotation issued | Spec finalised enough to price | Accept / negotiate / decline | Sales | 72 |
| **Negotiation** | Terms in discussion (price, MOQ, logistics) | Buyer engaged with open points | Agreement (Won) / end (Lost) | Sales / Mgmt | 168 |
| **Won** | Order/PO confirmed | Terms agreed, order placed | Handover to production | Sales → Ops | 24 |
| **Lost** | Closed without order | Declines / silent / disqualified | Archived with reason | Sales | — |

**Allowed transitions** (`STAGE_TRANSITIONS`): New→{Qualified,Lost}; Qualified→{Sample,Quote,Lost}; Sample→{Quote,Negotiation,Lost}; Quote→{Negotiation,Won,Lost}; Negotiation→{Won,Lost}; Lost→{Qualified} (re-engage). Enforced by `canTransition()`.

### Lead → pipeline flow
1. Enquiry submitted → scored → `leadTier`/`leadScore`/`leadReasons` attached.
2. Lead created at stage **New** (`initialStage()`), priority = `priorityForTier(tier)`.
3. Hot leads (P1) are triaged within the 4h SLA; a human qualifies (never auto-advance past New on score alone).
4. Stage advances per the table; every move records who/when/why.

### CRM mapping
- Map lead fields per `docs/lead-data-schema.md`.
- Add CRM properties: `lead_score`, `lead_tier`, `stage` (pipeline), `priority`, `owner`, `next_action`, `stage_changed_at`.
- If the CRM supports webhooks, POST the same JSON payload from `/api/enquiry` (a follow-up integration; email delivery works today).

## Testing
- `npx tsx scripts/verify-lead-scoring.ts` — scoring tiers, monotonicity, business-vs-free email, pipeline order, transition rules, tier→priority/SLA.
- End-to-end: submit the qualification form on a hub page; confirm the lead email shows **Lead Score / Lead Tier / Lead Reasons**, and GA4 `form_submit_success` carries `lead_tier`.
