# CraftTrack™ Product Design — v1 scope

Status: **design finalized on the three points that were open** (stage
templates, gallery images, publish model) — see the decisions below, all
given by you directly rather than left to my judgment. Nothing here is
built yet. PR2 (admin panel) does not start until you say so.

**This revision supersedes PR1's merged schema.** The three decisions below
are real, deliberate schema changes — not stylistic — driven by your
instruction to design the data model right the first time so features you
already know are coming (multiple journey templates, rich gallery metadata,
true draft/live separation) don't force a migration later. §13 has the full
revised model. None of it has been applied to `prisma/schema.prisma` yet —
that's still pending your go-ahead, kept separate from "building PR2" since
it's a foundation correction, not admin-panel feature work.

---

## 1. Customer journey (end to end)

```
Any page on the site
  → CraftTrack™ floating button (persistent, site-wide)
  → click → modal fades in (blur backdrop, page behind stays visible)
  → First screen: cinematic teaser, two choices
      A) "Experience CraftTrack™"          B) "Already ordered?"
         → /crafttrack/demo                   → /crafttrack/access
         → sample journey, fully interactive   → order lookup OR account login
         → end CTA: Request Quote / Catalogue  → /crafttrack/dashboard
                                                → order list (account) or
                                                  single order (lookup)
                                                → /crafttrack/dashboard/[orderNumber]
                                                → milestone timeline, real data
```

Return visits happen two ways: the customer bookmarks their dashboard URL,
or clicks the link in a stage-published notification email (§8). Neither
requires re-discovering the floating button.

---

## 2. Popup experience

Refines the original spec, now grounded in the real design tokens found in
`styles/globals.css`:

- **Button**: black (`--ink`) fill, `--g` (champagne gold, #C09B4A) border,
  sparkle icon, pill shape, positioned `bottom: 5.75rem` desktop /
  safe-area-matched mobile — directly above `FloatingWhatsApp`. Gentle pulse
  every 25s (new keyframe, matching the existing `wa-pulse` timing style,
  not a new animation library).
- **Modal**: `createPortal`, backdrop blur, 350ms fade — same pattern as
  the already-built `EnquirySuccessModal` (consistency, not reinvention).
  ESC and click-outside close it; close button top-right.
- **First screen**: full-bleed hero (`tgi-banner-3.webp` or
  `collection-knotted-luxury-room.webp`, both already in the repo — no new
  photography needed), dark gradient overlay, Cormorant Garamond headline,
  the subheadline/body copy exactly as originally specified, two CTAs.
- **Mobile**: modal goes fullscreen (no floating card look), same content,
  larger touch targets on the two CTAs.

## 3. Demo flow (`/crafttrack/demo`)

One hardcoded sample order — **not database-backed**, per your "no customer
data" instruction:

- Customer: "Luxury Villa Dubai." Product: "Premium Hand Tufted Carpet."
- Six milestone stages, horizontal timeline (desktop) / vertical (mobile) —
  the canonical **Standard Luxury Manufacturing Journey** template (§5),
  the same names a real order would show:
  **1. Order Confirmed → 2. Preparation Underway → 3. Handcrafting in
  Progress (current) → 4. Finishing & Quality Inspection → 5. Ready for
  Dispatch → 6. Dispatched.**
- Each stage is clickable — expands to a hero image + a description drawn
  from real, already-approved copy in `lib/company.ts` (manufacturing-
  process, quality-control, export-process), not invented. The current
  stage is visually distinct (highlighted, "in progress" badge).
- A small, permanent label — "Sample journey — illustrative" — keeps this
  from ever being mistaken for a real order, even mid-scroll.
- Ends with "Ready to Start Your Own CraftTrack™?" + Request a Quote /
  Request Catalogue, wired to the existing `lib/submit-enquiry.ts` flow.

## 4. Customer dashboard

- **Order-lookup session** (scoped to one order — see PR1's
  `session.ts`): lands directly on that order's journey view. No list step,
  because the session literally can't see any other order.
- **Account-login session**: lands on an order list (cards — order number,
  product, thumbnail, current-stage badge, last-updated date) → click →
  journey view.
- **Journey view**: same visual language as the demo (milestone timeline)
  but populated with real `JourneyStage` rows — hero image, gallery,
  message, publish date. A summary header shows order number, product,
  placed date.
- **Messages**: a reverse-chronological feed of admin-authored
  `OrderMessage` rows below the timeline.
- **View-only in v1** — no customer-editable fields. Customer-side
  interaction (approve a sample, request a change) is a genuine future
  feature, not v1 scope (§12).

## 5. Admin dashboard

- Login → **orders list**: table/cards (order number, customer, product,
  current stage, last updated), search by order number or customer email.
- **Create order**: pick or create a customer, name the product (optional
  link to a real `lib/products.ts` slug), then assign a **Journey
  Template** (below) — its stage blueprints are copied into the order's own
  independent stages at creation time, ready to customize per order.
- **Order editor**: stage list in sequence, each expandable to edit its
  Draft content (name/status/hero image/gallery/message — see §7 for why
  this is a draft, not a live edit), a "set as current stage" action (only
  selectable among stages that have a Published version — see §7), and a
  per-order message composer.
- **Journey Templates — a real, reusable, admin-managed engine, not a fixed
  library.** This is the mechanism the demo, every new order, and every
  future product category all draw from:
  - A template is a named, ordered list of stage blueprints (name +
    sequence + optional default draft message). Admins can **create,
    duplicate, rename, reorder, and edit** templates from a dedicated
    "Journey Templates" screen in the admin panel — no code change is ever
    required to add one.
  - **v1 ships exactly one template**, used for every order today:
    **"Standard Luxury Manufacturing Journey"** —
    1. Order Confirmed
    2. Preparation Underway
    3. Handcrafting in Progress
    4. Finishing & Quality Inspection
    5. Ready for Dispatch
    6. Dispatched
  - **Designed for near-term growth without a redesign**: as new product
    lines need their own flow (Hand Tufted Standard, Hand Knotted Standard,
    Dhurrie Standard, Kilim Standard, Jute Rug Standard, Coir Mat Standard,
    Custom Project), an admin duplicates "Standard Luxury Manufacturing
    Journey," renames it, and edits the stage list — the order-creation
    flow, the customer dashboard, and the demo all already render whatever
    template a given order references, generically.
  - Editing a template only affects orders created *after* the edit —
    already-created orders keep the stages they were given at creation
    (they're independent copies, not a live reference), so changing a
    template can never silently reshape an order a customer is already
    watching.

## 6. Image upload workflow

- Per stage: any number of images, each a full `StageImage` record (§13) —
  not a bare URL. Exactly one per stage can be flagged as the **hero
  image** (`isHeroImage`); the rest form the **gallery**. This is one model,
  not two separate "hero" and "gallery" concepts, which is what lets an
  admin promote a gallery shot to hero (or back) without re-uploading.
- Drag-and-drop or file picker, client-side preview before upload, then
  stored via Vercel Blob; the returned URL + the admin's title/caption/tags
  are saved as a new `StageImage` row, uploaded in **Draft** state
  (`isPublished: false`) until the stage itself is published (§7).
- **v1 UI surface, deliberately narrow**: the admin form only exposes
  *image file*, *hero toggle*, and *caption*. `title`, `altText`,
  `imageType`, `tags`, `sortOrder` all exist in the schema from day one (so
  no migration is needed to light them up) but aren't editable in the v1
  interface — they default sensibly (`altText` falls back to the stage
  name, `imageType` defaults to `GALLERY`/`HERO`, `sortOrder` defaults to
  upload order).
- A stage with no hero image yet shows a tasteful placeholder (not a broken
  image) — admin can create and sequence stages before every photo is
  ready.
- Recommended aspect ratio shown in the upload UI (16:9 hero, matching the
  site's existing banner convention) — not enforced, just guided.

## 7. Publishing workflow

Every stage has two real, independent states — not a one-way visibility
gate:

- **Draft**: the admin's working copy. Editing a stage's name, message,
  status, or images always edits the Draft. The customer dashboard never
  reads Draft content, so admins can leave a stage half-edited indefinitely
  with zero risk of a customer seeing it mid-edit.
- **Published**: exactly what the customer sees, right now. Empty/null
  until the stage is published for the first time (so a brand-new order's
  later stages simply don't render yet on the dashboard — no placeholder
  text needed).
- **"Publish Changes"**: an explicit admin action, not automatic-on-save.
  It copies the current Draft content (name, message, status, and every
  `StageImage`'s publish-eligible fields) over the Published version,
  **replacing it immediately** — `publishedAt`/`publishedBy` update to now.
  The first time this happens for a stage, it also triggers the
  notification email (§8).
- **v1 explicitly does not build**: version history, rollback to a prior
  Published version, or a review/approval step before publishing. Publish
  is a direct, admin-trusted overwrite — matches "TAPIS staff are the
  source of truth," not a multi-party workflow.
- **Why this doesn't need a redesign later**: because Draft and Published
  are already modeled as genuinely separate content, adding version
  history later is purely additive — an audit table that snapshots
  Published content each time "Publish Changes" runs, with no change to
  how Draft/Published themselves work. Bolting version history onto a
  one-way visibility gate (the model this section originally proposed)
  would have required restructuring the whole publish path; this model
  doesn't.
- The order's `currentStage` pointer can only be set to a stage that has a
  Published version — enforced in the admin UI, not just convention.

## 8. Notifications

- **Trigger**: the first time a stage is published, email the customer —
  order number, new stage name, a direct link to
  `/crafttrack/dashboard/[orderNumber]`. Reuses the exact SMTP
  infrastructure already wired for enquiry emails (`lib/enquiry-email.ts`,
  `nodemailer`) — no new email service.
- **No SMS/WhatsApp API in v1** — the site's WhatsApp button today is a
  plain `wa.me` link, not the programmatic Business API, so there's nothing
  to hook into yet (real future item, §12).
- **In-app cue**: a "new" badge on any stage published in the last 7 days —
  cheap, no real-time/websocket infrastructure needed, still solves "did I
  miss anything since I last checked."

## 9. Gallery behaviour

- Grid of thumbnails (2-4 columns by breakpoint) under/beside the hero
  image, sorted by `sortOrder`. Click → lightbox (fullscreen, prev/next,
  close) — reusing the `EnquirySuccessModal` backdrop-blur pattern again,
  not a new library.
- Each image is now a real `StageImage` record (§13), so captions are a
  first-class field (`caption`) rather than a bolt-on — the lightbox shows
  `caption` under the enlarged image when present, hides the caption row
  when it isn't. **v1 UI only surfaces hero image + gallery grid** (per
  §6); `title`/`tags`/`imageType` exist for later use (e.g. filtering a
  gallery by `imageType: DETAIL` once there's enough imagery per order to
  warrant it) but nothing in v1 reads them yet.
- Only images with `isPublished: true` render on the customer dashboard —
  same Draft/Published split as the stage itself (§7); a newly-uploaded
  image sits invisibly in Draft until the admin publishes the stage.

## 10. Mobile experience

- Floating button + modal: fully responsive as specced in §2.
- Demo/dashboard timeline: horizontal (desktop) → vertical stacked
  (mobile), standard responsive collapse, no separate mobile-only content.
- Admin panel: usable on tablet/phone (responsive forms, stacked layout),
  but genuinely optimized for desktop first — it's an internal tool used at
  a desk. Not investing in a bespoke mobile-admin flow for v1.

## 11. AI content generation

Reuses the `ANTHROPIC_API_KEY` infrastructure already powering TARA — no
new AI provider.

- An "AI-assist" button in the admin stage editor, next to the
  message/description field: admin gives a few keywords ("weaving stage,
  hand-tufted, two weeks"), AI drafts a customer-facing message in the
  site's established voice. **Always lands as a draft the admin reviews and
  edits before saving** — never auto-published, same honesty standard as
  every other claim on the site.
- Also useful for auto-generating alt-text on uploaded images
  (accessibility win, low risk).
- **Explicitly not customer-facing** — no AI chat inside the customer
  dashboard. TARA already fills that role sitewide; CraftTrack doesn't need
  a second one.

## 12. Future scalability (not v1, listed so v1 doesn't paint us into a corner)

- Multi-admin roles (viewer / publisher / owner).
- Full version history per stage (snapshot every "Publish Changes"),
  rollback to a prior Published version, and/or an approval step before
  publishing — additive on top of §7/§13's Draft/Published split, not a
  redesign of it.
- Customer-side interaction — approve or request changes on a stage (e.g.
  sign off a sample photo before production continues). This is the
  natural next step from "view-only" and the biggest genuine product
  upgrade available after v1.
- WhatsApp Business API / SMS notifications, once that infrastructure
  exists for the site generally.
- Analytics: per-order view counts, average time-in-stage reporting
  (enabled by the stage-template consistency from §5).
- Integration with a real ERP/order-management system, with CraftTrack's
  schema becoming a read-optimized projection rather than the source of
  truth.
- White-labeled dashboards for OEM/private-label clients — a genuine
  differentiator matching the "biggest future USP" framing.
- Surfacing `StageImage`'s already-modeled `title`/`tags`/`imageType`
  fields in the admin UI and gallery filtering (§9/§13) — schema is ready,
  interface isn't v1 scope.
- A second/third Journey Template for other product categories (§5) —
  the engine supports it today; only content (new templates) is missing.

---

## Decisions log

The three open questions from the first draft are now resolved, by you,
with more precision than my own recommended defaults — recorded here so the
reasoning survives even after §13 is implemented:

1. **Gallery images** — not a `String[]`. A full `StageImage` record per
   image (13 fields, §13), so captions/alt-text/tags/type exist from day
   one without a future migration, even though v1's UI only surfaces hero +
   gallery + caption.
2. **Stage templates** — not a fixed library, not a single hardcoded set. A
   real **Journey Template** engine admins can duplicate/rename/edit with
   no code changes, shipping with exactly one v1 template ("Standard
   Luxury Manufacturing Journey," the renamed six-stage sequence used
   everywhere in this doc now).
3. **Publish model** — not a one-way visibility gate. A true **Draft/
   Published** dual-state per stage, with an explicit "Publish Changes"
   action that overwrites the Published version. No version history/
   rollback/approval in v1, but the split makes adding those later purely
   additive.

## 13. Final data model — applied to `prisma/schema.prisma`

This is the shape actually implemented, incorporating every decision from
§14's review plus your final sign-off on the Order/Journey split. No open
questions remain below this line.

```prisma
model Customer {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String?
  createdAt    DateTime @default(now())
  orders       Order[]
}

// Purely commercial — who bought, and under what order number. Owns no
// production data itself; that's Journey's job (below), so one Order can
// cover several handcrafted pieces (a villa or hotel project), each with
// its own independent timeline.
model Order {
  id          String    @id @default(cuid())
  orderNumber String    @unique
  customerId  String
  customer    Customer  @relation(fields: [customerId], references: [id], onDelete: Cascade)
  journeys    Journey[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model JourneyTemplate {
  id          String          @id @default(cuid())
  name        String          @unique   // "Standard Luxury Manufacturing Journey"
  description String?
  isActive    Boolean         @default(true)
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  stages      TemplateStage[]
  journeys    Journey[]
}

model TemplateStage {
  id          String          @id @default(cuid())
  templateId  String
  template    JourneyTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)
  name        String          // "Order Confirmed", "Preparation Underway", ...
  sequence    Int
  description String?         // seeds a new stage's draftMessage
}

// The production run itself — one per handcrafted piece. v1's admin flow
// only ever creates exactly one Journey per Order (invisible to any UI),
// but the relation is many so a multi-piece order needs no schema change
// later, just a second "create journey" action in the admin.
model Journey {
  id                String           @id @default(cuid())
  orderId           String
  order             Order            @relation(fields: [orderId], references: [id], onDelete: Cascade)
  journeyTemplateId String
  journeyTemplate   JourneyTemplate  @relation(fields: [journeyTemplateId], references: [id])
  productName       String
  productSlug       String?
  currentStageId    String?          @unique
  currentStage      JourneyStage?    @relation("CurrentStage", fields: [currentStageId], references: [id])
  stages            JourneyStage[]   @relation("JourneyStages")
  media             JourneyMedia[]
  messages          JourneyMessage[]
  notifications     Notification[]
  completedAt       DateTime?        // set once the final stage publishes COMPLETE — screen 18's signal
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt
}

// One per Journey per template stage, copied from the template's
// blueprints at Journey-creation time — independent afterward, so editing
// a template never reshapes a journey already in progress (§5).
model JourneyStage {
  id                String        @id @default(cuid())
  journeyId         String
  journey           Journey       @relation("JourneyStages", fields: [journeyId], references: [id], onDelete: Cascade)
  currentForJourney Journey?      @relation("CurrentStage")
  templateStageId   String?       // which blueprint this was instantiated from
  sequence          Int

  // Draft — admin's working copy. Customer dashboard never reads this.
  draftName    String
  draftMessage String?
  draftStatus  StageStatus @default(PENDING)

  // Published — exactly what the customer sees. Null until first publish.
  publishedName    String?
  publishedMessage String?
  publishedStatus  StageStatus?
  publishedAt      DateTime?
  publishedBy      String?

  media  JourneyMedia[]
  events StageEvent[]
}

enum StageStatus {
  PENDING
  IN_PROGRESS
  COMPLETE
}

// One model for every asset a journey or a stage can carry — image today,
// video/certificate/document as soon as they're needed, with zero schema
// change. Exactly one of journeyId/stageId is set: journeyId for the
// order-cover photo and journey-level documents (care guide, invoice —
// screen 18), stageId for everything shown inside a single stage.
model JourneyMedia {
  id           String           @id @default(cuid())
  journeyId    String?
  journey      Journey?         @relation(fields: [journeyId], references: [id], onDelete: Cascade)
  stageId      String?
  stage        JourneyStage?    @relation(fields: [stageId], references: [id], onDelete: Cascade)
  mediaType    JourneyMediaType @default(IMAGE)
  url          String
  thumbnailUrl String?
  title        String?          // not exposed in v1 admin UI
  caption      String?          // v1 admin UI: yes
  sortOrder    Int              @default(0)
  uploadedBy   String?
  uploadedAt   DateTime         @default(now())
  isHero       Boolean          @default(false)
  isPublished  Boolean          @default(false)   // Draft/Published, same split as the stage
  altText      String?          // not exposed in v1 admin UI (defaults to stage/journey name)
  role         JourneyMediaRole @default(GALLERY)
  tags         String[]         @default([])
}

enum JourneyMediaType {
  IMAGE
  VIDEO
  DOCUMENT
}

enum JourneyMediaRole {
  COVER
  HERO
  GALLERY
  INSPECTION
  DETAIL
  PACKAGING
  DISPATCH
  CERTIFICATE
  CARE_GUIDE
  INVOICE
}

// Admin-authored commentary shown in the customer-facing timeline,
// independent of any single stage. Renamed from OrderMessage — this is
// commentary on a production run, not on the commercial paperwork.
model JourneyMessage {
  id         String     @id @default(cuid())
  journeyId  String
  journey    Journey    @relation(fields: [journeyId], references: [id], onDelete: Cascade)
  body       String
  authorType AuthorType
  createdAt  DateTime   @default(now())
}

enum AuthorType {
  ADMIN
  SYSTEM
  CUSTOMER // reserved, unused in v1 — the two-way messaging listed in §12
}

// The real "Progress History" entity — a narrative-ready activity log,
// not a raw technical audit trail. `type`/`summary` are written in
// customer-legible language and `visibleToCustomer` is already a field
// (always false in v1, since no customer-facing activity feed ships yet)
// so surfacing a real activity feed later is a UI change, not a schema
// change. `snapshot` is unused in v1, reserved for full version history.
model StageEvent {
  id                String         @id @default(cuid())
  stageId           String
  stage             JourneyStage   @relation(fields: [stageId], references: [id], onDelete: Cascade)
  type              StageEventType
  summary           String?
  fromStatus        StageStatus?
  toStatus           StageStatus?
  snapshot          Json?
  visibleToCustomer Boolean        @default(false)
  actor             String         // admin email, or "system"
  occurredAt        DateTime       @default(now())
}

enum StageEventType {
  STAGE_STARTED
  STATUS_CHANGED
  MEDIA_ADDED
  MESSAGE_POSTED
  STAGE_PUBLISHED
  STAGE_COMPLETED
}

// Delivery log for every customer-facing notification — not customer-
// visible content itself (that's JourneyMessage), just proof something
// fired, when, and how. `channel` already has WhatsApp/push reserved, so
// §12's future channels are a new enum value, not a redesign.
model Notification {
  id             String              @id @default(cuid())
  journeyId      String
  journey        Journey             @relation(fields: [journeyId], references: [id], onDelete: Cascade)
  type           NotificationType    @default(STAGE_PUBLISHED)
  channel        NotificationChannel @default(EMAIL)
  recipientEmail String
  sentAt         DateTime            @default(now())
}

enum NotificationType {
  STAGE_PUBLISHED
}

enum NotificationChannel {
  EMAIL
  WHATSAPP // reserved, unused in v1
  PUSH     // reserved, unused in v1
}

model AdminUser {
  id           String    @id @default(cuid())
  email        String    @unique
  passwordHash String
  name         String
  role         AdminRole @default(OWNER)
  createdAt    DateTime  @default(now())
}

enum AdminRole {
  OWNER
  PUBLISHER // reserved, unused in v1 — §12's multi-admin roles
  VIEWER    // reserved, unused in v1
}
```

Every "reserved, unused in v1" comment marks a field or enum value that
exists purely so a listed §12 future feature never needs a migration —
none of them are read or written by any v1 code path.

---

## 14. Architecture review — platform-longevity pass (final checkpoint)

Status: **resolved — every item below has a final decision, applied in
§13 and in `prisma/schema.prisma`.** Kept as-written (rather than
rewritten in past tense) because the reasoning is still the reference for
*why* the schema looks the way it does; each item's actual outcome is
noted inline.

Method: for every model, ask why it exists, why that name, why it won't
box us in, and whether anything should change — *before* touching
`prisma/schema.prisma`. Findings were tiered by how settled they were:

- **Confirmed** — reviewed, no change.
- **Recommended** — a rename or a cheap additive field. Zero interface
  impact, low enough cost that it wasn't put back to you as a decision.
- **Needed sign-off** — a real structural choice with a genuine
  cost/benefit tradeoff. One item, resolved below.

### Confirmed as-is

**`Customer`** — exists because CraftTrack has exactly one identity concept
today: whoever's email is on file with TAPIS. Named `Customer`, not
`Account` or `Client`, because that's the term your own brief used
("Every order belongs to one customer") and renaming away from your own
vocabulary for genericity's sake would cost clarity for no real gain.
Future-proof concern: B2B buyers are often companies with more than one
person who'd want to see the same orders (a hotel's procurement team, a
developer's project manager and architect). Not solving that now —
whether that becomes a company-wide "seat," a shared login, or a future
`Account` layer above `Customer` is a UX question, not a naming one, and
nothing here blocks adding it later (`Order.customerId` can point at a
shared account record via an additive, non-breaking migration whenever
that's actually designed). Nothing changes.

**`JourneyTemplate` / `TemplateStage`** — these exist specifically because
you rejected a hardcoded stage list in the last round; they're already the
generic, admin-duplicable engine "future-proof" is asking for. Names hold
up: a template is the reusable definition, a stage is what it defines.
Nothing changes.

**No `Product` model** — deliberately absent since PR1, re-confirmed here.
`lib/products.ts` is the real product catalogue; a second one in Postgres
would be a duplicate source of truth for zero benefit. What each journey
*is* — its product name, at the moment the order was placed — is already
captured as a plain string (see `Journey.productName` below), which is
actually the *correct* pattern for a provenance-focused brand: if the
public catalogue's copy changes next year, a journey created today keeps
describing the product as it was ordered, not as it's since been rewritten.
`productSlug` stays an optional, nullable deep-link back to the live
catalogue page — never the source of truth. Nothing changes.

### Recommended (low-cost, no interface impact)

**Outcome: `StageImage` → `JourneyMedia`** (not just `Media` — you asked
for the fuller name, and for it to explicitly cover certificates and
documents, not only images/video; `JourneyMediaRole` gained `CERTIFICATE`,
`CARE_GUIDE`, and `INVOICE` alongside the original stage-photo roles, and
`COVER` was added so the order-cover screen's product photo has an
unambiguous role distinct from a stage's `HERO`). Original reasoning:

**`StageImage` → `Media`.** You named "Media" as one of the terms to
pressure-test, and it doesn't hold up as `StageImage`: CraftTrack will
almost certainly want video (a 20-second loom clip is a more compelling
"handcrafting" milestone than a photo) or PDF-style documents (the care
guide promised on the completed-order screen, §18) well within its first
few years — and the newly-approved order-cover screen already needs an
image that belongs to the *journey*, not any single stage. Renaming now
costs nothing (nothing's built); discovering the need after go-live costs
a real migration plus rewriting every upload code path. Concretely:
`imageUrl`→`url`, add `mediaType: MediaType` (`IMAGE` default, `VIDEO`,
`DOCUMENT` reserved), rename `isHeroImage`→`isHero`, keep everything else.
`imageType`'s enum (`HERO`/`GALLERY`/`INSPECTION`/…) stays as `role` — it
answers "what is this asset for," which applies whether it's a photo or a
future video. v1 UI is unaffected: it still only lets an admin upload an
image, toggle hero, and write a caption.

**Outcome: confirmed as designed** — `JourneyMedia.journeyId` (nullable)
plus `JourneyMedia.stageId` (nullable), exactly one set, is what §13 ships.

**`Media` gets an `orderId`-free but `journeyId`-carrying home.** Once the
Order/Journey split below is decided, `Media.journeyId` (nullable) plus
`Media.stageId` (nullable) — exactly one set — lets one model serve both
the new order-cover screen (`journeyId` set, `stageId` null) and every
per-stage image (`stageId` set), instead of inventing a second table for
cover photos. This is the direct schema fix for something the just-frozen
UX now requires, not speculative.

**Outcome: `OrderMessage` → `JourneyMessage`** — you considered
`JourneyStory` and explicitly decided against it as unnecessary
complexity; `JourneyMessage` ships as originally proposed. Original
reasoning:

**`OrderMessage` → `JourneyMessage`.** Same reasoning as `Media` — this is
admin commentary about a specific production run, not about the commercial
order as a paperwork object. Rename tracks the Order/Journey split below.
Also: `authorType` was a bare `String` (`'admin' | 'system'`); tighten to
an `AuthorType` enum (`ADMIN`, `SYSTEM`, and a reserved-but-unused
`CUSTOMER` for the two-way messaging already listed in §12's future list)
— catches a typo'd value at the type layer instead of silently at runtime.

**Outcome: `StageHistory` → `StageEvent`, kept and widened further than
originally proposed.** You asked for one more thing beyond the rename:
`StageEvent` should read as "the customer-visible journey activities,"
not a technical audit trail. §13's version reflects that — `type` uses
narrative language (`STAGE_STARTED`, `MESSAGE_POSTED`, `STAGE_PUBLISHED`,
not internal state-machine terms), there's a `summary: String?` for a
plain-English description, and a `visibleToCustomer: Boolean` flag
(always `false` in v1 — no customer activity feed ships yet, but the row
shape is already ready for one). `actor` replaces `changedBy` for the same
reason: it reads as a participant in the story, not a system log field.
Original reasoning:

**`StageHistory` → `StageEvent`, widened.** Today it only logs status
transitions. §12 already commits to full version history as a future
item ("snapshot every Publish Changes") — if that's ever added on top of
today's `StageHistory` as written, it needs a new table anyway, because
today's shape can't hold a content snapshot. Two cheap changes now avoid
that: broaden `toStatus`/`fromStatus` into a `type` enum
(`STATUS_CHANGE`, `PUBLISHED`, reserved `IMAGE_ADDED`/`MESSAGE_EDITED` for
later), and add one nullable `snapshot: Json?` column, written by nothing
in v1, ready to hold a full content snapshot the day version history is
actually built. This is the one item in this review that's purely
insurance — cheap enough to include, skip it if you'd rather keep the
model minimal until that day actually comes.

**Outcome: confirmed as designed** — `AdminUser.role: AdminRole
@default(OWNER)` ships in §13.

**`AdminUser` gets a `role` field.** §12 already lists multi-admin roles
(viewer/publisher/owner) as a future item. Add `role: AdminRole
@default(OWNER)` now (single value in v1) so the day a second admin needs
a restricted role, it's a UI feature, not a migration-plus-backfill.

**Outcome: kept, explicitly confirmed** — you called it out by name as
"the foundation for future email, WhatsApp and push notifications," which
is exactly why `NotificationChannel` ships with `WHATSAPP`/`PUSH` already
reserved alongside `EMAIL`. Original reasoning:

**New: `Notification`.** Not in §13 at all. §7/§8 already describe an
email firing on first publish, but nothing records that it happened —
today it's a fire-and-forget `nodemailer` call with no audit trail. A
`Notification` row (`journeyId`, `type` — `STAGE_PUBLISHED` in v1 —,
`channel: NotificationChannel @default(EMAIL)`, `recipientEmail`,
`sentAt`) gives you resend-on-failure and a real history for free, and is
exactly the seam §12's WhatsApp/SMS future item needs (`channel` just
gets a second value later — no redesign). This is the one genuinely *new*
table in this review; flagging it distinctly in case you'd rather leave it
for PR3 instead of PR2. My recommendation is to add it now since it's one
small table with no interface footprint, not "enterprise" scope.

### Resolved: `Order` and `Journey` are two models

**Outcome: split approved, exactly as proposed** — "One Order can contain
multiple Journeys." §13 ships `Order` as purely commercial and `Journey`
as the production-tracking entity, with `Journey.completedAt` added for
screen 18's signal. Original reasoning below.

§13 has `Order` directly owning `journeyTemplateId`, `currentStageId`, and
`stages[]` — commercial order and production journey are the same row.
That's fine if a TAPIS order is always exactly one product. It stops being
fine the moment an order covers a whole villa or hotel project with
several carpets, each needing its *own* timeline — which, given your own
buyer segments (hospitality, developers, corporate offices) throughout the
India/USA work, is a realistic near-term case, not a hypothetical one.

**The fix, if you want it:** split into two models.
- `Order` — purely commercial: `orderNumber`, `customerId`, timestamps.
- `Journey` — production tracking: `orderId`, `journeyTemplateId`,
  `productName`/`productSlug` (moved from `Order`), `currentStageId`,
  `stages[]`, and a new `completedAt: DateTime?` (set once the final stage
  publishes as `COMPLETE` — the exact signal the new completed-order
  screen, §18, needs to decide whether to render the celebration screen).
  `JourneyStage.orderId` becomes `JourneyStage.journeyId`.

**Why now specifically:** this costs nothing today — no data exists yet,
and v1's admin flow would still only ever create exactly one `Journey` per
`Order`, invisible to both the admin and customer UI exactly as approved.
Doing it after real orders exist means a genuine data migration (split
existing rows, backfill a `Journey` per `Order`, rewrite every query) —
expensive later for something free now.

**Why it's not automatic "yes":** it's real added structure — one more
join in every query, one more concept for whoever builds PR2 to hold in
their head — for a scenario (multi-item orders) that hasn't been
explicitly asked for yet. This is the one call in this whole review that's
a genuine judgment tradeoff rather than a clear improvement, which is why
it's flagged here instead of folded into "recommended."

**My recommendation:** make the split. The cost is paid once, now, by me;
the alternative cost is paid later, by a real migration against real
customer data, for a business shape (multi-carpet orders) that's already
visible in your own buyer segments. But this is your call to make, not
mine — tell me split or no-split and I'll finalize §13 accordingly before
touching the real schema.
