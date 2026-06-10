import { ChevronLeft, ChevronRight, Plus, Circle, CheckCircle, Trash2, Clock, Loader2, Calendar, X } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { STATUS_COLORS } from '../enums/colors'
import { useToast } from '../components/Toast'
import { fetchWeekTasks, createWeekTask, toggleWeekTask, deleteWeekTask } from '../services/weekTasks'
import { fetchEvents, fetchGoogleEvents, fetchIntegrationStatus } from '../services/events'
import type { WeekTask } from '../services/weekTasks'
import type { CalEvent } from '../types/event.types'

const DAYS      = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const FULL_DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

function getWeekDates(offset: number): Date[] {
  const now    = new Date()
  const dow    = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((dow + 6) % 7) + offset * 7)
  monday.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

const pad = (n: number) => String(n).padStart(2, '0')
const toStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export function WeekPage() {
  const { currentTheme } = useTheme()
  const { toast } = useToast()

  const [weekOffset, setWeekOffset] = useState(0)
  const [tasks,      setTasks]      = useState<WeekTask[]>([])
  const [calEvents,  setCalEvents]  = useState<CalEvent[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)

  const [addingFor, setAddingFor] = useState<string | null>(null)
  const [newText,   setNewText]   = useState('')
  const [newTime,   setNewTime]   = useState('')
  const [saving,    setSaving]    = useState(false)

  const dates   = getWeekDates(weekOffset)
  const dateFrom = toStr(dates[0])
  const dateTo   = toStr(dates[6])
  const today    = new Date()

  const isToday = (d: Date) =>
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [wt, evs, status] = await Promise.all([
        fetchWeekTasks(dateFrom, dateTo),
        fetchEvents(),
        fetchIntegrationStatus(),
      ])
      let allEvs = evs
      if (status.google) {
        const gEvs = await fetchGoogleEvents()
        allEvs = [...evs, ...gEvs]
      }
      setTasks(wt)
      setCalEvents(allEvs.filter(e => e.date >= dateFrom && e.date <= dateTo))
    } catch {
      setError('Erro ao carregar dados da semana.')
    }
    setLoading(false)
  }, [dateFrom, dateTo])

  useEffect(() => { loadData() }, [loadData])

  const handleAdd = async (date: string) => {
    if (!newText.trim()) return
    setSaving(true)
    try {
      const task = await createWeekTask(date, newText, newTime || undefined)
      setTasks(prev => [...prev, task])
      toast('Tarefa criada!', `"${newText.trim()}" foi adicionada com sucesso.`)
      setNewText(''); setNewTime(''); setAddingFor(null)
    } catch {
      toast('Erro ao criar tarefa', 'Não foi possível salvar a tarefa.', 'error')
    }
    setSaving(false)
  }

  const handleToggle = async (task: WeekTask) => {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: !t.done } : t))
    try { await toggleWeekTask(task.id, !task.done) }
    catch { setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: task.done } : t)) }
  }

  const handleDelete = async (id: string) => {
    const nome = tasks.find(t => t.id === id)?.text ?? 'Tarefa'
    setTasks(prev => prev.filter(t => t.id !== id))
    try {
      await deleteWeekTask(id)
      toast('Tarefa removida', `"${nome}" foi excluída.`, 'info')
    } catch { loadData() }
  }

  const monthLabel = dates[0].toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="flex-1 overflow-auto p-6" style={{ background: currentTheme.colors.background }}>
      <div className="max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm font-medium capitalize" style={{ color: currentTheme.colors.textMuted }}>
          {monthLabel}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setWeekOffset(o => o - 1)}
            className="p-2 rounded-xl hover:opacity-70 transition-all"
            style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold hover:opacity-80 transition-all"
            style={{ background: currentTheme.colors.primary, color: '#fff' }}
          >
            Hoje
          </button>
          <button
            onClick={() => setWeekOffset(o => o + 1)}
            className="p-2 rounded-xl hover:opacity-70 transition-all"
            style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {loading && <Loader2 className="w-4 h-4 animate-spin ml-2" style={{ color: currentTheme.colors.primary }} />}
      </div>

      {/* Aviso de erro */}
      {!loading && error && (
        <div className="mb-4 py-4 text-center rounded-2xl" style={{ background: currentTheme.colors.surface }}>
          <p className="text-sm text-red-500">{error}</p>
          <button onClick={loadData} className="mt-2 text-xs underline" style={{ color: currentTheme.colors.primary }}>
            Tentar novamente
          </button>
        </div>
      )}

      {/* Grade semanal */}
      <div className="overflow-x-auto">
      <div className="grid grid-cols-7 gap-3 min-w-[700px]">
        {dates.map((date, idx) => {
          const key        = toStr(date)
          const dayTasks   = tasks.filter(t => t.date === key)
          const dayEvents  = calEvents.filter(e => e.date === key)
          const active     = isToday(date)
          const isAdding   = addingFor === key

          return (
            <div
              key={key}
              className="rounded-2xl overflow-hidden flex flex-col"
              style={{
                background:  currentTheme.colors.surface,
                boxShadow:   active
                  ? `0 0 0 2px ${currentTheme.colors.primary}, 0 4px 16px ${currentTheme.colors.primary}20`
                  : `0 2px 12px ${currentTheme.colors.primary}10`,
                minHeight: '300px',
              }}
            >
              {/* Cabeçalho do dia */}
              <div
                className="px-3 py-2.5 text-center"
                style={{ background: active ? currentTheme.colors.primary : currentTheme.colors.primaryLight }}
              >
                <p className="text-xs font-semibold" style={{ color: active ? '#fff' : currentTheme.colors.textMuted }}>
                  {DAYS[(date.getDay())]}
                </p>
                <p className="text-xl font-bold" style={{ color: active ? '#fff' : currentTheme.colors.text }}>
                  {date.getDate()}
                </p>
              </div>

              {/* Conteúdo */}
              <div className="flex-1 p-2 space-y-1 overflow-y-auto">

                {/* Eventos do calendário (read-only) */}
                {dayEvents.map(ev => (
                  <div
                    key={ev.id}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
                    style={{ background: currentTheme.colors.primaryLight + 'AA' }}
                  >
                    <Calendar className="w-2.5 h-2.5 flex-shrink-0" style={{ color: currentTheme.colors.primary }} />
                    <span className="text-[10px] truncate leading-tight" style={{ color: currentTheme.colors.primaryDark }}>
                      {ev.title}
                    </span>
                  </div>
                ))}

                {/* Divisor se houver eventos + tarefas */}
                {dayEvents.length > 0 && dayTasks.length > 0 && (
                  <div className="border-t my-1" style={{ borderColor: currentTheme.colors.primary + '18' }} />
                )}

                {/* Tarefas do usuário */}
                {dayTasks.map(task => (
                  <div
                    key={task.id}
                    className="group flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-black/5 transition-all"
                  >
                    <button
                      onClick={() => handleToggle(task)}
                      className="flex-shrink-0 transition-all hover:opacity-70"
                    >
                      {task.done
                        ? <CheckCircle className="w-4 h-4" style={{ color: STATUS_COLORS.concluido.color }} />
                        : <Circle      className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
                      }
                    </button>
                    <p
                      className="flex-1 text-[11px] leading-tight break-words min-w-0"
                      style={{
                        color:          task.done ? currentTheme.colors.textMuted : currentTheme.colors.text,
                        textDecoration: task.done ? 'line-through' : 'none',
                      }}
                    >
                      {task.text}
                    </p>
                    {task.time && (
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <Clock className="w-2.5 h-2.5" style={{ color: currentTheme.colors.primary }} />
                        <span className="text-[10px]" style={{ color: currentTheme.colors.primary }}>{task.time}</span>
                      </div>
                    )}
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                ))}

                {/* Botão de adicionar */}
                <button
                  onClick={() => { setAddingFor(isAdding ? null : key); setNewText(''); setNewTime('') }}
                  className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg transition-all"
                  style={{
                    color: isAdding ? currentTheme.colors.primary : currentTheme.colors.primary,
                    opacity: isAdding ? 1 : 0.4,
                    background: isAdding ? currentTheme.colors.primaryLight : 'transparent',
                  }}
                >
                  <Plus className="w-3 h-3" />
                  <span className="text-[10px] font-medium">Adicionar</span>
                </button>
              </div>

              {/* Rodapé com nome do dia */}
              <div className="px-3 pb-2 text-center">
                <p className="text-[10px]" style={{ color: currentTheme.colors.textMuted }}>
                  {FULL_DAYS[date.getDay()]}
                </p>
              </div>
            </div>
          )
        })}
      </div>
      </div>{/* fecha overflow-x-auto */}
      </div>{/* fecha max-w */}

      {/* Modal de adicionar tarefa */}
      {addingFor && (() => {
        const modalDate = dates.find(d => toStr(d) === addingFor)
        const label = modalDate
          ? modalDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
          : addingFor
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
            onClick={e => { if (e.target === e.currentTarget) { setAddingFor(null); setNewText(''); setNewTime('') } }}
          >
            <div
              className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
              style={{ background: currentTheme.colors.surface }}
            >
              {/* Banner gradiente */}
              <div style={{
                background: `linear-gradient(135deg, ${currentTheme.colors.primaryDark} 0%, ${currentTheme.colors.primary} 60%, ${currentTheme.colors.accent} 100%)`,
                padding: '20px 22px 18px',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Círculos decorativos */}
                <div style={{ position: 'absolute', top: -24, right: -24, width: 90, height: 90, borderRadius: '50%', background: 'white', opacity: 0.08 }} />
                <div style={{ position: 'absolute', bottom: -14, right: 36, width: 56, height: 56, borderRadius: '50%', background: 'white', opacity: 0.06 }} />

                <div className="flex items-start justify-between relative">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      Nova tarefa
                    </p>
                    <h3 className="font-display font-bold text-base capitalize mt-0.5 text-white">
                      {label}
                    </h3>
                  </div>
                  <button
                    onClick={() => { setAddingFor(null); setNewText(''); setNewTime('') }}
                    className="p-1.5 rounded-full transition-all hover:bg-white/20"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="p-5 flex flex-col gap-4">

                {/* Campo horário */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>
                    Horário (opcional)
                  </p>
                  <div
                    className="flex items-center gap-2.5 px-4 py-3 rounded-2xl"
                    style={{ background: currentTheme.colors.primaryLight }}
                  >
                    <Clock className="w-4 h-4 flex-shrink-0" style={{ color: currentTheme.colors.primary }} />
                    <input
                      type="text"
                      placeholder="HH:MM"
                      value={newTime}
                      maxLength={5}
                      onChange={e => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 4)
                        setNewTime(digits.length <= 2 ? digits : `${digits.slice(0, 2)}:${digits.slice(2)}`)
                      }}
                      className="flex-1 bg-transparent outline-none text-sm"
                      style={{ color: currentTheme.colors.text }}
                    />
                  </div>
                </div>

                {/* Campo descrição */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>
                    O que fazer?
                  </p>
                  <input
                    autoFocus
                    type="text"
                    placeholder="Descreva sua tarefa..."
                    value={newText}
                    onChange={e => setNewText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAdd(addingFor)
                      if (e.key === 'Escape') { setAddingFor(null); setNewText(''); setNewTime('') }
                    }}
                    className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                    style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }}
                  />
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => { setAddingFor(null); setNewText(''); setNewTime('') }}
                    className="flex-1 py-3 rounded-full text-sm font-semibold hover:opacity-80 transition-all"
                    style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleAdd(addingFor)}
                    disabled={saving}
                    className="flex-1 py-3 rounded-full text-sm font-bold text-white transition-all flex items-center justify-center gap-2 hover:opacity-90"
                    style={{
                      background: `linear-gradient(135deg, ${currentTheme.colors.primaryDark}, ${currentTheme.colors.primary})`,
                      boxShadow: `0 6px 18px ${currentTheme.colors.primary}45`,
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
