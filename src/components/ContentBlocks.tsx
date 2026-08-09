import { toHtml } from '../lib/newsHtml'
import type { ContentBlock } from '../data/newsTypes'

function isBlankHtml(html: string) {
  return !html
    .replace(/<br\s*\/?>/gi, '')
    .replace(/&nbsp;/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim()
}

/** Shared renderer for news/project modular body (text / image / gallery). */
export function ContentBlocks({
  blocks,
  lang,
  className = 'news-article-body news-blocks',
}: {
  blocks: ContentBlock[]
  lang: 'en' | 'zh'
  className?: string
}) {
  if (!blocks.length) return null

  return (
    <div className={className}>
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
