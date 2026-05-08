import { Request, Response } from 'express'
import { supabase } from '../config/supabase'

// ──────────────────────────────────────────────────────────
// GET /api/profile/me
// Retorna o perfil do usuário que está logado no momento.
// ──────────────────────────────────────────────────────────
export const getMyProfile = async (req: Request, res: Response) => {
  // req.user vem do middleware de autenticação (auth.middleware.ts)
  const userId = req.user!.id

  const { data, error } = await supabase
    .from('profiles')
    .select('*')       // pega todos os campos do perfil
    .eq('id', userId)  // filtra pelo id do usuário logado
    .single()          // retorna um único objeto, não um array

  if (error) {
    return res.status(404).json({ error: 'Perfil não encontrado' })
  }

  return res.status(200).json({ profile: data })
}

// ──────────────────────────────────────────────────────────
// PUT /api/profile/me
// Atualiza os dados do perfil do usuário logado.
// Campos permitidos: name, phone, avatar_url, bio
// O campo "role" NÃO pode ser alterado pelo próprio usuário.
// ──────────────────────────────────────────────────────────
export const updateMyProfile = async (req: Request, res: Response) => {
  const userId = req.user!.id

  // Extrai apenas os campos que o usuário tem permissão de alterar
  const { name, phone, avatar_url, bio } = req.body

  // Monta o objeto de atualização apenas com os campos enviados
  const updates: Record<string, unknown> = {}
  if (name       !== undefined) updates.name       = name
  if (phone      !== undefined) updates.phone      = phone
  if (avatar_url !== undefined) updates.avatar_url = avatar_url
  if (bio        !== undefined) updates.bio        = bio

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'Nenhum campo para atualizar foi enviado' })
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)  // garante que só atualiza o próprio perfil
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  return res.status(200).json({ profile: data })
}

// ──────────────────────────────────────────────────────────
// GET /api/profile/all  [somente admin]
// Retorna a lista de todos os usuários cadastrados.
// ──────────────────────────────────────────────────────────
export const getAllProfiles = async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, role, avatar_url, created_at')
    .order('created_at', { ascending: false }) // mais recentes primeiro

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  return res.status(200).json({ profiles: data })
}

// ──────────────────────────────────────────────────────────
// PUT /api/profile/:id/role  [somente admin]
// Altera o papel (role) de qualquer usuário.
// Exemplo: promover para 'pro' ou 'admin'.
// ──────────────────────────────────────────────────────────
export const updateUserRole = async (req: Request, res: Response) => {
  const { id } = req.params  // id do usuário alvo (da URL)
  const { role } = req.body  // novo papel enviado no corpo da requisição

  // Valida se o papel enviado é um dos valores permitidos
  const rolesPermitidos = ['user', 'pro', 'admin']
  if (!rolesPermitidos.includes(role)) {
    return res.status(400).json({
      error: `Role inválido. Use: ${rolesPermitidos.join(', ')}`
    })
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  return res.status(200).json({ profile: data })
}
