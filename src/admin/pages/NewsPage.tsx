import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../AdminApp'
import { getCopy, type AdminLang } from '../lib/i18n'
import type { NewsArticle } from '../../data/news'
import { moveToTrash, saveContentFile } from '../lib/contentApi'
import { Field, ImageField, SelectField } from '../components/Fields'
import { AdminMediaImage } from '../components/AdminMediaImage'
import { ContentBlocksEditor } from '../components/ContentBlocksEditor'
import { RichTextField } from '../components/RichTextField'
import { makeNewsTrashItem } from '../lib/trash'
import { labelsFromDate, toHtml } from '../../lib/newsHtml'
import { ensureArticleBlocks } from '../../lib/newsBlocks'

function normalizeArticle(raw: NewsArticle): NewsArticle {
  const dateFields = labelsFromDate(raw.date || new Date().toISOString().slice(0, 10))
  const withBlocks = ensureArticleBlocks(raw)
  return {
    ...withBlocks,
    ...dateFields,
    dateLabelEn: raw.dateLabelEn || dateFields.dateLabelEn,
    dateLabelZh: raw.dateLabelZh || dateFields.dateLabelZh,
    archiveYear: raw.archiveYear || dateFields.archiveYear,
    archiveMonth: raw.archiveMonth || dateFields.archiveMonth,
    eventDetailsEn: toHtml(raw.eventDetailsEn),
    eventDetailsZh: toHtml(raw.eventDetailsZh),
    image: raw.image || '',
    registerUrl: raw.registerUrl || '',
    blocks: withBlocks.blocks || [],
  }
}

function loadNewsArticles(): NewsArticle[] {
  const mod = import.meta.glob('../../../content/news.json', { eager: true }) as Record<
    string,
    { default: NewsArticle[] }
  >
  return (Object.values(mod)[0]?.default || []).map((a) => normalizeArticle(structuredClone(a)))
}

function blankArticle(): NewsArticle {
  const iso = new Date().toISOString().slice(0, 10)
  const d = labelsFromDate(iso)
  return {
    id: `news-${Date.now()}`,
    slug: `news-${Date.now()}`,
    kind: 'news',
    ...d,
    titleEn: '',
    titleZh: '',
    summaryEn: '',
    summaryZh: '',
    blocks: [],
    image: '',
    eventDetailsEn: '',
    eventDetailsZh: '',
    registerUrl: '',
  }
}

function kindLabel(kind: string, lang: AdminLang) {
  if (lang === 'zh') return kind === 'event' ? '活动' : '新闻'
  return kind === 'event' ? 'Event' : 'News'
}

export function NewsPage({ lang }: { lang: AdminLang }) {
  const t = getCopy(lang)
  const zh = lang === 'zh'
  const [items, setItems] = useState(() => loadNewsArticles())
  const [busyId, setBusyId] = useState('')

  const remove = async (article: NewsArticle) => {
    if (
      !window.confirm(
        zh ? `将「${article.titleZh || article.titleEn}」移入废纸篓？` : `Move “${article.titleEn}” to Trash?`,
      )
    ) {
      return
    }
    setBusyId(article.id)
    const trashed = await moveToTrash(makeNewsTrashItem(article), { deleteOriginal: false })
    if (!trashed.ok) {
      setBusyId('')
      window.alert(trashed.error)
      return
    }
    const next = items.filter((a) => a.id !== article.id)
    const saved = await saveContentFile('content/news.json', next)
    setBusyId('')
    if (!saved.ok) {
      window.alert(saved.error)
      return
    }
    setItems(next)
  }

  return (
    <>
      <PageHeader
        title={t.news}
        action={
          <Link className="admin-btn admin-btn-primary" to="/news/new">
            {zh ? '+ 新建文章' : '+ New article'}
          </Link>
        }
      />
      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{zh ? '文章' : 'Article'}</th>
              <th>{zh ? '日期' : 'Date'}</th>
              <th>{zh ? '类型' : 'Kind'}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td>
                  <div className="admin-project-cell">
                    {a.image ? (
                      <AdminMediaImage src={a.image} className="admin-thumb" />
                    ) : (
                      <div className="admin-thumb admin-thumb--empty" />
                    )}
                    <div>
                      <div className="admin-bi">{zh ? a.titleZh || a.titleEn : a.titleEn || a.titleZh}</div>
                      <div className="admin-bi-zh">{a.slug}</div>
                    </div>
                  </div>
                </td>
                <td>{zh ? a.dateLabelZh || a.date : a.dateLabelEn || a.date}</td>
                <td>
                  <span className={`admin-tag ${a.kind === 'event' ? 'admin-tag--progress' : 'admin-tag--published'}`}>
                    {kindLabel(a.kind, lang)}
                  </span>
                </td>
                <td>
                  <div className="admin-row-actions">
                    <Link className="admin-btn" to={`/news/${a.id}`}>
                      {zh ? '编辑' : 'Edit'}
                    </Link>
                    <button
                      type="button"
                      className="admin-btn admin-btn-danger"
                      disabled={busyId === a.id}
                      onClick={() => void remove(a)}
                    >
                      {zh ? '删除' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function NewsEditorPage({ lang }: { lang: AdminLang }) {
  const t = getCopy(lang)
  const zh = lang === 'zh'
  const lb = (en: string, cn: string) => (zh ? cn : en)
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'

  const [all, setAll] = useState(() => loadNewsArticles())
  const [data, setData] = useState<NewsArticle>(() => {
    if (isNew) return blankArticle()
    return loadNewsArticles().find((a) => a.id === id) || blankArticle()
  })
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const list = loadNewsArticles()
    setAll((prev) => {
      // Keep just-saved articles that Vite's eager glob has not picked up yet
      const byId = new Map(list.map((a) => [a.id, a]))
      for (const a of prev) {
        if (!byId.has(a.id)) byId.set(a.id, a)
      }
      return Array.from(byId.values()).sort((a, b) => b.date.localeCompare(a.date))
    })
    if (isNew) {
      setData(blankArticle())
      return
    }
    setData((current) => {
      const found = list.find((a) => a.id === id)
      if (found) return found
      // After first save, route changes to /news/:id but glob may still be stale
      if (current.id === id) return current
      return blankArticle()
    })
  }, [id, isNew])

  const set = <K extends keyof NewsArticle>(key: K, value: NewsArticle[K]) => {
    setData((d) => ({ ...d, [key]: value }))
  }

  const setDate = (iso: string) => {
    setData((d) => ({ ...d, ...labelsFromDate(iso) }))
  }

  const save = async () => {
    const sid = data.id.trim() || data.slug.trim()
    if (!sid) {
      setStatus(zh ? '请填写 ID' : 'ID is required')
      return
    }
    const synced = { ...data, ...labelsFromDate(data.date) }
    const payload: NewsArticle = {
      ...synced,
      id: sid,
      slug: data.slug.trim() || sid,
      image: data.image || '',
      blocks: data.blocks || [],
      // Clear legacy body fields so site uses blocks only
      bodyEn: undefined,
      bodyZh: undefined,
      eventDetailsEn: data.kind === 'event' ? toHtml(data.eventDetailsEn) : undefined,
      eventDetailsZh: data.kind === 'event' ? toHtml(data.eventDetailsZh) : undefined,
      registerUrl: data.kind === 'event' ? data.registerUrl || '' : undefined,
    }
    const withoutCurrent = all.filter((a) => a.id !== id && a.id !== payload.id && a.id !== data.id)
    const cleaned = [...withoutCurrent, payload].sort((a, b) => b.date.localeCompare(a.date))

    setBusy(true)
    setStatus('')
    const res = await saveContentFile('content/news.json', cleaned)
    setBusy(false)
    setStatus(res.ok ? t.saved : res.error)
    if (res.ok) {
      const kept = normalizeArticle(payload)
      setAll(cleaned.map((a) => (a.id === kept.id ? kept : normalizeArticle(a))))
      setData(kept)
      if (isNew || id !== payload.id) navigate(`/news/${payload.id}`, { replace: true })
    }
  }

  const remove = async () => {
    if (!window.confirm(zh ? '将这篇文章移入废纸篓？' : 'Move this article to Trash?')) return
    setBusy(true)
    const trashed = await moveToTrash(makeNewsTrashItem(data), { deleteOriginal: false })
    if (!trashed.ok) {
      setBusy(false)
      setStatus(trashed.error)
      return
    }
    const next = all.filter((a) => a.id !== data.id && a.id !== id)
    const saved = await saveContentFile('content/news.json', next)
    setBusy(false)
    if (!saved.ok) {
      setStatus(saved.error)
      return
    }
    navigate('/news')
  }

  const dateMeta = labelsFromDate(data.date)

  return (
    <>
      <PageHeader
        title={isNew ? (zh ? '新建文章' : 'New article') : data.titleEn || data.titleZh || data.id}
        back={
          <Link className="admin-btn" to="/news">
            {zh ? '返回列表' : 'Back'}
          </Link>
        }
        action={
          <div className="admin-quick">
            {!isNew && (
              <button type="button" className="admin-btn admin-btn-danger" disabled={busy} onClick={() => void remove()}>
                {zh ? '删除' : 'Delete'}
              </button>
            )}
            <button type="button" className="admin-btn admin-btn-primary" disabled={busy} onClick={() => void save()}>
              {busy ? t.saving : t.save}
            </button>
          </div>
        }
      />
      {status && <p className={`admin-status ${status === t.saved ? 'is-ok' : 'is-err'}`}>{status}</p>}

      <section className="admin-card">
        <h2>{lb('Basics', '基础信息')}</h2>
        <div className="admin-grid-2">
          <Field label="ID" value={data.id} onChange={(v) => set('id', v)} />
          <Field label="Slug" value={data.slug} onChange={(v) => set('slug', v)} />
          <SelectField
            label={lb('Kind', '类型')}
            value={data.kind}
            onChange={(v) => set('kind', v as NewsArticle['kind'])}
            options={[
              { value: 'news', label: zh ? '新闻' : 'News' },
              { value: 'event', label: zh ? '活动' : 'Event' },
            ]}
          />
          <div className="admin-field admin-date-sync">
            <span>{lb('Date', '日期')}</span>
            <input type="date" value={data.date} onChange={(e) => setDate(e.target.value)} />
            <p className="admin-date-sync-meta">
              {zh
                ? `自动同步：${dateMeta.dateLabelEn} · ${dateMeta.dateLabelZh} · 归档 ${dateMeta.archiveYear}/${dateMeta.archiveMonth}`
                : `Auto-fills: ${dateMeta.dateLabelEn} · ${dateMeta.dateLabelZh} · archive ${dateMeta.archiveYear}/${dateMeta.archiveMonth}`}
            </p>
          </div>
          <Field label={lb('Title (EN)', '标题（英文）')} value={data.titleEn} onChange={(v) => set('titleEn', v)} />
          <Field label={lb('Title (ZH)', '标题（中文）')} value={data.titleZh} onChange={(v) => set('titleZh', v)} />
        </div>
      </section>

      <section className="admin-card">
        <h2>{lb('Cover image', '封面图')}</h2>
        <ImageField
          label={lb('Article image', '文章图片')}
          value={data.image || ''}
          onChange={(v) => set('image', v)}
          lang={lang}
        />
      </section>

      <section className="admin-card">
        <h2>{lb('Summary', '摘要')}</h2>
        <div className="admin-grid-2">
          <Field
            label={lb('Summary (EN)', '摘要（英文）')}
            value={data.summaryEn}
            onChange={(v) => set('summaryEn', v)}
            multiline
          />
          <Field
            label={lb('Summary (ZH)', '摘要（中文）')}
            value={data.summaryZh}
            onChange={(v) => set('summaryZh', v)}
            multiline
          />
        </div>
      </section>

      <section className="admin-card">
        <ContentBlocksEditor
          lang={lang}
          blocks={data.blocks || []}
          onChange={(blocks) => set('blocks', blocks)}
        />
      </section>

      {data.kind === 'event' && (
        <section className="admin-card">
          <h2>{lb('Event details', '活动详情')}</h2>
          <div className="admin-grid-2">
            <RichTextField
              label={lb('Event details (EN)', '活动详情（英文）')}
              value={data.eventDetailsEn}
              onChange={(v) => set('eventDetailsEn', v)}
              lang={lang}
              contentKey={`${data.id}-event-en`}
            />
            <RichTextField
              label={lb('Event details (ZH)', '活动详情（中文）')}
              value={data.eventDetailsZh}
              onChange={(v) => set('eventDetailsZh', v)}
              lang={lang}
              contentKey={`${data.id}-event-zh`}
            />
            <Field
              className="admin-field--full"
              label={lb('Register URL (optional)', '报名链接（可选）')}
              value={data.registerUrl || ''}
              onChange={(v) => set('registerUrl', v)}
              hint={
                zh
                  ? '留空则按钮指向联系页 /contact'
                  : 'Leave blank to link the Register button to /contact'
              }
            />
            <Field
              label={lb('Banner title (ZH)', '横幅标题（中文）')}
              value={data.bannerTitleZh || ''}
              onChange={(v) => set('bannerTitleZh', v)}
            />
            <Field
              label={lb('Banner sub (ZH)', '横幅副标题（中文）')}
              value={data.bannerSubZh || ''}
              onChange={(v) => set('bannerSubZh', v)}
            />
          </div>
        </section>
      )}
    </>
  )
}
