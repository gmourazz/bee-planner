import {
  Droplets,
  Moon,
  Dumbbell,
  Smile,
  Plus,
  Minus,
  TrendingUp,
  Heart,
  Activity,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

const MOODS = [
  { label: "Ótimo", emoji: "😄", color: "#10B981", value: 5 },
  { label: "Bem", emoji: "🙂", color: "#3B82F6", value: 4 },
  { label: "Neutro", emoji: "😐", color: "#F59E0B", value: 3 },
  { label: "Mal", emoji: "😔", color: "#F97316", value: 2 },
  { label: "Péssimo", emoji: "😞", color: "#EF4444", value: 1 },
];

const EXERCISES = [
  { name: "Caminhada", duration: 30 },
  { name: "Corrida", duration: 20 },
  { name: "Academia", duration: 60 },
  { name: "Yoga", duration: 45 },
  { name: "Natação", duration: 40 },
  { name: "Ciclismo", duration: 50 },
];

const WEEK_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function getLast7Keys() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

export function HealthPage() {
  const { currentTheme } = useTheme();
  const todayKey = new Date().toISOString().split("T")[0];
  const weekKeys = getLast7Keys();

  const [water, setWater] = useState<Record<string, number>>({ [todayKey]: 4 });
  const [sleep, setSleep] = useState<Record<string, number>>({ [todayKey]: 7 });
  const [mood, setMood] = useState<Record<string, number>>({ [todayKey]: 4 });
  const [exercises, setExercises] = useState<Record<string, string[]>>({});
  const [weight, setWeight] = useState("65.0");
  const [steps, setSteps] = useState<Record<string, number>>({ [todayKey]: 6200 });

  const todayWater = water[todayKey] || 0;
  const todaySleep = sleep[todayKey] || 0;
  const todayMood = MOODS.find((m) => m.value === (mood[todayKey] || 3));
  const todayExercises = exercises[todayKey] || [];
  const todaySteps = steps[todayKey] || 0;

  const adjustWater = (delta: number) =>
    setWater((w) => ({ ...w, [todayKey]: Math.max(0, Math.min(16, (w[todayKey] || 0) + delta)) }));

  const adjustSleep = (delta: number) =>
    setSleep((s) => ({ ...s, [todayKey]: Math.max(0, Math.min(14, (s[todayKey] || 0) + delta)) }));

  const toggleExercise = (name: string) =>
    setExercises((e) => {
      const arr = e[todayKey] || [];
      return { ...e, [todayKey]: arr.includes(name) ? arr.filter((x) => x !== name) : [...arr, name] };
    });

  const avgSleep = weekKeys.reduce((s, k) => s + (sleep[k] || 0), 0) / 7;
  const avgWater = weekKeys.reduce((s, k) => s + (water[k] || 0), 0) / 7;

  return (
    <div className="flex-1 overflow-auto p-6" style={{ background: currentTheme.colors.background }}>
      <h1 className="font-display text-[36px] font-bold mb-6" style={{ color: currentTheme.colors.text }}>
        Saúde & Bem-estar
      </h1>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl p-4" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-red-400" />
            <span className="text-xs" style={{ color: currentTheme.colors.textMuted }}>Humor hoje</span>
          </div>
          <p className="text-3xl">{todayMood?.emoji}</p>
          <p className="text-xs font-medium mt-1" style={{ color: currentTheme.colors.text }}>{todayMood?.label}</p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
          <div className="flex items-center gap-2 mb-2">
            <Moon className="w-4 h-4 text-indigo-400" />
            <span className="text-xs" style={{ color: currentTheme.colors.textMuted }}>Sono médio</span>
          </div>
          <p className="text-3xl font-bold" style={{ color: currentTheme.colors.text }}>{avgSleep.toFixed(1)}h</p>
          <p className="text-xs" style={{ color: currentTheme.colors.textMuted }}>últimos 7 dias</p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span className="text-xs" style={{ color: currentTheme.colors.textMuted }}>Água média</span>
          </div>
          <p className="text-3xl font-bold" style={{ color: currentTheme.colors.text }}>{avgWater.toFixed(1)}</p>
          <p className="text-xs" style={{ color: currentTheme.colors.textMuted }}>copos/dia</p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
            <span className="text-xs" style={{ color: currentTheme.colors.textMuted }}>Passos hoje</span>
          </div>
          <p className="text-3xl font-bold" style={{ color: currentTheme.colors.text }}>{todaySteps.toLocaleString()}</p>
          <p className="text-xs" style={{ color: currentTheme.colors.textMuted }}>meta: 10.000</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Water tracker */}
        <div className="rounded-2xl p-5" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
          <div className="flex items-center gap-2 mb-4">
            <Droplets className="w-5 h-5 text-blue-400" />
            <h3 className="font-display text-lg font-semibold" style={{ color: currentTheme.colors.text }}>Hidratação</h3>
          </div>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => adjustWater(-1)} className="w-10 h-10 rounded-xl flex items-center justify-center hover:opacity-70 transition-all" style={{ background: currentTheme.colors.primaryLight }}>
              <Minus className="w-4 h-4" style={{ color: currentTheme.colors.primaryDark }} />
            </button>
            <div className="text-center">
              <p className="text-4xl font-bold" style={{ color: currentTheme.colors.text }}>{todayWater}</p>
              <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>de 8 copos (200ml)</p>
            </div>
            <button onClick={() => adjustWater(1)} className="w-10 h-10 rounded-xl flex items-center justify-center hover:opacity-70 transition-all" style={{ background: currentTheme.colors.primary }}>
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                onClick={() => setWater((w) => ({ ...w, [todayKey]: i + 1 }))}
                className="w-8 h-10 rounded-lg cursor-pointer transition-all hover:scale-110 flex items-end justify-center pb-1"
                style={{ background: i < todayWater ? "#3B82F6" : currentTheme.colors.primaryLight }}
              >
                <Droplets className="w-3 h-3" style={{ color: i < todayWater ? "#fff" : currentTheme.colors.textMuted }} />
              </div>
            ))}
          </div>
        </div>

        {/* Sleep tracker */}
        <div className="rounded-2xl p-5" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
          <div className="flex items-center gap-2 mb-4">
            <Moon className="w-5 h-5 text-indigo-400" />
            <h3 className="font-display text-lg font-semibold" style={{ color: currentTheme.colors.text }}>Sono</h3>
          </div>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => adjustSleep(-0.5)} className="w-10 h-10 rounded-xl flex items-center justify-center hover:opacity-70 transition-all" style={{ background: currentTheme.colors.primaryLight }}>
              <Minus className="w-4 h-4" style={{ color: currentTheme.colors.primaryDark }} />
            </button>
            <div className="text-center">
              <p className="text-4xl font-bold" style={{ color: currentTheme.colors.text }}>{todaySleep}h</p>
              <p className="text-sm" style={{ color: todaySleep >= 7 ? "#10B981" : "#F59E0B" }}>
                {todaySleep >= 8 ? "Excelente!" : todaySleep >= 7 ? "Bom" : todaySleep >= 6 ? "Razoável" : "Pouco"}
              </p>
            </div>
            <button onClick={() => adjustSleep(0.5)} className="w-10 h-10 rounded-xl flex items-center justify-center hover:opacity-70 transition-all" style={{ background: currentTheme.colors.primary }}>
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="flex items-end gap-1 h-16">
            {weekKeys.map((k, i) => {
              const h = sleep[k] || 0;
              return (
                <div key={k} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-md transition-all" style={{ height: `${(h / 12) * 100}%`, background: h >= 7 ? "#6366F1" : "#FCD34D", minHeight: "4px" }} />
                  <span className="text-[9px]" style={{ color: currentTheme.colors.textMuted }}>{WEEK_DAYS[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mood tracker */}
        <div className="rounded-2xl p-5" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
          <div className="flex items-center gap-2 mb-4">
            <Smile className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
            <h3 className="font-display text-lg font-semibold" style={{ color: currentTheme.colors.text }}>Humor</h3>
          </div>
          <div className="flex justify-between mb-6">
            {MOODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setMood((md) => ({ ...md, [todayKey]: m.value }))}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all hover:scale-110"
                style={{
                  background: mood[todayKey] === m.value ? m.color + "20" : "transparent",
                  border: mood[todayKey] === m.value ? `2px solid ${m.color}` : "2px solid transparent",
                }}
              >
                <span className="text-3xl">{m.emoji}</span>
                <span className="text-[10px] font-medium" style={{ color: mood[todayKey] === m.value ? m.color : currentTheme.colors.textMuted }}>{m.label}</span>
              </button>
            ))}
          </div>
          <div className="flex items-end gap-1 h-16">
            {weekKeys.map((k, i) => {
              const m = MOODS.find((x) => x.value === mood[k]);
              return (
                <div key={k} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-md transition-all" style={{ height: `${((mood[k] || 0) / 5) * 100}%`, background: m?.color || currentTheme.colors.primaryLight, minHeight: "4px" }} />
                  <span className="text-[9px]" style={{ color: currentTheme.colors.textMuted }}>{WEEK_DAYS[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Exercise tracker */}
        <div className="rounded-2xl p-5" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-green-500" />
              <h3 className="font-display text-lg font-semibold" style={{ color: currentTheme.colors.text }}>Exercícios hoje</h3>
            </div>
            {todayExercises.length > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-xs font-semibold text-green-600">{todayExercises.length} atividade{todayExercises.length > 1 ? "s" : ""}</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {EXERCISES.map((ex) => {
              const active = todayExercises.includes(ex.name);
              return (
                <button
                  key={ex.name}
                  onClick={() => toggleExercise(ex.name)}
                  className="flex items-center gap-2 p-3 rounded-xl text-left transition-all hover:opacity-80"
                  style={{
                    background: active ? "#D1FAE5" : currentTheme.colors.primaryLight,
                    border: active ? "2px solid #10B981" : "2px solid transparent",
                  }}
                >
                  <Dumbbell className="w-4 h-4 flex-shrink-0" style={{ color: active ? "#10B981" : currentTheme.colors.textMuted }} />
                  <div>
                    <p className="text-xs font-semibold" style={{ color: active ? "#065F46" : currentTheme.colors.text }}>{ex.name}</p>
                    <p className="text-[10px]" style={{ color: active ? "#10B981" : currentTheme.colors.textMuted }}>{ex.duration} min</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
