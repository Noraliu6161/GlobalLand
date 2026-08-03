import type { ContentBlock, NewsArticle, NewsKind } from './newsTypes'
import raw from '../../content/news.json'

export type { ContentBlock, NewsArticle, NewsKind }

export const newsArticles = raw as NewsArticle[]

export function getNewsBySlug(slug: string) {
  return newsArticles.find((a) => a.slug === slug)
}

/** Prefer active language; fall back to the other so a single-language article still shows. */
export function newsTitle(a: Pick<NewsArticle, 'titleEn' | 'titleZh'>, lang: 'en' | 'zh') {
  return lang === 'zh' ? a.titleZh || a.titleEn : a.titleEn || a.titleZh
}

export function newsSummary(a: Pick<NewsArticle, 'summaryEn' | 'summaryZh'>, lang: 'en' | 'zh') {
  return lang === 'zh' ? a.summaryZh || a.summaryEn : a.summaryEn || a.summaryZh
}

export function newsDateLabel(a: Pick<NewsArticle, 'dateLabelEn' | 'dateLabelZh'>, lang: 'en' | 'zh') {
  return lang === 'zh' ? a.dateLabelZh || a.dateLabelEn : a.dateLabelEn || a.dateLabelZh
}

export function newsArchives(articles: NewsArticle[]) {
  const map = new Map<number, Set<number>>()
  for (const a of articles) {
    if (!map.has(a.archiveYear)) map.set(a.archiveYear, new Set())
    map.get(a.archiveYear)!.add(a.archiveMonth)
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([year, months]) => ({
      year,
      months: Array.from(months).sort((a, b) => b - a),
    }))
}

const MONTH_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_ZH = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

export function monthLabel(month: number, lang: 'en' | 'zh') {
  return lang === 'zh' ? MONTH_ZH[month - 1] : MONTH_EN[month - 1]
}
