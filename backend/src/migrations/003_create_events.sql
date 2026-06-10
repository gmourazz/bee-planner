-- Tabela de eventos do calendário pessoal
CREATE TABLE IF NOT EXISTS public.events (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  date        DATE        NOT NULL,
  type        TEXT        NOT NULL DEFAULT 'Pessoal',
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "eventos_select" ON public.events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "eventos_insert" ON public.events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "eventos_update" ON public.events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "eventos_delete" ON public.events FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_events_user_date ON public.events(user_id, date);

-- Tabela de integrações OAuth (tokens do Google Calendar e Outlook)
-- Gerenciada exclusivamente pelo backend (SERVICE_KEY). Frontend não acessa diretamente.
CREATE TABLE IF NOT EXISTS public.calendar_integrations (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  google_access_token   TEXT,
  google_refresh_token  TEXT,
  google_token_expiry   TIMESTAMPTZ,
  outlook_access_token  TEXT,
  outlook_refresh_token TEXT,
  outlook_token_expiry  TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.calendar_integrations ENABLE ROW LEVEL SECURITY;
-- Nenhuma policy: apenas o SERVICE_KEY do backend pode ler/gravar
