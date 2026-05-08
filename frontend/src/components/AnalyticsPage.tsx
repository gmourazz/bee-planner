import {
  TrendingUp,
  BookOpen,
  CheckCircle,
  Zap,
  Award,
  Target,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

export function AnalyticsPage() {
  const { currentTheme } = useTheme();
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(4);

  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  const tasksData = [45, 52, 48, 60, 55, 58, 62, 59, 65, 70, 68, 72];
  const booksData = [1, 2, 1, 2, 0, 3, 2, 1, 2, 2, 1, 2];
  const habitsData = [75, 80, 78, 85, 82, 88, 90, 87, 92, 89, 91, 94];

  return (
    <div className="flex-1 overflow-auto p-6" style={{ background: currentTheme.colors.background }}>
      {/* Header */}
      <div className="mb-6">
        <h1
          className="font-display mb-6 text-[40px] font-bold"
          style={{ color: currentTheme.colors.text }}
        >
          Dashboard de Produtividade
        </h1>

        {/* Year & Month Filters */}
        <div className="flex gap-3 mb-6">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 rounded-xl border-2 border-transparent outline-none"
            style={{
              background: currentTheme.colors.surface,
              color: currentTheme.colors.text,
              boxShadow: `0 2px 16px ${currentTheme.colors.primary}15`,
            }}
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-4 py-2 rounded-xl border-2 border-transparent outline-none"
            style={{
              background: currentTheme.colors.surface,
              color: currentTheme.colors.text,
              boxShadow: `0 2px 16px ${currentTheme.colors.primary}15`,
            }}
          >
            {months.map((month, idx) => (
              <option key={idx} value={idx}>{month}</option>
            ))}
          </select>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Tarefas */}
          <div
            className="rounded-2xl p-6"
            style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: currentTheme.colors.primaryLight }}>
                <CheckCircle className="w-6 h-6" style={{ color: currentTheme.colors.primary }} />
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#D1FAE5] text-[#047857]">
                <TrendingUp className="w-3 h-3" />
                <span className="text-[11px] font-semibold">+12%</span>
              </div>
            </div>
            <p className="text-[32px] font-bold mb-1" style={{ color: currentTheme.colors.text }}>156</p>
            <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>Tarefas Concluídas</p>
          </div>

          {/* Hábitos */}
          <div
            className="rounded-2xl p-6"
            style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#DCFCE7]">
                <Zap className="w-6 h-6 text-[#10B981]" />
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#D1FAE5] text-[#047857]">
                <TrendingUp className="w-3 h-3" />
                <span className="text-[11px] font-semibold">+8%</span>
              </div>
            </div>
            <p className="text-[32px] font-bold mb-1" style={{ color: currentTheme.colors.text }}>87%</p>
            <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>Taxa de Hábitos</p>
          </div>

          {/* Livros */}
          <div
            className="rounded-2xl p-6"
            style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#E9D5FF]">
                <BookOpen className="w-6 h-6 text-[#A855F7]" />
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#D1FAE5] text-[#047857]">
                <TrendingUp className="w-3 h-3" />
                <span className="text-[11px] font-semibold">+15%</span>
              </div>
            </div>
            <p className="text-[32px] font-bold mb-1" style={{ color: currentTheme.colors.text }}>8</p>
            <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>Livros Lidos (2026)</p>
          </div>

          {/* Cursos */}
          <div
            className="rounded-2xl p-6"
            style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#FEF3C7]">
                <Award className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#D1FAE5] text-[#047857]">
                <TrendingUp className="w-3 h-3" />
                <span className="text-[11px] font-semibold">+20%</span>
              </div>
            </div>
            <p className="text-[32px] font-bold mb-1" style={{ color: currentTheme.colors.text }}>5</p>
            <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>Cursos Concluídos</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks Completed Chart */}
        <div
          className="rounded-2xl p-6"
          style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}
        >
          <h3
            className="font-display mb-6 text-xl font-semibold"
            style={{ color: currentTheme.colors.text }}
          >
            Tarefas Concluídas por Mês
          </h3>
          <div className="flex items-end justify-between h-64 gap-2">
            {tasksData.map((value, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                  style={{
                    height: `${(value / Math.max(...tasksData)) * 100}%`,
                    background: idx === selectedMonth ? currentTheme.colors.primary : currentTheme.colors.primaryLight,
                    minHeight: "8px",
                  }}
                />
                <span
                  className={`text-[11px] ${idx === selectedMonth ? 'font-semibold' : 'font-normal'}`}
                  style={{ color: idx === selectedMonth ? currentTheme.colors.primary : currentTheme.colors.textMuted }}
                >
                  {months[idx]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Books Read Chart */}
        <div
          className="rounded-2xl p-6"
          style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}
        >
          <h3
            className="font-display mb-6 text-xl font-semibold"
            style={{ color: currentTheme.colors.text }}
          >
            Livros Lidos por Mês
          </h3>
          <div className="flex items-end justify-between h-64 gap-2">
            {booksData.map((value, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                  style={{
                    height: value > 0 ? `${(value / Math.max(...booksData)) * 100}%` : "4px",
                    background: idx === selectedMonth ? "#A855F7" : "#E9D5FF",
                    minHeight: "8px",
                  }}
                />
                <span
                  className={`text-[11px] ${idx === selectedMonth ? 'font-semibold' : 'font-normal'}`}
                  style={{ color: idx === selectedMonth ? "#A855F7" : currentTheme.colors.textMuted }}
                >
                  {months[idx]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Habits Completion Rate */}
        <div
          className="rounded-2xl p-6"
          style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}
        >
          <h3
            className="font-display mb-6 text-xl font-semibold"
            style={{ color: currentTheme.colors.text }}
          >
            Taxa de Conclusão de Hábitos
          </h3>
          <div className="flex items-end justify-between h-64 gap-2">
            {habitsData.map((value, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                  style={{
                    height: `${value}%`,
                    background: idx === selectedMonth ? "#10B981" : "#D1FAE5",
                  }}
                />
                <span
                  className={`text-[11px] ${idx === selectedMonth ? 'font-semibold' : 'font-normal'}`}
                  style={{ color: idx === selectedMonth ? "#10B981" : currentTheme.colors.textMuted }}
                >
                  {months[idx]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Goals Progress */}
        <div
          className="rounded-2xl p-6"
          style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}
        >
          <h3
            className="font-display mb-6 text-xl font-semibold"
            style={{ color: currentTheme.colors.text }}
          >
            Progresso de Metas 2026
          </h3>
          <div className="space-y-6">
            {[
              { label: "Ler 24 livros", progress: 33, current: "8/24", trackBg: currentTheme.colors.primaryLight, barColor: currentTheme.colors.primary, iconColor: currentTheme.colors.primary },
              { label: "5 cursos online", progress: 100, current: "5/5", trackBg: "#D1FAE5", barColor: "#10B981", iconColor: "#10B981" },
              { label: "90% hábitos diários", progress: 87, current: "87%", trackBg: "#FEF3C7", barColor: "#F59E0B", iconColor: "#F59E0B" },
              { label: "Concluir TCC", progress: 65, current: "65%", trackBg: "#EDE9FE", barColor: "#8B5CF6", iconColor: "#8B5CF6" },
            ].map((goal) => (
              <div key={goal.label}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" style={{ color: goal.iconColor }} />
                    <span className="text-sm" style={{ color: currentTheme.colors.text }}>{goal.label}</span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: currentTheme.colors.text }}>{goal.current}</span>
                </div>
                <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: goal.trackBg }}>
                  <div className="h-full rounded-full" style={{ width: `${goal.progress}%`, background: goal.barColor }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
