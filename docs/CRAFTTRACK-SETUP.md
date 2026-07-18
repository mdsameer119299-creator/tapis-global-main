# CraftTrack™ Setup

CraftTrack is the only feature in this codebase that needs real backend
infrastructure — a database and file storage. Everything else on the site is
static/content-driven. This doc is the exact, one-time setup needed before
CraftTrack works in any environment (local dev, Vercel preview, or
production).

## 1. Database (Postgres)

Any standard Postgres connection string works. Pick one:

- **Vercel Postgres** (simplest if already on Vercel): Vercel dashboard →
  your project → Storage → Create Database → Postgres. Copy the
  `DATABASE_URL` it generates.
- **Neon** (neon.tech, generous free tier): create a project, copy the
  connection string from the dashboard.
- **Supabase** (supabase.com, free tier): create a project → Settings →
  Database → Connection string (use the "Transaction" pooler string for
  serverless).

Set it as `DATABASE_URL` in `.env.local` (local dev) and in your Vercel
project's Environment Variables (preview + production).

Then run the migration once:
```
npm run db:migrate
```

## 2. Session secret

Generate a random secret and set it as `CRAFTTRACK_SESSION_SECRET`:
```
openssl rand -base64 32
```

## 3. Image storage (Vercel Blob)

Admin-uploaded hero/gallery images need Vercel Blob (Vercel serverless
functions have no persistent filesystem — a local `uploads/` folder does not
survive between requests in production).

Vercel dashboard → your project → Storage → Create Database → Blob. This
auto-populates `BLOB_READ_WRITE_TOKEN` in your project's environment
variables. For local dev, run `vercel env pull .env.local` to pull it down,
or copy it manually from the dashboard.

## 4. First admin account

Set `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD` in `.env.local` (a real
email and a strong password you choose — never invented by anyone else),
then run:
```
npm run db:seed
```
This creates exactly one admin account, upserting on email so it's safe to
re-run. Log in at `/admin/crafttrack/login` and change the password from the
admin UI after first login if you want to stop relying on the seed value.

## 5. Verify

```
npx prisma validate
npm run db:generate
npx tsc --noEmit
npm run build
```

## Environment variable summary

| Variable | Required for | Where to get it |
|---|---|---|
| `DATABASE_URL` | Everything CraftTrack | Vercel Postgres / Neon / Supabase |
| `CRAFTTRACK_SESSION_SECRET` | Login sessions | `openssl rand -base64 32` |
| `BLOB_READ_WRITE_TOKEN` | Admin image uploads | Vercel Blob (auto on enable) |
| `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` | First admin login | You choose these |

None of these are required for the rest of the site to build or run — every
other page is unaffected if they're absent. Only CraftTrack's own routes
(`/crafttrack/*`, `/admin/crafttrack/*`, `/api/crafttrack/*`,
`/api/admin/crafttrack/*`) need them.
