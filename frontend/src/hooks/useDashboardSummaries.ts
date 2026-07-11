import { useState, useEffect } from 'react'
import { fetchExams, fetchSubjects } from '../services/university'
import { fetchTransactions } from '../services/finance'
import { fetchHealthLogs } from '../services/health'
import { fetchGoals } from '../services/goals'
import { fetchHabits } from '../services/habits'
import { fetchBooks } from '../services/books'
import { fetchCourses } from '../services/courses'
import type { UniExam, UniSubject } from '../types/uni.types'
import type { Transaction } from '../types/finance.types'
import type { HealthLog } from '../types/health.types'
import type { Goal } from '../types/goals.types'
import type { Habit } from '../types/habit.types'
import type { Book } from '../types/book.types'
import type { Course } from '../types/course.types'

function getLast7Key() {
  const d = new Date()
  d.setDate(d.getDate() - 6)
  return d.toISOString().split('T')[0]
}

function get30DaysAhead() {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().split('T')[0]
}

export interface DashboardSummaries {
  // Hábitos
  habitos: Habit[]
  habitosTodayDone: number
  habitosTodayTotal: number
  habitoMaiorStreak: Habit | null

  // Livros
  livros: Book[]
  livrosAno: number
  livrosLendo: number

  // Cursos
  cursos: Course[]
  cursosEmAndamento: number
  cursosConcluidos: number

  // Universitário
  proximasProvas: UniExam[]
  materiasAtivas: UniSubject[]

  // Finanças — mês corrente
  receitasMes: number
  despesasMes: number
  saldoMes: number
  transacoesMes: Transaction[]

  // Saúde — últimos 7 dias
  mediaAgua: number
  mediaSono: number
  humorFrequente: number | null
  logsSaude: HealthLog[]

  // Metas — ano corrente
  metasAnuais: Goal[]
  metasMensais: Goal[]

  carregando: boolean
}

export function useDashboardSummaries(): DashboardSummaries {
  const now       = new Date()
  const todayStr  = now.toISOString().split('T')[0]
  const ahead30   = get30DaysAhead()
  const since7    = getLast7Key()
  const anoAtual  = now.getFullYear()
  const mesAtual  = now.getMonth()

  const [exams,        setExams]        = useState<UniExam[]>([])
  const [subjects,     setSubjects]     = useState<UniSubject[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [healthLogs,   setHealthLogs]   = useState<HealthLog[]>([])
  const [metasAnuais,  setMetasAnuais]  = useState<Goal[]>([])
  const [metasMensais, setMetasMensais] = useState<Goal[]>([])
  const [habitos,      setHabitos]      = useState<Habit[]>([])
  const [livros,       setLivros]       = useState<Book[]>([])
  const [cursos,       setCursos]       = useState<Course[]>([])
  const [carregando,   setCarregando]   = useState(true)

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true)
      await Promise.allSettled([
        fetchExams().then(setExams).catch(() => {}),
        fetchSubjects().then(setSubjects).catch(() => {}),
        fetchTransactions().then(setTransactions).catch(() => {}),
        fetchHealthLogs(since7).then(setHealthLogs).catch(() => {}),
        fetchGoals('annual', anoAtual).then(setMetasAnuais).catch(() => {}),
        fetchGoals('monthly', anoAtual, mesAtual).then(setMetasMensais).catch(() => {}),
        fetchHabits().then(setHabitos).catch(() => {}),
        fetchBooks().then(setLivros).catch(() => {}),
        fetchCourses().then(setCursos).catch(() => {}),
      ])
      setCarregando(false)
    }
    carregar()
  }, [])

  // Próximas provas: pendentes nos próximos 30 dias
  const proximasProvas = exams
    .filter(e => e.status === 'pending' && e.examDate >= todayStr && e.examDate <= ahead30)
    .sort((a, b) => a.examDate.localeCompare(b.examDate))
    .slice(0, 4)

  // Matérias ativas
  const materiasAtivas = subjects.filter(s => s.subjectStatus === 'open')

  // Finanças do mês corrente
  const mesStr = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}`
  const transacoesMes = transactions.filter(t => t.date.startsWith(mesStr))
  const receitasMes  = transacoesMes.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const despesasMes  = transacoesMes.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const saldoMes     = receitasMes - despesasMes

  // Saúde — média dos últimos 7 dias
  const logsSemana = healthLogs.filter(l => l.log_date >= since7)
  const diasComDados = logsSemana.length || 1
  const mediaAgua = logsSemana.reduce((s, l) => s + (l.water ?? 0), 0) / diasComDados
  const mediaSono = logsSemana.reduce((s, l) => s + (l.sleep ?? 0), 0) / diasComDados

  // Humor mais frequente na semana
  const moodCounts: Record<number, number> = {}
  logsSemana.forEach(l => { if (l.mood) moodCounts[l.mood] = (moodCounts[l.mood] ?? 0) + 1 })
  const humorFrequente = Object.keys(moodCounts).length > 0
    ? Number(Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0][0])
    : null

  // Hábitos — hoje
  const habitosTodayDone  = habitos.filter(h => h.completions[todayStr]).length
  const habitosTodayTotal = habitos.length
  const habitoMaiorStreak = habitos.length > 0
    ? habitos.reduce((prev, cur) => (cur.streak > prev.streak ? cur : prev))
    : null

  // Livros — ano atual
  const anoStr    = String(anoAtual)
  const livrosAno = livros.filter(l => {
    if (l.finishedAt) return l.finishedAt.startsWith(anoStr)
    if (l.status === 'lido') return l.created_at?.startsWith(anoStr)
    return false
  }).length
  const livrosLendo = livros.filter(l => l.status === 'lendo').length

  // Cursos
  const cursosEmAndamento = cursos.filter(c => c.status === 'in-progress' || c.status === 'urgent').length
  const cursosConcluidos  = cursos.filter(c => c.status === 'completed').length

  return {
    habitos,
    habitosTodayDone,
    habitosTodayTotal,
    habitoMaiorStreak,
    livros,
    livrosAno,
    livrosLendo,
    cursos,
    cursosEmAndamento,
    cursosConcluidos,
    proximasProvas,
    materiasAtivas,
    receitasMes,
    despesasMes,
    saldoMes,
    transacoesMes,
    mediaAgua,
    mediaSono,
    humorFrequente,
    logsSaude: logsSemana,
    metasAnuais,
    metasMensais,
    carregando,
  }
}
