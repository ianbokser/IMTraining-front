import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../features/auth/AuthContext'
import { api } from '../lib/api'

// Botón oficial de Google (Google Identity Services) encapsulado para la app.
// Se encarga de:
//  - Pedir el ID token a Google
//  - Mandarlo al backend (/api/auth/google)
//  - Guardar la sesión y redirigir al cliente (o al panel si es admin)
//
// Si no hay VITE_GOOGLE_CLIENT_ID configurado, no renderiza nada (así no explota en dev).
export default function GoogleLoginButton({ onError, text = 'signin_with' }) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)

  if (!clientId) {
    // En dev sin credenciales todavía: mostramos un placeholder discreto para que no
    // "desaparezca" el espacio del botón, pero no intentamos abrir Google.
    return (
      <div className="rounded-xl border border-dashed border-line bg-ink-3/50 px-4 py-3 text-center text-xs text-muted-2">
        Configurá <code className="text-volt">VITE_GOOGLE_CLIENT_ID</code> en el{' '}
        <code className="text-volt">.env</code> para habilitar Google.
      </div>
    )
  }

  const handleSuccess = async ({ credential }) => {
    if (!credential) {
      onError?.('No llegó el credential de Google.')
      return
    }
    setLoading(true)
    try {
      const data = await api.loginWithGoogle(credential)
      login(data)
      navigate(data.isAdmin ? '/admin' : '/pedido')
    } catch (err) {
      onError?.(err.message || 'No se pudo iniciar sesión con Google')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative w-full">
      <div className={loading ? 'pointer-events-none opacity-60' : ''}>
        {/* El botón de Google renderiza su propio UI. Lo centramos y lo dejamos "ancho".
            theme="filled_black" combina mejor con la paleta oscura; size="large" para que
            no quede chiquito al lado de nuestros Button lg. */}
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => onError?.('Google canceló o bloqueó el login.')}
          theme="filled_black"
          size="large"
          shape="pill"
          text={text}
          width="100%"
          locale="es-419"
        />
      </div>
      {loading && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-xs font-medium text-muted">
          Ingresando…
        </div>
      )}
    </div>
  )
}
