import { createContext, useContext, useState, ReactNode } from 'react';

export interface Theme {
  id: string;
  name: string;
  category: string;
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
  };
  emoji: string;
  backgroundPattern?: string;
}

export const themes: Theme[] = [
  {
    id: 'bee',
    name: 'Abelha',
    category: 'Padrão',
    colors: {
      primary: '#F472B6',
      primaryLight: '#FDE8F3',
      primaryDark: '#BE185D',
      accent: '#FCD34D',
      background: '#FFF9FB',
      surface: '#FFFFFF',
      text: '#3B1A2E',
      textMuted: '#9D4E78',
    },
    emoji: '🐝',
  },
  {
    id: 'tech',
    name: 'TI & Tecnologia',
    category: 'Profissão',
    colors: {
      primary: '#3B82F6',
      primaryLight: '#DBEAFE',
      primaryDark: '#1E40AF',
      accent: '#10B981',
      background: '#0F172A',
      surface: '#1E293B',
      text: '#F1F5F9',
      textMuted: '#94A3B8',
    },
    emoji: '💻',
    backgroundPattern: 'tech',
  },
  {
    id: 'veterinary',
    name: 'Veterinário',
    category: 'Profissão',
    colors: {
      primary: '#10B981',
      primaryLight: '#D1FAE5',
      primaryDark: '#047857',
      accent: '#F59E0B',
      background: '#FEFCE8',
      surface: '#FFFFFF',
      text: '#365314',
      textMuted: '#78716C',
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

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);

  const setTheme = (themeId: string) => {
    const theme = themes.find((t) => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);

      // Update CSS variables
      document.documentElement.style.setProperty('--color-primary', theme.colors.primary);
      document.documentElement.style.setProperty('--color-primary-light', theme.colors.primaryLight);
      document.documentElement.style.setProperty('--color-primary-dark', theme.colors.primaryDark);
      document.documentElement.style.setProperty('--color-accent', theme.colors.accent);
      document.documentElement.style.setProperty('--background', theme.colors.background);
      document.documentElement.style.setProperty('--color-surface', theme.colors.surface);
      document.documentElement.style.setProperty('--foreground', theme.colors.text);
      document.documentElement.style.setProperty('--color-text-muted', theme.colors.textMuted);
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
