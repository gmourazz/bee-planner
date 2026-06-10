import { apiFetch } from '../lib/client'
import type { Goal, GoalScope } from '../types/goals.types'

function mapGoal(r: any): Goal {
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? '',
    target: Number(r.target),
    current: Number(r.current),
    unit: r.unit,
    color: r.color,
    category: r.category,
    scope: r.scope,
    year: r.year,
    month: r.month ?? null,
    deadline: r.deadline ?? null,
    created_at: r.created_at,
  }
}

export async function fetchGoals(scope: GoalScope, year: number, month?: number): Promise<Goal[]> {
  const params = new URLSearchParams({ scope, year: String(year) })
  if (scope === 'monthly' && month !== undefined) params.set('month', String(month))

  const res = await apiFetch(`/api/goals?${params}`)
  if (!res.ok) throw new Error((await res.json()).error ?? 'Erro ao buscar metas')
  return (await res.json()).map(mapGoal)
}

export async function createGoal(p: Omit<Goal, 'id' | 'created_at'>): Promise<Goal> {
  const res = await apiFetch('/api/goals', {
    method: 'POST',
    body: JSON.stringify({
      title: p.title.trim(),
      description: p.description.trim(),
      target: p.target,
      current: p.current,
      unit: p.unit.trim() || 'itens',
      color: p.color,
      category: p.category,
      scope: p.scope,
      year: p.year,
      month: p.month,
      deadline: p.deadline || null,
    }),
  })
  if (!res.ok) throw new Error((await res.json()).error ?? 'Erro ao criar meta')
  return mapGoal(await res.json())
}

export async function updateGoalProgress(id: string, current: number): Promise<Goal> {
  const res = await apiFetch(`/api/goals/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ current }),
  })
  if (!res.ok) throw new Error((await res.json()).error ?? 'Erro ao atualizar meta')
  return mapGoal(await res.json())
}

export async function updateGoalFull(id: string, p: Partial<Omit<Goal, 'id' | 'created_at' | 'scope' | 'year' | 'month'>>): Promise<Goal> {
  const res = await apiFetch(`/api/goals/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      title:       p.title?.trim(),
      description: p.description?.trim(),
      target:      p.target,
      current:     p.current,
      unit:        p.unit?.trim(),
      color:       p.color,
      category:    p.category,
      deadline:    p.deadline || null,
    }),
  })
  if (!res.ok) throw new Error((await res.json()).error ?? 'Erro ao editar meta')
  return mapGoal(await res.json())
}

export async function deleteGoal(id: string): Promise<void> {
  const res = await apiFetch(`/api/goals/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Erro ao excluir meta')
}
