'use client'
import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { DAYS, MEALS, MEAL_LABELS } from '../data/foods'
import { Camera, Upload, Sparkles, Plus, Trash2, Utensils, X, Image as ImageIcon } from 'lucide-react'

// Simulated AI estimation based on common food keywords
function estimateFromDescription(description) {
  const desc = description.toLowerCase()
  const items = []

  const foodMap = [
    { keywords: ['pollo', 'pechuga', 'chicken'], name: 'Pechuga de pollo', cal: 165, protein: 31, carbs: 0, fat: 3.6, grams: 150 },
    { keywords: ['arroz', 'rice'], name: 'Arroz blanco', cal: 130, protein: 2.7, carbs: 28, fat: 0.3, grams: 200 },
    { keywords: ['pasta', 'espagueti', 'macarrones'], name: 'Pasta cocida', cal: 131, protein: 5, carbs: 25, fat: 1.1, grams: 200 },
    { keywords: ['ensalada', 'salad', 'lechuga'], name: 'Ensalada mixta', cal: 20, protein: 1.5, carbs: 3, fat: 0.3, grams: 150 },
    { keywords: ['huevo', 'egg', 'tortilla'], name: 'Huevos (x2)', cal: 155, protein: 13, carbs: 1.1, fat: 11, grams: 100 },
    { keywords: ['pan', 'bread', 'tostada'], name: 'Pan', cal: 265, protein: 9, carbs: 49, fat: 3.2, grams: 60 },
    { keywords: ['salmon', 'salmón', 'pescado', 'fish'], name: 'Salmón a la plancha', cal: 208, protein: 20, carbs: 0, fat: 13, grams: 150 },
    { keywords: ['patata', 'papa', 'potato'], name: 'Patata cocida', cal: 77, protein: 2, carbs: 17, fat: 0.1, grams: 200 },
    { keywords: ['tomate', 'tomato'], name: 'Tomate', cal: 18, protein: 0.9, carbs: 3.9, fat: 0.2, grams: 100 },
    { keywords: ['aguacate', 'avocado'], name: 'Aguacate', cal: 160, protein: 2, carbs: 8.5, fat: 14.7, grams: 100 },
    { keywords: ['yogur', 'yogurt'], name: 'Yogur griego', cal: 59, protein: 10, carbs: 3.6, fat: 0.7, grams: 170 },
    { keywords: ['fruta', 'manzana', 'plátano', 'banana', 'naranja'], name: 'Fruta variada', cal: 52, protein: 0.3, carbs: 14, fat: 0.2, grams: 150 },
    { keywords: ['carne', 'ternera', 'beef', 'filete'], name: 'Filete de ternera', cal: 250, protein: 26, carbs: 0, fat: 15, grams: 150 },
    { keywords: ['atún', 'tuna'], name: 'Atún', cal: 132, protein: 28, carbs: 0, fat: 1.3, grams: 120 },
    { keywords: ['queso', 'cheese'], name: 'Queso', cal: 402, protein: 25, carbs: 1.3, fat: 33, grams: 40 },
    { keywords: ['leche', 'milk'], name: 'Leche semidesnatada', cal: 46, protein: 3.3, carbs: 4.8, fat: 1.5, grams: 250 },
    { keywords: ['aceite', 'oil', 'oliva'], name: 'Aceite de oliva', cal: 884, protein: 0, carbs: 0, fat: 100, grams: 15 },
    { keywords: ['legumbres', 'lentejas', 'garbanzos', 'judías'], name: 'Legumbres cocidas', cal: 116, protein: 9, carbs: 20, fat: 0.4, grams: 200 },
    { keywords: ['batido', 'shake', 'protein', 'whey'], name: 'Batido de proteínas', cal: 120, protein: 24, carbs: 3, fat: 1.5, grams: 300 },
    { keywords: ['café', 'coffee'], name: 'Café con leche', cal: 30, protein: 1.5, carbs: 2.5, fat: 1, grams: 200 },
    { keywords: ['pizza'], name: 'Pizza (2 porciones)', cal: 266, protein: 11, carbs: 33, fat: 10, grams: 200 },
    { keywords: ['hamburguesa', 'burger'], name: 'Hamburguesa', cal: 295, protein: 17, carbs: 24, fat: 14, grams: 200 },
    { keywords: ['sopa', 'caldo'], name: 'Sopa/Caldo', cal: 40, protein: 3, carbs: 5, fat: 1, grams: 300 },
    { keywords: ['verdura', 'brócoli', 'brocoli', 'espinaca', 'judía verde'], name: 'Verduras variadas', cal: 35, protein: 2.5, carbs: 6, fat: 0.4, grams: 200 },
    { keywords: ['sandwich', 'bocadillo'], name: 'Bocadillo', cal: 280, protein: 15, carbs: 30, fat: 10, grams: 180 },
  ]

  foodMap.forEach(food => {
    if (food.keywords.some(k => desc.includes(k))) {
      items.push({ ...food, keywords: undefined })
    }
  })

  // Default if nothing matched
  if (items.length === 0) {
    items.push({ name: 'Comida estimada', cal: 450, protein: 25, carbs: 45, fat: 15, grams: 350 })
  }

  const totals = items.reduce((acc, item) => {
    const g = item.grams / 100
    return {
      cal: acc.cal + Math.round(item.cal * g),
      protein: acc.protein + Math.round(item.protein * g * 10) / 10,
      carbs: acc.carbs + Math.round(item.carbs * g * 10) / 10,
      fat: acc.fat + Math.round(item.fat * g * 10) / 10,
    }
  }, { cal: 0, protein: 0, carbs: 0, fat: 0 })

  return { items, totals }
}

export default function PhotoPage() {
  const { addFoodToTracker, addPhotoEstimate, photoEstimates, currentDay } = useApp()
  const [description, setDescription] = useState('')
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoThumb, setPhotoThumb] = useState(null)
  const [estimation, setEstimation] = useState(null)
  const [isEstimating, setIsEstimating] = useState(false)
  const [addMeal, setAddMeal] = useState('lunch')
  const [showHistory, setShowHistory] = useState(false)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  function handlePhotoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new window.Image()
      img.onload = () => {
        // Create full preview
        setPhotoPreview(ev.target.result)
        // Create small thumbnail for history (max 200px)
        const canvas = document.createElement('canvas')
        const maxSize = 200
        const ratio = Math.min(maxSize / img.width, maxSize / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        setPhotoThumb(canvas.toDataURL('image/jpeg', 0.6))
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }

  function removePhoto() {
    setPhotoPreview(null)
    setPhotoThumb(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  function handleEstimate() {
    if (!description.trim() && !photoPreview) return
    setIsEstimating(true)
    // Simulate AI processing delay
    setTimeout(() => {
      const text = description.trim() || 'comida estimada'
      const result = estimateFromDescription(text)
      setEstimation(result)
      setIsEstimating(false)
    }, photoPreview ? 2000 : 1200)
  }

  function handleAddToTracker() {
    if (!estimation) return
    const day = DAYS[currentDay]
    estimation.items.forEach(item => {
      addFoodToTracker(day, addMeal, {
        name: item.name + ' (IA)',
        cal: item.cal,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        grams: item.grams,
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
    setPhotoPreview(null)
    setPhotoThumb(null)
    setEstimation(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Estimación IA</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sube una foto o describe tu comida y la IA estimará calorías y macros</p>
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
              <h2 className="font-semibold text-gray-900 dark:text-white">Sube una foto de tu comida</h2>
            </div>

            {/* Hidden file inputs */}
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
                {photoPreview ? 'Añade una descripción (opcional)' : 'O describe tu comida'}
              </h2>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              {photoPreview
                ? 'Puedes añadir detalles para mejorar la estimación.'
                : 'Escribe lo que has comido. Cuanto más detallado, mejor será la estimación.'}
            </p>

            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ej: Pechuga de pollo a la plancha con arroz blanco y ensalada de tomate con aguacate"
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm border-none outline-none text-gray-900 dark:text-white resize-none"
            />

            <button
              onClick={handleEstimate}
              disabled={(!description.trim() && !photoPreview) || isEstimating}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-700 dark:disabled:to-gray-600 text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              {isEstimating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {photoPreview ? 'Analizando imagen...' : 'Analizando...'}
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Estimar calorías
                </>
              )}
            </button>
          </div>

          {/* Estimation result */}
          {estimation && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={20} className="text-emerald-500" />
                <h2 className="font-semibold text-gray-900 dark:text-white">Resultado de la estimación</h2>
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
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{Math.round(item.cal * item.grams / 100)} kcal</p>
                      <p className="text-xs text-gray-500">P:{Math.round(item.protein * item.grams / 100)}g C:{Math.round(item.carbs * item.grams / 100)}g G:{Math.round(item.fat * item.grams / 100)}g</p>
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
