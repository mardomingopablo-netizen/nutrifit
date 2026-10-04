'use client'

export default function MacroRing({ value, max, label, color, size = 80, unit = 'g' }) {
  const pct = max > 0 ? Math.min(value / max, 1) : 0
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const dash = circ * pct

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" strokeWidth="6"
            className="stroke-gray-200 dark:stroke-gray-700"
          />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" strokeWidth="6"
            stroke={color}
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-gray-900 dark:text-white">{value}</span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">{unit}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>
    </div>
  )
}
