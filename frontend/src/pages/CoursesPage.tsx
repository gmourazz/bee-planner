import {
  Award, AlertCircle, AlertTriangle, CheckCircle, Circle, PlusCircle,
  TrendingUp, X, Loader2, Trash2, Pencil, GraduationCap, ChevronDown, Check,
  ImageIcon, Activity,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useCourses } from '../hooks/useCourses'
import { DatePickerInput } from '../components/DatePickerInput'
import type { Course, CourseStatus } from '../types/course.types'

const STATUS_OPTIONS: { value: CourseStatus; label: string }[] = [
  { value: 'in-progress',  label: 'Em Progresso'   },
  { value: 'completed',    label: 'Concluído'       },
  { value: 'urgent',       label: 'Urgente'         },
  { value: 'not-finished', label: 'Não Finalizado'  },
]

function getStatusConfig(status: CourseStatus, theme: any) {
  return {
    completed:      { label: 'Concluído',      color: theme.colors.primaryDark,  bg: theme.colors.primaryLight },
    'in-progress':  { label: 'Em Progresso',   color: theme.colors.primary,      bg: theme.colors.primaryLight },
    urgent:         { label: 'Urgente',        color: theme.colors.accent,       bg: theme.colors.accent + '20' },
    'not-finished': { label: 'Não Finalizado', color: theme.colors.textMuted,    bg: theme.colors.primaryLight },
  }[status]
}

function expiringIn30Days(dateStr: string | null): boolean {
  if (!dateStr) return false
  const diff = new Date(dateStr).getTime() - Date.now()
  return diff > 0 && diff <= 30 * 24 * 60 * 60 * 1000
}

function StatusSelect({ value, onChange, theme }: {
  value: CourseStatus; onChange: (v: CourseStatus) => void; theme: any
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const current = STATUS_OPTIONS.find(o => o.value === value)

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-medium"
        style={{ background: theme.colors.primaryLight, color: theme.colors.text }}
      >
        {current?.label}
        <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} style={{ color: theme.colors.textMuted }} />
      </button>
      {open && (
        <div className="absolute z-30 w-full mt-1 rounded-2xl shadow-lg overflow-hidden"
          style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.primary}20` }}>
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:opacity-80 text-left"
              style={{ background: opt.value === value ? theme.colors.primaryLight : 'transparent', color: theme.colors.text }}
            >
              {opt.value === value
                ? <Check className="w-4 h-4 flex-shrink-0" style={{ color: theme.colors.primary }} />
                : <span className="w-4 h-4 flex-shrink-0" />}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function CoursesPage() {
  const { currentTheme: theme } = useTheme()
  const {
    courses, loading, error,
    showAdd, openAdd, closeModal,
    editingCourse, openEdit,
    saving, form, setForm,
    certPreview, setCertificateFile,
    carregarCursos,
    saveCourse, removeCourse,
  } = useCourses()

  const certFileRef = useRef<HTMLInputElement>(null)
  const [filtroStatus, setFiltroStatus] = useState<CourseStatus | 'all'>('all')

  const completed     = courses.filter(c => c.status === 'completed').length
  const inProgress    = courses.filter(c => c.status === 'in-progress').length
  const notFinished   = courses.filter(c => c.status === 'not-finished').length
  const urgent        = courses.filter(c => c.status === 'urgent').length
  const ativos        = courses.filter(c => c.status === 'in-progress' || c.status === 'urgent').length
  const totalCerts    = courses.filter(c => c.certificate).length
  const expiringCerts = courses.filter(c => expiringIn30Days(c.certificateExpiry)).length

  const coursesFiltrados = filtroStatus === 'all' ? courses : courses.filter(c => c.status === filtroStatus)

  return (
    <div className="flex-1 overflow-auto p-6" style={{ background: theme.colors.background }}>
      <div className="max-w-6xl mx-auto w-full">
      {/* Stats + botão */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 flex-1">
          {[
            { icon: <Activity      className="w-4 h-4" style={{ color: theme.colors.primary }} />,      label: 'Ativos',         value: ativos },
            { icon: <CheckCircle   className="w-4 h-4" style={{ color: theme.colors.primary }} />,      label: 'Concluídos',     value: completed },
            { icon: <TrendingUp    className="w-4 h-4" style={{ color: theme.colors.primary }} />,      label: 'Em Progresso',   value: inProgress },
            { icon: <AlertCircle   className="w-4 h-4" style={{ color: theme.colors.textMuted }} />,    label: 'Não Finalizados',value: notFinished },
            { icon: <AlertCircle   className="w-4 h-4" style={{ color: theme.colors.accent }} />,       label: 'Urgentes',       value: urgent },
            { icon: <Award         className="w-4 h-4" style={{ color: theme.colors.primaryDark }} />,  label: 'Certificados',   value: totalCerts },
            { icon: <AlertTriangle className="w-4 h-4" style={{ color: theme.colors.accent }} />,       label: 'Expirando (30d)',value: expiringCerts },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl p-4" style={{ background: theme.colors.surface, boxShadow: `0 2px 16px ${theme.colors.primary}15` }}>
              <div className="flex items-center gap-1.5 mb-2">{s.icon}<p className="text-xs leading-tight" style={{ color: theme.colors.textMuted }}>{s.label}</p></div>
              <p className="text-[26px] font-bold" style={{ color: theme.colors.text }}>{s.value}</p>
            </div>
          ))}
        </div>

        <button
          onClick={openAdd}
          className="flex-shrink-0 px-6 py-3 rounded-full text-white flex items-center gap-2 hover:opacity-90 transition-all"
          style={{ background: theme.colors.primary }}
        >
          <PlusCircle className="w-5 h-5" />
          Adicionar Curso
        </button>
      </div>

      {/* Filtros de status */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {([
          { value: 'all',          label: 'Todos' },
          { value: 'in-progress',  label: 'Em Progresso' },
          { value: 'completed',    label: 'Concluídos' },
          { value: 'urgent',       label: 'Urgentes' },
          { value: 'not-finished', label: 'Não Finalizados' },
        ] as const).map(f => (
          <button
            key={f.value}
            onClick={() => setFiltroStatus(f.value)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={{
              background: filtroStatus === f.value ? theme.colors.primary : theme.colors.primaryLight,
              color:      filtroStatus === f.value ? '#fff' : theme.colors.textMuted,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-2" style={{ color: theme.colors.textMuted }}>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Carregando cursos...</span>
        </div>
      )}

      {/* Erro */}
      {!loading && error && (
        <div className="py-8 text-center">
          <p className="text-sm text-red-500">{error}</p>
          <button onClick={carregarCursos} className="mt-2 text-xs underline" style={{ color: theme.colors.primary }}>
            Tentar novamente
          </button>
        </div>
      )}

      {/* Vazio */}
      {!loading && !error && courses.length === 0 && (
        <div className="text-center py-20">
          <GraduationCap className="w-16 h-16 mx-auto mb-4" style={{ color: theme.colors.textMuted }} />
          <p className="font-display mb-2 text-2xl" style={{ color: theme.colors.text }}>Nenhum curso ainda</p>
          <p className="text-sm" style={{ color: theme.colors.textMuted }}>Clique em "Adicionar Curso" para começar</p>
        </div>
      )}

      {/* Grid de cursos */}
      {!loading && !error && coursesFiltrados.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {coursesFiltrados.map(course => {
            const sc       = getStatusConfig(course.status, theme)
            const expiring = expiringIn30Days(course.certificateExpiry)
            return (
              <div
                key={course.id}
                className="rounded-2xl p-6 transition-all hover:scale-[1.02] relative group"
                style={{ background: theme.colors.surface, boxShadow: `0 4px 24px ${theme.colors.primary}12` }}
              >
                {/* Ações hover */}
                <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => openEdit(course)} className="p-1.5 rounded-full" style={{ background: theme.colors.primaryLight }}>
                    <Pencil className="w-3.5 h-3.5" style={{ color: theme.colors.primary }} />
                  </button>
                  <button onClick={() => removeCourse(course.id)} className="p-1.5 rounded-full" style={{ background: theme.colors.primaryLight }}>
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>

                {/* Header */}
                <div className="flex items-start justify-between mb-4 pr-16">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display mb-1 text-xl font-semibold leading-tight" style={{ color: theme.colors.text }}>{course.title}</h3>
                    <p className="text-sm" style={{ color: theme.colors.textMuted }}>
                      {[course.platform, course.duration].filter(Boolean).join(' • ')}
                    </p>
                  </div>
                  <span className="ml-3 flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium" style={{ background: sc.bg, color: sc.color }}>
                    {sc.label}
                  </span>
                </div>

                {/* Progresso */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px]" style={{ color: theme.colors.textMuted }}>Progresso</span>
                    <span className="text-sm font-semibold" style={{ color: theme.colors.text }}>{course.progress}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: theme.colors.primaryLight }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${course.progress}%`, background: sc.color }} />
                  </div>
                </div>

                {/* Datas */}
                {(course.startDate || course.endDate) && (
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    {course.startDate && (
                      <div>
                        <span style={{ color: theme.colors.textMuted }}>Início: </span>
                        <span className="font-medium" style={{ color: theme.colors.text }}>
                          {new Date(course.startDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    )}
                    {course.endDate && (
                      <div>
                        <span style={{ color: theme.colors.textMuted }}>Fim: </span>
                        <span className="font-medium" style={{ color: theme.colors.text }}>
                          {new Date(course.endDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Certificado */}
                {course.certificate && (
                  <div className="rounded-xl p-3" style={{ background: expiring ? theme.colors.accent + '18' : theme.colors.primaryLight }}>
                    <div className="flex items-start gap-3">
                      {course.certificateUrl ? (
                        <img
                          src={course.certificateUrl}
                          alt="Certificado"
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-all"
                          onClick={() => window.open(course.certificateUrl!, '_blank')}
                        />
                      ) : (
                        <Award className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: expiring ? theme.colors.accent : theme.colors.primaryDark }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold mb-0.5" style={{ color: theme.colors.text }}>Certificado Obtido</p>
                        {course.credential && (
                          <p className="font-mono text-[11px] truncate" style={{ color: theme.colors.textMuted }}>{course.credential}</p>
                        )}
                        {course.certificateExpiry && (
                          <p className="text-xs mt-1 flex items-center gap-1" style={{ color: expiring ? theme.colors.accent : theme.colors.textMuted }}>
                            {expiring && <AlertTriangle className="w-3 h-3 flex-shrink-0" />}
                            Expira em: {new Date(course.certificateExpiry).toLocaleDateString('pt-BR')}
                            {expiring && ' ⚠ Em breve!'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      </div>{/* fecha max-w */}

      {/* Modal adicionar / editar */}
      {showAdd && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div
            className="w-full max-w-xl rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]"
            style={{ background: theme.colors.surface }}
          >
            {/* Banner gradiente */}
            <div style={{
              background: `linear-gradient(135deg, ${theme.colors.primaryDark} 0%, ${theme.colors.primary} 60%, ${theme.colors.accent} 100%)`,
              padding: '20px 22px 18px', position: 'relative', overflow: 'hidden',
              borderRadius: '24px 24px 0 0', flexShrink: 0,
            }}>
              <div style={{ position: 'absolute', top: -24, right: -24, width: 90, height: 90, borderRadius: '50%', background: 'white', opacity: 0.08 }} />
              <div style={{ position: 'absolute', bottom: -14, right: 36, width: 56, height: 56, borderRadius: '50%', background: 'white', opacity: 0.06 }} />
              <div className="flex items-start justify-between relative">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.18)' }}>
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      {editingCourse ? 'Editar curso' : 'Novo curso'}
                    </p>
                    <h3 className="font-display font-bold text-base mt-0.5 text-white">
                      {editingCourse ? 'Atualizar registro' : 'Registrar aprendizado'}
                    </h3>
                  </div>
                </div>
                <button onClick={closeModal} className="p-1.5 rounded-full transition-all hover:bg-white/20">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-5 flex flex-col gap-3">

              {/* Título */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.colors.textMuted }}>Título *</p>
                <input
                  autoFocus
                  type="text"
                  placeholder="Nome do curso"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                  style={{ background: theme.colors.primaryLight, color: theme.colors.text }}
                />
              </div>

              {/* Plataforma + Duração */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.colors.textMuted }}>Plataforma</p>
                  <input
                    type="text"
                    placeholder="Ex: Udemy"
                    value={form.platform}
                    onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                    style={{ background: theme.colors.primaryLight, color: theme.colors.text }}
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.colors.textMuted }}>Duração</p>
                  <input
                    type="text"
                    placeholder="Ex: 40h"
                    value={form.duration}
                    onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                    style={{ background: theme.colors.primaryLight, color: theme.colors.text }}
                  />
                </div>
              </div>

              {/* Status + Válido até */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.colors.textMuted }}>Status</p>
                  <StatusSelect value={form.status} onChange={s => setForm(f => ({ ...f, status: s }))} theme={theme} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.colors.textMuted }}>Válido até</p>
                  <DatePickerInput
                    value={form.certificateExpiry}
                    onChange={v => setForm(f => ({ ...f, certificateExpiry: v }))}
                    placeholder="DD/MM/AAAA"
                    theme={theme}
                    direction="down"
                  />
                </div>
              </div>

              {/* Progresso */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.colors.textMuted }}>Progresso</p>
                  <span className="text-sm font-bold tabular-nums" style={{ color: theme.colors.primary }}>{form.progress}%</span>
                </div>
                {/* Barra visual interativa */}
                <div
                  className="h-4 rounded-full cursor-pointer relative overflow-hidden select-none"
                  style={{ background: theme.colors.primaryLight }}
                  onClick={e => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100 / 5) * 5
                    setForm(f => ({ ...f, progress: Math.min(100, Math.max(0, pct)) }))
                  }}
                  onMouseMove={e => {
                    if (e.buttons !== 1) return
                    const rect = e.currentTarget.getBoundingClientRect()
                    const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100 / 5) * 5
                    setForm(f => ({ ...f, progress: Math.min(100, Math.max(0, pct)) }))
                  }}
                >
                  <div className="h-full rounded-full transition-all duration-150 pointer-events-none"
                    style={{ width: `${form.progress}%`, background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.accent})` }} />
                  {/* thumb */}
                  {form.progress > 0 && (
                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow pointer-events-none"
                      style={{ left: `calc(${form.progress}% - 8px)`, background: theme.colors.accent, border: '2px solid white' }} />
                  )}
                </div>
              </div>

              {/* Datas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.colors.textMuted }}>Início</p>
                  <DatePickerInput
                    value={form.startDate}
                    onChange={v => setForm(f => ({ ...f, startDate: v }))}
                    placeholder="DD/MM/AAAA"
                    theme={theme}
                    direction="down"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.colors.textMuted }}>Conclusão</p>
                  <DatePickerInput
                    value={form.endDate}
                    onChange={v => setForm(f => ({ ...f, endDate: v }))}
                    placeholder="DD/MM/AAAA"
                    theme={theme}
                    direction="down"
                  />
                </div>
              </div>

              {/* Certificado toggle com ícone */}
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, certificate: !f.certificate }))}
                className="flex items-center gap-2.5 px-4 py-3 rounded-2xl transition-all hover:opacity-80 text-left"
                style={{ background: theme.colors.primaryLight }}
              >
                {form.certificate
                  ? <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: theme.colors.primary }} />
                  : <Circle className="w-5 h-5 flex-shrink-0" style={{ color: theme.colors.primary }} />
                }
                <Award className="w-4 h-4 flex-shrink-0" style={{ color: theme.colors.primaryDark }} />
                <span className="text-sm font-semibold" style={{ color: theme.colors.text }}>Possuo certificado</span>
              </button>

              {/* Campos do certificado */}
              {form.certificate && (
                <div className="flex flex-col gap-3 rounded-2xl p-4" style={{ background: theme.colors.primaryLight + '50', border: `1px solid ${theme.colors.primary}15` }}>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.colors.textMuted }}>Credencial / ID</p>
                    <input
                      type="text"
                      placeholder="Ex: UC-REACT-2026-001"
                      value={form.credential}
                      onChange={e => setForm(f => ({ ...f, credential: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl outline-none text-sm font-mono"
                      style={{ background: theme.colors.surface, color: theme.colors.text }}
                    />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.colors.textMuted }}>
                      Foto do certificado <span style={{ color: theme.colors.textMuted, fontWeight: 400 }}>(opcional)</span>
                    </p>
                    <input
                      ref={certFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => setCertificateFile(e.target.files?.[0] ?? null)}
                    />
                    {certPreview ? (
                      <div className="relative">
                        <img
                          src={certPreview}
                          alt="Certificado"
                          className="w-full h-32 object-cover rounded-2xl cursor-pointer hover:opacity-90 transition-all"
                          onClick={() => window.open(certPreview, '_blank')}
                        />
                        <button
                          onClick={() => { setCertificateFile(null); if (certFileRef.current) certFileRef.current.value = '' }}
                          className="absolute top-2 right-2 p-1 rounded-full"
                          style={{ background: 'rgba(0,0,0,0.5)' }}
                        >
                          <X className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => certFileRef.current?.click()}
                        className="w-full h-20 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:opacity-80"
                        style={{ background: theme.colors.surface, border: `2px dashed ${theme.colors.primary}35` }}
                      >
                        <ImageIcon className="w-5 h-5" style={{ color: theme.colors.textMuted }} />
                        <span className="text-xs" style={{ color: theme.colors.textMuted }}>Clique para selecionar</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={closeModal}
                  className="flex-1 py-3 rounded-full text-sm font-semibold hover:opacity-80 transition-all"
                  style={{ background: theme.colors.primaryLight, color: theme.colors.primaryDark }}
                >
                  Cancelar
                </button>
                <button
                  onClick={saveCourse}
                  disabled={saving || !form.title.trim()}
                  className="flex-1 py-3 rounded-full text-white font-bold hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primaryDark}, ${theme.colors.primary})`,
                    boxShadow: `0 6px 18px ${theme.colors.primary}45`,
                  }}
                >
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
