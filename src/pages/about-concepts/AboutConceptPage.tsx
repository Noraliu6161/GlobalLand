import type { ComponentType } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useI18n } from '../../i18n'
import { ConceptStacked } from './ConceptStacked'
import { ConceptTilt } from './ConceptTilt'
import { ConceptTimeline } from './ConceptTimeline'
import { ConceptCarousel } from './ConceptCarousel'
import { ConceptTrioCarousel } from './ConceptTrioCarousel'

const ids = ['stacked', 'tilt', 'timeline', 'carousel', 'trio'] as const
type Id = (typeof ids)[number]

const meta: Record<Id, { en: string; zh: string }> = {
  stacked: { en: '01 · Stacked cards', zh: '01 · 动态堆叠卡片' },
  tilt: { en: '04 · 3D tilt', zh: '04 · 磁性 3D 悬浮' },
  timeline: { en: '05 · Story timeline', zh: '05 · 交互时间轴' },
  carousel: { en: 'Carousel', zh: '经典轮播' },
  trio: { en: 'Trio collage carousel', zh: '三格排版轮播' },
}

const views: Record<Id, ComponentType> = {
  stacked: ConceptStacked,
  tilt: ConceptTilt,
  timeline: ConceptTimeline,
  carousel: ConceptCarousel,
  trio: ConceptTrioCarousel,
}

export function AboutConceptPage() {
  const { id = '' } = useParams()
  const { lang } = useI18n()
  const zh = lang === 'zh'
  const valid = ids.includes(id as Id)
  const conceptId = valid ? (id as Id) : null
  const View = conceptId ? views[conceptId] : null
  const idx = conceptId ? ids.indexOf(conceptId) : -1
  const prev = idx > 0 ? ids[idx - 1] : null
  const next = idx >= 0 && idx < ids.length - 1 ? ids[idx + 1] : null

  if (!View || !conceptId) {
    return (
      <div className="ac-shell">
        <p>{zh ? '未找到该方案。' : 'Concept not found.'}</p>
        <Link to="/about-concepts">{zh ? '返回列表' : 'Back to list'}</Link>
      </div>
    )
  }

  return (
    <div className="ac-shell">
      <nav className="ac-nav" aria-label="Concept navigation">
        <Link className="ac-chip" to="/about-concepts">
          {zh ? '← 全部方案' : '← All concepts'}
        </Link>
        <span className="ac-nav-title">{zh ? meta[conceptId].zh : meta[conceptId].en}</span>
        <div className="ac-nav-links">
          {prev ? (
            <Link className="ac-chip" to={`/about-concepts/${prev}`}>
              {zh ? '上一版' : 'Prev'}
            </Link>
          ) : (
            <span className="ac-chip is-disabled">{zh ? '上一版' : 'Prev'}</span>
          )}
          {next ? (
            <Link className="ac-chip" to={`/about-concepts/${next}`}>
              {zh ? '下一版' : 'Next'}
            </Link>
          ) : (
            <span className="ac-chip is-disabled">{zh ? '下一版' : 'Next'}</span>
          )}
        </div>
      </nav>
      <View />
    </div>
  )
}
