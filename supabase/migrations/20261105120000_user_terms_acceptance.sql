alter table public.user_profiles
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists terms_version text;

alter table public.user_profiles
  add constraint user_profiles_terms_acceptance_pair
  check ((terms_accepted_at is null) = (terms_version is null));
