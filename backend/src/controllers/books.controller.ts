import { Request, Response } from 'express'
import { supabase } from '../config/supabase'

// GET /api/books
// Retorna todos os livros do usuário, do mais recente ao mais antigo
export const listarLivros = async (req: Request, res: Response) => {
  const userId = req.user!.id

  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json({ books: data ?? [] })
}

// POST /api/books
// Cria um novo livro. Body: { title, author, rating, review?, genres?, colorIdx? }
export const criarLivro = async (req: Request, res: Response) => {
  const userId = req.user!.id
  const { title, author, rating, review, genres, colorIdx } = req.body

  if (!title?.trim()) return res.status(400).json({ error: 'O título é obrigatório' })
  if (!author?.trim()) return res.status(400).json({ error: 'O autor é obrigatório' })

  const { data, error } = await supabase
    .from('books')
    .insert({
      user_id:   userId,
      title:     title.trim(),
      author:    author.trim(),
      rating:    rating   ?? 5,
      review:    review   ?? '',
      genres:    genres   ?? [],
      color_idx: colorIdx ?? 0,
    })
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  return res.status(201).json({ book: data })
}

// DELETE /api/books/:id
// Remove o livro do usuário
export const deletarLivro = async (req: Request, res: Response) => {
  const userId = req.user!.id
  const bookId = req.params.id

  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', bookId)
    .eq('user_id', userId)

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json({ message: 'Livro removido com sucesso' })
}
