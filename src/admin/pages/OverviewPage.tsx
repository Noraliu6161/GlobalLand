import { Link } from 'react-router-dom'
import { PageHeader } from '../AdminApp'
import { getCopy, type AdminLang } from '../lib/i18n'

const projectModules = import.meta.glob('../../../content/projects/*.json', { eager: true }) as Record<
  string,
  { default: { published?: boolean; featured?: boolean; nameEn?: string; slug?: string } }
>

export function OverviewPage({ lang }: { lang: AdminLang }) {
  const t = getCopy(lang)
  const projects = Object.values(projectModules).map((m) => m.default)
  const published = projects.filter((p) => p.published !== false).length

  const pages =
    lang === 'zh'
      ? [
          { title: '首页', desc: '轮播、品牌、数据、Spotlight、推荐项目文案', edit: '/home', live: '/' },
          { title: '项目', desc: `网站作品集 · ${published} 个`, edit: '/projects', live: '/projects' },
          { title: '公司', desc: '公司介绍页（文案见站点 i18n / 后续可迁入 CMS）', edit: '/about', live: '/company' },
          { title: '新闻', desc: '网站新闻与活动', edit: '/news', live: '/news' },
          { title: '关于', desc: '团队与社区拼贴图、说明文案', edit: '/about', live: '/about' },
          { title: '废纸篓', desc: '已删除内容，不出现在网站', edit: '/trash', live: '' },
          { title: '联系', desc: '地址与留言表单', edit: '', live: '/contact' },
        ]
      : [
          { title: 'Home', desc: 'Hero slides, brand, stats, spotlight, featured strip copy', edit: '/home', live: '/' },
          { title: 'Projects', desc: `Live portfolio · ${published}`, edit: '/projects', live: '/projects' },
          { title: 'Company', desc: 'Company page (copy in i18n for now)', edit: '/about', live: '/company' },
          { title: 'News', desc: 'Live news and events', edit: '/news', live: '/news' },
          { title: 'About', desc: 'Story, collage images, community copy', edit: '/about', live: '/about' },
          { title: 'Trash', desc: 'Deleted items — not on the website', edit: '/trash', live: '' },
          { title: 'Contact', desc: 'Office and inquiry form', edit: '', live: '/contact' },
        ]

  return (
    <>
      <PageHeader title={t.overview} />
      <div className="admin-card">
        <div className="admin-card-head">
          <h2>{lang === 'zh' ? '网站页面' : 'Site pages'}</h2>
        </div>
        <div className="admin-page-grid">
          {pages.map((p) => (
            <div key={p.title} className="admin-page-tile">
              <strong>{p.title}</strong>
              <span>{p.desc}</span>
              <div className="admin-quick" style={{ marginTop: '0.35rem' }}>
                {p.edit ? <Link to={p.edit}>{lang === 'zh' ? '编辑' : 'Edit'}</Link> : null}
                {p.live ? (
                  <a href={p.live} target="_blank" rel="noreferrer">
                    {lang === 'zh' ? '打开页面' : 'View live'}
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
