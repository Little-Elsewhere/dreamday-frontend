create table public.trips (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  lifecycle text not null default 'draft',
  name text not null default '' check (char_length(name) <= 40),
  destination text not null default '' check (char_length(destination) <= 40),
  description text not null default '' check (char_length(description) <= 100),
  start_date date,
  end_date date,
  pace text check (pace is null or pace in ('relaxed', 'balanced', 'active')),
  cover_path text,
  note text not null default '' check (char_length(note) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trips_lifecycle_check check (lifecycle in ('draft', 'published')),
  constraint trips_date_range_check check (
    start_date is null or end_date is null or end_date >= start_date
  ),
  constraint trips_published_fields_check check (
    lifecycle <> 'published'
    or (
      char_length(btrim(name)) > 0
      and start_date is not null
      and end_date is not null
      and pace is not null
    )
  ),
  constraint trips_cover_path_owner_check check (
    cover_path is null
    or cover_path like owner_id::text || '/' || id::text || '/%'
  )
);

create unique index trips_one_draft_per_owner_idx
  on public.trips (owner_id)
  where lifecycle = 'draft';

create index trips_published_by_owner_updated_idx
  on public.trips (owner_id, updated_at desc)
  where lifecycle = 'published';

alter table public.trips enable row level security;
revoke all on table public.trips from anon, authenticated;
grant select, insert, update on table public.trips to authenticated;

create policy "trip owners can read their trips"
  on public.trips for select to authenticated
  using ((select auth.uid()) = owner_id);

create policy "trip owners can create their draft"
  on public.trips for insert to authenticated
  with check ((select auth.uid()) = owner_id and lifecycle = 'draft');

create policy "trip owners can update their draft"
  on public.trips for update to authenticated
  using ((select auth.uid()) = owner_id and lifecycle = 'draft')
  with check ((select auth.uid()) = owner_id);

create table public.trip_activities (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 80),
  activity_date date not null,
  activity_type text not null default 'explore'
    check (activity_type in ('explore', 'meal', 'travel', 'stay', 'free')),
  start_minute smallint not null check (start_minute between 0 and 1439),
  end_minute smallint not null check (end_minute between 1 and 1440),
  note text not null default '' check (char_length(note) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trip_activities_time_range_check check (end_minute > start_minute)
);

create index trip_activities_trip_date_time_idx
  on public.trip_activities (trip_id, activity_date, start_minute, end_minute);

alter table public.trip_activities enable row level security;
revoke all on table public.trip_activities from anon, authenticated;
grant select, insert, update, delete on table public.trip_activities to authenticated;

create policy "trip owners can read draft and published activities"
  on public.trip_activities for select to authenticated
  using (
    exists (
      select 1
      from public.trips
      where trips.id = trip_activities.trip_id
        and trips.owner_id = (select auth.uid())
    )
  );

create policy "trip owners can add draft activities"
  on public.trip_activities for insert to authenticated
  with check (
    exists (
      select 1
      from public.trips
      where trips.id = trip_activities.trip_id
        and trips.owner_id = (select auth.uid())
        and trips.lifecycle = 'draft'
    )
  );

create policy "trip owners can update draft activities"
  on public.trip_activities for update to authenticated
  using (
    exists (
      select 1
      from public.trips
      where trips.id = trip_activities.trip_id
        and trips.owner_id = (select auth.uid())
        and trips.lifecycle = 'draft'
    )
  )
  with check (
    exists (
      select 1
      from public.trips
      where trips.id = trip_activities.trip_id
        and trips.owner_id = (select auth.uid())
        and trips.lifecycle = 'draft'
    )
  );

create policy "trip owners can delete draft activities"
  on public.trip_activities for delete to authenticated
  using (
    exists (
      select 1
      from public.trips
      where trips.id = trip_activities.trip_id
        and trips.owner_id = (select auth.uid())
        and trips.lifecycle = 'draft'
    )
  );

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'trip-covers',
  'trip-covers',
  false,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "trip owners can read their cover images"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'trip-covers'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "trip owners can upload their cover images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'trip-covers'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "trip owners can delete their cover images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'trip-covers'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
