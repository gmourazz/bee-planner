import { useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { usePageHeader } from "../contexts/PageHeaderContext";
import {
  Home, BarChart3, CalendarDays, Zap, MapPin, BookOpen,
  GraduationCap, StickyNote, Award, DollarSign,
  Heart, Target, User, Settings, Clapperboard, Dumbbell, type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

interface RouteInfo {
  label: string;
  subtitle?: string;
  Icon: LucideIcon;
}

const ROUTE_MAP: Record<string, RouteInfo> = {
  "/inicio":        { label: "Home",               subtitle: "Seu resumo diário",           Icon: Home },
  "/dashboard":     { label: "Dashboard",          subtitle: "Visão geral do seu progresso", Icon: BarChart3 },
  "/semana":        { label: "Semana",              subtitle: "Planejamento semanal",        Icon: CalendarDays },
  "/habitos":       { label: "Hábitos",             subtitle: "Acompanhe sua rotina",        Icon: Zap },
  "/datas":         { label: "Datas Importantes",   subtitle: "Eventos e compromissos",      Icon: MapPin },
  "/notas":         { label: "Notas",               subtitle: "Suas anotações",              Icon: StickyNote },
  "/livros":        { label: "Livros",              subtitle: "Leituras e progresso",        Icon: BookOpen },
  "/series":        { label: "Séries & Filmes",     subtitle: "Entretenimento",              Icon: Clapperboard },
  "/cursos":        { label: "Cursos",              subtitle: "Aprendizado contínuo",        Icon: Award },
  "/universitario": { label: "Universitário",       subtitle: "Matérias, provas e grade",    Icon: GraduationCap },
  "/financas":      { label: "Finanças",            subtitle: "Receitas, despesas e saldo",  Icon: DollarSign },
  "/saude":         { label: "Saúde & Bem-estar",   subtitle: "Água, sono e humor",          Icon: Heart },
  "/fitness":       { label: "Fitness",             subtitle: "Treinos, corpo e dieta",      Icon: Dumbbell },
  "/metas":         { label: "Metas & Objetivos",   subtitle: "Progresso das suas metas",   Icon: Target },
  "/perfil":        { label: "Meu Perfil",          subtitle: "Informações pessoais",        Icon: User },
  "/configuracoes": { label: "Configurações",       subtitle: "Preferências do app",         Icon: Settings },
};

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  const { currentTheme } = useTheme();
  const { pathname } = useLocation();
  const { headerRight } = usePageHeader();
  const c = currentTheme.colors;

  const route = ROUTE_MAP[pathname];

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: c.background }}>

      {route && (
        <header
          className="flex-shrink-0 flex items-center px-5 lg:px-8"
          style={{ background: c.surface, borderBottom: `1px solid ${c.primary}10`, height: 73 }}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
              style={{ background: c.primary }}
            >
              <route.Icon className="w-5 h-5 text-white" />
            </div>

            <div className="flex items-baseline gap-2.5 min-w-0">
              <h1
                className="text-base font-bold tracking-tight leading-tight truncate"
                style={{ color: c.text }}
              >
                {route.label}
              </h1>
              {route.subtitle && (
                <>
                  <span className="hidden lg:inline text-sm" style={{ color: `${c.textMuted}50` }}>|</span>
                  <p className="hidden lg:block text-[13px] truncate" style={{ color: c.textMuted }}>
                    {route.subtitle}
                  </p>
                </>
              )}
            </div>
          </div>

          {headerRight && (
            <div className="flex-shrink-0 flex items-center gap-2">
              {headerRight}
            </div>
          )}
        </header>
      )}

      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
