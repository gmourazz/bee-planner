// src/pages/LoginPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Eye, EyeOff, AlertTriangle, CheckCircle2,
  Loader2, Sparkles, Phone, ArrowRight, LogIn,
} from 'lucide-react';
import { DatePickerInput } from '../components/DatePickerInput';

const loginTheme = {
  colors: {
    primary:      '#E8799A',
    primaryLight: '#FFF0EC',
    primaryDark:  '#C45880',
    text:         '#3D2B2B',
    textMuted:    '#9B7575',
    surface:      '#FFFFFF',
  },
};

type Tab  = 'login' | 'register';
type Step = 1 | 2 | 3;

const STR_BARS   = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];
const STR_TEXT   = ['', 'text-red-400', 'text-orange-400', 'text-yellow-500', 'text-green-600'];
const STR_LABELS = ['', 'Muito fraca', 'Fraca', 'Boa', 'Forte'];

const FEATURES = [
  ['📅', 'Vista sua semana toda de um jeito visual'],
  ['🌱', 'Acompanhe seus hábitos diários'],
  ['⭐', 'Nunca esqueça uma data importante'],
  ['🎨', '9 temas únicos pra personalizar'],
] as const;

const inp     = 'w-full px-4 py-3 rounded-xl border border-[#F5D5DC] bg-[#FFF0EC] text-[#3D2B2B] text-sm placeholder:text-[#C4A0A8] focus:outline-none focus:border-[#E8799A] focus:ring-2 focus:ring-[#E8799A]/20 transition-all';
const btn     = 'w-full py-3.5 rounded-xl bg-gradient-to-r from-[#E8799A] to-[#C45880] text-white text-sm font-semibold hover:opacity-90 active:scale-[.98] disabled:opacity-60 transition-all shadow-[0_4px_16px_rgba(232,121,154,.3)]';
const btnFlex = 'flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#E8799A] to-[#C45880] text-white text-sm font-semibold hover:opacity-90 active:scale-[.98] disabled:opacity-60 transition-all shadow-[0_4px_16px_rgba(232,121,154,.3)]';
const lbl     = 'block text-[11px] font-semibold uppercase tracking-widest text-[#9B7575] mb-1.5';

interface LoginProps {
  onLogin?: () => void;
}

export function LoginPage({ onLogin }: LoginProps) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { signIn, signUp } = useAuth();

  const [tab,     setTab]     = useState<Tab>(params.get('mode') === 'register' ? 'register' : 'login');
  const [step,    setStep]    = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [info,    setInfo]    = useState('');

  // Campos login
  const [lEmail, setLEmail] = useState('');
  const [lPass,  setLPass]  = useState('');
  const [showLP, setShowLP] = useState(false);

  // Campos cadastro
  const [rName,    setRName]    = useState('');
  const [rEmail,   setREmail]   = useState('');
  const [rBirth,   setRBirth]   = useState('');
  const [rPhone,   setRPhone]   = useState('');
  const [rPass,    setRPass]    = useState('');
  const [rConfirm, setRConfirm] = useState('');
  const [showRP,   setShowRP]   = useState(false);
  const [strength, setStrength] = useState(0);

  const clear = () => { setError(''); setInfo(''); };

  useEffect(() => {
    setTab(params.get('mode') === 'register' ? 'register' : 'login');
    setStep(1);
    clear();
  }, [params.get('mode')]);

  // ── LOGIN ──
  async function doLogin() {
    clear();
    if (!lEmail || !lPass) { setError('Preencha e-mail e senha.'); return; }
    setLoading(true);
    try {
      await signIn(lEmail, lPass);
      // AuthContext atualiza o user → App.tsx redireciona automaticamente
    } catch (e: any) {
      setError('E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  }

  // ── VALIDAÇÕES CADASTRO ──
  function next1() {
    clear();
    if (!rName.trim())                         { setError('Digite seu nome.'); return; }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(rEmail)) { setError('E-mail inválido.'); return; }
    if (!rBirth)                               { setError('Digite sua data de nascimento.'); return; }
    setStep(2);
  }

  function next2() {
    clear();
    if (rPass.length < 8)                  { setError('Mínimo 8 caracteres.'); return; }
    if (!/[A-Z]/.test(rPass))              { setError('Pelo menos 1 letra maiúscula.'); return; }
    if (!/[a-z]/.test(rPass))              { setError('Pelo menos 1 letra minúscula.'); return; }
    if (!/[0-9]/.test(rPass))              { setError('Pelo menos 1 número.'); return; }
    if (!/[!@#$%&*()_\-+=?]/.test(rPass)) { setError('Pelo menos 1 caractere especial (!@#$%&*()_-+=?).'); return; }
    if (rPass !== rConfirm)                { setError('As senhas não coincidem.'); return; }
    setStep(3);
  }

  // ── CADASTRO + login automático ──
  async function doRegister() {
    clear();
    setLoading(true);
    try {
      const temSessao = await signUp(rEmail, rPass, rName, rPhone || undefined, rBirth || undefined);
      if (!temSessao) {
        // signUp não retornou sessão — tenta signIn como fallback
        await signIn(rEmail, rPass);
      }
      setLoading(false);
      navigate('/inicio');
    } catch (e: any) {
      setError(e.message ?? 'Erro ao criar conta.');
      setStep(1);
      setLoading(false);
    }
  }

  function calcStrength(v: string) {
    let s = 0;
    if (v.length >= 8)               s++;
    if (/[A-Z]/.test(v))             s++;
    if (/[a-z]/.test(v))             s++;
    if (/[0-9]/.test(v))             s++;
    if (/[!@#$%&*()_\-+=?]/.test(v)) s++;
    setStrength(Math.min(s, 4));
  }

  function switchTab(t: Tab) {
    setTab(t);
    setStep(1);
    clear();
    navigate(t === 'register' ? '/login?mode=register' : '/login', { replace: true });
  }

  return (
    <div className="min-h-screen flex bg-[#FFF8F5] text-[#3D2B2B]"
      style={{ fontFamily: "'Montserrat', sans-serif" }}>

      {/* ── PAINEL ESQUERDO ── */}
      <aside className="hidden lg:flex w-[440px] min-w-[440px] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #E8799A 0%, #C45880 55%, #D4A060 100%)' }}>

        <span className="absolute top-[14%] right-8 text-4xl pointer-events-none select-none"
          style={{ animation: 'float 5s ease-in-out infinite' }}>🐝</span>
        <span className="absolute bottom-[26%] left-5 text-2xl pointer-events-none select-none"
          style={{ animation: 'float 7s ease-in-out infinite 2s' }}>🌸</span>
        <span className="absolute bottom-[14%] right-16 text-xl pointer-events-none select-none"
          style={{ animation: 'float 6s ease-in-out infinite 4s' }}>✨</span>

        <a href="/" className="flex items-center gap-3 no-underline">
          <span className="text-3xl inline-block"
            style={{ animation: 'beePulse 4s ease-in-out infinite' }}>🐝</span>
          <span className="text-[26px] italic text-white leading-none"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Beeplanner</span>
        </a>

        <div className="flex-1 flex flex-col justify-center py-10">
          <h2 className="text-[42px] italic text-white leading-[1.1] mb-4"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            Organize sua vida<br />com doçura 🍯
          </h2>
          <p className="text-[15px] text-white/75 leading-[1.75] font-light max-w-[290px] mb-8">
            Um planner bonito e completo pra quem quer mais leveza no dia a dia.
          </p>
          <div className="flex flex-col gap-3">
            {FEATURES.map(([icon, text]) => (
              <div key={text} className="flex items-center gap-3 text-white/90 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm shrink-0">
                  {icon}
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/40">🐝 Beeplanner · Feito com carinho</p>

        <style>{`
          @keyframes beePulse { 0%,100%{transform:scale(1) rotate(-4deg)} 50%{transform:scale(1.07) rotate(4deg)} }
          @keyframes float    { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-14px) rotate(3deg)} }
        `}</style>
      </aside>

      {/* ── PAINEL DIREITO ── */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-10 overflow-y-auto">
        <div className="w-full max-w-[420px]">

          <button onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-[#9B7575] hover:text-[#3D2B2B] transition-colors mb-6 group">
            <span className="group-hover:-translate-x-0.5 transition-transform inline-block">←</span>
            Voltar ao início
          </button>

          <h1 className="text-[32px] italic leading-tight mb-1 flex items-center gap-2"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            {tab === 'login'
              ? <><span>Bem-vinda de volta</span><Sparkles size={26} className="text-[#E8799A] shrink-0" /></>
              : <><span>Criar sua conta</span><LogIn size={24} className="text-[#E8799A] shrink-0" /></>}
          </h1>
          <p className="text-sm text-[#9B7575] mt-1.5 mb-6 font-light">
            {tab === 'login' ? 'Entre na sua conta para continuar' : 'Preencha os dados abaixo para começar'}
          </p>

          {/* Tabs */}
          <div className="flex bg-[#FFF0EC] border border-[#F5D5DC] rounded-xl p-1 gap-1 mb-5">
            {(['login', 'register'] as Tab[]).map(t => (
              <button key={t} onClick={() => switchTab(t)}
                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  tab === t ? 'bg-white text-[#3D2B2B] shadow-sm' : 'text-[#9B7575] hover:text-[#3D2B2B]'
                }`}>
                {t === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          {/* Alertas */}
          {error && (
            <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl border border-red-200 bg-red-50 text-red-500 text-sm mb-4">
              <AlertTriangle size={14} className="shrink-0" /> {error}
            </div>
          )}
          {info && (
            <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl border border-green-200 bg-green-50 text-green-600 text-sm mb-4">
              <CheckCircle2 size={14} className="shrink-0" /> {info}
            </div>
          )}

          {/* ════════ LOGIN ════════ */}
          {tab === 'login' && (
            <div className="flex flex-col gap-3.5">
              <div>
                <span className={lbl}>E-mail</span>
                <input className={inp} type="email" placeholder="seu@email.com"
                  value={lEmail} onChange={e => setLEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && doLogin()}
                  autoComplete="email" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-[#9B7575]">Senha</span>
                  <button type="button"
                    onClick={() => setInfo('Recuperação de senha disponível em breve 🔐')}
                    className="text-[11px] font-semibold text-[#E8799A] hover:text-[#C45880] transition-colors">
                    Esqueceu?
                  </button>
                </div>
                <div className="relative">
                  <input className={`${inp} pr-11`}
                    type={showLP ? 'text' : 'password'} placeholder="••••••••"
                    value={lPass} onChange={e => setLPass(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && doLogin()}
                    autoComplete="current-password" />
                  <button type="button" onClick={() => setShowLP(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B7575] hover:text-[#3D2B2B] transition-colors">
                    {showLP ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button onClick={doLogin} disabled={loading} className={`${btn} mt-1 flex items-center justify-center gap-2`}>
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> Entrando...</>
                  : <><span>Entrar</span><Sparkles size={15} /></>}
              </button>

              <p className="text-center text-xs text-[#9B7575] mt-1">
                Não tem conta?{' '}
                <button onClick={() => switchTab('register')}
                  className="text-[#E8799A] font-semibold hover:text-[#C45880] transition-colors">
                  Criar agora →
                </button>
              </p>
            </div>
          )}

          {/* ════════ CADASTRO ════════ */}
          {tab === 'register' && (
            <div>
              {/* Progresso */}
              <div className="flex items-center gap-2 mb-5">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-2 rounded-full transition-all duration-300 ${
                    step > i ? 'w-2 bg-green-500' : step === i ? 'w-6 bg-[#E8799A]' : 'w-2 bg-[#F5D5DC]'
                  }`} />
                ))}
                <span className="ml-2 text-xs text-[#9B7575]">Passo {step} de 3</span>
              </div>

              {/* Passo 1 */}
              {step === 1 && (
                <div className="flex flex-col gap-3.5">
                  <div>
                    <span className={lbl}>Nome completo</span>
                    <input className={inp} type="text" placeholder="Seu nome..."
                      value={rName} onChange={e => setRName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && next1()}
                      autoComplete="name" />
                  </div>
                  <div>
                    <span className={lbl}>E-mail</span>
                    <input className={inp} type="email" placeholder="seu@email.com"
                      value={rEmail} onChange={e => setREmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && next1()}
                      autoComplete="email" />
                  </div>
                  <div>
                    <span className={lbl}>Data de nascimento</span>
                    <DatePickerInput
                      value={rBirth}
                      onChange={setRBirth}
                      placeholder="Selecionar data"
                      theme={loginTheme}
                    />
                  </div>
                  <div>
                    <span className={lbl}>
                      Telefone{' '}
                      <span className="normal-case tracking-normal font-normal text-[#C4A0A8]">(opcional)</span>
                    </span>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C4A0A8] pointer-events-none" />
                      <input className={`${inp} pl-10`} type="tel" placeholder="(11) 99999-9999"
                        value={rPhone} onChange={e => setRPhone(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && next1()}
                        autoComplete="tel" />
                    </div>
                  </div>
                  <button onClick={next1} className={`${btn} mt-1 flex items-center justify-center gap-2`}>
                    <span>Próximo</span><ArrowRight size={15} />
                  </button>
                  <p className="text-center text-xs text-[#9B7575]">
                    Já tem conta?{' '}
                    <button onClick={() => switchTab('login')}
                      className="text-[#E8799A] font-semibold hover:text-[#C45880] transition-colors">
                      Entrar →
                    </button>
                  </p>
                </div>
              )}

              {/* Passo 2 */}
              {step === 2 && (
                <div className="flex flex-col gap-3.5">
                  <div>
                    <span className={lbl}>Criar senha</span>
                    <div className="relative">
                      <input className={`${inp} pr-11`}
                        type={showRP ? 'text' : 'password'} placeholder="Mínimo 8 caracteres"
                        value={rPass}
                        onChange={e => { setRPass(e.target.value); calcStrength(e.target.value); }}
                        onKeyDown={e => e.key === 'Enter' && next2()}
                        autoComplete="new-password" />
                      <button type="button" onClick={() => setShowRP(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B7575] hover:text-[#3D2B2B] transition-colors">
                        {showRP ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    {rPass && (
                      <div className="mt-2">
                        <div className="h-1.5 rounded-full bg-[#F5D5DC] overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-300 ${STR_BARS[strength]}`}
                            style={{ width: `${strength * 25}%` }} />
                        </div>
                        <p className={`text-[11px] mt-1 ${STR_TEXT[strength]}`}>{STR_LABELS[strength]}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <span className={lbl}>Confirmar senha</span>
                    <input className={inp} type="password" placeholder="Repita a senha"
                      value={rConfirm} onChange={e => setRConfirm(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && next2()}
                      autoComplete="new-password" />
                  </div>
                  <div className="flex gap-2.5 mt-1">
                    <button onClick={() => { setStep(1); clear(); }}
                      className="px-5 py-3.5 rounded-xl border border-[#F5D5DC] bg-[#FFF0EC] text-[#9B7575] text-sm font-medium hover:bg-[#F5D5DC] transition-all shrink-0">
                      ← Voltar
                    </button>
                    <button onClick={next2} className={btnFlex}>Próximo →</button>
                  </div>
                </div>
              )}

              {/* Passo 3 */}
              {step === 3 && (
                <div className="text-center py-4">
                  <CheckCircle2 size={60} className="text-[#E8799A] mx-auto" strokeWidth={1.5} />
                  <h3 className="text-2xl italic text-[#3D2B2B] mt-4 mb-2 flex items-center justify-center gap-2"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                    Tudo pronto! <Sparkles size={20} className="text-[#E8799A]" />
                  </h3>
                  <p className="text-sm text-[#9B7575] mb-1">
                    Seja bem-vinda, <strong className="text-[#3D2B2B]">{rName.split(' ')[0]}</strong>!
                  </p>
                  <p className="text-xs text-[#9B7575] mb-6">{rEmail}</p>
                  <button onClick={doRegister} disabled={loading} className={`${btn} flex items-center justify-center gap-2`}>
                    {loading
                      ? <><Loader2 size={15} className="animate-spin" /> Criando sua conta...</>
                      : <><span>Entrar no Beeplanner</span><ArrowRight size={15} /></>}
                  </button>
                  <button onClick={() => { setStep(2); clear(); }}
                    className="mt-3 w-full text-xs text-[#9B7575] hover:text-[#3D2B2B] transition-colors py-1">
                    ← Corrigir senha
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
