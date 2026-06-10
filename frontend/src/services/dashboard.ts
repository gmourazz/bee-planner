import { supabase } from '../lib/supabase'

export type TaskCategory = 'tarefa' | 'habito' | 'livro'

export interface DashTask {
  id: string
  text: string
  time: string | null
  done: boolean
  date: string
  category: TaskCategory
}

export interface DashEvent {
  id: string
  title: string
  date: string
  type: string
}

export interface DashStats {
  habits: number
  books: number
}

// Resumo por dia da semana: { '2026-06-09': { tarefa: 2, habito: 1, livro: 0 } }
export type WeekSummary = Record<string, Record<TaskCategory, number>>

export async function fetchTodayTasks(userId: string, date: string): Promise<DashTask[]> {
  const { data, error } = await supabase
    .from('week_tasks')
    .select('id, text, time, done, date, category')
    .eq('user_id', userId)
    .eq('date', date)
    .order('time', { ascending: true, nullsFirst: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(r => ({
    id: r.id, text: r.text, time: r.time ?? null,
    done: r.done, date: r.date, category: r.category ?? 'tarefa',
  }))
}

export async function fetchWeekSummary(userId: string, dates: string[]): Promise<WeekSummary> {
  if (!dates.length) return {}
  const { data, error } = await supabase
    .from('week_tasks')
    .select('date, category')
    .eq('user_id', userId)
    .in('date', dates)
  if (error) return {}
  const summary: WeekSummary = {}
  for (const d of dates) summary[d] = { tarefa: 0, habito: 0, livro: 0 }
  for (const row of data ?? []) {
    const cat = (row.category ?? 'tarefa') as TaskCategory
    if (summary[row.date]) summary[row.date][cat]++
  }
  return summary
}

export async function createTodayTask(
  userId: string, date: string, text: string,
  time: string | null, category: TaskCategory,
): Promise<DashTask> {
  const { data, error } = await supabase
    .from('week_tasks')
    .insert({ user_id: userId, date, text: text.trim(), time: time || null, done: false, category })
    .select('id, text, time, done, date, category')
    .single()
  if (error) throw new Error(error.message)
  return { id: data.id, text: data.text, time: data.time ?? null, done: data.done, date: data.date, category: data.category }
}

export async function toggleTask(id: string, done: boolean): Promise<void> {
  const { error } = await supabase.from('week_tasks').update({ done }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function updateTask(id: string, text: string, time: string | null, category?: TaskCategory): Promise<void> {
  const patch: Record<string, unknown> = { text: text.trim(), time: time || null }
  if (category) patch.category = category
  const { error } = await supabase.from('week_tasks').update(patch).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('week_tasks').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function fetchUpcomingEvents(userId: string, from: string, limit = 8, to?: string): Promise<DashEvent[]> {
  let query = supabase
    .from('events')
    .select('id, title, date, type')
    .eq('user_id', userId)
    .gte('date', from)
    .order('date', { ascending: true })
  if (to) query = query.lte('date', to)
  else query = query.limit(limit)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []).map(r => ({ id: r.id, title: r.title, date: r.date, type: r.type }))
}

export async function fetchDashStats(userId: string): Promise<DashStats> {
  const [{ count: habits }, { count: books }] = await Promise.all([
    supabase.from('habits').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('books').select('*', { count: 'exact', head: true }).eq('user_id', userId),
  ])
  return { habits: habits ?? 0, books: books ?? 0 }
}
