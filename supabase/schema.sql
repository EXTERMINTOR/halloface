-- ====================================================
-- HALL OF ACE — Database Schema
-- ====================================================
-- Paste this entire file into Supabase → SQL Editor → Run
-- This creates all tables, indexes, and security policies.
-- ====================================================

-- POSTS TABLE
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content jsonb not null default '{}'::jsonb,  -- TipTap JSON document
  content_html text,                            -- pre-rendered HTML for fast display
  category text default 'GENERAL',
  cover_image text,
  published boolean default false,
  premium boolean default false,
  reading_time text,
  view_count integer default 0,
  author_id uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  published_at timestamptz
);

create index if not exists posts_slug_idx on posts(slug);
create index if not exists posts_published_idx on posts(published, published_at desc);
create index if not exists posts_category_idx on posts(category);

-- COMMENTS TABLE
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  user_name text not null,
  user_avatar text,
  content text not null,
  created_at timestamptz default now()
);

create index if not exists comments_post_idx on comments(post_id, created_at desc);

-- LIKES TABLE
create table if not exists likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

create index if not exists likes_post_idx on likes(post_id);
create index if not exists likes_user_idx on likes(user_id);

-- PROFILES (extends Supabase auth.users with display info)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  email text,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ====================================================
-- ROW LEVEL SECURITY
-- ====================================================

alter table posts enable row level security;
alter table comments enable row level security;
alter table likes enable row level security;
alter table profiles enable row level security;

-- POSTS POLICIES
-- Anyone can read published posts
drop policy if exists "Published posts are viewable by everyone" on posts;
create policy "Published posts are viewable by everyone"
  on posts for select using (published = true);

-- Authors can read their own posts (drafts + published)
drop policy if exists "Authors can read own posts" on posts;
create policy "Authors can read own posts"
  on posts for select using (auth.uid() = author_id);

-- Only authenticated users can insert posts (admin check happens in app)
drop policy if exists "Authenticated users can insert posts" on posts;
create policy "Authenticated users can insert posts"
  on posts for insert with check (auth.uid() = author_id);

-- Authors can update their own posts
drop policy if exists "Authors can update own posts" on posts;
create policy "Authors can update own posts"
  on posts for update using (auth.uid() = author_id);

-- Authors can delete their own posts
drop policy if exists "Authors can delete own posts" on posts;
create policy "Authors can delete own posts"
  on posts for delete using (auth.uid() = author_id);

-- COMMENTS POLICIES
drop policy if exists "Comments are viewable by everyone" on comments;
create policy "Comments are viewable by everyone"
  on comments for select using (true);

drop policy if exists "Authenticated users can insert comments" on comments;
create policy "Authenticated users can insert comments"
  on comments for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own comments" on comments;
create policy "Users can delete own comments"
  on comments for delete using (auth.uid() = user_id);

-- LIKES POLICIES
drop policy if exists "Likes are viewable by everyone" on likes;
create policy "Likes are viewable by everyone"
  on likes for select using (true);

drop policy if exists "Authenticated users can like" on likes;
create policy "Authenticated users can like"
  on likes for insert with check (auth.uid() = user_id);

drop policy if exists "Users can unlike own likes" on likes;
create policy "Users can unlike own likes"
  on likes for delete using (auth.uid() = user_id);

-- PROFILES POLICIES
drop policy if exists "Profiles are viewable by everyone" on profiles;
create policy "Profiles are viewable by everyone"
  on profiles for select using (true);

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- ====================================================
-- STORAGE BUCKET FOR POST IMAGES
-- ====================================================
-- Run this AFTER creating the bucket in Supabase Storage UI.
-- Bucket name should be: post-images (set as PUBLIC)

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

drop policy if exists "Anyone can view post images" on storage.objects;
create policy "Anyone can view post images"
  on storage.objects for select using (bucket_id = 'post-images');

drop policy if exists "Authenticated users can upload post images" on storage.objects;
create policy "Authenticated users can upload post images"
  on storage.objects for insert with check (
    bucket_id = 'post-images' and auth.role() = 'authenticated'
  );
