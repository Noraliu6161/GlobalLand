import { Link, useParams } from 'react-router-dom'
import { getNewsBySlug, newsDateLabel, newsTitle } from '../data/news'
import { useI18n } from '../i18n'
import { ensureArticleBlocks } from '../lib/newsBlocks'
import { toHtml } from '../lib/newsHtml'
import type { ContentBlock } from '../data/newsTypes'

function isBlankHtml(html: string) {
  return !html
    .replace(/<br\s*\/?>/gi, '')
    .replace(/&nbsp;/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim()
}

function NewsBlocks({ blocks, lang }: { blocks: ContentBlock[]; lang: 'en' | 'zh' }) {
  return (
    <div className="news-article-body news-blocks">
      {blocks.map((block) => {
        if (block.type === 'text') {
          const text = lang === 'zh' ? block.textZh || block.textEn : block.textEn || block.textZh
          const html = toHtml(text)
          if (isBlankHtml(html)) return null
          return (
            <div
              key={block.id}
              className="news-block news-block--text news-rich"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )
        }
        if (block.type === 'image') {
          if (!block.src) return null
          const alt = lang === 'zh' ? block.altZh || block.altEn || '' : block.altEn || block.altZh || ''
          return (
            <figure key={block.id} className="news-block news-block--image">
              <img src={block.src} alt={alt} loading="lazy" />
            </figure>
          )
        }
        const images = block.images.filter((img) => img.src)
        if (!images.length) return null
        return (
          <div key={block.id} className="news-block news-block--gallery">
            {images.map((img, i) => {
              const alt = lang === 'zh' ? img.altZh || img.altEn || '' : img.altEn || img.altZh || ''
              return (
                <figure key={`${block.id}-${i}`}>
                  <img src={img.src} alt={alt} loading="lazy" />
                </figure>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export function NewsDetailPage() {
  const { slug = '' } = useParams()
  const { t, lang } = useI18n()
  const raw = getNewsBySlug(slug)

  if (!raw) {
    return (
      <div className="container" style={{ paddingBottom: '3rem' }}>
        <div className="page-hero">
          <h1>{t('news.notFound')}</h1>
          <p className="section-lead">{t('news.notFoundLead')}</p>
          <Link className="btn btn-outline btn-compact" to="/news">
            {t('news.back')}
          </Link>
        </div>
      </div>
    )
  }

  const article = ensureArticleBlocks(raw)
  const title = newsTitle(article, lang)
  const date = newsDateLabel(article, lang)
  const details =
    lang === 'zh'
      ? article.eventDetailsZh || article.eventDetailsEn
      : article.eventDetailsEn || article.eventDetailsZh
  const detailsHtml = toHtml(details)
  const registerHref = (article.registerUrl || '').trim() || '/contact'

  return (
    <div className="container news-article" style={{ paddingBottom: '3.5rem' }}>
      <p className="news-back">
        <Link to="/news">{t('news.back')}</Link>
      </p>

      <span className={`news-badge news-badge--${article.kind}`}>{t(`news.kind.${article.kind}`)}</span>

      <h1 className="news-article-title">{title}</h1>
      <time className="news-article-date" dateTime={article.date}>
        {date}
      </time>

      {article.image ? (
        <div className="news-article-hero">
          <img src={article.image} alt={title} />
        </div>
      ) : null}

      <NewsBlocks blocks={article.blocks || []} lang={lang} />

      {!isBlankHtml(detailsHtml) && (
        <section className="news-event-block">
          <h2>{t('news.eventDetails')}</h2>
          <div className="news-event-meta news-rich" dangerouslySetInnerHTML={{ __html: detailsHtml }} />
        </section>
      )}

      {(article.bannerTitleZh || article.bannerSubZh) && (
        <div className="news-event-banner" aria-hidden={lang === 'en'}>
          <div className="news-event-banner-inner">
            {article.bannerTitleZh && <p className="news-event-banner-title">{article.bannerTitleZh}</p>}
            {article.bannerSubZh && <p className="news-event-banner-sub">{article.bannerSubZh}</p>}
          </div>
        </div>
      )}

      {article.kind === 'event' && (
        <div className="news-article-actions">
          <a className="btn btn-primary btn-compact" href={registerHref}>
            {lang === 'zh' ? '报名参加' : 'Register'}
          </a>
        </div>
      )}
    </div>
  )
}
