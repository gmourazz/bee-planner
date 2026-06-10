import { Request, Response } from 'express'
import { supabase } from '../config/supabase'

// ── Matérias ──────────────────────────────────────────────────────────────────

export async function listarMaterias(req: Request, res: Response) {
  const userId = (req as any).user.id
  const { data, error } = await supabase
    .from('uni_subjects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at')
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
}

export async function criarMateria(req: Request, res: Response) {
  const userId = (req as any).user.id
  const { name, professor, credits, grade, attendance, absences, max_absences, subject_status, start_date, end_date, color_idx, icon, semester } = req.body
  if (!name?.trim()) return res.status(400).json({ error: 'Nome obrigatório' })

  const { data, error } = await supabase
    .from('uni_subjects')
    .insert({ user_id: userId, name: name.trim(), professor, credits, grade, attendance, absences: absences ?? 0, max_absences: max_absences ?? 0, subject_status: subject_status ?? 'open', start_date: start_date ?? null, end_date: end_date ?? null, color_idx, icon, semester })
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  return res.status(201).json(data)
}

export async function editarMateria(req: Request, res: Response) {
  const userId = (req as any).user.id
  const { id } = req.params
  const { name, professor, credits, grade, attendance, absences, max_absences, subject_status, start_date, end_date, color_idx, icon, semester } = req.body

  const updates: Record<string, unknown> = {}
  if (name           !== undefined) updates.name           = name.trim()
  if (professor      !== undefined) updates.professor      = professor
  if (credits        !== undefined) updates.credits        = credits
  if (grade          !== undefined) updates.grade          = grade
  if (attendance     !== undefined) updates.attendance     = attendance
  if (absences       !== undefined) updates.absences       = absences
  if (max_absences   !== undefined) updates.max_absences   = max_absences
  if (subject_status !== undefined) updates.subject_status = subject_status
  if (start_date     !== undefined) updates.start_date     = start_date ?? null
  if (end_date       !== undefined) updates.end_date       = end_date ?? null
  if (color_idx      !== undefined) updates.color_idx      = color_idx
  if (icon           !== undefined) updates.icon           = icon
  if (semester       !== undefined) updates.semester       = semester

  const { data, error } = await supabase
    .from('uni_subjects')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
}

export async function deletarMateria(req: Request, res: Response) {
  const userId = (req as any).user.id
  const { id } = req.params
  const { error } = await supabase.from('uni_subjects').delete().eq('id', id).eq('user_id', userId)
  if (error) return res.status(500).json({ error: error.message })
  return res.status(204).send()
}

// ── Grade horária ─────────────────────────────────────────────────────────────

export async function listarGrade(req: Request, res: Response) {
  const userId = (req as any).user.id
  const { data, error } = await supabase
    .from('uni_schedule')
    .select('*')
    .eq('user_id', userId)
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
}

export async function criarAula(req: Request, res: Response) {
  const userId = (req as any).user.id
  const { subject_name, room, day_of_week, time_start, color_idx, semester } = req.body
  if (!subject_name?.trim()) return res.status(400).json({ error: 'Nome da matéria obrigatório' })

  const { data, error } = await supabase
    .from('uni_schedule')
    .insert({ user_id: userId, subject_name: subject_name.trim(), room, day_of_week, time_start, color_idx, semester })
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  return res.status(201).json(data)
}

export async function deletarAula(req: Request, res: Response) {
  const userId = (req as any).user.id
  const { id } = req.params
  const { error } = await supabase.from('uni_schedule').delete().eq('id', id).eq('user_id', userId)
  if (error) return res.status(500).json({ error: error.message })
  return res.status(204).send()
}

// ── Provas ────────────────────────────────────────────────────────────────────

export async function listarProvas(req: Request, res: Response) {
  const userId = (req as any).user.id
  const { data, error } = await supabase
    .from('uni_exams')
    .select('*')
    .eq('user_id', userId)
    .order('exam_date')
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
}

export async function criarProva(req: Request, res: Response) {
  const userId = (req as any).user.id
  const { subject, exam_date, type, description, status } = req.body
  if (!subject?.trim() || !exam_date) return res.status(400).json({ error: 'Matéria e data obrigatórias' })

  const { data, error } = await supabase
    .from('uni_exams')
    .insert({ user_id: userId, subject: subject.trim(), exam_date, type, description, status: status ?? 'pending' })
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  return res.status(201).json(data)
}

export async function toggleProva(req: Request, res: Response) {
  const userId = (req as any).user.id
  const { id } = req.params
  const { status } = req.body
  if (!['pending', 'done'].includes(status)) return res.status(400).json({ error: 'Status inválido' })

  const { data, error } = await supabase
    .from('uni_exams')
    .update({ status })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
}

export async function deletarProva(req: Request, res: Response) {
  const userId = (req as any).user.id
  const { id } = req.params
  const { error } = await supabase.from('uni_exams').delete().eq('id', id).eq('user_id', userId)
  if (error) return res.status(500).json({ error: error.message })
  return res.status(204).send()
}
