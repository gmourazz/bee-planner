export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  description: string
  amount: number
  type: TransactionType
  category: string
  label: string
  date: string       // YYYY-MM-DD
  recurring: boolean
  created_at: string
}
