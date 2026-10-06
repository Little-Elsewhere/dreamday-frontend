-- Core trip identity, membership, invitations, and supported currencies.
-- Application access uses a server-only Postgres connection.
create type public.trip_role as enum ('owner', 'editor', 'member', 'viewer');
create type public.invitation_status as enum ('pending', 'accepted', 'revoked');
create type public.trip_lifecycle as enum ('planning', 'confirmed', 'cancelled');

create table public.currency_catalog (
  code text primary key check (code ~ '^[A-Z]{3}$'),
  exponent smallint not null check (exponent between 0 and 3)
);
insert into public.currency_catalog (code, exponent) values
  ('VND', 0), ('JPY', 0), ('KRW', 0), ('TWD', 2),
  ('USD', 2), ('EUR', 2), ('GBP', 2), ('SGD', 2), ('THB', 2),
  ('AUD', 2), ('CAD', 2), ('CHF', 2), ('CNY', 2), ('HKD', 2),
  ('IDR', 2), ('MYR', 2), ('PHP', 2), ('INR', 2);

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (length(trim(display_name)) between 1 and 100),
  email_normalized text not null check (email_normalized = lower(trim(email_normalized))),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  name text not null check (length(trim(name)) between 1 and 120),
  destination text not null check (length(trim(destination)) between 1 and 160),
  description text not null default '' check (length(description) <= 1000),
  starts_on date not null,
  ends_on date not null,
  time_zone text not null,
  currency_code text not null references public.currency_catalog(code),
  currency_exponent smallint not null check (currency_exponent between 0 and 3),
  lifecycle public.trip_lifecycle not null default 'planning',
  cover_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on >= starts_on),
  check (ends_on - starts_on <= 365),
  check (cover_path is null or (cover_path like id::text || '/%' and length(cover_path) <= 500))
);

create table public.trip_memberships (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.trip_role not null,
  joined_at timestamptz not null default now(),
  unique (trip_id, user_id),
  unique (trip_id, id)
);
create unique index one_owner_per_trip on public.trip_memberships(trip_id) where role = 'owner';
create index trip_memberships_user_idx on public.trip_memberships(user_id, trip_id);

create table public.trip_invitations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  email_normalized text not null check (email_normalized = lower(trim(email_normalized))),
  role public.trip_role not null check (role <> 'owner'),
  token_hash text not null unique check (length(token_hash) = 64),
  status public.invitation_status not null default 'pending',
  invited_by uuid not null references auth.users(id),
  accepted_by uuid references auth.users(id),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);
create unique index trip_invitations_one_pending_idx on public.trip_invitations(trip_id, email_normalized)
  where status = 'pending';
create index trip_invitations_email_idx on public.trip_invitations(email_normalized) where status = 'pending';
