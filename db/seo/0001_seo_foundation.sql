-- SEO Command Centre: foundation migration (DEV database only until separately approved).
-- Source: SEO-COMMAND-CENTRE-PHASE1-SPEC-v2.md section 5.3 and 5.4.
-- Purely additive. Touches only seo_* objects (plus AdminRole, created only if missing).
-- Hand-written in Prisma DDL style because the Prisma engine cannot run in the build sandbox;
-- verify with `prisma migrate diff` before using anywhere else.

-- ── Enums ───────────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AdminRole') THEN
    CREATE TYPE "AdminRole" AS ENUM ('OWNER', 'PUBLISHER', 'VIEWER');
  END IF;
END $$;

CREATE TYPE "SeoIntegrationProvider" AS ENUM ('GSC', 'GA4', 'PSI', 'BING');
CREATE TYPE "SeoIntegrationStatus"   AS ENUM ('NOT_CONFIGURED', 'CONFIGURED', 'ERROR', 'DISABLED');
CREATE TYPE "SeoAgentType"           AS ENUM ('TECHNICAL', 'SEARCH_PERFORMANCE', 'KEYWORD', 'CONTENT', 'COMPETITOR', 'INTERNATIONAL', 'REPORTING');
CREATE TYPE "SeoRunStatus"           AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'PARTIAL', 'FAILED', 'CANCELLED');
CREATE TYPE "SeoTrigger"             AS ENUM ('SCHEDULE', 'MANUAL');
CREATE TYPE "SeoSeverity"            AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO');
CREATE TYPE "SeoDataQuality"         AS ENUM ('VERIFIED', 'DERIVED', 'ESTIMATED', 'UNAVAILABLE');
CREATE TYPE "SeoRecStatus"           AS ENUM ('PROPOSED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'DEFERRED', 'APPLIED', 'SUPERSEDED');
CREATE TYPE "SeoRiskTier"            AS ENUM ('ROUTINE', 'HIGH_IMPACT');
CREATE TYPE "SeoIssueStatus"         AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'IGNORED');
CREATE TYPE "SeoApprovalStatus"      AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');
CREATE TYPE "SeoActorType"           AS ENUM ('ADMIN', 'AGENT', 'SYSTEM');
CREATE TYPE "SeoReportKind"          AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'ALERT');

-- ── Tables ──────────────────────────────────────────────────────────────────
CREATE TABLE "seo_sites" (
  "id" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "baseUrl" TEXT NOT NULL,
  "gscProperty" TEXT,
  "ga4PropertyId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "seo_sites_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seo_integrations" (
  "id" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "provider" "SeoIntegrationProvider" NOT NULL,
  "status" "SeoIntegrationStatus" NOT NULL DEFAULT 'NOT_CONFIGURED',
  "secretRef" TEXT,
  "lastSyncAt" TIMESTAMP(3),
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "seo_integrations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seo_agent_runs" (
  "id" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "agent" "SeoAgentType" NOT NULL,
  "trigger" "SeoTrigger" NOT NULL,
  "status" "SeoRunStatus" NOT NULL DEFAULT 'QUEUED',
  "triggeredBy" TEXT,
  "startedAt" TIMESTAMP(3),
  "finishedAt" TIMESTAMP(3),
  "inputSummary" JSONB,
  "outputSummary" JSONB,
  "error" TEXT,
  "llmTokensIn" INTEGER,
  "llmTokensOut" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "seo_agent_runs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seo_agent_events" (
  "id" TEXT NOT NULL,
  "runId" TEXT NOT NULL,
  "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "level" "SeoSeverity" NOT NULL DEFAULT 'INFO',
  "step" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "data" JSONB,
  CONSTRAINT "seo_agent_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seo_search_daily" (
  "id" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "clicks" INTEGER NOT NULL,
  "impressions" INTEGER NOT NULL,
  "ctr" DOUBLE PRECISION NOT NULL,
  "position" DOUBLE PRECISION NOT NULL,
  "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "seo_search_daily_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seo_search_performance" (
  "id" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "page" TEXT NOT NULL,
  "query" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "device" TEXT NOT NULL,
  "clicks" INTEGER NOT NULL,
  "impressions" INTEGER NOT NULL,
  "ctr" DOUBLE PRECISION NOT NULL,
  "position" DOUBLE PRECISION NOT NULL,
  "rowKey" TEXT NOT NULL,
  "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "seo_search_performance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seo_ga4_landing_daily" (
  "id" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "landingPage" TEXT NOT NULL,
  "channelGroup" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "device" TEXT NOT NULL,
  "sessions" INTEGER NOT NULL,
  "engagedSessions" INTEGER NOT NULL,
  "keyEvents" INTEGER NOT NULL,
  "rowKey" TEXT NOT NULL,
  "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "seo_ga4_landing_daily_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seo_index_status" (
  "id" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "inspectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "verdict" TEXT,
  "coverageState" TEXT,
  "indexingState" TEXT,
  "robotsTxtState" TEXT,
  "pageFetchState" TEXT,
  "googleCanonical" TEXT,
  "userCanonical" TEXT,
  "lastCrawlTime" TIMESTAMP(3),
  CONSTRAINT "seo_index_status_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seo_crawl_runs" (
  "id" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "baseUrl" TEXT NOT NULL,
  "status" "SeoRunStatus" NOT NULL DEFAULT 'RUNNING',
  "pagesPlanned" INTEGER NOT NULL DEFAULT 0,
  "pagesFetched" INTEGER NOT NULL DEFAULT 0,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finishedAt" TIMESTAMP(3),
  CONSTRAINT "seo_crawl_runs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seo_crawl_pages" (
  "id" TEXT NOT NULL,
  "crawlRunId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "statusCode" INTEGER,
  "redirectChain" JSONB,
  "canonicalUrl" TEXT,
  "robotsMeta" TEXT,
  "title" TEXT,
  "metaDescription" TEXT,
  "h1" TEXT,
  "wordCount" INTEGER,
  "hasHreflang" BOOLEAN NOT NULL DEFAULT false,
  "jsonLdTypes" TEXT[],
  "internalLinksOut" INTEGER,
  "internalLinksIn" INTEGER,
  "responseMs" INTEGER,
  CONSTRAINT "seo_crawl_pages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seo_technical_issues" (
  "id" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "fingerprint" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "severity" "SeoSeverity" NOT NULL,
  "status" "SeoIssueStatus" NOT NULL DEFAULT 'OPEN',
  "url" TEXT,
  "detail" JSONB,
  "dataQuality" "SeoDataQuality" NOT NULL DEFAULT 'VERIFIED',
  "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),
  CONSTRAINT "seo_technical_issues_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seo_recommendations" (
  "id" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "runId" TEXT,
  "agent" "SeoAgentType" NOT NULL,
  "changeType" TEXT NOT NULL,
  "riskTier" "SeoRiskTier" NOT NULL,
  "title" TEXT NOT NULL,
  "rationale" TEXT NOT NULL,
  "targetUrl" TEXT,
  "proposedChange" JSONB,
  "evidence" JSONB NOT NULL,
  "claimsCheck" JSONB,
  "dataQuality" "SeoDataQuality" NOT NULL DEFAULT 'DERIVED',
  "priorityScore" INTEGER NOT NULL DEFAULT 0,
  "expectedImpact" TEXT,
  "status" "SeoRecStatus" NOT NULL DEFAULT 'PROPOSED',
  "dedupeKey" TEXT NOT NULL,
  "decidedBy" TEXT,
  "decidedAt" TIMESTAMP(3),
  "decisionNote" TEXT,
  "appliedRef" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "seo_recommendations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seo_approval_requests" (
  "id" TEXT NOT NULL,
  "recommendationId" TEXT NOT NULL,
  "requiredRole" "AdminRole" NOT NULL,
  "status" "SeoApprovalStatus" NOT NULL DEFAULT 'PENDING',
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3),
  "decidedBy" TEXT,
  "decidedAt" TIMESTAMP(3),
  "note" TEXT,
  "stepUpVerifiedAt" TIMESTAMP(3),
  CONSTRAINT "seo_approval_requests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seo_audit_log" (
  "id" TEXT NOT NULL,
  "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "siteId" TEXT,
  "actorType" "SeoActorType" NOT NULL,
  "actor" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "metadata" JSONB,
  CONSTRAINT "seo_audit_log_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seo_reports" (
  "id" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "kind" "SeoReportKind" NOT NULL,
  "periodStart" DATE NOT NULL,
  "periodEnd" DATE NOT NULL,
  "title" TEXT NOT NULL,
  "summaryMd" TEXT NOT NULL,
  "data" JSONB NOT NULL,
  "runId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "seo_reports_pkey" PRIMARY KEY ("id")
);

-- ── Indexes ─────────────────────────────────────────────────────────────────
CREATE UNIQUE INDEX "seo_sites_domain_key" ON "seo_sites"("domain");
CREATE UNIQUE INDEX "seo_integrations_siteId_provider_key" ON "seo_integrations"("siteId", "provider");
CREATE INDEX "seo_agent_runs_siteId_agent_createdAt_idx" ON "seo_agent_runs"("siteId", "agent", "createdAt");
CREATE INDEX "seo_agent_runs_status_createdAt_idx" ON "seo_agent_runs"("status", "createdAt");
CREATE INDEX "seo_agent_events_runId_at_idx" ON "seo_agent_events"("runId", "at");
CREATE UNIQUE INDEX "seo_search_daily_siteId_date_key" ON "seo_search_daily"("siteId", "date");
CREATE UNIQUE INDEX "seo_search_performance_siteId_rowKey_key" ON "seo_search_performance"("siteId", "rowKey");
CREATE INDEX "seo_search_performance_siteId_date_page_idx" ON "seo_search_performance"("siteId", "date", "page");
CREATE INDEX "seo_search_performance_siteId_page_date_idx" ON "seo_search_performance"("siteId", "page", "date");
CREATE INDEX "seo_search_performance_siteId_query_date_idx" ON "seo_search_performance"("siteId", "query", "date");
CREATE UNIQUE INDEX "seo_ga4_landing_daily_siteId_rowKey_key" ON "seo_ga4_landing_daily"("siteId", "rowKey");
CREATE INDEX "seo_ga4_landing_daily_siteId_date_landingPage_idx" ON "seo_ga4_landing_daily"("siteId", "date", "landingPage");
CREATE UNIQUE INDEX "seo_index_status_siteId_url_inspectedAt_key" ON "seo_index_status"("siteId", "url", "inspectedAt");
CREATE INDEX "seo_index_status_siteId_inspectedAt_idx" ON "seo_index_status"("siteId", "inspectedAt");
CREATE INDEX "seo_crawl_runs_siteId_startedAt_idx" ON "seo_crawl_runs"("siteId", "startedAt");
CREATE UNIQUE INDEX "seo_crawl_pages_crawlRunId_url_key" ON "seo_crawl_pages"("crawlRunId", "url");
CREATE UNIQUE INDEX "seo_technical_issues_siteId_fingerprint_key" ON "seo_technical_issues"("siteId", "fingerprint");
CREATE INDEX "seo_technical_issues_siteId_status_severity_idx" ON "seo_technical_issues"("siteId", "status", "severity");
CREATE UNIQUE INDEX "seo_recommendations_siteId_dedupeKey_key" ON "seo_recommendations"("siteId", "dedupeKey");
CREATE INDEX "seo_recommendations_siteId_status_priorityScore_idx" ON "seo_recommendations"("siteId", "status", "priorityScore");
CREATE INDEX "seo_recommendations_runId_idx" ON "seo_recommendations"("runId");
CREATE INDEX "seo_approval_requests_status_requestedAt_idx" ON "seo_approval_requests"("status", "requestedAt");
CREATE INDEX "seo_approval_requests_recommendationId_idx" ON "seo_approval_requests"("recommendationId");
CREATE INDEX "seo_audit_log_at_idx" ON "seo_audit_log"("at");
CREATE INDEX "seo_audit_log_siteId_at_idx" ON "seo_audit_log"("siteId", "at");
CREATE INDEX "seo_audit_log_entityType_entityId_idx" ON "seo_audit_log"("entityType", "entityId");
CREATE UNIQUE INDEX "seo_reports_siteId_kind_periodStart_key" ON "seo_reports"("siteId", "kind", "periodStart");

-- ── Foreign keys (seo_* only; Restrict, never Cascade) ──────────────────────
ALTER TABLE "seo_integrations"      ADD CONSTRAINT "seo_integrations_siteId_fkey"      FOREIGN KEY ("siteId") REFERENCES "seo_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "seo_agent_runs"        ADD CONSTRAINT "seo_agent_runs_siteId_fkey"        FOREIGN KEY ("siteId") REFERENCES "seo_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "seo_agent_events"      ADD CONSTRAINT "seo_agent_events_runId_fkey"       FOREIGN KEY ("runId") REFERENCES "seo_agent_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "seo_search_daily"      ADD CONSTRAINT "seo_search_daily_siteId_fkey"      FOREIGN KEY ("siteId") REFERENCES "seo_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "seo_search_performance" ADD CONSTRAINT "seo_search_performance_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "seo_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "seo_ga4_landing_daily" ADD CONSTRAINT "seo_ga4_landing_daily_siteId_fkey"    FOREIGN KEY ("siteId") REFERENCES "seo_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "seo_index_status"      ADD CONSTRAINT "seo_index_status_siteId_fkey"      FOREIGN KEY ("siteId") REFERENCES "seo_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "seo_crawl_runs"        ADD CONSTRAINT "seo_crawl_runs_siteId_fkey"        FOREIGN KEY ("siteId") REFERENCES "seo_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "seo_crawl_pages"       ADD CONSTRAINT "seo_crawl_pages_crawlRunId_fkey"   FOREIGN KEY ("crawlRunId") REFERENCES "seo_crawl_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "seo_technical_issues"  ADD CONSTRAINT "seo_technical_issues_siteId_fkey"  FOREIGN KEY ("siteId") REFERENCES "seo_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "seo_recommendations"   ADD CONSTRAINT "seo_recommendations_siteId_fkey"   FOREIGN KEY ("siteId") REFERENCES "seo_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "seo_recommendations"   ADD CONSTRAINT "seo_recommendations_runId_fkey"    FOREIGN KEY ("runId") REFERENCES "seo_agent_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "seo_approval_requests" ADD CONSTRAINT "seo_approval_requests_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "seo_recommendations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "seo_reports"           ADD CONSTRAINT "seo_reports_siteId_fkey"           FOREIGN KEY ("siteId") REFERENCES "seo_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ── Security section (same migration as the tables: see spec R2, R3, R12) ──
-- 1. Worker role (NOLOGIN; a human sets the login/password out-of-band).
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'seo_worker') THEN
    CREATE ROLE seo_worker NOLOGIN;
  END IF;
END $$;

-- 2. Lock every seo_* table: RLS on, nothing for PUBLIC / anon / authenticated.
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables
           WHERE schemaname = 'public' AND tablename LIKE 'seo\_%' ESCAPE '\'
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

GRANT USAGE ON SCHEMA public TO seo_worker;

-- 3a. Ingest and run tables: read, write, prune.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['seo_search_daily','seo_search_performance','seo_ga4_landing_daily',
      'seo_index_status','seo_crawl_runs','seo_crawl_pages','seo_technical_issues',
      'seo_agent_runs','seo_agent_events','seo_reports']
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO seo_worker', t);
    EXECUTE format('CREATE POLICY seo_worker_all ON public.%I FOR ALL TO seo_worker USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;

-- 3b. Configuration tables: read only.
GRANT SELECT ON public.seo_sites, public.seo_integrations TO seo_worker;
CREATE POLICY seo_worker_read ON public.seo_sites        FOR SELECT TO seo_worker USING (true);
CREATE POLICY seo_worker_read ON public.seo_integrations FOR SELECT TO seo_worker USING (true);

-- 3c. Recommendations: the worker can PROPOSE and refresh content, never DECIDE.
GRANT SELECT, INSERT ON public.seo_recommendations TO seo_worker;
GRANT UPDATE ("title","rationale","proposedChange","evidence","claimsCheck","dataQuality",
              "priorityScore","expectedImpact","updatedAt") ON public.seo_recommendations TO seo_worker;
CREATE POLICY seo_worker_select ON public.seo_recommendations FOR SELECT TO seo_worker USING (true);
CREATE POLICY seo_worker_insert ON public.seo_recommendations FOR INSERT TO seo_worker WITH CHECK (status = 'PROPOSED');
CREATE POLICY seo_worker_update ON public.seo_recommendations FOR UPDATE TO seo_worker
  USING (status = 'PROPOSED') WITH CHECK (status = 'PROPOSED');

-- 3d. Approvals: worker may read and open a request (no decision columns); never update.
GRANT SELECT ON public.seo_approval_requests TO seo_worker;
GRANT INSERT ("id","recommendationId","requiredRole","expiresAt") ON public.seo_approval_requests TO seo_worker;
CREATE POLICY seo_worker_select ON public.seo_approval_requests FOR SELECT TO seo_worker USING (true);
CREATE POLICY seo_worker_insert ON public.seo_approval_requests FOR INSERT TO seo_worker WITH CHECK (status = 'PENDING');

-- 3e. Audit log: append-only for the worker.
GRANT SELECT, INSERT ON public.seo_audit_log TO seo_worker;
CREATE POLICY seo_audit_select ON public.seo_audit_log FOR SELECT TO seo_worker USING (true);
CREATE POLICY seo_audit_insert ON public.seo_audit_log FOR INSERT TO seo_worker WITH CHECK (true);

-- 4. One pending approval per recommendation (R12).
CREATE UNIQUE INDEX seo_one_pending_approval
  ON public.seo_approval_requests ("recommendationId") WHERE status = 'PENDING';
