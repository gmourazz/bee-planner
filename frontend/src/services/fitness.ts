import { supabase } from '../lib/supabase'
import type { Workout, BodyMeasurement, FitnessChallenge, Meal, FitnessGoals } from '../types/fitness.types'

// --- Cache de treinos ---
let _workoutsCache: { userId: string; data: Workout[] } | null = null
export function invalidateWorkoutsCache() { _workoutsCache = null }

// --- Cache de medições corporais ---
let _bodyCache: { userId: string; data: BodyMeasurement[] } | null = null
export function invalidateBodyCache() { _bodyCache = null }

// --- Cache de desafios ---
let _challengesCache: { userId: string; data: FitnessChallenge[] } | null = null
export function invalidateChallengesCache() { _challengesCache = null }

// --- Cache de metas ---
let _goalsCache: { userId: string; data: FitnessGoals } | null = null
export function invalidateGoalsCache() { _goalsCache = null }

// Helper: retorna o user autenticado ou lança erro
async function getUser() {
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) throw new Error('Não autenticado')
  return user
}

// ===================== WORKOUTS =====================

// Lista treinos do usuário, com filtro opcional por intervalo de datas
export async function fetchWorkouts(from?: string, to?: string): Promise<Workout[]> {
  const user = await getUser()

  if (_workoutsCache && _workoutsCache.userId === user.id && !from && !to) {
    return _workoutsCache.data
  }

  let query = supabase
    .from('fitness_workouts')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  if (from) query = query.gte('date', from)
  if (to) query = query.lte('date', to)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  const workouts: Workout[] = (data ?? []).map(w => ({
    id: w.id,
    date: w.date,
    modality: w.modality,
    duration_min: w.duration_min,
    calories: w.calories,
    active_calories: w.active_calories ?? null,
    avg_heart_rate: w.avg_heart_rate ?? null,
    effort_level: w.effort_level ?? null,
    notes: w.notes,
    created_at: w.created_at,
  }))

  // Só cacheia quando não tem filtro de data
  if (!from && !to) {
    _workoutsCache = { userId: user.id, data: workouts }
  }

  return workouts
}

// Cria um novo treino
export async function createWorkout(data: Omit<Workout, 'id' | 'created_at'>): Promise<Workout> {
  const user = await getUser()

  const { data: row, error } = await supabase
    .from('fitness_workouts')
    .insert({ user_id: user.id, ...data })
    .select()
    .single()

  if (error) throw new Error(error.message)
  invalidateWorkoutsCache()

  return {
    id: row.id,
    date: row.date,
    modality: row.modality,
    duration_min: row.duration_min,
    calories: row.calories,
    active_calories: row.active_calories ?? null,
    avg_heart_rate: row.avg_heart_rate ?? null,
    effort_level: row.effort_level ?? null,
    notes: row.notes,
    created_at: row.created_at,
  }
}

// Remove um treino pelo id
export async function deleteWorkout(id: string): Promise<void> {
  const { error } = await supabase.from('fitness_workouts').delete().eq('id', id)
  if (error) throw new Error(error.message)
  invalidateWorkoutsCache()
}

// ===================== BODY MEASUREMENTS =====================

// Lista medições corporais ordenadas por data (desc), com limite opcional
export async function fetchBodyMeasurements(limit?: number): Promise<BodyMeasurement[]> {
  const user = await getUser()

  if (_bodyCache && _bodyCache.userId === user.id) return _bodyCache.data

  let query = supabase
    .from('fitness_body')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  const measurements: BodyMeasurement[] = (data ?? []).map(m => ({
    id: m.id,
    date: m.date,
    weight: m.weight,
    body_fat: m.body_fat,
    arm: m.arm,
    waist: m.waist,
    hip: m.hip,
    thigh: m.thigh,
  }))

  _bodyCache = { userId: user.id, data: measurements }
  return measurements
}

// Upsert de medição corporal (uma por user_id + date)
export async function upsertBodyMeasurement(data: Omit<BodyMeasurement, 'id'>): Promise<BodyMeasurement> {
  const user = await getUser()

  const { data: row, error } = await supabase
    .from('fitness_body')
    .upsert(
      { user_id: user.id, ...data },
      { onConflict: 'user_id,date' }
    )
    .select()
    .single()

  if (error) throw new Error(error.message)
  invalidateBodyCache()

  return {
    id: row.id,
    date: row.date,
    weight: row.weight,
    body_fat: row.body_fat,
    arm: row.arm,
    waist: row.waist,
    hip: row.hip,
    thigh: row.thigh,
  }
}

// ===================== CHALLENGES =====================

// Lista todos os desafios do usuário
export async function fetchChallenges(): Promise<FitnessChallenge[]> {
  const user = await getUser()

  if (_challengesCache && _challengesCache.userId === user.id) return _challengesCache.data

  const { data, error } = await supabase
    .from('fitness_challenges')
    .select('*')
    .eq('user_id', user.id)
    .order('start_date', { ascending: false })

  if (error) throw new Error(error.message)

  const challenges: FitnessChallenge[] = (data ?? []).map(c => ({
    id: c.id,
    name: c.name,
    modality: c.modality,
    duration_days: c.duration_days,
    start_date: c.start_date,
    completed_days: c.completed_days,
    status: c.status,
  }))

  _challengesCache = { userId: user.id, data: challenges }
  return challenges
}

// Cria um novo desafio
export async function createChallenge(data: Omit<FitnessChallenge, 'id'>): Promise<FitnessChallenge> {
  const user = await getUser()

  const { data: row, error } = await supabase
    .from('fitness_challenges')
    .insert({ user_id: user.id, ...data })
    .select()
    .single()

  if (error) throw new Error(error.message)
  invalidateChallengesCache()

  return {
    id: row.id,
    name: row.name,
    modality: row.modality,
    duration_days: row.duration_days,
    start_date: row.start_date,
    completed_days: row.completed_days,
    status: row.status,
  }
}

// Atualiza campos parciais de um desafio
export async function updateChallenge(id: string, updates: Partial<FitnessChallenge>): Promise<FitnessChallenge> {
  const { data: row, error } = await supabase
    .from('fitness_challenges')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  invalidateChallengesCache()

  return {
    id: row.id,
    name: row.name,
    modality: row.modality,
    duration_days: row.duration_days,
    start_date: row.start_date,
    completed_days: row.completed_days,
    status: row.status,
  }
}

// Remove um desafio pelo id
export async function deleteChallenge(id: string): Promise<void> {
  const { error } = await supabase.from('fitness_challenges').delete().eq('id', id)
  if (error) throw new Error(error.message)
  invalidateChallengesCache()
}

// ===================== MEALS =====================

// Lista refeições de um dia específico
export async function fetchMeals(date: string): Promise<Meal[]> {
  const user = await getUser()

  const { data, error } = await supabase
    .from('fitness_meals')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', date)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []).map(m => ({
    id: m.id,
    date: m.date,
    meal_type: m.meal_type,
    food_name: m.food_name,
    calories: m.calories,
    protein: m.protein,
    carbs: m.carbs,
    fat: m.fat,
  }))
}

// Cria uma nova refeição
export async function createMeal(data: Omit<Meal, 'id'>): Promise<Meal> {
  const user = await getUser()

  const { data: row, error } = await supabase
    .from('fitness_meals')
    .insert({ user_id: user.id, ...data })
    .select()
    .single()

  if (error) throw new Error(error.message)

  return {
    id: row.id,
    date: row.date,
    meal_type: row.meal_type,
    food_name: row.food_name,
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat,
  }
}

// Remove uma refeição pelo id
export async function deleteMeal(id: string): Promise<void> {
  const { error } = await supabase.from('fitness_meals').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// Lista refeições de um intervalo de datas (para vistas semana/mês)
export async function fetchMealsRange(from: string, to: string): Promise<Meal[]> {
  const user = await getUser()
  const { data, error } = await supabase
    .from('fitness_meals')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []).map(m => ({
    id: m.id,
    date: m.date,
    meal_type: m.meal_type,
    food_name: m.food_name,
    calories: m.calories,
    protein: m.protein,
    carbs: m.carbs,
    fat: m.fat,
  }))
}

// ===================== FITNESS GOALS =====================

const DEFAULT_GOALS: FitnessGoals = {
  calorie_goal: 2000,
  weight_goal: null,
  protein_goal: null,
  carbs_goal: null,
  fat_goal: null,
}

// Busca metas fitness do usuário (single row) ou retorna defaults
export async function fetchFitnessGoals(): Promise<FitnessGoals> {
  const user = await getUser()

  if (_goalsCache && _goalsCache.userId === user.id) return _goalsCache.data

  const { data, error } = await supabase
    .from('fitness_goals')
    .select('calorie_goal, weight_goal, protein_goal, carbs_goal, fat_goal')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !data) return { ...DEFAULT_GOALS }

  const goals: FitnessGoals = {
    calorie_goal: data.calorie_goal ?? DEFAULT_GOALS.calorie_goal,
    weight_goal: data.weight_goal,
    protein_goal: data.protein_goal,
    carbs_goal: data.carbs_goal,
    fat_goal: data.fat_goal,
  }

  _goalsCache = { userId: user.id, data: goals }
  return goals
}

// Upsert das metas fitness
export async function upsertFitnessGoals(data: FitnessGoals): Promise<FitnessGoals> {
  const user = await getUser()

  const { data: row, error } = await supabase
    .from('fitness_goals')
    .upsert(
      { user_id: user.id, ...data },
      { onConflict: 'user_id' }
    )
    .select('calorie_goal, weight_goal, protein_goal, carbs_goal, fat_goal')
    .single()

  if (error) throw new Error(error.message)
  invalidateGoalsCache()

  return {
    calorie_goal: row.calorie_goal,
    weight_goal: row.weight_goal,
    protein_goal: row.protein_goal,
    carbs_goal: row.carbs_goal,
    fat_goal: row.fat_goal,
  }
}
