import { Calendar, Clock, PlusCircle, GraduationCap } from 'lucide-react';
import { useState } from 'react';

const schedule = [
  { day: 1, time: '08:00', subject: 'Cálculo II', room: 'Sala 201', professor: 'Prof. Silva', color: '#F472B6' },
  { day: 1, time: '10:00', subject: 'Programação', room: 'Lab 3', professor: 'Prof. Costa', color: '#FCD34D' },
  { day: 2, time: '14:00', subject: 'Física', room: 'Sala 105', professor: 'Prof. Santos', color: '#A855F7' },
  { day: 3, time: '08:00', subject: 'Cálculo II', room: 'Sala 201', professor: 'Prof. Silva', color: '#F472B6' },
  { day: 4, time: '10:00', subject: 'BD', room: 'Lab 2', professor: 'Prof. Alves', color: '#10B981' },
  { day: 5, time: '14:00', subject: 'Programação', room: 'Lab 3', professor: 'Prof. Costa', color: '#FCD34D' },
];

const exams = [
  { id: 1, date: '12 Mai', subject: 'Cálculo II', type: 'Prova P1', status: 'pending', daysLeft: 5 },
  { id: 2, date: '15 Mai', subject: 'Programação', type: 'Trabalho', status: 'pending', daysLeft: 8 },
  { id: 3, date: '20 Mai', subject: 'TCC', type: 'Apresentação', status: 'pending', daysLeft: 13 },
];

const subjects = [
  { name: 'Cálculo II', professor: 'Prof. Silva', credits: 4, grade: 8.5, attendance: 92, color: '#F472B6' },
  { name: 'Programação', professor: 'Prof. Costa', credits: 4, grade: 9.0, attendance: 95, color: '#FCD34D' },
  { name: 'Física', professor: 'Prof. Santos', credits: 4, grade: 7.5, attendance: 88, color: '#A855F7' },
  { name: 'Banco de Dados', professor: 'Prof. Alves', credits: 4, grade: 8.8, attendance: 90, color: '#10B981' },
];

export function UniversityPage() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'exams' | 'subjects'>('schedule');

  const days = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
  const hours = ['08:00', '10:00', '14:00', '16:00', '18:00', '20:00'];

  return (
    <div className="flex-1 overflow-auto p-6 bg-background">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display mb-6 text-[40px] font-bold text-foreground flex items-center gap-3">
          <GraduationCap className="w-10 h-10 text-primary" />
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
                className={`px-6 py-3 rounded-full transition-all font-medium ${activeTab === tab ? 'bg-primary text-white' : 'bg-secondary text-[#BE185D]'}`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Schedule Grid */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_16px_rgba(244,114,182,0.10)]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Horário de Aulas
            </h2>
            <button className="px-4 py-2 rounded-full border-2 border-primary flex items-center gap-2 hover:bg-gray-50 transition-all text-primary">
              <PlusCircle className="w-4 h-4" />
              Adicionar aula
            </button>
          </div>

          <div className="overflow-x-auto">
            <div className="grid grid-cols-7 gap-2 min-w-max">
              <div />
              {days.map((day) => (
                <div key={day} className="text-center p-3 rounded-lg bg-secondary">
                  <p className="text-sm font-semibold text-[#BE185D]">{day}</p>
                </div>
              ))}

              {hours.map((hour, hourIndex) => (
                <>
                  <div key={hour} className="flex items-center justify-center p-3">
                    <p className="text-[13px] text-muted-foreground font-medium">{hour}</p>
                  </div>
                  {days.map((_, dayIndex) => {
                    const classItem = schedule.find((s) => s.day === dayIndex && s.time === hour);
                    return (
                      <div
                        key={`${dayIndex}-${hourIndex}`}
                        className="p-3 rounded-lg border border-gray-100 min-h-[80px] hover:border-pink-200 transition-all"
                      >
                        {classItem && (
                          <div
                            className="h-full rounded-lg p-2 cursor-pointer hover:opacity-90 transition-all"
                            style={{ background: classItem.color, opacity: 0.15 }}
                          >
                            <div className="h-full flex flex-col justify-center">
                              <p className="text-[13px] font-semibold text-foreground">{classItem.subject}</p>
                              <p className="text-[11px] text-muted-foreground">{classItem.room}</p>
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
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_16px_rgba(244,114,182,0.10)]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Provas & Datas Importantes
            </h2>
            <button className="px-4 py-2 rounded-full text-white flex items-center gap-2 hover:opacity-90 transition-all bg-primary">
              <PlusCircle className="w-4 h-4" />
              Adicionar
            </button>
          </div>

          <div className="space-y-4">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="flex items-center gap-4 p-5 rounded-xl hover:bg-gray-50 transition-all cursor-pointer border-l-4 border-primary"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center bg-secondary">
                  <Calendar className="w-6 h-6 mb-1 text-primary" />
                  <p className="text-[11px] text-[#BE185D] font-medium">{exam.date}</p>
                </div>

                <div className="flex-1">
                  <p className="text-lg font-semibold text-foreground">{exam.subject}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-3 py-1 rounded-full text-xs bg-secondary text-[#BE185D]">
                      {exam.type}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs bg-[#FEF3C7] text-[#92400E]">
                      em {exam.daysLeft} dias
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subjects */}
      {activeTab === 'subjects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subjects.map((subject) => (
            <div
              key={subject.name}
              className="bg-white rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer shadow-[0_2px_16px_rgba(244,114,182,0.10)]"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-3 h-3 rounded-full flex-shrink-0 mt-2" style={{ background: subject.color }} />
                <div className="flex-1">
                  <h3 className="font-display mb-1 text-xl font-semibold text-foreground">
                    {subject.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {subject.professor} • {subject.credits} créditos
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[13px] text-muted-foreground">Nota</p>
                    <p className="text-lg font-bold text-foreground">{subject.grade}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[13px] text-muted-foreground">Frequência</p>
                    <p className="text-sm font-semibold text-foreground">{subject.attendance}%</p>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden bg-secondary">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${subject.attendance}%`,
                        background: subject.attendance >= 75 ? '#10B981' : '#F472B6',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Semester Info Card */}
      <div
        className="mt-6 bg-white rounded-2xl p-6 shadow-[0_2px_16px_rgba(244,114,182,0.10)]"
        style={{ background: 'linear-gradient(135deg, rgba(244,114,182,0.05) 0%, rgba(252,211,77,0.05) 100%)' }}
      >
        <h3 className="font-display mb-4 text-xl font-semibold text-foreground">
          Semestre: 2026.1
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-[13px] text-muted-foreground mb-1">Progresso</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full overflow-hidden bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: '60%' }} />
              </div>
              <p className="text-sm font-semibold text-primary">60%</p>
            </div>
          </div>
          <div>
            <p className="text-[13px] text-muted-foreground mb-1">Matérias</p>
            <p className="text-xl font-bold text-foreground">4 ativas</p>
          </div>
          <div>
            <p className="text-[13px] text-muted-foreground mb-1">Média Geral</p>
            <p className="text-xl font-bold text-primary">8.45</p>
          </div>
        </div>
      </div>
    </div>
  );
}
