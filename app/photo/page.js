'use client'
import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { MEALS, MEAL_LABELS } from '../data/foods'
import { Camera, Upload, Sparkles, Trash2, Utensils, X, Image as ImageIcon, AlertCircle } from 'lucide-react'

export default function PhotoPage() {
  const { addFoodToTracker, addPhotoEstimate, photoEstimates } = useApp()
  const [description, setDescription] = useState('')
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoForApi, setPhotoForApi] = useState(null)
  const [photoThumb, setPhotoThumb] = useState(null)
  const [estimation, setEstimation] = useState(null)
  const [isEstimating, setIsEstimating] = useState(false)
  const [error, setError] = useState('')
  const [addMeal, setAddMeal] = useState('lunch')
  const [showHistory, setShowHistory] = useState(false)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  function handlePhotoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setEstimation(null)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new window.Image()
      img.onload = () => {
        setPhotoPreview(ev.target.result)

        // Medium-size version for the AI (max 1024px, good quality)
        const apiCanvas = document.createElement('canvas')
        const apiMax = 1024
        const apiRatio = Math.min(apiMax / img.width, apiMax / img.height, 1)
        apiCanvas.width = Math.round(img.width * apiRatio)
        apiCanvas.height = Math.round(img.height * apiRatio)
        apiCanvas.getContext('2d').drawImage(img, 0, 0, apiCanvas.width, apiCanvas.height)
        setPhotoForApi(apiCanvas.toDataURL('image/jpeg', 0.85))

        // Small thumbnail for history (max 200px)
        const canvas = document.createElement('canvas')
        const maxSize = 200
        const ratio = Math.min(maxSize / img.width, maxSize / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        setPhotoThumb(canvas.toDataURL('image/jpeg', 0.6))
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }

  function removePhoto() {
    setPhotoPreview(null)
    setPhotoForApi(null)
    setPhotoThumb(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  async function handleEstimate() {
    if (!description.trim() && !photoForApi) return
    setIsEstimating(true)
    setError('')
    setEstimation(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: photoForApi || undefined,
          mimeType: 'image/jpeg',
          description: description.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error || 'No se pudo analizar la comida. Inténtalo de nuevo.')
      } else if (!data.items || data.items.length === 0) {
        setError('No se detectó ningún alimento. Prueba con otra foto o añade una descripción.')
      } else {
        setEstimation(data)
      }
    } catch {
      setError('Error de conexión. Comprueba tu internet e inténtalo de nuevo.')
    } finally {
      setIsEstimating(false)
    }
  }

  function handleAddToTracker() {
    if (!estimation) return
    estimation.items.forEach(item => {
      const grams = item.grams || 100
      const factor = grams > 0 ? 100 / grams : 1
      // Store per-100g values so the tracker reproduces the estimated totals
      addFoodToTracker(addMeal, {
        name: item.name + ' (IA)',
        cal: Math.round(item.cal * factor),
        protein: Math.round(item.protein * factor * 10) / 10,
        carbs: Math.round(item.carbs * factor * 10) / 10,
        fat: Math.round(item.fat * factor * 10) / 10,
        grams,
      })
    })
    addPhotoEstimate({
      description: description || '(Estimación por foto)',
      photo: photoThumb,
      items: estimation.items,
      totals: estimation.totals,
      meal: addMeal,
    })
    setDescription('')
    removePhoto()
    setEstimation(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Escáner IA</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Haz una foto a tu plato y la IA detectará los alimentos y calculará calorías y macros</p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            showHistory
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
          }`}
        >
          {showHistory ? <><X size={16} /> Cerrar historial</> : <><ImageIcon size={16} /> Historial ({photoEstimates.length})</>}
        </button>
      </div>

      {!showHistory && (
        <>
          {/* Photo upload section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Camera size={20} className="text-blue-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white">Escanea tu comida</h2>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {!photoPreview ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 flex flex-col items-center gap-3 py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                    <Camera size={24} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Hacer foto</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Usa la cámara</p>
                  </div>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex flex-col items-center gap-3 py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5 transition-all cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                    <Upload size={24} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Subir imagen</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Desde galería</p>
                  </div>
                </button>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Tu comida"
                  className="w-full max-h-72 object-cover rounded-xl"
                />
                <button
                  onClick={removePhoto}
                  className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-xl transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Description section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={20} className="text-amber-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {photoPreview ? 'Añade detalles (opcional)' : 'O describe tu comida'}
              </h2>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              {photoPreview
                ? 'Añade detalles para afinar la estimación (cantidad, ingredientes, forma de cocción).'
                : 'Escribe lo que has comido. Cuanto más detallado, mejor será la estimación.'}
            </p>

            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ej: Plato grande con pechuga de pollo a la plancha, arroz blanco y ensalada de tomate con aceite de oliva"
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm border-none outline-none text-gray-900 dark:text-white resize-none"
            />

            <button
              onClick={handleEstimate}
              disabled={(!description.trim() && !photoForApi) || isEstimating}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-700 dark:disabled:to-gray-600 text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              {isEstimating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {photoForApi ? 'Analizando imagen...' : 'Analizando...'}
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Analizar con IA
                </>
              )}
            </button>

            {error && (
              <div className="flex items-start gap-2 px-4 py-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-700 dark:text-red-400">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Estimation result */}
          {estimation && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={20} className="text-emerald-500" />
                <h2 className="font-semibold text-gray-900 dark:text-white">Alimentos detectados</h2>
              </div>

              {/* Items */}
              <div className="space-y-2">
                {estimation.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.grams}g</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{item.cal} kcal</p>
                      <p className="text-xs text-gray-500">P:{Math.round(item.protein)}g C:{Math.round(item.carbs)}g G:{Math.round(item.fat)}g</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-4 border border-emerald-200 dark:border-emerald-500/20">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2">Total estimado</p>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{estimation.totals.cal}</p>
                    <p className="text-xs text-gray-500">kcal</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-emerald-600">{Math.round(estimation.totals.protein)}g</p>
                    <p className="text-xs text-gray-500">Proteína</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-600">{Math.round(estimation.totals.carbs)}g</p>
                    <p className="text-xs text-gray-500">Carbos</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-amber-600">{Math.round(estimation.totals.fat)}g</p>
                    <p className="text-xs text-gray-500">Grasa</p>
                  </div>
                </div>
              </div>

              {/* Add to tracker */}
              <div className="flex gap-3 pt-2">
                <select
                  value={addMeal}
                  onChange={e => setAddMeal(e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm border-none outline-none text-gray-900 dark:text-white"
                >
                  {MEALS.map(m => <option key={m} value={m}>{MEAL_LABELS[m]}</option>)}
                </select>
                <button
                  onClick={handleAddToTracker}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                >
                  <Utensils size={16} /> Añadir al tracker
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                * Las estimaciones son aproximadas. Ajusta las cantidades en el tracker si es necesario.
              </p>
            </div>
          )}
        </>
      )}

      {/* History */}
      {showHistory && (
        <div>
          {photoEstimates.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
              <ImageIcon size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No tienes estimaciones guardadas</p>
              <p className="text-sm text-gray-400 mt-1">Las estimaciones se guardan automáticamente al añadirlas al tracker</p>
            </div>
          ) : (
            <div className="space-y-4">
              {[...photoEstimates].reverse().map((est) => (
                <div key={est.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                  <div className="flex items-start gap-4 mb-3">
                    {est.photo && (
                      <img
                        src={est.photo}
                        alt="Comida"
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{est.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(est.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        {' · '}{MEAL_LABELS[est.meal]}
                        {est.photo && ' · Con foto'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{est.totals.cal}</p>
                      <p className="text-[10px] text-gray-400">kcal</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-500">{Math.round(est.totals.protein)}g</p>
                      <p className="text-[10px] text-gray-400">Prot</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-500">{Math.round(est.totals.carbs)}g</p>
                      <p className="text-[10px] text-gray-400">Carb</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-amber-500">{Math.round(est.totals.fat)}g</p>
                      <p className="text-[10px] text-gray-400">Grasa</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {est.items.map(i => i.name).join(' · ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
