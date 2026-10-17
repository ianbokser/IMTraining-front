import { useState } from 'react'

export default function CopyEmail({
  email = 'Imtrainingokk@gmail.com',
  children,
  className = '',
  'aria-label': ariaLabel,
  ...rest
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(email)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = email
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
      } catch {}
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={ariaLabel || `Copiar email ${email}`}
      title={copied ? '¡Copiado!' : 'Copiar email'}
      data-copied={copied || undefined}
      className={className}
      {...rest}
    >
      {typeof children === 'function' ? children(copied) : children}
    </button>
  )
}
