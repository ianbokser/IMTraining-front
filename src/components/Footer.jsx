import { Link } from 'react-router-dom'
import { Camera, Video, Mail, ArrowUpRight } from 'lucide-react'
import { Logo } from './Navbar'
import Button from './Button'
import CopyEmail from './CopyEmail'

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-ink">
      {/* Logo de marca como fondo del footer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 top-24 bg-[url('/Footer_IM.jpg')] bg-[length:90%_auto] bg-center bg-no-repeat opacity-20 mix-blend-screen"
      />
      {/* Banda CTA — con margen propio arriba para que no se pise con el contenido
          del route anterior (login, registro, reset, etc.) */}
      <div className="relative mx-auto max-w-7xl px-4 pt-12 sm:px-5 sm:pt-20">
        <div className="surface relative overflow-hidden p-6 sm:p-12">
          <div className="glow pointer-events-none absolute -right-20 -top-20 h-72 w-72" />
          <div className="relative flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <h3 className="text-xl font-extrabold text-white sm:text-3xl">
                Tu próxima rutina te está esperando.
              </h3>
              <p className="mt-2 text-sm text-muted sm:text-base">Armá tu plan personalizado en menos de 2 minutos.</p>
            </div>
            <Button as="link" to="/pedido" size="lg" className="w-full justify-center shrink-0 sm:w-auto">
              Pedir mi rutina <ArrowUpRight size={18} />
            </Button>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-5 sm:pb-12 sm:pt-16">
        <div className="grid gap-8 xs:grid-cols-2 sm:gap-10 md:grid-cols-[1.6fr_1fr_1fr]">
          <div className="xs:col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted sm:mt-4">
              Rutinas de gimnasio hechas a tu medida. Entrená con un plan pensado para tu cuerpo,
              tus objetivos y tu tiempo.
            </p>
          </div>

          <div>
            <p className="kicker mb-4 text-muted">Navegación</p>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: '/', l: 'Inicio' },
                { to: '/#preguntas', l: 'Preguntas frecuentes' },
                { to: '/pedido', l: 'Pedir rutina' },
                { to: '/#precios', l: 'Precios' },
                { to: '/login', l: 'Ingresar' },
                { to: '/#nosotros', l: 'Nosotros' },
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
              <a
                href="https://instagram.com/Imtrainingokk"
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-10 w-10 place-items-center rounded-xl border border-line text-white/70 transition-colors hover:border-volt hover:text-volt"
                aria-label="Instagram"
              >
                <Camera size={18} />
              </a>
              <CopyEmail
                email="Imtrainingokk@gmail.com"
                className="relative grid h-10 w-10 place-items-center rounded-xl border border-line text-white/70 transition-colors hover:border-volt hover:text-volt"
              >
                {(copied) => (
                  <>
                    <Mail size={18} />
                    <span
                      className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow ring-1 ring-line transition-opacity duration-150 data-[visible=true]:opacity-100"
                      data-visible={copied || undefined}
                    >
                      {copied ? '¡Copiado!' : 'Copiar email'}
                    </span>
                  </>
                )}
              </CopyEmail>
            </div>
            <ul className="mt-5 space-y-1.5 text-sm text-white/60">
              <li>
                <a
                  href="https://wa.me/5491123824035"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-volt"
                >
                  WhatsApp: +54 9 11 2382-4035
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/Imtrainingokk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-volt"
                >
                  @Imtrainingokk
                </a>
              </li>
              <li>
                <CopyEmail
                  email="Imtrainingokk@gmail.com"
                  className="inline-flex items-center gap-2 text-left transition-colors hover:text-volt"
                >
                  {(copied) => (
                    <>
                      Imtrainingokk@gmail.com
                      <span className="text-[10px] uppercase tracking-wider text-volt-deep">
                        {copied ? '¡copiado!' : '(copiar)'}
                      </span>
                    </>
                  )}
                </CopyEmail>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} IMTRAINING. Todos los derechos reservados.</p>
          <p>Hecho para que entrenes mejor.</p>
        </div>
      </div>
    </footer>
  )
}
