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
 * sorted by creation year. Matching is case-insensitive.
 */
export function sortProjectsByOrder<T extends OrderableProject>(projects: T[], order: string[] | null | undefined): T[] {
  if (!order?.length) {
    return [...projects].sort(compareByCreatedYear)
  }
  const rank = new Map(order.map((slug, i) => [slug.toLowerCase(), i]))
  return [...projects].sort((a, b) => {
    const ia = rank.has(a.slug.toLowerCase()) ? rank.get(a.slug.toLowerCase())! : Number.POSITIVE_INFINITY
    const ib = rank.has(b.slug.toLowerCase()) ? rank.get(b.slug.toLowerCase())! : Number.POSITIVE_INFINITY
    if (ia !== ib) return ia - ib
    return compareByCreatedYear(a, b)
  })
}

export function buildOrderFromProjects(projects: OrderableProject[]): string[] {
  return [...projects].sort(compareByCreatedYear).map((p) => p.slug)
}
