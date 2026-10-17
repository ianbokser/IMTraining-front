import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

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

export function Input({ label, hint, error, required, className = '', type = 'text', ...props }) {
  const isPassword = type === 'password'
  const [reveal, setReveal] = useState(false)
  // Si es contraseña y el usuario pidió ver, cambiamos el type a "text".
  // Ojo: dejamos autocomplete al criterio del caller (new-password, current-password, etc.)
  const effectiveType = isPassword && reveal ? 'text' : type

  return (
    <label className={`block ${className}`}>
      <Label label={label} required={required} />
      {isPassword ? (
        <div className="relative">
          <input
            type={effectiveType}
            className={`${baseInput} ${error ? errRing : okRing} pr-12 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={reveal}
            title={reveal ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-muted-2 transition-colors hover:text-white focus:text-white focus:outline-none"
          >
            {reveal ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        </div>
      ) : (
        <input type={type} className={`${baseInput} ${error ? errRing : okRing}`} {...props} />
      )}
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
