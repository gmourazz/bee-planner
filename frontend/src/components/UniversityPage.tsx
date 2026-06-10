import { Calendar, Clock, PlusCircle, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const schedule = [
  { day: 1, time: '08:00', subject: 'Cálculo II', room: 'Sala 201', professor: 'Prof. Silva', colorIdx: 0 },
  { day: 1, time: '10:00', subject: 'Programação', room: 'Lab 3', professor: 'Prof. Costa', colorIdx: 1 },
  { day: 2, time: '14:00', subject: 'Física', room: 'Sala 105', professor: 'Prof. Santos', colorIdx: 2 },
  { day: 3, time: '08:00', subject: 'Cálculo II', room: 'Sala 201', professor: 'Prof. Silva', colorIdx: 0 },
  { day: 4, time: '10:00', subject: 'BD', room: 'Lab 2', professor: 'Prof. Alves', colorIdx: 3 },
  { day: 5, time: '14:00', subject: 'Programação', room: 'Lab 3', professor: 'Prof. Costa', colorIdx: 1 },
];

const exams = [
  { id: 1, date: '12 Mai', subject: 'Cálculo II', type: 'Prova P1', status: 'pending', daysLeft: 5 },
  { id: 2, date: '15 Mai', subject: 'Programação', type: 'Trabalho', status: 'pending', daysLeft: 8 },
  { id: 3, date: '20 Mai', subject: 'TCC', type: 'Apresentação', status: 'pending', daysLeft: 13 },
];

const subjects = [
  { name: 'Cálculo II', professor: 'Prof. Silva', credits: 4, grade: 8.5, attendance: 92, colorIdx: 0 },
  { name: 'Programação', professor: 'Prof. Costa', credits: 4, grade: 9.0, attendance: 95, colorIdx: 1 },
  { name: 'Física', professor: 'Prof. Santos', credits: 4, grade: 7.5, attendance: 88, colorIdx: 2 },
  { name: 'Banco de Dados', professor: 'Prof. Alves', credits: 4, grade: 8.8, attendance: 90, colorIdx: 3 },
];

export function UniversityPage() {
  const { currentTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'schedule' | 'exams' | 'subjects'>('schedule');

  const subjectColors = [
    currentTheme.colors.primary,
    currentTheme.colors.accent,
    currentTheme.colors.primaryDark,
    currentTheme.colors.textMuted,
  ];

  const days = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
  const hours = ['08:00', '10:00', '14:00', '16:00', '18:00', '20:00'];

  return (
    <div className="flex-1 overflow-auto p-6" style={{ background: currentTheme.colors.background }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display mb-6 text-[40px] font-bold flex items-center gap-3" style={{ color: currentTheme.colors.text }}>
          <GraduationCap className="w-10 h-10" style={{ color: currentTheme.colors.primary }} />
          Universitário & Estudos
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['schedule', 'exams', 'subjects'] as const).map((tab) => {
            const labels = { schedule: 'Grade Horária', exams: 'Provas & Datas', subjects: 'Matérias' };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-6 py-3 rounded-full transition-all font-medium"
                style={{
                  background: activeTab === tab ? currentTheme.colors.primary : currentTheme.colors.surface,
                  color: activeTab === tab ? '#fff' : currentTheme.colors.text,
                  boxShadow: activeTab !== tab ? `0 2px 8px ${currentTheme.colors.primary}10` : 'none',
                }}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Schedule Grid */}
      {activeTab === 'schedule' && (
        <div className="rounded-2xl p-6" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-semibold" style={{ color: currentTheme.colors.text }}>
              Horário de Aulas
            </h2>
            <button
              className="px-4 py-2 rounded-full flex items-center gap-2 hover:opacity-80 transition-all"
              style={{ border: `2px solid ${currentTheme.colors.primary}`, color: currentTheme.colors.primary, background: 'transparent' }}
            >
              <PlusCircle className="w-4 h-4" />
              Adicionar aula
            </button>
          </div>

          <div className="overflow-x-auto">
            <div className="grid grid-cols-7 gap-2 min-w-max">
              <div />
              {days.map((day) => (
                <div key={day} className="text-center p-3 rounded-lg" style={{ background: currentTheme.colors.primaryLight }}>
                  <p className="text-sm font-semibold" style={{ color: currentTheme.colors.primaryDark }}>{day}</p>
                </div>
              ))}

              {hours.map((hour, hourIndex) => (
                <>
                  <div key={hour} className="flex items-center justify-center p-3">
                    <p className="text-[13px] font-medium" style={{ color: currentTheme.colors.textMuted }}>{hour}</p>
                  </div>
                  {days.map((_, dayIndex) => {
                    const classItem = schedule.find((s) => s.day === dayIndex && s.time === hour);
                    const color = classItem ? subjectColors[classItem.colorIdx % subjectColors.length] : null;
                    return (
                      <div
                        key={`${dayIndex}-${hourIndex}`}
                        className="p-3 rounded-lg min-h-[80px] hover:opacity-80 transition-all"
                        style={{ border: `1px solid ${currentTheme.colors.primary}15` }}
                      >
                        {classItem && color && (
                          <div
                            className="h-full rounded-lg p-2 cursor-pointer hover:opacity-90 transition-all"
                            style={{ background: color + '20' }}
                          >
                            <div className="h-full flex flex-col justify-center">
                              <p className="text-[13px] font-semibold" style={{ color: currentTheme.colors.text }}>{classItem.subject}</p>
                              <p className="text-[11px]" style={{ color: currentTheme.colors.textMuted }}>{classItem.room}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Exams & Dates */}
      {activeTab === 'exams' && (
        <div className="rounded-2xl p-6" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-semibold" style={{ color: currentTheme.colors.text }}>
              Provas & Datas Importantes
            </h2>
            <button
              className="px-4 py-2 rounded-full text-white flex items-center gap-2 hover:opacity-90 transition-all"
              style={{ background: currentTheme.colors.primary }}
            >
              <PlusCircle className="w-4 h-4" />
              Adicionar
            </button>
          </div>

          <div className="space-y-4">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="flex items-center gap-4 p-5 rounded-xl hover:opacity-80 transition-all cursor-pointer border-l-4"
                style={{ borderColor: currentTheme.colors.primary, background: currentTheme.colors.background }}
              >
                <div
                  className="flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center"
                  style={{ background: currentTheme.colors.primaryLight }}
                >
                  <Calendar className="w-6 h-6 mb-1" style={{ color: currentTheme.colors.primary }} />
                  <p className="text-[11px] font-medium" style={{ color: currentTheme.colors.primaryDark }}>{exam.date}</p>
                </div>

                <div className="flex-1">
                  <p className="text-lg font-semibold" style={{ color: currentTheme.colors.text }}>{exam.subject}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="px-3 py-1 rounded-full text-xs"
                      style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}
                    >
                      {exam.type}
                    </span>
                    <span
                      className="px-3 py-1 rounded-full text-xs"
                      style={{ background: currentTheme.colors.accent + '20', color: currentTheme.colors.accent }}
                    >
                      em {exam.daysLeft} dias
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <Clock className="w-5 h-5" style={{ color: currentTheme.colors.textMuted }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subjects */}
      {activeTab === 'subjects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subjects.map((subject) => {
            const color = subjectColors[subject.colorIdx % subjectColors.length];
            return (
              <div
                key={subject.name}
                className="rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer"
                style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full flex-shrink-0 mt-2" style={{ background: color }} />
                  <div className="flex-1">
                    <h3 className="font-display mb-1 text-xl font-semibold" style={{ color: currentTheme.colors.text }}>
                      {subject.name}
                    </h3>
                    <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>
                      {subject.professor} • {subject.credits} créditos
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[13px]" style={{ color: currentTheme.colors.textMuted }}>Nota</p>
                      <p className="text-lg font-bold" style={{ color: currentTheme.colors.text }}>{subject.grade}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[13px]" style={{ color: currentTheme.colors.textMuted }}>Frequência</p>
                      <p className="text-sm font-semibold" style={{ color: currentTheme.colors.text }}>{subject.attendance}%</p>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: currentTheme.colors.primaryLight }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${subject.attendance}%`,
                          background: subject.attendance >= 75 ? currentTheme.colors.primary : currentTheme.colors.accent,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Semester Info Card */}
      <div
        className="mt-6 rounded-2xl p-6"
        style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}
      >
        <h3 className="font-display mb-4 text-xl font-semibold" style={{ color: currentTheme.colors.text }}>
          Semestre: 2026.1
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-[13px] mb-1" style={{ color: currentTheme.colors.textMuted }}>Progresso</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: currentTheme.colors.primaryLight }}>
                <div className="h-full rounded-full" style={{ width: '60%', background: currentTheme.colors.primary }} />
              </div>
              <p className="text-sm font-semibold" style={{ color: currentTheme.colors.primary }}>60%</p>
            </div>
          </div>
          <div>
            <p className="text-[13px] mb-1" style={{ color: currentTheme.colors.textMuted }}>Matérias</p>
            <p className="text-xl font-bold" style={{ color: currentTheme.colors.text }}>4 ativas</p>
          </div>
          <div>
            <p className="text-[13px] mb-1" style={{ color: currentTheme.colors.textMuted }}>Média Geral</p>
            <p className="text-xl font-bold" style={{ color: currentTheme.colors.primary }}>8.45</p>
          </div>
        </div>
      </div>
    </div>
  );
}
