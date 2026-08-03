import { useRef } from 'react'
import { useI18n } from '../../i18n'
import { aboutContent } from '../../lib/loadAbout'
import { AboutConceptShell } from './AboutConceptShell'

function TiltCard({ src, alt, featured }: { src: string; alt: string; featured?: boolean }) {
  const ref = useRef<HTMLElement>(null)

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 12}deg) rotateY(${(x - 0.5) * 14}deg) scale(1.02)`
    el.style.setProperty('--mx', `${x * 100}%`)
    el.style.setProperty('--my', `${y * 100}%`)
  }

  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'perspective(900px) rotateX(0) rotateY(0) scale(1)'
  }

  return (
    <figure
      ref={ref}
      className={`ac-tilt-card ${featured ? 'ac-tilt-card--hero' : ''}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <img src={src} alt={alt} loading="lazy" />
      <span className="ac-tilt-shine" aria-hidden />
    </figure>
  )
}

export function ConceptTilt() {
  const { lang } = useI18n()
  const photos = aboutContent.teamPhotos
  const zh = lang === 'zh'

  return (
    <AboutConceptShell
      note={
        zh
          ? '样稿 04 · 磁性 3D：在照片上移动光标产生倾斜与高光。文案与社区区与正式 About 相同。'
          : 'Concept 04 · 3D tilt: move over photos for tilt + sheen. Copy & community match live About.'
      }
      teamVisual={
        <div className="ac-visual">
          <div className="ac-tilt-board">
            <TiltCard
              featured
              src={photos[0]?.src || ''}
              alt={lang === 'zh' ? photos[0]?.altZh || '' : photos[0]?.altEn || ''}
            />
            <div className="ac-tilt-stack">
              {photos.slice(1, 4).map((p) => (
                <TiltCard
                  key={p.src}
                  src={p.src}
                  alt={lang === 'zh' ? p.altZh || p.altEn : p.altEn}
                />
              ))}
            </div>
          </div>
          <p className="ac-visual-hint">{zh ? '光标驱动倾斜 · 无需点击' : 'Cursor-driven tilt · no click needed'}</p>
        </div>
      }
    />
  )
}
