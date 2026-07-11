import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { fetchBooks } from '../services/books'
import { fetchCourses } from '../services/courses'
import { fetchHabits } from '../services/habits'
import { fetchGoals } from '../services/goals'
import type { Book } from '../types/book.types'
import type { Course } from '../types/course.types'
import type { Habit } from '../types/habit.types'
import type { Goal } from '../types/goals.types'

export interface AnalyticsData {
  // KPIs
  tarefasConcluidas: number
  taxaHabitos: number          // % média anual
  livrosLidos: number
  cursosConcluidos: number

  // Gráficos por mês (índice 0-11)
  tarefasPorMes: number[]
  livrosPorMes: number[]
  habitosTaxaPorMes: number[]  // % 0-100

  // Metas do ano
  metasAnuais: Goal[]
  metasMensais: Goal[]

  // Detalhes
  habitos: Habit[]
  livros: Book[]
  cursos: Course[]

  // Estado
  carregando: boolean
  ano: number
  mes: number
}

export function useAnalytics(ano: number, mes: number): AnalyticsData {
  const { user } = useAuth()
  const userId = user?.id ?? ''

  const [tarefasPorMes,     setTarefasPorMes]     = useState<number[]>(Array(12).fill(0))
  const [livrosPorMes,      setLivrosPorMes]       = useState<number[]>(Array(12).fill(0))
  const [habitosTaxaPorMes, setHabitosTaxaPorMes]  = useState<number[]>(Array(12).fill(0))
  const [metasAnuais,       setMetasAnuais]         = useState<Goal[]>([])
  const [metasMensais,      setMetasMensais]        = useState<Goal[]>([])
  const [habitos,           setHabitos]             = useState<Habit[]>([])
  const [livros,            setLivros]              = useState<Book[]>([])
  const [cursos,            setCursos]              = useState<Course[]>([])
  const [carregando,        setCarregando]          = useState(true)

  useEffect(() => {
    if (!userId) return
    const carregar = async () => {
      setCarregando(true)
      const anoStr = String(ano)
      const inicio = `${anoStr}-01-01`
      const fim    = `${anoStr}-12-31`

      await Promise.allSettled([
        // Tarefas concluídas por mês
        (async () => {
          const { data } = await supabase
            .from('week_tasks')
            .select('date')
            .eq('user_id', userId)
            .eq('done', true)
            .gte('date', inicio)
            .lte('date', fim)
          const por: number[] = Array(12).fill(0)
          for (const r of data ?? []) {
            const m = Number(r.date.slice(5, 7)) - 1
            if (m >= 0 && m < 12) por[m]++
          }
          setTarefasPorMes(por)
        })(),

        // Livros por mês (finishedAt)
        fetchBooks().then(bs => {
          setLivros(bs)
          const por: number[] = Array(12).fill(0)
          for (const b of bs) {
            if (b.finishedAt && b.finishedAt.startsWith(anoStr)) {
              const m = Number(b.finishedAt.slice(5, 7)) - 1
              if (m >= 0 && m < 12) por[m]++
            }
          }
          setLivrosPorMes(por)
        }).catch(() => {}),

        // Hábitos — taxa mensal
        fetchHabits().then(async hs => {
          setHabitos(hs)
          if (hs.length === 0) { setHabitosTaxaPorMes(Array(12).fill(0)); return }
          const { data } = await supabase
            .from('habit_completions')
            .select('date')
            .eq('user_id', userId)
            .gte('date', inicio)
            .lte('date', fim)
          const completedByMonth: number[] = Array(12).fill(0)
          for (const r of data ?? []) {
            const m = Number((r.date as string).slice(5, 7)) - 1
            if (m >= 0 && m < 12) completedByMonth[m]++
          }
          // Taxa = completions / (hábitos × dias do mês)
          const taxa: number[] = Array(12).fill(0)
          for (let m = 0; m < 12; m++) {
            const diasNoMes = new Date(ano, m + 1, 0).getDate()
            const possivel  = hs.length * diasNoMes
            taxa[m] = possivel > 0 ? Math.round((completedByMonth[m] / possivel) * 100) : 0
          }
          setHabitosTaxaPorMes(taxa)
        }).catch(() => {}),

        // Cursos
        fetchCourses().then(setCursos).catch(() => {}),

        // Metas
        fetchGoals('annual', ano).then(setMetasAnuais).catch(() => {}),
        fetchGoals('monthly', ano, new Date().getMonth()).then(setMetasMensais).catch(() => {}),
      ])
      setCarregando(false)
    }
    carregar()
  }, [userId, ano])

  // KPIs derivados
  const tarefasConcluidas = tarefasPorMes.reduce((a, b) => a + b, 0)

  // Taxa: considera apenas meses até o mês atual (meses futuros têm 0 natural)
  const anoAtualCalc = new Date().getFullYear()
  const mesAtualCalc = new Date().getMonth()
  const mesesValidos = habitosTaxaPorMes.filter((v, i) => {
    if (ano < anoAtualCalc) return true
    return i <= mesAtualCalc
  })
  const taxaHabitos = mesesValidos.filter(v => v > 0).length > 0
    ? Math.round(mesesValidos.filter(v => v > 0).reduce((a, b) => a + b, 0) / mesesValidos.filter(v => v > 0).length)
    : 0

  // Livros lidos: usa finishedAt se disponível, senão created_at para livros com status 'lido'
  const anoStr2 = String(ano)
  const livrosLidos = livros.filter(b => {
    if (b.finishedAt) return b.finishedAt.startsWith(anoStr2)
    if (b.status === 'lido') return b.created_at?.startsWith(anoStr2)
    return false
  }).length

  const cursosConcluidos = cursos.filter(c => c.status === 'completed').length

  return {
    tarefasConcluidas,
    taxaHabitos,
    livrosLidos,
    cursosConcluidos,
    tarefasPorMes,
    livrosPorMes,
    habitosTaxaPorMes,
    metasAnuais,
    metasMensais,
    habitos,
    livros,
    cursos,
    carregando,
    ano,
    mes,
  }
}
