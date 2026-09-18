import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { ArrowUpRight, LayoutDashboard, LogIn, LogOut, Menu, X, Dumbbell } from 'lucide-react'
import Button from './Button'
import { useAuth } from '../features/auth/AuthContext'

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/#nosotros', label: 'Nosotros' },
  { to: '/ejemplo', label: 'Ejemplo' },
  { to: '/pedido', label: 'Pedir rutina' },
]

export function Logo({ onClick }) {
  return (
    <Link to="/" onClick={onClick} className="group flex items-center gap-2.5">
      <span
        role="img"
        aria-label="IMTraining"
        className="h-9 w-[3.25rem] shrink-0 rounded-xl bg-ink-2 bg-no-repeat ring-1 ring-line transition-transform group-hover:scale-105"
        style={{ backgroundImage: "url('/image.jpg')", backgroundSize: '209%', backgroundPosition: '49.5% 41%' }}
      />
      <span className="font-display text-lg font-extrabold tracking-tight text-white">
        IM<span className="text-volt">Training</span>
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

  const handleLogout = () => {
    logout()
    setOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-ink/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5">
        <Logo />

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

        <div className="flex items-center gap-2">
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
              <Button as="link" to="/pedido" size="sm" className="hidden sm:inline-flex">
                Empezar{' '}
                <ArrowUpRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Button>
            </>
          )}

          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-lg border border-line text-white md:hidden"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Menú mobile */}
      {open && (
        <div className="border-t border-line bg-ink/95 backdrop-blur-xl md:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-5 py-4">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-3 text-base font-medium transition-colors ${
                    isActive ? 'bg-volt/10 text-volt' : 'text-white/70 hover:bg-white/5'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="!mt-4 space-y-2 border-t border-line pt-4">
              {auth && !auth.isAdmin && (
                <Link
                  to="/mis-rutinas"
                  className="flex items-center gap-2 rounded-lg px-3 py-3 text-base font-medium text-white/70 hover:bg-white/5"
                >
                  <Dumbbell size={16} /> Mis rutinas
                </Link>
              )}
              {auth?.isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 rounded-lg px-3 py-3 text-base font-medium text-white/70 hover:bg-white/5"
                >
                  <LayoutDashboard size={16} /> Panel
                </Link>
              )}
              {auth ? (
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-left text-base font-medium text-white/70 hover:bg-white/5"
                >
                  <LogOut size={16} /> Salir
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-2 rounded-lg px-3 py-3 text-base font-medium text-white/70 hover:bg-white/5"
                  >
                    <LogIn size={16} /> Ingresar
                  </Link>
                  <Button as="link" to="/pedido" className="w-full">
                    Empezar ahora <ArrowUpRight size={16} />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
