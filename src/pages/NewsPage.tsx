import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'

export function NewsPage() {
  const { t } = useI18n()

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <div className="page-hero reveal">
        <p className="eyebrow">{t('news.eyebrow')}</p>
        <h1>{t('news.title')}</h1>
        <p className="section-lead">{t('news.lead')}</p>
      </div>
      <p className="text-secondary">{t('news.placeholder')}</p>
      <p style={{ marginTop: '1.5rem' }}>
        <Link className="btn btn-primary btn-compact" to="/">
          {t('nav.home')}
        </Link>
      </p>
    </div>
  )
}
