export type GoalScope = 'annual' | 'monthly'

export interface Goal {
  id: string
  title: string
  description: string
  target: number
  current: number
  unit: string
  color: string
  category: string
  scope: GoalScope
  year: number
  month: number | null   // 0-11 para mensais, null para anuais
  deadline: string | null // YYYY-MM-DD
  created_at: string
}
