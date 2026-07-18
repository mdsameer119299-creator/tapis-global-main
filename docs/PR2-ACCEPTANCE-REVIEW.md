# PR2 Acceptance Review — CraftTrack™ Admin Panel

Reviewed as an external senior engineer would review it before signing off
for production: every claim below was checked against the actual code in
`main` (PR2a + PR2b, merged), not recalled from memory. Where something
isn't built, that's stated plainly rather than implied to be handled.

---

## 1. Completed Features

**Authentication**
- Admin login (email + password, bcrypt-verified) at `/admin/crafttrack/login`, session cookie via `jose`-signed JWT, logout.
- Route protection via `middleware.ts` (page-level redirect) and `requireAdminSession()` (API-level 401) — both layers present on every protected surface.

**Customer management**
- Customer list with `_count.orders`.
- Quick-create form.
- Search-as-you-type customer picker (real WAI-ARIA combobox) with inline "+ create new customer."

**Order management**
- Orders list with search (order number, customer name, customer email) and per-order journey/stage summary.
- Combined order-creation flow: one form creates `Customer` (if new, upserted by email) + `Order` + `Journey` + all `JourneyStage` rows from the selected template, in a single transaction.
- Order detail page listing every journey on that order.
- "Add another journey" to an existing order (the multi-item-order case the schema was built for).

**Journey management**
- Journey Template selection (one v1 template, "Standard Luxury Manufacturing Journey," seeded idempotently).
- Journey workspace: cover photo, product/order/customer header, current-stage indicator, tabbed Stages/Messages/Notifications (real `tablist`/`tab`/`tabpanel`, not styled buttons).
- Stage editor: message field, image upload/hero-toggle/caption, Draft/Published dual-state, "Save Draft" and "Publish Changes" (behind a real focus-trapped confirmation dialog).
- "Set as current stage" (only enabled for already-published stages).
- Journey cover upload (publishes immediately — see §6).
- Journey messages (admin-authored, customer-facing).
- Read-only notification history.
- Customer-experience preview, rendered through the same component (`PublishedJourneyView`) PR3 will reuse for the real customer portal.

**Cross-cutting**
- Public site chrome (nav/footer/WhatsApp/TARA) correctly hidden on every `/admin` route without affecting static generation elsewhere.
- Vercel build-cache Prisma-client staleness fixed via `postinstall: prisma generate`.

---

## 2. Workflow Review

Walked each listed workflow through the actual code, not the happy-path assumption.

| Workflow | Result | Notes |
|---|---|---|
| Admin Login | **No dead end** | Wrong credentials → inline `role="alert"` error, no crash. Success → session cookie set, redirect to Orders. |
| Create Customer | **No dead end** | Duplicate email → 409 with a clear message, not a 500. |
| Create Order | **No dead end** | Ends on Order Detail, which shows the new journey immediately. |
| Create Journey | **No dead end** | Both the combined flow and "Add journey" land somewhere real. |
| Select Template | **No dead end**, but **effectively no choice** | The `<select>` works, but only one template exists (§1's "Completed Features" is accurate: template *management* was deliberately not built — see §6). |
| Edit Cover | **No dead end** | Upload → immediately visible in the header. Replacing a cover correctly deletes the old Blob object. |
| Edit Stage | **No dead end** | Message + Advanced-fields status editable; name is intentionally not editable in the v1 UI. |
| Upload Media | **No dead end**, **one gap** | Upload → thumbnail appears via refetch. Gap: deleting the current hero image leaves **no** image flagged as hero anywhere in the admin UI (see §3). |
| Save Draft | **No dead end** | Button disabled until dirty, `aria-live` announces success, but the announcement text is screen-reader-only — there's no visible confirmation for sighted users (see §5). |
| Preview as Customer | **No dead end** | Opens in a new tab, renders only Published content. A journey with zero published stages correctly shows the empty-state copy instead of a blank page. |
| Publish Changes | **No dead end** | Confirmation dialog → success updates the stage list immediately via refetch. |
| Notification Sent | **Dead end for the admin, not the code** | The email send is correctly deferred outside the DB transaction and failures are caught — but a failed send is **silent**. Nothing in the UI tells the admin it didn't go out (see §3, §6). This is the one workflow in the list that doesn't fully close the loop. |

---

## 3. Edge Cases

- **Customer with multiple Orders** — handled. `Customer.orders` is a real one-to-many relation; nothing assumes a customer has exactly one order.
- **Order with multiple Journeys** — handled; this is the exact scenario the Order/Journey split exists for. Order Detail lists all of them.
- **Journey with no media** — handled. `PublishedJourneyView`'s hero fallback (`media.find(isHero) ?? media[0] ?? null`) degrades to no hero image shown, not an error.
- **Journey with no message** — handled. `JourneyMessage` list renders "No messages yet." in the admin panel and simply omits the "Updates from our team" section in the customer preview when empty.
- **Publish twice** — safe. The transaction always executes; only the *notification* is gated by `isFirstPublish`, so re-publishing edits an already-live stage without re-emailing the customer. No duplicate-notification bug.
- **Delete media** — **real gap**. Deleting a hero image doesn't reassign a new one. The admin media grid will show zero hero-flagged images until the admin manually re-toggles one; the customer preview independently falls back to "first image in list," so admin and customer views can silently disagree about what "the hero" is after a delete. Not a crash, but a real inconsistency.
- **Empty gallery** — handled; upload panel just shows the drop zone.
- **Very large gallery** — **not handled well**. No pagination, virtualization, or lazy-loading in `MediaUploadPanel` or `PublishedJourneyView`. Fine at today's expected volume (a handful of images per stage); would degrade with dozens.
- **Missing hero image** — handled via the same fallback noted above, but see the Delete-media gap for how it can arise.
- **Notification failure** — caught and logged server-side (`console.error`), swallowed so the publish itself still reports success — correct for *not blocking* the admin, but there is **no admin-visible signal** that it failed. An admin has no way to know a customer wasn't notified short of noticing an absent row in the Notifications tab, which nothing prompts them to check.
- **Browser refresh during edit** — expected behavior, not a bug: unsaved draft edits (message/status not yet "Saved") are lost on refresh, same as any unsaved HTML form. No autosave or local-storage backup exists. Worth knowing, not worth calling a defect.

---

## 4. Security Review

**Authentication** — sound. bcrypt (12 rounds), JWT session via `jose`, `httpOnly` + `secure` (prod) + `sameSite=lax` cookies. No plaintext password ever stored or logged.

**Authorization** — sound at the "is this an admin" level (every mutating route calls `requireAdminSession()`); **incomplete** at the "which admin can do what" level. `AdminUser.role` (`OWNER`/`PUBLISHER`/`VIEWER`) exists in the schema and is never read by any route — every authenticated admin has full access regardless of role. Fine while there's exactly one admin account; a real gap the moment a second, more restricted account is created.

**CSRF** — `sameSite=lax` cookies mean the browser won't attach the session cookie to a cross-site POST/PATCH/DELETE, which is a real, modern mitigation — this isn't wide open. There is no additional CSRF token (double-submit cookie, `Origin` header check) as defense in depth. Acceptable for v1 given the `sameSite` baseline; worth adding before this handles anything more sensitive than internal order data.

**Input validation** — solid for JSON bodies: every route validates with `zod` and returns a clean `{ok:false, error}` on failure, never a raw stack trace. Search query params are intentionally *not* zod-validated (documented, low-risk, plain string clamp).

**File uploads** — validated by declared `Content-Type` (`image/*`) and size (8MB) only — this is client-declared metadata, not real content inspection. A file with a spoofed `Content-Type` header could bypass the image check. No malware/EXIF scanning. Standard limitation for a v1 upload flow, but a real one.

**Image access** — **the one finding in this review that should get explicit attention before real customer data flows through this**: uploaded images go to Vercel Blob with `access: 'public'`. The *database row* correctly gates visibility (`isPublished: false` until a stage is published, filtered out of every customer-facing query) — but the *file itself* is a public URL the instant it's uploaded, published or not. Anyone who obtains or guesses a draft image's URL can view it before the admin ever clicks "Publish." Blob URLs aren't easily guessable, but they are not access-controlled. This is an architectural gap between "hidden from the UI" and "actually private," not a bug in the code as written — it's inherent to using `access: 'public'` Blob storage for content that has a draft state.

**Private draft visibility** — draft *text* (stage name, message, status) is fully protected: it's only ever returned by admin-session-gated routes. Draft *images* are the exception noted above.

**Additional finding, not in your list but material**: `/api/admin/crafttrack/login` has no rate limiting. `lib/enquiry-rate-limit.ts` already exists in this codebase for the public enquiry form and was not reused here — a brute-force-guessing script could hit the login endpoint at will. Flagging this because the fix (reusing existing, already-trusted infrastructure) is cheap relative to the risk on the one endpoint that gates the entire admin panel.

---

## 5. UX Review

Identifying only — no redesign proposed.

- A stage that's been published once always shows "Live" in the sidebar, even if the draft has since been edited again and not republished. The approved mockups showed a distinct "Draft · Unpublished changes" state for exactly this case; the shipped UI doesn't distinguish "published, no pending edits" from "published, but the draft has since diverged." An admin can't tell at a glance whether what's live matches what they're looking at.
- "Save Draft" success is announced only via a screen-reader-only `aria-live` region — there's no visible confirmation (toast, inline checkmark, button state change) for sighted users. Correct for accessibility, incomplete for general usability.
- No warning before navigating away from a stage with unsaved draft changes — the browser won't prompt, and neither does the app. Combined with the refresh case in §3, an admin can lose an edit without any signal it happened.
- The Orders list's "Stage" column collapses to a bare "N journeys" for multi-journey orders, with no per-journey status glimpse — admin has to open Order Detail to see anything more.
- No pagination controls in the Orders list UI. The API supports cursor-based pagination (`nextCursor` in the response) but nothing in the page consumes it — past 25 orders, there is currently no way to see the rest through the UI.
- The Customers list has no pagination or search at all (a plain `findMany` with no `take`) — fine at today's volume, will become a real problem before the Orders list's 25-row cap does.
- "+ Advanced fields" (stage status) and the cover-upload toggle both use `<details>`/inline show-hide with no persistence — they reset closed on every navigation, which is probably fine but means an admin who regularly needs the status field re-opens it every time.

---

## 6. Technical Debt

Shortcuts taken deliberately, each with the reason:

1. **No Journey Template management UI.** Only a `<select>` over existing templates ships. Documented at the time as a YAGNI call (building CRUD for a list of one contradicts "minimize clicks"). Real debt the day a second template is needed.
2. **No hero-image reassignment on delete.** Simplest correct behavior deferred rather than guessed at (auto-promote oldest? most recent? — a real product decision, not obviously mine to make silently).
3. **Silent notification failures.** Logged server-side, invisible to the admin. The `Notification` model's own design intent ("resend-on-failure and a real history," per the architecture review) implies a resend affordance that was never built — only the passive history table.
4. **No pagination UI** despite API support (Orders) or API support at all (Customers).
5. **`AdminRole` unused.** Field exists, no route reads it. Reserved-for-later, as documented at schema-design time — now actually due.
6. **No CSRF token**, relying on `sameSite=lax` alone.
7. **No rate limiting on admin login**, despite equivalent infrastructure existing elsewhere in the codebase.
8. **File upload validation is metadata-only** (declared MIME type, size) — no content-sniffing.
9. **Public (not signed) Blob URLs for draft images** — see §4.
10. **No automated tests.** Every other subsystem in this codebase (TARA, SEO audit, phase fixes) has a test script; CraftTrack's admin panel — auth, a multi-step transaction, a publish workflow with financial/customer-trust implications — has none. This is the most consequential item on this list relative to how much of the system it covers.
11. **`thumbnailUrl` field is never populated.** Schema has it; nothing generates it; every view renders the full-size original.
12. **No migrations exist yet.** The schema has only ever been `prisma generate`'d and `validate`'d against a placeholder `DATABASE_URL` — `prisma migrate dev`/`deploy` has never actually run against a real database. This isn't a code defect, but it means the schema-to-database path is genuinely untested, not just "untested end-to-end" in the UI sense already disclosed in both merged PRs.

---

## 7. PR3 Dependencies

What PR3 (customer portal) needs from PR2, checked against what actually exists:

**Already built and ready to reuse:**
- `getPublishedJourneyView()` / `PublishedJourneyView` — the exact rendering PR3 needs, already proven against the admin preview route.
- Customer session infrastructure (`verifyCustomerSession`, order-scoped vs. account-scoped sessions) — built in PR1, unused until now.
- The `Journey`/`Order`/`Customer` data shape generally.

**Not built yet — PR3 must create these:**
- **A way to set `Customer.passwordHash`.** Nothing in PR2 ever writes this field. PR3's "email + password account login" mode has no path to get a password into the system — this needs either an admin-side "set password" action or a customer-facing "create your account" / "set password" flow (e.g., from an email link) before account-login mode can work at all. This is the single most important gap to resolve before PR3 can ship its second login mode.
- **Public order-lookup API** (order number + email → session). Only admin-side routes exist today.
- **The actual customer-facing routes** (`/crafttrack/access`, `/crafttrack/dashboard`, `/crafttrack/dashboard/[orderNumber]`). None exist. The notification email already links to `/crafttrack/dashboard/[orderNumber]` — that link 404s until PR3 ships it.
- **A decision on whether/how customers see Draft image URLs** if they're ever exposed outside the filtered query (see §4 — not a PR3 blocker, but PR3's design should account for it rather than assume image-level privacy that doesn't exist yet).

---

## 8. Production Checklist

Everything required before a real customer's order runs through this:

- [ ] Provision a real `DATABASE_URL` (Postgres) and run `prisma migrate deploy` — no migration has ever been run against a live database.
- [ ] Set a real, random `CRAFTTRACK_SESSION_SECRET` in production env (not the local dev placeholder).
- [ ] Enable Vercel Blob and set `BLOB_READ_WRITE_TOKEN`.
- [ ] Set `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` and run the seed script (creates the first admin + the Journey Template — nothing works without the latter).
- [ ] Rotate the Gmail SMTP app password flagged during PR1 as exposed in git history, if that hasn't already been done — CraftTrack's notification email reuses the same SMTP credentials.
- [ ] Add rate limiting to `/api/admin/crafttrack/login`.
- [ ] Decide on and build *some* visibility into notification failures (even just an admin-facing warning banner reading recent failures from logs would close the loop).
- [ ] Confirm `robots.txt`'s blanket `/admin/` disallow is sufficient, or add explicit `noindex` metadata to `login/page.tsx` specifically (it's a Client Component today and cannot export `metadata` directly — the `(dashboard)` layout and preview page already have it; the login page currently relies on `robots.txt` alone).
- [ ] At minimum, smoke-test the four core transactions (create order, upload media, publish a stage, receive the notification email) against a real database before the first real customer order is entered.
- [ ] Decide whether `AdminRole` needs to be enforced before a second admin account is ever created, or explicitly document that all admins are trusted equally for now.

---

## 9. Recommendation

**Needs PR2.1.**

The core workflows are genuinely solid — every listed workflow closes without a dead end, the architecture decisions (Order/Journey split, Draft/Published separation, publish-outside-transaction email) all hold up under scrutiny, and nothing found here is a design flaw requiring rework. But three items are real enough that I wouldn't hand this to real customers as-is, and none of them are "PR3 work":

1. **Silent notification failures** (§3, §6) — an admin can publish a stage, believe the customer was told, and be wrong, with no signal anywhere in the product.
2. **No rate limiting on admin login** (§4) — the one endpoint that gates everything else in this system.
3. **No automated tests** on the transaction logic (§6) — order creation and publish are the two operations where a silent regression would be most costly, and they're the two least protected against one.

A short PR2.1 closing those three — plus, ideally, the hero-reassignment gap and the Orders-list pagination UI since both are small and already scoped exactly in §3/§5/§6 — would bring this to a state I'd sign off on without reservation. Everything else in this document (role enforcement, CSRF token, image access control, thumbnailUrl generation) is legitimate technical debt worth tracking, but not blocking: each is either low-risk at current scale or already has a documented, deliberate reason it was deferred.
