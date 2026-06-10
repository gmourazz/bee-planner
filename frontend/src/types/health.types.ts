export interface HealthLog {
  id: string
  log_date: string   // YYYY-MM-DD
  water: number      // copos (0-16)
  sleep: number      // horas (0.5 increments)
  mood: number | null // 1-5, null = não registrado
  exercises: string[]
  steps: number
  created_at: string
}
