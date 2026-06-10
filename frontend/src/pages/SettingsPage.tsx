import {
  Eye, EyeOff, Bell, Lock, Trash2,
  Home, LayoutDashboard, CalendarDays, Zap, MapPin, FileText,
  BookOpen, GraduationCap, University, Wallet, HeartPulse, Target,
  Download, KeyRound, AlertTriangle, CheckCircle2, Loader2,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useSettings, type MenuVisibility, type NotificationPrefs } from "../contexts/SettingsContext";
import { useToast } from "../components/Toast";

// Itens do menu com sua chave de visibilidade
const menuItems: { key: keyof MenuVisibility; label: string; Icon: LucideIcon; required?: boolean }[] = [
  { key: "home",       label: "Home",               Icon: Home,           required: true },
  { key: "dashboard",  label: "Dashboard",           Icon: LayoutDashboard },
  { key: "week",       label: "Semana",              Icon: CalendarDays },
  { key: "habits",     label: "Hábitos",             Icon: Zap },
  { key: "dates",      label: "Datas Importantes",   Icon: MapPin },
  { key: "notes",      label: "Notas",               Icon: FileText },
  { key: "books",      label: "Livros Lidos",        Icon: BookOpen },
  { key: "courses",    label: "Cursos",              Icon: GraduationCap },
  { key: "university", label: "Universitário",       Icon: University },
  { key: "finance",    label: "Finanças",            Icon: Wallet },
  { key: "health",     label: "Saúde & Bem-estar",   Icon: HeartPulse },
  { key: "goals",      label: "Metas & Objetivos",   Icon: Target },
];

const notifItems: { key: keyof NotificationPrefs; label: string; description: string }[] = [
  { key: "tasks",        label: "Lembrete de Tarefas",  description: "Notificações de tarefas pendentes do dia" },
  { key: "habits",       label: "Hábitos Diários",      description: "Lembretes para manter seus hábitos" },
  { key: "exams",        label: "Provas e Exames",       description: "Alertas de provas próximas (7 dias)" },
  { key: "birthdays",    label: "Aniversários",          description: "Lembretes de datas importantes" },
  { key: "certificates", label: "Certificados",          description: "Alertas de certificados expirando" },
];

export function SettingsPage() {
  const { currentTheme } = useTheme();
  const { toast } = useToast();
  const {
    settings, loading, saving,
    updateMenuVisibility, updateNotification,
    changePassword, exportData, deleteAccount,
  } = useSettings();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm,   setDeleteConfirm]   = useState("");
  const [actionLoading,   setActionLoading]   = useState<string | null>(null);
  const [browserNotifPerm, setBrowserNotifPerm] = useState(
    'Notification' in window ? Notification.permission : 'denied'
  );

  const handleChangePassword = async () => {
    setActionLoading('password');
    try {
      await changePassword();
      toast('E-mail enviado!', 'Verifique sua caixa de entrada para redefinir a senha.');
    } catch {
      toast('Erro', 'Não foi possível enviar o e-mail.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleExport = async () => {
    setActionLoading('export');
    try {
      await exportData();
      toast('Dados exportados!', 'O download iniciou automaticamente.');
    } catch {
      toast('Erro ao exportar', '', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'EXCLUIR') return;
    setActionLoading('delete');
    try {
      await deleteAccount();
    } catch {
      toast('Erro ao excluir conta', '', 'error');
      setActionLoading(null);
    }
  };

  const requestBrowserNotif = async () => {
    if (!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    setBrowserNotifPerm(perm);
    if (perm === 'granted') toast('Notificações ativadas!', 'O BeePlanner pode te lembrar de tarefas e hábitos.');
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center" style={{ background: currentTheme.colors.background }}>
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: currentTheme.colors.primary }} />
    </div>
  );

  return (
    <div className="flex-1 overflow-auto p-6" style={{ background: currentTheme.colors.background }}>
      <div className="max-w-4xl mx-auto flex flex-col gap-6">

        {/* Indicador de salvamento */}
        {saving && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl self-end"
            style={{ background: currentTheme.colors.primaryLight }}>
            <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: currentTheme.colors.primary }} />
            <span className="text-xs font-medium" style={{ color: currentTheme.colors.primary }}>Salvando...</span>
          </div>
        )}

        {/* Visibilidade do Menu */}
        <section className="rounded-2xl p-6"
          style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}>
          <h2 className="font-display text-xl font-semibold mb-1" style={{ color: currentTheme.colors.text }}>
            Visibilidade do Menu
          </h2>
          <p className="text-sm mb-5" style={{ color: currentTheme.colors.textMuted }}>
            Oculte seções que não utiliza para manter o menu organizado.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {menuItems.map(item => {
              const visible = settings.menuVisibility[item.key];
              return (
                <div key={item.key}
                  className="flex items-center justify-between px-4 py-3 rounded-xl transition-all"
                  style={{ background: visible ? currentTheme.colors.primaryLight : currentTheme.colors.background }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: visible ? `${currentTheme.colors.primary}20` : currentTheme.colors.primaryLight }}>
                      <item.Icon className="w-4 h-4" style={{ color: visible ? currentTheme.colors.primary : currentTheme.colors.textMuted }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>{item.label}</span>
                    {item.required && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{ background: currentTheme.colors.accent, color: '#fff' }}>
                        Fixo
                      </span>
                    )}
                  </div>
                  <button
                    disabled={item.required}
                    onClick={() => !item.required && updateMenuVisibility(item.key, !visible)}
                    className="w-9 h-5 rounded-full transition-all flex-shrink-0 relative"
                    style={{
                      background: visible ? currentTheme.colors.primary : currentTheme.colors.textMuted + '60',
                      opacity: item.required ? 0.4 : 1,
                      cursor: item.required ? 'not-allowed' : 'pointer',
                    }}>
                    <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all"
                      style={{ left: visible ? '18px' : '2px' }} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Notificações */}
        <section className="rounded-2xl p-6"
          style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
            <h2 className="font-display text-xl font-semibold" style={{ color: currentTheme.colors.text }}>Notificações</h2>
          </div>
          <p className="text-sm mb-4" style={{ color: currentTheme.colors.textMuted }}>
            Configure quais lembretes deseja receber.
          </p>

          {/* Permissão do browser */}
          {browserNotifPerm !== 'granted' && (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl mb-4"
              style={{ background: `${currentTheme.colors.accent}18`, border: `1.5px solid ${currentTheme.colors.accent}40` }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: currentTheme.colors.text }}>Permissão do navegador</p>
                <p className="text-xs" style={{ color: currentTheme.colors.textMuted }}>
                  {browserNotifPerm === 'denied'
                    ? 'Notificações bloqueadas — habilite nas configurações do navegador.'
                    : 'Autorize o BeePlanner a enviar notificações.'}
                </p>
              </div>
              {browserNotifPerm === 'default' && (
                <button onClick={requestBrowserNotif}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-80"
                  style={{ background: currentTheme.colors.primary }}>
                  Autorizar
                </button>
              )}
            </div>
          )}
          {browserNotifPerm === 'granted' && (
            <div className="flex items-center gap-2 mb-4 text-xs" style={{ color: '#10B981' }}>
              <CheckCircle2 className="w-4 h-4" />
              Notificações do navegador ativadas
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            {notifItems.map(item => {
              const active = settings.notifications[item.key];
              return (
                <div key={item.key}
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: currentTheme.colors.primaryLight }}>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>{item.label}</p>
                    <p className="text-xs" style={{ color: currentTheme.colors.textMuted }}>{item.description}</p>
                  </div>
                  <button onClick={() => updateNotification(item.key, !active)}
                    className="relative w-10 h-5 rounded-full transition-all flex-shrink-0 ml-4"
                    style={{ background: active ? currentTheme.colors.primary : currentTheme.colors.textMuted + '60' }}>
                    <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all"
                      style={{ left: active ? '22px' : '2px' }} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Privacidade & Segurança */}
        <section className="rounded-2xl p-6"
          style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}>
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
            <h2 className="font-display text-xl font-semibold" style={{ color: currentTheme.colors.text }}>Privacidade & Segurança</h2>
          </div>
          <p className="text-sm mb-5" style={{ color: currentTheme.colors.textMuted }}>Gerencie sua senha e seus dados.</p>

          <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>Em breve: alteração de senha e exportação de dados.</p>
        </section>

        {/* Zona de Perigo */}
        <section className="rounded-2xl p-6 border-2"
          style={{ background: '#FEF2F2', borderColor: '#EF4444' }}>
          <div className="flex items-center gap-2 mb-1">
            <Trash2 className="w-5 h-5 text-red-600" />
            <h2 className="font-display text-xl font-semibold text-red-800">Zona de Perigo</h2>
          </div>
          <p className="text-sm mb-4 text-red-600">Ações irreversíveis que afetam permanentemente sua conta.</p>
          <button onClick={() => setShowDeleteModal(true)}
            className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all bg-red-600">
            Excluir minha conta
          </button>
        </section>

      </div>

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="rounded-2xl p-6 w-full max-w-sm shadow-2xl" style={{ background: currentTheme.colors.surface }}>
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-3">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-red-700">Excluir conta?</h3>
              <p className="text-sm mt-1" style={{ color: currentTheme.colors.textMuted }}>
                Todos os seus dados serão removidos permanentemente e não poderão ser recuperados.
              </p>
            </div>
            <p className="text-xs font-medium mb-2" style={{ color: currentTheme.colors.textMuted }}>
              Digite <strong>EXCLUIR</strong> para confirmar:
            </p>
            <input
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none mb-4 border-2"
              style={{
                background: currentTheme.colors.background,
                color: currentTheme.colors.text,
                borderColor: deleteConfirm === 'EXCLUIR' ? '#EF4444' : currentTheme.colors.primaryLight,
              }}
              placeholder="EXCLUIR"
            />
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== 'EXCLUIR' || actionLoading === 'delete'}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-2 bg-red-600 hover:opacity-90">
                {actionLoading === 'delete' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Confirmar exclusão
              </button>
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
