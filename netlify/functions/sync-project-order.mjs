/**
 * Sync content/project-order.json from cms → main so the live site
 * rebuilds with the same project order as the admin list.
 *
 * Requires: CMS_GITHUB_TOKEN, optional CMS_GITHUB_REPO / CMS_*_BRANCH
 */

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

function json(statusCode, body) {
  return { statusCode, headers: cors, body: JSON.stringify(body) }
}

async function gh(path, token, options = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { raw: text }
  }
  return { res, data }
}

function b64EncodeUnicode(str) {
  return Buffer.from(str, 'utf8').toString('base64')
}

function b64DecodeUnicode(b64) {
  return Buffer.from(String(b64 || '').replace(/\n/g, ''), 'base64').toString('utf8')
}

export async function handler(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors, body: '' }
  }
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' })
  }

  const user = context.clientContext?.user
  if (!user) {
    return json(401, { error: 'Login required' })
  }

  const token = process.env.CMS_GITHUB_TOKEN
  const repo = process.env.CMS_GITHUB_REPO || 'Noraliu6161/GlobalLand'
  const base = process.env.CMS_BASE_BRANCH || 'main'
  const head = process.env.CMS_HEAD_BRANCH || 'cms'
  const path = 'content/project-order.json'

  if (!token) {
    return json(500, { error: 'Missing CMS_GITHUB_TOKEN in Netlify env' })
  }

  const fromCms = await gh(`/repos/${repo}/contents/${path}?ref=${encodeURIComponent(head)}`, token)
  if (!fromCms.res.ok || !fromCms.data?.content) {
    return json(fromCms.res.status || 500, {
      error: 'Could not read project-order.json from cms',
      details: fromCms.data,
    })
  }

  const bodyText = b64DecodeUnicode(fromCms.data.content)
  let parsed
  try {
    parsed = JSON.parse(bodyText)
  } catch {
    return json(500, { error: 'cms project-order.json is not valid JSON' })
  }
  if (!Array.isArray(parsed)) {
    return json(500, { error: 'cms project-order.json must be a JSON array of slugs' })
  }

  const onMain = await gh(`/repos/${repo}/contents/${path}?ref=${encodeURIComponent(base)}`, token)
  const sha = onMain.res.ok && onMain.data?.sha ? onMain.data.sha : undefined

  // Skip if already identical
  if (onMain.res.ok && onMain.data?.content) {
    try {
      const mainParsed = JSON.parse(b64DecodeUnicode(onMain.data.content))
      if (JSON.stringify(mainParsed) === JSON.stringify(parsed)) {
        return json(200, {
          ok: true,
          synced: false,
          message: 'Live site order already matches admin.',
        })
      }
    } catch {
      /* continue and overwrite */
    }
  }

  const put = await gh(`/repos/${repo}/contents/${path}`, token, {
    method: 'PUT',
    body: JSON.stringify({
      message: 'Sync project order to production',
      content: b64EncodeUnicode(`${JSON.stringify(parsed, null, 2)}\n`),
      branch: base,
      ...(sha ? { sha } : {}),
    }),
  })

  if (!put.res.ok) {
    return json(put.res.status, {
      error: 'Could not write project-order.json to main',
      details: put.data,
    })
  }

  return json(200, {
    ok: true,
    synced: true,
    message: 'Project order synced to the live site. Netlify will redeploy shortly.',
    order: parsed,
  })
}
