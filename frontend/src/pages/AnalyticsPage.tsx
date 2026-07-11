import {
  BookOpen, CheckCircle, Zap, Target, Award, Dumbbell, Trophy,
  ChevronDown, Check, Loader2, Calendar as CalendarIcon,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { usePageHeader } from "../contexts/PageHeaderContext";
import { useAnalytics } from "../hooks/useAnalytics";
import { CATEGORY_COLORS, STATUS_COLORS } from "../enums/colors";
import { useDashboardSummaries } from "../hooks/useDashboardSummaries";

const MONTHS_ABBR = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const MONTHS_FULL = ["Janeiro","Fevereiro","Marco","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

const HUMOR_MAP: Record<number, { label: string; color: string }> = {
  5: { label: 'Otimo',   color: '#7BC4A8' },
  4: { label: 'Bem',     color: '#60A5FA' },
  3: { label: 'Neutro',  color: '#FCD34D' },
  2: { label: 'Mal',     color: '#FDBA74' },
  1: { label: 'Pessimo', color: '#D49898' },
};

/* ------------------------------------------------------------------ */
/*  Grafico de barras clean — estilo Apple                             */
/* ------------------------------------------------------------------ */
function CleanBarChart({ data, color, height = 200, selectedMonth }: {
  data: number[];
  color: string;
  height?: number;
  selectedMonth: number;
}) {
  const { currentTheme } = useTheme();
  const maxVal = Math.max(...data, 1);

  return (
    <div className="flex items-end justify-between gap-2" style={{ height }}>
      {data.map((value, idx) => {
        const pct = Math.max((value / maxVal) * 100, 2);
        const active = idx === selectedMonth;
        return (
          <div key={idx} className="flex-1 flex flex-col items-center gap-2">
            <div
              className="w-2 rounded-full transition-all duration-500"
              style={{
                height: `${pct}%`,
                background: active ? color : `${color}15`,
              }}
            />
            <span
              className="text-[10px]"
              style={{ color: active ? color : currentTheme.colors.textMuted }}
            >
              {MONTHS_ABBR[idx]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Grafico de linha clean — sem circulos, stroke fino                  */
/* ------------------------------------------------------------------ */
function CleanLineChart({ data, color, height = 200 }: {
  data: number[];
  color: string;
  height?: number;
}) {
  const { currentTheme } = useTheme();
  const maxVal = Math.max(...data, 1);
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - Math.round((v / maxVal) * 90),
  }));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const fillD = `M ${points[0].x} 100 ${points.map(p => `L ${p.x} ${p.y}`).join(' ')} L ${points[points.length - 1].x} 100 Z`;
  const gradientId = `grad-clean-${color.replace('#', '')}`;

  return (
    <div>
      <div style={{ height }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.15" />
              <stop offset="100%" stopColor={color} stopOpacity="0.01" />
            </linearGradient>
          </defs>
          <path d={fillD} fill={`url(#${gradientId})`} />
          <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {/* Labels dos meses */}
      <div className="flex justify-between mt-3">
        {MONTHS_ABBR.map((m, i) => (
          <span
            key={i}
            className="text-[10px] flex-1 text-center"
            style={{ color: currentTheme.colors.textMuted }}
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Pagina principal                                                   */
/* ================================================================== */
export function AnalyticsPage() {
  const { currentTheme } = useTheme();
  const navigate          = useNavigate();
  const now               = new Date();
  const c                 = currentTheme.colors;
  const { setHeaderRight } = usePageHeader();

  const [selectedYear,  setSelectedYear]  = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [yearOpen,  setYearOpen]  = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);
  const yearRef  = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);

  const years = [now.getFullYear()];
  const d     = useAnalytics(selectedYear, selectedMonth);
  const s     = useDashboardSummaries();

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (yearRef.current  && !yearRef.current.contains(e.target as Node))  setYearOpen(false);
      if (monthRef.current && !monthRef.current.contains(e.target as Node)) setMonthOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Injeta os filtros no header do PageLayout
  useEffect(() => {
    setHeaderRight(
      <div className="flex items-center gap-2">
        {/* Seletor de ano */}
        <div ref={yearRef} className="relative">
          <button
            onClick={() => setYearOpen(o => !o)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl font-semibold text-sm transition-all hover:opacity-80"
            style={{ background: c.primaryLight, color: c.text }}
          >
            <CalendarIcon className="w-3.5 h-3.5" style={{ color: c.primary }} />
            {selectedYear}
            <ChevronDown className="w-3.5 h-3.5" style={{ color: c.textMuted, transform: yearOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          {yearOpen && (
            <div
              className="absolute top-full mt-1 right-0 z-50 rounded-2xl overflow-hidden py-1 min-w-[90px]"
              style={{ background: c.surface, boxShadow: `0 8px 24px ${c.primary}20`, border: `1px solid ${c.primary}15` }}
            >
              {years.map(y => (
                <button
                  key={y}
                  onClick={() => { setSelectedYear(y); setYearOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:opacity-70"
                  style={{ color: y === selectedYear ? c.primary : c.text, fontWeight: y === selectedYear ? 600 : 400, background: y === selectedYear ? `${c.primary}10` : 'transparent' }}
                >
                  <Check className="w-3 h-3" style={{ color: c.primary, opacity: y === selectedYear ? 1 : 0 }} />
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Seletor de mes */}
        <div ref={monthRef} className="relative">
          <button
            onClick={() => setMonthOpen(o => !o)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl font-semibold text-sm transition-all hover:opacity-80"
            style={{ background: c.primaryLight, color: c.text }}
          >
            {MONTHS_FULL[selectedMonth]}
            <ChevronDown className="w-3.5 h-3.5" style={{ color: c.textMuted, transform: monthOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          {monthOpen && (
            <div
              className="absolute top-full mt-1 right-0 z-50 rounded-2xl overflow-hidden py-1 max-h-64 overflow-y-auto"
              style={{ background: c.surface, boxShadow: `0 8px 24px ${c.primary}20`, border: `1px solid ${c.primary}15`, minWidth: 130 }}
            >
              {MONTHS_FULL.filter((_, idx) => selectedYear < now.getFullYear() || idx <= now.getMonth()).map((month, idx) => (
                <button
                  key={idx}
                  onClick={() => { setSelectedMonth(idx); setMonthOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:opacity-70"
                  style={{ color: idx === selectedMonth ? c.primary : c.text, fontWeight: idx === selectedMonth ? 600 : 400, background: idx === selectedMonth ? `${c.primary}10` : 'transparent' }}
                >
                  <Check className="w-3 h-3" style={{ color: c.primary, opacity: idx === selectedMonth ? 1 : 0 }} />
                  {month}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
    return () => setHeaderRight(null);
  }, [selectedYear, selectedMonth, yearOpen, monthOpen, c, setHeaderRight]);

  const mesAtualTarefas = d.tarefasPorMes[selectedMonth] ?? 0;

  const metasTotal = d.metasAnuais.length + d.metasMensais.length;
  const metasConcluidas = [...d.metasAnuais, ...d.metasMensais].filter(
    m => m.target > 0 && m.current >= m.target
  ).length;

  const allMetas = [...d.metasMensais, ...d.metasAnuais];

  if (d.carregando) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: c.background }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: c.primary }} />
          <p className="text-sm" style={{ color: c.textMuted }}>Carregando analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-5 md:p-6" style={{ background: c.background }}>
      <div className="max-w-screen-xl mx-auto flex flex-col gap-5">

        {/* ============================================================ */}
        {/*  1. Cards de destaque — grid 2x2                              */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* Tarefas Concluidas */}
          <div
            className="rounded-3xl p-8 cursor-pointer transition-all duration-200 hover:opacity-90"
            onClick={() => navigate('/inicio')}
            style={{ background: c.surface }}
          >
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${STATUS_COLORS.concluido.color}15` }}>
                <CheckCircle className="w-4.5 h-4.5" style={{ color: STATUS_COLORS.concluido.color }} />
              </div>
              <span className="text-xs font-medium" style={{ color: c.textMuted }}>Tarefas Concluídas</span>
            </div>
            <p className="text-4xl font-light mb-1" style={{ color: c.text }}>
              {d.tarefasConcluidas}
            </p>
            <p className="text-xs" style={{ color: c.textMuted }}>
              {mesAtualTarefas} este mes
            </p>
          </div>

          {/* Taxa de Habitos */}
          <div
            className="rounded-3xl p-8 cursor-pointer transition-all duration-200 hover:opacity-90"
            onClick={() => navigate('/habitos')}
            style={{ background: c.surface }}
          >
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${CATEGORY_COLORS.habito.color}15` }}>
                <Zap className="w-4.5 h-4.5" style={{ color: CATEGORY_COLORS.habito.color }} />
              </div>
              <span className="text-xs font-medium" style={{ color: c.textMuted }}>Taxa de Hábitos</span>
            </div>
            <p className="text-4xl font-light mb-1" style={{ color: c.text }}>
              {d.taxaHabitos}%
            </p>
            <p className="text-xs" style={{ color: c.textMuted }}>
              {d.habitos.length} habitos ativos
            </p>
          </div>

          {/* Livros Lidos */}
          <div
            className="rounded-3xl p-8 cursor-pointer transition-all duration-200 hover:opacity-90"
            onClick={() => navigate('/livros')}
            style={{ background: c.surface }}
          >
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${CATEGORY_COLORS.livro.color}15` }}>
                <BookOpen className="w-4.5 h-4.5" style={{ color: CATEGORY_COLORS.livro.color }} />
              </div>
              <span className="text-xs font-medium" style={{ color: c.textMuted }}>Livros Lidos</span>
            </div>
            <p className="text-4xl font-light mb-1" style={{ color: c.text }}>
              {d.livrosLidos}
            </p>
            <p className="text-xs" style={{ color: c.textMuted }}>
              {s.livrosLendo} lendo agora
            </p>
          </div>

          {/* Metas */}
          <div
            className="rounded-3xl p-8 cursor-pointer transition-all duration-200 hover:opacity-90"
            onClick={() => navigate('/metas')}
            style={{ background: c.surface }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${c.primary}15` }}>
                <Target className="w-4.5 h-4.5" style={{ color: c.primary }} />
              </div>
              <span className="text-xs font-medium" style={{ color: c.textMuted }}>Metas</span>
            </div>
            <p className="text-4xl font-light mb-1" style={{ color: c.text }}>
              {metasConcluidas}/{metasTotal}
            </p>
            <p className="text-xs" style={{ color: c.textMuted }}>
              concluidas
            </p>
          </div>
        </div>

        {/* ============================================================ */}
        {/*  3. Graficos — grid 1x2                                       */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Tarefas por Mes */}
          <div className="rounded-3xl p-8" style={{ background: c.surface }}>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${STATUS_COLORS.concluido.color}15` }}>
                <CalendarIcon className="w-4 h-4" style={{ color: STATUS_COLORS.concluido.color }} />
              </div>
              <span className="text-sm font-medium" style={{ color: c.textMuted }}>Tarefas por Mês</span>
            </div>
            <CleanBarChart
              data={d.tarefasPorMes}
              color={c.primary}
              selectedMonth={selectedMonth}
              height={200}
            />
          </div>

          {/* Destaques do Mês */}
          <div className="rounded-3xl p-8" style={{ background: c.surface }}>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${c.primary}15` }}>
                <Trophy className="w-4 h-4" style={{ color: c.primary }} />
              </div>
              <span className="text-sm font-medium" style={{ color: c.textMuted }}>
                Destaques de {MONTHS_FULL[selectedMonth]}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {(() => {
                const mesStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
                const highlights = [
                  { label: 'Tarefas concluídas', value: d.tarefasPorMes[selectedMonth] ?? 0, icon: CheckCircle, color: STATUS_COLORS.concluido.color },
                  { label: 'Taxa de hábitos', value: d.habitosTaxaPorMes[selectedMonth] ?? 0, icon: Zap, color: CATEGORY_COLORS.habito.color, suffix: '%' },
                  { label: 'Livros lidos', value: d.livrosPorMes[selectedMonth] ?? 0, icon: BookOpen, color: CATEGORY_COLORS.livro.color },
                  { label: 'Cursos ativos', value: s.cursosEmAndamento, icon: Award, color: CATEGORY_COLORS.curso?.color ?? c.primary },
                  { label: 'Metas em progresso', value: allMetas.length, icon: Target, color: c.primary },
                ].sort((a, b) => b.value - a.value);

                const maxVal = Math.max(highlights[0]?.value ?? 1, 1);

                return highlights.map(h => {
                  const Icon = h.icon;
                  const pct = Math.max((h.value / maxVal) * 100, 3);
                  const isTop = h.value === maxVal && h.value > 0;
                  return (
                    <div key={h.label} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${h.color}15` }}>
                        <Icon className="w-3.5 h-3.5" style={{ color: h.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs" style={{ color: isTop ? c.text : c.textMuted, fontWeight: isTop ? 600 : 400 }}>
                            {h.label}
                          </span>
                          <span className="text-xs font-bold" style={{ color: isTop ? h.color : c.text }}>
                            {h.value}{h.suffix ?? ''}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full" style={{ background: `${h.color}10` }}>
                          <div className="h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: isTop ? h.color : `${h.color}50` }} />
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/*  4. Progresso de Metas — card full width                      */}
        {/* ============================================================ */}
        {allMetas.length > 0 && (
          <div className="rounded-3xl p-8" style={{ background: c.surface }}>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${c.primary}15` }}>
                <Target className="w-4 h-4" style={{ color: c.primary }} />
              </div>
              <span className="text-sm font-medium" style={{ color: c.textMuted }}>Metas</span>
            </div>
            <div className="flex flex-col gap-5">
              {allMetas.slice(0, 5).map(goal => {
                const hasTarget = goal.target > 0;
                const pct = hasTarget
                  ? Math.min(100, Math.round((goal.current / goal.target) * 100))
                  : 0;
                return (
                  <div key={goal.id} className="flex items-center gap-4">
                    <span className="text-sm flex-1 min-w-0 truncate" style={{ color: c.text }}>
                      {(goal as any).label ?? goal.title}
                    </span>
                    <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: `${c.primary}15` }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: c.primary }}
                      />
                    </div>
                    <span className="text-xs font-medium w-10 text-right" style={{ color: c.textMuted }}>
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
