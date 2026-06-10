-- Tabela de notas pessoais do usuário
create table if not exists notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null,
  content    text not null default '',
  category   text not null default 'Pessoal',
  color      text not null default '#FCD34D',
  is_pinned  boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS: cada usuário acessa apenas suas próprias notas
alter table notes enable row level security;

create policy "Usuário vê só suas notas"
  on notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
