import { supabase } from '../lib/supabase'
import type { Transaction } from '../types/finance.types'

async function uid() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Não autenticado')
  return session.user.id
}

function mapTransaction(r: any): Transaction {
  return {
    id: r.id,
    description: r.description,
    amount: Number(r.amount),
    type: r.type,
    category: r.category,
    label: r.label ?? '',
    date: r.date,
    recurring: r.recurring,
    created_at: r.created_at,
  }
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const userId = await uid()
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapTransaction)
}

export async function createTransaction(p: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
  const userId = await uid()
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      description: p.description.trim(),
      amount: p.amount,
      type: p.type,
      category: p.category,
      label: p.label.trim(),
      date: p.date,
      recurring: p.recurring,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return mapTransaction(data)
}

export async function updateTransaction(id: string, p: Partial<Omit<Transaction, 'id' | 'created_at'>>): Promise<Transaction> {
  const u: Record<string, unknown> = {}
  if (p.description !== undefined) u.description = p.description.trim()
  if (p.amount      !== undefined) u.amount      = p.amount
  if (p.type        !== undefined) u.type        = p.type
  if (p.category    !== undefined) u.category    = p.category
  if (p.label       !== undefined) u.label       = p.label
  if (p.date        !== undefined) u.date        = p.date
  if (p.recurring   !== undefined) u.recurring   = p.recurring
  const { data, error } = await supabase.from('transactions').update(u).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return mapTransaction(data)
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
