'use client'
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { SUPPLEMENTS_DB, SUPPLEMENT_CATEGORIES, TIMING_OPTIONS } from '../data/supplements'
import { DAYS, DAYS_SHORT } from '../data/foods'
import { Plus, Trash2, Check, Pill, Search, ChevronDown, ChevronUp, X, Info } from 'lucide-react'

export default function SupplementsPage() {
  const {
    mySupplements, addToMySupplements, removeFromMySupplements,
    supplements, toggleSupplement, currentDay,
  } = useApp()
  const [tab, setTab] = useState('my') // my, browse
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [dayIndex, setDayIndex] = useState(currentDay)

  const day = DAYS[dayIndex]
  const daySupps = supplements[day] || []

  // Filter browse list
  const browseSups = SUPPLEMENTS_DB.filter(s => {
    if (filterCat !== 'all' && s.category !== filterCat) return false
    if (searchQuery.length > 1 && !s.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const takenCount = mySupplements.filter(s => daySupps.includes(s.id)).length
  const totalCount = mySupplements.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suplementación</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestiona tu stack de suplementos y registra tu toma diaria</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          <button
            onClick={() => setTab('my')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === 'my' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Mi stack ({totalCount})
          </button>
          <button
            onClick={() => setTab('browse')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === 'browse' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Explorar
          </button>
        </div>
      </div>

      {tab === 'my' && (
        <>
          {/* Day selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {DAYS_SHORT.map((d, i) => (
              <button
                key={d}
                onClick={() => setDayIndex(i)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  i === dayIndex
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-emerald-300'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Progress */}
          {totalCount > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Progreso de hoy — {DAYS[dayIndex]}
                </p>
                <span className={`text-sm font-bold ${takenCount === totalCount && totalCount > 0 ? 'text-emerald-500' : 'text-gray-500 dark:text-gray-400'}`}>
                  {takenCount}/{totalCount}
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3">
                <div
                  className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${totalCount > 0 ? (takenCount / totalCount) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          {/* Supplement checklist */}
          {mySupplements.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
              <Pill size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No tienes suplementos en tu stack</p>
              <p className="text-sm text-gray-400 mt-1">Ve a "Explorar" para añadir suplementos</p>
              <button
                onClick={() => setTab('browse')}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-all"
              >
                <Plus size={16} /> Explorar suplementos
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {mySupplements.map(supp => {
                const taken = daySupps.includes(supp.id)
                const isExpanded = expandedId === supp.id
                return (
                  <div key={supp.id} className={`bg-white dark:bg-gray-900 rounded-2xl border transition-all ${
                    taken ? 'border-emerald-300 dark:border-emerald-500/30' : 'border-gray-200 dark:border-gray-800'
                  }`}>
                    <div className="flex items-center gap-3 p-4">
                      <button
                        onClick={() => toggleSupplement(day, supp.id)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                          taken
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
                        }`}
                      >
                        {taken && <Check size={16} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${taken ? 'text-emerald-700 dark:text-emerald-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                          {supp.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{supp.dose} · {supp.timing}</p>
                      </div>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : supp.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <button
                        onClick={() => removeFromMySupplements(supp.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 border-t border-gray-100 dark:border-gray-800 mt-0">
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">{supp.desc}</p>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {supp.benefits.map(b => (
                            <span key={b} className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-medium">
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {tab === 'browse' && (
        <>
          {/* Search + filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar suplemento..."
                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm outline-none text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setFilterCat('all')}
                className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  filterCat === 'all' ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                Todos
              </button>
              {SUPPLEMENT_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFilterCat(cat.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    filterCat === cat.id ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Supplements grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {browseSups.map(supp => {
              const inStack = mySupplements.find(s => s.id === supp.id)
              const catInfo = SUPPLEMENT_CATEGORIES.find(c => c.id === supp.category)
              return (
                <div key={supp.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          {catInfo?.icon} {catInfo?.label}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{supp.name}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{supp.desc}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {supp.benefits.map(b => (
                      <span key={b} className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-md text-xs">
                        {b}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium">{supp.dose}</span> · {supp.timing}
                    </div>
                    {inStack ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-medium">
                        <Check size={14} /> En tu stack
                      </span>
                    ) : (
                      <button
                        onClick={() => addToMySupplements(supp)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium transition-all"
                      >
                        <Plus size={14} /> Añadir
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
