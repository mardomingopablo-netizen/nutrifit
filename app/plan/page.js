'use client'
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { DAYS, DAYS_SHORT, MEALS, MEAL_LABELS, MEAL_ICONS, MEAL_SUGGESTIONS, FOODS_DB, getGoalKey, computeFoodsTotals } from '../data/foods'
import FoodSearch from '../components/FoodSearch'
import CalorieBar from '../components/CalorieBar'
import { Wand2, Trash2, ChevronLeft, ChevronRight, Search, Sparkles, Minus, Plus as PlusIcon } from 'lucide-react'

const GOAL_LABELS = { deficit: 'definición', maintenance: 'mantenimiento', bulk: 'volumen' }

export default function PlanPage() {
  const {
    profile, weekPlan, targetCalories, targetMacros,
    addMealToPlan, removeMealFromPlan, autoGeneratePlan, updatePlanFoodGrams, scalePlanMealPortion,
    scalePlanIngredient, removePlanIngredient,
    getDayTotals, getMealTotals, getMealTarget,
  } = useApp()

  const [selectedDay, setSelectedDay] = useState(0)
  const [adder, setAdder] = useState(null) // { meal, type: 'suggestions' | 'food' }
  const day = DAYS[selectedDay]
  const planTotals = getDayTotals(day, 'plan')

  const goalKey = getGoalKey(profile.goal)
  const suggestions = MEAL_SUGGESTIONS[goalKey]
  const goalLabel = GOAL_LABELS[profile.goal] || 'mantenimiento'

  function handleAddSuggestion(meal, suggestion) {
    addMealToPlan(day, meal, suggestion)
    setAdder(null)
  }

  function handleAddFood(meal, food) {
    // Alimento individual (valores por 100g + gramos), editable después.
    addMealToPlan(day, meal, food)
  }

  // Total efectivo de un item del plan. Las comidas con ingredientes se
  // calculan desde ellos (robusto incluso con datos antiguos a 0); los
  // alimentos individuales usan sus valores por 100g × gramos.
  function itemTotals(item) {
    if (item.foods) return computeFoodsTotals(item.foods)
    const factor = item.grams ? item.grams / 100 : 1
    return {
      cal: Math.round((item.cal || 0) * factor),
      protein: Math.round((item.protein || 0) * factor),
      carbs: Math.round((item.carbs || 0) * factor),
      fat: Math.round((item.fat || 0) * factor),
    }
  }

  // Feedback del día según el objetivo
  function dayFeedback(totals) {
    if (totals.cal === 0) {
      return [{ type: 'info', text: 'Planifica tus comidas para ver si el día encaja con tu objetivo.' }]
    }
    const msgs = []
    const calDiff = totals.cal - targetCalories
    const tol = targetCalories * 0.08
    if (Math.abs(calDiff) <= tol) {
      msgs.push({ type: 'success', text: `Las calorías encajan con tu objetivo (${totals.cal} / ${targetCalories} kcal).` })
    } else if (calDiff > tol) {
      msgs.push({
        type: profile.goal === 'bulk' ? 'info' : 'warning',
        text: `Te estás pasando de calorías (+${calDiff} kcal) para ${goalLabel}.`,
      })
    } else {
      if (profile.goal === 'deficit') {
        msgs.push({ type: 'success', text: `Buen déficit: ${Math.abs(calDiff)} kcal por debajo del objetivo.` })
      } else {
        msgs.push({ type: 'warning', text: `Te quedas corto de calorías (${calDiff} kcal) para ${goalLabel}.` })
      }
    }
    // Proteína
    if (totals.protein < targetMacros.protein * 0.85) {
      msgs.push({ type: 'warning', text: `Proteína baja (${totals.protein} / ${targetMacros.protein}g). Añade fuentes de proteína.` })
    } else {
      msgs.push({ type: 'success', text: `Buena proteína (${totals.protein} / ${targetMacros.protein}g).` })
    }
    // Grasa
    if (totals.fat > targetMacros.fat * 1.2) {
      msgs.push({ type: 'warning', text: `Demasiada grasa (${totals.fat} / ${targetMacros.fat}g). No es la mejor elección.` })
    }
    return msgs
  }

  const feedback = dayFeedback(planTotals)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Plan semanal</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Recomendaciones según tu objetivo, o elige tu propia comida</p>
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
              onClick={() => { setSelectedDay(i); setAdder(null) }}
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

        {/* Feedback según objetivo */}
        <div className="mt-4 space-y-2">
          {feedback.map((f, i) => (
            <div key={i} className={`flex items-start gap-2 px-3 py-2 rounded-xl text-xs ${
              f.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
              f.type === 'warning' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400' :
              'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
            }`}>
              <span>{f.type === 'success' ? '✅' : f.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
              <span>{f.text}</span>
            </div>
          ))}
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

            {/* Planned items */}
            {items.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-4">Sin comidas planificadas</p>
            ) : (
              items.map(item => {
                const t = itemTotals(item)
                const isFood = !item.foods // alimento individual
                // Desglose de ingredientes (solo sugerencias)
                const foodDetails = (item.foods || []).map(f => {
                  const food = FOODS_DB.find(fd => fd.id === f.id)
                  return food ? { ...food, grams: f.grams } : null
                }).filter(Boolean)

                return (
                  <div key={item.id} className="px-5 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t.cal} kcal · P:{t.protein}g · C:{t.carbs}g · G:{t.fat}g
                        </p>
                      </div>
                      {/* Controles de porción: −10% / +10% */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => scalePlanMealPortion(day, meal, item.id, 0.9)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                          title="Menos cantidad"
                        >
                          <Minus size={14} />
                        </button>
                        {isFood ? (
                          <input
                            type="number"
                            value={item.grams || 100}
                            min={1}
                            onChange={e => updatePlanFoodGrams(day, meal, item.id, e.target.value)}
                            className="w-14 px-1 py-1.5 text-xs text-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-none outline-none"
                          />
                        ) : (
                          <span className="w-10 text-center text-xs font-medium text-gray-500 dark:text-gray-400">{t.cal}</span>
                        )}
                        <button
                          onClick={() => scalePlanMealPortion(day, meal, item.id, 1.1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                          title="Más cantidad"
                        >
                          <PlusIcon size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeMealFromPlan(day, meal, item.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {/* Ingredient breakdown con controles por ingrediente */}
                    {foodDetails.length > 0 && (
                      <div className="mt-2 ml-1 space-y-1">
                        {foodDetails.map((food, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                              <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{food.name}</span>
                              <span className="text-[10px] text-gray-400 whitespace-nowrap hidden sm:inline">
                                {Math.round(food.cal * food.grams / 100)} kcal
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => scalePlanIngredient(day, meal, item.id, idx, 0.9)}
                                className="w-6 h-6 flex items-center justify-center rounded-md bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all border border-gray-200 dark:border-gray-600"
                                title="Menos"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-11 text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">{food.grams}g</span>
                              <button
                                onClick={() => scalePlanIngredient(day, meal, item.id, idx, 1.1)}
                                className="w-6 h-6 flex items-center justify-center rounded-md bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all border border-gray-200 dark:border-gray-600"
                                title="Más"
                              >
                                <PlusIcon size={12} />
                              </button>
                              <button
                                onClick={() => removePlanIngredient(day, meal, item.id, idx)}
                                className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                                title="Quitar ingrediente"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}

            {/* Add area */}
            <div className="p-3">
              {adder?.meal === meal ? (
                adder.type === 'food' ? (
                  <FoodSearch
                    onAdd={(food) => handleAddFood(meal, food)}
                    onClose={() => setAdder(null)}
                  />
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 px-1">
                      Sugerencias para {goalLabel}
                    </p>
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
                      onClick={() => setAdder(null)}
                      className="w-full text-xs text-gray-400 py-1 hover:text-gray-600"
                    >
                      Cancelar
                    </button>
                  </div>
                )
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setAdder({ meal, type: 'suggestions' })}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 hover:border-emerald-300 dark:hover:border-emerald-500/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                  >
                    <Sparkles size={16} />
                    Sugerencias
                  </button>
                  <button
                    onClick={() => setAdder({ meal, type: 'food' })}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 hover:border-emerald-300 dark:hover:border-emerald-500/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                  >
                    <Search size={16} />
                    Mi comida
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
