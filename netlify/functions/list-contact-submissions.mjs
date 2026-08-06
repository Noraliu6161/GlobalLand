/**
 * List Contact form submissions from Netlify Forms API.
 *
 * Requires Netlify env:
 *   NETLIFY_API_TOKEN  — Personal Access Token (User settings → Applications)
 *   SITE_ID            — usually injected automatically by Netlify
 * Optional:
 *   NETLIFY_SITE_ID    — override if SITE_ID is missing
 *   NETLIFY_FORM_NAME  — default "contact"
 */

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
}

function json(statusCode, body) {
  return { statusCode, headers: cors, body: JSON.stringify(body) }
}

async function netlifyApi(path, token) {
  const res = await fetch(`https://api.netlify.com/api/v1${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
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
  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed' })
  }

  const user = context.clientContext?.user
  if (!user) {
    return json(401, {
      error: 'Login required. Open /admin while signed in with Netlify Identity.',
    })
  }

  const token = process.env.NETLIFY_API_TOKEN || process.env.NETLIFY_AUTH_TOKEN
  const siteId = process.env.NETLIFY_SITE_ID || process.env.SITE_ID
  const formName = (process.env.NETLIFY_FORM_NAME || 'contact').toLowerCase()

  if (!token) {
    return json(500, {
      error:
        'Missing NETLIFY_API_TOKEN. Create a Personal Access Token at Netlify → User settings → Applications, then add it under Site → Environment variables.',
    })
  }
  if (!siteId) {
    return json(500, {
      error: 'Missing SITE_ID / NETLIFY_SITE_ID environment variable.',
    })
  }

  const forms = await netlifyApi(`/sites/${siteId}/forms`, token)
  if (!forms.res.ok) {
    return json(forms.res.status, {
      error: 'Could not list site forms. Check NETLIFY_API_TOKEN permissions.',
      details: forms.data,
    })
  }

  const list = Array.isArray(forms.data) ? forms.data : []
  const form = list.find((f) => String(f.name || '').toLowerCase() === formName)

  if (!form) {
    return json(200, {
      ok: true,
      formName,
      submissions: [],
      message:
        'No “contact” form detected yet. Enable form detection in Netlify → Forms, then redeploy and submit a test message.',
    })
  }

  const page = Math.max(1, Number(event.queryStringParameters?.page) || 1)
  const perPage = Math.min(100, Math.max(1, Number(event.queryStringParameters?.per_page) || 50))
  const state = event.queryStringParameters?.state === 'spam' ? 'spam' : 'ham'

  const subs = await netlifyApi(
    `/forms/${form.id}/submissions?page=${page}&per_page=${perPage}&state=${state}`,
    token,
  )
  if (!subs.res.ok) {
    return json(subs.res.status, {
      error: 'Could not load submissions',
      details: subs.data,
    })
  }

  const submissions = (Array.isArray(subs.data) ? subs.data : []).map((s) => {
    const data = s.data && typeof s.data === 'object' ? s.data : {}
    return {
      id: s.id,
      createdAt: s.created_at || s.createdAt || '',
      email: String(data.email || ''),
      subject: String(data.subject || ''),
      message: String(data.message || ''),
      messageHtml: String(data['message-html'] || data.messageHtml || ''),
      raw: data,
    }
  })

  return json(200, {
    ok: true,
    formName: form.name,
    formId: form.id,
    submissionCount: form.submission_count ?? submissions.length,
    page,
    perPage,
    state,
    submissions,
  })
}
