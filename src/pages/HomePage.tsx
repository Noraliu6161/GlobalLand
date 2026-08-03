import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useHeroCarousel } from '../components/heroSlides'
import { pickText } from '../lib/localized'
import {
  homeContent,
  homeHeroSlidesForLang,
  homeText,
} from '../lib/loadHome'
import { useI18n } from '../i18n'
import { useProjects } from '../projects/ProjectsProvider'
import { newsArticles, newsDateLabel, newsSummary, newsTitle } from '../data/news'
import { ProjectImageCarousel } from '../components/ProjectImageCarousel'
import type { Project } from '../data/projects'

export function HomePage() {
  const { projects } = useProjects()
  const { lang, t } = useI18n()
  const home = homeContent
  const slides = homeHeroSlidesForLang(lang)
  const homeNews = newsArticles.slice(0, home.newsCount)
  const { index, goTo } = useHeroCarousel(slides.length)
  const [featured, setFeatured] = useState<Project[]>(projects)

  useEffect(() => {
    setFeatured(projects)
  }, [projects])

  const listingsStat = home.statListingsValue || `${projects.length}+`

  /** Left: 1 2 3 4 → 2 3 4 1 */
  const rotateRail = (dir: 'left' | 'right') => {
    setFeatured((list) => {
      if (list.length < 2) return list
      if (dir === 'left') {
        const [first, ...rest] = list
        return [...rest, first]
      }
      const last = list[list.length - 1]
      return [last, ...list.slice(0, -1)]
    })
  }

  return (
    <>
      <section className="hero hero--v1" aria-roledescription="carousel">
        <div className="hero-slides" aria-live="polite">
          {slides.map((slide, i) => (
            <div
              key={slide.src}
              className={`hero-slide ${i === index ? 'is-active' : ''}`}
              aria-hidden={i !== index}
            >
              <img src={slide.src} alt={slide.alt} />
            </div>
          ))}
          <div className="hero-overlay" />
        </div>

        <div className="hero-content hero-content--center reveal">
          <p className="eyebrow eyebrow--center hero-eyebrow">
            {homeText(home.heroEyebrow, lang)}
          </p>
          <h1 className="hero-brand hero-brand--line">
            Global
            <img
              className="hero-mark-img"
              src="/images/brand/logo-mark.svg"
              alt=""
              aria-hidden="true"
            />
            Land
          </h1>
          <p className="hero-lead hero-lead--line">{homeText(home.heroLead, lang)}</p>
          <div className="hero-actions hero-actions--center">
            <Link className="btn btn-primary btn-compact" to={home.heroCtaProjectsHref}>
              {homeText(home.heroCtaProjects, lang)}
            </Link>
            <Link className="btn btn-ghost btn-compact" to={home.heroCtaAboutHref}>
              {homeText(home.heroCtaAbout, lang)}
            </Link>
          </div>
        </div>

        <div className="hero-dots hero-dots--v1" aria-label="Background slides">
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              className={`hero-dot ${i === index ? 'is-active' : ''}`}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === index}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container home-intro">
          <div className="home-intro-left">
            <p className="eyebrow">{homeText(home.whoEyebrow, lang)}</p>
            <h2 className="section-title">{homeText(home.whoTitle, lang)}</h2>
            <p className="section-lead">{homeText(home.whoLead, lang)}</p>
          </div>
          <div className="home-intro-right">
            <p className="prose prose--emphasis">{homeText(home.vision, lang)}</p>
            <div className="stat-row">
              <div className="stat">
                <strong>{listingsStat}</strong>
                <span>{homeText(home.statListingsLabel, lang)}</span>
              </div>
              <div className="stat">
                <strong>{home.statSalesValue}</strong>
                <span>{homeText(home.statSalesLabel, lang)}</span>
              </div>
              <div className="stat">
                <strong>{home.statCitiesValue}</strong>
                <span>{homeText(home.statCitiesLabel, lang)}</span>
              </div>
            </div>
            <p className="text-secondary" style={{ marginTop: '0.75rem' }}>
              {homeText(home.statNote, lang)}
            </p>
          </div>
        </div>
      </section>

      <section className="feature-band">
        <img src={home.spotlightImage} alt={homeText(home.spotlightAlt, lang)} />
        <div className="veil" />
        <div className="copy">
          <p className="eyebrow" style={{ color: 'rgba(255,255,255,0.8)' }}>
            {homeText(home.spotlightEyebrow, lang)}
          </p>
          <h2>{homeText(home.spotlightTitle, lang)}</h2>
          <p>{homeText(home.spotlightBody, lang)}</p>
          <Link className="btn btn-ghost btn-compact" to={home.spotlightCtaHref}>
            {homeText(home.spotlightCta, lang)}
          </Link>
        </div>
      </section>

      <section className="section section--featured-rail">
        <div className="container">
          <div className="section-head section-head--center">
            <h2 className="section-title section-title--line">
              {homeText(home.selectedTitle, lang)}
            </h2>
            <Link className="btn-text" to={home.allProjectsHref}>
              {homeText(home.allProjects, lang)}
              <span aria-hidden="true"> →</span>
            </Link>
          </div>
        </div>
        <div className="featured-rail-wrap">
          <button
            type="button"
            className="rail-btn rail-btn--prev"
            aria-label="Previous"
            onClick={() => rotateRail('left')}
          >
            ‹
          </button>
          <div className="featured-rail">
            {featured.map((p) => {
              const name = pickText(p.name, lang)
              const summary = pickText(p.summary, lang)
              return (
                <Link key={p.id} to={`/projects/${p.slug}`} className="featured-panel">
                  <ProjectImageCarousel
                    images={p.images?.length ? p.images : [p.image]}
                    alt={name}
                    variant="rail"
                    intervalMs={5000}
                  />
                  <div className="featured-panel-veil" />
                  <div className="featured-panel-top">
                    <strong>{name}</strong>
                    <span>
                      {pickText(p.city, lang)} · {t(`type.${p.type}`)}
                    </span>
                  </div>
                  <div className="featured-panel-hover">
                    <p>{summary}</p>
                    <span className="featured-discover">{homeText(home.discoverMore, lang)}</span>
                  </div>
                </Link>
              )
            })}
          </div>
          <button
            type="button"
            className="rail-btn rail-btn--next"
            aria-label="Next"
            onClick={() => rotateRail('right')}
          >
            ›
          </button>
        </div>
      </section>

      <section className="section section--news">
        <div className="container">
          <div className="section-head section-head--center">
            <h2 className="section-title section-title--line">{homeText(home.newsTitle, lang)}</h2>
            <Link className="btn-text" to={home.newsAllHref}>
              {homeText(home.newsAll, lang)}
              <span aria-hidden="true"> →</span>
            </Link>
          </div>
          <div className="news-grid">
            {homeNews.map((n) => (
              <article key={n.id} className="news-card">
                <time className="news-date">{newsDateLabel(n, lang)}</time>
                <h3>{newsTitle(n, lang)}</h3>
                <p>{newsSummary(n, lang)}</p>
                <Link to={`/news/${n.slug}`} className="btn-text">
                  {homeText(home.newsRead, lang)}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
