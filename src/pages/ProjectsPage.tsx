import { lazy, Suspense, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { ProjectType } from '../data/projects'
import { cityKey, pickText } from '../lib/localized'
import { useI18n } from '../i18n'
import { useProjects } from '../projects/ProjectsProvider'

const ProjectMap = lazy(() =>
  import('../components/ProjectMap').then((m) => ({ default: m.ProjectMap })),
)

const types = ['condo', 'sfh', 'townhouse', 'office', 'mixed'] as ProjectType[]

export function ProjectsPage() {
  const { t, lang } = useI18n()
  const { projects, loading, source } = useProjects()
  const [params, setParams] = useSearchParams()
  const city = params.get('city') || 'all'
  const type = params.get('type') || 'all'
  const selectedId = params.get('selected')

  const [localSelected, setLocalSelected] = useState<string | null>(selectedId)

  const cities = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of projects) {
      const key = cityKey(p.city)
      if (!map.has(key)) map.set(key, pickText(p.city, lang))
    }
    return Array.from(map.entries())
      .sort((a, b) => a[1].localeCompare(b[1], lang === 'zh' ? 'zh-CN' : 'en'))
      .map(([key, label]) => ({ key, label }))
  }, [projects, lang])

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (city !== 'all' && cityKey(p.city) !== city) return false
      if (type !== 'all' && p.type !== type) return false
      return true
    })
  }, [projects, city, type])

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
        <p className="text-secondary" style={{ marginTop: '0.5rem' }}>
          {loading
            ? t('projects.loading')
            : source === 'cms'
              ? t('projects.sourceCms')
              : t('projects.sourceEmpty')}
        </p>
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
            key={c.key}
            type="button"
            className={`chip ${city === c.key ? 'active' : ''}`}
            onClick={() => setFilter('city', c.key)}
          >
            {c.label}
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
              {filtered.map((p) => {
                const name = pickText(p.name, lang)
                const summary = pickText(p.summary, lang)
                const cityLabel = pickText(p.city, lang)
                return (
                  <article
                    key={p.id}
                    className={`project-card ${activeId === p.id ? 'selected' : ''}`}
                  >
                    <button
                      type="button"
                      className="project-card-select"
                      onClick={() => select(p.id)}
                      aria-pressed={activeId === p.id}
                    >
                      <img src={p.image} alt="" />
                      <div>
                        <h3>{name}</h3>
                        <p>{summary.length > 110 ? `${summary.slice(0, 110)}…` : summary}</p>
                        <div className="tag-row">
                          <span className="tag">{cityLabel}</span>
                          <span className="tag">{t(`type.${p.type}`)}</span>
                          <span className="tag">{t(`status.${p.status}`)}</span>
                        </div>
                      </div>
                    </button>
                    <div className="project-card-actions">
                      <Link className="btn btn-outline btn-compact" to={`/projects/${p.slug}`}>
                        {t('projects.viewDetails')}
                      </Link>
                    </div>
                  </article>
                )
              })}
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
