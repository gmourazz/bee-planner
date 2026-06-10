export type BookStatus = 'lido' | 'lendo' | 'quero_ler'

export interface Book {
  id: string
  title: string
  author: string
  rating: number
  review: string
  genre: string[]
  colorIdx: number
  coverUrl: string | null
  created_at: string
  startedAt: string | null
  finishedAt: string | null
  isManga: boolean
  status: BookStatus
}
