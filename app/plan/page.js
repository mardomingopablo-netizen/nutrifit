'use client'
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { DAYS, DAYS_SHORT, MEALS, MEAL_LABELS, MEAL_ICONS, MEAL_SUGGESTIONS, FOODS_DB } from '../data/foods'
import CalorieBar from '../components/CalorieBar'
import { Wand2, Trash2, Plus, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'

export default function PlanPage() {
  const {
    profile, weekPlan, targetCalories, targetMacros,
    addMealToPlan, removeMealFromPlan, autoGeneratePlan,
    getDayTotals, getMealTotals, getMealTarget,
  } = useApp()

  const [selectedDay, setSelectedDay] = useState(0)
  const [showSuggestions, setShowSuggestions] = useState(null) // { meal }
  const day = DAYS[selectedDay]
  const planTotals = getDayTotals(day, 'plan')

  const goalKey = profile.goal === 'bulk' ? 'bulk' : profile.goal === 'deficit' ? 'deficit' : 'maintenance'
  const suggestions = MEAL_SUGGESTIONS[goalKey]

  function handleAddSuggestion(meal, suggestion) {
    addMealToPlan(day, meal, suggestion)
    setShowSuggestions(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Plan semanal</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Planifica tus comidas de la semana</p>
        </div>
        <button
          onClick={autoGeneratePlan}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Wand2 size={16} />
          Generar plan automático
        </button>
      </div>

      {/* Day navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSelectedDay(prev => Math.max(0, prev - 1))}
          disabled={selectedDay === 0}
          className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 disabled:opacity-30"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide">
          {DAYS.map((d, i) => (
            <button
              key={d}
              onClick={() => setSelectedDay(i)}
              className={`flex-1 min-w-[70px] py-2.5 rounded-xl text-sm font-medium transition-all ${
                i === selectedDay
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-emerald-300'
              }`}
            >
              {DAYS_SHORT[i]}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSelectedDay(prev => Math.min(6, prev + 1))}
          disabled={selectedDay === 6}
          className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day summary */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{day} — Plan</h3>
        <CalorieBar current={planTotals.cal} target={targetCalories} />
        <div className="flex gap-4 mt-3 text-xs">
          <span className="text-emerald-500 font-medium">P: {planTotals.protein}g / {targetMacros.protein}g</span>
          <span className="text-blue-500 font-medium">C: {planTotals.carbs}g / {targetMacros.carbs}g</span>
          <span className="text-amber-500 font-medium">G: {planTotals.fat}g / {targetMacros.fat}g</span>
        </div>
      </div>

      {/* Meals for selected day */}
      {MEALS.map(meal => {
        const items = weekPlan[day]?.[meal] || []
        const mealSuggs = suggestions[meal] || []
        const mealTotals = getMealTotals(day, meal, 'plan')
        const mealTarget = getMealTarget(meal)
        const mealOver = mealTotals.cal > mealTarget.cal * 1.05

        return (
          <div key={meal} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <span className="text-xl">{MEAL_ICONS[meal]}</span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{MEAL_LABELS[meal]}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <span className={mealOver ? 'text-red-500 font-medium' : 'text-gray-700 dark:text-gray-300 font-medium'}>{mealTotals.cal}</span>
                    <span className="text-gray-400"> / {mealTarget.cal} kcal objetivo</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Planned meals */}
            {items.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-4">Sin comidas planificadas</p>
            ) : (
              items.map(item => {
                // Resolve food details from FOODS_DB
                const foodDetails = (item.foods || []).map(f => {
                  const food = FOODS_DB.find(fd => fd.id === f.id)
                  return food ? { ...food, grams: f.grams } : null
                }).filter(Boolean)

                return (
                  <div key={item.id} className="px-5 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.cal} kcal
                          {item.protein !== undefined && ` · P:${item.protein}g · C:${item.carbs}g · G:${item.fat}g`}
                        </p>
                      </div>
                      <button
                        onClick={() => removeMealFromPlan(day, meal, item.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {/* Ingredient breakdown with grams */}
                    {foodDetails.length > 0 && (
                      <div className="mt-2 ml-1 space-y-1">
                        {foodDetails.map((food, idx) => {
                          const cals = Math.round(food.cal * food.grams / 100)
                          const prot = Math.round(food.protein * food.grams / 100 * 10) / 10
                          const carb = Math.round(food.carbs * food.grams / 100 * 10) / 10
                          const fat_ = Math.round(food.fat * food.grams / 100 * 10) / 10
                          return (
                            <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-1.5">
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                <span className="text-xs text-gray-700 dark:text-gray-300">{food.name}</span>
                                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{food.grams}g</span>
                              </div>
                              <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                {cals} kcal · P:{prot}g · C:{carb}g · G:{fat_}g
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })
            )}

            {/* Add suggestion */}
            <div className="p-3">
              {showSuggestions?.meal === meal ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 px-1">Sugerencias ({profile.goal === 'deficit' ? 'Definición' : profile.goal === 'bulk' ? 'Volumen' : 'Mantenimiento'})</p>
                  {mealSuggs.map((s, i) => {
                    const details = (s.foods || []).map(f => {
                      const food = FOODS_DB.find(fd => fd.id === f.id)
                      return food ? { name: food.name, grams: f.grams } : null
                    }).filter(Boolean)
                    return (
                      <button
                        key={i}
                        onClick={() => handleAddSuggestion(meal, s)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all text-left"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{s.cal} kcal</span>
                        </div>
                        {details.length > 0 && (
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            {details.map(d => `${d.name} ${d.grams}g`).join(' · ')}
                          </p>
                        )}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setShowSuggestions(null)}
                    className="w-full text-xs text-gray-400 py-1 hover:text-gray-600"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSuggestions({ meal })}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 hover:border-emerald-300 dark:hover:border-emerald-500/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                >
                  <Plus size={16} />
                  Añadir comida
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
