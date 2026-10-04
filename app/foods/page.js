'use client'
import { useState } from 'react'
import { FOODS_DB, FOOD_CATEGORIES } from '../data/foods'
import { Search, Info, ChevronDown, ChevronUp } from 'lucide-react'

export default function FoodsPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [expandedId, setExpandedId] = useState(null)

  const filtered = FOODS_DB.filter(f => {
    const matchQ = f.name.toLowerCase().includes(query.toLowerCase())
    const matchC = category === 'all' || f.category === category
    return matchQ && matchC
  }).sort((a, b) => {
    const mul = sortDir === 'asc' ? 1 : -1
    if (sortBy === 'name') return a.name.localeCompare(b.name) * mul
    return ((a[sortBy] || 0) - (b[sortBy] || 0)) * mul
  })

  function toggleSort(key) {
    if (sortBy === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(key); setSortDir('asc') }
  }

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return null
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Base de alimentos</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{FOODS_DB.length} alimentos con información nutricional</p>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar alimento..."
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm outline-none text-gray-900 dark:text-white placeholder-gray-400 focus:border-emerald-400 dark:focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        <button
          onClick={() => setCategory('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
            category === 'all'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400'
          }`}
        >
          Todos ({FOODS_DB.length})
        </button>
        {FOOD_CATEGORIES.map(cat => {
          const count = FOODS_DB.filter(f => f.category === cat.id).length
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                category === cat.id
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              {cat.icon} {cat.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <button onClick={() => toggleSort('name')} className="col-span-4 flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200">
            Alimento <SortIcon field="name" />
          </button>
          <button onClick={() => toggleSort('cal')} className="col-span-2 flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200">
            Calorías <SortIcon field="cal" />
          </button>
          <button onClick={() => toggleSort('protein')} className="col-span-2 flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200">
            Proteína <SortIcon field="protein" />
          </button>
          <button onClick={() => toggleSort('carbs')} className="col-span-2 flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200">
            Carbos <SortIcon field="carbs" />
          </button>
          <button onClick={() => toggleSort('fat')} className="col-span-2 flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200">
            Grasa <SortIcon field="fat" />
          </button>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-12">No se encontraron alimentos</p>
        ) : (
          filtered.map(food => {
            const cat = FOOD_CATEGORIES.find(c => c.id === food.category)
            const expanded = expandedId === food.id
            return (
              <div key={food.id}>
                <button
                  onClick={() => setExpandedId(expanded ? null : food.id)}
                  className="w-full grid grid-cols-12 gap-2 px-5 py-3.5 text-left border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all items-center"
                >
                  <div className="col-span-12 md:col-span-4 flex items-center gap-2">
                    <span className="text-sm">{cat?.icon}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{food.name}</span>
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <span className="md:hidden text-xs text-gray-400">Cal: </span>
                    <span className="text-sm text-gray-900 dark:text-white font-semibold">{food.cal}</span>
                    <span className="text-xs text-gray-400 ml-1">kcal</span>
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <span className="md:hidden text-xs text-gray-400">P: </span>
                    <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">{food.protein}g</span>
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <span className="md:hidden text-xs text-gray-400">C: </span>
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">{food.carbs}g</span>
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <span className="md:hidden text-xs text-gray-400">G: </span>
                    <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">{food.fat}g</span>
                  </div>
                </button>

                {/* Expanded detail */}
                {expanded && (
                  <div className="px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Información por 100g</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {[
                        { label: 'Calorías', value: `${food.cal} kcal`, color: 'text-gray-900 dark:text-white' },
                        { label: 'Proteína', value: `${food.protein}g`, color: 'text-emerald-600 dark:text-emerald-400' },
                        { label: 'Carbohidratos', value: `${food.carbs}g`, color: 'text-blue-600 dark:text-blue-400' },
                        { label: 'Grasa', value: `${food.fat}g`, color: 'text-amber-600 dark:text-amber-400' },
                        { label: 'Fibra', value: `${food.fiber}g`, color: 'text-purple-600 dark:text-purple-400' },
                      ].map(item => (
                        <div key={item.label} className="bg-white dark:bg-gray-900 rounded-xl p-3 text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                          <p className={`text-lg font-bold ${item.color} mt-0.5`}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                    {/* Macro distribution bar */}
                    <div className="mt-3">
                      <div className="flex h-2.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500" style={{ width: `${food.protein * 4 / (food.cal || 1) * 100}%` }} />
                        <div className="bg-blue-500" style={{ width: `${food.carbs * 4 / (food.cal || 1) * 100}%` }} />
                        <div className="bg-amber-500" style={{ width: `${food.fat * 9 / (food.cal || 1) * 100}%` }} />
                      </div>
                      <div className="flex gap-4 mt-1.5 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Proteína {Math.round(food.protein * 4 / (food.cal || 1) * 100)}%</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Carbos {Math.round(food.carbs * 4 / (food.cal || 1) * 100)}%</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Grasa {Math.round(food.fat * 9 / (food.cal || 1) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
