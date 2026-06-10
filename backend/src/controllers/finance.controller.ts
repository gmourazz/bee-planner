import { Request, Response } from 'express'
import { supabase } from '../config/supabase'

export async function listarTransacoes(req: Request, res: Response) {
  const userId = (req as any).user.id
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
}

export async function criarTransacao(req: Request, res: Response) {
  const userId = (req as any).user.id
  const { description, amount, type, category, label, date, recurring } = req.body
  if (!description?.trim()) return res.status(400).json({ error: 'Descrição obrigatória' })
  if (!amount || amount <= 0)  return res.status(400).json({ error: 'Valor inválido' })
  if (!['income','expense'].includes(type)) return res.status(400).json({ error: 'Tipo inválido' })

  const { data, error } = await supabase
    .from('transactions')
    .insert({ user_id: userId, description: description.trim(), amount, type, category, label: label ?? '', date, recurring: recurring ?? false })
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  return res.status(201).json(data)
}

export async function editarTransacao(req: Request, res: Response) {
  const userId = (req as any).user.id
  const { id } = req.params
  const { description, amount, type, category, label, date, recurring } = req.body

  if (amount !== undefined && amount <= 0) return res.status(400).json({ error: 'Valor inválido' })
  if (type !== undefined && !['income','expense'].includes(type)) return res.status(400).json({ error: 'Tipo inválido' })

  const updates: Record<string, unknown> = {}
  if (description !== undefined) updates.description = description.trim()
  if (amount      !== undefined) updates.amount      = amount
  if (type        !== undefined) updates.type        = type
  if (category    !== undefined) updates.category    = category
  if (label       !== undefined) updates.label       = label
  if (date        !== undefined) updates.date        = date
  if (recurring   !== undefined) updates.recurring   = recurring

  const { data, error } = await supabase
    .from('transactions').update(updates).eq('id', id).eq('user_id', userId).select().single()
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
}

export async function deletarTransacao(req: Request, res: Response) {
  const userId = (req as any).user.id
  const { id } = req.params
  const { error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', userId)
  if (error) return res.status(500).json({ error: error.message })
  return res.status(204).send()
}
