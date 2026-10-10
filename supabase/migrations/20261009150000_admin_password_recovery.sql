alter table public.admin_credentials
  add column if not exists recovery_token_hash text;
