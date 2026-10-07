'use client'
import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'
import { DAYS, MEALS, MEAL_SUGGESTIONS, MEAL_SPLIT, getGoalKey, computeFoodsTotals, scaleFoods } from '../data/foods'
import { SUPPLEMENTS_DB } from '../data/supplements'
import { useAuth } from './AuthContext'

const AppContext = createContext()

const DEFAULT_PROFILE = {
  name: '',
  age: 25,
  weight: 75,
  height: 175,
  gender: 'male',
  activity: 'moderate',
  goal: 'maintenance',
}

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

const GOAL_ADJUSTMENTS = {
  deficit: -500,
  maintenance: 0,
  bulk: 400,
}

function calculateBMR(profile) {
  if (profile.gender === 'male') {
    return 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5
  }
  return 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161
}

function calculateTDEE(profile) {
  const bmr = calculateBMR(profile)
  const tdee = bmr * (ACTIVITY_MULTIPLIERS[profile.activity] || 1.55)
  return Math.round(tdee + (GOAL_ADJUSTMENTS[profile.goal] || 0))
}

function calculateMacros(calories, goal) {
  const macros = {
    deficit: { proteinPct: 0.35, carbsPct: 0.40, fatPct: 0.25 },
    maintenance: { proteinPct: 0.30, carbsPct: 0.45, fatPct: 0.25 },
    bulk: { proteinPct: 0.30, carbsPct: 0.50, fatPct: 0.20 },
  }
  const m = macros[goal] || macros.maintenance
  return {
    protein: Math.round((calories * m.proteinPct) / 4),
    carbs: Math.round((calories * m.carbsPct) / 4),
    fat: Math.round((calories * m.fatPct) / 9),
  }
}

function createEmptyWeek() {
  const week = {}
  DAYS.forEach(day => {
    week[day] = {}
    MEALS.forEach(meal => {
      week[day][meal] = []
    })
  })
  return week
}

function createEmptySupplements() {
  const s = {}
  DAYS.forEach(day => { s[day] = [] })
  return s
}

// ─── Fechas para el tracker diario ───
// El tracker se guarda por FECHA (YYYY-MM-DD), no por día de la semana, para
// que cada día empiece vacío automáticamente y quede histórico real.
function todayKey() {
  return new Date().toISOString().split('T')[0]
}

function emptyMeals() {
  const m = {}
  MEALS.forEach(meal => { m[meal] = [] })
  return m
}

// Devuelve las claves de fecha de los últimos n días (de más antiguo a hoy).
function lastNDays(n) {
  const out = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    out.push(d.toISOString().split('T')[0])
  }
  return out
}

// Etiqueta corta de día de la semana para una clave de fecha.
function dateLabel(key) {
  const d = new Date(key + 'T00:00:00')
  const idx = d.getDay() === 0 ? 6 : d.getDay() - 1
  return DAYS_SHORT_CTX[idx]
}

const DAYS_SHORT_CTX = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

// Si el tracker guardado es del formato antiguo (por día de semana), lo
// descartamos para empezar con el nuevo formato por fecha.
function normalizeTracker(t) {
  if (!t || typeof t !== 'object') return {}
  const keys = Object.keys(t)
  const isDateKeyed = keys.length === 0 || keys.every(k => /^\d{4}-\d{2}-\d{2}$/.test(k))
  return isDateKeyed ? t : {}
}

// ─── STREAKS & ACHIEVEMENTS ───
const ACHIEVEMENTS = [
  { id: 'first_log', name: 'Primer registro', desc: 'Registra tu primera comida', icon: '🎯', check: (ctx) => ctx.totalLogged >= 1 },
  { id: 'streak_3', name: '3 días seguidos', desc: 'Registra comidas 3 días consecutivos', icon: '🔥', check: (ctx) => ctx.streak >= 3 },
  { id: 'streak_7', name: 'Semana completa', desc: '7 días seguidos registrando', icon: '⭐', check: (ctx) => ctx.streak >= 7 },
  { id: 'streak_14', name: 'Dos semanas', desc: '14 días seguidos registrando', icon: '💪', check: (ctx) => ctx.streak >= 14 },
  { id: 'streak_30', name: 'Un mes', desc: '30 días seguidos registrando', icon: '🏆', check: (ctx) => ctx.streak >= 30 },
  { id: 'protein_5', name: 'Proteína master', desc: 'Llega a tu objetivo de proteína 5 días', icon: '🥩', check: (ctx) => ctx.proteinDaysHit >= 5 },
  { id: 'perfect_day', name: 'Día perfecto', desc: 'Cumple calorías y todos los macros en un día', icon: '💎', check: (ctx) => ctx.perfectDays >= 1 },
  { id: 'perfect_week', name: 'Semana perfecta', desc: '7 días perfectos seguidos', icon: '👑', check: (ctx) => ctx.perfectDays >= 7 },
  { id: 'recipes_3', name: 'Chef amateur', desc: 'Crea 3 recetas', icon: '👨‍🍳', check: (ctx) => ctx.recipesCount >= 3 },
  { id: 'recipes_10', name: 'Chef profesional', desc: 'Crea 10 recetas', icon: '🧑‍🍳', check: (ctx) => ctx.recipesCount >= 10 },
  { id: 'weight_5', name: 'Constancia', desc: 'Registra tu peso 5 veces', icon: '⚖️', check: (ctx) => ctx.weightLogs >= 5 },
  { id: 'supplements_7', name: 'Suplementado', desc: 'Registra suplementos 7 días', icon: '💊', check: (ctx) => ctx.supplementDays >= 7 },
]

export function AppProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id
  const [hydrated, setHydrated] = useState(false)
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [tracker, setTracker] = useState({})
  const [weekPlan, setWeekPlan] = useState(createEmptyWeek)
  const [weightLog, setWeightLog] = useState([])
  const [recipes, setRecipes] = useState([])
  const [supplements, setSupplements] = useState(createEmptySupplements)
  const [mySupplements, setMySupplements] = useState([]) // active supplement stack
  const [streakData, setStreakData] = useState({ currentStreak: 0, bestStreak: 0, loggedDays: [] })
  const [unlockedAchievements, setUnlockedAchievements] = useState([])
  const [photoEstimates, setPhotoEstimates] = useState([]) // AI photo estimates history
  const [profileHistory, setProfileHistory] = useState([]) // calculator saved profiles history
  const [exerciseHistory, setExerciseHistory] = useState([]) // exercise sessions
  const [currentDay, setCurrentDay] = useState(() => {
    const d = new Date().getDay()
    return d === 0 ? 6 : d - 1
  })

  const targetCalories = calculateTDEE(profile)
  const targetMacros = calculateMacros(targetCalories, profile.goal)

  // Objetivo recomendado para una comida concreta, según el reparto del objetivo.
  const getMealTarget = useCallback((meal) => {
    const split = MEAL_SPLIT[getGoalKey(profile.goal)]
    const pct = split[meal] || 0.25
    return {
      cal: Math.round(targetCalories * pct),
      protein: Math.round(targetMacros.protein * pct),
      carbs: Math.round(targetMacros.carbs * pct),
      fat: Math.round(targetMacros.fat * pct),
    }
  }, [profile.goal, targetCalories, targetMacros])

  // ─── Carga por usuario ───
  // Cada usuario guarda sus datos en su propia clave (ps_data_v2_<id>), así
  // que al cerrar e iniciar sesión cada cuenta recupera lo suyo y nadie pisa
  // los datos de otro. Al cambiar de usuario se reinicia el estado al de esa
  // cuenta (o a valores por defecto si es nueva).
  useEffect(() => {
    if (!userId) return
    setHydrated(false)
    let data = null
    try {
      const raw = localStorage.getItem(`ps_data_v2_${userId}`)
      if (raw) {
        data = JSON.parse(raw)
      } else {
        // Migración única: los datos antiguos globales pasan al PRIMER
        // usuario que inicie sesión tras la actualización.
        const legacy = localStorage.getItem('ps_data_v2')
        if (legacy && !localStorage.getItem('ps_legacy_migrated')) {
          data = JSON.parse(legacy)
          localStorage.setItem('ps_legacy_migrated', '1')
        }
      }
    } catch {}

    setProfile(data?.profile || DEFAULT_PROFILE)
    setTracker(normalizeTracker(data?.tracker))
    setWeekPlan(data?.weekPlan || createEmptyWeek())
    setWeightLog(data?.weightLog || [])
    setRecipes(data?.recipes || [])
    setSupplements(data?.supplements || createEmptySupplements())
    setMySupplements(data?.mySupplements || [])
    setStreakData(data?.streakData || { currentStreak: 0, bestStreak: 0, loggedDays: [] })
    setUnlockedAchievements(data?.unlockedAchievements || [])
    setPhotoEstimates(data?.photoEstimates || [])
    setProfileHistory(data?.profileHistory || [])
    setExerciseHistory(data?.exerciseHistory || [])
    setHydrated(true)
  }, [userId])

  // ─── Guardado por usuario ───
  // Solo guardamos tras cargar (hydrated) para no pisar los datos del usuario
  // con los valores por defecto del primer render.
  useEffect(() => {
    if (!hydrated || !userId) return
    try {
      localStorage.setItem(`ps_data_v2_${userId}`, JSON.stringify({
        profile, tracker, weekPlan, weightLog, recipes,
        supplements, mySupplements, streakData, unlockedAchievements, photoEstimates, profileHistory, exerciseHistory,
      }))
    } catch {}
  }, [hydrated, userId, profile, tracker, weekPlan, weightLog, recipes, supplements, mySupplements, streakData, unlockedAchievements, photoEstimates, profileHistory, exerciseHistory])

  // ─── TRACKER (por fecha) ───
  // Las funciones aceptan una fecha (por defecto hoy) para poder consultar y
  // editar también días pasados.
  const addFoodToTracker = useCallback((meal, food, dateKey) => {
    const dk = dateKey || todayKey()
    setTracker(prev => ({
      ...prev,
      [dk]: {
        ...(prev[dk] || emptyMeals()),
        [meal]: [...(prev[dk]?.[meal] || []), { ...food, id: Date.now() + Math.random() }],
      },
    }))
    // La racha solo cuenta para hoy.
    if (dk === todayKey()) updateStreak()
  }, [])

  const removeFoodFromTracker = useCallback((meal, foodId, dateKey) => {
    const dk = dateKey || todayKey()
    setTracker(prev => ({
      ...prev,
      [dk]: {
        ...(prev[dk] || emptyMeals()),
        [meal]: (prev[dk]?.[meal] || []).filter(f => f.id !== foodId),
      },
    }))
  }, [])

  // Cambiar los gramos de un alimento ya registrado.
  const updateFoodGrams = useCallback((meal, foodId, grams, dateKey) => {
    const dk = dateKey || todayKey()
    const g = Math.max(1, Math.round(Number(grams) || 0))
    setTracker(prev => ({
      ...prev,
      [dk]: {
        ...(prev[dk] || emptyMeals()),
        [meal]: (prev[dk]?.[meal] || []).map(f => f.id === foodId ? { ...f, grams: g } : f),
      },
    }))
  }, [])

  // ─── PLAN ───
  // Normaliza una comida del plan para que SIEMPRE lleve sus totales de macros
  // (cal, protein, carbs, fat) calculados desde sus ingredientes. Así el plan
  // muestra macros reales y no ceros.
  function normalizePlanMeal(mealData) {
    if (mealData.foods && (mealData.protein === undefined || mealData.carbs === undefined)) {
      const totals = computeFoodsTotals(mealData.foods)
      return { ...mealData, cal: totals.cal, protein: totals.protein, carbs: totals.carbs, fat: totals.fat }
    }
    return mealData
  }

  const addMealToPlan = useCallback((day, meal, mealData) => {
    const normalized = normalizePlanMeal(mealData)
    setWeekPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: [...(prev[day]?.[meal] || []), { ...normalized, id: Date.now() + Math.random() }],
      },
    }))
  }, [])

  const removeMealFromPlan = useCallback((day, meal, mealId) => {
    setWeekPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: (prev[day]?.[meal] || []).filter(m => m.id !== mealId),
      },
    }))
  }, [])

  // Cambiar los gramos de un alimento individual del plan (valores por 100g).
  const updatePlanFoodGrams = useCallback((day, meal, itemId, grams) => {
    const g = Math.max(1, Math.round(Number(grams) || 0))
    setWeekPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: (prev[day]?.[meal] || []).map(m => m.id === itemId ? { ...m, grams: g } : m),
      },
    }))
  }, [])

  // Escala las porciones de una comida del plan por un factor (p. ej. 1.1 para
  // +10%, 0.9 para -10%). Sirve tanto para comidas con ingredientes (escala
  // cada ingrediente y recalcula macros) como para alimentos individuales.
  const scalePlanMealPortion = useCallback((day, meal, itemId, factor) => {
    setWeekPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: (prev[day]?.[meal] || []).map(it => {
          if (it.id !== itemId) return it
          if (it.foods) {
            const newFoods = scaleFoods(it.foods, factor)
            const t = computeFoodsTotals(newFoods)
            return { ...it, foods: newFoods, cal: t.cal, protein: t.protein, carbs: t.carbs, fat: t.fat }
          }
          const newG = Math.max(5, Math.round(((it.grams || 100) * factor) / 5) * 5)
          return { ...it, grams: newG }
        }),
      },
    }))
  }, [])

  // Cambia los gramos de UN ingrediente dentro de una comida del plan y
  // recalcula los macros de la comida (p. ej. bajar aguacate, subir pavo).
  const updatePlanIngredientGrams = useCallback((day, meal, itemId, idx, grams) => {
    const g = Math.max(5, Math.round(Number(grams) || 0))
    setWeekPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: (prev[day]?.[meal] || []).map(it => {
          if (it.id !== itemId || !it.foods) return it
          const newFoods = it.foods.map((f, i) => i === idx ? { ...f, grams: g } : f)
          const t = computeFoodsTotals(newFoods)
          return { ...it, foods: newFoods, cal: t.cal, protein: t.protein, carbs: t.carbs, fat: t.fat }
        }),
      },
    }))
  }, [])

  // Escala un ingrediente por factor (±10%), redondeando a 5g.
  const scalePlanIngredient = useCallback((day, meal, itemId, idx, factor) => {
    setWeekPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: (prev[day]?.[meal] || []).map(it => {
          if (it.id !== itemId || !it.foods) return it
          const newFoods = it.foods.map((f, i) => i === idx
            ? { ...f, grams: Math.max(5, Math.round(((f.grams || 0) * factor) / 5) * 5) }
            : f)
          const t = computeFoodsTotals(newFoods)
          return { ...it, foods: newFoods, cal: t.cal, protein: t.protein, carbs: t.carbs, fat: t.fat }
        }),
      },
    }))
  }, [])

  // Quita un ingrediente de una comida del plan. Si era el último, elimina la
  // comida entera.
  const removePlanIngredient = useCallback((day, meal, itemId, idx) => {
    setWeekPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: (prev[day]?.[meal] || []).flatMap(it => {
          if (it.id !== itemId || !it.foods) return [it]
          const newFoods = it.foods.filter((_, i) => i !== idx)
          if (newFoods.length === 0) return []
          const t = computeFoodsTotals(newFoods)
          return [{ ...it, foods: newFoods, cal: t.cal, protein: t.protein, carbs: t.carbs, fat: t.fat }]
        }),
      },
    }))
  }, [])

  const autoGeneratePlan = useCallback(() => {
    const goal = getGoalKey(profile.goal)
    const suggestions = MEAL_SUGGESTIONS[goal]
    const dayTarget = calculateTDEE(profile)
    const split = MEAL_SPLIT[goal]
    const newPlan = {}

    DAYS.forEach(day => {
      newPlan[day] = {}
      MEALS.forEach(meal => {
        const options = suggestions[meal]
        const pick = options[Math.floor(Math.random() * options.length)]
        // Ajusta las porciones para acercar cada comida a su objetivo calórico
        // (objetivo del día × reparto de la comida), con un tope de escala
        // razonable para no deformar las raciones.
        const base = computeFoodsTotals(pick.foods)
        const mealTarget = Math.round(dayTarget * (split[meal] || 0.25))
        let factor = base.cal > 0 ? mealTarget / base.cal : 1
        factor = Math.max(0.5, Math.min(2, factor))
        const scaledFoods = scaleFoods(pick.foods, factor)
        const totals = computeFoodsTotals(scaledFoods)
        newPlan[day][meal] = [{
          name: pick.name,
          foods: scaledFoods,
          cal: totals.cal,
          protein: totals.protein,
          carbs: totals.carbs,
          fat: totals.fat,
          id: Date.now() + Math.random(),
        }]
      })
    })
    setWeekPlan(newPlan)
  }, [profile])

  // Vacía el plan semanal completo para empezar de cero.
  const clearPlan = useCallback(() => {
    setWeekPlan(createEmptyWeek())
  }, [])

  // ─── RECIPES ───
  const addRecipe = useCallback((recipe) => {
    setRecipes(prev => [...prev, { ...recipe, id: Date.now() + Math.random(), createdAt: new Date().toISOString() }])
  }, [])

  const removeRecipe = useCallback((recipeId) => {
    setRecipes(prev => prev.filter(r => r.id !== recipeId))
  }, [])

  const addRecipeToTracker = useCallback((meal, recipe) => {
    // El tracker guarda valores por 100g y multiplica por los gramos de la
    // porción. Convertimos los totales de la receta a por-100g.
    const grams = recipe.totalGrams || 100
    const factor = grams > 0 ? 100 / grams : 1
    const food = {
      name: recipe.name,
      cal: Math.round((recipe.totalCal || 0) * factor),
      protein: Math.round((recipe.totalProtein || 0) * factor * 10) / 10,
      carbs: Math.round((recipe.totalCarbs || 0) * factor * 10) / 10,
      fat: Math.round((recipe.totalFat || 0) * factor * 10) / 10,
      grams,
      isRecipe: true,
    }
    addFoodToTracker(meal, food)
  }, [addFoodToTracker])

  // ─── SUPPLEMENTS ───
  const toggleSupplement = useCallback((day, supplementId) => {
    setSupplements(prev => {
      const daySupps = prev[day] || []
      const exists = daySupps.includes(supplementId)
      return {
        ...prev,
        [day]: exists ? daySupps.filter(s => s !== supplementId) : [...daySupps, supplementId],
      }
    })
  }, [])

  const addToMySupplements = useCallback((supplement) => {
    setMySupplements(prev => {
      if (prev.find(s => s.id === supplement.id)) return prev
      return [...prev, supplement]
    })
  }, [])

  const removeFromMySupplements = useCallback((id) => {
    setMySupplements(prev => prev.filter(s => s.id !== id))
  }, [])

  // ─── EXERCISE ───
  const addExercise = useCallback((session) => {
    setExerciseHistory(prev => [...prev, { ...session, id: Date.now() + Math.random(), date: new Date().toISOString() }])
  }, [])

  const removeExercise = useCallback((id) => {
    setExerciseHistory(prev => prev.filter(e => e.id !== id))
  }, [])

  // ─── PROFILE HISTORY ───
  const saveProfileWithHistory = useCallback((newProfile) => {
    setProfile(newProfile)
    const cal = calculateTDEE(newProfile)
    const macros = calculateMacros(cal, newProfile.goal)
    setProfileHistory(prev => [...prev, {
      id: Date.now(),
      date: new Date().toISOString(),
      weight: newProfile.weight,
      height: newProfile.height,
      age: newProfile.age,
      gender: newProfile.gender,
      activity: newProfile.activity,
      goal: newProfile.goal,
      calories: cal,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
    }])
  }, [])

  const removeProfileHistory = useCallback((id) => {
    setProfileHistory(prev => prev.filter(h => h.id !== id))
  }, [])

  // ─── PHOTO ESTIMATES ───
  const addPhotoEstimate = useCallback((estimate) => {
    setPhotoEstimates(prev => [...prev, { ...estimate, id: Date.now(), date: new Date().toISOString() }])
  }, [])

  // ─── STREAKS ───
  function updateStreak(day) {
    setStreakData(prev => {
      const today = new Date().toISOString().split('T')[0]
      const loggedDays = prev.loggedDays.includes(today) ? prev.loggedDays : [...prev.loggedDays, today]
      // Calculate current streak
      let streak = 0
      const sorted = [...loggedDays].sort().reverse()
      for (let i = 0; i < sorted.length; i++) {
        const expected = new Date()
        expected.setDate(expected.getDate() - i)
        if (sorted[i] === expected.toISOString().split('T')[0]) {
          streak++
        } else break
      }
      return {
        currentStreak: streak,
        bestStreak: Math.max(prev.bestStreak, streak),
        loggedDays,
      }
    })
  }

  // ─── TOTALS ───
  // Suma los macros de una entrada. Si es una comida con ingredientes (.foods),
  // los calcula desde ellos (robusto incluso con datos antiguos); si es un
  // alimento individual, usa sus valores por 100g × gramos.
  function entryTotals(entry) {
    if (entry.foods) return computeFoodsTotals(entry.foods)
    const g = (entry.grams || 100) / 100
    return {
      cal: (entry.cal || 0) * g,
      protein: (entry.protein || 0) * g,
      carbs: (entry.carbs || 0) * g,
      fat: (entry.fat || 0) * g,
    }
  }

  const getDayTotals = useCallback((day, source = 'tracker') => {
    const data = source === 'tracker' ? tracker : weekPlan
    const dayData = data[day] || {}
    let cal = 0, protein = 0, carbs = 0, fat = 0
    MEALS.forEach(meal => {
      (dayData[meal] || []).forEach(food => {
        const t = entryTotals(food)
        cal += t.cal; protein += t.protein; carbs += t.carbs; fat += t.fat
      })
    })
    return { cal: Math.round(cal), protein: Math.round(protein), carbs: Math.round(carbs), fat: Math.round(fat) }
  }, [tracker, weekPlan])

  const getMealTotals = useCallback((day, meal, source = 'tracker') => {
    const data = source === 'tracker' ? tracker : weekPlan
    const foods = data[day]?.[meal] || []
    let cal = 0, protein = 0, carbs = 0, fat = 0
    foods.forEach(food => {
      const t = entryTotals(food)
      cal += t.cal; protein += t.protein; carbs += t.carbs; fat += t.fat
    })
    return { cal: Math.round(cal), protein: Math.round(protein), carbs: Math.round(carbs), fat: Math.round(fat) }
  }, [tracker, weekPlan])

  const getWeekTotals = useCallback((source = 'tracker') => {
    if (source === 'plan') {
      // El plan sigue siendo por día de la semana.
      return DAYS.map((day, i) => ({ day, label: DAYS_SHORT_CTX[i], key: day, ...getDayTotals(day, 'plan') }))
    }
    // El tracker es por fecha: devolvemos los últimos 7 días (hasta hoy).
    const today = todayKey()
    return lastNDays(7).map(key => ({
      key,
      day: key,
      label: dateLabel(key),
      date: key,
      isToday: key === today,
      ...getDayTotals(key, 'tracker'),
    }))
  }, [getDayTotals])

  // Totales de los últimos n días del tracker (para informes mensuales).
  const getRangeTotals = useCallback((days = 30) => {
    return lastNDays(days).map(key => ({
      key, date: key, label: dateLabel(key), ...getDayTotals(key, 'tracker'),
    }))
  }, [getDayTotals])

  const addWeight = useCallback((weight) => {
    setWeightLog(prev => [...prev, { id: Date.now(), date: new Date().toISOString().split('T')[0], weight }])
  }, [])

  const removeWeight = useCallback((id) => {
    setWeightLog(prev => prev.filter(w => w.id !== id))
  }, [])

  // ─── SMART ALERTS ───
  const getAlerts = useCallback(() => {
    const day = todayKey()
    const totals = getDayTotals(day)
    const alerts = []
    const hour = new Date().getHours()

    // Low protein alert
    if (totals.cal > targetCalories * 0.5 && totals.protein < targetMacros.protein * 0.3) {
      alerts.push({ type: 'warning', icon: '🥩', title: 'Baja proteína', message: `Llevas ${totals.protein}g de ${targetMacros.protein}g. Añade fuentes de proteína como pollo, huevos o yogur griego.` })
    }

    // Calorie overshoot
    if (totals.cal > targetCalories) {
      alerts.push({ type: 'danger', icon: '🔴', title: 'Exceso calórico', message: `Has superado tu objetivo en ${totals.cal - targetCalories} kcal. Ajusta las siguientes comidas.` })
    }

    // Pacing alert (contextual by time of day)
    if (hour >= 12 && hour <= 15 && totals.cal < targetCalories * 0.25) {
      alerts.push({ type: 'info', icon: '⏰', title: 'Pocas calorías', message: `Son las ${hour}:00 y llevas solo ${totals.cal} kcal. No te saltes el almuerzo.` })
    }

    if (hour >= 18 && totals.cal < targetCalories * 0.5) {
      alerts.push({ type: 'info', icon: '🌙', title: 'Ponte al día', message: `Son las ${hour}:00 y solo llevas ${totals.cal} de ${targetCalories} kcal. Necesitas ${targetCalories - totals.cal} kcal más.` })
    }

    // Remaining budget for dinner
    if (hour >= 17 && hour <= 22 && totals.cal > 0 && totals.cal < targetCalories) {
      const remaining = targetCalories - totals.cal
      alerts.push({ type: 'success', icon: '✅', title: 'Presupuesto cena', message: `Te quedan ${remaining} kcal para la cena. ${remaining > 600 ? 'Puedes permitirte una cena completa.' : remaining > 300 ? 'Opta por una cena ligera.' : 'Ve por algo muy ligero.'}` })
    }

    // High fat ratio
    if (totals.fat > targetMacros.fat * 1.2 && totals.cal > targetCalories * 0.4) {
      alerts.push({ type: 'warning', icon: '🧈', title: 'Exceso de grasa', message: `Llevas ${totals.fat}g de grasa (objetivo: ${targetMacros.fat}g). Reduce grasas en las siguientes comidas.` })
    }

    // Supplement reminder (los suplementos siguen siendo por día de semana)
    const daySupps = supplements[DAYS[currentDay]] || []
    const missedSupps = mySupplements.filter(s => !daySupps.includes(s.id))
    if (missedSupps.length > 0 && hour >= 8) {
      alerts.push({ type: 'info', icon: '💊', title: 'Suplementos pendientes', message: `No has registrado: ${missedSupps.map(s => s.name).join(', ')}` })
    }

    // Streak motivation
    if (streakData.currentStreak >= 3) {
      alerts.push({ type: 'success', icon: '🔥', title: `Racha de ${streakData.currentStreak} días`, message: '¡No la rompas! Sigue registrando para mantener tu racha.' })
    }

    return alerts
  }, [currentDay, getDayTotals, targetCalories, targetMacros, supplements, mySupplements, streakData])

  // ─── ACHIEVEMENTS CHECK ───
  const checkAchievements = useMemo(() => {
    const ctx = {
      totalLogged: streakData.loggedDays.length,
      streak: streakData.currentStreak,
      proteinDaysHit: getWeekTotals().filter(d => d.protein >= targetMacros.protein * 0.9).length,
      perfectDays: getWeekTotals().filter(d => {
        if (d.cal === 0) return false
        return d.cal <= targetCalories * 1.05 && d.cal >= targetCalories * 0.9
          && d.protein >= targetMacros.protein * 0.85
      }).length,
      recipesCount: recipes.length,
      weightLogs: weightLog.length,
      supplementDays: Object.values(supplements).filter(d => d.length > 0).length,
    }

    const newUnlocked = ACHIEVEMENTS.filter(a => a.check(ctx)).map(a => a.id)
    return newUnlocked
  }, [streakData, getWeekTotals, targetMacros, targetCalories, recipes, weightLog, supplements])

  // Update achievements
  useEffect(() => {
    if (checkAchievements.length > unlockedAchievements.length) {
      setUnlockedAchievements(checkAchievements)
    }
  }, [checkAchievements, unlockedAchievements])

  const value = {
    profile, setProfile,
    tracker, weekPlan,
    currentDay, setCurrentDay,
    targetCalories, targetMacros,
    addFoodToTracker, removeFoodFromTracker, updateFoodGrams,
    addMealToPlan, removeMealFromPlan, autoGeneratePlan, clearPlan, updatePlanFoodGrams, scalePlanMealPortion,
    updatePlanIngredientGrams, scalePlanIngredient, removePlanIngredient,
    getDayTotals, getMealTotals, getWeekTotals, getRangeTotals, getMealTarget,
    todayKey,
    weightLog, addWeight, removeWeight,
    calculateTDEE, calculateMacros, calculateBMR,
    ACTIVITY_MULTIPLIERS,
    // Recipes
    recipes, addRecipe, removeRecipe, addRecipeToTracker,
    // Supplements
    supplements, mySupplements, toggleSupplement, addToMySupplements, removeFromMySupplements,
    // Streaks & achievements
    streakData, unlockedAchievements, ACHIEVEMENTS,
    // Alerts
    getAlerts,
    // Photo
    photoEstimates, addPhotoEstimate,
    // Profile history
    profileHistory, saveProfileWithHistory, removeProfileHistory,
    // Exercise
    exerciseHistory, addExercise, removeExercise,
  }

  return <AppContext value={value}>{children}</AppContext>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
