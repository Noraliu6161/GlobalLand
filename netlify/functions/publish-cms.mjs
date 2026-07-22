/**
 * Publish All: merge cms → main once.
 * Requires Netlify env:
 *   CMS_GITHUB_TOKEN  — GitHub PAT with repo contents:write
 *   CMS_GITHUB_REPO   — e.g. Noraliu6161/GlobalLand
 *   CMS_BASE_BRANCH   — main (default)
 *   CMS_HEAD_BRANCH   — cms (default)
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
    return json(401, {
      error: 'Login required. Open /admin while signed in with Netlify Identity.',
    })
  }

  const token = process.env.CMS_GITHUB_TOKEN
  const repo = process.env.CMS_GITHUB_REPO || 'Noraliu6161/GlobalLand'
  const base = process.env.CMS_BASE_BRANCH || 'main'
  const head = process.env.CMS_HEAD_BRANCH || 'cms'

  if (!token) {
    return json(500, {
      error:
        'Missing CMS_GITHUB_TOKEN in Netlify env. Create a GitHub PAT with Contents: Read and write, then add it under Site → Environment variables.',
    })
  }

  const compare = await gh(`/repos/${repo}/compare/${base}...${head}`, token)
  if (!compare.res.ok) {
    return json(compare.res.status, {
      error: 'Could not compare cms and main',
      details: compare.data,
    })
  }

  const ahead = compare.data?.ahead_by ?? 0
  if (ahead === 0) {
    return json(200, {
      ok: true,
      merged: false,
      message: 'Nothing to publish — cms is already in sync with main.',
      ahead_by: 0,
    })
  }

  const who = user.email || user.app_metadata?.roles?.[0] || user.sub || 'editor'
  const merge = await gh(`/repos/${repo}/merges`, token, {
    method: 'POST',
    body: JSON.stringify({
      base,
      head,
      commit_message: `Publish CMS content (${ahead} commit(s)) — ${who}`,
    }),
  })

  if (merge.res.status === 201) {
    return json(200, {
      ok: true,
      merged: true,
      message:
        'Published. Netlify will run ONE production deploy for main (~15 credits).',
      ahead_by: ahead,
      commit_sha: merge.data?.sha,
    })
  }

  if (merge.res.status === 204) {
    return json(200, {
      ok: true,
      merged: false,
      message: 'Nothing to publish — already up to date.',
      ahead_by: 0,
    })
  }

  if (merge.res.status === 409) {
    return json(409, {
      error:
        'Merge conflict between cms and main. Resolve on GitHub, then try Publish All again.',
      details: merge.data,
    })
  }

  return json(merge.res.status, {
    error: 'GitHub merge failed',
    details: merge.data,
  })
}
