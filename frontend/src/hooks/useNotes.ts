import { useState, useEffect, useCallback } from 'react'
import { fetchNotes, createNote, updateNote, deleteNote, toggleNotePin } from '../services/notes'
import type { Note } from '../types/note.types'
import { useToast } from '../components/Toast'

const NOTE_COLORS = ['#FCD34D', '#F472B6', '#A855F7', '#10B981', '#3B82F6', '#F97316', '#EF4444']

const formInicial = { title: '', content: '', category: 'Pessoal', color: NOTE_COLORS[0], isPinned: false }

export function useNotes() {
  const { toast } = useToast()

  const [notes,    setNotes]   = useState<Note[]>([])
  const [loading,  setLoading] = useState(true)
  const [error,    setError]   = useState<string | null>(null)
  const [showAdd,  setShowAdd] = useState(false)
  const [saving,   setSaving]  = useState(false)
  const [form,     setForm]    = useState(formInicial)

  const carregarNotas = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchNotes()
      setNotes(data)
    } catch (e: any) {
      setError(e.message ?? 'Erro ao carregar notas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregarNotas() }, [carregarNotas])

  const addNote = async () => {
    if (saving) return
    setSaving(true)
    try {
      const nota = await createNote(form.title, form.content, form.category, form.color, form.isPinned)
      setNotes(prev => [nota, ...prev])
      setForm(formInicial)
      setShowAdd(false)
      toast('Nota criada!', `"${nota.title}" foi adicionada com sucesso.`)
    } catch {
      toast('Erro ao criar nota', 'Não foi possível salvar a nota.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const removeNote = async (id: string) => {
    const titulo = notes.find(n => n.id === id)?.title ?? 'Nota'
    setNotes(prev => prev.filter(n => n.id !== id))
    try {
      await deleteNote(id)
      toast('Nota removida', `"${titulo}" foi excluída.`, 'info')
    } catch {
      carregarNotas()
      toast('Erro ao remover', 'Não foi possível excluir a nota.', 'error')
    }
  }

  const pinNote = async (id: string) => {
    const nota = notes.find(n => n.id === id)
    if (!nota) return
    const novoPin = !nota.isPinned
    setNotes(prev => prev.map(n => n.id === id ? { ...n, isPinned: novoPin } : n))
    try {
      await toggleNotePin(id, novoPin)
    } catch {
      setNotes(prev => prev.map(n => n.id === id ? { ...n, isPinned: nota.isPinned } : n))
    }
  }

  const editNote = async (id: string, changes: Partial<Pick<Note, 'title' | 'content' | 'category' | 'color' | 'isPinned'>>) => {
    try {
      const atualizada = await updateNote(id, changes)
      setNotes(prev => prev.map(n => n.id === id ? atualizada : n))
    } catch {
      toast('Erro ao salvar', 'Não foi possível atualizar a nota.', 'error')
    }
  }

  return {
    notes, loading, error,
    showAdd, setShowAdd,
    saving, form, setForm,
    NOTE_COLORS,
    carregarNotas,
    addNote, removeNote, pinNote, editNote,
  }
}
