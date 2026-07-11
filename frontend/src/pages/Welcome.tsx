import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  CalendarDays, FolderOpen, Sprout, Star,
  Laptop, Stethoscope, HeartPulse,
  Palette, Scale, GraduationCap, BarChart2, Dumbbell,
  Sparkles, Shield, Target, TrendingUp, ArrowRight, Heart,
  Home, BarChart3, Zap, MapPin, StickyNote,
  BookOpen, Award, DollarSign,
} from 'lucide-react';

interface WelcomeProps {
  onLoginClick:  () => void;
  onGetStarted:  () => void;
}

const FEATURES: [React.ReactNode, string, string][] = [
  [<Home       size={22}/>, 'Início',        'Visão geral do seu dia — resumo de hábitos, tarefas e próximos eventos num só lugar.'],
  [<BarChart3  size={22}/>, 'Analytics',     'Gráficos de produtividade que mostram seu progresso ao longo do tempo.'],
  [<CalendarDays size={22}/>, 'Semana',      'Grid visual da semana. Adicione tarefas e defina prioridades com cores.'],
  [<Zap        size={22}/>, 'Hábitos',       'Rastreie hábitos diários com marcação dos últimos 7 dias e streaks.'],
  [<MapPin     size={22}/>, 'Datas',         'Aniversários, formaturas e eventos — nunca mais esqueça uma data especial.'],
  [<StickyNote size={22}/>, 'Notas',         'Páginas e pastas para anotar tudo. Como o Notion, mas mais fofo.'],
  [<BookOpen   size={22}/>, 'Livros',        'Registre leituras, avalie e acompanhe seu progresso de leitura.'],
  [<Award      size={22}/>, 'Cursos',        'Organize cursos online, aulas e certificações em um só lugar.'],
  [<GraduationCap size={22}/>, 'Universitário', 'Gerencie matérias, provas, trabalhos e seu cronograma acadêmico.'],
  [<DollarSign size={22}/>, 'Finanças',      'Controle receitas, despesas e veja para onde seu dinheiro vai.'],
  [<Heart      size={22}/>, 'Saúde',         'Registre hábitos de saúde, hidratação, sono e bem-estar.'],
  [<Target     size={22}/>, 'Metas',         'Defina objetivos, acompanhe o progresso e celebre conquistas.'],
];

const APP_THEMES = [
  { Icon: Laptop,        label: 'TI & Tech',   color: '#3B82F6' },
  { Icon: Stethoscope,   label: 'Veterinário', color: '#10B981' },
  { Icon: HeartPulse,    label: 'Médico',      color: '#EF4444' },
  { Icon: Palette,       label: 'Designer',    color: '#8B5CF6' },
  { Icon: Scale,         label: 'Advogado',    color: '#0F172A' },
  { Icon: GraduationCap, label: 'Estudante',   color: '#F59E0B' },
  { Icon: BarChart2,     label: 'Dados',       color: '#06B6D4' },
  { Icon: Dumbbell,      label: 'Fitness',     color: '#14B8A6' },
];

const STRIP_ITEMS: [React.ReactNode, string][] = [
  [<Sparkles   size={13}/>, '100% gratuito'            ],
  [<Shield     size={13}/>, 'Dados protegidos'         ],
  [<Palette    size={13}/>, 'Temas por profissão'      ],
  [<CalendarDays size={13}/>, 'Semana & mês visual'    ],
  [<Sprout     size={13}/>, 'Rastreador de hábitos'    ],
  [<FolderOpen size={13}/>, 'Notas & Pastas'           ],
  [<Star       size={13}/>, 'Datas importantes'        ],
  [<Target     size={13}/>, 'Metas & objetivos'        ],
  [<TrendingUp size={13}/>, 'Acompanhe seu progresso'  ],
];

const BEE_PILLARS = [
  {
    emoji: '🐝',
    title: 'Organização natural',
    desc: 'Abelhas nunca esquecem uma tarefa. Cada uma sabe exatamente o que fazer, quando fazer e por quê. O BeePlanner te dá essa clareza.',
  },
  {
    emoji: '🍯',
    title: 'Tudo no lugar certo',
    desc: 'Numa colmeia, cada célula tem sua função. Aqui, cada módulo é uma célula: hábitos, finanças, estudos, metas — organizados e ao alcance.',
  },
  {
    emoji: '🌸',
    title: 'Fluxo sem esforço',
    desc: 'A colmeia funciona em harmonia perfeita — sem atrito, sem caos. O app é bonito e rápido pra que organizar a vida seja prazeroso, não uma tarefa.',
  },
];

export default function Welcome({ onLoginClick, onGetStarted }: WelcomeProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const calRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const now = new Date();
    for (let i = 1; i <= 5; i++) {
      const el = document.getElementById('ld' + i);
      if (el) {
        const d = new Date(now);
        d.setDate(now.getDate() - now.getDay() + i);
        el.textContent = String(d.getDate());
      }
    }
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).style.opacity = '1';
          (e.target as HTMLElement).style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.12 });
    els.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = 'opacity .6s ease, transform .6s ease';
      obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif", background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden', paddingTop: 72 }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 60px',
        backdropFilter: 'blur(24px) saturate(180%)',
        background: 'rgba(255,248,245,.9)',
        borderBottom: '1px solid rgba(244,165,184,.2)',
        boxShadow: '0 1px 24px rgba(244,165,184,.1)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: 'linear-gradient(135deg, #F9C8D6, #F0A0BC)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, boxShadow: '0 2px 10px rgba(244,165,184,.4)',
            animation: 'beePulse 4s ease-in-out infinite',
          }}>🐝</div>
          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontStyle: 'italic', fontWeight: 600, color: 'var(--primary-dark)', letterSpacing: '-.2px' }}>
            Beeplanner
          </span>
        </div>

        {/* Botões */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user ? (
            <button onClick={() => navigate('/inicio')} style={navBtnStyle(true)}>
              Ir para o app →
            </button>
          ) : (
            <>
              <button onClick={onLoginClick} style={navBtnStyle(false)}>Entrar</button>
              <button onClick={onGetStarted} style={navBtnStyle(true)}>Começar grátis →</button>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '92vh', display: 'flex', alignItems: 'center',
        padding: '80px 60px 60px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 55% 45% at 80% 25%, rgba(244,165,184,.22) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 15% 80%, rgba(249,199,132,.14) 0%, transparent 55%)',
        }}/>

        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 60, alignItems: 'center', position: 'relative', zIndex: 1, width: '100%' }}>

          {/* Left */}
          <div className="reveal">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '5px 14px 5px 10px',
              background: 'rgba(244,165,184,.12)', border: '1px solid rgba(244,165,184,.35)',
              borderRadius: 99, fontSize: 13, color: 'var(--primary-dark)', fontWeight: 500, marginBottom: 26,
              animation: 'badgePulse 2.8s ease-in-out infinite',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary-dark)', display: 'inline-block', animation: 'blink 2.5s ease-in-out infinite' }}/>
              Inspirado nas criaturas mais organizadas da natureza
            </div>

            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(50px, 5.5vw, 78px)',
              fontWeight: 400, lineHeight: 1.04, letterSpacing: '-.5px', marginBottom: 22,
            }}>
              Tudo em 🍯<br/>
              <em style={{ color: 'var(--primary-dark)', fontStyle: 'italic' }}>um só lugar</em>
            </h1>

            <p style={{ fontSize: 17, color: 'var(--muted)', lineHeight: 1.78, marginBottom: 14, maxWidth: 430, fontWeight: 300 }}>
              Abelhas são as criaturas mais organizadas da natureza cada uma sabe sua tarefa, segue seu ritmo e contribui para o todo.
            </p>
            <p style={{ fontSize: 17, color: 'var(--muted)', lineHeight: 1.78, marginBottom: 38, maxWidth: 430, fontWeight: 300 }}>
              O <strong style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>BeePlanner</strong> é o seu favo de mel digital: hábitos, metas, finanças, estudos e muito mais tudo organizado, bonito e num só lugar.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
              <button onClick={onGetStarted} style={{ ...navBtnStyle(true), fontSize: 20, padding: '18px 60px', borderRadius: 13 }}>
                Criar conta grátis
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--muted)' }}>
              <div style={{ display: 'flex' }}>
                {['🐝','🌸','✨','🦋'].map((e, i) => (
                  <span key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--accent))', border: '2px solid var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, marginLeft: i ? -8 : 0 }}>{e}</span>
                ))}
              </div>
              Grátis · Sem cartão · Cadastro fácil
            </div>
          </div>

          {/* Right: Calendar mock */}
          <div style={{ position: 'relative' }} className="reveal">
            <span style={{ position: 'absolute', top: -24, right: -10, fontSize: 38, zIndex: 2, animation: 'float 5s ease-in-out infinite', pointerEvents: 'none' }}>🐝</span>
            <span style={{ position: 'absolute', bottom: 20, left: -24, fontSize: 24, zIndex: 2, animation: 'float 7s ease-in-out infinite 1.5s', pointerEvents: 'none' }}>🌸</span>

            <div ref={calRef} style={{
              background: 'var(--surface)', borderRadius: 22,
              border: '1px solid var(--border)', overflow: 'hidden',
              boxShadow: '0 0 0 1px rgba(244,165,184,.06), 0 24px 60px -8px rgba(61,43,43,.14), 0 4px 20px rgba(244,165,184,.12)',
              transform: 'perspective(1000px) rotateY(-3deg) rotateX(1deg)',
              transition: 'transform .4s ease',
            }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'perspective(1000px) rotateY(0) rotateX(0)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'perspective(1000px) rotateY(-3deg) rotateX(1deg)')}
            >
              <div style={{ padding: '13px 18px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,var(--primary),var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🐝</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Minha Semana</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>Beeplanner</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 5 }}>
                  {['#FF5F57','#FFBD2E','#28CA40'].map(c => <span key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c, display: 'block' }}/>)}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(5,1fr)', borderBottom: '1px solid var(--border)' }}>
                <div style={calColH(false)}/>
                {[['Seg','ld1',false],['Ter','ld2',true],['Qua','ld3',false],['Qui','ld4',false],['Sex','ld5',false]].map(([d, id, tod]) => (
                  <div key={id as string} style={calColH(tod as boolean)}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: 'var(--muted)' }}>{d}</span>
                    <span id={id as string} style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: tod ? 'var(--primary-dark)' : 'var(--text)', display: 'block', marginTop: 2 }}/>
                  </div>
                ))}
              </div>

              {[
                { time: '9h',  cols: [null, {t:'☀️ Daily',c:'#F4A5B8'}, null, {t:'🎨 Design',c:'#7EC8E3'}, null] },
                { time: '10h', cols: [{t:'📐 UX',c:'#C3A8F0'}, null, null, null, {t:'1:1 Ana',c:'#A8E6C0'}] },
                { time: '12h', cols: [null, {t:'🍱 Almoço',c:'#F9C784'}, {t:'🍱 Almoço',c:'#F9C784'}, null, null] },
                { time: '14h', cols: [null, null, {t:'💻 Review',c:'#F4A5B8'}, null, {t:'🚀 Deploy',c:'#B56EFF'}] },
              ].map((row, ri) => (
                <div key={ri} style={{ display: 'grid', gridTemplateColumns: '56px repeat(5,1fr)', borderBottom: ri < 3 ? '1px solid var(--border)' : 'none', minHeight: 80 }}>
                  <div style={{ padding: '8px 10px 0', textAlign: 'right', fontSize: 11, color: 'var(--muted)' }}>{row.time}</div>
                  {row.cols.map((chip, ci) => (
                    <div key={ci}>
                      {chip && (
                        <div style={{ margin: '6px 4px', borderRadius: 8, padding: '5px 10px', fontSize: 12, fontWeight: 600, borderLeft: `3px solid ${chip.c}`, background: chip.c + '20', color: 'var(--text)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                          {chip.t}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STRIP ── */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(196,88,128,0.07) 0%, rgba(244,165,184,0.05) 50%, rgba(212,160,96,0.07) 100%)',
        padding: '15px 0', overflow: 'hidden',
        maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', animation: 'stripScroll 34s linear infinite', width: 'max-content', willChange: 'transform' }}>
          {[...Array(3)].flatMap((_, rep) =>
            STRIP_ITEMS.map(([ico, txt], i) => (
              <div key={`${rep}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, whiteSpace: 'nowrap' }}>
                <span style={{ color: 'var(--primary-dark)', display: 'flex', alignItems: 'center' }}>{ico}</span>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>{txt}</span>
                <span style={{ margin: '0 20px', color: 'var(--border)', fontSize: 10 }}>◆</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── POR QUE ABELHAS ── */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '96px 60px 64px' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--primary-dark)', marginBottom: 14 }}>Por que BeePlanner?</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(34px,4vw,52px)', fontStyle: 'italic', lineHeight: 1.1, marginBottom: 18 }}>
            O nome tem um motivo 🐝
          </h2>
          <p style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 560, lineHeight: 1.75, fontWeight: 300, margin: '0 auto' }}>
            Abelhas são as criaturas mais organizadas da natureza. Uma colmeia inteira funciona com zero caos — cada inseto sabe exatamente sua célula, sua missão e seu tempo. É essa energia que o BeePlanner traz pra sua rotina.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
          {BEE_PILLARS.map(({ emoji, title, desc }) => (
            <div key={title} className="reveal" style={{
              padding: '36px 28px',
              borderRadius: 22,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              textAlign: 'center',
              transition: 'all .22s ease',
              cursor: 'default',
            }}
              onMouseEnter={e => Object.assign(e.currentTarget.style, { transform: 'translateY(-6px)', boxShadow: '0 20px 48px var(--shadow)', borderColor: 'var(--primary)' })}
              onMouseLeave={e => Object.assign(e.currentTarget.style, { transform: 'none', boxShadow: 'none', borderColor: 'var(--border)' })}
            >
              <div style={{ fontSize: 40, marginBottom: 16, display: 'block' }}>{emoji}</div>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>{title}</div>
              <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.75, fontWeight: 300 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '16px 60px 96px' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--primary-dark)', marginBottom: 14 }}>Sua colmeia digital</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(36px,4vw,52px)', fontStyle: 'italic', lineHeight: 1.1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            Cada módulo, uma célula <Sparkles size={32} color="var(--primary-dark)" />
          </h2>
          <p style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 500, lineHeight: 1.75, fontWeight: 300, margin: '14px auto 0' }}>
            Como numa colmeia, cada área da sua vida tem seu espaço perfeito — organizado, bonito e sem complicação.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {FEATURES.map(([icon, title, desc]) => (
            <div key={title as string} className="reveal" style={{ padding: 28, borderRadius: 20, border: '1px solid var(--border)', background: 'var(--surface)', transition: 'all .22s ease', cursor: 'default' }}
              onMouseEnter={e => Object.assign(e.currentTarget.style, { transform: 'translateY(-6px)', boxShadow: '0 20px 48px var(--shadow)', borderColor: 'var(--primary)' })}
              onMouseLeave={e => Object.assign(e.currentTarget.style, { transform: 'none', boxShadow: 'none', borderColor: 'var(--border)' })}
            >
              <div style={{ width: 50, height: 50, borderRadius: 14, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, border: '1px solid var(--border)', color: 'var(--primary-dark)' }}>{icon}</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{title}</div>
              <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.7, fontWeight: 300 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TEMAS ── */}
      <div style={{ background: 'var(--surface2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '80px 60px', textAlign: 'center' }}>
        <div className="reveal">
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--primary-dark)', marginBottom: 14 }}>Personalização</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(34px,4vw,50px)', fontStyle: 'italic', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            Temas por profissão <Palette size={30} color="var(--primary-dark)" />
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 16, fontWeight: 300, marginBottom: 48 }}>Cada abelha tem sua colmeia. Você escolhe o seu estilo.</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            {APP_THEMES.map(({ Icon, label, color }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 18px', borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--border)', minWidth: 90, transition: 'all .22s', cursor: 'default' }}
                onMouseEnter={e => Object.assign(e.currentTarget.style, { transform: 'translateY(-4px)', boxShadow: '0 12px 28px var(--shadow)', borderColor: color })}
                onMouseLeave={e => Object.assign(e.currentTarget.style, { transform: 'none', boxShadow: 'none', borderColor: 'var(--border)' })}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={22} color={color} />
                </div>
                <span style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '80px 60px' }}>
        <div className="reveal" style={{ background: 'linear-gradient(135deg, #F9C8D6 0%, #F0A0BC 40%, #E8799A 100%)', borderRadius: 28, padding: '70px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <span style={{ position: 'absolute', right: 60, top: '50%', transform: 'translateY(-50%)', fontSize: 120, opacity: .07, pointerEvents: 'none', lineHeight: 1 }}>🐝</span>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 44, color: 'white', marginBottom: 14, fontStyle: 'italic' }}>
            Pronta para montar sua colmeia?
          </h2>
          <p style={{ color: 'rgba(255,255,255,.88)', fontSize: 17, marginBottom: 36, fontWeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            Crie sua conta grátis e organize sua vida com a eficiência de uma abelha
            <Sparkles size={17} style={{ color: 'white', flexShrink: 0 }} />
          </p>
          <button
            onClick={onGetStarted}
            style={{ background: 'white', color: '#C45880', fontSize: 16, padding: '15px 38px', borderRadius: 14, border: 'none', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 28px rgba(196,88,128,.25)', fontFamily: "'DM Sans',system-ui,sans-serif", transition: 'transform .2s', display: 'inline-flex', alignItems: 'center', gap: 10 }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
          >
            Criar conta grátis <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>🐝 <strong>Beeplanner</strong> — Feito com 🍯 e muito carinho</p>
        <div style={{ display: 'flex', gap: 22 }}>
          {['Privacidade', 'Termos', 'Login'].map(l => (
            <span key={l}
              onClick={() => l === 'Login' && onLoginClick()}
              style={{ fontSize: 13, color: 'var(--muted)', cursor: 'pointer', transition: 'color .2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary-dark)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
            >{l}</span>
          ))}
        </div>
      </footer>

      <style>{`
        @keyframes beePulse   { 0%,100%{transform:scale(1) rotate(-4deg)} 50%{transform:scale(1.07) rotate(4deg)} }
        @keyframes badgePulse { 0%,100%{opacity:1; box-shadow:0 0 0 0 rgba(244,165,184,0)} 50%{opacity:.75; box-shadow:0 0 0 6px rgba(244,165,184,.18)} }
        @keyframes float      { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-14px) rotate(3deg)} }
        @keyframes blink      { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes stripScroll{ 0%{transform:translateX(0)} 100%{transform:translateX(-33.333%)} }
        @media(max-width:960px){
          section { padding: 80px 28px 60px !important; }
          section > div > div { grid-template-columns: 1fr !important; gap: 50px !important; }
          nav { padding: 0 28px !important; }
          footer { padding: 28px !important; flex-direction: column; gap: 14px; text-align: center; }
        }
        @media(max-width:640px){
          div[style*="repeat(3,1fr)"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function navBtnStyle(primary: boolean): React.CSSProperties {
  return primary
    ? { background: 'linear-gradient(135deg, #F0A0BC, #C45880)', color: 'white', border: 'none', padding: '10px 22px', borderRadius: 50, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',system-ui,sans-serif", boxShadow: '0 4px 18px rgba(196,88,128,.3)', transition: 'all .22s', letterSpacing: '.01em' }
    : { background: 'rgba(244,165,184,.1)', color: 'var(--primary-dark)', border: '1.5px solid rgba(244,165,184,.4)', padding: '9px 20px', borderRadius: 50, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',system-ui,sans-serif", transition: 'all .22s' };
}

function calColH(today: boolean): React.CSSProperties {
  return {
    padding: '10px 6px', textAlign: 'center',
    background: 'var(--surface2)', borderBottom: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    color: today ? 'var(--primary-dark)' : undefined,
  };
}
