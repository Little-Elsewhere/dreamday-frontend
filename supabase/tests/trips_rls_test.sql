begin;

select plan(30);

insert into auth.users (id, aud, role, email)
values
  ('11111111-1111-4111-8111-111111111111', 'authenticated', 'authenticated', 'trip-owner@example.test'),
  ('22222222-2222-4222-8222-222222222222', 'authenticated', 'authenticated', 'other-owner@example.test');

insert into public.trips (
  id,
  owner_id,
  lifecycle,
  name,
  start_date,
  end_date,
  pace
)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    'draft',
    'Owner trip',
    current_date,
    current_date + 1,
    'balanced'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '22222222-2222-4222-8222-222222222222',
    'draft',
    'Other trip',
    current_date,
    current_date + 1,
    'balanced'
  );

insert into public.trip_activities (
  id,
  trip_id,
  title,
  activity_date,
  start_minute,
  end_minute
)
values
  (
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'Owner activity',
    current_date,
    540,
    600
  ),
  (
    'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'Other activity',
    current_date,
    540,
    600
  );

update public.trips
set lifecycle = 'published'
where id in (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
);

insert into storage.objects (bucket_id, name)
values
  ('trip-covers', '11111111-1111-4111-8111-111111111111/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/owner.webp'),
  ('trip-covers', '22222222-2222-4222-8222-222222222222/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/other.webp');

select set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',
  true
);
set local role authenticated;

select is((select count(*)::integer from public.trips), 1, 'a user only reads their own trips');
select is((select count(*)::integer from public.trip_activities), 1, 'a user only reads activities belonging to their trips');
select is((select count(*)::integer from storage.objects where bucket_id = 'trip-covers'), 1, 'a user only reads cover objects in their own folder');

select lives_ok(
  $$insert into public.trips (id, owner_id, lifecycle, name)
    values ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', auth.uid(), 'draft', 'A new draft')$$,
  'a user can create their own draft'
);

select lives_ok(
  $$update public.trips
    set start_date = current_date, end_date = current_date + 1, pace = 'balanced'
    where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'$$,
  'a draft can be completed before publishing'
);

select throws_ok(
  $$insert into public.trip_activities (trip_id, title, activity_date, start_minute, end_minute)
    values ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'Outside trip', current_date - 1, 600, 660)$$,
  '23514',
  'Activity date must be within the trip date range',
  'a user cannot add an activity outside the trip dates'
);

select lives_ok(
  $$insert into public.trip_activities (trip_id, title, activity_date, start_minute, end_minute)
    values ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'In range', current_date + 1, 600, 660)$$,
  'a user can add an activity within the trip dates'
);

select throws_ok(
  $$update public.trip_activities
    set activity_date = current_date - 1
    where trip_id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'$$,
  '23514',
  'Activity date must be within the trip date range',
  'a user cannot move an activity outside the trip dates'
);

select lives_ok(
  $$insert into public.trip_activities (id, trip_id, title, activity_date, start_minute, end_minute)
    values (
      'ffffffff-ffff-4fff-8fff-ffffffffffff',
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      'Temporary',
      current_date,
      700,
      760
    )$$,
  'a user can add a second valid draft activity'
);

select lives_ok(
  $$delete from public.trip_activities
    where id = 'ffffffff-ffff-4fff-8fff-ffffffffffff'$$,
  'a user can delete an activity from a draft'
);
select is(
  (select count(*)::integer from public.trip_activities where id = 'ffffffff-ffff-4fff-8fff-ffffffffffff'),
  0,
  'the draft activity is deleted'
);

select lives_ok(
  $$update public.trips
    set start_date = current_date + 2, end_date = current_date + 3
    where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'$$,
  'a draft date range can be edited before publishing'
);

select throws_ok(
  $$update public.trips
    set lifecycle = 'published'
    where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'$$,
  '23514',
  'Trip activities must fall within the trip date range',
  'a user cannot publish a trip with activities outside its dates'
);

select throws_ok(
  $$update public.trips
    set owner_id = '22222222-2222-4222-8222-222222222222'
    where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'$$,
  '42501',
  null,
  'a user cannot transfer ownership of their draft'
);

select lives_ok(
  $$update public.trips
    set start_date = current_date, end_date = current_date + 1
    where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'$$,
  'a draft can restore a date range that includes its activities'
);

select lives_ok(
  $$update public.trips
    set lifecycle = 'published'
    where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'$$,
  'a user can publish a trip when all activities are within its dates'
);

select lives_ok(
  $$update public.trip_activities
    set title = 'Changed after publish'
    where trip_id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'$$,
  'activity updates on a published trip are filtered by row security'
);
select is(
  (select title from public.trip_activities where trip_id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'),
  'In range',
  'a published trip activity remains unchanged'
);

select lives_ok(
  $$delete from public.trip_activities
    where trip_id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'$$,
  'activity deletes on a published trip are filtered by row security'
);
select is(
  (select count(*)::integer from public.trip_activities where trip_id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'),
  1,
  'a published trip activity remains present'
);

select throws_ok(
  $$insert into public.trip_activities (trip_id, title, activity_date, start_minute, end_minute)
    values ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'Late insert', current_date, 700, 760)$$,
  '42501',
  null,
  'a user cannot add activities to a published trip'
);

select throws_ok(
  $$insert into public.trips (owner_id, lifecycle, name)
    values ('22222222-2222-4222-8222-222222222222', 'draft', 'Someone else draft')$$,
  '42501',
  null,
  'a user cannot create a trip for another account'
);

select throws_ok(
  $$insert into public.trip_activities (trip_id, title, activity_date, start_minute, end_minute)
    values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Injected activity', current_date, 600, 660)$$,
  '42501',
  null,
  'a user cannot add activities to another account trip'
);

select throws_ok(
  $$insert into storage.objects (bucket_id, name)
    values ('trip-covers', '22222222-2222-4222-8222-222222222222/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/injected.webp')$$,
  '42501',
  null,
  'a user cannot upload covers into another account folder'
);

reset role;
set local role service_role;
select throws_ok(
  $$delete from public.trip_activities where id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'$$,
  '42501',
  'Trip is not available for activity changes',
  'published activities cannot be deleted outside a foreign-key cascade'
);

reset role;
select lives_ok(
  $$delete from auth.users where id = '11111111-1111-4111-8111-111111111111'$$,
  'an account with published trips can be deleted'
);
select is(
  (select count(*)::integer from public.trips where owner_id = '11111111-1111-4111-8111-111111111111'),
  0,
  'account deletion cascades to its trips and activities'
);

set local role anon;
select throws_ok(
  $$select count(*) from public.trips$$,
  '42501',
  null,
  'anon cannot query trips because it has no table grant'
);
select is(
  has_table_privilege('anon', 'public.trip_activities', 'select'),
  false,
  'anon has no Data API grant for trip activities'
);
select is(
  has_table_privilege('authenticated', 'public.trips', 'select'),
  true,
  'authenticated receives an explicit table grant'
);

select * from finish();
rollback;
