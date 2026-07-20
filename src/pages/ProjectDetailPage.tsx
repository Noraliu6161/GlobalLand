import { Link, useParams } from 'react-router-dom'
import { ProjectBody } from '../components/ProjectBody'
import { pickList, pickText } from '../lib/localized'
import { useI18n } from '../i18n'
import { useProjects } from '../projects/ProjectsProvider'

function formatMetric(value: number | null, suffix = '') {
  if (value == null) return null
  return `${value}${suffix}`
}

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { t, lang } = useI18n()
  const { projects } = useProjects()

  const project = projects.find((p) => p.slug === slug || p.id === slug) ?? null

  if (!project) {
    return (
      <div className="container" style={{ paddingBottom: '3.5rem' }}>
        <div className="page-hero reveal">
          <p className="eyebrow">{t('projects.eyebrow')}</p>
          <h1>{t('projectDetail.notFound')}</h1>
          <p className="section-lead">{t('projectDetail.notFoundLead')}</p>
          <Link className="btn btn-outline btn-compact" to="/projects">
            {t('projectDetail.back')}
          </Link>
        </div>
      </div>
    )
  }

  const name = pickText(project.name, lang)
  const city = pickText(project.city, lang)
  const summary = pickText(project.summary, lang)
  const body = pickText(project.body, lang, summary)
  const highlights = pickList(project.highlights, lang)

  const metrics = [
    { label: t('projectDetail.year'), value: String(project.year) },
    { label: t('projectDetail.units'), value: formatMetric(project.units) },
    { label: t('projectDetail.buildings'), value: formatMetric(project.buildings) },
    { label: t('projectDetail.saleValue'), value: formatMetric(project.saleValueM, 'M') },
    {
      label: t('projectDetail.acquisition'),
      value: formatMetric(project.acquisitionPriceM, 'M'),
    },
  ].filter((m) => m.value)

  return (
    <div className="container" style={{ paddingBottom: '3.5rem' }}>
      <div className="project-detail-page reveal">
        <Link className="project-detail-back" to="/projects">
          ← {t('projectDetail.back')}
        </Link>

        <div className="project-detail-hero">
          <img src={project.image} alt={name} />
        </div>

        <div className="project-detail-main">
          <p className="eyebrow">{city}</p>
          <h1>{name}</h1>
          <div className="tag-row">
            <span className="tag">{t(`type.${project.type}`)}</span>
            <span className="tag">{t(`status.${project.status}`)}</span>
            {project.relatedEntity ? (
              <span className="tag">{project.relatedEntity}</span>
            ) : null}
          </div>

          {metrics.length > 0 ? (
            <dl className="project-metrics">
              {metrics.map((m) => (
                <div key={m.label}>
                  <dt>{m.label}</dt>
                  <dd>{m.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <ProjectBody body={body} fallback={summary} bodyFont={project.bodyFont} />

          {highlights.length > 0 ? (
            <>
              <h2 className="project-detail-subhead">{t('projectDetail.highlights')}</h2>
              <ul className="project-highlights">
                {highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </>
          ) : null}

          <div className="project-detail-actions">
            <Link className="btn btn-primary btn-compact" to="/contact">
              {t('projectDetail.contact')}
            </Link>
            <Link className="btn btn-outline btn-compact" to="/projects">
              {t('projectDetail.back')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
