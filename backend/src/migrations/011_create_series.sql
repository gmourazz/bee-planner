-- Tabela de séries e filmes acompanhados pelo usuário
create table if not exists series (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  synopsis    text not null default '',
  type        text not null default 'serie'
              check (type in ('serie','filme','anime','documentario')),
  genres      text[] not null default '{}',
  platform    text not null default '',
  rating      smallint not null default 5 check (rating between 1 and 5),
  review      text not null default '',
  seasons     smallint,
  episodes    smallint,
  cover_url   text,
  color_idx   smallint not null default 0,
  started_at  date,
  finished_at date,
  status      text not null default 'quero_assistir'
              check (status in ('assistindo','assistido','quero_assistir','pausado')),
  favorite    boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table series enable row level security;

drop policy if exists "Usuário vê só suas séries" on series;

create policy "Usuário vê só suas séries"
  on series for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

