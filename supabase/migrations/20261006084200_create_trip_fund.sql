-- Group fund, expense ledger, and member splits.

create table public.trip_funds (
  trip_id uuid primary key references public.trips(id) on delete cascade,
  budget_minor bigint check (budget_minor is null or budget_minor >= 0),
  created_at timestamptz not null default now()
);

create table public.trip_expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trip_funds(trip_id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 200),
  amount_minor bigint not null check (amount_minor > 0),
  paid_by_membership_id uuid not null,
  incurred_at timestamptz not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  foreign key (trip_id, paid_by_membership_id) references public.trip_memberships(trip_id, id),
  unique (trip_id, id)
);
create index trip_expenses_recent_idx on public.trip_expenses(trip_id, incurred_at desc);

create table public.trip_expense_splits (
  trip_id uuid not null,
  expense_id uuid not null,
  membership_id uuid not null,
  amount_minor bigint not null check (amount_minor >= 0),
  primary key (expense_id, membership_id),
  foreign key (trip_id, expense_id) references public.trip_expenses(trip_id, id) on delete cascade,
  foreign key (trip_id, membership_id) references public.trip_memberships(trip_id, id)
);
