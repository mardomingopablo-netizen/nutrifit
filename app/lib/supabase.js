import { createClient } from '@supabase/supabase-js'

// La URL y la clave "publishable" son públicas por diseño (van en el cliente).
// La seguridad la da el Row Level Security (RLS) de Supabase: cada usuario solo
// puede leer/escribir su propia fila. Se pueden sobrescribir con variables de
// entorno, pero el fallback permite que funcione en Vercel sin configurar nada.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ytpokbotwpozmgwxrrrn.supabase.co'
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_2n8O22fUlCacne1TR_8nRg_0KtHK4xw'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Al volver desde el enlace de confirmación del email, recoge la sesión de
    // la URL y deja al usuario dentro automáticamente.
    detectSessionInUrl: true,
  },
})
