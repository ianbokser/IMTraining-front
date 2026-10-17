import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../components/Button'
import { Input } from '../components/Field'
import AuthAside from '../components/AuthAside'
import { api } from '../lib/api'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [status, setStatus] = useState('checking') // checking | valid | invalid | done
  const [userInfo, setUserInfo] = useState(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus('invalid')
      return
    }
    api
      .verifyResetToken(token)
      .then((data) => {
        setUserInfo(data)
        setStatus('valid')
      })
      .catch(() => setStatus('invalid'))
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('La contraseña nueva debe tener al menos 8 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setLoading(true)
    try {
      await api.resetPassword(token, password)
      setStatus('done')
      setTimeout(() => navigate('/login'), 1800)
    } catch (err) {
      setError(err.message || 'No se pudo actualizar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 lg:grid-cols-2 lg:items-center lg:py-20">
      <div className="mx-auto w-full max-w-md">
        <p className="kicker mb-3 text-volt-deep">
          <span className="mr-2">—</span>
          Nueva contraseña
        </p>
        <h1 className="font-display text-5xl font-black uppercase leading-[0.92] text-white sm:text-6xl">
          Elegí una <span className="text-gradient">nueva.</span>
        </h1>
        <p className="mt-3 text-muted">
          {status === 'valid' && userInfo?.email
            ? `Vas a cambiar la contraseña de ${userInfo.email}.`
            : 'Validamos el link y en un instante vas a poder elegir tu contraseña nueva.'}
        </p>

        <div className="relative mt-8 overflow-hidden rounded-3xl border border-line bg-ink-2 p-6 sm:p-8">
          <div className="glow pointer-events-none absolute -right-20 -top-20 h-64 w-64" />

          {status === 'checking' && (
            <p className="relative text-sm text-muted">Validando el link…</p>
          )}

          {status === 'invalid' && (
            <div className="relative space-y-4">
              <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-3 text-sm font-medium text-danger">
                El link está vencido o es inválido. Pedí uno nuevo.
              </p>
              <Link
                to="/olvide-password"
                className="block text-center text-sm font-medium text-volt hover:underline"
              >
                Pedir otro link
              </Link>
            </div>
          )}

          {status === 'done' && (
            <div className="relative space-y-4">
              <p className="rounded-lg border border-volt/40 bg-volt/10 px-3 py-3 text-sm font-medium text-volt">
                Listo. Tu contraseña se actualizó. Te mandamos al login…
              </p>
            </div>
          )}

          {status === 'valid' && (
            <form onSubmit={handleSubmit} className="relative space-y-5">
              <Input
                label="Nueva contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                required
              />
              <Input
                label="Repetila"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Igual a la anterior"
                autoComplete="new-password"
                required
              />
              {error && (
                <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
                  {error}
                </p>
              )}
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Guardando…' : 'Guardar contraseña nueva'}
              </Button>
            </form>
          )}
        </div>
      </div>

      <AuthAside
        titulo="Contraseña nueva en segundos."
        texto="Después del cambio, entrás con tu email y la contraseña nueva."
      />
    </div>
  )
}
