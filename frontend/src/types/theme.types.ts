// Tipo da interface de tema — extraído de ThemeContext.tsx

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
