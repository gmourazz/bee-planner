import {
  Camera, Save, User, Mail, Phone, Calendar, Palette, ShieldCheck, Edit3,
  Hexagon, Laptop, PawPrint, Stethoscope, Paintbrush, Scale, GraduationCap,
  BarChart2, Dumbbell, Leaf, Cpu, BookOpen,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { fetchMyProfile, updateMyProfile, uploadAvatar } from "../services/profile";

const THEME_ICONS: Record<string, React.ReactNode> = {
  'bee':           <Hexagon      size={22} strokeWidth={1.5} />,
  'tech':          <Laptop       size={22} strokeWidth={1.5} />,
  'veterinary':    <PawPrint     size={22} strokeWidth={1.5} />,
  'medical':       <Stethoscope  size={22} strokeWidth={1.5} />,
  'designer':      <Paintbrush   size={22} strokeWidth={1.5} />,
  'lawyer':        <Scale        size={22} strokeWidth={1.5} />,
  'student':       <GraduationCap size={22} strokeWidth={1.5} />,
  'data-analyst':  <BarChart2    size={22} strokeWidth={1.5} />,
  'fitness':       <Dumbbell     size={22} strokeWidth={1.5} />,
  'nature':        <Leaf         size={22} strokeWidth={1.5} />,
  'engineer':      <Cpu          size={22} strokeWidth={1.5} />,
  'teacher':       <BookOpen     size={22} strokeWidth={1.5} />,
};

export function ProfilePage() {
  const { currentTheme, themes, setTheme } = useTheme();
  const { user } = useAuth();
  const [editing, setEditing]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarKey = user?.id ? `beeplanner_avatar_url_${user.id}` : null;

  // Carrega o cache escopo por usuário
  useEffect(() => {
    if (!avatarKey) return;
    const cached = localStorage.getItem(avatarKey);
    if (cached) setAvatarUrl(cached);
  }, [avatarKey]);

  useEffect(() => {
    if (!avatarKey) return;
    const url = user?.user_metadata?.avatar_url;
    if (url && url !== localStorage.getItem(avatarKey)) {
      localStorage.setItem(avatarKey, url);
      setAvatarUrl(url);
    }
  }, [user]);

  const applyAvatar = (url: string) => {
    if (avatarKey) localStorage.setItem(avatarKey, url);
    setAvatarUrl(url);
  };

  const [profileData, setProfileData] = useState({
    name:      user?.user_metadata?.name  ?? "",
    email:     user?.email                ?? "",
    phone:     user?.user_metadata?.phone ?? "",
    birthdate: "",
    role:      "user",
  });

  useEffect(() => {
    fetchMyProfile().then(p => {
      setProfileData({
        name:      p.name      ?? user?.user_metadata?.name  ?? "",
        email:     p.email     ?? user?.email                ?? "",
        phone:     p.phone     ?? user?.user_metadata?.phone ?? "",
        birthdate: p.birthdate ?? "",
        role:      p.role      ?? "user",
      });
      if (p.avatar_url) applyAvatar(p.avatar_url);
    });
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const url = await uploadAvatar(file);
      await updateMyProfile({ avatar_url: url });
      applyAvatar(url);
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleChange = (field: string, value: string) =>
    setProfileData(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateMyProfile({
        name:      profileData.name      || undefined,
        phone:     profileData.phone     || undefined,
        birthdate: profileData.birthdate || undefined,
      });
      setProfileData({
        name:      updated.name      ?? "",
        email:     updated.email     ?? "",
        phone:     updated.phone     ?? "",
        birthdate: updated.birthdate ?? "",
        role:      updated.role      ?? "user",
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const roleLabel: Record<string, string> = { user: 'Usuária', pro: 'Pro', admin: 'Admin' };

  const initials = profileData.name
    .split(" ").slice(0, 2)
    .map((w: string) => w[0]).join("").toUpperCase() || "?";

  const inp = `w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all border-2 border-transparent
    focus:border-[${currentTheme.colors.primary}]`;


  return (
    <div
      className="flex-1"
      style={{ background: currentTheme.colors.background, fontFamily: "'Montserrat', sans-serif", display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) clamp(280px,30%,380px)', gap: 20, padding: 'clamp(24px,5vh,48px) clamp(20px,5vw,80px)', flex: 1, alignItems: 'stretch' }}>

        {/* ── COLUNA ESQUERDA ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* BANNER + AVATAR */}
          <div className="rounded-2xl overflow-hidden" style={{ boxShadow: `0 4px 24px ${currentTheme.colors.primary}20` }}>
            <div style={{
              height: 130,
              background: `linear-gradient(135deg, ${currentTheme.colors.primaryDark} 0%, ${currentTheme.colors.primary} 55%, ${currentTheme.colors.accent} 100%)`,
              position: 'relative',
            }}>
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .08 }} viewBox="0 0 400 130" preserveAspectRatio="xMidYMid slice">
                <circle cx="320" cy="-30" r="140" fill="white"/>
                <circle cx="60"  cy="160" r="100" fill="white"/>
              </svg>
            </div>

            <div style={{ background: currentTheme.colors.surface, padding: '0 24px 20px', position: 'relative' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />

              <div style={{ position: 'relative', display: 'inline-block', marginTop: -44 }}>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    style={{
                      width: 88, height: 88, borderRadius: '50%',
                      objectFit: 'cover',
                      border: `4px solid ${currentTheme.colors.surface}`,
                      boxShadow: `0 6px 20px ${currentTheme.colors.primary}30`,
                    }}
                  />
                ) : (
                  <div style={{
                    width: 88, height: 88, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${currentTheme.colors.primaryLight}, ${currentTheme.colors.primary}40)`,
                    border: `4px solid ${currentTheme.colors.surface}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28, fontWeight: 800, color: currentTheme.colors.primaryDark,
                    boxShadow: `0 6px 20px ${currentTheme.colors.primary}30`,
                    letterSpacing: '-1px',
                  }}>
                    {initials}
                  </div>
                )}

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  title="Alterar foto"
                  style={{
                    position: 'absolute', bottom: 2, right: 2,
                    width: 28, height: 28, borderRadius: '50%',
                    background: uploadingAvatar ? currentTheme.colors.textMuted : currentTheme.colors.primary,
                    border: `3px solid ${currentTheme.colors.surface}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
                    transition: 'opacity .2s',
                  }}
                  onMouseEnter={e => { if (!uploadingAvatar) e.currentTarget.style.opacity = '.85'; }}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  <Camera size={12} color="white" />
                </button>
              </div>

              <div className="flex items-start justify-between mt-2">
                <div>
                  <h2 style={{ fontSize: 19, fontWeight: 700, color: currentTheme.colors.text, marginBottom: 2 }}>
                    {profileData.name}
                  </h2>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '4px 11px', borderRadius: 99,
                  background: currentTheme.colors.primaryLight,
                  fontSize: 11, fontWeight: 600, color: currentTheme.colors.primaryDark,
                  marginTop: 4,
                }}>
                  <ShieldCheck size={12} />
                  {roleLabel[profileData.role] ?? 'Usuária'}
                </div>
              </div>
            </div>
          </div>

          {/* FORMULÁRIO */}
          <div className="rounded-2xl p-5 flex-1" style={{
            background: currentTheme.colors.surface,
            boxShadow: `0 4px 24px ${currentTheme.colors.primaryDark}18`,
          }}>
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ fontSize: 15, fontWeight: 700, color: currentTheme.colors.text, display: 'flex', alignItems: 'center', gap: 7 }}>
                <User size={16} color={currentTheme.colors.primary} />
                Informações Pessoais
              </h3>
              <button
                onClick={() => setEditing(e => !e)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 12px', borderRadius: 99,
                  background: editing ? currentTheme.colors.primaryLight : 'transparent',
                  border: `1.5px solid ${currentTheme.colors.primary}40`,
                  fontSize: 11, fontWeight: 600, color: currentTheme.colors.primaryDark,
                  cursor: 'pointer', transition: 'all .2s',
                }}
              >
                <Edit3 size={12} />
                {editing ? 'Editando' : 'Editar'}
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nome Completo" icon={<User size={13}/>} color={currentTheme.colors}>
                  <input
                    type="text" value={profileData.name} disabled={!editing}
                    onChange={e => handleChange("name", e.target.value)}
                    className={inp}
                    style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text, opacity: editing ? 1 : .75 }}
                    onFocus={e => (e.target.style.borderColor = currentTheme.colors.primary)}
                    onBlur={e  => (e.target.style.borderColor = "transparent")}
                  />
                </Field>
                <Field label="E-mail" icon={<Mail size={13}/>} color={currentTheme.colors}>
                  <input
                    type="email" value={profileData.email} disabled
                    className={inp}
                    style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text, opacity: .6, cursor: 'not-allowed' }}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Telefone" icon={<Phone size={13}/>} color={currentTheme.colors}>
                  <input
                    type="tel" value={profileData.phone} disabled={!editing}
                    onChange={e => handleChange("phone", e.target.value)}
                    className={inp}
                    style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text, opacity: editing ? 1 : .75 }}
                    onFocus={e => (e.target.style.borderColor = currentTheme.colors.primary)}
                    onBlur={e  => (e.target.style.borderColor = "transparent")}
                  />
                </Field>
                <Field label="Data de Nascimento" icon={<Calendar size={13}/>} color={currentTheme.colors}>
                  <input
                    type="date" value={profileData.birthdate} disabled={!editing}
                    onChange={e => handleChange("birthdate", e.target.value)}
                    className={inp}
                    style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text, opacity: editing ? 1 : .75 }}
                    onFocus={e => (e.target.style.borderColor = currentTheme.colors.primary)}
                    onBlur={e  => (e.target.style.borderColor = "transparent")}
                  />
                </Field>
              </div>

              {editing && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '10px 24px', borderRadius: 99,
                      background: `linear-gradient(135deg, ${currentTheme.colors.primaryDark}, ${currentTheme.colors.primary})`,
                      color: 'white', fontSize: 13, fontWeight: 600,
                      border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.7 : 1,
                      boxShadow: `0 6px 18px ${currentTheme.colors.primary}40`,
                      transition: 'transform .2s, box-shadow .2s',
                    }}
                    onMouseEnter={e => { if (!saving) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 10px 24px ${currentTheme.colors.primary}55`; }}}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 6px 18px ${currentTheme.colors.primary}40`; }}
                  >
                    <Save size={14} />
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── COLUNA DIREITA: SELETOR DE TEMA ── */}
        <div style={{
          borderRadius: 16, padding: 20,
          background: currentTheme.colors.surface,
          boxShadow: `0 4px 24px ${currentTheme.colors.primaryDark}18`,
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: currentTheme.colors.text, display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
            <Palette size={16} color={currentTheme.colors.primary} />
            Temas
          </h3>
          <div className="grid grid-cols-2 gap-2" style={{ alignItems: 'stretch' }}>
            {themes.map(theme => (
              <button
                key={theme.id}
                onClick={() => setTheme(theme.id)}
                style={{
                  padding: '12px 8px', borderRadius: 14,
                  border: `2px solid ${currentTheme.id === theme.id ? currentTheme.colors.primary : 'transparent'}`,
                  background: theme.colors.primaryLight,
                  cursor: 'pointer', transition: 'all .22s',
                  transform: currentTheme.id === theme.id ? 'scale(1.04)' : 'scale(1)',
                  boxShadow: currentTheme.id === theme.id ? `0 4px 16px ${theme.colors.primary}30` : 'none',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}
                onMouseEnter={e => { if (currentTheme.id !== theme.id) e.currentTarget.style.transform = 'scale(1.03)'; }}
                onMouseLeave={e => { if (currentTheme.id !== theme.id) e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'center', color: theme.colors.primaryDark }}>{THEME_ICONS[theme.id]}</div>
                <p style={{ fontSize: 11, fontWeight: 700, color: theme.colors.primaryDark, marginBottom: 1 }}>{theme.name}</p>
                <p style={{ fontSize: 9, color: theme.colors.primaryDark, opacity: 0.6, marginBottom: 6 }}>{theme.category}</p>
                <div style={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
                  {[theme.colors.primary, theme.colors.accent, theme.colors.primaryDark].map((c, i) => (
                    <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function Field({ label, icon, children, color }: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  color: any;
}) {
  return (
    <div>
      <label style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.07em', color: color.textMuted, marginBottom: 7,
      }}>
        <span style={{ color: color.primary }}>{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}
