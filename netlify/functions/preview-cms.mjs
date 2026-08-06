/**
 * Preview All: ensure a PR exists for cms → main (triggers Deploy Preview).
 * Returns both the GitHub PR URL and the stable Deploy Preview site URL
 * (deploy-preview-{N}--{site}.netlify.app stays the same while that PR is open).
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

function deployPreviewUrl(prNumber) {
  const site = process.env.CMS_NETLIFY_SITE || 'gilded-conkies-8778c0'
  return `https://deploy-preview-${prNumber}--${site}.netlify.app`
}

function productionUrl() {
  const site = process.env.CMS_NETLIFY_SITE || 'gilded-conkies-8778c0'
  const custom = process.env.CMS_PRODUCTION_URL
  return custom || `https://${site}.netlify.app`
}

function packPreview(pr) {
  const number = pr.number
  return {
    ok: true,
    pr_number: number,
    pr_url: pr.html_url,
    preview_url: deployPreviewUrl(number),
  }
}

function ghErrorMessage(data, fallback) {
  if (!data || typeof data !== 'object') return fallback
  if (typeof data.message === 'string' && data.message) {
    const errors = Array.isArray(data.errors)
      ? data.errors.map((e) => e.message || e.code).filter(Boolean).join('; ')
      : ''
    return errors ? `${data.message} (${errors})` : data.message
  }
  return fallback
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
  const prod = productionUrl()

  if (!token) {
    return json(500, { error: 'Missing CMS_GITHUB_TOKEN in Netlify env' })
  }

  const list = await gh(
    `/repos/${repo}/pulls?state=open&head=${encodeURIComponent(repo.split('/')[0] + ':' + head)}&base=${base}`,
    token,
  )
  if (!list.res.ok) {
    return json(list.res.status, {
      error: ghErrorMessage(list.data, 'Could not list PRs'),
      details: list.data,
    })
  }

  const existing = Array.isArray(list.data) ? list.data[0] : null
  if (existing) {
    return json(200, {
      ...packPreview(existing),
      created: false,
      message:
        '已连接现有 Preview PR。正在打开独立预览站（地址在 PR 未合并前保持不变）。',
    })
  }

  // Need cms commits that are not on main — otherwise GitHub rejects the PR (422).
  const compare = await gh(`/repos/${repo}/compare/${base}...${head}`, token)
  if (!compare.res.ok) {
    return json(compare.res.status, {
      error: ghErrorMessage(compare.data, 'Could not compare cms and main'),
      details: compare.data,
    })
  }

  const ahead = compare.data?.ahead_by ?? 0
  if (ahead === 0) {
    return json(200, {
      ok: true,
      created: false,
      ahead_by: 0,
      preview_url: prod,
      production_url: prod,
      message:
        '草稿分支 cms 与正式站 main 没有可预览的差异（可能尚未保存新内容，或已发布）。已打开正式站。请先在后台改内容并保存，再点预览。',
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
      ...packPreview(create.data),
      created: true,
      message: '已创建 Preview PR，并打开独立预览站。',
    })
  }

  // Common: race or “No commits between …” after compare
  const msg = ghErrorMessage(create.data, 'Could not create preview PR')
  const noCommits = /no commits between/i.test(msg)
  if (noCommits || create.res.status === 422) {
    return json(200, {
      ok: true,
      created: false,
      ahead_by: 0,
      preview_url: prod,
      production_url: prod,
      message:
        '无法创建 Preview PR（cms 与 main 无差异）。已打开正式站。请先保存后台更改后再预览。',
      details: create.data,
    })
  }

  if (create.res.status === 403) {
    return json(403, {
      error:
        'GitHub 拒绝创建 PR。请检查 CMS_GITHUB_TOKEN 是否有 Pull requests: Read and write 权限。',
      details: create.data,
    })
  }

  return json(create.res.status, {
    error: msg,
    details: create.data,
  })
}
