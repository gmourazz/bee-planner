import { Request, Response } from 'express'
import { supabase } from '../config/supabase'

const DEFAULT_MENU: Record<string, boolean> = {
  home: true, dashboard: true, week: true, habits: true,
  dates: true, notes: true, books: true, courses: true,
  university: true, finance: true, health: true, goals: true,
}

const DEFAULT_NOTIF: Record<string, boolean> = {
  tasks: true, habits: true, exams: true, birthdays: true, certificates: true,
}

export async function getSettings(req: Request, res: Response) {
  const userId = (req as any).user.id

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) return res.status(500).json({ error: error.message })

  // Retorna configurações existentes ou padrão
  if (!data) {
    return res.json({ menu_visibility: DEFAULT_MENU, notifications: DEFAULT_NOTIF })
  }

  return res.json({
    menu_visibility: data.menu_visibility ?? DEFAULT_MENU,
    notifications:   data.notifications   ?? DEFAULT_NOTIF,
  })
}

export async function saveSettings(req: Request, res: Response) {
  const userId = (req as any).user.id
  const { menu_visibility, notifications } = req.body

  const payload: Record<string, unknown> = { user_id: userId, updated_at: new Date().toISOString() }
  if (menu_visibility !== undefined) payload.menu_visibility = menu_visibility
  if (notifications   !== undefined) payload.notifications   = notifications

  const { data, error } = await supabase
    .from('user_settings')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  return res.json({
    menu_visibility: data.menu_visibility ?? DEFAULT_MENU,
    notifications:   data.notifications   ?? DEFAULT_NOTIF,
  })
}

export async function deleteAccount(req: Request, res: Response) {
  const userId = (req as any).user.id

  // Remove o usuário via Admin API do Supabase (requer SERVICE_KEY)
  const { error } = await supabase.auth.admin.deleteUser(userId)
  if (error) return res.status(500).json({ error: error.message })

  return res.status(204).send()
}
