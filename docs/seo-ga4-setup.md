# GA4 setup (read-only, organic search)

The SEO Command Centre reads Google Analytics 4 with a **service account**, so the Search Console OAuth scope (`webmasters.readonly`) is unchanged and no broader user permission is requested. Nothing is imported until these steps are done; until then the report marks GA4 as **UNAVAILABLE (not connected)** and shows no GA4 numbers.

## What you need to do (once)
1. In Google Cloud, enable the **Google Analytics Data API** on a project you control.
2. Create a **service account** (no roles needed on the project) and download a JSON key. Treat the key as a secret.
3. In GA4 → Admin → Property access management, add the service account's email with the **Viewer** role.
4. Find the numeric **GA4 property ID** (Admin → Property details). It is a number such as `123456789`, not a `G-` measurement ID.
5. Add two environment variables to the **Preview** environment only (never Production until approved):
   - `GA4_PROPERTY_ID` — the numeric property ID.
   - `GA4_SERVICE_ACCOUNT_JSON` — the key JSON, raw or base64-encoded.
6. Redeploy the Preview so the variables are loaded, then run **Generate daily report now** on `/admin/seo/reports`.

## What is read
Organic Search sessions only (`sessionDefaultChannelGroup = Organic Search`), by date, landing page, country and device: sessions, engaged sessions, key events. Scope: `analytics.readonly`.

## Known limits
- **Organic users is unavailable**: the existing `seo_ga4_landing_daily` table has no users column. Adding one needs a migration, which needs your approval.
- GA4 sessions are a different measure from Search Console clicks; the report never combines them.
- Failures are stored as a short safe code (for example `PERMISSION_DENIED`), never the raw API message.
