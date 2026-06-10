import { supabase } from '../lib/supabase'
import type { HealthLog } from '../types/health.types'

async function uid() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Não autenticado')
  return session.user.id
}

function mapLog(r: any): HealthLog {
  return {
    id: r.id,
    log_date: r.log_date,
    water: r.water,
    sleep: Number(r.sleep),
    mood: r.mood ?? null,
    exercises: r.exercises ?? [],
    steps: r.steps,
    created_at: r.created_at,
  }
}

export async function fetchHealthLogs(sinceDate: string): Promise<HealthLog[]> {
  const userId = await uid()
  const { data, error } = await supabase
    .from('health_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('log_date', sinceDate)
    .order('log_date')
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapLog)
}

export async function upsertHealthLog(
  date: string,
  updates: Partial<Pick<HealthLog, 'water' | 'sleep' | 'mood' | 'exercises' | 'steps'>>,
): Promise<HealthLog> {
  const userId = await uid()
  const { data, error } = await supabase
    .from('health_logs')
    .upsert({ user_id: userId, log_date: date, ...updates }, { onConflict: 'user_id,log_date' })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return mapLog(data)
}
