import {
  Home, CalendarDays, Zap, MapPin, BookOpen, GraduationCap,
  StickyNote, Settings, BarChart3, Award, DollarSign, Heart,
  Target, User, LogOut, ChevronLeft, ChevronRight, ChevronDown, Clapperboard, Dumbbell,
} from "lucide-react"
import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { useTheme } from "../contexts/ThemeContext"
import { useAuth } from "../contexts/AuthContext"
import { useSettings } from "../contexts/SettingsContext"

interface SidebarProps {
  onLogout: () => void
}

type NavItem = {
  path: string
  icon: React.ElementType
  label: string
  visKey: string | null
  groupOnly?: boolean
  children?: NavItem[]
}

type NavSection = {
  items: NavItem[]
}

const sections: NavSection[] = [
  {
    items: [
      { path: "/inicio",    icon: Home,      label: "Home",      visKey: "home" },
      { path: "/dashboard", icon: BarChart3,  label: "Dashboard", visKey: "dashboard" },
    ],
  },
  {
    items: [
      {
        path: "/habitos", icon: Zap, label: "Hábitos", visKey: "habits",
        children: [
          { path: "/saude",   icon: Heart,        label: "Saúde",           visKey: "health" },
          { path: "/fitness", icon: Dumbbell,     label: "Fitness",         visKey: null     },
          { path: "/livros",  icon: BookOpen,      label: "Livros",          visKey: "books"  },
          { path: "/series",  icon: Clapperboard,  label: "Séries & Filmes", visKey: null     },
        ],
      },
      { path: "/metas", icon: Target, label: "Metas", visKey: "goals" },
      {
        path: "/estudos", icon: GraduationCap, label: "Estudos", visKey: null, groupOnly: true,
        children: [
          { path: "/notas",         icon: StickyNote,    label: "Notas",         visKey: "notes"      },
          { path: "/cursos",        icon: Award,         label: "Cursos",        visKey: "courses"    },
          { path: "/universitario", icon: GraduationCap, label: "Universitário", visKey: "university" },
        ],
      },
      {
        path: "/agenda", icon: CalendarDays, label: "Agenda", visKey: null, groupOnly: true,
        children: [
          { path: "/semana", icon: CalendarDays, label: "Semana",            visKey: "week"  },
          { path: "/datas",  icon: MapPin,       label: "Datas Importantes", visKey: "dates" },
        ],
      },
      {
        path: "/financeiro", icon: DollarSign, label: "Financeiro", visKey: null, groupOnly: true,
        children: [
          { path: "/financas", icon: DollarSign, label: "Finanças", visKey: "finance" },
        ],
      },
    ],
  },
]

export function Sidebar({ onLogout }: SidebarProps) {
  const { currentTheme } = useTheme()
  const { user }         = useAuth()
  const { settings }     = useSettings()
  const location         = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [expanded, setExpanded]   = useState<Set<string>>(new Set(["/habitos"]))

  const c = currentTheme.colors

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
    item.children?.some(ch => location.pathname.startsWith(ch.path)) ?? false

  const firstName =
    user?.user_metadata?.name?.split(" ")[0] ||
    user?.email?.split("@")[0] || "Usuária"

  const avatarUrl = user ? localStorage.getItem(`beeplanner_avatar_url_${user.id}`) : null

  const renderItem = (item: NavItem, depth = 0) => {
    if (!isVisible(item.visKey)) return null
    const Icon        = item.icon
    const hasChildren = !!item.children?.length
    const isOpen      = expanded.has(item.path)
    const childActive = hasActiveChild(item)

    const renderIcon = (active: boolean, d: number) => (
      <span
        className="flex items-center justify-center rounded-xl flex-shrink-0 transition-all duration-200"
        style={{
          width:  d > 0 ? 22 : 30,
          height: d > 0 ? 22 : 30,
          background: active ? c.primary : `${c.primary}12`,
          color:      active ? "#fff" : c.primary,
        }}
      >
        <Icon style={{ width: d > 0 ? 12 : 15, height: d > 0 ? 12 : 15 }} />
      </span>
    )

    const renderLabel = (d: number) => (
      (!collapsed || d > 0) ? (
        <span className="whitespace-nowrap flex-1 transition-colors duration-150" style={{ fontSize: d > 0 ? 12.5 : 13.5 }}>
          {item.label}
        </span>
      ) : null
    )

    const chevronBtn = hasChildren && !collapsed && (
      <button
        onClick={() => toggle(item.path)}
        className="p-1 rounded-lg transition-all hover:opacity-60 flex-shrink-0"
        style={{ color: c.textMuted }}
      >
        <ChevronDown style={{
          width: 14, height: 14,
          transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
          transition: "transform 0.25s ease",
        }} />
      </button>
    )

    return (
      <div key={item.path}>
        <div className="flex items-center gap-0.5">
          {item.groupOnly ? (
            <button
              onClick={() => toggle(item.path)}
              title={collapsed ? item.label : undefined}
              className="flex-1 flex items-center gap-2.5 rounded-xl transition-all duration-200 text-left group"
              style={{
                padding: "8px 10px",
                background: childActive ? `${c.primary}12` : "transparent",
                color:      childActive ? c.primary : c.text,
                fontWeight: childActive ? 600 : 400,
                justifyContent: collapsed ? "center" : "flex-start",
              }}
            >
              {renderIcon(childActive, 0)}
              {renderLabel(0)}
            </button>
          ) : (
            <NavLink
              to={item.path}
              title={collapsed ? item.label : undefined}
              end={!hasChildren}
              className="flex-1 flex items-center gap-2.5 rounded-xl transition-all duration-200 group relative"
              style={({ isActive }) => {
                const active = isActive || (hasChildren && childActive)
                return {
                  padding: depth > 0 ? "6px 10px 6px 20px" : "8px 10px",
                  background: active ? `${c.primary}12` : "transparent",
                  color:      active ? c.primary : c.text,
                  fontWeight: active ? 600 : 400,
                  justifyContent: collapsed && depth === 0 ? "center" : "flex-start",
                }
              }}
            >
              {({ isActive }) => {
                const active = isActive || (hasChildren && childActive)
                return (
                  <>
                    {active && depth === 0 && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-full"
                        style={{ height: 20, background: c.primary }} />
                    )}
                    {renderIcon(active, depth)}
                    {renderLabel(depth)}
                  </>
                )
              }}
            </NavLink>
          )}
          {chevronBtn}
        </div>

        {hasChildren && !collapsed && isOpen && (
          <div className="relative ml-5 mt-1 mb-1.5">
            <div
              className="absolute left-[7px] top-0 bottom-0 w-px"
              style={{ background: `${c.primary}18` }}
            />
            <div className="space-y-0.5">
              {item.children!.filter(ch => isVisible(ch.visKey)).map(ch => renderItem(ch, 1))}
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
        width:       collapsed ? "72px" : "240px",
        background:  c.surface,
        borderRight: `1px solid ${c.primary}10`,
      }}
    >
      {/* ── Logo ── */}
      <div className="flex-shrink-0" style={{ borderBottom: `1px solid ${c.primary}10` }}>
        {collapsed ? (
          <div className="flex flex-col items-center justify-center gap-2" style={{ height: 73 }}>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: c.primaryLight }}>
              <span className="text-xl leading-none">🐝</span>
            </div>
            <button
              onClick={() => setCollapsed(false)}
              className="p-1.5 rounded-xl transition-all hover:opacity-70"
              style={{ background: c.primaryLight, color: c.primaryDark }}
              title="Expandir menu"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-4" style={{ height: 73 }}>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: c.primaryLight }}>
                <span className="text-xl leading-none">🐝</span>
              </div>
              <div>
                <h1 className="text-[15px] font-bold whitespace-nowrap leading-tight" style={{ color: c.text }}>
                  BeePlanner
                </h1>
                <p className="text-[10px] leading-tight mt-0.5" style={{ color: c.textMuted }}>
                  Organize sua vida
                </p>
              </div>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-xl transition-all hover:opacity-70 flex-shrink-0"
              style={{ background: c.primaryLight, color: c.primaryDark }}
              title="Recolher menu"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 min-h-0" style={{ scrollbarWidth: 'thin' }}>
        <div className="space-y-1">
          {sections.map((section, si) => {
            const visible = section.items.filter(item => isVisible(item.visKey))
            if (visible.length === 0) return null
            return (
              <div key={si}>
                {si > 0 && (
                  <div className="my-2.5 mx-3"
                    style={{ height: 1, background: `${c.primary}10` }} />
                )}
                <div className="space-y-0.5">
                  {visible.map(item => renderItem(item))}
                </div>
              </div>
            )
          })}
        </div>
      </nav>

      {/* ── Rodapé: perfil + config + sair ── */}
      <div
        className="flex-shrink-0 px-2.5 py-3"
        style={{ borderTop: `1px solid ${c.primary}10` }}
      >
        {/* Mini card do usuário */}
        {!collapsed && (
          <NavLink
            to="/perfil"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-2 transition-all duration-200"
            style={({ isActive }) => ({
              background: isActive ? `${c.primary}12` : c.primaryLight,
            })}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                style={{ background: c.primary, color: "#fff" }}>
                {firstName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[13px] font-semibold truncate leading-tight" style={{ color: c.text }}>
                {firstName}
              </p>
              <p className="text-[10px] truncate leading-tight mt-0.5" style={{ color: c.textMuted }}>
                Ver perfil
              </p>
            </div>
          </NavLink>
        )}

        <div className="space-y-0.5">
          {collapsed && (
            <NavLink
              to="/perfil"
              title="Meu Perfil"
              className="flex items-center justify-center px-2 py-1.5 rounded-xl transition-all duration-150 w-full"
              style={({ isActive }) => ({
                background: isActive ? `${c.primary}12` : "transparent",
              })}
            >
              {({ isActive }) => (
                <span className="flex items-center justify-center rounded-xl flex-shrink-0"
                  style={{
                    width: 30, height: 30,
                    background: isActive ? c.primary : `${c.primary}12`,
                    color: isActive ? "#fff" : c.primary,
                  }}>
                  <User style={{ width: 15, height: 15 }} />
                </span>
              )}
            </NavLink>
          )}

          <NavLink
            to="/configuracoes"
            title={collapsed ? "Configurações" : undefined}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-all duration-150 w-full"
            style={({ isActive }) => ({
              background: isActive ? `${c.primary}12` : "transparent",
              color:      isActive ? c.primary : c.text,
              fontWeight: isActive ? 600 : 400,
              justifyContent: collapsed ? "center" : "flex-start",
            })}
          >
            {({ isActive }) => (
              <>
                <span className="flex items-center justify-center rounded-xl flex-shrink-0"
                  style={{
                    width: 30, height: 30,
                    background: isActive ? c.primary : `${c.primary}12`,
                    color: isActive ? "#fff" : c.primary,
                  }}>
                  <Settings style={{ width: 15, height: 15 }} />
                </span>
                {!collapsed && <span className="text-[13.5px] whitespace-nowrap">Configurações</span>}
              </>
            )}
          </NavLink>

          <button
            onClick={onLogout}
            title={collapsed ? "Sair" : undefined}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-all duration-150 hover:opacity-80 w-full"
            style={{ justifyContent: collapsed ? "center" : "flex-start" }}
          >
            <span className="flex items-center justify-center rounded-xl flex-shrink-0"
              style={{ width: 30, height: 30, background: "#FFF1F2", color: "#D49898" }}>
              <LogOut style={{ width: 15, height: 15 }} />
            </span>
            {!collapsed && <span className="text-[13.5px] font-medium" style={{ color: "#D49898" }}>Sair</span>}
          </button>
        </div>
      </div>
    </div>
  )
}
