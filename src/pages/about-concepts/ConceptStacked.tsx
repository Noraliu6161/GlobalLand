import { useI18n } from '../../i18n'
import { aboutContent } from '../../lib/loadAbout'
import { AboutConceptShell } from './AboutConceptShell'

export function ConceptStacked() {
  const { lang } = useI18n()
  const photos = aboutContent.teamPhotos
  const zh = lang === 'zh'

  return (
    <AboutConceptShell
      note={
        zh
          ? '样稿 01 · 动态堆叠：悬停或聚焦照片堆，卡片扇形展开。文案与社区区与正式 About 相同。'
          : 'Concept 01 · Stacked cards: hover/focus the deck to fan out. Copy & community match live About.'
      }
      teamVisual={
        <div className="ac-visual">
          <div className="ac-fan" tabIndex={0} aria-label={zh ? '团队照片堆' : 'Team photo stack'}>
            {photos.map((p, i) => (
              <figure key={p.src} className="ac-fan-card" style={{ ['--i' as string]: i }}>
                <img src={p.src} alt={lang === 'zh' ? p.altZh || p.altEn : p.altEn} />
                <figcaption>{lang === 'zh' ? p.altZh || p.altEn : p.altEn}</figcaption>
              </figure>
            ))}
          </div>
          <p className="ac-visual-hint">{zh ? '悬停展开 · 松开关闭' : 'Hover to fan · leave to restack'}</p>
        </div>
      }
    />
  )
}
