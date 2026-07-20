import { InsightsCharts } from '../components/InsightsCharts'
import { useI18n } from '../i18n'
import { useProjects } from '../projects/ProjectsProvider'

export function InsightsPage() {
  const { t } = useI18n()
  const { projects } = useProjects()

  return (
    <div className="container" style={{ paddingBottom: '3.5rem' }}>
      <div className="page-hero reveal">
        <p className="eyebrow">{t('insights.eyebrow')}</p>
        <h1>{t('insights.title')}</h1>
        <p className="section-lead">{t('insights.lead')}</p>
      </div>
      <InsightsCharts projects={projects} />
    </div>
  )
}
