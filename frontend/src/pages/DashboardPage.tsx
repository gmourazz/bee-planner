import {
  CheckSquare, BookOpen,
  Circle, CheckCircle, CalendarDays,
  Plus, ChevronLeft, ChevronRight, Clock, X, Trash2, Dumbbell,
  Zap, Wallet, Target, ArrowUpRight, ArrowDownRight,
  BookMarked, Award, Droplets, Moon, GraduationCap,
} from "lucide-react";
import React, { useState, useRef, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { TaskCategory } from "../services/dashboard";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useDashboard } from "../hooks/useDashboard";
import { useDashboardSummaries } from "../hooks/useDashboardSummaries";
import { CATEGORY_COLORS, STATUS_COLORS } from "../enums/colors";

const CATEGORY_CONFIG: Record<TaskCategory, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  tarefa: { label: 'Tarefa', icon: CheckSquare, ...CATEGORY_COLORS.tarefa },
  habito: { label: 'Hábito', icon: Dumbbell,   ...CATEGORY_COLORS.habito },
  livro:  { label: 'Livro',  icon: BookOpen,   ...CATEGORY_COLORS.livro  },
};

const EVENT_TYPES = ['Pessoal', 'Aniversário', 'Universitário', 'Saúde', 'Entrega'];

const WEEK_DAYS  = ["SEG","TER","QUA","QUI","SEX","SAB","DOM"];
const MONTH_ABBR = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const DAY_NAMES  = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];

function getWeekDates(): string[] {
  const today  = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

interface DashboardProps { userName?: string }

export function DashboardPage({ userName = "Usuária" }: DashboardProps) {
  const { currentTheme } = useTheme();
  const { user }         = useAuth();
  const navigate         = useNavigate();
  const c = currentTheme.colors;

  const todayKey  = new Date().toISOString().split("T")[0];
  const weekDates = getWeekDates();

  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [showAddTask,  setShowAddTask]  = useState(false);
  const [newTask,      setNewTask]      = useState("");
  const [newTime,      setNewTime]      = useState("");
  const [showTime,     setShowTime]     = useState(false);
  const [newCategory,  setNewCategory]  = useState<TaskCategory>('tarefa');
  const [editingId,    setEditingId]    = useState<string | null>(null);
  const [editText,     setEditText]     = useState("");
  const [editCategory, setEditCategory] = useState<TaskCategory>('tarefa');

  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvTitle,   setNewEvTitle]   = useState("");
  const [newEvDate,    setNewEvDate]    = useState("");
  const [newEvType,    setNewEvType]    = useState("Pessoal");

  const { tasks, events, weekSummary, loading, addTask, addEvent, toggleDone, editTask, removeTask } = useDashboard(selectedDate, weekDates);
  const s = useDashboardSummaries();

  const startEdit = (task: { id: string; text: string; category: TaskCategory }) => { setEditingId(task.id); setEditText(task.text); setEditCategory(task.category); };
  const confirmEdit = async (id: string, time: string | null) => { if (editText.trim()) await editTask(id, editText, time, editCategory); setEditingId(null); };

  const tasksRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => { if (tasksRef.current) tasksRef.current.scrollTop = 0; }, [selectedDate]);

  const goToPrevDay = () => { const idx = weekDates.indexOf(selectedDate); if (idx > 0) { setSelectedDate(weekDates[idx - 1]); setShowAddTask(false); } };
  const goToNextDay = () => { const idx = weekDates.indexOf(selectedDate); if (idx < weekDates.length - 1) { setSelectedDate(weekDates[idx + 1]); setShowAddTask(false); } };

  const firstName = user?.user_metadata?.name?.split(" ")[0] || user?.email?.split("@")[0] || userName;
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour >= 6 && hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  const handleAddTask = async () => { if (!newTask.trim()) return; await addTask(newTask, showTime ? newTime : "", newCategory); setNewTask(""); setNewTime(""); setShowAddTask(false); setShowTime(false); setNewCategory('tarefa'); };
  const handleAddEvent = async () => { if (!newEvTitle.trim() || !newEvDate) return; await addEvent(newEvTitle, newEvDate, newEvType); setNewEvTitle(""); setNewEvDate(""); setNewEvType("Pessoal"); setShowAddEvent(false); };

  const displayedTasks = tasks.filter(t => t.date === selectedDate);
  const selectedDay = new Date(selectedDate + "T00:00");
  const isToday = selectedDate === todayKey;
  const datePillLabel = isToday ? "Hoje" : `${selectedDay.getDate()} de ${MONTH_ABBR[selectedDay.getMonth()]}`;
  const accentColors = [c.primary, c.accent, c.primaryDark];
  const totalMetas = s.metasAnuais.length + s.metasMensais.length;
  const topMeta = [...s.metasMensais, ...s.metasAnuais][0];
  const topMetaPct = topMeta && topMeta.target > 0 ? Math.min(100, Math.round((topMeta.current / topMeta.target) * 100)) : 0;

  return (
    <div className="min-h-full" style={{ background: c.background }}>
      <div className="max-w-screen-xl mx-auto px-4 lg:px-6 pt-6 pb-6 flex flex-col gap-3 w-full">

        {/* ── Greeting ── */}
        <div className="mb-4">
          <h1 className="text-xl font-semibold" style={{ color: c.text }}>{greeting}, {firstName}!</h1>
          <p className="text-xs mt-1" style={{ color: c.textMuted }}>
            {DAY_NAMES[now.getDay()]}, {now.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}
          </p>
        </div>

        {/* ── Semana ── */}
        <div className="rounded-xl px-4 py-3" style={{ background: c.surface }}>
          <div className="grid grid-cols-7 gap-1">
            {WEEK_DAYS.map((day, i) => {
              const dateStr = weekDates[i]; const isSelected = dateStr === selectedDate; const isTodayDay = dateStr === todayKey;
              const dayNum = new Date(dateStr + "T00:00").getDate();
              const hasTasks = (['tarefa','habito','livro'] as TaskCategory[]).some(cat => (weekSummary[dateStr]?.[cat] ?? 0) > 0);
              return (
                <button key={i} onClick={() => { setSelectedDate(dateStr); setShowAddTask(false); }}
                  className="flex flex-col items-center py-3 px-1 rounded-xl transition-all hover:opacity-80"
                  style={{ background: isSelected ? c.primaryLight : "transparent", outline: isSelected ? `1.5px solid ${c.primary}60` : isTodayDay ? `1.5px solid ${c.primary}30` : "none" }}>
                  <p className="text-[11px] font-medium" style={{ color: isSelected ? c.primary : c.textMuted }}>{day}</p>
                  <p className="text-lg font-bold mt-1" style={{ color: isSelected ? c.primary : c.text }}>{dayNum}</p>
                  {hasTasks && (
                    <div className="flex gap-0.5 mt-1">
                      {(['tarefa','habito','livro'] as TaskCategory[]).flatMap(cat => {
                        const n = Math.min(weekSummary[dateStr]?.[cat] ?? 0, 3);
                        return Array.from({ length: n }, (_, idx) => (
                          <div key={`${cat}-${idx}`} className="w-1 h-1 rounded-full" style={{ background: CATEGORY_CONFIG[cat].color }} />
                        ));
                      })}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Resumos: Hábitos, Finanças, Metas, Saúde, Universitário ── */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl p-3 cursor-pointer hover:opacity-80 transition-all" onClick={() => navigate('/habitos')} style={{ background: c.surface }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: CATEGORY_COLORS.habito.bg }}><Zap className="w-3 h-3" style={{ color: CATEGORY_COLORS.habito.color }} /></div>
              <span className="text-xs font-semibold" style={{ color: c.text }}>Hábitos</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold" style={{ color: c.text }}>{s.habitosTodayDone}</span>
              <span className="text-[10px]" style={{ color: c.textMuted }}>/ {s.habitosTodayTotal} hoje</span>
            </div>
          </div>
          <div className="rounded-xl p-3 cursor-pointer hover:opacity-80 transition-all" onClick={() => navigate('/financas')} style={{ background: c.surface }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: c.primaryLight }}><Wallet className="w-3 h-3" style={{ color: c.primary }} /></div>
              <span className="text-xs font-semibold" style={{ color: c.text }}>Finanças</span>
              <span className="text-[9px] ml-auto" style={{ color: c.textMuted }}>{now.toLocaleString('pt-BR', { month: 'short' })}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1"><ArrowUpRight className="w-3 h-3" style={{ color: '#7BC4A8' }} /><span className="text-[11px] font-semibold" style={{ color: '#7BC4A8' }}>{s.receitasMes.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span></div>
              <div className="flex items-center gap-1"><ArrowDownRight className="w-3 h-3" style={{ color: '#D49898' }} /><span className="text-[11px] font-semibold" style={{ color: '#D49898' }}>{s.despesasMes.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span></div>
            </div>
          </div>
          <div className="rounded-xl p-3 cursor-pointer hover:opacity-80 transition-all" onClick={() => navigate('/metas')} style={{ background: c.surface }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: c.primaryLight }}><Target className="w-3 h-3" style={{ color: c.primary }} /></div>
              <span className="text-xs font-semibold" style={{ color: c.text }}>Metas</span>
              <span className="text-[9px] ml-auto" style={{ color: c.textMuted }}>{totalMetas} ativas</span>
            </div>
            {topMeta ? (
              <div>
                <div className="flex items-center justify-between mb-1"><p className="text-[11px] font-medium truncate" style={{ color: c.text }}>{topMeta.title}</p><span className="text-[10px] font-semibold ml-1" style={{ color: c.primary }}>{topMetaPct}%</span></div>
                <div className="w-full h-1.5 rounded-full" style={{ background: c.primaryLight }}><div className="h-1.5 rounded-full transition-all" style={{ width: `${topMetaPct}%`, background: topMeta.color || c.primary }} /></div>
              </div>
            ) : <p className="text-[10px]" style={{ color: c.textMuted }}>Nenhuma meta</p>}
          </div>

        </div>

        {/* ── Tarefas + Eventos (tamanho auto) ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 mt-4">
          {/* Tarefas */}
          <div className="xl:col-span-2 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4" style={{ color: c.primary }} />
                <h2 className="text-sm font-semibold" style={{ color: c.text }}>Tarefas</h2>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: `${c.primary}12`, color: c.primary }}>{datePillLabel}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={goToPrevDay} className="w-6 h-6 rounded-full flex items-center justify-center hover:opacity-80" style={{ background: c.primaryLight }}><ChevronLeft className="w-3 h-3" style={{ color: c.primary }} /></button>
                <button onClick={goToNextDay} className="w-6 h-6 rounded-full flex items-center justify-center hover:opacity-80" style={{ background: c.primaryLight }}><ChevronRight className="w-3 h-3" style={{ color: c.primary }} /></button>
                <button onClick={() => setShowAddTask(true)} className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full text-white hover:opacity-90 transition-all" style={{ background: c.primary }}><Plus className="w-3 h-3" /> Adicionar</button>
              </div>
            </div>
            <div ref={tasksRef} className="rounded-xl" style={{ background: c.surface, minHeight: 160 }}>
              {showAddTask && (
                <div className="p-3 border-b" style={{ borderColor: `${c.primary}10` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <input autoFocus type="text" placeholder="O que precisa fazer?" value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleAddTask(); if (e.key === "Escape") { setShowAddTask(false); setShowTime(false); } }} className="text-xs outline-none bg-transparent flex-1 font-medium placeholder:font-normal py-1.5 px-2 rounded-lg" style={{ color: c.text, background: c.primaryLight }} />
                    <button onClick={() => { setShowAddTask(false); setShowTime(false); setNewTime(""); }} className="p-1 rounded-full hover:opacity-70" style={{ color: c.textMuted }}><X className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex gap-1">{(Object.entries(CATEGORY_CONFIG) as [TaskCategory, typeof CATEGORY_CONFIG[TaskCategory]][]).map(([key, cfg]) => (<button key={key} type="button" onClick={() => setNewCategory(key)} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all" style={{ background: newCategory === key ? cfg.color : cfg.bg, color: newCategory === key ? '#fff' : cfg.color }}>{cfg.label}</button>))}</div>
                    <button type="button" onClick={() => { setShowTime(ss => !ss); setNewTime(""); }} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all" style={{ background: showTime ? `${c.primary}18` : c.primaryLight, color: showTime ? c.primary : c.textMuted }}><Clock className="w-3 h-3" />{showTime ? <input autoFocus type="text" value={newTime} placeholder="08:00" maxLength={5} onClick={e => e.stopPropagation()} onChange={e => { const d = e.target.value.replace(/\D/g, '').slice(0, 4); setNewTime(d.length > 2 ? d.slice(0, 2) + ':' + d.slice(2) : d); }} className="text-[10px] outline-none bg-transparent w-10 font-semibold" style={{ color: c.primary }} /> : "Hora"}</button>
                    <button onClick={handleAddTask} className="ml-auto px-3 py-1 rounded-lg text-[11px] font-semibold text-white hover:opacity-90 transition-all" style={{ background: c.primary }}>Salvar</button>
                  </div>
                </div>
              )}
              <div className="p-2">
                {loading && <div className="flex items-center justify-center py-8"><p className="text-xs" style={{ color: c.textMuted }}>Carregando...</p></div>}
                {!loading && displayedTasks.length === 0 && !showAddTask && (
                  <div className="flex items-center justify-center py-8 flex-col gap-1.5"><CheckCircle className="w-6 h-6 opacity-15" style={{ color: c.primary }} /><p className="text-xs" style={{ color: c.textMuted }}>Nenhuma tarefa</p></div>
                )}
                {displayedTasks.map(task => (
                  <div key={task.id} onClick={() => { if (editingId !== task.id) toggleDone(task.id); }} onDoubleClick={e => { e.stopPropagation(); startEdit(task); }} className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:opacity-80 transition-all">
                    {task.done ? <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: STATUS_COLORS.concluido.color }} /> : <Circle className="w-4 h-4 flex-shrink-0" style={{ color: c.primary }} />}
                    <div className="flex-1 min-w-0" onClick={e => { if (editingId === task.id) e.stopPropagation(); }}>
                      {editingId === task.id ? (
                        <div className="flex flex-col gap-1.5 w-full">
                          <input autoFocus value={editText} onChange={e => setEditText(e.target.value)} onBlur={e => { if (!e.relatedTarget?.closest?.('[data-noblur]')) confirmEdit(task.id, task.time); }} onKeyDown={e => { if (e.key === 'Enter') confirmEdit(task.id, task.time); if (e.key === 'Escape') setEditingId(null); }} className="text-xs font-medium outline-none bg-transparent w-full border-b" style={{ color: c.text, borderColor: `${c.primary}60` }} />
                          <div className="flex gap-1">{(Object.entries(CATEGORY_CONFIG) as [TaskCategory, typeof CATEGORY_CONFIG[TaskCategory]][]).map(([key, cfg]) => (<button key={key} type="button" data-noblur onMouseDown={e => { e.preventDefault(); setEditCategory(key); }} className="px-2 py-0.5 rounded-md text-[9px] font-semibold transition-all" style={{ background: editCategory === key ? cfg.color : cfg.bg, color: editCategory === key ? '#fff' : cfg.color }}>{cfg.label}</button>))}</div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 min-w-0">
                          {task.time && <span className="text-[10px] font-medium flex-shrink-0" style={{ color: c.textMuted }}>{task.time}</span>}
                          <p className="text-xs font-medium truncate flex-1" style={{ color: task.done ? c.textMuted : c.text, textDecoration: task.done ? "line-through" : "none" }}>{task.text}</p>
                          <span className="text-[9px] font-semibold flex-shrink-0 px-1.5 py-0.5 rounded-full" style={{ color: CATEGORY_CONFIG[task.category ?? 'tarefa'].color, background: CATEGORY_CONFIG[task.category ?? 'tarefa'].bg }}>{CATEGORY_CONFIG[task.category ?? 'tarefa'].label}</span>
                        </div>
                      )}
                    </div>
                    {editingId === task.id && <button data-noblur type="button" onMouseDown={e => { e.preventDefault(); setEditingId(null); removeTask(task.id); }} className="w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 hover:opacity-70" style={{ background: STATUS_COLORS.danger.bg }}><Trash2 className="w-3 h-3" style={{ color: STATUS_COLORS.danger.color }} /></button>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Eventos */}
          <div className="xl:col-span-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" style={{ color: c.primary }} />
                <h2 className="text-sm font-semibold" style={{ color: c.text }}>Próximos eventos</h2>
              </div>
              <button onClick={() => setShowAddEvent(true)} className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full text-white hover:opacity-90 transition-all" style={{ background: c.primary }}><Plus className="w-3 h-3" /> Adicionar</button>
            </div>
            <div className="rounded-xl" style={{ background: c.surface, minHeight: 160 }}>
              {showAddEvent && (
                <div className="p-3 border-b" style={{ borderColor: `${c.primary}10` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <input autoFocus type="text" placeholder="Nome do evento" value={newEvTitle} onChange={e => setNewEvTitle(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleAddEvent(); if (e.key === "Escape") setShowAddEvent(false); }} className="text-xs outline-none bg-transparent flex-1 font-medium placeholder:font-normal py-1.5 px-2 rounded-lg" style={{ color: c.text, background: c.primaryLight }} />
                    <button onClick={() => setShowAddEvent(false)} className="p-1 rounded-full hover:opacity-70" style={{ color: c.textMuted }}><X className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarDays className="w-3 h-3 flex-shrink-0" style={{ color: c.textMuted }} />
                    <input type="date" value={newEvDate} onChange={e => setNewEvDate(e.target.value)} className="text-xs outline-none bg-transparent flex-1 py-1 px-2 rounded-lg" style={{ color: c.text, background: c.primaryLight }} />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {EVENT_TYPES.map(t => (<button key={t} type="button" onClick={() => setNewEvType(t)} className="px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all" style={{ background: newEvType === t ? c.primary : c.primaryLight, color: newEvType === t ? '#fff' : c.textMuted }}>{t}</button>))}
                    <button onClick={handleAddEvent} className="ml-auto px-3 py-1 rounded-lg text-[11px] font-semibold text-white hover:opacity-90 transition-all" style={{ background: c.primary }}>Salvar</button>
                  </div>
                </div>
              )}
              <div className="p-2.5 flex flex-col gap-2">
                {!loading && events.length === 0 && !showAddEvent && (
                  <div className="flex items-center justify-center py-6 flex-col gap-1.5"><CalendarDays className="w-6 h-6 opacity-15" style={{ color: c.primary }} /><p className="text-xs" style={{ color: c.textMuted }}>Nenhum evento</p></div>
                )}
                {events.map((ev, idx) => {
                  const d = new Date(ev.date + "T00:00"); const color = accentColors[idx % accentColors.length];
                  return (
                    <div key={ev.id} onClick={() => navigate('/datas')} className="flex gap-2.5 p-2.5 rounded-xl hover:opacity-80 transition-all cursor-pointer items-center" style={{ background: c.background }}>
                      <div className="w-9 h-9 rounded-lg flex flex-col items-center justify-center flex-shrink-0" style={{ background: c.primaryLight }}>
                        <p className="text-sm font-bold leading-none" style={{ color: c.primary }}>{d.getDate()}</p>
                        <p className="text-[8px] mt-0.5" style={{ color: c.textMuted }}>{MONTH_ABBR[d.getMonth()]}</p>
                      </div>
                      <div className="min-w-0"><p className="text-[11px] font-medium leading-snug truncate" style={{ color: c.text }}>{ev.title}</p><span className="inline-block mt-0.5 px-1.5 py-0.5 rounded-full text-[9px]" style={{ background: c.primaryLight, color }}>{ev.type}</span></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Resumos: Livros & Cursos, Saúde, Universitário ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">

          {/* Livros & Cursos */}
          <div className="rounded-xl p-3 cursor-pointer hover:opacity-80 transition-all" onClick={() => navigate('/livros')} style={{ background: c.surface }}>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: CATEGORY_COLORS.livro.bg }}>
                <BookMarked className="w-3 h-3" style={{ color: CATEGORY_COLORS.livro.color }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: c.text }}>Livros & Cursos</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg px-2 py-1.5 text-center" style={{ background: c.background }}>
                <p className="text-lg font-bold" style={{ color: c.text }}>{s.livrosLendo}</p>
                <p className="text-[9px]" style={{ color: c.textMuted }}>lendo</p>
              </div>
              <div className="rounded-lg px-2 py-1.5 text-center" style={{ background: c.background }}>
                <p className="text-lg font-bold" style={{ color: c.text }}>{s.livrosAno}</p>
                <p className="text-[9px]" style={{ color: c.textMuted }}>lidos no ano</p>
              </div>
              <div className="rounded-lg px-2 py-1.5 text-center" style={{ background: c.background }}>
                <p className="text-lg font-bold" style={{ color: c.text }}>{s.cursosEmAndamento}</p>
                <p className="text-[9px]" style={{ color: c.textMuted }}>cursos ativos</p>
              </div>
              <div className="rounded-lg px-2 py-1.5 text-center" style={{ background: c.background }}>
                <p className="text-lg font-bold" style={{ color: c.text }}>{s.cursosConcluidos}</p>
                <p className="text-[9px]" style={{ color: c.textMuted }}>concluídos</p>
              </div>
            </div>
          </div>

          {/* Saúde */}
          <div className="rounded-xl p-3 cursor-pointer hover:opacity-80 transition-all" onClick={() => navigate('/saude')} style={{ background: c.surface }}>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: c.primaryLight }}>
                <Droplets className="w-3 h-3" style={{ color: c.primary }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: c.text }}>Saúde</span>
              <span className="text-[9px] ml-auto" style={{ color: c.textMuted }}>últimos 7 dias</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg px-2 py-1.5 text-center" style={{ background: c.background }}>
                <p className="text-lg font-bold" style={{ color: c.text }}>{s.mediaAgua.toFixed(1)}</p>
                <p className="text-[9px]" style={{ color: c.textMuted }}>copos/dia</p>
              </div>
              <div className="rounded-lg px-2 py-1.5 text-center" style={{ background: c.background }}>
                <p className="text-lg font-bold" style={{ color: c.text }}>{s.mediaSono.toFixed(1)}h</p>
                <p className="text-[9px]" style={{ color: c.textMuted }}>sono/dia</p>
              </div>
              <div className="rounded-lg px-2 py-1.5 text-center" style={{ background: c.background }}>
                <p className="text-lg font-bold" style={{ color: c.text }}>{s.logsSaude.length}</p>
                <p className="text-[9px]" style={{ color: c.textMuted }}>dias registrados</p>
              </div>
              <div className="rounded-lg px-2 py-1.5 text-center" style={{ background: c.background }}>
                <p className="text-lg font-bold" style={{ color: c.text }}>{s.humorFrequente ?? '—'}</p>
                <p className="text-[9px]" style={{ color: c.textMuted }}>humor freq.</p>
              </div>
            </div>
          </div>

          {/* Universitário */}
          <div className="rounded-xl p-3 cursor-pointer hover:opacity-80 transition-all" onClick={() => navigate('/universitario')} style={{ background: c.surface }}>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: c.primaryLight }}>
                <GraduationCap className="w-3 h-3" style={{ color: c.primary }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: c.text }}>Universitário</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg px-2 py-1.5 text-center" style={{ background: c.background }}>
                <p className="text-lg font-bold" style={{ color: c.text }}>{s.materiasAtivas.length}</p>
                <p className="text-[9px]" style={{ color: c.textMuted }}>matérias</p>
              </div>
              <div className="rounded-lg px-2 py-1.5 text-center" style={{ background: c.background }}>
                <p className="text-lg font-bold" style={{ color: c.text }}>{s.proximasProvas.length}</p>
                <p className="text-[9px]" style={{ color: c.textMuted }}>provas (30d)</p>
              </div>
              <div className="rounded-lg px-2 py-1.5 text-center" style={{ background: c.background }}>
                <p className="text-lg font-bold" style={{ color: c.text }}>{s.cursos.length}</p>
                <p className="text-[9px]" style={{ color: c.textMuted }}>cursos</p>
              </div>
              <div className="rounded-lg px-2 py-1.5 text-center" style={{ background: c.background }}>
                <p className="text-lg font-bold" style={{ color: c.text }}>{s.cursosConcluidos}</p>
                <p className="text-[9px]" style={{ color: c.textMuted }}>concluídos</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
