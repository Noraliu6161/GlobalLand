export type NewsKind = 'news' | 'event'

export type ContentBlock =
  | {
      id: string
      type: 'text'
      textEn: string
      textZh: string
    }
  | {
      id: string
      type: 'image'
      src: string
      altEn?: string
      altZh?: string
    }
  | {
      id: string
      type: 'gallery'
      images: { src: string; altEn?: string; altZh?: string }[]
    }

export type NewsArticle = {
  id: string
  slug: string
  kind: NewsKind
  date: string
  dateLabelEn: string
  dateLabelZh: string
  titleEn: string
  titleZh: string
  summaryEn: string
  summaryZh: string
  /** Preferred article body: ordered text / image / gallery blocks */
  blocks?: ContentBlock[]
  /** @deprecated Migrated into blocks on load */
  bodyEn?: string | string[]
  /** @deprecated Migrated into blocks on load */
  bodyZh?: string | string[]
  /** Optional cover image shown on list + detail */
  image?: string
  eventDetailsEn?: string | string[]
  eventDetailsZh?: string | string[]
  bannerTitleZh?: string
  bannerSubZh?: string
  /** Event-only: Register button URL (blank → /contact) */
  registerUrl?: string
  archiveYear: number
  archiveMonth: number
}
