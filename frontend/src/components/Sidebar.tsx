import {
  Home,
  CalendarDays,
  Zap,
  MapPin,
  BookOpen,
  GraduationCap,
  StickyNote,
  Settings,
  BarChart3,
  Award,
  DollarSign,
  Heart,
  Target,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useSettings } from "../contexts/SettingsContext";

interface SidebarProps {
  onLogout: () => void;
}

// Chave de visibilidade por rota (null = sempre visível)
const navItems: { path: string; icon: React.ElementType; label: string; visKey: string | null }[] = [
  { path: "/inicio",        icon: Home,         label: "Home",              visKey: "home" },
  { path: "/dashboard",     icon: BarChart3,     label: "Dashboard",         visKey: "dashboard" },
  { path: "/semana",        icon: CalendarDays,  label: "Semana",            visKey: "week" },
  { path: "/habitos",       icon: Zap,           label: "Hábitos",           visKey: "habits" },
  { path: "/datas",         icon: MapPin,        label: "Datas Importantes", visKey: "dates" },
  { path: "/notas",         icon: StickyNote,    label: "Notas",             visKey: "notes" },
  { path: "/livros",        icon: BookOpen,      label: "Livros Lidos",      visKey: "books" },
  { path: "/cursos",        icon: Award,         label: "Cursos",            visKey: "courses" },
  { path: "/universitario", icon: GraduationCap, label: "Universitário",     visKey: "university" },
  { path: "/financas",      icon: DollarSign,    label: "Finanças",          visKey: "finance" },
  { path: "/saude",         icon: Heart,         label: "Saúde",             visKey: "health" },
  { path: "/metas",         icon: Target,        label: "Metas",             visKey: "goals" },
  { path: "/perfil",        icon: User,          label: "Meu Perfil",        visKey: null },
  { path: "/configuracoes", icon: Settings,      label: "Configurações",     visKey: null },
];

export function Sidebar({ onLogout }: SidebarProps) {
  const { currentTheme } = useTheme();
  const { settings } = useSettings();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className="h-screen flex flex-col overflow-y-auto transition-all duration-300 relative flex-shrink-0"
      style={{
        width: collapsed ? "72px" : "240px",
        background: currentTheme.colors.surface,
        borderRight: `1px solid ${currentTheme.colors.primary}20`,
      }}
    >
      {/* Logo — altura fixa para alinhar com o border-bottom do PageLayout header (88px) */}
      <div
        className="border-b flex-shrink-0"
        style={{ borderColor: `${currentTheme.colors.primary}20`, height: 88 }}
      >
        {collapsed ? (
          <div className="h-full flex flex-col items-center justify-center gap-2">
            <span className="text-[26px] leading-none">🐝</span>
            <button
              onClick={() => setCollapsed(false)}
              className="p-1.5 rounded-lg transition-all hover:opacity-70"
              style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}
              title="Expandir menu"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="h-full flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <span className="text-[26px] leading-none">🐝</span>
              <h1
                className="font-display text-xl font-bold whitespace-nowrap"
                style={{ color: currentTheme.colors.text }}
              >
                BeePlanner
              </h1>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-lg transition-all hover:opacity-70 flex-shrink-0"
              style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}
              title="Recolher menu"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.filter(item =>
          item.visKey === null ||
          settings.menuVisibility[item.visKey as keyof typeof settings.menuVisibility] !== false
        ).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:opacity-80 w-full"
              style={({ isActive }) => ({
                background: isActive ? currentTheme.colors.primaryLight : "transparent",
                color: isActive ? currentTheme.colors.primaryDark : currentTheme.colors.text,
                fontWeight: isActive ? 600 : 400,
                justifyContent: collapsed ? "center" : "flex-start",
              })}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div
        className="p-3 border-t"
        style={{ borderColor: `${currentTheme.colors.primary}20` }}
      >
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:opacity-80 w-full"
          style={{
            color: "#EF4444",
            background: "transparent",
            justifyContent: collapsed ? "center" : "flex-start",
          }}
          title={collapsed ? "Sair" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Sair</span>}
        </button>
      </div>
    </div>
  );
}
