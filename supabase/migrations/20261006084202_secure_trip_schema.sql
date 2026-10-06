-- Cross-table validation and database access controls.

create function public.validate_trip_local_settings() returns trigger language plpgsql
set search_path = '' as $$
declare expected_exponent smallint;
begin
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = new.time_zone) then
    raise exception 'Invalid IANA time zone';
  end if;
  select exponent into expected_exponent from public.currency_catalog where code = new.currency_code;
  if new.currency_exponent is distinct from expected_exponent then
    raise exception 'Currency exponent does not match catalog';
  end if;
  if tg_op = 'UPDATE' and (new.currency_code, new.currency_exponent)
       is distinct from (old.currency_code, old.currency_exponent)
       and exists (select 1 from public.trip_expenses where trip_id = new.id) then
    raise exception 'Trip currency cannot change after the first expense';
  end if;
  return new;
end $$;
create trigger validate_trip_local_settings_before_write before insert or update on public.trips
for each row execute function public.validate_trip_local_settings();

create function public.validate_schedule_zones() returns trigger language plpgsql
set search_path = '' as $$
begin
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = new.start_time_zone)
     or not exists (select 1 from pg_catalog.pg_timezone_names where name = new.end_time_zone) then
    raise exception 'Invalid IANA time zone';
  end if;
  return new;
end $$;
create trigger validate_schedule_zones_before_write before insert or update on public.trip_schedule_items
for each row execute function public.validate_schedule_zones();

create function public.validate_expense_splits() returns trigger language plpgsql
set search_path = '' as $$
declare expense_id_to_check uuid;
declare expected_amount bigint;
declare actual_amount bigint;
begin
  if tg_table_name = 'trip_expenses' then
    expense_id_to_check := new.id;
  elsif tg_op = 'DELETE' then
    expense_id_to_check := old.expense_id;
  else
    expense_id_to_check := new.expense_id;
  end if;
  select amount_minor into expected_amount from public.trip_expenses where id = expense_id_to_check;
  if expected_amount is null then return null; end if;
  select coalesce(sum(amount_minor), 0) into actual_amount from public.trip_expense_splits
    where expense_id = expense_id_to_check;
  if actual_amount <> expected_amount then
    raise exception 'Expense splits must total the expense amount';
  end if;
  return null;
end $$;
create constraint trigger validate_splits_after_expense after insert or update of amount_minor on public.trip_expenses
deferrable initially deferred for each row execute function public.validate_expense_splits();
create constraint trigger validate_splits_after_split after insert or update or delete on public.trip_expense_splits
deferrable initially deferred for each row execute function public.validate_expense_splits();

-- Direct database access is controlled in the server DAL; the Data API has no business-table grants.
alter table public.currency_catalog enable row level security;
alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.trip_memberships enable row level security;
alter table public.trip_invitations enable row level security;
alter table public.trip_schedule_items enable row level security;
alter table public.trip_checklists enable row level security;
alter table public.trip_tasks enable row level security;
alter table public.trip_funds enable row level security;
alter table public.trip_expenses enable row level security;
alter table public.trip_expense_splits enable row level security;
revoke all on public.currency_catalog, public.profiles, public.trips, public.trip_memberships,
  public.trip_invitations, public.trip_schedule_items, public.trip_checklists, public.trip_tasks,
  public.trip_funds, public.trip_expenses, public.trip_expense_splits from anon, authenticated, service_role;
revoke all on function public.validate_trip_local_settings(), public.validate_schedule_zones(),
  public.validate_expense_splits() from public, anon, authenticated, service_role;
