import { Request, Response } from 'express'
import { supabase } from '../config/supabase'

export async function listarMetas(req: Request, res: Response) {
  const userId = (req as any).user.id
  const { scope, year, month } = req.query

  let query = supabase.from('goals').select('*').eq('user_id', userId).order('created_at')

  if (scope)  query = query.eq('scope', scope as string)
  if (year)   query = query.eq('year',  Number(year))
  if (month !== undefined && month !== '') query = query.eq('month', Number(month))

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
}

export async function criarMeta(req: Request, res: Response) {
  const userId = (req as any).user.id
  const { title, description, target, current, unit, color, category, scope, year, month, deadline } = req.body

  if (!title?.trim()) return res.status(400).json({ error: 'Título obrigatório' })
  if (!['annual', 'monthly'].includes(scope)) return res.status(400).json({ error: 'Escopo inválido' })

  const { data, error } = await supabase
    .from('goals')
    .insert({
      user_id: userId, title: title.trim(), description: description?.trim() ?? '',
      target: target ?? 0, current: current ?? 0, unit: unit?.trim() || '',
      color, category, scope, year, month: month ?? null, deadline: deadline || null,
    })
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  return res.status(201).json(data)
}

export async function editarMeta(req: Request, res: Response) {
  const userId = (req as any).user.id
  const { id } = req.params
  const { title, description, target, current, unit, color, category, deadline } = req.body

  const updates: Record<string, unknown> = {}
  if (title       !== undefined) updates.title       = title.trim()
  if (description !== undefined) updates.description = description.trim()
  if (target      !== undefined) updates.target      = target
  if (current     !== undefined) updates.current     = current
  if (unit        !== undefined) updates.unit        = unit
  if (color       !== undefined) updates.color       = color
  if (category    !== undefined) updates.category    = category
  if (deadline    !== undefined) updates.deadline    = deadline || null

  const { data, error } = await supabase
    .from('goals').update(updates).eq('id', id).eq('user_id', userId).select().single()
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
}

export async function atualizarProgresso(req: Request, res: Response) {
  const userId = (req as any).user.id
  const { id } = req.params
  const { current } = req.body

  if (current === undefined) return res.status(400).json({ error: 'Campo current obrigatório' })

  const { data, error } = await supabase
    .from('goals')
    .update({ current })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
}

export async function deletarMeta(req: Request, res: Response) {
  const userId = (req as any).user.id
  const { id } = req.params
  const { error } = await supabase.from('goals').delete().eq('id', id).eq('user_id', userId)
  if (error) return res.status(500).json({ error: error.message })
  return res.status(204).send()
}
