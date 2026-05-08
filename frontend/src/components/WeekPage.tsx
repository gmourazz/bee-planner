import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  Trash2,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

interface Task {
  id: number;
  text: string;
  done: boolean;
  time?: string;
}

type DayTasks = Record<string, Task[]>;

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const FULL_DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

function getWeekDates(offset: number) {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

let nextId = 100;

export function WeekPage() {
  const { currentTheme } = useTheme();
  const [weekOffset, setWeekOffset] = useState(0);
  const [tasks, setTasks] = useState<DayTasks>({});
  const [addingFor, setAddingFor] = useState<string | null>(null);
  const [newText, setNewText] = useState("");
  const [newTime, setNewTime] = useState("");

  const dates = getWeekDates(weekOffset);
  const today = new Date();

  const isToday = (d: Date) =>
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  const dateKey = (d: Date) => d.toISOString().split("T")[0];

  const addTask = (key: string) => {
    if (!newText.trim()) return;
    setTasks((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), { id: nextId++, text: newText.trim(), done: false, time: newTime || undefined }],
    }));
    setNewText("");
    setNewTime("");
    setAddingFor(null);
  };

  const toggleTask = (key: string, id: number) => {
    setTasks((prev) => ({
      ...prev,
      [key]: prev[key].map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    }));
  };

  const deleteTask = (key: string, id: number) => {
    setTasks((prev) => ({
      ...prev,
      [key]: prev[key].filter((t) => t.id !== id),
    }));
  };

  const monthLabel = dates[0].toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="flex-1 overflow-auto p-6" style={{ background: currentTheme.colors.background }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-[36px] font-bold" style={{ color: currentTheme.colors.text }}>
          Semana
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium capitalize" style={{ color: currentTheme.colors.textMuted }}>
            {monthLabel}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setWeekOffset((o) => o - 1)}
              className="p-2 rounded-xl hover:opacity-70 transition-all"
              style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold hover:opacity-80 transition-all"
              style={{ background: currentTheme.colors.primary, color: "#fff" }}
            >
              Hoje
            </button>
            <button
              onClick={() => setWeekOffset((o) => o + 1)}
              className="p-2 rounded-xl hover:opacity-70 transition-all"
              style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-3">
        {dates.map((date, idx) => {
          const key = dateKey(date);
          const dayTasks = tasks[key] || [];
          const active = isToday(date);
          const isAdding = addingFor === key;

          return (
            <div
              key={key}
              className="rounded-2xl overflow-hidden flex flex-col"
              style={{
                background: currentTheme.colors.surface,
                boxShadow: active
                  ? `0 0 0 2px ${currentTheme.colors.primary}, 0 4px 16px ${currentTheme.colors.primary}20`
                  : `0 2px 12px ${currentTheme.colors.primary}10`,
                minHeight: "280px",
              }}
            >
              {/* Day header */}
              <div
                className="px-3 py-2.5 text-center"
                style={{ background: active ? currentTheme.colors.primary : currentTheme.colors.primaryLight }}
              >
                <p className="text-xs font-semibold" style={{ color: active ? "#fff" : currentTheme.colors.textMuted }}>
                  {DAYS[idx]}
                </p>
                <p
                  className="text-xl font-bold"
                  style={{ color: active ? "#fff" : currentTheme.colors.text }}
                >
                  {date.getDate()}
                </p>
              </div>

              {/* Tasks */}
              <div className="flex-1 p-2 space-y-1.5 overflow-y-auto">
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-start gap-1.5 p-1.5 rounded-lg hover:bg-black/5 transition-all"
                  >
                    <button
                      onClick={() => toggleTask(key, task.id)}
                      className="mt-0.5 w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        background: task.done ? currentTheme.colors.primary : "transparent",
                        border: `2px solid ${task.done ? currentTheme.colors.primary : currentTheme.colors.textMuted}`,
                      }}
                    >
                      {task.done && <Check className="w-2.5 h-2.5 text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      {task.time && (
                        <div className="flex items-center gap-0.5 mb-0.5">
                          <Clock className="w-2.5 h-2.5" style={{ color: currentTheme.colors.primary }} />
                          <span className="text-[10px]" style={{ color: currentTheme.colors.primary }}>{task.time}</span>
                        </div>
                      )}
                      <p
                        className="text-[11px] leading-tight break-words"
                        style={{
                          color: task.done ? currentTheme.colors.textMuted : currentTheme.colors.text,
                          textDecoration: task.done ? "line-through" : "none",
                        }}
                      >
                        {task.text}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteTask(key, task.id)}
                      className="opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                ))}

                {/* Add form */}
                {isAdding ? (
                  <div className="space-y-1">
                    <input
                      autoFocus
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full px-2 py-1 rounded-lg text-[11px] outline-none border"
                      style={{
                        background: currentTheme.colors.background,
                        color: currentTheme.colors.text,
                        borderColor: currentTheme.colors.primary + "50",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Nova tarefa..."
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addTask(key);
                        if (e.key === "Escape") { setAddingFor(null); setNewText(""); setNewTime(""); }
                      }}
                      className="w-full px-2 py-1 rounded-lg text-[11px] outline-none border"
                      style={{
                        background: currentTheme.colors.background,
                        color: currentTheme.colors.text,
                        borderColor: currentTheme.colors.primary + "50",
                      }}
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={() => addTask(key)}
                        className="flex-1 py-1 rounded-lg text-[10px] font-semibold text-white transition-all hover:opacity-80"
                        style={{ background: currentTheme.colors.primary }}
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => { setAddingFor(null); setNewText(""); setNewTime(""); }}
                        className="flex-1 py-1 rounded-lg text-[10px] font-semibold transition-all hover:opacity-80"
                        style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingFor(key)}
                    className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg opacity-50 hover:opacity-100 transition-all"
                    style={{ color: currentTheme.colors.primary }}
                  >
                    <Plus className="w-3 h-3" />
                    <span className="text-[10px] font-medium">Adicionar</span>
                  </button>
                )}
              </div>

              {/* Day label */}
              <div className="px-3 pb-2 text-center">
                <p className="text-[10px]" style={{ color: currentTheme.colors.textMuted }}>
                  {FULL_DAYS[idx]}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
