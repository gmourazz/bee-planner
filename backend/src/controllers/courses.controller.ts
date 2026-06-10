import { Request, Response } from 'express'
import { supabase } from '../config/supabase'

export async function listarCursos(req: Request, res: Response) {
  const userId = (req as any).user.id
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
}

export async function criarCurso(req: Request, res: Response) {
  const userId = (req as any).user.id
  const { title, platform, duration, progress, status, start_date, end_date, certificate, certificate_expiry, credential } = req.body
  if (!title?.trim()) return res.status(400).json({ error: 'Título obrigatório' })

  const { data, error } = await supabase
    .from('courses')
    .insert({ user_id: userId, title: title.trim(), platform, duration, progress, status, start_date, end_date, certificate, certificate_expiry, credential })
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  return res.status(201).json(data)
}

export async function editarCurso(req: Request, res: Response) {
  const userId = (req as any).user.id
  const { id } = req.params
  const { title, platform, duration, progress, status, start_date, end_date, certificate, certificate_expiry, credential } = req.body

  const updates: Record<string, unknown> = {}
  if (title             !== undefined) updates.title              = title.trim()
  if (platform          !== undefined) updates.platform           = platform
  if (duration          !== undefined) updates.duration           = duration
  if (progress          !== undefined) updates.progress           = progress
  if (status            !== undefined) updates.status             = status
  if (start_date        !== undefined) updates.start_date         = start_date
  if (end_date          !== undefined) updates.end_date           = end_date
  if (certificate       !== undefined) updates.certificate        = certificate
  if (certificate_expiry !== undefined) updates.certificate_expiry = certificate_expiry
  if (credential        !== undefined) updates.credential         = credential

  const { data, error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
}

export async function deletarCurso(req: Request, res: Response) {
  const userId = (req as any).user.id
  const { id } = req.params
  const { error } = await supabase.from('courses').delete().eq('id', id).eq('user_id', userId)
  if (error) return res.status(500).json({ error: error.message })
  return res.status(204).send()
}
