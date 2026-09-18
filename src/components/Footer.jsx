import { Link } from 'react-router-dom'
import { Camera, Video, Mail, ArrowUpRight } from 'lucide-react'
import { Logo } from './Navbar'
import Button from './Button'

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink">
      {/* Banda CTA */}
      <div className="mx-auto max-w-7xl px-5">
        <div className="surface relative -mb-16 translate-y-[-3rem] overflow-hidden p-8 sm:p-12">
          <div className="glow pointer-events-none absolute -right-20 -top-20 h-72 w-72" />
          <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <h3 className="text-2xl font-extrabold text-white sm:text-3xl">
                Tu próxima rutina te está esperando.
              </h3>
              <p className="mt-2 text-muted">Armá tu plan personalizado en menos de 2 minutos.</p>
            </div>
            <Button as="link" to="/pedido" size="lg" className="shrink-0">
              Pedir mi rutina <ArrowUpRight size={18} />
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 pb-12 pt-24">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Rutinas de gimnasio hechas a tu medida. Entrená con un plan pensado para tu cuerpo,
              tus objetivos y tu tiempo.
            </p>
          </div>

          <div>
            <p className="kicker mb-4 text-muted">Navegación</p>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: '/', l: 'Inicio' },
                { to: '/ejemplo', l: 'Ejemplo de rutina' },
                { to: '/pedido', l: 'Pedir rutina' },
                { to: '/login', l: 'Ingresar' },
              ].map((i) => (
                <li key={i.to}>
                  <Link to={i.to} className="text-white/60 transition-colors hover:text-volt">
                    {i.l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="kicker mb-4 text-muted">Seguinos</p>
            <div className="flex gap-3">
              {[
                { Icon: Camera, label: 'Instagram' },
                { Icon: Video, label: 'YouTube' },
                { Icon: Mail, label: 'Email' },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  className="grid h-10 w-10 place-items-center rounded-xl border border-line text-white/70 transition-colors hover:border-volt hover:text-volt"
                  aria-label={label}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} IMTraining. Todos los derechos reservados.</p>
          <p>Hecho para que entrenes mejor.</p>
        </div>
      </div>
    </footer>
  )
}
