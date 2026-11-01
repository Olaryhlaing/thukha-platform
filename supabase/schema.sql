-- ThuKha Platform — Supabase schema (2026-11-01, deployment pack)
-- Run this whole file once in Supabase Dashboard -> SQL Editor -> New query.
-- Region: Singapore (closest to Myanmar/Thailand users).
--
-- STATUS (2026-11-01): login/signup, server tokens, brands and
-- designs now read these tables when a customer is logged in.
-- Guests still use browser localStorage. Image blobs are NOT stored
-- here — designs store prompt/channel/format only (Storage next).

-- 1. Profiles: one row per customer (linked to Supabase Auth later).
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);
-- Migration for projects created before the role column existed:
-- safe to run again (adds the column only if it is missing).
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles'
      and column_name = 'role'
  ) then
    alter table public.profiles
      add column role text not null default 'customer'
      check (role in ('customer', 'admin'));
  end if;
end $$;
-- Make a user an admin AFTER they sign up (owner only, in SQL Editor).
-- This version also works when the profiles row does not exist yet
-- (signup alone does not create it — the first /api/me or /api/tokens
-- call does), so it inserts the row as admin instead of updating 0 rows:
--   insert into public.profiles (id, role)
--   values ((select id from auth.users where email = 'admin@example.com'), 'admin')
--   on conflict (id) do update set role = 'admin';
-- Never let signup set role='admin' by itself — that would let anyone
-- become admin. Admin and customer accounts must be separate emails:
-- an admin account uses /admin/login only, a customer account uses
-- /login only, and neither login page accepts the other role.

-- 2. Brands: a customer's businesses (name/type only for now).
create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  business_type text,
  created_at timestamptz not null default now()
);

-- 3. Designs: a saved /create result (prompt + image reference only;
--    the image itself stays in Storage in the next step, not in the DB).
create table if not exists public.designs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  brand_id uuid references public.brands (id) on delete set null,
  prompt text not null,
  channel text,
  format text,
  image_url text,
  created_at timestamptz not null default now()
);

-- 4. Generations: audit log for every successful AI image.
create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles (id) on delete set null,
  prompt text not null,
  model text not null default 'gemini-2.5-flash-image',
  format text,
  reference_count int not null default 0,
  cost_tokens int not null,
  created_at timestamptz not null default now()
);

-- 5. Token balances: the server-side wallet (replaces browser
--    localStorage in the next step). balance starts at 100.
create table if not exists public.token_balances (
  owner_id uuid primary key references public.profiles (id) on delete cascade,
  balance int not null default 100 check (balance >= 0),
  updated_at timestamptz not null default now()
);

-- 6. Usage events: generic log (page / action / cost) for later reports.
create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles (id) on delete set null,
  event text not null,
  cost_tokens int not null default 0,
  created_at timestamptz not null default now()
);

-- Row Level Security — strict role separation (2026-11-01 fix).
-- WHY: the old policies were FOR ALL on your own rows. That meant a
-- customer holding only the browser (anon) key + their own JWT could
-- call Supabase directly and UPDATE their own profiles row to
-- role='admin', or UPDATE their own token_balances row to any amount
-- — no server check involved. The app itself never writes tables
-- from the browser (all writes go through /api/* routes with the
-- server-only service_role key, which bypasses RLS), so browser
-- writes are not needed at all.
-- NEW RULE: browser keys may only SELECT their own rows. Every
-- INSERT / UPDATE / DELETE must go through a server API route, which
-- checks the caller's role from profiles (service_role lookup) and
-- returns 403 for customers on admin routes. Admin promotion happens
-- ONLY via the owner SQL above — never via signup, never via the app.
-- Re-running this file on an existing project is safe: the old
-- FOR ALL policies are dropped first, then the read-only ones are
-- created (drop-if-exists + create, so no duplicate-policy error).
alter table public.profiles enable row level security;
alter table public.brands enable row level security;
alter table public.designs enable row level security;
alter table public.generations enable row level security;
alter table public.token_balances enable row level security;
alter table public.usage_events enable row level security;

drop policy if exists "own profile" on public.profiles;
drop policy if exists "own brands" on public.brands;
drop policy if exists "own designs" on public.designs;
drop policy if exists "own generations" on public.generations;
drop policy if exists "own token balance" on public.token_balances;
drop policy if exists "own usage events" on public.usage_events;
drop policy if exists "own profile read" on public.profiles;
drop policy if exists "own brands read" on public.brands;
drop policy if exists "own designs read" on public.designs;
drop policy if exists "own generations read" on public.generations;
drop policy if exists "own token balance read" on public.token_balances;
drop policy if exists "own usage events read" on public.usage_events;

create policy "own profile read" on public.profiles
  for select using (auth.uid() = id);
create policy "own brands read" on public.brands
  for select using (auth.uid() = owner_id);
create policy "own designs read" on public.designs
  for select using (auth.uid() = owner_id);
create policy "own generations read" on public.generations
  for select using (auth.uid() = owner_id);
create policy "own token balance read" on public.token_balances
  for select using (auth.uid() = owner_id);
create policy "own usage events read" on public.usage_events
  for select using (auth.uid() = owner_id);

-- Verify: after running, Table Editor should list profiles, brands,
-- designs, generations, token_balances, usage_events, and
-- Authentication -> Policies should show only "* read" policies.
