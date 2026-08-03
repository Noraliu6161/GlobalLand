import { useState } from 'react'
import { PageHeader } from '../AdminApp'
import { getCopy, type AdminLang } from '../lib/i18n'
import { saveContentFile } from '../lib/contentApi'
import { Field, ImageField } from '../components/Fields'
import aboutRaw from '../../../content/about.json'
import type { AboutContent, AboutPhoto } from '../../lib/loadAbout'

export function AboutPageEditor({ lang }: { lang: AdminLang }) {
  const t = getCopy(lang)
  const zh = lang === 'zh'
  const lb = (en: string, cn: string) => (zh ? cn : en)
  const [data, setData] = useState<AboutContent>(() => structuredClone(aboutRaw as AboutContent))
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  const set = <K extends keyof AboutContent>(key: K, value: AboutContent[K]) => {
    setData((d) => ({ ...d, [key]: value }))
  }

  const setPhoto = (list: 'teamPhotos' | 'communityPhotos', index: number, patch: Partial<AboutPhoto>) => {
    setData((d) => ({
      ...d,
      [list]: d[list].map((p, i) => (i === index ? { ...p, ...patch } : p)),
    }))
  }

  const save = async () => {
    setBusy(true)
    setStatus('')
    const res = await saveContentFile('content/about.json', data)
    setBusy(false)
    setStatus(res.ok ? t.saved : res.error)
  }

  return (
    <>
      <PageHeader
        title={t.about}
        action={
          <button type="button" className="admin-btn admin-btn-primary" disabled={busy} onClick={() => void save()}>
            {busy ? t.saving : t.save}
          </button>
        }
      />
      {status && <p className={`admin-status ${status === t.saved ? 'is-ok' : 'is-err'}`}>{status}</p>}

      <section className="admin-card">
        <h2>{lb('Header & story', '页头与正文')}</h2>
        <div className="admin-grid-2">
          <Field label={lb('Eyebrow (EN)', '眉标（英文）')} value={data.eyebrowEn} onChange={(v) => set('eyebrowEn', v)} />
          <Field label={lb('Eyebrow (ZH)', '眉标（中文）')} value={data.eyebrowZh} onChange={(v) => set('eyebrowZh', v)} />
          <Field label={lb('Title (EN)', '标题（英文）')} value={data.titleEn} onChange={(v) => set('titleEn', v)} />
          <Field label={lb('Title (ZH)', '标题（中文）')} value={data.titleZh} onChange={(v) => set('titleZh', v)} />
          <Field
            label={lb('Intro (EN)', '引言（英文）')}
            value={data.introEn}
            onChange={(v) => set('introEn', v)}
            multiline
          />
          <Field
            label={lb('Intro (ZH)', '引言（中文）')}
            value={data.introZh}
            onChange={(v) => set('introZh', v)}
            multiline
          />
          <Field
            label={lb('Vision (EN)', '愿景（英文）')}
            value={data.visionEn}
            onChange={(v) => set('visionEn', v)}
            multiline
          />
          <Field
            label={lb('Vision (ZH)', '愿景（中文）')}
            value={data.visionZh}
            onChange={(v) => set('visionZh', v)}
            multiline
          />
          <Field label={lb('Team (EN)', '团队（英文）')} value={data.teamEn} onChange={(v) => set('teamEn', v)} multiline />
          <Field label={lb('Team (ZH)', '团队（中文）')} value={data.teamZh} onChange={(v) => set('teamZh', v)} multiline />
        </div>
      </section>

      <section className="admin-card">
        <div className="admin-card-head">
          <h2>{lb('Team collage (5 photos)', '团队拼贴图（5 张）')}</h2>
        </div>
        {data.teamPhotos.map((p, i) => (
          <div key={i} className="admin-subcard">
            <div className="admin-card-head">
              <h3>
                {zh ? '图片' : 'Photo'} {i + 1}
              </h3>
            </div>
            <ImageField
              label={lb('Image', '图片')}
              value={p.src}
              onChange={(v) => setPhoto('teamPhotos', i, { src: v })}
              lang={lang}
            />
            <div className="admin-grid-2">
              <Field
                label={lb('Alt (EN)', '图片说明（英文）')}
                value={p.altEn}
                onChange={(v) => setPhoto('teamPhotos', i, { altEn: v })}
              />
              <Field
                label={lb('Alt (ZH)', '图片说明（中文）')}
                value={p.altZh}
                onChange={(v) => setPhoto('teamPhotos', i, { altZh: v })}
              />
            </div>
          </div>
        ))}
      </section>

      <section className="admin-card">
        <h2>{lb('Community', '社区板块')}</h2>
        <div className="admin-grid-2">
          <Field
            label={lb('Eyebrow (EN)', '眉标（英文）')}
            value={data.communityEyebrowEn}
            onChange={(v) => set('communityEyebrowEn', v)}
          />
          <Field
            label={lb('Eyebrow (ZH)', '眉标（中文）')}
            value={data.communityEyebrowZh}
            onChange={(v) => set('communityEyebrowZh', v)}
          />
          <Field
            label={lb('Title (EN)', '标题（英文）')}
            value={data.communityTitleEn}
            onChange={(v) => set('communityTitleEn', v)}
          />
          <Field
            label={lb('Title (ZH)', '标题（中文）')}
            value={data.communityTitleZh}
            onChange={(v) => set('communityTitleZh', v)}
          />
          <Field
            label={lb('Community (EN)', '社区正文（英文）')}
            value={data.communityEn}
            onChange={(v) => set('communityEn', v)}
            multiline
          />
          <Field
            label={lb('Community (ZH)', '社区正文（中文）')}
            value={data.communityZh}
            onChange={(v) => set('communityZh', v)}
            multiline
          />
          <Field
            label={lb('Returns (EN)', '回报说明（英文）')}
            value={data.returnsEn}
            onChange={(v) => set('returnsEn', v)}
            multiline
          />
          <Field
            label={lb('Returns (ZH)', '回报说明（中文）')}
            value={data.returnsZh}
            onChange={(v) => set('returnsZh', v)}
            multiline
          />
        </div>
        <ImageField
          label={lb('CCCWA logo', 'CCCWA 标志')}
          value={data.cccwaLogo}
          onChange={(v) => set('cccwaLogo', v)}
          lang={lang}
        />
      </section>

      <section className="admin-card">
        <div className="admin-card-head">
          <h2>{lb('Community photos', '社区图片')}</h2>
        </div>
        {data.communityPhotos.map((p, i) => (
          <div key={i} className="admin-subcard">
            <div className="admin-card-head">
              <h3>
                {zh ? '社区图片' : 'Community photo'} {i + 1}
              </h3>
            </div>
            <ImageField
              label={lb('Image', '图片')}
              value={p.src}
              onChange={(v) => setPhoto('communityPhotos', i, { src: v })}
              lang={lang}
            />
            <div className="admin-grid-2">
              <Field
                label={lb('Alt (EN)', '图片说明（英文）')}
                value={p.altEn}
                onChange={(v) => setPhoto('communityPhotos', i, { altEn: v })}
              />
              <Field
                label={lb('Alt (ZH)', '图片说明（中文）')}
                value={p.altZh}
                onChange={(v) => setPhoto('communityPhotos', i, { altZh: v })}
              />
            </div>
          </div>
        ))}
      </section>
    </>
  )
}
