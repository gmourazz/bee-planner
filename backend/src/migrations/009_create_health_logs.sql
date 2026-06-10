-- Log diário de saúde e bem-estar
create table if not exists health_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  log_date   date not null,
  water      int not null default 0,            -- copos de água (0-16)
  sleep      numeric(4,1) not null default 0,   -- horas de sono (incrementos de 0.5)
  mood       int check (mood between 1 and 5),  -- null = não registrado
  exercises  text[] not null default '{}',      -- nomes dos exercícios feitos
  steps      int not null default 0,
  created_at timestamptz default now(),
  unique(user_id, log_date)
);

alter table health_logs enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'health_logs' and policyname = 'Usuário vê só seus logs de saúde'
  ) then
    create policy "Usuário vê só seus logs de saúde"
      on health_logs for all
      using (auth.uid() = user_id);
  end if;
end $$;
