-- Tarefas da visão semanal
CREATE TABLE IF NOT EXISTS week_tasks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  text       TEXT NOT NULL,
  time       TEXT,          -- horário opcional HH:MM
  done       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS week_tasks_user_date ON week_tasks(user_id, date);

ALTER TABLE week_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own week tasks"
  ON week_tasks FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
