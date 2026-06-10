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
  X,
  Hash,
  TrendingUp,
  Flag,
  Tag,
  Pencil,
  Circle,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useGoals, COLORS, CATEGORIES } from "../hooks/useGoals";
import { DatePickerInput } from "../components/DatePickerInput";
import type { Goal } from "../types/goals.types";

const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function GoalCard({ goal, onDelete, onEditProgress, onToggleComplete, onOpenEdit }: {
  goal: Goal
  onDelete: () => void
  onEditProgress: (current: number) => void
  onToggleComplete: () => void
  onOpenEdit: () => void
}) {
  const { currentTheme } = useTheme();
  const hasTarget = goal.target > 0;
  const pct = hasTarget ? Math.min(100, Math.round((goal.current / goal.target) * 100)) : 0;
  const done = hasTarget ? pct >= 100 : goal.current >= 1;
  const [editingVal, setEditingVal] = useState(false);
  const [val, setVal] = useState(String(goal.current));

  return (
    <div
      className="rounded-2xl p-5 group transition-all hover:shadow-lg relative"
      style={{
        background: currentTheme.colors.surface,
        boxShadow: `0 2px 12px ${goal.color}15`,
        border: done ? `2px solid ${goal.color}` : "2px solid transparent",
      }}
    >
      {/* Header do card */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Botão circular de conclusão */}
          <button
            onClick={onToggleComplete}
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-110"
            style={{
              background: done ? goal.color : "transparent",
              border: `2px solid ${goal.color}`,
            }}
            title={done ? "Desmarcar conclusão" : "Marcar como concluída"}
          >
            {done && <Check className="w-3.5 h-3.5 text-white" />}
          </button>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: goal.color + "20", color: goal.color }}>
            {goal.category}
          </span>
        </div>

        {/* Ações (hover) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button onClick={onOpenEdit} title="Editar meta"
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70 transition-all"
            style={{ background: currentTheme.colors.primaryLight }}>
            <Pencil className="w-3.5 h-3.5" style={{ color: currentTheme.colors.primary }} />
          </button>
          <button onClick={onDelete} title="Excluir meta"
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70 transition-all"
            style={{ background: "#EF444420" }}>
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      </div>

      {/* Título e descrição */}
      <h4 className="font-display text-base font-semibold mb-1 pr-2" style={{ color: done ? currentTheme.colors.textMuted : currentTheme.colors.text, textDecoration: done ? 'line-through' : 'none' }}>
        {goal.title}
      </h4>
      {goal.description && (
        <p className="text-xs mb-3" style={{ color: currentTheme.colors.textMuted }}>{goal.description}</p>
      )}
      {goal.deadline && (
        <p className="text-xs mb-3 flex items-center gap-1" style={{ color: currentTheme.colors.textMuted }}>
          <CalendarDays className="w-3 h-3 flex-shrink-0" />
          Prazo: {new Date(goal.deadline + "T00:00").toLocaleDateString("pt-BR")}
        </p>
      )}

      {/* Progresso (só se tiver alvo) */}
      {hasTarget && (
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1">
              {editingVal ? (
                <>
                  <input
                    autoFocus type="number" value={val}
                    onChange={e => setVal(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") { onEditProgress(Number(val)); setEditingVal(false); }
                      if (e.key === "Escape") setEditingVal(false);
                    }}
                    className="w-20 px-2 py-0.5 rounded-lg text-sm outline-none border"
                    style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text, borderColor: goal.color + "50" }}
                  />
                  <button onClick={() => { onEditProgress(Number(val)); setEditingVal(false); }}>
                    <Check className="w-4 h-4" style={{ color: goal.color }} />
                  </button>
                  <button onClick={() => setEditingVal(false)}>
                    <X className="w-3 h-3" style={{ color: currentTheme.colors.textMuted }} />
                  </button>
                </>
              ) : (
                <button onClick={() => { setVal(String(goal.current)); setEditingVal(true); }}
                  className="flex items-center gap-1 hover:opacity-70 transition-all">
                  <span className="text-sm font-semibold" style={{ color: currentTheme.colors.text }}>
                    {goal.unit === "R$" ? `R$ ${goal.current.toLocaleString()}` : `${goal.current}${goal.unit ? ` ${goal.unit}` : ''}`}
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
            Meta: {goal.unit === "R$" ? `R$ ${goal.target.toLocaleString()}` : `${goal.target}${goal.unit ? ` ${goal.unit}` : ''}`}
          </p>
        </div>
      )}

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
  const {
    tab, setTab,
    selectedYear, selectedMonth, navMonth,
    currentGoals, loading, saving,
    showAdd, setShowAdd, openAdd, openEdit, editingGoal,
    form, setForm,
    addGoal, editProgress, toggleComplete, removeGoal,
  } = useGoals();

  const completedCount = currentGoals.filter(g => {
    if (g.target > 0) return g.current >= g.target;
    return g.current >= 1;
  }).length;
  const goalsWithTarget = currentGoals.filter(g => g.target > 0);
  const totalProgress = goalsWithTarget.length > 0
    ? Math.round(goalsWithTarget.reduce((s, g) => s + Math.min(100, (g.current / g.target) * 100), 0) / goalsWithTarget.length)
    : 0;

  const closeModal = () => { setShowAdd(false); };

  return (
    <div className="flex-1 overflow-auto p-6" style={{ background: currentTheme.colors.background }}>
      <div className="max-w-6xl mx-auto w-full">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {(["annual", "monthly"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all"
              style={{
                background: tab === t ? currentTheme.colors.primary : currentTheme.colors.surface,
                color: tab === t ? "#fff" : currentTheme.colors.text,
                boxShadow: tab !== t ? `0 2px 8px ${currentTheme.colors.primary}10` : "none",
              }}>
              {t === "annual" ? `Metas ${selectedYear}` : "Metas Mensais"}
            </button>
          ))}
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-semibold hover:opacity-90 transition-all"
          style={{ background: currentTheme.colors.primary }}>
          <Plus className="w-4 h-4" /> Nova Meta
        </button>
      </div>

      {/* Seletor de mês */}
      {tab === "monthly" && (
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navMonth(-1)} className="p-1.5 rounded-lg hover:opacity-70 transition-all" style={{ background: currentTheme.colors.primaryLight }}>
            <ChevronLeft className="w-4 h-4" style={{ color: currentTheme.colors.primaryDark }} />
          </button>
          <span className="font-semibold text-lg" style={{ color: currentTheme.colors.text }}>{MONTHS[selectedMonth]} {selectedYear}</span>
          <button onClick={() => navMonth(1)} className="p-1.5 rounded-lg hover:opacity-70 transition-all" style={{ background: currentTheme.colors.primaryLight }}>
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
          <p className="text-xs mb-1" style={{ color: currentTheme.colors.textMuted }}>Progresso Geral</p>
          <p className="text-3xl font-bold" style={{ color: currentTheme.colors.text }}>{totalProgress}%</p>
          <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: currentTheme.colors.primaryLight }}>
            <div className="h-full rounded-full" style={{ width: `${totalProgress}%`, background: currentTheme.colors.primary }} />
          </div>
        </div>
      </div>

      {/* Grid de metas */}
      {loading ? (
        <div className="text-center py-20">
          <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>Carregando...</p>
        </div>
      ) : currentGoals.length === 0 ? (
        <div className="text-center py-20">
          <Target className="w-16 h-16 mx-auto mb-4" style={{ color: currentTheme.colors.textMuted }} />
          <p className="font-display text-2xl mb-2" style={{ color: currentTheme.colors.text }}>Nenhuma meta ainda</p>
          <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>Clique em "Nova Meta" para começar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {currentGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onDelete={() => removeGoal(goal.id)}
              onEditProgress={current => editProgress(goal.id, current)}
              onToggleComplete={() => toggleComplete(goal)}
              onOpenEdit={() => openEdit(goal)}
            />
          ))}
        </div>
      )}

      </div>{/* fecha max-w */}

      {/* Modal: Nova Meta / Editar Meta */}
      {showAdd && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden" style={{ background: currentTheme.colors.surface }}>

            {/* Banner */}
            <div className="relative px-6 py-5 flex items-center justify-between"
              style={{ background: `linear-gradient(135deg, ${currentTheme.colors.primary} 0%, ${currentTheme.colors.primaryDark} 100%)` }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  {editingGoal ? <Pencil className="w-5 h-5 text-white" /> : <Target className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-white">
                    {editingGoal ? "Editar Meta" : "Nova Meta"}
                  </h3>
                  <p className="text-white/70 text-xs">
                    {editingGoal ? "Atualize os dados da meta" : "Defina um objetivo e acompanhe seu progresso"}
                  </p>
                </div>
              </div>
              <button onClick={closeModal}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[80vh]">
              {/* Título + Descrição */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: currentTheme.colors.textMuted }}>
                    Título <span className="text-red-400">*</span>
                  </label>
                  <input autoFocus type="text" placeholder="Ex: Ler 12 livros este ano"
                    value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                    style={{ background: currentTheme.colors.background, color: currentTheme.colors.text, border: `1.5px solid ${currentTheme.colors.primaryLight}` }} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: currentTheme.colors.textMuted }}>Descrição (opcional)</label>
                  <input type="text" placeholder="Detalhes, motivação ou método..."
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                    style={{ background: currentTheme.colors.background, color: currentTheme.colors.text, border: `1.5px solid ${currentTheme.colors.primaryLight}` }} />
                </div>
              </div>

              {/* Alvo / Progresso / Unidade / Prazo */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div style={{ minWidth: 0 }}>
                  <label className="flex items-center gap-1 text-xs font-medium mb-1.5" style={{ color: currentTheme.colors.textMuted }}>
                    <TrendingUp className="w-3 h-3" /> Valor alvo
                  </label>
                  <input type="number" placeholder="opcional"
                    value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none text-sm font-semibold"
                    style={{ background: currentTheme.colors.background, color: currentTheme.colors.text, border: `1.5px solid ${currentTheme.colors.primaryLight}` }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <label className="flex items-center gap-1 text-xs font-medium mb-1.5" style={{ color: currentTheme.colors.textMuted }}>
                    <Check className="w-3 h-3" /> Progresso
                  </label>
                  <input type="number" placeholder="0"
                    value={form.current} onChange={e => setForm(f => ({ ...f, current: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none text-sm font-semibold"
                    style={{ background: currentTheme.colors.background, color: currentTheme.colors.text, border: `1.5px solid ${currentTheme.colors.primaryLight}` }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <label className="flex items-center gap-1 text-xs font-medium mb-1.5" style={{ color: currentTheme.colors.textMuted }}>
                    <Hash className="w-3 h-3" /> Unidade
                  </label>
                  <input type="text" placeholder="livros, km..."
                    value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                    style={{ background: currentTheme.colors.background, color: currentTheme.colors.text, border: `1.5px solid ${currentTheme.colors.primaryLight}` }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <label className="flex items-center gap-1 text-xs font-medium mb-1.5" style={{ color: currentTheme.colors.textMuted }}>
                    <Flag className="w-3 h-3" /> Prazo
                  </label>
                  <DatePickerInput
                    value={form.deadline}
                    onChange={v => setForm(f => ({ ...f, deadline: v }))}
                    placeholder="opcional"
                    theme={currentTheme}
                    direction="down"
                  />
                </div>
              </div>

              {/* Categoria */}
              <div className="mb-4">
                <label className="flex items-center gap-1 text-xs font-medium mb-2" style={{ color: currentTheme.colors.textMuted }}>
                  <Tag className="w-3 h-3" /> Categoria
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, category: c }))}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
                      style={{
                        background: form.category === c ? currentTheme.colors.primary : currentTheme.colors.background,
                        color: form.category === c ? '#fff' : currentTheme.colors.textMuted,
                        border: `1.5px solid ${form.category === c ? currentTheme.colors.primary : currentTheme.colors.primaryLight}`,
                      }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cor */}
              <div className="mb-5">
                <label className="text-xs font-medium mb-2 block" style={{ color: currentTheme.colors.textMuted }}>Cor da meta</label>
                <div className="flex gap-2.5">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                      className="w-9 h-9 rounded-full transition-all hover:scale-110 flex items-center justify-center"
                      style={{ background: c, boxShadow: form.color === c ? `0 0 0 3px ${currentTheme.colors.surface}, 0 0 0 5px ${c}` : 'none' }}>
                      {form.color === c && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <button onClick={addGoal} disabled={!form.title.trim() || saving}
                  className="flex-1 py-3 rounded-2xl text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-60"
                  style={{ background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.primaryDark})`, boxShadow: `0 4px 14px ${currentTheme.colors.primary}40` }}>
                  {saving ? "Salvando..." : editingGoal ? "Salvar alterações" : "Criar Meta"}
                </button>
                <button onClick={closeModal}
                  className="px-6 py-3 rounded-2xl font-semibold text-sm hover:opacity-80 transition-all"
                  style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
