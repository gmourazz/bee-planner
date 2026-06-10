import { supabase } from '../lib/supabase'
import { calcStreak } from '../utils/date.utils'
import type { Habit } from '../types/habit.types'

let _cache: { userId: string; habits: Habit[] } | null = null

export function invalidateHabitsCache() {
  _cache = null
}

export async function fetchHabits(): Promise<Habit[]> {
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) throw new Error('Não autenticado')

  if (_cache && _cache.userId === user.id) return _cache.habits

  const desde = new Date()
  desde.setDate(desde.getDate() - 60)

  const [habitsResult, completionsResult] = await Promise.all([
    supabase.from('habits').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
    supabase.from('habit_completions').select('habit_id, date').eq('user_id', user.id).gte('date', desde.toISOString().split('T')[0]),
  ])

  if (habitsResult.error) throw new Error(habitsResult.error.message)
  const habitos = habitsResult.data ?? []
  if (habitos.length === 0) return []

  const porHabito: Record<string, string[]> = {}
  for (const c of completionsResult.data ?? []) {
    if (!porHabito[c.habit_id]) porHabito[c.habit_id] = []
    porHabito[c.habit_id].push(c.date)
  }

  const habits = habitos.map(h => {
    const datas = porHabito[h.id] ?? []
    const completions: Record<string, boolean> = {}
    for (const d of datas) completions[d] = true
    return { id: h.id, name: h.name, iconKey: h.icon_key, color: h.color, completions, streak: calcStreak(datas) }
  })

  _cache = { userId: user.id, habits }
  return habits
}

export async function createHabit(name: string, iconKey: string, color: string): Promise<Habit> {
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) throw new Error('Não autenticado')

  const { data, error } = await supabase
    .from('habits')
    .insert({ user_id: user.id, name: name.trim(), icon_key: iconKey, color })
    .select()
    .single()

  if (error) throw new Error(error.message)
  invalidateHabitsCache()
  return { id: data.id, name: data.name, iconKey: data.icon_key, color: data.color, completions: {}, streak: 0 }
}

export async function deleteHabit(id: string): Promise<void> {
  const { error } = await supabase.from('habits').delete().eq('id', id)
  if (error) throw new Error(error.message)
  invalidateHabitsCache()
}

export async function toggleHabit(habitId: string, date: string): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) throw new Error('Não autenticado')

  const { data: existente } = await supabase
    .from('habit_completions')
    .select('id')
    .eq('habit_id', habitId)
    .eq('date', date)
    .single()

  invalidateHabitsCache()

  if (existente) {
    await supabase.from('habit_completions').delete().eq('id', existente.id)
    return false
  } else {
    await supabase.from('habit_completions').insert({ habit_id: habitId, user_id: user.id, date })
    return true
  }
}
