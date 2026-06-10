import { useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import {
  BarChart3, CalendarDays, Zap, MapPin, BookOpen,
  GraduationCap, StickyNote, Award, DollarSign,
  Heart, Target, User, Settings, type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

interface RouteInfo {
  label: string;
  Icon: LucideIcon;
}

const ROUTE_MAP: Record<string, RouteInfo> = {
  "/dashboard":     { label: "Dashboard",          Icon: BarChart3 },
  "/semana":        { label: "Semana",              Icon: CalendarDays },
  "/habitos":       { label: "Hábitos",             Icon: Zap },
  "/datas":         { label: "Datas Importantes",   Icon: MapPin },
  "/notas":         { label: "Notas",               Icon: StickyNote },
  "/livros":        { label: "Livros Lidos",        Icon: BookOpen },
  "/cursos":        { label: "Cursos",              Icon: Award },
  "/universitario": { label: "Universitário",       Icon: GraduationCap },
  "/financas":      { label: "Finanças",            Icon: DollarSign },
  "/saude":         { label: "Saúde & Bem-estar",   Icon: Heart },
  "/metas":         { label: "Metas & Objetivos",   Icon: Target },
  "/perfil":        { label: "Meu Perfil",          Icon: User },
  "/configuracoes": { label: "Configurações",       Icon: Settings },
};

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  const { currentTheme } = useTheme();
  const { pathname } = useLocation();

  const route = ROUTE_MAP[pathname];

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden"
      style={{ background: currentTheme.colors.background }}
    >
      {/* Header minimalista — só aparece nas rotas mapeadas */}
      {route && (
        <header
          style={{
            padding: "28px 40px 0",
            borderBottom: `1px solid ${currentTheme.colors.primary}12`,
            paddingBottom: 20,
          }}
        >
          <div className="flex items-center gap-3">
            {/* Ícone em pill */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: currentTheme.colors.primaryLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <route.Icon
                style={{ width: 20, height: 20, color: currentTheme.colors.primary }}
              />
            </div>

            {/* Título */}
            <h1
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: currentTheme.colors.text,
                letterSpacing: "-0.5px",
                lineHeight: 1,
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              {route.label}
            </h1>
          </div>
        </header>
      )}

      {/* Conteúdo da página */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
