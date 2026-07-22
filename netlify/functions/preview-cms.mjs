/**
 * Preview All: ensure a PR exists for cms → main (triggers Deploy Preview).
 * This costs an extra preview build — not part of the 15-credit production budget.
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

  if (!token) {
    return json(500, { error: 'Missing CMS_GITHUB_TOKEN in Netlify env' })
  }

  const list = await gh(
    `/repos/${repo}/pulls?state=open&head=${encodeURIComponent(repo.split('/')[0] + ':' + head)}&base=${base}`,
    token,
  )
  if (!list.res.ok) {
    return json(list.res.status, { error: 'Could not list PRs', details: list.data })
  }

  const existing = Array.isArray(list.data) ? list.data[0] : null
  if (existing) {
    return json(200, {
      ok: true,
      created: false,
      pr_url: existing.html_url,
      message:
        'Preview PR already open. Netlify Deploy Preview link is on the PR page (extra credits for preview build).',
    })
  }

  const create = await gh(`/repos/${repo}/pulls`, token, {
    method: 'POST',
    body: JSON.stringify({
      title: 'CMS preview: publish draft content',
      head,
      base,
      body: [
        'Draft content from the `cms` branch.',
        '',
        '- Use the **Netlify Deploy Preview** on this PR to review.',
        '- When ready, either merge this PR **or** use **Publish All** in `/admin` (same result: one production deploy).',
        '',
        '_Preview builds consume credits separately from production._',
      ].join('\n'),
    }),
  })

  if (create.res.status === 201) {
    return json(200, {
      ok: true,
      created: true,
      pr_url: create.data.html_url,
      message:
        'Preview PR created. Open it for the Deploy Preview URL (preview build uses extra credits).',
    })
  }

  return json(create.res.status, {
    error: 'Could not create preview PR',
    details: create.data,
  })
}
