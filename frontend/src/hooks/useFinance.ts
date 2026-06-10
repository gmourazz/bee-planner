import { useState, useEffect, useCallback } from 'react'
import { fetchTransactions, createTransaction, updateTransaction, deleteTransaction } from '../services/finance'
import type { Transaction, TransactionType } from '../types/finance.types'
import { useToast } from '../components/Toast'

const FORM_INICIAL = {
  description: '',
  amount: '',
  type: 'expense' as TransactionType,
  category: 'Supermercado',
  label: '',
  date: new Date().toISOString().split('T')[0],
  recurring: false,
}

export function useFinance() {
  const { toast } = useToast()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)
  const [saving, setSaving]             = useState(false)
  const [showAdd, setShowAdd]           = useState(false)
  const [editingId, setEditingId]       = useState<string | null>(null)
  const [form, setForm]                 = useState(FORM_INICIAL)

  const carregar = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const data = await fetchTransactions()
      setTransactions(data)
    } catch (err: any) {
      setError(err.message ?? 'Erro ao carregar')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const openAdd = () => {
    setEditingId(null)
    setForm(FORM_INICIAL)
    setShowAdd(true)
  }

  const openEdit = (tx: Transaction) => {
    setEditingId(tx.id)
    setForm({
      description: tx.description,
      amount: String(tx.amount),
      type: tx.type,
      category: tx.category,
      label: tx.label,
      date: tx.date,
      recurring: tx.recurring,
    })
    setShowAdd(true)
  }

  const saveTransaction = async () => {
    if (!form.description.trim() || !form.amount || saving) return
    setSaving(true)
    try {
      if (editingId) {
        const atualizada = await updateTransaction(editingId, {
          description: form.description,
          amount: parseFloat(form.amount),
          type: form.type,
          category: form.category,
          label: form.label,
          date: form.date,
          recurring: form.recurring,
        })
        setTransactions(prev => prev.map(t => t.id === editingId ? atualizada : t))
        toast('Lançamento atualizado!', `"${atualizada.description}" editado.`)
      } else {
        const nova = await createTransaction({
          description: form.description,
          amount: parseFloat(form.amount),
          type: form.type,
          category: form.category,
          label: form.label,
          date: form.date,
          recurring: form.recurring,
        })
        setTransactions(prev => [nova, ...prev])
        toast('Lançamento salvo!', `"${nova.description}" registrado.`)
      }
      setShowAdd(false)
      setEditingId(null)
    } catch {
      toast('Erro ao salvar', '', 'error')
    } finally {
      setSaving(false)
    }
  }

  const deleteTx = async (id: string) => {
    const desc = transactions.find(t => t.id === id)?.description ?? ''
    setTransactions(prev => prev.filter(t => t.id !== id))
    try {
      await deleteTransaction(id)
      toast('Lançamento removido', `"${desc}" excluído.`, 'info')
    } catch {
      carregar()
      toast('Erro ao remover', '', 'error')
    }
  }

  return {
    transactions, loading, error, carregar,
    showAdd, setShowAdd, openAdd, openEdit, editingId,
    form, setForm,
    saving, saveTransaction,
    deleteTx,
  }
}
