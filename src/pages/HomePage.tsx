import { useEffect, useState } from 'react'
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
import type { Project } from '../data/projects'

const HOME_NEWS = [
  {
    id: 'n1',
    date: '2026-03',
    titleEn: 'Downtown Redmond office acquisition closes',
    titleZh: '雷德蒙德市中心办公收购完成',
    summaryEn: 'Global Land expands the Eastside commercial portfolio with a newly acquired office asset.',
    summaryZh: 'Global Land 新增东区办公资产，持续扩展商业地产组合。',
  },
  {
    id: 'n2',
    date: '2025-11',
    titleEn: 'Spring District leasing update',
    titleZh: 'Spring District 租赁进展',
    summaryEn: 'Long-term tenants continue to anchor Class A office in Bellevue’s Spring District.',
    summaryZh: '贝尔维尤 Spring District 甲级写字楼由长期租户持续支撑。',
  },
  {
    id: 'n3',
    date: '2025-06',
    titleEn: 'Community-focused residential progress',
    titleZh: '社区导向住宅项目进展',
    summaryEn: 'Low-density communities across the Pacific Northwest continue to take shape.',
    summaryZh: '太平洋西北低密度社区项目持续推进。',
  },
]

export function HomePage() {
  const { projects } = useProjects()
  const { lang, t } = useI18n()
  const home = homeContent
  const slides = homeHeroSlidesForLang(lang)
  const featuredBase = projects.filter((p) => p.featured).slice(0, Math.max(home.featuredCount, 7))
  const { index, goTo } = useHeroCarousel(slides.length)
  const [featured, setFeatured] = useState<Project[]>(featuredBase)

  useEffect(() => {
    setFeatured(
      projects.filter((p) => p.featured).slice(0, Math.max(home.featuredCount, 7)),
    )
  }, [projects, home.featuredCount])

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
            {fillYear(homeText(home.heroEyebrow, lang), home.foundedYear)}
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
            <Link className="btn-text" to="/projects">
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
                  <img src={p.image} alt="" />
                  <div className="featured-panel-veil" />
                  <div className="featured-panel-top">
                    <strong>{name}</strong>
                    <span>
                      {pickText(p.city, lang)} · {t(`type.${p.type}`)}
                    </span>
                  </div>
                  <div className="featured-panel-hover">
                    <p>{summary}</p>
                    <span className="featured-discover">{t('home.discoverMore')}</span>
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
            <h2 className="section-title section-title--line">{t('home.newsTitle')}</h2>
            <Link className="btn-text" to="/news">
              {t('home.newsAll')}
              <span aria-hidden="true"> →</span>
            </Link>
          </div>
          <div className="news-grid">
            {HOME_NEWS.map((n) => (
              <article key={n.id} className="news-card">
                <time className="news-date">{n.date}</time>
                <h3>{lang === 'zh' ? n.titleZh : n.titleEn}</h3>
                <p>{lang === 'zh' ? n.summaryZh : n.summaryEn}</p>
                <Link to="/news" className="btn-text">
                  {t('home.newsRead')}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
