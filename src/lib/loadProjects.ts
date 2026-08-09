import type { Project, ProjectType, ProjectStatus } from '../data/projects'
import type { ContentBlock } from '../data/newsTypes'
import { coerceLocalized, type LocalizedList, type LocalizedString } from './localized'
import { ensureBlocks } from './newsBlocks'
import { sortProjectsByOrder } from './projectOrder'

type ContentProject = {
  id?: string
  slug: string
  // Flat bilingual (preferred — Decap-safe)
  nameEn?: string
  nameZh?: string
  cityEn?: string
  cityZh?: string
  summaryEn?: string
  summaryZh?: string
  bodyEn?: string
  bodyZh?: string
  blocks?: ContentBlock[]
  highlightsEn?: string[]
  highlightsZh?: string[]
  // Legacy nested / broken Map-string forms
  name?: LocalizedString | string
  city?: LocalizedString | string
  summary?: LocalizedString | string
  body?: LocalizedString | string
  highlights?: LocalizedList | string[]
  type: ProjectType
  status: ProjectStatus
  units?: number | null
  buildings?: number | null
  saleValueM?: number | null
  acquisitionPriceM?: number | null
  year: number
  lat: number
  lng: number
  bodyFont?: Project['bodyFont']
  image?: string
  images?: string[] | { src?: string; image?: string }[]
  link?: string
  relatedEntity?: string
  featured?: boolean
  published?: boolean
}

const modules = import.meta.glob('../../content/projects/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, ContentProject>

const orderModules = import.meta.glob('../../content/project-order.json', {
  eager: true,
  import: 'default',
}) as Record<string, string[]>

function loadBundledOrder(): string[] {
  const first = Object.values(orderModules)[0]
  return Array.isArray(first) ? first.filter((s) => typeof s === 'string') : []
}

function fromFlatOrLegacy(
  en: string | undefined,
  zh: string | undefined,
  legacy: unknown,
  fallback = '',
): LocalizedString {
  if (en != null || zh != null) {
    return {
      en: en || zh || fallback,
      zh: zh || en || fallback,
    }
  }
  return coerceLocalized(legacy, fallback)
}

function listFromFlatOrLegacy(
  en: string[] | undefined,
  zh: string[] | undefined,
  legacy: LocalizedList | string[] | undefined,
): LocalizedList {
  if (en || zh) {
    return { en: en ?? [], zh: zh ?? en ?? [] }
  }
  if (!legacy) return { en: [], zh: [] }
  if (Array.isArray(legacy)) return { en: legacy, zh: legacy }
  return {
    en: legacy.en ?? [],
    zh: legacy.zh ?? legacy.en ?? [],
  }
}

function coerceImageEntry(x: unknown): string {
  if (typeof x === 'string') return x.trim()
  if (x && typeof x === 'object') {
    const o = x as Record<string, unknown>
    for (const key of ['src', 'image', 'url'] as const) {
      if (typeof o[key] === 'string') return String(o[key]).trim()
    }
  }
  return ''
}

function normalizeImages(doc: ContentProject): { image: string; images: string[] } {
  const listed = Array.isArray(doc.images) ? doc.images.map(coerceImageEntry).filter(Boolean) : []
  const cover = (doc.image || listed[0] || '').trim()
  let images = listed.length ? listed : cover ? [cover] : []
  if (cover) {
    images = [cover, ...images.filter((src) => src !== cover)]
  }
  return { image: images[0] || '', images }
}

function normalize(doc: ContentProject): Project {
  const slug = doc.slug || doc.id || 'project'
  const { image, images } = normalizeImages(doc)
  return {
    id: doc.id || slug,
    slug,
    name: fromFlatOrLegacy(doc.nameEn, doc.nameZh, doc.name, slug),
    city: fromFlatOrLegacy(doc.cityEn, doc.cityZh, doc.city),
    type: doc.type,
    status: doc.status,
    units: doc.units ?? null,
    buildings: doc.buildings ?? null,
    saleValueM: doc.saleValueM ?? null,
    acquisitionPriceM: doc.acquisitionPriceM ?? null,
    year: doc.year,
    lat: doc.lat,
    lng: doc.lng,
    summary: fromFlatOrLegacy(doc.summaryEn, doc.summaryZh, doc.summary),
    body: fromFlatOrLegacy(doc.bodyEn, doc.bodyZh, doc.body),
    bodyFont: doc.bodyFont || 'body',
    blocks: ensureBlocks(doc.blocks, doc.bodyEn, doc.bodyZh),
    highlights: listFromFlatOrLegacy(doc.highlightsEn, doc.highlightsZh, doc.highlights),
    image,
    images,
    link: doc.link || '',
    relatedEntity: doc.relatedEntity,
    featured: Boolean(doc.featured),
  }
}

export type ProjectsSource = 'cms' | 'empty'

export function loadProjects(): {
  projects: Project[]
  source: ProjectsSource
} {
  const projects = sortProjectsByOrder(
    Object.values(modules)
      .filter((doc) => doc && doc.published !== false)
      .map(normalize),
    loadBundledOrder(),
  )

  return {
    projects,
    source: projects.length ? 'cms' : 'empty',
  }
}
