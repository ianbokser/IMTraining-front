import { Check } from 'lucide-react'

export default function Stepper({ steps, current }) {
  const pct = steps.length > 1 ? (current / (steps.length - 1)) * 100 : 0
  return (
    <div>
      {/* barra de progreso */}
      <div className="relative mb-5 h-1 rounded-full bg-line">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-volt transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ol className="flex items-center justify-between">
        {steps.map((label, i) => {
          const done = i < current
          const active = i === current
          return (
            <li key={label} className="flex items-center gap-2.5">
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold transition-all duration-300 ${
                  active
                    ? 'bg-volt text-ink shadow-[0_0_0_4px_rgba(46,230,240,0.18)]'
                    : done
                      ? 'bg-volt/20 text-volt'
                      : 'border border-line text-muted'
                }`}
              >
                {done ? <Check size={16} strokeWidth={3} /> : i + 1}
              </span>
              <span
                className={`hidden text-sm font-medium transition-colors sm:inline ${
                  active ? 'text-white' : done ? 'text-white/70' : 'text-muted'
                }`}
              >
                {label}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
