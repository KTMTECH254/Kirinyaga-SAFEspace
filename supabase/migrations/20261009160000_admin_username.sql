alter table public.admin_credentials
  add column if not exists admin_username text;
