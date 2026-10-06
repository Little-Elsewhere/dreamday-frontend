begin;
create extension if not exists pgtap with schema extensions;
select plan(9);

select ok(to_regclass('public.trips') is not null, 'trips table exists');
select ok(to_regclass('public.trip_expense_splits') is not null, 'expense splits table exists');
select is((select exponent from public.currency_catalog where code = 'VND'), 0::smallint, 'VND has no fractional unit');
select is((select exponent from public.currency_catalog where code = 'USD'), 2::smallint, 'USD has two fractional digits');
select is((select exponent from public.currency_catalog where code = 'TWD'), 2::smallint, 'TWD has two fractional digits');
select ok(exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'trips' and column_name = 'time_zone'), 'trip has IANA zone');
select ok(exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'trip_schedule_items' and column_name = 'end_time_zone'), 'schedule has arrival zone');
select ok((select bool_and(relrowsecurity) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname like 'trip%' and c.relkind = 'r'), 'trip tables have RLS');
select ok(not has_table_privilege('authenticated', 'public.trips', 'select'), 'Data API role has no direct trip access');

select * from finish();
rollback;
