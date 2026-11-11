# Daily SEO report: Preview recipient, external scheduler and validation checklist

Status: **prepared, not configured, not validated.** Nothing here is active until the Preview deployment contains this code, the variables below exist, and every item in the checklist has been verified.

## 1. Endpoint contract (verified from source: `app/api/seo/cron/daily/route.ts`)

| | |
|---|---|
| Method / path | `GET /api/seo/cron/daily` |
| Auth | `Authorization: Bearer <CRON_SECRET>` (the Preview value of `CRON_SECRET`; must be at least 16 characters, use 32+ random characters) |
| Deployment protection | Preview deployments sit behind Vercel Authentication. Add header `x-vercel-protection-bypass: <bypass secret>` ("Protection Bypass for Automation") |
| Body | none |
| Timeout | route `maxDuration` = 60 s |

Responses (body never contains secrets, the recipient address, or SEO figures):

| HTTP | Meaning |
|---|---|
| 200 | `ok:true`; `result` has `reportDate`, `ga4.status`, `report.outcome` (`CREATED`/`DUPLICATE`/`REGENERATED`) and `delivery.status` |
| 401 | Missing or wrong bearer (`{"ok":false}`) |
| 409 | `report.outcome = BUSY`: another run holds the lock. Safe to retry later |
| 502 | The report exists, but `delivery.status` is `FAILED` or `UNKNOWN` (including `SMTP_ACCEPTED_NOT_RECORDED`), `ok:false`. Do not treat as success; see section 1a. The manual endpoint follows the same rule |
| 500 | Generation failed (`report.outcome = FAILED`) or unexpected error |
| 503 | `SEO_DATABASE_URL` is not set in that environment |

**HTTP 200 does not mean an email was sent.** Read `result.delivery.status`: `SENT`, `NOT_CONFIGURED` (variables missing), `SKIPPED_ALREADY_SENT`, `SKIPPED_IN_PROGRESS`. `FAILED` and `UNKNOWN` return 502.

Idempotency: one report per Asia/Kolkata calendar date; an advisory lock refuses overlapping generation.

### 1a. Email delivery guarantee (read this before approving a Preview run)

The system gives an **at-most-one-ambiguous-attempt** guarantee, not exactly-once. Email over SMTP cannot be exactly-once: if the connection dies after the server accepts a message, the sender cannot know. So the application never retries automatically when the outcome is unclear; it stops and records `UNKNOWN` for a person to check.

| Status | Meaning | Automatic retry? |
|---|---|---|
| `NOT_ATTEMPTED` | Report created, delivery not tried | yes, on the next call |
| `NOT_CONFIGURED` | Recipient or SMTP variables missing; nothing sent | yes, once configured |
| `SENDING` | One caller has claimed delivery (a single conditional database update; only one caller can hold it) | no |
| `SENT` | SMTP accepted the message and the result was recorded | no (terminal) |
| `FAILED` | Provably **not** delivered (connection never opened, authentication/TLS/recipient rejected, or the server explicitly refused the message) | yes: once more in the same run, and again on a later call |
| `UNKNOWN` | Outcome ambiguous: timeout, connection reset, 35 s send deadline, `SENDING` older than the stale limit (the process died or the database update failed), or an unclassified error | **no** (terminal until an operator acts) |

Crash points: dying before the claim leaves `NOT_ATTEMPTED` (next call sends once). Dying after the claim but before or during the send leaves `SENDING`; after `SEO_DELIVERY_STALE_MINUTES` (default 15, allowed 5-1440) it is shown and stored as `UNKNOWN` and nothing is resent. If SMTP accepts the message but the result cannot be recorded (database error), the response is **`UNKNOWN` with code `SMTP_ACCEPTED_NOT_RECORDED`, HTTP 502, `ok:false`**, with the SMTP message id kept for diagnosis (code `RESULT_NOT_RECORDED` for a failure or timeout that could not be recorded). It is never reported as `SENT`. The stored row stays `SENDING` and reads `UNKNOWN` once stale, so the dashboard, the manual list and the API agree after the stale limit; during the first minutes the dashboard shows `SENDING` ("in progress, not confirmed"), never success. A forced regenerate during a live `SENDING` claim does not release it.

Remaining limitation: an `UNKNOWN` day needs a human. Check the recipient mailbox for that day's report. If it did not arrive, resend deliberately with `POST /api/admin/seo/reports/daily` body `{"force":true,"deliver":true}` (regenerates the report and sends it; if the original did arrive this produces a duplicate by your choice). If it did arrive, do nothing: the next day's report is unaffected.

## 2. Preview environment variables (add in Vercel, Preview only)

Vercel dashboard → project `tapis-global-main` → **Settings → Environment Variables → Add**.
- Environments: tick **Preview only**. Leave Production and Development unticked.
- Preferably choose "Select a custom Preview branch" and enter `feat/seo-command-centre-preview` so other branches do not receive it.
- Mark secrets as **Sensitive**.

| Name | Value | Sensitive |
|---|---|---|
| `SEO_REPORT_RECIPIENT` | `<the recipient address you confirmed>` | no |
| `CRON_SECRET` | a new random string of 32+ characters (generate it yourself, e.g. a password manager) | yes |
| `SEO_SMTP_HOST`, `SEO_SMTP_USER`, `SEO_SMTP_PASS`, `SEO_SMTP_FROM` | a **dedicated** sender for SEO reports (see "Dedicated sender: Resend" below); optional `SEO_SMTP_PORT`, `SEO_SMTP_SECURE`, `SEO_SMTP_FROM_NAME` | `SEO_SMTP_PASS` and `SEO_SMTP_USER` yes |
| `SEO_DATABASE_URL` | already present; confirm the Preview value points at the dev project `tapis-global-seo-dev`, not production data | yes |

The website's `SMTP_*` variables are **never** read for report mail and there is no fallback to them: with only `SMTP_*` set, delivery is `NOT_CONFIGURED`.

Never paste SMTP passwords or the cron secret into chat or into the repository. Do not add any of these to Production. The recipient is read only from `SEO_REPORT_RECIPIENT`, validated as a single address, and never logged or stored by the application.

Variables apply only to **new** deployments. When you later authorise it: Deployments → latest Preview of the feature branch → ⋯ → **Redeploy** (clear the build cache), or push a commit once a push is approved.

## 3. External scheduler (provider-neutral)

Not selected, no account created, no job configured.

- Schedule: every day at **08:00 `Asia/Kolkata`**. If the scheduler supports time zones choose `Asia/Kolkata`. Otherwise use UTC `30 2 * * *` (India has no daylight saving, so it never drifts).
- Request: `GET https://<PREVIEW_HOST>/api/seo/cron/daily` with headers `Authorization: Bearer <CRON_SECRET>` and `x-vercel-protection-bypass: <bypass secret>`. Store both as the scheduler's secret/header fields, never in the URL.
- `<PREVIEW_HOST>`: use the stable branch alias, which Vercel reports as `tapis-global-main-git-feat-seo-29ee74-sameers-projects-2cf742c9.vercel.app` (read from the deployment's alias list). Re-confirm it in Vercel → Deployments → the feature-branch deployment → Domains before use. Do not use a per-deployment `*-o92phc6wx-*` URL: it changes on every deploy. As of this writing the latest Preview is commit `63e4798`, which does **not** yet contain this endpoint.
- Timeout: 60 s (matches `maxDuration`). Retries: at most 2, at least 60 s apart, only on network error, timeout, 409 or 5xx. Never retry 401/403. Retrying cannot create a second report or a second email for a delivery whose outcome is unclear (it is skipped or recorded `UNKNOWN`).
- Failure alerting: enable the scheduler's "notify on non-2xx".
- Execution history: the scheduler's run log (status code and response body). Application side: Vercel → project → Logs (filter path `/api/seo/cron/daily`) and `/admin/seo/reports` (report list with delivery status), or the `seo_agent_runs` table (agent `REPORTING`).
- Disable immediately: pause or delete the job in the scheduler. Backstop: rotate/remove `CRON_SECRET` in Vercel (new deployment needed); the endpoint then answers 401.
- The repo also contains `.github/workflows/seo-daily-report.yml`. Its schedule only runs from the default branch, so it is inert on this branch. Do not enable it together with the external scheduler.

### Manual test (only when authorised, after the checklist's deploy step)
`curl -sS -o /dev/null -w "%{http_code}\n" -H "x-vercel-protection-bypass: $BYPASS" "https://<PREVIEW_HOST>/api/seo/cron/daily"` must print `401`. Then repeat with the `Authorization` header (secrets read from environment variables, not typed inline) and read the JSON body. Remember that this run sends one real email.

## 4. Preview validation checklist (later, after explicit approval to push and deploy)

1. The Preview deployment's branch is `feat/seo-command-centre-preview` and its commit equals the approved local HEAD; target is Preview (not production).
2. No bearer → 401. Wrong bearer → 401. Bearer shorter than 16 characters configured → 401.
3. Authorised request → 200 with `ok:true`, `report.outcome = CREATED`.
4. Second identical call → `DUPLICATE`, still one `seo_reports` row for that IST date and one email.
5. Two near-simultaneous calls → one `CREATED`/`DUPLICATE` path, no second email (`SKIPPED_IN_PROGRESS` or `SKIPPED_ALREADY_SENT`), or `BUSY` (409).
6. `delivery.status` matches reality: `SENT` only if the message arrived; with SMTP deliberately unset it must read `NOT_CONFIGURED`, never `SENT`. A `502` with `UNKNOWN`/`FAILED` must be investigated, not retried by hand.
7. The mail arrives at exactly the recipient you confirmed and nowhere else; the enquiry mailbox gets nothing.
8. GSC and GA4 sections show real numbers only if those sources are actually connected and fresh; otherwise `UNAVAILABLE`/`STALE` with a note. No section shows zero for missing data.
9. Missing integrations are listed in section 9 of the report.
10. Production deployment list unchanged, no Production env vars touched, public website unchanged, migration 0005 still unapplied.


## Dedicated sender: Resend (recommended)

Report mail uses its own sender so it can never share the website contact-form account or its reputation.

1. Create a Resend account and add a **sending subdomain** you control, e.g. `reports.tapisglobalinternational.com` (a subdomain keeps the website's existing mail and DNS untouched; do not use the apex domain).
2. Resend shows the exact DNS records for that subdomain (SPF TXT, DKIM TXT, and an MX for bounce handling). Add them at the DNS host (this domain's nameservers are at GoDaddy). Use only the values Resend displays. Wait for the domain to show **Verified**.
3. Create an API key in Resend with **Sending access** limited to that domain. Copy it straight into Vercel; never paste it into chat or the repository.
4. Preview-only variables (branch `feat/seo-command-centre-preview`):

| Name | Value | Sensitive |
|---|---|---|
| `SEO_SMTP_HOST` | `smtp.resend.com` | no |
| `SEO_SMTP_PORT` | `465` | no |
| `SEO_SMTP_SECURE` | `true` | no |
| `SEO_SMTP_USER` | `resend` | no |
| `SEO_SMTP_PASS` | the Resend API key | **yes** |
| `SEO_SMTP_FROM` | `seo-reports@<your verified sending subdomain>` | no |
| `SEO_SMTP_FROM_NAME` | `TAPIS GLOBAL SEO Reports` | no |
| `SEO_REPORT_RECIPIENT` | the confirmed recipient | no |

Do not add any of these to Production and do not edit the existing `SMTP_*` variables.
