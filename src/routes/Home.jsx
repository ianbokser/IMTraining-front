import {
  Dumbbell,
  ShieldCheck,
  Play,
  ArrowRight,
  ArrowUpRight,
  Star,
  Check,
  Minus,
  Plus,
  Clock,
  UserRound,
  MessageCircle,
  Mail,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Button from '../components/Button'
import SectionTitle from '../components/SectionTitle'
import Reveal from '../components/Reveal'
import GoogleG from '../components/GoogleG'
import { testimonios, faqs } from '../lib/constants'
import { api } from '../lib/api'


const pasos = [
  { n: '01', titulo: 'Contanos', texto: 'Tus objetivos, tu cuerpo, tu tiempo y si tenés alguna lesión.' },
  { n: '02', titulo: 'Te la armamos', texto: 'Una rutina profesional pensada para vos. Sin plantillas genéricas.' },
  { n: '03', titulo: 'Entrenás', texto: 'La recibís en 24 hs, en PDF, con videos y explicaciones de cada ejercicio.' },
]

const comoTrabajo = [
  { n: '01', titulo: 'Analizo', texto: 'Tus datos, tus objetivos y tus límites, lesiones incluidas.' },
  { n: '02', titulo: 'Diseño', texto: 'Un plan 100% personalizado, con la técnica correcta y cada ejercicio explicado en video.' },
  { n: '03', titulo: 'Acompaño', texto: 'Seguimiento real de tu progreso: revisión cada 2 semanas y soporte por chat en los planes con seguimiento.' },
]

const disciplinas = ['Fuerza', 'Hipertrofia', 'Pérdida de grasa', 'Resistencia', 'Movilidad', 'Powerlifting']

const fmt = (n) => new Intl.NumberFormat('es-AR').format(n)

// Metadata editorial de cada card de precios (no viene de la API): kicker tipo
// "código de barras", leyenda bajo el precio y cantidad de barras del ícono.
const PLAN_META = {
  'plan-basico': { kicker: '01 — Rutina', caption: 'Pago único', bars: 2 },
  'plan-pro': { kicker: '02 — Seguimiento', caption: 'Por mes', bars: 4 },
  'plan-elite': { kicker: '03 — Acompañamiento', caption: 'Por 3 meses', bars: 6 },
}

// Ícono decorativo tipo "código de barras" usado en el header de cada card.
function Barcode({ bars = 2, color = '#000000' }) {
  return (
    <svg width="104" height="36" viewBox="0 0 152 52" fill={color} aria-hidden="true">
      <line x1="4" y1="26" x2="148" y2="26" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <rect x="42" y="1" width="10" height="50" rx="2" />
      <rect x="100" y="1" width="10" height="50" rx="2" />
      {bars >= 4 && (
        <>
          <rect x="32" y="9" width="8" height="34" rx="2" />
          <rect x="112" y="9" width="8" height="34" rx="2" />
        </>
      )}
      {bars >= 6 && (
        <>
          <rect x="23" y="16" width="7" height="20" rx="2" />
          <rect x="122" y="16" width="7" height="20" rx="2" />
        </>
      )}
    </svg>
  )
}

// Check de ítem de beneficio.
function PlanCheck({ color = '#000000' }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}

// Marcador circular "+" para el primer ítem destacado ("Todo lo del plan...").
function PlanPlusMarker({ bg = '#000000', stroke = '#ffffff' }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full"
      style={{ background: bg }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="3.2" strokeLinecap="round">
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    </span>
  )
}

// Coverflow circular: la tarjeta central va de frente y las de los costados
// se curvan hacia atrás en arco. Se desplaza en loop continuo; pausa al hover.
function ReviewsCarousel() {
  const cardsRef = useRef([])
  const offsetRef = useRef(0)
  const pausedRef = useRef(false)
  const centerIndexRef = useRef(0)
  const [centerIndex, setCenterIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const n = testimonios.length
    const spacing = 300
    const total = n * spacing
    const speed = reduce ? 0 : 55
    let raf
    let last = performance.now()

    const draw = () => {
      const cards = cardsRef.current
      let minDist = Infinity
      let minIdx = centerIndexRef.current
      for (let i = 0; i < cards.length; i++) {
        const el = cards[i]
        if (!el) continue
        let x = i * spacing - offsetRef.current
        x = ((x % total) + total) % total
        if (x > total / 2) x -= total
        const dist = Math.abs(x)
        if (dist < minDist) {
          minDist = dist
          minIdx = i
        }
        const norm = x / spacing
        const rotY = Math.max(-65, Math.min(65, -norm * 42))
        const tz = -Math.min(dist, spacing * 1.6) * 0.9
        const scale = Math.max(0.68, 1 - (dist / spacing) * 0.16)
        const opacity = Math.max(0.15, 1 - dist / (total / 2))
        el.style.transform = `translate(-50%, -50%) translateX(${x}px) translateZ(${tz}px) rotateY(${rotY}deg) scale(${scale})`
        el.style.opacity = String(opacity)
        el.style.zIndex = String(1000 - Math.round(dist))
      }
      if (minIdx !== centerIndexRef.current) {
        centerIndexRef.current = minIdx
        setCenterIndex(minIdx)
      }
    }

    // Al pausar, la tarjeta más cercana al centro queda fija ahí (sin saltos).
    const tick = (now) => {
      const dt = (now - last) / 1000
      last = now
      if (pausedRef.current) {
        const nearest = Math.round(offsetRef.current / spacing) * spacing
        const diff = nearest - offsetRef.current
        offsetRef.current += Math.abs(diff) > 0.4 ? diff * Math.min(1, dt * 10) : diff
        offsetRef.current = ((offsetRef.current % total) + total) % total
      } else {
        offsetRef.current = (offsetRef.current + speed * dt) % total
      }
      draw()
      raf = requestAnimationFrame(tick)
    }
    draw()
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="reviews mt-12">
      <div
        className="reviews__stage mx-auto h-[300px] w-full max-w-5xl"
        onMouseEnter={() => {
          pausedRef.current = true
          setPaused(true)
        }}
        onMouseLeave={() => {
          pausedRef.current = false
          setPaused(false)
        }}
      >
        {testimonios.map((t, i) => {
          const focused = paused && centerIndex === i
          return (
            <figure
              key={t.nombre}
              ref={(el) => (cardsRef.current[i] = el)}
              className={`reviews__card rounded-2xl border border-line-2 bg-paper p-5 shadow-lg transition-[width] duration-300 ${
                focused ? 'w-[clamp(260px,76vw,340px)]' : 'w-[clamp(240px,72vw,300px)]'
              }`}
            >
              <figcaption className="flex items-center gap-2.5">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full font-display text-base font-bold text-white"
                  style={{ backgroundColor: t.color }}
                >
                  {t.nombre.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{t.nombre}</p>
                  <p className="text-[0.7rem] text-ink-soft">{t.resultado}</p>
                </div>
                <GoogleG size={18} />
              </figcaption>
              <div className="mt-2.5 flex gap-0.5" style={{ color: '#FBBC04' }}>
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} size={13} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <blockquote
                className={`mt-2 leading-relaxed text-ink transition-all duration-300 ${
                  focused ? 'text-[1rem]' : 'text-[0.85rem]'
                }`}
              >
                {t.texto}
              </blockquote>
            </figure>
          )
        })}
      </div>
    </div>
  )
}

function FaqItem({ index, q, a, open, onToggle }) {
  return (
    <div
      className={`overflow-hidden rounded-xl border transition-colors ${
        open ? 'border-volt/40 bg-olive' : 'border-line bg-transparent'
      }`}
      style={
        open
          ? {
              backgroundImage:
                'linear-gradient(158deg, rgba(255,255,255,0.085) 0%, rgba(255,255,255,0.025) 34%, rgba(0,0,0,0.22) 100%)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 0 0 1px rgba(255,255,255,0.025), 0 1px 2px rgba(0,0,0,0.55), 0 30px 60px -28px rgba(0,0,0,0.95)',
            }
          : undefined
      }
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-3.5 py-3.5 text-left"
        aria-expanded={open}
      >
        <span
          className={`kicker w-7 shrink-0 text-[11px] transition-colors ${
            open ? 'text-volt' : 'text-muted-2'
          }`}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="flex-1 font-display text-base font-bold text-white sm:text-lg">{q}</span>
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full transition-colors ${
            open ? 'bg-volt text-ink' : 'border border-line text-white'
          }`}
        >
          {open ? <Minus size={14} /> : <Plus size={14} />}
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden pb-4 pl-[52px] pr-3.5 text-sm leading-relaxed text-muted">
          {a}
        </div>
      </div>
    </div>
  )
}

// Card del fundador: foto real si existe en /public, si no, un placeholder
// con la misma composición que la referencia (marco, esquinas, ícono).
function TeamCard({ src, alt }) {
  const [ok, setOk] = useState(true)
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -bottom-10 -left-16 hidden h-72 w-72 lg:block">
        <div className="absolute inset-0 rounded-full border border-volt/40" />
        <div className="absolute inset-8 rounded-full border border-dashed border-white/10" />
        <div className="absolute inset-24 rounded-full border border-white/10" />
      </div>

      <article className="relative overflow-hidden rounded-[1.75rem] bg-paper p-4 text-ink shadow-2xl">
        <div className="relative h-[420px] overflow-hidden rounded-2xl bg-ink">
          {ok ? (
            <img
              src={src}
              alt={alt}
              onError={() => setOk(false)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="relative grid h-full place-items-center">
              <div className="grid-bg absolute inset-0 opacity-40" />
              <span className="absolute left-4 top-4 h-6 w-6 border-l-2 border-t-2 border-volt" />
              <span className="absolute right-4 top-4 h-6 w-6 border-r-2 border-t-2 border-volt" />
              <span className="absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-volt" />
              <span className="absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-volt" />
              <div className="relative flex flex-col items-center gap-4">
                <span className="grid h-24 w-24 place-items-center rounded-full bg-volt/15 text-volt">
                  <UserRound size={40} />
                </span>
                <span className="kicker text-muted">Foto de {alt}</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 px-2 pb-2 pt-5">
          <span className="kicker text-ink-soft/60">Equipo IMTRAINING</span>
          <p className="font-display text-5xl font-black uppercase leading-[0.88] text-ink">{alt}</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-8 items-center rounded-full bg-ink px-3.5 text-[13px] font-bold text-volt">
              Fundador · CEO
            </span>
            <span className="flex h-8 items-center rounded-full border border-ink px-3.5 text-[13px] font-semibold text-ink">
              Profesor
            </span>
          </div>
        </div>
      </article>
    </div>
  )
}

export default function Home() {
  const [plans, setPlans] = useState([])
  const [openFaq, setOpenFaq] = useState(0)
  const location = useLocation()

  useEffect(() => {
    api.getPlans().then(setPlans).catch(() => setPlans([]))
  }, [])

  // Scroll suave a una sección cuando la URL trae un hash (ej: /#nosotros).
  useEffect(() => {
    if (!location.hash) return
    const el = document.getElementById(location.hash.slice(1))
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 60)
  }, [location])

  return (
    <div>
      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="grid-bg pointer-events-none absolute inset-0" />
        <div className="glow pointer-events-none absolute -right-40 -top-52 h-[36rem] w-[36rem]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-12 lg:py-24">
          {/* Texto */}
          <div className="rise lg:col-span-7">
            <div className="inline-flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-volt shadow-[0_0_12px_rgba(198,210,75,0.8)]" />
              <span className="kicker text-white/80">Rutinas personalizadas · PDF con videos</span>
            </div>
            <h1 className="mt-6 font-display text-[3.75rem] font-black uppercase leading-[0.86] text-white sm:text-[4.75rem] lg:text-[6.75rem] xl:text-[8.5rem]">
              Tu rutina de gym,
              <br />
              <span className="text-gradient">hecha para vos.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              Contanos tus objetivos y tu cuerpo. Te armamos una rutina profesional, con videos y
              explicaciones, lista para descargar en PDF. Sin plantillas genéricas.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Button as="link" to="/pedido" size="lg">
                Pedir mi rutina <ArrowRight size={18} />
              </Button>
            </div>

            <ul className="mt-8 flex flex-wrap gap-2.5">
              {['Entrega en 48 h', 'Adaptada a lesiones', 'Pago seguro'].map((t) => (
                <li
                  key={t}
                  className="flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-4 py-2 text-sm font-medium text-white/90"
                >
                  <Check size={15} className="text-volt" /> {t}
                </li>
              ))}
            </ul>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-8">
              {[
                { k: '+500', v: 'rutinas entregadas' },
                { k: '4,9★', v: 'valoración media' },
                { k: '24hs', v: 'de entrega' },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="numeral text-3xl text-white">{s.k}</dt>
                  <dd className="mt-1 text-xs text-muted">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Ejemplo de rutina, sin foto de stock */}
          <div className="relative lg:col-span-5">
            <div className="relative mx-auto flex aspect-[4/5] max-w-sm items-center justify-center">
              {/* anillos decorativos tipo radar */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-line" />
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[19rem] w-[19rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-line" />
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[12rem] w-[12rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-line" />
              <div className="glow pointer-events-none absolute inset-0" />

              {/* card principal: hoja de rutina */}
              <div className="relative w-80 -rotate-2 rounded-2xl border border-line-2 bg-paper p-6 pb-5 text-ink shadow-2xl animate-[float_6s_ease-in-out_infinite]">
                <div className="kicker flex items-center justify-between text-ink-soft/70">
                  <span>Tu plan de hoy</span>
                  <span>PDF</span>
                </div>
                <p className="mt-3.5 font-display text-5xl font-black uppercase leading-[0.88] text-ink">
                  Full Body
                  <br />
                  Día 1
                </p>
                <ul className="mt-4 flex flex-col">
                  {[
                    ['01', 'Sentadilla', '4×8'],
                    ['02', 'Press banca', '4×10'],
                    ['03', 'Remo con barra', '3×12'],
                  ].map(([n, e, s]) => (
                    <li key={e} className="flex h-[60px] items-center gap-3.5 border-t border-line-2">
                      <span className="kicker w-6 text-ink-soft/70">{n}</span>
                      <span className="flex-1 text-lg font-semibold text-ink">{e}</span>
                      <span className="font-display text-3xl font-extrabold leading-none text-ink">{s}</span>
                      <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-ink">
                        <Play size={13} className="translate-x-px fill-volt text-volt" />
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="kicker border-t border-line-2 pt-3.5 text-ink-soft/70">
                  Video y explicación en cada ejercicio
                </p>
              </div>

              {/* card secundaria: técnica en video */}
              <div className="absolute -bottom-10—con—con -left-30 hidden w-44 -rotate-3 rounded-2xl border border-line bg-olive p-2.5 shadow-xl sm:block">
                <div className="relative flex h-[90px] items-center justify-center overflow-hidden rounded-xl bg-ink">
                  <Dumbbell size={34} className="text-white/25" />
                  <div className="absolute inset-x-2.5 bottom-2 flex items-center gap-2">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-volt">
                      <Play size={10} className="translate-x-px fill-ink text-ink" />
                    </span>
                    <span className="relative h-[3px] flex-1 rounded-full bg-paper/15">
                      <span className="absolute inset-y-0 left-0 w-[38%] rounded-full bg-volt" />
                    </span>
                  </div>
                </div>
                <p className="kicker mt-2 pl-0.5 text-paper/60">Sentadilla · técnica</p>
              </div>

              {/* sticker: entrega en 48h */}
              <div className="absolute -top-2 right-1 rotate-6 rounded-[10px] bg-volt px-4 py-2.5 text-center shadow-[0_14px_30px_-10px_rgba(0,0,0,0.6)]">
                <span className="font-display text-xl font-extrabold uppercase leading-none tracking-wide text-ink">
                  Entrega en 24 h
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== MARQUEE ===================== */}
      <section className="overflow-hidden border-b border-line bg-volt py-5">
        <div className="marquee">
          {[...disciplinas, ...disciplinas].map((d, i) => (
            <span key={i} className="flex items-center gap-6 whitespace-nowrap">
              <span className="font-display text-2xl font-extrabold uppercase text-ink">{d}</span>
              <span className="text-ink/40">✦</span>
            </span>
          ))}
        </div>
      </section>

      {/* ===================== CÓMO FUNCIONA ===================== */}
      <section id="como-funciona" className="mx-auto max-w-7xl px-5 py-20 lg:py-28">
        <Reveal>
          <div className="flex flex-col gap-5">
            <p className="kicker text-volt">Cómo funciona</p>
            <h2 className="font-display text-5xl font-black uppercase leading-[0.88] text-white sm:text-7xl lg:text-[6.5rem]">
              Tres pasos
              <br />
              y a entrenar.
            </h2>
          </div>
        </Reveal>
        <div className="mt-16 grid gap-10 md:grid-cols-3 md:gap-6">
          {pasos.map((p, i) => (
            <Reveal key={p.n} delay={i * 100}>
              <article className="flex flex-col gap-5 border-t border-white/15 pt-8">
                <div
                  className="font-display text-[9rem] font-black leading-[0.8] text-transparent"
                  style={{ WebkitTextStroke: '1.5px var(--color-volt)' }}
                >
                  {p.n}
                </div>
                <h3 className="font-display text-3xl font-extrabold uppercase leading-[0.95] text-white sm:text-4xl">
                  {p.titulo}
                </h3>
                <p className="max-w-[22rem] text-lg leading-relaxed text-muted">{p.texto}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===================== BENEFICIOS ===================== */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:py-28">
        <Reveal>
          <div className="flex flex-col gap-5">
            <p className="kicker text-volt">Qué incluye</p>
            <h2 className="font-display text-5xl font-black uppercase leading-[0.88] text-white sm:text-7xl lg:text-[6.5rem]">
              Lista para entrenar.
            </h2>
          </div>
        </Reveal>
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-12">
          <Reveal className="md:col-span-7">
            <article className="relative flex h-full flex-col gap-5 overflow-hidden rounded-3xl border border-line bg-olive p-9 text-paper">
              <h3 className="font-display text-4xl font-extrabold uppercase leading-[0.95] sm:text-5xl">
                <span className="text-volt">Videos</span> en cada ejercicio
              </h3>
              <p className="max-w-md text-base leading-relaxed text-paper/60">
                Mirás cómo se hace antes de hacerlo. Técnica y explicación, ejercicio por ejercicio.
              </p>
              <div className="relative mt-2 flex min-h-[230px] flex-grow items-center justify-center overflow-hidden rounded-xl border border-line bg-ink">
                <Dumbbell size={80} className="text-white/15" strokeWidth={1.5} />
                <div className="absolute inset-x-5 bottom-4 flex items-center gap-3.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-volt">
                    <Play size={14} className="translate-x-px fill-ink text-ink" />
                  </span>
                  <span className="relative h-1 flex-grow rounded-full bg-paper/15">
                    <span className="absolute inset-y-0 left-0 w-[38%] rounded-full bg-volt" />
                  </span>
                  <span className="kicker text-paper/60">Sentadilla</span>
                </div>
              </div>
            </article>
          </Reveal>

          <Reveal delay={80} className="md:col-span-5">
            <article className="relative flex h-full flex-col gap-7 overflow-hidden rounded-3xl border border-line bg-olive p-9 text-paper">
              <div aria-hidden="true" className="relative h-[262px]">
                <div className="absolute left-1/2 top-1.5 h-[250px] w-[190px] -translate-x-1/2">
                  <div className="absolute inset-0 -rotate-[9deg] rounded-xl bg-[#c4beb0]" />
                  <div className="absolute inset-0 -rotate-[4deg] rounded-xl bg-[#dad4c8]" />
                  <div className="absolute inset-0 flex rotate-[1deg] flex-col gap-3 rounded-xl bg-paper p-5">
                    <div className="flex items-center justify-between">
                      <span className="kicker text-ink-soft/70">PDF</span>
                      <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-ink">
                        <Play size={9} className="translate-x-px fill-volt text-volt" />
                      </span>
                    </div>
                    <div className="h-[9px] w-[82%] rounded-md bg-ink" />
                    <div className="h-[7px] w-full rounded bg-[#c4beb0]" />
                    <div className="h-[7px] w-[90%] rounded bg-[#c4beb0]" />
                    <div className="h-[7px] w-[96%] rounded bg-[#c4beb0]" />
                    <div className="h-[7px] w-[70%] rounded bg-[#c4beb0]" />
                    <div className="h-[7px] w-[88%] rounded bg-[#c4beb0]" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3.5">
                <h3 className="font-display text-4xl font-extrabold uppercase leading-[0.95] sm:text-5xl">
                  <span className="text-volt">PDF</span> listo
                  <br />
                  para descargar
                </h3>
                <p className="max-w-sm text-base leading-relaxed text-paper/60">
                  Te llega en 24 h. Llevalo en el celular o imprimilo.
                </p>
              </div>
            </article>
          </Reveal>

          <Reveal delay={160} className="md:col-span-6">
            <article className="flex h-full items-center gap-7 overflow-hidden rounded-3xl border border-line bg-olive p-9 text-paper">
              <span className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-2xl bg-volt/15 text-volt">
                <ShieldCheck size={34} strokeWidth={1.75} />
              </span>
              <div className="flex flex-col gap-3">
                <h3 className="font-display text-3xl font-extrabold uppercase leading-[0.95] sm:text-4xl">
                  Adaptada a <span className="text-volt">lesiones</span>
                </h3>
                <p className="max-w-md text-[0.95rem] leading-relaxed text-paper/60">
                  Contanos si tenés alguna lesión o molestia y tu rutina se arma teniéndola en cuenta.
                </p>
              </div>
            </article>
          </Reveal>

          <Reveal delay={240} className="md:col-span-6">
            <article className="flex h-full items-center gap-7 overflow-hidden rounded-3xl border border-line bg-olive p-9 text-paper">
              <span className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-2xl bg-volt/15 text-volt">
                <Dumbbell size={34} strokeWidth={1.75} />
              </span>
              <div className="flex flex-col gap-3">
                <h3 className="font-display text-3xl font-extrabold uppercase leading-[0.95] sm:text-4xl">
                  Sin <span className="text-volt">plantillas</span> genéricas
                </h3>
                <p className="max-w-md text-[0.95rem] leading-relaxed text-paper/60">
                  Tu plan se arma a partir de tus objetivos, tu cuerpo y tu tiempo.
                </p>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      {/* ===================== NOSOTROS ===================== */}
      <section id="nosotros" className="border-y border-line bg-ink-2/40">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:py-28">
          <Reveal>
            <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <p className="kicker mb-3 text-volt-deep">
                  <span className="mr-2">—</span>Nosotros
                </p>
                <h2 className="text-[2.75rem] font-extrabold uppercase leading-[0.88] text-white sm:text-[4rem] lg:text-[5.25rem]">
                  Quién arma
                  <br />
                  tu rutina.
                </h2>
              </div>
            </div>
          </Reveal>

          <div className="mt-16 grid items-start gap-14 lg:grid-cols-12">
            <Reveal className="lg:col-span-5">
              <TeamCard src="/equipo/ignacio.jpg" alt="Ignacio Molina" />
            </Reveal>

            <Reveal delay={100} className="lg:col-span-7 lg:pl-8">
              <p className="max-w-xl text-[1.7rem] font-semibold leading-[1.2] text-white sm:text-[2.15rem]">
                Soy quien diseña <span className="text-volt">personalmente</span> cada rutina de
                IMTRAINING.
              </p>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
                Analizo tus datos, tus objetivos y tus límites para armarte un plan hecho a tu
                medida con la técnica correcta y el acompañamiento que necesitás para progresar
                en serio.
              </p>

              <div className="mt-10">
                <p className="kicker text-volt-deep">Cómo trabajo</p>
                <ol className="mt-4">
                  {comoTrabajo.map((p) => (
                    <li
                      key={p.n}
                      className="grid grid-cols-[2.5rem_1fr] items-center gap-x-6 gap-y-1.5 border-t border-line py-5 last:border-b sm:grid-cols-[2.5rem_9rem_1fr]"
                    >
                      <span className="kicker text-volt-deep">{p.n}</span>
                      <h3 className="font-display text-2xl font-extrabold uppercase text-white">
                        {p.titulo}
                      </h3>
                      <p className="col-span-2 text-[0.95rem] leading-relaxed text-muted sm:col-span-1">
                        {p.texto}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-4 sm:max-w-xl sm:grid-cols-3">
                <div className="rounded-2xl border border-line bg-olive p-5">
                  <p className="font-display text-5xl font-black leading-none text-paper">
                    <span className="text-volt">+</span>500
                  </p>
                  <p className="kicker mt-2.5 text-paper/60">Rutinas entregadas</p>
                </div>
                <div className="rounded-2xl border border-line bg-olive p-5">
                  <p className="flex items-center gap-2 font-display text-5xl font-black leading-none text-paper">
                    4,9 <Star size={24} fill="currentColor" strokeWidth={0} className="text-volt" />
                  </p>
                  <p className="kicker mt-2.5 text-paper/60">Valoración media</p>
                </div>
                <div className="rounded-2xl border border-line bg-olive p-5">
                  <p className="font-display text-5xl font-black leading-none text-paper">
                    <span className="text-volt">+</span>5
                  </p>
                  <p className="kicker mt-2.5 text-paper/60">Años de experiencia</p>
                </div>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
                <Button as="link" to="/pedido" size="lg">
                  Pedir mi rutina <ArrowRight size={18} />
                </Button>
                <Button as="link" to="/#precios" variant="ghost">
                  Ver planes y precios <ArrowRight size={16} />
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===================== TESTIMONIOS ===================== */}
      <section className="overflow-hidden bg-ink-2/40">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:py-28">
          <Reveal>
            <SectionTitle center eyebrow="Reseñas de Google" title="Lo que dicen en Google." />
          </Reveal>
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-3 rounded-full border border-line-2 bg-paper px-5 py-2.5 shadow-sm">
              <GoogleG size={22} />
              <p className="font-display text-2xl font-extrabold text-ink">4,9</p>
              <div className="flex gap-0.5" style={{ color: '#FBBC04' }}>
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} size={14} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <p className="text-xs text-ink-soft">+500 reseñas</p>
            </div>
          </div>
          <ReviewsCarousel />
        </div>
      </section>

      {/* ===================== PLANES ===================== */}
      <section id="precios" className="border-y border-line bg-ink-2/50">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:py-28">
          <Reveal>
            <SectionTitle
              center
              eyebrow="Precios claros"
              title="Elegí cómo querés entrenar."
              subtitle="Sin letra chica. Elegí el plan que mejor se adapta a tu objetivo."
            />
          </Reveal>
          <div className="mt-14 grid items-stretch gap-6 md:grid-cols-3">
            {plans.map((p, i) => {
              const featured = p.destacado
              const isElite = p.id === 'plan-elite'
              const meta = PLAN_META[p.id] || {}
              const mutedColor = isElite ? 'rgba(0,0,0,0.72)' : featured ? 'rgba(0,0,0,0.82)' : '#4A5545'
              const accent = isElite ? 'var(--color-ember)' : featured ? 'var(--color-volt)' : 'var(--color-paper)'
              return (
                <Reveal key={p.id} delay={i * 80}>
                  <article
                    className={`relative flex h-full flex-col gap-7 rounded-[28px] p-9 pb-8 text-black ${
                      featured ? 'pt-[72px]' : ''
                    }`}
                    style={{
                      background: accent,
                      boxShadow: isElite
                        ? '0 50px 90px -40px rgba(255, 85, 0, 0.65), 0 0 0 1px rgba(255, 85, 0, 0.35)'
                        : featured
                          ? '0 50px 90px -40px color-mix(in srgb, var(--color-volt) 55%, transparent)'
                          : undefined,
                    }}
                  >
                    {featured && (
                      <span
                        className="absolute left-1/2 top-[-16px] -translate-x-1/2 whitespace-nowrap rounded-full px-[18px] py-[9px] text-xs font-bold uppercase tracking-[0.16em]"
                        style={{ background: '#000000', color: 'var(--color-volt)', boxShadow: '0 0 0 4px #000000' }}
                      >
                        Más elegido
                      </span>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="kicker" style={{ color: mutedColor }}>
                        {meta.kicker}
                      </span>
                      <Barcode bars={meta.bars} color="#000000" />
                    </div>

                    <div className="flex flex-col gap-3">
                      <h3 className="font-display text-[42px] font-extrabold uppercase leading-[0.95] sm:text-[50px]">
                        {p.nombre}
                      </h3>
                      <p className="min-h-[48px] text-base leading-snug" style={{ color: mutedColor }}>
                        {p.descripcion}
                      </p>
                    </div>

                    <div className="flex min-h-[132px] flex-col gap-2">
                      <div className="flex items-end gap-2.5">
                        <span className="font-display text-[60px] font-black leading-[0.9] sm:text-[80px]">
                          ${fmt(p.precio)}
                        </span>
                        <span className="kicker pb-2" style={{ color: mutedColor }}>
                          {p.moneda}
                        </span>
                      </div>
                      <span className="kicker" style={{ color: mutedColor }}>
                        {meta.caption}
                      </span>
                      {isElite && (
                        <span className="text-sm font-bold">
                          Equivale a ${fmt(Math.round(p.precio / 3))} por mes
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-6">
                      <div
                        className="h-px"
                        style={{
                          background: isElite ? 'rgba(0,0,0,0.22)' : featured ? 'rgba(0,0,0,0.24)' : '#C4BEB0',
                        }}
                      />
                      <ul className="flex flex-col gap-4 text-base font-medium leading-snug">
                        {p.beneficios.map((b, bi) => {
                          const special = bi === 0 && b.startsWith('Todo lo del')
                          return (
                            <li key={b} className={`flex items-center gap-3 ${special ? 'font-bold' : ''}`}>
                              {special ? <PlanPlusMarker bg="#000000" stroke={accent} /> : <PlanCheck color="#000000" />}
                              <span>{b}</span>
                            </li>
                          )
                        })}
                      </ul>
                    </div>

                    <Link
                      to="/pedido"
                      className="mt-auto flex h-[60px] items-center justify-center gap-3 rounded-[14px] text-[17px] font-bold transition-transform hover:-translate-y-0.5"
                      style={{ background: '#000000', color: accent }}
                    >
                      Elegir {p.nombre}
                      <ArrowRight size={20} />
                    </Link>
                  </article>
                </Reveal>
              )
            })}
          </div>
          <p className="mt-8 flex items-center justify-center gap-2 text-sm text-muted">
            <ShieldCheck size={16} className="text-volt" /> Pago 100% seguro · Descarga inmediata al confirmar
          </p>
        </div>
      </section>

      {/* ===================== FAQ ===================== */}
      <section id="preguntas" className="mx-auto max-w-7xl px-5 py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal>
              <div className="rounded-3xl border border-line bg-ink-2/60 p-8">
                <p className="kicker mb-3 text-volt-deep">
                  <span className="mr-2">—</span>Dudas frecuentes
                </p>
                <h2 className="text-balance font-display text-4xl font-extrabold leading-[0.95] text-white sm:text-5xl">
                  Todo lo que querés saber.
                </h2>
                <p className="mt-6 text-muted">
                  ¿Te quedó otra duda? Escribinos y te respondemos antes de que compres.
                </p>
                <Button as="link" to="/pedido" variant="outline" className="mt-6">
                  Empezar mi rutina <ArrowRight size={16} />
                </Button>
              </div>
            </Reveal>
          </div>
          <div className="lg:col-span-8 lg:pl-8">
            <Reveal className="flex flex-col gap-3">
              {[
                {
                  q: '¿Cómo se personaliza mi rutina?',
                  a: (
                    <div className="flex flex-col gap-4">
                      <p>Nos contás estos datos:</p>
                      <div className="flex flex-wrap gap-2">
                        {['Edad', 'Peso', 'Altura', 'Objetivos', 'Experiencia', 'Lesiones', 'Tiempo disponible'].map((t) => (
                          <span
                            key={t}
                            className="flex h-[34px] items-center rounded-full bg-volt/15 px-[14px] text-sm font-medium text-paper"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <p className="max-w-[600px]">
                        Con esos datos armamos un plan hecho exclusivamente para vos, no una
                        plantilla genérica.
                      </p>
                    </div>
                  ),
                },
                {
                  q: '¿En cuánto tiempo la recibo?',
                  a: (
                    <p className="max-w-[600px]">
                      Tu rutina se entrega en 24 h, en PDF listo para descargar, con videos y
                      explicación de cada ejercicio.
                    </p>
                  ),
                },
                {
                  q: '¿Sirve si nunca entrené?',
                  a: (
                    <p className="max-w-[600px]">
                      Sí. Nos contás tu experiencia y armamos el plan desde donde estás hoy, con la
                      técnica correcta y cada ejercicio explicado en video.
                    </p>
                  ),
                },
                {
                  q: '¿Y si tengo una lesión o limitación?',
                  a: (
                    <p className="max-w-[600px]">
                      Contanos tus lesiones y límites al pedir tu rutina. Las tenemos en cuenta al
                      elegir y adaptar cada ejercicio.
                    </p>
                  ),
                },
                {
                  q: '¿Puedo pedir ajustes después?',
                  a: (
                    <div className="flex flex-col gap-4">
                      <p className="max-w-[600px]">
                        Con el Plan Mensual y el Elite, tu rutina se revisa y se ajusta cada 2
                        semanas.
                      </p>
                      <span className="inline-flex min-h-[34px] max-w-max items-center rounded-full border-[1.5px] border-dashed border-paper/30 px-[14px] font-mono text-xs tracking-wide text-muted">
                        [Condiciones de ajustes en Rutina Única]
                      </span>
                    </div>
                  ),
                },
                {
                  q: '¿Cómo pago?',
                  a: (
                    <div className="flex flex-col gap-4">
                      <p className="max-w-[600px]">
                        El pago es 100% seguro y la descarga es inmediata al confirmar.
                      </p>
                      <span className="inline-flex min-h-[34px] max-w-max items-center rounded-full border-[1.5px] border-dashed border-paper/30 px-[14px] font-mono text-xs tracking-wide text-muted">
                        [Medios de pago aceptados]
                      </span>
                    </div>
                  ),
                },
                {
                  q: '¿Te quedó otra duda?',
                  a: (
                    <div className="flex flex-col gap-4">
                      <p className="max-w-[600px]">
                        Escribinos y te respondemos antes de que compres. Elegí el canal que prefieras:
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <a
                          href="https://wa.me/5491112345678"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg border border-line bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:border-volt hover:text-volt"
                        >
                          <MessageCircle size={16} /> WhatsApp
                        </a>
                        <a
                          href="mailto:hola@imtraining.com"
                          className="inline-flex items-center gap-2 rounded-lg border border-line bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:border-volt hover:text-volt"
                        >
                          <Mail size={16} /> hola@imtraining.com
                        </a>
                      </div>
                    </div>
                  ),
                },
              ].map((f, i) => (
                <FaqItem
                  key={f.q}
                  index={i}
                  q={f.q}
                  a={f.a}
                  open={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? -1 : i)}
                />
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===================== CTA FINAL ===================== */}
      <section id="pedir" className="mx-auto max-w-7xl px-5 py-20 lg:px-16 lg:py-28">
        <div className="relative overflow-hidden rounded-[2rem] bg-volt text-ink">
          {/* Decorative concentric circles */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
            <svg
              width="640"
              height="640"
              viewBox="0 0 640 640"
              fill="none"
              className="absolute -right-[150px] -top-[130px]"
              aria-hidden="true"
            >
              <circle cx="320" cy="320" r="316" stroke="rgba(0,0,0,0.28)" strokeWidth="2" />
              <circle
                cx="320"
                cy="320"
                r="280"
                stroke="rgba(0,0,0,0.14)"
                strokeWidth="26"
                strokeDasharray="3 11.66"
              />
              <circle cx="320" cy="320" r="176" stroke="rgba(0,0,0,0.28)" strokeWidth="2" />
              <circle cx="320" cy="320" r="38" stroke="rgba(0,0,0,0.4)" strokeWidth="3" />
            </svg>
          </div>

          <div className="relative grid grid-cols-1 gap-6 px-8 py-16 sm:px-14 sm:py-20 lg:grid-cols-12 lg:px-[72px] lg:py-[80px]">
            <div className="flex flex-col items-start gap-6 lg:col-span-7">
              <p className="kicker flex items-center gap-2.5 text-[13px] text-ink">
                <Clock size={18} strokeWidth={2.2} /> Entrega en 24 horas
              </p>

              <h2 className="font-display text-[3.75rem] font-black uppercase leading-[0.86] sm:text-[5.5rem] lg:text-[8rem]">
                <span className="block">¿Listo para</span>
                <span className="block">entrenar</span>
                <span className="block">en serio?</span>
              </h2>

              <p className="max-w-[500px] text-lg leading-relaxed text-ink sm:text-[21px]">
                Empezá hoy tu rutina personalizada y llevá tu entrenamiento al próximo nivel.
              </p>

              <div className="mt-3 flex flex-col items-start gap-4">
                <Link
                  to="/pedido"
                  className="group inline-flex h-16 items-center gap-3 rounded-[14px] bg-ink px-[34px] text-lg font-bold text-volt transition-transform hover:-translate-y-0.5"
                >
                  Pedir mi rutina
                  <ArrowRight
                    size={20}
                    strokeWidth={2.4}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
                <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[15px] font-semibold text-ink">
                  <li className="flex items-center gap-2">
                    <Check size={16} strokeWidth={2.6} /> Armá tu plan en menos de 2 minutos
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} strokeWidth={2.6} /> Pago 100% seguro
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
