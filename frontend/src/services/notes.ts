import { supabase } from '../lib/supabase'
import type { Note } from '../types/note.types'

// Converte o formato do banco (snake_case) para o tipo Note (camelCase)
function mapNote(row: any): Note {
  return {
    id:         row.id,
    title:      row.title,
    content:    row.content,
    category:   row.category,
    color:      row.color,
    isPinned:   row.is_pinned,
    created_at: row.created_at,
  }
}

export async function fetchNotes(): Promise<Note[]> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Não autenticado')

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', session.user.id)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(mapNote)
}

export async function createNote(
  title: string,
  content: string,
  category: string,
  color: string,
  isPinned: boolean,
): Promise<Note> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Não autenticado')

  const { data, error } = await supabase
    .from('notes')
    .insert({ user_id: session.user.id, title: title.trim(), content, category, color, is_pinned: isPinned })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return mapNote(data)
}

export async function updateNote(id: string, changes: Partial<Pick<Note, 'title' | 'content' | 'category' | 'color' | 'isPinned'>>): Promise<Note> {
  const updates: Record<string, unknown> = {}
  if (changes.title    !== undefined) updates.title     = changes.title.trim()
  if (changes.content  !== undefined) updates.content   = changes.content
  if (changes.category !== undefined) updates.category  = changes.category
  if (changes.color    !== undefined) updates.color     = changes.color
  if (changes.isPinned !== undefined) updates.is_pinned = changes.isPinned

  const { data, error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return mapNote(data)
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase.from('notes').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function toggleNotePin(id: string, isPinned: boolean): Promise<void> {
  const { error } = await supabase.from('notes').update({ is_pinned: isPinned }).eq('id', id)
  if (error) throw new Error(error.message)
}
