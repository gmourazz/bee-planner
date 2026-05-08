import {
  Camera,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Palette,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

export function ProfilePage() {
  const { currentTheme, themes, setTheme } = useTheme();
  const [profileData, setProfileData] = useState({
    name: "Demo User",
    email: "demo@gmail.com",
    phone: "+55 (11) 99999-9999",
    location: "São Paulo, SP",
    birthdate: "1998-05-15",
    bio: "Estudante de Ciência da Computação apaixonada por tecnologia e produtividade 🚀",
  });

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border-2 border-transparent outline-none transition-all";

  return (
    <div className="flex-1 overflow-auto p-6" style={{ background: currentTheme.colors.background }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1
          className="font-display mb-8 text-[40px] font-bold"
          style={{ color: currentTheme.colors.text }}
        >
          Meu Perfil
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Picture Card */}
          <div className="lg:col-span-1">
            <div
              className="rounded-2xl p-6 text-center"
              style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}
            >
              <div className="relative inline-block mb-4">
                <div
                  className="w-32 h-32 rounded-full flex items-center justify-center text-6xl"
                  style={{ background: currentTheme.colors.primaryLight }}
                >
                  👤
                </div>
                <button
                  className="absolute bottom-0 right-0 w-10 h-10 rounded-full text-white flex items-center justify-center hover:opacity-90 transition-all"
                  style={{ background: currentTheme.colors.primary }}
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>
              <h2
                className="font-display mb-1 text-2xl font-semibold"
                style={{ color: currentTheme.colors.text }}
              >
                {profileData.name}
              </h2>
              <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>
                {profileData.email}
              </p>
            </div>
          </div>

          {/* Profile Info Card */}
          <div className="lg:col-span-2">
            <div
              className="rounded-2xl p-6"
              style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}
            >
              <h3
                className="font-display mb-6 text-[22px] font-semibold"
                style={{ color: currentTheme.colors.text }}
              >
                Informações Pessoais
              </h3>

              <div className="space-y-4">
                {[
                  { field: "name", label: "Nome Completo", type: "text", icon: <User className="w-4 h-4" />, value: profileData.name },
                  { field: "email", label: "Email", type: "email", icon: <Mail className="w-4 h-4" />, value: profileData.email },
                  { field: "location", label: "Localização", type: "text", icon: <MapPin className="w-4 h-4" />, value: profileData.location },
                ].map(({ field, label, type, icon, value }) => (
                  <div key={field}>
                    <label
                      className="flex items-center gap-2 mb-2 text-sm font-medium"
                      style={{ color: currentTheme.colors.text }}
                    >
                      {icon}
                      {label}
                    </label>
                    <input
                      type={type}
                      value={value}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      className={inputClass}
                      style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }}
                      onFocus={(e) => (e.target.style.borderColor = currentTheme.colors.primary)}
                      onBlur={(e) => (e.target.style.borderColor = "transparent")}
                    />
                  </div>
                ))}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="flex items-center gap-2 mb-2 text-sm font-medium"
                      style={{ color: currentTheme.colors.text }}
                    >
                      <Phone className="w-4 h-4" />
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className={inputClass}
                      style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }}
                      onFocus={(e) => (e.target.style.borderColor = currentTheme.colors.primary)}
                      onBlur={(e) => (e.target.style.borderColor = "transparent")}
                    />
                  </div>
                  <div>
                    <label
                      className="flex items-center gap-2 mb-2 text-sm font-medium"
                      style={{ color: currentTheme.colors.text }}
                    >
                      <Calendar className="w-4 h-4" />
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      value={profileData.birthdate}
                      onChange={(e) => handleInputChange("birthdate", e.target.value)}
                      className={inputClass}
                      style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }}
                      onFocus={(e) => (e.target.style.borderColor = currentTheme.colors.primary)}
                      onBlur={(e) => (e.target.style.borderColor = "transparent")}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="flex items-center gap-2 mb-2 text-sm font-medium"
                    style={{ color: currentTheme.colors.text }}
                  >
                    Bio
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    rows={3}
                    className={`${inputClass} resize-none`}
                    style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }}
                    onFocus={(e) => (e.target.style.borderColor = currentTheme.colors.primary)}
                    onBlur={(e) => (e.target.style.borderColor = "transparent")}
                  />
                </div>

                <button
                  className="px-6 py-3 rounded-full text-white flex items-center gap-2 hover:opacity-90 transition-all"
                  style={{ background: currentTheme.colors.primary }}
                >
                  <Save className="w-5 h-5" />
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Selector */}
        <div
          className="mt-6 rounded-2xl p-6"
          style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}15` }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Palette className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
            <h3
              className="font-display text-[22px] font-semibold"
              style={{ color: currentTheme.colors.text }}
            >
              Temas Disponíveis
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setTheme(theme.id)}
                className="p-4 rounded-xl border-2 transition-all hover:scale-105"
                style={{
                  borderColor: currentTheme.id === theme.id ? currentTheme.colors.primary : "transparent",
                  background: theme.colors.primaryLight,
                }}
              >
                <div className="text-4xl mb-2">{theme.emoji}</div>
                <p
                  className="font-montserrat mb-1 text-sm font-semibold"
                  style={{ color: theme.colors.text }}
                >
                  {theme.name}
                </p>
                <p className="text-[11px]" style={{ color: theme.colors.textMuted }}>
                  {theme.category}
                </p>
                <div className="flex gap-1 mt-2">
                  <div className="w-4 h-4 rounded-full" style={{ background: theme.colors.primary }} />
                  <div className="w-4 h-4 rounded-full" style={{ background: theme.colors.accent }} />
                  <div className="w-4 h-4 rounded-full" style={{ background: theme.colors.primaryDark }} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
