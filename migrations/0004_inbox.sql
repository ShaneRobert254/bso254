create table if not exists media_files (
  name text primary key,
  mime text not null,
  bytes bytea not null
);

create table if not exists messages (
  id text primary key,
  name text not null,
  email text not null,
  topic text not null,
  body text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists fans (
  email text primary key,
  name text not null,
  city text not null,
  created_at timestamptz not null default now()
);
