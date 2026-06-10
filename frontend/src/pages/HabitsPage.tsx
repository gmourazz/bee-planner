import {
  Plus,
  Flame,
  Check,
  Trash2,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Activity,
  Heart,
  Brain,
  Leaf,
  Moon,
  PenLine,
  Music,
  Dumbbell,
  Zap,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useHabits } from "../hooks/useHabits";
import { HABIT_ICON_KEYS, HABIT_COLORS } from "../enums/habit.enums";
import type { HabitIconKey } from "../enums/habit.enums";
import { getLast7Days } from "../utils/date.utils";

const HABIT_ICON_MAP: Record<HabitIconKey, LucideIcon> = {
  droplets: Droplets,
  activity: Activity,
  heart: Heart,
  brain: Brain,
  leaf: Leaf,
  moon: Moon,
  penline: PenLine,
  music: Music,
  dumbbell: Dumbbell,
  zap: Zap,
};

const DAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function HabitsPage() {
  const { currentTheme } = useTheme();
  const {
    habits, loading, error, toggling,
    showAdd, saving, newName, newIconKey, newColor, weekOffset,
    setShowAdd, setNewName, setNewIconKey, setNewColor, setWeekOffset,
    carregarHabitos, toggle, addHabit, removeHabit,
  } = useHabits();

  const days = getLast7Days().map((d) => {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + weekOffset * 7);
    return copy;
  });

  const todayKey = new Date().toISOString().split("T")[0];

  const totalToday     = habits.filter(h => h.completions[todayKey]).length;
  const completionRate = habits.length > 0 ? Math.round((totalToday / habits.length) * 100) : 0;
  const bestStreak     = Math.max(0, ...habits.map(h => h.streak));

  return (
    <div className="flex-1 overflow-auto p-6" style={{ background: currentTheme.colors.background }}>
      <div className="max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-semibold hover:opacity-90 transition-all"
          style={{ background: currentTheme.colors.primary }}
        >
          <Plus className="w-4 h-4" />
          Novo Hábito
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: <Check className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />, label: "Hoje", value: `${totalToday}/${habits.length}`, sub: "hábitos concluídos", bar: false },
          { icon: <Flame className="w-5 h-5" style={{ color: currentTheme.colors.accent }} />, label: "Melhor Sequência", value: bestStreak, sub: "dias consecutivos", bar: false },
          { icon: <Trophy className="w-5 h-5" style={{ color: currentTheme.colors.accent }} />, label: "Taxa Hoje", value: `${completionRate}%`, sub: null, bar: true },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-5" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}>
            <div className="flex items-center gap-2 mb-2">{s.icon}<p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>{s.label}</p></div>
            <p className="text-3xl font-bold" style={{ color: currentTheme.colors.text }}>{s.value}</p>
            {s.sub && <p className="text-xs mt-1" style={{ color: currentTheme.colors.textMuted }}>{s.sub}</p>}
            {s.bar && (
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: currentTheme.colors.primaryLight }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${completionRate}%`, background: currentTheme.colors.primary }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Week nav */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setWeekOffset(o => o - 1)} className="p-1.5 rounded-lg hover:opacity-70 transition-all" style={{ background: currentTheme.colors.primaryLight }}>
          <ChevronLeft className="w-4 h-4" style={{ color: currentTheme.colors.primaryDark }} />
        </button>
        <span className="text-sm font-medium" style={{ color: currentTheme.colors.textMuted }}>
          {weekOffset === 0 ? "Esta semana" : weekOffset === -1 ? "Semana passada" : `${Math.abs(weekOffset)} semanas atrás`}
        </span>
        <button onClick={() => setWeekOffset(o => o + 1)} disabled={weekOffset >= 0} className="p-1.5 rounded-lg hover:opacity-70 transition-all disabled:opacity-30" style={{ background: currentTheme.colors.primaryLight }}>
          <ChevronRight className="w-4 h-4" style={{ color: currentTheme.colors.primaryDark }} />
        </button>
      </div>

      {/* Habits Table */}
      <div className="overflow-x-auto rounded-2xl">
      <div className="min-w-[700px] rounded-2xl overflow-hidden" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
        {/* Column headers */}
        <div className="grid border-b" style={{ gridTemplateColumns: "1fr repeat(7, 48px) 64px 40px", borderColor: currentTheme.colors.primary + "15" }}>
          <div className="px-5 py-3 text-xs font-semibold" style={{ color: currentTheme.colors.textMuted }}>Hábito</div>
          {days.map((d, i) => {
            const isT = d.toISOString().split("T")[0] === todayKey;
            return (
              <div key={i} className="py-3 text-center">
                <p className="text-[10px]" style={{ color: currentTheme.colors.textMuted }}>{DAYS_SHORT[d.getDay()]}</p>
                <p className="text-xs font-semibold" style={{ color: isT ? currentTheme.colors.primary : currentTheme.colors.text }}>{d.getDate()}</p>
              </div>
            );
          })}
          <div className="px-2 py-3 text-xs font-semibold text-center" style={{ color: currentTheme.colors.textMuted }}>Sequência</div>
          <div />
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12 gap-2" style={{ color: currentTheme.colors.textMuted }}>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Carregando hábitos...</span>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="py-8 text-center">
            <p className="text-sm text-red-500">{error}</p>
            <button onClick={carregarHabitos} className="mt-2 text-xs underline" style={{ color: currentTheme.colors.primary }}>
              Tentar novamente
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && habits.length === 0 && (
          <div className="py-12 text-center" style={{ color: currentTheme.colors.textMuted }}>
            <p className="text-sm">Nenhum hábito cadastrado ainda.</p>
            <p className="text-xs mt-1">Clique em "Novo Hábito" para começar!</p>
          </div>
        )}

        {/* Rows */}
        {habits.map(habit => {
          const HabitIcon = HABIT_ICON_MAP[habit.iconKey as HabitIconKey] ?? Zap;
          return (
            <div key={habit.id} className="grid border-b last:border-0 hover:bg-black/5 transition-all" style={{ gridTemplateColumns: "1fr repeat(7, 48px) 64px 40px", borderColor: currentTheme.colors.primary + "10" }}>
              <div className="px-5 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: habit.color + "20" }}>
                  <HabitIcon className="w-4 h-4" style={{ color: habit.color }} />
                </div>
                <span className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>{habit.name}</span>
              </div>
              {days.map(d => {
                const key  = d.toISOString().split("T")[0];
                const done = !!habit.completions[key];
                const busy = toggling.has(`${habit.id}-${key}`);
                return (
                  <div key={key} className="flex items-center justify-center py-3">
                    <button
                      onClick={() => toggle(habit.id, key)}
                      disabled={busy}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-60"
                      style={{ background: done ? habit.color : currentTheme.colors.primaryLight, border: `2px solid ${done ? habit.color : "transparent"}` }}
                    >
                      {busy ? <Loader2 className="w-3 h-3 animate-spin" style={{ color: done ? "#fff" : currentTheme.colors.textMuted }} />
                            : done ? <Check className="w-4 h-4 text-white" /> : null}
                    </button>
                  </div>
                );
              })}
              <div className="flex items-center justify-center py-3 gap-1">
                {habit.streak > 0 && <Flame className="w-3.5 h-3.5" style={{ color: currentTheme.colors.accent }} />}
                <span className="text-sm font-semibold" style={{ color: habit.streak > 0 ? currentTheme.colors.accent : currentTheme.colors.textMuted }}>{habit.streak}</span>
              </div>
              <div className="flex items-center justify-center py-3">
                <button onClick={() => removeHabit(habit.id)} className="opacity-40 hover:opacity-100 transition-all">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      </div>{/* fecha overflow-x-auto */}
      </div>{/* fecha max-w */}

      {/* Add Habit Modal */}
      {showAdd && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="rounded-2xl p-6 w-full max-w-sm shadow-2xl" style={{ background: currentTheme.colors.surface }}>
            <h3 className="font-display text-xl font-bold mb-4" style={{ color: currentTheme.colors.text }}>Novo Hábito</h3>

            <label className="block text-sm font-medium mb-1" style={{ color: currentTheme.colors.text }}>Nome</label>
            <input
              autoFocus
              type="text"
              placeholder="Ex: Meditar 10 min"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addHabit()}
              className="w-full px-4 py-2.5 rounded-xl outline-none mb-4 text-sm"
              style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }}
            />

            <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>Ícone</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {HABIT_ICON_KEYS.map(key => {
                const Icon = HABIT_ICON_MAP[key];
                return (
                  <button key={key} onClick={() => setNewIconKey(key)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: newIconKey === key ? currentTheme.colors.primary + "30" : currentTheme.colors.primaryLight, border: newIconKey === key ? `2px solid ${currentTheme.colors.primary}` : "2px solid transparent" }}>
                    <Icon className="w-5 h-5" style={{ color: newIconKey === key ? currentTheme.colors.primary : currentTheme.colors.textMuted }} />
                  </button>
                );
              })}
            </div>

            <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>Cor</label>
            <div className="flex gap-2 mb-6">
              {HABIT_COLORS.map(c => (
                <button key={c} onClick={() => setNewColor(c)}
                  className="w-8 h-8 rounded-full transition-all hover:scale-110"
                  style={{ background: c, border: newColor === c ? `3px solid ${currentTheme.colors.text}` : "3px solid transparent" }} />
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={addHabit} disabled={saving}
                className="flex-1 py-2.5 rounded-full text-white font-semibold hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: currentTheme.colors.primary }}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? "Salvando..." : "Adicionar"}
              </button>
              <button onClick={() => setShowAdd(false)}
                className="flex-1 py-2.5 rounded-full font-semibold hover:opacity-80 transition-all"
                style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
