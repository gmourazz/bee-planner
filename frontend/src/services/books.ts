import { supabase } from '../lib/supabase'
import { compressImage } from '../utils/image.utils'
import type { Book, BookStatus } from '../types/book.types'

function mapBook(row: any): Book {
  return {
    id:         row.id,
    title:      row.title,
    author:     row.author,
    rating:     row.rating,
    review:     row.review,
    genre:      row.genres ?? [],
    colorIdx:   row.color_idx,
    coverUrl:   row.cover_url ?? null,
    created_at: row.created_at,
    startedAt:  row.started_at ?? null,
    finishedAt: row.finished_at ?? null,
    isManga:    row.is_manga ?? false,
    status:     (row.status as BookStatus) ?? 'lido',
  }
}

export async function fetchBooks(): Promise<Book[]> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Não autenticado')

  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(mapBook)
}

export async function uploadBookCover(file: File, bookId: string): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Não autenticado')

  const compressed = await compressImage(file, 600, 0.85)
  const path = `${session.user.id}/${bookId}.jpg`

  const { error } = await supabase.storage
    .from('book-covers')
    .upload(path, compressed, { upsert: true, contentType: 'image/jpeg' })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from('book-covers').getPublicUrl(path)
  return data.publicUrl
}

export async function createBook(
  title: string,
  author: string,
  rating: number,
  review: string,
  genre: string[],
  colorIdx: number,
  coverFile?: File | null,
  startedAt?: string | null,
  finishedAt?: string | null,
  isManga?: boolean,
  status?: BookStatus,
): Promise<Book> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Não autenticado')

  const { data, error } = await supabase
    .from('books')
    .insert({
      user_id:     session.user.id,
      title:       title.trim(),
      author:      author.trim(),
      rating,
      review,
      genres:      genre,
      color_idx:   colorIdx,
      started_at:  startedAt  || null,
      finished_at: finishedAt || null,
      is_manga:    isManga ?? false,
      status:      status ?? 'lido',
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  let coverUrl: string | null = null
  if (coverFile) {
    coverUrl = await uploadBookCover(coverFile, data.id)
    await supabase.from('books').update({ cover_url: coverUrl }).eq('id', data.id)
  }

  return mapBook({ ...data, cover_url: coverUrl })
}

export async function updateBook(
  id: string,
  changes: Partial<Pick<Book, 'title' | 'author' | 'rating' | 'review' | 'genre' | 'colorIdx' | 'startedAt' | 'finishedAt' | 'isManga' | 'status'>>,
  coverFile?: File | null,
): Promise<Book> {
  const updates: Record<string, unknown> = {}
  if (changes.title      !== undefined) updates.title        = changes.title.trim()
  if (changes.author     !== undefined) updates.author       = changes.author.trim()
  if (changes.rating     !== undefined) updates.rating       = changes.rating
  if (changes.review     !== undefined) updates.review       = changes.review
  if (changes.genre      !== undefined) updates.genres       = changes.genre
  if (changes.colorIdx   !== undefined) updates.color_idx    = changes.colorIdx
  if (changes.startedAt  !== undefined) updates.started_at   = changes.startedAt  || null
  if (changes.finishedAt !== undefined) updates.finished_at  = changes.finishedAt || null
  if (changes.isManga    !== undefined) updates.is_manga     = changes.isManga
  if (changes.status     !== undefined) updates.status       = changes.status

  const { data, error } = await supabase
    .from('books')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  let coverUrl = data.cover_url ?? null
  if (coverFile) {
    coverUrl = await uploadBookCover(coverFile, id)
    await supabase.from('books').update({ cover_url: coverUrl }).eq('id', id)
  }

  return mapBook({ ...data, cover_url: coverUrl })
}

export async function deleteBook(id: string): Promise<void> {
  const { error } = await supabase.from('books').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
