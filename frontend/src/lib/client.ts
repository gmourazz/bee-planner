import { supabase } from './supabase'

// URL base do backend — definida no .env como VITE_API_URL
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

// Faz uma requisição autenticada ao backend.
// Pega o token da sessão atual do Supabase e adiciona no header Authorization.
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
}
