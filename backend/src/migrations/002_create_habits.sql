-- ============================================================
-- MIGRAÇÃO 002 — Módulo de Hábitos
-- Execute este SQL no painel SQL do Supabase (SQL Editor)
-- ============================================================

-- Tabela principal: armazena cada hábito do usuário
CREATE TABLE IF NOT EXISTS habits (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,                        -- nome do hábito (ex: "Beber 2L de água")
  icon_key   TEXT NOT NULL DEFAULT 'droplets',     -- chave do ícone (ex: "activity", "brain")
  color      TEXT NOT NULL DEFAULT '#3B82F6',      -- cor em hex (ex: "#10B981")
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de conclusões: um registro por dia que o hábito foi marcado como feito
CREATE TABLE IF NOT EXISTS habit_completions (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id   UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date       DATE NOT NULL,                        -- data no formato YYYY-MM-DD
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, date)                           -- impede marcar o mesmo hábito duas vezes no mesmo dia
);

-- ── Segurança por linha (RLS) ─────────────────────────────
-- Cada usuário só pode ver e editar os próprios dados

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "habits_proprio_usuario" ON habits
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "completions_proprio_usuario" ON habit_completions
  FOR ALL USING (user_id = auth.uid());

-- ── Índices para melhorar performance ────────────────────
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_completions_habit_id ON habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS idx_completions_user_date ON habit_completions(user_id, date);
