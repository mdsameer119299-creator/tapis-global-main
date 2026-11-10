# SEO Command Centre (Phase 1)

Admin-only technical SEO engine and dashboard for tapisglobalinternational.com. Lives at `/admin/seo` (`noindex`). It has its **own isolated login** at `/admin/seo/login` and shares no authentication code, cookie, secret or database with CraftTrack.

## Data stores
- **SEO database only**: Supabase project `tapis-global-seo-dev`, accessed with `pg` via `SEO_DATABASE_URL`.
- `DATABASE_URL` (website / CraftTrack) is never read by SEO code. `lib/seo-command/db.ts` refuses a URL equal to `DATABASE_URL` and refuses known CraftTrack/legacy project refs.
- Schema is managed by SQL migrations in `db/seo/` (not Prisma): `0001_seo_foundation.sql`, `0002_seo_tracking.sql`. `down.sql` is a manual rollback, never auto-run.
- All `seo_*` tables: RLS on, nothing granted to `PUBLIC`/`anon`/`authenticated`; a `seo_worker` NOLOGIN role has narrow grants for future agents.

## Environment variables
| Variable | Where | Purpose |
|---|---|---|
| `SEO_DATABASE_URL` | Preview (required) | Supabase connection string for `tapis-global-seo-dev` |
| `SEO_ADMIN_EMAIL` | Preview (required) | The single SEO admin's email |
| `SEO_ADMIN_PASSWORD_HASH` | Preview (required, Sensitive) | `scrypt:...` hash from `scripts/seo-generate-admin-hash.mjs` (never the password) |
| `SEO_SESSION_SECRET` | Preview (required, Sensitive) | >= 32 chars; signs the `seo_admin_session` cookie (`node scripts/seo-generate-admin-hash.mjs --secret`) |
| `SEO_DATABASE_EXPECTED_REF` | optional | Extra guard: URL must contain this project ref |
| `SEO_OWNER_EMAILS` | optional | Comma-separated admins allowed to approve HIGH_IMPACT recommendations (unset = nobody) |
| `SEO_CRAWL_BASE_URL` | optional | Defaults to `https://www.tapisglobalinternational.com` |
| `PSI_API_KEY` | optional | Google PageSpeed Insights key (works without, at low quota) |
| `CRON_SECRET` | optional | Bearer secret (>= 16 chars) for `GET /api/seo/cron` |

## Authentication
- Cookie `seo_admin_session`: HS256 JWT (issuer/audience/type specific to SEO), 8 h absolute expiry, `HttpOnly`, `Secure`, `SameSite=Strict`.
- Login throttling: 5 failures / 15 min per IP and per email, 40 per instance, plus a delay on failure. State is per serverless instance, so also enable Vercel Deployment Protection.
- A CraftTrack token cannot open SEO and a SEO token cannot open CraftTrack (tested, including the case of identical secrets).
- Every page and API route verifies the SEO session itself; the scheduled endpoint `GET /api/seo/cron` needs `Authorization: Bearer $CRON_SECRET`.

## What it does
Crawler (robots.txt + sitemap discovery, BFS crawl, redirect chains, status codes, canonical/noindex/title/description/H1/alt checks, duplicate titles/descriptions/content, orphan pages), issue tracking with first/last seen and resolution, health score, recommendations with an approval workflow, keyword on-page coverage, competitor public-page snapshots, PageSpeed measurements, change history and reports.

## What it does not do
- It never modifies the public website. Approving a recommendation only records a decision.
- Google Search Console / GA4 are **not connected**; the UI shows "Connection pending" and no rankings, clicks or traffic are estimated.
- No cron is scheduled in `vercel.json` (Vercel crons run on production only). Scheduling is a separate approval.

## Tests
`npm run test:seo-command` runs engine, static-security and DB tests. DB tests need `SEO_TEST_DATABASE_URL` pointing at a throwaway **local** Postgres with both migrations applied (they refuse non-local hosts and are skipped when unset).
