import { useState, useMemo, useEffect, useRef } from 'react'
import {
  Dumbbell,
  Timer,
  Flame,
  Trophy,
  Scale,
  Ruler,
  Plus,
  Trash2,
  X,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Utensils,
  Beef,
  Wheat,
  Droplets,
  TrendingUp,
  TrendingDown,
  Target,
  Waves,
  Wind,
  Bike,
  Footprints,
  PersonStanding,
  Swords,
  Music2,
  Zap,
  LayoutGrid,
  HelpCircle,
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { NavArrow, StepInput } from '../components/NavArrow'
import { useToast } from '../components/Toast'
import { useFitness } from '../hooks/useFitness'
import { fetchMealsRange } from '../services/fitness'
import { MODALITIES, MEAL_TYPES, EFFORT_LEVELS } from '../types/fitness.types'
import type { Meal } from '../types/fitness.types'

// Mapa de ícones por modalidade
const MODALITY_ICONS: Record<string, React.ReactNode> = {
  'Musculação':  <Dumbbell className="w-4 h-4" />,
  'Corrida':     <Footprints className="w-4 h-4" />,
  'Natação':     <Waves className="w-4 h-4" />,
  'Pole Dance':  <PersonStanding className="w-4 h-4" />,
  'Jiu-Jitsu':  <Swords className="w-4 h-4" />,
  'Yoga':        <PersonStanding className="w-4 h-4" />,
  'Crossfit':    <Zap className="w-4 h-4" />,
  'Ciclismo':    <Bike className="w-4 h-4" />,
  'Bike':        <Bike className="w-4 h-4" />,
  'Escada':      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 20 4 16 8 16 8 12 12 12 12 8 16 8 16 4 20 4" /></svg>,
  'Dança':       <Music2 className="w-4 h-4" />,
  'Funcional':   <LayoutGrid className="w-4 h-4" />,
  'HIIT':        <Flame className="w-4 h-4" />,
  'Caminhada':   <Wind className="w-4 h-4" />,
  'Outro':       <HelpCircle className="w-4 h-4" />,
}

// Select customizado no estilo do app (igual BooksPage)
function FitnessSelect({ value, onChange, options, colors, label, showIcons }: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  colors: Record<string, string>
  label?: string
  showIcons?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const current = options.find(o => o.value === value)

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-left transition-all"
        style={{ background: colors.primaryLight, color: colors.text }}
      >
        <span className="flex items-center gap-2" style={{ color: current ? colors.text : colors.textMuted }}>
          {showIcons && current && MODALITY_ICONS[current.value] && (
            <span style={{ color: colors.primary }}>{MODALITY_ICONS[current.value]}</span>
          )}
          {current?.label ?? label ?? 'Selecionar...'}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform flex-shrink-0 ml-2 ${open ? 'rotate-180' : ''}`}
          style={{ color: colors.textMuted }}
        />
      </button>

      {open && (
        <div
          className="absolute z-50 top-full mt-1 w-full rounded-2xl shadow-xl overflow-hidden"
          style={{ background: colors.surface, border: `1px solid ${colors.primary}20` }}
        >
          <div className="overflow-y-auto" style={{ maxHeight: 220 }}>
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all hover:opacity-80 text-left"
                style={{
                  background: value === opt.value ? colors.primaryLight : 'transparent',
                  color: colors.text,
                }}
              >
                <span className="flex items-center gap-2.5">
                  {showIcons && MODALITY_ICONS[opt.value] && (
                    <span style={{ color: value === opt.value ? colors.primary : colors.textMuted }}>
                      {MODALITY_ICONS[opt.value]}
                    </span>
                  )}
                  {opt.label}
                </span>
                {value === opt.value && <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colors.primary }} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Date picker customizado (popup com calendário fofo)
function FitnessDatePicker({ value, onChange, colors }: {
  value: string
  onChange: (v: string) => void
  colors: Record<string, string>
}) {
  const [open, setOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(() => value ? new Date(value + 'T00:00') : new Date())
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => { if (value) setViewMonth(new Date(value + 'T00:00')) }, [value])

  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const todayStr = hoje()
  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const display = value
    ? new Date(value + 'T00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : 'Selecionar data'

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-left transition-all"
        style={{ background: colors.primaryLight, color: value ? colors.text : colors.textMuted }}
      >
        <span>{display}</span>
        <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: colors.textMuted }} />
      </button>

      {open && (
        <div
          className="absolute z-50 top-full mt-1 rounded-2xl shadow-2xl p-4"
          style={{ background: colors.surface, border: `1px solid ${colors.primary}20`, minWidth: 260 }}
        >
          {/* Navegação mês */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setViewMonth(new Date(year, month - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70 transition-all"
              style={{ background: colors.primaryLight }}
            >
              <ChevronLeft className="w-4 h-4" style={{ color: colors.primaryDark }} />
            </button>
            <span className="font-bold text-sm capitalize" style={{ color: colors.text }}>
              {viewMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth(new Date(year, month + 1))}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70 transition-all"
              style={{ background: colors.primaryLight }}
            >
              <ChevronRight className="w-4 h-4" style={{ color: colors.primaryDark }} />
            </button>
          </div>

          {/* Header dias */}
          <div className="grid grid-cols-7 mb-1">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className="text-center text-[10px] font-semibold py-1" style={{ color: colors.textMuted }}>{d}</div>
            ))}
          </div>

          {/* Grid dias */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {days.map((day, i) => {
              if (!day) return <div key={i} />
              const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`
              const isSelected = dateStr === value
              const isToday = dateStr === todayStr
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => { onChange(dateStr); setOpen(false) }}
                  className="w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm transition-all hover:opacity-80"
                  style={{
                    background: isSelected ? colors.primary : isToday ? colors.primaryLight : 'transparent',
                    color: isSelected ? '#fff' : isToday ? colors.primary : colors.text,
                    fontWeight: isSelected || isToday ? '700' : '400',
                  }}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Rodapé */}
          <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${colors.primary}15` }}>
            <button
              type="button"
              onClick={() => { onChange(todayStr); setOpen(false) }}
              className="w-full py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{ background: colors.primaryLight, color: colors.primaryDark }}
            >
              Hoje
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Tipo das 5 abas
type TabKey = 'treinos' | 'corpo' | 'dieta' | 'desafios'

// Helpers
const hoje = () => new Date().toISOString().split('T')[0]
const DAY_ABBR = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB']

// Retorna 7 dias a partir de uma data de início
function get7Days(startDate: string): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startDate + 'T00:00:00')
    d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

// Formata data para exibição curta
function fmtData(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
  })
}

const pad = (n: number) => String(n).padStart(2, '0')

function prevWeekDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00')
  d.setDate(d.getDate() - 7)
  return d.toISOString().split('T')[0]
}

function nextWeekDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00')
  d.setDate(d.getDate() + 7)
  return d.toISOString().split('T')[0]
}

export function FitnessPage() {
  const { currentTheme } = useTheme()
  const { toast } = useToast()
  const c = currentTheme.colors

  // Data selecionada para a aba Dieta
  const [selectedDate, setSelectedDate] = useState(hoje())
  // Início da janela de 7 dias do calendário (padrão = hoje)
  const [weekStart, setWeekStart] = useState(hoje())
  // Dia selecionado no calendário da semana (aba Treinos)
  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState<string | null>(null)

  // Hook principal
  const {
    workouts,
    weekWorkouts,
    addWorkout,
    removeWorkout,
    loadingWorkouts,
    bodyHistory,
    latestBody,
    saveBody,
    loadingBody,
    challenges,
    activeChallenge,
    addChallenge,
    updateChallenge,
    removeChallenge,
    meals,
    addMeal,
    removeMeal,
    loadingMeals,
    goals,
    saveGoals,
  } = useFitness(selectedDate, weekStart)

  // Aba ativa
  const [tab, setTab] = useState<TabKey>('treinos')

  // Sub-aba de dieta
  const [dietaSubTab, setDietaSubTab] = useState<'dia' | 'semana' | 'mes'>('dia')

  // Mês exibido no calendário de dieta
  const [calViewMonth, setCalViewMonth] = useState(() => new Date())

  // Resumo por data (para calendário + vistas semana/mês)
  const [rangeSummary, setRangeSummary] = useState<Record<string, { kcal: number; protein: number; carbs: number; fat: number }>>({})

  // ============ Estado dos formulários ============

  // Form treino
  const [showWorkoutForm, setShowWorkoutForm] = useState(false)
  const [workoutForm, setWorkoutForm] = useState({
    modality: MODALITIES[0] as string,
    duration_min: '',
    calories: '',
    active_calories: '',
    avg_heart_rate: '',
    effort_level: '',
    notes: '',
    date: hoje(),
  })

  // Form corpo
  const [bodyForm, setBodyForm] = useState({
    weight: '',
    body_fat: '',
    arm: '',
    waist: '',
    hip: '',
    thigh: '',
  })

  // Form refeição (um por tipo de refeição)
  const [mealForms, setMealForms] = useState<Record<string, { food_name: string; calories: string; protein: string; carbs: string; fat: string }>>({
    cafe: { food_name: '', calories: '', protein: '', carbs: '', fat: '' },
    almoco: { food_name: '', calories: '', protein: '', carbs: '', fat: '' },
    lanche: { food_name: '', calories: '', protein: '', carbs: '', fat: '' },
    janta: { food_name: '', calories: '', protein: '', carbs: '', fat: '' },
  })

  // Meta calórica editável
  const [editingCalGoal, setEditingCalGoal] = useState(false)
  const [calGoalInput, setCalGoalInput] = useState(String(goals.calorie_goal))

  // Form desafio
  const [showChallengeForm, setShowChallengeForm] = useState(false)
  const [challengeForm, setChallengeForm] = useState({
    name: '',
    modality: MODALITIES[0] as string,
    duration_days: '30',
    start_date: hoje(),
  })

  // ============ Derivados ============

  // Estatísticas dos treinos da semana
  const weekStats = useMemo(() => {
    const diasExercitados = new Set(weekWorkouts.map(w => w.date)).size
    const tempoTotal = weekWorkouts.reduce((s, w) => s + w.duration_min, 0)
    const kcalTotal = weekWorkouts.reduce((s, w) => s + w.calories, 0)

    // Modalidade destaque: a que mais aparece na semana
    const contagem: Record<string, number> = {}
    weekWorkouts.forEach(w => {
      contagem[w.modality] = (contagem[w.modality] || 0) + 1
    })
    const modalidadeDestaque = Object.entries(contagem).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '---'

    return { diasExercitados, tempoTotal, kcalTotal, modalidadeDestaque }
  }, [weekWorkouts])

  // Datas da janela de 7 dias para o calendário
  const weekDates = useMemo(() => get7Days(weekStart), [weekStart])
  const workoutDatesSet = useMemo(() => new Set(weekWorkouts.map(w => w.date)), [weekWorkouts])

  // Treinos exibidos: filtra por dia selecionado (ou últimos 10 se nenhum dia selecionado)
  const treinosVisiveis = useMemo(() => {
    const sorted = [...workouts].sort((a, b) => b.date.localeCompare(a.date))
    if (selectedWorkoutDay) return sorted.filter(w => w.date === selectedWorkoutDay)
    return sorted.slice(0, 10)
  }, [workouts, selectedWorkoutDay])

  // Diferença corpo
  const bodyDiff = useMemo(() => {
    if (bodyHistory.length < 2) return null
    const ultima = bodyHistory[0]
    const penultima = bodyHistory[1]
    return {
      weight: ultima.weight != null && penultima.weight != null ? ultima.weight - penultima.weight : null,
      body_fat: ultima.body_fat != null && penultima.body_fat != null ? ultima.body_fat - penultima.body_fat : null,
    }
  }, [bodyHistory])

  // Resumo dieta do dia
  const dietaSummary = useMemo(() => {
    const totalKcal = meals.reduce((s, m) => s + m.calories, 0)
    const totalProtein = meals.reduce((s, m) => s + m.protein, 0)
    const totalCarbs = meals.reduce((s, m) => s + m.carbs, 0)
    const totalFat = meals.reduce((s, m) => s + m.fat, 0)
    return { totalKcal, totalProtein, totalCarbs, totalFat }
  }, [meals])

  // Desafios passados (concluídos ou abandonados)
  const pastChallenges = useMemo(() => {
    return challenges.filter(ch => ch.status !== 'active')
  }, [challenges])

  // Dias do calendário de dieta (null = célula vazia antes do dia 1)
  const calDays = useMemo(() => {
    const year = calViewMonth.getFullYear()
    const month = calViewMonth.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    const days: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    return days
  }, [calViewMonth])

  // Busca resumo de refeições para o mês visível no calendário
  useEffect(() => {
    const year = calViewMonth.getFullYear()
    const month = calViewMonth.getMonth()
    const from = `${year}-${pad(month + 1)}-01`
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const to = `${year}-${pad(month + 1)}-${pad(daysInMonth)}`
    fetchMealsRange(from, to).then(allMeals => {
      const summary: Record<string, { kcal: number; protein: number; carbs: number; fat: number }> = {}
      allMeals.forEach(m => {
        if (!summary[m.date]) summary[m.date] = { kcal: 0, protein: 0, carbs: 0, fat: 0 }
        summary[m.date].kcal += m.calories
        summary[m.date].protein += m.protein
        summary[m.date].carbs += m.carbs
        summary[m.date].fat += m.fat
      })
      setRangeSummary(prev => ({ ...prev, ...summary }))
    }).catch(() => {})
  }, [calViewMonth])

  // Mantém rangeSummary atualizado com as refeições do dia selecionado
  useEffect(() => {
    const kcal = meals.reduce((s, m) => s + m.calories, 0)
    const protein = meals.reduce((s, m) => s + m.protein, 0)
    const carbs = meals.reduce((s, m) => s + m.carbs, 0)
    const fat = meals.reduce((s, m) => s + m.fat, 0)
    setRangeSummary(prev => ({ ...prev, [selectedDate]: { kcal, protein, carbs, fat } }))
  }, [meals, selectedDate])

  // ============ Handlers ============

  // Salvar treino
  const handleSaveWorkout = async () => {
    if (!workoutForm.modality || !workoutForm.date) {
      toast('Campos obrigatórios', 'Preencha modalidade e data.', 'error')
      return
    }
    await addWorkout({
      modality: workoutForm.modality,
      duration_min: Number(workoutForm.duration_min),
      calories: Number(workoutForm.calories),
      active_calories: workoutForm.active_calories ? Number(workoutForm.active_calories) : null,
      avg_heart_rate: workoutForm.avg_heart_rate ? Number(workoutForm.avg_heart_rate) : null,
      effort_level: workoutForm.effort_level ? Number(workoutForm.effort_level) : null,
      notes: workoutForm.notes || null,
      date: workoutForm.date,
    })
    setWorkoutForm({ modality: MODALITIES[0], duration_min: '', calories: '', active_calories: '', avg_heart_rate: '', effort_level: '', notes: '', date: hoje() })
    setShowWorkoutForm(false)
  }

  // Salvar medição corporal
  const handleSaveBody = async () => {
    const data = {
      date: hoje(),
      weight: bodyForm.weight ? Number(bodyForm.weight) : null,
      body_fat: bodyForm.body_fat ? Number(bodyForm.body_fat) : null,
      arm: bodyForm.arm ? Number(bodyForm.arm) : null,
      waist: bodyForm.waist ? Number(bodyForm.waist) : null,
      hip: bodyForm.hip ? Number(bodyForm.hip) : null,
      thigh: bodyForm.thigh ? Number(bodyForm.thigh) : null,
    }
    if (!data.weight && !data.body_fat) {
      toast('Preencha algo', 'Informe ao menos peso ou gordura corporal.', 'error')
      return
    }
    await saveBody(data)
    setBodyForm({ weight: '', body_fat: '', arm: '', waist: '', hip: '', thigh: '' })
  }

  // Salvar refeição
  const handleAddMeal = async (mealType: Meal['meal_type']) => {
    const form = mealForms[mealType]
    if (!form.food_name || !form.calories) {
      toast('Campos obrigatórios', 'Informe o nome e as calorias.', 'error')
      return
    }
    await addMeal({
      date: selectedDate,
      meal_type: mealType,
      food_name: form.food_name,
      calories: Number(form.calories),
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
    })
    setMealForms(prev => ({
      ...prev,
      [mealType]: { food_name: '', calories: '', protein: '', carbs: '', fat: '' },
    }))
  }

  // Salvar meta calórica
  const handleSaveCalGoal = async () => {
    const val = Number(calGoalInput)
    if (!val || val < 0) return
    await saveGoals({ ...goals, calorie_goal: val })
    setEditingCalGoal(false)
  }

  // Criar desafio
  const handleCreateChallenge = async () => {
    if (!challengeForm.name) {
      toast('Campo obrigatório', 'Dê um nome ao desafio.', 'error')
      return
    }
    await addChallenge({
      name: challengeForm.name,
      modality: challengeForm.modality || null,
      duration_days: Number(challengeForm.duration_days),
      start_date: challengeForm.start_date,
      completed_days: 0,
      status: 'active',
    })
    setChallengeForm({ name: '', modality: MODALITIES[0], duration_days: '30', start_date: hoje() })
    setShowChallengeForm(false)
  }

  // Concluir dia do desafio
  const handleConcluirDia = async () => {
    if (!activeChallenge) return
    const novosDias = activeChallenge.completed_days + 1
    const updates: Record<string, unknown> = { completed_days: novosDias }
    if (novosDias >= activeChallenge.duration_days) {
      updates.status = 'completed'
    }
    await updateChallenge(activeChallenge.id, updates)
  }

  // Abandonar desafio
  const handleAbandonar = async () => {
    if (!activeChallenge) return
    await updateChallenge(activeChallenge.id, { status: 'abandoned' })
  }

  // ============ Tabs config ============
  const tabs: { id: TabKey; label: string; icon: React.ReactNode }[] = [
    { id: 'treinos', label: 'Treinos', icon: <Dumbbell className="w-4 h-4" /> },
    { id: 'corpo', label: 'Corpo', icon: <Scale className="w-4 h-4" /> },
    { id: 'dieta', label: 'Dieta', icon: <Utensils className="w-4 h-4" /> },
    { id: 'desafios', label: 'Desafios', icon: <Trophy className="w-4 h-4" /> },
  ]

  // ============ Render ============
  return (
    <div className="flex-1 overflow-auto" style={{ background: c.background }}>
      <div className="max-w-6xl mx-auto w-full px-6 pt-6 pb-10">

        {/* Barra de tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: tab === t.id ? c.primary : c.surface,
                color: tab === t.id ? '#fff' : c.text,
                boxShadow: tab !== t.id ? `0 2px 8px ${c.primary}10` : 'none',
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* ======================== ABA TREINOS ======================== */}
        {tab === 'treinos' && (
          <div className="space-y-5">

            {/* Cards resumo */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<Calendar className="w-5 h-5" style={{ color: '#7BC4A8' }} />}
                iconBg="#D1FAE5"
                label="Dias exercitados"
                value={String(weekStats.diasExercitados)}
                sub="esta semana"
              />
              <StatCard
                icon={<Timer className="w-5 h-5" style={{ color: c.primary }} />}
                iconBg={c.primaryLight}
                label="Tempo total"
                value={`${weekStats.tempoTotal}`}
                sub="min"
              />
              <StatCard
                icon={<Flame className="w-5 h-5" style={{ color: '#D49898' }} />}
                iconBg="#FEE2E2"
                label="Calorias queimadas"
                value={weekStats.kcalTotal.toLocaleString('pt-BR')}
                sub="kcal"
              />
              <StatCard
                icon={<Trophy className="w-5 h-5" style={{ color: '#F59E0B' }} />}
                iconBg="#FEF3C7"
                label="Modalidade destaque"
                value={weekStats.modalidadeDestaque}
                sub=""
              />
            </div>

            {/* Botão registrar + form */}
            {!showWorkoutForm ? (
              <button
                onClick={() => setShowWorkoutForm(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
                style={{ background: c.primary }}
              >
                <Plus className="w-4 h-4" /> Registrar Treino
              </button>
            ) : (
              <div className="rounded-2xl p-5 space-y-4" style={{ background: c.surface, boxShadow: `0 2px 16px ${c.primary}10` }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold" style={{ color: c.text }}>Novo Treino</h3>
                  <button onClick={() => setShowWorkoutForm(false)} className="p-1 rounded-lg hover:opacity-70" style={{ color: c.textMuted }}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: c.textMuted }}>Modalidade</label>
                    <FitnessSelect
                      value={workoutForm.modality}
                      onChange={v => setWorkoutForm(f => ({ ...f, modality: v }))}
                      options={MODALITIES.map(m => ({ value: m, label: m }))}
                      colors={c}
                      showIcons
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: c.textMuted }}>Duração (min)</label>
                    <StepInput
                      value={workoutForm.duration_min}
                      onChange={v => setWorkoutForm(f => ({ ...f, duration_min: v }))}
                      placeholder="60"
                      step={5}
                      min={0}
                      max={300}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: c.textMuted }}>Calorias totais</label>
                    <input
                      type="number"
                      placeholder="300"
                      value={workoutForm.calories}
                      onChange={e => setWorkoutForm(f => ({ ...f, calories: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: c.background, color: c.text, border: `1.5px solid ${c.primaryLight}` }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: c.textMuted }}>Calorias ativas</label>
                    <input
                      type="number"
                      placeholder="200"
                      value={workoutForm.active_calories}
                      onChange={e => setWorkoutForm(f => ({ ...f, active_calories: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: c.background, color: c.text, border: `1.5px solid ${c.primaryLight}` }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: c.textMuted }}>Batimentos médios (bpm)</label>
                    <input
                      type="number"
                      placeholder="145"
                      value={workoutForm.avg_heart_rate}
                      onChange={e => setWorkoutForm(f => ({ ...f, avg_heart_rate: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: c.background, color: c.text, border: `1.5px solid ${c.primaryLight}` }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: c.textMuted }}>Esforço (RPE)</label>
                    <FitnessSelect
                      value={workoutForm.effort_level}
                      onChange={v => setWorkoutForm(f => ({ ...f, effort_level: v }))}
                      options={EFFORT_LEVELS.map(e => ({ value: e.value, label: e.label }))}
                      colors={c}
                      label="—"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: c.textMuted }}>Data</label>
                    <FitnessDatePicker
                      value={workoutForm.date}
                      onChange={v => setWorkoutForm(f => ({ ...f, date: v }))}
                      colors={c}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: c.textMuted }}>Notas (opcional)</label>
                  <textarea
                    placeholder="Ex: Treino de peito e tríceps..."
                    value={workoutForm.notes}
                    onChange={e => setWorkoutForm(f => ({ ...f, notes: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                    style={{ background: c.background, color: c.text, border: `1.5px solid ${c.primaryLight}` }}
                  />
                </div>
                <button
                  onClick={handleSaveWorkout}
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
                  style={{ background: c.primary }}
                >
                  <Check className="w-4 h-4 inline mr-1" /> Salvar
                </button>
              </div>
            )}

            {/* Calendário da semana */}
            <div className="rounded-2xl p-5" style={{ background: c.surface, boxShadow: `0 2px 16px ${c.primary}10` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <NavArrow direction="left" onClick={() => { setWeekStart(s => shiftDate(s, -7)); setSelectedWorkoutDay(null) }} />
                  <NavArrow direction="right" onClick={() => { setWeekStart(s => shiftDate(s, 7)); setSelectedWorkoutDay(null) }} disabled={shiftDate(weekStart, 7) > hoje()} />
                </div>
                <div className="flex items-center gap-2">
                  {weekStart !== hoje() && (
                    <button
                      onClick={() => { setWeekStart(hoje()); setSelectedWorkoutDay(null) }}
                      className="text-xs px-2 py-1 rounded-lg transition-all"
                      style={{ background: c.primaryLight, color: c.primaryDark }}
                    >
                      Hoje
                    </button>
                  )}
                  {selectedWorkoutDay && (
                    <button
                      onClick={() => setSelectedWorkoutDay(null)}
                      className="text-xs px-2 py-1 rounded-lg transition-all"
                      style={{ background: c.primaryLight, color: c.primaryDark }}
                    >
                      Ver todos
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-7 gap-3">
                {weekDates.map((dateStr) => {
                  const dt = new Date(dateStr + 'T00:00:00')
                  const dia = dt.getDate()
                  const dayAbbr = DAY_ABBR[dt.getDay()]
                  const temTreino = workoutDatesSet.has(dateStr)
                  const isHoje = dateStr === hoje()
                  const isSelecionado = selectedWorkoutDay === dateStr
                  return (
                    <button
                      key={dateStr}
                      onClick={() => {
                        setSelectedWorkoutDay(isSelecionado ? null : dateStr)
                        setWorkoutForm(f => ({ ...f, date: dateStr }))
                      }}
                      className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all"
                      style={{
                        background: isSelecionado ? c.primary : isHoje ? c.primaryLight : 'transparent',
                        border: isSelecionado ? `2px solid ${c.primary}` : isHoje ? `2px solid ${c.primary}30` : '2px solid transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span className="text-[10px] font-semibold" style={{ color: isSelecionado ? '#fff' : c.textMuted }}>{dayAbbr}</span>
                      <span className="text-sm font-bold" style={{ color: isSelecionado ? '#fff' : c.text }}>{dia}</span>
                      {temTreino && (
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: isSelecionado ? '#ffffff80' : '#7BC4A8' }} />
                      )}
                      {!temTreino && <div className="w-2.5 h-2.5" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Lista de treinos */}
            <div className="rounded-2xl p-5" style={{ background: c.surface, boxShadow: `0 2px 16px ${c.primary}10` }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold" style={{ color: c.text }}>
                  {selectedWorkoutDay ? `Treinos de ${fmtData(selectedWorkoutDay)}` : 'Treinos recentes'}
                </h3>
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: c.primaryLight, color: c.primaryDark }}>
                  {treinosVisiveis.length} itens
                </span>
              </div>
              {loadingWorkouts ? (
                <p className="text-sm text-center py-6" style={{ color: c.textMuted }}>Carregando...</p>
              ) : treinosVisiveis.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: c.textMuted }}>
                  {selectedWorkoutDay ? 'Nenhum treino neste dia' : 'Nenhum treino registrado'}
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {treinosVisiveis.map(w => (
                    <div
                      key={w.id}
                      className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:opacity-90 transition-all"
                      style={{ background: c.background }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#7BC4A820' }}>
                        <Dumbbell className="w-5 h-5" style={{ color: '#7BC4A8' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: c.text }}>{w.modality}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[10px]" style={{ color: c.textMuted }}>{fmtData(w.date)}</span>
                          <span className="text-[10px] flex items-center gap-1" style={{ color: c.textMuted }}>
                            <Timer className="w-3 h-3" /> {w.duration_min}min
                          </span>
                          <span className="text-[10px] flex items-center gap-1" style={{ color: '#D49898' }}>
                            <Flame className="w-3 h-3" /> {w.calories} kcal
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeWorkout(w.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        style={{ background: '#D4989820' }}
                      >
                        <Trash2 className="w-3.5 h-3.5" style={{ color: '#D49898' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================== ABA CORPO ======================== */}
        {tab === 'corpo' && (
          <div className="space-y-5">

            {/* Cards resumo */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<Scale className="w-5 h-5" style={{ color: '#7BC4A8' }} />}
                iconBg="#D1FAE5"
                label="Peso atual"
                value={latestBody?.weight != null ? `${latestBody.weight}` : '---'}
                sub="kg"
                diff={bodyDiff?.weight}
              />
              <StatCard
                icon={<Target className="w-5 h-5" style={{ color: c.primary }} />}
                iconBg={c.primaryLight}
                label="Meta de peso"
                value={goals.weight_goal != null ? `${goals.weight_goal}` : '---'}
                sub="kg"
              />
              <StatCard
                icon={<Droplets className="w-5 h-5" style={{ color: '#D49898' }} />}
                iconBg="#FEE2E2"
                label="Gordura corporal"
                value={latestBody?.body_fat != null ? `${latestBody.body_fat}` : '---'}
                sub="%"
                diff={bodyDiff?.body_fat}
              />
              <StatCard
                icon={<Calendar className="w-5 h-5" style={{ color: '#F59E0B' }} />}
                iconBg="#FEF3C7"
                label="Última medição"
                value={latestBody ? fmtData(latestBody.date) : '---'}
                sub=""
              />
            </div>

            {/* Formulário de registro */}
            <div className="rounded-2xl p-5" style={{ background: c.surface, boxShadow: `0 2px 16px ${c.primary}10` }}>
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: c.text }}>
                <Ruler className="w-4 h-4" style={{ color: c.primary }} />
                Registrar medição
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                {[
                  { key: 'weight', label: 'Peso (kg)', placeholder: '70.5' },
                  { key: 'body_fat', label: 'Gordura (%)', placeholder: '18' },
                  { key: 'arm', label: 'Braço (cm)', placeholder: '32' },
                  { key: 'waist', label: 'Cintura (cm)', placeholder: '75' },
                  { key: 'hip', label: 'Quadril (cm)', placeholder: '95' },
                  { key: 'thigh', label: 'Coxa (cm)', placeholder: '55' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-medium mb-1" style={{ color: c.textMuted }}>{field.label}</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder={field.placeholder}
                      value={(bodyForm as any)[field.key]}
                      onChange={e => setBodyForm(f => ({ ...f, [field.key]: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: c.background, color: c.text, border: `1.5px solid ${c.primaryLight}` }}
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={handleSaveBody}
                className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
                style={{ background: c.primary }}
              >
                <Check className="w-4 h-4 inline mr-1" /> Salvar medição
              </button>
            </div>

            {/* Histórico */}
            <div className="rounded-2xl p-5" style={{ background: c.surface, boxShadow: `0 2px 16px ${c.primary}10` }}>
              <h3 className="text-sm font-semibold mb-4" style={{ color: c.text }}>Histórico de medições</h3>
              {loadingBody ? (
                <p className="text-sm text-center py-6" style={{ color: c.textMuted }}>Carregando...</p>
              ) : bodyHistory.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: c.textMuted }}>Nenhuma medição registrada</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {bodyHistory.slice(0, 10).map((m, i) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-4 px-4 py-3 rounded-xl"
                      style={{ background: i === 0 ? c.primaryLight : c.background }}
                    >
                      <span className="text-xs font-semibold min-w-20" style={{ color: c.text }}>{fmtData(m.date)}</span>
                      {m.weight != null && (
                        <span className="text-xs" style={{ color: c.text }}>
                          <Scale className="w-3 h-3 inline mr-1" style={{ color: '#7BC4A8' }} />
                          {m.weight} kg
                        </span>
                      )}
                      {m.body_fat != null && (
                        <span className="text-xs" style={{ color: c.text }}>
                          <Droplets className="w-3 h-3 inline mr-1" style={{ color: '#D49898' }} />
                          {m.body_fat}%
                        </span>
                      )}
                      {/* Diferença com a medição anterior */}
                      {i === 0 && bodyHistory.length >= 2 && m.weight != null && bodyHistory[1].weight != null && (
                        <span className="text-[10px] font-semibold" style={{ color: m.weight - bodyHistory[1].weight! <= 0 ? '#7BC4A8' : '#D49898' }}>
                          {m.weight - bodyHistory[1].weight! > 0 ? (
                            <><TrendingUp className="w-3 h-3 inline mr-0.5" />+{(m.weight - bodyHistory[1].weight!).toFixed(1)}</>
                          ) : (
                            <><TrendingDown className="w-3 h-3 inline mr-0.5" />{(m.weight - bodyHistory[1].weight!).toFixed(1)}</>
                          )}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================== ABA DIETA ======================== */}
        {tab === 'dieta' && (
          <div className="space-y-5">

            {/* Sub-tabs + Meta calórica */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-1 p-1 rounded-2xl" style={{ background: c.surface, boxShadow: `0 2px 8px ${c.primary}10` }}>
                {(['dia', 'semana', 'mes'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setDietaSubTab(v)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: dietaSubTab === v ? c.primary : 'transparent',
                      color: dietaSubTab === v ? '#fff' : c.textMuted,
                    }}
                  >
                    {v === 'dia' ? 'Dia' : v === 'semana' ? 'Semana' : 'Mês'}
                  </button>
                ))}
              </div>

              {/* Meta calórica */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl" style={{ background: c.surface, boxShadow: `0 2px 8px ${c.primary}10` }}>
                <Flame className="w-4 h-4" style={{ color: '#D49898' }} />
                <span className="text-xs" style={{ color: c.textMuted }}>Meta diária:</span>
                {editingCalGoal ? (
                  <>
                    <input
                      type="number"
                      value={calGoalInput}
                      onChange={e => setCalGoalInput(e.target.value)}
                      className="w-16 px-2 py-0.5 rounded-lg text-sm outline-none text-center"
                      style={{ background: c.background, color: c.text }}
                    />
                    <span className="text-xs" style={{ color: c.textMuted }}>kcal</span>
                    <button onClick={handleSaveCalGoal} className="p-1 hover:opacity-70" style={{ color: '#7BC4A8' }}><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditingCalGoal(false)} className="p-1 hover:opacity-70" style={{ color: '#D49898' }}><X className="w-4 h-4" /></button>
                  </>
                ) : (
                  <button
                    onClick={() => { setCalGoalInput(String(goals.calorie_goal)); setEditingCalGoal(true) }}
                    className="text-sm font-bold hover:opacity-70 transition-all"
                    style={{ color: c.primary }}
                  >
                    {goals.calorie_goal} kcal
                  </button>
                )}
              </div>
            </div>

            {/* ── VISTA DIA ── */}
            {dietaSubTab === 'dia' && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">

                  {/* Calendário fofo */}
                  <div className="rounded-2xl p-5" style={{ background: c.surface, boxShadow: `0 2px 16px ${c.primary}10` }}>
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => setCalViewMonth(new Date(calViewMonth.getFullYear(), calViewMonth.getMonth() - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70 transition-all"
                        style={{ background: c.primaryLight }}
                      >
                        <ChevronLeft className="w-4 h-4" style={{ color: c.primaryDark }} />
                      </button>
                      <span className="font-bold text-sm capitalize" style={{ color: c.text }}>
                        {calViewMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                      </span>
                      <button
                        onClick={() => setCalViewMonth(new Date(calViewMonth.getFullYear(), calViewMonth.getMonth() + 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70 transition-all"
                        style={{ background: c.primaryLight }}
                      >
                        <ChevronRight className="w-4 h-4" style={{ color: c.primaryDark }} />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 mb-2">
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                        <div key={d} className="text-center text-[10px] font-semibold py-1" style={{ color: c.textMuted }}>{d}</div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-y-0.5">
                      {calDays.map((day, i) => {
                        if (!day) return <div key={i} />
                        const dateStr = `${calViewMonth.getFullYear()}-${pad(calViewMonth.getMonth() + 1)}-${pad(day)}`
                        const isSelected = dateStr === selectedDate
                        const isToday = dateStr === hoje()
                        const hasData = (rangeSummary[dateStr]?.kcal ?? 0) > 0
                        return (
                          <button
                            key={i}
                            onClick={() => setSelectedDate(dateStr)}
                            className="relative flex flex-col items-center justify-center w-9 h-9 mx-auto rounded-full text-sm transition-all hover:opacity-80"
                            style={{
                              background: isSelected ? c.primary : isToday ? c.primaryLight : 'transparent',
                              color: isSelected ? '#fff' : isToday ? c.primary : c.text,
                              fontWeight: isSelected || isToday ? '700' : '400',
                            }}
                          >
                            {day}
                            {hasData && !isSelected && (
                              <span className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full" style={{ background: '#7BC4A8' }} />
                            )}
                          </button>
                        )
                      })}
                    </div>

                    <button
                      onClick={() => { setSelectedDate(hoje()); setCalViewMonth(new Date()) }}
                      className="mt-4 w-full py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
                      style={{ background: c.primaryLight, color: c.primaryDark }}
                    >
                      Hoje
                    </button>
                  </div>

                  {/* Resumo macros + falta */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold capitalize" style={{ color: c.text }}>
                      {new Date(selectedDate + 'T00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </h3>

                    {/* Card grande de calorias */}
                    <div className="rounded-2xl p-5" style={{ background: `linear-gradient(135deg, ${c.primary}12, ${c.primaryLight})`, border: `1px solid ${c.primary}20` }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: '#FEE2E2' }}>
                            <Flame className="w-5 h-5" style={{ color: '#D49898' }} />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wide font-semibold mb-0.5" style={{ color: c.textMuted }}>Calorias</p>
                            <p className="text-2xl font-bold leading-tight" style={{ color: c.text }}>
                              {dietaSummary.totalKcal}
                              <span className="text-sm font-normal ml-1" style={{ color: c.textMuted }}>/ {goals.calorie_goal} kcal</span>
                            </p>
                          </div>
                        </div>
                        {dietaSummary.totalKcal >= goals.calorie_goal ? (
                          <div className="flex items-center gap-1 px-3 py-2 rounded-xl" style={{ background: '#7BC4A820' }}>
                            <Check className="w-4 h-4" style={{ color: '#7BC4A8' }} />
                            <span className="text-xs font-bold" style={{ color: '#7BC4A8' }}>Meta!</span>
                          </div>
                        ) : (
                          <div className="text-right px-3 py-2 rounded-xl" style={{ background: c.surface }}>
                            <p className="text-[10px]" style={{ color: c.textMuted }}>falta</p>
                            <p className="text-xl font-bold" style={{ color: c.primary }}>{goals.calorie_goal - dietaSummary.totalKcal}</p>
                            <p className="text-[10px]" style={{ color: c.textMuted }}>kcal</p>
                          </div>
                        )}
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: `${c.primary}20` }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (dietaSummary.totalKcal / goals.calorie_goal) * 100)}%`,
                            background: dietaSummary.totalKcal > goals.calorie_goal ? '#D49898' : `linear-gradient(90deg, ${c.primary}, #7BC4A8)`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Cards de macros */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Proteína', consumed: dietaSummary.totalProtein, goal: goals.protein_goal, icon: <Beef className="w-4 h-4" />, iconBg: '#FEE2E2', iconColor: '#D49898', barColor: '#D49898', unit: 'g' },
                        { label: 'Carboidrato', consumed: dietaSummary.totalCarbs, goal: goals.carbs_goal, icon: <Wheat className="w-4 h-4" />, iconBg: '#FEF3C7', iconColor: '#F59E0B', barColor: '#F59E0B', unit: 'g' },
                        { label: 'Gordura', consumed: dietaSummary.totalFat, goal: goals.fat_goal, icon: <Droplets className="w-4 h-4" />, iconBg: '#DBEAFE', iconColor: '#60A5FA', barColor: '#60A5FA', unit: 'g' },
                      ].map(macro => (
                        <div key={macro.label} className="rounded-2xl p-4" style={{ background: c.surface, boxShadow: `0 2px 12px ${c.primary}08` }}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: macro.iconBg, color: macro.iconColor }}>
                              {macro.icon}
                            </div>
                            <span className="text-[11px] font-medium" style={{ color: c.textMuted }}>{macro.label}</span>
                          </div>
                          <p className="text-xl font-bold mb-1" style={{ color: c.text }}>
                            {macro.consumed}<span className="text-xs font-normal" style={{ color: c.textMuted }}>{macro.unit}</span>
                          </p>
                          {macro.goal != null ? (
                            <>
                              <p className="text-[10px] mb-1.5" style={{ color: c.textMuted }}>
                                meta: {macro.goal}{macro.unit} ·{' '}
                                {macro.consumed >= macro.goal
                                  ? <span style={{ color: '#7BC4A8' }}>✓ atingido</span>
                                  : <span style={{ color: macro.iconColor }}>falta {macro.goal - macro.consumed}{macro.unit}</span>
                                }
                              </p>
                              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: c.primaryLight }}>
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{ width: `${Math.min(100, (macro.consumed / macro.goal) * 100)}%`, background: macro.barColor }}
                                />
                              </div>
                            </>
                          ) : (
                            <p className="text-[10px]" style={{ color: c.textMuted }}>sem meta definida</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Refeições do dia */}
                {loadingMeals ? (
                  <p className="text-sm text-center py-6" style={{ color: c.textMuted }}>Carregando...</p>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {MEAL_TYPES.map(({ key, label }) => {
                      const mealItems = meals.filter(m => m.meal_type === key)
                      const form = mealForms[key]
                      const mealKcal = mealItems.reduce((s, m) => s + m.calories, 0)
                      const mealProtein = mealItems.reduce((s, m) => s + m.protein, 0)
                      return (
                        <div key={key} className="rounded-2xl p-5" style={{ background: c.surface, boxShadow: `0 2px 16px ${c.primary}10` }}>
                          <div className="flex items-center gap-2 mb-3">
                            <Utensils className="w-4 h-4" style={{ color: c.primary }} />
                            <h3 className="text-sm font-semibold flex-1" style={{ color: c.text }}>{label}</h3>
                            {mealKcal > 0 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: c.primaryLight, color: c.primaryDark }}>
                                {mealKcal} kcal · {mealProtein}g prot
                              </span>
                            )}
                          </div>

                          {mealItems.length > 0 && (
                            <div className="space-y-1.5 mb-3">
                              {mealItems.map(m => (
                                <div key={m.id} className="group flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: c.background }}>
                                  <p className="text-sm flex-1 truncate" style={{ color: c.text }}>{m.food_name}</p>
                                  <span className="text-[10px] font-semibold" style={{ color: c.textMuted }}>{m.calories}kcal</span>
                                  <span className="text-[10px]" style={{ color: '#D49898' }}>{m.protein}p</span>
                                  <span className="text-[10px]" style={{ color: '#F59E0B' }}>{m.carbs}c</span>
                                  <span className="text-[10px]" style={{ color: '#60A5FA' }}>{m.fat}g</span>
                                  <button
                                    onClick={() => removeMeal(m.id)}
                                    className="w-6 h-6 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    style={{ background: '#D4989820' }}
                                  >
                                    <Trash2 className="w-3 h-3" style={{ color: '#D49898' }} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-end gap-2 flex-wrap">
                            <div className="flex-1 min-w-32">
                              <label className="block text-[10px] font-medium mb-0.5" style={{ color: c.textMuted }}>Alimento</label>
                              <input
                                type="text"
                                placeholder="Ex: Arroz integral"
                                value={form.food_name}
                                onChange={e => setMealForms(prev => ({ ...prev, [key]: { ...prev[key], food_name: e.target.value } }))}
                                className="w-full px-2.5 py-2 rounded-lg text-sm outline-none"
                                style={{ background: c.background, color: c.text, border: `1px solid ${c.primaryLight}` }}
                              />
                            </div>
                            {[
                              { field: 'calories', label: 'Kcal', placeholder: '200' },
                              { field: 'protein', label: 'Prot', placeholder: '0' },
                              { field: 'carbs', label: 'Carb', placeholder: '0' },
                              { field: 'fat', label: 'Gord', placeholder: '0' },
                            ].map(f => (
                              <div key={f.field} className="w-16">
                                <label className="block text-[10px] font-medium mb-0.5" style={{ color: c.textMuted }}>{f.label}</label>
                                <input
                                  type="number"
                                  placeholder={f.placeholder}
                                  value={(form as any)[f.field]}
                                  onChange={e => setMealForms(prev => ({ ...prev, [key]: { ...prev[key], [f.field]: e.target.value } }))}
                                  className="w-full px-2 py-2 rounded-lg text-sm outline-none"
                                  style={{ background: c.background, color: c.text, border: `1px solid ${c.primaryLight}` }}
                                />
                              </div>
                            ))}
                            <button
                              onClick={() => handleAddMeal(key as Meal['meal_type'])}
                              className="w-9 h-9 flex items-center justify-center rounded-lg text-white hover:opacity-90 transition-all flex-shrink-0"
                              style={{ background: c.primary }}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}

            {/* ── VISTA SEMANA ── */}
            {dietaSubTab === 'semana' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSelectedDate(prevWeekDate(selectedDate))}
                    className="w-9 h-9 flex items-center justify-center rounded-xl hover:opacity-70 transition-all"
                    style={{ background: c.surface, boxShadow: `0 2px 8px ${c.primary}10` }}
                  >
                    <ChevronLeft className="w-4 h-4" style={{ color: c.primaryDark }} />
                  </button>
                  <h3 className="text-sm font-semibold" style={{ color: c.text }}>
                    {new Date(weekDates[0] + 'T00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} → {new Date(weekDates[6] + 'T00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                  </h3>
                  <button
                    onClick={() => setSelectedDate(nextWeekDate(selectedDate))}
                    className="w-9 h-9 flex items-center justify-center rounded-xl hover:opacity-70 transition-all"
                    style={{ background: c.surface, boxShadow: `0 2px 8px ${c.primary}10` }}
                  >
                    <ChevronRight className="w-4 h-4" style={{ color: c.primaryDark }} />
                  </button>
                </div>

                {/* 7 cards da semana */}
                <div className="grid grid-cols-7 gap-2">
                  {DIAS_SEMANA.map((dia, i) => {
                    const dateStr = weekDates[i]
                    const kcal = rangeSummary[dateStr]?.kcal ?? 0
                    const pct = goals.calorie_goal > 0 ? Math.min(100, (kcal / goals.calorie_goal) * 100) : 0
                    const isSelected = dateStr === selectedDate
                    const isToday = dateStr === hoje()
                    return (
                      <button
                        key={dia}
                        onClick={() => { setSelectedDate(dateStr); setDietaSubTab('dia') }}
                        className="flex flex-col items-center p-2 lg:p-3 rounded-2xl transition-all hover:opacity-90"
                        style={{
                          background: isSelected ? c.primary : isToday ? c.primaryLight : c.surface,
                          boxShadow: `0 2px 10px ${c.primary}${isSelected ? '30' : '08'}`,
                          border: isSelected ? `2px solid ${c.primary}` : '2px solid transparent',
                        }}
                      >
                        <span className="text-[10px] font-semibold mb-1" style={{ color: isSelected ? '#ffffff90' : c.textMuted }}>{dia}</span>
                        <span className="text-base font-bold" style={{ color: isSelected ? '#fff' : c.text }}>
                          {new Date(dateStr + 'T00:00').getDate()}
                        </span>
                        <div className="w-full mt-2 h-1 rounded-full overflow-hidden" style={{ background: isSelected ? '#ffffff30' : c.primaryLight }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: isSelected ? '#fff' : pct >= 100 ? '#7BC4A8' : c.primary }}
                          />
                        </div>
                        <span className="text-[9px] mt-1" style={{ color: isSelected ? '#ffffff80' : c.textMuted }}>
                          {kcal > 0 ? `${kcal}` : '—'}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Resumo semanal */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    {
                      label: 'Total kcal',
                      value: weekDates.reduce((s, d) => s + (rangeSummary[d]?.kcal ?? 0), 0),
                      unit: 'kcal',
                      icon: <Flame className="w-4 h-4" />, iconBg: '#FEE2E2', iconColor: '#D49898',
                    },
                    {
                      label: 'Total proteína',
                      value: Math.round(weekDates.reduce((s, d) => s + (rangeSummary[d]?.protein ?? 0), 0)),
                      unit: 'g',
                      icon: <Beef className="w-4 h-4" />, iconBg: '#FEE2E2', iconColor: '#D49898',
                    },
                    {
                      label: 'Média/dia',
                      value: (() => {
                        const comDados = weekDates.filter(d => (rangeSummary[d]?.kcal ?? 0) > 0)
                        return comDados.length > 0 ? Math.round(weekDates.reduce((s, d) => s + (rangeSummary[d]?.kcal ?? 0), 0) / comDados.length) : 0
                      })(),
                      unit: 'kcal',
                      icon: <Target className="w-4 h-4" />, iconBg: c.primaryLight, iconColor: c.primary,
                    },
                    {
                      label: 'Dias registrados',
                      value: weekDates.filter(d => (rangeSummary[d]?.kcal ?? 0) > 0).length,
                      unit: '/ 7',
                      icon: <Calendar className="w-4 h-4" />, iconBg: '#D1FAE5', iconColor: '#7BC4A8',
                    },
                  ].map(s => (
                    <div key={s.label} className="rounded-2xl p-4" style={{ background: c.surface, boxShadow: `0 2px 10px ${c.primary}08` }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: s.iconBg, color: s.iconColor }}>
                        {s.icon}
                      </div>
                      <p className="text-xl font-bold" style={{ color: c.text }}>
                        {s.value}<span className="text-xs font-normal ml-1" style={{ color: c.textMuted }}>{s.unit}</span>
                      </p>
                      <p className="text-xs" style={{ color: c.textMuted }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── VISTA MÊS ── */}
            {dietaSubTab === 'mes' && (
              <div className="space-y-5">
                {/* Calendário mensal completo */}
                <div className="rounded-2xl p-6" style={{ background: c.surface, boxShadow: `0 2px 16px ${c.primary}10` }}>
                  <div className="flex items-center justify-between mb-5">
                    <button
                      onClick={() => setCalViewMonth(new Date(calViewMonth.getFullYear(), calViewMonth.getMonth() - 1))}
                      className="w-9 h-9 flex items-center justify-center rounded-xl hover:opacity-70 transition-all"
                      style={{ background: c.primaryLight }}
                    >
                      <ChevronLeft className="w-4 h-4" style={{ color: c.primaryDark }} />
                    </button>
                    <span className="font-bold text-base capitalize" style={{ color: c.text }}>
                      {calViewMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      onClick={() => setCalViewMonth(new Date(calViewMonth.getFullYear(), calViewMonth.getMonth() + 1))}
                      className="w-9 h-9 flex items-center justify-center rounded-xl hover:opacity-70 transition-all"
                      style={{ background: c.primaryLight }}
                    >
                      <ChevronRight className="w-4 h-4" style={{ color: c.primaryDark }} />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 mb-2">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                      <div key={d} className="text-center text-[11px] font-semibold py-1" style={{ color: c.textMuted }}>{d}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {calDays.map((day, i) => {
                      if (!day) return <div key={i} className="h-12" />
                      const dateStr = `${calViewMonth.getFullYear()}-${pad(calViewMonth.getMonth() + 1)}-${pad(day)}`
                      const kcal = rangeSummary[dateStr]?.kcal ?? 0
                      const pct = goals.calorie_goal > 0 ? Math.min(100, (kcal / goals.calorie_goal) * 100) : 0
                      const isSelected = dateStr === selectedDate
                      const isToday = dateStr === hoje()
                      const dotColor = pct >= 100 ? '#7BC4A8' : pct >= 50 ? '#F59E0B' : '#D49898'
                      return (
                        <button
                          key={i}
                          onClick={() => { setSelectedDate(dateStr); setDietaSubTab('dia') }}
                          className="relative flex flex-col items-center justify-center h-12 rounded-xl transition-all hover:opacity-80"
                          style={{
                            background: isSelected ? c.primary : isToday ? c.primaryLight : 'transparent',
                            color: isSelected ? '#fff' : isToday ? c.primary : c.text,
                            fontWeight: isSelected || isToday ? '700' : '400',
                          }}
                        >
                          <span className="text-sm">{day}</span>
                          {kcal > 0 && (
                            <span className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ background: isSelected ? '#ffffff90' : dotColor }} />
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Legenda */}
                  <div className="flex items-center gap-5 mt-4 pt-4 justify-center flex-wrap" style={{ borderTop: `1px solid ${c.primary}10` }}>
                    {[
                      { color: '#7BC4A8', label: 'Meta atingida (≥100%)' },
                      { color: '#F59E0B', label: 'Parcial (50–99%)' },
                      { color: '#D49898', label: 'Abaixo de 50%' },
                    ].map(l => (
                      <div key={l.label} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                        <span className="text-[10px]" style={{ color: c.textMuted }}>{l.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resumo mensal */}
                {(() => {
                  const year = calViewMonth.getFullYear()
                  const month = calViewMonth.getMonth()
                  const daysInMonth = new Date(year, month + 1, 0).getDate()
                  const allDays = Array.from({ length: daysInMonth }, (_, i) => `${year}-${pad(month + 1)}-${pad(i + 1)}`)
                  const totalKcal = allDays.reduce((s, d) => s + (rangeSummary[d]?.kcal ?? 0), 0)
                  const diasReg = allDays.filter(d => (rangeSummary[d]?.kcal ?? 0) > 0).length
                  const avgKcal = diasReg > 0 ? Math.round(totalKcal / diasReg) : 0
                  const totalProt = Math.round(allDays.reduce((s, d) => s + (rangeSummary[d]?.protein ?? 0), 0))
                  return (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {[
                        { label: 'Total kcal', value: totalKcal, unit: 'kcal', icon: <Flame className="w-4 h-4" />, iconBg: '#FEE2E2', iconColor: '#D49898' },
                        { label: 'Dias registrados', value: diasReg, unit: `/ ${daysInMonth}`, icon: <Calendar className="w-4 h-4" />, iconBg: '#D1FAE5', iconColor: '#7BC4A8' },
                        { label: 'Média kcal/dia', value: avgKcal, unit: 'kcal', icon: <Target className="w-4 h-4" />, iconBg: c.primaryLight, iconColor: c.primary },
                        { label: 'Total proteína', value: totalProt, unit: 'g', icon: <Beef className="w-4 h-4" />, iconBg: '#FEE2E2', iconColor: '#D49898' },
                      ].map(s => (
                        <div key={s.label} className="rounded-2xl p-4" style={{ background: c.surface, boxShadow: `0 2px 10px ${c.primary}08` }}>
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: s.iconBg, color: s.iconColor }}>
                            {s.icon}
                          </div>
                          <p className="text-xl font-bold" style={{ color: c.text }}>
                            {s.value}<span className="text-xs font-normal ml-1" style={{ color: c.textMuted }}>{s.unit}</span>
                          </p>
                          <p className="text-xs" style={{ color: c.textMuted }}>{s.label}</p>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>
            )}

          </div>
        )}

        {/* ======================== ABA DESAFIOS ======================== */}
        {tab === 'desafios' && (
          <div className="space-y-5">

            {/* Desafio ativo */}
            {activeChallenge && (
              <div
                className="rounded-2xl p-6"
                style={{
                  background: `linear-gradient(135deg, ${c.primary}15, ${c.primaryLight})`,
                  border: `2px solid ${c.primary}30`,
                  boxShadow: `0 4px 20px ${c.primary}15`,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="w-5 h-5" style={{ color: '#F59E0B' }} />
                      <h3 className="text-lg font-bold" style={{ color: c.text }}>{activeChallenge.name}</h3>
                    </div>
                    {activeChallenge.modality && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: c.primary + '20', color: c.primary }}>
                        {activeChallenge.modality}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-light" style={{ color: c.primary }}>
                      {activeChallenge.completed_days}<span className="text-base" style={{ color: c.textMuted }}>/{activeChallenge.duration_days}</span>
                    </p>
                    <p className="text-xs" style={{ color: c.textMuted }}>dias</p>
                  </div>
                </div>

                {/* Barra de progresso */}
                <div className="h-3 rounded-full overflow-hidden mb-4" style={{ background: c.surface }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(activeChallenge.completed_days / activeChallenge.duration_days) * 100}%`,
                      background: `linear-gradient(90deg, ${c.primary}, #7BC4A8)`,
                    }}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleConcluirDia}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
                    style={{ background: '#7BC4A8' }}
                  >
                    <Check className="w-4 h-4" /> Concluir dia
                  </button>
                  <button
                    onClick={handleAbandonar}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
                    style={{ background: '#D4989820', color: '#D49898' }}
                  >
                    <X className="w-4 h-4" /> Abandonar
                  </button>
                </div>
              </div>
            )}

            {/* Criar desafio */}
            {!showChallengeForm ? (
              <button
                onClick={() => setShowChallengeForm(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
                style={{ background: c.primary }}
              >
                <Plus className="w-4 h-4" /> Criar desafio
              </button>
            ) : (
              <div className="rounded-2xl p-5 space-y-4" style={{ background: c.surface, boxShadow: `0 2px 16px ${c.primary}10` }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold" style={{ color: c.text }}>Novo Desafio</h3>
                  <button onClick={() => setShowChallengeForm(false)} className="p-1 rounded-lg hover:opacity-70" style={{ color: c.textMuted }}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1" style={{ color: c.textMuted }}>Nome do desafio</label>
                    <input
                      type="text"
                      placeholder="Ex: 30 dias de corrida"
                      value={challengeForm.name}
                      onChange={e => setChallengeForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: c.background, color: c.text, border: `1.5px solid ${c.primaryLight}` }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: c.textMuted }}>Modalidade</label>
                    <FitnessSelect
                      value={challengeForm.modality}
                      onChange={v => setChallengeForm(f => ({ ...f, modality: v }))}
                      options={MODALITIES.map(m => ({ value: m, label: m }))}
                      colors={c}
                      showIcons
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: c.textMuted }}>Duração</label>
                    <FitnessSelect
                      value={challengeForm.duration_days}
                      onChange={v => setChallengeForm(f => ({ ...f, duration_days: v }))}
                      options={[
                        { value: '7',  label: '7 dias'  },
                        { value: '15', label: '15 dias' },
                        { value: '21', label: '21 dias' },
                        { value: '30', label: '30 dias' },
                      ]}
                      colors={c}
                    />
                  </div>
                </div>
                <div className="w-48">
                  <label className="block text-xs font-medium mb-1" style={{ color: c.textMuted }}>Data de início</label>
                  <FitnessDatePicker
                    value={challengeForm.start_date}
                    onChange={v => setChallengeForm(f => ({ ...f, start_date: v }))}
                    colors={c}
                  />
                </div>
                <button
                  onClick={handleCreateChallenge}
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
                  style={{ background: c.primary }}
                >
                  <Check className="w-4 h-4 inline mr-1" /> Criar
                </button>
              </div>
            )}

            {/* Histórico de desafios */}
            {pastChallenges.length > 0 && (
              <div className="rounded-2xl p-5" style={{ background: c.surface, boxShadow: `0 2px 16px ${c.primary}10` }}>
                <h3 className="text-sm font-semibold mb-4" style={{ color: c.text }}>Histórico</h3>
                <div className="space-y-2">
                  {pastChallenges.map(ch => (
                    <div
                      key={ch.id}
                      className="group flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ background: c.background }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: ch.status === 'completed' ? '#D1FAE5' : '#FEE2E2' }}
                      >
                        {ch.status === 'completed' ? (
                          <Trophy className="w-5 h-5" style={{ color: '#7BC4A8' }} />
                        ) : (
                          <X className="w-5 h-5" style={{ color: '#D49898' }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: c.text }}>{ch.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {ch.modality && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: c.primaryLight, color: c.primaryDark }}>
                              {ch.modality}
                            </span>
                          )}
                          <span className="text-[10px]" style={{ color: c.textMuted }}>
                            {ch.completed_days}/{ch.duration_days} dias
                          </span>
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              background: ch.status === 'completed' ? '#D1FAE5' : '#FEE2E2',
                              color: ch.status === 'completed' ? '#7BC4A8' : '#D49898',
                            }}
                          >
                            {ch.status === 'completed' ? 'Concluído' : 'Abandonado'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeChallenge(ch.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        style={{ background: '#D4989820' }}
                      >
                        <Trash2 className="w-3.5 h-3.5" style={{ color: '#D49898' }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Estado vazio quando não tem desafios */}
            {!activeChallenge && pastChallenges.length === 0 && !showChallengeForm && (
              <div className="text-center py-16">
                <Trophy className="w-12 h-12 mx-auto mb-3" style={{ color: c.textMuted }} />
                <p className="text-lg font-semibold" style={{ color: c.text }}>Nenhum desafio ainda</p>
                <p className="text-sm mt-1" style={{ color: c.textMuted }}>Crie seu primeiro desafio fitness!</p>
              </div>
            )}
          </div>
        )}

        {/* ======================== ABA DISPOSITIVOS ======================== */}

      </div>
    </div>
  )
}

// Componente auxiliar: card de estatística
function StatCard({
  icon,
  iconBg,
  label,
  value,
  sub,
  diff,
}: {
  icon: React.ReactNode
  iconBg: string
  label: string
  value: string
  sub: string
  diff?: number | null
}) {
  const { currentTheme } = useTheme()
  const c = currentTheme.colors

  return (
    <div className="rounded-2xl p-4" style={{ background: c.surface, boxShadow: `0 2px 16px ${c.primary}10` }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
          {icon}
        </div>
        <p className="text-xs" style={{ color: c.textMuted }}>{label}</p>
      </div>
      <div className="flex items-baseline gap-1.5">
        <p className="text-2xl font-light" style={{ color: c.text }}>{value}</p>
        {sub && <span className="text-xs" style={{ color: c.textMuted }}>{sub}</span>}
      </div>
      {diff != null && (
        <p className="text-[10px] font-semibold mt-1" style={{ color: diff <= 0 ? '#7BC4A8' : '#D49898' }}>
          {diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)}
        </p>
      )}
    </div>
  )
}
