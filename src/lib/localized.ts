import type { Lang } from '../i18n'

export type LocalizedString = {
  en: string
  zh?: string
}

export type LocalizedList = {
  en: string[]
  zh?: string[]
}

/** Parse Decap/Immutable accidental string dumps: Map { "en": "...", "zh": "..." } */
function parseMapString(raw: string): LocalizedString | null {
  const trimmed = raw.trim()
  if (!trimmed.startsWith('Map {')) return null
  try {
    const jsonish = trimmed.replace(/^Map\s*/, '').replace(/'/g, '"')
    const obj = JSON.parse(jsonish) as Record<string, unknown>
    if (obj && typeof obj === 'object') {
      return {
        en: String(obj.en ?? ''),
        zh: obj.zh != null ? String(obj.zh) : undefined,
      }
    }
  } catch {
    // fall through
  }
  // Regex fallback for Map { "en": "a", "zh": "b" }
  const en = trimmed.match(/"en"\s*:\s*"((?:\\.|[^"\\])*)"/)?.[1]
  const zh = trimmed.match(/"zh"\s*:\s*"((?:\\.|[^"\\])*)"/)?.[1]
  if (en != null || zh != null) {
    return {
      en: (en ?? zh ?? '').replace(/\\"/g, '"'),
      zh: zh != null ? zh.replace(/\\"/g, '"') : undefined,
    }
  }
  return null
}

export function coerceLocalized(
  value: unknown,
  fallback = '',
): LocalizedString {
  if (value == null) return { en: fallback, zh: fallback }
  if (typeof value === 'string') {
    const parsed = parseMapString(value)
    if (parsed) {
      return {
        en: parsed.en || fallback,
        zh: parsed.zh || parsed.en || fallback,
      }
    }
    return { en: value || fallback, zh: value || fallback }
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    // Flat CMS fields sometimes arrive nested under nameEn already unwrapped
    const en = obj.en != null ? String(obj.en) : ''
    const zh = obj.zh != null ? String(obj.zh) : ''
    return {
      en: en || fallback,
      zh: zh || en || fallback,
    }
  }
  return { en: fallback, zh: fallback }
}

/** Accept CMS bilingual objects, flat strings, or legacy Map dumps. */
export function pickText(
  value: LocalizedString | string | undefined | null,
  lang: Lang,
  fallback = '',
): string {
  const loc = coerceLocalized(value, fallback)
  const primary = lang === 'zh' ? loc.zh : loc.en
  return (primary || loc.en || loc.zh || fallback).trim() || fallback
}

export function pickList(
  value: LocalizedList | string[] | undefined | null,
  lang: Lang,
): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value
  const primary = lang === 'zh' ? value.zh : value.en
  if (primary?.length) return primary
  return value.en ?? value.zh ?? []
}

/** Stable English city key for filters / charts. */
export function cityKey(city: LocalizedString | string): string {
  return pickText(city, 'en')
}
