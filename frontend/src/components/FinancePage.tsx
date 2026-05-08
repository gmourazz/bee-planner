import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Trash2,
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

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  label: string;
  date: string;
  recurring?: boolean;
}

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

const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const MONTHS_SHORT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

let nid = 1;
function tx(date: string, description: string, amount: number, type: "income"|"expense", category: string, label: string, recurring = false): Transaction {
  return { id: nid++, date, description, amount, type, category, label, recurring };
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  // JANEIRO 2026
  tx("2026-01-01","Salário Janeiro",3500,"income","Salário","Renda Principal"),
  tx("2026-01-05","Aluguel",1200,"expense","Casa","Moradia",true),
  tx("2026-01-05","Condomínio",280,"expense","Casa","Moradia",true),
  tx("2026-01-10","Netflix",39,"expense","Streamings","Entretenimento",true),
  tx("2026-01-10","Spotify",21,"expense","Streamings","Entretenimento",true),
  tx("2026-01-10","Disney+",29,"expense","Streamings","Entretenimento",true),
  tx("2026-01-12","Energia Elétrica",145,"expense","Contas","Utilidades",true),
  tx("2026-01-12","Internet",100,"expense","Contas","Utilidades",true),
  tx("2026-01-12","Plano de Saúde",280,"expense","Assinaturas","Assinatura",true),
  tx("2026-01-14","Mercado",420,"expense","Supermercado","Alimentação"),
  tx("2026-01-18","iFood",75,"expense","Alimentação","Delivery"),
  tx("2026-01-20","Uber",45,"expense","Transporte","Aplicativo"),
  tx("2026-01-22","Farmácia",90,"expense","Saúde","Remédio"),
  tx("2026-01-25","Curso React Avançado",79,"expense","Estudos","Curso Online"),
  tx("2026-01-28","Restaurante",110,"expense","Alimentação","Saída"),
  // FEVEREIRO 2026
  tx("2026-02-01","Salário Fevereiro",3500,"income","Salário","Renda Principal"),
  tx("2026-02-03","Freelance Landing Page",600,"income","Freelance","Projeto"),
  tx("2026-02-05","Aluguel",1200,"expense","Casa","Moradia",true),
  tx("2026-02-05","Condomínio",280,"expense","Casa","Moradia",true),
  tx("2026-02-10","Netflix",39,"expense","Streamings","Entretenimento",true),
  tx("2026-02-10","Spotify",21,"expense","Streamings","Entretenimento",true),
  tx("2026-02-10","Disney+",29,"expense","Streamings","Entretenimento",true),
  tx("2026-02-12","Energia Elétrica",132,"expense","Contas","Utilidades",true),
  tx("2026-02-12","Internet",100,"expense","Contas","Utilidades",true),
  tx("2026-02-12","Plano de Saúde",280,"expense","Assinaturas","Assinatura",true),
  tx("2026-02-14","Presente Namorada",150,"expense","Lazer","Presente"),
  tx("2026-02-16","Mercado",380,"expense","Supermercado","Alimentação"),
  tx("2026-02-20","Consulta Médica",200,"expense","Saúde","Consulta"),
  tx("2026-02-22","Uber",38,"expense","Transporte","Aplicativo"),
  tx("2026-02-25","Roupas",230,"expense","Vestuário","Moda"),
  // MARÇO 2026
  tx("2026-03-01","Salário Março",3500,"income","Salário","Renda Principal"),
  tx("2026-03-05","Aluguel",1200,"expense","Casa","Moradia",true),
  tx("2026-03-05","Condomínio",280,"expense","Casa","Moradia",true),
  tx("2026-03-08","IPTU (parcela)",180,"expense","Casa","Impostos",true),
  tx("2026-03-10","Netflix",39,"expense","Streamings","Entretenimento",true),
  tx("2026-03-10","Spotify",21,"expense","Streamings","Entretenimento",true),
  tx("2026-03-10","Disney+",29,"expense","Streamings","Entretenimento",true),
  tx("2026-03-10","Amazon Prime",19,"expense","Streamings","Entretenimento",true),
  tx("2026-03-12","Energia Elétrica",158,"expense","Contas","Utilidades",true),
  tx("2026-03-12","Internet",100,"expense","Contas","Utilidades",true),
  tx("2026-03-12","Plano de Saúde",280,"expense","Assinaturas","Assinatura",true),
  tx("2026-03-12","Notion",25,"expense","Assinaturas","Produtividade",true),
  tx("2026-03-15","Mercado",450,"expense","Supermercado","Alimentação"),
  tx("2026-03-18","iFood",95,"expense","Alimentação","Delivery"),
  tx("2026-03-20","Uber",52,"expense","Transporte","Aplicativo"),
  tx("2026-03-22","Academia",90,"expense","Saúde","Fitness",true),
  tx("2026-03-25","Livros",85,"expense","Estudos","Livros"),
  tx("2026-03-28","Cinema + Jantar",140,"expense","Lazer","Saída"),
  // ABRIL 2026
  tx("2026-04-01","Salário Abril",3500,"income","Salário","Renda Principal"),
  tx("2026-04-02","Freelance Dashboard",800,"income","Freelance","Projeto"),
  tx("2026-04-05","Aluguel",1200,"expense","Casa","Moradia",true),
  tx("2026-04-05","Condomínio",280,"expense","Casa","Moradia",true),
  tx("2026-04-08","IPTU (parcela)",180,"expense","Casa","Impostos",true),
  tx("2026-04-10","Netflix",39,"expense","Streamings","Entretenimento",true),
  tx("2026-04-10","Spotify",21,"expense","Streamings","Entretenimento",true),
  tx("2026-04-10","Disney+",29,"expense","Streamings","Entretenimento",true),
  tx("2026-04-10","Amazon Prime",19,"expense","Streamings","Entretenimento",true),
  tx("2026-04-12","Energia Elétrica",122,"expense","Contas","Utilidades",true),
  tx("2026-04-12","Internet",100,"expense","Contas","Utilidades",true),
  tx("2026-04-12","Plano de Saúde",280,"expense","Assinaturas","Assinatura",true),
  tx("2026-04-12","Notion",25,"expense","Assinaturas","Produtividade",true),
  tx("2026-04-14","Mercado",395,"expense","Supermercado","Alimentação"),
  tx("2026-04-17","iFood",65,"expense","Alimentação","Delivery"),
  tx("2026-04-20","Uber",40,"expense","Transporte","Aplicativo"),
  tx("2026-04-21","Transporte público",55,"expense","Transporte","Vale"),
  tx("2026-04-22","Academia",90,"expense","Saúde","Fitness",true),
  tx("2026-04-25","Curso TypeScript",49,"expense","Estudos","Curso Online"),
  tx("2026-04-27","Roupa esporte",180,"expense","Vestuário","Esporte"),
  // MAIO 2026
  tx("2026-05-01","Salário Maio",3500,"income","Salário","Renda Principal"),
  tx("2026-05-03","Freelance React",800,"income","Freelance","Projeto"),
  tx("2026-05-05","Aluguel",1200,"expense","Casa","Moradia",true),
  tx("2026-05-05","Condomínio",280,"expense","Casa","Moradia",true),
  tx("2026-05-08","IPTU (parcela)",180,"expense","Casa","Impostos",true),
  tx("2026-05-10","Netflix",39,"expense","Streamings","Entretenimento",true),
  tx("2026-05-10","Spotify",21,"expense","Streamings","Entretenimento",true),
  tx("2026-05-10","Disney+",29,"expense","Streamings","Entretenimento",true),
  tx("2026-05-10","Amazon Prime",19,"expense","Streamings","Entretenimento",true),
  tx("2026-05-12","Energia Elétrica",138,"expense","Contas","Utilidades",true),
  tx("2026-05-12","Internet",100,"expense","Contas","Utilidades",true),
  tx("2026-05-12","Plano de Saúde",280,"expense","Assinaturas","Assinatura",true),
  tx("2026-05-12","Notion",25,"expense","Assinaturas","Produtividade",true),
  tx("2026-05-14","Mercado",410,"expense","Supermercado","Alimentação"),
  tx("2026-05-16","iFood",82,"expense","Alimentação","Delivery"),
  tx("2026-05-18","Academia",90,"expense","Saúde","Fitness",true),
  tx("2026-05-20","Uber",55,"expense","Transporte","Aplicativo"),
  tx("2026-05-22","Consulta Dermatologista",180,"expense","Saúde","Consulta"),
  tx("2026-05-25","Curso Udemy",29,"expense","Estudos","Curso Online"),
  tx("2026-05-28","Presente Mamãe",120,"expense","Lazer","Presente"),
];

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtShort = (v: number) => v >= 1000 ? `R$${(v/1000).toFixed(1)}k` : `R$${v.toFixed(0)}`;

function monthKey(date: string) { return date.slice(0, 7); }
function yearOf(date: string) { return parseInt(date.slice(0, 4)); }
function monthOf(date: string) { return parseInt(date.slice(5, 7)) - 1; }

export function FinancePage() {
  const { currentTheme } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [view, setView] = useState<"monthly" | "annual" | "history">("monthly");
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(4); // 0-indexed, 4 = Maio
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("Todas");
  const [filterType, setFilterType] = useState<"all"|"income"|"expense">("all");
  const [form, setForm] = useState({
    description: "", amount: "", type: "expense" as "income"|"expense",
    category: "Supermercado", label: "", date: new Date().toISOString().split("T")[0], recurring: false,
  });

  const addTransaction = () => {
    if (!form.description.trim() || !form.amount) return;
    setTransactions(prev => [{
      id: nid++, description: form.description.trim(), amount: parseFloat(form.amount),
      type: form.type, category: form.category,
      label: form.label.trim() || CATEGORIES[form.category]?.type === "income" ? "Renda" : "Despesa",
      date: form.date, recurring: form.recurring,
    }, ...prev]);
    setForm({ description:"", amount:"", type:"expense", category:"Supermercado", label:"", date: new Date().toISOString().split("T")[0], recurring: false });
    setShowAdd(false);
  };

  const deleteTx = (id: number) => setTransactions(prev => prev.filter(t => t.id !== id));

  // ── Monthly calculations ──────────────────────────────────────────
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
    monthTxs.filter(t => t.type === "expense").forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).map(([cat, total]) => ({ cat, total, ...CATEGORIES[cat] }))
      .sort((a, b) => b.total - a.total);
  }, [monthTxs]);
  const maxCat = Math.max(...catBreakdown.map(c => c.total), 1);

  // label breakdown for monthly
  const labelBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    monthTxs.filter(t => t.type === "expense").forEach(t => {
      map[t.label] = (map[t.label] || 0) + t.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [monthTxs]);

  // ── Annual calculations ───────────────────────────────────────────
  const yearTxs = useMemo(() =>
    transactions.filter(t => yearOf(t.date) === selectedYear),
    [transactions, selectedYear]
  );
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
    yearTxs.filter(t => t.type === "expense").forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).map(([cat, total]) => ({ cat, total, ...CATEGORIES[cat] }))
      .sort((a, b) => b.total - a.total);
  }, [yearTxs]);

  // ── History ───────────────────────────────────────────────────────
  const historyTxs = useMemo(() => {
    return transactions
      .filter(t => {
        const matchSearch = search === "" || t.description.toLowerCase().includes(search.toLowerCase()) || t.label.toLowerCase().includes(search.toLowerCase());
        const matchCat = filterCat === "Todas" || t.category === filterCat;
        const matchType = filterType === "all" || t.type === filterType;
        return matchSearch && matchCat && matchType;
      })
      .sort((a,b) => b.date.localeCompare(a.date));
  }, [transactions, search, filterCat, filterType]);

  // group by month for history
  const historyGrouped = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    historyTxs.forEach(t => {
      const k = monthKey(t.date);
      if (!groups[k]) groups[k] = [];
      groups[k].push(t);
    });
    return Object.entries(groups).sort((a,b) => b[0].localeCompare(a[0]));
  }, [historyTxs]);

  const navMonth = (delta: number) => {
    let m = selectedMonth + delta;
    let y = selectedYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0)  { m = 11; y--; }
    setSelectedMonth(m);
    setSelectedYear(y);
  };

  const expenseCats = Object.entries(CATEGORIES).filter(([,v]) => v.type !== "income").map(([k]) => k);
  const incomeCats  = Object.entries(CATEGORIES).filter(([,v]) => v.type !== "expense").map(([k]) => k);

  return (
    <div className="flex-1 overflow-auto" style={{ background: currentTheme.colors.background }}>
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <h1 className="font-display text-[36px] font-bold" style={{ color: currentTheme.colors.text }}>
          Finanças
        </h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-semibold hover:opacity-90 transition-all"
          style={{ background: currentTheme.colors.primary }}
        >
          <Plus className="w-4 h-4" /> Novo Lançamento
        </button>
      </div>

      {/* ─── View Tabs ──────────────────────────────────────────── */}
      <div className="flex gap-2 px-6 mb-5">
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

      {/* ══════════════════════════════════════════════════════════ */}
      {/* VISÃO MENSAL                                              */}
      {/* ══════════════════════════════════════════════════════════ */}
      {view === "monthly" && (
        <div className="px-6 pb-8 space-y-5">
          {/* Month navigator */}
          <div className="flex items-center gap-3">
            <button onClick={() => navMonth(-1)} className="p-2 rounded-xl hover:opacity-70 transition-all" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 8px ${currentTheme.colors.primary}10` }}>
              <ChevronLeft className="w-4 h-4" style={{ color: currentTheme.colors.primaryDark }} />
            </button>
            <h2 className="font-display text-2xl font-bold" style={{ color: currentTheme.colors.text }}>
              {MONTHS[selectedMonth]} {selectedYear}
            </h2>
            <button onClick={() => navMonth(1)} className="p-2 rounded-xl hover:opacity-70 transition-all" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 8px ${currentTheme.colors.primary}10` }}>
              <ChevronRight className="w-4 h-4" style={{ color: currentTheme.colors.primaryDark }} />
            </button>
          </div>

          {/* Summary cards */}
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

          {/* Content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Transactions */}
            <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold" style={{ color: currentTheme.colors.text }}>
                  Lançamentos — {MONTHS_SHORT[selectedMonth]}
                </h3>
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}>
                  {monthTxs.length} itens
                </span>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {monthTxs.length === 0 && (
                  <p className="text-center py-8 text-sm" style={{ color: currentTheme.colors.textMuted }}>Nenhum lançamento neste mês</p>
                )}
                {monthTxs.map(t => <TxRow key={t.id} t={t} theme={currentTheme} onDelete={deleteTx} />)}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-5">
              {/* Category breakdown */}
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
                </div>
              </div>

              {/* Labels / Tags breakdown */}
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
            </div>
          </div>

          {/* Recurring subscriptions highlight */}
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

      {/* ══════════════════════════════════════════════════════════ */}
      {/* VISÃO ANUAL                                               */}
      {/* ══════════════════════════════════════════════════════════ */}
      {view === "annual" && (
        <div className="px-6 pb-8 space-y-5">
          {/* Year navigator */}
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedYear(y => y - 1)} className="p-2 rounded-xl hover:opacity-70 transition-all" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 8px ${currentTheme.colors.primary}10` }}>
              <ChevronLeft className="w-4 h-4" style={{ color: currentTheme.colors.primaryDark }} />
            </button>
            <h2 className="font-display text-2xl font-bold" style={{ color: currentTheme.colors.text }}>{selectedYear}</h2>
            <button onClick={() => setSelectedYear(y => y + 1)} className="p-2 rounded-xl hover:opacity-70 transition-all" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 8px ${currentTheme.colors.primary}10` }}>
              <ChevronRight className="w-4 h-4" style={{ color: currentTheme.colors.primaryDark }} />
            </button>
          </div>

          {/* Annual summary */}
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

          {/* Monthly bar chart */}
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
            {/* Annual category breakdown */}
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
              </div>
            </div>

            {/* Month-by-month table */}
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
                      <div key={i} className="grid grid-cols-4 px-3 py-2 text-xs hover:opacity-80 transition-all cursor-pointer" style={{ background: "transparent" }}
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

      {/* ══════════════════════════════════════════════════════════ */}
      {/* HISTÓRICO                                                 */}
      {/* ══════════════════════════════════════════════════════════ */}
      {view === "history" && (
        <div className="px-6 pb-8 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
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
            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              className="px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: currentTheme.colors.surface, color: currentTheme.colors.text, boxShadow: `0 2px 8px ${currentTheme.colors.primary}10` }}
            >
              <option value="Todas">Todas categorias</option>
              {Object.keys(CATEGORIES).map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Category pills */}
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

          {/* Result count */}
          <p className="text-xs" style={{ color: currentTheme.colors.textMuted }}>
            {historyTxs.length} lançamento{historyTxs.length !== 1 ? "s" : ""} encontrado{historyTxs.length !== 1 ? "s" : ""}
          </p>

          {/* Grouped list */}
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
                      <TxRow t={t} theme={currentTheme} onDelete={deleteTx} />
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

      {/* ══════════════════════════════════════════════════════════ */}
      {/* MODAL                                                     */}
      {/* ══════════════════════════════════════════════════════════ */}
      {showAdd && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" style={{ background: currentTheme.colors.surface }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl font-bold" style={{ color: currentTheme.colors.text }}>Novo Lançamento</h3>
              <button onClick={() => setShowAdd(false)}><X className="w-5 h-5" style={{ color: currentTheme.colors.textMuted }} /></button>
            </div>

            {/* Type toggle */}
            <div className="flex gap-2 mb-4">
              {(["expense","income"] as const).map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, type: t, category: t === "income" ? "Salário" : "Supermercado" }))}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: form.type === t ? (t === "income" ? "#10B981" : "#EF4444") : currentTheme.colors.primaryLight, color: form.type === t ? "#fff" : currentTheme.colors.text }}
                >
                  {t === "income" ? "Receita" : "Despesa"}
                </button>
              ))}
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1" style={{ color: currentTheme.colors.text }}>Descrição</label>
              <input autoFocus type="text" placeholder="Ex: Mercado Extra" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                className="w-full px-4 py-2.5 rounded-xl outline-none text-sm" style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }} />
            </div>

            {/* Amount + Date */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: currentTheme.colors.text }}>Valor (R$)</label>
                <input type="number" placeholder="0,00" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))}
                  className="w-full px-4 py-2.5 rounded-xl outline-none text-sm" style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: currentTheme.colors.text }}>Data</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))}
                  className="w-full px-4 py-2.5 rounded-xl outline-none text-sm" style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }} />
              </div>
            </div>

            {/* Category */}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>Categoria</label>
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {(form.type === "income" ? incomeCats : expenseCats).map(cat => {
                  const cfg = CATEGORIES[cat];
                  const Icon = cfg.icon;
                  const active = form.category === cat;
                  return (
                    <button key={cat} onClick={() => setForm(f => ({...f, category: cat}))}
                      className="flex flex-col items-center gap-1 p-2.5 rounded-xl text-[11px] font-medium transition-all hover:opacity-80"
                      style={{ background: active ? cfg.color + "25" : currentTheme.colors.primaryLight, border: active ? `2px solid ${cfg.color}` : "2px solid transparent", color: active ? cfg.color : currentTheme.colors.text }}
                    >
                      <Icon className="w-4 h-4" style={{ color: active ? cfg.color : currentTheme.colors.textMuted }} />
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Label / Etiqueta */}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1" style={{ color: currentTheme.colors.text }}>Etiqueta (opcional)</label>
              <input type="text" placeholder="Ex: Moradia, Streaming, Delivery..." value={form.label} onChange={e => setForm(f => ({...f, label: e.target.value}))}
                className="w-full px-4 py-2.5 rounded-xl outline-none text-sm" style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }} />
            </div>

            {/* Recurring */}
            <label className="flex items-center gap-3 mb-5 cursor-pointer p-3 rounded-xl" style={{ background: currentTheme.colors.primaryLight }}>
              <input type="checkbox" checked={form.recurring} onChange={e => setForm(f => ({...f, recurring: e.target.checked}))} className="w-4 h-4 rounded" />
              <div>
                <p className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>Despesa recorrente</p>
                <p className="text-xs" style={{ color: currentTheme.colors.textMuted }}>Assinatura, conta mensal, aluguel...</p>
              </div>
              <Repeat className="w-4 h-4 ml-auto" style={{ color: form.recurring ? currentTheme.colors.primary : currentTheme.colors.textMuted }} />
            </label>

            <div className="flex gap-3">
              <button onClick={addTransaction} className="flex-1 py-2.5 rounded-full text-white font-semibold hover:opacity-90 transition-all" style={{ background: currentTheme.colors.primary }}>
                Salvar
              </button>
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-full font-semibold hover:opacity-80 transition-all" style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────── */

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

function TxRow({ t, theme, onDelete }: { t: Transaction; theme: any; onDelete: (id: number) => void }) {
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
      <button onClick={() => onDelete(t.id)} className="opacity-0 group-hover:opacity-100 transition-all ml-1">
        <Trash2 className="w-4 h-4 text-red-400" />
      </button>
    </div>
  );
}
