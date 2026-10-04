'use client'
import { useApp } from '../context/AppContext'
import { Flame, Trophy, Star, Lock, Target, Calendar } from 'lucide-react'

export default function StreaksPage() {
  const { streakData, unlockedAchievements, ACHIEVEMENTS } = useApp()

  const totalDays = streakData.loggedDays.length

  // Build calendar-like view for last 30 days
  const last30 = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    last30.push({
      date: dateStr,
      dayNum: d.getDate(),
      dayName: d.toLocaleDateString('es-ES', { weekday: 'narrow' }),
      logged: streakData.loggedDays.includes(dateStr),
      isToday: i === 0,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rachas y Logros</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tu constancia y tus metas desbloqueadas</p>
      </div>

      {/* Streak stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-center">
          <Flame size={32} className="mx-auto text-orange-500 mb-3" />
          <p className="text-4xl font-bold text-gray-900 dark:text-white">{streakData.currentStreak}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Racha actual</p>
          <p className="text-xs text-orange-500 mt-2">
            {streakData.currentStreak === 0 ? 'Empieza registrando hoy' :
             streakData.currentStreak < 3 ? 'Buen comienzo' :
             streakData.currentStreak < 7 ? 'Vas muy bien' :
             streakData.currentStreak < 14 ? 'Increíble constancia' :
             streakData.currentStreak < 30 ? 'Eres imparable' : 'Leyenda'}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-center">
          <Star size={32} className="mx-auto text-amber-500 mb-3" />
          <p className="text-4xl font-bold text-gray-900 dark:text-white">{streakData.bestStreak}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Mejor racha</p>
          <p className="text-xs text-amber-500 mt-2">Tu récord personal</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-center">
          <Calendar size={32} className="mx-auto text-emerald-500 mb-3" />
          <p className="text-4xl font-bold text-gray-900 dark:text-white">{totalDays}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Días registrados</p>
          <p className="text-xs text-emerald-500 mt-2">Total acumulado</p>
        </div>
      </div>

      {/* Last 30 days activity */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Últimos 30 días</h2>
        <div className="grid grid-cols-10 sm:grid-cols-15 gap-1.5">
          {last30.map((d) => (
            <div
              key={d.date}
              title={`${d.date}${d.logged ? ' — Registrado' : ''}`}
              className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                d.isToday
                  ? d.logged
                    ? 'bg-emerald-500 text-white ring-2 ring-emerald-300 dark:ring-emerald-400'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 ring-2 ring-gray-400'
                  : d.logged
                    ? 'bg-emerald-400 dark:bg-emerald-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
              }`}
            >
              {d.dayNum}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-400 dark:bg-emerald-500 inline-block" />
            Registrado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-800 inline-block" />
            Sin registro
          </span>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Trophy size={20} className="text-amber-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Logros ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {ACHIEVEMENTS.map(ach => {
            const unlocked = unlockedAchievements.includes(ach.id)
            return (
              <div
                key={ach.id}
                className={`rounded-xl p-4 border transition-all ${
                  unlocked
                    ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{unlocked ? ach.icon : ''}</span>
                  {!unlocked && <Lock size={20} className="text-gray-400" />}
                  <div>
                    <p className={`text-sm font-semibold ${unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                      {ach.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{ach.desc}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
