import {
  PlusCircle, Star, X, Trash2, Loader2, ImageIcon, Palette,
  LayoutGrid, List, Pencil, Search, Play, CheckCircle, Bookmark,
  PauseCircle, Clapperboard, Film, Sparkles, Video, Heart, Plus,
  BarChart2, Library, Award, ChevronDown, Popcorn, Ticket, Projector, Tv,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { useTheme } from '../contexts/ThemeContext'
import { useSeries } from '../hooks/useSeries'
import type { Series, SeriesStatus, SeriesType } from '../types/series.types'
import { getCroppedImage } from '../utils/crop.utils'
import type { PixelCrop } from '../utils/crop.utils'
import { DatePickerInput } from '../components/DatePickerInput'

// ── Constantes ────────────────────────────────────────────────────────────────

const GRADIENTS = [
  'linear-gradient(160deg, #1e3a5f 0%, #0284c7 100%)',
  'linear-gradient(160deg, #4a0e8f 0%, #7c3aed 100%)',
  'linear-gradient(160deg, #111827 0%, #374151 100%)',
  'linear-gradient(160deg, #7f1d1d 0%, #dc2626 100%)',
  'linear-gradient(160deg, #064e3b 0%, #059669 100%)',
  'linear-gradient(160deg, #78350f 0%, #d97706 100%)',
]

const STATUS_CONFIG: Record<SeriesStatus, { label: string; color: string; bg: string; Icon: LucideIcon }> = {
  assistindo:     { label: 'Assistindo',     color: '#0284c7', bg: '#e0f2fe', Icon: Play        },
  assistido:      { label: 'Assistido',      color: '#059669', bg: '#d1fae5', Icon: CheckCircle },
  quero_assistir: { label: 'Quero assistir', color: '#7c3aed', bg: '#ede9fe', Icon: Bookmark    },
  pausado:        { label: 'Pausado',        color: '#d97706', bg: '#fef3c7', Icon: PauseCircle },
}

const TYPE_CONFIG: Record<SeriesType, { label: string; color: string; Icon: LucideIcon }> = {
  serie:        { label: 'Série',        color: '#0284c7', Icon: Tv       },
  filme:        { label: 'Filme',        color: '#dc2626', Icon: Film     },
  anime:        { label: 'Anime',        color: '#7c3aed', Icon: Sparkles },
  documentario: { label: 'Documentário', color: '#059669', Icon: Video    },
}

const PLATAFORMAS = [
  'Netflix', 'Prime Video', 'Disney+', 'HBO Max',
  'Apple TV+', 'Globoplay', 'Crunchyroll', 'YouTube', 'Outro',
]

const PLATFORM_COLOR: Record<string, string> = {
  'Netflix':      '#e50914',
  'Prime Video':  '#00a8e0',
  'Disney+':      '#0063e5',
  'HBO Max':      '#5822b4',
  'Apple TV+':    '#888888',
  'Globoplay':    '#e6282f',
  'Crunchyroll':  '#f47521',
  'YouTube':      '#ff0000',
  'Outro':        '#6b7280',
}

const GENEROS = [
  'Ação', 'Aventura', 'Animação', 'Comédia', 'Crime', 'Drama',
  'Fantasia', 'Ficção Científica', 'Horror', 'Histórico', 'Mistério',
  'Musical', 'Reality', 'Romance', 'Suspense', 'Terror', 'Thriller', 'Esporte',
]

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

// ── Helpers ───────────────────────────────────────────────────────────────────

function getSeriesDate(s: Series) {
  return new Date((s.startedAt || s.finishedAt || s.created_at) + (s.startedAt || s.finishedAt ? 'T00:00' : ''))
}
function getSeriesYear(s: Series)  { return getSeriesDate(s).getFullYear() }
function getSeriesMonth(s: Series) { return getSeriesDate(s).getMonth() }

// ── SeriesCover ───────────────────────────────────────────────────────────────

function SeriesCover({ item, gradients, className = '', onClick }: {
  item: Series; gradients: string[]; className?: string; onClick?: (e: React.MouseEvent) => void
}) {
  const style: React.CSSProperties = item.coverUrl
    ? { backgroundImage: `url(${item.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: gradients[item.colorIdx % gradients.length] }
  return (
    <div className={`overflow-hidden flex-shrink-0 ${onClick ? 'cursor-zoom-in' : ''} ${className}`}
      style={style} onClick={onClick}>
      {!item.coverUrl && (
        <div className="w-full h-full flex items-center justify-center opacity-20">
          {(() => { const Icon = TYPE_CONFIG[item.type].Icon; return <Icon className="w-1/3 h-1/3 text-white" /> })()}
        </div>
      )}
    </div>
  )
}

// ── SeriesCard (poster full-bleed) ────────────────────────────────────────────

function SeriesCard({ item, gradients, onDelete, onEdit, onSelect }: {
  item: Series; gradients: string[]
  onDelete: (id: string) => void
  onEdit: (item: Series) => void
  onSelect: (item: Series) => void
}) {
  const statusCfg  = STATUS_CONFIG[item.status]
  const typeCfg    = TYPE_CONFIG[item.type]
  const TypeIcon   = typeCfg.Icon
  const StatusIcon = statusCfg.Icon
  const platColor  = PLATFORM_COLOR[item.platform] ?? '#6b7280'

  return (
    <div
      className="relative rounded-xl overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.04] hover:z-10"
      style={{ aspectRatio: '2/3', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
      onClick={() => onSelect(item)}
    >
      {/* Cover */}
      <SeriesCover item={item} gradients={gradients} className="absolute inset-0 w-full h-full rounded-none" />

      {/* Platform accent strip */}
      {item.platform && (
        <div className="absolute left-0 top-0 bottom-0 w-1 z-10"
          style={{ background: platColor }} />
      )}

      {/* Favorite */}
      {item.favorite && (
        <div className="absolute top-2 right-2 z-10">
          <Heart className="w-3.5 h-3.5 fill-red-400 text-red-400 drop-shadow-lg" />
        </div>
      )}

      {/* Type icon top-left */}
      <div className="absolute top-2 left-3 z-10">
        <div className="w-5 h-5 rounded flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
          <TypeIcon className="w-3 h-3" style={{ color: typeCfg.color }} />
        </div>
      </div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5 z-10"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)' }}>
        <p className="text-white font-bold text-[11px] leading-tight line-clamp-2 mb-1">{item.title}</p>
        <div className="flex gap-0.5 mb-1.5">
          {[1,2,3,4,5].map(s => (
            <Star key={s} className="w-2 h-2"
              style={{ color: s <= item.rating ? '#fbbf24' : 'rgba(255,255,255,0.2)',
                       fill:  s <= item.rating ? '#fbbf24' : 'rgba(255,255,255,0.2)' }} />
          ))}
        </div>
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white"
          style={{ background: statusCfg.color + 'bb' }}>
          <StatusIcon className="w-2 h-2" />
          {statusCfg.label}
        </span>
      </div>

      {/* Hover: action buttons */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-2 z-20"
        style={{ background: 'rgba(0,0,0,0.35)' }}>
        <button onClick={e => { e.stopPropagation(); onEdit(item) }}
          className="p-2.5 rounded-full transition-all hover:scale-110"
          style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <Pencil className="w-3.5 h-3.5 text-white" />
        </button>
        <button onClick={e => { e.stopPropagation(); onDelete(item.id) }}
          className="p-2.5 rounded-full transition-all hover:scale-110"
          style={{ background: 'rgba(239,68,68,0.35)', backdropFilter: 'blur(8px)', border: '1px solid rgba(239,68,68,0.4)' }}>
          <Trash2 className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    </div>
  )
}

// ── SeriesListItem ────────────────────────────────────────────────────────────

function SeriesListItem({ item, gradients, theme, onDelete, onEdit, onSelect }: {
  item: Series; gradients: string[]; theme: any
  onDelete: (id: string) => void
  onEdit: (item: Series) => void
  onSelect: (item: Series) => void
}) {
  const statusCfg = STATUS_CONFIG[item.status]
  const typeCfg   = TYPE_CONFIG[item.type]
  const TypeIcon  = typeCfg.Icon
  const platColor = PLATFORM_COLOR[item.platform] ?? '#6b7280'

  return (
    <div
      className="flex gap-3 rounded-2xl overflow-hidden cursor-pointer group transition-all hover:scale-[1.005]"
      style={{
        background: theme.colors.surface,
        borderLeft: `3px solid ${platColor}`,
        boxShadow: `0 2px 16px rgba(0,0,0,0.08)`,
      }}
      onClick={() => onSelect(item)}
    >
      <SeriesCover item={item} gradients={gradients} className="w-12 h-[72px] flex-shrink-0 rounded-none" />

      <div className="flex-1 py-3 pr-3 min-w-0 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm leading-tight truncate" style={{ color: theme.colors.text }}>{item.title}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <div className="flex items-center gap-1 text-[10px]" style={{ color: typeCfg.color }}>
              <TypeIcon className="w-3 h-3" />
              <span>{typeCfg.label}</span>
            </div>
            {item.platform && (
              <span className="text-[10px] font-black" style={{ color: platColor }}>{item.platform}</span>
            )}
            {(item.type === 'serie' || item.type === 'anime') && item.seasons && (
              <span className="text-[10px]" style={{ color: theme.colors.textMuted }}>
                {item.seasons}T{item.episodes ? ` · ${item.episodes}ep` : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className="w-2.5 h-2.5"
                  style={{ color: s <= item.rating ? '#fbbf24' : theme.colors.primaryLight,
                           fill:  s <= item.rating ? '#fbbf24' : theme.colors.primaryLight }} />
              ))}
            </div>
            <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold"
              style={{ background: statusCfg.bg, color: statusCfg.color }}>
              {(() => { const I = statusCfg.Icon; return <I className="w-2.5 h-2.5" /> })()}
              {statusCfg.label}
            </span>
            {item.favorite && <Heart className="w-3 h-3 fill-red-400 text-red-400" />}
          </div>
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
          <button onClick={e => { e.stopPropagation(); onEdit(item) }}
            className="p-1.5 rounded-full" style={{ background: theme.colors.primaryLight }}>
            <Pencil className="w-3 h-3" style={{ color: theme.colors.primary }} />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(item.id) }}
            className="p-1.5 rounded-full" style={{ background: theme.colors.primaryLight }}>
            <Trash2 className="w-3 h-3 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── GeneroSeriesSelect ────────────────────────────────────────────────────────

function GeneroSeriesSelect({ selected, onChange, theme }: {
  selected: string[]; onChange: (v: string[]) => void; theme: any
}) {
  const [open, setOpen] = useState(false)
  const [dropPos, setDropPos] = useState<React.CSSProperties>({})
  const btnRef = useRef<HTMLButtonElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleOpen = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setDropPos({ top: r.bottom + 4, left: r.left, minWidth: 220 })
    }
    setOpen(o => !o)
  }

  const toggle = (g: string) => onChange(selected.includes(g) ? selected.filter(s => s !== g) : [...selected, g])

  return (
    <div ref={wrapRef} className="relative">
      <button ref={btnRef} type="button" onClick={handleOpen}
        className="flex items-center gap-2 px-3 py-2.5 rounded-2xl text-sm w-full outline-none"
        style={{ background: theme.colors.primaryLight, color: selected.length > 0 ? theme.colors.text : theme.colors.textMuted }}>
        <span className="flex-1 text-left truncate text-sm">
          {selected.length === 0 ? 'Gêneros' : selected.slice(0,2).join(', ') + (selected.length > 2 ? ` +${selected.length-2}` : '')}
        </span>
        <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: theme.colors.textMuted }} />
      </button>
      {open && (
        <div className="fixed z-50 rounded-2xl shadow-xl overflow-hidden"
          style={{ ...dropPos, background: theme.colors.surface, border: `1px solid ${theme.colors.primary}20` }}>
          <div className="p-2 flex flex-wrap gap-1.5 max-h-48 overflow-y-auto" style={{ width: 240 }}>
            {GENEROS.map(g => {
              const sel = selected.includes(g)
              return (
                <button key={g} type="button" onClick={() => toggle(g)}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
                  style={{ background: sel ? theme.colors.primary : theme.colors.primaryLight, color: sel ? '#fff' : theme.colors.textMuted }}>
                  {g}
                </button>
              )
            })}
          </div>
          <div className="px-3 py-2 border-t" style={{ borderColor: `${theme.colors.primary}15` }}>
            <button type="button" onClick={() => setOpen(false)}
              className="w-full py-1 rounded-xl text-xs font-bold"
              style={{ background: theme.colors.primary, color: '#fff' }}>
              OK ({selected.length} selecionado{selected.length !== 1 ? 's' : ''})
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── SeriesDetailModal ─────────────────────────────────────────────────────────

function SeriesDetailModal({ item, gradients, theme, onClose, onEdit, onDelete }: {
  item: Series; gradients: string[]; theme: any
  onClose: () => void
  onEdit: (item: Series) => void
  onDelete: (id: string) => void
}) {
  const statusCfg = STATUS_CONFIG[item.status]
  const typeCfg   = TYPE_CONFIG[item.type]
  const TypeIcon  = typeCfg.Icon
  const platColor = PLATFORM_COLOR[item.platform] ?? '#6b7280'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl mx-4"
        style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.primary}20` }}
        onClick={e => e.stopPropagation()}>

        {/* Capa + overlay */}
        <div className="relative h-64">
          <SeriesCover item={item} gradients={gradients} className="absolute inset-0 w-full h-full rounded-none" />
          <div className="absolute inset-0"
            style={{ background: `linear-gradient(to top, ${theme.colors.surface} 0%, rgba(0,0,0,0.5) 55%, transparent 100%)` }} />

          {/* Platform strip */}
          {item.platform && (
            <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: platColor }} />
          )}

          <button onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
            <X className="w-4 h-4 text-white" />
          </button>

          {/* Badges */}
          <div className="absolute top-3 left-5 flex gap-2">
            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-white text-[9px] font-bold"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', border: `1px solid ${typeCfg.color}60` }}>
              <TypeIcon className="w-3 h-3" style={{ color: typeCfg.color }} />
              {typeCfg.label}
            </span>
            {item.platform && (
              <span className="px-2 py-1 rounded-full text-white text-[9px] font-black"
                style={{ background: platColor + 'cc', backdropFilter: 'blur(4px)' }}>
                {item.platform}
              </span>
            )}
          </div>

          {/* Título */}
          <div className="absolute bottom-4 left-5 right-5">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-white font-black text-xl leading-tight flex-1">{item.title}</h2>
              {item.favorite && <Heart className="w-5 h-5 fill-red-400 text-red-400 flex-shrink-0" />}
            </div>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className="w-3.5 h-3.5"
                  style={{ color: s <= item.rating ? '#fbbf24' : 'rgba(255,255,255,0.2)',
                           fill:  s <= item.rating ? '#fbbf24' : 'rgba(255,255,255,0.2)' }} />
              ))}
            </div>
          </div>
        </div>

        {/* Corpo */}
        <div className="p-5 flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white"
              style={{ background: statusCfg.color }}>
              {(() => { const I = statusCfg.Icon; return <I className="w-3 h-3" /> })()}
              {statusCfg.label}
            </span>
            {(item.type === 'serie' || item.type === 'anime') && item.seasons && (
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: theme.colors.primaryLight, color: theme.colors.textMuted }}>
                {item.seasons} temp.{item.episodes ? ` · ${item.episodes} ep.` : ''}
              </span>
            )}
          </div>

          {item.genre.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.genre.map(g => (
                <span key={g} className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                  style={{ background: theme.colors.primaryLight, color: theme.colors.textMuted }}>
                  {g}
                </span>
              ))}
            </div>
          )}

          {item.synopsis && (
            <p className="text-sm leading-relaxed" style={{ color: theme.colors.textMuted }}>{item.synopsis}</p>
          )}

          {(item.startedAt || item.finishedAt) && (
            <div className="flex gap-4 text-[11px]" style={{ color: theme.colors.textMuted }}>
              {item.startedAt && <span>Início: {new Date(item.startedAt+'T00:00').toLocaleDateString('pt-BR',{day:'numeric',month:'long',year:'numeric'})}</span>}
              {item.finishedAt && <span>Fim: {new Date(item.finishedAt+'T00:00').toLocaleDateString('pt-BR',{day:'numeric',month:'long',year:'numeric'})}</span>}
            </div>
          )}

          {item.review && (
            <p className="italic text-sm leading-relaxed" style={{ color: theme.colors.textMuted }}>"{item.review}"</p>
          )}

          <div className="flex gap-2 pt-1">
            <button onClick={() => { onClose(); onEdit(item) }}
              className="flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all hover:opacity-80"
              style={{ background: theme.colors.primaryLight, color: theme.colors.primary }}>
              Editar
            </button>
            <button onClick={() => { onDelete(item.id); onClose() }}
              className="px-5 py-2.5 rounded-2xl text-sm font-bold transition-all hover:opacity-80"
              style={{ background: '#fee2e2', color: '#dc2626' }}>
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── SeriesViewerProfile ───────────────────────────────────────────────────────

function topN<T extends string>(map: Record<T, number>, n: number): { key: T; count: number }[] {
  return (Object.entries(map) as [T, number][])
    .sort((a, b) => b[1] - a[1]).slice(0, n).map(([key, count]) => ({ key, count }))
}

function SeriesViewerProfile({ series, theme }: { series: Series[]; theme: any }) {
  const assistidos    = series.filter(s => s.status === 'assistido')
  const assistindo    = series.filter(s => s.status === 'assistindo')
  const queroAssistir = series.filter(s => s.status === 'quero_assistir')
  const pausados      = series.filter(s => s.status === 'pausado')

  const platCount:  Record<string, number> = {}
  const genreCount: Record<string, number> = {}
  const typeCount:  Record<string, number> = { serie: 0, filme: 0, anime: 0, documentario: 0 }
  const starDist    = [5,4,3,2,1].map(s => ({ star: s, count: 0 }))
  let ratingSum = 0, ratingCount = 0

  assistidos.forEach(s => {
    if (s.platform) platCount[s.platform] = (platCount[s.platform] || 0) + 1
    s.genre.forEach(g => { genreCount[g] = (genreCount[g] || 0) + 1 })
    typeCount[s.type]++
    ratingSum += s.rating; ratingCount++
    const sd = starDist.find(x => x.star === s.rating)
    if (sd) sd.count++
  })
  assistindo.forEach(s => { if (s.platform) platCount[s.platform] = (platCount[s.platform]||0)+1; typeCount[s.type]++ })

  const topPlataformas = topN(platCount, 5)
  const topGeneros     = topN(genreCount, 6)
  const maxPlat        = topPlataformas[0]?.count || 1
  const maxGenero      = topGeneros[0]?.count || 1
  const avgRating      = ratingCount > 0 ? ratingSum / ratingCount : 0
  const maxStar        = Math.max(...starDist.map(x => x.count), 1)

  const anoAtual = new Date().getFullYear()
  const anosHist = [anoAtual-2, anoAtual-1, anoAtual]
  const porAno   = anosHist.map(ano => ({ ano, count: assistidos.filter(s => getSeriesYear(s) === ano).length }))
  const maxAno   = Math.max(...porAno.map(a => a.count), 1)
  const porMes   = Array.from({length:12},(_,i) => ({
    mes: MESES[i],
    count: assistidos.filter(s => getSeriesYear(s) === anoAtual && getSeriesMonth(s) === i).length,
  }))
  const maxMes = Math.max(...porMes.map(m => m.count), 1)

  if (series.length === 0) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <BarChart2 className="w-12 h-12 opacity-20" style={{ color: theme.colors.primary }} />
      <p className="text-sm font-semibold" style={{ color: theme.colors.textMuted }}>
        Registre séries e filmes para ver seu perfil de espectador!
      </p>
    </div>
  )

  const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`rounded-2xl p-5 ${className}`}
      style={{ background: theme.colors.surface, boxShadow: `0 2px 16px ${theme.colors.primary}0A` }}>
      {children}
    </div>
  )

  const SectionTitle = ({ icon: Icon, label }: { icon: LucideIcon; label: string }) => (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: theme.colors.primaryLight }}>
        <Icon className="w-3.5 h-3.5" style={{ color: theme.colors.primary }} />
      </div>
      <p className="font-bold text-sm" style={{ color: theme.colors.text }}>{label}</p>
    </div>
  )

  return (
    <div className="flex flex-col gap-5">
      {/* Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { Icon: CheckCircle, label: 'Assistidos',     value: assistidos.length,    color: '#059669', bg: '#d1fae5' },
          { Icon: Play,        label: 'Assistindo',     value: assistindo.length,    color: '#0284c7', bg: '#e0f2fe' },
          { Icon: PauseCircle, label: 'Pausados',       value: pausados.length,      color: '#d97706', bg: '#fef3c7' },
          { Icon: Bookmark,    label: 'Quero assistir', value: queroAssistir.length, color: '#7c3aed', bg: '#ede9fe' },
        ].map(({ Icon, label, value, color, bg }) => (
          <div key={label} className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: theme.colors.surface, boxShadow: `0 2px 16px ${theme.colors.primary}0A` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <p className="text-2xl font-black leading-none" style={{ color: theme.colors.text }}>{value}</p>
              <p className="text-[11px] mt-0.5" style={{ color: theme.colors.textMuted }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Plataformas + Gêneros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card>
          <SectionTitle icon={Library} label="Plataformas favoritas" />
          {topPlataformas.length === 0
            ? <p className="text-xs" style={{ color: theme.colors.textMuted }}>Nenhuma plataforma registrada.</p>
            : <div className="flex flex-col gap-3">
                {topPlataformas.map(({ key: plat, count }) => {
                  const pc = PLATFORM_COLOR[plat] ?? theme.colors.primary
                  return (
                    <div key={plat}>
                      <div className="flex justify-between mb-1">
                        <p className="text-xs font-semibold" style={{ color: theme.colors.text }}>{plat}</p>
                        <span className="text-[10px] font-bold" style={{ color: pc }}>{count}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: theme.colors.primaryLight }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.round((count/maxPlat)*100)}%`, background: pc }} />
                      </div>
                    </div>
                  )
                })}
              </div>
          }
        </Card>
        <Card>
          <SectionTitle icon={Award} label="Gêneros favoritos" />
          {topGeneros.length === 0
            ? <p className="text-xs" style={{ color: theme.colors.textMuted }}>Nenhum gênero registrado.</p>
            : <div className="flex flex-col gap-2.5">
                {topGeneros.map(({ key: genero, count }) => (
                  <div key={genero}>
                    <div className="flex justify-between mb-1">
                      <p className="text-[11px] font-semibold truncate" style={{ color: theme.colors.text }}>{genero}</p>
                      <span className="text-[10px] ml-2 flex-shrink-0" style={{ color: theme.colors.primary }}>{count}×</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: theme.colors.primaryLight }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.round((count/maxGenero)*100)}%`, background: theme.colors.primary }} />
                    </div>
                  </div>
                ))}
              </div>
          }
        </Card>
      </div>

      {/* Tipos + Avaliação + Histórico */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card>
          <SectionTitle icon={Tv} label="Por tipo" />
          <div className="flex flex-col gap-3">
            {(Object.entries(typeCount) as [SeriesType, number][]).map(([type, count]) => {
              const cfg = TYPE_CONFIG[type]; const TIcon = cfg.Icon
              const total2 = Math.max(Object.values(typeCount).reduce((a,b)=>a+b,0),1)
              return (
                <div key={type} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: cfg.color+'20' }}>
                    <TIcon className="w-3 h-3" style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-0.5">
                      <span className="text-[11px] font-semibold" style={{ color: theme.colors.text }}>{cfg.label}</span>
                      <span className="text-[10px]" style={{ color: theme.colors.textMuted }}>{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: theme.colors.primaryLight }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.round((count/total2)*100)}%`, background: cfg.color }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card>
          <SectionTitle icon={Star} label="Avaliação média" />
          <div className="flex items-end gap-3 mb-3">
            <span className="text-4xl font-black leading-none" style={{ color: theme.colors.text }}>
              {avgRating > 0 ? avgRating.toFixed(1) : '—'}
            </span>
            <div className="flex mb-1 gap-0.5">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className="w-4 h-4"
                  style={{ color: s <= Math.round(avgRating) ? '#f59e0b' : theme.colors.primaryLight,
                           fill:  s <= Math.round(avgRating) ? '#f59e0b' : theme.colors.primaryLight }} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            {starDist.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-[10px] w-3 text-right flex-shrink-0" style={{ color: theme.colors.textMuted }}>{star}</span>
                <Star className="w-2.5 h-2.5 flex-shrink-0" style={{ color:'#f59e0b', fill:'#f59e0b' }} />
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: theme.colors.primaryLight }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.round((count/maxStar)*100)}%`, background: '#f59e0b' }} />
                </div>
                <span className="text-[10px] w-3 flex-shrink-0" style={{ color: theme.colors.textMuted }}>{count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle icon={BarChart2} label="Histórico" />
          <div className="flex items-end gap-3 mb-4" style={{ height: 72 }}>
            {porAno.map(({ ano, count }) => {
              const h = count > 0 ? Math.max(40, Math.round((count/maxAno)*60)) : 6
              const ativo = ano === anoAtual
              return (
                <div key={ano} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-xl transition-all duration-500 flex items-start justify-center pt-1.5"
                    style={{ height: h, background: ativo ? theme.colors.primary : theme.colors.primaryLight }}>
                    {count > 0 && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.9)' }}>
                        <span className="text-[10px] font-black" style={{ color: theme.colors.primary }}>{count}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px]" style={{ color: theme.colors.textMuted }}>{ano}</span>
                </div>
              )
            })}
          </div>
          <p className="text-xs font-semibold mb-1.5" style={{ color: theme.colors.textMuted }}>Mês a mês — {anoAtual}</p>
          <div className="flex items-end gap-0.5 h-10">
            {porMes.map(({ mes, count }) => {
              const h = count > 0 ? Math.max(8, Math.round((count/maxMes)*32)) : 3
              return (
                <div key={mes} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="w-full rounded-sm transition-all duration-500 relative"
                    style={{ height: h, background: count > 0 ? theme.colors.primary : theme.colors.primaryLight+'60' }}>
                    {count > 0 && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background:'rgba(255,255,255,0.9)', border:`1px solid ${theme.colors.primary}30` }}>
                        <span className="text-[8px] font-black" style={{ color: theme.colors.primary }}>{count}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[7px]" style={{ color: theme.colors.textMuted }}>{mes[0]}</span>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}

// ── SeriesPage ────────────────────────────────────────────────────────────────

export function SeriesPage() {
  const { currentTheme } = useTheme()
  const {
    series, loading, error,
    showAdd, openAdd, closeModal,
    editingItem, openEdit,
    saving, form, setForm, setCoverFile,
    carregar, save, remove,
  } = useSeries()

  const [aba,               setAba]               = useState<'biblioteca' | 'perfil'>('biblioteca')
  const [abaModal,          setAbaModal]          = useState<'info' | 'registro'>('info')
  const [viewMode,          setViewMode]          = useState<'grid' | 'list'>('grid')
  const [selectedItem,      setSelectedItem]      = useState<Series | null>(null)
  const [filtroStatus,      setFiltroStatus]      = useState<'todos' | SeriesStatus>('todos')
  const [filtroType,        setFiltroType]        = useState<'todos' | SeriesType>('todos')
  const [filtroPlataforma,  setFiltroPlataforma]  = useState('')
  const [filtroBusca,       setFiltroBusca]       = useState('')
  const [cropSrc,           setCropSrc]           = useState<string | null>(null)
  const [crop,              setCrop]              = useState({ x: 0, y: 0 })
  const [zoom,              setZoom]              = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null)
  const [croppingDone,      setCroppingDone]      = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (showAdd) setAbaModal('info') }, [showAdd])

  const onCropComplete = useCallback((_: any, pixels: PixelCrop) => setCroppedAreaPixels(pixels), [])

  const confirmCrop = async () => {
    if (!cropSrc || !croppedAreaPixels) return
    setCroppingDone(true)
    try {
      const file = await getCroppedImage(cropSrc, croppedAreaPixels)
      setCoverFile(file)
    } finally {
      URL.revokeObjectURL(cropSrc)
      setCropSrc(null); setCrop({ x:0,y:0 }); setZoom(1); setCroppingDone(false)
    }
  }
  const cancelCrop = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null); setCrop({ x:0,y:0 }); setZoom(1)
  }

  const anoAtual      = new Date().getFullYear()
  const assistindo    = series.filter(s => s.status === 'assistindo')
  const pausados      = series.filter(s => s.status === 'pausado')
  const queroAssistir = series.filter(s => s.status === 'quero_assistir')
  const assistidos    = series.filter(s => s.status === 'assistido')
  const assistidosAno = assistidos.filter(s => getSeriesYear(s) === anoAtual)

  const avgRating = assistidosAno.length > 0
    ? (assistidosAno.reduce((acc, s) => acc + s.rating, 0) / assistidosAno.length).toFixed(1)
    : '—'

  const itensFiltrados = series.filter(s => {
    const skipDate = s.status !== 'assistido'
    const statusOk = filtroStatus === 'todos' || s.status === filtroStatus
    const typeOk   = filtroType === 'todos' || s.type === filtroType
    const platOk   = !filtroPlataforma || s.platform === filtroPlataforma
    const buscaOk  = !filtroBusca.trim() || s.title.toLowerCase().includes(filtroBusca.toLowerCase())
    return statusOk && typeOk && platOk && buscaOk && (skipDate || true)
  })

  const handleOpenEdit = (item: Series) => { setSelectedItem(null); openEdit(item) }
  const handleDelete   = (id: string)   => { if (selectedItem?.id === id) setSelectedItem(null); remove(id) }

  const plataformasDisponiveis = [...new Set(series.map(s => s.platform).filter(Boolean))]

  const spotlight = assistindo[0] ?? null

  return (
    <div className="flex-1 overflow-hidden" style={{ background: currentTheme.colors.background }}>
      <div className="h-full overflow-auto">
        <div className="max-w-6xl w-full mx-auto pb-8">

          {/* ── SPOTLIGHT ── */}
          <div className="rounded-3xl overflow-hidden relative" style={{
            background: `linear-gradient(135deg, ${currentTheme.colors.primaryDark} 0%, ${currentTheme.colors.primary} 100%)`,
            minHeight: 160,
          }}>
            {/* Bokeh de fundo */}
            <div style={{ position:'absolute', top:-60, left:-40, width:220, height:220, borderRadius:'50%',
              background:'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 65%)', pointerEvents:'none' }} />
            <div style={{ position:'absolute', bottom:-50, right:80, width:180, height:180, borderRadius:'50%',
              background:'radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 65%)', pointerEvents:'none' }} />
            <div style={{ position:'absolute', top:10, right:-30, width:130, height:130, borderRadius:'50%',
              background:'radial-gradient(circle, rgba(0,0,0,0.15) 0%, transparent 65%)', pointerEvents:'none' }} />

            {/* Ícones decorativos flutuantes */}
            <Popcorn className="absolute bottom-4 right-52 w-6 h-6 opacity-20 rotate-12" style={{ color:'rgba(255,255,255,0.7)', pointerEvents:'none' }} />
            <Ticket className="absolute top-5 right-32 w-5 h-5 opacity-15 -rotate-12" style={{ color:'rgba(255,255,255,0.7)', pointerEvents:'none' }} />
            <Projector className="absolute bottom-3 right-28 w-5 h-5 opacity-15 rotate-6" style={{ color:'rgba(255,255,255,0.7)', pointerEvents:'none' }} />
            <Film className="absolute top-4 right-64 w-4 h-4 opacity-15 -rotate-6" style={{ color:'rgba(255,255,255,0.7)', pointerEvents:'none' }} />
            <Star className="absolute bottom-6 right-80 w-3 h-3 opacity-20" style={{ color:'rgba(255,255,255,0.8)', pointerEvents:'none' }} />
            <Star className="absolute top-8 right-44 w-2.5 h-2.5 opacity-15" style={{ color:'rgba(255,255,255,0.8)', pointerEvents:'none' }} />

            <div className="relative z-10 p-6 flex items-center gap-6 flex-wrap">
              {/* Ícone principal */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)' }}>
                  <Clapperboard className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Contagem principal */}
              <div className="flex-shrink-0">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color:'rgba(255,255,255,0.6)' }}>Assistidos em {anoAtual}</p>
                <span className="text-5xl font-black text-white leading-none">{assistidosAno.length}</span>
              </div>

              <div className="hidden md:block w-px h-14" style={{ background:'rgba(255,255,255,0.2)' }} />

              {/* Glass stat cards */}
              <div className="flex flex-wrap gap-3 flex-1">
                {[
                  { label: 'Assistindo', value: String(assistindo.length),    color: STATUS_CONFIG.assistindo.color    },
                  { label: 'Pausados',   value: String(pausados.length),      color: STATUS_CONFIG.pausado.color       },
                  { label: 'Lista',      value: String(queroAssistir.length), color: STATUS_CONFIG.quero_assistir.color },
                  { label: 'Avaliação',  value: String(avgRating),            color: '#f59e0b'                         },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-2xl px-4 py-3 flex flex-col gap-0.5"
                    style={{ background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.18)' }}>
                    <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color:'rgba(255,255,255,0.55)' }}>{label}</span>
                    <span className="font-bold text-base leading-tight text-white">{value}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => openAdd()}
                className="flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm transition-all hover:scale-105"
                style={{ background:'rgba(255,255,255,0.18)', border:'1px solid rgba(255,255,255,0.3)', color:'white' }}>
                <PlusCircle className="w-4 h-4" />
                Adicionar
              </button>
            </div>
          </div>

          {/* ── Abas ── */}
          <div className="flex gap-1 rounded-2xl p-1" style={{ background: currentTheme.colors.surface, boxShadow:`0 2px 16px ${currentTheme.colors.primary}0A` }}>
            {([
              { key:'biblioteca', label:'Biblioteca',           Icon: Library  },
              { key:'perfil',     label:'Perfil do Espectador', Icon: BarChart2 },
            ] as const).map(({ key, label, Icon }) => (
              <button key={key} onClick={() => setAba(key)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: aba === key ? currentTheme.colors.primary : 'transparent',
                  color: aba === key ? '#fff' : currentTheme.colors.textMuted,
                  boxShadow: aba === key ? `0 4px 16px ${currentTheme.colors.primary}40` : 'none',
                }}>
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* ── Aba Perfil ── */}
          {aba === 'perfil' && <SeriesViewerProfile series={series} theme={currentTheme} />}

          {/* ── Aba Biblioteca ── */}
          {aba === 'biblioteca' && (<>

          {/* Assistindo — cards grandes no scroll */}
          {filtroStatus === 'todos' && assistindo.length > 0 && (
            <div>
              <SectionHeader icon={Play} label="Assistindo agora" count={assistindo.length}
                color={STATUS_CONFIG.assistindo.color} bg={STATUS_CONFIG.assistindo.bg}
                onAdd={() => openAdd('assistindo')} />
              <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth:'thin' }}>
                {assistindo.map(s => (
                  <div key={s.id} style={{ width: 160, flexShrink: 0 }}>
                    <SeriesCard item={s} gradients={GRADIENTS}
                      onDelete={handleDelete} onEdit={handleOpenEdit} onSelect={setSelectedItem} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pausados — lista compacta com borda da plataforma */}
          {filtroStatus === 'todos' && pausados.length > 0 && (
            <div>
              <SectionHeader icon={PauseCircle} label="Pausados" count={pausados.length}
                color={STATUS_CONFIG.pausado.color} bg={STATUS_CONFIG.pausado.bg} />
              <div className="flex flex-col gap-2">
                {pausados.map(s => (
                  <div key={s.id}
                    className="flex items-center gap-3 rounded-xl cursor-pointer group transition-all hover:scale-[1.005]"
                    style={{
                      background: currentTheme.colors.surface,
                      borderLeft: `3px solid ${PLATFORM_COLOR[s.platform] ?? STATUS_CONFIG.pausado.color}`,
                      boxShadow: `0 2px 12px rgba(0,0,0,0.06)`,
                    }}
                    onClick={() => setSelectedItem(s)}>
                    <SeriesCover item={s} gradients={GRADIENTS} className="w-10 h-14 flex-shrink-0 rounded-none" />
                    <div className="flex-1 min-w-0 py-2">
                      <p className="text-sm font-bold truncate" style={{ color: currentTheme.colors.text }}>{s.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {(() => { const Icon = TYPE_CONFIG[s.type].Icon; return <Icon className="w-3 h-3" style={{ color: TYPE_CONFIG[s.type].color }} /> })()}
                        {s.platform && <span className="text-[10px] font-black" style={{ color: PLATFORM_COLOR[s.platform] ?? currentTheme.colors.textMuted }}>{s.platform}</span>}
                        {s.genre.slice(0,2).map(g => (
                          <span key={g} className="text-[9px] px-1.5 py-0.5 rounded-full"
                            style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}>{g}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1 pr-3 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                      <button onClick={e => { e.stopPropagation(); handleOpenEdit(s) }}
                        className="p-1.5 rounded-full" style={{ background: currentTheme.colors.primaryLight }}>
                        <Pencil className="w-3 h-3" style={{ color: currentTheme.colors.primary }} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); handleDelete(s.id) }}
                        className="p-1.5 rounded-full" style={{ background: currentTheme.colors.primaryLight }}>
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quero assistir — grid compacto com platform badge */}
          {filtroStatus === 'todos' && queroAssistir.length > 0 && (
            <div>
              <SectionHeader icon={Bookmark} label="Quero assistir" count={queroAssistir.length}
                color={STATUS_CONFIG.quero_assistir.color} bg={STATUS_CONFIG.quero_assistir.bg}
                onAdd={() => openAdd('quero_assistir')} />
              <div className="flex flex-col gap-2">
                {queroAssistir.map(s => {
                  const platColor = PLATFORM_COLOR[s.platform] ?? '#6b7280'
                  return (
                    <div key={s.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer group transition-all hover:scale-[1.005]"
                      style={{
                        background: currentTheme.colors.surface,
                        borderLeft: `3px solid ${platColor}`,
                        boxShadow: `0 2px 12px rgba(0,0,0,0.06)`,
                      }}
                      onClick={() => setSelectedItem(s)}>
                      {/* type icon */}
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: TYPE_CONFIG[s.type].color + '20' }}>
                        {(() => { const Icon = TYPE_CONFIG[s.type].Icon; return <Icon className="w-4 h-4" style={{ color: TYPE_CONFIG[s.type].color }} /> })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: currentTheme.colors.text }}>{s.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px]" style={{ color: TYPE_CONFIG[s.type].color }}>{TYPE_CONFIG[s.type].label}</span>
                          {s.platform && <span className="text-[10px] font-black" style={{ color: platColor }}>{s.platform}</span>}
                          {s.genre.slice(0,3).map(g => (
                            <span key={g} className="text-[9px] px-1.5 py-0.5 rounded-full"
                              style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}>{g}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                        <button onClick={e => { e.stopPropagation(); handleOpenEdit(s) }}
                          className="p-1.5 rounded-full" style={{ background: currentTheme.colors.primaryLight }}>
                          <Pencil className="w-3 h-3" style={{ color: currentTheme.colors.primary }} />
                        </button>
                        <button onClick={e => { e.stopPropagation(); handleDelete(s.id) }}
                          className="p-1.5 rounded-full" style={{ background: currentTheme.colors.primaryLight }}>
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Filtros ── */}
          <div className="rounded-2xl px-4 py-3 flex flex-wrap items-center gap-2"
            style={{ background: currentTheme.colors.surface, border: `1px solid ${currentTheme.colors.primary}12`, boxShadow:`0 2px 16px ${currentTheme.colors.primary}08` }}>
            {/* Status */}
            <div className="flex gap-1 flex-wrap flex-shrink-0">
              {(['todos', ...Object.keys(STATUS_CONFIG)] as ('todos' | SeriesStatus)[]).map(key => {
                const ativo = filtroStatus === key
                const cfg = key !== 'todos' ? STATUS_CONFIG[key as SeriesStatus] : null
                const Icon = cfg?.Icon
                return (
                  <button key={key} onClick={() => setFiltroStatus(key)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                    style={{
                      background: ativo ? (cfg?.color ?? currentTheme.colors.primary) : currentTheme.colors.primaryLight,
                      color: ativo ? '#fff' : currentTheme.colors.textMuted,
                    }}>
                    {Icon && <Icon className="w-3 h-3" />}
                    {key === 'todos' ? 'Todos' : cfg?.label}
                  </button>
                )
              })}
            </div>

            <div className="w-px h-4 flex-shrink-0" style={{ background: currentTheme.colors.primary+'25' }} />

            {/* Tipo */}
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => setFiltroType('todos')}
                className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                style={{ background: filtroType === 'todos' ? currentTheme.colors.primary : currentTheme.colors.primaryLight, color: filtroType === 'todos' ? '#fff' : currentTheme.colors.textMuted }}>
                Todos
              </button>
              {(Object.entries(TYPE_CONFIG) as [SeriesType, typeof TYPE_CONFIG[SeriesType]][]).map(([key, cfg]) => {
                const Icon = cfg.Icon; const ativo = filtroType === key
                return (
                  <button key={key} onClick={() => setFiltroType(key)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                    style={{ background: ativo ? cfg.color : currentTheme.colors.primaryLight, color: ativo ? '#fff' : currentTheme.colors.textMuted }}>
                    <Icon className="w-3 h-3" />
                    {cfg.label}
                  </button>
                )
              })}
            </div>

            {plataformasDisponiveis.length > 0 && (
              <>
                <div className="w-px h-4 flex-shrink-0" style={{ background: currentTheme.colors.primary+'25' }} />
                <div className="flex gap-1 flex-wrap flex-shrink-0">
                  {plataformasDisponiveis.map(p => {
                    const pc = PLATFORM_COLOR[p] ?? '#6b7280'
                    return (
                      <button key={p} onClick={() => setFiltroPlataforma(filtroPlataforma === p ? '' : p)}
                        className="px-2.5 py-1.5 rounded-full text-xs font-bold transition-all"
                        style={{ background: filtroPlataforma === p ? pc : currentTheme.colors.primaryLight, color: filtroPlataforma === p ? '#fff' : currentTheme.colors.textMuted }}>
                        {p}
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            {/* Busca + view toggle */}
            <div className="flex items-center gap-2 flex-1 min-w-[140px]">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full flex-1"
                style={{ background: currentTheme.colors.primaryLight }}>
                <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: currentTheme.colors.textMuted }} />
                <input type="text" placeholder="Buscar título..." value={filtroBusca}
                  onChange={e => setFiltroBusca(e.target.value)}
                  className="bg-transparent outline-none text-xs flex-1"
                  style={{ color: currentTheme.colors.text }} />
              </div>
              <div className="flex rounded-full overflow-hidden flex-shrink-0" style={{ border:`1.5px solid ${currentTheme.colors.primary}30` }}>
                {(['grid','list'] as const).map(mode => {
                  const Icon = mode === 'grid' ? LayoutGrid : List
                  return (
                    <button key={mode} onClick={() => setViewMode(mode)} className="px-3 py-1.5 transition-all"
                      style={{ background: viewMode === mode ? currentTheme.colors.primary : 'transparent', color: viewMode === mode ? '#fff' : currentTheme.colors.textMuted }}>
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  )
                })}
              </div>
            </div>

            {(filtroStatus !== 'todos' || filtroType !== 'todos' || filtroPlataforma || filtroBusca) && (
              <button onClick={() => { setFiltroStatus('todos'); setFiltroType('todos'); setFiltroPlataforma(''); setFiltroBusca('') }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold hover:opacity-70 flex-shrink-0"
                style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.textMuted }}>
                Limpar
              </button>
            )}
          </div>

          {/* Loading / Error */}
          {loading && (
            <div className="flex items-center justify-center py-16 gap-2" style={{ color: currentTheme.colors.textMuted }}>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Carregando...</span>
            </div>
          )}
          {!loading && error && (
            <div className="py-8 text-center">
              <p className="text-sm text-red-500">{error}</p>
              <button onClick={carregar} className="mt-2 text-xs underline" style={{ color: currentTheme.colors.primary }}>Tentar novamente</button>
            </div>
          )}

          {/* Estado vazio */}
          {!loading && !error && series.length === 0 && (
            <div className="py-20 flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl flex items-center justify-center"
                  style={{ background: currentTheme.colors.primaryLight }}>
                  <Clapperboard className="w-11 h-11 opacity-40" style={{ color: currentTheme.colors.primary }} />
                </div>
                <Popcorn className="absolute -top-2 -right-2 w-7 h-7 opacity-70 rotate-12" style={{ color: currentTheme.colors.accent }} />
              </div>
              <p className="text-sm font-semibold" style={{ color: currentTheme.colors.textMuted }}>
                Nenhuma série ou filme registrado ainda
              </p>
              <button onClick={() => openAdd()}
                className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-white transition-all hover:scale-105"
                style={{ background: currentTheme.colors.primary }}>
                <PlusCircle className="w-4 h-4" /> Adicionar primeiro
              </button>
            </div>
          )}

          {/* ── Grid letterboxd-style (assistidos) ── */}
          {!loading && !error && (() => {
            const paraListar = filtroStatus === 'todos'
              ? itensFiltrados.filter(s => s.status === 'assistido')
              : itensFiltrados
            if (paraListar.length === 0) return null

            if (viewMode === 'list') return (
              <div className="flex flex-col gap-2">
                {paraListar.map(s => (
                  <SeriesListItem key={s.id} item={s} theme={currentTheme} gradients={GRADIENTS}
                    onDelete={handleDelete} onEdit={handleOpenEdit} onSelect={setSelectedItem} />
                ))}
              </div>
            )

            return (
              <div>
                {filtroStatus === 'todos' && (
                  <SectionHeader icon={CheckCircle} label="Assistidos" count={paraListar.length}
                    color={STATUS_CONFIG.assistido.color} bg={STATUS_CONFIG.assistido.bg} />
                )}
                {/* Grid denso estilo letterboxd */}
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2">
                  {paraListar.map(s => (
                    <SeriesCard key={s.id} item={s} gradients={GRADIENTS}
                      onDelete={handleDelete} onEdit={handleOpenEdit} onSelect={setSelectedItem} />
                  ))}
                  {/* Botão adicionar */}
                  <button onClick={() => openAdd()}
                    className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-all hover:opacity-70"
                    style={{ aspectRatio:'2/3', borderColor: currentTheme.colors.primary+'40', background: currentTheme.colors.primaryLight+'30' }}>
                    <PlusCircle className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                  </button>
                </div>
              </div>
            )
          })()}

          </>)}{/* fecha aba biblioteca */}

        </div>{/* fecha max-w */}
      </div>

      {/* Modal detalhe */}
      {selectedItem && (
        <SeriesDetailModal item={selectedItem} gradients={GRADIENTS} theme={currentTheme}
          onClose={() => setSelectedItem(null)} onEdit={handleOpenEdit} onDelete={handleDelete} />
      )}

      {/* Modal adicionar / editar */}
      {showAdd && (
        <div className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter:'blur(10px)' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="w-full max-w-2xl rounded-3xl shadow-2xl overflow-y-auto max-h-[92vh]"
            style={{ background: currentTheme.colors.surface }}>

            {/* Banner do modal */}
            <div style={{
              background: `linear-gradient(135deg, ${currentTheme.colors.primaryDark} 0%, ${currentTheme.colors.primary} 100%)`,
              padding:'20px 22px 18px', borderRadius:'24px 24px 0 0', position:'relative', overflow:'hidden',
            }}>
              <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, borderRadius:'50%',
                background:'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)', pointerEvents:'none' }} />
              <Popcorn className="absolute bottom-2 right-16 w-5 h-5 opacity-25 rotate-12" style={{ color:'rgba(255,255,255,0.9)', pointerEvents:'none' }} />
              <Ticket className="absolute top-3 right-8 w-4 h-4 opacity-20 -rotate-12" style={{ color:'rgba(255,255,255,0.9)', pointerEvents:'none' }} />
              <div className="flex items-start justify-between relative">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)' }}>
                    <Clapperboard className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color:'rgba(255,255,255,0.55)' }}>
                      {editingItem ? 'Editar registro' : 'Novo registro'}
                    </p>
                    <h3 className="font-bold text-base leading-tight text-white">
                      {editingItem ? 'Atualizar série ou filme' : 'Registrar série ou filme'}
                    </h3>
                  </div>
                </div>
                <button onClick={closeModal} className="p-1.5 rounded-full transition-all hover:bg-white/10">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Abas do modal */}
            <div className="flex gap-1 mx-5 mt-4 rounded-2xl p-1" style={{ background: currentTheme.colors.primaryLight }}>
              {([
                { key: 'info',     label: 'Informações', Icon: Clapperboard },
                { key: 'registro', label: 'Registro',    Icon: Star         },
              ] as const).map(({ key, label, Icon }) => (
                <button key={key} type="button" onClick={() => setAbaModal(key)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: abaModal === key ? currentTheme.colors.primary : 'transparent',
                    color:      abaModal === key ? '#fff' : currentTheme.colors.textMuted,
                  }}>
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>

            <div className="p-5 flex flex-col gap-3">

              {/* ── Aba Informações ── */}
              {abaModal === 'info' && (<>

              {/* Tipo */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Tipo</p>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.entries(TYPE_CONFIG) as [SeriesType, typeof TYPE_CONFIG[SeriesType]][]).map(([key, cfg]) => {
                    const Icon = cfg.Icon; const ativo = form.type === key
                    return (
                      <button key={key} type="button" onClick={() => setForm(f => ({ ...f, type: key }))}
                        className="py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                        style={{ background: ativo ? cfg.color : currentTheme.colors.primaryLight, color: ativo ? '#fff' : currentTheme.colors.textMuted }}>
                        <Icon className="w-3.5 h-3.5" />
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Título */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Título</p>
                <input type="text" placeholder="Nome da série ou filme" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-3 rounded-2xl outline-none text-sm"
                  style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }} />
              </div>

              {/* Plataforma */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Plataforma</p>
                <div className="flex flex-wrap gap-1.5">
                  {PLATAFORMAS.map(p => {
                    const pc = PLATFORM_COLOR[p] ?? '#6b7280'
                    return (
                      <button key={p} type="button" onClick={() => setForm(f => ({ ...f, platform: f.platform === p ? '' : p }))}
                        className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                        style={{ background: form.platform === p ? pc : currentTheme.colors.primaryLight, color: form.platform === p ? '#fff' : currentTheme.colors.textMuted }}>
                        {p}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Gêneros */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Gêneros</p>
                <GeneroSeriesSelect selected={form.genres} onChange={genres => setForm(f => ({ ...f, genres }))} theme={currentTheme} />
              </div>

              {/* Temporadas / Episódios */}
              {(form.type === 'serie' || form.type === 'anime') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Temporadas</p>
                    <input type="number" min={1} placeholder="Ex: 3" value={form.seasons}
                      onChange={e => setForm(f => ({ ...f, seasons: e.target.value }))}
                      className="w-full px-3 py-3 rounded-2xl outline-none text-sm"
                      style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Episódios</p>
                    <input type="number" min={1} placeholder="Ex: 30" value={form.episodes}
                      onChange={e => setForm(f => ({ ...f, episodes: e.target.value }))}
                      className="w-full px-3 py-3 rounded-2xl outline-none text-sm"
                      style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }} />
                  </div>
                </div>
              )}

              {/* Sinopse */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Sinopse (opcional)</p>
                <textarea rows={3} placeholder="Breve descrição..." value={form.synopsis}
                  onChange={e => setForm(f => ({ ...f, synopsis: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl outline-none text-sm resize-none"
                  style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }} />
              </div>

              {/* Botão → próxima aba */}
              <button type="button" onClick={() => setAbaModal('registro')}
                className="w-full py-3 rounded-2xl font-bold text-sm transition-all hover:opacity-90 text-white"
                style={{ background: currentTheme.colors.primary }}>
                Próximo →
              </button>

              </>)}

              {/* ── Aba Registro ── */}
              {abaModal === 'registro' && (<>

              {/* Status */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(STATUS_CONFIG) as [SeriesStatus, typeof STATUS_CONFIG[SeriesStatus]][]).map(([key, cfg]) => {
                    const Icon = cfg.Icon; const ativo = form.status === key
                    return (
                      <button key={key} type="button" onClick={() => setForm(f => ({ ...f, status: key }))}
                        className="py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-1.5"
                        style={{ background: ativo ? cfg.color : currentTheme.colors.primaryLight, color: ativo ? '#fff' : currentTheme.colors.textMuted }}>
                        <Icon className="w-3.5 h-3.5" />
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Datas + avaliação + favorito */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Iniciado em</p>
                  <DatePickerInput value={form.startedAt} onChange={v => setForm(f => ({ ...f, startedAt: v }))}
                    placeholder="DD/MM/AAAA" theme={currentTheme} direction="up" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Finalizado em</p>
                  <DatePickerInput value={form.finishedAt} onChange={v => setForm(f => ({ ...f, finishedAt: v }))}
                    placeholder="DD/MM/AAAA" theme={currentTheme} direction="up" />
                </div>
              </div>

              {/* Avaliação + Favorito */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Avaliação</p>
                  <div className="flex gap-1 pt-1">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" onClick={() => setForm(f => ({ ...f, rating: s }))}
                        className="transition-transform hover:scale-125">
                        <Star className="w-6 h-6"
                          style={{ color: s <= form.rating ? '#f59e0b' : currentTheme.colors.primaryLight,
                                   fill:  s <= form.rating ? '#f59e0b' : currentTheme.colors.primaryLight }} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Favorito</p>
                  <button type="button" onClick={() => setForm(f => ({ ...f, favorite: !f.favorite }))}
                    className="mt-0.5 flex items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all text-sm font-semibold w-full justify-center"
                    style={{ background: form.favorite ? '#fee2e2' : currentTheme.colors.primaryLight, color: form.favorite ? '#dc2626' : currentTheme.colors.textMuted }}>
                    <Heart className={`w-4 h-4 ${form.favorite ? 'fill-red-500' : ''}`} />
                    {form.favorite ? 'Favorito!' : 'Marcar favorito'}
                  </button>
                </div>
              </div>

              {/* Resenha */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Resenha (opcional)</p>
                <textarea rows={2} placeholder="O que achou?" value={form.review}
                  onChange={e => setForm(f => ({ ...f, review: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl outline-none text-sm resize-none"
                  style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }} />
              </div>

              {/* Capa */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Capa</p>
                <div className="flex gap-2 mb-2">
                  {([{ val:'color', label:'Cor', Icon:Palette }, { val:'photo', label:'Foto', Icon:ImageIcon }] as const).map(({ val, label, Icon }) => (
                    <button key={val} type="button" onClick={() => setForm(f => ({ ...f, coverMode: val }))}
                      className="flex-1 py-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      style={{ background: form.coverMode === val ? currentTheme.colors.primary : currentTheme.colors.primaryLight, color: form.coverMode === val ? '#fff' : currentTheme.colors.textMuted }}>
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
                {form.coverMode === 'color' && (
                  <div className="flex gap-2">
                    {GRADIENTS.map((g, i) => (
                      <button key={i} type="button" onClick={() => setForm(f => ({ ...f, colorIdx: i }))}
                        className="w-9 h-9 rounded-xl transition-all hover:scale-110"
                        style={{ background: g, outline: form.colorIdx === i ? `3px solid ${currentTheme.colors.primary}` : 'none', outlineOffset: 2 }} />
                    ))}
                  </div>
                )}
                {form.coverMode === 'photo' && (
                  <div className="flex items-center gap-3">
                    {form.coverPreview
                      ? <img src={form.coverPreview} className="w-14 h-20 object-cover rounded-xl" alt="capa" />
                      : <div className="w-14 h-20 rounded-xl flex items-center justify-center" style={{ background: currentTheme.colors.primaryLight }}>
                          <ImageIcon className="w-5 h-5" style={{ color: currentTheme.colors.textMuted }} />
                        </div>
                    }
                    <div className="flex flex-col gap-2">
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-2xl text-xs font-bold hover:opacity-80 transition-all"
                        style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primary }}>
                        {form.coverPreview ? 'Trocar' : 'Escolher imagem'}
                      </button>
                      {form.coverPreview && (
                        <button type="button" onClick={() => setForm(f => ({ ...f, coverFile: null, coverPreview: null }))}
                          className="px-4 py-2 rounded-2xl text-xs font-bold text-red-500 hover:opacity-80" style={{ background:'#fee2e2' }}>
                          Remover
                        </button>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (!f) return; setCropSrc(URL.createObjectURL(f)); e.target.value='' }} />
                  </div>
                )}
              </div>

              {/* Salvar */}
              <button onClick={save} disabled={saving || !form.title.trim()}
                className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 text-white"
                style={{ background: currentTheme.colors.primary }}>
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : (editingItem ? 'Atualizar' : 'Registrar')}
              </button>

              </>)}
            </div>
          </div>
        </div>
      )}

      {/* Modal crop */}
      {cropSrc && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center"
          style={{ background:'rgba(0,0,0,0.9)' }}>
          <div className="relative w-72 h-[432px] rounded-2xl overflow-hidden">
            <Cropper image={cropSrc} crop={crop} zoom={zoom}
              aspect={2/3} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={cancelCrop} className="px-5 py-2 rounded-full text-sm font-bold text-white/50 hover:text-white">Cancelar</button>
            <button onClick={confirmCrop} disabled={croppingDone}
              className="px-6 py-2 rounded-full text-sm font-bold text-white hover:opacity-80 transition-all"
              style={{ background: currentTheme.colors.primary }}>
              {croppingDone ? 'Processando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
