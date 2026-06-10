import { PlusCircle, Star, BookOpen, X, Check, Trash2, Loader2, Target, ImageIcon, Palette, LayoutGrid, List, Pencil, ChevronDown, ChevronUp, CalendarDays, EyeOff, Crop, ZoomIn, Search, Clock, Bookmark, Plus, CheckCircle, TrendingUp, Award, User, BarChart2, Library } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { DatePickerInput } from '../components/DatePickerInput'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { useTheme } from '../contexts/ThemeContext'
import { useBooks } from '../hooks/useBooks'
import type { Book, BookStatus } from '../types/book.types'
import { getCroppedImage } from '../utils/crop.utils'
import type { PixelCrop } from '../utils/crop.utils'

const GRADIENTS = [
  'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)',
  'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
  'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)',
  'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
  'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
]

const GENEROS = [
  'Autoajuda', 'Biografia', 'Ciência', 'Fantasia',
  'Ficção', 'Filosofia', 'História', 'HQ',
  'Negócios', 'Policial', 'Produtividade', 'Psicologia',
  'Romance', 'Saúde', 'Suspense', 'Tecnologia',
  'Terror', 'Universitário',
]

const STATUS_CONFIG: Record<BookStatus, { label: string; color: string; bg: string; Icon: LucideIcon }> = {
  lido:      { label: 'Lido',      color: '#059669', bg: '#d1fae5', Icon: CheckCircle },
  lendo:     { label: 'Lendo',     color: '#d97706', bg: '#fef3c7', Icon: Clock       },
  quero_ler: { label: 'Quero ler', color: '#7c3aed', bg: '#ede9fe', Icon: Bookmark    },
}

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function GeneroSelect({ selected, onChange, theme, extraGeneros = [], onAddGenero }: {
  selected: string[]
  onChange: (v: string[]) => void
  theme: any
  extraGeneros?: string[]
  onAddGenero?: (g: string) => void
}) {
  const [open,        setOpen]        = useState(false)
  const [novoGenero,  setNovoGenero]  = useState('')
  const [adicionando, setAdicionando] = useState(false)
  const [dropPos,     setDropPos]     = useState<React.CSSProperties>({})
  const wrapRef = useRef<HTMLDivElement>(null)
  const btnRef  = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false); setAdicionando(false)
      }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleOpen = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setDropPos({ top: r.bottom + 4, left: r.left, width: r.width })
    }
    setOpen(o => !o)
  }

  const toggle = (g: string) => {
    onChange(selected.includes(g) ? selected.filter(s => s !== g) : [...selected, g])
  }

  const confirmarNovoGenero = () => {
    const nome = novoGenero.trim()
    if (!nome) return
    onAddGenero?.(nome)
    onChange([...selected, nome])
    setNovoGenero('')
    setAdicionando(false)
  }

  const todosGeneros = [...GENEROS, ...extraGeneros]

  return (
    <div ref={wrapRef} className="relative w-full">
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center justify-between px-3 py-3 rounded-2xl text-sm text-left transition-all"
        style={{ background: theme.colors.primaryLight, color: theme.colors.text }}
      >
        <span className="truncate" style={{ color: selected.length === 0 ? theme.colors.textMuted : theme.colors.text }}>
          {selected.length === 0 ? 'Selecionar...' : selected.join(', ')}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform flex-shrink-0 ml-2 ${open ? 'rotate-180' : ''}`}
          style={{ color: theme.colors.textMuted }}
        />
      </button>

      {open && (
        <div
          className="fixed z-[9999] rounded-2xl shadow-xl overflow-hidden"
          style={{ ...dropPos, minWidth: 220, background: theme.colors.surface, border: `1px solid ${theme.colors.primary}20` }}
        >
          <div className="overflow-y-auto" style={{ maxHeight: '200px' }}>
            {todosGeneros.map(g => {
              const sel = selected.includes(g)
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggle(g)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all hover:opacity-80 text-left"
                  style={{ background: sel ? theme.colors.primaryLight : 'transparent', color: theme.colors.text }}
                >
                  <span>{g}</span>
                  {sel && <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: theme.colors.primary }} />}
                </button>
              )
            })}
          </div>
          {onAddGenero && (
            <div className="border-t px-3 py-2" style={{ borderColor: `${theme.colors.primary}15`, background: theme.colors.surface }}>
              {adicionando ? (
                <div className="flex gap-2 items-center">
                  <input
                    autoFocus
                    value={novoGenero}
                    onChange={e => setNovoGenero(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') confirmarNovoGenero(); if (e.key === 'Escape') setAdicionando(false) }}
                    placeholder="Nome do gênero"
                    className="flex-1 px-2 py-1 rounded-lg text-xs outline-none"
                    style={{ background: theme.colors.primaryLight, color: theme.colors.text }}
                  />
                  <button type="button" onClick={confirmarNovoGenero}
                    className="px-3 py-1 rounded-lg text-xs font-bold flex-shrink-0"
                    style={{ background: theme.colors.primary, color: '#fff' }}>OK</button>
                  <button type="button" onClick={() => setAdicionando(false)}
                    className="text-xs flex-shrink-0" style={{ color: theme.colors.textMuted }}>✕</button>
                </div>
              ) : (
                <button type="button" onClick={() => setAdicionando(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold w-full py-1 hover:opacity-70 transition-all"
                  style={{ color: theme.colors.primary }}>
                  <Plus className="w-3.5 h-3.5" /> Adicionar gênero
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BookCover({ book, gradients, className, onClick }: { book: Book; gradients: string[]; className?: string; onClick?: (e: React.MouseEvent) => void }) {
  const color = gradients[book.colorIdx] ?? gradients[0]
  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center ${className} ${onClick ? 'cursor-pointer' : ''}`}
      style={{ background: color }}
      onClick={onClick}
    >
      {book.coverUrl
        ? <img src={book.coverUrl} alt={book.title} className="absolute inset-0 w-full h-full object-cover" />
        : <BookOpen className="w-10 h-10 text-white opacity-80" />
      }
    </div>
  )
}

function StarRow({ rating, theme }: { rating: number; theme: any }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5"
          style={{ color: i < rating ? theme.colors.primary : theme.colors.primaryLight }}
          fill={i < rating ? theme.colors.primary : theme.colors.primaryLight}
        />
      ))}
    </div>
  )
}

function bookDias(book: Book): number | null {
  if (!book.startedAt || !book.finishedAt) return null
  return Math.max(0, Math.round(
    (new Date(book.finishedAt + 'T00:00').getTime() - new Date(book.startedAt + 'T00:00').getTime()) / 86400000
  ))
}

// Para "lendo": conta de startedAt até hoje; para "lido": usa bookDias
function diasAtivos(book: Book): number {
  if (book.status === 'lendo' && book.startedAt) {
    return Math.max(0, Math.round((Date.now() - new Date(book.startedAt + 'T00:00').getTime()) / 86400000))
  }
  return bookDias(book) ?? 0
}

function BookCard({ book, theme, gradients, onDelete, onEdit, onSelect }: {
  book: Book; theme: any; gradients: string[]
  onDelete: (id: string) => void
  onEdit: (book: Book) => void
  onSelect: (book: Book) => void
}) {
  const registradoEm = new Date(book.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
  const fmt = (d: string) => new Date(d + 'T00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  // Label e data dependem do status
  const dateInfo: { label: string; value: string } | null =
    book.status === 'quero_ler'
      ? null
      : book.status === 'lendo'
        ? book.startedAt
          ? { label: 'Iniciado', value: fmt(book.startedAt) }
          : null
        : book.startedAt
          ? { label: 'Iniciado', value: fmt(book.startedAt) }
          : null
  const dias = bookDias(book)

  return (
    <div
      className="rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer relative group"
      style={{ background: theme.colors.surface, boxShadow: `0 4px 24px ${theme.colors.primary}12` }}
      onClick={() => onSelect(book)}
    >
      <div className="absolute top-3 right-3 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
        <button onClick={e => { e.stopPropagation(); onEdit(book) }} className="p-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.40)' }}>
          <Pencil className="w-4 h-4 text-white" />
        </button>
        <button onClick={e => { e.stopPropagation(); onDelete(book.id) }} className="p-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.40)' }}>
          <Trash2 className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Badges: status + dias lado a lado */}
      <div className="absolute top-2 left-2 right-2 z-10 flex flex-row flex-wrap gap-1">
        {(() => {
          const cfg = STATUS_CONFIG[book.status]
          const Icon = cfg.Icon
          return (
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-0.5"
              style={{ background: cfg.bg, color: cfg.color }}>
              <Icon className="w-2.5 h-2.5 flex-shrink-0" />
              {cfg.label}
            </span>
          )
        })()}
        {dias !== null && (
          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white"
            style={{ background: 'rgba(0,0,0,0.45)' }}>
            {dias}d
          </span>
        )}
      </div>

      <BookCover
        book={book}
        gradients={gradients}
        className="h-32 w-full"
        onClick={book.coverUrl ? e => { e.stopPropagation(); window.open(book.coverUrl!, '_blank') } : undefined}
      />

      <div className="p-3">
        <h3 className="font-display mb-0.5 text-sm font-semibold leading-tight line-clamp-2" style={{ color: theme.colors.text }}>{book.title}</h3>
        <p className="text-xs mb-1.5 truncate" style={{ color: theme.colors.textMuted }}>{book.author}</p>
        <StarRow rating={book.rating} theme={theme} />
        {book.genre.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {book.genre.slice(0, 2).map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: theme.colors.primaryLight, color: theme.colors.primaryDark }}>
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="mt-2 flex flex-col gap-0.5">
          {dateInfo && (
            <p className="text-[10px] capitalize" style={{ color: theme.colors.textMuted }}>
              {dateInfo.label}: {dateInfo.value}
            </p>
          )}
          <p className="text-[10px]" style={{ color: theme.colors.textMuted }}>Reg.: {registradoEm}</p>
        </div>
      </div>
    </div>
  )
}

function BookListItem({ book, theme, gradients, onDelete, onEdit, onSelect }: {
  book: Book; theme: any; gradients: string[]
  onDelete: (id: string) => void
  onEdit: (book: Book) => void
  onSelect: (book: Book) => void
}) {
  const fmt = (d: string) => new Date(d + 'T00:00').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
  const dateLabel = book.status !== 'quero_ler' && book.startedAt ? fmt(book.startedAt) : null
  const dias = bookDias(book)

  return (
    <div
      className="flex gap-4 rounded-2xl overflow-hidden group transition-all hover:scale-[1.01] cursor-pointer"
      style={{ background: theme.colors.surface, boxShadow: `0 2px 12px ${theme.colors.primary}10` }}
      onClick={() => onSelect(book)}
    >
      <BookCover
        book={book}
        gradients={gradients}
        className="w-16 h-24 flex-shrink-0"
        onClick={book.coverUrl ? (e => { e.stopPropagation(); window.open(book.coverUrl!, '_blank') }) : undefined}
      />

      <div className="flex-1 py-4 pr-4 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-display font-semibold text-base leading-tight truncate" style={{ color: theme.colors.text }}>{book.title}</h3>
            <p className="text-sm mt-0.5" style={{ color: theme.colors.textMuted }}>{book.author}</p>
          </div>
          <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all">
            <button onClick={e => { e.stopPropagation(); onEdit(book) }} className="p-1.5 rounded-full" style={{ background: theme.colors.primaryLight }}>
              <Pencil className="w-3.5 h-3.5" style={{ color: theme.colors.primary }} />
            </button>
            <button onClick={e => { e.stopPropagation(); onDelete(book.id) }} className="p-1.5 rounded-full" style={{ background: theme.colors.primaryLight }}>
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <StarRow rating={book.rating} theme={theme} />
          {dateLabel && <span className="text-[11px] capitalize" style={{ color: theme.colors.textMuted }}>{dateLabel}</span>}
          {book.status !== 'lido' && (
            <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: STATUS_CONFIG[book.status].bg, color: STATUS_CONFIG[book.status].color }}>
              {STATUS_CONFIG[book.status].label}
            </span>
          )}
          {dias !== null && (
            <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: theme.colors.primaryLight, color: theme.colors.primaryDark }}>
              Lido em {dias} dia{dias !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {book.genre.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {book.genre.map(tag => (
              <span key={tag} className="px-2.5 py-0.5 rounded-full text-[11px]" style={{ background: theme.colors.primaryLight, color: theme.colors.primaryDark }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {book.review && (
          <p className="italic mt-2 text-[12px] leading-relaxed line-clamp-1" style={{ color: theme.colors.textMuted }}>"{book.review}"</p>
        )}
      </div>
    </div>
  )
}

function BookDetailModal({ book, theme, gradients, onClose, onEdit, onDelete }: {
  book: Book; theme: any; gradients: string[]
  onClose: () => void
  onEdit: (book: Book) => void
  onDelete: (id: string) => void
}) {
  const registradoLabel = new Date(book.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
  const iniciadoLabel = book.startedAt
    ? new Date(book.startedAt + 'T00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null
  const finalizadoLabel = book.finishedAt
    ? new Date(book.finishedAt + 'T00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null
  const dias  = bookDias(book)
  const color = gradients[book.colorIdx] ?? gradients[0]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ background: theme.colors.surface }}
      >
        {/* Capa */}
        <div
          className="relative h-56 w-full flex-shrink-0 flex items-center justify-center cursor-pointer"
          style={{ background: color }}
          onClick={() => book.coverUrl && window.open(book.coverUrl, '_blank')}
        >
          {book.coverUrl
            ? <img src={book.coverUrl} alt={book.title} className="absolute inset-0 w-full h-full object-cover" />
            : <BookOpen className="w-16 h-16 text-white opacity-60" />
          }
          {/* Gradiente sobre a capa para legibilidade */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)' }} />
          <button
            onClick={e => { e.stopPropagation(); onClose() }}
            className="absolute top-3 right-3 p-1.5 rounded-full transition-all hover:bg-white/20"
            style={{ background: 'rgba(0,0,0,0.40)' }}
          >
            <X className="w-4 h-4 text-white" />
          </button>
          {/* Tipo badge */}
          <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white"
            style={{ background: 'rgba(0,0,0,0.40)' }}>
            {book.isManga ? 'Mangá' : 'Livro'}
          </div>
          {/* Título e autor sobre a capa */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
            <h2 className="font-display font-bold text-lg text-white leading-tight">{book.title}</h2>
            <p className="text-white/80 text-sm mt-0.5">{book.author}</p>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="overflow-y-auto p-5 flex flex-col gap-4">
          {/* Avaliação + dias */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5"
                  style={{ color: i < book.rating ? theme.colors.primary : theme.colors.primaryLight }}
                  fill={i < book.rating ? theme.colors.primary : theme.colors.primaryLight}
                />
              ))}
              <span className="text-sm font-bold ml-1" style={{ color: theme.colors.text }}>{book.rating}/5</span>
            </div>
            {dias !== null && (
              <span className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: theme.colors.primaryLight, color: theme.colors.primaryDark }}>
                Lido em {dias} dia{dias !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Gêneros */}
          {book.genre.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {book.genre.map(tag => (
                <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs"
                  style={{ background: theme.colors.primaryLight, color: theme.colors.primaryDark }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Resenha */}
          {book.review && (
            <div className="rounded-2xl p-4" style={{ background: theme.colors.primaryLight + '70' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: theme.colors.primaryDark }}>Resenha</p>
              <p className="text-sm leading-relaxed italic" style={{ color: theme.colors.text }}>"{book.review}"</p>
            </div>
          )}

          {/* Datas */}
          <div className="grid grid-cols-2 gap-2">
            {iniciadoLabel && (
              <div className="rounded-xl p-3" style={{ background: theme.colors.primaryLight + '50' }}>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: theme.colors.textMuted }}>Iniciado em</p>
                <p className="text-xs font-semibold capitalize" style={{ color: theme.colors.text }}>{iniciadoLabel}</p>
              </div>
            )}
            {finalizadoLabel && (
              <div className="rounded-xl p-3" style={{ background: theme.colors.primaryLight + '50' }}>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: theme.colors.textMuted }}>Finalizado em</p>
                <p className="text-xs font-semibold capitalize" style={{ color: theme.colors.text }}>{finalizadoLabel}</p>
              </div>
            )}
            <div className="rounded-xl p-3" style={{ background: theme.colors.primaryLight + '50' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: theme.colors.textMuted }}>Registrado em</p>
              <p className="text-xs font-semibold capitalize" style={{ color: theme.colors.text }}>{registradoLabel}</p>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onEdit(book)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: theme.colors.primary, color: '#fff' }}
            >
              <Pencil className="w-4 h-4" />
              Editar
            </button>
            <button
              onClick={() => { onDelete(book.id); onClose() }}
              className="p-2.5 rounded-full transition-all hover:opacity-80"
              style={{ background: theme.colors.primaryLight }}
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function GeneroFiltroSelect({ value, onChange, theme, extraGeneros = [], onAddGenero }: {
  value: string
  onChange: (v: string) => void
  theme: any
  extraGeneros?: string[]
  onAddGenero?: (g: string) => void
}) {
  const [open,        setOpen]        = useState(false)
  const [adicionando, setAdicionando] = useState(false)
  const [novoGenero,  setNovoGenero]  = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false); setAdicionando(false)
      }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const confirmar = () => {
    const nome = novoGenero.trim()
    if (!nome) return
    onAddGenero?.(nome)
    onChange(nome)
    setNovoGenero('')
    setAdicionando(false)
    setOpen(false)
  }

  const todosGeneros = [...GENEROS, ...extraGeneros]

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
        style={{ background: value ? theme.colors.primary : theme.colors.primaryLight, color: value ? '#fff' : theme.colors.textMuted }}>
        <span>{value || 'Gênero'}</span>
        <ChevronDown className={`w-3 h-3 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-30 top-full mt-1 rounded-2xl shadow-xl overflow-hidden"
          style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.primary}20`, minWidth: '180px' }}>
          <div className="overflow-y-auto" style={{ maxHeight: '220px' }}>
            <button type="button" onClick={() => { onChange(''); setOpen(false) }}
              className="w-full flex items-center justify-between px-4 py-2.5 text-xs transition-all hover:opacity-80 text-left"
              style={{ background: !value ? theme.colors.primaryLight : 'transparent', color: theme.colors.text }}>
              <span>Todos</span>
              {!value && <Check className="w-3 h-3 flex-shrink-0" style={{ color: theme.colors.primary }} />}
            </button>
            {todosGeneros.map(g => (
              <button key={g} type="button" onClick={() => { onChange(g); setOpen(false) }}
                className="w-full flex items-center justify-between px-4 py-2.5 text-xs transition-all hover:opacity-80 text-left"
                style={{ background: value === g ? theme.colors.primaryLight : 'transparent', color: theme.colors.text }}>
                <span>{g}</span>
                {value === g && <Check className="w-3 h-3 flex-shrink-0" style={{ color: theme.colors.primary }} />}
              </button>
            ))}
          </div>
          {onAddGenero && (
            <div className="border-t px-3 py-2" style={{ borderColor: `${theme.colors.primary}15`, background: theme.colors.surface }}>
              {adicionando ? (
                <div className="flex gap-2 items-center">
                  <input
                    autoFocus
                    value={novoGenero}
                    onChange={e => setNovoGenero(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') confirmar(); if (e.key === 'Escape') setAdicionando(false) }}
                    placeholder="Nome do gênero"
                    className="flex-1 px-2 py-1 rounded-lg text-xs outline-none"
                    style={{ background: theme.colors.primaryLight, color: theme.colors.text }}
                  />
                  <button type="button" onClick={confirmar}
                    className="px-3 py-1 rounded-lg text-xs font-bold flex-shrink-0"
                    style={{ background: theme.colors.primary, color: '#fff' }}>OK</button>
                  <button type="button" onClick={() => setAdicionando(false)}
                    className="text-xs flex-shrink-0" style={{ color: theme.colors.textMuted }}>✕</button>
                </div>
              ) : (
                <button type="button" onClick={() => setAdicionando(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold w-full py-1 hover:opacity-70 transition-all"
                  style={{ color: theme.colors.primary }}>
                  <Plus className="w-3.5 h-3.5" /> Novo gênero
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Helpers de estatísticas (usados no perfil)
// ─────────────────────────────────────────────
function topN<T extends string>(map: Record<T, number>, n: number): { key: T; count: number }[] {
  return (Object.entries(map) as [T, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key, count]) => ({ key, count }))
}

// ─────────────────────────────────────────────
// Componente: Perfil do Leitor
// ─────────────────────────────────────────────
function ReaderProfile({ books, theme }: { books: Book[]; theme: any }) {
  const lidos = books.filter(b => b.status === 'lido')
  const lendo = books.filter(b => b.status === 'lendo')
  const queroLer = books.filter(b => b.status === 'quero_ler')
  const total = books.length

  // ── autores ──────────────────────────────────
  const autorCount: Record<string, number> = {}
  const autorRatingSum: Record<string, number> = {}
  lidos.forEach(b => {
    if (!b.author) return
    autorCount[b.author] = (autorCount[b.author] || 0) + 1
    autorRatingSum[b.author] = (autorRatingSum[b.author] || 0) + b.rating
  })
  const topAutores = topN(autorCount, 5)

  // ── gêneros ──────────────────────────────────
  const genreCount: Record<string, number> = {}
  lidos.forEach(b => b.genre.forEach(g => { genreCount[g] = (genreCount[g] || 0) + 1 }))
  const topGeneros = topN(genreCount, 6)
  const maxGenero = topGeneros[0]?.count || 1

  // ── avaliação média ───────────────────────────
  const comRating = lidos.filter(b => b.rating > 0)
  const avgRating = comRating.length > 0
    ? comRating.reduce((s, b) => s + b.rating, 0) / comRating.length
    : 0

  // ── ritmo de leitura ─────────────────────────
  const comDias = lidos.filter(b => bookDias(b) !== null)
  const mediaDias = comDias.length > 0
    ? Math.round(comDias.reduce((s, b) => s + (bookDias(b) ?? 0), 0) / comDias.length)
    : null

  // ── histórico anual ──────────────────────────
  const anoAtual = new Date().getFullYear()
  const anosHist = [anoAtual - 2, anoAtual - 1, anoAtual]
  const porAno = anosHist.map(ano => ({
    ano,
    count: lidos.filter(b => new Date((b.startedAt || b.created_at) + (b.startedAt ? 'T00:00' : '')).getFullYear() === ano).length,
  }))
  const maxAno = Math.max(...porAno.map(a => a.count), 1)

  // ── distribuição por mês (ano atual) ─────────
  const porMes = Array.from({ length: 12 }, (_, i) => ({
    mes: MESES[i],
    count: lidos.filter(b => {
      const d = new Date((b.startedAt || b.created_at) + (b.startedAt ? 'T00:00' : ''))
      return d.getFullYear() === anoAtual && d.getMonth() === i
    }).length,
  }))
  const maxMesHist = Math.max(...porMes.map(m => m.count), 1)

  // ── avaliação por estrela ─────────────────────
  const starDist = [5, 4, 3, 2, 1].map(s => ({
    star: s,
    count: comRating.filter(b => b.rating === s).length,
  }))
  const maxStar = Math.max(...starDist.map(s => s.count), 1)

  // ── livros x mangás ───────────────────────────
  const totalMangas = lidos.filter(b => b.isManga).length
  const totalLivros = lidos.length - totalMangas
  const mangaPct = lidos.length > 0 ? (totalMangas / lidos.length) * 100 : 0
  // donut
  const R = 32, CIRC = 2 * Math.PI * R
  const mangaArc = CIRC * (mangaPct / 100)

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: theme.colors.primaryLight }}>
          <BarChart2 className="w-8 h-8" style={{ color: theme.colors.primary }} />
        </div>
        <p className="text-sm font-semibold" style={{ color: theme.colors.textMuted }}>
          Registre seus primeiros livros para ver seu perfil de leitor!
        </p>
      </div>
    )
  }

  const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`rounded-2xl p-5 ${className}`}
      style={{ background: theme.colors.surface, boxShadow: `0 2px 16px ${theme.colors.primary}0A` }}>
      {children}
    </div>
  )

  const SectionTitle = ({ icon: Icon, label }: { icon: LucideIcon; label: string }) => (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: theme.colors.primaryLight }}>
        <Icon className="w-3.5 h-3.5" style={{ color: theme.colors.primary }} />
      </div>
      <p className="font-bold text-sm" style={{ color: theme.colors.text }}>{label}</p>
    </div>
  )

  return (
    <div className="flex flex-col gap-5">

      {/* ── Linha 1: cards de resumo ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: CheckCircle, label: 'Lidos', value: lidos.length, color: '#059669', bg: '#d1fae5' },
          { icon: Clock,       label: 'Lendo agora', value: lendo.length, color: '#d97706', bg: '#fef3c7' },
          { icon: Bookmark,    label: 'Quero ler', value: queroLer.length, color: '#7c3aed', bg: '#ede9fe' },
          { icon: Library,     label: 'Total na estante', value: total, color: theme.colors.primary, bg: theme.colors.primaryLight },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: theme.colors.surface, boxShadow: `0 2px 16px ${theme.colors.primary}0A` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: bg }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <p className="text-2xl font-black leading-none" style={{ color: theme.colors.text }}>{value}</p>
              <p className="text-[11px] mt-0.5" style={{ color: theme.colors.textMuted }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Linha 2: autor favorito + avaliação + ritmo ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Autores mais lidos */}
        <Card className="md:col-span-2">
          <SectionTitle icon={User} label="Autores mais lidos" />
          {topAutores.length === 0 ? (
            <p className="text-xs" style={{ color: theme.colors.textMuted }}>Nenhum autor registrado ainda.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {topAutores.map(({ key: autor, count }, idx) => {
                const media = autorRatingSum[autor] > 0 && autorCount[autor] > 0
                  ? (autorRatingSum[autor] / autorCount[autor]).toFixed(1)
                  : null
                const pct = Math.round((count / (topAutores[0]?.count || 1)) * 100)
                return (
                  <div key={autor} className="flex items-center gap-3">
                    {/* rank */}
                    <span className="text-[11px] font-black w-4 text-center flex-shrink-0"
                      style={{ color: idx === 0 ? '#f59e0b' : theme.colors.textMuted }}>
                      {idx === 0 ? '★' : `#${idx + 1}`}
                    </span>
                    {/* nome */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold truncate" style={{ color: theme.colors.text }}>{autor}</p>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          {media && (
                            <span className="text-[10px] font-bold" style={{ color: '#f59e0b' }}>★ {media}</span>
                          )}
                          <span className="text-[10px] font-bold" style={{ color: theme.colors.primary }}>
                            {count} livro{count !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: theme.colors.primaryLight }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: idx === 0 ? '#f59e0b' : theme.colors.primary }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Avaliação + ritmo */}
        <div className="flex flex-col gap-4">
          {/* Avaliação média */}
          <Card>
            <SectionTitle icon={Star} label="Avaliação média" />
            <div className="flex items-end gap-3 mb-3">
              <span className="text-4xl font-black leading-none" style={{ color: theme.colors.text }}>
                {avgRating > 0 ? avgRating.toFixed(1) : '—'}
              </span>
              <div className="flex mb-1 gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className="w-4 h-4"
                    style={{ color: s <= Math.round(avgRating) ? '#f59e0b' : theme.colors.primaryLight,
                             fill: s <= Math.round(avgRating) ? '#f59e0b' : theme.colors.primaryLight }} />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              {starDist.map(({ star, count: c }) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-[10px] w-3 text-right flex-shrink-0" style={{ color: theme.colors.textMuted }}>{star}</span>
                  <Star className="w-2.5 h-2.5 flex-shrink-0" style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: theme.colors.primaryLight }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${maxStar > 0 ? Math.round((c / maxStar) * 100) : 0}%`, background: '#f59e0b' }} />
                  </div>
                  <span className="text-[10px] w-3 flex-shrink-0" style={{ color: theme.colors.textMuted }}>{c}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Ritmo de leitura */}
          <Card>
            <SectionTitle icon={TrendingUp} label="Ritmo médio" />
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black leading-none" style={{ color: theme.colors.text }}>
                {mediaDias ?? '—'}
              </span>
              {mediaDias !== null && (
                <span className="text-sm mb-0.5" style={{ color: theme.colors.textMuted }}>dias/livro</span>
              )}
            </div>
            <p className="text-[11px] mt-1" style={{ color: theme.colors.textMuted }}>
              {comDias.length > 0
                ? `Calculado com base em ${comDias.length} leitura${comDias.length !== 1 ? 's' : ''} com datas`
                : 'Adicione datas de início e fim para calcular'}
            </p>
          </Card>
        </div>
      </div>

      {/* ── Linha 3: gêneros + donut + histórico ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Top gêneros */}
        <Card className="md:col-span-1">
          <SectionTitle icon={Award} label="Gêneros favoritos" />
          {topGeneros.length === 0 ? (
            <p className="text-xs" style={{ color: theme.colors.textMuted }}>Nenhum gênero registrado ainda.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {topGeneros.map(({ key: genero, count }) => {
                const pct = Math.round((count / maxGenero) * 100)
                return (
                  <div key={genero}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[11px] font-semibold truncate" style={{ color: theme.colors.text }}>{genero}</p>
                      <span className="text-[10px] ml-2 flex-shrink-0" style={{ color: theme.colors.primary }}>
                        {count}×
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: theme.colors.primaryLight }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: theme.colors.primary }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Livros vs Mangás */}
        <Card className="flex flex-col items-center justify-center">
          <SectionTitle icon={BookOpen} label="Livros vs Mangás" />
          <div className="flex flex-col items-center gap-4">
            <svg width="88" height="88" viewBox="0 0 88 88">
              <circle cx="44" cy="44" r={R} fill="none" stroke={theme.colors.primaryLight} strokeWidth="10" />
              {lidos.length > 0 && (
                <>
                  <circle cx="44" cy="44" r={R} fill="none"
                    stroke={theme.colors.primary} strokeWidth="10"
                    strokeDasharray={`${CIRC - mangaArc} ${mangaArc}`}
                    strokeLinecap="round" transform="rotate(-90 44 44)" />
                  {mangaArc > 0 && (
                    <circle cx="44" cy="44" r={R} fill="none"
                      stroke="#a855f7" strokeWidth="10"
                      strokeDasharray={`${mangaArc} ${CIRC - mangaArc}`}
                      strokeDashoffset={CIRC - (CIRC - mangaArc)}
                      strokeLinecap="round" transform="rotate(-90 44 44)" />
                  )}
                </>
              )}
              <text x="44" y="40" textAnchor="middle" fontSize="11" fontWeight="700" fill={theme.colors.text}>
                {lidos.length}
              </text>
              <text x="44" y="53" textAnchor="middle" fontSize="8" fill={theme.colors.textMuted}>lidos</text>
            </svg>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: theme.colors.primary }} />
                <span className="text-[11px]" style={{ color: theme.colors.textMuted }}>Livros <strong style={{ color: theme.colors.text }}>{totalLivros}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: '#a855f7' }} />
                <span className="text-[11px]" style={{ color: theme.colors.textMuted }}>Mangás <strong style={{ color: theme.colors.text }}>{totalMangas}</strong></span>
              </div>
            </div>
          </div>
        </Card>

        {/* Histórico anual + mensal */}
        <Card>
          <SectionTitle icon={BarChart2} label="Histórico de leituras" />
          {/* Por ano — barras com círculo branco */}
          <div className="flex items-end gap-3 mb-4" style={{ height: 72 }}>
            {porAno.map(({ ano, count }) => {
              const h = count > 0 ? Math.max(40, Math.round((count / maxAno) * 60)) : 6
              const ativo = ano === anoAtual
              return (
                <div key={ano} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-xl transition-all duration-500 flex items-start justify-center pt-1.5 flex-shrink-0"
                    style={{ height: h, background: ativo ? theme.colors.primary : theme.colors.primaryLight }}
                  >
                    {count > 0 && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.9)', minWidth: 24 }}>
                        <span className="text-[10px] font-black leading-none"
                          style={{ color: ativo ? theme.colors.primary : theme.colors.primaryDark }}>
                          {count}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px]" style={{ color: theme.colors.textMuted }}>{ano}</span>
                </div>
              )
            })}
          </div>

          {/* Por mês (ano atual) */}
          <p className="text-[10px] font-semibold mb-1.5" style={{ color: theme.colors.textMuted }}>
            Mês a mês — {anoAtual}
          </p>
          <div className="flex items-end gap-0.5 h-10">
            {porMes.map(({ mes, count }) => {
              const h = count > 0 ? Math.max(8, Math.round((count / maxMesHist) * 32)) : 3
              return (
                <div key={mes} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="w-full rounded-sm transition-all duration-500 relative"
                    style={{ height: h, background: count > 0 ? theme.colors.primary : theme.colors.primaryLight + '60' }}>
                    {count > 0 && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.9)', border: `1px solid ${theme.colors.primary}30` }}>
                        <span className="text-[8px] font-black" style={{ color: theme.colors.primary }}>{count}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[7px]" style={{ color: theme.colors.textMuted }}>{mes[0]}</span>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}

export function BooksPage() {
  const { currentTheme } = useTheme()
  const {
    books, loading, error,
    showAdd, openAdd, closeModal,
    editingBook, openEdit,
    saving, form, setForm, setCoverFile,
    metaAnual, setMetaAnual,
    filtroMes, setFiltroMes,
    carregarLivros,
    addBook, removeBook,
  } = useBooks()

  const [aba,                setAba]                = useState<'biblioteca' | 'perfil'>('biblioteca')
  const [hoverRating,        setHoverRating]        = useState(0)
  const [editandoMeta,       setEditandoMeta]       = useState(false)
  const [metaInput,          setMetaInput]          = useState(String(metaAnual))
  const [viewMode,           setViewMode]           = useState<'grid' | 'list'>('grid')
  const [anoFiltro,          setAnoFiltro]          = useState(new Date().getFullYear())
  const [verMaisAnos,        setVerMaisAnos]        = useState(false)
  const [selectedBook,       setSelectedBook]       = useState<Book | null>(null)
  const [cropSrc,            setCropSrc]            = useState<string | null>(null)
  const [crop,               setCrop]               = useState({ x: 0, y: 0 })
  const [zoom,               setZoom]               = useState(1)
  const [croppedAreaPixels,  setCroppedAreaPixels]  = useState<PixelCrop | null>(null)
  const [croppingDone,       setCroppingDone]       = useState(false)
  const [filtroTipo,         setFiltroTipo]         = useState<'todos' | 'livros' | 'mangas'>('todos')
  const [filtroStatus,       setFiltroStatus]       = useState<'todos' | BookStatus>('todos')
  const [filtroAutor,        setFiltroAutor]        = useState('')
  const [filtroGeneroSel,    setFiltroGeneroSel]    = useState('')
  const [customGeneros,      setCustomGeneros]      = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('bp_custom_genres') ?? '[]') } catch { return [] }
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addCustomGenero = (nome: string) => {
    if (GENEROS.includes(nome) || customGeneros.includes(nome)) return
    const updated = [...customGeneros, nome]
    setCustomGeneros(updated)
    localStorage.setItem('bp_custom_genres', JSON.stringify(updated))
  }

  // Ano/mês do livro usa startedAt quando disponível, senão created_at
  const getBookDate = (b: Book) => new Date((b.startedAt || b.finishedAt || b.created_at) + (b.startedAt || b.finishedAt ? 'T00:00' : ''))
  const getBookYear  = (b: Book) => getBookDate(b).getFullYear()
  const getBookMonth = (b: Book) => getBookDate(b).getMonth()

  const onCropComplete = useCallback((_: any, pixels: PixelCrop) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const confirmCrop = async () => {
    if (!cropSrc || !croppedAreaPixels) return
    setCroppingDone(true)
    try {
      const file = await getCroppedImage(cropSrc, croppedAreaPixels)
      setCoverFile(file)
    } finally {
      URL.revokeObjectURL(cropSrc)
      setCropSrc(null)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setCroppingDone(false)
    }
  }

  const cancelCrop = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
  }

  const anoAtual     = new Date().getFullYear()
  const ANO_BASE     = 2020
  const anosDefault  = [anoAtual, anoAtual - 1, anoAtual - 2]
  const anosRecentes = Array.from({ length: anoAtual - ANO_BASE + 1 }, (_, i) => anoAtual - i)
  const anosAntigos  = Array.from({ length: ANO_BASE - 2015 }, (_, i) => ANO_BASE - 1 - i)
  const anosVisiveis = verMaisAnos ? [...anosRecentes, ...anosAntigos] : anosDefault

  // Separa por status — "lendo" e "quero ler" ficam em seções próprias
  const livrosEmAndamento = books.filter(b => b.status === 'lendo')
  const livrosQueroLer    = books.filter(b => b.status === 'quero_ler')
  const livrosLidos       = books.filter(b => b.status === 'lido')

  // Base muda com o filtro de status; lendo/quero_ler ignoram filtro de ano/mês
  const baseParaFiltro = filtroStatus === 'todos' ? livrosLidos : books.filter(b => b.status === filtroStatus)
  const livrosFiltrados = baseParaFiltro.filter(b => {
    const skipDate = filtroStatus === 'lendo' || filtroStatus === 'quero_ler'
    const anoOk    = skipDate || getBookYear(b) === anoFiltro
    const mesOk    = skipDate || filtroMes === null || getBookMonth(b) === filtroMes
    const tipoOk   = filtroTipo === 'todos' || (filtroTipo === 'mangas' ? b.isManga : !b.isManga)
    const autorOk  = !filtroAutor.trim() || b.author.toLowerCase().includes(filtroAutor.toLowerCase()) || b.title.toLowerCase().includes(filtroAutor.toLowerCase())
    const generoOk = !filtroGeneroSel || b.genre.includes(filtroGeneroSel)
    return anoOk && mesOk && tipoOk && autorOk && generoOk
  })

  const livrosPorMes = MESES.map((_, i) =>
    livrosLidos.filter(b => getBookMonth(b) === i && getBookYear(b) === anoFiltro).length
  )

  // Métricas sempre do ano atual (só livros lidos)
  const booksAnoAtual = livrosLidos.filter(b => getBookYear(b) === anoAtual)
  const totalAnoAtual = booksAnoAtual.length
  const progresso     = Math.min(100, Math.round((totalAnoAtual / metaAnual) * 100))
  const avgRating = booksAnoAtual.length > 0
    ? (booksAnoAtual.reduce((s, b) => s + b.rating, 0) / booksAnoAtual.length).toFixed(1)
    : '0.0'

  const handleOpenEdit = (book: Book) => {
    setSelectedBook(null)
    openEdit(book)
  }

  const handleDelete = (id: string) => {
    if (selectedBook?.id === id) setSelectedBook(null)
    removeBook(id)
  }

  {/* ── métricas calculadas (todas filtradas pelo ano atual) ── */}
  const genreCount: Record<string, number> = {}
  booksAnoAtual.forEach(b => b.genre.forEach(g => { genreCount[g] = (genreCount[g] || 0) + 1 }))
  const generoFav   = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
  const lendoAnoAtual = livrosEmAndamento.filter(b => getBookYear(b) === anoAtual)
  const totalDias   = [...booksAnoAtual, ...lendoAnoAtual].reduce((s, b) => s + diasAtivos(b), 0)
  const totalMangas = booksAnoAtual.filter(b => b.isManga).length
  const totalLivros = booksAnoAtual.length - totalMangas
  const maxMes      = Math.max(...livrosPorMes, 1)
  const r = 34, circ = 2 * Math.PI * r
  const dashOffset  = circ * (1 - Math.min(progresso, 100) / 100)

  return (
    <div className="flex-1 overflow-hidden" style={{ background: currentTheme.colors.background }}>
      <div className="h-full overflow-auto p-6 flex flex-col gap-5 items-stretch">
        <div className="max-w-6xl mx-auto w-full flex flex-col gap-5">
        {/* ── Hero: meta + métricas ── */}
        <div className="rounded-3xl overflow-hidden" style={{
          background: `linear-gradient(135deg, ${currentTheme.colors.primaryDark} 0%, ${currentTheme.colors.primary} 55%, ${currentTheme.colors.accent} 100%)`,
          boxShadow: `0 8px 32px ${currentTheme.colors.primary}40`,
        }}>
          <div className="relative p-6 flex items-center gap-6 flex-wrap">
            {/* círculos decorativos */}
            <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160, borderRadius:'50%', background:'white', opacity:0.06 }} />
            <div style={{ position:'absolute', bottom:-30, right:100, width:100, height:100, borderRadius:'50%', background:'white', opacity:0.05 }} />

            {/* Ring de progresso */}
            <div className="flex-shrink-0 flex flex-col items-center gap-1 relative">
              <svg width="90" height="90" viewBox="0 0 90 90">
                <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
                <circle cx="45" cy="45" r={r} fill="none" stroke="white" strokeWidth="6"
                  strokeDasharray={circ} strokeDashoffset={dashOffset}
                  strokeLinecap="round" transform="rotate(-90 45 45)"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
                <text x="45" y="49" textAnchor="middle" fontSize="14" fontWeight="700" fill="white">{progresso}%</text>
              </svg>
              <p className="text-[11px] font-bold text-white/80 uppercase tracking-wider">meta {anoAtual}</p>
            </div>

            {/* Números da meta */}
            <div className="flex-shrink-0">
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-0.5">Lidos em {anoAtual}</p>
              <div className="flex items-end gap-1">
                <span className="text-5xl font-black text-white leading-none">{totalAnoAtual}</span>
                <span className="text-white/60 text-lg mb-1">/{metaAnual}</span>
              </div>
              {editandoMeta ? (
                <div className="flex items-center gap-2 mt-2">
                  <input type="number" min={1} value={metaInput} onChange={e => setMetaInput(e.target.value)}
                    className="w-16 px-2 py-1 rounded-lg text-sm text-center outline-none bg-white/20 text-white placeholder-white/50" />
                  <button onClick={() => { setMetaAnual(Math.max(1, Number(metaInput)||1)); setEditandoMeta(false) }}
                    className="text-xs px-3 py-1 rounded-full bg-white/30 text-white font-bold hover:bg-white/40 transition-all">OK</button>
                  <button onClick={() => setEditandoMeta(false)} className="text-xs text-white/60 hover:text-white/80">✕</button>
                </div>
              ) : (
                <button onClick={() => { setEditandoMeta(true); setMetaInput(String(metaAnual)) }}
                  className="mt-1 text-[11px] text-white/60 hover:text-white/90 underline transition-all">
                  Editar meta
                </button>
              )}
            </div>

            {/* Separador */}
            <div className="hidden md:block w-px h-16 bg-white/20 mx-2" />

            {/* Chips de métricas */}
            <div className="flex flex-wrap gap-3 flex-1">
              {[
                { label: 'Avaliação média', value: avgRating, icon: '★' },
                { label: 'Gênero favorito', value: generoFav, icon: '♥' },
                { label: 'Dias lendo', value: totalDias > 0 ? `${totalDias}d` : '—', icon: '◷' },
                { label: 'Livros', value: String(totalLivros), icon: '▣' },
                { label: 'Mangás', value: String(totalMangas), icon: '◈' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="rounded-2xl px-4 py-3 flex flex-col gap-0.5" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider">{label}</span>
                  <span className="text-white font-bold text-base leading-tight">{icon} {value}</span>
                </div>
              ))}
            </div>

            {/* Botão adicionar */}
            <button onClick={() => openAdd()}
              className="flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.22)', color: '#fff', backdropFilter: 'blur(4px)' }}>
              <PlusCircle className="w-4 h-4" />
              Adicionar
            </button>
          </div>
        </div>

        {/* ── Abas ── */}
        <div className="flex gap-1 rounded-2xl p-1" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}0A` }}>
          {([
            { key: 'biblioteca', label: 'Biblioteca', Icon: Library },
            { key: 'perfil',     label: 'Perfil do Leitor', Icon: BarChart2 },
          ] as const).map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setAba(key)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background: aba === key
                  ? `linear-gradient(135deg, ${currentTheme.colors.primaryDark} 0%, ${currentTheme.colors.primary} 100%)`
                  : 'transparent',
                color: aba === key ? '#fff' : currentTheme.colors.textMuted,
                boxShadow: aba === key ? `0 4px 12px ${currentTheme.colors.primary}40` : 'none',
              }}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Aba: Perfil do Leitor ── */}
        {aba === 'perfil' && (
          <ReaderProfile books={books} theme={currentTheme} />
        )}

        {/* ── Aba: Biblioteca (conteúdo principal) ── */}
        {aba === 'biblioteca' && (<>

        {/* ── Em andamento ── */}
        {filtroStatus === 'todos' && livrosEmAndamento.length > 0 && (
          <div className="rounded-2xl p-5" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}0A` }}>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4" style={{ color: STATUS_CONFIG.lendo.color }} />
              <span className="font-bold text-sm" style={{ color: currentTheme.colors.text }}>Em andamento</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: STATUS_CONFIG.lendo.bg, color: STATUS_CONFIG.lendo.color }}>
                {livrosEmAndamento.length}
              </span>
              <button onClick={() => openAdd('lendo')} className="ml-auto flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all hover:opacity-80"
                style={{ background: STATUS_CONFIG.lendo.bg, color: STATUS_CONFIG.lendo.color }}>
                <Plus className="w-3 h-3" /> Adicionar
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
              {livrosEmAndamento.map(book => (
                <div key={book.id} className="flex-shrink-0 w-32">
                  <BookCard book={book} theme={currentTheme} gradients={GRADIENTS}
                    onDelete={handleDelete} onEdit={handleOpenEdit} onSelect={setSelectedBook} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Quero ler ── */}
        {filtroStatus === 'todos' && livrosQueroLer.length > 0 && (
          <div className="rounded-2xl p-5" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}0A` }}>
            <div className="flex items-center gap-2 mb-4">
              <Bookmark className="w-4 h-4" style={{ color: STATUS_CONFIG.quero_ler.color }} />
              <span className="font-bold text-sm" style={{ color: currentTheme.colors.text }}>Quero ler</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: STATUS_CONFIG.quero_ler.bg, color: STATUS_CONFIG.quero_ler.color }}>
                {livrosQueroLer.length}
              </span>
              <button onClick={() => openAdd('quero_ler')} className="ml-auto flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all hover:opacity-80"
                style={{ background: STATUS_CONFIG.quero_ler.bg, color: STATUS_CONFIG.quero_ler.color }}>
                <Plus className="w-3 h-3" /> Adicionar
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {livrosQueroLer.map(book => (
                <div key={book.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:opacity-80 transition-all group"
                  style={{ background: currentTheme.colors.background }}
                  onClick={() => setSelectedBook(book)}
                >
                  <BookOpen className="w-4 h-4 flex-shrink-0" style={{ color: STATUS_CONFIG.quero_ler.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: currentTheme.colors.text }}>{book.title}</p>
                    {book.author && <p className="text-xs truncate" style={{ color: currentTheme.colors.textMuted }}>{book.author}</p>}
                    {book.genre.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {book.genre.slice(0, 3).map(g => (
                          <span key={g} className="px-1.5 py-0.5 rounded-full text-[9px]"
                            style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}>{g}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                    <button onClick={e => { e.stopPropagation(); handleOpenEdit(book) }}
                      className="p-1.5 rounded-full" style={{ background: currentTheme.colors.primaryLight }}>
                      <Pencil className="w-3 h-3" style={{ color: currentTheme.colors.primary }} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); handleDelete(book.id) }}
                      className="p-1.5 rounded-full" style={{ background: currentTheme.colors.primaryLight }}>
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Gráfico de atividade mensal ── */}
        <div className="rounded-2xl p-5" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}0A` }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-bold text-sm" style={{ color: currentTheme.colors.text }}>Atividade em {anoFiltro}</p>
              <p className="text-xs mt-0.5" style={{ color: currentTheme.colors.textMuted }}>Livros lidos por mês — clique para filtrar</p>
            </div>
            <div className="flex items-center gap-2">
              {/* seletor de ano compacto */}
              <div className="flex gap-1 flex-wrap">
                {anosVisiveis.map(ano => {
                  const temLivros = books.some(b => getBookYear(b) === ano)
                  return (
                    <button key={ano} onClick={() => { setAnoFiltro(ano); setFiltroMes(null) }}
                      className="relative px-3 py-1 rounded-full text-xs font-semibold transition-all"
                      style={{ background: anoFiltro === ano ? currentTheme.colors.primary : currentTheme.colors.primaryLight, color: anoFiltro === ano ? '#fff' : currentTheme.colors.textMuted }}>
                      {ano}
                      {temLivros && anoFiltro !== ano && (
                        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                          style={{ background: currentTheme.colors.primary }} />
                      )}
                    </button>
                  )
                })}
                <button onClick={() => setVerMaisAnos(v => !v)}
                  className="px-3 py-1 rounded-full text-xs transition-all hover:opacity-70"
                  style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.textMuted }}>
                  {verMaisAnos ? '−' : '+'}
                </button>
              </div>
              {/* view toggle */}
              <div className="flex rounded-full overflow-hidden ml-2" style={{ border: `1.5px solid ${currentTheme.colors.primary}30` }}>
                {(['grid','list'] as const).map(mode => {
                  const Icon = mode === 'grid' ? LayoutGrid : List
                  return (
                    <button key={mode} onClick={() => setViewMode(mode)} className="px-3 py-1.5 transition-all"
                      style={{ background: viewMode === mode ? currentTheme.colors.primary : 'transparent', color: viewMode === mode ? '#fff' : currentTheme.colors.textMuted }}>
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Barras mensais */}
          <div className="flex items-end gap-1.5 h-20">
            {MESES.map((mes, i) => {
              const count = livrosPorMes[i]
              const h     = count > 0 ? Math.max(16, Math.round((count / maxMes) * 64)) : 4
              const ativo = filtroMes === i
              return (
                <button key={mes} onClick={() => setFiltroMes(filtroMes === i ? null : i)}
                  className="flex-1 flex flex-col items-center gap-1 group transition-all">
                  <span className="text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-all"
                    style={{ color: currentTheme.colors.primary }}>{count > 0 ? count : ''}</span>
                  <div className="w-full rounded-t-lg transition-all duration-300 relative"
                    style={{
                      height: h,
                      background: ativo ? currentTheme.colors.primary : count > 0 ? currentTheme.colors.primaryLight : `${currentTheme.colors.primaryLight}60`,
                      boxShadow: ativo ? `0 4px 12px ${currentTheme.colors.primary}60` : 'none',
                    }} />
                  <span className="text-[9px]" style={{ color: ativo ? currentTheme.colors.primary : currentTheme.colors.textMuted, fontWeight: ativo ? 700 : 400 }}>{mes}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Filtros ── */}
        <div className="rounded-2xl px-4 py-3 flex flex-wrap items-center gap-2" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}0A` }}>
          {/* Status */}
          <div className="flex gap-1 flex-shrink-0">
            <button onClick={() => setFiltroStatus('todos')}
              className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
              style={{ background: filtroStatus === 'todos' ? currentTheme.colors.primary : currentTheme.colors.primaryLight, color: filtroStatus === 'todos' ? '#fff' : currentTheme.colors.textMuted }}>
              Todos
            </button>
            {(Object.entries(STATUS_CONFIG) as [BookStatus, typeof STATUS_CONFIG[BookStatus]][]).map(([key, cfg]) => {
              const Icon = cfg.Icon
              const ativo = filtroStatus === key
              return (
                <button key={key} onClick={() => setFiltroStatus(key)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                  style={{ background: ativo ? cfg.color : currentTheme.colors.primaryLight, color: ativo ? '#fff' : currentTheme.colors.textMuted }}>
                  <Icon className="w-3 h-3" />
                  {cfg.label}
                </button>
              )
            })}
          </div>
          <div className="w-px h-4 flex-shrink-0" style={{ background: currentTheme.colors.primary + '25' }} />
          {/* Tipo */}
          <div className="flex gap-1 flex-shrink-0">
            {([['todos','Todos'], ['livros','Livros'], ['mangas','Mangás']] as const).map(([val, label]) => (
              <button key={val} onClick={() => setFiltroTipo(val)}
                className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                style={{ background: filtroTipo === val ? currentTheme.colors.primary : currentTheme.colors.primaryLight, color: filtroTipo === val ? '#fff' : currentTheme.colors.textMuted }}>
                {label}
              </button>
            ))}
          </div>
          <div className="w-px h-4 flex-shrink-0" style={{ background: currentTheme.colors.primary + '25' }} />
          {/* Gênero */}
          <GeneroFiltroSelect
            value={filtroGeneroSel}
            onChange={setFiltroGeneroSel}
            theme={currentTheme}
            extraGeneros={customGeneros}
            onAddGenero={addCustomGenero}
          />
          {/* Buscar */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full flex-1 min-w-[160px]"
            style={{ background: currentTheme.colors.primaryLight }}>
            <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: currentTheme.colors.textMuted }} />
            <input type="text" placeholder="Buscar autor ou título..." value={filtroAutor}
              onChange={e => setFiltroAutor(e.target.value)}
              className="bg-transparent outline-none text-xs flex-1"
              style={{ color: currentTheme.colors.text }} />
          </div>
          {(filtroStatus !== 'todos' || filtroTipo !== 'todos' || filtroGeneroSel || filtroAutor || filtroMes !== null) && (
            <button onClick={() => { setFiltroStatus('todos'); setFiltroTipo('todos'); setFiltroGeneroSel(''); setFiltroAutor(''); setFiltroMes(null) }}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:opacity-70 flex-shrink-0"
              style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.textMuted }}>
              Limpar
            </button>
          )}
        </div>

        {/* ── Estado de carregamento ── */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-2" style={{ color: currentTheme.colors.textMuted }}>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Carregando livros...</span>
          </div>
        )}
        {!loading && error && (
          <div className="py-8 text-center">
            <p className="text-sm text-red-500">{error}</p>
            <button onClick={carregarLivros} className="mt-2 text-xs underline" style={{ color: currentTheme.colors.primary }}>Tentar novamente</button>
          </div>
        )}

        {/* ── Estado vazio: sem livros no ano selecionado ── */}
        {!loading && !error && books.length > 0 && livrosFiltrados.length === 0 && (() => {
          const totalEsteAno = books.filter(b => getBookYear(b) === anoFiltro).length
          const anosComLivros = [...new Set(books.map(b => getBookYear(b)))].sort((a, b) => b - a)
          if (totalEsteAno === 0) {
            return (
              <div className="py-12 flex flex-col items-center gap-4 text-center">
                <BookOpen className="w-10 h-10 opacity-25" style={{ color: currentTheme.colors.primary }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: currentTheme.colors.textMuted }}>Nenhum livro registrado em {anoFiltro}</p>
                  <p className="text-xs mt-1" style={{ color: currentTheme.colors.textMuted }}>Você tem leituras em outros anos:</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {anosComLivros.map(ano => (
                    <button key={ano} onClick={() => { setAnoFiltro(ano); setFiltroMes(null) }}
                      className="px-4 py-1.5 rounded-full text-xs font-bold transition-all hover:opacity-80"
                      style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primary }}>
                      Ver {ano}
                    </button>
                  ))}
                </div>
              </div>
            )
          }
          return (
            <div className="py-10 flex flex-col items-center gap-2 text-center">
              <p className="text-sm font-semibold" style={{ color: currentTheme.colors.textMuted }}>Nenhum livro com esses filtros</p>
              <button onClick={() => { setFiltroTipo('todos'); setFiltroGeneroSel(''); setFiltroAutor(''); setFiltroMes(null) }}
                className="text-xs underline hover:opacity-70 transition-all"
                style={{ color: currentTheme.colors.primary }}>
                Limpar filtros
              </button>
            </div>
          )
        })()}

        {/* ── Listagem ── */}
        {!loading && !error && (() => {
          if (livrosFiltrados.length === 0 && books.length > 0) return null
          const livrosSo = livrosFiltrados.filter(b => !b.isManga)
          const mangasSo = livrosFiltrados.filter(b => b.isManga)
          const mostrarSecoes = filtroTipo === 'todos' && livrosSo.length > 0 && mangasSo.length > 0

          const addBtn = (
            <button onClick={() => openAdd()}
              className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 p-4 hover:opacity-80 transition-all"
              style={{ borderColor: currentTheme.colors.primary + '40', minHeight: '200px', background: currentTheme.colors.primaryLight + '40' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: currentTheme.colors.primaryLight }}>
                <PlusCircle className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
              </div>
              <p className="text-xs font-semibold" style={{ color: currentTheme.colors.textMuted }}>Adicionar</p>
            </button>
          )

          const renderGrid = (lista: Book[], comAdd = false) => (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {lista.map(book => (
                <BookCard key={book.id} book={book} theme={currentTheme} gradients={GRADIENTS}
                  onDelete={handleDelete} onEdit={handleOpenEdit} onSelect={setSelectedBook} />
              ))}
              {comAdd && addBtn}
            </div>
          )

          const renderList = (lista: Book[]) => (
            <div className="flex flex-col gap-2">
              {lista.map(book => (
                <BookListItem key={book.id} book={book} theme={currentTheme} gradients={GRADIENTS}
                  onDelete={handleDelete} onEdit={handleOpenEdit} onSelect={setSelectedBook} />
              ))}
            </div>
          )

          const SecaoLabel = ({ label, count }: { label: string; count: number }) => (
            <div className="flex items-center gap-3 mb-3">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: currentTheme.colors.textMuted }}>{label}</p>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primary }}>{count}</span>
            </div>
          )

          if (mostrarSecoes) return (
            <div className="flex flex-col gap-7">
              {livrosSo.length > 0 && <div><SecaoLabel label="Livros" count={livrosSo.length} />{viewMode === 'grid' ? renderGrid(livrosSo) : renderList(livrosSo)}</div>}
              {mangasSo.length > 0 && <div><SecaoLabel label="Mangás" count={mangasSo.length} />{viewMode === 'grid' ? renderGrid(mangasSo) : renderList(mangasSo)}</div>}
              {viewMode === 'grid' && <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">{addBtn}</div>}
            </div>
          )

          return viewMode === 'grid' ? renderGrid(livrosFiltrados, true) : renderList(livrosFiltrados)
        })()}

        </>)}{/* fecha aba biblioteca */}
        </div>{/* fecha max-w */}
      </div>

      {/* Modal de detalhes do livro */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          theme={currentTheme}
          gradients={GRADIENTS}
          onClose={() => setSelectedBook(null)}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modal de adicionar / editar livro */}
      {showAdd && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div
            className="w-full max-w-2xl rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]"
            style={{ background: currentTheme.colors.surface }}
          >
            {/* Banner gradiente */}
            <div style={{
              background: `linear-gradient(135deg, ${currentTheme.colors.primaryDark} 0%, ${currentTheme.colors.primary} 60%, ${currentTheme.colors.accent} 100%)`,
              padding: '20px 22px 18px', position: 'relative', overflow: 'hidden',
              borderRadius: '24px 24px 0 0', flexShrink: 0,
            }}>
              <div style={{ position: 'absolute', top: -24, right: -24, width: 90, height: 90, borderRadius: '50%', background: 'white', opacity: 0.08 }} />
              <div style={{ position: 'absolute', bottom: -14, right: 36, width: 56, height: 56, borderRadius: '50%', background: 'white', opacity: 0.06 }} />
              <div className="flex items-start justify-between relative">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {editingBook ? 'Editar livro' : 'Novo livro'}
                  </p>
                  <h3 className="font-display font-bold text-base mt-0.5 text-white">
                    {editingBook ? 'Atualizar registro' : 'Registrar leitura'}
                  </h3>
                </div>
                <button onClick={() => closeModal()} className="p-1.5 rounded-full transition-all hover:bg-white/20">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-5 flex flex-col gap-3">

              {/* Toggle Livro / Mangá */}
              <div className="flex gap-2">
                {([{ val: false, label: 'Livro' }, { val: true, label: 'Mangá' }] as const).map(({ val, label }) => (
                  <button key={String(val)} type="button" onClick={() => setForm(f => ({ ...f, isManga: val }))}
                    className="flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all"
                    style={{ background: form.isManga === val ? currentTheme.colors.primary : currentTheme.colors.primaryLight, color: form.isManga === val ? '#fff' : currentTheme.colors.textMuted }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Toggle Status */}
              <div className="flex gap-2">
                {(Object.entries(STATUS_CONFIG) as [BookStatus, typeof STATUS_CONFIG[BookStatus]][]).map(([key, cfg]) => {
                  const Icon = cfg.Icon
                  return (
                    <button key={key} type="button" onClick={() => setForm(f => ({ ...f, status: key }))}
                      className="flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-1.5"
                      style={{
                        background: form.status === key ? cfg.color : currentTheme.colors.primaryLight,
                        color: form.status === key ? '#fff' : currentTheme.colors.textMuted,
                      }}>
                      <Icon className="w-3.5 h-3.5" />
                      {cfg.label}
                    </button>
                  )
                })}
              </div>

              {/* Título, Autor e Gêneros na mesma linha */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Título</p>
                  <input type="text" placeholder="Nome do livro" value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-3 py-3 rounded-2xl outline-none text-sm"
                    style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }}
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Autor</p>
                  <input type="text" placeholder="Nome do autor" value={form.author}
                    onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                    className="w-full px-3 py-3 rounded-2xl outline-none text-sm"
                    style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }}
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Gêneros</p>
                  <GeneroSelect selected={form.genres} onChange={genres => setForm(f => ({ ...f, genres }))} theme={currentTheme} extraGeneros={customGeneros} onAddGenero={addCustomGenero} />
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Resenha (opcional)</p>
                <textarea
                  rows={2}
                  placeholder="O que achou do livro?"
                  value={form.review}
                  onChange={e => setForm(f => ({ ...f, review: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl outline-none text-sm resize-none"
                  style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }}
                />
              </div>

              {/* Datas de leitura + dias calculados + avaliação */}
              {(() => {
                const diasGastos = form.startedAt && form.finishedAt
                  ? Math.max(0, Math.round((new Date(form.finishedAt + 'T00:00').getTime() - new Date(form.startedAt + 'T00:00').getTime()) / 86400000))
                  : null
                return (
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Iniciada em</p>
                      <DatePickerInput
                        value={form.startedAt}
                        onChange={v => setForm(f => ({ ...f, startedAt: v }))}
                        placeholder="DD/MM/AAAA"
                        theme={currentTheme}
                        direction="down"
                      />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Finalizada em</p>
                      <DatePickerInput
                        value={form.finishedAt}
                        onChange={v => setForm(f => ({ ...f, finishedAt: v }))}
                        placeholder="DD/MM/AAAA"
                        theme={currentTheme}
                        direction="down"
                      />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Dias de leitura</p>
                      <div className="w-full px-4 py-2.5 rounded-xl text-sm flex items-center gap-1.5"
                        style={{ background: currentTheme.colors.primaryLight, color: diasGastos !== null ? currentTheme.colors.text : currentTheme.colors.textMuted }}>
                        {diasGastos !== null
                          ? <><span className="font-bold text-base" style={{ color: currentTheme.colors.primary }}>{diasGastos}</span><span>dia{diasGastos !== 1 ? 's' : ''}</span></>
                          : <span>—</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Avaliação</p>
                      <div className="flex gap-0.5 pt-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <button key={s} type="button" onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} onClick={() => setForm(f => ({ ...f, rating: s }))}>
                            <Star className="w-5 h-5 transition-all"
                              style={{ color: s <= (hoverRating || form.rating) ? currentTheme.colors.primary : currentTheme.colors.primaryLight }}
                              fill={s <= (hoverRating || form.rating) ? currentTheme.colors.primary : currentTheme.colors.primaryLight}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })()}

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Capa do livro</p>
                <div className="flex gap-2 mb-3">
                  {(['color', 'photo'] as const).map(mode => (
                    <button key={mode} onClick={() => setForm(f => ({ ...f, coverMode: mode }))}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold transition-all"
                      style={{
                        background: form.coverMode === mode ? currentTheme.colors.primary : currentTheme.colors.primaryLight,
                        color:      form.coverMode === mode ? '#fff' : currentTheme.colors.textMuted,
                      }}>
                      {mode === 'color' ? <Palette className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                      {mode === 'color' ? 'Cor' : 'Foto'}
                    </button>
                  ))}
                </div>

                {form.coverMode === 'color' ? (
                  <div className="flex gap-2">
                    {GRADIENTS.map((g, i) => (
                      <button key={i} onClick={() => setForm(f => ({ ...f, colorIdx: i }))}
                        className="w-9 h-9 rounded-full transition-all hover:scale-110 relative"
                        style={{ background: g }}>
                        {form.colorIdx === i && <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        setCropSrc(URL.createObjectURL(file))
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                    />
                    {form.coverPreview ? (
                      <div className="relative">
                        <img src={form.coverPreview} alt="Capa" className="w-full h-36 object-cover rounded-2xl" />
                        <button onClick={() => { setCoverFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                          className="absolute top-2 right-2 p-1 rounded-full" style={{ background: 'rgba(0,0,0,0.5)' }}>
                          <X className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => fileInputRef.current?.click()}
                        className="w-full h-24 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:opacity-80"
                        style={{ background: currentTheme.colors.primaryLight, border: `2px dashed ${currentTheme.colors.primary}40` }}>
                        <ImageIcon className="w-6 h-6" style={{ color: currentTheme.colors.textMuted }} />
                        <span className="text-xs" style={{ color: currentTheme.colors.textMuted }}>Clique para selecionar</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={() => closeModal()}
                  className="flex-1 py-3 rounded-full text-sm font-semibold hover:opacity-80 transition-all"
                  style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}>
                  Cancelar
                </button>
                <button onClick={addBook} disabled={saving}
                  className="flex-1 py-3 rounded-full text-white font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${currentTheme.colors.primaryDark}, ${currentTheme.colors.primary})`,
                    boxShadow: `0 6px 18px ${currentTheme.colors.primary}45`,
                    opacity: saving ? 0.7 : 1,
                  }}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de recorte de imagem */}
      {cropSrc && (
        <div className="fixed inset-0 z-[60] flex flex-col" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ color: '#fff' }}>
            <div className="flex items-center gap-2">
              <Crop className="w-5 h-5" />
              <span className="font-semibold text-base">Recortar capa</span>
            </div>
            <button onClick={cancelCrop} className="p-1.5 rounded-full hover:bg-white/10 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Área do crop */}
          <div className="relative flex-1">
            <Cropper
              image={cropSrc}
              crop={crop}
              zoom={zoom}
              aspect={2 / 3}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: { borderRadius: 0 },
                cropAreaStyle: { border: `2px solid ${currentTheme.colors.primary}` },
              }}
            />
          </div>

          {/* Controle de zoom */}
          <div className="flex-shrink-0 px-8 py-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
            <div className="flex items-center gap-3 max-w-sm mx-auto mb-4">
              <ZoomIn className="w-4 h-4 text-white/60 flex-shrink-0" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
                className="flex-1 accent-pink-400"
              />
              <span className="text-white/60 text-xs w-8 text-right">{zoom.toFixed(1)}x</span>
            </div>

            <div className="flex gap-3 max-w-sm mx-auto">
              <button
                onClick={confirmCrop}
                disabled={croppingDone}
                className="flex-1 py-2.5 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: currentTheme.colors.primary, color: '#fff' }}
              >
                {croppingDone && <Loader2 className="w-4 h-4 animate-spin" />}
                {croppingDone ? 'Processando...' : 'Confirmar recorte'}
              </button>
              <button
                onClick={cancelCrop}
                className="flex-1 py-2.5 rounded-full font-semibold text-sm transition-all hover:opacity-80"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
