'use client'
import { useApp } from './context/AppContext'
import { DAYS, DAYS_SHORT, MEALS, MEAL_LABELS, MEAL_ICONS } from './data/foods'
import MacroRing from './components/MacroRing'
import CalorieBar from './components/CalorieBar'
import Link from 'next/link'
import {
  Flame, Target, TrendingUp, TrendingDown, Minus,
  CalendarDays, Apple, Calculator, ArrowRight, AlertTriangle,
  ChefHat, Sparkles, Pill, Trophy
} from 'lucide-react'

const GOAL_CONFIG = {
  deficit: { label: 'Definición', icon: TrendingDown, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/20' },
  maintenance: { label: 'Mantenimiento', icon: Minus, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20' },
  bulk: { label: 'Volumen', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-200 dark:border-orange-500/20' },
}

export default function Dashboard() {
  const { profile, targetCalories, targetMacros, getDayTotals, currentDay, tracker, getAlerts, streakData, unlockedAchievements } = useApp()
  const day = DAYS[currentDay]
  const totals = getDayTotals(day)
  const goalCfg = GOAL_CONFIG[profile.goal]
  const GoalIcon = goalCfg.icon

  const weekData = DAYS.map((d, i) => {
    const t = getDayTotals(d)
    return { day: DAYS_SHORT[i], cal: t.cal, target: targetCalories, idx: i }
  })

  const mealSummary = MEALS.map(meal => {
    const foods = tracker[day]?.[meal] || []
    let cal = 0
    foods.forEach(f => { cal += (f.cal || 0) * ((f.grams || 100) / 100) })
    return { meal, label: MEAL_LABELS[meal], icon: MEAL_ICONS[meal], cal: Math.round(cal), count: foods.length }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {profile.name ? `Hola, ${profile.name}` : 'Dashboard'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${goalCfg.bg} ${goalCfg.border}`}>
          <GoalIcon size={18} className={goalCfg.color} />
          <span className={`text-sm font-semibold ${goalCfg.color}`}>{goalCfg.label}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">· {targetCalories} kcal/día</span>
        </div>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Flame size={20} className="text-orange-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Calorías hoy — {day}</h2>
          </div>
          <CalorieBar current={totals.cal} target={targetCalories} />
          <div className="flex justify-center gap-8 mt-6">
            <MacroRing value={totals.protein} max={targetMacros.protein} label="Proteína" color="#10b981" />
            <MacroRing value={totals.carbs} max={targetMacros.carbs} label="Carbos" color="#3b82f6" />
            <MacroRing value={totals.fat} max={targetMacros.fat} label="Grasa" color="#f59e0b" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target size={20} className="text-emerald-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Objetivo diario</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Calorías</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{targetCalories} kcal</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Proteína</span>
              <span className="text-sm font-bold text-emerald-500">{targetMacros.protein}g</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Carbohidratos</span>
              <span className="text-sm font-bold text-blue-500">{targetMacros.carbs}g</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Grasa</span>
              <span className="text-sm font-bold text-amber-500">{targetMacros.fat}g</span>
            </div>
            <hr className="border-gray-200 dark:border-gray-700" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Peso actual</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{profile.weight} kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's meals */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Comidas de hoy</h2>
          <Link href="/tracker" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
            Ir al tracker <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {mealSummary.map(m => (
            <div key={m.meal} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
              <span className="text-2xl">{m.icon}</span>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-2">{m.label}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{m.cal} <span className="text-xs text-gray-400 font-normal">kcal</span></p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{m.count} alimento{m.count !== 1 ? 's' : ''}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Week overview */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Resumen semanal</h2>
        <div className="flex items-end justify-between gap-2 h-40">
          {weekData.map((d, i) => {
            const pct = targetCalories > 0 ? Math.min((d.cal / targetCalories) * 100, 100) : 0
            const isToday = i === currentDay
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">{d.cal > 0 ? d.cal : '-'}</span>
                <div className="w-full max-w-8 bg-gray-100 dark:bg-gray-800 rounded-t-lg relative" style={{ height: 100 }}>
                  <div
                    className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-500 ${
                      isToday ? 'bg-emerald-500' : d.cal > targetCalories ? 'bg-red-400' : 'bg-emerald-300 dark:bg-emerald-600'
                    }`}
                    style={{ height: `${pct}%` }}
                  />
                </div>
                <span className={`text-xs font-medium ${isToday ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                  {d.day}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Alerts & Streak row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Smart alerts */}
        {(() => {
          const alerts = getAlerts()
          return alerts.length > 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={20} className="text-amber-500" />
                <h2 className="font-semibold text-gray-900 dark:text-white">Alertas inteligentes</h2>
              </div>
              <div className="space-y-2">
                {alerts.slice(0, 4).map((alert, i) => (
                  <div key={i} className={`flex items-start gap-3 px-4 py-3 rounded-xl text-sm ${
                    alert.type === 'danger' ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400' :
                    alert.type === 'warning' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400' :
                    alert.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
                    'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                  }`}>
                    <span className="text-lg shrink-0">{alert.icon}</span>
                    <div>
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-xs mt-0.5 opacity-80">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null
        })()}

        {/* Streak widget */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame size={20} className="text-orange-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white">Tu racha</h2>
            </div>
            <Link href="/streaks" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
              Ver todo <ArrowRight size={14} />
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-orange-500">{streakData.currentStreak}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">días seguidos</p>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Mejor racha</span>
                <span className="font-bold text-gray-900 dark:text-white">{streakData.bestStreak} días</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Total días</span>
                <span className="font-bold text-gray-900 dark:text-white">{streakData.loggedDays.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Logros</span>
                <span className="font-bold text-amber-500">{unlockedAchievements.length} <Trophy size={14} className="inline" /></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { href: '/tracker', icon: CalendarDays, label: 'Tracker', color: 'text-emerald-500' },
          { href: '/recipes', icon: ChefHat, label: 'Recetas', color: 'text-rose-500' },
          { href: '/supplements', icon: Pill, label: 'Suplementos', color: 'text-violet-500' },
          { href: '/photo', icon: Sparkles, label: 'Estimar IA', color: 'text-amber-500' },
          { href: '/foods', icon: Apple, label: 'Alimentos', color: 'text-blue-500' },
          { href: '/calculator', icon: Calculator, label: 'Calculadora', color: 'text-purple-500' },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-all group"
          >
            <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 transition-all">
              <item.icon size={22} className={item.color} />
            </div>
            <p className="text-xs font-semibold text-gray-900 dark:text-white">{item.label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
