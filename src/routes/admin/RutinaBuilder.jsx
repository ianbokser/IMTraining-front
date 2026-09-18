import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Upload, Download, CheckCircle2, AlertTriangle, Table, PencilRuler, Save } from 'lucide-react'
import Button from '../../components/Button'
import Badge from '../../components/Badge'
import { Input, Textarea } from '../../components/Field'
import { api } from '../../lib/api'

// Constructor de rutinas: editor visual o importación por Excel. Se abre con ?orderId=xxx.
export default function RutinaBuilder() {
  const [params] = useSearchParams()
  const orderId = params.get('orderId')
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('editor') // editor | excel

  useEffect(() => {
    Promise.all([api.getOrders(), api.adminListExercises()])
      .then(([orders, exs]) => {
        setOrder(orders.find((o) => o.id === orderId) || null)
        setExercises(exs)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [orderId])

  if (loading) {
    return <div className="mx-auto max-w-5xl px-5 py-16"><div className="h-40 animate-pulse rounded-2xl bg-ink-2" /></div>
  }
  if (!orderId || !order) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center">
        <h1 className="text-2xl font-bold text-white">Pedido no encontrado</h1>
        <Button as="link" to="/admin" className="mt-6"><ArrowLeft size={16} /> Volver al panel</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <Link to="/admin" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-white">
        <ArrowLeft size={15} /> Volver al panel
      </Link>
      <div className="mb-8 border-b border-line pb-6">
        <p className="kicker text-volt-deep"><span className="mr-2">—</span> Constructor de rutinas</p>
        <h1 className="mt-3 text-3xl font-extrabold uppercase text-white">Rutina para {order.cliente}</h1>
        <p className="mt-1 text-muted">{order.plan} · {order.email} · {order.estado}</p>
        {order.routineId && (
          <p className="mt-2 text-sm text-warn">Este pedido ya tiene una rutina; al guardar se reemplaza.</p>
        )}
      </div>

      {error && (
        <p className="mb-6 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
      )}

      {/* Selector de modo */}
      <div className="mb-8 flex gap-1 rounded-xl border border-line bg-ink-2 p-1">
        <ModeButton active={mode === 'editor'} onClick={() => setMode('editor')} icon={PencilRuler}>Editor visual</ModeButton>
        <ModeButton active={mode === 'excel'} onClick={() => setMode('excel')} icon={Table}>Importar Excel</ModeButton>
      </div>

      {exercises.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-ink-2 p-10 text-center text-muted">
          No hay ejercicios en la biblioteca. Creá algunos en la pestaña <b className="text-white">Ejercicios</b> antes de armar una rutina.
        </div>
      ) : mode === 'editor' ? (
        <EditorMode order={order} exercises={exercises} onDone={() => navigate('/admin')} />
      ) : (
        <ExcelMode order={order} exercises={exercises} onDone={() => navigate('/admin')} />
      )}
    </div>
  )
}

function ModeButton({ active, onClick, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
        active ? 'bg-volt text-ink' : 'text-white/60 hover:text-white'
      }`}
    >
      <Icon size={16} /> {children}
    </button>
  )
}

/* =================== MODO EDITOR =================== */
// Cada día se subdivide en bloques (ej: "Calentamiento", "Movilidad"). Un bloque sin
// nombre agrupa ejercicios sueltos y se renderiza sin encabezado.
const newBloque = () => ({ bloque: '', ejercicios: [] })
const newDia = (n) => ({ dia: `Día ${n}`, bloques: [newBloque()] })

function EditorMode({ order, exercises, onDone }) {
  const [meta, setMeta] = useState({
    nombre: `Rutina de ${order.cliente}`,
    descripcion: '',
    nivel: order.datos?.intensidad || 'Personalizada',
    enfoque: order.datos?.enfoque || '',
  })
  const [dias, setDias] = useState([newDia(1)])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const exMap = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises])

  const setMetaField = (k) => (e) => setMeta((m) => ({ ...m, [k]: e.target.value }))
  const total = dias.reduce((n, d) => n + d.bloques.reduce((m, b) => m + b.ejercicios.length, 0), 0)

  // Helpers inmutables para editar día → bloque → ejercicio por índice.
  const updateDia = (di, fn) => setDias((d) => d.map((day, i) => (i === di ? fn(day) : day)))
  const updateBloque = (di, bi, fn) =>
    updateDia(di, (day) => ({ ...day, bloques: day.bloques.map((b, i) => (i === bi ? fn(b) : b)) }))

  const addDia = () => setDias((d) => [...d, newDia(d.length + 1)])
  const removeDia = (di) => setDias((d) => d.filter((_, i) => i !== di))
  const setDiaName = (di, value) => updateDia(di, (day) => ({ ...day, dia: value }))

  const addBloque = (di) => updateDia(di, (day) => ({ ...day, bloques: [...day.bloques, newBloque()] }))
  const removeBloque = (di, bi) =>
    updateDia(di, (day) => ({ ...day, bloques: day.bloques.filter((_, i) => i !== bi) }))
  const setBloqueName = (di, bi, value) => updateBloque(di, bi, (b) => ({ ...b, bloque: value }))

  const addEjercicio = (di, bi, exerciseId) => {
    if (!exerciseId) return
    updateBloque(di, bi, (b) => ({
      ...b,
      ejercicios: [...b.ejercicios, { exerciseId, series: 3, reps: '10', descanso: '', nota: '' }],
    }))
  }
  const setEjField = (di, bi, ei, k, value) =>
    updateBloque(di, bi, (b) => ({
      ...b,
      ejercicios: b.ejercicios.map((ej, j) => (j === ei ? { ...ej, [k]: value } : ej)),
    }))
  const removeEj = (di, bi, ei) =>
    updateBloque(di, bi, (b) => ({ ...b, ejercicios: b.ejercicios.filter((_, j) => j !== ei) }))

  const save = async () => {
    if (total === 0) return setError('Agregá al menos un ejercicio.')
    setSaving(true)
    setError('')
    // Aplano bloques → cada ejercicio lleva su nombre de bloque.
    const payloadDias = dias.map((day) => ({
      dia: day.dia,
      ejercicios: day.bloques.flatMap((b) =>
        b.ejercicios.map((ej) => ({ ...ej, bloque: b.bloque })),
      ),
    }))
    try {
      await api.adminCreateRoutine({
        orderId: order.id,
        nombre: meta.nombre,
        descripcion: meta.descripcion,
        nivel: meta.nivel,
        enfoque: meta.enfoque,
        diasPorSemana: dias.length,
        dias: payloadDias,
      })
      onDone()
    } catch (e) {
      setError(e.message)
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}

      <div className="surface p-6">
        <Input label="Nombre de la rutina" value={meta.nombre} onChange={setMetaField('nombre')} />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input label="Nivel" value={meta.nivel} onChange={setMetaField('nivel')} />
          <Input label="Enfoque" value={meta.enfoque} onChange={setMetaField('enfoque')} />
        </div>
        <Textarea className="mt-4" label="Descripción" value={meta.descripcion} onChange={setMetaField('descripcion')} />
      </div>

      {dias.map((day, di) => (
        <div key={di} className="surface p-6">
          <div className="mb-4 flex items-center gap-3">
            <input
              value={day.dia}
              onChange={(e) => setDiaName(di, e.target.value)}
              className="flex-1 rounded-xl border border-line bg-ink-3 px-4 py-2.5 font-display font-bold text-white focus:border-volt focus:outline-none"
            />
            {dias.length > 1 && (
              <Button variant="ghost" size="sm" onClick={() => removeDia(di)}><Trash2 size={15} /></Button>
            )}
          </div>

          <div className="space-y-5">
            {day.bloques.map((bloque, bi) => (
              <div key={bi} className="rounded-2xl border border-line/70 bg-ink-2/40 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-4 w-1 shrink-0 rounded-full bg-volt" />
                  <input
                    value={bloque.bloque}
                    onChange={(e) => setBloqueName(di, bi, e.target.value)}
                    placeholder="Nombre del bloque (ej: Calentamiento, Movilidad)"
                    className="flex-1 rounded-lg border border-line bg-ink-3 px-3 py-2 text-sm font-semibold text-white placeholder:text-muted/70 focus:border-volt focus:outline-none"
                  />
                  {day.bloques.length > 1 && (
                    <button onClick={() => removeBloque(di, bi)} className="text-muted hover:text-danger"><Trash2 size={15} /></button>
                  )}
                </div>

                <div className="space-y-3">
                  {bloque.ejercicios.map((ej, ei) => {
                    const ex = exMap.get(ej.exerciseId)
                    return (
                      <div key={ei} className="rounded-xl border border-line bg-ink-3 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="font-display font-bold text-white">{ex?.nombre || 'Ejercicio'}</span>
                          <button onClick={() => removeEj(di, bi, ei)} className="text-muted hover:text-danger"><Trash2 size={15} /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <Input label="Series" type="number" min="0" value={ej.series} onChange={(e) => setEjField(di, bi, ei, 'series', e.target.value)} />
                          <Input label="Reps" value={ej.reps} onChange={(e) => setEjField(di, bi, ei, 'reps', e.target.value)} />
                          <Input label="Descanso" value={ej.descanso} onChange={(e) => setEjField(di, bi, ei, 'descanso', e.target.value)} placeholder="90s" />
                          <Input label="Nota" value={ej.nota} onChange={(e) => setEjField(di, bi, ei, 'nota', e.target.value)} placeholder="bajar lento" />
                        </div>
                      </div>
                    )
                  })}
                </div>

                <AddExercise exercises={exercises} onAdd={(id) => addEjercicio(di, bi, id)} />
              </div>
            ))}
          </div>

          <button
            onClick={() => addBloque(di)}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-volt hover:text-volt/80"
          >
            <Plus size={15} /> Agregar bloque
          </button>
        </div>
      ))}

      <Button variant="outline" onClick={addDia}><Plus size={16} /> Agregar día</Button>

      <div className="flex items-center justify-between border-t border-line pt-6">
        <span className="text-sm text-muted">{total} ejercicio{total === 1 ? '' : 's'} · {dias.length} día{dias.length === 1 ? '' : 's'}</span>
        <Button onClick={save} disabled={saving}><Save size={16} /> {saving ? 'Guardando…' : 'Guardar y asignar'}</Button>
      </div>
    </div>
  )
}

function AddExercise({ exercises, onAdd }) {
  const [value, setValue] = useState('')
  return (
    <div className="mt-4 flex gap-2">
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 cursor-pointer rounded-xl border border-line bg-ink-3 px-4 py-2.5 text-sm text-white focus:border-volt focus:outline-none"
      >
        <option value="">+ Agregar ejercicio…</option>
        {exercises.map((e) => (
          <option key={e.id} value={e.id}>{e.nombre}{e.grupoMuscular ? ` · ${e.grupoMuscular}` : ''}</option>
        ))}
      </select>
      <Button
        variant="outline"
        size="sm"
        onClick={() => { if (value) { onAdd(value); setValue('') } }}
      >
        <Plus size={15} /> Agregar
      </Button>
    </div>
  )
}

/* =================== MODO EXCEL =================== */
function ExcelMode({ order, exercises, onDone }) {
  const [preview, setPreview] = useState(null) // { matched, unmatched }
  const [parsing, setParsing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  const onPick = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setParsing(true)
    setPreview(null)
    try {
      const res = await api.adminParseExcel(file)
      setPreview(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setParsing(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const canSave = preview && preview.matched.length > 0 && preview.unmatched.length === 0

  const save = async () => {
    if (!canSave) return
    setSaving(true)
    setError('')
    // Agrupar filas matcheadas por día.
    const byDia = new Map()
    const dias = []
    for (const r of preview.matched) {
      if (!byDia.has(r.dia)) {
        const g = { dia: r.dia, ejercicios: [] }
        byDia.set(r.dia, g)
        dias.push(g)
      }
      byDia.get(r.dia).ejercicios.push({
        exerciseId: r.exerciseId,
        bloque: r.bloque || '',
        series: r.series,
        reps: r.reps,
        descanso: r.descanso,
        nota: r.nota,
      })
    }
    try {
      await api.adminCreateRoutine({
        orderId: order.id,
        nombre: `Rutina de ${order.cliente}`,
        descripcion: '',
        nivel: order.datos?.intensidad || 'Personalizada',
        enfoque: order.datos?.enfoque || '',
        diasPorSemana: dias.length,
        dias,
      })
      onDone()
    } catch (e) {
      setError(e.message)
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}

      <div className="surface p-6">
        <p className="text-sm text-muted">
          Subí un Excel con columnas: <b className="text-white">dia</b>, <b className="text-white">bloque</b> (opcional),
          {' '}<b className="text-white">ejercicio</b>, <b className="text-white">series</b>, <b className="text-white">reps</b>,
          {' '}<b className="text-white">descanso</b>, <b className="text-white">nota</b>.
          El nombre del ejercicio debe coincidir con uno de la biblioteca para heredar su video.
        </p>
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={onPick} className="hidden" />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" disabled={parsing} onClick={() => fileRef.current?.click()}>
            <Upload size={16} /> {parsing ? 'Leyendo…' : 'Elegir archivo'}
          </Button>
          <Button as="a" variant="ghost" href={api.excelTemplateUrl()} download>
            <Download size={16} /> Descargar ejemplo
          </Button>
        </div>
      </div>

      {preview && (
        <>
          {preview.unmatched.length > 0 && (
            <div className="rounded-2xl border border-warn/40 bg-warn/10 p-5">
              <p className="flex items-center gap-2 font-semibold text-warn">
                <AlertTriangle size={16} /> {preview.unmatched.length} ejercicio(s) sin coincidencia
              </p>
              <p className="mt-1 text-sm text-muted">
                Corregí el nombre en el Excel o creá estos ejercicios en la biblioteca. No se puede guardar hasta resolverlos.
              </p>
              <div className="mt-3 space-y-1.5">
                {preview.unmatched.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Badge tone="flame">fila {r.fila}</Badge>
                    <span className="text-white">{r.nombre}</span>
                    <span className="text-muted">· {r.dia}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {preview.matched.length > 0 && (
            <div className="surface p-5">
              <p className="mb-3 flex items-center gap-2 font-semibold text-ok">
                <CheckCircle2 size={16} /> {preview.matched.length} ejercicio(s) reconocido(s)
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-muted">
                    <tr className="border-b border-line">
                      <th className="py-2 pr-4 font-medium">Día</th>
                      <th className="py-2 pr-4 font-medium">Bloque</th>
                      <th className="py-2 pr-4 font-medium">Ejercicio</th>
                      <th className="py-2 pr-4 font-medium">Series</th>
                      <th className="py-2 pr-4 font-medium">Reps</th>
                      <th className="py-2 pr-4 font-medium">Descanso</th>
                      <th className="py-2 font-medium">Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.matched.map((r, i) => (
                      <tr key={i} className="border-b border-line/50">
                        <td className="py-2 pr-4 text-muted">{r.dia}</td>
                        <td className="py-2 pr-4 text-muted">{r.bloque || '—'}</td>
                        <td className="py-2 pr-4 text-white">{r.nombre}</td>
                        <td className="py-2 pr-4 text-white">{r.series}</td>
                        <td className="py-2 pr-4 text-white">{r.reps}</td>
                        <td className="py-2 pr-4 text-white">{r.descanso || '—'}</td>
                        <td className="py-2 text-muted">{r.nota || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end border-t border-line pt-6">
            <Button onClick={save} disabled={!canSave || saving}>
              <Save size={16} /> {saving ? 'Guardando…' : 'Crear rutina y asignar'}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
