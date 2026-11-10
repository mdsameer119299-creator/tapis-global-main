-- Read-only verification for 0004 (run after applying). Writes nothing.
SELECT 'rows_seo_search_daily' k, count(*)::text v FROM "seo_search_daily"
UNION ALL SELECT 'rows_seo_search_performance', count(*)::text FROM "seo_search_performance"
UNION ALL SELECT 'rows_seo_gsc_sync_runs', count(*)::text FROM "seo_gsc_sync_runs"
UNION ALL SELECT 'col_'||table_name, data_type||' nullable='||is_nullable FROM information_schema.columns WHERE table_schema='public' AND column_name='syncRunId' AND table_name IN ('seo_search_daily','seo_search_performance')
UNION ALL SELECT 'fk_'||conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE contype='f' AND conname LIKE 'seo_search_%_syncRunId_fkey'
UNION ALL SELECT 'idx_'||indexname, indexdef FROM pg_indexes WHERE schemaname='public' AND indexname LIKE 'seo_search_%_syncRunId_idx'
UNION ALL SELECT 'rls_'||tablename, rowsecurity::text FROM pg_tables WHERE schemaname='public' AND tablename IN ('seo_search_daily','seo_search_performance','seo_gsc_sync_runs')
UNION ALL SELECT 'policy_'||tablename||'_'||policyname, cmd||' '||roles::text FROM pg_policies WHERE schemaname='public' AND tablename IN ('seo_search_daily','seo_search_performance')
UNION ALL SELECT 'grant_'||table_name||'_'||grantee, string_agg(privilege_type,',' ORDER BY privilege_type) FROM information_schema.role_table_grants WHERE table_schema='public' AND table_name IN ('seo_search_daily','seo_search_performance') GROUP BY table_name, grantee
ORDER BY 1;
