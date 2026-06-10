import { useState, useEffect, useCallback } from 'react'
import { fetchHabits, createHabit, deleteHabit, toggleHabit } from '../services/habits'
import { calcStreak } from '../utils/date.utils'
import { HABIT_COLORS } from '../enums/habit.enums'
import type { HabitIconKey } from '../enums/habit.enums'
import type { Habit } from '../types/habit.types'
import { useToast } from '../components/Toast'

// Hook que encapsula toda a lógica de estado e operações de hábitos
export function useHabits() {
  const { toast } = useToast()

  const [habits, setHabits]           = useState<Habit[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [toggling, setToggling]       = useState<Set<string>>(new Set())
  const [showAdd, setShowAdd]         = useState(false)
  const [saving, setSaving]           = useState(false)
  const [newName, setNewName]         = useState('')
  const [newIconKey, setNewIconKey]   = useState<HabitIconKey>('droplets')
  const [newColor, setNewColor]       = useState(HABIT_COLORS[0])
  const [weekOffset, setWeekOffset]   = useState(0)

  // Carrega hábitos do backend ao montar o hook
  const carregarHabitos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchHabits()
      setHabits(data)
    } catch (e: any) {
      setError(e.message ?? 'Erro ao carregar hábitos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregarHabitos() }, [carregarHabitos])

  // Toggle otimista: atualiza UI imediatamente e confirma no backend
  const toggle = async (habitId: string, dateKey: string) => {
    const toggleKey = `${habitId}-${dateKey}`
    if (toggling.has(toggleKey)) return // evita duplo clique

    // Atualiza a UI imediatamente (otimista)
    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h
      const completions = { ...h.completions, [dateKey]: !h.completions[dateKey] }
      if (!completions[dateKey]) delete completions[dateKey]
      return { ...h, completions, streak: calcStreak(Object.keys(completions).filter(k => completions[k])) }
    }))

    setToggling(prev => new Set(prev).add(toggleKey))
    try {
      await toggleHabit(habitId, dateKey)
    } catch {
      // Reverte se falhar
      setHabits(prev => prev.map(h => {
        if (h.id !== habitId) return h
        const completions = { ...h.completions, [dateKey]: !h.completions[dateKey] }
        if (!completions[dateKey]) delete completions[dateKey]
        return { ...h, completions, streak: calcStreak(Object.keys(completions).filter(k => completions[k])) }
      }))
    } finally {
      setToggling(prev => { const s = new Set(prev); s.delete(toggleKey); return s })
    }
  }

  // Adiciona um novo hábito
  const addHabit = async () => {
    if (!newName.trim() || saving) return
    setSaving(true)
    try {
      const habit = await createHabit(newName.trim(), newIconKey, newColor)
      setHabits(prev => [...prev, habit])
      setNewName('')
      setNewIconKey('droplets')
      setNewColor(HABIT_COLORS[0])
      setShowAdd(false)
      toast('Hábito criado!', `"${habit.name}" foi adicionado com sucesso.`)
    } finally {
      setSaving(false)
    }
  }

  // Remove um hábito pelo id
  const removeHabit = async (id: string) => {
    const nome = habits.find(h => h.id === id)?.name ?? 'Hábito'
    setHabits(prev => prev.filter(h => h.id !== id))
    try {
      await deleteHabit(id)
      toast('Hábito removido', `"${nome}" foi excluído.`, 'info')
    } catch {
      carregarHabitos()
      toast('Erro ao remover', 'Não foi possível excluir o hábito.', 'error')
    }
  }

  return {
    // estados
    habits,
    loading,
    error,
    toggling,
    showAdd,
    saving,
    newName,
    newIconKey,
    newColor,
    weekOffset,
    // setters de formulário
    setShowAdd,
    setNewName,
    setNewIconKey,
    setNewColor,
    setWeekOffset,
    // funções de operação
    carregarHabitos,
    toggle,
    addHabit,
    removeHabit,
  }
}
