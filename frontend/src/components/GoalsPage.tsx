import {
  Target,
  Plus,
  Trash2,
  CheckCircle2,
  Trophy,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Check,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

interface Goal {
  id: number;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  color: string;
  category: string;
  deadline?: string;
}

const COLORS = ["#F472B6", "#A855F7", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#6366F1"];
const CATEGORIES = ["Educação", "Saúde", "Financeiro", "Pessoal", "Carreira", "Relacionamentos"];
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

let nextId = 10;

const annual2026: Goal[] = [
  { id: nextId++, title: "Ler 24 livros", description: "Um livro a cada 2 semanas", target: 24, current: 8, unit: "livros", color: "#A855F7", category: "Educação" },
  { id: nextId++, title: "Concluir 5 cursos online", description: "Foco em tecnologia e desenvolvimento", target: 5, current: 5, unit: "cursos", color: "#10B981", category: "Carreira" },
  { id: nextId++, title: "90% de hábitos diários", description: "Manter consistência nos hábitos", target: 90, current: 87, unit: "%", color: "#F59E0B", category: "Saúde" },
  { id: nextId++, title: "Concluir TCC", description: "Entrega final em novembro/2026", target: 100, current: 65, unit: "%", color: "#6366F1", category: "Educação", deadline: "2026-11-30" },
  { id: nextId++, title: "Economizar R$ 10.000", description: "Fundo de emergência e investimentos", target: 10000, current: 4200, unit: "R$", color: "#F472B6", category: "Financeiro" },
  { id: nextId++, title: "Correr 500km no ano", description: "Aprox. 10km por semana", target: 500, current: 187, unit: "km", color: "#EF4444", category: "Saúde" },
];

const monthlyGoals: Record<number, Goal[]> = {
  4: [
    { id: nextId++, title: "Ler 2 livros", description: "", target: 2, current: 2, unit: "livros", color: "#A855F7", category: "Educação" },
    { id: nextId++, title: "30 dias de exercício", description: "", target: 30, current: 28, unit: "dias", color: "#10B981", category: "Saúde" },
    { id: nextId++, title: "Economizar R$ 800", description: "", target: 800, current: 800, unit: "R$", color: "#F472B6", category: "Financeiro" },
  ],
  5: [
    { id: nextId++, title: "Ler 2 livros", description: "", target: 2, current: 0, unit: "livros", color: "#A855F7", category: "Educação" },
    { id: nextId++, title: "Exercitar 20 dias", description: "", target: 20, current: 1, unit: "dias", color: "#10B981", category: "Saúde" },
    { id: nextId++, title: "Economizar R$ 900", description: "", target: 900, current: 0, unit: "R$", color: "#F472B6", category: "Financeiro" },
    { id: nextId++, title: "Escrever 10 páginas TCC", description: "", target: 10, current: 2, unit: "páginas", color: "#6366F1", category: "Educação" },
  ],
};

function GoalCard({ goal, onDelete, onEdit }: { goal: Goal; onDelete: () => void; onEdit: (current: number) => void }) {
  const { currentTheme } = useTheme();
  const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(goal.current));

  const done = pct >= 100;

  return (
    <div
      className="rounded-2xl p-5 group transition-all hover:shadow-lg"
      style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 12px ${goal.color}15`, border: done ? `2px solid ${goal.color}` : "2px solid transparent" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {done
            ? <CheckCircle2 className="w-5 h-5" style={{ color: goal.color }} />
            : <Target className="w-5 h-5" style={{ color: goal.color }} />
          }
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: goal.color + "20", color: goal.color }}>{goal.category}</span>
        </div>
        <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 transition-all">
          <Trash2 className="w-4 h-4 text-red-400" />
        </button>
      </div>

      <h4 className="font-display text-base font-semibold mb-1" style={{ color: currentTheme.colors.text }}>{goal.title}</h4>
      {goal.description && <p className="text-xs mb-3" style={{ color: currentTheme.colors.textMuted }}>{goal.description}</p>}
      {goal.deadline && (
        <p className="text-xs mb-2 flex items-center gap-1" style={{ color: currentTheme.colors.textMuted }}>
          <CalendarDays className="w-3 h-3" /> Prazo: {new Date(goal.deadline + "T00:00").toLocaleDateString("pt-BR")}
        </p>
      )}

      <div className="mb-2">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1">
            {editing ? (
              <>
                <input
                  autoFocus
                  type="number"
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { onEdit(Number(val)); setEditing(false); } if (e.key === "Escape") setEditing(false); }}
                  className="w-20 px-2 py-0.5 rounded-lg text-sm outline-none border"
                  style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text, borderColor: goal.color + "50" }}
                />
                <button onClick={() => { onEdit(Number(val)); setEditing(false); }}>
                  <Check className="w-4 h-4" style={{ color: goal.color }} />
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="flex items-center gap-1 hover:opacity-70">
                <span className="text-sm font-semibold" style={{ color: currentTheme.colors.text }}>
                  {goal.unit === "R$" ? `R$ ${goal.current.toLocaleString()}` : `${goal.current} ${goal.unit}`}
                </span>
                <Edit3 className="w-3 h-3" style={{ color: currentTheme.colors.textMuted }} />
              </button>
            )}
          </div>
          <span className="text-sm font-bold" style={{ color: goal.color }}>{pct}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: goal.color + "20" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: goal.color }} />
        </div>
        <p className="text-[10px] mt-1" style={{ color: currentTheme.colors.textMuted }}>
          Meta: {goal.unit === "R$" ? `R$ ${goal.target.toLocaleString()}` : `${goal.target} ${goal.unit}`}
        </p>
      </div>
      {done && (
        <div className="flex items-center gap-1.5 mt-2">
          <Trophy className="w-4 h-4" style={{ color: currentTheme.colors.accent }} />
          <span className="text-xs font-semibold" style={{ color: currentTheme.colors.accent }}>Meta concluída!</span>
        </div>
      )}
    </div>
  );
}

export function GoalsPage() {
  const { currentTheme } = useTheme();
  const [tab, setTab] = useState<"annual" | "monthly">("annual");
  const [selectedMonth, setSelectedMonth] = useState(4);
  const [annualGoals, setAnnualGoals] = useState<Goal[]>(annual2026);
  const [monthData, setMonthData] = useState<Record<number, Goal[]>>(monthlyGoals);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", target: "", current: "0", unit: "itens", color: COLORS[0], category: CATEGORIES[0], deadline: "" });

  const currentGoals = tab === "annual" ? annualGoals : (monthData[selectedMonth] || []);
  const completedCount = currentGoals.filter((g) => g.current >= g.target).length;
  const totalProgress = currentGoals.length > 0
    ? Math.round(currentGoals.reduce((s, g) => s + Math.min(100, (g.current / g.target) * 100), 0) / currentGoals.length)
    : 0;

  const deleteGoal = (id: number) => {
    if (tab === "annual") setAnnualGoals((g) => g.filter((x) => x.id !== id));
    else setMonthData((m) => ({ ...m, [selectedMonth]: (m[selectedMonth] || []).filter((x) => x.id !== id) }));
  };

  const editProgress = (id: number, current: number) => {
    if (tab === "annual") setAnnualGoals((g) => g.map((x) => x.id === id ? { ...x, current } : x));
    else setMonthData((m) => ({ ...m, [selectedMonth]: (m[selectedMonth] || []).map((x) => x.id === id ? { ...x, current } : x) }));
  };

  const addGoal = () => {
    if (!form.title.trim() || !form.target) return;
    const goal: Goal = {
      id: nextId++,
      title: form.title.trim(),
      description: form.description.trim(),
      target: Number(form.target),
      current: Number(form.current),
      unit: form.unit.trim() || "itens",
      color: form.color,
      category: form.category,
      deadline: form.deadline || undefined,
    };
    if (tab === "annual") setAnnualGoals((g) => [...g, goal]);
    else setMonthData((m) => ({ ...m, [selectedMonth]: [...(m[selectedMonth] || []), goal] }));
    setForm({ title: "", description: "", target: "", current: "0", unit: "itens", color: COLORS[0], category: CATEGORIES[0], deadline: "" });
    setShowAdd(false);
  };

  return (
    <div className="flex-1 overflow-auto p-6" style={{ background: currentTheme.colors.background }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-[36px] font-bold" style={{ color: currentTheme.colors.text }}>
          Metas & Objetivos
        </h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-semibold hover:opacity-90 transition-all"
          style={{ background: currentTheme.colors.primary }}
        >
          <Plus className="w-4 h-4" />
          Nova Meta
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["annual", "monthly"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all"
            style={{
              background: tab === t ? currentTheme.colors.primary : currentTheme.colors.surface,
              color: tab === t ? "#fff" : currentTheme.colors.text,
              boxShadow: tab === t ? "none" : `0 2px 8px ${currentTheme.colors.primary}10`,
            }}
          >
            {t === "annual" ? "Metas 2026" : "Metas Mensais"}
          </button>
        ))}
      </div>

      {/* Month selector */}
      {tab === "monthly" && (
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => setSelectedMonth((m) => Math.max(0, m - 1))}
            className="p-1.5 rounded-lg hover:opacity-70 transition-all"
            style={{ background: currentTheme.colors.primaryLight }}
            disabled={selectedMonth === 0}
          >
            <ChevronLeft className="w-4 h-4" style={{ color: currentTheme.colors.primaryDark }} />
          </button>
          <span className="font-semibold text-lg" style={{ color: currentTheme.colors.text }}>
            {MONTHS[selectedMonth]} 2026
          </span>
          <button
            onClick={() => setSelectedMonth((m) => Math.min(11, m + 1))}
            className="p-1.5 rounded-lg hover:opacity-70 transition-all"
            style={{ background: currentTheme.colors.primaryLight }}
            disabled={selectedMonth === 11}
          >
            <ChevronRight className="w-4 h-4" style={{ color: currentTheme.colors.primaryDark }} />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl p-4" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 12px ${currentTheme.colors.primary}10` }}>
          <p className="text-xs mb-1" style={{ color: currentTheme.colors.textMuted }}>Total de Metas</p>
          <p className="text-3xl font-bold" style={{ color: currentTheme.colors.text }}>{currentGoals.length}</p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 12px ${currentTheme.colors.primary}10` }}>
          <p className="text-xs mb-1" style={{ color: currentTheme.colors.textMuted }}>Concluídas</p>
          <p className="text-3xl font-bold" style={{ color: currentTheme.colors.primary }}>{completedCount}</p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 12px ${currentTheme.colors.primary}10` }}>
          <p className="text-xs mb-1 mb-2" style={{ color: currentTheme.colors.textMuted }}>Progresso Geral</p>
          <p className="text-3xl font-bold" style={{ color: currentTheme.colors.text }}>{totalProgress}%</p>
          <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: currentTheme.colors.primaryLight }}>
            <div className="h-full rounded-full" style={{ width: `${totalProgress}%`, background: currentTheme.colors.primary }} />
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      {currentGoals.length === 0 ? (
        <div className="text-center py-20">
          <Target className="w-16 h-16 mx-auto mb-4" style={{ color: currentTheme.colors.textMuted }} />
          <p className="font-display text-2xl mb-2" style={{ color: currentTheme.colors.text }}>Nenhuma meta ainda</p>
          <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>Clique em "Nova Meta" para começar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {currentGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onDelete={() => deleteGoal(goal.id)}
              onEdit={(current) => editProgress(goal.id, current)}
            />
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="rounded-2xl p-6 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]" style={{ background: currentTheme.colors.surface }}>
            <h3 className="font-display text-xl font-bold mb-4" style={{ color: currentTheme.colors.text }}>Nova Meta</h3>

            {[
              { label: "Título", field: "title", type: "text", placeholder: "Ex: Ler 12 livros" },
              { label: "Descrição (opcional)", field: "description", type: "text", placeholder: "Detalhes da meta" },
              { label: "Valor alvo", field: "target", type: "number", placeholder: "Ex: 24" },
              { label: "Progresso atual", field: "current", type: "number", placeholder: "0" },
              { label: "Unidade", field: "unit", type: "text", placeholder: "livros, km, %, R$..." },
              { label: "Prazo (opcional)", field: "deadline", type: "date", placeholder: "" },
            ].map(({ label, field, type, placeholder }) => (
              <div key={field} className="mb-3">
                <label className="block text-sm font-medium mb-1" style={{ color: currentTheme.colors.text }}>{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[field as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl outline-none text-sm"
                  style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }}
                />
              </div>
            ))}

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1" style={{ color: currentTheme.colors.text }}>Categoria</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl outline-none text-sm" style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>Cor</label>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button key={c} onClick={() => setForm((f) => ({ ...f, color: c }))} className="w-8 h-8 rounded-full transition-all hover:scale-110" style={{ background: c, border: form.color === c ? `3px solid ${currentTheme.colors.text}` : "3px solid transparent" }} />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={addGoal} className="flex-1 py-2.5 rounded-full text-white font-semibold hover:opacity-90 transition-all" style={{ background: currentTheme.colors.primary }}>
                Criar Meta
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
