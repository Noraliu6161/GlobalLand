import { PageHeader } from '../AdminApp'
import { getCopy, type AdminLang } from '../lib/i18n'

type HelpStep = { n: string; title: string; body: string[] }

export function HelpPage({ lang }: { lang: AdminLang }) {
  const t = getCopy(lang)
  const steps: HelpStep[] =
    lang === 'zh'
      ? [
          {
            n: '1',
            title: '登录',
            body: ['正式环境使用 Netlify Identity 邀请账号登录。'],
          },
          {
            n: '2',
            title: '编辑网站内容',
            body: [
              '左侧菜单里「首页 / 项目 / 新闻 / 关于」编辑的就是网站将要展示的内容。点「保存更改」后写入仓库，但正式站要等「发布」后才会更新。',
              '首页：改主视觉文案、项目导览、数据与页脚等模块；英中字段成对填写。',
              '项目：列表里新建或打开项目。填写名称、城市、状态、封面图、正文要点等。公开页上的外链填在项目的链接字段。不想展示的项目请删除进废纸篓，不要只改成草稿。',
              '新闻：列表里新建或打开文章。先填基础信息（类型 News/Event、日期、标题、摘要、封面）。正文用「文章内容块」：用「+ 文本块」写富文本（加粗、标题、列表、链接），用「+ 图片块」或「+ 图集」加图——图与文字分开，互不覆盖。活动类可再填活动详情、报名链接。',
              '关于：改公司介绍、时间线等英中文案与配图。',
              '图片：在图片字段用 Upload 上传，或 Library 从图库选用；保存后路径会写入内容文件。',
              '改完可先到「发布」页点「预览网站」检查，确认无误再发布正式站。',
            ],
          },
          {
            n: '3',
            title: '删除进废纸篓',
            body: [
              '项目或新闻点「删除」会移入「废纸篓」，不会再出现在网站上。',
              '在废纸篓可恢复到原菜单，或永久删除。发布前请确认废纸篓里没有误删内容。',
            ],
          },
          {
            n: '4',
            title: '发布',
            body: [
              '确认各菜单内容正确后，打开「发布」。',
              '建议先「预览网站」，再点「发布到网站」推送到正式环境。废纸篓内的内容不会上线。',
            ],
          },
          {
            n: '5',
            title: '检查正式站',
            body: ['打开正式域名，核对文案、图片与新闻/项目详情页是否与后台一致。'],
          },
        ]
      : [
          {
            n: '1',
            title: 'Sign in',
            body: ['Use your Netlify Identity invite to sign in.'],
          },
          {
            n: '2',
            title: 'Edit live content',
            body: [
              'Homepage / Projects / News / About are the content that should match the website. Save writes to the repo; the live site updates only after you Publish.',
              'Homepage: edit hero copy, project rail, stats, footer, and related modules. Fill EN and ZH fields as pairs.',
              'Projects: create or open a project. Set name, city, status, cover image, body highlights, and the public link field if needed. Remove items you do not want shown by deleting them to Trash (do not leave unwanted items in the live list).',
              'News: create or open an article. Fill basics first (News/Event, date, title, summary, cover). Build the body with Article content blocks: + Text block for rich text (bold, headings, lists, links); + Image block or + Image gallery for photos—text and images stay separate so uploads do not overwrite each other. For Events, also fill Event details and optional Register URL.',
              'About: edit company story, timeline, and bilingual copy/images.',
              'Images: use Upload or Library on image fields; the path is saved with the content.',
              'After editing, use Preview site on the Publish page, then Publish when everything looks right.',
            ],
          },
          {
            n: '3',
            title: 'Delete to Trash',
            body: [
              'Delete on a project or news item moves it to Trash so it never appears on the site.',
              'From Trash you can restore it or delete forever. Check Trash before publishing.',
            ],
          },
          {
            n: '4',
            title: 'Publish',
            body: [
              'When the menus look correct, open Publish.',
              'Use Preview site first, then Publish to Website for production. Items in Trash are not published.',
            ],
          },
          {
            n: '5',
            title: 'Verify live',
            body: ['Open the production site and confirm copy, images, and news/project detail pages match the admin.'],
          },
        ]

  return (
    <>
      <PageHeader title={t.help} />
      <div className="admin-card-stack">
        {steps.map((s) => (
          <div key={s.n} className="admin-card admin-help-card">
            <span className="admin-badge">{s.n}</span>
            <div>
              <h2>{s.title}</h2>
              {s.body.map((para) => (
                <p key={para.slice(0, 48)}>{para}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
