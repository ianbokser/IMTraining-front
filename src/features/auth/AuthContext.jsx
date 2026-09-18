import { createContext, useContext, useState } from 'react'
import { Navigate } from 'react-router-dom'

const AuthContext = createContext(null)
const STORAGE_KEY = 'imtraining_auth'

// Sesión del usuario. Guarda { token, nombre, email, isAdmin } en localStorage.
export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  })

  const login = (data) => {
    setAuth(data)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }
  const logout = () => {
    setAuth(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}

// Requiere sesión iniciada (cualquier usuario).
export function RequireAuth({ children }) {
  const { auth } = useAuth()
  if (!auth) return <Navigate to="/login" replace />
  return children
}

// Requiere sesión de administrador (isAdmin=true).
export function RequireAdmin({ children }) {
  const { auth } = useAuth()
  if (!auth) return <Navigate to="/login" replace />
  if (!auth.isAdmin) return <Navigate to="/" replace />
  return children
}
