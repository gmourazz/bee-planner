import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Cake,
  BookOpen,
  Stethoscope,
  FileText,
  Zap,
  Heart,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface CalEvent {
  id: number;
  date: string;
  title: string;
  type: string;
}

const TYPE_ICONS: Record<string, React.FC<{ className?: string; style?: React.CSSProperties }>> = {
  Pessoal: Heart,
  Aniversário: Cake,
  Universitário: BookOpen,
  Hábito: Zap,
  Saúde: Stethoscope,
  Entrega: FileText,
};

let nextEvId = 10;

const initialEvents: CalEvent[] = [
  { id: nextEvId++, date: '2026-05-05', title: 'Aniversário da mamãe', type: 'Aniversário' },
  { id: nextEvId++, date: '2026-05-12', title: 'Prova de Cálculo II', type: 'Universitário' },
  { id: nextEvId++, date: '2026-05-15', title: 'Consulta médica', type: 'Saúde' },
  { id: nextEvId++, date: '2026-05-20', title: 'Entrega de TCC', type: 'Entrega' },
  { id: nextEvId++, date: '2026-05-25', title: 'Yoga no parque', type: 'Hábito' },
];

export function CalendarPage() {
  const { currentTheme } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4));
  const [events, setEvents] = useState<CalEvent[]>(initialEvents);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [form, setForm] = useState({ title: '', type: 'Pessoal', date: '' });

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === currentMonth.getFullYear() &&
    today.getMonth() === currentMonth.getMonth();

  const monthName = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const dayKey = (d: number) => `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const eventsOnDay = (d: number) => events.filter((e) => e.date === dayKey(d));

  const upcomingEvents = [...events]
    .filter((e) => e.date >= today.toISOString().split('T')[0])
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  const typeColors = [
    currentTheme.colors.primary,
    currentTheme.colors.accent,
    currentTheme.colors.primaryDark,
    currentTheme.colors.primary,
    currentTheme.colors.accent,
    currentTheme.colors.primaryDark,
  ];
  const typeKeys = Object.keys(TYPE_ICONS);
  const getEventColor = (type: string) => typeColors[typeKeys.indexOf(type) % typeColors.length] || currentTheme.colors.primary;

  const addEvent = () => {
    if (!form.title.trim() || !form.date) return;
    setEvents((prev) => [...prev, { id: nextEvId++, date: form.date, title: form.title.trim(), type: form.type }]);
    setForm({ title: '', type: 'Pessoal', date: '' });
    setSelectedDay(null);
  };

  const deleteEvent = (id: number) => setEvents((prev) => prev.filter((e) => e.id !== id));

  return (
    <div className="flex-1 overflow-auto" style={{ background: currentTheme.colors.background }}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl p-6" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-70 transition-all" style={{ background: currentTheme.colors.primaryLight }}>
                <ChevronLeft className="w-5 h-5" style={{ color: currentTheme.colors.primaryDark }} />
              </button>
              <h2 className="font-display text-[28px] font-semibold" style={{ color: currentTheme.colors.text }}>{capitalizedMonth}</h2>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-70 transition-all" style={{ background: currentTheme.colors.primaryLight }}>
                <ChevronRight className="w-5 h-5" style={{ color: currentTheme.colors.primaryDark }} />
              </button>
            </div>

            {/* Week Header */}
            <div className="grid grid-cols-7 gap-2 mb-3">
              {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'].map((day) => (
                <div key={day} className="text-center p-2">
                  <p className="text-[13px] font-semibold" style={{ color: currentTheme.colors.textMuted }}>{day}</p>
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, index) => {
                const isToday = isCurrentMonth && day === today.getDate();
                const dayEvents = day ? eventsOnDay(day) : [];
                const isSelected = day === selectedDay;

                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (!day) return;
                      setSelectedDay(day);
                      setForm((f) => ({ ...f, date: dayKey(day) }));
                    }}
                    className="aspect-square p-2 rounded-xl transition-all cursor-pointer"
                    style={{
                      background: isToday ? currentTheme.colors.primary : isSelected ? currentTheme.colors.primaryLight : "transparent",
                    }}
                  >
                    {day && (
                      <>
                        <p className="text-center mb-1 text-base font-medium" style={{ color: isToday ? "#fff" : currentTheme.colors.text }}>
                          {day}
                        </p>
                        {dayEvents.length > 0 && (
                          <div className="flex justify-center gap-0.5 flex-wrap">
                            {dayEvents.slice(0, 3).map((e) => (
                              <div key={e.id} className="w-1.5 h-1.5 rounded-full" style={{ background: isToday ? "rgba(255,255,255,0.8)" : getEventColor(e.type) }} />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t" style={{ borderColor: currentTheme.colors.primary + "15" }}>
              {Object.entries(TYPE_ICONS).map(([label, Icon]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Icon className="w-3 h-3" style={{ color: getEventColor(label) }} />
                  <span className="text-[12px]" style={{ color: currentTheme.colors.textMuted }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col gap-5">
          {/* Add Event Form */}
          <div className="rounded-2xl p-5" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
            <h3 className="font-display mb-4 text-lg font-semibold flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
              <Plus className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
              Adicionar Evento
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome do evento"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && addEvent()}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-transparent outline-none transition-all text-sm"
                style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }}
                onFocus={(e) => (e.target.style.borderColor = currentTheme.colors.primary)}
                onBlur={(e) => (e.target.style.borderColor = 'transparent')}
              />
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-transparent outline-none transition-all text-sm"
                style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }}
                onFocus={(e) => (e.target.style.borderColor = currentTheme.colors.primary)}
                onBlur={(e) => (e.target.style.borderColor = 'transparent')}
              />
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-transparent outline-none transition-all text-sm"
                style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }}
              >
                {Object.keys(TYPE_ICONS).map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <button
                onClick={addEvent}
                className="w-full py-2.5 rounded-full text-white font-semibold hover:opacity-90 transition-all"
                style={{ background: currentTheme.colors.primary }}
              >
                Salvar
              </button>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="rounded-2xl p-5" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
            <h3 className="font-display mb-4 text-lg font-semibold flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
              <CalendarIcon className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
              Próximas Datas
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {upcomingEvents.length === 0 && (
                <p className="text-sm text-center py-4" style={{ color: currentTheme.colors.textMuted }}>Nenhum evento próximo</p>
              )}
              {upcomingEvents.map((event) => {
                const Icon = TYPE_ICONS[event.type] || CalendarIcon;
                const color = getEventColor(event.type);
                const d = new Date(event.date + 'T00:00');
                return (
                  <div
                    key={event.id}
                    className="group flex items-center gap-3 p-3 rounded-xl border-l-4 hover:opacity-80 transition-all"
                    style={{ borderColor: color }}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: currentTheme.colors.primaryLight }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: currentTheme.colors.text }}>{event.title}</p>
                      <p className="text-xs" style={{ color: currentTheme.colors.textMuted }}>
                        {d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} · {event.type}
                      </p>
                    </div>
                    <button onClick={() => deleteEvent(event.id)} className="opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 className="w-4 h-4" style={{ color: currentTheme.colors.textMuted }} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
