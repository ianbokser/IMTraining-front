import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import { Input } from '../components/Field'
import AuthAside from '../components/AuthAside'
import { api } from '../lib/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.message || 'No pudimos procesar el pedido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 lg:grid-cols-2 lg:items-center lg:py-20">
      <div className="mx-auto w-full max-w-md">
        <p className="kicker mb-3 text-volt-deep">
          <span className="mr-2">—</span>
          Recuperar acceso
        </p>
        <h1 className="font-display text-5xl font-black uppercase leading-[0.92] text-white sm:text-6xl">
          Olvidé mi <span className="text-gradient">contraseña.</span>
        </h1>
        <p className="mt-3 text-muted">
          Ingresá tu email y te enviamos un link para elegir una contraseña nueva.
        </p>

        <div className="relative mt-8 overflow-hidden rounded-3xl border border-line bg-ink-2 p-6 sm:p-8">
          <div className="glow pointer-events-none absolute -right-20 -top-20 h-64 w-64" />

          {sent ? (
            <div className="relative space-y-4">
              <p className="rounded-lg border border-volt/40 bg-volt/10 px-3 py-3 text-sm font-medium text-volt">
                Si el email está registrado, ya te mandamos el link. Revisá tu casilla (y la carpeta
                de spam). El link vence a los 30 minutos.
              </p>
              <p className="text-sm text-muted">
                ¿No te llegó?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setSent(false)
                    setError('')
                  }}
                  className="font-medium text-volt hover:underline"
                >
                  Reenviar
                </button>
              </p>
              <Link
                to="/login"
                className="block text-center text-sm font-medium text-volt hover:underline"
              >
                Volver a iniciar sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="relative space-y-5">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
              {error && (
                <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
                  {error}
                </p>
              )}
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Enviando…' : 'Enviarme el link'}
              </Button>
              <p className="text-center text-sm text-muted">
                <Link to="/login" className="font-medium text-volt hover:underline">
                  Volver a iniciar sesión
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>

      <AuthAside
        titulo="Elegí una contraseña nueva en 1 minuto."
        texto="Te mandamos un link seguro al mail. Cuando entres, elegís la nueva y listo."
      />
    </div>
  )
}
