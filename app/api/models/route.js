import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

// Misma limpieza que en /api/analyze: transliterar homoglifos y quitar basura.
function cleanApiKey(key) {
  if (!key) return key
  const homoglyphs = {
    'а': 'a', 'А': 'A', 'е': 'e', 'Е': 'E', 'о': 'o', 'О': 'O',
    'с': 'c', 'С': 'C', 'р': 'p', 'Р': 'P', 'х': 'x', 'Х': 'X',
    'у': 'y', 'У': 'Y', 'к': 'k', 'К': 'K', 'м': 'M', 'М': 'M',
    'т': 'T', 'Т': 'T', 'в': 'B', 'В': 'B', 'н': 'H', 'Н': 'H',
    'і': 'i', 'І': 'I', 'ѕ': 's', 'Ѕ': 'S', 'ј': 'j', 'Ј': 'J',
    'ο': 'o', 'Ο': 'O', 'α': 'a', 'ρ': 'p', 'ε': 'e', 'ν': 'v',
    ' ': '', '​': '', '‌': '', '‍': '', '﻿': '',
  }
  return key
    .split('')
    .map(ch => (homoglyphs[ch] !== undefined ? homoglyphs[ch] : ch))
    .join('')
    .replace(/[^A-Za-z0-9._\-]/g, '')
    .trim()
}

export async function GET() {
  const apiKey = cleanApiKey(process.env.GEMINI_API_KEY)
  if (!apiKey) {
    return NextResponse.json({ error: 'Falta GEMINI_API_KEY' }, { status: 500 })
  }
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
      headers: { 'x-goog-api-key': apiKey },
    })
    const text = await res.text()
    if (!res.ok) {
      return NextResponse.json({ status: res.status, error: text.slice(0, 500) }, { status: 502 })
    }
    const data = JSON.parse(text)
    const models = (data.models || [])
      .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
      .map(m => ({ name: m.name, displayName: m.displayName }))
    return NextResponse.json({ count: models.length, models })
  } catch (err) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 })
  }
}
