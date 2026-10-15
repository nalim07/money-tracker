alter table public.transactions
  add column if not exists source text,
  add column if not exists source_message_id text;

create unique index if not exists transactions_user_source_message_id_key
  on public.transactions (user_id, source_message_id)
  where source_message_id is not null;
