'use client'

export default function CalorieBar({ current, target, showLabel = true }) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0
  const over = current > target
  const remaining = Math.max(target - current, 0)

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {current} <span className="text-gray-400">/ {target} kcal</span>
          </span>
          <span className={`text-xs font-semibold ${over ? 'text-red-500' : 'text-emerald-500'}`}>
            {over ? `+${current - target} kcal` : `${remaining} restantes`}
          </span>
        </div>
      )}
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            over ? 'bg-red-500' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
