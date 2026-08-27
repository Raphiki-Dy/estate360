-- =====================================================================
-- ESTATE360 — SEED DATA
-- Test accounts + sample units, codes, and alerts for local dev / demo.
-- Run AFTER schema.sql.
-- =====================================================================
-- ⚠️ DEV/DEMO ONLY. All three test accounts share the password below.
--    Never run this against a production project.
--
--    Login            Email                    Password
--    ---------------- ------------------------ -----------
--    Admin            admin@estate360.com      Password123!
--    Resident         resident@estate360.com   Password123!
--    Security Guard   guard@estate360.com      Password123!
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. UNITS
-- ---------------------------------------------------------------------
insert into public.units (id, unit_number) values
  ('11111111-1111-1111-1111-111111111101', 'A1'),
  ('11111111-1111-1111-1111-111111111102', 'A2'),
  ('11111111-1111-1111-1111-111111111103', 'B1')
on conflict (unit_number) do nothing;

-- ---------------------------------------------------------------------
-- 2. AUTH USERS
--    Inserted directly into auth.users so the app has real login
--    credentials out of the box. The trg_on_auth_user_created trigger
--    (from schema.sql) auto-creates a matching public.profiles row for
--    each user with role defaulted from raw_user_meta_data.
-- ---------------------------------------------------------------------

-- Admin
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222201',
  'authenticated', 'authenticated',
  'admin@estate360.com',
  crypt('Password123!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Estate Admin","role":"ADMIN"}',
  now(), now(), '', ''
) on conflict (id) do nothing;

-- Resident
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222202',
  'authenticated', 'authenticated',
  'resident@estate360.com',
  crypt('Password123!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Chidi Okafor","role":"RESIDENT"}',
  now(), now(), '', ''
) on conflict (id) do nothing;

-- Security Guard
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222203',
  'authenticated', 'authenticated',
  'guard@estate360.com',
  crypt('Password123!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Musa Ibrahim","role":"SECURITY"}',
  now(), now(), '', ''
) on conflict (id) do nothing;

-- Also seed matching auth.identities rows (needed for email/password
-- sign-in to work correctly on some Supabase versions).
insert into auth.identities (
  id, provider_id, user_id, identity_data, provider, created_at, updated_at, last_sign_in_at
)
select
  gen_random_uuid(), u.id::text, u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email),
  'email', now(), now(), now()
from auth.users u
where u.email in ('admin@estate360.com','resident@estate360.com','guard@estate360.com')
on conflict do nothing;

-- ---------------------------------------------------------------------
-- 3. PROFILES — patch unit assignment + rent_expiry_date
--    (the auth.users trigger already created role + full_name)
-- ---------------------------------------------------------------------
update public.profiles
set unit_id = '11111111-1111-1111-1111-111111111101',
    phone = '+2348012345678',
    rent_expiry_date = (current_date + interval '18 days')::date
where id = '22222222-2222-2222-2222-222222222202';   -- resident@estate360.com

update public.profiles
set phone = '+2348023456789'
where id = '22222222-2222-2222-2222-222222222203';   -- guard@estate360.com

update public.profiles
set phone = '+2348034567890'
where id = '22222222-2222-2222-2222-222222222201';   -- admin@estate360.com

-- A couple of extra residents (no login, just directory/rent-tracking data)
insert into public.units (id, unit_number) values
  ('11111111-1111-1111-1111-111111111104', 'B2')
on conflict (unit_number) do nothing;

-- ---------------------------------------------------------------------
-- 4. SAMPLE ACCESS CODES
--    One ACTIVE, one USED, one EXPIRED — exercises all three states in
--    the Security portal UI right after seeding.
-- ---------------------------------------------------------------------
insert into public.access_codes
  (id, code, visitor_name, visitor_phone, resident_id, unit_id, status, expires_at, created_at, used_at)
values
  (
    '33333333-3333-3333-3333-333333333301',
    'B4K8M9',
    'Amaka Eze', '+2348098765432',
    '22222222-2222-2222-2222-222222222202',
    '11111111-1111-1111-1111-111111111101',
    'ACTIVE',
    now() + interval '6 hours',
    now() - interval '30 minutes',
    null
  ),
  (
    '33333333-3333-3333-3333-333333333302',
    'H7X2P5',
    'Tunde Bakare', '+2348076543210',
    '22222222-2222-2222-2222-222222222202',
    '11111111-1111-1111-1111-111111111101',
    'USED',
    now() + interval '4 hours',
    now() - interval '2 hours',
    now() - interval '1 hour'
  ),
  (
    '33333333-3333-3333-3333-333333333303',
    'K3N9Q7',
    'Ngozi Umeh', '+2348065432109',
    '22222222-2222-2222-2222-222222222202',
    '11111111-1111-1111-1111-111111111101',
    'EXPIRED',
    now() - interval '1 hour',
    now() - interval '5 hours',
    null
  )
on conflict (code) do nothing;

-- ---------------------------------------------------------------------
-- 5. SAMPLE EMERGENCY ALERT (resolved, for audit history)
-- ---------------------------------------------------------------------
insert into public.emergency_alerts (id, unit_id, resident_id, status, created_at, resolved_at)
values (
  '44444444-4444-4444-4444-444444444401',
  '11111111-1111-1111-1111-111111111101',
  '22222222-2222-2222-2222-222222222202',
  'RESOLVED',
  now() - interval '2 days',
  now() - interval '2 days' + interval '10 minutes'
)
on conflict (id) do nothing;

-- =====================================================================
-- END OF SEED
-- =====================================================================
