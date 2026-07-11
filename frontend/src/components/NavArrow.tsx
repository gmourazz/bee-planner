import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import type { ReactNode } from 'react'

type Direction = 'left' | 'right' | 'up' | 'down'

const ICONS: Record<Direction, ReactNode> = {
  left:  <ChevronLeft  className="w-4 h-4" />,
  right: <ChevronRight className="w-4 h-4" />,
  up:    <ChevronUp    className="w-4 h-4" />,
  down:  <ChevronDown  className="w-4 h-4" />,
}

interface NavArrowProps {
  direction: Direction
  onClick: () => void
  disabled?: boolean
  size?: number
}

export function NavArrow({ direction, onClick, disabled = false, size = 32 }: NavArrowProps) {
  const { currentTheme: { colors: c } } = useTheme()

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center rounded-full transition-all hover:opacity-70 disabled:opacity-30 flex-shrink-0"
      style={{ background: c.primaryLight, width: size, height: size, color: c.primaryDark }}
    >
      {ICONS[direction]}
    </button>
  )
}

// Input numérico com setas no estilo NavArrow
interface StepInputProps {
  value: string | number
  onChange: (v: string) => void
  placeholder?: string
  step?: number
  min?: number
  max?: number
}

export function StepInput({ value, onChange, placeholder = '0', step = 5, min = 0, max = Infinity }: StepInputProps) {
  const { currentTheme: { colors: c } } = useTheme()
  const num = Number(value) || 0

  const decrement = () => onChange(String(Math.max(min, num - step)))
  const increment = () => onChange(String(Math.min(max, num + step)))

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl w-full"
      style={{ background: c.background, border: `1.5px solid ${c.primaryLight}` }}
    >
      <NavArrow direction="down" onClick={decrement} disabled={num <= min} size={26} />
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 text-sm text-center outline-none bg-transparent min-w-0"
        style={{ color: c.text }}
      />
      <NavArrow direction="up" onClick={increment} disabled={num >= max} size={26} />
    </div>
  )
}
