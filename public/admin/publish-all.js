;(function () {
  const ROOT_ID = 'gl-cms-publish-wrap'
  const STATUS_ID = 'gl-cms-publish-status'
  const SAVE_BTN_ID = 'gl-save-draft-btn'
  const DELETE_BTN_ID = 'gl-delete-entry-btn'
  const ACTIONS_ID = 'gl-editor-actions'
  const TOAST_ID = 'gl-save-draft-toast'

  function isLocalHost() {
    return location.hostname === 'localhost' || location.hostname === '127.0.0.1'
  }

  function isLoginScreen() {
    return (document.body?.innerText || '').includes('Login with Netlify Identity')
  }

  /** Edit existing OR create new project */
  function isEditingEntry() {
    const hash = location.hash || ''
    return (
      /#\/collections\/[^/]+\/new\/?$/.test(hash) ||
      /#\/collections\/[^/]+\/entries\//.test(hash)
    )
  }

  function isLoggedIn() {
    if (isLocalHost()) return true
    try {
      return Boolean(window.netlifyIdentity?.currentUser?.())
    } catch {
      return false
    }
  }

  /** Collection list only — never on login / editor */
  function shouldShowSidebarPublish() {
    if (isLoginScreen()) return false
    if (isEditingEntry()) return false
    return true
  }

  function setStatus(text, isError) {
    const el = document.getElementById(STATUS_ID)
    if (!el) return
    el.textContent = text || ''
    el.dataset.error = isError ? '1' : '0'
  }

  function showToast(text, isError) {
    let el = document.getElementById(TOAST_ID)
    if (!el) {
      el = document.createElement('div')
      el.id = TOAST_ID
      el.className = 'gl-save-draft-toast'
      document.body.appendChild(el)
    }
    el.hidden = false
    el.textContent = text
    el.dataset.error = isError ? '1' : '0'
    window.clearTimeout(showToast._t)
    showToast._t = window.setTimeout(() => {
      el.hidden = true
    }, 3200)
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
    if (isLocalHost()) {
      throw new Error('LOCAL_ONLY')
    }
    const jwt = await identityToken()
    const res = await fetch(`/.netlify/functions/${name}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || data.message || res.statusText)
    return data
  }

  function findCollectionsSidebar() {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, div, span, p'))
    const label = headings.find((el) => (el.textContent || '').trim() === 'Collections')
    if (!label) return null
    let node = label.parentElement
    for (let i = 0; i < 8 && node; i++) {
      const text = node.innerText || ''
      if (text.includes('Collections') && text.includes('Search')) return node
      node = node.parentElement
    }
    return label.parentElement
  }

  async function onPreviewAll() {
    setStatus(isLocalHost() ? '打开本地网站预览…' : '正在创建 / 打开 Preview PR…')
    try {
      if (isLocalHost()) {
        // Local: open the Vite site so you can see content/ changes
        const url = location.origin + '/projects'
        const opened = window.open(url, '_blank', 'noopener')
        if (!opened) {
          setStatus('弹窗被拦截。请允许弹窗，或手动打开 ' + url, true)
          return
        }
        setStatus('已打开本地 /projects（内容来自本地 content/）')
        return
      }
      if (!isLoggedIn()) {
        window.netlifyIdentity?.open('login')
        setStatus('请先登录 Netlify Identity', true)
        return
      }
      const data = await callFunction('preview-cms')
      setStatus(data.message || 'Preview ready.')
      if (data.pr_url) {
        const opened = window.open(data.pr_url, '_blank', 'noopener')
        if (!opened) {
          setStatus('已创建 PR，但弹窗被拦截：' + data.pr_url, true)
        }
      } else {
        setStatus('未返回 PR 链接，请检查 CMS_GITHUB_TOKEN。', true)
      }
    } catch (err) {
      setStatus(err.message || String(err), true)
    }
  }

  async function onPublishAll() {
    if (isLocalHost()) {
      setStatus('本地不能 Publish All。请在 Netlify 线上使用。', true)
      return
    }
    if (!isLoggedIn()) {
      window.netlifyIdentity?.open('login')
      setStatus('请先登录 Netlify Identity', true)
      return
    }
    if (
      !window.confirm(
        '将 cms 上所有草稿一次性发布到正式站 main？\n\n只会触发 1 次 production deploy（约 15 credits）。',
      )
    ) {
      setStatus('已取消')
      return
    }
    setStatus('Publishing all drafts (cms → main)…')
    try {
      const data = await callFunction('publish-cms')
      setStatus(data.message || 'Published.')
    } catch (err) {
      setStatus(err.message || String(err), true)
    }
  }

  function ensureSidebarPublish() {
    const existing = document.getElementById(ROOT_ID)
    if (!shouldShowSidebarPublish()) {
      if (existing) existing.remove()
      return
    }
    const sidebar = findCollectionsSidebar()
    if (!sidebar) return
    if (existing) {
      if (!sidebar.contains(existing)) sidebar.appendChild(existing)
      return
    }

    const wrap = document.createElement('div')
    wrap.id = ROOT_ID
    wrap.className = 'gl-cms-publish-wrap'
    wrap.innerHTML = `
      <button type="button" class="gl-cms-subbtn gl-cms-subbtn-preview" id="gl-cms-preview">Preview All</button>
      <button type="button" class="gl-cms-subbtn gl-cms-subbtn-publish" id="gl-cms-publish">Publish All</button>
      <div id="${STATUS_ID}" class="gl-cms-publish-status"></div>
      <p class="gl-cms-hint">${
        isLocalHost()
          ? '本地：Preview All 打开本站 /projects。Publish All 仅线上可用。'
          : '线上：Preview All 打开 GitHub PR（内含 Deploy Preview）。'
      }</p>
    `
    sidebar.appendChild(wrap)

    document.getElementById('gl-cms-preview').addEventListener('click', async () => {
      const btn = document.getElementById('gl-cms-preview')
      const publishBtn = document.getElementById('gl-cms-publish')
      btn.disabled = true
      publishBtn.disabled = true
      try {
        await onPreviewAll()
      } finally {
        btn.disabled = false
        publishBtn.disabled = false
      }
    })

    document.getElementById('gl-cms-publish').addEventListener('click', async () => {
      const btn = document.getElementById('gl-cms-publish')
      const previewBtn = document.getElementById('gl-cms-preview')
      btn.disabled = true
      previewBtn.disabled = true
      try {
        await onPublishAll()
      } finally {
        btn.disabled = false
        previewBtn.disabled = false
      }
    })
  }

  /** Remove legacy floating bottom bar from older admin builds */
  function removeLegacyBottomBar() {
    document.getElementById('gl-cms-bar')?.remove()
    document.querySelectorAll('.gl-cms-bar').forEach((el) => el.remove())
    // Text match for stale injected bars
    document.querySelectorAll('div').forEach((el) => {
      const t = (el.textContent || '').trim()
      if (
        el.children.length <= 6 &&
        /Save Draft\s*→\s*Publish All|Save Draft -> Publish All/.test(t) &&
        /Preview All/.test(t)
      ) {
        el.remove()
      }
    })
  }

  function labelOf(el) {
    return (el.textContent || '').replace(/\s+/g, ' ').trim()
  }

  function inTopChrome(el) {
    if (!el || !el.getBoundingClientRect) return false
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) return false
    return rect.top >= 0 && rect.top < 140 && rect.left > 40
  }

  function isPublishLabel(label) {
    return (
      /^(Publish|Published|Unpublished|Draft|发布)\b/i.test(label) ||
      /^Publish now$/i.test(label) ||
      /^Publish and create new$/i.test(label) ||
      /^Publish and duplicate$/i.test(label)
    )
  }

  function hideControl(el) {
    if (!el || el.id === SAVE_BTN_ID || el.id === DELETE_BTN_ID) return
    el.style.setProperty('display', 'none', 'important')
    el.setAttribute('aria-hidden', 'true')
    el.dataset.glHiddenNative = '1'
  }

  function armOffscreen(el) {
    if (!el) return
    el.style.setProperty('position', 'fixed', 'important')
    el.style.setProperty('left', '-10000px', 'important')
    el.style.setProperty('top', '0', 'important')
    el.style.setProperty('width', '1px', 'important')
    el.style.setProperty('height', '1px', 'important')
    el.style.setProperty('opacity', '0', 'important')
    el.style.setProperty('pointer-events', 'auto', 'important')
    el.style.setProperty('display', 'block', 'important')
    el.removeAttribute('aria-hidden')
  }

  function hideNativePublishControls() {
    if (!isEditingEntry()) return
    document.body.classList.remove('gl-saving-draft')

    document.querySelectorAll('button, [role="button"], [role="menuitem"]').forEach((el) => {
      if (el.id === SAVE_BTN_ID || el.id === DELETE_BTN_ID) return
      const label = labelOf(el)
      if (!isPublishLabel(label)) return

      if (
        /^(Publish|Published|Unpublished|Draft|发布)\b/i.test(label) &&
        !/^Publish and /i.test(label) &&
        !/^Publish now$/i.test(label)
      ) {
        el.dataset.glNativeSave = '1'
      }
      if (/^Publish now$/i.test(label)) {
        el.dataset.glNativeSaveNow = '1'
      }
      hideControl(el)
    })
  }

  function findNativePersistControl() {
    const all = Array.from(document.querySelectorAll('button, [role="menuitem"], [role="button"], a'))
    return (
      all.find((el) => el.dataset.glNativeSaveNow === '1') ||
      all.find((el) => /^Publish now$/i.test(labelOf(el))) ||
      all.find((el) => el.dataset.glNativeSave === '1') ||
      all.find((el) => {
        if (el.id === SAVE_BTN_ID || el.id === DELETE_BTN_ID) return false
        const t = labelOf(el)
        return (
          t === 'Publish' ||
          t === 'Published' ||
          t === 'Unpublished' ||
          t === 'Draft' ||
          t === '发布' ||
          t === 'Save' ||
          /^Publish\b/i.test(t) ||
          /^Published\b/i.test(t)
        )
      }) ||
      null
    )
  }

  function clickNativePersist() {
    const control = findNativePersistControl()
    if (!control) return false

    const label = labelOf(control)
    const isTrigger =
      (control.dataset.glNativeSave === '1' ||
        /^(Publish|Published|Unpublished|Draft|发布)\b/i.test(label)) &&
      !/^Publish now$/i.test(label)

    document.body.classList.add('gl-saving-draft')
    armOffscreen(control)
    control.click()

    if (isTrigger) {
      let tries = 0
      const tryPublishNow = () => {
        tries += 1
        const now =
          Array.from(document.querySelectorAll('button, [role="menuitem"], [role="button"]')).find(
            (el) => /^Publish now$/i.test(labelOf(el)),
          ) || null
        if (now) {
          armOffscreen(now)
          now.click()
          window.setTimeout(hideNativePublishControls, 100)
          return
        }
        if (tries < 10) window.setTimeout(tryPublishNow, 40)
        else hideNativePublishControls()
      }
      window.setTimeout(tryPublishNow, 30)
    } else {
      window.setTimeout(hideNativePublishControls, 80)
    }
    return true
  }

  function triggerSaveDraft() {
    if (clickNativePersist()) {
      showToast(
        isLocalHost()
          ? '正在保存草稿到本地 content/ 文件…'
          : '正在保存草稿到 cms 分支…',
      )
      return
    }
    if (/UNSAVED CHANGES|未保存/i.test(document.body.innerText || '')) {
      showToast('找不到保存控件，请刷新页面后再试 Save Draft。', true)
      return
    }
    if (/CHANGES SAVED|已保存/i.test(document.body.innerText || '')) {
      showToast('当前已保存。修改字段或图片后再点 Save Draft。')
      return
    }
    showToast('请先填写必填字段，然后再点 Save Draft。', true)
  }

  function findNativeDeleteButton() {
    return (
      Array.from(document.querySelectorAll('button')).find((b) => {
        if (b.id === DELETE_BTN_ID || b.id === SAVE_BTN_ID) return false
        const t = labelOf(b)
        return t === 'Delete entry' || t === '删除条目' || t === '删除'
      }) || null
    )
  }

  function makeDiscardButton() {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.id = DELETE_BTN_ID
    btn.className = 'gl-delete-entry-btn'
    btn.textContent = 'Delete entry'
    btn.title = '放弃本篇并返回列表'
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (window.confirm('放弃这篇未发布的内容并返回列表？')) {
        const hash = location.hash || ''
        const m = hash.match(/#\/collections\/([^/]+)/)
        location.hash = m ? `#/collections/${m[1]}` : '#/'
      }
    })
    return btn
  }

  function ensureDeleteButton() {
    const native = findNativeDeleteButton()
    if (native) {
      document.getElementById(DELETE_BTN_ID)?.remove()
      return native
    }
    return document.getElementById(DELETE_BTN_ID) || makeDiscardButton()
  }

  function findHeaderPublishButton() {
    const all = Array.from(document.querySelectorAll('button, [role="button"]'))
    return (
      all.find((el) => el.dataset.glNativeSave === '1') ||
      all.find((el) => {
        if (el.id === SAVE_BTN_ID || el.id === DELETE_BTN_ID) return false
        const t = labelOf(el)
        if (!isPublishLabel(t)) return false
        if (el.dataset.glHiddenNative === '1') return true
        return inTopChrome(el)
      }) ||
      null
    )
  }

  function findEditorToolbar() {
    const candidates = Array.from(document.querySelectorAll('div, span, p, header, section'))
    const writing = candidates.find((el) => {
      const t = labelOf(el)
      return /^Writing in /.test(t) && t.length < 120
    })
    if (!writing) return null

    let node = writing
    let best = writing.parentElement
    for (let i = 0; i < 12 && node; i++) {
      const rect = node.getBoundingClientRect()
      if (rect.top >= 0 && rect.top < 120 && rect.width > 480 && rect.height > 36 && rect.height < 120) {
        best = node
        break
      }
      node = node.parentElement
    }
    return best
  }

  function styleActionRow(row) {
    row.classList.add('gl-editor-actions')
    row.dataset.glActionRow = '1'
    row.style.setProperty('display', 'flex', 'important')
    row.style.setProperty('flex-direction', 'row', 'important')
    row.style.setProperty('align-items', 'center', 'important')
    row.style.setProperty('justify-content', 'flex-end', 'important')
    row.style.setProperty('gap', '10px', 'important')
    row.style.setProperty('flex-wrap', 'nowrap', 'important')
    row.style.setProperty('margin-left', 'auto', 'important')
  }

  function makeSaveButton() {
    const saveBtn = document.createElement('button')
    saveBtn.type = 'button'
    saveBtn.id = SAVE_BTN_ID
    saveBtn.className = 'gl-save-draft-btn'
    saveBtn.textContent = 'Save Draft'
    saveBtn.title = '保存本篇草稿（不会正式上线）'
    saveBtn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      triggerSaveDraft()
    })
    return saveBtn
  }

  function ensureSaveButton() {
    return document.getElementById(SAVE_BTN_ID) || makeSaveButton()
  }

  function placeSaveAndDelete(row, saveBtn, deleteBtn) {
    styleActionRow(row)
    if (saveBtn.parentElement !== row) row.appendChild(saveBtn)
    if (deleteBtn.parentElement !== row) row.appendChild(deleteBtn)
    if (saveBtn.nextElementSibling !== deleteBtn) {
      row.insertBefore(saveBtn, deleteBtn)
    }
    Array.from(row.querySelectorAll('button, [role="button"]')).forEach((el) => {
      if (el === saveBtn || el === deleteBtn) return
      if (el.id === SAVE_BTN_ID || el.id === DELETE_BTN_ID) return
      if (isPublishLabel(labelOf(el))) hideControl(el)
    })
  }

  function ensureEditorSaveDraft() {
    const orphan = document.getElementById(ACTIONS_ID)
    if (orphan && orphan.parentElement === document.body) orphan.remove()

    if (!isEditingEntry()) {
      document.getElementById(SAVE_BTN_ID)?.remove()
      document.getElementById(DELETE_BTN_ID)?.remove()
      document.getElementById(ACTIONS_ID)?.remove()
      return
    }

    const nativeDelete = findNativeDeleteButton()
    const publishBtn = findHeaderPublishButton()
    const saveBtn = ensureSaveButton()
    const deleteBtn = ensureDeleteButton()

    let row = null

    if (nativeDelete?.parentElement) {
      row = nativeDelete.parentElement
    } else if (publishBtn?.parentElement) {
      row = publishBtn.parentElement
      row.style.removeProperty('display')
      row.removeAttribute('aria-hidden')
      delete row.dataset.glHiddenNative
    } else {
      let actions = document.getElementById(ACTIONS_ID)
      if (!actions) {
        actions = document.createElement('div')
        actions.id = ACTIONS_ID
        actions.className = 'gl-editor-actions'
      }
      const toolbar = findEditorToolbar()
      if (!toolbar) return
      if (!toolbar.contains(actions)) toolbar.appendChild(actions)
      const cs = window.getComputedStyle(toolbar)
      if (cs.display !== 'flex' && cs.display !== 'inline-flex') {
        toolbar.style.setProperty('display', 'flex', 'important')
        toolbar.style.setProperty('align-items', 'center', 'important')
      }
      row = actions
    }

    placeSaveAndDelete(row, saveBtn, deleteBtn)
    hideNativePublishControls()
  }

  function tick() {
    removeLegacyBottomBar()
    ensureSidebarPublish()
    ensureEditorSaveDraft()
  }

  function boot() {
    let timer = 0
    const schedule = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(tick, 50)
    }

    tick()
    window.addEventListener('hashchange', () => {
      window.setTimeout(tick, 80)
      window.setTimeout(tick, 300)
    })
    window.addEventListener('keydown', (e) => {
      if (!isEditingEntry()) return
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        triggerSaveDraft()
      }
    })
    if (window.netlifyIdentity) {
      window.netlifyIdentity.on('login', tick)
      window.netlifyIdentity.on('logout', tick)
    }
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }
})()
