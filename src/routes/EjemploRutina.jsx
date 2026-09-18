import { useEffect, useState } from 'react'
import { PlayCircle, ArrowRight, Eye } from 'lucide-react'
import Button from '../components/Button'
import SectionTitle from '../components/SectionTitle'
import RoutineView from '../components/RoutineView'
import { api } from '../lib/api'

export default function EjemploRutina() {
  const [routine, setRoutine] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .getExampleRoutine()
      .then(setRoutine)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-20">
        <div className="h-6 w-40 animate-pulse rounded bg-ink-3" />
        <div className="mt-4 h-12 w-3/4 max-w-xl animate-pulse rounded bg-ink-3" />
        <div className="mt-10 aspect-video w-full animate-pulse rounded-3xl bg-ink-3" />
      </div>
    )
  }

  if (!routine) {
    return (
      <div className="mx-auto max-w-lg px-5 py-32 text-center">
        <h1 className="text-2xl font-bold text-white">No hay ejemplo disponible</h1>
        <p className="mt-2 text-muted">Volvé a intentarlo en un rato.</p>
        <Button as="link" to="/pedido" className="mt-6">
          Pedir mi rutina <ArrowRight size={18} />
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* ===================== ENCABEZADO + VIDEO ===================== */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="grid-bg pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-12 lg:py-20">
          <div className="lg:col-span-5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-volt/30 bg-volt/10 px-3 py-1 text-xs font-semibold text-volt">
              <Eye size={13} /> Ejemplo real · gratis
            </span>
            <SectionTitle
              eyebrow="Así se ve tu rutina"
              title={routine.nombre}
              subtitle={routine.descripcion}
            />
            <dl className="mt-8 flex flex-wrap gap-3">
              {[
                { l: 'Nivel', v: routine.nivel },
                { l: 'Frecuencia', v: `${routine.diasPorSemana} días/sem` },
                { l: 'Enfoque', v: routine.enfoque },
              ].map((c) => (
                <div key={c.l} className="rounded-xl border border-line bg-ink-2 px-4 py-3">
                  <dt className="kicker text-muted">{c.l}</dt>
                  <dd className="mt-0.5 font-display font-bold text-white">{c.v}</dd>
                </div>
              ))}
            </dl>
            <Button as="link" to="/pedido" size="lg" className="mt-8">
              Quiero la mía <ArrowRight size={18} />
            </Button>
          </div>

          {/* Video del entrenador */}
          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-3xl border border-line bg-ink-2 shadow-lift">
              <div className="aspect-video w-full bg-ink">
                <iframe
                  className="h-full w-full"
                  src="https://www.youtube.com/embed/aclHkVaku9U"
                  title="Video explicativo del entrenador"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="flex items-center gap-2 px-5 py-4">
                <PlayCircle size={18} className="text-volt" />
                <p className="text-sm text-muted">Presentación del entrenador.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== DÍAS DE LA RUTINA ===================== */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:py-24">
        <RoutineView routine={routine} />
      </section>

      {/* ===================== CTA ===================== */}
      <section className="bg-volt text-ink">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-5 py-16 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-3xl font-extrabold uppercase leading-none md:text-5xl">¿Querés la tuya?</h3>
            <p className="mt-3 max-w-md text-lg text-ink/70">
              Esta es sólo una muestra. La tuya se arma con tus datos, tu nivel y tus objetivos.
            </p>
          </div>
          <Button as="link" to="/pedido" variant="dark" size="lg" className="shrink-0">
            Pedir mi rutina <ArrowRight size={18} />
          </Button>
        </div>
      </section>
    </div>
  )
}
