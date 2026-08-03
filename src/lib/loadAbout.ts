import aboutRaw from '../../content/about.json'

export type AboutPhoto = { src: string; altEn: string; altZh: string }

export type AboutContent = {
  eyebrowEn: string
  eyebrowZh: string
  titleEn: string
  titleZh: string
  introEn: string
  introZh: string
  visionEn: string
  visionZh: string
  teamEn: string
  teamZh: string
  communityEyebrowEn: string
  communityEyebrowZh: string
  communityTitleEn: string
  communityTitleZh: string
  communityEn: string
  communityZh: string
  returnsEn: string
  returnsZh: string
  cccwaLogo: string
  teamPhotos: AboutPhoto[]
  communityPhotos: AboutPhoto[]
}

export const aboutContent = aboutRaw as AboutContent

export function aboutText(
  en: string,
  zh: string,
  lang: 'en' | 'zh',
  vars?: Record<string, string | number>,
) {
  let s = lang === 'zh' ? zh || en : en
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
    }
  }
  return s
}
