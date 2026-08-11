/** Shared project ordering: manual order file, else created year (newest first). */

export type OrderableProject = {
  slug: string
  year: number
  nameEn?: string
  name?: { en?: string }
}

export function projectDisplayName(p: OrderableProject) {
  return p.nameEn || p.name?.en || p.slug
}

/** Default: creation year descending, then name. */
export function compareByCreatedYear(a: OrderableProject, b: OrderableProject) {
  if (a.year !== b.year) return b.year - a.year
  return projectDisplayName(a).localeCompare(projectDisplayName(b))
}

/**
 * Apply saved slug order when present. Unknown slugs fall to the end,
 * sorted by creation year.
 *
 * Exact slug match is preferred so “Bellevue” and “bellevue” stay distinct.
 * Case-insensitive match is only a fallback for typos / legacy casing.
 */
export function sortProjectsByOrder<T extends OrderableProject>(projects: T[], order: string[] | null | undefined): T[] {
  if (!order?.length) {
    return [...projects].sort(compareByCreatedYear)
  }
  const exactRank = new Map(order.map((slug, i) => [slug, i]))
  const lowerRank = new Map<string, number>()
  order.forEach((slug, i) => {
    const key = slug.toLowerCase()
    if (!lowerRank.has(key)) lowerRank.set(key, i)
  })
  const rankOf = (slug: string) => {
    if (exactRank.has(slug)) return exactRank.get(slug)!
    const lower = slug.toLowerCase()
    if (lowerRank.has(lower)) return lowerRank.get(lower)!
    return Number.POSITIVE_INFINITY
  }
  return [...projects].sort((a, b) => {
    const ia = rankOf(a.slug)
    const ib = rankOf(b.slug)
    if (ia !== ib) return ia - ib
    return compareByCreatedYear(a, b)
  })
}

export function buildOrderFromProjects(projects: OrderableProject[]): string[] {
  return [...projects].sort(compareByCreatedYear).map((p) => p.slug)
}
