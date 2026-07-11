export interface HealthLog {
  id: string
  log_date: string
  water: number
  sleep: number
  mood: number | null
  exercises: string[]
  steps: number
  active_calories: number
  avg_heart_rate: number
  created_at: string
}
