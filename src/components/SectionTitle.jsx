export default function SectionTitle({ eyebrow, title, subtitle, center, light }) {
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && (
        <p className={`kicker mb-3 ${light ? 'text-flame-deep' : 'text-volt-deep'}`}>
          <span className="mr-2">—</span>
          {eyebrow}
        </p>
      )}
      <h2
        className={`text-balance text-4xl font-extrabold md:text-5xl ${
          light ? 'text-ink' : 'text-white'
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-lg leading-relaxed ${light ? 'text-ink-soft' : 'text-muted'}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
