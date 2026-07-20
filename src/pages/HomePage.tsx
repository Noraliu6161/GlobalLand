import { Link } from 'react-router-dom'
import { company } from '../data/projects'
import { homeHeroSlides, useHeroCarousel } from '../components/heroSlides'
import { pickText } from '../lib/localized'
import { useI18n } from '../i18n'
import { useProjects } from '../projects/ProjectsProvider'

export function HomePage() {
  const { projects } = useProjects()
  const featured = projects.filter((p) => p.featured).slice(0, 3)
  const { index, goTo } = useHeroCarousel(homeHeroSlides.length)
  const { t, lang } = useI18n()

  return (
    <>
      <section className="hero hero--v1" aria-roledescription="carousel">
        <div className="hero-slides" aria-live="polite">
          {homeHeroSlides.map((slide, i) => (
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
            {t('hero.eyebrow', { year: company.founded })}
          </p>
          <h1 className="hero-brand hero-brand--line">
            Global
            <span className="mark" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            Land
          </h1>
          <p className="hero-lead hero-lead--line">{t('hero.lead')}</p>
          <div className="hero-actions hero-actions--center">
            <Link className="btn btn-primary btn-compact" to="/projects">
              {t('hero.ctaProjects')}
            </Link>
            <Link className="btn btn-ghost btn-compact" to="/about">
              {t('hero.ctaAbout')}
            </Link>
          </div>
        </div>

        <div className="hero-dots hero-dots--v1" aria-label="Background slides">
          {homeHeroSlides.map((slide, i) => (
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
            <p className="eyebrow">{t('home.whoEyebrow')}</p>
            <h2 className="section-title">{t('home.whoTitle')}</h2>
            <p className="section-lead">{t('home.whoLead')}</p>
          </div>
          <div className="home-intro-right">
            <p className="prose prose--emphasis">{t('home.vision')}</p>
            <div className="stat-row">
              <div className="stat">
                <strong>{projects.length}+</strong>
                <span>{t('home.statListings')}</span>
              </div>
              <div className="stat">
                <strong>$70M+</strong>
                <span>{t('home.statSales')}</span>
              </div>
              <div className="stat">
                <strong>8</strong>
                <span>{t('home.statCities')}</span>
              </div>
            </div>
            <p className="text-secondary" style={{ marginTop: '0.75rem' }}>
              {t('home.statNote')}
            </p>
          </div>
        </div>
      </section>

      <section className="feature-band">
        <img src="/images/projects/spring-district.png" alt="Spring District Class A office in Bellevue" />
        <div className="veil" />
        <div className="copy">
          <p className="eyebrow" style={{ color: 'rgba(255,255,255,0.8)' }}>
            {t('home.spotlightEyebrow')}
          </p>
          <h2>{t('home.spotlightTitle')}</h2>
          <p>{t('home.spotlightBody')}</p>
          <Link className="btn btn-ghost btn-compact" to="/projects?type=office">
            {t('home.spotlightCta')}
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head section-head--center">
            <h2 className="section-title section-title--line">{t('home.selectedTitle')}</h2>
            <Link className="btn-text" to="/projects">
              {t('home.allProjects')}
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
