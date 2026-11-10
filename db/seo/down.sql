-- Rollback for the SEO Command Centre schema. NEVER auto-run. Names only seo_* objects.
-- Review on the target database before executing; this destroys all SEO data.
DROP TABLE IF EXISTS "seo_gsc_sync_runs", "seo_sitemap_status", "seo_oauth_states", "seo_oauth_connections",
  "seo_page_speed", "seo_competitor_snapshots", "seo_competitors",
  "seo_keyword_ranks", "seo_keywords",
  "seo_reports", "seo_audit_log", "seo_approval_requests", "seo_recommendations",
  "seo_technical_issues", "seo_crawl_pages", "seo_crawl_runs", "seo_index_status",
  "seo_ga4_landing_daily", "seo_search_performance", "seo_search_daily",
  "seo_agent_events", "seo_agent_runs", "seo_integrations", "seo_sites";
DROP TYPE IF EXISTS "SeoReportKind", "SeoActorType", "SeoApprovalStatus", "SeoIssueStatus",
  "SeoRiskTier", "SeoRecStatus", "SeoDataQuality", "SeoSeverity", "SeoTrigger",
  "SeoRunStatus", "SeoAgentType", "SeoIntegrationStatus", "SeoIntegrationProvider";
-- "AdminRole" is intentionally NOT dropped (shared with Craft Track in other databases).
REVOKE ALL ON SCHEMA public FROM seo_worker;
DROP ROLE IF EXISTS seo_worker;
