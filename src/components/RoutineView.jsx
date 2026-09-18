import { Timer, Repeat, Layers, StickyNote } from 'lucide-react'
import Reveal from './Reveal'

// Render reutilizable de una rutina (días + ejercicios con video de Bunny).
// Lo usan la rutina de ejemplo, la vista del cliente ("Mis rutinas") y el preview del builder.
export default function RoutineView({ routine }) {
  if (!routine?.dias?.length) return null
  return (
    <div className="space-y-14">
      {routine.dias.map((dia, i) => (
        <div key={`${dia.dia}-${i}`}>
          <div className="mb-6 flex items-baseline gap-4 border-b border-line pb-4">
            <span className="numeral text-4xl text-volt">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="font-display text-2xl font-extrabold uppercase text-white">{dia.dia}</h3>
          </div>
          <div className="space-y-8">
            {(dia.bloques || []).map((bloque, bi) => (
              <div key={`${bloque.bloque}-${bi}`}>
                {bloque.bloque && (
                  <div className="mb-4 flex items-center gap-3">
                    <span className="h-4 w-1 rounded-full bg-volt" />
                    <h4 className="font-display text-sm font-bold uppercase tracking-wide text-volt">
                      {bloque.bloque}
                    </h4>
                  </div>
                )}
                <div className="grid gap-5 md:grid-cols-2">
                  {bloque.ejercicios.map((ej, j) => (
                    <Reveal
                      as="article"
                      key={`${ej.nombre}-${j}`}
                      delay={j * 60}
                      className="surface surface-hover flex flex-col p-6"
                    >
                      <h4 className="font-display text-lg font-bold text-white">{ej.nombre}</h4>
                      {ej.explicacion && (
                        <p className="mt-1.5 text-sm leading-relaxed text-muted">{ej.explicacion}</p>
                      )}
                      <div className="mt-5 flex flex-wrap gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-white/80">
                          <Layers size={13} className="text-volt" /> {ej.series} series
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-white/80">
                          <Repeat size={13} className="text-volt" /> {ej.reps} reps
                        </span>
                        {ej.descanso && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-white/80">
                            <Timer size={13} className="text-volt" /> {ej.descanso}
                          </span>
                        )}
                      </div>
                      {ej.nota && (
                        <p className="mt-3 flex items-start gap-2 rounded-xl border border-volt/25 bg-volt/5 px-3 py-2 text-sm text-white/90">
                          <StickyNote size={15} className="mt-0.5 shrink-0 text-volt" /> {ej.nota}
                        </p>
                      )}
                      {ej.videoEmbedUrl && (
                        <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl bg-ink">
                          <iframe
                            className="h-full w-full"
                            src={ej.videoEmbedUrl}
                            title={ej.nombre}
                            loading="lazy"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      )}
                    </Reveal>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
