import { supabase } from '../lib/supabase'
import { compressImage } from '../utils/image.utils'
import type { Course } from '../types/course.types'

function mapCourse(row: any): Course {
  return {
    id:                row.id,
    title:             row.title,
    platform:          row.platform,
    duration:          row.duration,
    progress:          row.progress,
    status:            row.status,
    startDate:         row.start_date ?? null,
    endDate:           row.end_date ?? null,
    certificate:       row.certificate,
    certificateExpiry: row.certificate_expiry ?? null,
    certificateUrl:    row.certificate_url ?? null,
    credential:        row.credential,
    created_at:        row.created_at,
  }
}

export async function fetchCourses(): Promise<Course[]> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Não autenticado')

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(mapCourse)
}

export async function uploadCertificate(file: File, courseId: string): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Não autenticado')

  const compressed = await compressImage(file, 1200, 0.88)
  const path = `${session.user.id}/${courseId}.jpg`

  const { error } = await supabase.storage
    .from('course-certificates')
    .upload(path, compressed, { upsert: true, contentType: 'image/jpeg' })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from('course-certificates').getPublicUrl(path)
  return data.publicUrl
}

export async function createCourse(
  payload: Omit<Course, 'id' | 'created_at' | 'certificateUrl'>,
  certFile?: File | null,
): Promise<Course> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Não autenticado')

  const { data, error } = await supabase
    .from('courses')
    .insert({
      user_id:            session.user.id,
      title:              payload.title.trim(),
      platform:           payload.platform.trim(),
      duration:           payload.duration.trim(),
      progress:           payload.progress,
      status:             payload.status,
      start_date:         payload.startDate || null,
      end_date:           payload.endDate || null,
      certificate:        payload.certificate,
      certificate_expiry: payload.certificateExpiry || null,
      credential:         payload.credential.trim(),
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  let certificateUrl: string | null = null
  if (certFile) {
    certificateUrl = await uploadCertificate(certFile, data.id)
    await supabase.from('courses').update({ certificate_url: certificateUrl }).eq('id', data.id)
  }

  return mapCourse({ ...data, certificate_url: certificateUrl })
}

export async function updateCourse(
  id: string,
  payload: Partial<Omit<Course, 'id' | 'created_at'>>,
  certFile?: File | null,
): Promise<Course> {
  const updates: Record<string, unknown> = {}
  if (payload.title             !== undefined) updates.title              = payload.title.trim()
  if (payload.platform          !== undefined) updates.platform           = payload.platform.trim()
  if (payload.duration          !== undefined) updates.duration           = payload.duration.trim()
  if (payload.progress          !== undefined) updates.progress           = payload.progress
  if (payload.status            !== undefined) updates.status             = payload.status
  if (payload.startDate         !== undefined) updates.start_date         = payload.startDate || null
  if (payload.endDate           !== undefined) updates.end_date           = payload.endDate || null
  if (payload.certificate       !== undefined) updates.certificate        = payload.certificate
  if (payload.certificateExpiry !== undefined) updates.certificate_expiry = payload.certificateExpiry || null
  if (payload.credential        !== undefined) updates.credential         = payload.credential.trim()

  const { data, error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  let certificateUrl = data.certificate_url ?? null
  if (certFile) {
    certificateUrl = await uploadCertificate(certFile, id)
    await supabase.from('courses').update({ certificate_url: certificateUrl }).eq('id', id)
  }

  return mapCourse({ ...data, certificate_url: certificateUrl })
}

export async function deleteCourse(id: string): Promise<void> {
  const { error } = await supabase.from('courses').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
