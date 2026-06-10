import { supabase } from '../lib/supabase'
import type { UniSubject, UniSchedule, UniExam, UniSemester } from '../types/uni.types'

async function uid() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Não autenticado')
  return session.user.id
}

// ── Subjects ─────────────────────────────────────────────────────────────────

function mapSubject(r: any): UniSubject {
  return {
    id: r.id, name: r.name, professor: r.professor, credits: r.credits,
    grade: r.grade ?? null, attendance: r.attendance,
    absences: r.absences ?? 0, maxAbsences: r.max_absences ?? 0,
    subjectStatus: r.subject_status ?? 'open',
    startDate: r.start_date ?? null, endDate: r.end_date ?? null,
    colorIdx: r.color_idx, icon: r.icon, semester: r.semester, created_at: r.created_at,
  }
}

export async function fetchSubjects(): Promise<UniSubject[]> {
  const userId = await uid()
  const { data, error } = await supabase.from('uni_subjects').select('*').eq('user_id', userId).order('created_at')
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapSubject)
}

export async function createSubject(p: Omit<UniSubject, 'id' | 'created_at'>): Promise<UniSubject> {
  const userId = await uid()
  const { data, error } = await supabase.from('uni_subjects')
    .insert({ user_id: userId, name: p.name.trim(), professor: p.professor.trim(), credits: p.credits, grade: p.grade, attendance: p.attendance, absences: p.absences, max_absences: p.maxAbsences, subject_status: p.subjectStatus, start_date: p.startDate || null, end_date: p.endDate || null, color_idx: p.colorIdx, icon: p.icon, semester: p.semester.trim() })
    .select().single()
  if (error) throw new Error(error.message)
  return mapSubject(data)
}

export async function updateSubject(id: string, p: Partial<Omit<UniSubject, 'id' | 'created_at'>>): Promise<UniSubject> {
  const u: Record<string, unknown> = {}
  if (p.name       !== undefined) u.name       = p.name.trim()
  if (p.professor  !== undefined) u.professor  = p.professor.trim()
  if (p.credits    !== undefined) u.credits    = p.credits
  if (p.grade      !== undefined) u.grade      = p.grade
  if (p.attendance    !== undefined) u.attendance    = p.attendance
  if (p.absences      !== undefined) u.absences      = p.absences
  if (p.maxAbsences   !== undefined) u.max_absences  = p.maxAbsences
  if (p.subjectStatus !== undefined) u.subject_status = p.subjectStatus
  if (p.startDate  !== undefined) u.start_date = p.startDate || null
  if (p.endDate    !== undefined) u.end_date   = p.endDate || null
  if (p.colorIdx   !== undefined) u.color_idx  = p.colorIdx
  if (p.icon       !== undefined) u.icon       = p.icon
  if (p.semester   !== undefined) u.semester   = p.semester.trim()
  const { data, error } = await supabase.from('uni_subjects').update(u).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return mapSubject(data)
}

export async function deleteSubject(id: string): Promise<void> {
  const { error } = await supabase.from('uni_subjects').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ── Schedule ──────────────────────────────────────────────────────────────────

function mapSchedule(r: any): UniSchedule {
  return {
    id: r.id, subjectName: r.subject_name, room: r.room,
    dayOfWeek: r.day_of_week, timeStart: r.time_start,
    colorIdx: r.color_idx, semester: r.semester, created_at: r.created_at,
  }
}

export async function fetchSchedule(): Promise<UniSchedule[]> {
  const userId = await uid()
  const { data, error } = await supabase.from('uni_schedule').select('*').eq('user_id', userId)
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapSchedule)
}

export async function createScheduleItem(p: Omit<UniSchedule, 'id' | 'created_at'>): Promise<UniSchedule> {
  const userId = await uid()
  const { data, error } = await supabase.from('uni_schedule')
    .insert({ user_id: userId, subject_name: p.subjectName.trim(), room: p.room.trim(), day_of_week: p.dayOfWeek, time_start: p.timeStart, color_idx: p.colorIdx, semester: p.semester.trim() })
    .select().single()
  if (error) throw new Error(error.message)
  return mapSchedule(data)
}

export async function deleteScheduleItem(id: string): Promise<void> {
  const { error } = await supabase.from('uni_schedule').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ── Exams ─────────────────────────────────────────────────────────────────────

function mapExam(r: any): UniExam {
  return {
    id: r.id, subject: r.subject, examDate: r.exam_date,
    type: r.type, description: r.description, status: r.status, created_at: r.created_at,
  }
}

export async function fetchExams(): Promise<UniExam[]> {
  const userId = await uid()
  const { data, error } = await supabase.from('uni_exams').select('*').eq('user_id', userId).order('exam_date')
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapExam)
}

export async function createExam(p: Omit<UniExam, 'id' | 'created_at'>): Promise<UniExam> {
  const userId = await uid()
  const { data, error } = await supabase.from('uni_exams')
    .insert({ user_id: userId, subject: p.subject.trim(), exam_date: p.examDate, type: p.type.trim(), description: p.description.trim(), status: p.status })
    .select().single()
  if (error) throw new Error(error.message)
  return mapExam(data)
}

export async function updateExam(id: string, p: Partial<Omit<UniExam, 'id' | 'created_at'>>): Promise<UniExam> {
  const u: Record<string, unknown> = {}
  if (p.subject     !== undefined) u.subject     = p.subject.trim()
  if (p.examDate    !== undefined) u.exam_date   = p.examDate
  if (p.type        !== undefined) u.type        = p.type.trim()
  if (p.description !== undefined) u.description = p.description.trim()
  if (p.status      !== undefined) u.status      = p.status
  const { data, error } = await supabase.from('uni_exams').update(u).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return mapExam(data)
}

export async function toggleExamStatus(id: string, status: 'pending' | 'done'): Promise<UniExam> {
  const { data, error } = await supabase.from('uni_exams').update({ status }).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return mapExam(data)
}

export async function deleteExam(id: string): Promise<void> {
  const { error } = await supabase.from('uni_exams').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ── Semesters ─────────────────────────────────────────────────────────────────

function mapSemester(r: any): UniSemester {
  return {
    id: r.id, name: r.name,
    startDate: r.start_date ?? null, endDate: r.end_date ?? null,
    isCurrent: r.is_current ?? false, created_at: r.created_at,
  }
}

export async function fetchSemesters(): Promise<UniSemester[]> {
  const userId = await uid()
  const { data, error } = await supabase.from('uni_semesters').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapSemester)
}

export async function createSemester(p: { name: string; startDate: string | null; endDate: string | null }): Promise<UniSemester> {
  const userId = await uid()
  const { data, error } = await supabase.from('uni_semesters')
    .insert({ user_id: userId, name: p.name.trim(), start_date: p.startDate || null, end_date: p.endDate || null, is_current: false })
    .select().single()
  if (error) throw new Error(error.message)
  return mapSemester(data)
}

export async function setCurrentSemester(id: string, userId: string): Promise<void> {
  await supabase.from('uni_semesters').update({ is_current: false }).eq('user_id', userId)
  const { error } = await supabase.from('uni_semesters').update({ is_current: true }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function encerrarSemesterService(id: string): Promise<void> {
  const { error } = await supabase.from('uni_semesters').update({ is_current: false }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteSemester(id: string): Promise<void> {
  const { error } = await supabase.from('uni_semesters').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
