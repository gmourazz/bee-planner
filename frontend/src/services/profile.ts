import { supabase } from '../lib/supabase'
import { compressImage } from '../utils/image.utils'
import type { ProfileData } from '../types/profile.types'

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

export async function uploadAvatar(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  const compressed = await compressImage(file)
  const path = `${user.id}/avatar.jpg`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, compressed, { upsert: true, contentType: 'image/jpeg' })

  if (uploadError) throw new Error(uploadError.message)

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  const url = data.publicUrl

  await supabase.auth.updateUser({ data: { avatar_url: url } })
  return url
}
