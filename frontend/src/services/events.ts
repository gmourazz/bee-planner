import { supabase } from '../lib/supabase'
import { apiFetch } from '../lib/client'
import type { CalEvent, IntegrationStatus } from '../types/event.types'

let _cache: { userId: string; events: CalEvent[] } | null = null

export function invalidateEventsCache() {
  _cache = null
}

export async function fetchEvents(): Promise<CalEvent[]> {
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) throw new Error('Não autenticado')

  if (_cache && _cache.userId === user.id) return _cache.events

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: true })

  if (error) throw new Error(error.message)

  const events: CalEvent[] = (data ?? []).map(e => ({
    id: e.id,
    title: e.title,
    date: e.date,
    type: e.type,
    description: e.description,
  }))

  _cache = { userId: user.id, events }
  return events
}

export async function createEvent(
  title: string,
  date: string,
  type: string,
  description?: string,
): Promise<CalEvent> {
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) throw new Error('Não autenticado')

  const { data, error } = await supabase
    .from('events')
    .insert({ user_id: user.id, title: title.trim(), date, type, description: description?.trim() || null })
    .select()
    .single()

  if (error) throw new Error(error.message)
  invalidateEventsCache()
  return { id: data.id, title: data.title, date: data.date, type: data.type, description: data.description }
}

export async function updateEvent(
  id: string,
  title: string,
  date: string,
  type: string,
): Promise<CalEvent> {
  const { data, error } = await supabase
    .from('events')
    .update({ title: title.trim(), date, type })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  invalidateEventsCache()
  return { id: data.id, title: data.title, date: data.date, type: data.type, description: data.description }
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw new Error(error.message)
  invalidateEventsCache()
}

// --- Integrações de calendário (via backend Express) ---

export async function fetchIntegrationStatus(): Promise<IntegrationStatus> {
  try {
    const res = await apiFetch('/api/integrations/status')
    if (!res.ok) return { google: false, outlook: false }
    return res.json()
  } catch {
    return { google: false, outlook: false }
  }
}

export async function getOAuthUrl(provider: 'google' | 'outlook'): Promise<string> {
  const res = await apiFetch(`/api/integrations/${provider}/connect`)
  if (!res.ok) throw new Error('Erro ao obter URL de autenticação')
  const { url } = await res.json()
  return url
}

export async function disconnectIntegration(provider: 'google' | 'outlook'): Promise<void> {
  const res = await apiFetch(`/api/integrations/${provider}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Erro ao desconectar integração')
}

export async function fetchGoogleEvents(): Promise<CalEvent[]> {
  try {
    const res = await apiFetch('/api/integrations/google/events', {
      headers: { 'Cache-Control': 'no-cache' },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function syncEventToCalendar(
  provider: 'google' | 'outlook',
  event: CalEvent,
): Promise<void> {
  await apiFetch(`/api/integrations/${provider}/events`, {
    method: 'POST',
    body: JSON.stringify({ title: event.title, date: event.date, type: event.type }),
  })
}
