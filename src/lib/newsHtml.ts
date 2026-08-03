/** Normalize legacy string[] bodies / event details into HTML for rich text. */

function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function toHtml(value: string | string[] | undefined | null): string {
  if (value == null || value === '') return ''
  if (Array.isArray(value)) {
    return value
      .filter((line) => String(line).trim())
      .map((line) => `<p>${escapeHtml(String(line))}</p>`)
      .join('')
  }
  const s = String(value)
  // Already HTML
  if (/<[a-z][\s\S]*>/i.test(s)) return s
  // Plain text → paragraphs
  return s
    .split(/\n+/)
    .filter((line) => line.trim())
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join('')
}

export function labelsFromDate(iso: string): {
  date: string
  dateLabelEn: string
  dateLabelZh: string
  archiveYear: number
  archiveMonth: number
} {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (!m) {
    return {
      date: iso,
      dateLabelEn: iso,
      dateLabelZh: iso,
      archiveYear: new Date().getFullYear(),
      archiveMonth: new Date().getMonth() + 1,
    }
  }
  const year = Number(m[1])
  const month = Number(m[2])
  const day = Number(m[3])
  const d = new Date(Date.UTC(year, month - 1, day))
  return {
    date: iso,
    dateLabelEn: d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    }),
    dateLabelZh: `${year}年${month}月${day}日`,
    archiveYear: year,
    archiveMonth: month,
  }
}
