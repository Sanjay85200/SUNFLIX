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

-- Creator Ecosystem
create table if not exists public.creator_videos (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  category text,
  video_url text not null,
  thumbnail_url text,
  views integer not null default 0,
  likes integer not null default 0,
  revenue_generated numeric not null default 0.0,
  created_at timestamptz not null default now()
);

create table if not exists public.creator_comments (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.creator_videos (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.creator_videos enable row level security;
alter table public.creator_comments enable row level security;

-- Policies for creator_videos
create policy "creator_videos_select_all" on public.creator_videos for select using (true);
create policy "creator_videos_insert_own" on public.creator_videos for insert with check (auth.uid() = creator_id);
create policy "creator_videos_update_own" on public.creator_videos for update using (auth.uid() = creator_id);
create policy "creator_videos_delete_own" on public.creator_videos for delete using (auth.uid() = creator_id);

-- Policies for creator_comments
create policy "creator_comments_select_all" on public.creator_comments for select using (true);
create policy "creator_comments_insert_auth" on public.creator_comments for insert with check (auth.uid() = user_id);
create policy "creator_comments_delete_own" on public.creator_comments for delete using (auth.uid() = user_id);
