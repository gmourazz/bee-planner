import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  fetchWorkouts, createWorkout, deleteWorkout,
  fetchBodyMeasurements, upsertBodyMeasurement,
  fetchChallenges, createChallenge, updateChallenge as updateChallengeService, deleteChallenge,
  fetchMeals, createMeal, deleteMeal,
  fetchFitnessGoals, upsertFitnessGoals,
} from '../services/fitness'
import type { Workout, BodyMeasurement, FitnessChallenge, Meal, FitnessGoals } from '../types/fitness.types'
import { useToast } from '../components/Toast'

// Hook que encapsula toda a lógica de estado e operações do módulo Fitness
export function useFitness(selectedDate: string, weekStart: string) {
  const { toast } = useToast()

  // --- Treinos ---
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loadingWorkouts, setLoadingWorkouts] = useState(true)

  // --- Medições corporais ---
  const [bodyHistory, setBodyHistory] = useState<BodyMeasurement[]>([])
  const [loadingBody, setLoadingBody] = useState(true)

  // --- Desafios ---
  const [challenges, setChallenges] = useState<FitnessChallenge[]>([])

  // --- Refeições ---
  const [meals, setMeals] = useState<Meal[]>([])
  const [loadingMeals, setLoadingMeals] = useState(true)

  // --- Metas ---
  const [goals, setGoals] = useState<FitnessGoals>({
    calorie_goal: 2000,
    weight_goal: null,
    protein_goal: null,
    carbs_goal: null,
    fat_goal: null,
  })

  // ===================== CARREGAMENTO INICIAL =====================

  // Carrega treinos (sem filtro de data — cache completo)
  const carregarWorkouts = useCallback(async () => {
    try {
      setLoadingWorkouts(true)
      const data = await fetchWorkouts()
      setWorkouts(data)
    } catch (e: any) {
      toast('Erro', e.message ?? 'Erro ao carregar treinos', 'error')
    } finally {
      setLoadingWorkouts(false)
    }
  }, [toast])

  // Carrega medições corporais
  const carregarBody = useCallback(async () => {
    try {
      setLoadingBody(true)
      const data = await fetchBodyMeasurements()
      setBodyHistory(data)
    } catch (e: any) {
      toast('Erro', e.message ?? 'Erro ao carregar medições', 'error')
    } finally {
      setLoadingBody(false)
    }
  }, [toast])

  // Carrega desafios
  const carregarChallenges = useCallback(async () => {
    try {
      const data = await fetchChallenges()
      setChallenges(data)
    } catch (e: any) {
      toast('Erro', e.message ?? 'Erro ao carregar desafios', 'error')
    }
  }, [toast])

  // Carrega refeições do dia selecionado
  const carregarMeals = useCallback(async () => {
    try {
      setLoadingMeals(true)
      const data = await fetchMeals(selectedDate)
      setMeals(data)
    } catch (e: any) {
      toast('Erro', e.message ?? 'Erro ao carregar refeições', 'error')
    } finally {
      setLoadingMeals(false)
    }
  }, [selectedDate, toast])

  // Carrega metas fitness
  const carregarGoals = useCallback(async () => {
    try {
      const data = await fetchFitnessGoals()
      setGoals(data)
    } catch {
      // Usa defaults silenciosamente
    }
  }, [])

  // Efeito inicial: carrega tudo ao montar
  useEffect(() => {
    carregarWorkouts()
    carregarBody()
    carregarChallenges()
    carregarGoals()
  }, [carregarWorkouts, carregarBody, carregarChallenges, carregarGoals])

  // Recarrega refeições quando a data muda
  useEffect(() => {
    carregarMeals()
  }, [carregarMeals])

  // ===================== DERIVADOS =====================

  // Filtra os treinos da janela de 7 dias exibida no calendário
  const weekWorkouts = useMemo(() => {
    const endDate = new Date(weekStart + 'T00:00:00')
    endDate.setDate(endDate.getDate() + 6)
    const endStr = endDate.toISOString().split('T')[0]
    return workouts.filter(w => w.date >= weekStart && w.date <= endStr)
  }, [workouts, weekStart])

  // Desafio ativo (primeiro com status 'active')
  const activeChallenge = useMemo(() => {
    return challenges.find(c => c.status === 'active') ?? null
  }, [challenges])

  // Medição corporal mais recente
  const latestBody = useMemo(() => {
    return bodyHistory.length > 0 ? bodyHistory[0] : null
  }, [bodyHistory])

  // ===================== OPERAÇÕES =====================

  // Adiciona um treino
  const addWorkout = async (data: Omit<Workout, 'id' | 'created_at'>) => {
    try {
      const novo = await createWorkout(data)
      setWorkouts(prev => [novo, ...prev])
      toast('Treino registrado!', `${data.modality} adicionado com sucesso.`)
    } catch (e: any) {
      toast('Erro', e.message ?? 'Erro ao registrar treino', 'error')
    }
  }

  // Remove um treino
  const removeWorkout = async (id: string) => {
    const anterior = workouts
    setWorkouts(prev => prev.filter(w => w.id !== id))
    try {
      await deleteWorkout(id)
      toast('Treino removido', 'O treino foi excluído.', 'info')
    } catch {
      setWorkouts(anterior)
      toast('Erro', 'Não foi possível remover o treino.', 'error')
    }
  }

  // Salva medição corporal (upsert)
  const saveBody = async (data: Omit<BodyMeasurement, 'id'>) => {
    try {
      const salvo = await upsertBodyMeasurement(data)
      // Atualiza o histórico local: substitui se já existe pra mesma data, senão adiciona
      setBodyHistory(prev => {
        const idx = prev.findIndex(m => m.date === salvo.date)
        if (idx >= 0) {
          const novo = [...prev]
          novo[idx] = salvo
          return novo
        }
        return [salvo, ...prev].sort((a, b) => b.date.localeCompare(a.date))
      })
      toast('Medição salva!', 'Seus dados corporais foram atualizados.')
    } catch (e: any) {
      toast('Erro', e.message ?? 'Erro ao salvar medição', 'error')
    }
  }

  // Adiciona um desafio
  const addChallenge = async (data: Omit<FitnessChallenge, 'id'>) => {
    try {
      const novo = await createChallenge(data)
      setChallenges(prev => [novo, ...prev])
      toast('Desafio criado!', `"${data.name}" foi adicionado.`)
    } catch (e: any) {
      toast('Erro', e.message ?? 'Erro ao criar desafio', 'error')
    }
  }

  // Atualiza um desafio (campos parciais)
  const editChallenge = async (id: string, updates: Partial<FitnessChallenge>) => {
    try {
      const atualizado = await updateChallengeService(id, updates)
      setChallenges(prev => prev.map(c => c.id === id ? atualizado : c))
      toast('Desafio atualizado', 'As alterações foram salvas.')
    } catch (e: any) {
      toast('Erro', e.message ?? 'Erro ao atualizar desafio', 'error')
    }
  }

  // Remove um desafio
  const removeChallenge = async (id: string) => {
    const nome = challenges.find(c => c.id === id)?.name ?? 'Desafio'
    const anterior = challenges
    setChallenges(prev => prev.filter(c => c.id !== id))
    try {
      await deleteChallenge(id)
      toast('Desafio removido', `"${nome}" foi excluído.`, 'info')
    } catch {
      setChallenges(anterior)
      toast('Erro', 'Não foi possível remover o desafio.', 'error')
    }
  }

  // Adiciona uma refeição
  const addMeal = async (data: Omit<Meal, 'id'>) => {
    try {
      const nova = await createMeal(data)
      setMeals(prev => [...prev, nova])
      toast('Refeição adicionada!', `${data.food_name} registrado.`)
    } catch (e: any) {
      toast('Erro', e.message ?? 'Erro ao registrar refeição', 'error')
    }
  }

  // Remove uma refeição
  const removeMeal = async (id: string) => {
    const anterior = meals
    setMeals(prev => prev.filter(m => m.id !== id))
    try {
      await deleteMeal(id)
      toast('Refeição removida', 'O item foi excluído.', 'info')
    } catch {
      setMeals(anterior)
      toast('Erro', 'Não foi possível remover a refeição.', 'error')
    }
  }

  // Salva metas fitness (upsert)
  const saveGoals = async (data: FitnessGoals) => {
    try {
      const salvo = await upsertFitnessGoals(data)
      setGoals(salvo)
      toast('Metas salvas!', 'Suas metas fitness foram atualizadas.')
    } catch (e: any) {
      toast('Erro', e.message ?? 'Erro ao salvar metas', 'error')
    }
  }

  return {
    // Treinos
    workouts,
    weekWorkouts,
    addWorkout,
    removeWorkout,
    loadingWorkouts,

    // Corpo
    bodyHistory,
    latestBody,
    saveBody,
    loadingBody,

    // Desafios
    challenges,
    activeChallenge,
    addChallenge,
    updateChallenge: editChallenge,
    removeChallenge,

    // Dieta
    meals,
    addMeal,
    removeMeal,
    loadingMeals,

    // Metas
    goals,
    saveGoals,
  }
}
