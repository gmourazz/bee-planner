import { useState, useEffect, useCallback } from 'react'
import { fetchCourses, createCourse, updateCourse, deleteCourse } from '../services/courses'
import type { Course, CourseStatus } from '../types/course.types'
import { useToast } from '../components/Toast'

export const formInicial = {
  title:             '',
  platform:          '',
  duration:          '',
  progress:          0,
  status:            'in-progress' as CourseStatus,
  startDate:         '',
  endDate:           '',
  certificate:       false,
  certificateExpiry: '',
  credential:        '',
}

export function useCourses() {
  const { toast } = useToast()

  const [courses,       setCourses]       = useState<Course[]>([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState<string | null>(null)
  const [showAdd,       setShowAdd]       = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [saving,        setSaving]        = useState(false)
  const [form,          setForm]          = useState(formInicial)
  const [certFile,      setCertFile]      = useState<File | null>(null)
  const [certPreview,   setCertPreview]   = useState<string | null>(null)

  const carregarCursos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchCourses()
      setCourses(data)
    } catch (e: any) {
      setError(e.message ?? 'Erro ao carregar cursos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregarCursos() }, [carregarCursos])

  const setCertificateFile = (file: File | null) => {
    if (certPreview && !certPreview.startsWith('http')) URL.revokeObjectURL(certPreview)
    if (!file) {
      setCertFile(null)
      setCertPreview(null)
      return
    }
    setCertFile(file)
    setCertPreview(URL.createObjectURL(file))
  }

  const openAdd = () => {
    setEditingCourse(null)
    setForm(formInicial)
    setCertFile(null)
    setCertPreview(null)
    setShowAdd(true)
  }

  const closeModal = () => {
    setEditingCourse(null)
    setForm(formInicial)
    setCertFile(null)
    setCertPreview(null)
    setShowAdd(false)
  }

  const openEdit = (course: Course) => {
    setEditingCourse(course)
    setForm({
      title:             course.title,
      platform:          course.platform,
      duration:          course.duration,
      progress:          course.progress,
      status:            course.status,
      startDate:         course.startDate ?? '',
      endDate:           course.endDate ?? '',
      certificate:       course.certificate,
      certificateExpiry: course.certificateExpiry ?? '',
      credential:        course.credential,
    })
    setCertFile(null)
    setCertPreview(course.certificateUrl ?? null)
    setShowAdd(true)
  }

  const saveCourse = async () => {
    if (!form.title.trim() || saving) return
    setSaving(true)
    try {
      if (editingCourse) {
        const atualizado = await updateCourse(editingCourse.id, form, certFile)
        setCourses(prev => prev.map(c => c.id === atualizado.id ? atualizado : c))
        toast('Curso atualizado!', `"${atualizado.title}" foi salvo.`)
      } else {
        const novo = await createCourse(form, certFile)
        setCourses(prev => [novo, ...prev])
        toast('Curso adicionado!', `"${novo.title}" foi registrado.`)
      }
      setForm(formInicial)
      setEditingCourse(null)
      setCertFile(null)
      setCertPreview(null)
      setShowAdd(false)
    } catch {
      toast('Erro ao salvar', 'Não foi possível salvar o curso.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const removeCourse = async (id: string) => {
    const titulo = courses.find(c => c.id === id)?.title ?? 'Curso'
    setCourses(prev => prev.filter(c => c.id !== id))
    try {
      await deleteCourse(id)
      toast('Curso removido', `"${titulo}" foi excluído.`, 'info')
    } catch {
      carregarCursos()
      toast('Erro ao remover', 'Não foi possível excluir o curso.', 'error')
    }
  }

  return {
    courses, loading, error,
    showAdd, openAdd, closeModal,
    editingCourse, openEdit,
    saving, form, setForm,
    certFile, certPreview, setCertificateFile,
    carregarCursos,
    saveCourse, removeCourse,
  }
}
