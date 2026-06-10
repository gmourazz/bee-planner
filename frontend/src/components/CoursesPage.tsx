import {
  Award,
  Calendar,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  PlusCircle,
  TrendingUp,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const courses = [
  { id: 1, title: "React Avançado", platform: "Udemy", progress: 100, status: "completed", certificate: true, certificateExpiry: null, startDate: "Jan 2026", endDate: "Mar 2026", duration: "40h", credential: "UC-REACT-2026-001" },
  { id: 2, title: "TypeScript do Zero ao Avançado", platform: "Alura", progress: 75, status: "in-progress", certificate: false, certificateExpiry: null, startDate: "Fev 2026", endDate: null, duration: "32h", credential: null },
  { id: 3, title: "AWS Cloud Practitioner", platform: "AWS Training", progress: 100, status: "completed", certificate: true, certificateExpiry: "Mai 2026", startDate: "Nov 2025", endDate: "Dez 2025", duration: "20h", credential: "AWS-CCP-2025-789" },
  { id: 4, title: "Machine Learning Basics", platform: "Coursera", progress: 30, status: "urgent", certificate: false, certificateExpiry: null, startDate: "Mar 2026", endDate: null, duration: "60h", credential: null },
  { id: 5, title: "Python para Data Science", platform: "DataCamp", progress: 100, status: "completed", certificate: true, certificateExpiry: "Jun 2026", startDate: "Set 2025", endDate: "Nov 2025", duration: "45h", credential: "DC-PY-2025-456" },
  { id: 6, title: "Docker & Kubernetes", platform: "Linux Academy", progress: 10, status: "not-finished", certificate: false, certificateExpiry: null, startDate: "Abr 2026", endDate: null, duration: "35h", credential: null },
];

export function CoursesPage() {
  const { currentTheme } = useTheme();

  const completed = courses.filter((c) => c.status === "completed").length;
  const inProgress = courses.filter((c) => c.status === "in-progress").length;
  const notFinished = courses.filter((c) => c.status === "not-finished").length;
  const urgent = courses.filter((c) => c.status === "urgent").length;
  const totalCertificates = courses.filter((c) => c.certificate).length;
  const expiringCertificates = courses.filter((c) => c.certificateExpiry).length;

  return (
    <div className="flex-1 overflow-auto p-6" style={{ background: currentTheme.colors.background }}>
      {/* Header */}
      <div className="mb-6">
        <h1
          className="font-display mb-6 text-[40px] font-bold"
          style={{ color: currentTheme.colors.text }}
        >
          Cursos & Certificações
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {[
            { icon: <CheckCircle className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />, label: "Concluídos", value: completed },
            { icon: <TrendingUp className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />, label: "Em Progresso", value: inProgress },
            { icon: <AlertCircle className="w-4 h-4" style={{ color: currentTheme.colors.textMuted }} />, label: "Não Finalizados", value: notFinished },
            { icon: <Calendar className="w-4 h-4" style={{ color: currentTheme.colors.accent }} />, label: "Urgentes", value: urgent },
            { icon: <Award className="w-4 h-4" style={{ color: currentTheme.colors.primaryDark }} />, label: "Certificados", value: totalCertificates },
            { icon: <AlertCircle className="w-4 h-4" style={{ color: currentTheme.colors.accent }} />, label: "Expirando (30d)", value: expiringCertificates },
          ].map((stat, i) => (
            <div
              key={i}
              className="rounded-2xl p-5"
              style={{
                background: currentTheme.colors.surface,
                boxShadow: `0 2px 16px ${currentTheme.colors.primary}15`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                {stat.icon}
                <p className="text-xs" style={{ color: currentTheme.colors.textMuted }}>{stat.label}</p>
              </div>
              <p className="text-[28px] font-bold" style={{ color: currentTheme.colors.text }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Add Course Button */}
        <button
          className="px-6 py-3 rounded-full text-white flex items-center gap-2 hover:opacity-90 transition-all"
          style={{ background: currentTheme.colors.primary }}
        >
          <PlusCircle className="w-5 h-5" />
          Adicionar Curso
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {courses.map((course) => {
          const statusConfig = {
            completed: { label: "Concluído", color: currentTheme.colors.primaryDark, bgColor: currentTheme.colors.primaryLight },
            "in-progress": { label: "Em Progresso", color: currentTheme.colors.primary, bgColor: currentTheme.colors.primaryLight },
            urgent: { label: "Urgente", color: currentTheme.colors.accent, bgColor: currentTheme.colors.accent + "20" },
            "not-finished": { label: "Não Finalizado", color: currentTheme.colors.textMuted, bgColor: currentTheme.colors.primaryLight },
          }[course.status] || { label: "", color: "", bgColor: "" };

          return (
            <div
              key={course.id}
              className="rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer"
              style={{
                background: currentTheme.colors.surface,
                boxShadow: `0 4px 24px ${currentTheme.colors.primary}12`,
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3
                    className="font-display mb-1 text-xl font-semibold"
                    style={{ color: currentTheme.colors.text }}
                  >
                    {course.title}
                  </h3>
                  <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>
                    {course.platform} • {course.duration}
                  </p>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: statusConfig.bgColor, color: statusConfig.color }}
                >
                  {statusConfig.label}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px]" style={{ color: currentTheme.colors.textMuted }}>Progresso</span>
                  <span className="text-sm font-semibold" style={{ color: currentTheme.colors.text }}>
                    {course.progress}%
                  </span>
                </div>
                <div
                  className="w-full h-2.5 rounded-full overflow-hidden"
                  style={{ background: currentTheme.colors.primaryLight }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${course.progress}%`, background: statusConfig.color }}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center gap-4 mb-4 text-sm">
                <div>
                  <span style={{ color: currentTheme.colors.textMuted }}>Início: </span>
                  <span className="font-medium" style={{ color: currentTheme.colors.text }}>{course.startDate}</span>
                </div>
                {course.endDate && (
                  <div>
                    <span style={{ color: currentTheme.colors.textMuted }}>Fim: </span>
                    <span className="font-medium" style={{ color: currentTheme.colors.text }}>{course.endDate}</span>
                  </div>
                )}
              </div>

              {/* Certificate Info */}
              {course.certificate && (
                <div className="rounded-xl p-3" style={{ background: currentTheme.colors.primaryLight }}>
                  <div className="flex items-start gap-3">
                    <Award
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      style={{ color: currentTheme.colors.accent }}
                    />
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold mb-0.5" style={{ color: currentTheme.colors.text }}>
                        Certificado Obtido
                      </p>
                      {course.credential && (
                        <p className="font-mono text-[11px]" style={{ color: currentTheme.colors.textMuted }}>
                          {course.credential}
                        </p>
                      )}
                      {course.certificateExpiry && (
                        <p className="text-xs mt-1 flex items-center gap-1" style={{ color: currentTheme.colors.accent }}>
                          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                          Expira em: {course.certificateExpiry}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
