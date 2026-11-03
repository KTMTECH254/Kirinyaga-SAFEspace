create table if not exists public.anxiety_video_story_views (
  story_id uuid not null references public.anxiety_video_stories(id) on delete cascade,
  viewer_id text not null check (char_length(viewer_id) between 1 and 128),
  viewed_at timestamptz not null default now(),
  primary key (story_id, viewer_id)
);

create table if not exists public.anxiety_video_story_votes (
  story_id uuid not null references public.anxiety_video_stories(id) on delete cascade,
  viewer_id text not null check (char_length(viewer_id) between 1 and 128),
  vote smallint not null check (vote in (-1, 1)),
  updated_at timestamptz not null default now(),
  primary key (story_id, viewer_id)
);

alter table public.anxiety_video_story_views enable row level security;
alter table public.anxiety_video_story_votes enable row level security;
revoke all on public.anxiety_video_story_views, public.anxiety_video_story_votes from anon, authenticated;
grant all on public.anxiety_video_story_views, public.anxiety_video_story_votes to service_role;

create or replace function public.get_anxiety_video_story_engagement(
  p_story_ids uuid[],
  p_viewer_id text
)
returns table (
  story_id uuid,
  view_count bigint,
  upvotes bigint,
  downvotes bigint,
  viewer_vote smallint
)
language sql
security definer
set search_path = public
as $$
  select
    story.id,
    (select count(*) from public.anxiety_video_story_views views where views.story_id = story.id) as view_count,
    (select count(*) from public.anxiety_video_story_votes votes where votes.story_id = story.id and votes.vote = 1) as upvotes,
    (select count(*) from public.anxiety_video_story_votes votes where votes.story_id = story.id and votes.vote = -1) as downvotes,
    (
      select votes.vote
      from public.anxiety_video_story_votes votes
      where votes.story_id = story.id and votes.viewer_id = p_viewer_id
    ) as viewer_vote
  from public.anxiety_video_stories story
  where story.id = any(p_story_ids)
    and story.status = 'approved';
$$;

create or replace function public.record_anxiety_video_story_view(
  p_story_id uuid,
  p_viewer_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_viewer_id is null or char_length(p_viewer_id) not between 1 and 128 then
    raise exception 'Invalid viewer identity.';
  end if;

  if not exists (
    select 1
    from public.anxiety_video_stories story
    where story.id = p_story_id and story.status = 'approved'
  ) then
    raise exception 'Approved video story not found.';
  end if;

  insert into public.anxiety_video_story_views (story_id, viewer_id)
  values (p_story_id, p_viewer_id)
  on conflict (story_id, viewer_id) do nothing;
end;
$$;

create or replace function public.set_anxiety_video_story_vote(
  p_story_id uuid,
  p_viewer_id text,
  p_vote smallint
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_viewer_id is null or char_length(p_viewer_id) not between 1 and 128 then
    raise exception 'Invalid viewer identity.';
  end if;

  if p_vote is null or p_vote not in (-1, 0, 1) then
    raise exception 'Invalid video story vote.';
  end if;

  if not exists (
    select 1
    from public.anxiety_video_stories story
    where story.id = p_story_id and story.status = 'approved'
  ) then
    raise exception 'Approved video story not found.';
  end if;

  if p_vote = 0 then
    delete from public.anxiety_video_story_votes
    where story_id = p_story_id and viewer_id = p_viewer_id;
  else
    insert into public.anxiety_video_story_votes (story_id, viewer_id, vote)
    values (p_story_id, p_viewer_id, p_vote)
    on conflict (story_id, viewer_id)
    do update set vote = excluded.vote, updated_at = now();
  end if;
end;
$$;

revoke all on function public.get_anxiety_video_story_engagement(uuid[], text) from public, anon, authenticated;
revoke all on function public.record_anxiety_video_story_view(uuid, text) from public, anon, authenticated;
revoke all on function public.set_anxiety_video_story_vote(uuid, text, smallint) from public, anon, authenticated;
grant execute on function public.get_anxiety_video_story_engagement(uuid[], text) to service_role;
grant execute on function public.record_anxiety_video_story_view(uuid, text) to service_role;
grant execute on function public.set_anxiety_video_story_vote(uuid, text, smallint) to service_role;
