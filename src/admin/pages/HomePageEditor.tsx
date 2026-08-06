import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../AdminApp'
import { getCopy, type AdminLang } from '../lib/i18n'
import { loadContentJson, saveContentFile } from '../lib/contentApi'
import { Field, ImageField } from '../components/Fields'
import { AdminMediaImage } from '../components/AdminMediaImage'
import { newsArticles } from '../../data/news'
import { loadProjectsFromModules } from '../lib/projectTypes'
import homeRaw from '../../../content/home.json'

type HomeData = typeof homeRaw & {
  allProjectsHref?: string
  discoverMoreEn?: string
  discoverMoreZh?: string
  newsTitleEn?: string
  newsTitleZh?: string
  newsAllEn?: string
  newsAllZh?: string
  newsAllHref?: string
  newsReadEn?: string
  newsReadZh?: string
  newsCount?: number
  copyrightYear?: number
}
type Slide = HomeData['heroSlides'][number]

function withHomeDefaults(raw: typeof homeRaw): HomeData {
  const year = String(Number(raw.foundedYear) || 2018)
  const clone = structuredClone(raw)
  return {
    ...clone,
    heroEyebrowEn: (clone.heroEyebrowEn || 'Est. 2018 · Seattle').replaceAll('{year}', year),
    heroEyebrowZh: (clone.heroEyebrowZh || '创立于 2018 · 西雅图').replaceAll('{year}', year),
    allProjectsHref: (raw as HomeData).allProjectsHref || '/projects',
    discoverMoreEn: (raw as HomeData).discoverMoreEn || 'Discover more',
    discoverMoreZh: (raw as HomeData).discoverMoreZh || '了解更多',
    newsTitleEn: (raw as HomeData).newsTitleEn || 'News',
    newsTitleZh: (raw as HomeData).newsTitleZh || '新闻资讯',
    newsAllEn: (raw as HomeData).newsAllEn || 'All news',
    newsAllZh: (raw as HomeData).newsAllZh || '全部资讯',
    newsAllHref: (raw as HomeData).newsAllHref || '/news',
    newsReadEn: (raw as HomeData).newsReadEn || 'Read more',
    newsReadZh: (raw as HomeData).newsReadZh || '阅读更多',
    newsCount: Number((raw as HomeData).newsCount) || 3,
    copyrightYear: Number((raw as HomeData).copyrightYear) || new Date().getFullYear(),
  }
}

export function HomePageEditor({ lang }: { lang: AdminLang }) {
  const t = getCopy(lang)
  const [data, setData] = useState<HomeData>(() => withHomeDefaults(homeRaw))
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const projects = useMemo(() => loadProjectsFromModules(), [])
  const railProjects = projects.filter((p) => p.published !== false)
  const previewNews = newsArticles.slice(0, Math.max(1, Number(data.newsCount) || 1))

  useEffect(() => {
    let cancelled = false
    void loadContentJson('content/home.json', homeRaw).then((remote) => {
      if (!cancelled) setData(withHomeDefaults(remote))
    })
    return () => {
      cancelled = true
    }
  }, [])

  const set = <K extends keyof HomeData>(key: K, value: HomeData[K]) => {
    setData((d) => ({ ...d, [key]: value }))
  }

  const setSlide = (index: number, patch: Partial<Slide>) => {
    setData((d) => {
      const heroSlides = d.heroSlides.map((s, i) => (i === index ? { ...s, ...patch } : s))
      return { ...d, heroSlides }
    })
  }

  const addSlide = () => {
    setData((d) => ({
      ...d,
      heroSlides: [...d.heroSlides, { src: '', altEn: '', altZh: '' }],
    }))
  }

  const removeSlide = (index: number) => {
    setData((d) => ({
      ...d,
      heroSlides: d.heroSlides.filter((_, i) => i !== index),
    }))
  }

  const save = async () => {
    setBusy(true)
    setStatus('')
    const res = await saveContentFile('content/home.json', data)
    setBusy(false)
    setStatus(res.ok ? t.saved : res.error)
  }

  const zh = lang === 'zh'
  const lb = (en: string, cn: string) => (zh ? cn : en)

  return (
    <>
      <PageHeader
        title={t.home}
        action={
          <button type="button" className="admin-btn admin-btn-primary" disabled={busy} onClick={() => void save()}>
            {busy ? t.saving : t.save}
          </button>
        }
      />
      {status && <p className={`admin-status ${status === t.saved ? 'is-ok' : 'is-err'}`}>{status}</p>}

      <section className="admin-card">
        <h2>{lb('Hero · copy', '主视觉 · 文案')}</h2>
        <div className="admin-grid-2">
          <Field label={lb('Eyebrow (EN)', '眉标（英文）')} value={data.heroEyebrowEn} onChange={(v) => set('heroEyebrowEn', v)} />
          <Field label={lb('Eyebrow (ZH)', '眉标（中文）')} value={data.heroEyebrowZh} onChange={(v) => set('heroEyebrowZh', v)} />
          <Field label={lb('Brand left (EN)', '品牌左（英文）')} value={data.brandLeftEn} onChange={(v) => set('brandLeftEn', v)} />
          <Field label={lb('Brand left (ZH)', '品牌左（中文）')} value={data.brandLeftZh} onChange={(v) => set('brandLeftZh', v)} />
          <Field label={lb('Brand right (EN)', '品牌右（英文）')} value={data.brandRightEn} onChange={(v) => set('brandRightEn', v)} />
          <Field label={lb('Brand right (ZH)', '品牌右（中文）')} value={data.brandRightZh} onChange={(v) => set('brandRightZh', v)} />
          <Field label={lb('Lead (EN)', '导语（英文）')} value={data.heroLeadEn} onChange={(v) => set('heroLeadEn', v)} multiline />
          <Field label={lb('Lead (ZH)', '导语（中文）')} value={data.heroLeadZh} onChange={(v) => set('heroLeadZh', v)} multiline />
          <Field
            label={lb('CTA primary (EN)', '主按钮（英文）')}
            value={data.heroCtaProjectsEn}
            onChange={(v) => set('heroCtaProjectsEn', v)}
          />
          <Field
            label={lb('CTA primary (ZH)', '主按钮（中文）')}
            value={data.heroCtaProjectsZh}
            onChange={(v) => set('heroCtaProjectsZh', v)}
          />
          <Field
            className="admin-field--full"
            label={lb('CTA primary URL', '主按钮链接')}
            value={data.heroCtaProjectsHref}
            onChange={(v) => set('heroCtaProjectsHref', v)}
          />
          <Field
            label={lb('CTA secondary (EN)', '次按钮（英文）')}
            value={data.heroCtaAboutEn}
            onChange={(v) => set('heroCtaAboutEn', v)}
          />
          <Field
            label={lb('CTA secondary (ZH)', '次按钮（中文）')}
            value={data.heroCtaAboutZh}
            onChange={(v) => set('heroCtaAboutZh', v)}
          />
          <Field
            className="admin-field--full"
            label={lb('CTA secondary URL', '次按钮链接')}
            value={data.heroCtaAboutHref}
            onChange={(v) => set('heroCtaAboutHref', v)}
          />
        </div>
      </section>

      <section className="admin-card">
        <div className="admin-card-head">
          <h2>{lb('Hero · slides', '主视觉 · 轮播图')}</h2>
          <button type="button" className="admin-btn" onClick={addSlide}>
            {zh ? '+ 添加幻灯片' : '+ Add slide'}
          </button>
        </div>
        {data.heroSlides.map((slide, i) => (
          <div key={i} className="admin-subcard">
            <div className="admin-card-head">
              <h3>
                {zh ? '幻灯片' : 'Slide'} {i + 1}
              </h3>
              <button type="button" className="admin-btn" onClick={() => removeSlide(i)}>
                {zh ? '删除' : 'Remove'}
              </button>
            </div>
            <ImageField label={zh ? '图片' : 'Image'} value={slide.src} onChange={(v) => setSlide(i, { src: v })} lang={lang} />
            <div className="admin-grid-2">
              <Field label={lb('Alt (EN)', '图片说明（英文）')} value={slide.altEn} onChange={(v) => setSlide(i, { altEn: v })} />
              <Field label={lb('Alt (ZH)', '图片说明（中文）')} value={slide.altZh} onChange={(v) => setSlide(i, { altZh: v })} />
            </div>
          </div>
        ))}
      </section>

      <section className="admin-card">
        <h2>{lb('Who we are', '关于我们板块')}</h2>
        <div className="admin-grid-2">
          <Field label={lb('Eyebrow (EN)', '眉标（英文）')} value={data.whoEyebrowEn} onChange={(v) => set('whoEyebrowEn', v)} />
          <Field label={lb('Eyebrow (ZH)', '眉标（中文）')} value={data.whoEyebrowZh} onChange={(v) => set('whoEyebrowZh', v)} />
          <Field label={lb('Title (EN)', '标题（英文）')} value={data.whoTitleEn} onChange={(v) => set('whoTitleEn', v)} />
          <Field label={lb('Title (ZH)', '标题（中文）')} value={data.whoTitleZh} onChange={(v) => set('whoTitleZh', v)} />
          <Field label={lb('Lead (EN)', '导语（英文）')} value={data.whoLeadEn} onChange={(v) => set('whoLeadEn', v)} multiline />
          <Field label={lb('Lead (ZH)', '导语（中文）')} value={data.whoLeadZh} onChange={(v) => set('whoLeadZh', v)} multiline />
          <Field label={lb('Vision (EN)', '愿景（英文）')} value={data.visionEn} onChange={(v) => set('visionEn', v)} multiline />
          <Field label={lb('Vision (ZH)', '愿景（中文）')} value={data.visionZh} onChange={(v) => set('visionZh', v)} multiline />
        </div>
      </section>

      <section className="admin-card">
        <h2>{lb('Stats', '数据统计')}</h2>
        <div className="admin-grid-2">
          <Field
            className="admin-field--full"
            label={lb('Listings value', '项目数量数值')}
            value={data.statListingsValue}
            onChange={(v) => set('statListingsValue', v)}
            hint={zh ? '留空则使用实时数量' : 'Blank = live count'}
          />
          <Field
            label={lb('Listings label (EN)', '数量标签（英文）')}
            value={data.statListingsLabelEn}
            onChange={(v) => set('statListingsLabelEn', v)}
          />
          <Field
            label={lb('Listings label (ZH)', '数量标签（中文）')}
            value={data.statListingsLabelZh}
            onChange={(v) => set('statListingsLabelZh', v)}
          />
          <Field
            className="admin-field--full"
            label={lb('Sales value', '销售额数值')}
            value={data.statSalesValue}
            onChange={(v) => set('statSalesValue', v)}
          />
          <Field
            label={lb('Sales label (EN)', '销售额标签（英文）')}
            value={data.statSalesLabelEn}
            onChange={(v) => set('statSalesLabelEn', v)}
          />
          <Field
            label={lb('Sales label (ZH)', '销售额标签（中文）')}
            value={data.statSalesLabelZh}
            onChange={(v) => set('statSalesLabelZh', v)}
          />
          <Field
            className="admin-field--full"
            label={lb('Cities value', '城市数量数值')}
            value={data.statCitiesValue}
            onChange={(v) => set('statCitiesValue', v)}
          />
          <Field
            label={lb('Cities label (EN)', '城市标签（英文）')}
            value={data.statCitiesLabelEn}
            onChange={(v) => set('statCitiesLabelEn', v)}
          />
          <Field
            label={lb('Cities label (ZH)', '城市标签（中文）')}
            value={data.statCitiesLabelZh}
            onChange={(v) => set('statCitiesLabelZh', v)}
          />
          <Field label={lb('Note (EN)', '备注（英文）')} value={data.statNoteEn} onChange={(v) => set('statNoteEn', v)} multiline />
          <Field label={lb('Note (ZH)', '备注（中文）')} value={data.statNoteZh} onChange={(v) => set('statNoteZh', v)} multiline />
        </div>
      </section>

      <section className="admin-card">
        <h2>{lb('Spotlight', 'Spotlight 板块')}</h2>
        <ImageField label={zh ? '图片' : 'Image'} value={data.spotlightImage} onChange={(v) => set('spotlightImage', v)} lang={lang} />
        <div className="admin-grid-2">
          <Field label={lb('Alt (EN)', '图片说明（英文）')} value={data.spotlightAltEn} onChange={(v) => set('spotlightAltEn', v)} />
          <Field label={lb('Alt (ZH)', '图片说明（中文）')} value={data.spotlightAltZh} onChange={(v) => set('spotlightAltZh', v)} />
          <Field
            label={lb('Eyebrow (EN)', '眉标（英文）')}
            value={data.spotlightEyebrowEn}
            onChange={(v) => set('spotlightEyebrowEn', v)}
          />
          <Field
            label={lb('Eyebrow (ZH)', '眉标（中文）')}
            value={data.spotlightEyebrowZh}
            onChange={(v) => set('spotlightEyebrowZh', v)}
          />
          <Field label={lb('Title (EN)', '标题（英文）')} value={data.spotlightTitleEn} onChange={(v) => set('spotlightTitleEn', v)} />
          <Field label={lb('Title (ZH)', '标题（中文）')} value={data.spotlightTitleZh} onChange={(v) => set('spotlightTitleZh', v)} />
          <Field
            label={lb('Body (EN)', '正文（英文）')}
            value={data.spotlightBodyEn}
            onChange={(v) => set('spotlightBodyEn', v)}
            multiline
          />
          <Field
            label={lb('Body (ZH)', '正文（中文）')}
            value={data.spotlightBodyZh}
            onChange={(v) => set('spotlightBodyZh', v)}
            multiline
          />
          <Field label={lb('CTA (EN)', '按钮（英文）')} value={data.spotlightCtaEn} onChange={(v) => set('spotlightCtaEn', v)} />
          <Field label={lb('CTA (ZH)', '按钮（中文）')} value={data.spotlightCtaZh} onChange={(v) => set('spotlightCtaZh', v)} />
          <Field
            className="admin-field--full"
            label={lb('CTA URL', '按钮链接')}
            value={data.spotlightCtaHref}
            onChange={(v) => set('spotlightCtaHref', v)}
          />
        </div>
      </section>

      <section className="admin-card">
        <h2>{lb('Projects shaping the region', '项目区')}</h2>
        <div className="admin-grid-2">
          <Field
            label={lb('Section title (EN)', '区块标题（英文）')}
            value={data.selectedTitleEn}
            onChange={(v) => set('selectedTitleEn', v)}
          />
          <Field
            label={lb('Section title (ZH)', '区块标题（中文）')}
            value={data.selectedTitleZh}
            onChange={(v) => set('selectedTitleZh', v)}
          />
          <Field
            label={lb('All projects link (EN)', '全部项目链接（英文）')}
            value={data.allProjectsEn}
            onChange={(v) => set('allProjectsEn', v)}
          />
          <Field
            label={lb('All projects link (ZH)', '全部项目链接（中文）')}
            value={data.allProjectsZh}
            onChange={(v) => set('allProjectsZh', v)}
          />
          <Field
            className="admin-field--full"
            label={lb('Link URL', '链接地址')}
            value={data.allProjectsHref || '/projects'}
            onChange={(v) => set('allProjectsHref', v)}
          />
          <Field
            label={lb('Discover more (EN)', '了解更多（英文）')}
            value={data.discoverMoreEn || ''}
            onChange={(v) => set('discoverMoreEn', v)}
          />
          <Field
            label={lb('Discover more (ZH)', '了解更多（中文）')}
            value={data.discoverMoreZh || ''}
            onChange={(v) => set('discoverMoreZh', v)}
          />
        </div>

        <h3 style={{ marginTop: '1.25rem' }}>
          {lang === 'zh' ? '当前会显示的项目' : 'Projects that will appear'}
          <span className="admin-hint" style={{ marginLeft: '0.5rem', display: 'inline' }}>
            ({railProjects.length})
          </span>
        </h3>
        {railProjects.length === 0 ? (
          <p className="admin-hint">
            {lang === 'zh' ? '暂无已发布项目。' : 'No published projects yet.'}
          </p>
        ) : (
          <div className="admin-preview-list">
            {railProjects.map((p) => (
              <div key={p.slug} className="admin-preview-item">
                {p.image ? <AdminMediaImage src={p.image} /> : <div className="admin-preview-ph" />}
                <div>
                  <strong>{lang === 'zh' ? p.nameZh || p.nameEn : p.nameEn}</strong>
                  <span>
                    {lang === 'zh' ? p.cityZh || p.cityEn : p.cityEn} · {p.type}
                  </span>
                </div>
                <Link className="admin-btn" to={`/projects/${p.slug}`}>
                  {lang === 'zh' ? '编辑项目' : 'Edit'}
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="admin-card">
        <h2>{lb('News section', '首页新闻区')}</h2>
        <div className="admin-grid-2">
          <Field
            label={lb('Section title (EN)', '区块标题（英文）')}
            value={data.newsTitleEn || ''}
            onChange={(v) => set('newsTitleEn', v)}
          />
          <Field
            label={lb('Section title (ZH)', '区块标题（中文）')}
            value={data.newsTitleZh || ''}
            onChange={(v) => set('newsTitleZh', v)}
          />
          <Field
            label={lb('All news link (EN)', '全部资讯（英文）')}
            value={data.newsAllEn || ''}
            onChange={(v) => set('newsAllEn', v)}
          />
          <Field
            label={lb('All news link (ZH)', '全部资讯（中文）')}
            value={data.newsAllZh || ''}
            onChange={(v) => set('newsAllZh', v)}
          />
          <Field
            className="admin-field--full"
            label={lb('All news URL', '全部资讯链接地址')}
            value={data.newsAllHref || '/news'}
            onChange={(v) => set('newsAllHref', v)}
          />
          <Field
            label={lb('Read more (EN)', '阅读更多（英文）')}
            value={data.newsReadEn || ''}
            onChange={(v) => set('newsReadEn', v)}
          />
          <Field
            label={lb('Read more (ZH)', '阅读更多（中文）')}
            value={data.newsReadZh || ''}
            onChange={(v) => set('newsReadZh', v)}
          />
          <Field
            className="admin-field--full"
            label={lb('How many articles', '展示条数')}
            value={String(data.newsCount || 3)}
            onChange={(v) => set('newsCount', Number(v) || 1)}
            type="number"
          />
        </div>

        <h3 style={{ marginTop: '1.25rem' }}>
          {lang === 'zh' ? '当前会显示的新闻' : 'Articles that will appear'}
        </h3>
        <div className="admin-preview-list">
          {previewNews.map((n) => (
            <div key={n.id} className="admin-preview-item admin-preview-item--news">
              <div>
                <strong>{lang === 'zh' ? n.titleZh || n.titleEn : n.titleEn}</strong>
                <span>
                  {n.kind} · {lang === 'zh' ? n.dateLabelZh : n.dateLabelEn}
                </span>
                <p className="admin-preview-summary">{lang === 'zh' ? n.summaryZh : n.summaryEn}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-card">
        <h2>{lb('Footer', '页脚')}</h2>
        <p className="admin-hint" style={{ marginTop: 0 }}>
          {zh
            ? '控制全站页脚版权年份，例如 © 2026 Global Land LLC。'
            : 'Controls the site-wide footer copyright year, e.g. © 2026 Global Land LLC.'}
        </p>
        <div className="admin-grid-2">
          <Field
            label={lb('Copyright year', '版权年份')}
            value={String(data.copyrightYear || new Date().getFullYear())}
            onChange={(v) => set('copyrightYear', Number(v) || new Date().getFullYear())}
            type="number"
            hint={zh ? '显示为 © 年份 公司名' : 'Shown as © YEAR company name'}
          />
        </div>
      </section>
    </>
  )
}
