import { useState, useEffect, useCallback } from 'react'
import { fetchHealthLogs, upsertHealthLog } from '../services/health'
import type { HealthLog } from '../types/health.types'
import { getLast7Keys } from '../utils/date.utils'

export function useHealth() {
  const todayKey = new Date().toISOString().split('T')[0]
  const weekKeys = getLast7Keys()
  const sinceDate = weekKeys[0] // 7 dias atrás

  const [logs, setLogs]       = useState<Record<string, HealthLog>>({})
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchHealthLogs(sinceDate)
      const map: Record<string, HealthLog> = {}
      data.forEach(l => { map[l.log_date] = l })
      setLogs(map)
    } catch {
      // falha silenciosa — página continua funcional com estado vazio
    } finally {
      setLoading(false)
    }
  }, [sinceDate])

  useEffect(() => { carregar() }, [carregar])

  // Atualiza optimisticamente e persiste no Supabase
  const upsert = useCallback(async (
    date: string,
    updates: Partial<Pick<HealthLog, 'water' | 'sleep' | 'mood' | 'exercises' | 'steps'>>,
  ) => {
    setLogs(prev => ({
      ...prev,
      [date]: { ...prev[date], log_date: date, ...updates } as HealthLog,
    }))
    try {
      const saved = await upsertHealthLog(date, updates)
      setLogs(prev => ({ ...prev, [date]: saved }))
    } catch {
      // mantém estado local mesmo em falha de rede
    }
  }, [])

  const adjustWater = (delta: number) => {
    const current = logs[todayKey]?.water ?? 0
    const next = Math.max(0, Math.min(16, current + delta))
    upsert(todayKey, { water: next })
  }

  const setWaterDirect = (value: number) => {
    upsert(todayKey, { water: value })
  }

  const adjustSleep = (delta: number) => {
    const current = logs[todayKey]?.sleep ?? 0
    const next = Math.max(0, Math.min(14, current + delta))
    upsert(todayKey, { sleep: next })
  }

  const setMoodValue = (value: number) => {
    upsert(todayKey, { mood: value })
  }

  const toggleExercise = (name: string) => {
    const current = logs[todayKey]?.exercises ?? []
    const next = current.includes(name)
      ? current.filter(x => x !== name)
      : [...current, name]
    upsert(todayKey, { exercises: next })
  }

  return {
    logs, loading, weekKeys, todayKey,
    adjustWater, setWaterDirect,
    adjustSleep,
    setMoodValue,
    toggleExercise,
  }
}
