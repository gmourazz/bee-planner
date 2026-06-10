export type SeriesStatus = 'assistindo' | 'assistido' | 'quero_assistir' | 'pausado'
export type SeriesType   = 'serie' | 'filme' | 'anime' | 'documentario'

export interface Series {
  id:         string
  title:      string
  synopsis:   string
  type:       SeriesType
  genre:      string[]
  platform:   string
  rating:     number
  review:     string
  seasons:    number | null
  episodes:   number | null
  coverUrl:   string | null
  colorIdx:   number
  startedAt:  string | null
  finishedAt: string | null
  status:     SeriesStatus
  favorite:   boolean
  created_at: string
}
