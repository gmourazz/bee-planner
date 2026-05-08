import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Welcome from "./components/Welcome";
import { Login } from "./components/Login";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { BooksPage } from "./components/BooksPage";
import { UniversityPage } from "./components/UniversityPage";
import { CalendarPage } from "./components/CalendarPage";
import { NotesPage } from "./components/NotesPage";
import { CoursesPage } from "./components/CoursesPage";
import { AnalyticsPage } from "./components/AnalyticsPage";
import { ProfilePage } from "./components/ProfilePage";
import { SettingsPage } from "./components/SettingsPage";
import { WeekPage } from "./components/WeekPage";
import { HabitsPage } from "./components/HabitsPage";
import { FinancePage } from "./components/FinancePage";
import { HealthPage } from "./components/HealthPage";
import { GoalsPage } from "./components/GoalsPage";

function AppLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/inicio"        element={<Dashboard userName="Usuária" />} />
          <Route path="/analytics"     element={<AnalyticsPage />} />
          <Route path="/semana"        element={<WeekPage />} />
          <Route path="/habitos"       element={<HabitsPage />} />
          <Route path="/datas"         element={<CalendarPage />} />
          <Route path="/notas"         element={<NotesPage />} />
          <Route path="/livros"        element={<BooksPage />} />
          <Route path="/cursos"        element={<CoursesPage />} />
          <Route path="/universitario" element={<UniversityPage />} />
          <Route path="/financas"      element={<FinancePage />} />
          <Route path="/saude"         element={<HealthPage />} />
          <Route path="/metas"         element={<GoalsPage />} />
          <Route path="/perfil"        element={<ProfilePage />} />
          <Route path="/configuracoes" element={<SettingsPage />} />
          <Route path="*"              element={<Navigate to="/inicio" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/inicio");
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
          element={<Login onLogin={() => navigate("/inicio")} />}
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
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}