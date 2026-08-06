import { pickText, type LocalizedString } from './localized'
import type { Lang } from '../i18n'
import type { HeroSlide } from '../components/heroSlides'

export type HomeContent = {
  heroEyebrow: LocalizedString
  foundedYear: number
  copyrightYear: number
  brandLeft: LocalizedString
  brandRight: LocalizedString
  heroLead: LocalizedString
  heroCtaProjects: LocalizedString
  heroCtaProjectsHref: string
  heroCtaAbout: LocalizedString
  heroCtaAboutHref: string
  heroSlides: Array<{ src: string; alt: LocalizedString }>
  whoEyebrow: LocalizedString
  whoTitle: LocalizedString
  whoLead: LocalizedString
  vision: LocalizedString
  statListingsValue: string
  statListingsLabel: LocalizedString
  statSalesValue: string
  statSalesLabel: LocalizedString
  statCitiesValue: string
  statCitiesLabel: LocalizedString
  statNote: LocalizedString
  spotlightImage: string
  spotlightAlt: LocalizedString
  spotlightEyebrow: LocalizedString
  spotlightTitle: LocalizedString
  spotlightBody: LocalizedString
  spotlightCta: LocalizedString
  spotlightCtaHref: string
  selectedTitle: LocalizedString
  allProjects: LocalizedString
  allProjectsHref: string
  discoverMore: LocalizedString
  featuredCount: number
  newsTitle: LocalizedString
  newsAll: LocalizedString
  newsAllHref: string
  newsRead: LocalizedString
  newsCount: number
}

type RawHome = {
  heroEyebrowEn?: string
  heroEyebrowZh?: string
  foundedYear?: number
  copyrightYear?: number
  brandLeftEn?: string
  brandLeftZh?: string
  brandRightEn?: string
  brandRightZh?: string
  heroLeadEn?: string
  heroLeadZh?: string
  heroCtaProjectsEn?: string
  heroCtaProjectsZh?: string
  heroCtaProjectsHref?: string
  heroCtaAboutEn?: string
  heroCtaAboutZh?: string
  heroCtaAboutHref?: string
  heroSlides?: Array<{ src?: string; altEn?: string; altZh?: string }>
  whoEyebrowEn?: string
  whoEyebrowZh?: string
  whoTitleEn?: string
  whoTitleZh?: string
  whoLeadEn?: string
  whoLeadZh?: string
  visionEn?: string
  visionZh?: string
  statListingsValue?: string
  statListingsLabelEn?: string
  statListingsLabelZh?: string
  statSalesValue?: string
  statSalesLabelEn?: string
  statSalesLabelZh?: string
  statCitiesValue?: string
  statCitiesLabelEn?: string
  statCitiesLabelZh?: string
  statNoteEn?: string
  statNoteZh?: string
  spotlightImage?: string
  spotlightAltEn?: string
  spotlightAltZh?: string
  spotlightEyebrowEn?: string
  spotlightEyebrowZh?: string
  spotlightTitleEn?: string
  spotlightTitleZh?: string
  spotlightBodyEn?: string
  spotlightBodyZh?: string
  spotlightCtaEn?: string
  spotlightCtaZh?: string
  spotlightCtaHref?: string
  selectedTitleEn?: string
  selectedTitleZh?: string
  allProjectsEn?: string
  allProjectsZh?: string
  allProjectsHref?: string
  discoverMoreEn?: string
  discoverMoreZh?: string
  featuredCount?: number
  newsTitleEn?: string
  newsTitleZh?: string
  newsAllEn?: string
  newsAllZh?: string
  newsAllHref?: string
  newsReadEn?: string
  newsReadZh?: string
  newsCount?: number
}

function L(en?: string, zh?: string, fallback = ''): LocalizedString {
  const e = (en ?? '').trim() || (zh ?? '').trim() || fallback
  const z = (zh ?? '').trim() || e
  return { en: e, zh: z }
}

function normalize(raw: RawHome): HomeContent {
  const slides = (raw.heroSlides ?? [])
    .filter((s) => s?.src)
    .map((s) => ({
      src: String(s.src),
      alt: L(s.altEn, s.altZh, 'Homepage slide'),
    }))

  return {
    heroEyebrow: L(raw.heroEyebrowEn, raw.heroEyebrowZh, 'Est. 2018 · Seattle'),
    foundedYear: Number(raw.foundedYear) || 2018,
    copyrightYear: Number(raw.copyrightYear) || new Date().getFullYear(),
    brandLeft: L(raw.brandLeftEn, raw.brandLeftZh, 'Global'),
    brandRight: L(raw.brandRightEn, raw.brandRightZh, 'Land'),
    heroLead: L(raw.heroLeadEn, raw.heroLeadZh),
    heroCtaProjects: L(raw.heroCtaProjectsEn, raw.heroCtaProjectsZh, 'View projects'),
    heroCtaProjectsHref: raw.heroCtaProjectsHref || '/projects',
    heroCtaAbout: L(raw.heroCtaAboutEn, raw.heroCtaAboutZh, 'Our story'),
    heroCtaAboutHref: raw.heroCtaAboutHref || '/about',
    heroSlides: slides,
    whoEyebrow: L(raw.whoEyebrowEn, raw.whoEyebrowZh),
    whoTitle: L(raw.whoTitleEn, raw.whoTitleZh),
    whoLead: L(raw.whoLeadEn, raw.whoLeadZh),
    vision: L(raw.visionEn, raw.visionZh),
    statListingsValue: (raw.statListingsValue ?? '').trim(),
    statListingsLabel: L(raw.statListingsLabelEn, raw.statListingsLabelZh),
    statSalesValue: (raw.statSalesValue ?? '').trim() || '$70M+',
    statSalesLabel: L(raw.statSalesLabelEn, raw.statSalesLabelZh),
    statCitiesValue: (raw.statCitiesValue ?? '').trim() || '8',
    statCitiesLabel: L(raw.statCitiesLabelEn, raw.statCitiesLabelZh),
    statNote: L(raw.statNoteEn, raw.statNoteZh),
    spotlightImage: raw.spotlightImage || '/images/projects/spring-district.png',
    spotlightAlt: L(raw.spotlightAltEn, raw.spotlightAltZh),
    spotlightEyebrow: L(raw.spotlightEyebrowEn, raw.spotlightEyebrowZh),
    spotlightTitle: L(raw.spotlightTitleEn, raw.spotlightTitleZh),
    spotlightBody: L(raw.spotlightBodyEn, raw.spotlightBodyZh),
    spotlightCta: L(raw.spotlightCtaEn, raw.spotlightCtaZh),
    spotlightCtaHref: raw.spotlightCtaHref || '/projects?type=office',
    selectedTitle: L(raw.selectedTitleEn, raw.selectedTitleZh),
    allProjects: L(raw.allProjectsEn, raw.allProjectsZh),
    allProjectsHref: raw.allProjectsHref || '/projects',
    discoverMore: L(raw.discoverMoreEn, raw.discoverMoreZh, 'Discover more'),
    featuredCount: Math.max(1, Number(raw.featuredCount) || 3),
    newsTitle: L(raw.newsTitleEn, raw.newsTitleZh, 'News'),
    newsAll: L(raw.newsAllEn, raw.newsAllZh, 'All news'),
    newsAllHref: raw.newsAllHref || '/news',
    newsRead: L(raw.newsReadEn, raw.newsReadZh, 'Read more'),
    newsCount: Math.max(1, Number(raw.newsCount) || 3),
  }
}

import homeJson from '../../content/home.json'

export const homeContent: HomeContent = normalize(homeJson as RawHome)

export function homeText(field: LocalizedString, lang: Lang): string {
  return pickText(field, lang)
}

export function homeHeroSlidesForLang(lang: Lang): HeroSlide[] {
  return homeContent.heroSlides.map((s) => ({
    src: s.src,
    alt: pickText(s.alt, lang),
  }))
}

export function fillYear(template: string, year: number): string {
  return template.replace(/\{year\}/g, String(year))
}
