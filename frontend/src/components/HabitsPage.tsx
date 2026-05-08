import {
  Plus,
  Flame,
  Check,
  Trash2,
  Trophy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

interface Habit {
  id: number;
  name: string;
  emoji: string;
  color: string;
  completions: Record<string, boolean>;
  streak: number;
}

const COLORS = ["#F472B6", "#A855F7", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"];
const EMOJIS = ["💧", "🏃", "📚", "🧘", "🥗", "💤", "✍️", "🎵", "🌿", "💪"];

const DAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
}

function calcStreak(completions: Record<string, boolean>) {
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().split("T")[0];
    if (completions[key]) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return streak;
}

let nextId = 1;

const defaultHabits: Habit[] = [
  { id: nextId++, name: "Beber 2L de água", emoji: "💧", color: "#3B82F6", completions: {}, streak: 0 },
  { id: nextId++, name: "Exercitar 30 min", emoji: "🏃", color: "#10B981", completions: {}, streak: 0 },
  { id: nextId++, name: "Ler 20 páginas", emoji: "📚", color: "#A855F7", completions: {}, streak: 0 },
  { id: nextId++, name: "Meditar", emoji: "🧘", color: "#F472B6", completions: {}, streak: 0 },
];

export function HabitsPage() {
  const { currentTheme } = useTheme();
  const [habits, setHabits] = useState<Habit[]>(defaultHabits);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("💧");
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [weekOffset, setWeekOffset] = useState(0);

  const days = getLast7Days().map((d) => {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + weekOffset * 7);
    return copy;
  });

  const todayKey = new Date().toISOString().split("T")[0];

  const toggle = (habitId: number, dateKey: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const completions = { ...h.completions, [dateKey]: !h.completions[dateKey] };
        return { ...h, completions, streak: calcStreak(completions) };
      })
    );
  };

  const addHabit = () => {
    if (!newName.trim()) return;
    setHabits((prev) => [
      ...prev,
      { id: nextId++, name: newName.trim(), emoji: newEmoji, color: newColor, completions: {}, streak: 0 },
    ]);
    setNewName("");
    setNewEmoji("💧");
    setNewColor(COLORS[0]);
    setShowAdd(false);
  };

  const deleteHabit = (id: number) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const totalToday = habits.filter((h) => h.completions[todayKey]).length;
  const completionRate = habits.length > 0 ? Math.round((totalToday / habits.length) * 100) : 0;
  const bestStreak = Math.max(0, ...habits.map((h) => h.streak));

  return (
    <div className="flex-1 overflow-auto p-6" style={{ background: currentTheme.colors.background }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-[36px] font-bold" style={{ color: currentTheme.colors.text }}>
          Hábitos
        </h1>
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
        <div className="rounded-2xl p-5" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}>
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
            <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>Hoje</p>
          </div>
          <p className="text-3xl font-bold" style={{ color: currentTheme.colors.text }}>{totalToday}/{habits.length}</p>
          <p className="text-xs mt-1" style={{ color: currentTheme.colors.textMuted }}>hábitos concluídos</p>
        </div>
        <div className="rounded-2xl p-5" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}>
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>Melhor Sequência</p>
          </div>
          <p className="text-3xl font-bold" style={{ color: currentTheme.colors.text }}>{bestStreak}</p>
          <p className="text-xs mt-1" style={{ color: currentTheme.colors.textMuted }}>dias consecutivos</p>
        </div>
        <div className="rounded-2xl p-5" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>Taxa Hoje</p>
          </div>
          <p className="text-3xl font-bold" style={{ color: currentTheme.colors.text }}>{completionRate}%</p>
          <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: currentTheme.colors.primaryLight }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${completionRate}%`, background: currentTheme.colors.primary }} />
          </div>
        </div>
      </div>

      {/* Week nav */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setWeekOffset((o) => o - 1)} className="p-1.5 rounded-lg hover:opacity-70 transition-all" style={{ background: currentTheme.colors.primaryLight }}>
          <ChevronLeft className="w-4 h-4" style={{ color: currentTheme.colors.primaryDark }} />
        </button>
        <span className="text-sm font-medium" style={{ color: currentTheme.colors.textMuted }}>
          {weekOffset === 0 ? "Esta semana" : weekOffset === -1 ? "Semana passada" : `${Math.abs(weekOffset)} semanas atrás`}
        </span>
        <button onClick={() => setWeekOffset((o) => o + 1)} className="p-1.5 rounded-lg hover:opacity-70 transition-all" style={{ background: currentTheme.colors.primaryLight }} disabled={weekOffset >= 0}>
          <ChevronRight className="w-4 h-4" style={{ color: currentTheme.colors.primaryDark }} />
        </button>
      </div>

      {/* Habits Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
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

        {habits.map((habit) => (
          <div
            key={habit.id}
            className="grid border-b last:border-0 hover:bg-black/5 transition-all"
            style={{ gridTemplateColumns: "1fr repeat(7, 48px) 64px 40px", borderColor: currentTheme.colors.primary + "10" }}
          >
            <div className="px-5 py-3 flex items-center gap-3">
              <span className="text-xl">{habit.emoji}</span>
              <span className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>{habit.name}</span>
            </div>
            {days.map((d) => {
              const key = d.toISOString().split("T")[0];
              const done = habit.completions[key];
              return (
                <div key={key} className="flex items-center justify-center py-3">
                  <button
                    onClick={() => toggle(habit.id, key)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{
                      background: done ? habit.color : currentTheme.colors.primaryLight,
                      border: `2px solid ${done ? habit.color : "transparent"}`,
                    }}
                  >
                    {done && <Check className="w-4 h-4 text-white" />}
                  </button>
                </div>
              );
            })}
            <div className="flex items-center justify-center py-3 gap-1">
              {habit.streak > 0 && <Flame className="w-3.5 h-3.5 text-orange-500" />}
              <span className="text-sm font-semibold" style={{ color: habit.streak > 0 ? "#F97316" : currentTheme.colors.textMuted }}>
                {habit.streak}
              </span>
            </div>
            <div className="flex items-center justify-center py-3">
              <button onClick={() => deleteHabit(habit.id)} className="opacity-40 hover:opacity-100 transition-all">
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Habit Modal */}
      {showAdd && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="rounded-2xl p-6 w-full max-w-sm shadow-2xl" style={{ background: currentTheme.colors.surface }}>
            <h3 className="font-display text-xl font-bold mb-4" style={{ color: currentTheme.colors.text }}>
              Novo Hábito
            </h3>

            <label className="block text-sm font-medium mb-1" style={{ color: currentTheme.colors.text }}>Nome</label>
            <input
              autoFocus
              type="text"
              placeholder="Ex: Meditar 10 min"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addHabit()}
              className="w-full px-4 py-2.5 rounded-xl outline-none mb-4 text-sm"
              style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }}
            />

            <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>Emoji</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setNewEmoji(e)}
                  className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: newEmoji === e ? currentTheme.colors.primary + "30" : currentTheme.colors.primaryLight, border: newEmoji === e ? `2px solid ${currentTheme.colors.primary}` : "2px solid transparent" }}
                >
                  {e}
                </button>
              ))}
            </div>

            <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>Cor</label>
            <div className="flex gap-2 mb-6">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className="w-8 h-8 rounded-full transition-all hover:scale-110"
                  style={{ background: c, border: newColor === c ? `3px solid ${currentTheme.colors.text}` : "3px solid transparent" }}
                />
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={addHabit}
                className="flex-1 py-2.5 rounded-full text-white font-semibold hover:opacity-90 transition-all"
                style={{ background: currentTheme.colors.primary }}
              >
                Adicionar
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 py-2.5 rounded-full font-semibold hover:opacity-80 transition-all"
                style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
