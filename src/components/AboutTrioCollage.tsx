import { useEffect, useMemo, useState } from 'react'
import type { AboutPhoto } from '../lib/loadAbout'

const SLOT_COUNT = 3

function slotsForOffset(photos: AboutPhoto[], offset: number) {
  if (!photos.length) return []
  return Array.from({ length: Math.min(SLOT_COUNT, photos.length) }, (_, slot) => ({
    slot,
    photo: photos[(offset + slot) % photos.length],
  }))
}

export function AboutTrioCollage({
  photos,
  lang,
  showControls = false,
}: {
  photos: AboutPhoto[]
  lang: 'en' | 'zh'
  /** Concept lab only — official About stays clean */
  showControls?: boolean
}) {
  const [offset, setOffset] = useState(0)
  const [paused, setPaused] = useState(false)
  const n = photos.length
  const slots = useMemo(() => slotsForOffset(photos, offset), [photos, offset])

  useEffect(() => {
    if (paused || n < 2) return
    const id = window.setInterval(() => setOffset((o) => (o + 1) % n), 2400)
    return () => window.clearInterval(id)
  }, [paused, n])

  const go = (dir: -1 | 1) => {
    if (!n) return
    setOffset((o) => (o + dir + n) % n)
  }

  return (
    <div
      className="about-trio"
      aria-label={lang === 'zh' ? '团队照片' : 'Team photos'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <span className="about-trio__dots" aria-hidden />
      {slots.map(({ slot, photo }) => (
        <figure key={`${slot}-${photo.src}-${offset}`} className={`about-trio__slot about-trio__slot--${slot + 1}`}>
          <img
            src={photo.src}
            alt={lang === 'zh' ? photo.altZh || photo.altEn : photo.altEn}
            loading={slot === 0 ? 'eager' : 'lazy'}
          />
        </figure>
      ))}
      {showControls && n > 1 ? (
        <div className="about-trio__controls">
          <button type="button" className="about-trio__nav" onClick={() => go(-1)} aria-label="Previous">
            ‹
          </button>
          <span className="about-trio__meta">
            {(offset % n) + 1}/{n}
          </span>
          <button type="button" className="about-trio__nav" onClick={() => go(1)} aria-label="Next">
            ›
          </button>
        </div>
      ) : null}
    </div>
  )
}
