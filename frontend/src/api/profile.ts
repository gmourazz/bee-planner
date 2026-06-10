import { supabase } from './supabase'

export interface ProfileData {
  id: string
  name: string
  email: string
  phone: string | null
  birthdate: string | null
  avatar_url: string | null
  role: string
  created_at: string
}

// Busca o perfil do usuário logado direto no Supabase
export async function fetchMyProfile(): Promise<ProfileData> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw new Error(error.message)
  return data as ProfileData
}

// Atualiza os dados do perfil do usuário logado
export async function updateMyProfile(updates: {
  name?: string
  phone?: string
  birthdate?: string
  avatar_url?: string
}): Promise<ProfileData> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as ProfileData
}

// Faz upload do avatar e retorna a URL pública. Substitui foto anterior.
export async function uploadAvatar(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  // Caminho: {user_id}/avatar.{extensão} — sempre o mesmo nome para substituir
  const ext  = file.name.split('.').pop()
  const path = `${user.id}/avatar.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true }) // upsert substitui o arquivo anterior

  if (uploadError) throw new Error(uploadError.message)

  // Retorna a URL pública permanente
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}
