import { useEffect, useState, useCallback } from 'react'

export type HeroSlide = {
  src: string
  alt: string
}

/** Company-owned portfolio photos only — no third-party stock. */
export const homeHeroSlides: HeroSlide[] = [
  {
    src: '/images/hero/seattle-night.png',
    alt: 'The Emerald Condo and Seattle waterfront at dusk',
  },
  {
    src: '/images/projects/emerald-building.png',
    alt: 'The Emerald Condo exterior in Seattle',
  },
  {
    src: '/images/projects/spring-district.png',
    alt: 'Spring District Class A office in Bellevue',
  },
  {
    src: '/images/projects/riverside-garden.png',
    alt: 'Riverside Garden community amenities',
  },
  {
    src: '/images/projects/ormonde-gate.png',
    alt: 'Ormonde Gate aerial view in Everett',
  },
  {
    src: '/images/projects/redmond-office.png',
    alt: 'Downtown Redmond office building',
  },
  {
    src: '/images/projects/florera.png',
    alt: 'Florera Condo in Seattle',
  },
  {
    src: '/images/projects/sammamish.png',
    alt: 'Sammamish single-family neighborhood',
  },
]

const INTERVAL_MS = 5500

export function useHeroCarousel(slideCount: number, enabled = true) {
  const [index, setIndex] = useState(0)

  const goTo = useCallback((i: number) => {
    setIndex(((i % slideCount) + slideCount) % slideCount)
  }, [slideCount])

  const next = useCallback(() => goTo(index + 1), [goTo, index])
  const prev = useCallback(() => goTo(index - 1), [goTo, index])

  useEffect(() => {
    if (!enabled || slideCount <= 1) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slideCount)
    }, INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [enabled, slideCount])

  return { index, goTo, next, prev }
}
