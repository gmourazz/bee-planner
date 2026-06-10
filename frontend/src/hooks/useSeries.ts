import { useState, useEffect, useCallback } from 'react'
import { fetchSeries, createSeries, updateSeries, deleteSeries } from '../services/series'
import type { Series, SeriesStatus, SeriesType } from '../types/series.types'
import { useToast } from '../components/Toast'

const formInicial = {
  title:        '',
  synopsis:     '',
  type:         'serie' as SeriesType,
  genres:       [] as string[],
  platform:     '',
  rating:       5,
  review:       '',
  seasons:      '' as string,
  episodes:     '' as string,
  colorIdx:     0,
  coverMode:    'color' as 'color' | 'photo',
  coverFile:    null as File | null,
  coverPreview: null as string | null,
  startedAt:    '' as string,
  finishedAt:   '' as string,
  status:       'quero_assistir' as SeriesStatus,
  favorite:     false,
}

export function useSeries() {
  const { toast } = useToast()

  const [series,      setSeries]      = useState<Series[]>([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)
  const [showAdd,     setShowAdd]     = useState(false)
  const [editingItem, setEditingItem] = useState<Series | null>(null)
  const [saving,      setSaving]      = useState(false)
  const [form,        setForm]        = useState(formInicial)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchSeries()
      setSeries(data)
    } catch (e: any) {
      setError(e.message ?? 'Erro ao carregar')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const setCoverFile = (file: File | null) => {
    if (!file) { setForm(f => ({ ...f, coverFile: null, coverPreview: null })); return }
    setForm(f => ({ ...f, coverFile: file, coverPreview: URL.createObjectURL(file) }))
  }

  const openAdd = (statusInicial?: SeriesStatus) => {
    setEditingItem(null)
    setForm({ ...formInicial, status: statusInicial ?? 'quero_assistir' })
    setShowAdd(true)
  }

  const closeModal = () => {
    setEditingItem(null)
    setForm(formInicial)
    setShowAdd(false)
  }

  const openEdit = (item: Series) => {
    setEditingItem(item)
    setForm({
      title:        item.title,
      synopsis:     item.synopsis,
      type:         item.type,
      genres:       item.genre,
      platform:     item.platform,
      rating:       item.rating,
      review:       item.review,
      seasons:      item.seasons != null ? String(item.seasons) : '',
      episodes:     item.episodes != null ? String(item.episodes) : '',
      colorIdx:     item.colorIdx,
      coverMode:    item.coverUrl ? 'photo' : 'color',
      coverFile:    null,
      coverPreview: item.coverUrl,
      startedAt:    item.startedAt  ?? '',
      finishedAt:   item.finishedAt ?? '',
      status:       item.status,
      favorite:     item.favorite,
    })
    setShowAdd(true)
  }

  const save = async () => {
    if (!form.title.trim() || saving) return
    setSaving(true)
    try {
      const coverFile = form.coverMode === 'photo' ? form.coverFile : null
      const seasons   = form.seasons  ? Number(form.seasons)  : null
      const episodes  = form.episodes ? Number(form.episodes) : null

      if (editingItem) {
        const updated = await updateSeries(
          editingItem.id,
          {
            title: form.title, synopsis: form.synopsis, type: form.type,
            genre: form.genres, platform: form.platform, rating: form.rating,
            review: form.review, seasons, episodes, colorIdx: form.colorIdx,
            startedAt: form.startedAt || null, finishedAt: form.finishedAt || null,
            status: form.status, favorite: form.favorite,
          },
          coverFile,
        )
        setSeries(prev => prev.map(s => s.id === updated.id ? updated : s))
        toast('Atualizado!', `"${updated.title}" foi salvo.`)
      } else {
        const item = await createSeries(
          form.title, form.synopsis, form.type, form.genres, form.platform,
          form.rating, form.review, seasons, episodes, form.colorIdx, coverFile,
          form.startedAt || null, form.finishedAt || null, form.status, form.favorite,
        )
        setSeries(prev => [item, ...prev])
        toast('Adicionado!', `"${item.title}" foi registrado.`)
      }

      if (form.coverPreview && !form.coverPreview.startsWith('http')) URL.revokeObjectURL(form.coverPreview)
      setForm(formInicial)
      setEditingItem(null)
      setShowAdd(false)
    } catch {
      toast('Erro ao salvar', 'Não foi possível salvar.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    const titulo = series.find(s => s.id === id)?.title ?? ''
    setSeries(prev => prev.filter(s => s.id !== id))
    try {
      await deleteSeries(id)
      toast('Removido', `"${titulo}" foi excluído.`, 'info')
    } catch {
      carregar()
      toast('Erro ao remover', 'Não foi possível excluir.', 'error')
    }
  }

  return {
    series, loading, error,
    showAdd, openAdd, closeModal,
    editingItem, openEdit,
    saving, form, setForm, setCoverFile,
    carregar, save, remove,
  }
}
