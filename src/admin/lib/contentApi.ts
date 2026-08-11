/** Save / delete / upload content for admin CMS. */

import type { TrashItem } from './trash'
import { trashFilePath } from './trash'

export type SaveResult =
  | { ok: true; message?: string; path?: string; previewUrl?: string }
  | { ok: false; error: string }

const CMS_BRANCH = 'cms'

function b64EncodeUnicode(str: string) {
  return btoa(unescape(encodeURIComponent(str)))
}

function b64DecodeUnicode(b64: string) {
  return decodeURIComponent(escape(atob(b64.replace(/\n/g, ''))))
}

function formatGitError(raw: string, fallback: string): string {
  const text = (raw || '').trim()
  if (!text) return fallback
  try {
    const json = JSON.parse(text) as { message?: string; status?: number }
    if (json.message) {
      if (String(json.status) === '409' || /does not match/i.test(json.message)) {
        return 'Content was updated elsewhere. Please reload the page and try again.'
      }
      return json.message
    }
  } catch {
    /* plain text */
  }
  return text.slice(0, 400)
}

async function identityToken(): Promise<string | null> {
  const user = window.netlifyIdentity?.currentUser?.()
  if (!user) return null
  return user.jwt()
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
  }
}

type GitFile = { sha: string; content?: string; encoding?: string }

async function getGitFile(path: string, token: string): Promise<GitFile | null> {
  const api = `/.netlify/git/github/contents/${path}?ref=${CMS_BRANCH}&ts=${Date.now()}`
  const getRes = await fetch(api, {
    headers: authHeaders(token),
    cache: 'no-store',
  })
  if (getRes.status === 404) return null
  if (!getRes.ok) {
    throw new Error(formatGitError(await getRes.text(), `Could not read ${path}`))
  }
  const existing = (await getRes.json()) as GitFile | GitFile[]
  if (Array.isArray(existing)) {
    throw new Error(`${path} is a directory, expected a file`)
  }
  return existing
}

async function putGitFile(path: string, data: unknown, token: string, sha?: string): Promise<Response> {
  const body = JSON.stringify(data, null, 2) + '\n'
  return fetch(`/.netlify/git/github/contents/${path}`, {
    method: 'PUT',
    headers: {
      ...authHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `cms: update ${path}`,
      content: b64EncodeUnicode(body),
      branch: CMS_BRANCH,
      ...(sha ? { sha } : {}),
    }),
  })
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
  let lastError = 'Save failed'
  for (let attempt = 0; attempt < 3; attempt++) {
    let sha: string | undefined
    try {
      const existing = await getGitFile(path, token)
      sha = existing?.sha
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) }
    }

    const putRes = await putGitFile(path, data, token, sha)
    if (putRes.ok) return { ok: true, message: 'Saved to cms branch' }

    const raw = await putRes.text()
    lastError = formatGitError(raw, putRes.statusText)
    // Retry only on SHA conflicts (stale read / concurrent edit)
    if (putRes.status !== 409) return { ok: false, error: lastError }
  }
  return { ok: false, error: lastError }
}

async function deleteGitGateway(path: string, token: string): Promise<SaveResult> {
  let lastError = 'Delete failed'
  for (let attempt = 0; attempt < 3; attempt++) {
    let existing: GitFile | null
    try {
      existing = await getGitFile(path, token)
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) }
    }
    if (!existing) return { ok: true, message: 'Already gone' }

    const delRes = await fetch(`/.netlify/git/github/contents/${path}`, {
      method: 'DELETE',
      headers: {
        ...authHeaders(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `cms: delete ${path}`,
        sha: existing.sha,
        branch: CMS_BRANCH,
      }),
    })
    if (delRes.ok) return { ok: true, message: 'Deleted on cms branch' }
    const raw = await delRes.text()
    lastError = formatGitError(raw, delRes.statusText)
    if (delRes.status !== 409) return { ok: false, error: lastError }
  }
  return { ok: false, error: lastError }
}

/** Read a JSON content file from the cms branch (production) or return fallback (local / offline). */
export async function loadContentJson<T>(path: string, fallback: T): Promise<T> {
  if (import.meta.env.DEV) return structuredClone(fallback)

  const token = await identityToken()
  if (!token) return structuredClone(fallback)

  try {
    const file = await getGitFile(path, token)
    if (!file?.content || file.encoding !== 'base64') return structuredClone(fallback)
    return JSON.parse(b64DecodeUnicode(file.content)) as T
  } catch {
    return structuredClone(fallback)
  }
}

type DirEntry = { name: string; path: string; type: string; download_url?: string; sha: string }

/** List JSON files in a content directory on the cms branch. */
export async function listContentJsonFiles(dir: string): Promise<DirEntry[]> {
  if (import.meta.env.DEV) return []

  const token = await identityToken()
  if (!token) return []

  const api = `/.netlify/git/github/contents/${dir}?ref=${CMS_BRANCH}&ts=${Date.now()}`
  const res = await fetch(api, { headers: authHeaders(token), cache: 'no-store' })
  if (!res.ok) return []
  const items = (await res.json()) as DirEntry[] | DirEntry
  if (!Array.isArray(items)) return []
  return items.filter((i) => i.type === 'file' && i.name.endsWith('.json'))
}

/** Load every JSON file under a directory from the cms branch. */
export async function loadContentJsonDir<T>(dir: string): Promise<{ path: string; data: T }[]> {
  if (import.meta.env.DEV) return []

  const token = await identityToken()
  if (!token) return []

  const files = await listContentJsonFiles(dir)
  const out: { path: string; data: T }[] = []
  await Promise.all(
    files.map(async (f) => {
      try {
        const file = await getGitFile(f.path, token)
        if (!file?.content || file.encoding !== 'base64') return
        out.push({ path: f.path, data: JSON.parse(b64DecodeUnicode(file.content)) as T })
      } catch {
        /* skip bad file */
      }
    }),
  )
  return out
}

/**
 * Read–modify–write a JSON file with fresh SHA each attempt.
 * Use for shared files like content/news.json to avoid lost updates / 409s.
 */
export async function updateContentJson<T>(
  path: string,
  mutator: (current: T) => T,
  empty: T,
): Promise<SaveResult & { data?: T }> {
  if (import.meta.env.DEV) {
    let base = structuredClone(empty)
    const getRes = await fetch(`/api/cms/read?path=${encodeURIComponent(path)}`).catch(() => null)
    if (getRes?.ok) {
      const json = (await getRes.json().catch(() => null)) as { data?: T } | null
      if (json?.data !== undefined) base = json.data
    }
    const next = mutator(base)
    const saved = await saveLocal(path, next)
    return saved.ok ? { ...saved, data: next } : saved
  }

  const token = await identityToken()
  if (!token) {
    return { ok: false, error: 'Sign in with Netlify Identity to save (or run npm run dev).' }
  }

  let lastError = 'Save failed'
  for (let attempt = 0; attempt < 3; attempt++) {
    let current = structuredClone(empty)
    let sha: string | undefined
    try {
      const file = await getGitFile(path, token)
      if (file?.content && file.encoding === 'base64') {
        current = JSON.parse(b64DecodeUnicode(file.content)) as T
        sha = file.sha
      }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) }
    }

    const next = mutator(current)
    const putRes = await putGitFile(path, next, token, sha)
    if (putRes.ok) return { ok: true, message: 'Saved to cms branch', data: next }

    const raw = await putRes.text()
    lastError = formatGitError(raw, putRes.statusText)
    if (putRes.status !== 409) return { ok: false, error: lastError }
  }
  return { ok: false, error: lastError }
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
      ...authHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `cms: upload ${safe}`,
      content: m[2],
      branch: 'cms',
    }),
  })
  if (!putRes.ok) return { ok: false, error: formatGitError(await putRes.text(), putRes.statusText) }
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
  name: 'preview-cms' | 'publish-cms' | 'sync-project-order',
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

export type ContactSubmission = {
  id: string
  createdAt: string
  email: string
  subject: string
  message: string
  messageHtml?: string
}

export async function fetchContactSubmissions(): Promise<
  | { ok: true; submissions: ContactSubmission[]; message?: string }
  | { ok: false; error: string }
> {
  if (import.meta.env.DEV) {
    return {
      ok: false,
      error:
        'Inbox reads Netlify Forms on the live site. Deploy and open /admin/#/inbox after setting NETLIFY_API_TOKEN.',
    }
  }

  const identity = window.netlifyIdentity
  const user = identity?.currentUser?.()
  if (!user) return { ok: false, error: 'Login required' }
  const token = await user.jwt()

  const res = await fetch('/.netlify/functions/list-contact-submissions?per_page=50', {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = (await res.json().catch(() => ({}))) as {
    error?: string
    message?: string
    submissions?: ContactSubmission[]
  }
  if (!res.ok) return { ok: false, error: data.error || res.statusText }
  return {
    ok: true,
    submissions: Array.isArray(data.submissions) ? data.submissions : [],
    message: data.message,
  }
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
