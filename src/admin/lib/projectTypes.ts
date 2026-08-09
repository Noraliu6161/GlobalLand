import { sortProjectsByOrder } from '../../lib/projectOrder'
import { ensureBlocks } from '../../lib/newsBlocks'
import type { ContentBlock } from '../../data/newsTypes'
import projectOrderBundled from '../../../content/project-order.json'

export type ProjectRecord = {
  id: string
  slug: string
  nameEn: string
  nameZh: string
  cityEn: string
  cityZh: string
  type: string
  status: string
  units: number | null
  buildings: number | null
  saleValueM: number | null
  acquisitionPriceM: number | null
  year: number
  lat: number
  lng: number
  summaryEn: string
  summaryZh: string
  /** @deprecated Migrated into blocks */
  bodyEn: string
  /** @deprecated Migrated into blocks */
  bodyZh: string
  bodyFont: string
  blocks: ContentBlock[]
  highlightsEn: string[]
  highlightsZh: string[]
  /** Cover — synced to images[0] on save */
  image: string
  /** Gallery; first image is the cover */
  images: string[]
  /** External / related URL shown next to project name */
  link?: string
  relatedEntity?: string
  featured: boolean
  published: boolean
}

export function withProjectBlocks(record: ProjectRecord): ProjectRecord {
  return {
    ...record,
    blocks: ensureBlocks(record.blocks, record.bodyEn, record.bodyZh),
  }
}

function bundledOrder(): string[] {
  return Array.isArray(projectOrderBundled) ? (projectOrderBundled as string[]) : []
}

export function normalizeProjectImages(record: Partial<ProjectRecord>): { image: string; images: string[] } {
  const raw = Array.isArray(record.images) ? record.images : []
  const listed = raw
    .map((x) => {
      if (typeof x === 'string') return x.trim()
      if (x && typeof x === 'object' && 'src' in (x as object)) return String((x as { src?: string }).src || '').trim()
      return ''
    })
    .filter(Boolean)
  const cover = (record.image || listed[0] || '').trim()
  let images = listed.length ? listed : cover ? [cover] : []
  if (cover) {
    images = [cover, ...images.filter((src) => src !== cover)]
  }
  return { image: images[0] || '', images }
}

export function emptyProject(): ProjectRecord {
  return {
    id: '',
    slug: '',
    nameEn: '',
    nameZh: '',
    cityEn: '',
    cityZh: '',
    type: 'office',
    status: 'acquired',
    units: null,
    buildings: null,
    saleValueM: null,
    acquisitionPriceM: null,
    year: new Date().getFullYear(),
    lat: 47.6062,
    lng: -122.3321,
    summaryEn: '',
    summaryZh: '',
    bodyEn: '',
    bodyZh: '',
    bodyFont: 'body',
    blocks: [],
    highlightsEn: [],
    highlightsZh: [],
    image: '',
    images: [],
    link: '',
    relatedEntity: '',
    featured: false,
    published: true,
  }
}

export function loadProjectsFromModules(): ProjectRecord[] {
  const modules = import.meta.glob('../../../content/projects/*.json', { eager: true }) as Record<
    string,
    { default: Partial<ProjectRecord> }
  >
  const list = Object.values(modules).map((m) => {
    const merged = { ...emptyProject(), ...m.default }
    const { image, images } = normalizeProjectImages(merged)
    return withProjectBlocks({ ...merged, image, images })
  })
  return sortProjectsByOrder(list, bundledOrder())
}

/** Prefer cms-branch projects on production admin; fall back to build bundle. */
export async function loadProjectsForAdmin(): Promise<ProjectRecord[]> {
  const bundled = loadProjectsFromModules()
  if (import.meta.env.DEV) return bundled

  const { loadContentJson, loadContentJsonDir } = await import('./contentApi')
  const [remote, order] = await Promise.all([
    loadContentJsonDir<Partial<ProjectRecord>>('content/projects'),
    loadContentJson<string[]>('content/project-order.json', bundledOrder()),
  ])
  if (!remote.length) return sortProjectsByOrder(bundled, order)

  const list = remote.map(({ data }) => {
    const merged = { ...emptyProject(), ...data }
    const { image, images } = normalizeProjectImages(merged)
    return withProjectBlocks({ ...merged, image, images })
  })
  return sortProjectsByOrder(list, order)
}
