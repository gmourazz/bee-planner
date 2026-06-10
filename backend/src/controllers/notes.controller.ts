import { Request, Response } from 'express'
import { supabase } from '../config/supabase'

// GET /api/notes
// Retorna todas as notas do usuário, ordenadas: fixadas primeiro, depois por data
export const listarNotas = async (req: Request, res: Response) => {
  const userId = req.user!.id

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json({ notes: data ?? [] })
}

// POST /api/notes
// Cria uma nova nota. Body: { title, content?, category?, color?, isPinned? }
export const criarNota = async (req: Request, res: Response) => {
  const userId = req.user!.id
  const { title, content, category, color, isPinned } = req.body

  if (!title?.trim()) {
    return res.status(400).json({ error: 'O título da nota é obrigatório' })
  }

  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id:   userId,
      title:     title.trim(),
      content:   content ?? '',
      category:  category ?? 'Pessoal',
      color:     color ?? '#FCD34D',
      is_pinned: isPinned ?? false,
    })
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  return res.status(201).json({ note: data })
}

// PUT /api/notes/:id
// Edita título, conteúdo, categoria, cor ou pin. Body: campos a atualizar
export const editarNota = async (req: Request, res: Response) => {
  const userId = req.user!.id
  const noteId = req.params.id
  const { title, content, category, color, isPinned } = req.body

  const updates: Record<string, unknown> = {}
  if (title     !== undefined) updates.title     = title.trim()
  if (content   !== undefined) updates.content   = content
  if (category  !== undefined) updates.category  = category
  if (color     !== undefined) updates.color     = color
  if (isPinned  !== undefined) updates.is_pinned = isPinned

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'Nenhum campo para atualizar' })
  }

  const { data, error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', noteId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })
  if (!data)  return res.status(404).json({ error: 'Nota não encontrada' })

  return res.status(200).json({ note: data })
}

// DELETE /api/notes/:id
// Remove a nota do usuário
export const deletarNota = async (req: Request, res: Response) => {
  const userId = req.user!.id
  const noteId = req.params.id

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', userId)

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json({ message: 'Nota removida com sucesso' })
}

// PATCH /api/notes/:id/pin
// Alterna o pin da nota. Body: { isPinned: boolean }
export const togglePin = async (req: Request, res: Response) => {
  const userId  = req.user!.id
  const noteId  = req.params.id
  const { isPinned } = req.body

  if (typeof isPinned !== 'boolean') {
    return res.status(400).json({ error: 'O campo "isPinned" (boolean) é obrigatório' })
  }

  const { data, error } = await supabase
    .from('notes')
    .update({ is_pinned: isPinned })
    .eq('id', noteId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })
  if (!data)  return res.status(404).json({ error: 'Nota não encontrada' })

  return res.status(200).json({ isPinned: data.is_pinned })
}
