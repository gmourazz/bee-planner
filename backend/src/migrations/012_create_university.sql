-- Módulo universitário: semestres, matérias, grade horária, provas

-- Semestres
create table if not exists uni_semesters (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  start_date date,
  end_date   date,
  is_current boolean not null default false,
  created_at timestamptz not null default now()
);
alter table uni_semesters enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='uni_semesters' and policyname='uni_semesters_user') then
    create policy "uni_semesters_user" on uni_semesters for all using (auth.uid() = user_id);
  end if;
end $$;

-- Matérias
create table if not exists uni_subjects (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  name           text not null,
  professor      text not null default '',
  credits        smallint not null default 0,
  grade          numeric(4,1),
  attendance     numeric(5,2) not null default 100,
  absences       smallint not null default 0,
  max_absences   smallint not null default 0,
  subject_status text not null default 'open' check (subject_status in ('open','closed','cancelled')),
  start_date     date,
  end_date       date,
  color_idx      smallint not null default 0,
  icon           text not null default 'BookOpen',
  semester       text not null default '',
  created_at     timestamptz not null default now()
);
alter table uni_subjects enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='uni_subjects' and policyname='uni_subjects_user') then
    create policy "uni_subjects_user" on uni_subjects for all using (auth.uid() = user_id);
  end if;
end $$;

-- Grade horária
create table if not exists uni_schedule (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  subject_name text not null,
  room         text not null default '',
  day_of_week  smallint not null check (day_of_week between 1 and 7),
  time_start   text not null,
  color_idx    smallint not null default 0,
  semester     text not null default '',
  created_at   timestamptz not null default now()
);
alter table uni_schedule enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='uni_schedule' and policyname='uni_schedule_user') then
    create policy "uni_schedule_user" on uni_schedule for all using (auth.uid() = user_id);
  end if;
end $$;

-- Provas e datas
create table if not exists uni_exams (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  subject     text not null,
  exam_date   date not null,
  type        text not null default '',
  description text not null default '',
  status      text not null default 'pending' check (status in ('pending','done')),
  created_at  timestamptz not null default now()
);
alter table uni_exams enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='uni_exams' and policyname='uni_exams_user') then
    create policy "uni_exams_user" on uni_exams for all using (auth.uid() = user_id);
  end if;
end $$;