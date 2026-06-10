-- Tabela de livros lidos pelo usuário
create table if not exists books (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null,
  author     text not null,
  rating     smallint not null default 5 check (rating between 1 and 5),
  review     text not null default '',
  genres     text[] not null default '{}',
  color_idx  smallint not null default 0,
  created_at timestamptz not null default now()
);

alter table books enable row level security;

create policy "Usuário vê só seus livros"
  on books for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
