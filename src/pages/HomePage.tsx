import { Link } from 'react-router-dom'
import { useHeroCarousel } from '../components/heroSlides'
import { pickText } from '../lib/localized'
import {
  fillYear,
  homeContent,
  homeHeroSlidesForLang,
  homeText,
} from '../lib/loadHome'
import { useI18n } from '../i18n'
import { useProjects } from '../projects/ProjectsProvider'

export function HomePage() {
  const { projects } = useProjects()
  const { lang, t } = useI18n()
  const home = homeContent
  const slides = homeHeroSlidesForLang(lang)
  const featured = projects.filter((p) => p.featured).slice(0, home.featuredCount)
  const { index, goTo } = useHeroCarousel(slides.length)

  const listingsStat =
    home.statListingsValue || `${projects.length}+`

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
            {fillYear(homeText(home.heroEyebrow, lang), home.foundedYear)}
          </p>
          <h1 className="hero-brand hero-brand--line">
            {homeText(home.brandLeft, lang)}
            <span className="mark" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            {homeText(home.brandRight, lang)}
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
        <img
          src={home.spotlightImage}
          alt={homeText(home.spotlightAlt, lang)}
        />
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

      <section className="section">
        <div className="container">
          <div className="section-head section-head--center">
            <h2 className="section-title section-title--line">
              {homeText(home.selectedTitle, lang)}
            </h2>
            <Link className="btn-text" to="/projects">
              {homeText(home.allProjects, lang)}
              <span aria-hidden="true"> →</span>
            </Link>
          </div>
          <div className="project-strip">
            {featured.map((p) => {
              const name = pickText(p.name, lang)
              return (
                <Link key={p.id} to={`/projects/${p.slug}`} className="project-tile">
                  <img src={p.image} alt={name} />
                  <div className="meta">
                    <span>
                      {pickText(p.city, lang)} · {t(`type.${p.type}`)}
                    </span>
                    <strong>{name}</strong>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
