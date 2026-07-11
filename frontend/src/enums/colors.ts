// Paleta central de cores do sistema BeePlaner
// Importe daqui em qualquer módulo para manter consistência visual

export const CATEGORY_COLORS = {
  tarefa: { color: '#F9A8D4', bg: '#FDF2F8' },  // pink-300
  habito: { color: '#60A5FA', bg: '#EFF6FF' },  // blue-400
  livro:  { color: '#A78BFA', bg: '#F5F3FF' },  // violet-400
  curso:  { color: '#67E8F9', bg: '#ECFEFF' },  // cyan-300
} as const

export const STATUS_COLORS = {
  concluido:    { color: '#7BC4A8', bg: '#F0FAF5' },  // sage green pastel
  pendente:     { color: '#F9A8D4', bg: '#FDF2F8' },  // pink-300
  atrasado:     { color: '#D49898', bg: '#FDF0F0' },  // dusty rose pastel
  em_andamento: { color: '#FDBA74', bg: '#FFF7ED' },  // peach
  danger:       { color: '#D49898', bg: '#FDF0F0' },  // dusty rose pastel
} as const

// Tipo auxiliar para usar nos components
export type CategoryKey = keyof typeof CATEGORY_COLORS
export type StatusKey   = keyof typeof STATUS_COLORS
