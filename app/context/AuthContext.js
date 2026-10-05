'use client'
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const session = localStorage.getItem('nf_session')
      if (session) {
        setUser(JSON.parse(session))
      }
    } catch {}
    setLoading(false)
  }, [])

  const register = useCallback((name, email, password) => {
    try {
      const users = JSON.parse(localStorage.getItem('nf_users') || '[]')
      if (users.find(u => u.email === email)) {
        return { ok: false, error: 'Ya existe una cuenta con ese email' }
      }
      const newUser = {
        id: Date.now(),
        name,
        email,
        password, // In a real app this would be hashed
        createdAt: new Date().toISOString(),
      }
      users.push(newUser)
      localStorage.setItem('nf_users', JSON.stringify(users))
      const session = { id: newUser.id, name: newUser.name, email: newUser.email }
      localStorage.setItem('nf_session', JSON.stringify(session))
      setUser(session)

      // Enviar registro a Google Sheets
      try {
        const now = new Date()
        const fecha = now.toLocaleDateString('es-ES') + ' ' + now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        fetch('https://script.google.com/macros/s/AKfycbxHWVrqy-dVJlagY-ACvVIP3w2yngvr_WtiF14c8EUqKWIDQPQjSgD3F0JYckCq/exec', {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fecha, nombre: name, email }),
        })
      } catch {}

      return { ok: true }
    } catch {
      return { ok: false, error: 'Error al crear la cuenta' }
    }
  }, [])

  const login = useCallback((email, password) => {
    try {
      const users = JSON.parse(localStorage.getItem('nf_users') || '[]')
      const found = users.find(u => u.email === email && u.password === password)
      if (!found) {
        return { ok: false, error: 'Email o contraseña incorrectos' }
      }
      const session = { id: found.id, name: found.name, email: found.email }
      localStorage.setItem('nf_session', JSON.stringify(session))
      setUser(session)
      return { ok: true }
    } catch {
      return { ok: false, error: 'Error al iniciar sesión' }
    }
  }, [])

  const loginAsGuest = useCallback(() => {
    const session = { id: 'guest_' + Date.now(), name: 'Invitado', email: 'invitado@nutrifit.app', isGuest: true }
    localStorage.setItem('nf_session', JSON.stringify(session))
    setUser(session)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('nf_session')
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, loading, login, register, logout, loginAsGuest }), [user, loading, login, register, logout, loginAsGuest])

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
