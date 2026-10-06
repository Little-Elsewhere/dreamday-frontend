-- Trip schedules, checklists, and tasks.

create table public.trip_schedule_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 200),
  note text not null default '' check (length(note) <= 2000),
  location text not null default '' check (length(location) <= 200),
  trip_day date not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  start_time_zone text not null,
  end_time_zone text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at)
);
create index trip_schedule_upcoming_idx on public.trip_schedule_items(trip_id, starts_at);

create table public.trip_checklists (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 120),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  unique (trip_id, id)
);
create index trip_checklists_order_idx on public.trip_checklists(trip_id, position);

create table public.trip_tasks (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null,
  checklist_id uuid not null,
  title text not null check (length(trim(title)) between 1 and 250),
  due_at timestamptz,
  due_time_zone text,
  assignee_membership_id uuid,
  is_done boolean not null default false,
  completed_at timestamptz,
  position integer not null default 0,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  foreign key (trip_id, checklist_id) references public.trip_checklists(trip_id, id) on delete cascade,
  foreign key (trip_id, assignee_membership_id) references public.trip_memberships(trip_id, id),
  check ((due_at is null) = (due_time_zone is null)),
  check (is_done = (completed_at is not null))
);
create index trip_tasks_checklist_idx on public.trip_tasks(checklist_id, position);
