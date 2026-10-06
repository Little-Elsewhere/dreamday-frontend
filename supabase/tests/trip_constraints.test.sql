begin;
create extension if not exists pgtap with schema extensions;
select plan(4);

insert into auth.users (id, email) values
  ('11111111-1111-4111-8111-111111111111', 'trip-test-owner@example.test'),
  ('22222222-2222-4222-8222-222222222222', 'trip-test-member@example.test');
insert into public.trips (id, owner_id, name, destination, starts_on, ends_on, time_zone, currency_code, currency_exponent) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'Trip A', 'Tokyo', '2026-10-10', '2026-10-20', 'Asia/Tokyo', 'JPY', 0),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222', 'Trip B', 'Paris', '2026-10-10', '2026-10-20', 'Europe/Paris', 'EUR', 2);
insert into public.trip_memberships (id, trip_id, user_id, role) values
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'owner'),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222', 'owner');
insert into public.trip_checklists (id, trip_id, title) values ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Packing');

select throws_ok($$
  insert into public.trip_tasks (trip_id, checklist_id, title, assignee_membership_id, created_by)
  values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'Pack',
          'dddddddd-dddd-4ddd-8ddd-dddddddddddd', '11111111-1111-4111-8111-111111111111')
$$, '23503', null, 'task cannot assign a member from another trip');

select throws_ok($$
  update public.trips set time_zone = 'UTC+9' where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
$$, 'P0001', 'Invalid IANA time zone', 'fixed offsets are rejected as trip zones');

insert into public.trip_funds (trip_id) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
insert into public.trip_expenses (id, trip_id, title, amount_minor, paid_by_membership_id, incurred_at, created_by)
values ('ffffffff-ffff-4fff-8fff-ffffffffffff', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Train', 101,
        'cccccccc-cccc-4ccc-8ccc-cccccccccccc', now(), '11111111-1111-4111-8111-111111111111');
insert into public.trip_expense_splits (trip_id, expense_id, membership_id, amount_minor)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'ffffffff-ffff-4fff-8fff-ffffffffffff',
        'cccccccc-cccc-4ccc-8ccc-cccccccccccc', 101);
set constraints all immediate;

select throws_ok($$
  update public.trips set currency_code = 'USD', currency_exponent = 2
  where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
$$, 'P0001', 'Trip currency cannot change after the first expense', 'currency locks after first expense');

select is((select sum(amount_minor)::bigint from public.trip_expense_splits where expense_id = 'ffffffff-ffff-4fff-8fff-ffffffffffff'),
  (select amount_minor from public.trip_expenses where id = 'ffffffff-ffff-4fff-8fff-ffffffffffff'),
  'expense split total equals expense');

select * from finish();
rollback;
