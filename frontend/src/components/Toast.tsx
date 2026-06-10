import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  title: string;
  message?: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (title: string, message?: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const { currentTheme } = useTheme();

  const toast = useCallback((title: string, message?: string, type: ToastType = "success") => {
    const id = ++nextId;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const dismiss = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  const iconMap = {
    success: <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: currentTheme.colors.primary }} />,
    error:   <XCircle    className="w-5 h-5 flex-shrink-0" style={{ color: "#EF4444" }} />,
    info:    <Info       className="w-5 h-5 flex-shrink-0" style={{ color: currentTheme.colors.accent }} />,
  };

  const accentMap = {
    success: currentTheme.colors.primary,
    error:   "#EF4444",
    info:    currentTheme.colors.accent,
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Container fixo no canto inferior direito */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          pointerEvents: "none",
        }}
      >
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              pointerEvents: "auto",
              background: currentTheme.colors.surface,
              borderRadius: 16,
              padding: "14px 16px",
              minWidth: 280,
              maxWidth: 360,
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              borderLeft: `4px solid ${accentMap[t.type]}`,
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              animation: "toast-in 0.28s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            {iconMap[t.type]}

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: currentTheme.colors.text, marginBottom: t.message ? 2 : 0 }}>
                {t.title}
              </p>
              {t.message && (
                <p style={{ fontSize: 13, color: currentTheme.colors.textMuted, lineHeight: 1.4 }}>
                  {t.message}
                </p>
              )}
            </div>

            <button
              onClick={() => dismiss(t.id)}
              style={{ color: currentTheme.colors.textMuted, opacity: 0.6, flexShrink: 0, marginTop: 1 }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "0.6")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(16px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
