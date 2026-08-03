import { useI18n } from '../../i18n'
import { aboutContent } from '../../lib/loadAbout'
import { AboutTrioCollage } from '../../components/AboutTrioCollage'
import { AboutConceptShell } from './AboutConceptShell'

export function ConceptTrioCarousel() {
  const { lang } = useI18n()
  const zh = lang === 'zh'

  return (
    <AboutConceptShell
      note={
        zh
          ? '样稿 · 三格排版（已上正式 About）：右上图更矮更短、与点点顶齐并略偏左；左图与右下不重叠；object-fit: cover 不变形。'
          : 'Concept · Trio collage (now live on About): shorter top-right aligned with dots, shifted left; no overlap with left/lower frames; cover crop, no stretch.'
      }
      teamVisual={
        <div className="ac-visual">
          <AboutTrioCollage photos={aboutContent.teamPhotos} lang={lang} showControls />
          <p className="ac-visual-hint">
            {zh ? '与正式 /about 同一组件 · 悬停暂停自动轮播' : 'Same component as /about · hover pauses autoplay'}
          </p>
        </div>
      }
    />
  )
}
