-- =====================================================
-- MIGRAÇÃO 001 — Tabela de perfis de usuário
-- Execute este arquivo no SQL Editor do Supabase
-- =====================================================


-- -----------------------------------------------------
-- 1. TIPO: roles (papéis possíveis de um usuário)
--    - user  → usuário comum
--    - pro   → usuário premium
--    - admin → administrador total
-- -----------------------------------------------------
CREATE TYPE user_role AS ENUM ('user', 'pro', 'admin');


-- -----------------------------------------------------
-- 2. TABELA: profiles
--    Cada linha representa o perfil de um usuário.
--    O campo "id" é o mesmo id gerado pelo Supabase Auth
--    quando o usuário se cadastra — os dois ficam ligados.
-- -----------------------------------------------------
CREATE TABLE profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- ↑ chave primária ligada ao usuário da autenticação;
  --   se o usuário for deletado, o perfil some junto (CASCADE)

  name        TEXT,
  -- ↑ nome completo do usuário

  email       TEXT        UNIQUE,
  -- ↑ e-mail único (não pode ter dois perfis com o mesmo e-mail)

  role        user_role   NOT NULL DEFAULT 'user',
  -- ↑ papel do usuário; quem se cadastra começa como 'user'

  avatar_url  TEXT,
  -- ↑ link para a foto de perfil (opcional)

  bio         TEXT,
  -- ↑ texto de apresentação (opcional)

  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- ↑ data/hora de criação (preenchida automaticamente)

  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- ↑ data/hora da última atualização (atualizada pelo trigger abaixo)
);


-- -----------------------------------------------------
-- 3. SEGURANÇA: Row Level Security (RLS)
--    Garante que cada usuário só acesse os próprios dados.
--    O backend usa a SERVICE_KEY que bypassa o RLS,
--    mas é boa prática ativar para proteger acessos diretos.
-- -----------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política: usuário vê apenas o próprio perfil
CREATE POLICY "usuario vê proprio perfil"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Política: usuário atualiza apenas o próprio perfil
CREATE POLICY "usuario atualiza proprio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Política: admin vê todos os perfis
CREATE POLICY "admin vê todos os perfis"
  ON profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- -----------------------------------------------------
-- 4. FUNÇÃO + TRIGGER: cria perfil automaticamente
--    Quando um novo usuário se registra no Supabase Auth,
--    este trigger cria automaticamente a linha na tabela
--    profiles com os dados básicos.
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',  -- nome passado no cadastro
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que dispara a função acima após cada novo usuário criado
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- -----------------------------------------------------
-- 5. FUNÇÃO + TRIGGER: atualiza o campo updated_at
--    Toda vez que um perfil for alterado, o updated_at
--    é atualizado automaticamente para o horário atual.
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
