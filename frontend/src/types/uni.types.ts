export interface UniSubject {
  id: string
  name: string
  professor: string
  credits: number
  grade: number | null
  attendance: number
  absences: number
  maxAbsences: number
  subjectStatus: 'open' | 'done'
  startDate: string | null
  endDate: string | null
  colorIdx: number
  icon: string
  semester: string
  created_at: string
}

export interface UniSchedule {
  id: string
  subjectName: string
  room: string
  dayOfWeek: number   // 1=Seg … 6=Sáb
  timeStart: string   // "08:00"
  colorIdx: number
  semester: string
  created_at: string
}

export interface UniExam {
  id: string
  subject: string
  examDate: string    // YYYY-MM-DD
  type: string
  description: string
  status: 'pending' | 'done'
  created_at: string
}

export interface UniSemester {
  id: string
  name: string
  startDate: string | null
  endDate: string | null
  isCurrent: boolean
  created_at: string
}
