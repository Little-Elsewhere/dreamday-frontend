create or replace function app_private.validate_trip_activity_delete()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  trip_lifecycle text;
begin
  -- Foreign-key cascades run inside a trigger; direct deletes still lock the parent trip.
  if pg_trigger_depth() > 1 then
    return old;
  end if;

  select trips.lifecycle
  into trip_lifecycle
  from public.trips as trips
  where trips.id = old.trip_id
  for update;

  if trip_lifecycle is distinct from 'draft' then
    raise exception 'Trip is not available for activity changes'
      using errcode = '42501';
  end if;

  return old;
end;
$$;

drop trigger if exists trip_activities_validate_delete on public.trip_activities;
create trigger trip_activities_validate_delete
before delete on public.trip_activities
for each row
execute function app_private.validate_trip_activity_delete();

revoke all on function app_private.validate_trip_activity_delete() from public, anon, authenticated;
