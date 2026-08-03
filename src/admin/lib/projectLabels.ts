import type { AdminLang } from './i18n'

const typeLabels = {
  en: {
    condo: 'Condo',
    sfh: 'Single-Family',
    townhouse: 'Townhouse',
    office: 'Office',
    mixed: 'Mixed',
  },
  zh: {
    condo: '公寓',
    sfh: '独栋住宅',
    townhouse: '联排别墅',
    office: '办公',
    mixed: '综合',
  },
} as const

const statusLabels = {
  en: {
    completed: 'Completed',
    'in-progress': 'In progress',
    acquired: 'Acquired',
    sold: 'Sold',
  },
  zh: {
    completed: '已完工',
    'in-progress': '进行中',
    acquired: '已收购',
    sold: '已出售',
  },
} as const

export function labelType(type: string, lang: AdminLang): string {
  const map = typeLabels[lang] as Record<string, string>
  return map[type] || type
}

export function labelStatus(status: string, lang: AdminLang): string {
  const map = statusLabels[lang] as Record<string, string>
  return map[status] || status
}

export function typeOptions(lang: AdminLang) {
  return (Object.keys(typeLabels.en) as (keyof typeof typeLabels.en)[]).map((value) => ({
    value,
    label: typeLabels[lang][value],
  }))
}

export function statusOptions(lang: AdminLang) {
  return (Object.keys(statusLabels.en) as (keyof typeof statusLabels.en)[]).map((value) => ({
    value,
    label: statusLabels[lang][value],
  }))
}

export function statusTone(status: string): string {
  switch (status) {
    case 'completed':
      return 'admin-tag--done'
    case 'in-progress':
      return 'admin-tag--progress'
    case 'acquired':
      return 'admin-tag--acquired'
    case 'sold':
      return 'admin-tag--sold'
    default:
      return ''
  }
}
