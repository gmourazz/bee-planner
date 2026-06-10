import {
  Droplets,
  Moon,
  Dumbbell,
  Plus,
  Minus,
  TrendingUp,
  Heart,
  Activity,
  Laugh,
  Smile,
  Meh,
  Frown,
  Annoyed,
  Settings2,
  Sparkles,
  Watch,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useHealth } from "../hooks/useHealth";

const CUP_SIZES = [150, 200, 250, 300, 350, 500]

// 35 ml por kg de peso corporal — recomendação médica padrão no Brasil
const ML_POR_KG = 35

function useWaterPrefs() {
  const [cupSize,    setCupSizeState]    = useState(() => Number(localStorage.getItem('bp_cup_size')    || 200))
  const [waterGoal,  setWaterGoalState]  = useState(() => Number(localStorage.getItem('bp_water_goal')  || 8))
  const [weightKg,   setWeightKgState]   = useState(() => Number(localStorage.getItem('bp_weight_kg')   || 0))
  const [heightCm,   setHeightCmState]   = useState(() => Number(localStorage.getItem('bp_height_cm')   || 0))

  const setCupSize   = (v: number) => { setCupSizeState(v);   localStorage.setItem('bp_cup_size',    String(v)) }
  const setWaterGoal = (v: number) => { if (v < 1) return; setWaterGoalState(v); localStorage.setItem('bp_water_goal', String(v)) }
  const setWeightKg  = (v: number) => { setWeightKgState(v);  localStorage.setItem('bp_weight_kg',  String(v)) }
  const setHeightCm  = (v: number) => { setHeightCmState(v);  localStorage.setItem('bp_height_cm',  String(v)) }

  // litros recomendados com base no peso; null se peso não informado
  const recommendedLiters = weightKg > 0 ? (weightKg * ML_POR_KG) / 1000 : null
  // quantidade de copos recomendada conforme tamanho atual do copo
  const recommendedCups   = recommendedLiters !== null
    ? Math.ceil((recommendedLiters * 1000) / cupSize)
    : null

  return {
    cupSize, setCupSize,
    waterGoal, setWaterGoal,
    weightKg, setWeightKg,
    heightCm, setHeightCm,
    recommendedLiters, recommendedCups,
  }
}

const MOODS: { label: string; Icon: LucideIcon; value: number }[] = [
  { label: "Ótimo",   Icon: Laugh,   value: 5 },
  { label: "Bem",     Icon: Smile,   value: 4 },
  { label: "Neutro",  Icon: Meh,     value: 3 },
  { label: "Mal",     Icon: Frown,   value: 2 },
  { label: "Péssimo", Icon: Annoyed, value: 1 },
];

const EXERCISES = [
  { name: "Caminhada", duration: 30 },
  { name: "Corrida",   duration: 20 },
  { name: "Academia",  duration: 60 },
  { name: "Yoga",      duration: 45 },
  { name: "Natação",   duration: 40 },
  { name: "Ciclismo",  duration: 50 },
];

const WEEK_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export function HealthPage() {
  const { currentTheme } = useTheme();
  const {
    logs, loading, weekKeys, todayKey,
    adjustWater, setWaterDirect,
    adjustSleep,
    setMoodValue,
    toggleExercise,
  } = useHealth();

  const {
    cupSize, setCupSize,
    waterGoal, setWaterGoal,
    weightKg, setWeightKg,
    heightCm, setHeightCm,
    recommendedLiters, recommendedCups,
  } = useWaterPrefs()
  const [showWaterSettings, setShowWaterSettings] = useState(false)

  const todayLog       = logs[todayKey]
  const todayWater     = todayLog?.water     ?? 0
  const todaySleep     = todayLog?.sleep     ?? 0
  const todayMoodVal   = todayLog?.mood      ?? null
  const todayExercises = todayLog?.exercises ?? []
  const todaySteps     = todayLog?.steps     ?? 0

  const todayMood = MOODS.find(m => m.value === todayMoodVal)

  const avgSleep = weekKeys.reduce((s, k) => s + (logs[k]?.sleep ?? 0), 0) / 7
  const avgWater = weekKeys.reduce((s, k) => s + (logs[k]?.water ?? 0), 0) / 7

  const todayLiters = (todayWater * cupSize / 1000)
  const goalLiters  = (waterGoal * cupSize / 1000)
  const avgLiters   = (avgWater * cupSize / 1000)

  const moodBarColor = (val: number) => {
    if (val >= 4) return currentTheme.colors.primary
    if (val === 3) return currentTheme.colors.accent
    return currentTheme.colors.textMuted
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center" style={{ background: currentTheme.colors.background }}>
      <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>Carregando...</p>
    </div>
  )

  return (
    <div className="flex-1 overflow-auto p-6" style={{ background: currentTheme.colors.background }}>
      <div className="max-w-6xl mx-auto w-full">
      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl p-4" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
            <span className="text-xs" style={{ color: currentTheme.colors.textMuted }}>Humor hoje</span>
          </div>
          {todayMood ? (
            <>
              <todayMood.Icon className="w-10 h-10 mb-1" style={{ color: moodBarColor(todayMood.value) }} />
              <p className="text-xs font-medium" style={{ color: currentTheme.colors.text }}>{todayMood.label}</p>
            </>
          ) : (
            <p className="text-xs mt-2" style={{ color: currentTheme.colors.textMuted }}>Não registrado</p>
          )}
        </div>

        <div className="rounded-2xl p-4" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
          <div className="flex items-center gap-2 mb-2">
            <Moon className="w-4 h-4" style={{ color: currentTheme.colors.primaryDark }} />
            <span className="text-xs" style={{ color: currentTheme.colors.textMuted }}>Sono médio</span>
          </div>
          <p className="text-3xl font-bold" style={{ color: currentTheme.colors.text }}>{avgSleep.toFixed(1)}h</p>
          <p className="text-xs" style={{ color: currentTheme.colors.textMuted }}>últimos 7 dias</p>
        </div>

        <div className="rounded-2xl p-4" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-4 h-4" style={{ color: currentTheme.colors.accent }} />
            <span className="text-xs" style={{ color: currentTheme.colors.textMuted }}>Água média</span>
          </div>
          <p className="text-3xl font-bold" style={{ color: currentTheme.colors.text }}>{avgLiters.toFixed(1)}L</p>
          <p className="text-xs" style={{ color: currentTheme.colors.textMuted }}>{avgWater.toFixed(1)} copos/dia</p>
        </div>

        <div className="rounded-2xl p-4" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10`, opacity: 0.75 }}>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4" style={{ color: currentTheme.colors.textMuted }} />
            <span className="text-xs" style={{ color: currentTheme.colors.textMuted }}>Passos hoje</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 mb-1">
            <Watch className="w-4 h-4" style={{ color: currentTheme.colors.textMuted }} />
            <span className="text-xs font-medium" style={{ color: currentTheme.colors.textMuted }}>Sincronização pendente</span>
          </div>
          <p className="text-[10px] leading-snug" style={{ color: currentTheme.colors.textMuted }}>
            Requer Apple Watch ou smartwatch conectado.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Water tracker */}
        <div className="rounded-2xl p-5" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5" style={{ color: currentTheme.colors.accent }} />
              <h3 className="font-display text-lg font-semibold" style={{ color: currentTheme.colors.text }}>Hidratação</h3>
            </div>
            <button
              onClick={() => setShowWaterSettings(v => !v)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
              style={{ background: showWaterSettings ? currentTheme.colors.primaryLight : 'transparent' }}
            >
              <Settings2 className="w-4 h-4" style={{ color: currentTheme.colors.textMuted }} />
            </button>
          </div>

          {/* Configurações (expansível) */}
          {showWaterSettings && (
            <div className="mb-4 p-3 rounded-xl" style={{ background: currentTheme.colors.background }}>
              <div className="mb-3">
                <p className="text-xs font-medium mb-2" style={{ color: currentTheme.colors.textMuted }}>Tamanho do copo</p>
                <div className="flex gap-1.5 flex-wrap">
                  {CUP_SIZES.map(ml => (
                    <button
                      key={ml}
                      onClick={() => setCupSize(ml)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: cupSize === ml ? currentTheme.colors.primary : currentTheme.colors.surface,
                        color: cupSize === ml ? '#fff' : currentTheme.colors.textMuted,
                        border: cupSize === ml ? `1.5px solid ${currentTheme.colors.primary}` : `1.5px solid ${currentTheme.colors.primaryLight}`,
                      }}
                    >
                      {ml}ml
                    </button>
                  ))}
                </div>
              </div>
              {/* Perfil corporal */}
              <div className="mb-3">
                <p className="text-xs font-medium mb-2" style={{ color: currentTheme.colors.textMuted }}>Perfil corporal</p>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[10px]" style={{ color: currentTheme.colors.textMuted }}>Peso (kg)</label>
                    <input
                      type="number"
                      min={1} max={300}
                      value={weightKg || ''}
                      onChange={e => setWeightKg(Number(e.target.value))}
                      placeholder="Ex: 65"
                      className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg text-xs outline-none"
                      style={{ background: currentTheme.colors.surface, color: currentTheme.colors.text, border: `1.5px solid ${currentTheme.colors.primaryLight}` }}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px]" style={{ color: currentTheme.colors.textMuted }}>Altura (cm)</label>
                    <input
                      type="number"
                      min={50} max={250}
                      value={heightCm || ''}
                      onChange={e => setHeightCm(Number(e.target.value))}
                      placeholder="Ex: 165"
                      className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg text-xs outline-none"
                      style={{ background: currentTheme.colors.surface, color: currentTheme.colors.text, border: `1.5px solid ${currentTheme.colors.primaryLight}` }}
                    />
                  </div>
                </div>
                {/* Recomendação baseada no peso */}
                {recommendedLiters !== null && (
                  <div
                    className="mt-2 flex items-center justify-between px-3 py-2 rounded-xl"
                    style={{ background: `${currentTheme.colors.primary}15`, border: `1.5px solid ${currentTheme.colors.primary}30` }}
                  >
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" style={{ color: currentTheme.colors.primary }} />
                      <span className="text-xs" style={{ color: currentTheme.colors.text }}>
                        Recomendado: <strong>{recommendedLiters.toFixed(1)}L</strong>
                        <span className="ml-1" style={{ color: currentTheme.colors.textMuted }}>
                          ({recommendedCups} copos de {cupSize}ml)
                        </span>
                      </span>
                    </div>
                    <button
                      onClick={() => setWaterGoal(recommendedCups!)}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all hover:opacity-80"
                      style={{ background: currentTheme.colors.primary, color: '#fff' }}
                    >
                      Aplicar
                    </button>
                  </div>
                )}
                {weightKg === 0 && (
                  <p className="mt-1.5 text-[10px]" style={{ color: currentTheme.colors.textMuted }}>
                    Informe seu peso para receber uma recomendação personalizada de água diária.
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs font-medium mb-2" style={{ color: currentTheme.colors.textMuted }}>Meta diária</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setWaterGoal(waterGoal - 1)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
                    style={{ background: currentTheme.colors.primaryLight }}
                  >
                    <Minus className="w-3 h-3" style={{ color: currentTheme.colors.primaryDark }} />
                  </button>
                  <span className="text-sm font-bold" style={{ color: currentTheme.colors.text }}>{waterGoal} copos</span>
                  <button
                    onClick={() => setWaterGoal(waterGoal + 1)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
                    style={{ background: currentTheme.colors.primary }}
                  >
                    <Plus className="w-3 h-3 text-white" />
                  </button>
                  <span className="text-xs" style={{ color: currentTheme.colors.textMuted }}>= {goalLiters.toFixed(1)}L</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-3">
            <button onClick={() => adjustWater(-1)} className="w-10 h-10 rounded-xl flex items-center justify-center hover:opacity-70 transition-all" style={{ background: currentTheme.colors.primaryLight }}>
              <Minus className="w-4 h-4" style={{ color: currentTheme.colors.primaryDark }} />
            </button>
            <div className="text-center">
              <p className="text-4xl font-bold" style={{ color: currentTheme.colors.text }}>{todayWater}</p>
              <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>de {waterGoal} copos ({cupSize}ml)</p>
              <p className="text-base font-semibold mt-0.5" style={{ color: currentTheme.colors.primary }}>
                {todayLiters.toFixed(2)}L <span className="text-xs font-normal" style={{ color: currentTheme.colors.textMuted }}>de {goalLiters.toFixed(1)}L</span>
              </p>
            </div>
            <button onClick={() => adjustWater(1)} className="w-10 h-10 rounded-xl flex items-center justify-center hover:opacity-70 transition-all" style={{ background: currentTheme.colors.primary }}>
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Barra de progresso */}
          <div className="w-full h-1.5 rounded-full mb-3" style={{ background: currentTheme.colors.primaryLight }}>
            <div
              className="h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(100, (todayWater / waterGoal) * 100)}%`, background: currentTheme.colors.primary }}
            />
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {Array.from({ length: waterGoal }, (_, i) => (
              <div
                key={i}
                onClick={() => setWaterDirect(i + 1)}
                className="w-8 h-10 rounded-lg cursor-pointer transition-all hover:scale-110 flex items-end justify-center pb-1"
                style={{ background: i < todayWater ? currentTheme.colors.primary : currentTheme.colors.primaryLight }}
              >
                <Droplets className="w-3 h-3" style={{ color: i < todayWater ? "#fff" : currentTheme.colors.textMuted }} />
              </div>
            ))}
          </div>
        </div>

        {/* Sleep tracker */}
        <div className="rounded-2xl p-5" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
          <div className="flex items-center gap-2 mb-4">
            <Moon className="w-5 h-5" style={{ color: currentTheme.colors.primaryDark }} />
            <h3 className="font-display text-lg font-semibold" style={{ color: currentTheme.colors.text }}>Sono</h3>
          </div>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => adjustSleep(-0.5)} className="w-10 h-10 rounded-xl flex items-center justify-center hover:opacity-70 transition-all" style={{ background: currentTheme.colors.primaryLight }}>
              <Minus className="w-4 h-4" style={{ color: currentTheme.colors.primaryDark }} />
            </button>
            <div className="text-center">
              <p className="text-4xl font-bold" style={{ color: currentTheme.colors.text }}>{todaySleep}h</p>
              <p className="text-sm" style={{ color: todaySleep >= 7 ? currentTheme.colors.primary : currentTheme.colors.accent }}>
                {todaySleep >= 8 ? "Excelente!" : todaySleep >= 7 ? "Bom" : todaySleep >= 6 ? "Razoável" : todaySleep > 0 ? "Pouco" : "—"}
              </p>
            </div>
            <button onClick={() => adjustSleep(0.5)} className="w-10 h-10 rounded-xl flex items-center justify-center hover:opacity-70 transition-all" style={{ background: currentTheme.colors.primary }}>
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="flex items-end gap-1 h-16">
            {weekKeys.map((k, i) => {
              const h = logs[k]?.sleep ?? 0
              return (
                <div key={k} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-md transition-all" style={{ height: `${(h / 12) * 100}%`, background: h >= 7 ? currentTheme.colors.primary : currentTheme.colors.accent, minHeight: h > 0 ? "4px" : "0" }} />
                  <span className="text-[9px]" style={{ color: currentTheme.colors.textMuted }}>{WEEK_DAYS[i]}</span>
                </div>
              )
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
            {MOODS.map(m => {
              const active = todayMoodVal === m.value
              const barColor = moodBarColor(m.value)
              return (
                <button
                  key={m.value}
                  onClick={() => setMoodValue(m.value)}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all hover:scale-110"
                  style={{
                    background: active ? barColor + "20" : "transparent",
                    border: active ? `2px solid ${barColor}` : "2px solid transparent",
                  }}
                >
                  <m.Icon className="w-8 h-8" style={{ color: active ? barColor : currentTheme.colors.textMuted }} />
                  <span className="text-[10px] font-medium" style={{ color: active ? barColor : currentTheme.colors.textMuted }}>{m.label}</span>
                </button>
              )
            })}
          </div>
          <div className="flex items-end gap-1 h-16">
            {weekKeys.map((k, i) => {
              const val = logs[k]?.mood ?? 0
              return (
                <div key={k} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-md transition-all" style={{ height: `${(val / 5) * 100}%`, background: moodBarColor(val), minHeight: val > 0 ? "4px" : "0" }} />
                  <span className="text-[9px]" style={{ color: currentTheme.colors.textMuted }}>{WEEK_DAYS[i]}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Exercise tracker */}
        <div className="rounded-2xl p-5" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5" style={{ color: currentTheme.colors.primaryDark }} />
              <h3 className="font-display text-lg font-semibold" style={{ color: currentTheme.colors.text }}>Exercícios hoje</h3>
            </div>
            {todayExercises.length > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ background: currentTheme.colors.primaryLight }}>
                <TrendingUp className="w-3 h-3" style={{ color: currentTheme.colors.primaryDark }} />
                <span className="text-xs font-semibold" style={{ color: currentTheme.colors.primaryDark }}>
                  {todayExercises.length} atividade{todayExercises.length > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {EXERCISES.map(ex => {
              const active = todayExercises.includes(ex.name)
              return (
                <button
                  key={ex.name}
                  onClick={() => toggleExercise(ex.name)}
                  className="flex items-center gap-2 p-3 rounded-xl text-left transition-all hover:opacity-80"
                  style={{
                    background: active ? currentTheme.colors.primaryLight : currentTheme.colors.background,
                    border: active ? `2px solid ${currentTheme.colors.primary}` : "2px solid transparent",
                  }}
                >
                  <Dumbbell className="w-4 h-4 flex-shrink-0" style={{ color: active ? currentTheme.colors.primary : currentTheme.colors.textMuted }} />
                  <div>
                    <p className="text-xs font-semibold" style={{ color: active ? currentTheme.colors.primaryDark : currentTheme.colors.text }}>{ex.name}</p>
                    <p className="text-[10px]" style={{ color: active ? currentTheme.colors.primary : currentTheme.colors.textMuted }}>{ex.duration} min</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

      </div>
      </div>{/* fecha max-w */}
    </div>
  )
}
