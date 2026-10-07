import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest'

const SYSTEM_PROMPT = `Eres un nutricionista experto que analiza fotos de comida con máxima precisión, al nivel de las mejores apps de nutrición.

Tu tarea: identificar TODOS los alimentos del plato o la imagen y estimar sus valores nutricionales reales.

Instrucciones:
- Identifica cada alimento o ingrediente distinto por separado (por ejemplo: "Pechuga de pollo a la plancha", "Arroz blanco", "Ensalada de tomate", "Aceite de oliva").
- Estima el peso real de cada porción en GRAMOS usando pistas visuales: el tamaño del plato, los cubiertos, la proporción de la imagen y las raciones típicas.
- Ten en cuenta aceites, salsas, aliños y métodos de cocción (frito suma más grasa que a la plancha).
- Para cada alimento da las CALORÍAS TOTALES y los macros TOTALES (proteína, carbohidratos, grasa en gramos) de la porción estimada, NO por 100g.
- Los nombres de los alimentos deben estar en español.
- Si hay varios alimentos en un plato variado, desglósalos todos.
- Si el usuario añade una descripción, úsala para afinar la estimación (cantidades, ingredientes, forma de cocción).
- Sé realista y preciso. No redondees de forma exagerada.

Devuelve únicamente el JSON con el array de alimentos.`

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    items: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          grams: { type: 'NUMBER' },
          cal: { type: 'NUMBER' },
          protein: { type: 'NUMBER' },
          carbs: { type: 'NUMBER' },
          fat: { type: 'NUMBER' },
        },
        required: ['name', 'grams', 'cal', 'protein', 'carbs', 'fat'],
      },
    },
  },
  required: ['items'],
}

// Convierte caracteres homóglifos (cirílicos/griegos que parecen latinos) de vuelta
// a ASCII y elimina cualquier carácter inválido. Protege contra claves "contaminadas"
// al copiar/pegar, que si no provocan errores de cabecera HTTP.
function cleanApiKey(key) {
  if (!key) return key
  const homoglyphs = {
    'а': 'a', 'А': 'A', 'е': 'e', 'Е': 'E', 'о': 'o', 'О': 'O',
    'с': 'c', 'С': 'C', 'р': 'p', 'Р': 'P', 'х': 'x', 'Х': 'X',
    'у': 'y', 'У': 'Y', 'к': 'k', 'К': 'K', 'м': 'M', 'М': 'M',
    'т': 'T', 'Т': 'T', 'в': 'B', 'В': 'B', 'н': 'H', 'Н': 'H',
    'і': 'i', 'І': 'I', 'ѕ': 's', 'Ѕ': 'S', 'ј': 'j', 'Ј': 'J',
    'ο': 'o', 'Ο': 'O', 'α': 'a', 'ρ': 'p', 'ε': 'e', 'ν': 'v',
    ' ': '', '​': '', '‌': '', '‍': '', '﻿': '',
  }
  return key
    .split('')
    .map(ch => (homoglyphs[ch] !== undefined ? homoglyphs[ch] : ch))
    .join('')
    .replace(/[^A-Za-z0-9._\-]/g, '')
    .trim()
}

export async function POST(request) {
  const apiKey = cleanApiKey(process.env.GEMINI_API_KEY)
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Falta la clave de la IA. Configura GEMINI_API_KEY en Vercel.' },
      { status: 500 }
    )
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Petición inválida' }, { status: 400 })
  }

  const { image, mimeType, description } = body || {}

  // Permite sobrescribir el modelo desde el body para diagnosticar rapido.
  const rawModel = typeof body?.model === 'string' ? body.model : ''
  const MODEL = rawModel.replace(/[^A-Za-z0-9._\-]/g, '') || DEFAULT_MODEL

  if (!image && !description) {
    return NextResponse.json({ error: 'Envía una foto o una descripción' }, { status: 400 })
  }

  // Build Gemini request parts
  const parts = []

  let userText = SYSTEM_PROMPT + '\n\n'
  if (image) {
    userText += 'Analiza la comida de esta imagen.'
  } else {
    userText += 'Analiza esta comida descrita por el usuario.'
  }
  if (description && description.trim()) {
    userText += `\n\nDescripción del usuario: "${description.trim()}"`
  }
  parts.push({ text: userText })

  if (image) {
    // Strip data URL prefix if present
    const base64 = image.includes(',') ? image.split(',')[1] : image
    parts.push({
      inline_data: {
        mime_type: mimeType || 'image/jpeg',
        data: base64,
      },
    })
  }

  const geminiBody = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
    },
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

    // Reintenta cuando el modelo esta saturado (503) o con rate limit (429),
    // pero con un presupuesto de tiempo estricto para no agotar el limite de
    // la funcion de Vercel y provocar un 504. Cada peticion a Gemini tiene su
    // propio timeout, y solo reintentamos si aun queda margen.
    const MAX_ATTEMPTS = 2
    const DEADLINE = Date.now() + 45000 // margen bajo el maxDuration de 60s
    const PER_REQUEST_TIMEOUT = 20000
    let res
    let errText = ''
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const ctrl = new AbortController()
      const to = setTimeout(() => ctrl.abort(), PER_REQUEST_TIMEOUT)
      try {
        res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify(geminiBody),
          signal: ctrl.signal,
        })
      } finally {
        clearTimeout(to)
      }

      if (res.ok) break

      errText = await res.text()
      const retryable = res.status === 503 || res.status === 429
      // Solo reintentamos si es un error pasajero y queda tiempo de sobra.
      if (!retryable || attempt === MAX_ATTEMPTS || Date.now() + 10000 > DEADLINE) break

      await new Promise(r => setTimeout(r, 1000))
    }

    if (!res.ok) {
      const saturado = res.status === 503 || res.status === 429
      const mensaje = saturado
        ? 'La IA esta saturada en este momento. Vuelve a intentarlo en unos segundos.'
        : 'Gemini: ' + errText.slice(0, 400)
      return NextResponse.json(
        { error: mensaje, detail: errText.slice(0, 400) },
        { status: 502 }
      )
    }

    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      return NextResponse.json({ error: 'La IA no devolvió resultados' }, { status: 502 })
    }

    let parsed
    try {
      parsed = JSON.parse(text)
    } catch {
      return NextResponse.json({ error: 'No se pudo interpretar la respuesta de la IA' }, { status: 502 })
    }

    let items = Array.isArray(parsed?.items) ? parsed.items : []
    // Sanitize numbers
    items = items
      .map(it => ({
        name: String(it.name || 'Alimento'),
        grams: Math.max(0, Math.round(Number(it.grams) || 0)),
        cal: Math.max(0, Math.round(Number(it.cal) || 0)),
        protein: Math.max(0, Math.round((Number(it.protein) || 0) * 10) / 10),
        carbs: Math.max(0, Math.round((Number(it.carbs) || 0) * 10) / 10),
        fat: Math.max(0, Math.round((Number(it.fat) || 0) * 10) / 10),
      }))
      .filter(it => it.cal > 0 || it.grams > 0)

    if (items.length === 0) {
      return NextResponse.json({ error: 'No se detectó ningún alimento. Prueba con otra foto o añade una descripción.' }, { status: 200 })
    }

    const totals = items.reduce(
      (acc, it) => ({
        cal: acc.cal + it.cal,
        protein: acc.protein + it.protein,
        carbs: acc.carbs + it.carbs,
        fat: acc.fat + it.fat,
      }),
      { cal: 0, protein: 0, carbs: 0, fat: 0 }
    )
    totals.cal = Math.round(totals.cal)
    totals.protein = Math.round(totals.protein * 10) / 10
    totals.carbs = Math.round(totals.carbs * 10) / 10
    totals.fat = Math.round(totals.fat * 10) / 10

    return NextResponse.json({ items, totals })
  } catch (err) {
    return NextResponse.json({ error: 'Conexión IA: ' + (err?.message || String(err)) }, { status: 500 })
  }
}
