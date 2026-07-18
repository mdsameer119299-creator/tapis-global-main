# PR2.1 Acceptance Review — Production Hardening Follow-Up

Short follow-up to `docs/PR2-ACCEPTANCE-REVIEW.md`, confirming whether each
blocking finding from that review was actually resolved by PR2.1 (merged),
not just addressed on paper.

---

## Blocking issues — status

### 1. Silent notification failures — **Resolved**

- `Notification` now records `status` (SENT/FAILED) and `errorMessage` on
  every attempt, not just successes — verified by
  `scripts/crafttrack-notification.test.mjs` (a failed send still writes a
  row; a non-`Error` throw still gets recorded, not left as an unhandled
  rejection).
- An admin can retry a failed notification (`POST
  /api/admin/crafttrack/notifications/[notificationId]/retry`), and every
  retry attempt creates its own new row — the Notifications tab is a real
  history, not just a log of successes.
- A failure is no longer buried in a tab nobody's prompted to check: the
  journey workspace shows a `role="alert"` banner the moment the *latest*
  notification for that journey failed, with a one-click jump to the
  Notifications tab.
- Confirmed this doesn't regress the transaction safety PR2b established:
  `scripts/crafttrack-publish-stage.test.mjs` still confirms the publish
  transaction itself is untouched by notification concerns — sending and
  recording the notification happens after the transaction commits,
  exactly as before.

### 2. No rate limiting on admin login — **Resolved**

- `/api/admin/crafttrack/login` now rejects with 429 once either the
  requesting IP or the target email has 5 failed attempts within 15
  minutes — `scripts/crafttrack-login-rate-limit.test.mjs` confirms the
  threshold, the reset-on-success behavior, and that separate keys don't
  cross-contaminate.
- Reuses `getClientIp` from the existing `lib/enquiry-rate-limit.ts`
  rather than inventing a new IP-extraction path, per the instruction to
  reuse existing infrastructure.
- Both the "account doesn't exist" and "wrong password" cases, and now
  the "rate limited" case, return a generic message — nothing about this
  endpoint's responses lets an attacker distinguish a valid email from an
  invalid one, or a rate limit from a wrong password.
- **A real bug was found and fixed while live-testing this**, not merely
  theorized: a database outage on the login route previously threw an
  unhandled `PrismaClientInitializationError` that Next.js rendered as a
  raw HTML error page instead of the JSON shape every other failure on
  this route returns. Now caught and returned as a clean generic 500 —
  confirmed live (see PR #46's description) with a direct `fetch()`
  against the running dev server before and after the fix.

### 3. No automated tests on the riskiest transactions — **Resolved**

55 assertions across five scripts, wired into `npm run test:crafttrack`,
all passing, all runnable without a live database (in-memory fake Prisma
clients):

| Script | Covers |
|---|---|
| `crafttrack-journey-creation.test.mjs` | `createJourneyWithStages` — stage numbering, IN_PROGRESS/PENDING assignment, `STAGE_STARTED` event, empty-template rejection, the `isUniqueConstraintError` collision-retry helper |
| `crafttrack-publish-stage.test.mjs` | The publish transaction (newly extracted into `lib/crafttrack/publish-stage.ts` specifically to make this possible) — draft→published copy, media scoping, `isFirstPublish`, `isLastStage` computed from real sequence (not a hardcoded count), `Journey.completedAt` only on last-stage-COMPLETE |
| `crafttrack-notification.test.mjs` | Success and failure recording, non-`Error` throws |
| `crafttrack-published-journey-view.test.mjs` | Draft-vs-Published filtering — the exact concern named in your review |
| `crafttrack-login-rate-limit.test.mjs` | Threshold, reset, key independence (added alongside item 2, not originally required but cheap and directly relevant) |

This required two small, behavior-preserving refactors to make the logic
testable at all: extracting the publish transaction out of its route
handler (`lib/crafttrack/publish-stage.ts`) and making
`getPublishedJourneyView`'s database client injectable, defaulting to a
lazily-imported real Prisma singleton so production behavior is
unchanged. Both are covered by `npx tsc --noEmit` passing clean against
the real Prisma-generated types — the fake test clients aren't `any`-typed
stand-ins, they're checked against the same shape the real code returns.

---

## Item 4 — Draft media privacy: reviewed, correctly not implemented here

`@vercel/blob` does support `access: 'private'` — confirmed by reading the
installed SDK's type definitions, not assumed. But making it real requires
a new authenticated streaming-proxy route and rewiring every image
reference, including `PublishedJourneyView` (deliberately shared with
PR3's not-yet-built customer-auth model). That's a new feature and a
partial redesign, not hardening — exactly the case your instruction
anticipated ("otherwise, document the limitation and create a follow-up
task"). Documented in `stages/[stageId]/media/route.ts` directly and
tracked as its own spawned follow-up task, to be picked up alongside PR3
rather than guessed at now.

---

## What's still open (not blockers, unchanged from the original review)

Two smaller items from `docs/PR2-ACCEPTANCE-REVIEW.md` were correctly
**not** touched in PR2.1, since they were never part of its scope (item 4
of your instruction only covered the notification/login/tests/media-privacy
set): deleting a hero image still doesn't reassign a new one, and the
Orders list still has no pagination UI despite the API supporting a
cursor. Both remain accurately described in the original review as
technical debt, not regressions introduced by this pass.

---

## Recommendation

**Ready for PR3.**

All three items your review recommendation was conditioned on are
resolved and verified — not just claimed: the fixes are covered by
passing automated tests, and the login hardening surfaced and fixed a
genuine bug in the process (the DB-outage error page) that neither of us
had previously caught. Item 4 was handled exactly as instructed:
implemented if practical, documented and tracked if not, and I judged it
not practical without scope creep into PR3's own territory.

Nothing found in this pass changes the recommendation on the two
remaining non-blocking debt items — they're real, they're documented, and
neither is a reason to hold PR3.
