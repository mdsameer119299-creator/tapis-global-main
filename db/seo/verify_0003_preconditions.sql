-- READ-ONLY. SELECTs only; safe to paste in the Supabase SQL editor of tapis-global-seo-dev (ref xxmrziaefhxmaewrvbqk).
-- Expected before applying 0003: (1) all 4 enums present, (2) seo_worker exists NOLOGIN, (3) none of the 4 new tables exist,
-- (4) seo_search_daily/seo_search_performance/seo_index_status/seo_sites/seo_integrations exist, (5) worker privileges per 0001.
select current_database() as db, current_user as me;
select t.typname, array_agg(e.enumlabel order by e.enumsortorder) labels from pg_type t join pg_enum e on e.enumtypid=t.oid
 where t.typname in ('SeoIntegrationProvider','SeoTrigger','SeoRunStatus','SeoDataQuality') group by 1 order by 1;
select rolname, rolcanlogin, rolsuper, rolbypassrls from pg_roles where rolname='seo_worker';
select tablename, rowsecurity from pg_tables t join pg_class c on c.relname=t.tablename and c.relnamespace='public'::regnamespace
 where schemaname='public' and tablename like 'seo\_%' order by 1;
select table_name, string_agg(privilege_type, ',' order by privilege_type) privs from information_schema.role_table_grants
 where grantee='seo_worker' and table_schema='public' group by 1 order by 1;
select grantee, count(*) from information_schema.role_table_grants where table_schema='public' and table_name like 'seo\_%'
 and grantee in ('PUBLIC','anon','authenticated') group by 1;
