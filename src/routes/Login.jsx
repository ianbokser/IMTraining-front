import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'
import Button from '../components/Button'
import { Input } from '../components/Field'
import AuthAside from '../components/AuthAside'
import GoogleG from '../components/GoogleG'
import { useAuth } from '../features/auth/AuthContext'
import { api } from '../lib/api'
import { testimonios } from '../lib/constants'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [testiIdx, setTestiIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setTestiIdx((i) => (i + 1) % testimonios.length)
    }, 5000)
    return () => clearInterval(id)
  }, [])

  const t = testimonios[testiIdx]
  const initial = (t.nombre || '').trim().charAt(0).toUpperCase() || 'U'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.login(email, password)
      login(data)
      navigate(data.isAdmin ? '/admin' : '/pedido')
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 lg:grid-cols-2 lg:items-center lg:py-20">
      <div className="mx-auto w-full max-w-md">
        <p className="kicker mb-3 text-volt-deep">
          <span className="mr-2">—</span>
          Acceso clientes
        </p>
        <h1 className="font-display text-5xl font-black uppercase leading-[0.92] text-white sm:text-6xl">
          Iniciar <span className="text-gradient">sesión.</span>
        </h1>
        <p className="mt-3 text-muted">Ingresá para pedir y descargar tu rutina personalizada.</p>

        <div className="relative mt-8 overflow-hidden rounded-3xl border border-line bg-ink-2 p-6 sm:p-8">
          <div className="glow pointer-events-none absolute -right-20 -top-20 h-64 w-64" />
          <form onSubmit={handleSubmit} className="relative space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            {error && (
              <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
                {error}
              </p>
            )}
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Ingresando…' : 'Ingresar'}
            </Button>
          </form>
          <p className="relative mt-5 text-center text-sm text-muted">
            ¿No tenés cuenta?{' '}
            <Link to="/registro" className="font-medium text-volt hover:underline">
              Registrate
            </Link>
          </p>
        </div>
      </div>

      <AuthAside
        titulo="Bienvenido de nuevo."
        texto="Retomá donde lo dejaste y descargá tu rutina cuando quieras."
      >
        <div
          key={testiIdx}
          className="animate-rise rounded-2xl border border-line-2 bg-paper p-5 shadow-lg"
        >
          <div className="flex items-center gap-2.5">
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full font-display text-base font-bold text-white"
              style={{ backgroundColor: t.color }}
            >
              {initial}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{t.nombre}</p>
              <p className="text-[0.7rem] text-ink-soft">{t.resultado}</p>
            </div>
            <GoogleG size={18} />
          </div>
          <div className="mt-2.5 flex gap-0.5" style={{ color: '#FBBC04' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
            ))}
          </div>
          <blockquote className="mt-2 text-sm leading-relaxed text-ink">
            “{t.texto}”
          </blockquote>
          <div className="mt-3 flex justify-center gap-1.5">
            {testimonios.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setTestiIdx(i)}
                aria-label={`Testimonio ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === testiIdx ? 'w-5 bg-ink' : 'w-1.5 bg-ink/20 hover:bg-ink/40'
                }`}
              />
            ))}
          </div>
        </div>
      </AuthAside>
    </div>
  )
}
