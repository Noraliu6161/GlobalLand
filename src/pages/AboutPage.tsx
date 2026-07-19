import { company } from '../data/projects'
import { useI18n } from '../i18n'

export function AboutPage() {
  const { t } = useI18n()

  return (
    <div className="container" style={{ paddingBottom: '3.5rem' }}>
      <div className="page-hero reveal">
        <p className="eyebrow">{t('about.eyebrow')}</p>
        <h1>{t('about.title')}</h1>
      </div>

      <div className="split-media">
        <div>
          <p className="prose">
            {t('about.intro', {
              name: company.name,
              founder: company.founder,
              year: company.founded,
            })}
          </p>
          <p className="prose">{t('about.vision')}</p>
          <p className="prose">{t('about.team')}</p>
        </div>
        <img src="/images/hero/team-grid.png" alt="Global Land team and community moments" />
      </div>

      <section className="section" style={{ paddingBottom: 0 }}>
        <p className="eyebrow">{t('about.communityEyebrow')}</p>
        <h2 className="section-title">{t('about.communityTitle')}</h2>
        <div className="split-media">
          <img src="/images/hero/community.png" alt="Community engagement with CCCWA" />
          <div>
            <p className="prose">{t('about.community')}</p>
            <p className="prose">{t('about.returns')}</p>
            <img
              src="/images/brand/logo-cccwa.png"
              alt="Chinese Chamber of Commerce in Washington State"
              style={{ marginTop: '1.25rem', height: '56px', width: 'auto' }}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
