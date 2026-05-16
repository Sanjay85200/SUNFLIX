-- Sunflix Supabase schema — Dashboard → SQL → New query → Run
-- After: Settings → API → copy Project URL + anon public key into .env

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  sun_coins integer not null default 0,
  xp integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Watchlist
create table if not exists public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tmdb_id integer not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  title text,
  poster_path text,
  created_at timestamptz not null default now(),
  unique (user_id, tmdb_id, media_type)
);

-- Watch parties (lobby / future sync)
create table if not exists public.watch_parties (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  tmdb_id integer,
  media_type text,
  status text not null default 'scheduled' check (status in ('scheduled', 'live', 'ended')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.watchlist enable row level security;
alter table public.watch_parties enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create policy "watchlist_select_own" on public.watchlist for select using (auth.uid() = user_id);
create policy "watchlist_insert_own" on public.watchlist for insert with check (auth.uid() = user_id);
create policy "watchlist_delete_own" on public.watchlist for delete using (auth.uid() = user_id);
create policy "watchlist_update_own" on public.watchlist for update using (auth.uid() = user_id);

create policy "parties_select" on public.watch_parties for select using (true);
create policy "parties_insert_host" on public.watch_parties for insert with check (auth.uid() = host_id);

-- Optional: Database → Replication → enable supabase_realtime for tables watchlist, watch_parties
