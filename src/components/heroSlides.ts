import { useEffect, useState, useCallback } from 'react'

export type HeroSlide = {
  src: string
  alt: string
}

const INTERVAL_MS = 2000

export function useHeroCarousel(slideCount: number, enabled = true) {
  const [index, setIndex] = useState(0)

  const goTo = useCallback(
    (i: number) => {
      if (slideCount <= 0) return
      setIndex(((i % slideCount) + slideCount) % slideCount)
    },
    [slideCount],
  )

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
