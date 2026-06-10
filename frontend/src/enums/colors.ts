// Paleta central de cores do sistema BeePlaner
// Importe daqui em qualquer módulo para manter consistência visual

export const CATEGORY_COLORS = {
  tarefa:    { color: '#E8799A', bg: '#FFF0EC' },
  habito:    { color: '#2563eb', bg: '#dbeafe' },
  livro:     { color: '#7c3aed', bg: '#ede9fe' },
  curso:     { color: '#0891b2', bg: '#cffafe' },
} as const

export const STATUS_COLORS = {
  concluido:    { color: '#22c55e', bg: '#dcfce7' },
  pendente:     { color: '#E8799A', bg: '#FFF0EC' },
  atrasado:     { color: '#dc2626', bg: '#fee2e2' },
  em_andamento: { color: '#d97706', bg: '#fef3c7' },
  danger:       { color: '#ef4444', bg: '#fee2e2' },
} as const

// Tipo auxiliar para usar nos components
export type CategoryKey = keyof typeof CATEGORY_COLORS
export type StatusKey   = keyof typeof STATUS_COLORS
