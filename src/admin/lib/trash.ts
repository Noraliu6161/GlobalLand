import type { NewsArticle } from '../../data/news'
import type { ProjectRecord } from './projectTypes'

export type TrashKind = 'project' | 'news'

export type TrashItem = {
  kind: TrashKind
  id: string
  trashedAt: string
  titleEn: string
  titleZh: string
  originalPath: string
  payload: unknown
}

export function trashFilePath(kind: TrashKind, id: string) {
  const safe = id.replace(/[^a-zA-Z0-9._-]/g, '_') || 'item'
  return `content/trash/${kind}/${safe}.json`
}

export function makeProjectTrashItem(project: ProjectRecord): TrashItem {
  const id = project.slug || project.id
  return {
    kind: 'project',
    id,
    trashedAt: new Date().toISOString(),
    titleEn: project.nameEn || id,
    titleZh: project.nameZh || project.nameEn || id,
    originalPath: `content/projects/${id}.json`,
    payload: project,
  }
}

export function makeNewsTrashItem(article: NewsArticle): TrashItem {
  const id = article.id || article.slug
  return {
    kind: 'news',
    id,
    trashedAt: new Date().toISOString(),
    titleEn: article.titleEn || id,
    titleZh: article.titleZh || article.titleEn || id,
    originalPath: 'content/news.json',
    payload: article,
  }
}

export function loadTrashItems(): TrashItem[] {
  const modules = import.meta.glob('../../../content/trash/**/*.json', { eager: true }) as Record<
    string,
    { default: Partial<TrashItem> }
  >
  return Object.entries(modules)
    .filter(([path]) => !path.endsWith('.gitkeep'))
    .map(([path, mod]) => {
      const raw = mod.default || {}
      const kind = (raw.kind === 'news' ? 'news' : 'project') as TrashKind
      const id = raw.id || path.split('/').pop()?.replace(/\.json$/, '') || 'item'
      return {
        kind,
        id,
        trashedAt: raw.trashedAt || '',
        titleEn: raw.titleEn || id,
        titleZh: raw.titleZh || raw.titleEn || id,
        originalPath: raw.originalPath || '',
        payload: raw.payload ?? raw,
      } satisfies TrashItem
    })
    .sort((a, b) => (b.trashedAt || '').localeCompare(a.trashedAt || ''))
}

function normalizeTrash(raw: Partial<TrashItem>, fallbackId: string): TrashItem {
  const kind = (raw.kind === 'news' ? 'news' : 'project') as TrashKind
  const id = raw.id || fallbackId
  return {
    kind,
    id,
    trashedAt: raw.trashedAt || '',
    titleEn: raw.titleEn || id,
    titleZh: raw.titleZh || raw.titleEn || id,
    originalPath: raw.originalPath || '',
    payload: raw.payload ?? raw,
  }
}

/** Prefer cms-branch trash on production admin. */
export async function loadTrashItemsForAdmin(): Promise<TrashItem[]> {
  const bundled = loadTrashItems()
  if (import.meta.env.DEV) return bundled

  const { loadContentJsonDir } = await import('./contentApi')
  const [projects, news] = await Promise.all([
    loadContentJsonDir<Partial<TrashItem>>('content/trash/project'),
    loadContentJsonDir<Partial<TrashItem>>('content/trash/news'),
  ])
  const remote = [...projects, ...news].map(({ path, data }) =>
    normalizeTrash(data, path.split('/').pop()?.replace(/\.json$/, '') || 'item'),
  )
  if (!remote.length) return bundled
  return remote.sort((a, b) => (b.trashedAt || '').localeCompare(a.trashedAt || ''))
}
