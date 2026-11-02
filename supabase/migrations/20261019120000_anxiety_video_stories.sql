create table if not exists public.anxiety_video_stories (
  id uuid primary key default gen_random_uuid(),
  user_id text not null check (char_length(user_id) between 1 and 128),
  user_name text not null check (char_length(user_name) between 1 and 64),
  caption text not null check (char_length(caption) between 1 and 240),
  storage_path text not null unique,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

alter table public.anxiety_video_stories enable row level security;
revoke all on public.anxiety_video_stories from anon, authenticated;
grant all on public.anxiety_video_stories to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'anxiety-video-stories',
  'anxiety-video-stories',
  false,
  31457280,
  array['video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
