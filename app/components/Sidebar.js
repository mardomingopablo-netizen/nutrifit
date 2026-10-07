'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, CalendarDays, ClipboardList, Calculator,
  Apple, TrendingUp, Menu, X,
  ChefHat, Pill, Sparkles, Flame, Dumbbell
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tracker', label: 'Tracker', icon: CalendarDays },
  { href: '/plan', label: 'Plan semanal', icon: ClipboardList },
  { href: '/recipes', label: 'Recetas', icon: ChefHat },
  { href: '/supplements', label: 'Suplementos', icon: Pill },
  { href: '/photo', label: 'Estimación IA', icon: Sparkles },
  { href: '/calculator', label: 'Calculadora', icon: Calculator },
  { href: '/exercise', label: 'Ejercicio', icon: Dumbbell },
  { href: '/foods', label: 'Alimentos', icon: Apple },
  { href: '/progress', label: 'Progreso', icon: TrendingUp },
  { href: '/streaks', label: 'Rachas', icon: Flame },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-xl bg-white/10 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-200 dark:border-gray-700 shadow-lg"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full z-40 w-64
        bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
        flex flex-col transition-transform duration-300
        md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <img src="/logo.png" alt="NutriFit" className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-emerald-500/10" />
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">NutriFit</h1>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium tracking-wide">PRODUCTO SALUDABLE</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${active
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                <item.icon size={20} className={active ? 'text-emerald-600 dark:text-emerald-400' : ''} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
