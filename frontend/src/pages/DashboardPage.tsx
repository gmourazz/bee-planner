import {
  CheckSquare, TrendingUp, Zap, BookOpen,
  Circle, CheckCircle, Bell, CalendarDays,
  MapPin, Plus, ChevronLeft, ChevronRight, Clock, X, Trash2, Dumbbell,
  GraduationCap, Wallet, Droplets, Moon, Target, Laugh, Smile, Meh, Frown, Annoyed,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
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

  const { tasks, events, stats, weekSummary, loading, addTask, toggleDone, editTask, removeTask } = useDashboard(selectedDate, weekDates);
  const summaries = useDashboardSummaries();

  const startEdit = (task: { id: string; text: string; category: TaskCategory }) => {
    setEditingId(task.id);
    setEditText(task.text);
    setEditCategory(task.category);
  };

  const confirmEdit = async (id: string, time: string | null) => {
    if (editText.trim()) await editTask(id, editText, time, editCategory);
    setEditingId(null);
  };

  const tasksScrollRef = useRef<HTMLDivElement>(null);
  const datesScrollRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (tasksScrollRef.current) tasksScrollRef.current.scrollLeft = 0;
  }, [selectedDate]);

  const goToPrevDay = () => {
    const idx = weekDates.indexOf(selectedDate);
    if (idx > 0) { setSelectedDate(weekDates[idx - 1]); setShowAddTask(false); }
  };
  const goToNextDay = () => {
    const idx = weekDates.indexOf(selectedDate);
    if (idx < weekDates.length - 1) { setSelectedDate(weekDates[idx + 1]); setShowAddTask(false); }
  };

  const firstName =
    user?.user_metadata?.name?.split(" ")[0] ||
    user?.email?.split("@")[0] || userName;

  const now        = new Date();
  const hour       = now.getHours();
  const greeting   = hour >= 6 && hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const dayOfWeek  = DAY_NAMES[now.getDay()];

  const handleAddTask = async () => {
    await addTask(newTask, showTime ? newTime : "", newCategory);
    setNewTask(""); setNewTime(""); setShowAddTask(false); setShowTime(false); setNewCategory('tarefa');
  };

  const displayedTasks  = tasks.filter(t => t.date === selectedDate);
  const completedCount  = displayedTasks.filter(t => t.done).length;
  const pendingCount    = displayedTasks.filter(t => !t.done).length;
  const habitosCount    = displayedTasks.filter(t => t.category === 'habito').length;
  const livrosCount     = displayedTasks.filter(t => t.category === 'livro').length;
  const accentColors    = [currentTheme.colors.primary, currentTheme.colors.accent, currentTheme.colors.primaryDark];

  const selectedDay    = new Date(selectedDate + "T00:00");
  const isToday        = selectedDate === todayKey;
  const datePillLabel  = isToday
    ? "Hoje"
    : `${selectedDay.getDate()} de ${MONTH_ABBR[selectedDay.getMonth()]}`;

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: currentTheme.colors.background }}>
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-6 xl:px-8 pt-4 pb-8 flex flex-col gap-4">

        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl px-6 py-5 lg:py-6 xl:py-7"
          style={{ background: `linear-gradient(135deg, ${currentTheme.colors.primary} 0%, ${currentTheme.colors.primaryDark} 100%)` }}>
          <div className="relative z-10">
            <h1 className="text-white mb-1 text-xl lg:text-2xl xl:text-3xl font-semibold">{greeting}, {firstName}!</h1>
            <p className="text-white/80 text-sm lg:text-base">
              {dayOfWeek},{" "}
              {now.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="absolute right-4 top-4">
            <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all">
              <Bell className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 xl:gap-4">
          {[
            { icon: CheckSquare, label: "pendentes",  value: pendingCount,   iconColor: currentTheme.colors.primary,      bg: currentTheme.colors.primaryLight     },
            { icon: TrendingUp,  label: "concluídas", value: completedCount, iconColor: STATUS_COLORS.concluido.color,   bg: STATUS_COLORS.concluido.bg            },
            { icon: Zap,         label: "hábitos",    value: habitosCount,   iconColor: CATEGORY_COLORS.habito.color,   bg: CATEGORY_COLORS.habito.bg             },
            { icon: BookOpen,    label: "livros",     value: livrosCount,    iconColor: CATEGORY_COLORS.livro.color,    bg: CATEGORY_COLORS.livro.bg              },
          ].map(({ icon: Icon, label, value, iconColor, bg }) => (
            <div key={label} className="rounded-xl p-4 xl:p-5"
              style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 8px ${currentTheme.colors.primary}10` }}>
              <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-lg flex items-center justify-center mb-2"
                style={{ background: bg }}>
                <Icon className="w-4 h-4 xl:w-5 xl:h-5" style={{ color: iconColor }} />
              </div>
              <p className="text-2xl xl:text-3xl font-bold" style={{ color: currentTheme.colors.text }}>{value}</p>
              <p className="text-xs xl:text-sm mt-0.5" style={{ color: currentTheme.colors.textMuted }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Esta Semana */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
            <h2 className="text-base font-semibold" style={{ color: currentTheme.colors.text }}>Esta Semana</h2>
          </div>
          <div className="rounded-xl px-3 py-3"
            style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 8px ${currentTheme.colors.primary}10` }}>
            <div className="grid grid-cols-7 gap-1 xl:gap-2">
              {WEEK_DAYS.map((day, i) => {
                const dateStr    = weekDates[i];
                const isSelected = dateStr === selectedDate;
                const isTodayDay = dateStr === todayKey;
                const dayNum     = new Date(dateStr + "T00:00").getDate();
                const hasTasks   = (['tarefa','habito','livro'] as TaskCategory[]).some(
                  cat => (weekSummary[dateStr]?.[cat] ?? 0) > 0
                );
                return (
                  <button key={i}
                    onClick={() => { setSelectedDate(dateStr); setShowAddTask(false); }}
                    className="flex flex-col items-center py-2 xl:py-3 px-1 rounded-xl transition-all hover:opacity-80"
                    style={{
                      background: isSelected ? currentTheme.colors.primary : "transparent",
                      outline: !isSelected && isTodayDay ? `2px solid ${currentTheme.colors.primary}50` : "none",
                    }}>
                    <p className="text-[10px] xl:text-xs font-medium"
                      style={{ color: isSelected ? "rgba(255,255,255,0.75)" : currentTheme.colors.textMuted }}>
                      {day}
                    </p>
                    <p className="text-base xl:text-lg font-semibold mt-0.5"
                      style={{ color: isSelected ? "#fff" : currentTheme.colors.text }}>
                      {dayNum}
                    </p>
                    {hasTasks && (
                      <div className="flex flex-wrap justify-center gap-0.5 mt-1.5 max-w-full px-0.5">
                        {(['tarefa','habito','livro'] as TaskCategory[]).flatMap(cat => {
                          const n = Math.min(weekSummary[dateStr]?.[cat] ?? 0, 4);
                          return Array.from({ length: n }, (_, idx) => (
                            <div key={`${cat}-${idx}`} className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ background: isSelected ? 'rgba(255,255,255,0.75)' : CATEGORY_CONFIG[cat].color }} />
                          ));
                        })}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tarefas + Próximas Datas */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 xl:gap-5">

          {/* Tarefas */}
          <div className="xl:col-span-2 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
                <h2 className="text-base font-semibold" style={{ color: currentTheme.colors.text }}>Tarefas</h2>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                  style={{ background: currentTheme.colors.primary + '18', color: currentTheme.colors.primary }}>
                  <CalendarDays className="w-3 h-3" />
                  <span className="text-[11px] font-semibold">{datePillLabel}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={goToPrevDay}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:opacity-80 transition-all"
                  style={{ background: currentTheme.colors.primaryLight }}>
                  <ChevronLeft className="w-3.5 h-3.5" style={{ color: currentTheme.colors.primary }} />
                </button>
                <button onClick={goToNextDay}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:opacity-80 transition-all"
                  style={{ background: currentTheme.colors.primaryLight }}>
                  <ChevronRight className="w-3.5 h-3.5" style={{ color: currentTheme.colors.primary }} />
                </button>
                <button onClick={() => setShowAddTask(true)}
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full text-white hover:opacity-90 transition-all"
                  style={{ background: currentTheme.colors.primary }}>
                  <Plus className="w-3 h-3" /> Adicionar
                </button>
              </div>
            </div>

            <div ref={tasksScrollRef}
              className="rounded-xl p-3 flex gap-3 overflow-x-auto flex-1"
              style={{
                background: currentTheme.colors.surface,
                boxShadow: `0 2px 8px ${currentTheme.colors.primary}10`,
                scrollbarWidth: "none",
                minHeight: "180px",
              }}>

              {/* Form nova tarefa */}
              {showAddTask && (
                <div className="flex flex-col gap-3 p-4 rounded-2xl shrink-0 w-56 xl:w-64 shadow-lg"
                  style={{
                    background: currentTheme.colors.surface,
                    boxShadow: `0 8px 24px ${currentTheme.colors.primary}18`,
                    border: `1px solid ${currentTheme.colors.primary}20`,
                  }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: currentTheme.colors.primaryLight }}>
                        <CheckSquare className="w-3 h-3" style={{ color: currentTheme.colors.primary }} />
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider"
                        style={{ color: currentTheme.colors.textMuted }}>Nova tarefa</span>
                    </div>
                    <button onClick={() => { setShowAddTask(false); setShowTime(false); setNewTime(""); }}
                      className="w-6 h-6 flex items-center justify-center rounded-full hover:opacity-70 transition-all"
                      style={{ background: currentTheme.colors.primaryLight }}>
                      <X className="w-3 h-3" style={{ color: currentTheme.colors.textMuted }} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl"
                    style={{
                      background: currentTheme.colors.primaryLight,
                      border: `1.5px solid ${currentTheme.colors.primary}25`,
                      boxShadow: `inset 0 1px 3px ${currentTheme.colors.primary}10`,
                    }}>
                    <CheckSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-40" style={{ color: currentTheme.colors.primary }} />
                    <input
                      autoFocus
                      type="text"
                      placeholder="O que precisa fazer?"
                      value={newTask}
                      onChange={e => setNewTask(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleAddTask(); if (e.key === "Escape") { setShowAddTask(false); setShowTime(false); } }}
                      className="text-xs outline-none bg-transparent w-full font-medium placeholder:font-normal"
                      style={{ color: currentTheme.colors.text }}
                    />
                  </div>

                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" style={{ color: showTime ? currentTheme.colors.primary : currentTheme.colors.textMuted }} />
                      <span className="text-xs font-medium" style={{ color: showTime ? currentTheme.colors.primary : currentTheme.colors.textMuted }}>
                        Horário
                      </span>
                    </div>
                    <button type="button"
                      onClick={() => { setShowTime(s => !s); setNewTime(""); }}
                      className="relative w-9 h-5 rounded-full transition-all duration-300 flex-shrink-0"
                      style={{ background: showTime ? currentTheme.colors.primary : currentTheme.colors.primary + "30" }}>
                      <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300"
                        style={{ left: showTime ? '18px' : '2px' }} />
                    </button>
                  </div>

                  {showTime && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl"
                      style={{ background: currentTheme.colors.primaryLight, border: `1.5px solid ${currentTheme.colors.primary}40` }}>
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: currentTheme.colors.primary }} />
                      <input
                        autoFocus
                        type="text"
                        value={newTime}
                        onChange={e => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setNewTime(digits.length > 2 ? digits.slice(0, 2) + ':' + digits.slice(2) : digits);
                        }}
                        placeholder="08:00"
                        maxLength={5}
                        className="text-xs outline-none bg-transparent w-full font-semibold tracking-widest"
                        style={{ color: currentTheme.colors.primary }}
                      />
                    </div>
                  )}

                  <div className="flex gap-1.5">
                    {(Object.entries(CATEGORY_CONFIG) as [TaskCategory, typeof CATEGORY_CONFIG[TaskCategory]][]).map(([key, cfg]) => {
                      const isActive = newCategory === key;
                      return (
                        <button key={key} type="button"
                          onClick={() => setNewCategory(key)}
                          className="flex-1 py-1.5 rounded-xl font-semibold transition-all text-center"
                          style={{ fontSize: '11px', background: isActive ? cfg.color : cfg.bg, color: isActive ? '#fff' : cfg.color, whiteSpace: 'nowrap' }}>
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>

                  <button onClick={handleAddTask}
                    className="w-full py-2 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-[.98] transition-all"
                    style={{ background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.primaryDark})` }}>
                    <CheckSquare className="w-3.5 h-3.5" />
                    Salvar tarefa
                  </button>
                </div>
              )}

              {loading && (
                <div className="flex items-center justify-center w-full">
                  <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>Carregando...</p>
                </div>
              )}

              {!loading && displayedTasks.length === 0 && !showAddTask && (
                <div className="flex items-center justify-center w-full flex-col gap-2">
                  <CheckCircle className="w-8 h-8 opacity-20" style={{ color: currentTheme.colors.primary }} />
                  <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>Nenhuma tarefa</p>
                </div>
              )}

              {Array.from({ length: Math.ceil(displayedTasks.length / 5) }, (_, gi) =>
                displayedTasks.slice(gi * 5, gi * 5 + 5)
              ).map((chunk, gi) => (
                <div key={gi}
                  className="flex flex-col p-3 rounded-xl shrink-0 w-52 xl:w-60 border-l-4 self-stretch overflow-hidden"
                  style={{
                    borderColor: currentTheme.colors.primary,
                    background: currentTheme.colors.surface,
                    boxShadow: `0 2px 10px ${currentTheme.colors.primary}10`,
                  }}>
                  {chunk.map(task => (
                    <div key={task.id}
                      onClick={() => { if (editingId !== task.id) toggleDone(task.id); }}
                      onDoubleClick={e => { e.stopPropagation(); startEdit(task); }}
                      className="flex items-center gap-2 px-2 py-2 rounded-xl cursor-pointer hover:opacity-80 transition-all overflow-hidden"
                      style={{ background: 'transparent' }}>
                      {task.done
                        ? <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: STATUS_COLORS.concluido.color }} />
                        : <Circle      className="w-4 h-4 flex-shrink-0" style={{ color: currentTheme.colors.primary }} />
                      }
                      <div className="flex-1 min-w-0" onClick={e => { if (editingId === task.id) e.stopPropagation(); }}>
                        {editingId === task.id ? (
                          <div className="flex flex-col gap-1.5 w-full">
                            <input
                              autoFocus
                              value={editText}
                              onChange={e => setEditText(e.target.value)}
                              onBlur={e => {
                                if (!e.relatedTarget?.closest?.('[data-noblur]')) confirmEdit(task.id, task.time);
                              }}
                              onKeyDown={e => {
                                if (e.key === 'Enter') confirmEdit(task.id, task.time);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              className="text-xs font-medium outline-none bg-transparent w-full border-b"
                              style={{ color: currentTheme.colors.text, borderColor: currentTheme.colors.primary + '60' }}
                            />
                            <div className="flex gap-1">
                              {(Object.entries(CATEGORY_CONFIG) as [TaskCategory, typeof CATEGORY_CONFIG[TaskCategory]][]).map(([key, cfg]) => (
                                <button key={key} type="button" data-noblur
                                  onMouseDown={e => { e.preventDefault(); setEditCategory(key); }}
                                  className="flex-1 py-0.5 rounded-lg text-[9px] font-semibold transition-all"
                                  style={{ background: editCategory === key ? cfg.color : cfg.bg, color: editCategory === key ? '#fff' : cfg.color }}>
                                  {cfg.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 min-w-0 w-full">
                            {task.time && (
                              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full flex-shrink-0"
                                style={{ background: currentTheme.colors.primary + '15' }}>
                                <Clock className="w-2 h-2" style={{ color: currentTheme.colors.primary }} />
                                <span className="text-[9px] font-semibold tracking-wide" style={{ color: currentTheme.colors.primary }}>{task.time}</span>
                              </div>
                            )}
                            <p title={task.text} className="text-xs font-medium truncate min-w-0 flex-1" style={{
                              color: task.done ? currentTheme.colors.textMuted : currentTheme.colors.text,
                              textDecoration: task.done ? "line-through" : "none",
                            }}>
                              {task.text}
                            </p>
                            {(() => {
                              const cfg = CATEGORY_CONFIG[task.category ?? 'tarefa'];
                              return (
                                <span className="text-[8px] font-semibold flex-shrink-0 ml-auto px-1.5 py-0.5 rounded-full whitespace-nowrap"
                                  style={{ color: cfg.color, background: cfg.bg }}>
                                  {cfg.label}
                                </span>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                      {editingId === task.id && (
                        <button data-noblur type="button"
                          onMouseDown={e => { e.preventDefault(); setEditingId(null); removeTask(task.id); }}
                          className="w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 hover:opacity-70 transition-all"
                          style={{ background: STATUS_COLORS.danger.bg }}>
                          <Trash2 className="w-3 h-3" style={{ color: STATUS_COLORS.danger.color }} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Próximas Datas */}
          <div className="xl:col-span-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
                <h2 className="text-base font-semibold" style={{ color: currentTheme.colors.text }}>Próximas Datas Importantes</h2>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => datesScrollRef.current?.scrollBy({ left: -220, behavior: "smooth" })}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:opacity-80 transition-all"
                  style={{ background: currentTheme.colors.primaryLight }}>
                  <ChevronLeft className="w-3.5 h-3.5" style={{ color: currentTheme.colors.primary }} />
                </button>
                <button onClick={() => datesScrollRef.current?.scrollBy({ left: 220, behavior: "smooth" })}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:opacity-80 transition-all"
                  style={{ background: currentTheme.colors.primaryLight }}>
                  <ChevronRight className="w-3.5 h-3.5" style={{ color: currentTheme.colors.primary }} />
                </button>
              </div>
            </div>

            <div ref={datesScrollRef}
              className="rounded-xl p-3 flex xl:flex-col gap-3 overflow-x-auto xl:overflow-x-hidden xl:overflow-y-auto flex-1"
              style={{
                background: currentTheme.colors.surface,
                boxShadow: `0 2px 8px ${currentTheme.colors.primary}10`,
                scrollbarWidth: "none",
                minHeight: "180px",
              }}>

              {!loading && events.length === 0 && (
                <div className="flex items-center justify-center w-full">
                  <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>Nenhum evento</p>
                </div>
              )}

              {events.map((ev, idx) => {
                const d     = new Date(ev.date + "T00:00");
                const color = accentColors[idx % accentColors.length];
                return (
                  <div key={ev.id}
                    onClick={() => navigate('/datas')}
                    className="flex gap-3 p-3 rounded-xl hover:opacity-80 transition-all cursor-pointer border-l-4 shrink-0 xl:shrink xl:w-full items-center w-52"
                    style={{ borderColor: color, background: currentTheme.colors.background }}>
                    <div className="w-10 h-10 rounded-lg flex flex-col items-center justify-center flex-shrink-0"
                      style={{ background: currentTheme.colors.primaryLight }}>
                      <p className="text-base font-bold leading-none" style={{ color: currentTheme.colors.primary }}>{d.getDate()}</p>
                      <p className="text-[9px] mt-0.5" style={{ color: currentTheme.colors.textMuted }}>{MONTH_ABBR[d.getMonth()]}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium leading-snug truncate" style={{ color: currentTheme.colors.text }}>{ev.title}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded-full text-[10px]"
                        style={{ background: currentTheme.colors.primaryLight, color }}>
                        {ev.type}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ── Resumos dos módulos ───────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
            <h2 className="text-base font-semibold" style={{ color: currentTheme.colors.text }}>Resumo dos módulos</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

            {/* Universitário */}
            <div className="rounded-xl p-4 flex flex-col gap-3"
              style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 8px ${currentTheme.colors.primary}10` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: currentTheme.colors.primaryLight }}>
                    <GraduationCap className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: currentTheme.colors.text }}>Universitário</span>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 rounded-lg px-3 py-2 text-center" style={{ background: currentTheme.colors.background }}>
                  <p className="text-xl font-bold" style={{ color: currentTheme.colors.text }}>{summaries.materiasAtivas.length}</p>
                  <p className="text-[10px]" style={{ color: currentTheme.colors.textMuted }}>matérias ativas</p>
                </div>
                <div className="flex-1 rounded-lg px-3 py-2 text-center" style={{ background: currentTheme.colors.background }}>
                  <p className="text-xl font-bold" style={{ color: currentTheme.colors.text }}>{summaries.proximasProvas.length}</p>
                  <p className="text-[10px]" style={{ color: currentTheme.colors.textMuted }}>provas (30 dias)</p>
                </div>
              </div>

              {summaries.proximasProvas.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {summaries.proximasProvas.map(p => {
                    const d = new Date(p.examDate + 'T00:00')
                    const diasRestantes = Math.round((d.getTime() - Date.now()) / 86400000)
                    return (
                      <div key={p.id} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg"
                        style={{ background: currentTheme.colors.background }}>
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium truncate" style={{ color: currentTheme.colors.text }}>{p.subject}</p>
                          <p className="text-[10px]" style={{ color: currentTheme.colors.textMuted }}>{p.type}</p>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ml-1"
                          style={{ background: diasRestantes <= 7 ? '#EF444420' : currentTheme.colors.primaryLight, color: diasRestantes <= 7 ? '#EF4444' : currentTheme.colors.primary }}>
                          {diasRestantes === 0 ? 'Hoje' : `${diasRestantes}d`}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs text-center py-2" style={{ color: currentTheme.colors.textMuted }}>
                  Nenhuma prova nos próximos 30 dias
                </p>
              )}
            </div>

            {/* Finanças */}
            <div className="rounded-xl p-4 flex flex-col gap-3"
              style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 8px ${currentTheme.colors.primary}10` }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: currentTheme.colors.primaryLight }}>
                  <Wallet className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
                </div>
                <span className="text-sm font-semibold" style={{ color: currentTheme.colors.text }}>Finanças</span>
                <span className="text-[10px] ml-auto" style={{ color: currentTheme.colors.textMuted }}>
                  {new Date().toLocaleString('pt-BR', { month: 'long' })}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-2.5 py-2 rounded-lg" style={{ background: currentTheme.colors.background }}>
                  <div className="flex items-center gap-1.5">
                    <ArrowUpRight className="w-3.5 h-3.5" style={{ color: '#10B981' }} />
                    <span className="text-xs" style={{ color: currentTheme.colors.textMuted }}>Receitas</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: '#10B981' }}>
                    R$ {summaries.receitasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between px-2.5 py-2 rounded-lg" style={{ background: currentTheme.colors.background }}>
                  <div className="flex items-center gap-1.5">
                    <ArrowDownRight className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />
                    <span className="text-xs" style={{ color: currentTheme.colors.textMuted }}>Despesas</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: '#EF4444' }}>
                    R$ {summaries.despesasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between px-2.5 py-2 rounded-lg"
                  style={{ background: summaries.saldoMes >= 0 ? '#10B98115' : '#EF444415' }}>
                  <span className="text-xs font-semibold" style={{ color: currentTheme.colors.text }}>Saldo</span>
                  <span className="text-sm font-bold" style={{ color: summaries.saldoMes >= 0 ? '#10B981' : '#EF4444' }}>
                    {summaries.saldoMes < 0 ? '- ' : '+ '}R$ {Math.abs(summaries.saldoMes).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Saúde */}
            <div className="rounded-xl p-4 flex flex-col gap-3"
              style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 8px ${currentTheme.colors.primary}10` }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: currentTheme.colors.primaryLight }}>
                  <Droplets className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
                </div>
                <span className="text-sm font-semibold" style={{ color: currentTheme.colors.text }}>Saúde</span>
                <span className="text-[10px] ml-auto" style={{ color: currentTheme.colors.textMuted }}>últimos 7 dias</span>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 rounded-lg px-2 py-2.5 text-center" style={{ background: currentTheme.colors.background }}>
                  <Droplets className="w-4 h-4 mx-auto mb-0.5" style={{ color: currentTheme.colors.accent }} />
                  <p className="text-base font-bold" style={{ color: currentTheme.colors.text }}>{summaries.mediaAgua.toFixed(1)}</p>
                  <p className="text-[10px]" style={{ color: currentTheme.colors.textMuted }}>copos/dia</p>
                </div>
                <div className="flex-1 rounded-lg px-2 py-2.5 text-center" style={{ background: currentTheme.colors.background }}>
                  <Moon className="w-4 h-4 mx-auto mb-0.5" style={{ color: currentTheme.colors.primaryDark }} />
                  <p className="text-base font-bold" style={{ color: currentTheme.colors.text }}>{summaries.mediaSono.toFixed(1)}h</p>
                  <p className="text-[10px]" style={{ color: currentTheme.colors.textMuted }}>sono/dia</p>
                </div>
                <div className="flex-1 rounded-lg px-2 py-2.5 text-center" style={{ background: currentTheme.colors.background }}>
                  {(() => {
                    const humorMap: Record<number, { Icon: React.ElementType; label: string; color: string }> = {
                      5: { Icon: Laugh,   label: 'Ótimo',   color: '#10B981' },
                      4: { Icon: Smile,   label: 'Bem',     color: '#3B82F6' },
                      3: { Icon: Meh,     label: 'Neutro',  color: '#F59E0B' },
                      2: { Icon: Frown,   label: 'Mal',     color: '#F97316' },
                      1: { Icon: Annoyed, label: 'Péssimo', color: '#EF4444' },
                    }
                    const h = summaries.humorFrequente ? humorMap[summaries.humorFrequente] : null
                    return h ? (
                      <>
                        <h.Icon className="w-4 h-4 mx-auto mb-0.5" style={{ color: h.color }} />
                        <p className="text-[10px] font-semibold" style={{ color: h.color }}>{h.label}</p>
                        <p className="text-[10px]" style={{ color: currentTheme.colors.textMuted }}>humor</p>
                      </>
                    ) : (
                      <>
                        <Meh className="w-4 h-4 mx-auto mb-0.5" style={{ color: currentTheme.colors.textMuted }} />
                        <p className="text-[10px]" style={{ color: currentTheme.colors.textMuted }}>sem dados</p>
                      </>
                    )
                  })()}
                </div>
              </div>
            </div>

            {/* Metas */}
            <div className="rounded-xl p-4 flex flex-col gap-3"
              style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 8px ${currentTheme.colors.primary}10` }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: currentTheme.colors.primaryLight }}>
                  <Target className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
                </div>
                <span className="text-sm font-semibold" style={{ color: currentTheme.colors.text }}>Metas</span>
              </div>

              <div className="flex gap-2 mb-1">
                <div className="flex-1 rounded-lg px-3 py-2 text-center" style={{ background: currentTheme.colors.background }}>
                  <p className="text-xl font-bold" style={{ color: currentTheme.colors.text }}>{summaries.metasAnuais.length}</p>
                  <p className="text-[10px]" style={{ color: currentTheme.colors.textMuted }}>anuais</p>
                </div>
                <div className="flex-1 rounded-lg px-3 py-2 text-center" style={{ background: currentTheme.colors.background }}>
                  <p className="text-xl font-bold" style={{ color: currentTheme.colors.text }}>{summaries.metasMensais.length}</p>
                  <p className="text-[10px]" style={{ color: currentTheme.colors.textMuted }}>este mês</p>
                </div>
              </div>

              {summaries.metasAnuais.length === 0 && summaries.metasMensais.length === 0 ? (
                <p className="text-xs text-center py-2" style={{ color: currentTheme.colors.textMuted }}>Nenhuma meta cadastrada</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {[...summaries.metasMensais, ...summaries.metasAnuais].slice(0, 3).map(meta => {
                    const pct = meta.target > 0 ? Math.min(100, Math.round((meta.current / meta.target) * 100)) : 0
                    return (
                      <div key={meta.id}>
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-[11px] font-medium truncate" style={{ color: currentTheme.colors.text }}>{meta.title}</p>
                          <span className="text-[10px] font-semibold ml-1 flex-shrink-0" style={{ color: currentTheme.colors.primary }}>{pct}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full" style={{ background: currentTheme.colors.primaryLight }}>
                          <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: meta.color || currentTheme.colors.primary }} />
                        </div>
                      </div>
                    )
                  })}
                  {(summaries.metasAnuais.length + summaries.metasMensais.length) > 3 && (
                    <p className="text-[10px] text-center" style={{ color: currentTheme.colors.textMuted }}>
                      +{summaries.metasAnuais.length + summaries.metasMensais.length - 3} outras metas
                    </p>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
