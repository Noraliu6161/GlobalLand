;(function () {
  const STATUS_ID = 'gl-cms-status'

  function setStatus(text, isError) {
    const el = document.getElementById(STATUS_ID)
    if (!el) return
    el.textContent = text || ''
    el.style.color = isError ? '#ffb4a8' : '#b7f0e8'
  }

  async function identityToken() {
    const identity = window.netlifyIdentity
    if (!identity) throw new Error('Netlify Identity is not loaded')
    const user = identity.currentUser()
    if (!user) {
      identity.open('login')
      throw new Error('Please log in first')
    }
    return user.jwt()
  }

  async function callFunction(name) {
    const jwt = await identityToken()
    const res = await fetch(`/.netlify/functions/${name}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const msg = data.error || data.message || res.statusText
      throw new Error(msg)
    }
    return data
  }

  function ensureToolbar() {
    if (document.getElementById('gl-cms-bar')) return

    const bar = document.createElement('div')
    bar.id = 'gl-cms-bar'
    bar.className = 'gl-cms-bar'
    bar.innerHTML = `
      <div>
        <strong>Save Draft → Publish All</strong>
        <p>
          Editor Save only updates the <code>cms</code> draft branch (no production).
          Click <strong>Publish All</strong> once to merge everything to <code>main</code> (one deploy ≈ 15 credits).
        </p>
        <div id="${STATUS_ID}" class="gl-cms-status"></div>
      </div>
      <div class="gl-cms-actions">
        <button type="button" class="gl-cms-btn gl-cms-btn-secondary" id="gl-cms-preview">
          Preview All
        </button>
        <button type="button" class="gl-cms-btn gl-cms-btn-primary" id="gl-cms-publish">
          Publish All
        </button>
      </div>
    `
    document.body.appendChild(bar)

    document.getElementById('gl-cms-publish').addEventListener('click', async () => {
      const btn = document.getElementById('gl-cms-publish')
      const previewBtn = document.getElementById('gl-cms-preview')
      btn.disabled = true
      previewBtn.disabled = true
      setStatus('Publishing all drafts (cms → main)…')
      try {
        const ok = window.confirm(
          'Publish ALL draft changes on cms into main?\n\nThis triggers ONE production deploy (~15 credits).',
        )
        if (!ok) {
          setStatus('Cancelled.')
          return
        }
        const data = await callFunction('publish-cms')
        setStatus(data.message || 'Published.')
        if (data.pr_url) window.open(data.pr_url, '_blank', 'noopener')
      } catch (err) {
        setStatus(err.message || String(err), true)
      } finally {
        btn.disabled = false
        previewBtn.disabled = false
      }
    })

    document.getElementById('gl-cms-preview').addEventListener('click', async () => {
      const btn = document.getElementById('gl-cms-preview')
      const publishBtn = document.getElementById('gl-cms-publish')
      btn.disabled = true
      publishBtn.disabled = true
      setStatus('Opening Preview PR (uses extra preview credits)…')
      try {
        const data = await callFunction('preview-cms')
        setStatus(data.message || 'Preview ready.')
        if (data.pr_url) window.open(data.pr_url, '_blank', 'noopener')
      } catch (err) {
        setStatus(err.message || String(err), true)
      } finally {
        btn.disabled = false
        publishBtn.disabled = false
      }
    })
  }

  /** Rename Decap's "Publish" control to "Save Draft" where possible */
  function relabelPublishButtons(root) {
    const nodes = root.querySelectorAll('button, [role="button"], span')
    nodes.forEach((node) => {
      if (!node.childElementCount && /\bPublish\b/i.test(node.textContent || '')) {
        if (node.dataset.glRelabeled) return
        if ((node.textContent || '').trim() === 'Publish') {
          node.textContent = 'Save Draft'
          node.dataset.glRelabeled = '1'
        }
      }
    })
  }

  function startObservers() {
    ensureToolbar()
    relabelPublishButtons(document.body)
    const obs = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((n) => {
          if (n.nodeType === 1) relabelPublishButtons(n)
        })
      }
    })
    obs.observe(document.body, { childList: true, subtree: true })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObservers)
  } else {
    startObservers()
  }
})()
