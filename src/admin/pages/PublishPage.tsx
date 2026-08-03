import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../AdminApp'
import { getCopy, type AdminLang } from '../lib/i18n'
import { callCmsFunction } from '../lib/contentApi'

export function PublishPage({ lang }: { lang: AdminLang }) {
  const t = getCopy(lang)
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState<'preview' | 'publish' | null>(null)
  const zh = lang === 'zh'

  const run = async (kind: 'preview' | 'publish') => {
    setBusy(kind)
    setStatus('')
    const name = kind === 'preview' ? 'preview-cms' : 'publish-cms'
    if (kind === 'publish') {
      const ok = window.confirm(
        zh
          ? '将把当前菜单里的网站内容推送到正式站。请确认不想上线的项目/新闻已在废纸篓中。继续？'
          : 'This pushes the current live-site content (everything outside Trash) to production. Confirm unwanted items are in Trash first. Continue?',
      )
      if (!ok) {
        setBusy(null)
        return
      }
    }
    const res = await callCmsFunction(name)
    setBusy(null)
    if (!res.ok) {
      setStatus(String(res.data.error || 'Request failed'))
      return
    }
    const msg =
      kind === 'preview'
        ? String(res.data.preview_url || res.data.message || 'Preview ready')
        : String(res.data.message || 'Published')
    setStatus(msg)
    if (typeof res.data.preview_url === 'string') {
      window.open(res.data.preview_url, '_blank', 'noopener')
    }
  }

  return (
    <>
      <PageHeader title={t.publish} />
      <div className="admin-card admin-publish">
        <div className="admin-publish-banner">
          {zh
            ? '项目、新闻、首页等内容应等于网站要展示的内容。不想上线的请先放进废纸篓，再发布。'
            : 'Projects, News, Homepage, etc. should match what the website shows. Put unwanted items in Trash before publishing.'}
        </div>
        <div className="admin-publish-actions">
          <button type="button" className="admin-btn" disabled={!!busy} onClick={() => run('preview')}>
            {busy === 'preview' ? '…' : zh ? '预览网站' : 'Preview site'}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            disabled={!!busy}
            onClick={() => run('publish')}
          >
            {busy === 'publish' ? '…' : zh ? '发布到网站' : 'Publish to Website'}
          </button>
        </div>
        {status && <p className="admin-status is-ok">{status}</p>}
        <p className="admin-hint">
          {zh ? (
            <>
              发布前请检查 <Link to="/trash">废纸篓</Link>。废纸篓内的内容不会出现在网站上。
            </>
          ) : (
            <>
              Check <Link to="/trash">Trash</Link> before publishing. Trashed items do not appear on the website.
            </>
          )}
        </p>
      </div>
    </>
  )
}
