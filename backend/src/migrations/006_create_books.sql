-- Tabela de livros lidos pelo usuário
create table if not exists books (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  author      text not null default '',
  rating      smallint not null default 5 check (rating between 1 and 5),
  review      text not null default '',
  genres      text[] not null default '{}',
  color_idx   smallint not null default 0,
  cover_url   text,
  started_at  date,
  finished_at date,
  is_manga    boolean not null default false,
  status      text not null default 'lido' check (status in ('lido','lendo','quero_ler')),
  created_at  timestamptz not null default now()
);

alter table books enable row level security;

create policy "Usuário vê só seus livros"
  on books for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Colunas adicionadas após a criação inicial (rodar se a tabela já existir):
-- alter table books alter column author set default '';
-- alter table books add column if not exists cover_url   text;
-- alter table books add column if not exists started_at  date;
-- alter table books add column if not exists finished_at date;
-- alter table books add column if not exists is_manga    boolean not null default false;
-- alter table books add column if not exists status      text not null default 'lido' check (status in ('lido','lendo','quero_ler'));
