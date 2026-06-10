-- Tabela de cursos e certificações do usuário
create table if not exists courses (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  title              text not null,
  platform           text not null default '',
  duration           text not null default '',
  progress           smallint not null default 0 check (progress between 0 and 100),
  status             text not null default 'in-progress'
                       check (status in ('completed', 'in-progress', 'urgent', 'not-finished')),
  start_date         date,
  end_date           date,
  certificate        boolean not null default false,
  certificate_expiry date,
  credential         text not null default '',
  created_at         timestamptz not null default now()
);

alter table courses enable row level security;

create policy "Usuário vê só seus cursos"
  on courses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
