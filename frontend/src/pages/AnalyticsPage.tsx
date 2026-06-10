import {
  TrendingUp, TrendingDown, BookOpen, CheckCircle, Zap, Award, Target,
  ChevronDown, Check, Flame, Droplets, Moon, Smile, Meh, Frown, Laugh,
  Annoyed, Wallet, GraduationCap, HeartPulse, Layers, BarChart2,
  ArrowUpRight, ArrowDownRight, Trophy, BookMarked, Loader2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useAnalytics } from "../hooks/useAnalytics";
import { useDashboardSummaries } from "../hooks/useDashboardSummaries";
import { CATEGORY_COLORS, STATUS_COLORS } from "../enums/colors";

const MONTHS_ABBR = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const MONTHS_FULL = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

const HUMOR_MAP: Record<number, { label: string; color: string }> = {
  5: { label: 'Ótimo',   color: '#10B981' },
  4: { label: 'Bem',     color: '#3B82F6' },
  3: { label: 'Neutro',  color: '#F59E0B' },
  2: { label: 'Mal',     color: '#F97316' },
  1: { label: 'Péssimo', color: '#EF4444' },
};

function BarChart({ data, color, bgColor, height = 160, selectedMonth }: {
  data: number[]
  color: string
  bgColor: string
  height?: number
  selectedMonth: number
}) {
  const { currentTheme } = useTheme();
  const maxVal = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((value, idx) => {
        const pct     = Math.round((value / maxVal) * 100);
        const active  = idx === selectedMonth;
        return (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
            {value > 0 && (
              <span className="text-[9px] font-semibold" style={{ color: active ? color : currentTheme.colors.textMuted }}>
                {value}
              </span>
            )}
            <div className="w-full rounded-t-md transition-all hover:opacity-80"
              style={{
                flex: 1,
                background: active ? color : bgColor,
                minHeight: 4,
                maxHeight: `${Math.max(pct, 3)}%`,
              }} />
            <span className={`text-[10px] ${active ? 'font-bold' : 'font-normal'}`}
              style={{ color: active ? color : currentTheme.colors.textMuted }}>
              {MONTHS_ABBR[idx]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function LineChart({ data, color, height = 120, selectedMonth }: {
  data: number[]
  color: string
  height?: number
  selectedMonth: number
}) {
  const { currentTheme } = useTheme();
  const maxVal = Math.max(...data, 1);
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - Math.round((v / maxVal) * 90),
  }));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const fillD = `M ${points[0].x} 100 ${points.map(p => `L ${p.x} ${p.y}`).join(' ')} L ${points[points.length - 1].x} 100 Z`;

  return (
    <div style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id={`grad-${color.replace('#','')}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={fillD} fill={`url(#grad-${color.replace('#','')})`} />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === selectedMonth ? 2.5 : 1.5}
            fill={i === selectedMonth ? color : 'white'}
            stroke={color} strokeWidth={i === selectedMonth ? 2 : 1}
          />
        ))}
      </svg>
    </div>
  );
}

export function AnalyticsPage() {
  const { currentTheme } = useTheme();
  const navigate          = useNavigate();
  const now               = new Date();

  const [selectedYear,  setSelectedYear]  = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [yearOpen,  setYearOpen]  = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);
  const yearRef  = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);

  const years = [now.getFullYear() - 2, now.getFullYear() - 1, now.getFullYear()];
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

  const trendBadge = (positive: boolean) => ({
    background: positive ? '#10B98115' : '#EF444415',
    color: positive ? '#10B981' : '#EF4444',
  });

  const mesAtualTarefas = d.tarefasPorMes[selectedMonth] ?? 0;
  const mesAnteriorTarefas = d.tarefasPorMes[(selectedMonth - 1 + 12) % 12] ?? 0;
  const deltaTarefas = mesAnteriorTarefas > 0
    ? Math.round(((mesAtualTarefas - mesAnteriorTarefas) / mesAnteriorTarefas) * 100)
    : 0;

  const mesAtualLivros = d.livrosPorMes[selectedMonth] ?? 0;
  const mesAtualHabitos = d.habitosTaxaPorMes[selectedMonth] ?? 0;

  const metasTotal = d.metasAnuais.length + d.metasMensais.length;
  const metasConcluidas = [...d.metasAnuais, ...d.metasMensais].filter(m => m.target > 0 && m.current >= m.target).length;
  const taxaMetas = metasTotal > 0 ? Math.round((metasConcluidas / metasTotal) * 100) : 0;

  if (d.carregando) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: currentTheme.colors.background }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: currentTheme.colors.primary }} />
          <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>Carregando analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6" style={{ background: currentTheme.colors.background }}>
      <div className="max-w-screen-xl mx-auto flex flex-col gap-6">

        {/* ── Filtros de período ──────────────────────────────────── */}
        <div className="flex items-center gap-3">

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: currentTheme.colors.textMuted }}>Ano</span>
            <div ref={yearRef} className="relative">
              <button onClick={() => setYearOpen(o => !o)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all hover:opacity-80"
                style={{ background: currentTheme.colors.surface, color: currentTheme.colors.text, boxShadow: `0 2px 12px ${currentTheme.colors.primary}15`, minWidth: '100px' }}>
                {selectedYear}
                <ChevronDown className="w-3.5 h-3.5 ml-auto" style={{ color: currentTheme.colors.textMuted }} />
              </button>
              {yearOpen && (
                <div className="absolute top-full mt-1 left-0 z-30 rounded-xl overflow-hidden py-1 min-w-full"
                  style={{ background: currentTheme.colors.surface, boxShadow: `0 8px 24px ${currentTheme.colors.primary}20` }}>
                  {years.map(y => (
                    <button key={y} onClick={() => { setSelectedYear(y); setYearOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-all hover:opacity-70"
                      style={{ color: currentTheme.colors.text }}>
                      <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: currentTheme.colors.primary, opacity: y === selectedYear ? 1 : 0 }} />
                      {y}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: currentTheme.colors.textMuted }}>Mês de referência</span>
            <div ref={monthRef} className="relative">
              <button onClick={() => setMonthOpen(o => !o)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all hover:opacity-80"
                style={{ background: currentTheme.colors.surface, color: currentTheme.colors.text, boxShadow: `0 2px 12px ${currentTheme.colors.primary}15`, minWidth: '130px' }}>
                {MONTHS_FULL[selectedMonth]}
                <ChevronDown className="w-3.5 h-3.5 ml-auto" style={{ color: currentTheme.colors.textMuted }} />
              </button>
              {monthOpen && (
                <div className="absolute top-full mt-1 left-0 z-30 rounded-xl overflow-hidden py-1 min-w-full max-h-60 overflow-y-auto"
                  style={{ background: currentTheme.colors.surface, boxShadow: `0 8px 24px ${currentTheme.colors.primary}20` }}>
                  {MONTHS_FULL.map((month, idx) => (
                    <button key={idx} onClick={() => { setSelectedMonth(idx); setMonthOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-all hover:opacity-70"
                      style={{ color: currentTheme.colors.text }}>
                      <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: currentTheme.colors.primary, opacity: idx === selectedMonth ? 1 : 0 }} />
                      {month}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="ml-auto text-right">
            <p className="text-xs" style={{ color: currentTheme.colors.textMuted }}>Dados de {selectedYear}</p>
            <p className="text-sm font-semibold" style={{ color: currentTheme.colors.text }}>Mês atual: {MONTHS_FULL[selectedMonth]}</p>
          </div>
        </div>

        {/* ── KPIs ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Tarefas Concluídas */}
          <div className="rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all" onClick={() => navigate('/inicio')}
            style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: STATUS_COLORS.concluido.bg }}>
                <CheckCircle className="w-5 h-5" style={{ color: STATUS_COLORS.concluido.color }} />
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={trendBadge(deltaTarefas >= 0)}>
                {deltaTarefas >= 0
                  ? <TrendingUp className="w-3 h-3" />
                  : <TrendingDown className="w-3 h-3" />
                }
                <span className="text-[11px] font-semibold">
                  {deltaTarefas === 0 ? 'igual' : `${deltaTarefas > 0 ? '+' : ''}${deltaTarefas}%`}
                </span>
              </div>
            </div>
            <p className="text-[32px] font-bold leading-none mb-1" style={{ color: currentTheme.colors.text }}>{d.tarefasConcluidas}</p>
            <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>Tarefas Concluídas</p>
            <p className="text-[11px] mt-1" style={{ color: currentTheme.colors.textMuted }}>
              {mesAtualTarefas} em {MONTHS_ABBR[selectedMonth]}
            </p>
          </div>

          {/* Taxa de Hábitos */}
          <div className="rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all" onClick={() => navigate('/habitos')}
            style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: CATEGORY_COLORS.habito.bg }}>
                <Zap className="w-5 h-5" style={{ color: CATEGORY_COLORS.habito.color }} />
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={trendBadge(mesAtualHabitos >= d.taxaHabitos)}>
                {mesAtualHabitos >= d.taxaHabitos
                  ? <TrendingUp className="w-3 h-3" />
                  : <TrendingDown className="w-3 h-3" />
                }
                <span className="text-[11px] font-semibold">{mesAtualHabitos}% mês</span>
              </div>
            </div>
            <p className="text-[32px] font-bold leading-none mb-1" style={{ color: currentTheme.colors.text }}>{d.taxaHabitos}%</p>
            <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>Taxa de Hábitos</p>
            <p className="text-[11px] mt-1" style={{ color: currentTheme.colors.textMuted }}>
              {d.habitos.length} hábitos ativos
            </p>
          </div>

          {/* Livros Lidos */}
          <div className="rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all" onClick={() => navigate('/livros')}
            style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: CATEGORY_COLORS.livro.bg }}>
                <BookOpen className="w-5 h-5" style={{ color: CATEGORY_COLORS.livro.color }} />
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={trendBadge(true)}>
                <TrendingUp className="w-3 h-3" />
                <span className="text-[11px] font-semibold">{mesAtualLivros} em {MONTHS_ABBR[selectedMonth]}</span>
              </div>
            </div>
            <p className="text-[32px] font-bold leading-none mb-1" style={{ color: currentTheme.colors.text }}>{d.livrosLidos}</p>
            <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>Livros Lidos ({selectedYear})</p>
            <p className="text-[11px] mt-1" style={{ color: currentTheme.colors.textMuted }}>
              {s.livrosLendo} lendo agora
            </p>
          </div>

          {/* Cursos Concluídos */}
          <div className="rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all" onClick={() => navigate('/cursos')}
            style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: CATEGORY_COLORS.curso.bg }}>
                <Award className="w-5 h-5" style={{ color: CATEGORY_COLORS.curso.color }} />
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={trendBadge(true)}>
                <TrendingUp className="w-3 h-3" />
                <span className="text-[11px] font-semibold">{d.cursosEmAndamento ?? s.cursosEmAndamento} ativos</span>
              </div>
            </div>
            <p className="text-[32px] font-bold leading-none mb-1" style={{ color: currentTheme.colors.text }}>{d.cursosConcluidos}</p>
            <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>Cursos Concluídos</p>
            <p className="text-[11px] mt-1" style={{ color: currentTheme.colors.textMuted }}>
              {d.cursos.length} total de cursos
            </p>
          </div>
        </div>

        {/* ── Gráficos principais ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Tarefas Concluídas por Mês */}
          <div className="rounded-2xl p-6"
            style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display text-lg font-semibold" style={{ color: currentTheme.colors.text }}>
                Tarefas Concluídas por Mês
              </h3>
              <span className="text-[11px] px-2 py-1 rounded-lg font-semibold"
                style={{ background: STATUS_COLORS.concluido.bg, color: STATUS_COLORS.concluido.color }}>
                {d.tarefasConcluidas} no ano
              </span>
            </div>
            <p className="text-xs mb-4" style={{ color: currentTheme.colors.textMuted }}>
              Total de tarefas marcadas como concluídas
            </p>
            <BarChart
              data={d.tarefasPorMes}
              color={STATUS_COLORS.concluido.color}
              bgColor={STATUS_COLORS.concluido.bg}
              selectedMonth={selectedMonth}
              height={180}
            />
          </div>

          {/* Livros Lidos por Mês */}
          <div className="rounded-2xl p-6"
            style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display text-lg font-semibold" style={{ color: currentTheme.colors.text }}>
                Livros Lidos por Mês
              </h3>
              <span className="text-[11px] px-2 py-1 rounded-lg font-semibold"
                style={{ background: CATEGORY_COLORS.livro.bg, color: CATEGORY_COLORS.livro.color }}>
                {d.livrosLidos} no ano
              </span>
            </div>
            <p className="text-xs mb-4" style={{ color: currentTheme.colors.textMuted }}>
              Livros com data de conclusão registrada
            </p>
            <BarChart
              data={d.livrosPorMes}
              color={CATEGORY_COLORS.livro.color}
              bgColor={CATEGORY_COLORS.livro.bg}
              selectedMonth={selectedMonth}
              height={180}
            />
          </div>

          {/* Taxa de Hábitos por Mês */}
          <div className="rounded-2xl p-6"
            style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display text-lg font-semibold" style={{ color: currentTheme.colors.text }}>
                Taxa de Conclusão de Hábitos
              </h3>
              <span className="text-[11px] px-2 py-1 rounded-lg font-semibold"
                style={{ background: CATEGORY_COLORS.habito.bg, color: CATEGORY_COLORS.habito.color }}>
                {d.taxaHabitos}% média
              </span>
            </div>
            <p className="text-xs mb-4" style={{ color: currentTheme.colors.textMuted }}>
              % de conclusão dos hábitos em relação ao total possível por mês
            </p>
            <LineChart
              data={d.habitosTaxaPorMes}
              color={CATEGORY_COLORS.habito.color}
              selectedMonth={selectedMonth}
              height={180}
            />
            {/* Labels dos meses */}
            <div className="flex justify-between mt-2">
              {MONTHS_ABBR.map((m, i) => (
                <span key={i} className={`text-[10px] flex-1 text-center ${i === selectedMonth ? 'font-bold' : ''}`}
                  style={{ color: i === selectedMonth ? CATEGORY_COLORS.habito.color : currentTheme.colors.textMuted }}>
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Progresso de Metas */}
          <div className="rounded-2xl p-6"
            style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display text-lg font-semibold" style={{ color: currentTheme.colors.text }}>
                Progresso de Metas {selectedYear}
              </h3>
              <span className="text-[11px] px-2 py-1 rounded-lg font-semibold"
                style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}>
                {metasConcluidas}/{metasTotal} concluídas
              </span>
            </div>
            <p className="text-xs mb-4" style={{ color: currentTheme.colors.textMuted }}>
              Metas anuais e mensais com progresso registrado
            </p>

            {/* Barra geral */}
            {metasTotal > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-[11px] mb-1.5" style={{ color: currentTheme.colors.textMuted }}>
                  <span>Taxa de conclusão geral</span>
                  <span className="font-bold" style={{ color: currentTheme.colors.primary }}>{taxaMetas}%</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ background: currentTheme.colors.primaryLight }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${taxaMetas}%`, background: `linear-gradient(90deg, ${currentTheme.colors.primary}, ${currentTheme.colors.primaryDark})` }} />
                </div>
              </div>
            )}

            {[...d.metasMensais, ...d.metasAnuais].length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: currentTheme.colors.textMuted }}>
                Nenhuma meta cadastrada para {selectedYear}
              </p>
            ) : (
              <div className="flex flex-col gap-3 overflow-y-auto max-h-48 pr-1">
                {[...d.metasMensais, ...d.metasAnuais].map(goal => {
                  const hasTarget = goal.target > 0;
                  const pct = hasTarget ? Math.min(100, Math.round((goal.current / goal.target) * 100)) : 0;
                  const done = hasTarget ? pct >= 100 : goal.current >= 1;
                  return (
                    <div key={goal.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-3 h-3 rounded-full flex-shrink-0 flex items-center justify-center"
                            style={{ background: done ? goal.color : 'transparent', border: `2px solid ${goal.color}` }}>
                            {done && (
                              <svg viewBox="0 0 24 24" className="w-2 h-2" fill="none" stroke="white" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm truncate" style={{ color: currentTheme.colors.text }}>{goal.label ?? goal.title}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: goal.color + '20', color: goal.color }}>
                            {goal.scope === 'monthly' ? 'Mensal' : 'Anual'}
                          </span>
                        </div>
                        <span className="text-sm font-semibold ml-2 flex-shrink-0" style={{ color: currentTheme.colors.text }}>
                          {hasTarget ? `${goal.current}/${goal.target}${goal.unit ? ` ${goal.unit}` : ''}` : done ? '✓' : '—'}
                        </span>
                      </div>
                      {hasTarget && (
                        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: goal.color + '20' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: goal.color }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Linha 3: Saúde + Finanças + Universitário ────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Saúde — últimos 7 dias */}
          <div className="rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all" onClick={() => navigate('/saude')}
            style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#10B98120' }}>
                <HeartPulse className="w-4 h-4" style={{ color: '#10B981' }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: currentTheme.colors.text }}>Saúde & Bem-estar</p>
                <p className="text-[10px]" style={{ color: currentTheme.colors.textMuted }}>últimos 7 dias</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="rounded-xl p-2 text-center" style={{ background: currentTheme.colors.background }}>
                <Droplets className="w-4 h-4 mx-auto mb-0.5" style={{ color: '#3B82F6' }} />
                <p className="text-base font-bold" style={{ color: currentTheme.colors.text }}>{s.mediaAgua.toFixed(1)}</p>
                <p className="text-[10px]" style={{ color: currentTheme.colors.textMuted }}>copos/dia</p>
              </div>
              <div className="rounded-xl p-2 text-center" style={{ background: currentTheme.colors.background }}>
                <Moon className="w-4 h-4 mx-auto mb-0.5" style={{ color: currentTheme.colors.primaryDark }} />
                <p className="text-base font-bold" style={{ color: currentTheme.colors.text }}>{s.mediaSono.toFixed(1)}h</p>
                <p className="text-[10px]" style={{ color: currentTheme.colors.textMuted }}>sono/dia</p>
              </div>
              <div className="rounded-xl p-2 text-center" style={{ background: currentTheme.colors.background }}>
                {s.humorFrequente && HUMOR_MAP[s.humorFrequente] ? (
                  <>
                    <p className="text-base font-bold" style={{ color: HUMOR_MAP[s.humorFrequente].color }}>
                      {HUMOR_MAP[s.humorFrequente].label}
                    </p>
                    <p className="text-[10px]" style={{ color: currentTheme.colors.textMuted }}>humor</p>
                  </>
                ) : (
                  <p className="text-[10px] pt-2" style={{ color: currentTheme.colors.textMuted }}>sem dados</p>
                )}
              </div>
            </div>
            {/* Mini gráfico água */}
            {s.logsSaude.length > 0 && (
              <div>
                <p className="text-[10px] mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Hidratação — últimos 7 dias</p>
                <div className="flex items-end gap-1 h-10">
                  {Array.from({ length: 7 }, (_, i) => {
                    const dt = new Date(); dt.setDate(dt.getDate() - (6 - i));
                    const k  = dt.toISOString().split('T')[0];
                    const log = s.logsSaude.find(l => l.log_date === k);
                    const val = log?.water ?? 0;
                    const maxV = Math.max(...s.logsSaude.map(l => l.water ?? 0), 1);
                    const pct  = Math.round((val / maxV) * 100);
                    const isToday = k === new Date().toISOString().split('T')[0];
                    return (
                      <div key={k} className="flex-1 flex flex-col items-center gap-0.5">
                        <div className="w-full rounded-t-sm"
                          style={{ height: `${Math.max(pct, 5)}%`, background: isToday ? '#3B82F6' : '#3B82F640' }} />
                        <span className="text-[8px]" style={{ color: currentTheme.colors.textMuted }}>
                          {['D','S','T','Q','Q','S','D'][dt.getDay()]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Finanças do mês */}
          <div className="rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all" onClick={() => navigate('/financas')}
            style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: currentTheme.colors.primaryLight }}>
                <Wallet className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: currentTheme.colors.text }}>Finanças</p>
                <p className="text-[10px]" style={{ color: currentTheme.colors.textMuted }}>{MONTHS_FULL[now.getMonth()]}</p>
              </div>
            </div>
            <div className="rounded-xl px-4 py-3 text-center mb-3"
              style={{ background: s.saldoMes >= 0 ? '#10B98115' : '#EF444415' }}>
              <p className="text-[10px] mb-0.5" style={{ color: currentTheme.colors.textMuted }}>Saldo</p>
              <p className="text-2xl font-bold" style={{ color: s.saldoMes >= 0 ? '#10B981' : '#EF4444' }}>
                {s.saldoMes < 0 ? '−' : '+'}R$ {Math.abs(s.saldoMes).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center px-3 py-2 rounded-xl" style={{ background: currentTheme.colors.background }}>
                <div className="flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5" style={{ color: '#10B981' }} />
                  <span className="text-xs" style={{ color: currentTheme.colors.textMuted }}>Receitas</span>
                </div>
                <span className="text-sm font-bold" style={{ color: '#10B981' }}>
                  R$ {s.receitasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center px-3 py-2 rounded-xl" style={{ background: currentTheme.colors.background }}>
                <div className="flex items-center gap-1.5">
                  <ArrowDownRight className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />
                  <span className="text-xs" style={{ color: currentTheme.colors.textMuted }}>Despesas</span>
                </div>
                <span className="text-sm font-bold" style={{ color: '#EF4444' }}>
                  R$ {s.despesasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            {(s.receitasMes + s.despesasMes) > 0 && (
              <div className="mt-3">
                <div className="flex text-[10px] justify-between mb-1" style={{ color: currentTheme.colors.textMuted }}>
                  <span>Receita</span><span>Despesa</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden flex" style={{ background: '#EF444430' }}>
                  <div className="h-full rounded-full" style={{
                    width: `${Math.round((s.receitasMes / (s.receitasMes + s.despesasMes)) * 100)}%`,
                    background: '#10B981',
                  }} />
                </div>
              </div>
            )}
          </div>

          {/* Universitário */}
          <div className="rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all" onClick={() => navigate('/universitario')}
            style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#8B5CF620' }}>
                <GraduationCap className="w-4 h-4" style={{ color: '#8B5CF6' }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: currentTheme.colors.text }}>Universitário</p>
                <p className="text-[10px]" style={{ color: currentTheme.colors.textMuted }}>{s.materiasAtivas.length} matérias ativas</p>
              </div>
            </div>

            <div className="flex gap-2 mb-3">
              <div className="flex-1 rounded-xl py-2.5 text-center" style={{ background: currentTheme.colors.background }}>
                <p className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>{s.materiasAtivas.length}</p>
                <p className="text-[10px]" style={{ color: currentTheme.colors.textMuted }}>matérias</p>
              </div>
              <div className="flex-1 rounded-xl py-2.5 text-center" style={{ background: currentTheme.colors.background }}>
                <p className="text-2xl font-bold" style={{ color: s.proximasProvas.length > 0 ? '#EF4444' : currentTheme.colors.text }}>
                  {s.proximasProvas.length}
                </p>
                <p className="text-[10px]" style={{ color: currentTheme.colors.textMuted }}>provas (30d)</p>
              </div>
            </div>

            {s.proximasProvas.slice(0, 3).map(p => {
              const d2 = new Date(p.examDate + 'T00:00');
              const dias = Math.round((d2.getTime() - Date.now()) / 86400000);
              const urgente = dias <= 7;
              return (
                <div key={p.id} className="flex items-center gap-2 px-3 py-2 rounded-xl mb-1.5"
                  style={{ background: urgente ? '#EF444410' : currentTheme.colors.background, border: urgente ? '1px solid #EF444430' : 'none' }}>
                  <div className="w-8 h-8 rounded-lg flex flex-col items-center justify-center flex-shrink-0"
                    style={{ background: urgente ? '#EF444420' : currentTheme.colors.primaryLight }}>
                    <p className="text-xs font-bold leading-none" style={{ color: urgente ? '#EF4444' : currentTheme.colors.primary }}>{d2.getDate()}</p>
                    <p className="text-[8px]" style={{ color: currentTheme.colors.textMuted }}>{MONTHS_ABBR[d2.getMonth()]}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold truncate" style={{ color: currentTheme.colors.text }}>{p.subject}</p>
                    <p className="text-[10px]" style={{ color: currentTheme.colors.textMuted }}>{p.type}</p>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: urgente ? '#EF444420' : currentTheme.colors.primaryLight, color: urgente ? '#EF4444' : currentTheme.colors.primary }}>
                    {dias === 0 ? 'Hoje' : `${dias}d`}
                  </span>
                </div>
              );
            })}
            {s.proximasProvas.length === 0 && (
              <p className="text-xs text-center py-3" style={{ color: currentTheme.colors.textMuted }}>Nenhuma prova nos próximos 30 dias</p>
            )}
          </div>
        </div>

        {/* ── Hábitos detalhados ──────────────────────────────────── */}
        {d.habitos.length > 0 && (
          <div className="rounded-2xl p-5" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: CATEGORY_COLORS.habito.bg }}>
                  <Flame className="w-4 h-4" style={{ color: CATEGORY_COLORS.habito.color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: currentTheme.colors.text }}>Sequência dos Hábitos</p>
                  <p className="text-[10px]" style={{ color: currentTheme.colors.textMuted }}>Maior sequência de dias consecutivos</p>
                </div>
              </div>
              <button onClick={() => navigate('/habitos')} className="text-xs font-semibold hover:opacity-70 transition-all"
                style={{ color: currentTheme.colors.primary }}>
                Ver todos →
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {d.habitos.map(h => {
                const todayKey2 = new Date().toISOString().split('T')[0];
                const feito = !!h.completions[todayKey2];
                return (
                  <div key={h.id} className="rounded-xl p-3 text-center"
                    style={{ background: currentTheme.colors.background, border: `1.5px solid ${feito ? h.color + '60' : 'transparent'}` }}>
                    <div className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center"
                      style={{ background: feito ? h.color : h.color + '25' }}>
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke={feito ? 'white' : h.color} strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium truncate mb-1" style={{ color: currentTheme.colors.text }}>{h.name}</p>
                    <div className="flex items-center justify-center gap-1">
                      <Flame className="w-3 h-3" style={{ color: h.streak > 0 ? '#F59E0B' : currentTheme.colors.textMuted }} />
                      <span className="text-xs font-bold" style={{ color: h.streak > 0 ? '#F59E0B' : currentTheme.colors.textMuted }}>
                        {h.streak}d
                      </span>
                    </div>
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
