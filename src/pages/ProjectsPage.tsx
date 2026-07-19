import { lazy, Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { projects, type ProjectType } from '../data/projects'
import { useI18n } from '../i18n'

const ProjectMap = lazy(() =>
  import('../components/ProjectMap').then((m) => ({ default: m.ProjectMap })),
)

const cities = Array.from(new Set(projects.map((p) => p.city))).sort()
const types = ['condo', 'sfh', 'townhouse', 'office', 'mixed'] as ProjectType[]

export function ProjectsPage() {
  const { t } = useI18n()
  const [params, setParams] = useSearchParams()
  const city = params.get('city') || 'all'
  const type = params.get('type') || 'all'
  const selectedId = params.get('selected')

  const [localSelected, setLocalSelected] = useState<string | null>(selectedId)

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (city !== 'all' && p.city !== city) return false
      if (type !== 'all' && p.type !== type) return false
      return true
    })
  }, [city, type])

  const activeId =
    localSelected && filtered.some((p) => p.id === localSelected)
      ? localSelected
      : (filtered[0]?.id ?? null)

  const setFilter = (key: 'city' | 'type', value: string) => {
    const next = new URLSearchParams(params)
    if (value === 'all') next.delete(key)
    else next.set(key, value)
    setParams(next)
  }

  const select = (id: string) => {
    setLocalSelected(id)
    const next = new URLSearchParams(params)
    next.set('selected', id)
    setParams(next, { replace: true })
  }

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <div className="page-hero reveal">
        <p className="eyebrow">{t('projects.eyebrow')}</p>
        <h1>{t('projects.title')}</h1>
        <p className="section-lead">{t('projects.lead')}</p>
      </div>

      <div className="filters" role="group" aria-label="Filter projects">
        <button
          type="button"
          className={`chip ${city === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('city', 'all')}
        >
          {t('projects.allCities')}
        </button>
        {cities.map((c) => (
          <button
            key={c}
            type="button"
            className={`chip ${city === c ? 'active' : ''}`}
            onClick={() => setFilter('city', c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="filters" role="group" aria-label="Filter by type">
        <button
          type="button"
          className={`chip ${type === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('type', 'all')}
        >
          {t('projects.allTypes')}
        </button>
        {types.map((item) => (
          <button
            key={item}
            type="button"
            className={`chip ${type === item ? 'active' : ''}`}
            onClick={() => setFilter('type', item)}
          >
            {t(`type.${item}`)}
          </button>
        ))}
      </div>

      <div className="projects-layout">
        <div>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <p>{t('projects.empty')}</p>
              <button type="button" className="btn btn-outline" onClick={() => setParams({})}>
                {t('projects.clear')}
              </button>
            </div>
          ) : (
            <div className="project-list">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`project-card ${activeId === p.id ? 'selected' : ''}`}
                  onClick={() => select(p.id)}
                >
                  <img src={p.image} alt="" />
                  <div>
                    <h3>{p.name}</h3>
                    <p>{p.summary.slice(0, 110)}…</p>
                    <div className="tag-row">
                      <span className="tag">{p.city}</span>
                      <span className="tag">{t(`type.${p.type}`)}</span>
                      <span className="tag">{t(`status.${p.status}`)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <Suspense fallback={<div className="map-panel" aria-hidden="true" />}>
          <ProjectMap projects={filtered} selectedId={activeId} onSelect={select} />
        </Suspense>
      </div>
    </div>
  )
}
