import { supabase } from '../lib/supabase'

export interface WeekTask {
  id: string
  date: string
  text: string
  time?: string
  done: boolean
}

export async function fetchWeekTasks(dateFrom: string, dateTo: string): Promise<WeekTask[]> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Não autenticado')

  const { data, error } = await supabase
    .from('week_tasks')
    .select('*')
    .eq('user_id', session.user.id)
    .gte('date', dateFrom)
    .lte('date', dateTo)
    .order('time', { ascending: true, nullsFirst: true })
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []).map(r => ({
    id: r.id, date: r.date, text: r.text, time: r.time ?? undefined, done: r.done,
  }))
}

export async function createWeekTask(date: string, text: string, time?: string): Promise<WeekTask> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Não autenticado')

  const { data, error } = await supabase
    .from('week_tasks')
    .insert({ user_id: session.user.id, date, text: text.trim(), time: time || null, done: false })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return { id: data.id, date: data.date, text: data.text, time: data.time ?? undefined, done: data.done }
}

export async function toggleWeekTask(id: string, done: boolean): Promise<void> {
  const { error } = await supabase.from('week_tasks').update({ done }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteWeekTask(id: string): Promise<void> {
  const { error } = await supabase.from('week_tasks').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
