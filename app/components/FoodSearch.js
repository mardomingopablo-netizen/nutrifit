'use client'
import { useState } from 'react'
import { Search, Plus, X, Sparkles, AlertCircle, ScanLine, Camera } from 'lucide-react'
import { FOODS_DB, FOOD_CATEGORIES } from '../data/foods'
import { lookupBarcode, searchProducts } from '../lib/openfoodfacts'
import BarcodeScanner from './BarcodeScanner'

export default function FoodSearch({ onAdd, onClose }) {
  const [mode, setMode] = useState('search') // 'search' | 'ai' | 'off'
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [grams, setGrams] = useState({})

  // AI mode
  const [description, setDescription] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiItems, setAiItems] = useState(null)
  const [aiError, setAiError] = useState('')

  // Open Food Facts / barcode mode
  const [scanning, setScanning] = useState(false)
  const [barcode, setBarcode] = useState('')
  const [offQuery, setOffQuery] = useState('')
  const [offResults, setOffResults] = useState(null)
  const [offLoading, setOffLoading] = useState(false)
  const [offError, setOffError] = useState('')

  const filtered = FOODS_DB.filter(f => {
    const matchQ = f.name.toLowerCase().includes(query.toLowerCase())
    const matchC = category === 'all' || f.category === category
    return matchQ && matchC
  })

  // El tracker guarda valores POR 100g y multiplica por los gramos de la
  // porción. Pasamos el alimento tal cual (ya es por 100g) con sus gramos.
  function handleAdd(food) {
    const g = grams[food.id] || 100
    onAdd({ ...food, grams: g })
  }

  // ─── Modo IA: describe cualquier comida o combinación ───
  async function analyze() {
    if (!description.trim()) return
    setIsAnalyzing(true)
    setAiError('')
    setAiItems(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: description.trim() }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setAiError(data.error || 'No se pudo analizar. Inténtalo de nuevo.')
      } else if (!data.items || data.items.length === 0) {
        setAiError('No se detectó ningún alimento. Prueba a describirlo con más detalle.')
      } else {
        setAiItems(data.items)
      }
    } catch {
      setAiError('Error de conexión. Comprueba tu internet.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // La IA devuelve TOTALES por porción. Convertimos a por-100g para el tracker.
  function addAiItem(item) {
    const g = item.grams || 100
    const factor = g > 0 ? 100 / g : 1
    onAdd({
      name: item.name,
      cal: Math.round((item.cal || 0) * factor),
      protein: Math.round((item.protein || 0) * factor * 10) / 10,
      carbs: Math.round((item.carbs || 0) * factor * 10) / 10,
      fat: Math.round((item.fat || 0) * factor * 10) / 10,
      grams: g,
    })
  }

  function addAllAi() {
    if (!aiItems) return
    aiItems.forEach(addAiItem)
    setAiItems(null)
    setDescription('')
  }

  // ─── Open Food Facts / código de barras ───
  async function handleBarcode(code) {
    setScanning(false)
    setOffError('')
    setOffLoading(true)
    setOffResults(null)
    try {
      const product = await lookupBarcode(code)
      if (product) {
        setOffResults([product])
      } else {
        setOffError(`No se encontró el producto (código ${code}). Prueba a buscarlo por nombre.`)
      }
    } catch {
      setOffError('Error de conexión con la base de datos de productos.')
    } finally {
      setOffLoading(false)
    }
  }

  async function searchOff() {
    if (offQuery.trim().length < 2) return
    setOffError('')
    setOffLoading(true)
    setOffResults(null)
    try {
      const results = await searchProducts(offQuery)
      if (results.length === 0) setOffError('No se encontraron productos con ese nombre.')
      setOffResults(results)
    } catch {
      setOffError('Error de conexión con la base de datos de productos.')
    } finally {
      setOffLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
      {/* Mode tabs */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1 flex-1">
          <button
            onClick={() => setMode('search')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
              mode === 'search' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Search size={14} /> Buscar
          </button>
          <button
            onClick={() => setMode('ai')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
              mode === 'ai' ? 'bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Sparkles size={14} /> IA
          </button>
          <button
            onClick={() => setMode('off')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
              mode === 'off' ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <ScanLine size={14} /> Código
          </button>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={18} className="text-gray-500" />
          </button>
        )}
      </div>

      {mode === 'search' ? (
        <>
          {/* Search input */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700/50">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar alimento..."
                autoFocus
                className="w-full pl-9 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide border-b border-gray-100 dark:border-gray-700/50">
            <button
              onClick={() => setCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                category === 'all'
                  ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Todos
            </button>
            {FOOD_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  category === cat.id
                    ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {/* Food list */}
          <div className="max-h-72 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="text-center py-8 px-4">
                <p className="text-gray-400 text-sm mb-3">No se encontró &quot;{query}&quot;</p>
                <button
                  onClick={() => { setMode('ai'); setDescription(query) }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-medium"
                >
                  <Sparkles size={14} /> Analizarlo con IA
                </button>
              </div>
            ) : (
              filtered.map(food => (
                <div key={food.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{food.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {food.cal} kcal · P:{food.protein}g · C:{food.carbs}g · G:{food.fat}g
                      <span className="text-gray-400"> /100g</span>
                    </p>
                  </div>
                  <input
                    type="number"
                    value={grams[food.id] || 100}
                    onChange={e => setGrams(prev => ({ ...prev, [food.id]: Number(e.target.value) }))}
                    className="w-16 px-2 py-1.5 text-xs text-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-none outline-none"
                    min={1}
                  />
                  <span className="text-xs text-gray-400">g</span>
                  <button
                    onClick={() => handleAdd(food)}
                    className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-all"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      ) : mode === 'ai' ? (
        /* ─── AI mode ─── */
        <div className="p-4 space-y-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Escribe cualquier comida o combinación y la IA la desglosará con sus calorías y macros.
          </p>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Ej: Tostada de pan blanco con queso crema y salmón ahumado"
            rows={2}
            autoFocus
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm border-none outline-none text-gray-900 dark:text-white resize-none"
          />
          <button
            onClick={analyze}
            disabled={!description.trim() || isAnalyzing}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analizando...</>
            ) : (
              <><Sparkles size={16} /> Analizar</>
            )}
          </button>

          {aiError && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-xs text-red-700 dark:text-red-400">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{aiError}</span>
            </div>
          )}

          {aiItems && (
            <div className="space-y-2">
              {aiItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.grams}g · {item.cal} kcal · P:{Math.round(item.protein)}g C:{Math.round(item.carbs)}g G:{Math.round(item.fat)}g
                    </p>
                  </div>
                  <button
                    onClick={() => addAiItem(item)}
                    className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-all shrink-0"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={addAllAi}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Añadir todo ({aiItems.length})
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ─── Open Food Facts / código de barras ─── */
        <div className="p-4 space-y-3">
          {scanning ? (
            <BarcodeScanner onDetected={handleBarcode} onClose={() => setScanning(false)} />
          ) : (
            <>
              <button
                onClick={() => { setScanning(true); setOffError('') }}
                className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
              >
                <Camera size={16} /> Escanear código de barras
              </button>

              {/* Manual barcode */}
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={barcode}
                  onChange={e => setBarcode(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && barcode.trim()) handleBarcode(barcode.trim()) }}
                  placeholder="O escribe el código..."
                  className="flex-1 px-3 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm border-none outline-none text-gray-900 dark:text-white"
                />
                <button
                  onClick={() => barcode.trim() && handleBarcode(barcode.trim())}
                  className="px-4 py-2.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium"
                >
                  Buscar
                </button>
              </div>

              {/* Name search (Open Food Facts) */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={offQuery}
                    onChange={e => setOffQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') searchOff() }}
                    placeholder="O busca un producto por nombre..."
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm border-none outline-none text-gray-900 dark:text-white"
                  />
                </div>
                <button
                  onClick={searchOff}
                  className="px-4 py-2.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium"
                >
                  Buscar
                </button>
              </div>
            </>
          )}

          {offLoading && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              Buscando producto...
            </div>
          )}

          {offError && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl text-xs text-amber-700 dark:text-amber-400">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{offError}</span>
            </div>
          )}

          {offResults && offResults.length > 0 && (
            <div className="max-h-72 overflow-y-auto space-y-2">
              {offResults.map(food => (
                <div key={food.id} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2.5">
                  {food.image && (
                    <img src={food.image} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{food.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {food.cal} kcal · P:{food.protein}g · C:{food.carbs}g · G:{food.fat}g
                      <span className="text-gray-400"> /100g</span>
                    </p>
                  </div>
                  <input
                    type="number"
                    value={grams[food.id] || 100}
                    onChange={e => setGrams(prev => ({ ...prev, [food.id]: Number(e.target.value) }))}
                    className="w-14 px-1 py-1.5 text-xs text-center rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white border-none outline-none shrink-0"
                    min={1}
                  />
                  <span className="text-xs text-gray-400">g</span>
                  <button
                    onClick={() => handleAdd(food)}
                    className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-all shrink-0"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
