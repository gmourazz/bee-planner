import { createContext, useContext, useState, ReactNode } from 'react';
import type { Theme } from '../types/theme.types';

export type { Theme };

export const themes: Theme[] = [
  {
    id: 'bee',
    name: 'Sistema',
    category: 'Padrão',
    colors: {
      primary:      '#F4A7C3',
      primaryLight: '#FDF0F6',
      primaryDark:  '#C96E91',
      accent:       '#FDE68A',
      background:   '#FFF9FB',
      surface:      '#FFFFFF',
      text:         '#3B1A2E',
      textMuted:    '#C084B8',
    },
    emoji: '🐝',
  },
  {
    id: 'tech',
    name: 'TI & Tecnologia',
    category: 'Profissão',
    colors: {
      primary:      '#6a6a6a',  // cinza médio — bordas e ícones
      primaryLight: '#1b1b1b',  // cinza muito escuro — fundo inputs/hover
      primaryDark:  '#ffffff',  // branco — ativos e destaques
      accent:       '#aaaaaa',  // cinza claro — badges
      background:   '#000000',  // preto puro
      surface:      '#111111',  // preto quase total — cards
      text:         '#ffffff',  // branco
      textMuted:    '#aaaaaa',  // cinza claro — texto secundário legível
    },
    emoji: '💻',
    backgroundPattern: 'tech',
  },
  {
    id: 'veterinary',
    name: 'Veterinário',
    category: 'Profissão',
    colors: {
      primary:      '#66BB6A',  // verde médio amigável
      primaryLight: '#C8E6C9',  // verde claro suave — fundo inputs
      primaryDark:  '#2E7D32',  // verde escuro confiável
      accent:       '#66BB6A',  // verde médio
      background:   '#F1F8F1',  // branco com leve toque verde
      surface:      '#FFFFFF',  // branco
      text:         '#263238',  // cinza quase preto
      textMuted:    '#546E7A',  // cinza médio
    },
    emoji: '🐾',
  },
  {
    id: 'medical',
    name: 'Médico',
    category: 'Profissão',
    colors: {
      primary: '#EF4444',
      primaryLight: '#FEE2E2',
      primaryDark: '#B91C1C',
      accent: '#3B82F6',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      text: '#1E293B',
      textMuted: '#64748B',
    },
    emoji: '⚕️',
  },
  {
    id: 'designer',
    name: 'Designer',
    category: 'Profissão',
    colors: {
      primary: '#8B5CF6',
      primaryLight: '#EDE9FE',
      primaryDark: '#6D28D9',
      accent: '#EC4899',
      background: '#FAF5FF',
      surface: '#FFFFFF',
      text: '#4C1D95',
      textMuted: '#9333EA',
    },
    emoji: '🎨',
  },
  {
    id: 'lawyer',
    name: 'Advogado',
    category: 'Profissão',
    colors: {
      primary: '#0F172A',
      primaryLight: '#E2E8F0',
      primaryDark: '#020617',
      accent: '#CA8A04',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      text: '#0F172A',
      textMuted: '#475569',
    },
    emoji: '⚖️',
  },
  {
    id: 'student',
    name: 'Estudante',
    category: 'Profissão',
    colors: {
      primary: '#F59E0B',
      primaryLight: '#FEF3C7',
      primaryDark: '#D97706',
      accent: '#3B82F6',
      background: '#FFFBEB',
      surface: '#FFFFFF',
      text: '#78350F',
      textMuted: '#92400E',
    },
    emoji: '📚',
  },
  {
    id: 'data-analyst',
    name: 'Analista de Dados',
    category: 'Profissão',
    colors: {
      primary: '#06B6D4',
      primaryLight: '#CFFAFE',
      primaryDark: '#0E7490',
      accent: '#8B5CF6',
      background: '#ECFEFF',
      surface: '#FFFFFF',
      text: '#164E63',
      textMuted: '#0891B2',
    },
    emoji: '📊',
  },
  {
    id: 'engineer',
    name: 'Engenheiro',
    category: 'Profissão',
    colors: {
      primary:      '#1D4ED8',
      primaryLight: '#DBEAFE',
      primaryDark:  '#1E3A8A',
      accent:       '#F97316',
      background:   '#EFF6FF',
      surface:      '#FFFFFF',
      text:         '#1E3A8A',
      textMuted:    '#3B82F6',
    },
    emoji: '⚙️',
  },
  {
    id: 'teacher',
    name: 'Professor',
    category: 'Profissão',
    colors: {
      primary:      '#4F46E5',
      primaryLight: '#EEF2FF',
      primaryDark:  '#3730A3',
      accent:       '#FB923C',
      background:   '#F5F3FF',
      surface:      '#FFFFFF',
      text:         '#312E81',
      textMuted:    '#6366F1',
    },
    emoji: '📖',
  },
  {
    id: 'fitness',
    name: 'Fitness & Saúde',
    category: 'Lifestyle',
    colors: {
      primary: '#14B8A6',
      primaryLight: '#CCFBF1',
      primaryDark: '#0F766E',
      accent: '#F97316',
      background: '#F0FDFA',
      surface: '#FFFFFF',
      text: '#134E4A',
      textMuted: '#2DD4BF',
    },
    emoji: '💪',
  },
  {
    id: 'nature',
    name: 'Natureza',
    category: 'Lifestyle',
    colors: {
      primary: '#22C55E',
      primaryLight: '#DCFCE7',
      primaryDark: '#15803D',
      accent: '#FBBF24',
      background: '#F7FEE7',
      surface: '#FFFFFF',
      text: '#14532D',
      textMuted: '#65A30D',
    },
    emoji: '🌿',
  },
];

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'beeplanner_theme';

function applyThemeCSSVars(theme: Theme) {
  document.documentElement.style.setProperty('--color-primary', theme.colors.primary);
  document.documentElement.style.setProperty('--color-primary-light', theme.colors.primaryLight);
  document.documentElement.style.setProperty('--color-primary-dark', theme.colors.primaryDark);
  document.documentElement.style.setProperty('--color-accent', theme.colors.accent);
  document.documentElement.style.setProperty('--background', theme.colors.background);
  document.documentElement.style.setProperty('--color-surface', theme.colors.surface);
  document.documentElement.style.setProperty('--foreground', theme.colors.text);
  document.documentElement.style.setProperty('--color-text-muted', theme.colors.textMuted);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Recupera o tema salvo no localStorage, ou usa o padrão
  const savedId = localStorage.getItem(STORAGE_KEY);
  const initial = themes.find(t => t.id === savedId) ?? themes[0];

  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    applyThemeCSSVars(initial);
    return initial;
  });

  const setTheme = (themeId: string) => {
    const theme = themes.find((t) => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      localStorage.setItem(STORAGE_KEY, themeId); // persiste a escolha
      applyThemeCSSVars(theme);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
