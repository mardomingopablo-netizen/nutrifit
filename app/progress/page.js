'use client'
import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { DAYS, DAYS_SHORT, MEALS, MEAL_LABELS } from '../data/foods'
import { TrendingUp, Scale, Target, Award, Plus, Trash2, User, Download } from 'lucide-react'

const MACRO_COLORS = { protein: '#10b981', carbs: '#3b82f6', fat: '#f59e0b' }

export default function ProgressPage() {
  const {
    getDayTotals, getWeekTotals, targetCalories, targetMacros,
    profile, weightLog, addWeight, removeWeight, tracker,
    profileHistory, exerciseHistory,
  } = useApp()

  const [newWeight, setNewWeight] = useState('')
  const [tab, setTab] = useState('calories')
  const [reportPeriod, setReportPeriod] = useState('week') // 'week' | 'month'

  // Estadísticas de peso + alineación con el objetivo
  const weightStats = useMemo(() => {
    if (weightLog.length < 1) return null
    const sorted = [...weightLog].sort((a, b) => new Date(a.date) - new Date(b.date))
    const first = sorted[0]
    const last = sorted[sorted.length - 1]
    const change = Math.round((last.weight - first.weight) * 10) / 10
    // Cambio en los últimos 30 días
    const cutoff = Date.now() - 30 * 86400000
    const recent = sorted.filter(w => new Date(w.date).getTime() >= cutoff)
    const monthChange = recent.length >= 2
      ? Math.round((recent[recent.length - 1].weight - recent[0].weight) * 10) / 10
      : change

    // ¿Va en la dirección del objetivo?
    let aligned = null, message = ''
    if (profile.goal === 'deficit') {
      aligned = change < -0.2
      message = aligned ? 'Bajando de peso — en línea con tu definición' : change > 0.2 ? 'Estás subiendo, revisa tu déficit calórico' : 'Peso estable — ajusta para seguir definiendo'
    } else if (profile.goal === 'bulk') {
      aligned = change > 0.2
      message = aligned ? 'Subiendo de peso — en línea con tu volumen' : change < -0.2 ? 'Estás bajando, sube las calorías' : 'Peso estable — come algo más para ganar'
    } else {
      aligned = Math.abs(change) <= 1
      message = aligned ? 'Peso estable — mantenimiento conseguido' : 'Tu peso se está moviendo más de lo esperado'
    }
    return { first, last, change, monthChange, aligned, message, count: sorted.length }
  }, [weightLog, profile.goal])

  const weekData = getWeekTotals()
  const weekCalData = weekData.map((d, i) => ({
    day: DAYS_SHORT[i],
    cal: d.cal,
    target: targetCalories,
  }))

  // Average stats
  const avgCal = weekData.reduce((s, d) => s + d.cal, 0) / 7
  const avgProtein = weekData.reduce((s, d) => s + d.protein, 0) / 7
  const totalCal = weekData.reduce((s, d) => s + d.cal, 0)
  const daysLogged = weekData.filter(d => d.cal > 0).length

  // Compliance
  const compliance = weekData.filter(d => d.cal > 0 && d.cal <= targetCalories * 1.1).length
  const compliancePct = daysLogged > 0 ? Math.round((compliance / daysLogged) * 100) : 0

  // Macro distribution for the week
  const totalMacros = weekData.reduce((acc, d) => ({
    protein: acc.protein + d.protein,
    carbs: acc.carbs + d.carbs,
    fat: acc.fat + d.fat,
  }), { protein: 0, carbs: 0, fat: 0 })

  const macroCalories = {
    protein: totalMacros.protein * 4,
    carbs: totalMacros.carbs * 4,
    fat: totalMacros.fat * 9,
  }
  const totalMacroCal = macroCalories.protein + macroCalories.carbs + macroCalories.fat

  // Suggestions
  const suggestions = useMemo(() => {
    const tips = []
    if (avgProtein < targetMacros.protein * 0.8 && daysLogged > 0) {
      tips.push({ type: 'warning', text: `Tu proteína media (${Math.round(avgProtein)}g) está por debajo del objetivo (${targetMacros.protein}g). Intenta añadir más fuentes de proteína como pollo, huevos o yogur griego.` })
    }
    if (avgCal > targetCalories * 1.15 && profile.goal === 'deficit' && daysLogged > 0) {
      tips.push({ type: 'warning', text: `Estás consumiendo más calorías de las recomendadas para definición. Intenta reducir porciones o elegir alimentos menos calóricos.` })
    }
    if (compliancePct >= 80) {
      tips.push({ type: 'success', text: `Excelente adherencia al plan esta semana (${compliancePct}%). ¡Sigue así!` })
    }
    if (daysLogged < 3) {
      tips.push({ type: 'info', text: 'Registra al menos 3 días para obtener un análisis más preciso de tu progreso.' })
    }
    if (daysLogged >= 5 && avgCal > 0 && Math.abs(avgCal - targetCalories) < 100) {
      tips.push({ type: 'success', text: `Estás muy cerca de tu objetivo calórico medio. ¡Gran trabajo con la consistencia!` })
    }
    return tips
  }, [avgProtein, avgCal, targetMacros, targetCalories, profile.goal, compliancePct, daysLogged])

  function handleAddWeight() {
    const w = parseFloat(newWeight)
    if (w > 0) {
      addWeight(w)
      setNewWeight('')
    }
  }

  const maxCal = Math.max(targetCalories, ...weekCalData.map(d => d.cal)) || 1

  const TABS = [
    { id: 'calories', label: 'Calorías' },
    { id: 'macros', label: 'Macros' },
    { id: 'weight', label: 'Peso' },
    { id: 'profile', label: 'Perfil' },
    { id: 'summary', label: 'Resumen' },
  ]

  const GOAL_LABELS = { deficit: 'Definición', maintenance: 'Mantenimiento', bulk: 'Volumen' }
  const ACTIVITY_LABELS = { sedentary: 'Sedentario', light: 'Ligero', moderate: 'Moderado', active: 'Activo', very_active: 'Muy activo' }

  function exportPDF() {
    const isMonth = reportPeriod === 'month'
    const goalLabel = GOAL_LABELS[profile.goal] || profile.goal
    const date = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    const periodLabel = isMonth ? 'Mensual' : 'Semanal'

    // Datos de los últimos 30 días para el informe mensual
    const cutoff = Date.now() - 30 * 86400000
    const monthWeights = [...weightLog].filter(w => new Date(w.date).getTime() >= cutoff).sort((a, b) => new Date(a.date) - new Date(b.date))
    const monthProfiles = [...profileHistory].filter(p => new Date(p.date).getTime() >= cutoff)
    const monthExercise = [...exerciseHistory].filter(e => new Date(e.date).getTime() >= cutoff)

    let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>NutriFit - Informe ${periodLabel}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
      h1 { color: #10b981; font-size: 28px; margin-bottom: 4px; }
      .subtitle { color: #888; font-size: 14px; margin-bottom: 30px; }
      h2 { font-size: 18px; margin: 24px 0 12px; padding-bottom: 8px; border-bottom: 2px solid #10b981; }
      .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
      .stat { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; text-align: center; }
      .stat-value { font-size: 24px; font-weight: 700; color: #1a1a1a; }
      .stat-label { font-size: 12px; color: #888; margin-top: 4px; }
      table { width: 100%; border-collapse: collapse; margin: 12px 0; }
      th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
      th { background: #f9fafb; font-weight: 600; color: #666; }
      .text-green { color: #10b981; }
      .text-blue { color: #3b82f6; }
      .text-amber { color: #f59e0b; }
      .text-red { color: #ef4444; }
      .badge { display: inline-block; padding: 2px 8px; border-radius: 8px; font-size: 11px; font-weight: 600; }
      .badge-ok { background: #d1fae5; color: #065f46; }
      .badge-over { background: #fee2e2; color: #991b1b; }
      .profile-info { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 12px 0; }
      .profile-item { font-size: 13px; padding: 8px 12px; background: #f9fafb; border-radius: 8px; }
      .profile-item span { font-weight: 600; }
      .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #aaa; text-align: center; }
      @media print { body { padding: 20px; } }
    </style></head><body>`

    html += `<h1>NutriFit — Informe ${periodLabel}</h1>`
    html += `<p class="subtitle">${date} · ${profile.name || 'Usuario'} · Objetivo: ${goalLabel}</p>`

    if (isMonth) {
      // ─── INFORME MENSUAL: foco en evolución de peso y perfil (30 días) ───
      const wChange = monthWeights.length >= 2
        ? Math.round((monthWeights[monthWeights.length - 1].weight - monthWeights[0].weight) * 10) / 10
        : 0
      html += `<div class="stats">
        <div class="stat"><div class="stat-value">${monthWeights.length >= 2 ? (wChange > 0 ? '+' : '') + wChange + ' kg' : '—'}</div><div class="stat-label">Cambio de peso (30d)</div></div>
        <div class="stat"><div class="stat-value">${profile.weight} kg</div><div class="stat-label">Peso actual</div></div>
        <div class="stat"><div class="stat-value">${monthWeights.length}</div><div class="stat-label">Pesajes</div></div>
        <div class="stat"><div class="stat-value">${monthExercise.length}</div><div class="stat-label">Entrenos</div></div>
      </div>`

      html += `<h2>Perfil nutricional actual</h2>`
      html += `<div class="profile-info">
        <div class="profile-item">Calorías objetivo: <span>${targetCalories} kcal</span></div>
        <div class="profile-item">Proteína: <span>${targetMacros.protein}g</span></div>
        <div class="profile-item">Carbohidratos: <span>${targetMacros.carbs}g</span></div>
        <div class="profile-item">Grasa: <span>${targetMacros.fat}g</span></div>
      </div>`

      html += `<h2>Evolución de peso (últimos 30 días)</h2>`
      if (monthWeights.length > 0) {
        html += `<table><thead><tr><th>Fecha</th><th>Peso</th><th>Cambio</th></tr></thead><tbody>`
        monthWeights.forEach((w, i) => {
          const prev = i > 0 ? monthWeights[i - 1] : null
          const diff = prev ? (w.weight - prev.weight).toFixed(1) : '-'
          const cls = diff !== '-' ? (parseFloat(diff) < 0 ? 'text-green' : parseFloat(diff) > 0 ? 'text-red' : '') : ''
          html += `<tr><td>${new Date(w.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</td><td>${w.weight} kg</td><td class="${cls}">${diff !== '-' ? (parseFloat(diff) > 0 ? '+' : '') + diff + ' kg' : '-'}</td></tr>`
        })
        html += `</tbody></table>`
      } else {
        html += `<p style="color:#888;font-size:13px">Sin pesajes en los últimos 30 días. Registra tu peso para ver la evolución mensual.</p>`
      }

      if (monthProfiles.length > 0) {
        html += `<h2>Cambios de perfil</h2><table><thead><tr><th>Fecha</th><th>Peso</th><th>Objetivo</th><th>Calorías</th></tr></thead><tbody>`
        monthProfiles.forEach(p => {
          html += `<tr><td>${new Date(p.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</td><td>${p.weight} kg</td><td>${GOAL_LABELS[p.goal] || p.goal}</td><td>${p.calories} kcal</td></tr>`
        })
        html += `</tbody></table>`
      }

      html += `<h2>Resumen de la última semana</h2>`
      html += `<div class="profile-info">
        <div class="profile-item">Calorías media: <span>${Math.round(avgCal)} kcal</span></div>
        <div class="profile-item">Días registrados: <span>${daysLogged}/7</span></div>
        <div class="profile-item">Cumplimiento: <span>${compliancePct}%</span></div>
        <div class="profile-item">Proteína media: <span>${Math.round(avgProtein)}g</span></div>
      </div>`
    } else {
      // ─── INFORME SEMANAL: foco en la nutrición de la semana ───
      html += `<div class="stats">
        <div class="stat"><div class="stat-value">${Math.round(avgCal)}</div><div class="stat-label">Calorías media</div></div>
        <div class="stat"><div class="stat-value">${daysLogged}/7</div><div class="stat-label">Días registrados</div></div>
        <div class="stat"><div class="stat-value">${compliancePct}%</div><div class="stat-label">Cumplimiento</div></div>
        <div class="stat"><div class="stat-value">${profile.weight} kg</div><div class="stat-label">Peso actual</div></div>
      </div>`

      html += `<h2>Perfil nutricional</h2>`
      html += `<div class="profile-info">
        <div class="profile-item">Calorías objetivo: <span>${targetCalories} kcal</span></div>
        <div class="profile-item">Proteína: <span>${targetMacros.protein}g</span></div>
        <div class="profile-item">Carbohidratos: <span>${targetMacros.carbs}g</span></div>
        <div class="profile-item">Grasa: <span>${targetMacros.fat}g</span></div>
      </div>`

      html += `<h2>Desglose por día</h2>`
      html += `<table><thead><tr><th>Día</th><th>Calorías</th><th>Proteína</th><th>Carbos</th><th>Grasa</th><th>Estado</th></tr></thead><tbody>`
      weekData.forEach((d, i) => {
        const ok = d.cal > 0 && d.cal <= targetCalories * 1.1
        html += `<tr>
          <td>${DAYS[i]}</td>
          <td>${d.cal || '-'}</td>
          <td class="text-green">${d.protein || '-'}g</td>
          <td class="text-blue">${d.carbs || '-'}g</td>
          <td class="text-amber">${d.fat || '-'}g</td>
          <td>${d.cal === 0 ? '<span style="color:#aaa">Sin datos</span>' : ok ? '<span class="badge badge-ok">OK</span>' : '<span class="badge badge-over">Exceso</span>'}</td>
        </tr>`
      })
      html += `</tbody></table>`

      if (weightLog.length > 0) {
        html += `<h2>Historial de peso</h2><table><thead><tr><th>Fecha</th><th>Peso</th><th>Cambio</th></tr></thead><tbody>`
        const sorted = [...weightLog].reverse().slice(0, 15)
        sorted.forEach((w, i) => {
          const prev = i < sorted.length - 1 ? sorted[i + 1] : null
          const diff = prev ? (w.weight - prev.weight).toFixed(1) : '-'
          html += `<tr><td>${new Date(w.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</td><td>${w.weight} kg</td><td>${diff !== '-' ? (parseFloat(diff) > 0 ? '+' : '') + diff + ' kg' : '-'}</td></tr>`
        })
        html += `</tbody></table>`
      }
    }

    html += `<div class="footer">Generado por NutriFit · Producto Saludable · ${date}</div>`
    html += `</body></html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const w = window.open(url, '_blank')
    if (w) {
      w.onload = () => {
        setTimeout(() => { w.print(); URL.revokeObjectURL(url) }, 500)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Progreso</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Analiza tu evolución y mejora tus hábitos</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {[{ id: 'week', label: 'Semanal' }, { id: 'month', label: 'Mensual' }].map(p => (
              <button
                key={p.id}
                onClick={() => setReportPeriod(p.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  reportPeriod === p.id
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={exportPDF}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Calorías media', value: `${Math.round(avgCal)}`, unit: 'kcal', icon: Target, color: 'text-emerald-500' },
          { label: 'Días registrados', value: daysLogged, unit: '/7', icon: Award, color: 'text-blue-500' },
          { label: 'Cumplimiento', value: `${compliancePct}%`, unit: '', icon: TrendingUp, color: 'text-purple-500' },
          { label: 'Peso actual', value: profile.weight, unit: 'kg', icon: Scale, color: 'text-amber-500' },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={16} className={stat.color} />
              <span className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {stat.value} <span className="text-sm text-gray-400 font-normal">{stat.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Calories chart - CSS bars */}
      {tab === 'calories' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Calorías por día</h3>
          <div className="flex items-end justify-between gap-3" style={{ height: 250 }}>
            {weekCalData.map((d, i) => {
              const pct = maxCal > 0 ? (d.cal / maxCal) * 100 : 0
              const targetPct = maxCal > 0 ? (targetCalories / maxCal) * 100 : 0
              const over = d.cal > targetCalories
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end relative">
                  {/* Target line */}
                  <div
                    className="absolute left-0 right-0 border-t-2 border-dashed border-red-400/50"
                    style={{ bottom: `${targetPct}%` }}
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                    {d.cal > 0 ? d.cal : '-'}
                  </span>
                  <div
                    className={`w-full max-w-10 rounded-t-lg transition-all duration-500 ${
                      over ? 'bg-red-400 dark:bg-red-500' : 'bg-emerald-400 dark:bg-emerald-500'
                    }`}
                    style={{ height: `${Math.max(pct, d.cal > 0 ? 3 : 0)}%` }}
                  />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">{d.day}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-400 dark:bg-emerald-500 inline-block" /> Dentro del objetivo
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-400 dark:bg-red-500 inline-block" /> Exceso
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-8 border-t-2 border-dashed border-red-400/50 inline-block" /> Objetivo ({targetCalories})
            </span>
          </div>
        </div>
      )}

      {/* Macros */}
      {tab === 'macros' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Macros bars per day */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Macros por día</h3>
            <div className="space-y-3">
              {weekData.map((d, i) => {
                const maxMacro = Math.max(d.protein, d.carbs, d.fat, targetMacros.protein, targetMacros.carbs, targetMacros.fat) || 1
                return (
                  <div key={DAYS_SHORT[i]}>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{DAYS_SHORT[i]}</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] w-6 text-emerald-500 font-medium">P</span>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
                          <div className="bg-emerald-500 h-2.5 rounded-full transition-all" style={{ width: `${(d.protein / maxMacro) * 100}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-500 w-8 text-right">{d.protein}g</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] w-6 text-blue-500 font-medium">C</span>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
                          <div className="bg-blue-500 h-2.5 rounded-full transition-all" style={{ width: `${(d.carbs / maxMacro) * 100}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-500 w-8 text-right">{d.carbs}g</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] w-6 text-amber-500 font-medium">G</span>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
                          <div className="bg-amber-500 h-2.5 rounded-full transition-all" style={{ width: `${(d.fat / maxMacro) * 100}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-500 w-8 text-right">{d.fat}g</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Macro pie chart - CSS */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Distribución semanal</h3>
            {totalMacroCal > 0 ? (
              <div className="flex flex-col items-center gap-6">
                {/* CSS donut */}
                <div
                  className="w-48 h-48 rounded-full relative"
                  style={{
                    background: `conic-gradient(
                      ${MACRO_COLORS.protein} 0deg ${(macroCalories.protein / totalMacroCal) * 360}deg,
                      ${MACRO_COLORS.carbs} ${(macroCalories.protein / totalMacroCal) * 360}deg ${((macroCalories.protein + macroCalories.carbs) / totalMacroCal) * 360}deg,
                      ${MACRO_COLORS.fat} ${((macroCalories.protein + macroCalories.carbs) / totalMacroCal) * 360}deg 360deg
                    )`
                  }}
                >
                  <div className="absolute inset-6 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{Math.round(totalMacroCal)}</p>
                      <p className="text-[10px] text-gray-500">kcal total</p>
                    </div>
                  </div>
                </div>
                {/* Legend */}
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Proteína {totalMacroCal > 0 ? Math.round((macroCalories.protein / totalMacroCal) * 100) : 0}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Carbos {totalMacroCal > 0 ? Math.round((macroCalories.carbs / totalMacroCal) * 100) : 0}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Grasa {totalMacroCal > 0 ? Math.round((macroCalories.fat / totalMacroCal) * 100) : 0}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-400 py-12 text-sm">Registra comidas para ver la distribución</p>
            )}
          </div>
        </div>
      )}

      {/* Weight */}
      {tab === 'weight' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Registro de peso</h3>

          <div className="flex gap-3 mb-6">
            <input
              type="number" step="0.1" value={newWeight}
              onChange={e => setNewWeight(e.target.value)}
              placeholder="Peso actual (kg)"
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm border-none outline-none text-gray-900 dark:text-white"
            />
            <button
              onClick={handleAddWeight}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium flex items-center gap-2"
            >
              <Plus size={16} /> Registrar
            </button>
          </div>

          {/* Weight trend summary */}
          {weightStats && (
            <div className={`mb-6 rounded-xl p-4 border ${
              weightStats.aligned
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
                : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Cambio total</p>
                    <p className={`text-xl font-bold ${
                      weightStats.change < 0 ? 'text-emerald-600 dark:text-emerald-400' : weightStats.change > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {weightStats.change > 0 ? '+' : ''}{weightStats.change} kg
                    </p>
                  </div>
                  <div className="h-10 w-px bg-gray-200 dark:bg-gray-700" />
                  <div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Últimos 30 días</p>
                    <p className="text-xl font-bold text-gray-700 dark:text-gray-300">
                      {weightStats.monthChange > 0 ? '+' : ''}{weightStats.monthChange} kg
                    </p>
                  </div>
                  <div className="h-10 w-px bg-gray-200 dark:bg-gray-700" />
                  <div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Actual</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{weightStats.last.weight} kg</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 max-w-xs">
                  <span className="text-lg">{weightStats.aligned ? '✅' : '⚠️'}</span>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{weightStats.message}</p>
                </div>
              </div>
            </div>
          )}

          {weightLog.length === 0 ? (
            <p className="text-center text-gray-400 py-12 text-sm">No hay registros de peso. Añade tu peso para ver la evolución.</p>
          ) : (
            <div>
              {/* CSS line chart */}
              {(() => {
                const weights = weightLog.map(w => w.weight)
                const minW = Math.min(...weights) - 1
                const maxW = Math.max(...weights) + 1
                const range = maxW - minW || 1
                return (
                  <div className="relative" style={{ height: 200 }}>
                    {/* Y axis labels */}
                    <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-[10px] text-gray-400">
                      <span>{maxW.toFixed(1)}</span>
                      <span>{((maxW + minW) / 2).toFixed(1)}</span>
                      <span>{minW.toFixed(1)}</span>
                    </div>
                    {/* Chart area */}
                    <div className="ml-12 h-full flex items-end gap-1 relative border-l border-b border-gray-200 dark:border-gray-700">
                      {/* Horizontal grid */}
                      <div className="absolute inset-0">
                        <div className="absolute w-full border-t border-gray-100 dark:border-gray-800" style={{ top: '25%' }} />
                        <div className="absolute w-full border-t border-gray-100 dark:border-gray-800" style={{ top: '50%' }} />
                        <div className="absolute w-full border-t border-gray-100 dark:border-gray-800" style={{ top: '75%' }} />
                      </div>
                      {weightLog.map((entry, i) => {
                        const pct = ((entry.weight - minW) / range) * 100
                        return (
                          <div key={entry.id || i} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                            {/* Dot */}
                            <div
                              className="absolute w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900 z-10"
                              style={{ bottom: `${pct}%`, transform: 'translateY(50%)' }}
                            />
                            {/* Tooltip on hover */}
                            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] px-2 py-1 rounded-lg z-20 pointer-events-none whitespace-nowrap"
                              style={{ bottom: `${pct + 8}%` }}
                            >
                              {entry.weight}kg · {entry.date}
                            </div>
                            <span className="text-[9px] text-gray-400 mt-1 absolute -bottom-5 whitespace-nowrap">
                              {weightLog.length <= 10 ? entry.date.slice(5) : (i % 2 === 0 ? entry.date.slice(5) : '')}
                            </span>
                          </div>
                        )
                      })}
                      {/* SVG overlay for connecting lines */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                        {weightLog.map((entry, i) => {
                          if (i >= weightLog.length - 1) return null
                          const x1 = ((i + 0.5) / weightLog.length) * 100
                          const x2 = ((i + 1.5) / weightLog.length) * 100
                          const y1 = 100 - ((entry.weight - minW) / range) * 100
                          const y2 = 100 - ((weightLog[i + 1].weight - minW) / range) * 100
                          return (
                            <line key={i}
                              x1={`${x1}%`} y1={`${y1}%`}
                              x2={`${x2}%`} y2={`${y2}%`}
                              stroke="#10b981" strokeWidth="2"
                            />
                          )
                        })}
                      </svg>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          {/* Weight history list */}
          {weightLog.length > 0 && (
            <div className="mt-6 border-t border-gray-200 dark:border-gray-800 pt-5">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Historial de pesajes</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {[...weightLog].reverse().map((entry, i) => {
                  const prev = weightLog.length > 1 && i < weightLog.length - 1
                    ? [...weightLog].reverse()[i + 1]
                    : null
                  const diff = prev ? (entry.weight - prev.weight).toFixed(1) : null
                  return (
                    <div key={entry.id || i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Scale size={16} className="text-emerald-500 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{entry.weight} kg</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(entry.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {diff !== null && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${
                            parseFloat(diff) < 0
                              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                              : parseFloat(diff) > 0
                              ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                          }`}>
                            {parseFloat(diff) > 0 ? '+' : ''}{diff} kg
                          </span>
                        )}
                        <button
                          onClick={() => removeWeight(entry.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Profile evolution */}
      {tab === 'profile' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-5">
            <User size={18} className="text-emerald-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Evolución del perfil</h3>
          </div>

          {profileHistory.length === 0 ? (
            <p className="text-center text-gray-400 py-12 text-sm">No hay cambios de perfil guardados. Ve a la Calculadora y guarda tu perfil para empezar a trackear tu evolución.</p>
          ) : (
            <>
              {/* Calories evolution chart */}
              {profileHistory.length >= 2 && (() => {
                const cals = profileHistory.map(h => h.calories)
                const minC = Math.min(...cals) - 100
                const maxC = Math.max(...cals) + 100
                const range = maxC - minC || 1
                return (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Calorías objetivo a lo largo del tiempo</h4>
                    <div className="relative" style={{ height: 160 }}>
                      <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-[10px] text-gray-400">
                        <span>{maxC}</span>
                        <span>{Math.round((maxC + minC) / 2)}</span>
                        <span>{minC}</span>
                      </div>
                      <div className="ml-12 h-full flex items-end gap-1 relative border-l border-b border-gray-200 dark:border-gray-700">
                        {profileHistory.map((entry, i) => {
                          const pct = ((entry.calories - minC) / range) * 100
                          return (
                            <div key={entry.id} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                              <div
                                className="absolute w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900 z-10"
                                style={{ bottom: `${pct}%`, transform: 'translateY(50%)' }}
                              />
                              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] px-2 py-1 rounded-lg z-20 pointer-events-none whitespace-nowrap"
                                style={{ bottom: `${pct + 10}%` }}
                              >
                                {entry.calories} kcal · {GOAL_LABELS[entry.goal]}
                              </div>
                              <span className="text-[9px] text-gray-400 absolute -bottom-5 whitespace-nowrap">
                                {new Date(entry.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                          )
                        })}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                          {profileHistory.map((entry, i) => {
                            if (i >= profileHistory.length - 1) return null
                            const x1 = ((i + 0.5) / profileHistory.length) * 100
                            const x2 = ((i + 1.5) / profileHistory.length) * 100
                            const y1 = 100 - ((entry.calories - minC) / range) * 100
                            const y2 = 100 - ((profileHistory[i + 1].calories - minC) / range) * 100
                            return <line key={i} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke="#10b981" strokeWidth="2" />
                          })}
                        </svg>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Profile history list */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {[...profileHistory].reverse().map((entry, i) => {
                  const d = new Date(entry.date)
                  const dateStr = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
                  const timeStr = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                  const prev = i < profileHistory.length - 1 ? [...profileHistory].reverse()[i + 1] : null
                  const calDiff = prev ? entry.calories - prev.calories : null

                  return (
                    <div key={entry.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-900 dark:text-white">{dateStr}</span>
                          <span className="text-xs text-gray-400">{timeStr}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            entry.goal === 'deficit' ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                            entry.goal === 'bulk' ? 'bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400' :
                            'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {GOAL_LABELS[entry.goal] || entry.goal}
                          </span>
                          {calDiff !== null && calDiff !== 0 && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${
                              calDiff > 0 ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400' :
                              'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                            }`}>
                              {calDiff > 0 ? '+' : ''}{calDiff} kcal
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>{entry.weight}kg · {entry.height}cm · {entry.age} años</span>
                        <span>{ACTIVITY_LABELS[entry.activity] || entry.activity}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">{entry.calories} kcal</span>
                        <span>P:{entry.protein}g · C:{entry.carbs}g · G:{entry.fat}g</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Summary */}
      {tab === 'summary' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Resumen semanal</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium">Día</th>
                    <th className="text-right py-2 text-gray-500 dark:text-gray-400 font-medium">Calorías</th>
                    <th className="text-right py-2 text-emerald-500 font-medium">Proteína</th>
                    <th className="text-right py-2 text-blue-500 font-medium">Carbos</th>
                    <th className="text-right py-2 text-amber-500 font-medium">Grasa</th>
                    <th className="text-right py-2 text-gray-500 dark:text-gray-400 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {weekData.map((d, i) => {
                    const ok = d.cal > 0 && d.cal <= targetCalories * 1.1
                    return (
                      <tr key={d.day} className="border-b border-gray-50 dark:border-gray-800">
                        <td className="py-3 font-medium text-gray-900 dark:text-white">{DAYS[i]}</td>
                        <td className="text-right py-3 text-gray-900 dark:text-white">{d.cal || '-'}</td>
                        <td className="text-right py-3 text-emerald-600 dark:text-emerald-400">{d.protein || '-'}g</td>
                        <td className="text-right py-3 text-blue-600 dark:text-blue-400">{d.carbs || '-'}g</td>
                        <td className="text-right py-3 text-amber-600 dark:text-amber-400">{d.fat || '-'}g</td>
                        <td className="text-right py-3">
                          {d.cal === 0 ? (
                            <span className="text-gray-400 text-xs">Sin datos</span>
                          ) : ok ? (
                            <span className="inline-block px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-medium">OK</span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded-lg text-xs font-medium">Exceso</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {suggestions.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Sugerencias</h3>
              <div className="space-y-3">
                {suggestions.map((tip, i) => (
                  <div key={i} className={`flex gap-3 p-4 rounded-xl ${
                    tip.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20' :
                    tip.type === 'warning' ? 'bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20' :
                    'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20'
                  }`}>
                    <span className="text-lg">{tip.type === 'success' ? '✅' : tip.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{tip.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
