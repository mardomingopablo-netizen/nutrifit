'use client'
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { MEALS, MEAL_LABELS, MEAL_ICONS } from '../data/foods'
import FoodSearch from '../components/FoodSearch'
import CalorieBar from '../components/CalorieBar'
import MacroRing from '../components/MacroRing'
import { Plus, Trash2, ChevronDown, ChevronUp, Minus, Plus as PlusIcon } from 'lucide-react'

export default function TrackerPage() {
  const {
    tracker,
    addFoodToTracker, removeFoodFromTracker, updateFoodGrams,
    getDayTotals, getMealTotals, getMealTarget,
    targetCalories, targetMacros, todayKey,
  } = useApp()

  const [addingTo, setAddingTo] = useState(null) // meal
  const [expandedMeals, setExpandedMeals] = useState({
    breakfast: true, lunch: true, dinner: true, snack: true,
  })

  const day = todayKey()
  const totals = getDayTotals(day)

  const todayLabel = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })

  function toggleMeal(meal) {
    setExpandedMeals(prev => ({ ...prev, [meal]: !prev[meal] }))
  }

  function handleAddFood(food) {
    if (addingTo) {
      addFoodToTracker(addingTo, food)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tracker de hoy</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">{todayLabel}</p>
      </div>

      {/* Day summary */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
        <CalorieBar current={totals.cal} target={targetCalories} />
        <div className="flex justify-center gap-6 mt-4">
          <MacroRing value={totals.protein} max={targetMacros.protein} label="Prot" color="#10b981" size={60} />
          <MacroRing value={totals.carbs} max={targetMacros.carbs} label="Carb" color="#3b82f6" size={60} />
          <MacroRing value={totals.fat} max={targetMacros.fat} label="Grasa" color="#f59e0b" size={60} />
        </div>
      </div>

      {/* Meals */}
      {MEALS.map(meal => {
        const foods = tracker[day]?.[meal] || []
        const mealTotals = getMealTotals(day, meal)
        const mealTarget = getMealTarget(meal)
        const mealPct = mealTarget.cal > 0 ? Math.min((mealTotals.cal / mealTarget.cal) * 100, 100) : 0
        const mealOver = mealTotals.cal > mealTarget.cal
        const expanded = expandedMeals[meal]

        return (
          <div key={meal} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Meal header */}
            <button
              onClick={() => toggleMeal(meal)}
              className="w-full px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{MEAL_ICONS[meal]}</span>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{MEAL_LABELS[meal]}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      <span className={mealOver ? 'text-red-500 font-medium' : 'text-gray-700 dark:text-gray-300 font-medium'}>{mealTotals.cal}</span>
                      <span className="text-gray-400"> / {mealTarget.cal} kcal</span>
                      <span className="hidden sm:inline"> · P:{mealTotals.protein}/{mealTarget.protein}g · C:{mealTotals.carbs}/{mealTarget.carbs}g · G:{mealTotals.fat}/{mealTarget.fat}g</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-400">{foods.length} item{foods.length !== 1 ? 's' : ''}</span>
                  {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </div>
              {/* Per-meal progress bar */}
              <div className="mt-2.5 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${mealOver ? 'bg-red-500' : mealPct > 85 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.max(mealPct, mealTotals.cal > 0 ? 4 : 0)}%` }}
                />
              </div>
            </button>

            {/* Food list */}
            {expanded && (
              <div className="border-t border-gray-100 dark:border-gray-800">
                {foods.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-6">Sin alimentos registrados</p>
                ) : (
                  foods.map(food => {
                    const g = food.grams || 100
                    return (
                      <div key={food.id} className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{food.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {Math.round(food.cal * g / 100)} kcal · P:{Math.round(food.protein * g / 100)}g · C:{Math.round(food.carbs * g / 100)}g · G:{Math.round(food.fat * g / 100)}g
                          </p>
                        </div>
                        {/* Editable grams con botones -/+ */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => updateFoodGrams(meal, food.id, Math.max(5, Math.round(g * 0.9 / 5) * 5))}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                            title="Menos cantidad"
                          >
                            <Minus size={14} />
                          </button>
                          <input
                            type="number"
                            value={g}
                            min={1}
                            onChange={e => updateFoodGrams(meal, food.id, e.target.value)}
                            className="w-14 px-1 py-1.5 text-xs text-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-none outline-none"
                          />
                          <button
                            onClick={() => updateFoodGrams(meal, food.id, Math.max(5, Math.round(g * 1.1 / 5) * 5))}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                            title="Más cantidad"
                          >
                            <PlusIcon size={14} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFoodFromTracker(meal, food.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )
                  })
                )}

                {/* Add food button */}
                <div className="p-3">
                  {addingTo === meal ? (
                    <FoodSearch
                      onAdd={handleAddFood}
                      onClose={() => setAddingTo(null)}
                    />
                  ) : (
                    <button
                      onClick={() => setAddingTo(meal)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 hover:border-emerald-300 dark:hover:border-emerald-500/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                    >
                      <Plus size={16} />
                      Añadir alimento
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
