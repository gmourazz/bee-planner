import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import Welcome from "./pages/Welcome";
import { LoginPage } from "./pages/LoginPage";
import { Sidebar } from "./components/Sidebar";
import { DashboardPage } from "./pages/DashboardPage";
import { BooksPage } from "./pages/BooksPage";
import { UniversityPage } from "./pages/UniversityPage";
import { CalendarPage } from "./pages/CalendarPage";
import { NotesPage } from "./pages/NotesPage";
import { CoursesPage } from "./pages/CoursesPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";
import { WeekPage } from "./pages/WeekPage";
import { HabitsPage } from "./pages/HabitsPage";
import { FinancePage } from "./pages/FinancePage";
import { HealthPage } from "./pages/HealthPage";
import { GoalsPage } from "./pages/GoalsPage";
import { SeriesPage } from "./pages/SeriesPage";
import { ToastProvider } from "./components/Toast";
import { PageLayout } from "./components/PageLayout";

function AppLayout() {
  const { signOut } = useAuth();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Aplica grayscale em todas as páginas no tema TI, exceto /perfil (para preservar a foto do usuário)
  const grayscaleFilter = currentTheme.id === 'tech' && location.pathname !== '/perfil'
    ? 'grayscale(1)'
    : 'none';

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar onLogout={handleLogout} />
      <div
        className="flex-1 flex overflow-hidden"
        style={{ filter: grayscaleFilter }}
      >
        <PageLayout>
          <Routes>
            <Route path="/inicio"        element={<DashboardPage userName="Usuária" />} />
            <Route path="/dashboard"     element={<AnalyticsPage />} />
            <Route path="/semana"        element={<WeekPage />} />
            <Route path="/habitos"       element={<HabitsPage />} />
            <Route path="/datas"         element={<CalendarPage />} />
            <Route path="/notas"         element={<NotesPage />} />
            <Route path="/livros"        element={<BooksPage />} />
            <Route path="/cursos"        element={<CoursesPage />} />
            <Route path="/universitario" element={<UniversityPage />} />
            <Route path="/financas"      element={<FinancePage />} />
            <Route path="/saude"         element={<HealthPage />} />
            <Route path="/series"        element={<SeriesPage />} />
            <Route path="/metas"         element={<GoalsPage />} />
            <Route path="/perfil"        element={<ProfilePage />} />
            <Route path="/configuracoes" element={<SettingsPage />} />
            <Route path="*"              element={<Navigate to="/inicio" replace />} />
          </Routes>
        </PageLayout>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user) {
      // Só redireciona se estiver em página de auth — mantém rota atual em refresh
      const authPaths = ['/', '/login']
      if (authPaths.includes(location.pathname)) {
        navigate("/inicio");
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FFF8F5]">
        <span className="text-5xl" style={{ animation: 'spin 1s linear infinite' }}>🐝</span>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        {/* Landing page — botões "Entrar" e "Começar grátis" navegam para /login */}
        <Route
          path="/"
          element={
            <Welcome
              onLoginClick={() => navigate("/login")}
              onGetStarted={() => navigate("/login?mode=register")}
            />
          }
        />

        {/* /login       → abre aba "Entrar"        (email + senha)    */}
        {/* /login?mode=register → abre aba "Criar conta" (cadastro 3 etapas) */}
        <Route
          path="/login"
          element={<LoginPage onLogin={() => navigate("/inicio")} />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return <AppLayout />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}