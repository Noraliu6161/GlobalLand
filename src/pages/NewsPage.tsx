import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  monthLabel,
  newsArchives,
  newsArticles,
  newsDateLabel,
  newsSummary,
  newsTitle,
  type NewsKind,
} from '../data/news'
import { useI18n } from '../i18n'

type Filter = 'all' | NewsKind

export function NewsPage() {
  const { t, lang } = useI18n()
  const [params, setParams] = useSearchParams()
  const filter = (params.get('kind') as Filter) || 'all'
  const yearParam = params.get('year')
  const monthParam = params.get('month')
  const [kind, setKind] = useState<Filter>(filter)

  const archives = useMemo(() => newsArchives(newsArticles), [])

  const list = useMemo(() => {
    return newsArticles.filter((a) => {
      if (kind !== 'all' && a.kind !== kind) return false
      if (yearParam && String(a.archiveYear) !== yearParam) return false
      if (monthParam && String(a.archiveMonth) !== monthParam) return false
      return true
    })
  }, [kind, yearParam, monthParam])

  const setKindFilter = (next: Filter) => {
    setKind(next)
    const p = new URLSearchParams(params)
    if (next === 'all') p.delete('kind')
    else p.set('kind', next)
    setParams(p)
  }

  const setArchive = (year: number, month: number) => {
    const p = new URLSearchParams(params)
    p.set('year', String(year))
    p.set('month', String(month))
    setParams(p)
  }

  const clearArchive = () => {
    const p = new URLSearchParams(params)
    p.delete('year')
    p.delete('month')
    setParams(p)
  }

  return (
    <div className="container news-page" style={{ paddingBottom: '3.5rem' }}>
      <div className="page-hero reveal">
        <p className="eyebrow">{t('news.eyebrow')}</p>
        <h1>{t('news.title')}</h1>
      </div>

      <div className="news-layout">
        <div className="news-main">
          <div className="news-kind-filters" role="tablist" aria-label={t('news.title')}>
            {(['all', 'news', 'event'] as Filter[]).map((k) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={kind === k}
                className={`news-kind-chip ${kind === k ? 'is-active' : ''}`}
                onClick={() => setKindFilter(k)}
              >
                {t(`news.kind.${k}`)}
              </button>
            ))}
          </div>

          <div className="news-card-list">
            {list.length === 0 ? (
              <p className="text-secondary">{t('news.empty')}</p>
            ) : (
              list.map((a) => {
                const title = newsTitle(a, lang)
                const summary = newsSummary(a, lang)
                const date = newsDateLabel(a, lang)
                return (
                  <article key={a.id} className={`news-list-card ${a.image ? 'news-list-card--media' : ''}`}>
                    {a.image ? (
                      <Link to={`/news/${a.slug}`} className="news-list-card-media" tabIndex={-1} aria-hidden>
                        <img src={a.image} alt="" />
                      </Link>
                    ) : null}
                    <div className="news-list-card-body">
                      <span className={`news-badge news-badge--${a.kind}`}>
                        {t(`news.kind.${a.kind}`)}
                      </span>
                      <h2>
                        <Link to={`/news/${a.slug}`}>{title}</Link>
                      </h2>
                      <p>{summary}</p>
                      <div className="news-list-card-foot">
                        <time dateTime={a.date}>{date}</time>
                        <Link to={`/news/${a.slug}`} className="news-read-more">
                          {t('news.readMore')}
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })
            )}
          </div>
        </div>

        <aside className="news-archives">
          <div className="news-archives-head">{t('news.archives')}</div>
          <div className="news-archives-body">
            {(yearParam || monthParam) && (
              <button type="button" className="news-archives-clear" onClick={clearArchive}>
                {t('news.clearArchive')}
              </button>
            )}
            {archives.map(({ year, months }) => (
              <div key={year} className="news-archives-year">
                <strong>{year}</strong>
                <div className="news-archives-months">
                  {months.map((m) => {
                    const active =
                      yearParam === String(year) && monthParam === String(m)
                    return (
                      <button
                        key={m}
                        type="button"
                        className={`news-month-btn ${active ? 'is-active' : ''}`}
                        onClick={() => setArchive(year, m)}
                      >
                        {monthLabel(m, lang)}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
