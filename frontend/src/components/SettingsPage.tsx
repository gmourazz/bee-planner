import {
  Settings as SettingsIcon,
  Eye,
  EyeOff,
  Bell,
  Lock,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

interface MenuVisibility {
  home: boolean;
  dashboard: boolean;
  week: boolean;
  habits: boolean;
  dates: boolean;
  notes: boolean;
  books: boolean;
  courses: boolean;
  university: boolean;
  finance: boolean;
  health: boolean;
  goals: boolean;
}

export function SettingsPage() {
  const { currentTheme } = useTheme();
  const [menuVisibility, setMenuVisibility] = useState<MenuVisibility>({
    home: true, dashboard: true, week: true, habits: true, dates: true,
    notes: true, books: true, courses: true, university: true,
    finance: false, health: false, goals: false,
  });

  const [notifications, setNotifications] = useState({
    tasks: true, habits: true, exams: true, birthdays: true, certificates: true,
  });

  const toggleMenu = (key: keyof MenuVisibility) => {
    setMenuVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleNotification = (key: string) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const menuItems = [
    { key: "home" as keyof MenuVisibility, label: "Home", icon: "🏠", required: true },
    { key: "dashboard" as keyof MenuVisibility, label: "Dashboard", icon: "📊" },
    { key: "week" as keyof MenuVisibility, label: "Semana", icon: "📅" },
    { key: "habits" as keyof MenuVisibility, label: "Hábitos", icon: "⚡" },
    { key: "dates" as keyof MenuVisibility, label: "Datas Importantes", icon: "📌" },
    { key: "notes" as keyof MenuVisibility, label: "Notas", icon: "📝" },
    { key: "books" as keyof MenuVisibility, label: "Livros Lidos", icon: "📚" },
    { key: "courses" as keyof MenuVisibility, label: "Cursos", icon: "🎓" },
    { key: "university" as keyof MenuVisibility, label: "Universitário", icon: "🎓" },
    { key: "finance" as keyof MenuVisibility, label: "Finanças", icon: "💰" },
    { key: "health" as keyof MenuVisibility, label: "Saúde & Bem-estar", icon: "💪" },
    { key: "goals" as keyof MenuVisibility, label: "Metas & Objetivos", icon: "🎯" },
  ];

  return (
    <div className="flex-1 overflow-auto p-6" style={{ background: currentTheme.colors.background }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="w-10 h-10" style={{ color: currentTheme.colors.primary }} />
          <h1
            className="font-display text-[40px] font-bold"
            style={{ color: currentTheme.colors.text }}
          >
            Configurações
          </h1>
        </div>

        {/* Menu Visibility Settings */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}
        >
          <h2
            className="font-display mb-4 text-2xl font-semibold"
            style={{ color: currentTheme.colors.text }}
          >
            Visibilidade do Menu
          </h2>
          <p className="mb-6 text-sm" style={{ color: currentTheme.colors.textMuted }}>
            Escolha quais seções deseja exibir no menu lateral. Você pode ocultar seções que não utiliza.
          </p>

          <div className="space-y-3">
            {menuItems.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 rounded-xl transition-all"
                style={{
                  background: menuVisibility[item.key] ? currentTheme.colors.primaryLight : currentTheme.colors.background,
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span
                    className="text-[15px] font-medium"
                    style={{ color: currentTheme.colors.text }}
                  >
                    {item.label}
                  </span>
                  {item.required && (
                    <span
                      className="px-2 py-0.5 rounded-full text-xs text-black"
                      style={{ background: currentTheme.colors.accent }}
                    >
                      Obrigatório
                    </span>
                  )}
                </div>

                <button
                  onClick={() => !item.required && toggleMenu(item.key)}
                  disabled={item.required}
                  className="p-2 rounded-lg transition-all"
                  style={{
                    background: menuVisibility[item.key] ? currentTheme.colors.primary : currentTheme.colors.textMuted,
                    opacity: item.required ? 0.5 : 1,
                    cursor: item.required ? "not-allowed" : "pointer",
                  }}
                >
                  {menuVisibility[item.key]
                    ? <Eye className="w-5 h-5 text-white" />
                    : <EyeOff className="w-5 h-5 text-white" />
                  }
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications Settings */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
            <h2
              className="font-display text-2xl font-semibold"
              style={{ color: currentTheme.colors.text }}
            >
              Notificações
            </h2>
          </div>
          <p className="mb-6 text-sm" style={{ color: currentTheme.colors.textMuted }}>
            Configure quais notificações deseja receber
          </p>

          <div className="space-y-3">
            {[
              { key: "tasks", label: "Lembrete de Tarefas", description: "Receba lembretes de tarefas pendentes" },
              { key: "habits", label: "Hábitos Diários", description: "Notificações para manter seus hábitos" },
              { key: "exams", label: "Provas e Exames", description: "Alertas de provas próximas" },
              { key: "birthdays", label: "Aniversários", description: "Lembrete de datas importantes" },
              { key: "certificates", label: "Certificados", description: "Alertas de certificados expirando" },
            ].map((item) => (
              <ToggleItem
                key={item.key}
                label={item.label}
                description={item.description}
                checked={notifications[item.key as keyof typeof notifications]}
                onChange={() => toggleNotification(item.key)}
                theme={currentTheme}
              />
            ))}
          </div>
        </div>

        {/* Privacy & Security */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
            <h2
              className="font-display text-2xl font-semibold"
              style={{ color: currentTheme.colors.text }}
            >
              Privacidade & Segurança
            </h2>
          </div>

          <div className="space-y-3">
            {[
              { label: "Alterar Senha", description: "Atualize sua senha de acesso" },
              { label: "Exportar Dados", description: "Baixe uma cópia dos seus dados" },
            ].map((item) => (
              <button
                key={item.label}
                className="w-full p-4 rounded-xl text-left hover:opacity-80 transition-all"
                style={{ background: currentTheme.colors.primaryLight }}
              >
                <p className="text-[15px] font-medium" style={{ color: currentTheme.colors.text }}>
                  {item.label}
                </p>
                <p className="text-[13px]" style={{ color: currentTheme.colors.textMuted }}>
                  {item.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl p-6 border-2 border-[#EF4444] bg-[#FEE2E2]">
          <div className="flex items-center gap-2 mb-4">
            <Trash2 className="w-5 h-5 text-[#EF4444]" />
            <h2 className="font-display text-2xl font-semibold text-[#991B1B]">
              Zona de Perigo
            </h2>
          </div>

          <button className="px-6 py-3 rounded-full text-white hover:opacity-90 transition-all bg-[#EF4444]">
            Excluir Conta
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleItem({ label, description, checked, onChange, theme }: any) {
  return (
    <div
      className="flex items-center justify-between p-4 rounded-xl"
      style={{ background: theme.colors.primaryLight }}
    >
      <div className="flex-1">
        <p className="text-[15px] font-medium" style={{ color: theme.colors.text }}>
          {label}
        </p>
        <p className="text-[13px]" style={{ color: theme.colors.textMuted }}>
          {description}
        </p>
      </div>
      <button
        onClick={onChange}
        className="relative w-14 h-7 rounded-full transition-all"
        style={{ background: checked ? theme.colors.primary : theme.colors.textMuted }}
      >
        <div
          className="absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all"
          style={{ left: checked ? "28px" : "2px" }}
        />
      </button>
    </div>
  );
}
