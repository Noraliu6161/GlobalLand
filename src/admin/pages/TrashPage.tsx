import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '../AdminApp'
import { getCopy, type AdminLang } from '../lib/i18n'
import type { NewsArticle } from '../../data/news'
import { loadTrashItems, loadTrashItemsForAdmin, type TrashItem } from '../lib/trash'
import bundledNews from '../../../content/news.json'
import { purgeTrashItem, restoreTrashItem, updateContentJson } from '../lib/contentApi'

export function TrashPage({ lang }: { lang: AdminLang }) {
  const t = getCopy(lang)
  const [items, setItems] = useState(() => loadTrashItems())
  const [busyId, setBusyId] = useState('')
  const [status, setStatus] = useState('')
  const [statusOk, setStatusOk] = useState(true)

  const zh = lang === 'zh'

  useEffect(() => {
    let cancelled = false
    void loadTrashItemsForAdmin().then((list) => {
      if (!cancelled) setItems(list)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const grouped = useMemo(() => {
    return {
      project: items.filter((i) => i.kind === 'project'),
      news: items.filter((i) => i.kind === 'news'),
    }
  }, [items])

  const restore = async (item: TrashItem) => {
    setBusyId(item.id)
    setStatus('')
    if (item.kind === 'news') {
      const article = item.payload as NewsArticle
      const saved = await updateContentJson<NewsArticle[]>(
        'content/news.json',
        (current) => {
          if (current.some((a) => a.id === article.id)) return current
          return [article, ...current]
        },
        (bundledNews as NewsArticle[]) || [],
      )
      if (!saved.ok) {
        setBusyId('')
        setStatusOk(false)
        setStatus(saved.error)
        return
      }
      const purged = await purgeTrashItem(item)
      setBusyId('')
      if (!purged.ok) {
        setStatusOk(false)
        setStatus(purged.error)
        return
      }
      setItems((list) => list.filter((x) => !(x.kind === item.kind && x.id === item.id)))
      setStatusOk(true)
      setStatus(zh ? '已恢复到新闻列表。' : 'Restored to News.')
      return
    }

    const res = await restoreTrashItem(item)
    setBusyId('')
    if (!res.ok) {
      setStatusOk(false)
      setStatus(res.error)
      return
    }
    setItems((list) => list.filter((x) => !(x.kind === item.kind && x.id === item.id)))
    setStatusOk(true)
    setStatus(zh ? '已恢复到项目列表。' : 'Restored to Projects.')
  }

  const purge = async (item: TrashItem) => {
    if (
      !window.confirm(
        zh ? `永久删除「${item.titleZh || item.titleEn}」？此操作不可撤销。` : `Permanently delete “${item.titleEn}”? This cannot be undone.`,
      )
    ) {
      return
    }
    setBusyId(item.id)
    setStatus('')
    const res = await purgeTrashItem(item)
    setBusyId('')
    if (!res.ok) {
      setStatusOk(false)
      setStatus(res.error)
      return
    }
    setItems((list) => list.filter((x) => !(x.kind === item.kind && x.id === item.id)))
    setStatusOk(true)
    setStatus(zh ? '已永久删除。' : 'Permanently deleted.')
  }

  const emptyAll = async () => {
    if (!items.length) return
    if (!window.confirm(zh ? '清空废纸篓？全部永久删除，不可撤销。' : 'Empty trash? All items will be permanently deleted.')) {
      return
    }
    setBusyId('__all__')
    for (const item of items) {
      const res = await purgeTrashItem(item)
      if (!res.ok) {
        setBusyId('')
        setStatusOk(false)
        setStatus(res.error)
        return
      }
    }
    setItems([])
    setBusyId('')
    setStatusOk(true)
    setStatus(zh ? '废纸篓已清空。' : 'Trash emptied.')
  }

  const renderRow = (item: TrashItem) => (
    <tr key={`${item.kind}-${item.id}`}>
      <td>
        <div className="admin-bi">{zh ? item.titleZh || item.titleEn : item.titleEn}</div>
        <div className="admin-bi-zh">{item.id}</div>
      </td>
      <td>
        <span className="admin-tag admin-tag--type">{item.kind === 'project' ? (zh ? '项目' : 'Project') : zh ? '新闻' : 'News'}</span>
      </td>
      <td>{item.trashedAt ? new Date(item.trashedAt).toLocaleString(zh ? 'zh-CN' : 'en-US') : '—'}</td>
      <td>
        <div className="admin-row-actions">
          <button type="button" className="admin-btn" disabled={busyId === item.id} onClick={() => void restore(item)}>
            {zh ? '恢复' : 'Restore'}
          </button>
          <button type="button" className="admin-btn admin-btn-danger" disabled={busyId === item.id} onClick={() => void purge(item)}>
            {zh ? '永久删除' : 'Delete forever'}
          </button>
        </div>
      </td>
    </tr>
  )

  return (
    <>
      <PageHeader
        title={t.trash}
        action={
          items.length ? (
            <button type="button" className="admin-btn admin-btn-danger" disabled={busyId === '__all__'} onClick={() => void emptyAll()}>
              {zh ? '清空废纸篓' : 'Empty trash'}
            </button>
          ) : undefined
        }
      />
      {status && <p className={`admin-status ${statusOk ? 'is-ok' : 'is-err'}`}>{status}</p>}

      <div className="admin-card">
        <p className="admin-hint" style={{ margin: 0 }}>
          {zh
            ? '废纸篓中的内容不会出现在网站上。项目 / 新闻 / 首页等菜单里只应保留网站要展示的内容；删掉的条目会进这里。'
            : 'Trashed items never appear on the website. Keep only live site content in Projects / News / Homepage; deleted items land here.'}
        </p>
      </div>

      {!items.length ? (
        <div className="admin-card">
          <p className="admin-hint" style={{ margin: 0 }}>
            {zh ? '废纸篓是空的。' : 'Trash is empty.'}
          </p>
        </div>
      ) : (
        <>
          {grouped.project.length > 0 && (
            <div className="admin-card">
              <h2>{zh ? '项目' : 'Projects'}</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{zh ? '名称' : 'Name'}</th>
                    <th>{zh ? '类型' : 'Kind'}</th>
                    <th>{zh ? '删除时间' : 'Trashed'}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>{grouped.project.map(renderRow)}</tbody>
              </table>
            </div>
          )}
          {grouped.news.length > 0 && (
            <div className="admin-card">
              <h2>{zh ? '新闻与活动' : 'News & Events'}</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{zh ? '名称' : 'Name'}</th>
                    <th>{zh ? '类型' : 'Kind'}</th>
                    <th>{zh ? '删除时间' : 'Trashed'}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>{grouped.news.map(renderRow)}</tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  )
}
