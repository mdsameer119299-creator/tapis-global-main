-- SEO Command Centre: keyword, competitor and page-speed tables.
-- Applies on top of 0001_seo_foundation.sql. DEV database (tapis-global-seo-dev) only
-- until separately approved. Additive: touches only seo_* objects. Same security
-- pattern as 0001: RLS on, nothing for PUBLIC/anon/authenticated, narrow seo_worker grants.

CREATE TABLE "seo_keywords" (
  "id" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "keyword" TEXT NOT NULL,
  "targetUrl" TEXT,
  "country" TEXT NOT NULL DEFAULT 'ALL',
  "notes" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "seo_keywords_pkey" PRIMARY KEY ("id")
);

-- Ranking history. Only ever written from verified Search Console data (source 'GSC').
-- Stays empty until Google is authorised: the app never invents positions.
CREATE TABLE "seo_keyword_ranks" (
  "id" TEXT NOT NULL,
  "keywordId" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "position" DOUBLE PRECISION NOT NULL,
  "clicks" INTEGER NOT NULL DEFAULT 0,
  "impressions" INTEGER NOT NULL DEFAULT 0,
  "source" TEXT NOT NULL,
  "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "seo_keyword_ranks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seo_competitors" (
  "id" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "label" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "seo_competitors_pkey" PRIMARY KEY ("id")
);

-- Public, on-page facts about a competitor's homepage/robots/sitemap. No traffic estimates.
CREATE TABLE "seo_competitor_snapshots" (
  "id" TEXT NOT NULL,
  "competitorId" TEXT NOT NULL,
  "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "httpStatus" INTEGER,
  "responseMs" INTEGER,
  "title" TEXT,
  "metaDescription" TEXT,
  "h1" TEXT,
  "wordCount" INTEGER,
  "jsonLdTypes" TEXT[],
  "hasHreflang" BOOLEAN NOT NULL DEFAULT false,
  "sitemapUrlCount" INTEGER,
  "robotsFound" BOOLEAN NOT NULL DEFAULT false,
  "error" TEXT,
  CONSTRAINT "seo_competitor_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seo_page_speed" (
  "id" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "strategy" TEXT NOT NULL,
  "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "perfScore" INTEGER,
  "lcpMs" INTEGER,
  "cls" DOUBLE PRECISION,
  "inpMs" INTEGER,
  "tbtMs" INTEGER,
  "fcpMs" INTEGER,
  "fieldDataAvailable" BOOLEAN NOT NULL DEFAULT false,
  "dataQuality" "SeoDataQuality" NOT NULL DEFAULT 'VERIFIED',
  "source" TEXT NOT NULL,
  "error" TEXT,
  CONSTRAINT "seo_page_speed_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "seo_keywords_siteId_keyword_country_key" ON "seo_keywords"("siteId", "keyword", "country");
CREATE UNIQUE INDEX "seo_keyword_ranks_keywordId_date_source_key" ON "seo_keyword_ranks"("keywordId", "date", "source");
CREATE UNIQUE INDEX "seo_competitors_siteId_domain_key" ON "seo_competitors"("siteId", "domain");
CREATE INDEX "seo_competitor_snapshots_competitorId_fetchedAt_idx" ON "seo_competitor_snapshots"("competitorId", "fetchedAt");
CREATE INDEX "seo_page_speed_siteId_url_fetchedAt_idx" ON "seo_page_speed"("siteId", "url", "fetchedAt");

ALTER TABLE "seo_keywords" ADD CONSTRAINT "seo_keywords_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "seo_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "seo_keyword_ranks" ADD CONSTRAINT "seo_keyword_ranks_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "seo_keywords"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "seo_competitors" ADD CONSTRAINT "seo_competitors_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "seo_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "seo_competitor_snapshots" ADD CONSTRAINT "seo_competitor_snapshots_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "seo_competitors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "seo_page_speed" ADD CONSTRAINT "seo_page_speed_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "seo_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Security: identical pattern to 0001.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['seo_keywords','seo_keyword_ranks','seo_competitors','seo_competitor_snapshots','seo_page_speed']
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

-- Worker: read configuration, write measurements only.
GRANT SELECT ON public.seo_keywords, public.seo_competitors TO seo_worker;
CREATE POLICY seo_worker_read ON public.seo_keywords    FOR SELECT TO seo_worker USING (true);
CREATE POLICY seo_worker_read ON public.seo_competitors FOR SELECT TO seo_worker USING (true);
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['seo_keyword_ranks','seo_competitor_snapshots','seo_page_speed']
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO seo_worker', t);
    EXECUTE format('CREATE POLICY seo_worker_all ON public.%I FOR ALL TO seo_worker USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;

-- Crawl summary columns (trend reporting). Table-level worker grants on seo_crawl_runs already cover new columns.
ALTER TABLE "seo_crawl_runs" ADD COLUMN "healthScore" INTEGER;
ALTER TABLE "seo_crawl_runs" ADD COLUMN "severityCounts" JSONB;
ALTER TABLE "seo_crawl_runs" ADD COLUMN "truncated" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "seo_crawl_runs" ADD COLUMN "triggeredBy" TEXT;
ALTER TABLE "seo_crawl_runs" ADD COLUMN "error" TEXT;
