import { useCallback, useEffect, useState, Fragment } from 'react'
import { PageHeader } from '../AdminApp'
import { getCopy, type AdminLang } from '../lib/i18n'
import { fetchContactSubmissions, type ContactSubmission } from '../lib/contentApi'

function formatWhen(iso: string, lang: AdminLang) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function InboxPage({ lang }: { lang: AdminLang }) {
  const t = getCopy(lang)
  const zh = lang === 'zh'
  const [items, setItems] = useState<ContactSubmission[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [hint, setHint] = useState('')
  const [openId, setOpenId] = useState('')

  const load = useCallback(async () => {
    setBusy(true)
    setError('')
    setHint('')
    const res = await fetchContactSubmissions()
    setBusy(false)
    if (!res.ok) {
      setItems([])
      setError(res.error)
      return
    }
    setItems(res.submissions)
    if (res.message) setHint(res.message)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <>
      <PageHeader
        title={t.inbox}
        action={
          <button type="button" className="admin-btn" disabled={busy} onClick={() => void load()}>
            {busy ? (zh ? '刷新中…' : 'Refreshing…') : zh ? '刷新' : 'Refresh'}
          </button>
        }
      />

      <p className="admin-hint">
        {zh
          ? '显示正式站 Contact 表单（Netlify Forms）提交。需在 Netlify 开启 Form detection，并配置 NETLIFY_API_TOKEN。'
          : 'Shows Contact form submissions from Netlify Forms. Enable form detection and set NETLIFY_API_TOKEN in Netlify env.'}
      </p>

      {error && <p className="admin-status is-err">{error}</p>}
      {hint && !error && <p className="admin-status is-ok">{hint}</p>}

      <div className="admin-card">
        {busy && !items.length ? (
          <p className="admin-hint">{zh ? '加载中…' : 'Loading…'}</p>
        ) : items.length === 0 && !error ? (
          <p className="admin-hint" style={{ margin: 0 }}>
            {zh ? '暂无留言。在正式站 /contact 提交一条测试即可出现在这里。' : 'No messages yet. Submit a test on the live /contact page.'}
          </p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{zh ? '时间' : 'When'}</th>
                <th>{zh ? '邮箱' : 'Email'}</th>
                <th>{zh ? '主题' : 'Subject'}</th>
                <th>{zh ? '留言' : 'Message'}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const open = openId === item.id
                const preview = (item.message || '').replace(/\s+/g, ' ').trim()
                return (
                  <Fragment key={item.id}>
                    <tr>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatWhen(item.createdAt, lang)}</td>
                      <td>
                        {item.email ? (
                          <a href={`mailto:${item.email}`}>{item.email}</a>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>{item.subject || '—'}</td>
                      <td>
                        <span className="admin-inbox-preview">
                          {preview.length > 80 ? `${preview.slice(0, 80)}…` : preview || '—'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-btn"
                          onClick={() => setOpenId(open ? '' : item.id)}
                        >
                          {open ? (zh ? '收起' : 'Hide') : zh ? '查看' : 'View'}
                        </button>
                      </td>
                    </tr>
                    {open ? (
                      <tr className="admin-inbox-detail-row">
                        <td colSpan={5}>
                          <div className="admin-inbox-detail">
                            <p>
                              <strong>{zh ? '邮箱' : 'Email'}:</strong>{' '}
                              {item.email ? <a href={`mailto:${item.email}`}>{item.email}</a> : '—'}
                            </p>
                            <p>
                              <strong>{zh ? '主题' : 'Subject'}:</strong> {item.subject || '—'}
                            </p>
                            <p>
                              <strong>{zh ? '留言' : 'Message'}:</strong>
                            </p>
                            <pre className="admin-inbox-message">{item.message || '—'}</pre>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
