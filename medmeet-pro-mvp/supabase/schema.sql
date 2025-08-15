-- Core tables
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  role text check (role in ('student','lpn','rn','md','pa','np','other')),
  discipline text,
  created_at timestamptz default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users on delete set null,
  title text,
  type text not null check (type in ('video','text')),
  content text,
  video_url text,
  tags text[],
  upvotes int default 0,
  hidden boolean default false,
  created_at timestamptz default now()
);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users on delete set null,
  title text not null,
  description text,
  file_url text not null,
  subject text,
  tags text[],
  upvotes int default 0,
  hidden boolean default false,
  created_at timestamptz default now()
);

create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  link text not null,
  category text,
  rating numeric,
  hidden boolean default false,
  added_by uuid references auth.users on delete set null,
  created_at timestamptz default now()
);

create table if not exists resource_reviews (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid references resources on delete cascade,
  user_id uuid references auth.users on delete set null,
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  title text not null,
  location text,
  url text not null,
  description text,
  hidden boolean default false,
  posted_at timestamptz default now(),
  added_by uuid references auth.users on delete set null
);

create table if not exists job_feeds (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  created_at timestamptz default now()
);

-- Social
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users on delete set null,
  target_type text check (target_type in ('post','note','resource','job')) not null,
  target_id uuid not null,
  body text not null,
  created_at timestamptz default now()
);

create table if not exists likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  target_type text check (target_type in ('post','note','resource','job')) not null,
  target_id uuid not null,
  created_at timestamptz default now(),
  unique(user_id, target_type, target_id)
);

create table if not exists follows (
  follower_id uuid references auth.users on delete cascade,
  followee_id uuid references auth.users on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, followee_id)
);

-- Collections
create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users on delete cascade,
  name text not null,
  created_at timestamptz default now(),
  unique(owner_id, name)
);
create table if not exists collection_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid references collections on delete cascade,
  target_type text check (target_type in ('note','post','resource','job')) not null,
  target_id uuid not null,
  created_at timestamptz default now()
);

-- Orgs
create table if not exists orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website text,
  logo_url text,
  owner_id uuid references auth.users on delete set null,
  created_at timestamptz default now()
);
create table if not exists org_members (
  org_id uuid references orgs on delete cascade,
  user_id uuid references auth.users on delete cascade,
  role text default 'member',
  created_at timestamptz default now(),
  primary key (org_id, user_id)
);

-- Moderation
create table if not exists admin_users (
  user_id uuid primary key references auth.users on delete cascade
);
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users on delete set null,
  target_type text check (target_type in ('post','note','resource','job')) not null,
  target_id uuid not null,
  reason text,
  resolved boolean default false,
  created_at timestamptz default now()
);

-- Notifications (preferences only in MVP)
create table if not exists notification_settings (
  user_id uuid primary key references auth.users on delete cascade,
  daily_digest boolean default true,
  created_at timestamptz default now()
);

-- RLS
alter table profiles enable row level security;
alter table posts enable row level security;
alter table notes enable row level security;
alter table resources enable row level security;
alter table resource_reviews enable row level security;
alter table jobs enable row level security;
alter table job_feeds enable row level security;
alter table comments enable row level security;
alter table likes enable row level security;
alter table follows enable row level security;
alter table collections enable row level security;
alter table collection_items enable row level security;
alter table orgs enable row level security;
alter table org_members enable row level security;
alter table admin_users enable row level security;
alter table reports enable row level security;
alter table notification_settings enable row level security;

-- Policies
create policy "profiles are readable by all" on profiles for select using (true);
create policy "profiles insert own" on profiles for insert with check (auth.uid() = id);
create policy "profiles update own" on profiles for update using (auth.uid() = id);

create policy "posts readable by all" on posts for select using (true);
create policy "posts insert authenticated" on posts for insert with check (auth.role() = 'authenticated');
create policy "posts update own or admin" on posts for update using (auth.uid() = author_id or exists (select 1 from admin_users a where a.user_id = auth.uid()));

create policy "notes readable by all" on notes for select using (true);
create policy "notes insert authenticated" on notes for insert with check (auth.role() = 'authenticated');
create policy "notes update own or admin" on notes for update using (auth.uid() = author_id or exists (select 1 from admin_users a where a.user_id = auth.uid()));

create policy "resources readable by all" on resources for select using (true);
create policy "resources insert authenticated" on resources for insert with check (auth.role() = 'authenticated');
create policy "resources update own or admin" on resources for update using (auth.uid() = added_by or exists (select 1 from admin_users a where a.user_id = auth.uid()));

create policy "resource_reviews readable" on resource_reviews for select using (true);
create policy "resource_reviews insert authed" on resource_reviews for insert with check (auth.role() = 'authenticated');
create policy "resource_reviews update own" on resource_reviews for update using (auth.uid() = user_id);

create policy "jobs readable by all" on jobs for select using (true);
create policy "jobs insert authenticated" on jobs for insert with check (auth.role() = 'authenticated');
create policy "jobs update own or admin" on jobs for update using (auth.uid() = added_by or exists (select 1 from admin_users a where a.user_id = auth.uid()));

create policy "job_feeds readable by all" on job_feeds for select using (true);
create policy "job_feeds insert admin only" on job_feeds for insert with check (exists (select 1 from admin_users a where a.user_id = auth.uid()));

create policy "comments readable by all" on comments for select using (true);
create policy "comments insert authed" on comments for insert with check (auth.role() = 'authenticated');
create policy "comments update own" on comments for update using (auth.uid() = author_id);

create policy "likes readable by all" on likes for select using (true);
create policy "likes insert authed" on likes for insert with check (auth.role() = 'authenticated');
create policy "likes delete own" on likes for delete using (auth.uid() = user_id);

create policy "follows readable by all" on follows for select using (true);
create policy "follows insert authed" on follows for insert with check (auth.role() = 'authenticated');
create policy "follows delete own" on follows for delete using (auth.uid() = follower_id);

create policy "collections readable by all" on collections for select using (true);
create policy "collections insert own" on collections for insert with check (auth.uid() = owner_id);
create policy "collections update own" on collections for update using (auth.uid() = owner_id);

create policy "collection_items readable" on collection_items for select using (true);
create policy "collection_items insert owner" on collection_items for insert with check (exists (select 1 from collections c where c.id = collection_id and c.owner_id = auth.uid()));

create policy "orgs readable by all" on orgs for select using (true);
create policy "orgs insert authed" on orgs for insert with check (auth.role() = 'authenticated');
create policy "orgs update owner or admin" on orgs for update using (exists (select 1 from admin_users a where a.user_id = auth.uid()) or exists (select 1 from orgs o where o.id = id and o.owner_id = auth.uid()));

create policy "org_members readable" on org_members for select using (true);
create policy "org_members insert owner" on org_members for insert with check (exists (select 1 from orgs o where o.id = org_id and o.owner_id = auth.uid()));

create policy "admin_users readable by admins" on admin_users for select using (exists (select 1 from admin_users a where a.user_id = auth.uid()));
create policy "admin_users insert admin only" on admin_users for insert with check (exists (select 1 from admin_users a where a.user_id = auth.uid()));

create policy "reports readable by admins" on reports for select using (exists (select 1 from admin_users a where a.user_id = auth.uid()));
create policy "reports insert authed" on reports for insert with check (auth.role() = 'authenticated');
create policy "reports update admin only" on reports for update using (exists (select 1 from admin_users a where a.user_id = auth.uid()));

create policy "notification_settings readable own" on notification_settings for select using (auth.uid() = user_id);
create policy "notification_settings upsert own" on notification_settings for insert with check (auth.uid() = user_id);
create policy "notification_settings update own" on notification_settings for update using (auth.uid() = user_id);

-- Upvote helper function
create or replace function increment_note_upvotes(note_id uuid)
returns void language sql security definer as $$
  update notes set upvotes = coalesce(upvotes,0) + 1 where id = note_id;
$$;

