-- SEO Command Centre: Google Search Console connection + sitemap status.
-- PROPOSED — NOT APPLIED. DEV database (tapis-global-seo-dev) only, and only after explicit approval.
-- Additive: touches only seo_* objects. No change to existing tables or rows.
-- Same security pattern as 0001/0002: RLS on, nothing for PUBLIC/anon/authenticated,
-- narrow seo_worker grants.

-- One row per (site, provider). Holds the OAuth refresh token ENCRYPTED (AES-256-GCM,
-- key = Vercel env GSC_TOKEN_ENCRYPTION_KEY, never stored in the database).
CREATE TABLE "seo_oauth_connections" (
  "id" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "provider" "SeoIntegrationProvider" NOT NULL,        -- 'GSC' only for now
  "state" TEXT NOT NULL DEFAULT 'DISCONNECTED',        -- DISCONNECTED | CONNECTED | RECONNECT_REQUIRED | ERROR
  "accountEmail" TEXT,                                 -- Google account that granted consent (display only)
  "scope" TEXT,                                        -- granted scope string
  "propertyUrl" TEXT,                                  -- e.g. sc-domain:tapisglobalinternational.com
  "permissionLevel" TEXT,                              -- siteOwner | siteFullUser | ... as returned by sites.list
  "refreshTokenCipher" BYTEA,                          -- AES-256-GCM ciphertext
  "refreshTokenIv" BYTEA,                              -- 12-byte nonce, unique per write
  "refreshTokenTag" BYTEA,                             -- 16-byte GCM auth tag
  "keyVersion" INTEGER NOT NULL DEFAULT 1,             -- supports key rotation
  "grantedAt" TIMESTAMP(3),
  "lastRefreshAt" TIMESTAMP(3),
  "lastSuccessAt" TIMESTAMP(3),                        -- last successful API call
  "lastErrorAt" TIMESTAMP(3),
  "lastErrorCode" TEXT,                                -- e.g. invalid_grant, 403, 429 (never a token)
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "seo_oauth_connections_pkey" PRIMARY KEY ("id")
);

-- Short-lived OAuth state/PKCE verifier to defend the callback against CSRF/replay.
CREATE TABLE "seo_oauth_states" (
  "id" TEXT NOT NULL,
  "stateHash" TEXT NOT NULL,          -- SHA-256 of the random state; the raw value lives only in the browser redirect
  "adminHash" TEXT NOT NULL,          -- SHA-256 of the admin email that started the flow (must match the flow cookie)
  "codeVerifierCipher" BYTEA NOT NULL,
  "codeVerifierIv" BYTEA NOT NULL,
  "codeVerifierTag" BYTEA NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,  -- 10 minutes
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "seo_oauth_states_pkey" PRIMARY KEY ("id")
);

-- Sitemaps as reported by the Search Console sitemaps API (no inferred values).
CREATE TABLE "seo_sitemap_status" (
  "id" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "type" TEXT,
  "isPending" BOOLEAN,
  "isSitemapsIndex" BOOLEAN,
  "lastSubmitted" TIMESTAMP(3),
  "lastDownloaded" TIMESTAMP(3),
  "errors" INTEGER,
  "warnings" INTEGER,
  "submittedUrls" INTEGER,                              -- sum of contents[].submitted
  "indexedUrls" INTEGER,                                -- sum of contents[].indexed (may be null/deprecated)
  "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "seo_sitemap_status_pkey" PRIMARY KEY ("id")
);

-- Sync bookkeeping so the dashboard can show real "last successful sync" and row counts.
CREATE TABLE "seo_gsc_sync_runs" (
  "id" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "kind" TEXT NOT NULL,                                 -- SEARCH_ANALYTICS | SITEMAPS | URL_INSPECTION
  "trigger" "SeoTrigger" NOT NULL,
  "status" "SeoRunStatus" NOT NULL,
  "rangeStart" DATE,
  "rangeEnd" DATE,
  "rowsFetched" INTEGER NOT NULL DEFAULT 0,
  "rowsWritten" INTEGER NOT NULL DEFAULT 0,
  "errorCode" TEXT,
  "errorMessage" TEXT,                                  -- safe, fixed messages only
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finishedAt" TIMESTAMP(3),
  CONSTRAINT "seo_gsc_sync_runs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "seo_oauth_connections_siteId_provider_key" ON "seo_oauth_connections"("siteId", "provider");
CREATE UNIQUE INDEX "seo_oauth_states_stateHash_key" ON "seo_oauth_states"("stateHash");
CREATE INDEX "seo_oauth_states_expiresAt_idx" ON "seo_oauth_states"("expiresAt");
CREATE UNIQUE INDEX "seo_sitemap_status_siteId_path_key" ON "seo_sitemap_status"("siteId", "path");
CREATE INDEX "seo_gsc_sync_runs_siteId_kind_startedAt_idx" ON "seo_gsc_sync_runs"("siteId", "kind", "startedAt");

ALTER TABLE "seo_oauth_connections" ADD CONSTRAINT "seo_oauth_connections_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "seo_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "seo_sitemap_status"    ADD CONSTRAINT "seo_sitemap_status_siteId_fkey"    FOREIGN KEY ("siteId") REFERENCES "seo_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "seo_gsc_sync_runs"     ADD CONSTRAINT "seo_gsc_sync_runs_siteId_fkey"     FOREIGN KEY ("siteId") REFERENCES "seo_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Security: identical pattern to 0001/0002.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['seo_oauth_connections','seo_oauth_states','seo_sitemap_status','seo_gsc_sync_runs']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC', t);
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
      EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
      EXECUTE format('REVOKE ALL ON public.%I FROM authenticated', t);
    END IF;
  END LOOP;
END $$;

-- Worker (cron sync): reads the connection, writes sync output; it has NO access to oauth_states.
-- The cron worker may read the connection (it needs the ciphertext to refresh access tokens) but can only
-- update status/bookkeeping columns. It cannot insert, delete, or overwrite the token, scope or property.
GRANT SELECT ON public.seo_oauth_connections TO seo_worker;
GRANT UPDATE ("state","lastRefreshAt","lastSuccessAt","lastErrorAt","lastErrorCode","updatedAt") ON public.seo_oauth_connections TO seo_worker;
CREATE POLICY seo_worker_select ON public.seo_oauth_connections FOR SELECT TO seo_worker USING (true);
CREATE POLICY seo_worker_update ON public.seo_oauth_connections FOR UPDATE TO seo_worker USING (true) WITH CHECK (true);
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['seo_sitemap_status','seo_gsc_sync_runs']
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO seo_worker', t);
    EXECUTE format('CREATE POLICY seo_worker_all ON public.%I FOR ALL TO seo_worker USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;
