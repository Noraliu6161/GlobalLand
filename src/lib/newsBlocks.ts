import type { ContentBlock, NewsArticle } from '../data/newsTypes'
import { toHtml } from './newsHtml'

function uid() {
  return `b-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function newTextBlock(textEn = '', textZh = ''): ContentBlock {
  return { id: uid(), type: 'text', textEn, textZh }
}

export function newImageBlock(src = ''): ContentBlock {
  return { id: uid(), type: 'image', src, altEn: '', altZh: '' }
}

export function newGalleryBlock(images: { src: string; altEn?: string; altZh?: string }[] = []): ContentBlock {
  return { id: uid(), type: 'gallery', images: images.length ? images : [{ src: '', altEn: '', altZh: '' }] }
}

/** Strip tags for plain-text preview. */
function stripHtml(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim()
}

function extractImgSrcs(html: string): string[] {
  const out: string[] = []
  const re = /<img[^>]+src=["']([^"']+)["']/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) out.push(m[1])
  return out
}

/** Keep rich text HTML; pull images out into separate blocks. */
function htmlWithoutImages(html: string) {
  return html
    .replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, '')
    .replace(/<img[^>]*>/gi, '')
    .trim()
}

function legacyToBlocks(en: unknown, zh: unknown): ContentBlock[] {
  const blocks: ContentBlock[] = []

  if (Array.isArray(en) || Array.isArray(zh)) {
    const enLines = Array.isArray(en) ? en.map(String) : []
    const zhLines = Array.isArray(zh) ? zh.map(String) : []
    const n = Math.max(enLines.length, zhLines.length)
    if (n === 0) return []
    blocks.push(newTextBlock(toHtml(enLines), toHtml(zhLines)))
    return blocks
  }

  const enStr = typeof en === 'string' ? en : ''
  const zhStr = typeof zh === 'string' ? zh : ''
  if (!enStr && !zhStr) return []

  const imgs = [...new Set([...extractImgSrcs(enStr), ...extractImgSrcs(zhStr)])]
  const textEn = toHtml(htmlWithoutImages(enStr))
  const textZh = toHtml(htmlWithoutImages(zhStr))
  if (textEn || textZh) blocks.push(newTextBlock(textEn, textZh))
  for (const src of imgs) blocks.push(newImageBlock(src))
  return blocks
}

/** Prefer existing blocks; otherwise migrate from legacy EN/ZH body fields. */
export function ensureBlocks(
  blocks: ContentBlock[] | undefined,
  bodyEn?: unknown,
  bodyZh?: unknown,
): ContentBlock[] {
  if (Array.isArray(blocks) && blocks.length > 0) {
    return blocks.map((b) => ({ ...b, id: b.id || uid() }))
  }
  return legacyToBlocks(bodyEn, bodyZh)
}

/** Ensure article has `blocks`; migrate from legacy body fields if needed. */
export function ensureArticleBlocks(article: NewsArticle): NewsArticle {
  return {
    ...article,
    blocks: ensureBlocks(article.blocks, article.bodyEn, article.bodyZh),
  }
}

export function blocksPlainPreview(blocks: ContentBlock[] | undefined, lang: 'en' | 'zh'): string {
  if (!blocks?.length) return ''
  for (const b of blocks) {
    if (b.type === 'text') {
      const t = stripHtml(lang === 'zh' ? b.textZh || b.textEn : b.textEn || b.textZh)
      if (t) return t.slice(0, 160)
    }
  }
  return ''
}
