import {
  CheckSquare,
  TrendingUp,
  Zap,
  BookOpen,
  Circle,
  CheckCircle,
  Bell,
  CalendarDays,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useRef } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

interface Task {
  id: number;
  name: string;
  time: string;
  category: string;
  completed: boolean;
  priority: string;
}

const initialTasks: Task[] = [
  { id: 1, name: "Estudar para prova de Cálculo", time: "14:00", category: "Estudos", completed: false, priority: "alta" },
  { id: 2, name: "Revisar trabalho de TCC", time: "16:30", category: "Universitário", completed: false, priority: "alta" },
  { id: 3, name: "Ler capítulo 5 do livro", time: "20:00", category: "Lazer", completed: false, priority: "média" },
  { id: 4, name: "Academia", time: "18:00", category: "Saúde", completed: true, priority: "média" },
  { id: 5, name: "Comprar presente mamãe", time: "10:00", category: "Pessoal", completed: true, priority: "alta" },
];

const upcomingDates = [
  { id: 1, date: "05", month: "MAI", title: "Aniversário da mamãe", type: "Pessoal", color: "#F472B6" },
  { id: 2, date: "12", month: "MAI", title: "Prova de Cálculo II", type: "Universitário", color: "#FCD34D" },
  { id: 3, date: "20", month: "MAI", title: "Entrega de TCC", type: "Universitário", color: "#BE185D" },
];

const weekDays = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];

interface DashboardProps {
  userName?: string;
}

export function Dashboard({ userName = "Usuária" }: DashboardProps) {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [newTime, setNewTime] = useState("");

  const tasksScrollRef = useRef<HTMLDivElement>(null);
  const datesScrollRef = useRef<HTMLDivElement>(null);

  const scrollTasks = (dir: "left" | "right") => {
    tasksScrollRef.current?.scrollBy({ left: dir === "right" ? 280 : -280, behavior: "smooth" });
  };

  const firstName =
    user?.user_metadata?.name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    userName;

  const currentDate = new Date();
  const hour = currentDate.getHours();
  const greeting =
    hour >= 6 && hour < 12 ? "Bom dia" :
    hour >= 12 && hour < 18 ? "Boa tarde" :
    hour >= 18 ? "Boa noite" : "Boa madrugada";

  const dayOfWeek = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"][currentDate.getDay()];
  const today = currentDate.getDate();

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const target = new Date(monday);
    target.setDate(monday.getDate() + i);
    return target.getDate();
  });

  const toggleTask = (id: number) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    const maxId = Math.max(0, ...tasks.map((t) => t.id));
    setTasks((prev) => [...prev, { id: maxId + 1, name: newTask.trim(), time: newTime || "--:--", category: "Pessoal", completed: false, priority: "média" }]);
    setNewTask("");
    setNewTime("");
    setShowAddTask(false);
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: currentTheme.colors.background }}>

      {/* Header */}
      <div
        className="relative overflow-hidden rounded-2xl mx-4 mt-4 px-6 py-5 shrink-0"
        style={{ background: `linear-gradient(135deg, ${currentTheme.colors.primary} 0%, ${currentTheme.colors.primaryDark} 100%)` }}
      >
        <div className="relative z-10">
          <h1 className="text-white mb-1 text-xl font-semibold">
            {greeting}, {firstName}! ✨
          </h1>
          <p className="text-white/80 text-sm">
            {dayOfWeek},{" "}
            {currentDate.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="absolute right-4 top-4">
          <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all">
            <Bell className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3 px-4 mt-4">
        {[
          { icon: CheckSquare, label: "pendentes", value: pendingCount, iconBg: currentTheme.colors.primaryLight, iconColor: currentTheme.colors.primary },
          { icon: TrendingUp, label: "concluídas", value: completedCount, iconBg: "#D1FAE5", iconColor: "#10B981" },
          { icon: Zap, label: "hábitos", value: 7, iconBg: "#FEF3C7", iconColor: "#F59E0B" },
          { icon: BookOpen, label: "livros", value: 2, iconBg: "#E9D5FF", iconColor: "#A855F7" },
        ].map(({ icon: Icon, label, value, iconBg, iconColor }) => (
          <div
            key={label}
            className="rounded-xl p-4"
            style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 8px ${currentTheme.colors.primary}10` }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: iconBg }}>
              <Icon className="w-4 h-4" style={{ color: iconColor }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: currentTheme.colors.textMuted }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Weekly mini-view */}
      <div className="px-4 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
          <h2 className="text-base font-semibold" style={{ color: currentTheme.colors.text }}>Esta Semana</h2>
        </div>
        <div
          className="rounded-xl px-3 py-3"
          style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 8px ${currentTheme.colors.primary}10` }}
        >
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day, index) => {
              const isToday = weekDates[index] === today;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center py-2 px-1 rounded-lg transition-all cursor-pointer hover:opacity-80"
                  style={{ background: isToday ? currentTheme.colors.primary : "transparent" }}
                >
                  <p className="text-[10px] font-medium" style={{ color: isToday ? "rgba(255,255,255,0.8)" : currentTheme.colors.textMuted }}>{day}</p>
                  <p className="text-base font-semibold mt-0.5" style={{ color: isToday ? "#fff" : currentTheme.colors.text }}>{weekDates[index]}</p>
                  <div className="flex gap-0.5 mt-1">
                    <div className="w-1 h-1 rounded-full" style={{ background: isToday ? "rgba(255,255,255,0.7)" : currentTheme.colors.primary }} />
                    <div className="w-1 h-1 rounded-full bg-[#10B981]" />
                    <div className="w-1 h-1 rounded-full bg-[#FCD34D]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Grid — tarefas e datas lado a lado */}
      <div className="grid grid-cols-3 gap-4 px-4 mt-4 pb-6">

        {/* Tarefas — ocupa 2 colunas */}
        <div className="col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold" style={{ color: currentTheme.colors.text }}>Tarefas de Hoje</h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => scrollTasks("left")}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:opacity-80 transition-all"
                style={{ background: currentTheme.colors.primaryLight }}
              >
                <ChevronLeft className="w-3.5 h-3.5" style={{ color: currentTheme.colors.primary }} />
              </button>
              <button
                onClick={() => scrollTasks("right")}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:opacity-80 transition-all"
                style={{ background: currentTheme.colors.primaryLight }}
              >
                <ChevronRight className="w-3.5 h-3.5" style={{ color: currentTheme.colors.primary }} />
              </button>
              <button
                onClick={() => setShowAddTask(true)}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full text-white hover:opacity-90 transition-all"
                style={{ background: currentTheme.colors.primary }}
              >
                <Plus className="w-3 h-3" /> Adicionar
              </button>
            </div>
          </div>

          <div
            ref={tasksScrollRef}
            className="rounded-xl p-3 flex gap-3 overflow-x-auto"
            style={{
              background: currentTheme.colors.surface,
              boxShadow: `0 2px 8px ${currentTheme.colors.primary}10`,
              scrollbarWidth: "none",
              minHeight: "160px",
            }}
          >
            {showAddTask && (
              <div
                className="flex flex-col gap-2 p-3 rounded-lg shrink-0 w-48"
                style={{ background: currentTheme.colors.primaryLight }}
              >
                <input
                  autoFocus
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="px-2 py-1 rounded-md text-xs outline-none"
                  style={{ background: currentTheme.colors.background, color: currentTheme.colors.text }}
                />
                <input
                  type="text"
                  placeholder="Nova tarefa..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addTask(); if (e.key === "Escape") setShowAddTask(false); }}
                  className="px-2 py-1 rounded-md text-xs outline-none"
                  style={{ background: currentTheme.colors.background, color: currentTheme.colors.text }}
                />
                <div className="flex gap-1.5">
                  <button onClick={addTask} className="flex-1 py-1 rounded-md text-xs font-semibold text-white" style={{ background: currentTheme.colors.primary }}>Salvar</button>
                  <button onClick={() => setShowAddTask(false)} className="flex-1 py-1 rounded-md text-xs font-semibold" style={{ background: currentTheme.colors.textMuted + "30", color: currentTheme.colors.text }}>Cancelar</button>
                </div>
              </div>
            )}

            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className="flex flex-col gap-2 p-3 rounded-lg transition-all cursor-pointer border-l-4 hover:opacity-80 shrink-0 w-48"
                style={{
                  borderColor: task.completed ? "#10B981" : currentTheme.colors.primary,
                  background: task.completed ? "#F0FDF4" : currentTheme.colors.background,
                }}
              >
                <div className="flex items-start gap-2">
                  {task.completed
                    ? <CheckCircle className="w-4 h-4 flex-shrink-0 text-[#10B981] mt-0.5" />
                    : <Circle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: currentTheme.colors.primary }} />
                  }
                  <p
                    className="text-xs font-medium leading-snug"
                    style={{
                      color: task.completed ? currentTheme.colors.textMuted : currentTheme.colors.text,
                      textDecoration: task.completed ? "line-through" : "none",
                    }}
                  >
                    {task.name}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 pl-6">
                  <span className="text-[11px]" style={{ color: currentTheme.colors.textMuted }}>{task.time}</span>
                  <span
                    className="px-1.5 py-0.5 rounded-full text-[10px]"
                    style={{
                      background: task.priority === "alta" ? currentTheme.colors.primaryLight : "#FEF3C7",
                      color: task.priority === "alta" ? currentTheme.colors.primaryDark : "#92400E",
                    }}
                  >
                    {task.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Próximas Datas — ocupa 1 coluna */}
        <div className="col-span-1 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
              <h2 className="text-base font-semibold" style={{ color: currentTheme.colors.text }}>Próximas Datas</h2>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => datesScrollRef.current?.scrollBy({ left: -220, behavior: "smooth" })}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:opacity-80 transition-all"
                style={{ background: currentTheme.colors.primaryLight }}
              >
                <ChevronLeft className="w-3.5 h-3.5" style={{ color: currentTheme.colors.primary }} />
              </button>
              <button
                onClick={() => datesScrollRef.current?.scrollBy({ left: 220, behavior: "smooth" })}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:opacity-80 transition-all"
                style={{ background: currentTheme.colors.primaryLight }}
              >
                <ChevronRight className="w-3.5 h-3.5" style={{ color: currentTheme.colors.primary }} />
              </button>
            </div>
          </div>

          <div
            ref={datesScrollRef}
            className="rounded-xl p-3 flex gap-3 overflow-x-auto"
            style={{
              background: currentTheme.colors.surface,
              boxShadow: `0 2px 8px ${currentTheme.colors.primary}10`,
              scrollbarWidth: "none",
              minHeight: "160px",
            }}
          >
            {upcomingDates.map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-2 p-3 rounded-lg hover:opacity-80 transition-all cursor-pointer border-l-4 shrink-0 w-40"
                style={{
                  borderColor: event.color,
                  background: currentTheme.colors.background,
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex flex-col items-center justify-center"
                  style={{ background: currentTheme.colors.primaryLight }}
                >
                  <p className="text-base font-bold leading-none" style={{ color: currentTheme.colors.primary }}>{event.date}</p>
                  <p className="text-[9px] mt-0.5" style={{ color: currentTheme.colors.textMuted }}>{event.month}</p>
                </div>
                <div>
                  <p className="text-xs font-medium leading-snug" style={{ color: currentTheme.colors.text }}>{event.title}</p>
                  <span
                    className="inline-block mt-1 px-1.5 py-0.5 rounded-full text-[10px]"
                    style={{ background: event.color + "20", color: event.color }}
                  >
                    {event.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}