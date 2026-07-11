import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import {
  fetchTodayTasks, createTodayTask, toggleTask, updateTask, deleteTask,
  fetchUpcomingEvents, fetchDashStats, fetchWeekSummary,
  type DashTask, type DashEvent, type DashStats, type WeekSummary, type TaskCategory,
} from '../services/dashboard'
import { createEvent, invalidateEventsCache } from '../services/events'
import { useAuth } from '../contexts/AuthContext'

export function useDashboard(selectedDate: string, weekDates: string[]) {
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const { key: locationKey } = useLocation()

  const [tasks,       setTasks]       = useState<DashTask[]>([])
  const [events,      setEvents]      = useState<DashEvent[]>([])
  const [stats,       setStats]       = useState<DashStats>({ habits: 0, books: 0 })
  const [weekSummary, setWeekSummary] = useState<WeekSummary>({})
  const [loading,     setLoading]     = useState(true)

  // Tarefas recarregam a cada troca de data — com cancelamento para evitar race condition
  useEffect(() => {
    if (!userId) return
    let cancelled = false
    setLoading(true)
    fetchTodayTasks(userId, selectedDate)
      .then(t  => { if (!cancelled) setTasks(t) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [userId, selectedDate])

  // Eventos recarregam sempre que o usuário navega para /inicio (locationKey muda a cada visita)
  useEffect(() => {
    if (!userId) return
    const pad = (n: number) => String(n).padStart(2, '0')
    const today = new Date()
    const in7   = new Date(today); in7.setDate(today.getDate() + 7)
    const todayKey  = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`
    const in7Key    = `${in7.getFullYear()}-${pad(in7.getMonth()+1)}-${pad(in7.getDate())}`
    Promise.all([
      fetchUpcomingEvents(userId, todayKey, 8, in7Key),
      fetchDashStats(userId),
      fetchWeekSummary(userId, weekDates),
    ])
      .then(([e, s, w]) => { setEvents(e); setStats(s); setWeekSummary(w) })
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, locationKey])

  const recarregarSemana = useCallback(async () => {
    if (!userId) return
    const w = await fetchWeekSummary(userId, weekDates)
    setWeekSummary(w)
  }, [userId, weekDates])

  const addTask = async (text: string, time: string, category: TaskCategory) => {
    if (!text.trim() || !userId) return
    const nova = await createTodayTask(userId, selectedDate, text, time || null, category)
    setTasks(prev => [...prev, nova])
    setWeekSummary(prev => ({
      ...prev,
      [selectedDate]: {
        tarefa: prev[selectedDate]?.tarefa ?? 0,
        habito: prev[selectedDate]?.habito ?? 0,
        livro:  prev[selectedDate]?.livro  ?? 0,
        [category]: (prev[selectedDate]?.[category] ?? 0) + 1,
      },
    }))
  }

  const toggleDone = async (id: string) => {
    const current = tasks.find(t => t.id === id)
    if (!current) return
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
    try { await toggleTask(id, !current.done) }
    catch { /* reverte na próxima navegação */ }
  }

  const editTask = async (id: string, text: string, time: string | null, category?: TaskCategory) => {
    if (!text.trim()) return
    setTasks(prev => prev.map(t => t.id === id ? { ...t, text: text.trim(), time, ...(category ? { category } : {}) } : t))
    try { await updateTask(id, text, time, category) }
    catch { /* silencioso */ }
  }

  const removeTask = async (id: string) => {
    const task = tasks.find(t => t.id === id)
    setTasks(prev => prev.filter(t => t.id !== id))
    if (task) {
      setWeekSummary(prev => ({
        ...prev,
        [selectedDate]: {
          tarefa: prev[selectedDate]?.tarefa ?? 0,
          habito: prev[selectedDate]?.habito ?? 0,
          livro:  prev[selectedDate]?.livro  ?? 0,
          [task.category]: Math.max(0, (prev[selectedDate]?.[task.category] ?? 1) - 1),
        },
      }))
    }
    try { await deleteTask(id) }
    catch { recarregarSemana() }
  }

  const addEvent = async (title: string, date: string, type: string) => {
    if (!title.trim() || !date) return
    const ev = await createEvent(title, date, type)
    invalidateEventsCache()
    setEvents(prev => [...prev, { id: ev.id, title: ev.title, date: ev.date, type: ev.type }].sort((a, b) => a.date.localeCompare(b.date)))
  }

  return { tasks, events, stats, weekSummary, loading, addTask, addEvent, toggleDone, editTask, removeTask }
}
