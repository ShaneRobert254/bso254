create table if not exists purchases (
  id text primary key,
  user_id text not null,
  receipt text not null,
  title text not null,
  ref text not null,
  track_id text,
  created_at timestamptz not null default now()
);

create index if not exists purchases_user_idx on purchases (user_id);
