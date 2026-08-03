/** Save / delete / upload content for admin CMS. */

import type { TrashItem } from './trash'
import { trashFilePath } from './trash'

export type SaveResult =
  | { ok: true; message?: string; path?: string; previewUrl?: string }
  | { ok: false; error: string }

function b64EncodeUnicode(str: string) {
  return btoa(unescape(encodeURIComponent(str)))
}

async function identityToken(): Promise<string | null> {
  const user = window.netlifyIdentity?.currentUser?.()
  if (!user) return null
  return user.jwt()
}

async function saveLocal(path: string, data: unknown): Promise<SaveResult> {
  const res = await fetch('/api/cms/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, data }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) return { ok: false, error: json.error || res.statusText }
  return { ok: true, message: json.message }
}

async function deleteLocal(path: string): Promise<SaveResult> {
  const res = await fetch('/api/cms/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) return { ok: false, error: json.error || res.statusText }
  return { ok: true, message: json.message }
}

async function saveGitGateway(path: string, data: unknown, token: string): Promise<SaveResult> {
  const branch = 'cms'
  const api = `/.netlify/git/github/contents/${path}?ref=${branch}`
  const getRes = await fetch(api, { headers: { Authorization: `Bearer ${token}` } })
  let sha: string | undefined
  if (getRes.ok) {
    const existing = await getRes.json()
    sha = existing.sha
  } else if (getRes.status !== 404) {
    return { ok: false, error: `Could not read ${path}` }
  }

  const body = JSON.stringify(data, null, 2) + '\n'
  const putRes = await fetch(`/.netlify/git/github/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `cms: update ${path}`,
      content: b64EncodeUnicode(body),
      branch,
      ...(sha ? { sha } : {}),
    }),
  })
  if (!putRes.ok) return { ok: false, error: (await putRes.text()) || putRes.statusText }
  return { ok: true, message: 'Saved to cms branch' }
}

async function deleteGitGateway(path: string, token: string): Promise<SaveResult> {
  const branch = 'cms'
  const getRes = await fetch(`/.netlify/git/github/contents/${path}?ref=${branch}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (getRes.status === 404) return { ok: true, message: 'Already gone' }
  if (!getRes.ok) return { ok: false, error: 'Could not read file to delete' }
  const existing = await getRes.json()
  const delRes = await fetch(`/.netlify/git/github/contents/${path}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `cms: delete ${path}`,
      sha: existing.sha,
      branch,
    }),
  })
  if (!delRes.ok) return { ok: false, error: (await delRes.text()) || delRes.statusText }
  return { ok: true, message: 'Deleted on cms branch' }
}

export async function saveContentFile(path: string, data: unknown): Promise<SaveResult> {
  const token = await identityToken()
  if (import.meta.env.DEV) {
    const local = await saveLocal(path, data)
    if (local.ok) return local
  }
  if (!token) {
    return { ok: false, error: 'Sign in with Netlify Identity to save (or run npm run dev).' }
  }
  return saveGitGateway(path, data, token)
}

export async function deleteContentFile(path: string): Promise<SaveResult> {
  const token = await identityToken()
  if (import.meta.env.DEV) {
    const local = await deleteLocal(path)
    if (local.ok) return local
  }
  if (!token) return { ok: false, error: 'Sign in required to delete.' }
  return deleteGitGateway(path, token)
}

/** Soft-delete: write trash entry, then remove original file when applicable. */
export async function moveToTrash(item: TrashItem, options?: { deleteOriginal?: boolean }): Promise<SaveResult> {
  const path = trashFilePath(item.kind, item.id)
  const saved = await saveContentFile(path, item)
  if (!saved.ok) return saved
  if (options?.deleteOriginal !== false && item.kind === 'project' && item.originalPath) {
    const removed = await deleteContentFile(item.originalPath)
    if (!removed.ok) return removed
  }
  return { ok: true, message: 'Moved to trash', path }
}

export async function restoreTrashItem(item: TrashItem): Promise<SaveResult> {
  if (item.kind === 'project') {
    const project = item.payload as { slug?: string; id?: string; published?: boolean }
    const slug = project.slug || project.id || item.id
    const payload = { ...project, published: true, slug, id: project.id || slug }
    const restored = await saveContentFile(`content/projects/${slug}.json`, payload)
    if (!restored.ok) return restored
    return deleteContentFile(trashFilePath('project', item.id))
  }

  // News restore is handled by the caller (needs full news.json merge).
  return { ok: false, error: 'Use restoreNewsTrashItem for news items' }
}

export async function purgeTrashItem(item: TrashItem): Promise<SaveResult> {
  return deleteContentFile(trashFilePath(item.kind, item.id))
}

export async function uploadImage(file: File): Promise<SaveResult> {
  const { prepareImageForUpload } = await import('./mediaUrl')
  let prepared: { filename: string; dataUrl: string }
  try {
    prepared = await prepareImageForUpload(file)
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not read image. Try a JPG or PNG.' }
  }
  const { filename, dataUrl } = prepared

  if (import.meta.env.DEV) {
    const res = await fetch('/api/cms/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, dataUrl }),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) return { ok: false, error: json.error || res.statusText }
    const path = json.path as string
    // Cache-bust so the new public file shows immediately in <img>
    return { ok: true, path, previewUrl: `${path}?v=${Date.now()}`, message: 'Uploaded' }
  }

  const token = await identityToken()
  if (!token) return { ok: false, error: 'Sign in to upload images.' }

  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!m) return { ok: false, error: 'Invalid image data' }
  const safe = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const gitPath = `public/images/uploads/${safe}`
  const putRes = await fetch(`/.netlify/git/github/contents/${gitPath}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `cms: upload ${safe}`,
      content: m[2],
      branch: 'cms',
    }),
  })
  if (!putRes.ok) return { ok: false, error: (await putRes.text()) || putRes.statusText }
  const putJson = (await putRes.json().catch(() => ({}))) as {
    content?: { download_url?: string }
  }
  const path = `/images/uploads/${safe}`
  return {
    ok: true,
    path,
    previewUrl: putJson.content?.download_url || dataUrl,
    message: 'Uploaded to cms branch',
  }
}

export async function listMedia(): Promise<string[]> {
  if (import.meta.env.DEV) {
    const res = await fetch('/api/cms/media')
    if (!res.ok) return []
    const json = await res.json()
    return (json.files as string[]) || []
  }
  return []
}

export async function callCmsFunction(
  name: 'preview-cms' | 'publish-cms',
): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  const identity = window.netlifyIdentity
  const user = identity?.currentUser?.()
  if (!user) return { ok: false, data: { error: 'Login required' } }
  const token = await user.jwt()
  const res = await fetch(`/.netlify/functions/${name}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: '{}',
  })
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  return { ok: res.ok, data }
}

declare global {
  interface Window {
    netlifyIdentity?: {
      currentUser: () => {
        email?: string
        jwt: () => Promise<string>
      } | null
      on: (event: string, cb: (user?: unknown) => void) => void
      open: (tab?: string) => void
      logout: () => void
      init: () => void
    }
  }
}
