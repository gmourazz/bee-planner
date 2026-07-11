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
  Coffee,
  GlassWater,
  Milk,
  CupSoda,
  FlaskConical,
  Pencil,
  ChevronUp,
  ChevronDown,
  Bike,
  Waves,
  Footprints,
  PersonStanding,
  Wind,
  Crown,
  type LucideIcon,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useHealth } from "../hooks/useHealth";
import { fetchHealthLogs } from "../services/health";
import { fetchWaterPrefs, updateWaterPrefs } from "../services/profile";
import { DatePickerInput } from "../components/DatePickerInput";
import type { HealthLog } from "../types/health.types";

const CUP_SIZES = [250, 300, 350, 500, 1000, 2000]

const CUP_ICON_MAP: Record<number, LucideIcon> = {
  250:  GlassWater,   // copo médio
  300:  GlassWater,   // copo grande
  350:  CupSoda,      // copo com canudo
  500:  Milk,         // garrafinha / copo 500ml
  1000: FlaskConical, // garrafa 1L
  2000: FlaskConical, // garrafa 2L
}
function getCupIcon(ml: number): LucideIcon {
  return CUP_ICON_MAP[ml] ?? GlassWater
}

// 35 ml por kg de peso corporal — recomendação médica padrão no Brasil
const ML_POR_KG = 35

function useWaterPrefs() {
  const [cupSize,          setCupSizeState]     = useState(250)
  const [waterGoal,        setWaterGoalState]   = useState(8)
  const [weightKg,         setWeightKgState]    = useState<number | null>(null)
  const [heightCm,         setHeightCmState]    = useState<number | null>(null)
  const [savedCustomSizes, setSavedCustomSizes] = useState<number[]>([])

  useEffect(() => {
    fetchWaterPrefs().then(p => {
      setCupSizeState(p.cup_size)
      setWaterGoalState(p.water_goal)
      setWeightKgState(p.weight_kg)
      setHeightCmState(p.height_cm)
      setSavedCustomSizes(p.custom_cup_sizes)
    }).catch(() => {})
  }, [])

  const setCupSize   = (v: number) => { setCupSizeState(v);   updateWaterPrefs({ cup_size: v }) }
  const setWaterGoal = (v: number) => { if (v < 1) return; setWaterGoalState(v); updateWaterPrefs({ water_goal: v }) }
  const setWeightKg  = (v: number | null) => { setWeightKgState(v);  updateWaterPrefs({ weight_kg: v }) }
  const setHeightCm  = (v: number | null) => { setHeightCmState(v);  updateWaterPrefs({ height_cm: v }) }
  const setCustomSizes = (sizes: number[]) => { setSavedCustomSizes(sizes); updateWaterPrefs({ custom_cup_sizes: sizes }) }

  const recommendedLiters = weightKg && weightKg > 0 ? (weightKg * ML_POR_KG) / 1000 : null
  const recommendedCups   = recommendedLiters !== null
    ? Math.ceil((recommendedLiters * 1000) / cupSize)
    : null

  return {
    cupSize, setCupSize,
    waterGoal, setWaterGoal,
    weightKg, setWeightKg,
    heightCm, setHeightCm,
    recommendedLiters, recommendedCups,
    savedCustomSizes, setCustomSizes,
  }
}

const MOODS: { label: string; Icon: LucideIcon; value: number }[] = [
  { label: "Ótimo",   Icon: Laugh,   value: 5 },
  { label: "Bom",     Icon: Smile,   value: 4 },
  { label: "Neutro",  Icon: Meh,     value: 3 },
  { label: "Mal",     Icon: Frown,   value: 2 },
  { label: "Péssimo", Icon: Annoyed, value: 1 },
];

const EXERCISES: { name: string; duration: number; icon: LucideIcon }[] = [
  { name: "Caminhada", duration: 30, icon: Footprints },
  { name: "Corrida",   duration: 20, icon: Wind       },
  { name: "Academia",  duration: 60, icon: Dumbbell   },
  { name: "Yoga",      duration: 45, icon: PersonStanding },
  { name: "Natação",   duration: 40, icon: Waves      },
  { name: "Ciclismo",  duration: 50, icon: Bike       },
];

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_NAMES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
function keyToDayName(key: string) {
  return DAY_NAMES[new Date(key + 'T12:00:00').getDay()];
}
function daysAgoKey(n: number) {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0];
}
function startOfYearKey() { return new Date().getFullYear() + '-01-01'; }

const COLOR_SLEEP = '#C4B5FD'   // lilás pastel
const COLOR_WATER = '#93C5FD'   // azul pastel

type PeriodKey = '7d' | '30d' | 'meses' | 'ano';
type HistoryPoint = { label: string; date?: string; sleep: number; waterCups: number; mood: number };

function avg(arr: number[]) { return arr.length ? arr.reduce((a,b) => a+b,0)/arr.length : 0; }

function buildHistoryPoints(logs: Record<string, HealthLog>, period: PeriodKey, selectedYear = new Date().getFullYear()): HistoryPoint[] {
  if (period === '7d' || period === '30d') {
    const days = period === '7d' ? 7 : 30;
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().split('T')[0];
      const log = logs[key];
      const label = period === '7d' ? DAY_NAMES[d.getDay()] : String(d.getDate());
      const date = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
      return { label, date, sleep: log?.sleep ?? 0, waterCups: log?.water ?? 0, mood: log?.mood ?? 0 };
    });
  }
  if (period === 'meses') {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - i));
      const ym = d.toISOString().slice(0, 7);
      const dayLogs = Object.entries(logs).filter(([k]) => k.startsWith(ym)).map(([,v]) => v);
      return {
        label: MONTH_NAMES[d.getMonth()],
        sleep: avg(dayLogs.map(l => l.sleep)),
        waterCups: avg(dayLogs.map(l => l.water)),
        mood: avg(dayLogs.filter(l => l.mood).map(l => l.mood!)),
      };
    });
  }
  // ano
  return Array.from({ length: 12 }, (_, m) => {
    const ym = `${selectedYear}-${String(m+1).padStart(2,'0')}`;
    const dayLogs = Object.entries(logs).filter(([k]) => k.startsWith(ym)).map(([,v]) => v);
    return {
      label: MONTH_NAMES[m],
      sleep: avg(dayLogs.map(l => l.sleep)),
      waterCups: avg(dayLogs.map(l => l.water)),
      mood: avg(dayLogs.filter(l => l.mood).map(l => l.mood!)),
    };
  });
}

export function HealthPage() {
  const { currentTheme } = useTheme();
  const {
    logs, loading, weekKeys, todayKey,
    adjustWater, setWaterDirect,
    adjustSleep, setSleepDirect,
    setMoodValue,
    toggleExercise,
    setSteps,
  } = useHealth();

  const {
    cupSize, setCupSize,
    waterGoal, setWaterGoal,
    weightKg, setWeightKg,
    heightCm, setHeightCm,
    recommendedLiters, recommendedCups,
    savedCustomSizes, setCustomSizes,
  } = useWaterPrefs()
  const [showWaterSettings, setShowWaterSettings] = useState(false)
  const [showWaterModal, setShowWaterModal] = useState(false)
  const [waterModalDate, setWaterModalDate] = useState(todayKey)
  const [waterModalCups, setWaterModalCups] = useState(0)
  const [waterModalIsToday, setWaterModalIsToday] = useState(true)
  const [showSleepModal, setShowSleepModal] = useState(false)
  const [sleepModalDate, setSleepModalDate] = useState(todayKey)
  const [sleepModalHours, setSleepModalHours] = useState(0)
  const [sleepModalIsToday, setSleepModalIsToday] = useState(true)
  const [customCupInput, setCustomCupInput] = useState('')
  const [showCustomCup, setShowCustomCup] = useState(false)
  const [saveCustomCup, setSaveCustomCup] = useState(false)
  const [editingSteps, setEditingSteps] = useState(false)
  const [stepsInput, setStepsInput] = useState('')
  const [stepsDate, setStepsDate] = useState(todayKey)
  const [showHistory, setShowHistory] = useState(() => localStorage.getItem('bp_show_history') !== 'false')
  const [historyPeriod, setHistoryPeriod] = useState<PeriodKey>('7d')
  const [historyLogs, setHistoryLogs] = useState<Record<string, HealthLog>>({})
  const [historyLoading, setHistoryLoading] = useState(false)
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)

  useEffect(() => {
    let since: string
    if (historyPeriod === '7d')    since = daysAgoKey(6)
    else if (historyPeriod === '30d')  since = daysAgoKey(29)
    else if (historyPeriod === 'meses') since = daysAgoKey(5 * 30)
    else since = `${selectedYear}-01-01`

    setHistoryLoading(true)
    fetchHealthLogs(since)
      .then(data => {
        const map: Record<string, HealthLog> = {}
        data.forEach(l => { map[l.log_date] = l })
        setHistoryLogs(map)
      })
      .catch(() => {})
      .finally(() => setHistoryLoading(false))
  }, [historyPeriod, selectedYear])

  const historyPoints = useMemo(
    () => buildHistoryPoints(historyLogs, historyPeriod, selectedYear),
    [historyLogs, historyPeriod, selectedYear]
  )

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
    if (val === 3) return currentTheme.colors.primary + 'bb'
    if (val > 0)  return currentTheme.colors.primary + '70'
    return currentTheme.colors.textMuted
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center" style={{ background: currentTheme.colors.background }}>
      <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>Carregando...</p>
    </div>
  )

  return (
    <>
    <div className="flex-1 overflow-auto p-6" style={{ background: currentTheme.colors.background }}>
      <div className="max-w-6xl mx-auto w-full">
      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
            <Moon className="w-4 h-4" style={{ color: COLOR_SLEEP }} />
            <span className="text-xs" style={{ color: currentTheme.colors.textMuted }}>Sono médio</span>
          </div>
          <p className="text-3xl font-bold" style={{ color: COLOR_SLEEP }}>{avgSleep.toFixed(1)}h</p>
          <p className="text-xs" style={{ color: currentTheme.colors.textMuted }}>últimos 7 dias</p>
        </div>

        <div className="rounded-2xl p-4" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-4 h-4" style={{ color: COLOR_WATER }} />
            <span className="text-xs" style={{ color: currentTheme.colors.textMuted }}>Água média</span>
          </div>
          <p className="text-3xl font-bold" style={{ color: COLOR_WATER }}>{avgLiters.toFixed(1)}L</p>
          <p className="text-xs" style={{ color: currentTheme.colors.textMuted }}>{avgWater.toFixed(1)} copos/dia</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Water tracker */}
        <div className="rounded-2xl p-5 flex flex-col" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
          <div className="flex items-center gap-2 mb-4">
            <Droplets className="w-5 h-5" style={{ color: COLOR_WATER }} />
            <h3 className="font-display text-lg font-semibold" style={{ color: currentTheme.colors.text }}>Hidratação</h3>
          </div>

          <div className="flex items-center justify-between mb-3">
            <button onClick={() => adjustWater(-1)} className="w-10 h-10 rounded-xl flex items-center justify-center hover:opacity-70 transition-all" style={{ background: COLOR_WATER + '30' }}>
              <Minus className="w-4 h-4" style={{ color: COLOR_WATER }} />
            </button>
            <div className="text-center">
              <p className="text-4xl font-bold" style={{ color: currentTheme.colors.text }}>{todayWater}</p>
              <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>de {waterGoal} copos ({cupSize}ml)</p>
              <p className="text-base font-semibold mt-0.5" style={{ color: COLOR_WATER }}>
                {todayLiters.toFixed(2)}L <span className="text-xs font-normal" style={{ color: currentTheme.colors.textMuted }}>de {goalLiters.toFixed(1)}L</span>
              </p>
            </div>
            <button
              onClick={() => {
                setWaterModalIsToday(true)
                setWaterModalDate(todayKey)
                setWaterModalCups(todayWater)
                setShowWaterModal(true)
              }}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:opacity-70 transition-all"
              style={{ background: COLOR_WATER }}
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Barra de progresso */}
          <div className="w-full h-1.5 rounded-full mb-3" style={{ background: COLOR_WATER + '30' }}>
            <div
              className="h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(100, (todayWater / waterGoal) * 100)}%`, background: COLOR_WATER }}
            />
          </div>

          <div className="flex gap-1.5 flex-wrap mt-auto pt-3">
            {Array.from({ length: waterGoal }, (_, i) => (
              <div
                key={i}
                onClick={() => setWaterDirect(i + 1)}
                className="w-8 h-10 rounded-lg cursor-pointer transition-all hover:scale-110 flex items-end justify-center pb-1"
                style={{ background: i < todayWater ? COLOR_WATER : COLOR_WATER + '30' }}
              >
                <Droplets className="w-3 h-3" style={{ color: i < todayWater ? "#fff" : COLOR_WATER }} />
              </div>
            ))}
          </div>
        </div>

        {/* Sleep tracker */}
        <div className="rounded-2xl p-5 flex flex-col" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
          <div className="flex items-center gap-2 mb-4">
            <Moon className="w-5 h-5" style={{ color: COLOR_SLEEP }} />
            <h3 className="font-display text-lg font-semibold" style={{ color: currentTheme.colors.text }}>Sono</h3>
          </div>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => adjustSleep(-0.5)} className="w-10 h-10 rounded-xl flex items-center justify-center hover:opacity-70 transition-all" style={{ background: COLOR_SLEEP + '30' }}>
              <Minus className="w-4 h-4" style={{ color: COLOR_SLEEP }} />
            </button>
            <div className="text-center">
              <p className="text-4xl font-bold" style={{ color: COLOR_SLEEP }}>{todaySleep}h</p>
              <p className="text-sm" style={{ color: COLOR_SLEEP + (todaySleep > 0 ? '' : '80') }}>
                {todaySleep >= 8 ? "Excelente!" : todaySleep >= 7 ? "Bom" : todaySleep >= 6 ? "Razoável" : todaySleep > 0 ? "Pouco" : "—"}
              </p>
            </div>
            <button
              onClick={() => { setSleepModalIsToday(true); setSleepModalDate(todayKey); setSleepModalHours(todaySleep); setShowSleepModal(true) }}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:opacity-70 transition-all"
              style={{ background: COLOR_SLEEP }}
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="flex items-end gap-1 h-16 mt-auto">
            {weekKeys.map((k, i) => {
              const h = logs[k]?.sleep ?? 0
              return (
                <div key={k} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-md transition-all" style={{ height: `${(h / 12) * 100}%`, background: h >= 7 ? COLOR_SLEEP : COLOR_SLEEP + '80', minHeight: h > 0 ? "4px" : "0" }} />
                  <span className="text-[9px]" style={{ color: currentTheme.colors.textMuted }}>{keyToDayName(k)}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Mood tracker */}
        <div className="rounded-2xl p-5 flex flex-col" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
          {/* Header: título + resumo inline */}
          {(() => {
            const weekMoods = weekKeys.map(k => logs[k]?.mood ?? 0).filter(v => v > 0)
            const minMood = weekMoods.length ? MOODS.find(m => m.value === Math.min(...weekMoods)) : null
            const maxMood = weekMoods.length ? MOODS.find(m => m.value === Math.max(...weekMoods)) : null
            const fmtDate = (key: string) => {
              const dt = new Date(key + 'T12:00:00')
              return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}`
            }
            const resumo = minMood && maxMood
              ? (minMood.value === maxMood.value
                  ? `Sempre ${minMood.label.toLowerCase()} · ${fmtDate(weekKeys[0])}–${fmtDate(weekKeys[weekKeys.length-1])}`
                  : `${minMood.label} → ${maxMood.label} · ${fmtDate(weekKeys[0])}–${fmtDate(weekKeys[weekKeys.length-1])}`)
              : null
            return (
              <div className="flex items-center gap-3 mb-4 overflow-hidden">
                <div className="flex items-center gap-2 shrink-0">
                  <Smile className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                  <h3 className="font-display text-lg font-semibold" style={{ color: currentTheme.colors.text }}>Humor</h3>
                </div>
                {resumo && (
                  <span className="text-[10px]" style={{ color: currentTheme.colors.textMuted }}>{resumo}</span>
                )}
              </div>
            )
          })()}
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
          <div className="flex items-end gap-1 h-16 mt-auto">
            {weekKeys.map((k, i) => {
              const val = logs[k]?.mood ?? 0
              return (
                <div key={k} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-md transition-all" style={{ height: `${(val / 5) * 100}%`, background: moodBarColor(val), minHeight: val > 0 ? "4px" : "0" }} />
                  <span className="text-[9px]" style={{ color: currentTheme.colors.textMuted }}>{keyToDayName(k)}</span>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* ── HISTÓRICO ── */}
      <div className="mt-6 rounded-2xl p-5" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
        {/* Header com toggle */}
        <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: showHistory ? '20px' : 0 }}>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
            <h3 className="font-semibold text-base" style={{ color: currentTheme.colors.text }}>Histórico</h3>
          </div>
          <button
            onClick={() => setShowHistory(v => { const next = !v; localStorage.setItem('bp_show_history', String(next)); return next })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
            style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}
          >
            <ChevronDown className="w-3.5 h-3.5 transition-transform" style={{ transform: showHistory ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            {showHistory ? 'Ocultar histórico' : 'Ver histórico'}
          </button>
        </div>

        {showHistory && (
          <>
            {/* Tabs de período */}
            <div className="flex items-center justify-end mb-5 flex-wrap gap-2">
              {historyPeriod === 'ano' && (
                <div className="flex items-center gap-1 rounded-xl px-2 py-1" style={{ background: currentTheme.colors.background }}>
                  <button
                    onClick={() => setSelectedYear(y => y - 1)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center hover:opacity-70 transition-all text-xs font-bold"
                    style={{ color: currentTheme.colors.primaryDark }}
                  >‹</button>
                  <span className="text-xs font-semibold px-1" style={{ color: currentTheme.colors.text, minWidth: 36, textAlign: 'center' }}>
                    {selectedYear}
                  </span>
                  <button
                    onClick={() => setSelectedYear(y => Math.min(currentYear, y + 1))}
                    className="w-6 h-6 rounded-lg flex items-center justify-center hover:opacity-70 transition-all text-xs font-bold"
                    style={{ color: selectedYear < currentYear ? currentTheme.colors.primaryDark : currentTheme.colors.textMuted }}
                    disabled={selectedYear >= currentYear}
                  >›</button>
                </div>
              )}
              <div className="flex gap-1 p-1 rounded-xl" style={{ background: currentTheme.colors.background }}>
                {([
                  { key: '7d',    label: '7 dias' },
                  { key: '30d',   label: '30 dias' },
                  { key: 'meses', label: 'Meses' },
                  { key: 'ano',   label: 'Ano' },
                ] as { key: PeriodKey; label: string }[]).map(p => (
                  <button
                    key={p.key}
                    onClick={() => setHistoryPeriod(p.key)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: historyPeriod === p.key ? currentTheme.colors.primary : 'transparent',
                      color: historyPeriod === p.key ? '#fff' : currentTheme.colors.textMuted,
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Conteúdo */}
            {historyLoading ? (
              <p className="text-xs text-center py-6" style={{ color: currentTheme.colors.textMuted }}>Carregando...</p>
            ) : (historyPeriod === '7d' || historyPeriod === '30d') ? (
              /* ── Tabela dia a dia ── */
              <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${currentTheme.colors.primary}18` }}>
                <div className="grid grid-cols-4 px-4 py-2" style={{ background: currentTheme.colors.primaryLight }}>
                  <span className="text-xs font-semibold" style={{ color: currentTheme.colors.primaryDark }}>Dia</span>
                  <span className="text-xs font-semibold text-center flex items-center justify-center gap-1">
                    <Moon className="w-3 h-3" style={{ color: COLOR_SLEEP }} />
                    <span style={{ color: COLOR_SLEEP }}>Sono</span>
                  </span>
                  <span className="text-xs font-semibold text-center flex items-center justify-center gap-1">
                    <Droplets className="w-3 h-3" style={{ color: COLOR_WATER }} />
                    <span style={{ color: COLOR_WATER }}>Água</span>
                  </span>
                  <span className="text-xs font-semibold text-center" style={{ color: currentTheme.colors.primaryDark }}>
                    <Smile className="w-3 h-3 inline mr-1" />Humor
                  </span>
                </div>
                {historyPoints.map((p, i) => {
                  const isEven = i % 2 === 0
                  const moodInfo = MOODS.find(m => m.value === Math.round(p.mood))
                  const waterL = p.waterCups > 0 ? (p.waterCups * cupSize / 1000).toFixed(1) + 'L' : '—'
                  return (
                    <div
                      key={i}
                      className="grid grid-cols-4 px-4 py-3 items-center"
                      style={{ background: isEven ? currentTheme.colors.surface : currentTheme.colors.background }}
                    >
                      <div>
                        <p className="text-sm font-semibold" style={{ color: currentTheme.colors.text }}>{p.label}</p>
                        {p.date && <p className="text-[10px]" style={{ color: currentTheme.colors.textMuted }}>{p.date}</p>}
                      </div>
                      <p className="text-sm text-center font-medium" style={{ color: p.sleep > 0 ? COLOR_SLEEP : currentTheme.colors.textMuted }}>
                        {p.sleep > 0 ? p.sleep.toFixed(1) + 'h' : '—'}
                      </p>
                      <p className="text-sm text-center font-medium" style={{ color: p.waterCups > 0 ? COLOR_WATER : currentTheme.colors.textMuted }}>
                        {waterL}
                      </p>
                      <div className="flex items-center justify-center gap-1">
                        {moodInfo && p.mood > 0
                          ? <><moodInfo.Icon className="w-4 h-4" style={{ color: currentTheme.colors.primary }} /><span className="text-xs" style={{ color: currentTheme.colors.textMuted }}>{moodInfo.label}</span></>
                          : <span className="text-sm" style={{ color: currentTheme.colors.textMuted }}>—</span>
                        }
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              /* ── Gráficos para Meses / Ano ── */
              <div className="space-y-6">
                <HistoryChart
                  label="Sono" unit="h" icon={<Moon className="w-3.5 h-3.5" />}
                  points={historyPoints.map(p => ({ label: p.label, value: p.sleep }))}
                  maxValue={12} thresholdGood={7}
                  colorGood={COLOR_SLEEP} colorBad={COLOR_SLEEP + '99'} colorEmpty={currentTheme.colors.primaryLight}
                  textMuted={currentTheme.colors.textMuted} period={historyPeriod} formatValue={v => v.toFixed(1) + 'h'}
                />
                <HistoryChart
                  label="Água" unit="L" icon={<Droplets className="w-3.5 h-3.5" />}
                  points={historyPoints.map(p => ({ label: p.label, value: p.waterCups * cupSize / 1000 }))}
                  maxValue={4} thresholdGood={2}
                  colorGood={COLOR_WATER} colorBad={COLOR_WATER + '99'} colorEmpty={currentTheme.colors.primaryLight}
                  textMuted={currentTheme.colors.textMuted} period={historyPeriod} formatValue={v => v.toFixed(1) + 'L'}
                />
                <HistoryChart
                  label="Humor" unit="/5" icon={<Smile className="w-3.5 h-3.5" />}
                  points={historyPoints.map(p => ({ label: p.label, value: p.mood }))}
                  maxValue={5} thresholdGood={4}
                  colorGood={currentTheme.colors.primary} colorBad={currentTheme.colors.primary + 'aa'} colorEmpty={currentTheme.colors.primaryLight}
                  textMuted={currentTheme.colors.textMuted} period={historyPeriod} formatValue={v => v.toFixed(1)}
                />
              </div>
            )}
          </>
        )}
      </div>

      </div>{/* fecha max-w */}
    </div>

    {/* ── Modal de registro de água ── */}

    {showWaterModal && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        onClick={e => { if (e.target === e.currentTarget) setShowWaterModal(false) }}
      >
        <div className="w-full max-w-xl rounded-3xl p-8 flex flex-col" style={{ background: currentTheme.colors.surface, boxShadow: '0 24px 60px rgba(0,0,0,0.2)', minHeight: '620px' }}>

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5" style={{ color: COLOR_WATER }} />
              <h3 className="font-display text-lg font-semibold" style={{ color: currentTheme.colors.text }}>Registrar água</h3>
            </div>
            <button onClick={() => setShowWaterModal(false)} className="w-7 h-7 rounded-full flex items-center justify-center hover:opacity-70" style={{ background: currentTheme.colors.primaryLight }}>
              <span className="text-sm font-bold" style={{ color: currentTheme.colors.primaryDark }}>✕</span>
            </button>
          </div>

          {/* Seletor de dia */}
          <div className="mb-5">
            <p className="text-xs font-medium mb-2" style={{ color: currentTheme.colors.textMuted }}>Dia</p>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => { setWaterModalIsToday(true); setWaterModalDate(todayKey); setWaterModalCups(logs[todayKey]?.water ?? 0) }}
                className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: waterModalIsToday ? currentTheme.colors.primary : currentTheme.colors.primaryLight, color: waterModalIsToday ? '#fff' : currentTheme.colors.primaryDark }}
              >
                Hoje
              </button>
              <button
                onClick={() => { setWaterModalIsToday(false) }}
                className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: !waterModalIsToday ? currentTheme.colors.primary : currentTheme.colors.primaryLight, color: !waterModalIsToday ? '#fff' : currentTheme.colors.primaryDark }}
              >
                Outro dia
              </button>
            </div>
            {!waterModalIsToday && (
              <DatePickerInput
                value={waterModalDate}
                onChange={d => { setWaterModalDate(d); setWaterModalCups(logs[d]?.water ?? 0) }}
                placeholder="Selecionar data"
                theme={currentTheme}
                direction="down"
              />
            )}
          </div>

          {/* Tamanho do copo */}
          <div className="mb-5">
            <p className="text-xs font-medium mb-2" style={{ color: currentTheme.colors.textMuted }}>Tamanho do copo</p>
            <div className="flex gap-2 flex-wrap">
              {[...CUP_SIZES, ...savedCustomSizes].map(ml => (
                <button
                  key={ml}
                  onClick={() => { setCupSize(ml); setShowCustomCup(false) }}
                  className="px-3 py-1.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5"
                  style={{
                    background: cupSize === ml && !showCustomCup ? currentTheme.colors.primary : currentTheme.colors.primaryLight,
                    color: cupSize === ml && !showCustomCup ? '#fff' : currentTheme.colors.primaryDark,
                  }}
                >
                  {(() => { const Icon = getCupIcon(ml); return <Icon className="w-3.5 h-3.5" /> })()}
                  <span>{ml >= 1000 ? `${ml / 1000}L` : `${ml}ml`}</span>
                  {savedCustomSizes.includes(ml) && (
                    <span
                      onClick={e => {
                        e.stopPropagation()
                        const next = savedCustomSizes.filter(s => s !== ml)
                        setCustomSizes(next)
                      }}
                      className="ml-0.5 opacity-60 hover:opacity-100 font-bold text-xs leading-none"
                    >✕</span>
                  )}
                </button>
              ))}
              <button
                onClick={() => setShowCustomCup(v => !v)}
                className="px-3 py-1.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1"
                style={{
                  background: showCustomCup ? currentTheme.colors.primary : currentTheme.colors.primaryLight,
                  color: showCustomCup ? '#fff' : currentTheme.colors.primaryDark,
                }}
              >
                <Pencil className="w-3.5 h-3.5" />
                Personalizado
              </button>
            </div>
            {showCustomCup && (
              <div className="mt-2 p-3 rounded-xl" style={{ background: currentTheme.colors.background }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 flex items-center rounded-xl overflow-hidden" style={{ border: `1.5px solid ${currentTheme.colors.primary}` }}>
                    <input
                      type="number"
                      value={customCupInput}
                      onChange={e => setCustomCupInput(e.target.value)}
                      placeholder="ex: 400"
                      className="flex-1 px-3 py-1.5 text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      style={{ background: currentTheme.colors.surface, color: currentTheme.colors.text }}
                    />
                    <span className="text-xs px-1" style={{ color: currentTheme.colors.textMuted }}>ml</span>
                    <div className="flex flex-col border-l" style={{ borderColor: `${currentTheme.colors.primary}30` }}>
                      <button
                        type="button"
                        onClick={() => setCustomCupInput(v => String(Math.max(0, (parseInt(v) || 0) + 50)))}
                        className="px-1.5 py-0.5 hover:opacity-70 transition-all"
                        style={{ background: currentTheme.colors.surface }}
                      >
                        <ChevronUp className="w-3 h-3" style={{ color: currentTheme.colors.primary }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomCupInput(v => String(Math.max(0, (parseInt(v) || 0) - 50)))}
                        className="px-1.5 py-0.5 hover:opacity-70 transition-all border-t"
                        style={{ background: currentTheme.colors.surface, borderColor: `${currentTheme.colors.primary}30` }}
                      >
                        <ChevronDown className="w-3 h-3" style={{ color: currentTheme.colors.primary }} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const v = parseInt(customCupInput)
                      if (!isNaN(v) && v > 0) {
                        setCupSize(v)
                        if (saveCustomCup && !savedCustomSizes.includes(v) && !CUP_SIZES.includes(v)) {
                          setCustomSizes([...savedCustomSizes, v])
                        }
                        setShowCustomCup(false)
                        setCustomCupInput('')
                        setSaveCustomCup(false)
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl text-sm font-semibold text-white"
                    style={{ background: currentTheme.colors.primary }}
                  >
                    Aplicar
                  </button>
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    onClick={() => setSaveCustomCup(v => !v)}
                    className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
                    style={{ background: saveCustomCup ? currentTheme.colors.primary : currentTheme.colors.primaryLight, border: `1.5px solid ${currentTheme.colors.primary}` }}
                  >
                    {saveCustomCup && <span className="text-white text-[10px] font-bold leading-none">✓</span>}
                  </div>
                  <span className="text-xs" style={{ color: currentTheme.colors.textMuted }}>Salvar medida para futuros registros</span>
                </label>
              </div>
            )}
          </div>

          {/* Contador de copos */}
          <div className="flex items-center justify-between my-6">
            <button
              onClick={() => setWaterModalCups(c => Math.max(0, c - 1))}
              className="w-16 h-16 rounded-2xl flex items-center justify-center hover:opacity-70 transition-all"
              style={{ background: COLOR_WATER + '30' }}
            >
              <Minus className="w-6 h-6" style={{ color: COLOR_WATER }} />
            </button>
            <div className="text-center">
              <p className="text-7xl font-bold" style={{ color: currentTheme.colors.text }}>{waterModalCups}</p>
              <p className="text-base mt-1" style={{ color: currentTheme.colors.textMuted }}>copos de {cupSize}ml</p>
              <p className="text-xl font-semibold mt-1" style={{ color: COLOR_WATER }}>
                {(waterModalCups * cupSize / 1000).toFixed(2)}L
              </p>
            </div>
            <button
              onClick={() => setWaterModalCups(c => Math.min(20, c + 1))}
              className="w-16 h-16 rounded-2xl flex items-center justify-center hover:opacity-70 transition-all"
              style={{ background: COLOR_WATER }}
            >
              <Plus className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Copinhos visuais */}
          <div className="flex gap-2 flex-wrap justify-center mb-6">
            {Array.from({ length: Math.max(waterGoal, waterModalCups) }, (_, i) => {
              const CupIcon = getCupIcon(cupSize)
              const filled = i < waterModalCups
              return (
                <div
                  key={i}
                  onClick={() => setWaterModalCups(i + 1)}
                  className="w-10 h-12 rounded-xl cursor-pointer transition-all hover:scale-110 flex items-center justify-center"
                  style={{ background: filled ? COLOR_WATER : COLOR_WATER + '30' }}
                >
                  <CupIcon className="w-5 h-5" style={{ color: filled ? '#fff' : COLOR_WATER }} />
                </div>
              )
            })}
          </div>

          {/* Salvar */}
          <button
            onClick={() => {
              setWaterDirect(waterModalCups, waterModalDate)
              setShowWaterModal(false)
            }}
            className="w-full py-4 rounded-2xl font-semibold text-white text-base transition-all hover:opacity-90 mt-auto"
            style={{ background: currentTheme.colors.primary }}
          >
            Salvar
          </button>
        </div>
      </div>
    )}

    {/* ── Modal de registro de sono ── */}
    {showSleepModal && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        onClick={e => { if (e.target === e.currentTarget) setShowSleepModal(false) }}
      >
        <div className="w-full max-w-md rounded-3xl p-8 flex flex-col" style={{ background: currentTheme.colors.surface, boxShadow: '0 24px 60px rgba(0,0,0,0.2)', minHeight: '420px' }}>

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5" style={{ color: COLOR_SLEEP }} />
              <h3 className="font-display text-lg font-semibold" style={{ color: currentTheme.colors.text }}>Registrar sono</h3>
            </div>
            <button onClick={() => setShowSleepModal(false)} className="w-7 h-7 rounded-full flex items-center justify-center hover:opacity-70" style={{ background: COLOR_SLEEP + '30' }}>
              <span className="text-sm font-bold" style={{ color: COLOR_SLEEP }}>✕</span>
            </button>
          </div>

          {/* Seletor de dia */}
          <div className="mb-5">
            <p className="text-xs font-medium mb-2" style={{ color: currentTheme.colors.textMuted }}>Dia</p>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => { setSleepModalIsToday(true); setSleepModalDate(todayKey); setSleepModalHours(logs[todayKey]?.sleep ?? 0) }}
                className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: sleepModalIsToday ? COLOR_SLEEP : COLOR_SLEEP + '30', color: sleepModalIsToday ? '#fff' : COLOR_SLEEP }}
              >Hoje</button>
              <button
                onClick={() => setSleepModalIsToday(false)}
                className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: !sleepModalIsToday ? COLOR_SLEEP : COLOR_SLEEP + '30', color: !sleepModalIsToday ? '#fff' : COLOR_SLEEP }}
              >Outro dia</button>
            </div>
            {!sleepModalIsToday && (
              <DatePickerInput
                value={sleepModalDate}
                onChange={d => { setSleepModalDate(d); setSleepModalHours(logs[d]?.sleep ?? 0) }}
                placeholder="Selecionar data"
                theme={currentTheme}
                direction="down"
              />
            )}
          </div>

          {/* Contador de horas */}
          <div className="flex items-center justify-between my-6">
            <button
              onClick={() => setSleepModalHours(h => Math.max(0, Math.round((h - 0.5) * 2) / 2))}
              className="w-16 h-16 rounded-2xl flex items-center justify-center hover:opacity-70 transition-all"
              style={{ background: COLOR_SLEEP + '30' }}
            >
              <Minus className="w-6 h-6" style={{ color: COLOR_SLEEP }} />
            </button>
            <div className="text-center">
              <p className="text-7xl font-bold" style={{ color: COLOR_SLEEP }}>{sleepModalHours}</p>
              <p className="text-base mt-1" style={{ color: currentTheme.colors.textMuted }}>horas de sono</p>
              <p className="text-sm mt-1" style={{ color: COLOR_SLEEP + '99' }}>
                {sleepModalHours >= 8 ? "Excelente!" : sleepModalHours >= 7 ? "Bom" : sleepModalHours >= 6 ? "Razoável" : sleepModalHours > 0 ? "Pouco" : "—"}
              </p>
            </div>
            <button
              onClick={() => setSleepModalHours(h => Math.min(14, Math.round((h + 0.5) * 2) / 2))}
              className="w-16 h-16 rounded-2xl flex items-center justify-center hover:opacity-70 transition-all"
              style={{ background: COLOR_SLEEP }}
            >
              <Plus className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Salvar */}
          <button
            onClick={() => { setSleepDirect(sleepModalHours, sleepModalDate); setShowSleepModal(false) }}
            className="w-full py-4 rounded-2xl font-semibold text-white text-base transition-all hover:opacity-90 mt-auto"
            style={{ background: COLOR_SLEEP }}
          >
            Salvar
          </button>
        </div>
      </div>
    )}
    </>
  )
}

function HistoryChart({
  label, unit, icon, points, maxValue, thresholdGood,
  colorGood, colorBad, colorEmpty, textMuted, period, formatValue,
}: {
  label: string; unit: string; icon: React.ReactNode;
  points: { label: string; value: number }[];
  maxValue: number; thresholdGood: number;
  colorGood: string; colorBad: string; colorEmpty: string; textMuted: string;
  period: PeriodKey;
  formatValue: (v: number) => string;
}) {
  const hasData = points.some(p => p.value > 0)
  const avgVal = hasData ? avg(points.filter(p => p.value > 0).map(p => p.value)) : 0
  const maxVal = Math.max(...points.map(p => p.value))
  const bestIdx = hasData ? points.findIndex(p => p.value === maxVal) : -1

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span style={{ color: colorGood }}>{icon}</span>
          <span className="text-xs font-semibold" style={{ color: colorGood }}>{label}</span>
        </div>
        {hasData && (
          <span className="text-xs font-semibold" style={{ color: colorGood }}>
            Média: {formatValue(avgVal)}
          </span>
        )}
      </div>
      <div className="flex items-end gap-1" style={{ height: 120 }}>
        {points.map((p, i) => {
          const pct = p.value > 0 ? Math.min(100, (p.value / maxValue) * 100) : 0
          const isBest = i === bestIdx && p.value > 0
          const color = isBest ? colorGood : p.value >= thresholdGood ? colorGood + 'cc' : p.value > 0 ? colorBad : colorEmpty
          const barH = (pct / 100) * 120
          const showInside = barH >= 28

          return (
            <div key={i} className="flex-1 flex flex-col items-center h-full justify-end">
              {/* coroa do melhor */}
              {isBest && <Crown className="w-3 h-3 mb-0.5" style={{ color: colorGood }} />}
              {/* barra */}
              <div
                className="w-full rounded-t-lg transition-all duration-300 relative flex items-center justify-center overflow-hidden"
                style={{
                  height: `${pct}%`,
                  background: color,
                  minHeight: p.value > 0 ? 4 : 0,
                  outline: isBest ? `2px solid ${colorGood}` : 'none',
                  outlineOffset: '1px',
                }}
              >
                {showInside && p.value > 0 && (
                  <span
                    className="text-[9px] font-bold leading-none text-center w-full px-1 truncate"
                    style={{ color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.25)' }}
                  >
                    {formatValue(p.value)}
                  </span>
                )}
              </div>
              {/* label */}
              <span className="text-[9px] truncate w-full text-center leading-none mt-1" style={{ color: isBest ? colorGood : textMuted, fontWeight: isBest ? 700 : 400 }}>
                {p.label}
              </span>
            </div>
          )
        })}
      </div>
      {!hasData && (
        <p className="text-xs text-center mt-2" style={{ color: textMuted }}>Sem registros neste período</p>
      )}
    </div>
  )
}
