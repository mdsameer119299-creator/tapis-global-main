-- Rollback for 0003_seo_gsc.sql ONLY. NEVER auto-run. Names only the four tables 0003 created.
-- Destroys the stored (encrypted) Search Console connection, sitemap status and sync history.
-- Does NOT touch seo_search_daily / seo_search_performance / seo_index_status or any 0001/0002 object.
DROP TABLE IF EXISTS "seo_gsc_sync_runs", "seo_sitemap_status", "seo_oauth_states", "seo_oauth_connections";
