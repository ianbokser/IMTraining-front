import {
  Dumbbell,
  ShieldCheck,
  FileText,
  PlayCircle,
  ArrowRight,
  ArrowUpRight,
  Star,
  Check,
  Minus,
  Plus,
  Zap,
  Clock,
  BadgeCheck,
  UserRound,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Button from '../components/Button'
import Badge from '../components/Badge'
import SectionTitle from '../components/SectionTitle'
import Reveal from '../components/Reveal'
import { testimonios, resultados, faqs } from '../lib/constants'
import { api } from '../lib/api'

const IMG_HERO =
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1100&q=80'
const IMG_BENEFITS =
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1100&q=80'

const beneficios = [
  { icon: Dumbbell, titulo: 'Personalizada', texto: 'Adaptada a tu edad, peso, altura y objetivos reales. Nada genérico.' },
  { icon: ShieldCheck, titulo: 'Segura', texto: 'Contemplamos lesiones y limitaciones motrices para que entrenes tranquilo.' },
  { icon: FileText, titulo: 'Lista en PDF', texto: 'La recibís organizada y prolija, lista para llevar al gym en tu celular.' },
  { icon: PlayCircle, titulo: 'Con videos', texto: 'Cada ejercicio explicado en video. Técnica correcta desde el día uno.' },
]

const pasos = [
  { n: '01', titulo: 'Contanos de vos', texto: 'Edad, peso, altura, lesiones y cuánto tiempo tenés para entrenar.' },
  { n: '02', titulo: 'Elegí tu plan', texto: 'Días por semana, enfoque e intensidad según tu objetivo real.' },
  { n: '03', titulo: 'Recibí tu rutina', texto: 'Un PDF profesional, hecho a tu medida, listo para descargar.' },
]

const disciplinas = ['Fuerza', 'Hipertrofia', 'Pérdida de grasa', 'Resistencia', 'Movilidad', 'Powerlifting']

const fmt = (n) => new Intl.NumberFormat('es-AR').format(n)

// Logo "G" multicolor de Google, para que las reseñas se lean como de Google.
function GoogleG({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

// Coverflow circular: la tarjeta central va de frente y las de los costados
// se curvan hacia atrás en arco. Se desplaza en loop continuo; pausa al hover.
function ReviewsCarousel() {
  const cardsRef = useRef([])
  const offsetRef = useRef(0)
  const pausedRef = useRef(false)

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
      for (let i = 0; i < cards.length; i++) {
        const el = cards[i]
        if (!el) continue
        let x = i * spacing - offsetRef.current
        x = ((x % total) + total) % total
        if (x > total / 2) x -= total
        const dist = Math.abs(x)
        const norm = x / spacing
        const rotY = Math.max(-65, Math.min(65, -norm * 42))
        const tz = -Math.min(dist, spacing * 1.6) * 0.9
        const scale = Math.max(0.68, 1 - (dist / spacing) * 0.16)
        const opacity = Math.max(0.15, 1 - dist / (total / 2))
        el.style.transform = `translate(-50%, -50%) translateX(${x}px) translateZ(${tz}px) rotateY(${rotY}deg) scale(${scale})`
        el.style.opacity = String(opacity)
        el.style.zIndex = String(1000 - Math.round(dist))
      }
    }

    const tick = (now) => {
      const dt = (now - last) / 1000
      last = now
      if (!pausedRef.current) offsetRef.current = (offsetRef.current + speed * dt) % total
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
        onMouseEnter={() => (pausedRef.current = true)}
        onMouseLeave={() => (pausedRef.current = false)}
      >
        {testimonios.map((t, i) => (
          <figure
            key={t.nombre}
            ref={(el) => (cardsRef.current[i] = el)}
            className="reviews__card w-[clamp(240px,72vw,300px)] rounded-2xl border border-line-2 bg-paper p-5 shadow-lg"
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
            <blockquote className="mt-2 text-[0.85rem] leading-relaxed text-ink">{t.texto}</blockquote>
          </figure>
        ))}
      </div>
    </div>
  )
}

function FaqItem({ q, a, open, onToggle }) {
  return (
    <div className="border-b border-line">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span className="font-display text-lg font-bold text-white">{q}</span>
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors ${
            open ? 'border-volt bg-volt text-ink' : 'border-line text-white'
          }`}
        >
          {open ? <Minus size={16} /> : <Plus size={16} />}
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? 'grid-rows-[1fr] pb-5 opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <p className="overflow-hidden pr-12 text-[0.95rem] leading-relaxed text-muted">{a}</p>
      </div>
    </div>
  )
}

// Foto de un miembro del equipo. Si la imagen no existe todavía, muestra un
// placeholder claro indicando dónde dejar el archivo.
function TeamPhoto({ src, alt, caption }) {
  const [ok, setOk] = useState(true)
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl border border-line bg-ink-2">
      {ok ? (
        <img
          src={src}
          alt={alt}
          onError={() => setOk(false)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="grid h-full place-items-center px-6 text-center">
          <div>
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-volt/10 text-volt">
              <UserRound size={30} />
            </span>
            <p className="mt-4 font-display font-bold text-white">Foto de {alt}</p>
            <p className="mt-1 text-xs text-muted">
              Dejá la imagen en <span className="text-white/70">public{src}</span>
            </p>
          </div>
        </div>
      )}
      {ok && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-4">
          <p className="font-display font-bold text-white">{alt}</p>
          {caption && <p className="text-xs text-volt">{caption}</p>}
        </div>
      )}
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
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3.5 py-1.5">
              <span className="flex gap-0.5 text-volt">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} fill="currentColor" strokeWidth={0} />
                ))}
              </span>
              <span className="text-xs font-medium text-white/80">+500 rutinas entregadas · 4,9/5</span>
            </div>
            <h1 className="mt-6 text-5xl font-extrabold uppercase leading-[0.95] text-white sm:text-6xl lg:text-7xl">
              Tu rutina de gym,
              <br />
              <span className="text-gradient">hecha para vos.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              Contanos tus objetivos y tu cuerpo. Te armamos una rutina profesional —con videos y
              explicaciones— lista para descargar en PDF. Sin plantillas genéricas.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button as="link" to="/pedido" size="lg">
                Pedir mi rutina <ArrowRight size={18} />
              </Button>
              <Button as="link" to="/ejemplo" size="lg" variant="outline">
                <PlayCircle size={18} /> Ver un ejemplo
              </Button>
            </div>

            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              {['Entrega en 48h', 'Adaptada a lesiones', 'Pago seguro'].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check size={16} className="text-volt" /> {t}
                </li>
              ))}
            </ul>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-8">
              {[
                { k: '+500', v: 'rutinas entregadas' },
                { k: '4,9★', v: 'valoración media' },
                { k: '48h', v: 'de entrega' },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="numeral text-3xl text-white">{s.k}</dt>
                  <dd className="mt-1 text-xs text-muted">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Imagen + card flotante */}
          <div className="relative lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-ink-2">
              <img
                src={IMG_HERO}
                alt="Persona entrenando con pesas en el gimnasio"
                loading="eager"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
            </div>

            <div className="absolute -bottom-6 -left-4 hidden w-64 rounded-2xl border border-line bg-ink-2/95 p-4 shadow-2xl backdrop-blur sm:block sm:-left-6 animate-[float_6s_ease-in-out_infinite]">
              <div className="flex items-center justify-between">
                <p className="kicker text-volt-deep">Tu plan de hoy</p>
                <Zap size={14} className="text-volt" />
              </div>
              <p className="mt-1 font-display text-lg font-bold text-white">Full Body · Día 1</p>
              <ul className="mt-3 space-y-2 text-sm">
                {[
                  ['Sentadilla', '4×8'],
                  ['Press banca', '4×10'],
                  ['Remo con barra', '3×12'],
                ].map(([e, s]) => (
                  <li key={e} className="flex items-center justify-between text-muted">
                    <span>{e}</span>
                    <span className="font-semibold text-volt">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== MARQUEE ===================== */}
      <section className="overflow-hidden border-b border-line bg-ink-2 py-5">
        <div className="marquee">
          {[...disciplinas, ...disciplinas].map((d, i) => (
            <span key={i} className="flex items-center gap-6 whitespace-nowrap">
              <span className="font-display text-2xl font-extrabold uppercase text-white/90">{d}</span>
              <span className="text-volt">✦</span>
            </span>
          ))}
        </div>
      </section>

      {/* ===================== BENEFICIOS ===================== */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-12 lg:items-center">
          <Reveal className="lg:col-span-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-line bg-ink-2">
              <img
                src={IMG_BENEFITS}
                alt="Entrenamiento funcional"
                loading="lazy"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-ink/80 p-4 backdrop-blur">
                <div className="flex items-center gap-3">
                  <BadgeCheck size={22} className="text-volt" />
                  <p className="text-sm font-medium text-white">
                    Diseñada por entrenadores, no por un algoritmo genérico.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
          <div className="lg:col-span-7">
            <Reveal>
              <SectionTitle
                eyebrow="Por qué IMTraining"
                title="No es una rutina genérica de internet."
                subtitle="Es un plan construido alrededor de vos: tu nivel, tu tiempo y tus límites."
              />
            </Reveal>
            <div className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2">
              {beneficios.map((b, i) => (
                <Reveal key={b.titulo} delay={i * 80} className="border-t border-line pt-5">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-volt/10 text-volt">
                    <b.icon size={22} strokeWidth={1.75} />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-white">{b.titulo}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{b.texto}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CÓMO FUNCIONA (claro) ===================== */}
      <section className="bg-paper text-ink">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:py-28">
          <Reveal>
            <SectionTitle light eyebrow="Simple y rápido" title="De tus datos al gym, en 3 pasos." />
          </Reveal>
          <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line-2 bg-line-2 md:grid-cols-3">
            {pasos.map((p, i) => (
              <Reveal key={p.n} delay={i * 100} className="bg-paper p-8 lg:p-10">
                <span className="numeral text-6xl text-ink/15">{p.n}</span>
                <h3 className="mt-6 font-display text-2xl font-bold text-ink">{p.titulo}</h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">{p.texto}</p>
              </Reveal>
            ))}
          </div>
          <div className="mt-12">
            <Button as="link" to="/pedido" variant="dark" size="lg">
              Empezar ahora <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </section>

      {/* ===================== RESULTADOS ===================== */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:py-28">
        <Reveal>
          <SectionTitle
            center
            eyebrow="Resultados reales"
            title="Cambios que se miden, no que se prometen."
            subtitle="Personas como vos que empezaron con un plan a medida. Estos son sus números."
          />
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {resultados.map((r, i) => (
            <Reveal key={r.nombre} delay={i * 100}>
              <div className="surface surface-hover flex h-full flex-col p-8">
                <span className="kicker text-volt-deep">{r.objetivo}</span>
                <p className="mt-4 font-display text-5xl font-extrabold text-white">{r.metrica}</p>
                <p className="mt-1 text-sm text-muted">{r.detalle}</p>
                <p className="mt-5 flex-1 text-[0.95rem] leading-relaxed text-white/80">
                  “{r.texto}”
                </p>
                <p className="mt-6 border-t border-line pt-4 text-sm font-semibold text-white">
                  {r.nombre}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===================== NOSOTROS ===================== */}
      <section id="nosotros" className="border-y border-line bg-ink-2/40">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:py-28">
          <Reveal>
            <SectionTitle
              center
              eyebrow="Nosotros"
              title="Quién arma tu rutina."
              subtitle="Detrás de cada plan hay una persona real, no un algoritmo genérico."
            />
          </Reveal>
          <div className="mt-14 grid items-center gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-5">
              <TeamPhoto src="/equipo/ignacio.jpg" alt="Ignacio Molina" caption="CEO · IMTraining" />
            </Reveal>
            <Reveal delay={100} className="lg:col-span-7">
              <span className="kicker text-volt-deep">Fundador</span>
              <h3 className="mt-3 font-display text-3xl font-extrabold uppercase text-white sm:text-4xl">
                Ignacio Molina
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="volt">CEO</Badge>
                <Badge tone="muted">Profesor · arma tu rutina</Badge>
              </div>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
                Soy quien diseña personalmente cada rutina de IMTraining. Analizo tus datos,
                tus objetivos y tus límites para armarte un plan hecho a tu medida —con la
                técnica correcta y el acompañamiento que necesitás para progresar en serio.
              </p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  'Planes 100% personalizados',
                  'Cada ejercicio con video',
                  'Adaptado a lesiones y límites',
                  'Seguimiento real de tu progreso',
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2 text-sm text-white/80">
                    <Check size={16} className="shrink-0 text-volt" /> {t}
                  </li>
                ))}
              </ul>
              <Button as="link" to="/pedido" className="mt-8">
                Pedir mi rutina <ArrowRight size={18} />
              </Button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===================== PLANES ===================== */}
      <section className="border-y border-line bg-ink-2/50">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:py-28">
          <Reveal>
            <SectionTitle
              center
              eyebrow="Precios claros"
              title="Elegí cómo querés entrenar."
              subtitle="Sin letra chica. Elegí el plan que mejor se adapta a tu objetivo."
            />
          </Reveal>
          <div className="mt-14 grid items-center gap-6 md:grid-cols-3">
            {plans.map((p, i) => {
              const featured = p.destacado
              return (
                <Reveal key={p.id} delay={i * 80}>
                  <div
                    className={`relative flex h-full flex-col rounded-3xl border p-8 ${
                      featured
                        ? 'border-volt bg-volt text-ink shadow-glow md:scale-[1.04]'
                        : 'surface text-white'
                    }`}
                  >
                    {featured && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-ink px-4 py-1 text-xs font-bold uppercase tracking-wide text-volt">
                        Más elegido
                      </span>
                    )}
                    <h3 className="font-display text-xl font-bold">{p.nombre}</h3>
                    <p className={`mt-2 text-sm ${featured ? 'text-ink/70' : 'text-muted'}`}>
                      {p.descripcion}
                    </p>
                    <p className="mt-6 font-display text-5xl font-extrabold">
                      ${fmt(p.precio)}
                      <span className={`text-base font-normal ${featured ? 'text-ink/60' : 'text-muted'}`}>
                        {' '}
                        {p.moneda}
                      </span>
                    </p>
                    <ul className="mt-6 flex-1 space-y-3 text-sm">
                      {p.beneficios.map((b) => (
                        <li key={b} className="flex gap-2.5">
                          <Check size={18} className={featured ? 'shrink-0 text-ink' : 'shrink-0 text-volt'} />
                          <span className={featured ? 'text-ink/80' : 'text-white/80'}>{b}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      as="link"
                      to="/pedido"
                      variant={featured ? 'dark' : 'primary'}
                      className="mt-8 w-full"
                    >
                      Elegir {p.nombre}
                    </Button>
                  </div>
                </Reveal>
              )
            })}
          </div>
          <p className="mt-8 flex items-center justify-center gap-2 text-sm text-muted">
            <ShieldCheck size={16} className="text-volt" /> Pago 100% seguro · Descarga inmediata al confirmar
          </p>
        </div>
      </section>

      {/* ===================== TESTIMONIOS (claro) ===================== */}
      <section className="overflow-hidden bg-paper-2 text-ink">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:py-28">
          <Reveal>
            <SectionTitle light center eyebrow="Reseñas de Google" title="Lo que dicen en Google." />
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

      {/* ===================== FAQ ===================== */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal>
              <SectionTitle eyebrow="Dudas frecuentes" title="Todo lo que querés saber." />
              <p className="mt-6 text-muted">
                ¿Te quedó otra duda? Escribinos y te respondemos antes de que compres.
              </p>
              <Button as="link" to="/pedido" variant="outline" className="mt-6">
                Empezar mi rutina <ArrowRight size={16} />
              </Button>
            </Reveal>
          </div>
          <div className="lg:col-span-8">
            <Reveal>
              {faqs.map((f, i) => (
                <FaqItem
                  key={f.q}
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
      <section className="relative overflow-hidden bg-volt text-ink">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-5 py-20 lg:flex-row lg:items-center lg:justify-between lg:py-24">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-ink/60">
              <Clock size={16} /> Entrega en 48 horas
            </p>
            <h2 className="mt-4 max-w-2xl text-4xl font-extrabold uppercase leading-none md:text-6xl">
              ¿Listo para entrenar en serio?
            </h2>
            <p className="mt-4 max-w-md text-lg text-ink/70">
              Empezá hoy tu rutina personalizada y llevá tu entrenamiento al próximo nivel.
            </p>
          </div>
          <Button as="link" to="/pedido" variant="dark" size="lg" className="shrink-0">
            Pedir mi rutina{' '}
            <ArrowUpRight
              size={18}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Button>
        </div>
      </section>
    </div>
  )
}
