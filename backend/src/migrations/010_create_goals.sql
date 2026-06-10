-- Metas e objetivos (anuais e mensais)
create table if not exists goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  title       text not null,
  description text not null default '',
  target      numeric(12,2) not null,
  current     numeric(12,2) not null default 0,
  unit        text not null default 'itens',
  color       text not null,
  category    text not null,
  scope       text not null check (scope in ('annual', 'monthly')),
  year        int not null,
  month       int check (month between 0 and 11),  -- null para metas anuais
  deadline    date,
  created_at  timestamptz default now()
);

alter table goals enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'goals' and policyname = 'Usuário vê só suas metas'
  ) then
    create policy "Usuário vê só suas metas"
      on goals for all
      using (auth.uid() = user_id);
  end if;
end $$;
