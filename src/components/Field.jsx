const labelCls = 'mb-2 flex items-center gap-1.5 text-sm font-medium text-white/85'
const baseInput =
  'w-full rounded-xl border bg-ink-3 px-4 py-3 text-white placeholder:text-muted-2 transition-all duration-150 focus:outline-none focus:ring-4'
const okRing = 'border-line focus:border-volt focus:ring-volt/15 hover:border-line-strong'
const errRing = 'border-danger/60 focus:border-danger focus:ring-danger/15'

function Label({ label, required }) {
  if (!label) return null
  return (
    <span className={labelCls}>
      {label}
      {required && <span className="text-volt">*</span>}
    </span>
  )
}

function Hint({ hint, error }) {
  if (error) return <span className="mt-1.5 block text-xs font-medium text-danger">{error}</span>
  if (hint) return <span className="mt-1.5 block text-xs text-muted">{hint}</span>
  return null
}

export function Input({ label, hint, error, required, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      <Label label={label} required={required} />
      <input className={`${baseInput} ${error ? errRing : okRing}`} {...props} />
      <Hint hint={hint} error={error} />
    </label>
  )
}

export function Textarea({ label, hint, error, required, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      <Label label={label} required={required} />
      <textarea className={`${baseInput} ${error ? errRing : okRing} min-h-24 resize-y`} {...props} />
      <Hint hint={hint} error={error} />
    </label>
  )
}

export function Select({ label, hint, error, required, options = [], className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      <Label label={label} required={required} />
      <select
        className={`${baseInput} ${error ? errRing : okRing} cursor-pointer appearance-none bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat pr-10`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%238b93a3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E\")",
        }}
        {...props}
      >
        {options.map((o) => {
          const value = typeof o === 'object' ? o.value : o
          const text = typeof o === 'object' ? o.label : o
          return (
            <option key={value} value={value}>
              {text}
            </option>
          )
        })}
      </select>
      <Hint hint={hint} error={error} />
    </label>
  )
}
