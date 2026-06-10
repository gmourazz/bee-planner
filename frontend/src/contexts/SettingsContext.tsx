import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { apiFetch } from '../lib/client'
import { supabase } from '../lib/supabase'

export interface MenuVisibility {
  home: boolean; dashboard: boolean; week: boolean; habits: boolean
  dates: boolean; notes: boolean; books: boolean; courses: boolean
  university: boolean; finance: boolean; health: boolean; goals: boolean
}

export interface NotificationPrefs {
  tasks: boolean; habits: boolean; exams: boolean; birthdays: boolean; certificates: boolean
}

export interface UserSettings {
  menuVisibility: MenuVisibility
  notifications: NotificationPrefs
}

const DEFAULTS: UserSettings = {
  menuVisibility: {
    home: true, dashboard: true, week: true, habits: true,
    dates: true, notes: true, books: true, courses: true,
    university: true, finance: true, health: true, goals: true,
  },
  notifications: {
    tasks: true, habits: true, exams: true, birthdays: true, certificates: true,
  },
}

interface SettingsContextValue {
  settings: UserSettings
  loading: boolean
  saving: boolean
  updateMenuVisibility: (key: keyof MenuVisibility, value: boolean) => void
  updateNotification: (key: keyof NotificationPrefs, value: boolean) => void
  changePassword: () => Promise<void>
  exportData: () => Promise<void>
  deleteAccount: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings deve ser usado dentro de SettingsProvider')
  return ctx
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULTS)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Carrega configurações do backend
  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await apiFetch('/api/settings')
        if (!res.ok) return
        const data = await res.json()
        setSettings({
          menuVisibility: data.menu_visibility ?? DEFAULTS.menuVisibility,
          notifications:  data.notifications   ?? DEFAULTS.notifications,
        })
      } catch { /* usa padrão */ }
      finally { setLoading(false) }
    }
    carregar()
  }, [])

  // Persiste no backend com debounce de 800ms
  const persist = useCallback((next: UserSettings) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSaving(true)
      try {
        await apiFetch('/api/settings', {
          method: 'PUT',
          body: JSON.stringify({
            menu_visibility: next.menuVisibility,
            notifications:   next.notifications,
          }),
        })
      } catch { /* silencioso */ }
      finally { setSaving(false) }
    }, 800)
  }, [])

  const updateMenuVisibility = (key: keyof MenuVisibility, value: boolean) => {
    setSettings(prev => {
      const next = { ...prev, menuVisibility: { ...prev.menuVisibility, [key]: value } }
      persist(next)
      return next
    })
  }

  const updateNotification = (key: keyof NotificationPrefs, value: boolean) => {
    // Solicita permissão de notificação do browser ao ativar
    if (value && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    setSettings(prev => {
      const next = { ...prev, notifications: { ...prev.notifications, [key]: value } }
      persist(next)
      return next
    })
  }

  const changePassword = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const email = session?.user?.email
    if (!email) return
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/configuracoes`,
    })
  }

  const exportData = async () => {
    try {
      const userId = (await supabase.auth.getSession()).data.session?.user?.id
      if (!userId) return

      // Busca dados de todas as tabelas do usuário em paralelo
      const [habits, notes, goals, transactions, healthLogs, books, courses, exams, subjects] = await Promise.all([
        supabase.from('habits').select('*').eq('user_id', userId).then(r => r.data ?? []),
        supabase.from('notes').select('*').eq('user_id', userId).then(r => r.data ?? []),
        supabase.from('goals').select('*').eq('user_id', userId).then(r => r.data ?? []),
        supabase.from('transactions').select('*').eq('user_id', userId).then(r => r.data ?? []),
        supabase.from('health_logs').select('*').eq('user_id', userId).then(r => r.data ?? []),
        supabase.from('books').select('*').eq('user_id', userId).then(r => r.data ?? []),
        supabase.from('courses').select('*').eq('user_id', userId).then(r => r.data ?? []),
        supabase.from('uni_exams').select('*').eq('user_id', userId).then(r => r.data ?? []),
        supabase.from('uni_subjects').select('*').eq('user_id', userId).then(r => r.data ?? []),
      ])

      const blob = new Blob([JSON.stringify({
        exportedAt: new Date().toISOString(),
        habits, notes, goals, transactions, healthLogs, books, courses, exams, subjects,
      }, null, 2)], { type: 'application/json' })

      const url = URL.createObjectURL(blob)
      const a   = document.createElement('a')
      a.href    = url
      a.download = `beeplanner-dados-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch { /* silencioso */ }
  }

  const deleteAccount = async () => {
    const res = await apiFetch('/api/settings/account', { method: 'DELETE' })
    if (res.ok) {
      await supabase.auth.signOut()
      window.location.href = '/'
    }
  }

  return (
    <SettingsContext.Provider value={{
      settings, loading, saving,
      updateMenuVisibility, updateNotification,
      changePassword, exportData, deleteAccount,
    }}>
      {children}
    </SettingsContext.Provider>
  )
}
