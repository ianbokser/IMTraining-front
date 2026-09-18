import { useEffect, useState } from 'react'
import { FileDown, Dumbbell, ArrowRight, ChevronRight, CalendarDays } from 'lucide-react'
import Button from '../components/Button'
import Badge from '../components/Badge'
import RoutineView from '../components/RoutineView'
import { api } from '../lib/api'

// Página del cliente: lista sus pedidos pagados y muestra la rutina asignada con videos.
export default function MisRutinas() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [routine, setRoutine] = useState(null)
  const [routineLoading, setRoutineLoading] = useState(false)

  useEffect(() => {
    api
      .getMyOrders()
      .then((list) => {
        setOrders(list)
        const first = list.find((o) => o.tieneRutina) || list[0] || null
        if (first) openOrder(first)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openOrder = (order) => {
    setSelected(order)
    setRoutine(null)
    if (!order?.tieneRutina) return
    setRoutineLoading(true)
    api
      .getOrderRoutine(order.id)
      .then(setRoutine)
      .catch((e) => setError(e.message))
      .finally(() => setRoutineLoading(false))
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-16">
        <div className="h-8 w-52 animate-pulse rounded bg-ink-3" />
        <div className="mt-8 grid gap-6 lg:grid-cols-4">
          <div className="h-64 animate-pulse rounded-2xl bg-ink-2 lg:col-span-1" />
          <div className="h-64 animate-pulse rounded-2xl bg-ink-2 lg:col-span-3" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:py-16">
      <div className="mb-8 border-b border-line pb-6">
        <p className="kicker text-volt-deep">
          <span className="mr-2">—</span> Tu espacio
        </p>
        <h1 className="mt-3 text-3xl font-extrabold uppercase text-white">Mis rutinas</h1>
        <p className="mt-1 text-muted">Acá vas a ver las rutinas que armamos para vos, con sus videos.</p>
      </div>

      {error && (
        <p className="mb-6 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-ink-2 p-12 text-center">
          <Dumbbell size={32} className="mx-auto text-muted-2" />
          <p className="mt-4 text-muted">Todavía no tenés pedidos. Pedí tu rutina para empezar.</p>
          <Button as="link" to="/pedido" className="mt-6">
            Pedir mi rutina <ArrowRight size={18} />
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Listado de pedidos */}
          <div className="space-y-3 lg:col-span-1">
            {orders.map((o) => {
              const active = selected?.id === o.id
              return (
                <button
                  key={o.id}
                  onClick={() => openOrder(o)}
                  className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                    active ? 'border-volt bg-volt/5' : 'border-line bg-ink-2 hover:border-line-strong'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display font-bold text-white">{o.plan}</span>
                    <ChevronRight size={16} className={active ? 'text-volt' : 'text-muted-2'} />
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-muted">
                    <CalendarDays size={13} /> {o.fecha}
                  </div>
                  <div className="mt-3">
                    {o.tieneRutina ? (
                      <Badge tone="ok">Rutina lista</Badge>
                    ) : (
                      <Badge tone="warn">En preparación</Badge>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Detalle de la rutina seleccionada */}
          <div className="lg:col-span-3">
            {!selected ? (
              <EmptyPanel>Seleccioná un pedido para ver tu rutina.</EmptyPanel>
            ) : !selected.tieneRutina ? (
              <EmptyPanel>
                Tu rutina para <strong className="text-white">{selected.plan}</strong> está en preparación.
                Te avisamos cuando esté lista.
              </EmptyPanel>
            ) : routineLoading ? (
              <div className="h-96 animate-pulse rounded-2xl bg-ink-2" />
            ) : routine ? (
              <div>
                <div className="mb-6 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-line bg-ink-2 p-6">
                  <div>
                    <h2 className="font-display text-2xl font-extrabold uppercase text-white">
                      {routine.nombre}
                    </h2>
                    {routine.descripcion && <p className="mt-1 text-muted">{routine.descripcion}</p>}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {routine.nivel && <Badge tone="muted">{routine.nivel}</Badge>}
                      {routine.enfoque && <Badge tone="muted">{routine.enfoque}</Badge>}
                      {routine.diasPorSemana && (
                        <Badge tone="muted">{routine.diasPorSemana} días/sem</Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const url = api.orderPdfUrl(selected.id)
                      if (url) window.open(url, '_blank')
                    }}
                  >
                    <FileDown size={18} /> Descargar PDF
                  </Button>
                </div>
                <RoutineView routine={routine} />
              </div>
            ) : (
              <EmptyPanel>No pudimos cargar la rutina. Probá de nuevo en un rato.</EmptyPanel>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyPanel({ children }) {
  return (
    <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-line bg-ink-2 p-10 text-center text-muted">
      <p className="max-w-md">{children}</p>
    </div>
  )
}
