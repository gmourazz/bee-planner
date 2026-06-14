import {
  Home, CalendarDays, Zap, MapPin, BookOpen, GraduationCap,
  StickyNote, Settings, BarChart3, Award, DollarSign, Heart,
  Target, User, LogOut, ChevronLeft, ChevronRight, ChevronDown, Clapperboard, Moon, Sun,
} from "lucide-react"
import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { useTheme } from "../contexts/ThemeContext"
import { useSettings } from "../contexts/SettingsContext"

interface SidebarProps {
  onLogout: () => void
}

type NavItem = {
  path: string
  icon: React.ElementType
  label: string
  visKey: string | null
  children?: NavItem[]
}

type NavSection = {
  label?: string
  items: NavItem[]
}

const sections: NavSection[] = [
  {
    items: [
      { path: "/inicio",    icon: Home,     label: "Home",      visKey: "home" },
      { path: "/dashboard", icon: BarChart3, label: "Dashboard", visKey: "dashboard" },
    ],
  },
  {
    label: "PESSOAL",
    items: [
      {
        path: "/habitos", icon: Zap, label: "Hábitos", visKey: "habits",
        children: [
          { path: "/saude",  icon: Heart,    label: "Saúde",           visKey: "health" },
          { path: "/livros", icon: BookOpen, label: "Livros",          visKey: "books"  },
          { path: "/series", icon: Clapperboard, label: "Séries & Filmes", visKey: null },
        ],
      },
      { path: "/metas", icon: Target, label: "Metas", visKey: "goals" },
    ],
  },
  {
    label: "APRENDER",
    items: [
      { path: "/notas",         icon: StickyNote,    label: "Notas",         visKey: "notes"      },
      { path: "/cursos",        icon: Award,         label: "Cursos",        visKey: "courses"    },
      { path: "/universitario", icon: GraduationCap, label: "Universitário", visKey: "university" },
    ],
  },
  {
    label: "AGENDA",
    items: [
      { path: "/semana", icon: CalendarDays, label: "Semana",            visKey: "week"  },
      { path: "/datas",  icon: MapPin,       label: "Datas Importantes", visKey: "dates" },
    ],
  },
  {
    label: "FINANCEIRO",
    items: [
      { path: "/financas", icon: DollarSign, label: "Finanças", visKey: "finance" },
    ],
  },
]

const bottomItems: NavItem[] = [
  { path: "/perfil",        icon: User,     label: "Meu Perfil",    visKey: null },
  { path: "/configuracoes", icon: Settings, label: "Configurações", visKey: null },
]

export function Sidebar({ onLogout }: SidebarProps) {
  const { currentTheme, darkMode, toggleDarkMode } = useTheme()
  const { settings }     = useSettings()
  const location         = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [expanded, setExpanded]   = useState<Set<string>>(new Set(["/habitos"]))

  const isVisible = (visKey: string | null) =>
    visKey === null ||
    settings.menuVisibility[visKey as keyof typeof settings.menuVisibility] !== false

  const toggle = (path: string) =>
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(path) ? next.delete(path) : next.add(path)
      return next
    })

  const hasActiveChild = (item: NavItem) =>
    item.children?.some(c => location.pathname.startsWith(c.path)) ?? false

  const renderItem = (item: NavItem, depth = 0) => {
    if (!isVisible(item.visKey)) return null
    const Icon        = item.icon
    const hasChildren = !!item.children?.length
    const isOpen      = expanded.has(item.path)
    const childActive = hasActiveChild(item)

    return (
      <div key={item.path}>
        <div className="flex items-center gap-1">
          <NavLink
            to={item.path}
            title={collapsed ? item.label : undefined}
            end={!hasChildren}
            className="flex-1 flex items-center gap-2.5 rounded-xl transition-all duration-150"
            style={({ isActive }) => {
              const active = isActive || (hasChildren && childActive)
              return {
                padding: depth > 0 ? "5px 8px 5px 24px" : "7px 8px",
                background: active ? `${currentTheme.colors.primary}18` : "transparent",
                color:      active ? currentTheme.colors.primary : currentTheme.colors.text,
                fontWeight: active ? 600 : 400,
                justifyContent: collapsed && depth === 0 ? "center" : "flex-start",
              }
            }}
          >
            {({ isActive }) => {
              const active = isActive || (hasChildren && childActive)
              return (
                <>
                  <span
                    className="flex items-center justify-center rounded-lg flex-shrink-0 transition-all"
                    style={{
                      width:      depth > 0 ? 20 : 26,
                      height:     depth > 0 ? 20 : 26,
                      background: active ? currentTheme.colors.primary : `${currentTheme.colors.primary}18`,
                      color:      active ? "#fff" : currentTheme.colors.primary,
                    }}
                  >
                    <Icon style={{ width: depth > 0 ? 11 : 14, height: depth > 0 ? 11 : 14 }} />
                  </span>
                  {(!collapsed || depth > 0) && (
                    <span className="whitespace-nowrap flex-1" style={{ fontSize: depth > 0 ? 12 : 13 }}>
                      {item.label}
                    </span>
                  )}
                </>
              )
            }}
          </NavLink>

          {hasChildren && !collapsed && (
            <button
              onClick={() => toggle(item.path)}
              className="p-1 rounded-lg transition-all hover:opacity-60 flex-shrink-0"
              style={{ color: currentTheme.colors.textMuted }}
            >
              <ChevronDown
                style={{
                  width: 13, height: 13,
                  transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
                  transition: "transform 0.2s",
                }}
              />
            </button>
          )}
        </div>

        {hasChildren && !collapsed && isOpen && (
          <div className="relative ml-3 mt-0.5 mb-1">
            <div
              className="absolute left-3.5 top-0 bottom-0 w-px"
              style={{ background: `${currentTheme.colors.primary}22` }}
            />
            <div className="space-y-0.5">
              {item.children!.filter(c => isVisible(c.visKey)).map(c => renderItem(c, 1))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className="h-screen flex flex-col transition-all duration-300 flex-shrink-0"
      style={{
        width:       collapsed ? "72px" : "224px",
        background:  currentTheme.colors.surface,
        borderRight: `1px solid ${currentTheme.colors.primary}18`,
      }}
    >
      {/* ── Logo ── */}
      <div
        className="border-b flex-shrink-0"
        style={{ borderColor: `${currentTheme.colors.primary}18`, height: 88 }}
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
              <h1 className="font-display text-xl font-bold whitespace-nowrap" style={{ color: currentTheme.colors.text }}>
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

      {/* ── Nav (scrollável) ── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 min-h-0" style={{ scrollbarWidth: 'thin' }}>
        <div className="space-y-4">
          {sections.map((section, si) => {
            const visible = section.items.filter(item => isVisible(item.visKey))
            if (visible.length === 0) return null
            return (
              <div key={si}>
                {section.label && !collapsed && (
                  <p
                    className="px-2 mb-1 font-bold uppercase tracking-widest select-none"
                    style={{ fontSize: 9, color: currentTheme.colors.textMuted, opacity: 0.55 }}
                  >
                    {section.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {visible.map(item => renderItem(item))}
                </div>
              </div>
            )
          })}
        </div>
      </nav>

      {/* ── Rodapé fixo: Perfil + Config + Sair ── */}
      <div
        className="flex-shrink-0 border-t py-2 px-2"
        style={{ borderColor: `${currentTheme.colors.primary}18` }}
      >
        <div className="space-y-0.5">
          {bottomItems.map(item => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-all duration-150 w-full"
                style={({ isActive }) => ({
                  background:    isActive ? `${currentTheme.colors.primary}18` : "transparent",
                  color:         isActive ? currentTheme.colors.primary : currentTheme.colors.text,
                  fontWeight:    isActive ? 600 : 400,
                  justifyContent: collapsed ? "center" : "flex-start",
                })}
              >
                {({ isActive }) => (
                  <>
                    <span
                      className="flex items-center justify-center rounded-lg flex-shrink-0"
                      style={{
                        width: 26, height: 26,
                        background: isActive ? currentTheme.colors.primary : `${currentTheme.colors.primary}18`,
                        color:      isActive ? "#fff" : currentTheme.colors.primary,
                      }}
                    >
                      <Icon style={{ width: 14, height: 14 }} />
                    </span>
                    {!collapsed && <span className="text-sm whitespace-nowrap">{item.label}</span>}
                  </>
                )}
              </NavLink>
            )
          })}

          {/* Toggle modo escuro */}
          <button
            onClick={toggleDarkMode}
            title={darkMode ? "Modo claro" : "Modo escuro"}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-all duration-150 hover:opacity-80 w-full"
            style={{ justifyContent: collapsed ? "center" : "flex-start" }}
          >
            <span
              className="flex items-center justify-center rounded-lg flex-shrink-0"
              style={{
                width: 26, height: 26,
                background: darkMode ? `${currentTheme.colors.primary}22` : `${currentTheme.colors.primary}18`,
                color: currentTheme.colors.primary,
              }}
            >
              {darkMode
                ? <Sun style={{ width: 14, height: 14 }} />
                : <Moon style={{ width: 14, height: 14 }} />
              }
            </span>
            {!collapsed && (
              <span className="text-sm whitespace-nowrap" style={{ color: currentTheme.colors.text }}>
                {darkMode ? "Modo claro" : "Modo escuro"}
              </span>
            )}
          </button>

          <button
            onClick={onLogout}
            title={collapsed ? "Sair" : undefined}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-all duration-150 hover:opacity-80 w-full mt-1"
            style={{ justifyContent: collapsed ? "center" : "flex-start" }}
          >
            <span
              className="flex items-center justify-center rounded-lg flex-shrink-0"
              style={{ width: 26, height: 26, background: "#fee2e2", color: "#ef4444" }}
            >
              <LogOut style={{ width: 14, height: 14 }} />
            </span>
            {!collapsed && <span className="text-sm font-medium" style={{ color: "#ef4444" }}>Sair</span>}
          </button>
        </div>
      </div>
    </div>
  )
}
