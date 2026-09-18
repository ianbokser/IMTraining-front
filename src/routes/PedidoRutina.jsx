import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Clock, Lock, ShieldCheck } from 'lucide-react'
import Button from '../components/Button'
import Stepper from '../components/Stepper'
import { Input, Textarea, Select } from '../components/Field'
import { useOrder } from '../features/order/OrderContext'
import { api } from '../lib/api'

const steps = ['Tus datos', 'Preferencias', 'Plan']
const fmt = (n) => new Intl.NumberFormat('es-AR').format(n)

export default function PedidoRutina() {
  const navigate = useNavigate()
  const { order, updateOrder } = useOrder()
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState({})
  const [plans, setPlans] = useState([])

  useEffect(() => {
    api.getPlans().then(setPlans).catch(() => setPlans([]))
  }, [])

  const set = (k) => (e) => {
    updateOrder({ [k]: e.target.value })
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }))
  }

  const validateStep = () => {
    const errs = {}
    if (step === 0) {
      const edad = Number(order.edad)
      const peso = Number(order.peso)
      const altura = Number(order.altura)
      if (!order.edad) errs.edad = 'Ingresá tu edad.'
      else if (edad < 12 || edad > 99) errs.edad = 'Edad entre 12 y 99.'
      if (!order.peso) errs.peso = 'Ingresá tu peso.'
      else if (peso < 30 || peso > 300) errs.peso = 'Peso poco realista.'
      if (!order.altura) errs.altura = 'Ingresá tu altura.'
      else if (altura < 100 || altura > 250) errs.altura = 'Altura en cm (100–250).'
    }
    return errs
  }

  const next = () => {
    const errs = validateStep()
    if (Object.keys(errs).length) return setErrors(errs)
    setErrors({})
    if (step < steps.length - 1) setStep(step + 1)
    else navigate('/checkout')
  }

  const back = () => {
    setErrors({})
    setStep((s) => Math.max(0, s - 1))
  }

  const selectedPlan = plans.find((p) => p.nombre === order.plan) || null

  return (
    <section className="mx-auto max-w-3xl px-5 py-14 lg:py-20">
      <p className="kicker text-volt-deep">
        <span className="mr-2">—</span> Armá tu plan
      </p>
      <h1 className="mt-4 text-4xl font-extrabold uppercase text-white sm:text-5xl">Pedí tu rutina</h1>
      <p className="mt-3 max-w-lg text-lg text-muted">
        Contanos de vos para armar tu plan personalizado. Toma menos de dos minutos.
      </p>

      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
        <span className="flex items-center gap-1.5"><Clock size={15} className="text-volt" /> 2 minutos</span>
        <span className="flex items-center gap-1.5"><ShieldCheck size={15} className="text-volt" /> Sin compromiso hasta pagar</span>
        <span className="flex items-center gap-1.5"><Lock size={15} className="text-volt" /> Datos privados</span>
      </div>

      <div className="mt-10">
        <Stepper steps={steps} current={step} />
      </div>

      <div className="mt-8 rounded-3xl border border-line bg-ink-2 p-6 sm:p-8">
        {step === 0 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Edad" required type="number" min="12" max="99" value={order.edad} onChange={set('edad')} placeholder="28" error={errors.edad} />
            <Input label="Peso (kg)" required type="number" value={order.peso} onChange={set('peso')} placeholder="70" error={errors.peso} />
            <Input label="Altura (cm)" required type="number" value={order.altura} onChange={set('altura')} placeholder="175" error={errors.altura} />
            <Input
              label="Discapacidad motriz"
              value={order.discapacidad}
              onChange={set('discapacidad')}
              placeholder="Ninguna / describir"
              hint="Opcional"
            />
            <Textarea
              className="sm:col-span-2"
              label="Lesiones o molestias"
              value={order.lesiones}
              onChange={set('lesiones')}
              placeholder="Ej: molestia lumbar, operación de rodilla…"
              hint="Opcional — nos ayuda a que tu rutina sea segura"
            />
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Select label="Días por semana" value={order.diasPorSemana} onChange={set('diasPorSemana')} options={['2', '3', '4', '5', '6']} />
            <Select label="Enfoque" value={order.enfoque} onChange={set('enfoque')} options={['Fuerza', 'Hipertrofia', 'Pérdida de grasa', 'Resistencia', 'Pliometría']} />
            <Select label="Experiencia" value={order.intensidad} onChange={set('intensidad')} options={['Principiante', 'Intermedio', 'Avanzado']} />
            <Select label="Disponibilidad por sesión" value={order.disponibilidad} onChange={set('disponibilidad')} options={['30-45 min', '45-60 min', '60-90 min']} />
            <Textarea
              className="sm:col-span-2"
              label="¿Qué deportes hacés?"
              value={order.deportes}
              onChange={set('deportes')}
              placeholder="Ej: fútbol 2 veces por semana, running, natación…"
              hint="Opcional"
            />
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4 sm:grid-cols-3">
            {plans.map((p) => {
              const active = order.plan === p.nombre
              return (
                <label
                  key={p.id}
                  className={`relative cursor-pointer rounded-2xl border p-5 transition-all ${
                    active
                      ? 'border-volt bg-volt/10 shadow-[0_0_0_1px_var(--color-volt)]'
                      : 'border-line bg-ink-3 hover:border-line-strong'
                  }`}
                >
                  <input
                    type="radio"
                    name="plan"
                    className="sr-only"
                    checked={active}
                    onChange={() => updateOrder({ plan: p.nombre })}
                  />
                  <div className="flex items-center justify-between">
                    <p className="font-display font-bold text-white">{p.nombre}</p>
                    <span
                      className={`grid h-5 w-5 place-items-center rounded-full border ${
                        active ? 'border-volt bg-volt text-ink' : 'border-line'
                      }`}
                    >
                      {active && <Check size={12} strokeWidth={3} />}
                    </span>
                  </div>
                  {p.destacado && (
                    <span className="mt-2 inline-block rounded-full bg-volt/15 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-volt">
                      Más elegido
                    </span>
                  )}
                  <p className="mt-2 font-display text-2xl font-extrabold text-volt">${fmt(p.precio)}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted">{p.descripcion}</p>
                </label>
              )
            })}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-4 border-t border-line pt-6">
          <Button variant="ghost" onClick={back} disabled={step === 0}>
            <ArrowLeft size={18} /> Atrás
          </Button>
          <Button onClick={next}>
            {step === steps.length - 1
              ? selectedPlan
                ? `Ir a pagar · $${fmt(selectedPlan.precio)}`
                : 'Ir a pagar'
              : 'Siguiente'}{' '}
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>

      <p className="mt-5 text-center text-xs text-muted">
        Paso {step + 1} de {steps.length} · Podés volver atrás en cualquier momento
      </p>
    </section>
  )
}
