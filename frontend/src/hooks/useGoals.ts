import { useState, useEffect, useCallback } from 'react'
import { fetchGoals, createGoal, updateGoalProgress, updateGoalFull, deleteGoal } from '../services/goals'
import type { Goal } from '../types/goals.types'
import { useToast } from '../components/Toast'

const COLORS     = ["#F472B6", "#A855F7", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#6366F1"]
const CATEGORIES = ["Educação", "Saúde", "Financeiro", "Pessoal", "Carreira", "Relacionamentos"]

const FORM_INICIAL = {
  title: '', description: '', target: '', current: '0',
  unit: '', color: COLORS[0], category: CATEGORIES[0], deadline: '',
}

export { COLORS, CATEGORIES }

export function useGoals() {
  const { toast } = useToast()
  const now = new Date()

  const [tab,           setTab]           = useState<'annual' | 'monthly'>('annual')
  const [selectedYear,  setSelectedYear]  = useState(now.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth())

  const [annualGoals,  setAnnualGoals]  = useState<Goal[]>([])
  const [monthlyCache, setMonthlyCache] = useState<Record<string, Goal[]>>({})

  const [loading,      setLoading]      = useState(true)
  const [saving,       setSaving]       = useState(false)
  const [showAdd,      setShowAdd]      = useState(false)
  const [editingGoal,  setEditingGoal]  = useState<Goal | null>(null)
  const [form,         setForm]         = useState(FORM_INICIAL)

  const monthKey = `${selectedYear}-${selectedMonth}`

  const applyToList = (id: string, updater: (g: Goal) => Goal) => {
    if (tab === 'annual') {
      setAnnualGoals(prev => prev.map(g => g.id === id ? updater(g) : g))
    } else {
      setMonthlyCache(prev => ({ ...prev, [monthKey]: (prev[monthKey] ?? []).map(g => g.id === id ? updater(g) : g) }))
    }
  }

  const carregarAnual = useCallback(async (year: number) => {
    setLoading(true)
    try {
      const data = await fetchGoals('annual', year)
      setAnnualGoals(data)
    } catch { /* silencioso */ }
    finally { setLoading(false) }
  }, [])

  const carregarMensal = useCallback(async (year: number, month: number) => {
    setLoading(true)
    try {
      const data = await fetchGoals('monthly', year, month)
      setMonthlyCache(prev => ({ ...prev, [`${year}-${month}`]: data }))
    } catch { /* silencioso */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { carregarAnual(selectedYear) }, [selectedYear, carregarAnual])
  useEffect(() => {
    if (tab === 'monthly') carregarMensal(selectedYear, selectedMonth)
  }, [tab, selectedYear, selectedMonth, carregarMensal])

  const currentGoals = tab === 'annual' ? annualGoals : (monthlyCache[monthKey] ?? [])

  // Abre modal de criação
  const openAdd = () => { setEditingGoal(null); setForm(FORM_INICIAL); setShowAdd(true) }

  // Abre modal de edição preenchido com dados da meta
  const openEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setForm({
      title:       goal.title,
      description: goal.description,
      target:      goal.target > 0 ? String(goal.target) : '',
      current:     String(goal.current),
      unit:        goal.unit,
      color:       goal.color,
      category:    goal.category,
      deadline:    goal.deadline ?? '',
    })
    setShowAdd(true)
  }

  const addGoal = async () => {
    if (!form.title.trim() || saving) return
    setSaving(true)
    try {
      if (editingGoal) {
        // Edição completa
        const atualizada = await updateGoalFull(editingGoal.id, {
          title:       form.title,
          description: form.description,
          target:      form.target ? Number(form.target) : 0,
          current:     Number(form.current),
          unit:        form.unit,
          color:       form.color,
          category:    form.category,
          deadline:    form.deadline || null,
        })
        applyToList(editingGoal.id, () => atualizada)
        toast('Meta atualizada!', `"${atualizada.title}" editada.`)
      } else {
        // Criação
        const nova = await createGoal({
          title:       form.title,
          description: form.description,
          target:      form.target ? Number(form.target) : 0,
          current:     Number(form.current) || 0,
          unit:        form.unit,
          color:       form.color,
          category:    form.category,
          scope:       tab,
          year:        selectedYear,
          month:       tab === 'monthly' ? selectedMonth : null,
          deadline:    form.deadline || null,
        })
        if (tab === 'annual') {
          setAnnualGoals(prev => [...prev, nova])
        } else {
          setMonthlyCache(prev => ({ ...prev, [monthKey]: [...(prev[monthKey] ?? []), nova] }))
        }
        toast('Meta criada!', `"${nova.title}" adicionada.`)
      }
      setForm(FORM_INICIAL)
      setShowAdd(false)
      setEditingGoal(null)
    } catch { toast('Erro ao salvar', '', 'error') }
    finally { setSaving(false) }
  }

  // Atualiza apenas o progresso (inline)
  const editProgress = async (id: string, current: number) => {
    applyToList(id, g => ({ ...g, current }))
    try { await updateGoalProgress(id, current) }
    catch {
      if (tab === 'annual') carregarAnual(selectedYear)
      else carregarMensal(selectedYear, selectedMonth)
    }
  }

  // Marca/desmarca conclusão — toggle entre current=target e current=0
  const toggleComplete = async (goal: Goal) => {
    const isDone    = goal.target > 0 && goal.current >= goal.target
    const nextVal   = isDone ? 0 : (goal.target > 0 ? goal.target : 1)
    applyToList(goal.id, g => ({ ...g, current: nextVal }))
    try { await updateGoalProgress(goal.id, nextVal) }
    catch {
      applyToList(goal.id, g => ({ ...g, current: goal.current }))
    }
  }

  const removeGoal = async (id: string) => {
    const name = currentGoals.find(g => g.id === id)?.title ?? ''
    if (tab === 'annual') {
      setAnnualGoals(prev => prev.filter(g => g.id !== id))
    } else {
      setMonthlyCache(prev => ({ ...prev, [monthKey]: (prev[monthKey] ?? []).filter(g => g.id !== id) }))
    }
    try {
      await deleteGoal(id)
      toast('Meta removida', `"${name}" excluída.`, 'info')
    } catch {
      if (tab === 'annual') carregarAnual(selectedYear)
      else carregarMensal(selectedYear, selectedMonth)
      toast('Erro ao remover', '', 'error')
    }
  }

  const navMonth = (delta: number) => {
    let m = selectedMonth + delta, y = selectedYear
    if (m > 11) { m = 0; y++ }
    if (m < 0)  { m = 11; y-- }
    setSelectedMonth(m); setSelectedYear(y)
  }

  return {
    tab, setTab,
    selectedYear, setSelectedYear,
    selectedMonth, navMonth,
    currentGoals, loading, saving,
    showAdd, setShowAdd, openAdd, openEdit, editingGoal,
    form, setForm,
    addGoal, editProgress, toggleComplete, removeGoal,
  }
}
