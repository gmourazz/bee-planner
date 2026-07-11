import { supabase } from '../lib/supabase'
import { compressImage } from '../utils/image.utils'
import type { ProfileData } from '../types/profile.types'

export type WaterPrefs = {
  cup_size: number
  water_goal: number
  weight_kg: number | null
  height_cm: number | null
  custom_cup_sizes: number[]
}

async function uid() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Não autenticado')
  return session.user.id
}

export async function fetchWaterPrefs(): Promise<WaterPrefs> {
  const id = await uid()
  const { data, error } = await supabase
    .from('profiles')
    .select('cup_size, water_goal, weight_kg, height_cm, custom_cup_sizes')
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return {
    cup_size: data.cup_size ?? 250,
    water_goal: data.water_goal ?? 8,
    weight_kg: data.weight_kg ?? null,
    height_cm: data.height_cm ?? null,
    custom_cup_sizes: data.custom_cup_sizes ?? [],
  }
}

export async function updateWaterPrefs(prefs: Partial<WaterPrefs>): Promise<void> {
  const id = await uid()
  const { error } = await supabase.from('profiles').update(prefs).eq('id', id)
  if (error) throw new Error(error.message)
}

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
