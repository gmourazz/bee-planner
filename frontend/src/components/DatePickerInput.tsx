import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'

type ViewMode = 'calendar' | 'month' | 'year'

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const pad = (n: number) => String(n).padStart(2, '0')

function parseBR(s: string): string {
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return ''
  const [, d, mo, y] = m
  const dt = new Date(`${y}-${mo}-${d}T00:00`)
  if (isNaN(dt.getTime())) return ''
  return `${y}-${mo}-${d}`
}

function fmtBR(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function applyMask(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  let out = digits
  if (digits.length > 2) out = digits.slice(0, 2) + '/' + digits.slice(2)
  if (digits.length > 4) out = digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4)
  return out
}

export function DatePickerInput({ value, onChange, placeholder = 'Selecionar data', theme, direction = 'up' }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  theme: { colors: Record<string, string> }
  direction?: 'up' | 'down'
}) {
  const [open, setOpen]           = useState(false)
  const [viewMode, setViewMode]   = useState<ViewMode>('calendar')
  const [viewMonth, setViewMonth] = useState(() => value ? new Date(value + 'T00:00') : new Date())
  const [typed, setTyped]         = useState(fmtBR(value))
  const [coords, setCoords]       = useState<{ top: number; left: number; width: number } | null>(null)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const popupRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      const inWrapper = wrapperRef.current?.contains(e.target as Node)
      const inPopup   = popupRef.current?.contains(e.target as Node)
      if (!inWrapper && !inPopup) {
        setOpen(false)
        setViewMode('calendar')
        setTyped(fmtBR(value))
      }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [value])

  useEffect(() => {
    if (value) {
      setViewMonth(new Date(value + 'T00:00'))
      setTyped(fmtBR(value))
    }
  }, [value])

  const openCalendar = () => {
    if (direction === 'down' && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect()
      setCoords({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    }
    setOpen(o => !o)
  }

  const year        = viewMonth.getFullYear()
  const month       = viewMonth.getMonth()
  const monthLabel  = viewMonth.toLocaleDateString('pt-BR', { month: 'long' })
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay    = new Date(year, month, 1).getDay()
  const toStr = (d: number) => `${year}-${pad(month + 1)}-${pad(d)}`
  const today    = new Date()
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`

  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const currentYear = today.getFullYear()
  const years = Array.from({ length: 101 }, (_, i) => currentYear - i)

  function handleTyped(raw: string) {
    const masked = applyMask(raw)
    setTyped(masked)
    if (masked.length === 10) {
      const iso = parseBR(masked)
      if (iso) {
        onChange(iso)
        setViewMonth(new Date(iso + 'T00:00'))
        setOpen(false)
      }
    }
  }

  const selectDay = (dateStr: string) => {
    onChange(dateStr)
    setTyped(fmtBR(dateStr))
    setOpen(false)
  }

  const calendarBody = (
    <>
      {/* Vista: Calendário */}
      {viewMode === 'calendar' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={() => setViewMonth(new Date(year, month - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70 transition-all"
              style={{ background: theme.colors.primaryLight }}>
              <ChevronLeft className="w-4 h-4" style={{ color: theme.colors.primaryDark }} />
            </button>
            <button type="button" onClick={() => setViewMode('month')}
              className="font-bold text-base px-2 py-0.5 rounded-lg hover:opacity-70 transition-all"
              style={{ color: theme.colors.text, background: theme.colors.primaryLight }}>
              {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)} {year}
            </button>
            <button type="button" onClick={() => setViewMonth(new Date(year, month + 1))}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70 transition-all"
              style={{ background: theme.colors.primaryLight }}>
              <ChevronRight className="w-4 h-4" style={{ color: theme.colors.primaryDark }} />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
              <div key={i} className="text-center text-[11px] font-semibold py-1" style={{ color: theme.colors.textMuted }}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-0.5">
            {days.map((day, i) => {
              if (!day) return <div key={i} />
              const dateStr    = toStr(day)
              const isSelected = dateStr === value
              const isToday    = dateStr === todayStr
              return (
                <button key={i} type="button" onClick={() => selectDay(dateStr)}
                  className="w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm transition-all hover:opacity-80"
                  style={{
                    background: isSelected ? theme.colors.primary : isToday ? theme.colors.primaryLight : 'transparent',
                    color:      isSelected ? '#fff' : isToday ? theme.colors.primary : theme.colors.text,
                    fontWeight: isSelected || isToday ? '600' : '400',
                  }}>
                  {day}
                </button>
              )
            })}
          </div>

          <div className="mt-3 pt-3 border-t" style={{ borderColor: theme.colors.primary + '18' }}>
            <button type="button" onClick={() => selectDay(todayStr)}
              className="w-full py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{ background: theme.colors.primaryLight, color: theme.colors.primary }}>
              Hoje
            </button>
          </div>
        </>
      )}

      {/* Vista: Seletor de Mês */}
      {viewMode === 'month' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={() => setViewMonth(new Date(year - 1, month))}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70 transition-all"
              style={{ background: theme.colors.primaryLight }}>
              <ChevronLeft className="w-4 h-4" style={{ color: theme.colors.primaryDark }} />
            </button>
            <button type="button" onClick={() => setViewMode('year')}
              className="font-bold text-base px-2 py-0.5 rounded-lg hover:opacity-70 transition-all"
              style={{ color: theme.colors.text, background: theme.colors.primaryLight }}>
              {year}
            </button>
            <button type="button" onClick={() => setViewMonth(new Date(year + 1, month))}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70 transition-all"
              style={{ background: theme.colors.primaryLight }}>
              <ChevronRight className="w-4 h-4" style={{ color: theme.colors.primaryDark }} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {MONTHS.map((m, i) => (
              <button key={m} type="button" onClick={() => { setViewMonth(new Date(year, i)); setViewMode('calendar') }}
                className="py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                style={{ background: i === month ? theme.colors.primary : theme.colors.primaryLight, color: i === month ? '#fff' : theme.colors.text }}>
                {m}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Vista: Seletor de Ano */}
      {viewMode === 'year' && (
        <>
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-sm" style={{ color: theme.colors.text }}>Escolher ano</span>
            <button type="button" onClick={() => setViewMode('month')} className="text-xs font-semibold hover:opacity-70 transition-all" style={{ color: theme.colors.primary }}>
              ← Voltar
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5 max-h-44 overflow-y-auto pr-0.5">
            {years.map(y => (
              <button key={y} type="button" onClick={() => { setViewMonth(new Date(y, month)); setViewMode('month') }}
                className="py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                style={{ background: y === year ? theme.colors.primary : theme.colors.primaryLight, color: y === year ? '#fff' : theme.colors.text }}>
                {y}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  )

  const popupStyle: React.CSSProperties = {
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.primary}20`,
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
    padding: '16px',
    width: '256px',
  }

  return (
    <div ref={wrapperRef} className="relative w-full">

      {/* Input editável + ícone calendário */}
      <div className="w-full flex items-center px-3 py-3 rounded-2xl text-sm transition-all gap-2"
        style={{ background: theme.colors.primaryLight }}>
        <input
          type="text"
          value={typed}
          onChange={e => handleTyped(e.target.value)}
          onFocus={() => { if (direction === 'up') setOpen(true) }}
          placeholder={placeholder}
          maxLength={10}
          className="flex-1 min-w-0 bg-transparent outline-none text-sm"
          style={{ color: typed ? theme.colors.text : theme.colors.textMuted }}
        />
        <button type="button" onClick={openCalendar} className="flex-shrink-0">
          <CalendarIcon className="w-4 h-4" style={{ color: theme.colors.textMuted }} />
        </button>
      </div>

      {/* Popup para cima (padrão) — absolute normal */}
      {open && direction === 'up' && (
        <div ref={popupRef} className="absolute z-40 w-64 bottom-full mb-2" style={popupStyle}>
          {calendarBody}
        </div>
      )}

      {/* Popup para baixo — portal com fixed para escapar do overflow do modal */}
      {open && direction === 'down' && coords && ReactDOM.createPortal(
        <div ref={popupRef} style={{ position: 'fixed', top: coords.top, left: coords.left, zIndex: 9999, ...popupStyle }}>
          {calendarBody}
        </div>,
        document.body
      )}
    </div>
  )
}
