export interface Workout {
  id: string
  date: string
  modality: string
  duration_min: number
  calories: number
  active_calories: number | null
  avg_heart_rate: number | null
  effort_level: number | null
  notes: string | null
  created_at: string
}

export const EFFORT_LEVELS = [
  { value: '1', label: '1 – Muito leve' },
  { value: '2', label: '2 – Leve' },
  { value: '3', label: '3 – Moderado' },
  { value: '4', label: '4 – Intenso' },
  { value: '5', label: '5 – Máximo' },
] as const

export interface BodyMeasurement {
  id: string
  date: string
  weight: number | null
  body_fat: number | null
  arm: number | null
  waist: number | null
  hip: number | null
  thigh: number | null
}

export interface FitnessChallenge {
  id: string
  name: string
  modality: string | null
  duration_days: number
  start_date: string
  completed_days: number
  status: 'active' | 'completed' | 'abandoned'
}

export interface Meal {
  id: string
  date: string
  meal_type: 'cafe' | 'almoco' | 'lanche' | 'janta'
  food_name: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface FitnessGoals {
  calorie_goal: number
  weight_goal: number | null
  protein_goal: number | null
  carbs_goal: number | null
  fat_goal: number | null
}

export const MODALITIES = [
  'Musculação', 'Corrida', 'Natação', 'Pole Dance', 'Jiu-Jitsu',
  'Yoga', 'Crossfit', 'Ciclismo', 'Bike', 'Escada', 'Dança', 'Funcional', 'HIIT',
  'Caminhada', 'Outro',
] as const

export const MEAL_TYPES = [
  { key: 'cafe' as const, label: 'Café da manhã' },
  { key: 'almoco' as const, label: 'Almoço' },
  { key: 'lanche' as const, label: 'Lanche' },
  { key: 'janta' as const, label: 'Jantar' },
] as const
