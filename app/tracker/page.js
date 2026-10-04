'use client'
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { DAYS, DAYS_SHORT, MEALS, MEAL_LABELS, MEAL_ICONS } from '../data/foods'
import FoodSearch from '../components/FoodSearch'
import CalorieBar from '../components/CalorieBar'
import MacroRing from '../components/MacroRing'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

export default function TrackerPage() {
  const {
    tracker, currentDay, setCurrentDay,
    addFoodToTracker, removeFoodFromTracker,
    getDayTotals, getMealTotals,
    targetCalories, targetMacros,
  } = useApp()

  const [addingTo, setAddingTo] = useState(null) // { day, meal }
  const [expandedMeals, setExpandedMeals] = useState({
    breakfast: true, lunch: true, dinner: true, snack: true,
  })

  const day = DAYS[currentDay]
  const totals = getDayTotals(day)

  function toggleMeal(meal) {
    setExpandedMeals(prev => ({ ...prev, [meal]: !prev[meal] }))
  }

  function handleAddFood(food) {
    if (addingTo) {
      addFoodToTracker(addingTo.day, addingTo.meal, food)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tracker diario</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Registra todo lo que comes cada día</p>
      </div>

      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {DAYS.map((d, i) => (
          <button
            key={d}
            onClick={() => setCurrentDay(i)}
            className={`flex flex-col items-center px-4 py-3 rounded-xl min-w-[60px] transition-all ${
              i === currentDay
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-emerald-300 dark:hover:border-emerald-500/30'
            }`}
          >
            <span className="text-xs font-medium">{DAYS_SHORT[i]}</span>
            <span className="text-lg font-bold mt-0.5">{new Date(Date.now() + (i - currentDay) * 86400000).getDate()}</span>
          </button>
        ))}
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
        const expanded = expandedMeals[meal]

        return (
          <div key={meal} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Meal header */}
            <button
              onClick={() => toggleMeal(meal)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{MEAL_ICONS[meal]}</span>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{MEAL_LABELS[meal]}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {mealTotals.cal} kcal · P:{mealTotals.protein}g · C:{mealTotals.carbs}g · G:{mealTotals.fat}g
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-400">{foods.length} item{foods.length !== 1 ? 's' : ''}</span>
                {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </div>
            </button>

            {/* Food list */}
            {expanded && (
              <div className="border-t border-gray-100 dark:border-gray-800">
                {foods.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-6">Sin alimentos registrados</p>
                ) : (
                  foods.map(food => (
                    <div key={food.id} className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{food.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {food.grams}g · {Math.round(food.cal * (food.grams || 100) / 100)} kcal
                        </p>
                      </div>
                      <div className="flex gap-3 text-xs text-gray-400">
                        <span className="text-emerald-500">P:{Math.round(food.protein * (food.grams || 100) / 100)}g</span>
                        <span className="text-blue-500">C:{Math.round(food.carbs * (food.grams || 100) / 100)}g</span>
                        <span className="text-amber-500">G:{Math.round(food.fat * (food.grams || 100) / 100)}g</span>
                      </div>
                      <button
                        onClick={() => removeFoodFromTracker(day, meal, food.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}

                {/* Add food button */}
                <div className="p-3">
                  {addingTo?.day === day && addingTo?.meal === meal ? (
                    <FoodSearch
                      onAdd={handleAddFood}
                      onClose={() => setAddingTo(null)}
                    />
                  ) : (
                    <button
                      onClick={() => setAddingTo({ day, meal })}
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
