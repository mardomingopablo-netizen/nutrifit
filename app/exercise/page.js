'use client'

import { useState, useEffect, useRef } from 'react'
import { Timer, Play, Pause, Square, Trash2, Flame, Clock, Dumbbell, ChevronDown, ChevronUp } from 'lucide-react'
import { useApp } from '../context/AppContext'

const CATEGORIES = [
  { id: 'all', name: 'Todos' },
  { id: 'cardio', name: 'Cardio' },
  { id: 'strength', name: 'Fuerza' },
  { id: 'flexibility', name: 'Flexibilidad' },
  { id: 'team', name: 'Deportes de equipo' },
  { id: 'combat', name: 'Combate' },
  { id: 'water', name: 'Acuáticos' },
  { id: 'other', name: 'Otros' },
]

const SPORTS = [
  { name: 'Correr', category: 'cardio', caloriesPerHour: 700, icon: '🏃' },
  { name: 'Caminar rápido', category: 'cardio', caloriesPerHour: 350, icon: '🚶' },
  { name: 'Ciclismo', category: 'cardio', caloriesPerHour: 550, icon: '🚴' },
  { name: 'Saltar cuerda', category: 'cardio', caloriesPerHour: 800, icon: '⏭️' },
  { name: 'Elíptica', category: 'cardio', caloriesPerHour: 600, icon: '🔄' },
  { name: 'Remo', category: 'cardio', caloriesPerHour: 600, icon: '🚣' },
  { name: 'HIIT', category: 'cardio', caloriesPerHour: 750, icon: '💥' },
  { name: 'Spinning', category: 'cardio', caloriesPerHour: 650, icon: '🚲' },
  { name: 'Pesas/Gym', category: 'strength', caloriesPerHour: 400, icon: '🏋️' },
  { name: 'Crossfit', category: 'strength', caloriesPerHour: 600, icon: '💪' },
  { name: 'Calistenia', category: 'strength', caloriesPerHour: 450, icon: '🤸' },
  { name: 'Kettlebell', category: 'strength', caloriesPerHour: 500, icon: '⚡' },
  { name: 'Yoga', category: 'flexibility', caloriesPerHour: 250, icon: '🧘' },
  { name: 'Pilates', category: 'flexibility', caloriesPerHour: 280, icon: '🤾' },
  { name: 'Estiramientos', category: 'flexibility', caloriesPerHour: 150, icon: '🙆' },
  { name: 'Fútbol', category: 'team', caloriesPerHour: 500, icon: '⚽' },
  { name: 'Baloncesto', category: 'team', caloriesPerHour: 550, icon: '🏀' },
  { name: 'Voleibol', category: 'team', caloriesPerHour: 350, icon: '🏐' },
  { name: 'Tenis', category: 'team', caloriesPerHour: 450, icon: '🎾' },
  { name: 'Pádel', category: 'team', caloriesPerHour: 400, icon: '🏓' },
  { name: 'Rugby', category: 'team', caloriesPerHour: 600, icon: '🏈' },
  { name: 'Boxeo', category: 'combat', caloriesPerHour: 700, icon: '🥊' },
  { name: 'Kickboxing', category: 'combat', caloriesPerHour: 650, icon: '🦶' },
  { name: 'Judo', category: 'combat', caloriesPerHour: 600, icon: '🥋' },
  { name: 'MMA', category: 'combat', caloriesPerHour: 650, icon: '👊' },
  { name: 'Karate', category: 'combat', caloriesPerHour: 500, icon: '🥷' },
  { name: 'Natación', category: 'water', caloriesPerHour: 500, icon: '🏊' },
  { name: 'Waterpolo', category: 'water', caloriesPerHour: 600, icon: '🤽' },
  { name: 'Surf', category: 'water', caloriesPerHour: 250, icon: '🏄' },
  { name: 'Escalada', category: 'other', caloriesPerHour: 550, icon: '🧗' },
  { name: 'Patinaje', category: 'other', caloriesPerHour: 400, icon: '⛸️' },
  { name: 'Senderismo', category: 'other', caloriesPerHour: 380, icon: '🥾' },
  { name: 'Baile', category: 'other', caloriesPerHour: 350, icon: '💃' },
  { name: 'Artes marciales', category: 'other', caloriesPerHour: 500, icon: '⛩️' },
]

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}min`
  return `${m}min`
}

function formatTimer(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getWeekStart() {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const start = new Date(now)
  start.setDate(diff)
  start.setHours(0, 0, 0, 0)
  return start
}

export default function ExercisePage() {
  const { exerciseHistory, addExercise, removeExercise } = useApp()
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedSport, setSelectedSport] = useState(null)
  const [timerRunning, setTimerRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [showHistory, setShowHistory] = useState(true)
  const intervalRef = useRef(null)
  const sessionPanelRef = useRef(null)

  const history = exerciseHistory || []

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1)
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [timerRunning])

  const filteredSports = activeCategory === 'all'
    ? SPORTS
    : SPORTS.filter((s) => s.category === activeCategory)

  const currentCalories = selectedSport
    ? Math.round((elapsed / 3600) * selectedSport.caloriesPerHour)
    : 0

  const handleSelectSport = (sport) => {
    if (timerRunning) return
    setSelectedSport(sport)
    setElapsed(0)
    setTimeout(() => {
      sessionPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  const handleStart = () => setTimerRunning(true)
  const handlePause = () => setTimerRunning(false)

  const handleStop = () => {
    setTimerRunning(false)
    if (elapsed > 0 && selectedSport) {
      const session = {
        sport: selectedSport.name,
        icon: selectedSport.icon,
        duration: elapsed,
        caloriesBurned: Math.round((elapsed / 3600) * selectedSport.caloriesPerHour),
        date: new Date().toISOString(),
      }
      addExercise(session)
    }
    setElapsed(0)
    setSelectedSport(null)
  }

  const weekStart = getWeekStart()
  const weekSessions = history.filter((s) => new Date(s.date) >= weekStart)
  const weekTotalTime = weekSessions.reduce((sum, s) => sum + s.duration, 0)
  const weekTotalCals = weekSessions.reduce((sum, s) => sum + s.caloriesBurned, 0)

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Dumbbell size={28} color="#10b981" />
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Ejercicio</h1>
          </div>
          <p style={{ margin: 0, fontSize: 14, opacity: 0.6 }}>
            Registra tus sesiones de ejercicio y controla las calorías quemadas
          </p>
        </div>

        {/* Category filter tabs */}
        <div style={{
          display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 20,
          scrollbarWidth: 'none', msOverflowStyle: 'none',
        }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 9999,
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontSize: 13,
                fontWeight: 600,
                transition: 'all 0.2s',
                background: activeCategory === cat.id ? '#10b981' : 'rgba(128,128,128,0.12)',
                color: activeCategory === cat.id ? '#fff' : 'inherit',
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sport cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}>
          {filteredSports.map((sport) => {
            const isSelected = selectedSport?.name === sport.name
            return (
              <button
                key={sport.name}
                onClick={() => handleSelectSport(sport)}
                disabled={timerRunning}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  padding: '16px 8px',
                  borderRadius: 16,
                  border: isSelected ? '2px solid #10b981' : '2px solid transparent',
                  cursor: timerRunning ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  background: isSelected ? 'rgba(16,185,129,0.12)' : 'rgba(128,128,128,0.06)',
                  opacity: timerRunning && !isSelected ? 0.5 : 1,
                  color: 'inherit',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ fontSize: 32 }}>{sport.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
                  {sport.name}
                </span>
                <span style={{ fontSize: 11, opacity: 0.5 }}>
                  <Flame size={11} style={{ display: 'inline', verticalAlign: '-1px' }} /> {sport.caloriesPerHour} cal/h
                </span>
              </button>
            )
          })}
        </div>

        {/* Session panel */}
        {selectedSport && (
          <div
            ref={sessionPanelRef}
            className="exercise-session-panel"
            style={{
              borderRadius: 16,
              padding: 24,
              marginBottom: 24,
              background: 'rgba(16,185,129,0.06)',
              border: '1px solid rgba(16,185,129,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 48 }}>{selectedSport.icon}</span>
              <div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{selectedSport.name}</h2>
                <span style={{ fontSize: 13, opacity: 0.6 }}>
                  {selectedSport.caloriesPerHour} cal/h estimadas
                </span>
              </div>
            </div>

            {/* Timer display */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                fontSize: 56,
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: 2,
                color: timerRunning ? '#10b981' : 'inherit',
              }}>
                {formatTimer(elapsed)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 }}>
                <Flame size={16} color="#f59e0b" />
                <span style={{ fontSize: 18, fontWeight: 600 }}>
                  {currentCalories} kcal quemadas
                </span>
              </div>
            </div>

            {/* Timer controls */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              {!timerRunning ? (
                <button
                  onClick={handleStart}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '12px 28px', borderRadius: 9999, border: 'none',
                    background: '#10b981', color: '#fff', fontSize: 15, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  <Play size={18} /> {elapsed > 0 ? 'Reanudar' : 'Iniciar'}
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '12px 28px', borderRadius: 9999, border: 'none',
                    background: '#f59e0b', color: '#fff', fontSize: 15, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  <Pause size={18} /> Pausar
                </button>
              )}
              <button
                onClick={handleStop}
                disabled={elapsed === 0}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '12px 28px', borderRadius: 9999, border: 'none',
                  background: elapsed === 0 ? 'rgba(128,128,128,0.2)' : '#ef4444',
                  color: '#fff', fontSize: 15, fontWeight: 600,
                  cursor: elapsed === 0 ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <Square size={18} /> Guardar
              </button>
            </div>
          </div>
        )}

        {/* Weekly summary */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24,
        }}>
          <div style={{
            borderRadius: 16, padding: 16,
            background: 'rgba(128,128,128,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Clock size={16} color="#10b981" />
              <span style={{ fontSize: 12, opacity: 0.6, fontWeight: 600 }}>Esta semana</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{formatDuration(weekTotalTime)}</div>
            <div style={{ fontSize: 12, opacity: 0.5 }}>{weekSessions.length} sesiones</div>
          </div>
          <div style={{
            borderRadius: 16, padding: 16,
            background: 'rgba(128,128,128,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Flame size={16} color="#f59e0b" />
              <span style={{ fontSize: 12, opacity: 0.6, fontWeight: 600 }}>Calorías semana</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{weekTotalCals} kcal</div>
            <div style={{ fontSize: 12, opacity: 0.5 }}>quemadas</div>
          </div>
        </div>

        {/* Exercise history */}
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: 0, marginBottom: 12, border: 'none',
              background: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Timer size={20} color="#10b981" />
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Historial de ejercicio</h2>
              <span style={{
                fontSize: 12, fontWeight: 600, padding: '2px 8px',
                borderRadius: 9999, background: 'rgba(16,185,129,0.15)', color: '#10b981',
              }}>
                {history.length}
              </span>
            </div>
            {showHistory ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {showHistory && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {history.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '40px 16px',
                  borderRadius: 16, background: 'rgba(128,128,128,0.06)',
                }}>
                  <Dumbbell size={40} style={{ opacity: 0.2, marginBottom: 8 }} />
                  <p style={{ margin: 0, opacity: 0.5, fontSize: 14 }}>
                    Aún no hay sesiones registradas. Selecciona un deporte para empezar.
                  </p>
                </div>
              ) : (
                [...history].reverse().map((session, idx) => (
                  <div
                    key={session.id || idx}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px', borderRadius: 16,
                      background: 'rgba(128,128,128,0.06)',
                    }}
                  >
                    <span style={{ fontSize: 28 }}>{session.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{session.sport}</div>
                      <div style={{ fontSize: 12, opacity: 0.5 }}>{formatDate(session.date)}</div>
                    </div>
                    <div style={{ textAlign: 'right', marginRight: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        <Clock size={12} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 3 }} />
                        {formatDuration(session.duration)}
                      </div>
                      <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>
                        <Flame size={12} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 3 }} />
                        {session.caloriesBurned} kcal
                      </div>
                    </div>
                    <button
                      onClick={() => removeExercise(session.id)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 32, height: 32, borderRadius: 8, border: 'none',
                        background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
