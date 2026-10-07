create schema if not exists app_private;
revoke all on schema app_private from public, anon, authenticated;

create function app_private.validate_trip_publish()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if old.lifecycle = 'draft' and new.lifecycle = 'published' and exists (
    select 1
    from public.trip_activities as activity
    where activity.trip_id = new.id
      and (
        activity.activity_date < new.start_date
        or activity.activity_date > new.end_date
      )
  ) then
    raise exception 'Trip activities must fall within the trip date range'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger trips_validate_publish
before update of lifecycle on public.trips
for each row
execute function app_private.validate_trip_publish();

create function app_private.validate_trip_activity_write()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  affected_trip_ids uuid[];
  expected_trip_count integer;
  locked_trip_count integer := 0;
  related_trip public.trips%rowtype;
begin
  if tg_op = 'INSERT' then
    affected_trip_ids := array[new.trip_id];
    expected_trip_count := 1;
  else
    affected_trip_ids := array[old.trip_id, new.trip_id];
    expected_trip_count := case when old.trip_id = new.trip_id then 1 else 2 end;
  end if;

  -- Serialize activity writes with publishing so the date check sees a stable itinerary.
  for related_trip in
    select trips.*
    from public.trips as trips
    where trips.id = any(affected_trip_ids)
    order by trips.id
    for update
  loop
    locked_trip_count := locked_trip_count + 1;

    if related_trip.lifecycle <> 'draft' then
      raise exception 'Trip is not available for activity changes'
        using errcode = '42501';
    end if;

    if related_trip.id = new.trip_id then
      if (related_trip.start_date is not null and new.activity_date < related_trip.start_date)
        or (related_trip.end_date is not null and new.activity_date > related_trip.end_date)
      then
        raise exception 'Activity date must be within the trip date range'
          using errcode = '23514';
      end if;
    end if;
  end loop;

  if locked_trip_count <> expected_trip_count then
    raise exception 'Trip is not available for activity changes'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists trip_activities_validate_write on public.trip_activities;
create trigger trip_activities_validate_write
before insert or update on public.trip_activities
for each row
execute function app_private.validate_trip_activity_write();

revoke all on function app_private.validate_trip_publish() from public, anon, authenticated;
revoke all on function app_private.validate_trip_activity_write() from public, anon, authenticated;
