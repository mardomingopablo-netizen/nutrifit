'use client'
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

function mapUser(u) {
  if (!u) return null
  return {
    id: u.id,
    email: u.email,
    name: u.user_metadata?.name || (u.email ? u.email.split('@')[0] : 'Usuario'),
  }
}

// Traduce los errores de Supabase a mensajes claros en español.
function translateError(msg) {
  if (!msg) return 'Ha ocurrido un error. Inténtalo de nuevo.'
  const m = msg.toLowerCase()
  if (m.includes('invalid login')) return 'Email o contraseña incorrectos'
  if (m.includes('already registered') || m.includes('already been registered')) return 'Ya existe una cuenta con ese email'
  if (m.includes('password should be at least')) return 'La contraseña es demasiado corta'
  if (m.includes('unable to validate email') || m.includes('invalid email')) return 'Email no válido'
  if (m.includes('email not confirmed')) return 'Confirma tu email antes de iniciar sesión'
  if (m.includes('network') || m.includes('fetch')) return 'Sin conexión. Comprueba tu internet.'
  return msg
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setUser(mapUser(data.session?.user))
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapUser(session?.user))
    })
    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [])

  const register = useCallback(async (name, email, password) => {
    try {
      // Crea el usuario ya confirmado desde el servidor (sin email) y además
      // lo registra en Google Sheets.
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.error) {
        return { ok: false, error: translateError(data.error) }
      }
      // Cuenta creada y confirmada: iniciar sesión directamente.
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { ok: false, error: translateError(error.message) }
      return { ok: true }
    } catch (e) {
      return { ok: false, error: translateError(e?.message) }
    }
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { ok: false, error: translateError(error.message) }
      return { ok: true }
    } catch (e) {
      return { ok: false, error: translateError(e?.message) }
    }
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout])

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
