import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, phone?: string, birthdate?: string) => Promise<boolean>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, name: string, phone?: string, birthdate?: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone, birthdate } }
    })
    if (error) throw error
    // Com confirmação de e-mail desativada, Supabase retorna sessão imediata
    if (data.session) {
      setSession(data.session)
      setUser(data.session.user)
      // Salva phone e birthdate na tabela profiles
      const profilePatch: Record<string, string> = {}
      if (phone)     profilePatch.phone     = phone
      if (birthdate) profilePatch.birthdate = birthdate
      if (Object.keys(profilePatch).length > 0) {
        await supabase.from('profiles').update(profilePatch).eq('id', data.session.user.id)
      }
      return true
    }
    return false
  }

  const signOut = async () => {
    // Remove chave legada sem escopo de userId (bug de foto compartilhada entre usuários)
    localStorage.removeItem('beeplanner_avatar_url')
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)