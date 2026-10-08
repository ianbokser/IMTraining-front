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
        className={`text-balance text-[2.75rem] font-extrabold leading-[0.92] sm:text-[4rem] lg:text-[5.25rem] ${
          light ? 'text-ink' : 'text-white'
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-5 text-lg leading-relaxed sm:text-xl ${light ? 'text-ink-soft' : 'text-muted'}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
