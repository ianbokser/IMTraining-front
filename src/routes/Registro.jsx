import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { Input } from '../components/Field'
import AuthAside from '../components/AuthAside'
import { useAuth } from '../features/auth/AuthContext'
import { api } from '../lib/api'

export default function Registro() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.telefono.trim()) {
      return setError('Ingresá un número de contacto.')
    }
    if (form.password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres.')
    }
    setLoading(true)
    try {
      const data = await api.register(form)
      login(data)
      navigate('/pedido')
    } catch (err) {
      setError(err.message || 'No se pudo crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 lg:grid-cols-2 lg:items-center lg:py-20">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-3xl font-extrabold uppercase text-white sm:text-4xl">Crear cuenta</h1>
        <p className="mt-2 text-muted">Registrate para armar y recibir tu rutina personalizada.</p>

        <div className="mt-8 rounded-3xl border border-line bg-ink-2 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Nombre" value={form.nombre} onChange={set('nombre')} placeholder="Tu nombre" required />
            <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="tu@email.com" required />
            <Input
              label="Número de contacto"
              type="tel"
              value={form.telefono}
              onChange={set('telefono')}
              placeholder="+54 11 1234-5678"
              required
            />
            <Input
              label="Contraseña"
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="Mínimo 6 caracteres"
              hint="Al menos 6 caracteres"
              required
            />
            {error && (
              <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
                {error}
              </p>
            )}
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Creando cuenta…' : 'Crear mi cuenta'}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="font-medium text-volt hover:underline">
              Iniciá sesión
            </Link>
          </p>
        </div>
      </div>

      <AuthAside
        titulo="Empezá a entrenar con un plan hecho para vos."
        texto="Creá tu cuenta en segundos y armá tu rutina personalizada."
      >
        <p className="text-sm text-muted">
          Sumate a las <span className="font-semibold text-white">+500 personas</span> que ya entrenan con IMTraining.
        </p>
      </AuthAside>
    </div>
  )
}
