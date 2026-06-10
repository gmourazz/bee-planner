import { supabase } from '../lib/supabase'
import { compressImage } from '../utils/image.utils'
import type { Series, SeriesStatus, SeriesType } from '../types/series.types'

function mapSeries(row: any): Series {
  return {
    id:         row.id,
    title:      row.title,
    synopsis:   row.synopsis ?? '',
    type:       (row.type as SeriesType) ?? 'serie',
    genre:      row.genres ?? [],
    platform:   row.platform ?? '',
    rating:     row.rating,
    review:     row.review ?? '',
    seasons:    row.seasons ?? null,
    episodes:   row.episodes ?? null,
    coverUrl:   row.cover_url ?? null,
    colorIdx:   row.color_idx,
    startedAt:  row.started_at ?? null,
    finishedAt: row.finished_at ?? null,
    status:     (row.status as SeriesStatus) ?? 'quero_assistir',
    favorite:   row.favorite ?? false,
    created_at: row.created_at,
  }
}

export async function fetchSeries(): Promise<Series[]> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Não autenticado')

  const { data, error } = await supabase
    .from('series')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(mapSeries)
}

export async function uploadSeriesCover(file: File, seriesId: string): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Não autenticado')

  const compressed = await compressImage(file, 600, 0.85)
  const path = `${session.user.id}/${seriesId}.jpg`

  const { error } = await supabase.storage
    .from('series-covers')
    .upload(path, compressed, { upsert: true, contentType: 'image/jpeg' })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from('series-covers').getPublicUrl(path)
  return data.publicUrl
}

export async function createSeries(
  title: string,
  synopsis: string,
  type: SeriesType,
  genre: string[],
  platform: string,
  rating: number,
  review: string,
  seasons: number | null,
  episodes: number | null,
  colorIdx: number,
  coverFile?: File | null,
  startedAt?: string | null,
  finishedAt?: string | null,
  status?: SeriesStatus,
  favorite?: boolean,
): Promise<Series> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Não autenticado')

  const { data, error } = await supabase
    .from('series')
    .insert({
      user_id:     session.user.id,
      title:       title.trim(),
      synopsis:    synopsis.trim(),
      type,
      genres:      genre,
      platform,
      rating,
      review,
      seasons:     seasons || null,
      episodes:    episodes || null,
      color_idx:   colorIdx,
      started_at:  startedAt  || null,
      finished_at: finishedAt || null,
      status:      status ?? 'quero_assistir',
      favorite:    favorite ?? false,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  let coverUrl: string | null = null
  if (coverFile) {
    try {
      coverUrl = await uploadSeriesCover(coverFile, data.id)
      await supabase.from('series').update({ cover_url: coverUrl }).eq('id', data.id)
    } catch { /* upload de capa é não-fatal */ }
  }

  return mapSeries({ ...data, cover_url: coverUrl })
}

export async function updateSeries(
  id: string,
  changes: Partial<Pick<Series,
    'title' | 'synopsis' | 'type' | 'genre' | 'platform' | 'rating' | 'review' |
    'seasons' | 'episodes' | 'colorIdx' | 'startedAt' | 'finishedAt' | 'status' | 'favorite'
  >>,
  coverFile?: File | null,
): Promise<Series> {
  const updates: Record<string, unknown> = {}
  if (changes.title      !== undefined) updates.title        = changes.title.trim()
  if (changes.synopsis   !== undefined) updates.synopsis     = changes.synopsis
  if (changes.type       !== undefined) updates.type         = changes.type
  if (changes.genre      !== undefined) updates.genres       = changes.genre
  if (changes.platform   !== undefined) updates.platform     = changes.platform
  if (changes.rating     !== undefined) updates.rating       = changes.rating
  if (changes.review     !== undefined) updates.review       = changes.review
  if (changes.seasons    !== undefined) updates.seasons      = changes.seasons || null
  if (changes.episodes   !== undefined) updates.episodes     = changes.episodes || null
  if (changes.colorIdx   !== undefined) updates.color_idx    = changes.colorIdx
  if (changes.startedAt  !== undefined) updates.started_at   = changes.startedAt  || null
  if (changes.finishedAt !== undefined) updates.finished_at  = changes.finishedAt || null
  if (changes.status     !== undefined) updates.status       = changes.status
  if (changes.favorite   !== undefined) updates.favorite     = changes.favorite

  const { data, error } = await supabase
    .from('series')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  let coverUrl = data.cover_url ?? null
  if (coverFile) {
    try {
      coverUrl = await uploadSeriesCover(coverFile, id)
      await supabase.from('series').update({ cover_url: coverUrl }).eq('id', id)
    } catch { /* upload de capa é não-fatal */ }
  }

  return mapSeries({ ...data, cover_url: coverUrl })
}

export async function deleteSeries(id: string): Promise<void> {
  const { error } = await supabase.from('series').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
