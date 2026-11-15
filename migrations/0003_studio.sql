create table if not exists studio_admin (
  id text primary key,
  salt text not null,
  hash text not null,
  session_key text not null
);

create table if not exists studio_attempts (
  id bigserial primary key,
  at timestamptz not null default now()
);

create table if not exists site_content (
  id text primary key,
  body jsonb not null
);

create table if not exists audio_files (
  name text primary key,
  mime text not null,
  bytes bytea not null
);

alter table purchases add column if not exists status text not null default 'pending';
