import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Plus, Cake, BookOpen, Stethoscope, FileText, Zap, Heart,
  Trash2, Pencil, Chrome, Mail, Check, Loader2, X, AlertCircle,
  MousePointerClick, ShieldCheck, Sparkles, Flag, Trophy,
} from 'lucide-react'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import {
  fetchEvents, createEvent, updateEvent, deleteEvent,
  fetchIntegrationStatus, getOAuthUrl, disconnectIntegration, syncEventToCalendar,
  fetchGoogleEvents,
} from '../services/events'
import type { CalEvent, IntegrationProvider, IntegrationStatus } from '../types/event.types'

// ── Date picker customizado ──────────────────────────────────────────────────

function DatePickerInput({ value, onChange, theme }: {
  value: string
  onChange: (v: string) => void
  theme: { colors: Record<string, string> }
}) {
  const [open, setOpen]         = useState(false)
  const [viewMonth, setViewMonth] = useState(() => value ? new Date(value + 'T00:00') : new Date())
  const ref = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => { if (value) setViewMonth(new Date(value + 'T00:00')) }, [value])

  const year       = viewMonth.getFullYear()
  const month      = viewMonth.getMonth()
  const monthLabel = viewMonth.toLocaleDateString('pt-BR', { month: 'long' })
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay    = new Date(year, month, 1).getDay()
  const pad = (n: number) => String(n).padStart(2, '0')
  const toStr = (d: number) => `${year}-${pad(month + 1)}-${pad(d)}`
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const displayValue = value
    ? new Date(value + 'T00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : ''

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all text-left"
        style={{ background: theme.colors.primaryLight, color: value ? theme.colors.text : theme.colors.textMuted }}
      >
        {displayValue || 'Selecionar data'}
        <CalendarIcon className="w-4 h-4" style={{ color: theme.colors.textMuted }} />
      </button>

      {open && (
        <div
          className="absolute z-30 w-full mt-1 rounded-2xl shadow-2xl p-4"
          style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.primary}20` }}
        >
          {/* Navegação de mês */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setViewMonth(new Date(year, month - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70 transition-all"
              style={{ background: theme.colors.primaryLight }}
            >
              <ChevronLeft className="w-4 h-4" style={{ color: theme.colors.primaryDark }} />
            </button>
            <span className="font-bold text-base" style={{ color: theme.colors.text }}>
              {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth(new Date(year, month + 1))}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70 transition-all"
              style={{ background: theme.colors.primaryLight }}
            >
              <ChevronRight className="w-4 h-4" style={{ color: theme.colors.primaryDark }} />
            </button>
          </div>

          {/* Cabeçalho dos dias */}
          <div className="grid grid-cols-7 mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-center text-[11px] font-semibold py-1" style={{ color: theme.colors.textMuted }}>{d}</div>
            ))}
          </div>

          {/* Grid de dias */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {days.map((day, i) => {
              if (!day) return <div key={i} />
              const dateStr    = toStr(day)
              const isSelected = dateStr === value
              const isToday    = dateStr === todayStr
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => { onChange(dateStr); setOpen(false) }}
                  className="w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm transition-all hover:opacity-80"
                  style={{
                    background: isSelected ? theme.colors.primary : isToday ? theme.colors.primaryLight : 'transparent',
                    color: isSelected ? '#fff' : isToday ? theme.colors.primary : theme.colors.text,
                    fontWeight: isSelected || isToday ? '600' : '400',
                  }}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Rodapé */}
          <div className="mt-3 pt-3 border-t" style={{ borderColor: theme.colors.primary + '18' }}>
            <button
              type="button"
              onClick={() => { onChange(todayStr); setOpen(false) }}
              className="w-full py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{ background: theme.colors.primaryLight, color: theme.colors.primary }}
            >
              Hoje
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Select customizado de tipo ───────────────────────────────────────────────

function TypeSelect({ value, onChange, options, getColor, getIcon, theme }: {
  value: string
  onChange: (v: string) => void
  options: string[]
  getColor: (t: string) => string
  getIcon: (t: string) => React.FC<{ className?: string; style?: React.CSSProperties }>
  theme: { colors: Record<string, string> }
}) {
  const [open, setOpen] = useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const Icon = getIcon(value)
  const color = getColor(value)

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
        style={{ background: theme.colors.primaryLight, color: theme.colors.text }}
      >
        <span className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color }} />
          {value}
        </span>
        <ChevronRight className={`w-4 h-4 transition-transform ${open ? 'rotate-90' : 'rotate-0'}`} style={{ color: theme.colors.textMuted }} />
      </button>

      {open && (
        <div
          className="absolute z-10 w-full mt-1 rounded-xl shadow-lg overflow-hidden"
          style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.primary}20` }}
        >
          {options.map(opt => {
            const OptIcon = getIcon(opt)
            const optColor = getColor(opt)
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
                <OptIcon className="w-4 h-4 flex-shrink-0" style={{ color: optColor }} />
                {opt}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Feriados Nacionais Brasileiros ───────────────────────────────────────────

function easterDate(year: number): Date {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4), k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

function getHolidays(year: number): import('../types/event.types').CalEvent[] {
  const p = (n: number) => String(n).padStart(2, '0')
  const fmt = (d: Date) => `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
  const shift = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r }
  const easter = easterDate(year)
  const list: [string, string][] = [
    [`${year}-01-01`, 'Confraternização Universal'],
    [fmt(shift(easter, -48)), 'Carnaval'],
    [fmt(shift(easter, -47)), 'Carnaval'],
    [fmt(shift(easter, -2)),  'Sexta-feira Santa'],
    [fmt(easter),             'Páscoa'],
    [`${year}-04-21`, 'Tiradentes'],
    [`${year}-05-01`, 'Dia do Trabalho'],
    [fmt(shift(easter, 60)),  'Corpus Christi'],
    [`${year}-09-07`, 'Independência do Brasil'],
    [`${year}-10-12`, 'N. Sra. Aparecida'],
    [`${year}-11-02`, 'Finados'],
    [`${year}-11-15`, 'Proclamação da República'],
    [`${year}-11-20`, 'Consciência Negra'],
    [`${year}-12-25`, 'Natal'],
  ]
  return list.map(([date, title], i) => ({
    id: `holiday_${year}_${i}`,
    title,
    date,
    type: 'Feriado',
  }))
}

// ─────────────────────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<string, React.FC<{ className?: string; style?: React.CSSProperties }>> = {
  Pessoal:        Heart,
  Aniversário:    Cake,
  Universitário:  BookOpen,
  Hábito:         Zap,
  Saúde:          Stethoscope,
  Entrega:        FileText,
  'Google Agenda': Chrome,
  'Feriado':       Flag,
  'Copa 2026':     Trophy,
}

// Jogos do Brasil na Copa do Mundo 2026 (horários em BRT)
function getBrazilWorldCup2026(): import('../types/event.types').CalEvent[] {
  return [
    { id: 'wcup_1', title: 'Brasil x Marrocos — 19h BRT', date: '2026-06-13', type: 'Copa 2026' },
    { id: 'wcup_2', title: 'Brasil x Haiti — 21h30 BRT',  date: '2026-06-19', type: 'Copa 2026' },
    { id: 'wcup_3', title: 'Brasil x Escócia — 19h BRT',  date: '2026-06-24', type: 'Copa 2026' },
  ]
}

type ModalState = { open: false } | { open: true; provider: IntegrationProvider }

export function CalendarPage() {
  const { currentTheme } = useTheme()
  const location = useLocation()

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [events, setEvents] = useState<CalEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [form, setForm] = useState({ title: '', type: 'Pessoal', date: '' })
  const [saving, setSaving] = useState(false)
  const [addModal, setAddModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<import('../types/event.types').CalEvent | null>(null)

  // Integrações
  const [integrations, setIntegrations] = useState<IntegrationStatus>({ google: false, outlook: false })
  const [syncWith, setSyncWith] = useState<Set<IntegrationProvider>>(new Set())
  const [modal, setModal] = useState<ModalState>({ open: false })
  const [connectingProvider, setConnectingProvider] = useState<IntegrationProvider | null>(null)
  const [disconnecting, setDisconnecting] = useState<IntegrationProvider | null>(null)
  const [integrationMsg, setIntegrationMsg] = useState<{ type: 'success' | 'error'; provider: string } | null>(null)

  const today = new Date()

  // Carrega eventos e status de integrações
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [evs, status] = await Promise.all([fetchEvents(), fetchIntegrationStatus()])
      setIntegrations(status)
      if (status.google) {
        const googleEvs = await fetchGoogleEvents()
        setEvents([...evs, ...googleEvs])
      } else {
        setEvents(evs)
      }
    } catch { /* silencioso */ }
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Detecta callback OAuth via postMessage (popup fecha e avisa a janela principal)
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type !== 'oauth_callback') return
      const { provider, status } = event.data as { provider: IntegrationProvider; status: string }
      setIntegrationMsg({ type: status === 'success' ? 'success' : 'error', provider })
      if (status === 'success') {
        setIntegrations(prev => ({ ...prev, [provider]: true }))
        setSyncWith(prev => new Set([...prev, provider]))
        setModal({ open: false })
        // Recarrega eventos para incluir os do Google
        loadData()
      }
      setTimeout(() => setIntegrationMsg(null), 4000)
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [loadData])

  // Feriados nacionais — omite quando Google já está conectado (traz feriados automaticamente)
  const holidays = useMemo(() => {
    if (integrations.google) return []
    const year = currentMonth.getFullYear()
    return [...getHolidays(year), ...getHolidays(year + 1)]
  }, [currentMonth, integrations.google])

  // Todos os eventos (usuário + Google + feriados) usados apenas para exibição
  const worldCupGames = useMemo(() => getBrazilWorldCup2026(), [])
  const allEvents = useMemo(() => [...events, ...holidays, ...worldCupGames], [events, holidays, worldCupGames])

  // Calendário
  const isCurrentMonth = today.getFullYear() === currentMonth.getFullYear() && today.getMonth() === currentMonth.getMonth()
  const monthName      = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1)
  const daysInMonth    = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  const days: (number | null)[] = []
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const dayKey = (d: number) =>
    `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const eventsOnDay = (d: number) => allEvents.filter(e => e.date === dayKey(d))

  const selectedDayEvents = selectedDay !== null ? eventsOnDay(selectedDay) : []
  const selectedDayDate   = selectedDay !== null
    ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDay)
    : null

  const upcomingEvents = [...allEvents]
    .filter(e => e.date >= today.toISOString().split('T')[0])
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8)

  const typeKeys  = Object.keys(TYPE_ICONS).filter(k => k !== 'Google Agenda' && k !== 'Feriado')
  const typeColors = [
    currentTheme.colors.primary, currentTheme.colors.accent,
    currentTheme.colors.primaryDark, currentTheme.colors.primary,
    currentTheme.colors.accent, currentTheme.colors.primaryDark,
  ]
  const getEventColor = (type: string) => {
    if (type === 'Google Agenda') return '#4285F4'
    if (type === 'Feriado')      return '#E84393'
    if (type === 'Copa 2026')    return '#16A34A'
    return typeColors[typeKeys.indexOf(type) % typeColors.length] || currentTheme.colors.primary
  }

  // Adicionar ou editar evento
  const handleAddEvent = async () => {
    if (!form.title.trim() || !form.date) return
    setSaving(true)
    try {
      if (editingEvent) {
        const updated = await updateEvent(editingEvent.id, form.title, form.date, form.type)
        setEvents(prev => prev.map(e => e.id === updated.id ? updated : e).sort((a, b) => a.date.localeCompare(b.date)))
      } else {
        const newEvent = await createEvent(form.title, form.date, form.type)
        setEvents(prev => [...prev, newEvent].sort((a, b) => a.date.localeCompare(b.date)))
        const toSync: ('google' | 'outlook')[] = []
        if (integrations.google)  toSync.push('google')
        if (integrations.outlook) toSync.push('outlook')
        await Promise.allSettled(toSync.map(provider => syncEventToCalendar(provider, newEvent)))
      }
      setForm({ title: '', type: 'Pessoal', date: '' })
      setEditingEvent(null)
      setAddModal(false)
    } catch { /* silencioso */ }
    setSaving(false)
  }

  const handleEditEvent = (event: import('../types/event.types').CalEvent) => {
    setEditingEvent(event)
    setForm({ title: event.title, date: event.date, type: event.type })
    setAddModal(true)
  }

  const handleDeleteEvent = async (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id))
    try { await deleteEvent(id) } catch { loadData() }
  }

  // Integrações
  const handleToggleSync = (provider: IntegrationProvider) => {
    if (!integrations[provider]) {
      // Não conectado → abre modal
      setModal({ open: true, provider })
      return
    }
    setSyncWith(prev => {
      const next = new Set(prev)
      next.has(provider) ? next.delete(provider) : next.add(provider)
      return next
    })
  }

  const handleConnect = async (provider: IntegrationProvider) => {
    setConnectingProvider(provider)
    try {
      const url = await getOAuthUrl(provider)
      window.open(url, 'oauth_popup', 'width=600,height=700,left=300,top=100')
    } catch { /* silencioso */ }
    setConnectingProvider(null)
  }

  const handleDisconnect = async (provider: IntegrationProvider) => {
    setDisconnecting(provider)
    try {
      await disconnectIntegration(provider)
      setIntegrations(prev => ({ ...prev, [provider]: false }))
      setSyncWith(prev => { const n = new Set(prev); n.delete(provider); return n })
      setModal({ open: false })
    } catch { /* silencioso */ }
    setDisconnecting(null)
  }

  const PROVIDERS = [
    {
      key: 'google'  as IntegrationProvider,
      label: 'Google Agenda',
      Icon: Chrome,
      color: '#4285F4',
      bg: '#EAF1FF',
    },
    {
      key: 'outlook' as IntegrationProvider,
      label: 'Outlook',
      Icon: Mail,
      color: '#0078D4',
      bg: '#E5F3FF',
    },
  ]

  const currentProvider = modal.open ? PROVIDERS.find(p => p.key === modal.provider)! : null

  return (
    <div className="flex-1 overflow-auto" style={{ background: currentTheme.colors.background }}>

      {/* Mensagem de callback OAuth */}
      {integrationMsg && (
        <div
          className="fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg text-white text-sm font-medium"
          style={{ background: integrationMsg.type === 'success' ? '#34D399' : '#F87171' }}
        >
          {integrationMsg.type === 'success'
            ? <Check className="w-4 h-4" />
            : <AlertCircle className="w-4 h-4" />}
          {integrationMsg.type === 'success'
            ? `${integrationMsg.provider === 'google' ? 'Google Agenda' : 'Outlook'} conectado com sucesso!`
            : `Erro ao conectar ${integrationMsg.provider === 'google' ? 'Google Agenda' : 'Outlook'}`}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 max-w-7xl mx-auto w-full">

        {/* Calendário */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl p-6" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-70 transition-all" style={{ background: currentTheme.colors.primaryLight }}>
                <ChevronLeft className="w-5 h-5" style={{ color: currentTheme.colors.primaryDark }} />
              </button>
              <h2 className="font-display text-[28px] font-semibold" style={{ color: currentTheme.colors.text }}>{capitalizedMonth}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAddModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-sm font-semibold hover:opacity-90 transition-all"
                  style={{ background: currentTheme.colors.primary }}
                >
                  <Plus className="w-4 h-4" />
                  Novo
                </button>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-70 transition-all" style={{ background: currentTheme.colors.primaryLight }}>
                  <ChevronRight className="w-5 h-5" style={{ color: currentTheme.colors.primaryDark }} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-3">
              {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'].map(day => (
                <div key={day} className="text-center p-2">
                  <p className="text-[13px] font-semibold" style={{ color: currentTheme.colors.textMuted }}>{day}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const isToday    = isCurrentMonth && day === today.getDate()
                const dayEvents  = day ? eventsOnDay(day) : []
                const isSelected = day === selectedDay
                return (
                  <div
                    key={index}
                    onClick={() => { if (!day) return; setSelectedDay(day === selectedDay ? null : day); setForm(f => ({ ...f, date: dayKey(day) })) }}
                    className="min-h-[80px] p-1.5 rounded-xl transition-all cursor-pointer flex flex-col"
                    style={{ background: isToday ? currentTheme.colors.primary : isSelected ? currentTheme.colors.primaryLight : 'transparent' }}
                  >
                    {day && (
                      <>
                        <p className="text-[11px] font-semibold text-center mb-1" style={{ color: isToday ? '#fff' : currentTheme.colors.text }}>{day}</p>
                        <div className="flex flex-col gap-0.5 flex-1">
                          {dayEvents.slice(0, 3).map(e => {
                            const holiday = e.type === 'Feriado'
                            return (
                              <div
                                key={e.id}
                                className={`text-[9px] leading-tight px-1.5 py-0.5 truncate w-full font-medium ${holiday ? 'rounded-full' : 'rounded'}`}
                                style={{
                                  background: isToday ? 'rgba(255,255,255,0.22)' : holiday ? '#FFE8F4' : getEventColor(e.type) + '22',
                                  color: isToday ? '#fff' : getEventColor(e.type),
                                }}
                                title={e.title}
                              >
                                {e.title}
                              </div>
                            )
                          })}
                          {dayEvents.length > 3 && (
                            <p className="text-[8px] text-center" style={{ color: isToday ? 'rgba(255,255,255,0.7)' : currentTheme.colors.textMuted }}>
                              +{dayEvents.length - 3}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t" style={{ borderColor: currentTheme.colors.primary + '15' }}>
              {Object.entries(TYPE_ICONS).map(([label, Icon]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Icon className="w-3 h-3" style={{ color: getEventColor(label) }} />
                  <span className="text-[12px]" style={{ color: currentTheme.colors.textMuted }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Painel direito */}
        <div className="flex flex-col gap-5">

          {/* Resumo do dia selecionado */}
          {selectedDay !== null && selectedDayDate && (
            <div className="rounded-2xl p-5" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: currentTheme.colors.textMuted }}>Compromissos do dia</p>
                  <h3 className="font-display text-base font-semibold capitalize" style={{ color: currentTheme.colors.text }}>
                    {selectedDayDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h3>
                </div>
                <button onClick={() => setSelectedDay(null)}>
                  <X className="w-4 h-4" style={{ color: currentTheme.colors.textMuted }} />
                </button>
              </div>

              {selectedDayEvents.length === 0 ? (
                <p className="text-sm text-center py-3" style={{ color: currentTheme.colors.textMuted }}>Nenhum evento neste dia</p>
              ) : (
                <div className="space-y-2">
                  {selectedDayEvents.map(event => {
                    const Icon    = TYPE_ICONS[event.type] || CalendarIcon
                    const color   = getEventColor(event.type)
                    const holiday = event.type === 'Feriado'
                    return holiday ? (
                      <div
                        key={event.id}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl"
                        style={{ background: 'linear-gradient(135deg, #FFF0F8, #FFF8FC)' }}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: '#FFE0F0' }}>
                          <Sparkles className="w-4 h-4" style={{ color: '#E84393' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: currentTheme.colors.text }}>{event.title}</p>
                          <p className="text-[11px] font-medium" style={{ color: '#E84393' }}>Feriado Nacional</p>
                        </div>
                      </div>
                    ) : (
                      <div
                        key={event.id}
                        className="group flex items-center gap-2.5 p-2.5 rounded-xl border-l-4"
                        style={{ borderColor: color, background: color + '0D' }}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: currentTheme.colors.text }}>{event.title}</p>
                          <p className="text-[11px]" style={{ color: currentTheme.colors.textMuted }}>{event.type}</p>
                        </div>
                        {event.type !== 'Google Agenda' && (
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => handleEditEvent(event)}>
                              <Pencil className="w-3.5 h-3.5" style={{ color: currentTheme.colors.textMuted }} />
                            </button>
                            <button onClick={() => handleDeleteEvent(event.id)}>
                              <Trash2 className="w-3.5 h-3.5" style={{ color: currentTheme.colors.textMuted }} />
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Toggle de sincronização */}
          <div className="rounded-2xl p-5" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: currentTheme.colors.textMuted }}>Sincronizar com</p>
            <div className="flex gap-2">
              {PROVIDERS.map(({ key, label, Icon, color, bg }) => {
                const connected = integrations[key]
                const active    = syncWith.has(key)
                return (
                  <button
                    key={key}
                    onClick={() => handleToggleSync(key)}
                    className="flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all hover:scale-105"
                    style={{
                      background: active ? bg : currentTheme.colors.background,
                      border: `2px solid ${active ? color : currentTheme.colors.primary + '20'}`,
                    }}
                  >
                    <div className="relative">
                      <Icon className="w-5 h-5" style={{ color: active ? color : currentTheme.colors.textMuted }} />
                      {connected && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2" style={{ background: '#34D399', borderColor: currentTheme.colors.surface }} />
                      )}
                    </div>
                    <span className="text-[10px] font-semibold leading-tight text-center" style={{ color: active ? color : currentTheme.colors.textMuted }}>
                      {label}
                    </span>
                    {connected && (
                      <span
                        className="text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded-full"
                        style={{ background: '#D1FAE5', color: '#065F46' }}
                      >
                        CONECTADO
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            <p className="text-[10px] mt-2 text-center" style={{ color: currentTheme.colors.textMuted }}>
              Clique para ativar · clique no ícone para configurar
            </p>
          </div>

          {/* Próximas datas */}
          <div className="rounded-2xl p-5" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
            <h3 className="font-display mb-4 text-lg font-semibold flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
              <CalendarIcon className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
              Próximas Datas
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {loading && (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: currentTheme.colors.primary }} />
                </div>
              )}
              {!loading && upcomingEvents.length === 0 && (
                <p className="text-sm text-center py-4" style={{ color: currentTheme.colors.textMuted }}>Nenhum evento próximo</p>
              )}
              {!loading && upcomingEvents.map(event => {
                const Icon    = TYPE_ICONS[event.type] || CalendarIcon
                const color   = getEventColor(event.type)
                const d       = new Date(event.date + 'T00:00')
                const holiday = event.type === 'Feriado'
                return holiday ? (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-3 rounded-2xl"
                    style={{ background: 'linear-gradient(135deg, #FFF0F8 0%, #FFF8FC 100%)' }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: '#FFE0F0' }}>
                      <Sparkles className="w-5 h-5" style={{ color: '#E84393' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: currentTheme.colors.text }}>{event.title}</p>
                      <p className="text-xs font-medium" style={{ color: '#E84393' }}>
                        {d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} · Feriado Nacional
                      </p>
                    </div>
                    <div className="flex-shrink-0 px-2 py-1 rounded-full"
                      style={{ background: '#FFE0F0' }}>
                      <Sparkles className="w-3 h-3" style={{ color: '#E84393' }} />
                    </div>
                  </div>
                ) : (
                  <div
                    key={event.id}
                    className="group flex items-center gap-3 p-3 rounded-xl border-l-4 hover:opacity-80 transition-all"
                    style={{ borderColor: color }}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: currentTheme.colors.primaryLight }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: currentTheme.colors.text }}>{event.title}</p>
                      <p className="text-xs" style={{ color: currentTheme.colors.textMuted }}>
                        {d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} · {event.type}
                      </p>
                    </div>
                    {event.type !== 'Google Agenda' && (
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => handleEditEvent(event)}>
                          <Pencil className="w-4 h-4" style={{ color: currentTheme.colors.textMuted }} />
                        </button>
                        <button onClick={() => handleDeleteEvent(event.id)}>
                          <Trash2 className="w-4 h-4" style={{ color: currentTheme.colors.textMuted }} />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Modal de adicionar evento */}
      {addModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) { setAddModal(false); setEditingEvent(null); setForm({ title: '', type: 'Pessoal', date: '' }) } }}
        >
          <div className="w-full max-w-sm rounded-3xl shadow-2xl" style={{ background: currentTheme.colors.surface }}>

            {/* Banner gradiente */}
            <div style={{
              background: `linear-gradient(135deg, ${currentTheme.colors.primaryDark} 0%, ${currentTheme.colors.primary} 60%, ${currentTheme.colors.accent} 100%)`,
              padding: '20px 22px 18px',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '24px 24px 0 0',
            }}>
              <div style={{ position: 'absolute', top: -24, right: -24, width: 90, height: 90, borderRadius: '50%', background: 'white', opacity: 0.08 }} />
              <div style={{ position: 'absolute', bottom: -14, right: 36, width: 56, height: 56, borderRadius: '50%', background: 'white', opacity: 0.06 }} />

              <div className="flex items-start justify-between relative">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {editingEvent ? 'Editar evento' : 'Novo evento'}
                  </p>
                  <h3 className="font-display font-bold text-base mt-0.5 text-white">
                    {editingEvent ? editingEvent.title : 'Adicionar ao calendário'}
                  </h3>
                </div>
                <button
                  onClick={() => { setAddModal(false); setEditingEvent(null); setForm({ title: '', type: 'Pessoal', date: '' }) }}
                  className="p-1.5 rounded-full transition-all hover:bg-white/20"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-5 flex flex-col gap-3">

              {(integrations.google || integrations.outlook) && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl" style={{ background: currentTheme.colors.primaryLight }}>
                  <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: currentTheme.colors.primary }} />
                  <span className="text-[11px] font-medium" style={{ color: currentTheme.colors.primaryDark }}>
                    Vai sincronizar com {[integrations.google && 'Google Agenda', integrations.outlook && 'Outlook'].filter(Boolean).join(' e ')}
                  </span>
                </div>
              )}

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Nome do evento</p>
                <input
                  type="text"
                  placeholder="Ex: Reunião, aniversário..."
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleAddEvent()}
                  autoFocus
                  className="w-full px-4 py-3 rounded-2xl outline-none text-sm transition-all"
                  style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }}
                />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Data</p>
                <DatePickerInput
                  value={form.date}
                  onChange={v => setForm(f => ({ ...f, date: v }))}
                  theme={currentTheme}
                />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Categoria</p>
                <TypeSelect
                  value={form.type}
                  onChange={v => setForm(f => ({ ...f, type: v }))}
                  options={Object.keys(TYPE_ICONS).filter(t => t !== 'Google Agenda' && t !== 'Feriado' && t !== 'Copa 2026')}
                  getColor={getEventColor}
                  getIcon={(t) => TYPE_ICONS[t]}
                  theme={currentTheme}
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => { setAddModal(false); setEditingEvent(null); setForm({ title: '', type: 'Pessoal', date: '' }) }}
                  className="flex-1 py-3 rounded-full text-sm font-semibold hover:opacity-80 transition-all"
                  style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddEvent}
                  disabled={saving}
                  className="flex-1 py-3 rounded-full text-white font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${currentTheme.colors.primaryDark}, ${currentTheme.colors.primary})`,
                    boxShadow: `0 6px 18px ${currentTheme.colors.primary}45`,
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingEvent ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de integração */}
      {modal.open && currentProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="rounded-2xl p-7 w-full max-w-sm shadow-2xl" style={{ background: currentTheme.colors.surface }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: currentProvider.bg }}>
                  <currentProvider.Icon className="w-5 h-5" style={{ color: currentProvider.color }} />
                </div>
                <h3 className="font-display text-lg font-bold" style={{ color: currentTheme.colors.text }}>
                  {integrations[currentProvider.key] ? currentProvider.label : `Conectar ${currentProvider.label}`}
                </h3>
              </div>
              <button onClick={() => setModal({ open: false })}>
                <X className="w-5 h-5" style={{ color: currentTheme.colors.textMuted }} />
              </button>
            </div>

            {integrations[currentProvider.key] ? (
              /* Já conectado */
              <>
                <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl" style={{ background: '#D1FAE5' }}>
                  <Check className="w-4 h-4 text-green-600" />
                  <p className="text-sm font-medium text-green-700">Integração ativa</p>
                </div>
                <p className="text-sm mb-5" style={{ color: currentTheme.colors.textMuted }}>
                  Seus novos eventos serão sincronizados automaticamente com o {currentProvider.label} quando a opção estiver ativada no painel de sincronização.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setSyncWith(prev => new Set([...prev, currentProvider.key])); setModal({ open: false }) }}
                    className="flex-1 py-2.5 rounded-full font-semibold text-white text-sm hover:opacity-90 transition-all"
                    style={{ background: currentProvider.color }}
                  >
                    Ativar sincronização
                  </button>
                  <button
                    onClick={() => handleDisconnect(currentProvider.key)}
                    disabled={disconnecting === currentProvider.key}
                    className="px-4 py-2.5 rounded-full text-sm font-medium hover:opacity-80 transition-all flex items-center gap-1"
                    style={{ background: '#FEE2E2', color: '#DC2626' }}
                  >
                    {disconnecting === currentProvider.key && <Loader2 className="w-3 h-3 animate-spin" />}
                    Desconectar
                  </button>
                </div>
              </>
            ) : (
              /* Não conectado */
              <>
                <p className="text-sm mb-4" style={{ color: currentTheme.colors.textMuted }}>
                  Ao conectar, o BeePlanner poderá adicionar seus eventos diretamente na sua agenda do {currentProvider.label}. Você autoriza somente uma vez.
                </p>
                <div className="rounded-xl p-4 mb-5" style={{ background: currentTheme.colors.primaryLight }}>
                  <p className="text-sm font-semibold mb-3" style={{ color: currentTheme.colors.text }}>Como funciona:</p>
                  <div className="space-y-2.5">
                    {[
                      { Icon: MousePointerClick, text: <>Clique em <strong>Conectar</strong> abaixo</> },
                      { Icon: ShieldCheck,       text: 'Autorize na janela que abrirá' },
                      { Icon: Sparkles,          text: 'Volte aqui — a integração fica pronta' },
                    ].map(({ Icon, text }, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: currentProvider!.bg }}
                        >
                          <Icon className="w-3.5 h-3.5" style={{ color: currentProvider!.color }} />
                        </div>
                        <span className="text-sm" style={{ color: currentTheme.colors.textMuted }}>{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleConnect(currentProvider.key)}
                    disabled={connectingProvider === currentProvider.key}
                    className="flex-1 py-2.5 rounded-full font-semibold text-white text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    style={{ background: currentProvider.color }}
                  >
                    {connectingProvider === currentProvider.key
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Abrindo...</>
                      : `Conectar ${currentProvider.label}`}
                  </button>
                  <button
                    onClick={() => { setIntegrations(prev => ({ ...prev, [currentProvider.key]: true })); setModal({ open: false }) }}
                    className="px-4 py-2.5 rounded-full text-sm font-medium hover:opacity-80 transition-all"
                    style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.textMuted }}
                  >
                    Já conectei
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
