import { useEffect, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import {
  Check,
  FileDown,
  CreditCard,
  ArrowLeft,
  Pencil,
  Loader2,
  Lock,
  ShieldCheck,
  Clock,
  Mail,
} from 'lucide-react'
import Button from '../components/Button'
import { useOrder } from '../features/order/OrderContext'
import { api } from '../lib/api'

const fmt = (n) => new Intl.NumberFormat('es-AR').format(n)

export default function Checkout() {
  const { order, createdOrder, setCreatedOrder, resetOrder } = useOrder()
  const [searchParams] = useSearchParams()
  const [plans, setPlans] = useState([])
  const [providers, setProviders] = useState([])
  const [provider, setProvider] = useState('')
  const [paying, setPaying] = useState(false)
  const [done, setDone] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [paidOrderId, setPaidOrderId] = useState(null)
  const [error, setError] = useState('')

  const returnStatus = searchParams.get('status')
  const returnOrderId = searchParams.get('order')
  const finalOrderId = paidOrderId || createdOrder?.id

  useEffect(() => {
    api.getPlans().then(setPlans).catch(() => setPlans([]))
  }, [])

  // Medios de pago disponibles (los define el backend, así sumar crypto no toca el front).
  useEffect(() => {
    api
      .getPaymentProviders()
      .then((list) => {
        setProviders(list)
        const firstAvail = list.find((p) => p.disponible) || list[0]
        setProvider(firstAvail?.id || 'simulado')
      })
      .catch(() => setProviders([{ id: 'simulado', nombre: 'Pago de prueba', disponible: true }]))
  }, [])

  // Retorno desde Mercado Pago: confirmamos el estado real del pedido (el webhook es la fuente de verdad).
  useEffect(() => {
    if (!returnOrderId || !returnStatus) return
    if (returnStatus === 'failure') {
      setError('El pago no se completó. Podés intentarlo de nuevo.')
      return
    }
    setConfirming(true)
    let tries = 0
    let alive = true
    const check = async () => {
      try {
        const s = await api.getOrderStatus(returnOrderId)
        if (s.estado === 'pagado') {
          if (!alive) return
          setPaidOrderId(returnOrderId)
          setDone(true)
          setConfirming(false)
          return
        }
      } catch {
        /* reintentamos */
      }
      if (alive && tries++ < 6) setTimeout(check, 1500)
      else if (alive) setConfirming(false)
    }
    check()
    return () => {
      alive = false
    }
  }, [returnOrderId, returnStatus])

  const plan = plans.find((p) => p.nombre === order.plan) || plans[0] || null

  const handlePay = async () => {
    setPaying(true)
    setError('')
    try {
      const created = order.id ? order : await api.createOrder(order)
      setCreatedOrder(created)
      const res = await api.checkout(created.id, provider)
      if (res.type === 'redirect') {
        window.location.href = res.url
        return
      }
      setPaidOrderId(created.id)
      setDone(true)
    } catch (e) {
      setError(e.message || 'No se pudo procesar el pago.')
    } finally {
      setPaying(false)
    }
  }

  // Confirmando pago tras volver de Mercado Pago.
  if (confirming) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center">
        <Loader2 size={40} className="mx-auto animate-spin text-volt" />
        <h1 className="mt-6 text-3xl font-extrabold uppercase text-white">Confirmando tu pago…</h1>
        <p className="mt-3 text-muted">Esto puede tardar unos segundos. No cierres la página.</p>
      </div>
    )
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-5 py-20 text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-volt text-ink animate-[pulseGlow_2.4s_ease-in-out_infinite]">
          <Check size={32} strokeWidth={2.5} />
        </div>
        <h1 className="text-4xl font-extrabold uppercase text-white">¡Pago confirmado!</h1>
        <p className="mt-3 text-muted">
          Gracias por tu compra. Ya estás a un clic de tu rutina personalizada.
        </p>

        <div className="mt-8 rounded-3xl border border-line bg-ink-2 p-6 text-left sm:p-8">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div>
              <p className="kicker text-muted">Pedido</p>
              <p className="mt-1 font-display text-lg font-bold text-white">{finalOrderId}</p>
            </div>
            <span className="rounded-full bg-ok/15 px-3 py-1 text-xs font-semibold text-ok">Pagado</span>
          </div>
          <Button
            className="mt-5 w-full"
            size="lg"
            onClick={() => {
              const url = api.orderPdfUrl(finalOrderId)
              if (url) window.open(url, '_blank')
              else alert('Descarga disponible con el backend real.')
            }}
          >
            <FileDown size={18} /> Descargar mi rutina en PDF
          </Button>
          <ul className="mt-6 space-y-2.5 text-sm text-muted">
            <li className="flex items-center gap-2.5">
              <Mail size={15} className="shrink-0 text-volt" /> Te enviamos una copia a tu email.
            </li>
            <li className="flex items-center gap-2.5">
              <FileDown size={15} className="shrink-0 text-volt" /> Podés volver a descargarla cuando quieras.
            </li>
          </ul>
        </div>

        <Link
          to="/"
          onClick={resetOrder}
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-white"
        >
          <ArrowLeft size={16} /> Volver al inicio
        </Link>
      </div>
    )
  }

  // Si no hay datos del formulario ni estamos volviendo de un pago, mandamos al pedido.
  if (!order.edad && !createdOrder && !returnOrderId) return <Navigate to="/pedido" replace />

  return (
    <section className="mx-auto max-w-4xl px-5 py-14 lg:py-20">
      <p className="kicker text-volt-deep">
        <span className="mr-2">—</span> Último paso
      </p>
      <h1 className="mt-4 text-4xl font-extrabold uppercase text-white sm:text-5xl">Confirmá tu pedido</h1>
      <p className="mt-3 text-muted">Revisá que todo esté bien y confirmá tu compra.</p>

      {error && (
        <p className="mt-6 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-10 grid gap-6 md:grid-cols-5">
        {/* Resumen datos */}
        <div className="rounded-3xl border border-line bg-ink-2 p-6 md:col-span-3 sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-white">Tus datos</h2>
            <Link
              to="/pedido"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-volt hover:underline"
            >
              <Pencil size={14} /> Editar
            </Link>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
            <Item k="Edad" v={`${order.edad} años`} />
            <Item k="Peso" v={`${order.peso} kg`} />
            <Item k="Altura" v={`${order.altura} cm`} />
            <Item k="Días/semana" v={order.diasPorSemana} />
            <Item k="Enfoque" v={order.enfoque} />
            <Item k="Experiencia" v={order.intensidad} />
            <Item k="Disponibilidad" v={order.disponibilidad} />
            <Item k="Deportes" v={order.deportes || 'Ninguno'} />
            <Item k="Lesiones" v={order.lesiones || 'Ninguna'} />
            <Item k="Discapacidad" v={order.discapacidad || 'Ninguna'} />
          </dl>
        </div>

        {/* Resumen pago */}
        {plan && (
          <div className="h-fit space-y-4 md:col-span-2">
            <div className="rounded-3xl border border-volt bg-volt p-6 text-ink shadow-glow sm:p-8">
              <span className="kicker text-ink/60">{plan.nombre}</span>
              <p className="mt-2 font-display text-4xl font-extrabold">
                ${fmt(plan.precio)}
                <span className="text-base font-normal text-ink/60"> {plan.moneda}</span>
              </p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {plan.beneficios.map((b) => (
                  <li key={b} className="flex gap-2">
                    <Check size={17} className="shrink-0 text-ink" /> <span className="text-ink/80">{b}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <span className="kicker text-ink/60">Medio de pago</span>
                <div className="mt-2 space-y-2">
                  {providers.map((p) => (
                    <label
                      key={p.id}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                        provider === p.id ? 'border-ink bg-ink/10' : 'border-ink/20'
                      } ${!p.disponible ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      <input
                        type="radio"
                        name="provider"
                        value={p.id}
                        checked={provider === p.id}
                        disabled={!p.disponible}
                        onChange={() => setProvider(p.id)}
                        className="accent-ink"
                      />
                      {p.nombre}
                      {!p.disponible && <span className="ml-auto text-xs">no configurado</span>}
                    </label>
                  ))}
                </div>
              </div>

              <Button variant="dark" size="lg" className="mt-6 w-full" onClick={handlePay} disabled={paying || !provider}>
                {paying ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Procesando…
                  </>
                ) : (
                  <>
                    <Lock size={18} /> Pagar ${fmt(plan.precio)}
                  </>
                )}
              </Button>
            </div>

            <div className="rounded-2xl border border-line bg-ink-2 p-4">
              <ul className="space-y-2.5 text-xs text-muted">
                <li className="flex items-center gap-2">
                  <ShieldCheck size={15} className="shrink-0 text-volt" /> Pago seguro y encriptado
                </li>
                <li className="flex items-center gap-2">
                  <Clock size={15} className="shrink-0 text-volt" /> Rutina lista en 48h
                </li>
                <li className="flex items-center gap-2">
                  <FileDown size={15} className="shrink-0 text-volt" /> Descarga inmediata al confirmar
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function Item({ k, v }) {
  return (
    <div>
      <dt className="kicker text-muted">{k}</dt>
      <dd className="mt-0.5 font-medium text-white">{v}</dd>
    </div>
  )
}
