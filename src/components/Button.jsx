import { Link } from 'react-router-dom'

const base =
  'group relative inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 active:translate-y-px whitespace-nowrap'

const variants = {
  // acento volt sobre oscuro — CTA principal
  primary:
    'bg-volt text-ink hover:bg-volt-deep shadow-[0_8px_24px_-10px_rgba(198,210,75,0.6)] hover:shadow-[0_12px_36px_-8px_rgba(198,210,75,0.75)] hover:-translate-y-0.5',
  // sólido claro (para secciones oscuras, alternativa neutra)
  light: 'bg-white text-ink hover:bg-white/90 hover:-translate-y-0.5',
  // sólido oscuro (para secciones claras / sobre volt)
  dark: 'bg-ink text-white hover:bg-ink-3 hover:-translate-y-0.5 shadow-soft',
  outline:
    'border border-line-strong bg-white/[0.02] text-white hover:border-volt hover:text-volt hover:bg-volt/5',
  'outline-dark':
    'border border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-white',
  ghost: 'text-white/70 hover:text-white hover:bg-white/5',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-[0.95rem]',
  lg: 'px-7 py-3.5 text-base',
}

export default function Button({
  as = 'button',
  to,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`
  if (as === 'link' && to) {
    return (
      <Link to={to} className={cls} {...props}>
        {children}
      </Link>
    )
  }
  if (as === 'a') {
    return (
      <a className={cls} {...props}>
        {children}
      </a>
    )
  }
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  )
}
