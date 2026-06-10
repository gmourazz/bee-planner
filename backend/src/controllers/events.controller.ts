import { Request, Response } from 'express'
import { supabase } from '../config/supabase'

// Lista todos os eventos do usuário autenticado
export async function listarEventos(req: Request, res: Response) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', req.user!.id)
    .order('date', { ascending: true })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

// Cria um novo evento
export async function criarEvento(req: Request, res: Response) {
  const { title, date, type, description } = req.body

  if (!title?.trim() || !date) {
    return res.status(400).json({ error: 'Título e data são obrigatórios' })
  }

  const { data, error } = await supabase
    .from('events')
    .insert({
      user_id: req.user!.id,
      title: title.trim(),
      date,
      type: type || 'Pessoal',
      description: description?.trim() || null,
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
}

// Atualiza um evento existente
export async function editarEvento(req: Request, res: Response) {
  const { id } = req.params
  const { title, date, type, description } = req.body

  const { data, error } = await supabase
    .from('events')
    .update({ title, date, type, description })
    .eq('id', id)
    .eq('user_id', req.user!.id)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  if (!data) return res.status(404).json({ error: 'Evento não encontrado' })
  res.json(data)
}

// Remove um evento
export async function deletarEvento(req: Request, res: Response) {
  const { id } = req.params

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)
    .eq('user_id', req.user!.id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ ok: true })
}
