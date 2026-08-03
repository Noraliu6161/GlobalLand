import { useEffect, useState } from 'react'

type Variant = 'hero' | 'card' | 'rail'

export function ProjectImageCarousel({
  images,
  alt = '',
  variant = 'hero',
  intervalMs = 4200,
  className = '',
}: {
  images: string[]
  alt?: string
  variant?: Variant
  intervalMs?: number
  className?: string
}) {
  const slides = images.filter(Boolean)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const n = slides.length

  useEffect(() => {
    setIndex(0)
  }, [slides.join('|')])

  useEffect(() => {
    if (paused || n < 2) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % n), intervalMs)
    return () => window.clearInterval(id)
  }, [paused, n, intervalMs])

  if (!n) {
    return <div className={`pic pic--${variant} pic--empty ${className}`.trim()} aria-hidden />
  }

  const go = (dir: -1 | 1, e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    setIndex((i) => (i + dir + n) % n)
  }

  const jump = (i: number, e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    setIndex(i)
  }

  return (
    <div
      className={`pic pic--${variant} ${className}`.trim()}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription={n > 1 ? 'carousel' : undefined}
    >
      <div className="pic-stage">
        {slides.map((src, i) => (
          <img
            key={`${src}-${i}`}
            src={src}
            alt={i === index ? alt : ''}
            className={i === index ? 'is-active' : undefined}
            loading={i === 0 ? 'eager' : 'lazy'}
            draggable={false}
          />
        ))}
      </div>

      {n > 1 ? (
        <>
          {variant === 'hero' ? (
            <>
              <button type="button" className="pic-nav is-prev" aria-label="Previous image" onClick={(e) => go(-1, e)}>
                ‹
              </button>
              <button type="button" className="pic-nav is-next" aria-label="Next image" onClick={(e) => go(1, e)}>
                ›
              </button>
            </>
          ) : null}
          <div className="pic-dots" role="presentation">
            {slides.map((_, i) =>
              variant === 'card' ? (
                <span key={i} className={i === index ? 'is-on' : undefined} />
              ) : (
                <button
                  key={i}
                  type="button"
                  aria-label={`Image ${i + 1}`}
                  className={i === index ? 'is-on' : undefined}
                  onClick={(e) => jump(i, e)}
                />
              ),
            )}
          </div>
          {variant === 'hero' ? (
            <span className="pic-count">
              {index + 1}/{n}
            </span>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
