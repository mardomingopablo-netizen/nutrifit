'use client'
import { useState } from 'react'
import { Search, Plus, X } from 'lucide-react'
import { FOODS_DB, FOOD_CATEGORIES } from '../data/foods'

export default function FoodSearch({ onAdd, onClose }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [grams, setGrams] = useState({})

  const filtered = FOODS_DB.filter(f => {
    const matchQ = f.name.toLowerCase().includes(query.toLowerCase())
    const matchC = category === 'all' || f.category === category
    return matchQ && matchC
  })

  function handleAdd(food) {
    const g = grams[food.id] || 100
    onAdd({
      ...food,
      grams: g,
      cal: Math.round(food.cal * g / 100),
      protein: Math.round(food.protein * g / 100 * 10) / 10,
      carbs: Math.round(food.carbs * g / 100 * 10) / 10,
      fat: Math.round(food.fat * g / 100 * 10) / 10,
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
        <div className="flex-1 relative">
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
        {onClose && (
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={18} className="text-gray-500" />
          </button>
        )}
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
          <p className="text-center text-gray-400 py-8 text-sm">No se encontraron alimentos</p>
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
    </div>
  )
}
