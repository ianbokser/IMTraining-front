import { useEffect, useState } from 'react'
import { Timer, Repeat, Layers, StickyNote, Weight, TrendingUp, TrendingDown } from 'lucide-react'
import Reveal from './Reveal'

// Render reutilizable de una rutina (días + ejercicios con video de Bunny).
// Lo usan la rutina de ejemplo, la vista del cliente ("Mis rutinas") y el preview del builder.
// `logs` + `onLogWeight` son opcionales: cuando están presentes (sólo en "Mis rutinas"),
// cada ejercicio muestra su progreso de peso semana a semana y un formulario para cargarlo.
export default function RoutineView({ routine, logs, onLogWeight }) {
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
                      {onLogWeight && ej.routineExerciseId && (
                        <WeightTracker
                          entries={logs?.[ej.routineExerciseId] || []}
                          onSave={(semana, peso) => onLogWeight(ej.routineExerciseId, semana, peso)}
                        />
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

// Progreso de peso de un ejercicio: historial semana a semana (mini barras) + carga rápida.
function WeightTracker({ entries, onSave }) {
  const sorted = [...entries].sort((a, b) => a.semana - b.semana)
  const nextWeek = sorted.length ? sorted[sorted.length - 1].semana + 1 : 1
  const [semana, setSemana] = useState(nextWeek)
  const [peso, setPeso] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  // Si se carga una semana nueva, sugerimos automáticamente la siguiente.
  useEffect(() => {
    setSemana(nextWeek)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextWeek])

  const maxPeso = sorted.reduce((m, l) => Math.max(m, l.peso), 0) || 1
  const last = sorted[sorted.length - 1]
  const prev = sorted[sorted.length - 2]
  const delta = last && prev ? Math.round((last.peso - prev.peso) * 100) / 100 : null

  async function submit(e) {
    e.preventDefault()
    const semanaNum = Number(semana)
    const pesoNum = Number(peso)
    if (!Number.isInteger(semanaNum) || semanaNum < 1 || !pesoNum || pesoNum <= 0) {
      setErr('Ingresá una semana y un peso válidos')
      return
    }
    setErr('')
    setSaving(true)
    try {
      await onSave(semanaNum, pesoNum)
      setPeso('')
    } catch (e2) {
      setErr(e2.message || 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-line bg-ink/50 p-3.5">
      <p className="kicker flex items-center gap-1.5 text-volt-deep">
        <Weight size={13} /> Progreso de peso
      </p>

      {sorted.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {sorted.map((l) => (
            <li key={l.semana} className="flex items-center gap-2 text-xs">
              <span className="w-14 shrink-0 text-muted">Sem {l.semana}</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-3">
                <span
                  className="block h-full rounded-full bg-volt"
                  style={{ width: `${Math.max(8, (l.peso / maxPeso) * 100)}%` }}
                />
              </span>
              <span className="w-16 shrink-0 text-right font-semibold text-white">{l.peso} kg</span>
            </li>
          ))}
        </ul>
      )}

      {delta !== null && delta !== 0 && (
        <p
          className={`mt-2 flex items-center gap-1 text-xs font-semibold ${
            delta > 0 ? 'text-ok' : 'text-danger'
          }`}
        >
          {delta > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {delta > 0 ? `+${delta}` : delta} kg desde la semana anterior
        </p>
      )}

      <form onSubmit={submit} className="mt-3 flex items-end gap-2">
        <label className="flex flex-col gap-1 text-[11px] text-muted">
          Semana
          <input
            type="number"
            min={1}
            value={semana}
            onChange={(e) => setSemana(e.target.value)}
            className="w-16 rounded-lg border border-line bg-ink-2 px-2 py-1.5 text-sm text-white outline-none focus:border-volt"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-[11px] text-muted">
          Peso (kg)
          <input
            type="number"
            min={0}
            step="0.5"
            placeholder="Ej: 60"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            className="w-full rounded-lg border border-line bg-ink-2 px-2 py-1.5 text-sm text-white outline-none focus:border-volt"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="h-[34px] shrink-0 rounded-lg bg-volt px-3 text-xs font-bold text-ink transition-colors hover:bg-volt-deep disabled:opacity-50"
        >
          {saving ? '...' : 'Guardar'}
        </button>
      </form>
      {err && <p className="mt-1.5 text-xs text-danger">{err}</p>}
    </div>
  )
}
