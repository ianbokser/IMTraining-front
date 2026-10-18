import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { ArrowUpRight, LayoutDashboard, LogIn, LogOut, Menu, X, Dumbbell, UserRound } from 'lucide-react'
import Button from './Button'
import { useAuth } from '../features/auth/AuthContext'

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/#como-funciona', label: 'Cómo funciona' },
  { to: '/#precios', label: 'Precios' },
  { to: '/#nosotros', label: 'Nosotros' },
  { to: '/#preguntas', label: 'Preguntas' },
]

export function Logo({ onClick, compact = false }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label="IMTRAINING — Inicio"
      className="group inline-flex items-center gap-2.5 leading-none"
    >
      <span
        role="img"
        aria-label="IM"
        className={`block shrink-0 rounded-xl bg-ink-2 bg-cover bg-center bg-no-repeat ring-1 ring-line transition-transform group-hover:scale-105 ${
          compact ? 'h-8 w-8' : 'h-9 w-9'
        }`}
        style={{ backgroundImage: "url('/Logo_IM.jpeg')" }}
      />
      <span
        className={`font-display font-extrabold leading-none tracking-tight text-volt ${
          compact ? 'text-lg' : 'text-xl'
        }`}
      >
        TRAINING
      </span>
    </Link>
  )
}

export default function Navbar() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [location.pathname])

  // Bloquea el scroll del body cuando el drawer mobile está abierto.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const handleLogout = () => {
    logout()
    setOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-ink/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5">
        <Logo compact />

        {/* Links desktop */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-volt' : 'text-white/60 hover:text-white'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Acciones derechas (desktop + mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {auth && !auth.isAdmin && (
            <Link
              to="/mis-rutinas"
              className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:text-white sm:flex"
            >
              <Dumbbell size={14} /> Mis rutinas
            </Link>
          )}
          {auth?.isAdmin && (
            <Link
              to="/admin"
              className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:text-white sm:flex"
            >
              <LayoutDashboard size={14} /> Panel
            </Link>
          )}
          {auth ? (
            <>
              <span className="hidden text-sm text-white/60 lg:inline">Hola, {auth.nombre}</span>
              <button
                onClick={handleLogout}
                className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:text-white sm:flex"
              >
                <LogOut size={14} /> Salir
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:text-white sm:flex"
              >
                <LogIn size={14} /> Ingresar
              </Link>
              <Button as="link" to="/pedido" size="sm" className="!hidden sm:!inline-flex">
                Pedir mi rutina{' '}
                <ArrowUpRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Button>
            </>
          )}

          {/* CTA compacto solo en mobile (antes de abrir el drawer) */}
          {!auth && (
            <Button
              as="link"
              to="/pedido"
              size="sm"
              className="!inline-flex px-3 py-2 text-xs sm:!hidden"
            >
              Pedir rutina
            </Button>
          )}

          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-line text-white transition-colors hover:border-volt hover:text-volt md:hidden"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Drawer mobile (fullscreen slide-in) */}
      {open && (
        <>
          <div
            className="fixed inset-0 top-[57px] z-40 bg-ink/70 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-x-0 top-[57px] z-50 flex max-h-[calc(100vh-57px)] flex-col overflow-y-auto border-t border-line bg-ink shadow-2xl animate-[rise_0.3s_cubic-bezier(0.22,1,0.36,1)] md:hidden">
            {/* Perfil arriba si está logueado */}
            {auth && (
              <div className="flex items-center gap-3 border-b border-line bg-ink-2/40 px-5 py-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-volt/15 font-display text-base font-bold text-volt">
                  {(auth.nombre || 'U').charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">Hola, {auth.nombre}</p>
                  <p className="truncate text-xs text-muted">
                    {auth.isAdmin ? 'Administrador' : 'Cliente IMTRAINING'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1 px-4 py-4">
              <p className="kicker px-2 pb-1 text-muted-2">Navegación</p>
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-xl px-3.5 py-3.5 text-base font-medium transition-colors ${
                      isActive ? 'bg-volt/10 text-volt' : 'text-white/80 hover:bg-white/5'
                    }`
                  }
                >
                  <span>{l.label}</span>
                  <ArrowUpRight size={16} className="opacity-60" />
                </NavLink>
              ))}
            </div>

            <div className="border-t border-line px-4 py-4">
              <p className="kicker px-2 pb-2 text-muted-2">Tu cuenta</p>
              <div className="flex flex-col gap-2">
                {auth && !auth.isAdmin && (
                  <Link
                    to="/mis-rutinas"
                    className="flex items-center gap-2.5 rounded-xl bg-ink-2 px-3.5 py-3 text-base font-medium text-white/85 ring-1 ring-line hover:bg-white/5"
                  >
                    <Dumbbell size={16} className="text-volt" /> Mis rutinas
                  </Link>
                )}
                {auth?.isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2.5 rounded-xl bg-ink-2 px-3.5 py-3 text-base font-medium text-white/85 ring-1 ring-line hover:bg-white/5"
                  >
                    <LayoutDashboard size={16} className="text-volt" /> Panel
                  </Link>
                )}
                {auth ? (
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-xl bg-ink-2 px-3.5 py-3 text-left text-base font-medium text-white/85 ring-1 ring-line hover:bg-white/5"
                  >
                    <LogOut size={16} className="text-danger" /> Salir
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      className="flex items-center justify-center gap-2 rounded-xl bg-ink-2 px-3 py-3 text-sm font-semibold text-white/85 ring-1 ring-line hover:bg-white/5"
                    >
                      <LogIn size={15} /> Ingresar
                    </Link>
                    <Link
                      to="/registro"
                      className="flex items-center justify-center gap-2 rounded-xl bg-ink-2 px-3 py-3 text-sm font-semibold text-white/85 ring-1 ring-line hover:bg-white/5"
                    >
                      <UserRound size={15} /> Crear cuenta
                    </Link>
                  </div>
                )}
              </div>
              {!auth && (
                <Button as="link" to="/pedido" className="mt-3 w-full justify-center">
                  Pedir mi rutina <ArrowUpRight size={16} />
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  )
}
