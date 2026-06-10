export type CourseStatus = 'completed' | 'in-progress' | 'urgent' | 'not-finished'

export interface Course {
  id: string
  title: string
  platform: string
  duration: string
  progress: number
  status: CourseStatus
  startDate: string | null
  endDate: string | null
  certificate: boolean
  certificateExpiry: string | null
  certificateUrl: string | null
  credential: string
  created_at: string
}
