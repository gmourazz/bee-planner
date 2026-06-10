-- Tabela de transações financeiras
create table if not exists transactions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  description    text not null,
  amount         numeric(12,2) not null check (amount > 0),
  type           text not null check (type in ('income', 'expense')),
  category       text not null,
  label          text not null default '',
  date           date not null,
  recurring      boolean not null default false,
  created_at     timestamptz default now()
);

alter table transactions enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'transactions' and policyname = 'Usuário vê só suas transações'
  ) then
    create policy "Usuário vê só suas transações"
      on transactions for all
      using (auth.uid() = user_id);
  end if;
end $$;
