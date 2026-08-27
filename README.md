# Estate360 — MVP

Estate Visitor Access, Rent Tracking & Emergency Alert Hub.

## Stack
- Next.js 14 (App Router, TypeScript)
- Tailwind CSS + Lucide Icons
- Supabase (Postgres + Auth + RLS + Realtime)

## Setup

1. **Create a Supabase project** at supabase.com.

2. **Run the database scripts** in the Supabase SQL Editor, in order:
   - `supabase/schema.sql` — tables, enums, RLS policies, the
     `validate_access_code()` RPC, and realtime publication setup.
   - `supabase/seed.sql` — 3 test accounts + sample units/codes/alerts.
     ⚠️ Dev/demo only — inserts directly into `auth.users`. If this fails
     on your Supabase version, create the 3 users via the Dashboard's
     Authentication tab instead, then run just the `profiles` UPDATE
     statements from the seed file.

3. **Configure environment variables:**
   ```bash
   cp .env.local.example .env.local
   # then fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
   # from Supabase Dashboard -> Project Settings -> API
   ```

4. **Install and run:**
   ```bash
   npm install
   npm run dev
   ```

5. Open http://localhost:3000

## Test accounts (after seeding)

| Role     | Email                    | Password       | Redirects to |
|----------|---------------------------|----------------|--------------|
| Admin    | admin@estate360.com       | Password123!   | /admin       |
| Resident | resident@estate360.com    | Password123!   | /resident    |
| Security | guard@estate360.com       | Password123!   | /security    |

## What's built (MVP scope)

**Resident (`/resident`)**
- Generate 6-char alphanumeric visitor pass codes with expiry, share via WhatsApp
- Rent countdown badge (color-coded: Active / Due Soon / Overdue)
- Panic button -> real-time alert to Security
- Live-updating list of recently issued passes

**Security (`/security`)**
- Mobile-first code entry, validated via the `validate_access_code()` Postgres RPC
  (atomic — no race condition between two guards scanning the same code)
- GREEN (valid) / RED (used, expired, revoked, invalid) result screens
- Real-time emergency alert banner with audible cue and resolve action

**Admin (`/admin`)**
- Occupant directory with color-coded rent status
- User management (assign RESIDENT / SECURITY / ADMIN roles)
- Gate entry audit log

## Known MVP gaps (worth flagging before production use)

- No email verification enforcement toggle checked — depends on your
  Supabase Auth settings.
- No pagination on audit log / occupant tables (fine at MVP scale, not at 1000s of rows).
- No unit assignment UI for admins to create/edit `units` rows yet — only
  visible in the resident registration dropdown. Easy to add as a 4th admin tab.
- No automated tests yet.
- Rent tracking is informational only — no payment processing/integration.
