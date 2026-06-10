// Tipos relacionados a hábitos

export interface Habit {
  id: string
  name: string
  iconKey: string
  color: string
  completions: Record<string, boolean>
  streak: number
}
