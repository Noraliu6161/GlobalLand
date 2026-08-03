import { useState } from 'react'
import { useI18n } from '../../i18n'
import { aboutContent } from '../../lib/loadAbout'
import { AboutConceptShell } from './AboutConceptShell'

const milestones = [
  {
    year: '2014',
    titleEn: 'Create World roots',
    titleZh: 'Create World 根基',
    bodyEn: 'Condo development expertise formed at Create World Real Estate Inc.',
    bodyZh: '在 Create World Real Estate Inc. 积累公寓开发经验。',
    photoIndex: 2,
  },
  {
    year: '2018',
    titleEn: 'Global Land founded',
    titleZh: 'Global Land 成立',
    bodyEn: 'Ms. Lili Lu founded Global Land LLC for long-term residential & commercial work.',
    bodyZh: '陆女士创立 Global Land LLC，专注长线住宅与商业地产。',
    photoIndex: 0,
  },
  {
    year: 'Site',
    titleEn: 'On the ground',
    titleZh: '项目落地',
    bodyEn: 'Groundbreakings, inspections, and delivery moments across key assets.',
    bodyZh: '奠基、巡场与关键资产交付节点。',
    photoIndex: 3,
  },
  {
    year: 'Now',
    titleEn: 'Community',
    titleZh: '社区领导力',
    bodyEn: 'Leadership beyond the balance sheet — civic and chamber work.',
    bodyZh: '超越财务数字的领导力与商会服务。',
    photoIndex: 1,
  },
] as const

export function ConceptTimeline() {
  const { lang } = useI18n()
  const photos = aboutContent.teamPhotos
  const zh = lang === 'zh'
  const [active, setActive] = useState(1)
  const m = milestones[active]
  const photo = photos[m.photoIndex] || photos[0]

  return (
    <AboutConceptShell
      note={
        zh
          ? '样稿 05 · 故事时间轴：点击年份切换主图与说明。文案与社区区与正式 About 相同。'
          : 'Concept 05 · Story timeline: click a year to swap the hero photo. Copy & community match live About.'
      }
      teamVisual={
        <div className="ac-visual">
          <div className="ac-tl">
            <div className="ac-tl-frame" key={active}>
              {photo ? (
                <img
                  src={photo.src}
                  alt={lang === 'zh' ? photo.altZh || photo.altEn : photo.altEn}
                />
              ) : null}
              <div className="ac-tl-caption">
                <span className="ac-tl-year">{m.year}</span>
                <strong>{zh ? m.titleZh : m.titleEn}</strong>
                <p>{zh ? m.bodyZh : m.bodyEn}</p>
              </div>
            </div>
            <div className="ac-tl-rail" role="tablist" aria-label={zh ? '里程碑' : 'Milestones'}>
              {milestones.map((item, i) => (
                <button
                  key={item.year}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  className={i === active ? 'is-on' : undefined}
                  onClick={() => setActive(i)}
                >
                  <span className="ac-dot" />
                  {item.year}
                </button>
              ))}
            </div>
          </div>
        </div>
      }
    />
  )
}
