'use client'
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { FOODS_DB, FOOD_CATEGORIES, DAYS, MEALS, MEAL_LABELS } from '../data/foods'
import { Plus, Trash2, Search, ChefHat, BookOpen, Utensils, X, Check } from 'lucide-react'

export default function RecipesPage() {
  const { recipes, addRecipe, removeRecipe, addRecipeToTracker, currentDay } = useApp()
  const [mode, setMode] = useState('list') // list, create
  const [newRecipe, setNewRecipe] = useState({ name: '', servings: 1, ingredients: [] })
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddToTracker, setShowAddToTracker] = useState(null)
  const [addMeal, setAddMeal] = useState('lunch')

  // Search foods to add as ingredients
  const searchResults = searchQuery.length > 1
    ? FOODS_DB.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 8)
    : []

  function addIngredient(food) {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { ...food, grams: 100, uid: Date.now() + Math.random() }],
    }))
    setSearchQuery('')
  }

  function updateIngredientGrams(uid, grams) {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(i => i.uid === uid ? { ...i, grams: Number(grams) } : i),
    }))
  }

  function removeIngredient(uid) {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(i => i.uid !== uid),
    }))
  }

  // Calculate recipe totals
  const recipeTotals = newRecipe.ingredients.reduce((acc, ing) => {
    const g = ing.grams / 100
    return {
      cal: acc.cal + ing.cal * g,
      protein: acc.protein + ing.protein * g,
      carbs: acc.carbs + ing.carbs * g,
      fat: acc.fat + ing.fat * g,
      totalGrams: acc.totalGrams + ing.grams,
    }
  }, { cal: 0, protein: 0, carbs: 0, fat: 0, totalGrams: 0 })

  function saveRecipe() {
    if (!newRecipe.name || newRecipe.ingredients.length === 0) return
    addRecipe({
      name: newRecipe.name,
      servings: newRecipe.servings,
      ingredients: newRecipe.ingredients,
      totalCal: Math.round(recipeTotals.cal),
      totalProtein: Math.round(recipeTotals.protein * 10) / 10,
      totalCarbs: Math.round(recipeTotals.carbs * 10) / 10,
      totalFat: Math.round(recipeTotals.fat * 10) / 10,
      totalGrams: recipeTotals.totalGrams,
      perServing: {
        cal: Math.round(recipeTotals.cal / newRecipe.servings),
        protein: Math.round(recipeTotals.protein / newRecipe.servings * 10) / 10,
        carbs: Math.round(recipeTotals.carbs / newRecipe.servings * 10) / 10,
        fat: Math.round(recipeTotals.fat / newRecipe.servings * 10) / 10,
      },
    })
    setNewRecipe({ name: '', servings: 1, ingredients: [] })
    setMode('list')
  }

  function handleAddToTracker(recipe) {
    addRecipeToTracker(DAYS[currentDay], addMeal, recipe)
    setShowAddToTracker(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recetas</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Crea y guarda tus recetas con macros calculados</p>
        </div>
        <button
          onClick={() => setMode(mode === 'create' ? 'list' : 'create')}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            mode === 'create'
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
          }`}
        >
          {mode === 'create' ? <><X size={16} /> Cancelar</> : <><Plus size={16} /> Nueva receta</>}
        </button>
      </div>

      {mode === 'create' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <ChefHat size={20} className="text-emerald-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Crear receta</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Nombre de la receta</label>
              <input
                type="text" value={newRecipe.name}
                onChange={e => setNewRecipe(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Pollo al curry con arroz"
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm border-none outline-none text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Raciones</label>
              <input
                type="number" value={newRecipe.servings} min={1}
                onChange={e => setNewRecipe(prev => ({ ...prev, servings: Number(e.target.value) || 1 }))}
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm border-none outline-none text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Add ingredient search */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Añadir ingrediente</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar alimento..."
                className="w-full pl-9 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm border-none outline-none text-gray-900 dark:text-white"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
                {searchResults.map(food => (
                  <button
                    key={food.id}
                    onClick={() => addIngredient(food)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <span className="text-sm text-gray-900 dark:text-white">{food.name}</span>
                    <span className="text-xs text-gray-400">{food.cal} kcal/100g</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ingredient list */}
          {newRecipe.ingredients.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Ingredientes ({newRecipe.ingredients.length})</p>
              {newRecipe.ingredients.map(ing => (
                <div key={ing.uid} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-2.5">
                  <span className="flex-1 text-sm text-gray-900 dark:text-white">{ing.name}</span>
                  <input
                    type="number" value={ing.grams} min={1}
                    onChange={e => updateIngredientGrams(ing.uid, e.target.value)}
                    className="w-16 px-2 py-1 text-xs text-center rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-none outline-none"
                  />
                  <span className="text-xs text-gray-400">g</span>
                  <span className="text-xs text-gray-500">{Math.round(ing.cal * ing.grams / 100)} kcal</span>
                  <button onClick={() => removeIngredient(ing.uid)} className="p-1 text-gray-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {/* Totals */}
              <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-4 border border-emerald-200 dark:border-emerald-500/20 mt-3">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2">Total de la receta</p>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{Math.round(recipeTotals.cal)}</p>
                    <p className="text-xs text-gray-500">kcal</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-emerald-600">{Math.round(recipeTotals.protein)}g</p>
                    <p className="text-xs text-gray-500">Proteína</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-600">{Math.round(recipeTotals.carbs)}g</p>
                    <p className="text-xs text-gray-500">Carbos</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-amber-600">{Math.round(recipeTotals.fat)}g</p>
                    <p className="text-xs text-gray-500">Grasa</p>
                  </div>
                </div>
                {newRecipe.servings > 1 && (
                  <p className="text-xs text-center text-emerald-600 dark:text-emerald-400 mt-2">
                    Por ración: {Math.round(recipeTotals.cal / newRecipe.servings)} kcal · P:{Math.round(recipeTotals.protein / newRecipe.servings)}g · C:{Math.round(recipeTotals.carbs / newRecipe.servings)}g · G:{Math.round(recipeTotals.fat / newRecipe.servings)}g
                  </p>
                )}
              </div>
            </div>
          )}

          <button
            onClick={saveRecipe}
            disabled={!newRecipe.name || newRecipe.ingredients.length === 0}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            <Check size={16} /> Guardar receta
          </button>
        </div>
      )}

      {/* Recipe list */}
      {mode === 'list' && (
        <div>
          {recipes.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
              <BookOpen size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No tienes recetas guardadas</p>
              <p className="text-sm text-gray-400 mt-1">Crea tu primera receta con el botón de arriba</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recipes.map(recipe => (
                <div key={recipe.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{recipe.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{recipe.ingredients.length} ingredientes · {recipe.servings} ración{recipe.servings > 1 ? 'es' : ''}</p>
                    </div>
                    <button onClick={() => removeRecipe(recipe.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-3 text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{recipe.totalCal}</p>
                      <p className="text-[10px] text-gray-400">kcal</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-500">{recipe.totalProtein}g</p>
                      <p className="text-[10px] text-gray-400">Prot</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-500">{recipe.totalCarbs}g</p>
                      <p className="text-[10px] text-gray-400">Carb</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-amber-500">{recipe.totalFat}g</p>
                      <p className="text-[10px] text-gray-400">Grasa</p>
                    </div>
                  </div>

                  {/* Ingredients mini list */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {recipe.ingredients.map(i => `${i.name} (${i.grams}g)`).join(' · ')}
                  </div>

                  {/* Add to tracker */}
                  {showAddToTracker === recipe.id ? (
                    <div className="flex gap-2">
                      <select
                        value={addMeal}
                        onChange={e => setAddMeal(e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm border-none outline-none text-gray-900 dark:text-white"
                      >
                        {MEALS.map(m => <option key={m} value={m}>{MEAL_LABELS[m]}</option>)}
                      </select>
                      <button
                        onClick={() => handleAddToTracker(recipe)}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium"
                      >
                        Añadir
                      </button>
                      <button onClick={() => setShowAddToTracker(null)} className="px-3 py-2 text-gray-400 text-sm">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddToTracker(recipe.id)}
                      className="w-full py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Utensils size={14} /> Añadir al tracker
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
