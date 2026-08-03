import { lazy, Suspense, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { ProjectType } from '../data/projects'
import { cityKey, pickText } from '../lib/localized'
import { useI18n } from '../i18n'
import { useProjects } from '../projects/ProjectsProvider'
import { ProjectImageCarousel } from '../components/ProjectImageCarousel'

const ProjectMap = lazy(() =>
  import('../components/ProjectMap').then((m) => ({ default: m.ProjectMap })),
)

const types = ['condo', 'sfh', 'townhouse', 'office', 'mixed'] as ProjectType[]

export function ProjectsPage() {
  const { t, lang } = useI18n()
  const { projects } = useProjects()
  const [params, setParams] = useSearchParams()
  const city = params.get('city') || 'all'
  const type = params.get('type') || 'all'
  const selectedId = params.get('selected')

  const [localSelected, setLocalSelected] = useState<string | null>(selectedId)
  const [filtersOpen, setFiltersOpen] = useState(false)

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

  const hasActiveFilters = city !== 'all' || type !== 'all'

  const cityLabel =
    city === 'all' ? t('projects.allCities') : (cities.find((c) => c.key === city)?.label ?? city)
  const typeLabel = type === 'all' ? t('projects.allTypes') : t(`type.${type}`)

  const setFilter = (key: 'city' | 'type', value: string) => {
    const next = new URLSearchParams(params)
    if (value === 'all') next.delete(key)
    else next.set(key, value)
    setParams(next)
  }

  const clearFilters = () => {
    const next = new URLSearchParams(params)
    next.delete('city')
    next.delete('type')
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
        <p className="page-hint">{t('projects.lead')}</p>
      </div>

      <div className={`filter-bar ${filtersOpen ? 'is-open' : ''} ${hasActiveFilters ? 'has-active' : ''}`}>
        <div className="filter-bar-summary">
          <button
            type="button"
            className="filter-bar-toggle"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((v) => !v)}
          >
            <span className="filter-bar-label">{t('projects.filter')}</span>
            <span className="filter-bar-sep" aria-hidden="true">
              ·
            </span>
            <span className="filter-bar-value">{cityLabel}</span>
            <span className="filter-bar-sep" aria-hidden="true">
              ·
            </span>
            <span className="filter-bar-value">{typeLabel}</span>
            <span className={`filter-bar-caret ${filtersOpen ? 'is-open' : ''}`} aria-hidden="true">
              ▾
            </span>
          </button>
          {hasActiveFilters && (
            <button type="button" className="filter-bar-clear" onClick={clearFilters}>
              {t('projects.clear')}
            </button>
          )}
        </div>

        {filtersOpen && (
          <div className="filter-bar-panel">
            <div className="filters" role="group" aria-label={t('projects.allCities')}>
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

            <div className="filters filters--nested" role="group" aria-label={t('projects.allTypes')}>
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
          </div>
        )}
      </div>

      <div className="projects-layout">
        <div>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <p>{t('projects.empty')}</p>
              <button type="button" className="btn btn-outline" onClick={clearFilters}>
                {t('projects.clear')}
              </button>
            </div>
          ) : (
            <div className="project-list">
              {filtered.map((p) => {
                const name = pickText(p.name, lang)
                const summary = pickText(p.summary, lang)
                const cityLabelItem = pickText(p.city, lang)
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
                      <ProjectImageCarousel
                        images={p.images?.length ? p.images : [p.image]}
                        alt={name}
                        variant="card"
                        intervalMs={4500}
                      />
                      <div>
                        <h3>{name}</h3>
                        <p>{summary.length > 110 ? `${summary.slice(0, 110)}…` : summary}</p>
                        <div className="tag-row">
                          <span className="tag">{cityLabelItem}</span>
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
