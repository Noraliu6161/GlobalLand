import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'

type TrackProject = {
  id: string
  nameEn: string
  nameZh: string
  cityEn: string
  cityZh: string
  metaEn: string
  metaZh: string
  image: string
}

/** CreateWorld track-record projects shown on Company page (not the live portfolio list). */
const TRACK_PROJECTS: TrackProject[] = [
  {
    id: 'mira-flats',
    nameEn: 'Mira Flats',
    nameZh: 'Mira Flats',
    cityEn: 'Bellevue, WA',
    cityZh: '贝尔维尤, WA',
    metaEn: '312 residences',
    metaZh: '312 套公寓',
    image: '/images/projects/mira-flats.png',
  },
  {
    id: 'the-emerald',
    nameEn: 'The Emerald',
    nameZh: 'The Emerald',
    cityEn: 'Seattle, WA',
    cityZh: '西雅图, WA',
    metaEn: '262 residences',
    metaZh: '262 套公寓',
    image: '/images/projects/emerald-building.png',
  },
  {
    id: 'forum-south-park',
    nameEn: 'Forum South Park',
    nameZh: 'Forum South Park',
    cityEn: 'Bellevue, WA',
    cityZh: '贝尔维尤, WA',
    metaEn: 'CreateWorld delivery',
    metaZh: 'CreateWorld 交付项目',
    image: '/images/projects/forum-south.png',
  },
  {
    id: 'florera',
    nameEn: 'Florera',
    nameZh: 'Florera',
    cityEn: 'Seattle, WA',
    cityZh: '西雅图, WA',
    metaEn: '59 apartments',
    metaZh: '59 套公寓',
    image: '/images/projects/florera.png',
  },
  {
    id: 'evergreen-townhomes',
    nameEn: 'Evergreen Townhomes',
    nameZh: 'Evergreen Townhomes',
    cityEn: 'Washington',
    cityZh: '华盛顿州',
    metaEn: 'Townhome community',
    metaZh: '联排别墅社区',
    image: '/images/projects/evergreen-townhomes.png',
  },
  {
    id: 'belleview-park',
    nameEn: 'Belleview Park',
    nameZh: 'Belleview Park',
    cityEn: 'Bellevue, WA',
    cityZh: '贝尔维尤, WA',
    metaEn: 'CreateWorld delivery',
    metaZh: 'CreateWorld 交付项目',
    image: '/images/projects/belleview-park.png',
  },
]

export function InsightsPage() {
  const { t, lang } = useI18n()
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
          {TRACK_PROJECTS.map((p) => {
            const name = lang === 'zh' ? p.nameZh : p.nameEn
            const city = lang === 'zh' ? p.cityZh : p.cityEn
            const meta = lang === 'zh' ? p.metaZh : p.metaEn
            return (
              <article key={p.id} className="company-track-card">
                <div className="company-track-media">
                  <img src={p.image} alt={name} />
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
                  <Link className="company-track-cta" to="/contact">
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
