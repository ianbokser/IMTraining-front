import { Check } from 'lucide-react'

const puntos = [
  'Rutina 100% personalizada',
  'Videos explicativos de cada ejercicio',
  'Adaptada a lesiones y a tu tiempo',
  'Entrega en PDF en 48 horas',
]

// Panel lateral de marca para las pantallas de auth (login/registro).
export default function AuthAside({ titulo, texto, children }) {
  return (
    <div className="relative hidden overflow-hidden rounded-3xl border border-line bg-ink-2 p-10 lg:block">
      <div className="glow pointer-events-none absolute -right-24 -top-24 h-72 w-72" />
      <div className="relative">
        <h2 className="text-3xl font-extrabold text-white">{titulo}</h2>
        <p className="mt-3 text-muted">{texto}</p>
        <ul className="mt-8 space-y-3">
          {puntos.map((p) => (
            <li key={p} className="flex items-center gap-3 text-sm text-white/85">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-volt/15 text-volt">
                <Check size={14} strokeWidth={3} />
              </span>
              {p}
            </li>
          ))}
        </ul>
        {children && <div className="mt-10 border-t border-line pt-8">{children}</div>}
      </div>
    </div>
  )
}
