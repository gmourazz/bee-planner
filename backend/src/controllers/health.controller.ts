import { Request, Response } from 'express'
import { supabase } from '../config/supabase'

export async function listarLogs(req: Request, res: Response) {
  const userId = (req as any).user.id
  const { since } = req.query
  const sinceDate = typeof since === 'string' ? since : undefined
  let query = supabase.from('health_logs').select('*').eq('user_id', userId).order('log_date')
  if (sinceDate) query = query.gte('log_date', sinceDate)
  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
}

export async function upsertLog(req: Request, res: Response) {
  const userId = (req as any).user.id
  const date = String(req.params.date)
  const { water, sleep, mood, exercises, steps } = req.body

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Data inválida (YYYY-MM-DD)' })
  }

  const updates: Record<string, unknown> = { user_id: userId, log_date: date }
  if (water     !== undefined) updates.water     = water
  if (sleep     !== undefined) updates.sleep     = sleep
  if (mood      !== undefined) updates.mood      = mood
  if (exercises !== undefined) updates.exercises = exercises
  if (steps     !== undefined) updates.steps     = steps

  const { data, error } = await supabase
    .from('health_logs')
    .upsert(updates, { onConflict: 'user_id,log_date' })
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
}
