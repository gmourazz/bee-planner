import { useState, useEffect, useCallback } from 'react'
import { fetchBooks, createBook, updateBook, deleteBook } from '../services/books'
import type { Book } from '../types/book.types'
import { useToast } from '../components/Toast'

const formInicial = {
  title: '', author: '', rating: 5, review: '',
  genres: [] as string[], colorIdx: 0,
  coverMode: 'color' as 'color' | 'photo',
  coverFile: null as File | null,
  coverPreview: null as string | null,
  startedAt: '' as string,
  finishedAt: '' as string,
  isManga: false,
}

export function useBooks() {
  const { toast } = useToast()

  const [books,       setBooks]       = useState<Book[]>([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)
  const [showAdd,     setShowAdd]     = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [saving,      setSaving]      = useState(false)
  const [form,        setForm]        = useState(formInicial)
  const [metaAnual,   setMetaAnual]   = useState(24)
  const [filtroMes,   setFiltroMes]   = useState<number | null>(null)

  const carregarLivros = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchBooks()
      setBooks(data)
    } catch (e: any) {
      setError(e.message ?? 'Erro ao carregar livros')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregarLivros() }, [carregarLivros])

  const setCoverFile = (file: File | null) => {
    if (!file) {
      setForm(f => ({ ...f, coverFile: null, coverPreview: null }))
      return
    }
    const preview = URL.createObjectURL(file)
    setForm(f => ({ ...f, coverFile: file, coverPreview: preview }))
  }

  const openAdd = () => {
    setEditingBook(null)
    setForm(formInicial)
    setShowAdd(true)
  }

  const closeModal = () => {
    setEditingBook(null)
    setForm(formInicial)
    setShowAdd(false)
  }

  const openEdit = (book: Book) => {
    setEditingBook(book)
    setForm({
      title: book.title, author: book.author, rating: book.rating,
      review: book.review, genres: book.genre, colorIdx: book.colorIdx,
      coverMode: book.coverUrl ? 'photo' : 'color',
      coverFile: null,
      coverPreview: book.coverUrl,
      startedAt:  book.startedAt  ?? '',
      finishedAt: book.finishedAt ?? '',
      isManga:    book.isManga ?? false,
    })
    setShowAdd(true)
  }

  const addBook = async () => {
    if (!form.title.trim() || !form.author.trim() || saving) return
    setSaving(true)
    try {
      const coverFile = form.coverMode === 'photo' ? form.coverFile : null

      if (editingBook) {
        const atualizado = await updateBook(
          editingBook.id,
          { title: form.title, author: form.author, rating: form.rating, review: form.review, genre: form.genres, colorIdx: form.colorIdx, startedAt: form.startedAt || null, finishedAt: form.finishedAt || null, isManga: form.isManga },
          coverFile,
        )
        setBooks(prev => prev.map(b => b.id === atualizado.id ? atualizado : b))
        toast('Livro atualizado!', `"${atualizado.title}" foi salvo.`)
      } else {
        const livro = await createBook(form.title, form.author, form.rating, form.review, form.genres, form.colorIdx, coverFile, form.startedAt || null, form.finishedAt || null, form.isManga)
        setBooks(prev => [livro, ...prev])
        toast('Livro adicionado!', `"${livro.title}" foi registrado com sucesso.`)
      }

      if (form.coverPreview && !form.coverPreview.startsWith('http')) URL.revokeObjectURL(form.coverPreview)
      setForm(formInicial)
      setEditingBook(null)
      setShowAdd(false)
    } catch {
      toast('Erro ao salvar', 'Não foi possível salvar o livro.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const removeBook = async (id: string) => {
    const titulo = books.find(b => b.id === id)?.title ?? 'Livro'
    setBooks(prev => prev.filter(b => b.id !== id))
    try {
      await deleteBook(id)
      toast('Livro removido', `"${titulo}" foi excluído.`, 'info')
    } catch {
      carregarLivros()
      toast('Erro ao remover', 'Não foi possível excluir o livro.', 'error')
    }
  }

  return {
    books, loading, error,
    showAdd, openAdd, closeModal,
    editingBook, openEdit,
    saving, form, setForm, setCoverFile,
    metaAnual, setMetaAnual,
    filtroMes, setFiltroMes,
    carregarLivros,
    addBook, removeBook,
  }
}
