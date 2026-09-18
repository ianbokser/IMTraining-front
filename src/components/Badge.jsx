const tones = {
  volt: 'bg-volt/15 text-volt border-volt/30',
  flame: 'bg-flame/15 text-flame border-flame/30',
  muted: 'bg-white/5 text-muted border-line',
  ok: 'bg-ok/15 text-ok border-ok/30',
  warn: 'bg-warn/15 text-warn border-warn/30',
}

export default function Badge({ tone = 'volt', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
