import { useState, useEffect, useCallback } from 'react'
import {
  fetchSubjects, createSubject, updateSubject, deleteSubject,
  fetchSchedule, createScheduleItem, deleteScheduleItem,
  fetchExams, createExam, toggleExamStatus, deleteExam,
  fetchSemesters, createSemester, setCurrentSemester, encerrarSemesterService, deleteSemester,
  updateExam,
} from '../services/university'
import type { UniSubject, UniSchedule, UniExam, UniSemester } from '../types/uni.types'
import { useToast } from '../components/Toast'
import { supabase } from '../lib/supabase'

const SUBJECT_FORM_INICIAL = {
  name: '', professor: '', credits: 4, grade: null as number | null,
  attendance: 0, absences: 0, maxAbsences: 0,
  subjectStatus: 'open' as 'open' | 'done',
  startDate: '' as string | null, endDate: '' as string | null,
  colorIdx: 0, icon: 'BookOpen', semester: '',
}

const SCHEDULE_FORM_INICIAL = {
  subjectName: '', room: '', dayOfWeek: 1, timeStart: '08:00', colorIdx: 0, semester: '',
}

const EXAM_FORM_INICIAL = {
  subject: '', examDate: '', type: 'Prova', description: '', status: 'pending' as const,
}

const SEMESTER_FORM_INICIAL = {
  name: '', startDate: '' as string | null, endDate: '' as string | null,
}

export function useUniversity() {
  const { toast } = useToast()

  const [subjects,   setSubjects]   = useState<UniSubject[]>([])
  const [schedule,   setSchedule]   = useState<UniSchedule[]>([])
  const [exams,      setExams]      = useState<UniExam[]>([])
  const [semesters,  setSemesters]  = useState<UniSemester[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)

  // Modais
  const [showSubjectModal,  setShowSubjectModal]  = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showExamModal,     setShowExamModal]     = useState(false)
  const [showSemesterModal, setShowSemesterModal] = useState(false)

  const [editingSubject, setEditingSubject] = useState<UniSubject | null>(null)
  const [editingExam,    setEditingExam]    = useState<UniExam | null>(null)
  const [saving, setSaving] = useState(false)

  const [subjectForm,   setSubjectForm]   = useState(SUBJECT_FORM_INICIAL)
  const [scheduleForm,  setScheduleForm]  = useState(SCHEDULE_FORM_INICIAL)
  const [examForm,      setExamForm]      = useState(EXAM_FORM_INICIAL)
  const [semesterForm,  setSemesterForm]  = useState(SEMESTER_FORM_INICIAL)

  const carregar = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [s, sc, e, sem] = await Promise.all([fetchSubjects(), fetchSchedule(), fetchExams(), fetchSemesters()])
      setSubjects(s); setSchedule(sc); setExams(e); setSemesters(sem)
    } catch (err: any) {
      setError(err.message ?? 'Erro ao carregar')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  // Subjects
  const openAddSubject  = () => { setEditingSubject(null); setSubjectForm(SUBJECT_FORM_INICIAL); setShowSubjectModal(true) }
  const closeSubjectModal = () => { setEditingSubject(null); setSubjectForm(SUBJECT_FORM_INICIAL); setShowSubjectModal(false) }
  const openEditSubject = (s: UniSubject) => {
    setEditingSubject(s)
    setSubjectForm({ name: s.name, professor: s.professor, credits: s.credits, grade: s.grade, attendance: s.attendance, absences: s.absences, maxAbsences: s.maxAbsences, subjectStatus: s.subjectStatus, startDate: s.startDate ?? '', endDate: s.endDate ?? '', colorIdx: s.colorIdx, icon: s.icon, semester: s.semester })
    setShowSubjectModal(true)
  }
  const saveSubject = async () => {
    if (!subjectForm.name.trim() || saving) return
    setSaving(true)
    try {
      if (editingSubject) {
        const updated = await updateSubject(editingSubject.id, subjectForm)
        setSubjects(prev => prev.map(s => s.id === updated.id ? updated : s))
        toast('Matéria atualizada!', `"${updated.name}" foi salva.`)
      } else {
        const novo = await createSubject(subjectForm)
        setSubjects(prev => [...prev, novo])
        toast('Matéria adicionada!', `"${novo.name}" foi registrada.`)
      }
      closeSubjectModal()
    } catch { toast('Erro ao salvar', '', 'error') }
    finally { setSaving(false) }
  }
  const removeSubject = async (id: string) => {
    const name = subjects.find(s => s.id === id)?.name ?? ''
    setSubjects(prev => prev.filter(s => s.id !== id))
    try { await deleteSubject(id); toast('Matéria removida', `"${name}" excluída.`, 'info') }
    catch { carregar(); toast('Erro ao remover', '', 'error') }
  }

  // Schedule
  const openAddSchedule    = () => { setScheduleForm(SCHEDULE_FORM_INICIAL); setShowScheduleModal(true) }
  const closeScheduleModal = () => { setScheduleForm(SCHEDULE_FORM_INICIAL); setShowScheduleModal(false) }
  const saveSchedule = async () => {
    if (!scheduleForm.subjectName.trim() || saving) return
    setSaving(true)
    try {
      const novo = await createScheduleItem(scheduleForm)
      setSchedule(prev => [...prev, novo])
      toast('Aula adicionada!', '')
      closeScheduleModal()
    } catch { toast('Erro ao salvar', '', 'error') }
    finally { setSaving(false) }
  }
  const removeSchedule = async (id: string) => {
    setSchedule(prev => prev.filter(s => s.id !== id))
    try { await deleteScheduleItem(id) }
    catch { carregar() }
  }

  // Exams
  const openAddExam  = () => { setEditingExam(null); setExamForm(EXAM_FORM_INICIAL); setShowExamModal(true) }
  const closeExamModal = () => { setEditingExam(null); setExamForm(EXAM_FORM_INICIAL); setShowExamModal(false) }
  const openEditExam = (exam: UniExam) => {
    setEditingExam(exam)
    setExamForm({ subject: exam.subject, examDate: exam.examDate, type: exam.type, description: exam.description, status: exam.status })
    setShowExamModal(true)
  }
  const saveExam = async () => {
    if (!examForm.subject.trim() || !examForm.examDate || saving) return
    setSaving(true)
    try {
      if (editingExam) {
        const updated = await updateExam(editingExam.id, examForm)
        setExams(prev => prev.map(e => e.id === updated.id ? updated : e).sort((a, b) => a.examDate.localeCompare(b.examDate)))
        toast('Prova atualizada!', `"${updated.subject}" salva.`)
      } else {
        const novo = await createExam(examForm)
        setExams(prev => [...prev, novo].sort((a, b) => a.examDate.localeCompare(b.examDate)))
        toast('Prova adicionada!', '')
      }
      closeExamModal()
    } catch { toast('Erro ao salvar', '', 'error') }
    finally { setSaving(false) }
  }
  const toggleExam = async (id: string) => {
    const exam = exams.find(e => e.id === id)
    if (!exam) return
    const newStatus = exam.status === 'pending' ? 'done' : 'pending'
    setExams(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e))
    try { await toggleExamStatus(id, newStatus) }
    catch { carregar() }
  }
  const removeExam = async (id: string) => {
    setExams(prev => prev.filter(e => e.id !== id))
    try { await deleteExam(id) }
    catch { carregar() }
  }

  // Semesters
  const openAddSemester    = () => { setSemesterForm(SEMESTER_FORM_INICIAL); setShowSemesterModal(true) }
  const closeSemesterModal = () => { setSemesterForm(SEMESTER_FORM_INICIAL); setShowSemesterModal(false) }
  const saveSemester = async () => {
    if (!semesterForm.name.trim() || saving) return
    setSaving(true)
    try {
      const novo = await createSemester(semesterForm)
      setSemesters(prev => [novo, ...prev])
      toast('Semestre criado!', `"${novo.name}" adicionado.`)
      closeSemesterModal()
    } catch { toast('Erro ao salvar', '', 'error') }
    finally { setSaving(false) }
  }
  const ativarSemestre = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return
    await setCurrentSemester(id, session.user.id)
    setSemesters(prev => prev.map(s => ({ ...s, isCurrent: s.id === id })))
    const nome = semesters.find(s => s.id === id)?.name ?? ''
    toast('Semestre ativo!', `"${nome}" definido como atual.`)
  }
  const encerrarSemestre = async (id: string) => {
    const nome = semesters.find(s => s.id === id)?.name ?? ''
    setSemesters(prev => prev.map(s => s.id === id ? { ...s, isCurrent: false } : s))
    try { await encerrarSemesterService(id); toast('Semestre encerrado', `"${nome}" foi encerrado.`, 'info') }
    catch { carregar(); toast('Erro ao encerrar', '', 'error') }
  }

  const removeSemester = async (id: string) => {
    const nome = semesters.find(s => s.id === id)?.name ?? ''
    setSemesters(prev => prev.filter(s => s.id !== id))
    try { await deleteSemester(id); toast('Semestre removido', `"${nome}" excluído.`, 'info') }
    catch { carregar(); toast('Erro ao remover', '', 'error') }
  }

  return {
    subjects, schedule, exams, semesters, loading, error, carregar,
    showSubjectModal,  openAddSubject,  closeSubjectModal,  openEditSubject, saveSubject,  removeSubject,  editingSubject, subjectForm,  setSubjectForm,
    showScheduleModal, openAddSchedule, closeScheduleModal,                  saveSchedule, removeSchedule,                scheduleForm, setScheduleForm,
    showExamModal,     openAddExam,     closeExamModal,  openEditExam,        saveExam,     toggleExam,     removeExam,    examForm,     setExamForm,  editingExam,
    showSemesterModal, openAddSemester, closeSemesterModal,                  saveSemester, ativarSemestre, encerrarSemestre, removeSemester, semesterForm, setSemesterForm,
    saving,
  }
}
