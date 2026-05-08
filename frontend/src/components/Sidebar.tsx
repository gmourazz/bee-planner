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

interface SidebarProps {
  onLogout: () => void;
}

const navItems = [
  { path: "/inicio", icon: Home, label: "Home" },
  { path: "/analytics", icon: BarChart3, label: "Dashboard" },
  { path: "/semana", icon: CalendarDays, label: "Semana" },
  { path: "/habitos", icon: Zap, label: "Hábitos" },
  { path: "/datas", icon: MapPin, label: "Datas Importantes" },
  { path: "/notas", icon: StickyNote, label: "Notas" },
  { path: "/livros", icon: BookOpen, label: "Livros Lidos" },
  { path: "/cursos", icon: Award, label: "Cursos" },
  { path: "/universitario", icon: GraduationCap, label: "Universitário" },
  { path: "/financas", icon: DollarSign, label: "Finanças" },
  { path: "/saude", icon: Heart, label: "Saúde" },
  { path: "/metas", icon: Target, label: "Metas" },
  { path: "/perfil", icon: User, label: "Meu Perfil" },
  { path: "/configuracoes", icon: Settings, label: "Configurações" },
];

export function Sidebar({ onLogout }: SidebarProps) {
  const { currentTheme } = useTheme();
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
      {/* Logo */}
      <div
        className="p-4 border-b flex items-center justify-between"
        style={{ borderColor: `${currentTheme.colors.primary}20` }}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-[26px] flex-shrink-0">🐝</span>
          {!collapsed && (
            <h1
              className="font-display text-xl font-bold whitespace-nowrap"
              style={{ color: currentTheme.colors.primaryDark }}
            >
              BeePlanner
            </h1>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg transition-all hover:opacity-70 flex-shrink-0"
          style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
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
              {!collapsed && <span className="text-sm whitespace-nowrap">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div
        className="p-3 border-t"
        style={{ borderColor: `${currentTheme.colors.primary}20` }}
      >
        <NavLink
          to="/perfil"
          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:opacity-80 transition-all mb-1"
          style={({ isActive }) => ({
            background: isActive ? currentTheme.colors.primaryLight : "transparent",
            justifyContent: collapsed ? "center" : "flex-start",
          })}
          title={collapsed ? "Meu Perfil" : undefined}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: currentTheme.colors.primaryLight }}
          >
            <User className="w-4 h-4" style={{ color: currentTheme.colors.primaryDark }} />
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate" style={{ color: currentTheme.colors.text }}>
                Demo User
              </p>
              <p className="text-xs truncate" style={{ color: currentTheme.colors.textMuted }}>
                demo@gmail.com
              </p>
            </div>
          )}
        </NavLink>

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
