import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ytpokbotwpozmgwxrrrn.supabase.co'
// Clave SECRETA de servicio: solo en el servidor, nunca en el navegador ni en
// el repositorio. Se configura como variable de entorno en Vercel.
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbxy6YsFxBn-3p-_2XzFBusUxpr6A8B108uXn7LdXVex_PBowxXtcM4fEJuWvGpYOSG5/exec'

export async function POST(request) {
  if (!SERVICE_KEY) {
    return NextResponse.json(
      { error: 'Falta configurar SUPABASE_SERVICE_ROLE_KEY en el servidor (Vercel).' },
      { status: 500 }
    )
  }

  let body
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Petición inválida' }, { status: 400 }) }

  const name = String(body?.name || '').trim()
  const email = String(body?.email || '').trim().toLowerCase()
  const password = String(body?.password || '')

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Faltan datos (nombre, email o contraseña)' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
  }

  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Crea el usuario YA confirmado: no se envía email de confirmación.
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  })

  if (error) {
    const m = (error.message || '').toLowerCase()
    if (m.includes('already') || m.includes('registered') || m.includes('exists') || m.includes('duplicate')) {
      return NextResponse.json({ error: 'Ya existe una cuenta con ese email' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message || 'No se pudo crear la cuenta' }, { status: 400 })
  }

  // Registro en Google Sheets (desde el servidor, best-effort).
  try {
    const now = new Date()
    const fecha = encodeURIComponent(now.toLocaleDateString('es-ES') + ' ' + now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }))
    const url = `${SHEET_URL}?fecha=${fecha}&nombre=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`
    await fetch(url)
  } catch {}

  return NextResponse.json({ ok: true })
}
