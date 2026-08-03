import { useI18n } from '../i18n'
import { aboutContent, aboutText } from '../lib/loadAbout'
import { AboutTrioCollage } from '../components/AboutTrioCollage'

export function AboutPage() {
  const { lang } = useI18n()
  const a = aboutContent

  return (
    <div className="container about-page" style={{ paddingBottom: '3.5rem' }}>
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

        <AboutTrioCollage photos={a.teamPhotos} lang={lang} />
      </div>

      <section className="section" style={{ paddingBottom: 0 }}>
        <p className="eyebrow">{aboutText(a.communityEyebrowEn, a.communityEyebrowZh, lang)}</p>
        <h2 className="section-title">{aboutText(a.communityTitleEn, a.communityTitleZh, lang)}</h2>
        <div className="split-media split-media--community">
          <div className="about-mosaic about-mosaic--community" aria-label="Community engagement">
            <div className="about-mosaic-row about-mosaic-row--2">
              {a.communityPhotos.slice(0, 2).map((p, i) => (
                <figure key={`${p.src}-${i}`} className={`about-mosaic-cell ${i === 1 ? 'is-portrait' : ''}`}>
                  <img src={p.src} alt={lang === 'zh' ? p.altZh || p.altEn : p.altEn} loading="lazy" />
                </figure>
              ))}
            </div>
            <div className="about-mosaic-row about-mosaic-row--community-bottom">
              {a.communityPhotos.slice(2, 4).map((p, i) => (
                <figure key={`${p.src}-${i}`} className={`about-mosaic-cell ${i === 0 ? 'is-narrow' : ''}`}>
                  <img src={p.src} alt={lang === 'zh' ? p.altZh || p.altEn : p.altEn} loading="lazy" />
                </figure>
              ))}
            </div>
          </div>
          <div>
            <p className="prose">{aboutText(a.communityEn, a.communityZh, lang)}</p>
            <p className="prose">{aboutText(a.returnsEn, a.returnsZh, lang)}</p>
            <img
              className="about-cccwa-logo"
              src={a.cccwaLogo}
              alt="Chinese Chamber of Commerce in Washington State"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
