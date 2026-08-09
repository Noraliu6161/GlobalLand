import type { ReactNode } from 'react'
import { useI18n } from '../../i18n'
import { aboutContent, aboutText } from '../../lib/loadAbout'

/** Original About page chrome — only the team photo cluster is swapped. */
export function AboutConceptShell({
  teamVisual,
  note,
}: {
  teamVisual: ReactNode
  note?: string
}) {
  const { lang } = useI18n()
  const a = aboutContent

  return (
    <div className="container about-page" style={{ paddingBottom: '3.5rem' }}>
      {note ? <p className="ac-lab-note">{note}</p> : null}

      <div className="page-hero reveal">
        <p className="eyebrow">{aboutText(a.eyebrowEn, a.eyebrowZh, lang)}</p>
        <h1>{aboutText(a.titleEn, a.titleZh, lang)}</h1>
      </div>

      <div className="split-media split-media--about">
        <div>
          <p className="prose">{aboutText(a.introEn, a.introZh, lang)}</p>
          <p className="prose">{aboutText(a.visionEn, a.visionZh, lang)}</p>
          <p className="prose">{aboutText(a.teamEn, a.teamZh, lang)}</p>
        </div>
        {teamVisual}
      </div>
    </div>
  )
}
