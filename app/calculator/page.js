'use client'
import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import MacroRing from '../components/MacroRing'
import { Calculator, Save, RotateCcw, History, Trash2 } from 'lucide-react'

const ACTIVITIES = [
  { id: 'sedentary', label: 'Sedentario', desc: 'Trabajo de oficina, poco ejercicio', mult: 1.2 },
  { id: 'light', label: 'Ligero', desc: '1-3 días/semana ejercicio suave', mult: 1.375 },
  { id: 'moderate', label: 'Moderado', desc: '3-5 días/semana ejercicio moderado', mult: 1.55 },
  { id: 'active', label: 'Activo', desc: '6-7 días/semana ejercicio intenso', mult: 1.725 },
  { id: 'very_active', label: 'Muy activo', desc: 'Atleta o trabajo físico intenso', mult: 1.9 },
]

const GOALS = [
  { id: 'deficit', label: 'Definición', desc: '-500 kcal', color: 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' },
  { id: 'maintenance', label: 'Mantenimiento', desc: '0 kcal', color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
  { id: 'bulk', label: 'Volumen', desc: '+400 kcal', color: 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400' },
]

export default function CalculatorPage() {
  const { profile, saveProfileWithHistory, calculateBMR, calculateTDEE, calculateMacros, targetCalories, targetMacros, profileHistory, removeProfileHistory } = useApp()

  const [form, setForm] = useState({
    name: profile.name || '',
    age: profile.age,
    weight: profile.weight,
    height: profile.height,
    gender: profile.gender,
    activity: profile.activity,
    goal: profile.goal,
  })

  const [saved, setSaved] = useState(false)

  // Rellena el formulario con el perfil guardado cuando este cambia (al iniciar
  // sesión o recargar), para que cada usuario vea siempre sus datos.
  useEffect(() => {
    setForm({
      name: profile.name || '',
      age: profile.age,
      weight: profile.weight,
      height: profile.height,
      gender: profile.gender,
      activity: profile.activity,
      goal: profile.goal,
    })
  }, [profile])

  const bmr = calculateBMR(form)
  const tdee = calculateTDEE(form)
  const macros = calculateMacros(tdee, form.goal)

  function handleSave() {
    saveProfileWithHistory(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const GOAL_LABELS = { deficit: 'Definición', maintenance: 'Mantenimiento', bulk: 'Volumen' }
  const ACTIVITY_LABELS = { sedentary: 'Sedentario', light: 'Ligero', moderate: 'Moderado', active: 'Activo', very_active: 'Muy activo' }

  function upd(k, v) {
    setForm(prev => ({ ...prev, [k]: v }))
    setSaved(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calculadora de macros</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Calcula tus calorías y macronutrientes ideales</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-5">
          {/* Personal data */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Datos personales</h3>

            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Nombre</label>
              <input
                type="text" value={form.name}
                onChange={e => upd('name', e.target.value)}
                placeholder="Tu nombre"
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm border-none outline-none text-gray-900 dark:text-white"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">Sexo</label>
              <div className="flex gap-3">
                {[{ id: 'male', label: 'Hombre' }, { id: 'female', label: 'Mujer' }].map(g => (
                  <button
                    key={g.id}
                    onClick={() => upd('gender', g.id)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      form.gender === g.id
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Age, Weight, Height */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'age', label: 'Edad', unit: 'años', min: 14, max: 80 },
                { key: 'weight', label: 'Peso', unit: 'kg', min: 30, max: 200 },
                { key: 'height', label: 'Altura', unit: 'cm', min: 100, max: 230 },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">{field.label}</label>
                  <div className="relative">
                    <input
                      type="number" value={form[field.key]}
                      onChange={e => upd(field.key, Number(e.target.value))}
                      min={field.min} max={field.max}
                      className="w-full px-3 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm border-none outline-none text-gray-900 dark:text-white pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{field.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Nivel de actividad</h3>
            {ACTIVITIES.map(a => (
              <button
                key={a.id}
                onClick={() => upd('activity', a.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                  form.activity === a.id
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div>
                  <p className={`text-sm font-medium ${form.activity === a.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>{a.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{a.desc}</p>
                </div>
                <span className="text-xs text-gray-400">x{a.mult}</span>
              </button>
            ))}
          </div>

          {/* Goal */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Objetivo</h3>
            <div className="grid grid-cols-3 gap-3">
              {GOALS.map(g => (
                <button
                  key={g.id}
                  onClick={() => upd('goal', g.id)}
                  className={`py-3 rounded-xl text-sm font-medium border transition-all ${
                    form.goal === g.id ? g.color : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <p className="font-semibold">{g.label}</p>
                  <p className="text-xs opacity-70">{g.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-5">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sticky top-8">
            <div className="flex items-center gap-2 mb-5">
              <Calculator size={20} className="text-emerald-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Tus resultados</h3>
            </div>

            {/* BMR & TDEE */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Metabolismo basal</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(bmr)}</p>
                <p className="text-xs text-gray-400">kcal/día</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-4 text-center border border-emerald-200 dark:border-emerald-500/20">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Calorías objetivo</p>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{tdee}</p>
                <p className="text-xs text-emerald-500">kcal/día</p>
              </div>
            </div>

            {/* Macros */}
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Distribución de macros</h4>
            <div className="flex justify-center gap-8 mb-6">
              <MacroRing value={macros.protein} max={macros.protein} label="Proteína" color="#10b981" />
              <MacroRing value={macros.carbs} max={macros.carbs} label="Carbos" color="#3b82f6" />
              <MacroRing value={macros.fat} max={macros.fat} label="Grasa" color="#f59e0b" />
            </div>

            {/* Macro breakdown */}
            <div className="space-y-3 mb-6">
              {[
                { label: 'Proteína', value: macros.protein, cal: macros.protein * 4, color: 'bg-emerald-500', pct: Math.round((macros.protein * 4 / tdee) * 100) },
                { label: 'Carbohidratos', value: macros.carbs, cal: macros.carbs * 4, color: 'bg-blue-500', pct: Math.round((macros.carbs * 4 / tdee) * 100) },
                { label: 'Grasa', value: macros.fat, cal: macros.fat * 9, color: 'bg-amber-500', pct: Math.round((macros.fat * 9 / tdee) * 100) },
              ].map(m => (
                <div key={m.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{m.label}</span>
                    <span className="text-gray-900 dark:text-white font-medium">{m.value}g ({m.cal} kcal · {m.pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                saved
                  ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              }`}
            >
              <Save size={16} />
              {saved ? 'Guardado' : 'Guardar como mi perfil'}
            </button>
          </div>
        </div>
      </div>

      {/* Profile History */}
      {profileHistory.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <History size={18} className="text-emerald-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Historial de perfiles guardados</h3>
            <span className="ml-auto text-xs text-gray-400">{profileHistory.length} registros</span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-96 overflow-y-auto">
            {[...profileHistory].reverse().map(entry => {
              const d = new Date(entry.date)
              const dateStr = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
              const timeStr = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
              return (
                <div key={entry.id} className="px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-900 dark:text-white">{dateStr}</span>
                      <span className="text-xs text-gray-400">{timeStr}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        entry.goal === 'deficit' ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                        entry.goal === 'bulk' ? 'bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400' :
                        'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {GOAL_LABELS[entry.goal] || entry.goal}
                      </span>
                      <button
                        onClick={() => removeProfileHistory(entry.id)}
                        className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>{entry.weight}kg · {entry.height}cm · {entry.age} años</span>
                    <span>{ACTIVITY_LABELS[entry.activity] || entry.activity}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">{entry.calories} kcal</span>
                    <span>P:{entry.protein}g · C:{entry.carbs}g · G:{entry.fat}g</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
