import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'
import Button from '../components/Button'
import { Input } from '../components/Field'
import AuthAside from '../components/AuthAside'
import { useAuth } from '../features/auth/AuthContext'
import { api } from '../lib/api'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
        <h1 className="text-3xl font-extrabold uppercase text-white sm:text-4xl">Iniciar sesión</h1>
        <p className="mt-2 text-muted">Ingresá para pedir y descargar tu rutina personalizada.</p>

        <div className="mt-8 rounded-3xl border border-line bg-ink-2 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
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
          <p className="mt-5 text-center text-sm text-muted">
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
        <div className="flex gap-0.5 text-volt">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
          ))}
        </div>
        <blockquote className="mt-3 text-lg font-medium leading-relaxed text-white">
          “La mejor decisión que tomé para entrenar en serio. Todo claro y a mi medida.”
        </blockquote>
        <p className="mt-3 text-sm text-muted">— Martín G., cliente IMTraining</p>
      </AuthAside>
    </div>
  )
}
