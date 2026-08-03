/** Resolve media URLs for admin previews (uploads may live on cms branch only). */

const GITHUB_REPO = (import.meta.env.VITE_GITHUB_REPO as string | undefined) || 'Noraliu6161/GlobalLand'
const CMS_BRANCH = (import.meta.env.VITE_CMS_BRANCH as string | undefined) || 'cms'

export function resolveAdminMediaSrc(src: string | undefined | null): string {
  if (!src) return ''
  const s = src.trim()
  if (!s) return ''
  if (/^(data:|blob:|https?:\/\/)/i.test(s)) return s

  // Local Vite serves /public; keep site-relative paths.
  if (import.meta.env.DEV) return s

  // Production admin: files under /images/uploads are written to the cms branch
  // and are often not on the production CDN until Publish — preview via GitHub raw.
  if (s.startsWith('/images/uploads/')) {
    return `https://raw.githubusercontent.com/${GITHUB_REPO}/${CMS_BRANCH}/public${s}`
  }
  return s
}

/** Compress / normalize uploads so iPhone HEIC/huge JPEGs preview reliably. */
export async function prepareImageForUpload(file: File): Promise<{ blob: Blob; filename: string; dataUrl: string }> {
  const hint = `${file.type} ${file.name}`.toLowerCase()
  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap) {
    if (/heic|heif/.test(hint)) {
      throw new Error('HEIC is not supported in this browser. Please export or upload a JPG/PNG.')
    }
    const dataUrl = await readAsDataUrl(file)
    return { blob: file, filename: safeName(file.name, file.type), dataUrl }
  }

  const maxEdge = 2400
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
  const w = Math.max(1, Math.round(bitmap.width * scale))
  const h = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    const dataUrl = await readAsDataUrl(file)
    return { blob: file, filename: safeName(file.name, file.type), dataUrl }
  }
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Encode failed'))),
      'image/jpeg',
      0.85,
    )
  })

  const dataUrl = await readAsDataUrl(blob)
  const base = file.name.replace(/\.[^.]+$/, '') || 'upload'
  return { blob, filename: safeName(`${base}.jpg`, 'image/jpeg'), dataUrl }
}

function safeName(name: string, mime: string) {
  let n = name.replace(/[^a-zA-Z0-9._-]/g, '_')
  if (!/\.(jpe?g|png|webp|gif)$/i.test(n)) {
    if (mime.includes('png')) n += '.png'
    else if (mime.includes('webp')) n += '.webp'
    else n += '.jpg'
  }
  return n
}

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Read failed'))
    reader.readAsDataURL(file)
  })
}
