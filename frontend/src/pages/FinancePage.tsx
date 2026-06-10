import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Wifi,
  Home,
  Tv,
  BookOpen,
  ShoppingCart,
  Utensils,
  Bus,
  Heart,
  Shirt,
  Smile,
  Briefcase,
  PiggyBank,
  CreditCard,
  MoreHorizontal,
  Tag,
  BarChart3,
  CalendarDays,
  History,
  Repeat,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useFinance } from "../hooks/useFinance";
import { DatePickerInput } from "../components/DatePickerInput";
import type { Transaction } from "../types/finance.types";

const CATEGORIES: Record<string, { icon: React.FC<{ className?: string; style?: React.CSSProperties }>; color: string; type: "expense" | "income" | "both" }> = {
  "Casa":          { icon: Home,          color: "#6366F1", type: "expense" },
  "Assinaturas":   { icon: Repeat,        color: "#8B5CF6", type: "expense" },
  "Streamings":    { icon: Tv,            color: "#EC4899", type: "expense" },
  "Contas":        { icon: Wifi,          color: "#3B82F6", type: "expense" },
  "Estudos":       { icon: BookOpen,      color: "#10B981", type: "expense" },
  "Supermercado":  { icon: ShoppingCart,  color: "#F59E0B", type: "expense" },
  "Alimentação":   { icon: Utensils,      color: "#F97316", type: "expense" },
  "Transporte":    { icon: Bus,           color: "#06B6D4", type: "expense" },
  "Saúde":         { icon: Heart,         color: "#EF4444", type: "expense" },
  "Lazer":         { icon: Smile,         color: "#A855F7", type: "expense" },
  "Vestuário":     { icon: Shirt,         color: "#F472B6", type: "expense" },
  "Salário":       { icon: Briefcase,     color: "#10B981", type: "income" },
  "Freelance":     { icon: CreditCard,    color: "#14B8A6", type: "income" },
  "Investimento":  { icon: PiggyBank,     color: "#22C55E", type: "income" },
  "Outros":        { icon: MoreHorizontal,color: "#6B7280", type: "both" },
};

const MONTHS       = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const MONTHS_SHORT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const fmt      = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtShort = (v: number) => v >= 1000 ? `R$${(v/1000).toFixed(1)}k` : `R$${v.toFixed(0)}`;

function monthKey(date: string) { return date.slice(0, 7); }
function yearOf(date: string)   { return parseInt(date.slice(0, 4)); }

export function FinancePage() {
  const { currentTheme } = useTheme();
  const {
    transactions, loading, error,
    showAdd, setShowAdd, openAdd, openEdit, editingId,
    form, setForm,
    saving, saveTransaction, deleteTx,
  } = useFinance();

  const [view,          setView]          = useState<"monthly" | "annual" | "history">("monthly");
  const [selectedYear,  setSelectedYear]  = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [search,        setSearch]        = useState("");
  const [filterCat,     setFilterCat]     = useState("Todas");
  const [filterType,    setFilterType]    = useState<"all"|"income"|"expense">("all");

  // Monthly
  const currentMonthKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;
  const monthTxs = useMemo(() =>
    transactions.filter(t => monthKey(t.date) === currentMonthKey)
      .sort((a, b) => b.date.localeCompare(a.date)),
    [transactions, currentMonthKey]
  );
  const monthIncome  = monthTxs.filter(t => t.type === "income").reduce((s,t) => s+t.amount, 0);
  const monthExpense = monthTxs.filter(t => t.type === "expense").reduce((s,t) => s+t.amount, 0);
  const monthBalance = monthIncome - monthExpense;
  const savingsRate  = monthIncome > 0 ? Math.round((monthBalance / monthIncome) * 100) : 0;

  const catBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    monthTxs.filter(t => t.type === "expense").forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return Object.entries(map).map(([cat, total]) => ({ cat, total, ...CATEGORIES[cat] })).sort((a, b) => b.total - a.total);
  }, [monthTxs]);
  const maxCat = Math.max(...catBreakdown.map(c => c.total), 1);

  const labelBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    monthTxs.filter(t => t.type === "expense").forEach(t => { map[t.label] = (map[t.label] || 0) + t.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [monthTxs]);

  // Annual
  const yearTxs = useMemo(() => transactions.filter(t => yearOf(t.date) === selectedYear), [transactions, selectedYear]);
  const annualIncome  = yearTxs.filter(t => t.type === "income").reduce((s,t) => s+t.amount, 0);
  const annualExpense = yearTxs.filter(t => t.type === "expense").reduce((s,t) => s+t.amount, 0);
  const annualBalance = annualIncome - annualExpense;

  const monthlyChart = useMemo(() =>
    Array.from({ length: 12 }, (_, m) => {
      const mk = `${selectedYear}-${String(m+1).padStart(2,"0")}`;
      const inc = transactions.filter(t => monthKey(t.date) === mk && t.type === "income").reduce((s,t) => s+t.amount, 0);
      const exp = transactions.filter(t => monthKey(t.date) === mk && t.type === "expense").reduce((s,t) => s+t.amount, 0);
      return { month: MONTHS_SHORT[m], inc, exp };
    }),
    [transactions, selectedYear]
  );
  const maxChartVal = Math.max(...monthlyChart.flatMap(m => [m.inc, m.exp]), 1);

  const annualCatBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    yearTxs.filter(t => t.type === "expense").forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return Object.entries(map).map(([cat, total]) => ({ cat, total, ...CATEGORIES[cat] })).sort((a, b) => b.total - a.total);
  }, [yearTxs]);

  // History
  const historyTxs = useMemo(() =>
    transactions.filter(t => {
      const matchSearch = search === "" || t.description.toLowerCase().includes(search.toLowerCase()) || t.label.toLowerCase().includes(search.toLowerCase());
      const matchCat    = filterCat === "Todas" || t.category === filterCat;
      const matchType   = filterType === "all" || t.type === filterType;
      return matchSearch && matchCat && matchType;
    }).sort((a,b) => b.date.localeCompare(a.date)),
    [transactions, search, filterCat, filterType]
  );

  const historyGrouped = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    historyTxs.forEach(t => { const k = monthKey(t.date); if (!groups[k]) groups[k] = []; groups[k].push(t); });
    return Object.entries(groups).sort((a,b) => b[0].localeCompare(a[0]));
  }, [historyTxs]);

  const navMonth = (delta: number) => {
    let m = selectedMonth + delta, y = selectedYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0)  { m = 11; y--; }
    setSelectedMonth(m); setSelectedYear(y);
  };

  const expenseCats = Object.entries(CATEGORIES).filter(([,v]) => v.type !== "income").map(([k]) => k);
  const incomeCats  = Object.entries(CATEGORIES).filter(([,v]) => v.type !== "expense").map(([k]) => k);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center" style={{ background: currentTheme.colors.background }}>
      <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>Carregando...</p>
    </div>
  );

  if (error) return (
    <div className="flex-1 flex items-center justify-center" style={{ background: currentTheme.colors.background }}>
      <p className="text-sm text-red-500">{error}</p>
    </div>
  );

  return (
    <div className="flex-1 overflow-auto" style={{ background: currentTheme.colors.background }}>
      <div className="max-w-7xl mx-auto w-full">
      {/* Barra superior: tabs | nav mês/ano | botão */}
      <div className="grid grid-cols-3 items-center px-6 pt-6 mb-5">
        {/* Esquerda: tabs */}
        <div className="flex gap-2">
          {([
            { id: "monthly",  label: "Mensal",    Icon: CalendarDays },
            { id: "annual",   label: "Anual",     Icon: BarChart3 },
            { id: "history",  label: "Histórico", Icon: History },
          ] as const).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
              style={{
                background: view === id ? currentTheme.colors.primary : currentTheme.colors.surface,
                color: view === id ? "#fff" : currentTheme.colors.text,
                boxShadow: view !== id ? `0 2px 8px ${currentTheme.colors.primary}10` : "none",
              }}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Centro: navegação de mês ou ano */}
        <div className="flex items-center justify-center gap-3">
          {view === "monthly" && (
            <>
              <button onClick={() => navMonth(-1)} className="p-2 rounded-xl hover:opacity-70 transition-all" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 8px ${currentTheme.colors.primary}10` }}>
                <ChevronLeft className="w-4 h-4" style={{ color: currentTheme.colors.primaryDark }} />
              </button>
              <h2 className="font-display text-2xl font-bold min-w-48 text-center" style={{ color: currentTheme.colors.text }}>
                {MONTHS[selectedMonth]} {selectedYear}
              </h2>
              <button onClick={() => navMonth(1)} className="p-2 rounded-xl hover:opacity-70 transition-all" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 8px ${currentTheme.colors.primary}10` }}>
                <ChevronRight className="w-4 h-4" style={{ color: currentTheme.colors.primaryDark }} />
              </button>
            </>
          )}
          {view === "annual" && (
            <>
              <button onClick={() => setSelectedYear(y => y - 1)} className="p-2 rounded-xl hover:opacity-70 transition-all" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 8px ${currentTheme.colors.primary}10` }}>
                <ChevronLeft className="w-4 h-4" style={{ color: currentTheme.colors.primaryDark }} />
              </button>
              <h2 className="font-display text-2xl font-bold min-w-24 text-center" style={{ color: currentTheme.colors.text }}>{selectedYear}</h2>
              <button onClick={() => setSelectedYear(y => y + 1)} className="p-2 rounded-xl hover:opacity-70 transition-all" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 8px ${currentTheme.colors.primary}10` }}>
                <ChevronRight className="w-4 h-4" style={{ color: currentTheme.colors.primaryDark }} />
              </button>
            </>
          )}
        </div>

        {/* Direita: botão novo lançamento */}
        <div className="flex justify-end">
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-semibold hover:opacity-90 transition-all"
            style={{ background: currentTheme.colors.primary }}
          >
            <Plus className="w-4 h-4" /> Novo Lançamento
          </button>
        </div>
      </div>

      {/* VISÃO MENSAL */}
      {view === "monthly" && (
        <div className="px-6 pb-8 space-y-5">

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard icon={<TrendingUp className="w-5 h-5 text-green-600" />} iconBg="#D1FAE5" label="Receitas" value={fmt(monthIncome)} color="#059669" />
            <SummaryCard icon={<TrendingDown className="w-5 h-5 text-red-500" />} iconBg="#FEE2E2" label="Despesas" value={fmt(monthExpense)} color="#EF4444" />
            <SummaryCard
              icon={<DollarSign className="w-5 h-5" style={{ color: monthBalance >= 0 ? "#059669" : "#DC2626" }} />}
              iconBg={monthBalance >= 0 ? "#A7F3D0" : "#FECACA"}
              label="Saldo" value={fmt(monthBalance)}
              color={monthBalance >= 0 ? "#059669" : "#DC2626"}
            />
            <div className="rounded-2xl p-4" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
              <p className="text-xs mb-1" style={{ color: currentTheme.colors.textMuted }}>Taxa de Economia</p>
              <p className="text-2xl font-bold" style={{ color: savingsRate >= 20 ? "#059669" : savingsRate >= 0 ? "#F59E0B" : "#EF4444" }}>
                {savingsRate}%
              </p>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: currentTheme.colors.primaryLight }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(0, Math.min(100, savingsRate))}%`, background: savingsRate >= 20 ? "#10B981" : "#F59E0B" }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                  Lançamentos —
                  <span className="px-3 py-1 rounded-full text-sm font-bold" style={{ background: currentTheme.colors.primary, color: "#fff" }}>
                    {MONTHS[selectedMonth]}
                  </span>
                </h3>
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}>
                  {monthTxs.length} itens
                </span>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {monthTxs.length === 0 && (
                  <p className="text-center py-8 text-sm" style={{ color: currentTheme.colors.textMuted }}>Nenhum lançamento neste mês</p>
                )}
                {monthTxs.map(t => <TxRow key={t.id} t={t} theme={currentTheme} onDelete={deleteTx} onEdit={openEdit} />)}
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl p-5" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
                <h3 className="font-display text-base font-semibold mb-4" style={{ color: currentTheme.colors.text }}>Por Categoria</h3>
                <div className="space-y-3">
                  {catBreakdown.slice(0, 7).map(({ cat, total, color, icon: Icon }) => {
                    const pct = Math.round((total / monthExpense) * 100);
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {Icon && <Icon className="w-3.5 h-3.5" style={{ color }} />}
                            <span className="text-xs font-medium" style={{ color: currentTheme.colors.text }}>{cat}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: color + "20", color }}>{pct}%</span>
                          </div>
                          <span className="text-xs font-semibold" style={{ color: currentTheme.colors.text }}>{fmt(total)}</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: color + "20" }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${(total / maxCat) * 100}%`, background: color }} />
                        </div>
                      </div>
                    );
                  })}
                  {catBreakdown.length === 0 && <p className="text-xs text-center py-4" style={{ color: currentTheme.colors.textMuted }}>Sem despesas neste mês</p>}
                </div>
              </div>

              {labelBreakdown.length > 0 && (
                <div className="rounded-2xl p-5" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
                  <h3 className="font-display text-base font-semibold mb-3 flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                    <Tag className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
                    Etiquetas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {labelBreakdown.map(([label, total]) => (
                      <div key={label} className="flex flex-col items-center px-3 py-2 rounded-xl" style={{ background: currentTheme.colors.primaryLight }}>
                        <span className="text-[10px] font-medium" style={{ color: currentTheme.colors.primaryDark }}>{label}</span>
                        <span className="text-xs font-bold mt-0.5" style={{ color: currentTheme.colors.text }}>{fmtShort(total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {monthTxs.some(t => t.recurring) && (
            <div className="rounded-2xl p-5" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
              <h3 className="font-display text-base font-semibold mb-3 flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                <Repeat className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
                Recorrentes do Mês
              </h3>
              <div className="flex flex-wrap gap-3">
                {monthTxs.filter(t => t.recurring && t.type === "expense").map(t => {
                  const cfg = CATEGORIES[t.category];
                  const Icon = cfg?.icon;
                  return (
                    <div key={t.id} className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: (cfg?.color || "#6B7280") + "15", border: `1px solid ${cfg?.color || "#6B7280"}30` }}>
                      {Icon && <Icon className="w-4 h-4" style={{ color: cfg?.color }} />}
                      <div>
                        <p className="text-xs font-semibold" style={{ color: currentTheme.colors.text }}>{t.description}</p>
                        <p className="text-[10px]" style={{ color: currentTheme.colors.textMuted }}>{fmt(t.amount)}/mês</p>
                      </div>
                    </div>
                  );
                })}
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "#FEE2E2", border: "1px solid #FECACA" }}>
                  <p className="text-xs font-bold text-red-600">
                    Total: {fmt(monthTxs.filter(t => t.recurring && t.type === "expense").reduce((s,t) => s+t.amount, 0))}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VISÃO ANUAL */}
      {view === "annual" && (
        <div className="px-6 pb-8 space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <SummaryCard icon={<TrendingUp className="w-5 h-5 text-green-600" />} iconBg="#D1FAE5" label={`Receitas ${selectedYear}`} value={fmt(annualIncome)} color="#059669" />
            <SummaryCard icon={<TrendingDown className="w-5 h-5 text-red-500" />} iconBg="#FEE2E2" label={`Despesas ${selectedYear}`} value={fmt(annualExpense)} color="#EF4444" />
            <SummaryCard
              icon={<DollarSign className="w-5 h-5" style={{ color: annualBalance >= 0 ? "#059669" : "#DC2626" }} />}
              iconBg={annualBalance >= 0 ? "#A7F3D0" : "#FECACA"}
              label="Saldo Anual" value={fmt(annualBalance)}
              color={annualBalance >= 0 ? "#059669" : "#DC2626"}
            />
          </div>

          <div className="rounded-2xl p-6" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
            <h3 className="font-display text-lg font-semibold mb-1" style={{ color: currentTheme.colors.text }}>Receitas vs Despesas por Mês</h3>
            <div className="flex items-center gap-4 mb-5">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-green-500" /><span className="text-xs" style={{ color: currentTheme.colors.textMuted }}>Receitas</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-400" /><span className="text-xs" style={{ color: currentTheme.colors.textMuted }}>Despesas</span></div>
            </div>
            <div className="flex items-end gap-2 h-44">
              {monthlyChart.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-0.5 items-end" style={{ height: "140px" }}>
                    <div
                      className="flex-1 rounded-t-md transition-all hover:opacity-80 cursor-pointer"
                      style={{ height: `${m.inc > 0 ? (m.inc / maxChartVal) * 100 : 0}%`, background: "#10B981", minHeight: m.inc > 0 ? "4px" : "0" }}
                      title={`Receitas: ${fmt(m.inc)}`}
                    />
                    <div
                      className="flex-1 rounded-t-md transition-all hover:opacity-80 cursor-pointer"
                      style={{ height: `${m.exp > 0 ? (m.exp / maxChartVal) * 100 : 0}%`, background: "#F87171", minHeight: m.exp > 0 ? "4px" : "0" }}
                      title={`Despesas: ${fmt(m.exp)}`}
                    />
                  </div>
                  <span className="text-[10px]" style={{ color: i === selectedMonth ? currentTheme.colors.primary : currentTheme.colors.textMuted, fontWeight: i === selectedMonth ? 700 : 400 }}>{m.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-2xl p-5" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
              <h3 className="font-display text-base font-semibold mb-4" style={{ color: currentTheme.colors.text }}>Top Categorias — {selectedYear}</h3>
              <div className="space-y-3">
                {annualCatBreakdown.slice(0, 8).map(({ cat, total, color, icon: Icon }) => {
                  const pct = Math.round((total / annualExpense) * 100);
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {Icon && <Icon className="w-3.5 h-3.5" style={{ color }} />}
                          <span className="text-xs font-medium" style={{ color: currentTheme.colors.text }}>{cat}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: color + "20", color }}>{pct}%</span>
                        </div>
                        <span className="text-xs font-bold" style={{ color: currentTheme.colors.text }}>{fmt(total)}</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: color + "20" }}>
                        <div className="h-full rounded-full" style={{ width: `${(total / annualExpense) * 100}%`, background: color }} />
                      </div>
                    </div>
                  );
                })}
                {annualCatBreakdown.length === 0 && <p className="text-xs text-center py-4" style={{ color: currentTheme.colors.textMuted }}>Sem despesas neste ano</p>}
              </div>
            </div>

            <div className="rounded-2xl p-5" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
              <h3 className="font-display text-base font-semibold mb-4" style={{ color: currentTheme.colors.text }}>Resumo Mensal</h3>
              <div className="overflow-hidden rounded-xl border" style={{ borderColor: currentTheme.colors.primary + "15" }}>
                <div className="grid grid-cols-4 px-3 py-2 text-[10px] font-semibold" style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}>
                  <span>Mês</span><span className="text-right text-green-600">Receitas</span><span className="text-right text-red-500">Despesas</span><span className="text-right">Saldo</span>
                </div>
                <div className="divide-y" style={{ borderColor: currentTheme.colors.primary + "10" }}>
                  {monthlyChart.filter(m => m.inc > 0 || m.exp > 0).map((m, i) => {
                    const bal = m.inc - m.exp;
                    return (
                      <div key={i} className="grid grid-cols-4 px-3 py-2 text-xs hover:opacity-80 transition-all cursor-pointer"
                        onClick={() => { setSelectedMonth(MONTHS_SHORT.indexOf(m.month)); setView("monthly"); }}
                      >
                        <span className="font-medium" style={{ color: currentTheme.colors.text }}>{m.month}</span>
                        <span className="text-right font-medium text-green-600">{fmtShort(m.inc)}</span>
                        <span className="text-right font-medium text-red-500">{fmtShort(m.exp)}</span>
                        <span className="text-right font-bold" style={{ color: bal >= 0 ? "#059669" : "#EF4444" }}>{fmtShort(bal)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HISTÓRICO */}
      {view === "history" && (
        <div className="px-6 pb-8 space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: currentTheme.colors.textMuted }} />
              <input
                type="text"
                placeholder="Buscar lançamentos..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none border-2 border-transparent transition-all"
                style={{ background: currentTheme.colors.surface, color: currentTheme.colors.text }}
                onFocus={e => (e.target.style.borderColor = currentTheme.colors.primary)}
                onBlur={e => (e.target.style.borderColor = "transparent")}
              />
            </div>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as any)}
              className="px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: currentTheme.colors.surface, color: currentTheme.colors.text, boxShadow: `0 2px 8px ${currentTheme.colors.primary}10` }}
            >
              <option value="all">Todos os tipos</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            {["Todas", ...Object.keys(CATEGORIES)].map(cat => {
              const cfg = CATEGORIES[cat];
              const Icon = cfg?.icon;
              const active = filterCat === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:opacity-80"
                  style={{
                    background: active ? (cfg?.color || currentTheme.colors.primary) : currentTheme.colors.surface,
                    color: active ? "#fff" : currentTheme.colors.text,
                    boxShadow: active ? "none" : `0 1px 4px ${currentTheme.colors.primary}10`,
                  }}
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  {cat}
                </button>
              );
            })}
          </div>

          <p className="text-xs" style={{ color: currentTheme.colors.textMuted }}>
            {historyTxs.length} lançamento{historyTxs.length !== 1 ? "s" : ""} encontrado{historyTxs.length !== 1 ? "s" : ""}
          </p>

          {historyGrouped.map(([mk, txs]) => {
            const [yr, mo] = mk.split("-");
            const label = `${MONTHS[parseInt(mo) - 1]} ${yr}`;
            const grpInc = txs.filter(t => t.type === "income").reduce((s,t) => s+t.amount, 0);
            const grpExp = txs.filter(t => t.type === "expense").reduce((s,t) => s+t.amount, 0);
            return (
              <div key={mk}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-display text-base font-semibold" style={{ color: currentTheme.colors.text }}>{label}</h4>
                  <div className="flex items-center gap-3 text-xs">
                    {grpInc > 0 && <span className="font-semibold text-green-600">+{fmt(grpInc)}</span>}
                    {grpExp > 0 && <span className="font-semibold text-red-500">-{fmt(grpExp)}</span>}
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 12px ${currentTheme.colors.primary}08` }}>
                  {txs.map((t, i) => (
                    <div key={t.id} className={i < txs.length - 1 ? "border-b" : ""} style={{ borderColor: currentTheme.colors.primary + "10" }}>
                      <TxRow t={t} theme={currentTheme} onDelete={deleteTx} onEdit={openEdit} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {historyGrouped.length === 0 && (
            <div className="text-center py-16">
              <DollarSign className="w-12 h-12 mx-auto mb-3" style={{ color: currentTheme.colors.textMuted }} />
              <p className="text-lg font-semibold" style={{ color: currentTheme.colors.text }}>Nenhum resultado</p>
              <p className="text-sm mt-1" style={{ color: currentTheme.colors.textMuted }}>Tente ajustar os filtros</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL */}
      {showAdd && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden" style={{ background: currentTheme.colors.surface }}>

            {/* Banner gradiente */}
            <div className="relative px-6 py-5 flex items-center justify-between"
              style={{ background: `linear-gradient(135deg, ${currentTheme.colors.primary} 0%, ${currentTheme.colors.primaryDark} 100%)` }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-white">{editingId ? "Editar Lançamento" : "Novo Lançamento"}</h3>
                  <p className="text-white/70 text-xs">{editingId ? "Atualize os dados do lançamento" : "Registre uma receita ou despesa"}</p>
                </div>
              </div>
              <button onClick={() => setShowAdd(false)}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="p-6">
              {/* Tipo */}
              <div className="flex gap-2 mb-5">
                {(["expense","income"] as const).map(t => {
                  const isActive = form.type === t
                  const color    = t === "income" ? "#10B981" : "#EF4444"
                  const Icon     = t === "income" ? TrendingUp : TrendingDown
                  return (
                    <button key={t} onClick={() => setForm(f => ({ ...f, type: t, category: t === "income" ? "Salário" : "Supermercado" }))}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all"
                      style={{
                        background: isActive ? color : currentTheme.colors.primaryLight,
                        color: isActive ? "#fff" : currentTheme.colors.textMuted,
                        boxShadow: isActive ? `0 4px 14px ${color}40` : 'none',
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      {t === "income" ? "Receita" : "Despesa"}
                    </button>
                  )
                })}
              </div>

              {/* Descrição + Valor + Data em grid 3 colunas */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="col-span-1" style={{ minWidth: 0 }}>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Valor (R$)</label>
                  <input type="number" placeholder="0,00" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none text-sm font-semibold"
                    style={{ background: currentTheme.colors.background, color: currentTheme.colors.text, border: `1.5px solid ${currentTheme.colors.primaryLight}` }} />
                </div>
                <div className="col-span-1" style={{ minWidth: 0 }}>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Data</label>
                  <DatePickerInput
                    value={form.date}
                    onChange={date => setForm(f => ({ ...f, date }))}
                    placeholder="DD/MM/AAAA"
                    theme={currentTheme}
                    direction="down"
                  />
                </div>
                <div className="col-span-1" style={{ minWidth: 0 }}>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Etiqueta (opcional)</label>
                  <input type="text" placeholder="Ex: Delivery..." value={form.label} onChange={e => setForm(f => ({...f, label: e.target.value}))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                    style={{ background: currentTheme.colors.background, color: currentTheme.colors.text, border: `1.5px solid ${currentTheme.colors.primaryLight}` }} />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Descrição</label>
                <input autoFocus type="text" placeholder="Ex: Mercado Extra, Salário de junho..." value={form.description}
                  onChange={e => setForm(f => ({...f, description: e.target.value}))}
                  className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                  style={{ background: currentTheme.colors.background, color: currentTheme.colors.text, border: `1.5px solid ${currentTheme.colors.primaryLight}` }} />
              </div>

              {/* Categoria */}
              <div className="mb-4">
                <label className="block text-xs font-medium mb-2" style={{ color: currentTheme.colors.textMuted }}>Categoria</label>
                <div className="grid grid-cols-5 gap-2">
                  {(form.type === "income" ? incomeCats : expenseCats).map(cat => {
                    const cfg    = CATEGORIES[cat]
                    const Icon   = cfg.icon
                    const active = form.category === cat
                    return (
                      <button key={cat} onClick={() => setForm(f => ({...f, category: cat}))}
                        className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-2xl text-[10px] font-semibold transition-all hover:scale-105"
                        style={{
                          background: active ? cfg.color + "22" : currentTheme.colors.background,
                          border: `2px solid ${active ? cfg.color : 'transparent'}`,
                          color: active ? cfg.color : currentTheme.colors.textMuted,
                        }}
                      >
                        <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                          style={{ background: active ? cfg.color + "30" : currentTheme.colors.primaryLight }}>
                          <Icon className="w-3.5 h-3.5" style={{ color: active ? cfg.color : currentTheme.colors.textMuted }} />
                        </div>
                        {cat}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Recorrente */}
              <label className="flex items-center gap-3 mb-5 cursor-pointer px-4 py-3 rounded-2xl transition-all hover:opacity-90"
                style={{ background: form.recurring ? currentTheme.colors.primaryLight : currentTheme.colors.background, border: `1.5px solid ${form.recurring ? currentTheme.colors.primary : currentTheme.colors.primaryLight}` }}>
                <div className="relative w-9 h-5 rounded-full transition-all flex-shrink-0"
                  style={{ background: form.recurring ? currentTheme.colors.primary : currentTheme.colors.primaryLight }}>
                  <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all"
                    style={{ left: form.recurring ? '18px' : '2px' }} />
                  <input type="checkbox" checked={form.recurring} onChange={e => setForm(f => ({...f, recurring: e.target.checked}))} className="sr-only" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: currentTheme.colors.text }}>Lançamento recorrente</p>
                  <p className="text-xs" style={{ color: currentTheme.colors.textMuted }}>Assinatura, conta mensal, aluguel...</p>
                </div>
                <Repeat className="w-4 h-4 flex-shrink-0" style={{ color: form.recurring ? currentTheme.colors.primary : currentTheme.colors.textMuted }} />
              </label>

              {/* Botões */}
              <div className="flex gap-3">
                <button onClick={saveTransaction} disabled={saving}
                  className="flex-1 py-3 rounded-2xl text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-60"
                  style={{ background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.primaryDark})`, boxShadow: `0 4px 14px ${currentTheme.colors.primary}40` }}>
                  {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Salvar lançamento"}
                </button>
                <button onClick={() => setShowAdd(false)}
                  className="px-6 py-3 rounded-2xl font-semibold text-sm hover:opacity-80 transition-all"
                  style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>{/* fecha max-w */}
    </div>
  );
}

function SummaryCard({ icon, iconBg, label, value, color }: { icon: React.ReactNode; iconBg: string; label: string; value: string; color: string }) {
  const { currentTheme } = useTheme();
  return (
    <div className="rounded-2xl p-4" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>{icon}</div>
        <p className="text-xs" style={{ color: currentTheme.colors.textMuted }}>{label}</p>
      </div>
      <p className="text-xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

function TxRow({ t, theme, onDelete, onEdit }: { t: Transaction; theme: any; onDelete: (id: string) => void; onEdit: (tx: Transaction) => void }) {
  const cfg = CATEGORIES[t.category] || CATEGORIES["Outros"];
  const Icon = cfg.icon;
  return (
    <div className="group flex items-center gap-3 px-4 py-3 hover:bg-black/5 transition-all">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cfg.color + "20" }}>
        <Icon className="w-5 h-5" style={{ color: cfg.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate" style={{ color: theme.colors.text }}>{t.description}</p>
          {t.recurring && <Repeat className="w-3 h-3 flex-shrink-0" style={{ color: theme.colors.textMuted }} />}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: cfg.color + "20", color: cfg.color }}>{t.category}</span>
          {t.label && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: theme.colors.primaryLight, color: theme.colors.primaryDark }}>{t.label}</span>}
          <span className="text-[10px]" style={{ color: theme.colors.textMuted }}>{new Date(t.date + "T00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}</span>
        </div>
      </div>
      <p className="text-sm font-bold flex-shrink-0" style={{ color: t.type === "income" ? "#10B981" : "#EF4444" }}>
        {t.type === "income" ? "+" : "-"}{t.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      </p>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all ml-1">
        <button onClick={() => onEdit(t)}
          className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:opacity-80"
          style={{ background: theme.colors.primaryLight }}>
          <Pencil className="w-3.5 h-3.5" style={{ color: theme.colors.primary }} />
        </button>
        <button onClick={() => onDelete(t.id)}
          className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:opacity-80"
          style={{ background: '#EF444420' }}>
          <Trash2 className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />
        </button>
      </div>
    </div>
  );
}
