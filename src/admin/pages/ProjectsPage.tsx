import { useEffect, useRef, useState, type DragEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../AdminApp'
import { getCopy, type AdminLang } from '../lib/i18n'
import { moveToTrash, saveContentFile, callCmsFunction } from '../lib/contentApi'
import { Field, ImageField, LinesField, SelectField } from '../components/Fields'
import { ContentBlocksEditor } from '../components/ContentBlocksEditor'
import { AdminMediaImage } from '../components/AdminMediaImage'
import {
  emptyProject,
  loadProjectsForAdmin,
  loadProjectsFromModules,
  normalizeProjectImages,
  withProjectBlocks,
  type ProjectRecord,
} from '../lib/projectTypes'
import { labelStatus, labelType, statusOptions, statusTone, typeOptions } from '../lib/projectLabels'
import { makeProjectTrashItem } from '../lib/trash'

function numOrNull(v: string): number | null {
  if (v.trim() === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function liveProjects() {
  return loadProjectsFromModules().filter((p) => p.published !== false)
}

async function persistProjectOrder(slugs: string[]): Promise<string | null> {
  const res = await saveContentFile('content/project-order.json', slugs)
  if (!res.ok) return res.error

  // Push the same order to main so the public site rebuilds to match admin.
  if (!import.meta.env.DEV) {
    const sync = await callCmsFunction('sync-project-order')
    if (!sync.ok) {
      return String(sync.data.error || 'Order saved to drafts, but live site sync failed. Use Publish.')
    }
  }
  return null
}

export function ProjectsPage({ lang }: { lang: AdminLang }) {
  const t = getCopy(lang)
  const [projects, setProjects] = useState(() => liveProjects())
  const [busySlug, setBusySlug] = useState('')
  const [migrateNote, setMigrateNote] = useState('')
  const [orderStatus, setOrderStatus] = useState('')
  const [draggingSlug, setDraggingSlug] = useState('')
  const dragSlugRef = useRef('')
  const projectsRef = useRef(projects)
  projectsRef.current = projects

  // Load cms-branch projects (production) and migrate old unpublished drafts into trash.
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const all = await loadProjectsForAdmin()
      if (cancelled) return
      const drafts = all.filter((p) => p.published === false)
      const movedSlugs = new Set<string>()
      for (const p of drafts) {
        const res = await moveToTrash(makeProjectTrashItem(p))
        if (res.ok) movedSlugs.add(p.slug)
      }
      if (cancelled) return
      const live = all.filter((p) => p.published !== false && !movedSlugs.has(p.slug))
      setProjects(live)
      if (movedSlugs.size > 0) {
        setMigrateNote(
          lang === 'zh'
            ? `已将 ${movedSlugs.size} 个旧草稿项目移入废纸篓，项目列表仅保留网站展示内容。`
            : `Moved ${movedSlugs.size} draft project(s) to Trash. Projects now lists live site content only.`,
        )
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [lang])

  const remove = async (p: ProjectRecord) => {
    if (
      !window.confirm(
        lang === 'zh'
          ? `将项目「${p.nameZh || p.nameEn}」移入废纸篓？网站上将不再显示。`
          : `Move “${p.nameEn}” to Trash? It will disappear from the website.`,
      )
    ) {
      return
    }
    setBusySlug(p.slug)
    const res = await moveToTrash(makeProjectTrashItem(p))
    setBusySlug('')
    if (!res.ok) {
      window.alert(res.error)
      return
    }
    const next = projects.filter((x) => x.slug !== p.slug)
    setProjects(next)
    const err = await persistProjectOrder(next.map((x) => x.slug))
    if (err) window.alert(err)
  }

  const onDragStart = (slug: string) => {
    dragSlugRef.current = slug
    setDraggingSlug(slug)
  }

  const onDragOver = (e: DragEvent, overSlug: string) => {
    e.preventDefault()
    const from = dragSlugRef.current
    if (!from || from === overSlug) return
    setProjects((list) => {
      const fromIdx = list.findIndex((p) => p.slug === from)
      const toIdx = list.findIndex((p) => p.slug === overSlug)
      if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return list
      const next = [...list]
      const [item] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, item)
      return next
    })
  }

  const onDragEnd = async () => {
    const slug = dragSlugRef.current
    dragSlugRef.current = ''
    setDraggingSlug('')
    if (!slug) return
    setOrderStatus(lang === 'zh' ? '正在保存排序…' : 'Saving order…')
    const err = await persistProjectOrder(projectsRef.current.map((p) => p.slug))
    setOrderStatus(
      err
        ? err
        : lang === 'zh'
          ? '排序已保存（网站列表将按此顺序显示）。'
          : 'Order saved. Site lists will follow this order.',
    )
  }

  const moveBy = async (slug: string, dir: -1 | 1) => {
    const list = projectsRef.current
    const from = list.findIndex((p) => p.slug === slug)
    const to = from + dir
    if (from < 0 || to < 0 || to >= list.length) return
    const next = [...list]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    setProjects(next)
    projectsRef.current = next
    setOrderStatus(lang === 'zh' ? '正在保存排序…' : 'Saving order…')
    const err = await persistProjectOrder(next.map((p) => p.slug))
    setOrderStatus(
      err
        ? err
        : lang === 'zh'
          ? '排序已保存（网站列表将按此顺序显示）。'
          : 'Order saved. Site lists will follow this order.',
    )
  }

  const zh = lang === 'zh'

  return (
    <>
      <PageHeader
        title={t.projects}
        action={
          <Link className="admin-btn admin-btn-primary" to="/projects/new">
            {zh ? '+ 新建项目' : '+ New project'}
          </Link>
        }
      />
      {migrateNote && <p className="admin-status is-ok">{migrateNote}</p>}
      <p className="admin-hint">
        {zh
          ? '默认按创立年份从新到旧。可拖拽左侧 ⋮⋮，或用右侧 ↑↓ 调整顺序；保存后会同步到正式站（需短暂重新部署）。'
          : 'Default order is newest creation year first. Drag ⋮⋮ or use ↑↓ to reorder; saving syncs to the live site (short redeploy).'}
      </p>
      {orderStatus && (
        <p className={`admin-status ${orderStatus.includes('…') || orderStatus.includes('Saving') ? '' : orderStatus.includes('失败') || /error|fail|Could/i.test(orderStatus) ? 'is-err' : 'is-ok'}`}>
          {orderStatus}
        </p>
      )}
      <div className="admin-card">
        <table className="admin-table admin-table--dnd">
          <thead>
            <tr>
              <th className="admin-th-drag" aria-label={zh ? '排序' : 'Reorder'} />
              <th>{zh ? '项目' : 'Project'}</th>
              <th>{zh ? '年份' : 'Year'}</th>
              <th>{zh ? '城市' : 'City'}</th>
              <th>{zh ? '状态' : 'Status'}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {projects.map((p, index) => (
              <tr
                key={p.slug}
                className={draggingSlug === p.slug ? 'is-dragging' : ''}
                draggable
                onDragStart={() => onDragStart(p.slug)}
                onDragOver={(e) => onDragOver(e, p.slug)}
                onDragEnd={() => void onDragEnd()}
              >
                <td className="admin-td-drag">
                  <span className="admin-drag-handle" title={zh ? '拖拽排序' : 'Drag to reorder'} aria-hidden="true">
                    ⋮⋮
                  </span>
                </td>
                <td>
                  <div className="admin-project-cell">
                    {p.image ? <AdminMediaImage src={p.image} className="admin-thumb" /> : null}
                    <div>
                      <div className="admin-bi">{zh ? p.nameZh || p.nameEn : p.nameEn}</div>
                      <div className="admin-bi-zh">{p.slug}</div>
                    </div>
                  </div>
                </td>
                <td>{p.year}</td>
                <td>{zh ? p.cityZh || p.cityEn : p.cityEn}</td>
                <td>
                  <span className={`admin-tag ${statusTone(p.status)}`}>{labelStatus(p.status, lang)}</span>
                  <span className="admin-tag admin-tag--type">{labelType(p.type, lang)}</span>
                </td>
                <td onMouseDown={(e) => e.stopPropagation()}>
                  <div className="admin-row-actions">
                    <div className="admin-order-btns">
                      <button
                        type="button"
                        className="admin-btn admin-btn-icon"
                        disabled={index === 0}
                        title={zh ? '上移' : 'Move up'}
                        aria-label={zh ? '上移' : 'Move up'}
                        onClick={(e) => {
                          e.stopPropagation()
                          void moveBy(p.slug, -1)
                        }}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-icon"
                        disabled={index === projects.length - 1}
                        title={zh ? '下移' : 'Move down'}
                        aria-label={zh ? '下移' : 'Move down'}
                        onClick={(e) => {
                          e.stopPropagation()
                          void moveBy(p.slug, 1)
                        }}
                      >
                        ↓
                      </button>
                    </div>
                    <Link className="admin-btn" to={`/projects/${p.slug}`}>
                      {zh ? '编辑' : 'Edit'}
                    </Link>
                    <button
                      type="button"
                      className="admin-btn admin-btn-danger"
                      disabled={busySlug === p.slug}
                      onClick={() => void remove(p)}
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

export function ProjectEditorPage({ lang }: { lang: AdminLang }) {
  const t = getCopy(lang)
  const { slug } = useParams()
  const navigate = useNavigate()
  const isNew = slug === 'new'
  const [data, setData] = useState<ProjectRecord>(() => {
    if (isNew) return emptyProject()
    const found = loadProjectsFromModules().find((p) => p.slug === slug)
    return found ? withProjectBlocks(structuredClone(found)) : emptyProject()
  })
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      if (isNew) {
        setData(emptyProject())
        return
      }
      const all = await loadProjectsForAdmin()
      if (cancelled) return
      const found = all.find((p) => p.slug === slug)
      setData(found ? withProjectBlocks(structuredClone(found)) : emptyProject())
    })()
    return () => {
      cancelled = true
    }
  }, [slug, isNew])

  const set = <K extends keyof ProjectRecord>(key: K, value: ProjectRecord[K]) => {
    setData((d) => ({ ...d, [key]: value }))
  }

  const save = async () => {
    const s = data.slug.trim() || data.id.trim()
    if (!s) {
      setStatus(lang === 'zh' ? '请填写 slug' : 'Slug is required')
      return
    }
    const { image, images } = normalizeProjectImages(data)
    if (!image.trim()) {
      setStatus(lang === 'zh' ? '封面图 #1 必须上传图片后才能保存。' : 'Cover #1 image is required before saving.')
      return
    }
    const withBlocks = withProjectBlocks({ ...data, image, images })
    const payload = {
      ...withBlocks,
      slug: s,
      id: data.id.trim() || s,
      published: true,
      image,
      images,
      blocks: withBlocks.blocks || [],
      // Prefer modular blocks on the public site
      bodyEn: '',
      bodyZh: '',
    }
    setBusy(true)
    setStatus('')
    const res = await saveContentFile(`content/projects/${s}.json`, payload)
    if (!res.ok) {
      setBusy(false)
      setStatus(res.error)
      return
    }

    // Keep manual order in sync: new projects go to the top (newest first).
    if (isNew) {
      const existing = loadProjectsFromModules()
        .map((p) => p.slug)
        .filter((slug) => slug !== s)
      await persistProjectOrder([s, ...existing])
    }

    setBusy(false)
    setStatus(t.saved)
    setData(payload)
    if (isNew) navigate(`/projects/${s}`, { replace: true })
  }

  const remove = async () => {
    if (!data.slug) return
    if (
      !window.confirm(
        lang === 'zh'
          ? `将项目移入废纸篓？网站上将不再显示。`
          : `Move this project to Trash? It will disappear from the website.`,
      )
    ) {
      return
    }
    setBusy(true)
    const res = await moveToTrash(makeProjectTrashItem(data))
    setBusy(false)
    if (res.ok) navigate('/projects')
    else setStatus(res.error)
  }

  const zh = lang === 'zh'

  return (
    <>
      <PageHeader
        title={isNew ? (zh ? '新建项目' : 'New project') : data.nameEn || data.slug}
        back={
          <Link className="admin-btn" to="/projects">
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
        <h2>{zh ? '基础信息' : 'Basics'}</h2>
        <div className="admin-grid-2">
          <Field
            label={zh ? 'Slug / 网址 ID' : 'Slug / URL id'}
            value={data.slug}
            onChange={(v) => set('slug', v)}
            hint="e.g. ormonde-gate"
          />
          <Field label="ID" value={data.id} onChange={(v) => set('id', v)} hint={zh ? '通常与 slug 相同' : 'Usually same as slug'} />
          <Field label={zh ? '名称（英文）' : 'Name (EN)'} value={data.nameEn} onChange={(v) => set('nameEn', v)} />
          <Field label={zh ? '名称（中文）' : '名称（中文）'} value={data.nameZh} onChange={(v) => set('nameZh', v)} />
          <Field label={zh ? '城市（英文）' : 'City (EN)'} value={data.cityEn} onChange={(v) => set('cityEn', v)} />
          <Field label={zh ? '城市（中文）' : '城市（中文）'} value={data.cityZh} onChange={(v) => set('cityZh', v)} />
          <SelectField label={zh ? '类型' : 'Type'} value={data.type} onChange={(v) => set('type', v)} options={typeOptions(lang)} />
          <SelectField
            label={zh ? '项目状态' : 'Status'}
            value={data.status}
            onChange={(v) => set('status', v)}
            options={statusOptions(lang)}
          />
          <Field label={zh ? '年份' : 'Year'} value={String(data.year)} onChange={(v) => set('year', Number(v) || 0)} type="number" />
          <Field
            label={zh ? '网站项目名旁的链接' : 'Link next to name on site'}
            value={data.link || ''}
            onChange={(v) => set('link', v)}
            hint={
              zh
                ? '填写完整网址，例如 https://…。保存后会在网站项目详情页标题旁显示可点击图标。'
                : 'Full URL, e.g. https://…. After save, a clickable icon appears next to the title on the public project page.'
            }
          />
        </div>
      </section>

      <section className="admin-card">
        <h2>{zh ? '项目图片（多图轮播）' : 'Project images (carousel)'}</h2>
        <p className="admin-hint" style={{ marginTop: 0 }}>
          {zh
            ? '封面图 #1 必填（列表 / 首页默认图）；其余按顺序加入轮播。可上下调整顺序。'
            : 'Cover #1 is required (lists & home). Extra images rotate in the carousel. Reorder with ↑ ↓.'}
        </p>
        <div className="admin-gallery-editor">
          {(data.images.length ? data.images : ['']).map((src, i, arr) => (
            <div key={`img-${i}`} className="admin-subcard">
              <div className="admin-card-head">
                <h3>
                  {i === 0 ? (
                    <>
                      {zh ? '封面图 #1' : 'Cover #1'} <span className="req">*</span>
                    </>
                  ) : zh ? (
                    `轮播图 #${i + 1}`
                  ) : (
                    `Gallery #${i + 1}`
                  )}
                </h3>
                <div className="admin-row-actions">
                  <button
                    type="button"
                    className="admin-btn"
                    disabled={i === 0}
                    onClick={() => {
                      const list = [...arr]
                      ;[list[i - 1], list[i]] = [list[i], list[i - 1]]
                      setData((d) => ({ ...d, images: list, image: list.find(Boolean) || list[0] || '' }))
                    }}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="admin-btn"
                    disabled={i >= arr.length - 1}
                    onClick={() => {
                      const list = [...arr]
                      ;[list[i], list[i + 1]] = [list[i + 1], list[i]]
                      setData((d) => ({ ...d, images: list, image: list.find(Boolean) || list[0] || '' }))
                    }}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger"
                    disabled={i === 0 && arr.length === 1}
                    onClick={() => {
                      const list = arr.filter((_, x) => x !== i)
                      const next = list.length ? list : ['']
                      setData((d) => ({ ...d, images: next, image: next.find(Boolean) || '' }))
                    }}
                  >
                    {zh ? '删除' : 'Remove'}
                  </button>
                </div>
              </div>
              <ImageField
                label={i === 0 ? (zh ? '图片（必填）' : 'Image (required)') : zh ? '图片' : 'Image'}
                value={src}
                onChange={(v) => {
                  const list = [...arr]
                  list[i] = v
                  setData((d) => ({ ...d, images: list, image: list.find(Boolean) || '' }))
                }}
                lang={lang}
              />
            </div>
          ))}
          <button
            type="button"
            className="admin-btn"
            onClick={() =>
              setData((d) => {
                const list = [...(d.images.length ? d.images : d.image ? [d.image] : []), '']
                return { ...d, images: list, image: list.find(Boolean) || '' }
              })
            }
          >
            {zh ? '+ 添加图片' : '+ Add image'}
          </button>
        </div>
      </section>

      <section className="admin-card">
        <h2>{zh ? '文案' : 'Copy'}</h2>
        <div className="admin-grid-2">
          <Field label={zh ? '摘要（英文）' : 'Summary (EN)'} value={data.summaryEn} onChange={(v) => set('summaryEn', v)} multiline />
          <Field label={zh ? '摘要（中文）' : '摘要（中文）'} value={data.summaryZh} onChange={(v) => set('summaryZh', v)} multiline />
          <LinesField
            label={zh ? '亮点（英文，每行一条）' : 'Highlights EN (one per line)'}
            value={data.highlightsEn}
            onChange={(v) => set('highlightsEn', v)}
          />
          <LinesField
            label={zh ? '亮点（中文，每行一条）' : 'Highlights ZH (one per line)'}
            value={data.highlightsZh}
            onChange={(v) => set('highlightsZh', v)}
          />
        </div>
      </section>

      <section className="admin-card">
        <ContentBlocksEditor
          lang={lang}
          title={zh ? '项目内容块' : 'Project content blocks'}
          blocks={data.blocks || []}
          onChange={(blocks) => set('blocks', blocks)}
        />
        <p className="admin-hint" style={{ marginTop: '0.75rem' }}>
          {zh
            ? '与新闻相同：可用「+ 文本块」「+ 图片块」「+ 图集」组合正文，图文分开互不覆盖。'
            : 'Same as News: build the body with text, image, and gallery blocks so media never overwrites copy.'}
        </p>
      </section>

      <section className="admin-card">
        <h2>{zh ? '数据与地图' : 'Numbers & map'}</h2>
        <div className="admin-grid-2">
          <Field
            label={zh ? '户数 / Units' : 'Units'}
            value={data.units == null ? '' : String(data.units)}
            onChange={(v) => set('units', numOrNull(v))}
          />
          <Field
            label={zh ? '栋数 / Buildings' : 'Buildings'}
            value={data.buildings == null ? '' : String(data.buildings)}
            onChange={(v) => set('buildings', numOrNull(v))}
          />
          <Field
            label={zh ? '售价（百万美元）' : 'Sale value ($M)'}
            value={data.saleValueM == null ? '' : String(data.saleValueM)}
            onChange={(v) => set('saleValueM', numOrNull(v))}
          />
          <Field
            label={zh ? '收购价（百万美元）' : 'Acquisition ($M)'}
            value={data.acquisitionPriceM == null ? '' : String(data.acquisitionPriceM)}
            onChange={(v) => set('acquisitionPriceM', numOrNull(v))}
          />
          <Field label={zh ? '纬度' : 'Latitude'} value={String(data.lat)} onChange={(v) => set('lat', Number(v) || 0)} />
          <Field label={zh ? '经度' : 'Longitude'} value={String(data.lng)} onChange={(v) => set('lng', Number(v) || 0)} />
        </div>
      </section>
    </>
  )
}
