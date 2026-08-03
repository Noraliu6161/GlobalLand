import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ProjectImageCarousel } from '../components/ProjectImageCarousel'
import type { Project } from '../data/projects'
import { pickText } from '../lib/localized'
import { useI18n } from '../i18n'
import { useProjects } from '../projects/ProjectsProvider'

function trackMeta(p: Project, lang: 'en' | 'zh', typeLabel: string) {
  if (p.units != null) {
    return lang === 'zh' ? `${p.units} 套` : `${p.units} residences`
  }
  const summary = pickText(p.summary, lang).trim()
  if (summary) return summary.length > 42 ? `${summary.slice(0, 42)}…` : summary
  return typeLabel
}

export function InsightsPage() {
  const { t, lang } = useI18n()
  const { projects } = useProjects()
  const railRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: -1 | 1) => {
    const el = railRef.current
    if (!el) return
    const card = el.querySelector('.company-track-card') as HTMLElement | null
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.8
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <div className="container" style={{ paddingBottom: '3.5rem' }}>
      <div className="page-hero reveal">
        <p className="eyebrow">{t('insights.eyebrow')}</p>
        <h1>{t('insights.title')}</h1>
      </div>

      <div className="company-prose reveal">
        <p>{t('insights.p1')}</p>
        <p>{t('insights.p2')}</p>
        <p>{t('insights.p3')}</p>
      </div>

      <section className="company-track reveal">
        <div className="company-track-head">
          <div>
            <p className="eyebrow">{t('insights.trackEyebrow')}</p>
            <h2 className="section-title">{t('insights.trackTitle')}</h2>
          </div>
          <div className="company-track-controls">
            <button type="button" className="company-track-btn" aria-label="Previous" onClick={() => scroll(-1)}>
              ‹
            </button>
            <button type="button" className="company-track-btn" aria-label="Next" onClick={() => scroll(1)}>
              ›
            </button>
          </div>
        </div>

        <div className="company-track-rail" ref={railRef}>
          {projects.map((p) => {
            const name = pickText(p.name, lang)
            const city = pickText(p.city, lang)
            const meta = trackMeta(p, lang, t(`type.${p.type}`))
            const images = p.images?.length ? p.images : p.image ? [p.image] : []
            return (
              <article key={p.id} className="company-track-card">
                <div className="company-track-media">
                  <ProjectImageCarousel images={images} alt={name} variant="rail" intervalMs={5000} />
                </div>
                <div className="company-track-body">
                  <h3>{name}</h3>
                  <p className="company-track-loc">
                    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" />
                      <circle cx="12" cy="11" r="2.2" />
                    </svg>
                    {city}
                  </p>
                  <div className="company-track-meta">
                    <strong>{meta}</strong>
                  </div>
                  <Link className="company-track-cta" to={`/projects/${p.slug}`}>
                    {t('insights.trackCta')}
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
