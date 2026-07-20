import type { Project, ProjectType, ProjectStatus } from '../data/projects'
import { coerceLocalized, type LocalizedList, type LocalizedString } from './localized'

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
  image: string
  relatedEntity?: string
  featured?: boolean
  published?: boolean
}

const modules = import.meta.glob('../../content/projects/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, ContentProject>

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

function normalize(doc: ContentProject): Project {
  const slug = doc.slug || doc.id || 'project'
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
    highlights: listFromFlatOrLegacy(doc.highlightsEn, doc.highlightsZh, doc.highlights),
    image: doc.image,
    relatedEntity: doc.relatedEntity,
    featured: Boolean(doc.featured),
  }
}

export type ProjectsSource = 'cms' | 'empty'

export function loadProjects(): {
  projects: Project[]
  source: ProjectsSource
} {
  const projects = Object.values(modules)
    .filter((doc) => doc && doc.published !== false)
    .map(normalize)
    .sort((a, b) => b.year - a.year || a.name.en.localeCompare(b.name.en))

  return {
    projects,
    source: projects.length ? 'cms' : 'empty',
  }
}
