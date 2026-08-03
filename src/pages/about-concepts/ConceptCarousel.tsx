import { useEffect, useState } from 'react'
import { useI18n } from '../../i18n'
import { aboutContent } from '../../lib/loadAbout'
import { AboutConceptShell } from './AboutConceptShell'

export function ConceptCarousel() {
  const { lang } = useI18n()
  const photos = aboutContent.teamPhotos
  const zh = lang === 'zh'
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const n = photos.length

  useEffect(() => {
    if (paused || n < 2) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % n), 3800)
    return () => window.clearInterval(id)
  }, [paused, n])

  const go = (dir: -1 | 1) => setIndex((i) => (i + dir + n) % n)
  const current = photos[index]

  return (
    <AboutConceptShell
      note={
        zh
          ? '样稿 · 经典轮播：自动播放，可手动前后翻页 / 点圆点。文案与社区区与正式 About 相同。'
          : 'Concept · Classic carousel: autoplay with arrows & dots. Copy & community match live About.'
      }
      teamVisual={
        <div
          className="ac-visual"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="ac-carousel" aria-roledescription="carousel">
            <div className="ac-carousel-stage">
              {photos.map((p, i) => (
                <figure
                  key={p.src}
                  className={`ac-carousel-slide ${i === index ? 'is-active' : ''}`}
                  aria-hidden={i !== index}
                >
                  <img src={p.src} alt={lang === 'zh' ? p.altZh || p.altEn : p.altEn} />
                </figure>
              ))}
            </div>
            <button type="button" className="ac-carousel-nav is-prev" onClick={() => go(-1)} aria-label="Previous">
              ‹
            </button>
            <button type="button" className="ac-carousel-nav is-next" onClick={() => go(1)} aria-label="Next">
              ›
            </button>
            <div className="ac-carousel-dots">
              {photos.map((p, i) => (
                <button
                  key={p.src}
                  type="button"
                  className={i === index ? 'is-on' : undefined}
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
            {current ? (
              <p className="ac-carousel-cap">
                {lang === 'zh' ? current.altZh || current.altEn : current.altEn}
                <span>
                  {index + 1} / {n}
                </span>
              </p>
            ) : null}
          </div>
          <p className="ac-visual-hint">
            {zh ? '悬停暂停自动播放 · 点击圆点跳转' : 'Hover pauses autoplay · dots jump to a slide'}
          </p>
        </div>
      }
    />
  )
}
