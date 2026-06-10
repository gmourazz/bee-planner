import {
  Calendar, Clock, PlusCircle, Trash2, Pencil, Loader2, X, Check,
  BookOpen, Calculator, FlaskConical, Code2, Globe, Microscope,
  Music, Palette, Dumbbell, Brain, BarChart2, Cpu, ChevronRight, GraduationCap,
} from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useUniversity } from '../hooks/useUniversity'
import { DatePickerInput } from '../components/DatePickerInput'
import type { UniSubject } from '../types/uni.types'

// ── Constantes ───────────────────────────────────────────────────────────────

const COLORS = ['#F472B6', '#A855F7', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']
const DAYS   = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB']

// Horários de 06:00 a 22:00
const HOURS = Array.from({ length: 17 }, (_, i) => `${String(i + 6).padStart(2, '0')}:00`)

const SUBJECT_ICONS = [
  { key: 'BookOpen',     Icon: BookOpen,     label: 'Geral'        },
  { key: 'Calculator',   Icon: Calculator,   label: 'Matemática'   },
  { key: 'FlaskConical', Icon: FlaskConical, label: 'Química'      },
  { key: 'Microscope',   Icon: Microscope,   label: 'Biologia'     },
  { key: 'Code2',        Icon: Code2,        label: 'Programação'  },
  { key: 'Cpu',          Icon: Cpu,          label: 'Computação'   },
  { key: 'Globe',        Icon: Globe,        label: 'Idiomas'      },
  { key: 'Brain',        Icon: Brain,        label: 'Psicologia'   },
  { key: 'BarChart2',    Icon: BarChart2,    label: 'Estatística'  },
  { key: 'Music',        Icon: Music,        label: 'Música'       },
  { key: 'Palette',      Icon: Palette,      label: 'Artes'        },
  { key: 'Dumbbell',     Icon: Dumbbell,     label: 'Ed. Física'   },
]

const ICON_MAP: Record<string, any> = Object.fromEntries(SUBJECT_ICONS.map(s => [s.key, s.Icon]))

// ── Componentes de apoio ─────────────────────────────────────────────────────

function ColorPicker({ value, onChange }: { value: number; onChange: (i: number) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {COLORS.map((c, i) => (
        <button key={i} type="button" onClick={() => onChange(i)}
          className="w-7 h-7 rounded-full transition-all hover:scale-110 relative flex-shrink-0"
          style={{ background: c }}>
          {value === i && <Check className="w-3.5 h-3.5 text-white absolute inset-0 m-auto" />}
        </button>
      ))}
    </div>
  )
}

function IconSelect({ value, onChange, theme }: { value: string; onChange: (k: string) => void; theme: any }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  const calcPos = useCallback(() => {
    if (!btnRef.current) return
    const r = btnRef.current.getBoundingClientRect()
    setPos({ top: r.bottom + 4, left: r.left, width: r.width })
  }, [])

  useEffect(() => {
    if (open) calcPos()
  }, [open, calcPos])

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node)) return
      if (dropRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const CurrentIcon = ICON_MAP[value] ?? BookOpen
  const current = SUBJECT_ICONS.find(s => s.key === value)

  const dropdown = open ? ReactDOM.createPortal(
    <div ref={dropRef}
      style={{ position: 'fixed', top: pos.top, left: pos.left, width: 260, zIndex: 9999, background: theme.colors.surface, border: `1px solid ${theme.colors.primary}20`, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', overflow: 'hidden', maxHeight: 260, overflowY: 'auto' }}>
      {SUBJECT_ICONS.map(opt => {
        const sel = opt.key === value
        return (
          <button key={opt.key} type="button" onClick={() => { onChange(opt.key); setOpen(false) }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:opacity-80 text-left"
            style={{ background: sel ? theme.colors.primaryLight : 'transparent', color: theme.colors.text }}>
            {sel ? <Check className="w-4 h-4 flex-shrink-0" style={{ color: theme.colors.primary }} />
                  : <span className="w-4 h-4 flex-shrink-0" />}
            <opt.Icon className="w-4 h-4 flex-shrink-0" style={{ color: theme.colors.primary }} />
            {opt.label}
          </button>
        )
      })}
    </div>,
    document.body
  ) : null

  return (
    <div className="relative w-full">
      <button ref={btnRef} type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 rounded-2xl text-sm font-medium h-[46px]"
        style={{ background: theme.colors.primaryLight, color: theme.colors.text }}>
        <span className="flex items-center gap-2 min-w-0">
          <CurrentIcon className="w-4 h-4 flex-shrink-0" style={{ color: theme.colors.primary }} />
          <span className="truncate">{current?.label ?? 'Geral'}</span>
        </span>
        <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} style={{ color: theme.colors.textMuted }} />
      </button>
      {dropdown}
    </div>
  )
}

function SubjectSelect({ value, onChange, subjects, theme, showOther = true }: { value: string; onChange: (v: string) => void; subjects: UniSubject[]; theme: any; showOther?: boolean }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos]   = useState({ top: 0, left: 0, width: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 4, left: r.left, width: r.width })
    }
  }, [open])

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node)) return
      if (dropRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const options = [...subjects.map(s => ({ value: s.name, label: s.name })), ...(showOther ? [{ value: '__outro__', label: 'Outra...' }] : [])]
  const label = options.find(o => o.value === value)?.label

  return (
    <div className="relative w-full">
      <button ref={btnRef} type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 rounded-2xl text-sm font-medium h-[46px]"
        style={{ background: theme.colors.primaryLight, color: value && value !== '__outro__' ? theme.colors.text : theme.colors.textMuted }}>
        <span>{label ?? 'Selecionar matéria...'}</span>
        <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} style={{ color: theme.colors.textMuted }} />
      </button>
      {open && ReactDOM.createPortal(
        <div ref={dropRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: Math.max(pos.width, 200), zIndex: 9999, background: theme.colors.surface, border: `1px solid ${theme.colors.primary}20`, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', overflow: 'hidden', maxHeight: 240, overflowY: 'auto' }}>
          {options.map(opt => {
            const sel = opt.value === value
            return (
              <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setOpen(false) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:opacity-80 text-left"
                style={{ background: sel ? theme.colors.primaryLight : 'transparent', color: theme.colors.text }}>
                {sel
                  ? <Check className="w-4 h-4 flex-shrink-0" style={{ color: theme.colors.primary }} />
                  : <span className="w-4 h-4 flex-shrink-0" />}
                {opt.label}
              </button>
            )
          })}
        </div>,
        document.body
      )}
    </div>
  )
}

function TimeSelect({ value, onChange, theme }: { value: string; onChange: (v: string) => void; theme: any }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos]   = useState({ top: 0, left: 0, width: 0 })
  const btnRef  = useRef<HTMLButtonElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 4, left: r.left, width: r.width })
    }
  }, [open])

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node)) return
      if (dropRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <div className="relative w-full">
      <button ref={btnRef} type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 rounded-2xl text-sm font-semibold h-[46px]"
        style={{ background: theme.colors.primaryLight, color: theme.colors.primary }}>
        <span>{value}</span>
        <Clock className="w-4 h-4" style={{ color: theme.colors.primary, opacity: 0.6 }} />
      </button>
      {open && ReactDOM.createPortal(
        <div ref={dropRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: Math.max(pos.width, 140), zIndex: 9999, background: theme.colors.surface, border: `1px solid ${theme.colors.primary}20`, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', maxHeight: 240, overflowY: 'auto' }}>
          {HOURS.map(h => {
            const sel = h === value
            return (
              <button key={h} type="button" onClick={() => { onChange(h); setOpen(false) }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:opacity-80 text-left font-medium"
                style={{ background: sel ? theme.colors.primaryLight : 'transparent', color: sel ? theme.colors.primary : theme.colors.text }}>
                {sel
                  ? <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: theme.colors.primary }} />
                  : <span className="w-3.5 h-3.5 flex-shrink-0" />}
                {h}
              </button>
            )
          })}
        </div>,
        document.body
      )}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export function UniversityPage() {
  const { currentTheme: theme } = useTheme()
  const {
    subjects, schedule, exams, semesters, loading, error, carregar,
    showSubjectModal,  openAddSubject,  closeSubjectModal,  openEditSubject, saveSubject,  removeSubject,  editingSubject, subjectForm,  setSubjectForm,
    showScheduleModal, openAddSchedule, closeScheduleModal,                  saveSchedule, removeSchedule,                scheduleForm, setScheduleForm,
    showExamModal,     openAddExam,     closeExamModal,  openEditExam,        saveExam,     toggleExam,     removeExam,    examForm,     setExamForm,  editingExam,
    showSemesterModal, openAddSemester, closeSemesterModal,                  saveSemester, ativarSemestre, encerrarSemestre, removeSemester, semesterForm, setSemesterForm,
    saving,
  } = useUniversity()

  const [activeTab, setActiveTab] = useState<'schedule' | 'exams' | 'subjects' | 'semesters'>('schedule')

  const semesterAtual = semesters.find(s => s.isCurrent) ?? null

  // Filtros de matérias
  const [filtroSemestre,  setFiltroSemestre]  = useState('')
  const [filtroMateria,   setFiltroMateria]   = useState('')
  const [filtroProfessor, setFiltroProfessor] = useState('')
  const [filtroStatus,    setFiltroStatus]    = useState<'' | 'open' | 'done'>('')

  const semestresUnicos   = [...new Set(subjects.map(s => s.semester).filter(Boolean))].sort()
  const professoresUnicos = [...new Set(subjects.map(s => s.professor).filter(Boolean))].sort()

  // Filtra pelo semestre atual (se definido) + filtros manuais
  const scheduleFiltrado = semesterAtual
    ? schedule.filter(s => s.semester === semesterAtual.name)
    : schedule

  const examsFiltrados = semesterAtual && semesterAtual.startDate && semesterAtual.endDate
    ? exams.filter(e => e.examDate >= semesterAtual.startDate! && e.examDate <= semesterAtual.endDate!)
    : exams

  const subjectsFiltrados = subjects.filter(s => {
    if (semesterAtual    && s.semester       !== semesterAtual.name) return false
    if (filtroSemestre  && s.semester       !== filtroSemestre)  return false
    if (filtroMateria   && !s.name.toLowerCase().includes(filtroMateria.toLowerCase())) return false
    if (filtroProfessor && s.professor      !== filtroProfessor) return false
    if (filtroStatus    && s.subjectStatus  !== filtroStatus)    return false
    return true
  })

  const filtrosAtivos = !!(filtroSemestre || filtroMateria || filtroProfessor || filtroStatus)

  const avgGrade = subjects.length > 0 && subjects.some(s => s.grade !== null)
    ? (subjects.filter(s => s.grade !== null).reduce((acc, s) => acc + (s.grade ?? 0), 0) / subjects.filter(s => s.grade !== null).length).toFixed(1)
    : null

  return (
    <div className="flex-1 overflow-auto" style={{ background: theme.colors.background }}>
      <div className="max-w-7xl mx-auto w-full">
      {/* ── HERO BANNER ───────────────────────────────────────────────────── */}
      <div style={{ background: theme.colors.surface, borderBottom: `1px solid ${theme.colors.primary}18`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: theme.colors.primaryLight, opacity: 0.5 }} />
        <div style={{ position: 'absolute', bottom: -20, left: 60, width: 80, height: 80, borderRadius: '50%', background: theme.colors.primaryLight, opacity: 0.35 }} />
        <div className="relative px-6 pt-5 pb-4">
          {/* Stats + botão na mesma linha */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { label: 'Aulas na semana', value: scheduleFiltrado.length },
                { label: 'Matérias ativas', value: (semesterAtual ? subjects.filter(s => s.semester === semesterAtual.name && s.subjectStatus === 'open') : subjects.filter(s => s.subjectStatus === 'open')).length },
                { label: 'Provas e datas', value: examsFiltrados.length },
              ].map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-2">
                  {i > 0 && <span style={{ color: theme.colors.primary, opacity: 0.25, fontSize: 18 }}>·</span>}
                  <span className="text-[11px] font-medium" style={{ color: theme.colors.textMuted }}>{stat.label}</span>
                  <span className="text-sm font-black" style={{ color: theme.colors.text }}>{stat.value}</span>
                </div>
              ))}
            </div>
            {/* Semestre atual + Botão de ação */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {semesterAtual && (
                <button onClick={() => setActiveTab('semesters')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:opacity-80"
                  style={{ background: theme.colors.primaryLight, color: theme.colors.primary, border: `1px solid ${theme.colors.primary}30` }}>
                  <GraduationCap className="w-3 h-3" />
                  {semesterAtual.name}
                </button>
              )}
              {activeTab === 'schedule' && (
                <button onClick={openAddSchedule} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all hover:scale-105"
                  style={{ background: theme.colors.primary, color: 'white' }}>
                  <PlusCircle className="w-3.5 h-3.5" />Nova aula
                </button>
              )}
              {activeTab === 'exams' && (
                <button onClick={openAddExam} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all hover:scale-105"
                  style={{ background: theme.colors.primary, color: 'white' }}>
                  <PlusCircle className="w-3.5 h-3.5" />Nova prova
                </button>
              )}
              {activeTab === 'subjects' && (
                <button onClick={openAddSubject} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all hover:scale-105"
                  style={{ background: theme.colors.primary, color: 'white' }}>
                  <PlusCircle className="w-3.5 h-3.5" />Nova matéria
                </button>
              )}
              {activeTab === 'semesters' && (
                <button onClick={openAddSemester} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all hover:scale-105"
                  style={{ background: theme.colors.primary, color: 'white' }}>
                  <PlusCircle className="w-3.5 h-3.5" />Novo semestre
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 rounded-2xl p-1" style={{ background: theme.colors.primaryLight, width: 'fit-content' }}>
            {([
              { id: 'schedule',  label: 'Grade Horária',  Icon: Clock },
              { id: 'exams',     label: 'Provas & Datas', Icon: Calendar },
              { id: 'subjects',  label: 'Matérias',       Icon: BookOpen },
              { id: 'semesters', label: 'Semestres',      Icon: GraduationCap },
            ] as const).map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: activeTab === id ? theme.colors.surface : 'transparent', color: activeTab === id ? theme.colors.primary : theme.colors.textMuted, boxShadow: activeTab === id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTEÚDO ──────────────────────────────────────────────────────── */}
      <div className="p-6">
        {loading && (
          <div className="flex items-center justify-center py-20 gap-2" style={{ color: theme.colors.textMuted }}>
            <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Carregando...</span>
          </div>
        )}
        {!loading && error && (
          <div className="py-8 text-center">
            <p className="text-sm text-red-500">{error}</p>
            <button onClick={carregar} className="mt-2 text-xs underline" style={{ color: theme.colors.primary }}>Tentar novamente</button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* ── GRADE HORÁRIA ─────────────────────────────────────────── */}
            {activeTab === 'schedule' && (
              <div className="rounded-3xl overflow-hidden" style={{ background: theme.colors.surface, boxShadow: `0 4px 24px ${theme.colors.primary}12` }}>
                <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
                  <table style={{ width: '100%', minWidth: 560, borderCollapse: 'collapse' }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                      <tr>
                        <th style={{ width: 64, padding: '10px 8px', textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: theme.colors.textMuted, background: theme.colors.surface, borderBottom: `1px solid ${theme.colors.primary}12` }}>
                          Hora
                        </th>
                        {DAYS.map(d => (
                          <th key={d} style={{ padding: '10px 6px', textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: theme.colors.primaryDark, background: theme.colors.primaryLight, borderBottom: `1px solid ${theme.colors.primary}20`, borderLeft: `1px solid ${theme.colors.primary}10` }}>
                            {d}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {HOURS.map(hour => (
                        <tr key={hour} style={{ borderBottom: `1px solid ${theme.colors.primary}08` }}>
                          <td style={{ width: 64, padding: '4px 8px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: theme.colors.textMuted, whiteSpace: 'nowrap', borderRight: `1px solid ${theme.colors.primary}10` }}>
                            {hour}
                          </td>
                          {[1,2,3,4,5,6].map(day => {
                            const item = scheduleFiltrado.find(s => s.dayOfWeek === day && s.timeStart === hour)
                            const color = item ? COLORS[item.colorIdx % COLORS.length] : null
                            return (
                              <td key={day} style={{ padding: 6, minWidth: 80, height: 52, verticalAlign: 'top', borderLeft: `1px solid ${theme.colors.primary}08` }}>
                                {item && color && (
                                  <div className="h-full rounded-xl p-2 relative group" style={{ background: color + '18', borderLeft: `3px solid ${color}` }}>
                                    <p style={{ fontSize: 11, fontWeight: 700, color, lineHeight: 1.2 }}>{item.subjectName}</p>
                                    {item.room && <p style={{ fontSize: 10, color: theme.colors.textMuted, marginTop: 2 }}>{item.room}</p>}
                                    <button onClick={() => removeSchedule(item.id)}
                                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 w-4 h-4 rounded-full flex items-center justify-center transition-all"
                                      style={{ background: color + '40' }}>
                                      <X className="w-2.5 h-2.5" style={{ color }} />
                                    </button>
                                  </div>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── PROVAS & DATAS ────────────────────────────────────────── */}
            {activeTab === 'exams' && (
              <>
                {examsFiltrados.length === 0 ? (
                  <div className="text-center py-20" style={{ color: theme.colors.textMuted }}>
                    <Calendar className="w-14 h-14 mx-auto mb-3 opacity-25" />
                    <p className="text-sm font-medium">Nenhuma prova cadastrada ainda.</p>
                    <p className="text-xs mt-1 opacity-70">Clique em "Nova prova" para começar.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {examsFiltrados.map(exam => {
                      const dt = new Date(exam.examDate + 'T00:00')
                      const dayNum = dt.getDate()
                      const monthStr = dt.toLocaleDateString('pt-BR', { month: 'short' }).replace('.','')
                      const today = new Date(); today.setHours(0,0,0,0)
                      const daysLeft = Math.ceil((dt.getTime() - today.getTime()) / 86400000)
                      const past = daysLeft < 0
                      const done = exam.status === 'done'
                      const accentColor = done ? theme.colors.primaryDark : past ? '#f97316' : theme.colors.primary
                      return (
                        <div key={exam.id}
                          className="flex items-center gap-4 p-4 rounded-2xl group hover:shadow-md transition-all"
                          style={{ background: theme.colors.surface, boxShadow: `0 2px 12px ${theme.colors.primary}08` }}>
                          {/* Calendário visual */}
                          <div className="w-14 flex-shrink-0 rounded-2xl overflow-hidden text-center" style={{ background: accentColor + '15', border: `1.5px solid ${accentColor}25` }}>
                            <div className="py-0.5 text-[9px] font-black uppercase tracking-wider" style={{ background: accentColor, color: '#fff' }}>{monthStr}</div>
                            <div className="py-1.5 text-xl font-black leading-none" style={{ color: accentColor }}>{dayNum}</div>
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm leading-tight" style={{ color: theme.colors.text, opacity: done ? 0.5 : 1, textDecoration: done ? 'line-through' : 'none' }}>{exam.subject}</p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: accentColor + '18', color: accentColor }}>{exam.type}</span>
                              {!done && (
                                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: past ? '#fef3c7' : theme.colors.primaryLight, color: past ? '#92400e' : theme.colors.textMuted }}>
                                  {past ? `há ${Math.abs(daysLeft)}d` : daysLeft === 0 ? '🎯 Hoje!' : `em ${daysLeft}d`}
                                </span>
                              )}
                              {done && <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: '#dcfce7', color: '#166534' }}>Concluída</span>}
                              {exam.description && <span className="text-[11px] truncate max-w-[140px]" style={{ color: theme.colors.textMuted }}>{exam.description}</span>}
                            </div>
                          </div>
                          {/* Ações */}
                          <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => openEditExam(exam)}
                              className="w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-all"
                              style={{ background: theme.colors.primaryLight }}>
                              <Pencil className="w-3.5 h-3.5" style={{ color: theme.colors.primary }} />
                            </button>
                            <button onClick={() => toggleExam(exam.id)}
                              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                              style={{ background: done ? theme.colors.primaryLight : theme.colors.primary }}>
                              <Check className="w-3.5 h-3.5" style={{ color: done ? theme.colors.primary : '#fff' }} />
                            </button>
                            <button onClick={() => removeExam(exam.id)}
                              className="w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-all"
                              style={{ background: '#fee2e2' }}>
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}

            {/* ── MATÉRIAS ──────────────────────────────────────────────── */}
            {activeTab === 'subjects' && (
              <>
                {/* Filtros */}
                {subjects.length > 0 && (
                  <div className="flex flex-col gap-3 mb-5">
                    {/* Linha 1: busca */}
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl" style={{ background: theme.colors.surface, boxShadow: `0 2px 8px ${theme.colors.primary}08` }}>
                      <BookOpen className="w-3.5 h-3.5 flex-shrink-0" style={{ color: theme.colors.textMuted }} />
                      <input type="text" placeholder="Buscar matéria..." value={filtroMateria}
                        onChange={e => setFiltroMateria(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-sm" style={{ color: theme.colors.text }} />
                      {filtroMateria && <button onClick={() => setFiltroMateria('')}><X className="w-3.5 h-3.5" style={{ color: theme.colors.textMuted }} /></button>}
                    </div>
                    {/* Linha 2: pills */}
                    <div className="flex flex-wrap gap-2 items-center">
                      {/* Status */}
                      {[{ v: '' as '' | 'open' | 'done', label: 'Todos' }, { v: 'open' as const, label: '● Em Aberto' }, { v: 'done' as const, label: '✓ Finalizado' }].map(opt => (
                        <button key={opt.v} onClick={() => setFiltroStatus(opt.v)}
                          className="px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:opacity-80"
                          style={{ background: filtroStatus === opt.v ? theme.colors.primary : theme.colors.primaryLight, color: filtroStatus === opt.v ? 'white' : theme.colors.textMuted }}>
                          {opt.label}
                        </button>
                      ))}
                      <span style={{ width: 1, height: 16, background: theme.colors.primary, opacity: 0.15 }} />
                      {/* Semestres */}
                      {semestresUnicos.map(s => (
                        <button key={s} onClick={() => setFiltroSemestre(filtroSemestre === s ? '' : s)}
                          className="px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:opacity-80"
                          style={{ background: filtroSemestre === s ? theme.colors.primaryDark : theme.colors.primaryLight, color: filtroSemestre === s ? 'white' : theme.colors.textMuted }}>
                          {s}
                        </button>
                      ))}
                      {/* Professores */}
                      {professoresUnicos.map(p => (
                        <button key={p} onClick={() => setFiltroProfessor(filtroProfessor === p ? '' : p)}
                          className="px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:opacity-80"
                          style={{ background: filtroProfessor === p ? theme.colors.accent : theme.colors.primaryLight, color: filtroProfessor === p ? 'white' : theme.colors.textMuted }}>
                          {p}
                        </button>
                      ))}
                      {filtrosAtivos && (
                        <button onClick={() => { setFiltroSemestre(''); setFiltroMateria(''); setFiltroProfessor(''); setFiltroStatus('') }}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold hover:opacity-80 transition-all"
                          style={{ background: '#fee2e2', color: '#ef4444' }}>
                          Limpar filtros
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {subjects.length === 0 ? (
                  <div className="text-center py-20" style={{ color: theme.colors.textMuted }}>
                    <BookOpen className="w-14 h-14 mx-auto mb-3 opacity-25" />
                    <p className="text-sm font-medium">Nenhuma matéria cadastrada ainda.</p>
                    <p className="text-xs mt-1 opacity-70">Clique em "Nova matéria" para começar.</p>
                  </div>
                ) : subjectsFiltrados.length === 0 ? (
                  <div className="text-center py-16" style={{ color: theme.colors.textMuted }}>
                    <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-25" />
                    <p className="text-sm">Nenhuma matéria com esses filtros.</p>
                    <button onClick={() => { setFiltroSemestre(''); setFiltroMateria(''); setFiltroProfessor(''); setFiltroStatus('') }}
                      className="mt-2 text-xs underline" style={{ color: theme.colors.primary }}>Limpar filtros</button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {subjectsFiltrados.map(subject => {
                        const color = COLORS[subject.colorIdx % COLORS.length]
                        const SubjectIcon = ICON_MAP[subject.icon] ?? BookOpen
                        const overAbsences = subject.maxAbsences > 0 && subject.absences >= subject.maxAbsences
                        return (
                          <div key={subject.id} className="rounded-3xl overflow-hidden group transition-all hover:shadow-lg hover:-translate-y-0.5"
                            style={{ background: theme.colors.surface, boxShadow: `0 2px 16px ${theme.colors.primary}10` }}>
                            {/* Faixa colorida no topo */}
                            <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
                            <div className="p-5">
                              {/* Ações */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: color + '18' }}>
                                  <SubjectIcon className="w-5 h-5" style={{ color }} />
                                </div>
                                <div className="flex flex-col items-end gap-1.5">
                                  {subject.semester && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: theme.colors.primaryLight, color: theme.colors.primaryDark }}>
                                      Semestre {subject.semester}
                                    </span>
                                  )}
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => openEditSubject(subject)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: theme.colors.primaryLight }}>
                                      <Pencil className="w-3 h-3" style={{ color: theme.colors.primary }} />
                                    </button>
                                    <button onClick={() => removeSubject(subject.id)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: '#fee2e2' }}>
                                      <Trash2 className="w-3 h-3 text-red-400" />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Nome */}
                              <h3 className="font-display font-bold text-base leading-tight mb-2" style={{ color: theme.colors.text }}>{subject.name}</h3>

                              {/* Pills */}
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {subject.professor && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: color + '15', color }}>{subject.professor}</span>
                                )}
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                  style={{ background: subject.subjectStatus === 'done' ? '#dcfce7' : '#fef9c3', color: subject.subjectStatus === 'done' ? '#166534' : '#854d0e' }}>
                                  {subject.subjectStatus === 'done' ? '✓ Finalizado' : '● Em Aberto'}
                                </span>
                              </div>

                              {/* Período */}
                              {(subject.startDate || subject.endDate) && (
                                <div className="flex items-center gap-1.5 mb-3 text-[11px]" style={{ color: theme.colors.textMuted }}>
                                  <Calendar className="w-3 h-3 flex-shrink-0" />
                                  {subject.startDate ? subject.startDate.split('-').reverse().join('/') : '?'}
                                  {' → '}
                                  {subject.endDate ? subject.endDate.split('-').reverse().join('/') : '?'}
                                </div>
                              )}

                              {/* Divider */}
                              <div className="h-px mb-3" style={{ background: `${theme.colors.primary}10` }} />

                              {/* Stats linha */}
                              <div className="flex items-center gap-3">
                                {subject.grade !== null && (
                                  <div className="text-center">
                                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.colors.textMuted }}>Nota</p>
                                    <p className="text-base font-black" style={{ color: subject.grade >= 6 ? theme.colors.primary : '#f97316' }}>{subject.grade}</p>
                                  </div>
                                )}
                                {(subject.absences > 0 || subject.maxAbsences > 0) && (
                                  <div className="text-center">
                                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.colors.textMuted }}>Faltas</p>
                                    <p className="text-base font-black" style={{ color: overAbsences ? '#ef4444' : theme.colors.text }}>
                                      {subject.absences}{subject.maxAbsences > 0 ? `/${subject.maxAbsences}` : ''}
                                    </p>
                                  </div>
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.colors.textMuted }}>Freq.</p>
                                    <p className="text-[11px] font-bold" style={{ color: subject.attendance >= 75 ? theme.colors.primary : '#f97316' }}>{subject.attendance}%</p>
                                  </div>
                                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: theme.colors.primaryLight }}>
                                    <div className="h-full rounded-full transition-all"
                                      style={{ width: `${subject.attendance}%`, background: subject.attendance >= 75 ? `linear-gradient(90deg, ${color}, ${theme.colors.accent})` : 'linear-gradient(90deg, #fb923c, #f97316)' }} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Resumo */}
                    <div className="mt-5 rounded-3xl p-5" style={{ background: theme.colors.surface, boxShadow: `0 2px 16px ${theme.colors.primary}10` }}>
                      <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <h3 className="font-bold text-sm" style={{ color: theme.colors.text }}>Resumo do Semestre</h3>
                        {[...new Set(subjects.map(s => s.semester).filter(Boolean))].map(sem => (
                          <span key={sem} className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: theme.colors.primaryLight, color: theme.colors.primaryDark }}>{sem}</span>
                        ))}
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { label: 'Matérias', value: `${subjects.length} ativas` },
                          { label: 'Média Geral', value: avgGrade ?? '—' },
                          { label: 'Freq. Média', value: `${subjects.length > 0 ? Math.round(subjects.reduce((a,s) => a + s.attendance, 0) / subjects.length) : 0}%` },
                        ].map(s => (
                          <div key={s.label} className="rounded-2xl p-3 text-center" style={{ background: theme.colors.primaryLight }}>
                            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: theme.colors.textMuted }}>{s.label}</p>
                            <p className="text-lg font-black" style={{ color: theme.colors.primaryDark }}>{s.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
            {/* ── SEMESTRES ─────────────────────────────────────────── */}
            {activeTab === 'semesters' && (
              <>
                {semesters.length === 0 ? (
                  <div className="text-center py-20" style={{ color: theme.colors.textMuted }}>
                    <GraduationCap className="w-14 h-14 mx-auto mb-3 opacity-25" />
                    <p className="text-sm font-medium">Nenhum semestre cadastrado.</p>
                    <p className="text-xs mt-1 opacity-70">Clique em "Novo semestre" para começar.</p>
                  </div>
                ) : (
                  <div className="grid gap-3 max-w-2xl">
                    {semesters.map(sem => (
                      <div key={sem.id} className="flex items-center justify-between px-5 py-4 rounded-2xl transition-all"
                        style={{ background: theme.colors.surface, boxShadow: sem.isCurrent ? `0 0 0 2px ${theme.colors.primary}` : `0 2px 12px ${theme.colors.primary}10` }}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: sem.isCurrent ? theme.colors.primary : theme.colors.primaryLight }}>
                            <GraduationCap className="w-5 h-5" style={{ color: sem.isCurrent ? 'white' : theme.colors.primary }} />
                          </div>
                          <div>
                            <p className="font-bold text-sm flex items-center gap-2" style={{ color: theme.colors.text }}>
                              {sem.name}
                              {sem.isCurrent && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                  style={{ background: theme.colors.primary, color: 'white' }}>
                                  Atual
                                </span>
                              )}
                            </p>
                            {(sem.startDate || sem.endDate) && (
                              <p className="text-xs mt-0.5" style={{ color: theme.colors.textMuted }}>
                                {sem.startDate ? new Date(sem.startDate + 'T00:00').toLocaleDateString('pt-BR') : '?'}
                                {' → '}
                                {sem.endDate ? new Date(sem.endDate + 'T00:00').toLocaleDateString('pt-BR') : '?'}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!sem.isCurrent && (
                            <button onClick={() => ativarSemestre(sem.id)}
                              className="px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:opacity-80"
                              style={{ background: theme.colors.primaryLight, color: theme.colors.primary }}>
                              Definir como atual
                            </button>
                          )}
                          {sem.isCurrent && (
                            <button onClick={() => encerrarSemestre(sem.id)}
                              className="px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:opacity-80"
                              style={{ background: '#FEF3C7', color: '#D97706' }}>
                              Encerrar semestre
                            </button>
                          )}
                          <button onClick={() => removeSemester(sem.id)}
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70 transition-all"
                            style={{ background: theme.colors.primaryLight }}>
                            <Trash2 className="w-3.5 h-3.5" style={{ color: theme.colors.textMuted }} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* ── MODAL MATÉRIA ─────────────────────────────────────────────────── */}
      {showSubjectModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) closeSubjectModal() }}>
          <div className="w-full max-w-xl rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]" style={{ background: theme.colors.surface }}>

            {/* Banner gradiente */}
            <div style={{
              background: `linear-gradient(135deg, ${theme.colors.primaryDark} 0%, ${theme.colors.primary} 60%, ${theme.colors.accent} 100%)`,
              padding: '20px 22px 18px', position: 'relative', overflow: 'hidden',
              borderRadius: '24px 24px 0 0',
            }}>
              <div style={{ position: 'absolute', top: -24, right: -24, width: 90, height: 90, borderRadius: '50%', background: 'white', opacity: 0.08 }} />
              <div style={{ position: 'absolute', bottom: -14, right: 36, width: 56, height: 56, borderRadius: '50%', background: 'white', opacity: 0.06 }} />
              <div className="flex items-start justify-between relative">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.18)' }}>
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      {editingSubject ? 'Editar matéria' : 'Nova matéria'}
                    </p>
                    <h3 className="font-display font-bold text-base mt-0.5 text-white">
                      {editingSubject ? 'Atualizar registro' : 'Adicionar matéria'}
                    </h3>
                  </div>
                </div>
                <button onClick={closeSubjectModal} className="p-1.5 rounded-full transition-all hover:bg-white/20">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-5 flex flex-col gap-3">

              {/* Nome + Professor na mesma linha */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.colors.textMuted }}>Nome *</p>
                  <input autoFocus type="text" placeholder="Ex: Cálculo II" value={subjectForm.name}
                    onChange={e => setSubjectForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                    style={{ background: theme.colors.primaryLight, color: theme.colors.text }} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.colors.textMuted }}>Professor</p>
                  <input type="text" placeholder="Ex: Prof. Silva" value={subjectForm.professor}
                    onChange={e => setSubjectForm(f => ({ ...f, professor: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                    style={{ background: theme.colors.primaryLight, color: theme.colors.text }} />
                </div>
              </div>

              {/* Créditos + Nota + Ícone */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.colors.textMuted }}>Créditos</p>
                  <input type="number" min={1} max={12} value={subjectForm.credits}
                    onChange={e => setSubjectForm(f => ({ ...f, credits: Number(e.target.value) }))}
                    className="w-full px-3 py-3 rounded-2xl outline-none text-sm text-center"
                    style={{ background: theme.colors.primaryLight, color: theme.colors.text }} />
                </div>
                <div style={{ opacity: subjectForm.subjectStatus === 'open' ? 0.4 : 1, transition: 'opacity 0.2s' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.colors.textMuted }}>Nota (0-10)</p>
                  <input type="number" min={0} max={10} step={0.1} placeholder="—"
                    disabled={subjectForm.subjectStatus === 'open'}
                    value={subjectForm.grade ?? ''}
                    onChange={e => setSubjectForm(f => ({ ...f, grade: e.target.value === '' ? null : Number(e.target.value) }))}
                    className="w-full px-3 py-3 rounded-2xl outline-none text-sm text-center"
                    style={{ background: theme.colors.primaryLight, color: theme.colors.text, cursor: subjectForm.subjectStatus === 'open' ? 'not-allowed' : 'text' }} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.colors.textMuted }}>Ícone</p>
                  <IconSelect value={subjectForm.icon} onChange={k => setSubjectForm(f => ({ ...f, icon: k }))} theme={theme} />
                </div>
              </div>

              {/* Semestre + Data Início + Data Fim */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.colors.textMuted }}>Semestre</p>
                  <input type="text" placeholder="2026.1" value={subjectForm.semester}
                    onChange={e => setSubjectForm(f => ({ ...f, semester: e.target.value }))}
                    className="w-full px-3 py-3 rounded-2xl outline-none text-sm"
                    style={{ background: theme.colors.primaryLight, color: theme.colors.text }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.colors.textMuted }}>Início</p>
                  <DatePickerInput
                    value={subjectForm.startDate ?? ''}
                    onChange={v => setSubjectForm(f => ({ ...f, startDate: v || null }))}
                    theme={theme}
                    placeholder="dd/mm/aaaa"
                    direction="down"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.colors.textMuted }}>Fim</p>
                  <DatePickerInput
                    value={subjectForm.endDate ?? ''}
                    onChange={v => setSubjectForm(f => ({ ...f, endDate: v || null }))}
                    theme={theme}
                    placeholder="dd/mm/aaaa"
                    direction="down"
                  />
                </div>
              </div>

              {/* Frequência + Faltas na mesma linha */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 72px 72px', gap: '12px', opacity: subjectForm.subjectStatus === 'open' ? 0.4 : 1, transition: 'opacity 0.2s', pointerEvents: subjectForm.subjectStatus === 'open' ? 'none' : 'auto' }}>
                {/* Labels */}
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.colors.textMuted }}>
                  Frequência&nbsp;
                  <span style={{ color: subjectForm.attendance >= 75 ? theme.colors.primary : '#f97316' }}>{subjectForm.attendance}%</span>
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.colors.textMuted }}>Faltas</p>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.colors.textMuted }}>Permitidas</p>

                {/* Barra interativa */}
                <div
                  className="h-[46px] rounded-2xl relative overflow-hidden select-none"
                  style={{ background: theme.colors.primaryLight, cursor: subjectForm.subjectStatus === 'open' ? 'not-allowed' : 'pointer' }}
                  onClick={e => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100 / 5) * 5
                    setSubjectForm(f => ({ ...f, attendance: Math.min(100, Math.max(0, pct)) }))
                  }}
                  onMouseMove={e => {
                    if (e.buttons !== 1) return
                    const rect = e.currentTarget.getBoundingClientRect()
                    const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100 / 5) * 5
                    setSubjectForm(f => ({ ...f, attendance: Math.min(100, Math.max(0, pct)) }))
                  }}
                >
                  <div className="absolute inset-y-0 left-0 rounded-2xl transition-all duration-150 pointer-events-none"
                    style={{ width: `${subjectForm.attendance}%`, background: subjectForm.attendance >= 75 ? `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.accent})` : 'linear-gradient(90deg, #fb923c, #f97316)', opacity: 0.9 }} />
                  {subjectForm.attendance > 0 && (
                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow pointer-events-none"
                      style={{ left: `calc(${subjectForm.attendance}% - 8px)`, background: subjectForm.attendance >= 75 ? theme.colors.accent : '#f97316', border: '2px solid white' }} />
                  )}
                </div>

                {/* Faltas */}
                <input type="number" min={0} max={999} value={subjectForm.absences}
                  disabled={subjectForm.subjectStatus === 'open'}
                  onChange={e => setSubjectForm(f => ({ ...f, absences: Number(e.target.value) }))}
                  className="w-full px-2 rounded-2xl outline-none text-sm text-center h-[46px]"
                  style={{ background: theme.colors.primaryLight, color: theme.colors.text }} />

                {/* Permitidas */}
                <input type="number" min={0} max={999} value={subjectForm.maxAbsences}
                  disabled={subjectForm.subjectStatus === 'open'}
                  onChange={e => setSubjectForm(f => ({ ...f, maxAbsences: Number(e.target.value) }))}
                  className="w-full px-2 rounded-2xl outline-none text-sm text-center h-[46px]"
                  style={{ background: theme.colors.primaryLight, color: theme.colors.text }} />
              </div>

              {/* Status da matéria */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: theme.colors.textMuted }}>Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {/* Em Aberto */}
                  <button type="button"
                    onClick={() => setSubjectForm(f => ({ ...f, subjectStatus: 'open' }))}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border-2 transition-all"
                    style={{
                      background: subjectForm.subjectStatus === 'open' ? '#fef9c3' : theme.colors.primaryLight,
                      borderColor: subjectForm.subjectStatus === 'open' ? '#eab308' : 'transparent',
                      color: subjectForm.subjectStatus === 'open' ? '#854d0e' : theme.colors.textMuted,
                    }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: subjectForm.subjectStatus === 'open' ? '#fde047' : theme.colors.primaryLight }}>
                      <Clock className="w-3.5 h-3.5" style={{ color: subjectForm.subjectStatus === 'open' ? '#854d0e' : theme.colors.textMuted }} />
                    </div>
                    <span className="text-sm font-semibold">Em Aberto</span>
                  </button>
                  {/* Finalizado */}
                  <button type="button"
                    onClick={() => setSubjectForm(f => {
                      // Auto-calcula frequência ao finalizar: total aulas = permitidas * 4 (25% max ausência)
                      const total = (f.maxAbsences ?? 0) * 4
                      const attendance = total > 0
                        ? Math.max(0, Math.round((1 - (f.absences ?? 0) / total) * 100))
                        : f.attendance
                      return { ...f, subjectStatus: 'done', attendance }
                    })}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border-2 transition-all"
                    style={{
                      background: subjectForm.subjectStatus === 'done' ? '#dcfce7' : theme.colors.primaryLight,
                      borderColor: subjectForm.subjectStatus === 'done' ? '#22c55e' : 'transparent',
                      color: subjectForm.subjectStatus === 'done' ? '#14532d' : theme.colors.textMuted,
                    }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: subjectForm.subjectStatus === 'done' ? '#86efac' : theme.colors.primaryLight }}>
                      <Check className="w-3.5 h-3.5" style={{ color: subjectForm.subjectStatus === 'done' ? '#14532d' : theme.colors.textMuted }} />
                    </div>
                    <span className="text-sm font-semibold">Finalizado</span>
                  </button>
                </div>
              </div>

              {/* Cor */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: theme.colors.textMuted }}>Cor</p>
                <ColorPicker value={subjectForm.colorIdx} onChange={i => setSubjectForm(f => ({ ...f, colorIdx: i }))} />
              </div>

              {/* Ações */}
              <div className="flex gap-3 pt-1">
                <button onClick={closeSubjectModal}
                  className="flex-1 py-3 rounded-full text-sm font-semibold hover:opacity-80 transition-all"
                  style={{ background: theme.colors.primaryLight, color: theme.colors.primaryDark }}>
                  Cancelar
                </button>
                <button onClick={saveSubject} disabled={saving || !subjectForm.name.trim()}
                  className="flex-1 py-3 rounded-full text-white font-bold hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(135deg, ${theme.colors.primaryDark}, ${theme.colors.primary})`, boxShadow: `0 6px 18px ${theme.colors.primary}45` }}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL AULA ────────────────────────────────────────────────────── */}
      {showScheduleModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) closeScheduleModal() }}>
          <div className="w-full max-w-md rounded-3xl shadow-2xl overflow-hidden" style={{ background: theme.colors.surface }}>

            {/* Banner gradiente */}
            <div style={{ background: `linear-gradient(135deg, ${theme.colors.primaryDark} 0%, ${theme.colors.primary} 60%, ${theme.colors.accent} 100%)`, padding: '20px 22px 18px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -24, right: -24, width: 90, height: 90, borderRadius: '50%', background: 'white', opacity: 0.08 }} />
              <div style={{ position: 'absolute', bottom: -14, right: 36, width: 56, height: 56, borderRadius: '50%', background: 'white', opacity: 0.06 }} />
              <div className="flex items-start justify-between relative">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.18)' }}>
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.7)' }}>Grade Horária</p>
                    <h3 className="font-display font-bold text-base mt-0.5 text-white">Nova Aula</h3>
                  </div>
                </div>
                <button onClick={closeScheduleModal} className="p-1.5 rounded-full transition-all hover:bg-white/20">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-5 flex flex-col gap-4">

              {/* Matéria — select das cadastradas ou texto livre */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.colors.textMuted }}>Matéria *</p>
                {subjects.length > 0 ? (
                  <SubjectSelect
                    value={scheduleForm.subjectName}
                    onChange={v => {
                      const s = subjects.find(s => s.name === v)
                      setScheduleForm(f => ({ ...f, subjectName: v, colorIdx: s?.colorIdx ?? f.colorIdx }))
                    }}
                    subjects={subjects}
                    theme={theme}
                    showOther={false}
                  />
                ) : (
                  <input autoFocus type="text" placeholder="Ex: Cálculo II" value={scheduleForm.subjectName}
                    onChange={e => setScheduleForm(f => ({ ...f, subjectName: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                    style={{ background: theme.colors.primaryLight, color: theme.colors.text }} />
                )}
              </div>

              {/* Sala */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.colors.textMuted }}>Sala</p>
                <input type="text" placeholder="Ex: Sala 201" value={scheduleForm.room}
                  onChange={e => setScheduleForm(f => ({ ...f, room: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                  style={{ background: theme.colors.primaryLight, color: theme.colors.text }} />
              </div>

              {/* Dia — pills */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: theme.colors.textMuted }}>Dia</p>
                <div className="flex gap-2">
                  {DAYS.map((d, i) => {
                    const sel = scheduleForm.dayOfWeek === i + 1
                    return (
                      <button key={d} type="button" onClick={() => setScheduleForm(f => ({ ...f, dayOfWeek: i + 1 }))}
                        className="flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all"
                        style={{ background: sel ? theme.colors.primary : theme.colors.primaryLight, color: sel ? '#fff' : theme.colors.textMuted, boxShadow: sel ? `0 4px 12px ${theme.colors.primary}40` : 'none' }}>
                        {d}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Horário — select estilizado */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.colors.textMuted }}>Horário</p>
                <TimeSelect value={scheduleForm.timeStart} onChange={v => setScheduleForm(f => ({ ...f, timeStart: v }))} theme={theme} />
              </div>

              {/* Cor */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: theme.colors.textMuted }}>Cor</p>
                <ColorPicker value={scheduleForm.colorIdx} onChange={i => setScheduleForm(f => ({ ...f, colorIdx: i }))} />
              </div>

              {/* Ações */}
              <div className="flex gap-3 pt-1">
                <button onClick={closeScheduleModal}
                  className="flex-1 py-3 rounded-full text-sm font-semibold hover:opacity-80 transition-all"
                  style={{ background: theme.colors.primaryLight, color: theme.colors.primaryDark }}>
                  Cancelar
                </button>
                <button onClick={saveSchedule} disabled={saving || !scheduleForm.subjectName.trim()}
                  className="flex-1 py-3 rounded-full text-white font-bold hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(135deg, ${theme.colors.primaryDark}, ${theme.colors.primary})`, boxShadow: `0 6px 18px ${theme.colors.primary}45` }}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Salvando...' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL PROVA ───────────────────────────────────────────────────── */}
      {showExamModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={e => { if (e.target === e.currentTarget) closeExamModal() }}>
          <div className="rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden" style={{ background: theme.colors.surface }}>

            {/* Banner gradiente */}
            <div className="relative px-6 pt-6 pb-5 overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${theme.colors.primaryDark} 0%, ${theme.colors.primary} 60%, ${theme.colors.accent} 100%)` }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
              <div style={{ position: 'absolute', bottom: -14, left: 40, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.18)' }}>
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">{editingExam ? 'Editar' : 'Adicionar'}</p>
                    <h3 className="font-display text-lg font-bold text-white leading-tight">{editingExam ? 'Editar Prova' : 'Nova Prova / Data'}</h3>
                  </div>
                </div>
                <button onClick={closeExamModal} className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/20">
                  <X className="w-4 h-4 text-white/80" />
                </button>
              </div>
            </div>

            {/* Campos */}
            <div className="px-6 py-5 flex flex-col gap-4">

              {/* Matéria */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.colors.textMuted }}>Matéria *</p>
                {subjects.length > 0 ? (
                  <>
                    <SubjectSelect value={examForm.subject} onChange={v => setExamForm(f => ({ ...f, subject: v }))} subjects={subjects} theme={theme} />
                    {examForm.subject === '__outro__' && (
                      <input type="text" placeholder="Nome da matéria..." autoFocus
                        onChange={e => setExamForm(f => ({ ...f, subject: e.target.value || '__outro__' }))}
                        className="w-full px-4 py-3 rounded-2xl outline-none text-sm mt-2"
                        style={{ background: theme.colors.primaryLight, color: theme.colors.text }} />
                    )}
                  </>
                ) : (
                  <input autoFocus type="text" placeholder="Ex: Cálculo II" value={examForm.subject}
                    onChange={e => setExamForm(f => ({ ...f, subject: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                    style={{ background: theme.colors.primaryLight, color: theme.colors.text }} />
                )}
              </div>

              {/* Data */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.colors.textMuted }}>Data *</p>
                <DatePickerInput value={examForm.examDate} onChange={v => setExamForm(f => ({ ...f, examDate: v }))} theme={theme} direction="down" />
              </div>

              {/* Tipo — pills */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: theme.colors.textMuted }}>Tipo</p>
                <div className="flex flex-wrap gap-2">
                  {['Prova', 'Trabalho', 'Seminário', 'TCC'].map(t => {
                    const sel = examForm.type === t
                    return (
                      <button key={t} type="button" onClick={() => setExamForm(f => ({ ...f, type: t }))}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                        style={{ background: sel ? theme.colors.primary : theme.colors.primaryLight, color: sel ? 'white' : theme.colors.textMuted }}>
                        {t}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Descrição */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.colors.textMuted }}>Descrição <span className="normal-case font-normal">(opcional)</span></p>
                <input type="text" placeholder="Ex: Capítulos 1 a 5, Listas 1–3..." value={examForm.description}
                  onChange={e => setExamForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                  style={{ background: theme.colors.primaryLight, color: theme.colors.text }} />
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-1">
                <button onClick={saveExam} disabled={saving || !examForm.subject.trim() || examForm.subject === '__outro__' || !examForm.examDate}
                  className="flex-1 py-3 rounded-2xl text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:opacity-90"
                  style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Salvando...' : editingExam ? 'Salvar' : 'Adicionar'}
                </button>
                <button onClick={closeExamModal}
                  className="px-5 py-3 rounded-2xl font-semibold transition-all hover:opacity-80 text-sm"
                  style={{ background: theme.colors.primaryLight, color: theme.colors.textMuted }}>
                  Cancelar
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── MODAL SEMESTRE ────────────────────────────────────────────────── */}
      {showSemesterModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={e => { if (e.target === e.currentTarget) closeSemesterModal() }}>
          <div className="rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden" style={{ background: theme.colors.surface }}>

            <div className="relative px-6 pt-6 pb-5 overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${theme.colors.primaryDark} 0%, ${theme.colors.primary} 60%, ${theme.colors.accent} 100%)` }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.18)' }}>
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">Novo</p>
                    <h3 className="font-display text-lg font-bold text-white leading-tight">Semestre</h3>
                  </div>
                </div>
                <button onClick={closeSemesterModal} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 transition-all">
                  <X className="w-4 h-4 text-white/80" />
                </button>
              </div>
            </div>

            <div className="px-6 py-5 flex flex-col gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.colors.textMuted }}>Nome *</p>
                <input autoFocus type="text" placeholder="Ex: 2026.1, 2026.2..." value={semesterForm.name}
                  onChange={e => setSemesterForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl outline-none text-sm font-semibold"
                  style={{ background: theme.colors.primaryLight, color: theme.colors.text }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, minWidth: 0 }}>
                <div style={{ minWidth: 0 }}>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.colors.textMuted }}>Início</p>
                  <DatePickerInput value={semesterForm.startDate ?? ''} onChange={v => setSemesterForm(f => ({ ...f, startDate: v }))} theme={theme} direction="down" placeholder="dd/mm/aaaa" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.colors.textMuted }}>Fim</p>
                  <DatePickerInput value={semesterForm.endDate ?? ''} onChange={v => setSemesterForm(f => ({ ...f, endDate: v }))} theme={theme} direction="down" placeholder="dd/mm/aaaa" />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={saveSemester} disabled={saving || !semesterForm.name.trim()}
                  className="flex-1 py-3 rounded-2xl text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:opacity-90"
                  style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Salvando...' : 'Criar semestre'}
                </button>
                <button onClick={closeSemesterModal}
                  className="px-5 py-3 rounded-2xl font-semibold transition-all hover:opacity-80 text-sm"
                  style={{ background: theme.colors.primaryLight, color: theme.colors.textMuted }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>{/* fecha max-w */}
    </div>
  )
}
