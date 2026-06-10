import { Plus, Search, Pin, Trash2, Pencil, X, StickyNote, Loader2, LayoutGrid, GraduationCap, User, Briefcase, Target, ChefHat, ChevronRight, Check, Circle, CheckCircle, type LucideIcon } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useNotes } from '../hooks/useNotes'
import type { Note } from '../types/note.types'

const FOLDER_ICONS: Record<string, LucideIcon> = {
  'Todas':        LayoutGrid,
  'Universitário': GraduationCap,
  'Pessoal':      User,
  'Trabalho':     Briefcase,
  'Metas':        Target,
  'Receitas':     ChefHat,
}

const FOLDER_NAMES = ['Todas', 'Universitário', 'Pessoal', 'Trabalho', 'Metas', 'Receitas']
const CATEGORY_OPTIONS = ['Pessoal', 'Universitário', 'Trabalho', 'Metas', 'Receitas']

function CategorySelect({ value, onChange, theme }: {
  value: string
  onChange: (v: string) => void
  theme: any
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const Icon = FOLDER_ICONS[value] ?? StickyNote

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
        style={{ background: theme.colors.primaryLight, color: theme.colors.text }}
      >
        <span className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: theme.colors.primary }} />
          {value}
        </span>
        <ChevronRight
          className={`w-4 h-4 transition-transform ${open ? 'rotate-90' : ''}`}
          style={{ color: theme.colors.textMuted }}
        />
      </button>

      {open && (
        <div
          className="absolute z-30 w-full mt-1 rounded-xl shadow-lg overflow-hidden"
          style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.primary}20` }}
        >
          {CATEGORY_OPTIONS.map(opt => {
            const OptIcon = FOLDER_ICONS[opt] ?? StickyNote
            const selected = opt === value
            return (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all hover:opacity-80 text-left"
                style={{ background: selected ? theme.colors.primaryLight : 'transparent', color: theme.colors.text }}
              >
                {selected
                  ? <Check className="w-4 h-4 flex-shrink-0" style={{ color: theme.colors.primary }} />
                  : <span className="w-4 h-4 flex-shrink-0" />}
                <OptIcon className="w-4 h-4 flex-shrink-0" style={{ color: theme.colors.primary }} />
                {opt}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function NotesPage() {
  const { currentTheme } = useTheme()
  const {
    notes, loading, error,
    showAdd, setShowAdd,
    saving, form, setForm,
    NOTE_COLORS,
    carregarNotas,
    addNote, removeNote, pinNote, editNote,
  } = useNotes()

  const [selectedFolder, setSelectedFolder] = useState('Todas')
  const [searchQuery,    setSearchQuery]    = useState('')
  const [editingNote,    setEditingNote]    = useState<Note | null>(null)
  const [editForm,       setEditForm]       = useState({ title: '', content: '', category: 'Pessoal', color: NOTE_COLORS[0], isPinned: false })
  const [editSaving,     setEditSaving]     = useState(false)

  const openEdit = (note: Note) => {
    setEditingNote(note)
    setEditForm({ title: note.title, content: note.content, category: note.category, color: note.color, isPinned: note.isPinned })
  }

  const saveEdit = async () => {
    if (!editingNote) return
    setEditSaving(true)
    await editNote(editingNote.id, editForm)
    setEditSaving(false)
    setEditingNote(null)
  }

  const filteredNotes = notes.filter(note => {
    const matchesFolder = selectedFolder === 'Todas' || note.category === selectedFolder
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFolder && matchesSearch
  })

  const pinnedNotes  = filteredNotes.filter(n => n.isPinned)
  const regularNotes = filteredNotes.filter(n => !n.isPinned)

  const folderCount = (name: string) =>
    name === 'Todas' ? notes.length : notes.filter(n => n.category === name).length

  return (
    <div className="flex-1 flex overflow-hidden" style={{ background: currentTheme.colors.background }}>

      {/* Sidebar de pastas */}
      <div
        className="w-60 border-r p-5 overflow-y-auto flex-shrink-0"
        style={{ background: currentTheme.colors.surface, borderColor: `${currentTheme.colors.primary}20` }}
      >
        <h2 className="font-display mb-4 text-xl font-semibold" style={{ color: currentTheme.colors.text }}>
          Notas
        </h2>
        <button
          onClick={() => setShowAdd(true)}
          className="w-full py-2.5 rounded-full text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all mb-5"
          style={{ background: currentTheme.colors.primary }}
        >
          <Plus className="w-4 h-4" />
          Nova Nota
        </button>

        <div className="space-y-1">
          {FOLDER_NAMES.map(name => (
            <button
              key={name}
              onClick={() => setSelectedFolder(name)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all hover:opacity-80"
              style={{
                background: selectedFolder === name ? currentTheme.colors.primaryLight : 'transparent',
                color:      selectedFolder === name ? currentTheme.colors.primaryDark  : currentTheme.colors.text,
              }}
            >
              <div className="flex items-center gap-2">
                {(() => { const Icon = FOLDER_ICONS[name] ?? StickyNote; return <Icon className="w-4 h-4" /> })()}
                <span className="text-sm font-medium">{name}</span>
              </div>
              <span
                className="px-2 py-0.5 rounded-full text-xs"
                style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}
              >
                {folderCount(name)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 overflow-y-auto p-5">

        {/* Barra de busca */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: currentTheme.colors.textMuted }} />
          <input
            type="text"
            placeholder="Buscar notas..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-transparent outline-none transition-all"
            style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }}
            onFocus={e  => (e.target.style.borderColor = currentTheme.colors.primary)}
            onBlur={e   => (e.target.style.borderColor = 'transparent')}
          />
        </div>

        {/* Estado de carregamento */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-2" style={{ color: currentTheme.colors.textMuted }}>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Carregando notas...</span>
          </div>
        )}

        {/* Estado de erro */}
        {!loading && error && (
          <div className="py-8 text-center">
            <p className="text-sm text-red-500">{error}</p>
            <button onClick={carregarNotas} className="mt-2 text-xs underline" style={{ color: currentTheme.colors.primary }}>
              Tentar novamente
            </button>
          </div>
        )}

        {/* Notas fixadas */}
        {!loading && !error && pinnedNotes.length > 0 && (
          <div className="mb-6">
            <h3 className="flex items-center gap-2 mb-3 text-base font-semibold" style={{ color: currentTheme.colors.text }}>
              <Pin className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
              Fixadas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pinnedNotes.map(note => (
                <NoteCard key={note.id} note={note} theme={currentTheme} onDelete={removeNote} onTogglePin={pinNote} onEdit={openEdit} />
              ))}
            </div>
          </div>
        )}

        {/* Outras notas */}
        {!loading && !error && regularNotes.length > 0 && (
          <div>
            {pinnedNotes.length > 0 && (
              <h3 className="mb-3 text-base font-semibold" style={{ color: currentTheme.colors.text }}>
                Outras Notas
              </h3>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {regularNotes.map(note => (
                <NoteCard key={note.id} note={note} theme={currentTheme} onDelete={removeNote} onTogglePin={pinNote} onEdit={openEdit} />
              ))}
            </div>
          </div>
        )}

        {/* Estado vazio */}
        {!loading && !error && filteredNotes.length === 0 && (
          <div className="text-center py-20">
            <StickyNote className="w-16 h-16 mx-auto mb-4" style={{ color: currentTheme.colors.textMuted }} />
            <p className="font-display mb-2 text-2xl" style={{ color: currentTheme.colors.text }}>
              {searchQuery ? 'Nenhuma nota encontrada' : 'Nenhuma nota ainda'}
            </p>
            <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>
              {searchQuery ? 'Tente outros termos de busca' : 'Clique em "Nova Nota" para começar'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de editar nota */}
      {editingNote && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) setEditingNote(null) }}
        >
          <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl" style={{ background: currentTheme.colors.surface }}>
            {/* Banner */}
            <div style={{
              background: `linear-gradient(135deg, ${currentTheme.colors.primaryDark} 0%, ${currentTheme.colors.primary} 60%, ${currentTheme.colors.accent} 100%)`,
              padding: '20px 22px 18px', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: -24, right: -24, width: 90, height: 90, borderRadius: '50%', background: 'white', opacity: 0.08 }} />
              <div className="flex items-start justify-between relative">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.7)' }}>Editar nota</p>
                  <h3 className="font-display font-bold text-base mt-0.5 text-white truncate max-w-xs">{editingNote.title}</h3>
                </div>
                <button onClick={() => setEditingNote(null)} className="p-1.5 rounded-full transition-all hover:bg-white/20">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            <div className="p-5 flex flex-col gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Título</p>
                <input
                  autoFocus
                  type="text"
                  value={editForm.title}
                  onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                  style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }}
                />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Conteúdo</p>
                <textarea
                  value={editForm.content}
                  onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl outline-none text-sm resize-none"
                  style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }}
                />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Categoria</p>
                <CategorySelect value={editForm.category} onChange={cat => setEditForm(f => ({ ...f, category: cat }))} theme={currentTheme} />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Cor</p>
                <div className="flex gap-2">
                  {NOTE_COLORS.map(c => (
                    <button key={c} onClick={() => setEditForm(f => ({ ...f, color: c }))}
                      className="w-8 h-8 rounded-full transition-all hover:scale-110"
                      style={{ background: c, border: editForm.color === c ? `3px solid ${currentTheme.colors.text}` : '3px solid transparent' }} />
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setEditForm(f => ({ ...f, isPinned: !f.isPinned }))}
                  className="flex items-center gap-2 cursor-pointer select-none transition-all hover:opacity-70"
                >
                  {editForm.isPinned
                    ? <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: currentTheme.colors.primary }} />
                    : <Circle className="w-5 h-5 flex-shrink-0" style={{ color: currentTheme.colors.primary }} />}
                  <span className="text-sm" style={{ color: currentTheme.colors.text }}>Fixar nota</span>
                </button>
              </label>

              <div className="flex gap-3 pt-1">
                <button onClick={() => setEditingNote(null)}
                  className="flex-1 py-3 rounded-full text-sm font-semibold hover:opacity-80 transition-all"
                  style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}>
                  Cancelar
                </button>
                <button onClick={saveEdit} disabled={editSaving}
                  className="flex-1 py-3 rounded-full text-white font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${currentTheme.colors.primaryDark}, ${currentTheme.colors.primary})`,
                    boxShadow: `0 6px 18px ${currentTheme.colors.primary}45`,
                    opacity: editSaving ? 0.7 : 1,
                  }}>
                  {editSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de adicionar nota */}
      {showAdd && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowAdd(false) }}
        >
          <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl" style={{ background: currentTheme.colors.surface }}>

            {/* Banner gradiente */}
            <div style={{
              background: `linear-gradient(135deg, ${currentTheme.colors.primaryDark} 0%, ${currentTheme.colors.primary} 60%, ${currentTheme.colors.accent} 100%)`,
              padding: '20px 22px 18px', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: -24, right: -24, width: 90, height: 90, borderRadius: '50%', background: 'white', opacity: 0.08 }} />
              <div style={{ position: 'absolute', bottom: -14, right: 36, width: 56, height: 56, borderRadius: '50%', background: 'white', opacity: 0.06 }} />
              <div className="flex items-start justify-between relative">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.7)' }}>Nova nota</p>
                  <h3 className="font-display font-bold text-base mt-0.5 text-white">Adicionar ao caderno</h3>
                </div>
                <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-full transition-all hover:bg-white/20">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-5 flex flex-col gap-3">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Título (opcional)</p>
                <input
                  autoFocus
                  type="text"
                  placeholder="Ex: Ideias, lembretes..."
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addNote()}
                  className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                  style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }}
                />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Conteúdo</p>
                <textarea
                  placeholder="Escreva aqui..."
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl outline-none text-sm resize-none"
                  style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }}
                />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Categoria</p>
                <CategorySelect value={form.category} onChange={cat => setForm(f => ({ ...f, category: cat }))} theme={currentTheme} />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Cor</p>
                <div className="flex gap-2">
                  {NOTE_COLORS.map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                      className="w-8 h-8 rounded-full transition-all hover:scale-110"
                      style={{ background: c, border: form.color === c ? `3px solid ${currentTheme.colors.text}` : '3px solid transparent' }} />
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, isPinned: !f.isPinned }))}
                className="flex items-center gap-2 cursor-pointer select-none transition-all hover:opacity-70"
              >
                {form.isPinned
                  ? <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: currentTheme.colors.primary }} />
                  : <Circle className="w-5 h-5 flex-shrink-0" style={{ color: currentTheme.colors.primary }} />}
                <span className="text-sm" style={{ color: currentTheme.colors.text }}>Fixar nota</span>
              </button>

              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowAdd(false)}
                  className="flex-1 py-3 rounded-full text-sm font-semibold hover:opacity-80 transition-all"
                  style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}>
                  Cancelar
                </button>
                <button onClick={addNote} disabled={saving}
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
    </div>
  )
}

function NoteCard({
  note,
  theme,
  onDelete,
  onTogglePin,
  onEdit,
}: {
  note: Note
  theme: any
  onDelete: (id: string) => void
  onTogglePin: (id: string) => void
  onEdit: (note: Note) => void
}) {
  const dateLabel = new Date(note.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })

  return (
    <div
      className="p-5 rounded-2xl transition-all hover:scale-105 hover:shadow-lg relative group"
      style={{ background: note.color + '20', border: `2px solid ${note.color}40`, minHeight: '180px' }}
    >
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
        <button onClick={() => onTogglePin(note.id)} className="p-1 rounded-lg hover:bg-black/10">
          <Pin className="w-3.5 h-3.5" style={{ color: note.isPinned ? note.color : '#aaa' }} fill={note.isPinned ? note.color : 'none'} />
        </button>
        <button onClick={() => onEdit(note)} className="p-1 rounded-lg hover:bg-black/10">
          <Pencil className="w-3.5 h-3.5" style={{ color: theme.colors.textMuted }} />
        </button>
        <button onClick={() => onDelete(note.id)} className="p-1 rounded-lg hover:bg-black/10">
          <Trash2 className="w-3.5 h-3.5 text-red-400" />
        </button>
      </div>

      <div className="mb-3">
        <span className="px-2 py-1 rounded-full text-xs font-medium text-white" style={{ background: note.color }}>
          {note.category}
        </span>
      </div>
      <h4 className="font-display mb-2 text-base font-semibold" style={{ color: note.title ? theme.colors.text : theme.colors.textMuted, fontStyle: note.title ? 'normal' : 'italic' }}>
        {note.title || 'Sem título'}
      </h4>
      <p className="text-sm leading-relaxed mb-3" style={{ color: theme.colors.textMuted }}>{note.content}</p>
      <span className="text-xs" style={{ color: theme.colors.textMuted }}>{dateLabel}</span>
    </div>
  )
}
