import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type Lang = 'en' | 'zh'

type Dict = Record<string, string>

const en: Dict = {
  'nav.home': 'Home',
  'nav.projects': 'Projects',
  'nav.insights': 'Insights',
  'nav.about': 'About',
  'nav.contact': 'Contact',
  'nav.menu': 'Menu',
  'lang.en': 'EN',
  'lang.zh': '中文',

  'hero.eyebrow': 'Est. {year} · Seattle',
  'hero.lead':
    'Long-term residential development and commercial investment across Seattle.',
  'hero.ctaProjects': 'View projects',
  'hero.ctaAbout': 'Our story',

  'home.whoEyebrow': 'Who we are',
  'home.whoTitle': 'A patient approach to place',
  'home.whoLead':
    'Development of low-density residential properties and investment in high-quality commercial real estate.',
  'home.vision':
    'To uphold a long-term approach to the industry, earning recognition through professionalism and integrity; to create market-leading projects; and to make a positive contribution to the communities we serve.',
  'home.statListings': 'Portfolio listings',
  'home.statSales': 'Eastside SFH sales*',
  'home.statCities': 'Cities served',
  'home.statNote': '*Projected sales across four communities, 2020–2022.',

  'home.spotlightEyebrow': 'Recent acquisition',
  'home.spotlightTitle': 'Spring District, Bellevue',
  'home.spotlightBody':
    'Class A office acquired February 2024 for $16.28 million—across from Meta’s campus and steps from light rail. Anchored by long-term leases with premier tenants.',
  'home.spotlightCta': 'Explore office assets',

  'home.selectedTitle': 'Projects shaping the region',
  'home.allProjects': 'All projects',

  'projects.eyebrow': 'Portfolio',
  'projects.title': 'Projects across the Pacific Northwest',
  'projects.lead':
    'Filter by city or type. Select a project to focus the map—one dataset drives list and location together.',
  'projects.allCities': 'All cities',
  'projects.allTypes': 'All types',
  'projects.empty': 'No projects match these filters.',
  'projects.clear': 'Clear filters',
  'projects.loading': 'Loading projects…',
  'projects.sourceCms': 'Content source: Decap CMS (Git)',
  'projects.sourceEmpty': 'No published projects in content/projects',
  'projects.detailEyebrow': 'Selected project',
  'projects.viewDetails': 'View details',
  'projectDetail.back': 'Back to projects',
  'projectDetail.notFound': 'Project not found',
  'projectDetail.notFoundLead': 'This listing may have been unpublished or the link is incorrect.',
  'projectDetail.year': 'Year',
  'projectDetail.units': 'Units',
  'projectDetail.buildings': 'Buildings',
  'projectDetail.saleValue': 'Sale value ($M)',
  'projectDetail.acquisition': 'Acquisition ($M)',
  'projectDetail.highlights': 'Highlights',
  'projectDetail.contact': 'Inquire about this project',
  'nav.cms': 'CMS',
  'footer.cms': 'Open CMS',

  'insights.eyebrow': 'Data',
  'insights.title': 'Project insights',
  'insights.lead':
    'Years of portfolio activity, visualized—scale, regional footprint, and development mix. Charts are computed from the same project dataset as the map and filters.',

  'about.eyebrow': 'About',
  'about.title': 'Built for the long term',
  'about.intro':
    '{name} was founded by {founder} in {year}, with a focus on the development of low-density residential properties and the investment in high-quality commercial real estate.',
  'about.vision':
    'To uphold a long-term approach to the industry, earning recognition through professionalism and integrity; to create market-leading projects; and to make a positive contribution to the communities we serve.',
  'about.team':
    'Our team, including some who previously worked with Create World Real Estate Inc., a real estate development firm specializing in condo development since 2014, has a strong track record. Under Ms. Lu’s leadership as the former CEO of Create World Real Estate Inc., the team successfully completed several high-profile projects.',
  'about.communityEyebrow': 'Community',
  'about.communityTitle': 'Leadership beyond the balance sheet',
  'about.community':
    'Beyond business successes, Ms. Lu is deeply committed to community service. She currently presides over the Chinese Chamber of Commerce in Washington State (CCCWA), a non-profit dedicated to fostering trade and investment between Washington and China. CCCWA members span industries from finance to healthcare.',
  'about.returns':
    'Both Class A office properties are secured by long-term leases with premier tenants, generating strong cash-on-cash returns during the holding period, with significant potential for appreciation and attractive exit premiums upon disposition.',

  'contact.eyebrow': 'Contact',
  'contact.title': 'Start a conversation',
  'contact.lead':
    'Inquiries about projects, partnerships, or investment opportunities. This form is design-only for now—connect Netlify Forms when you are ready to collect submissions.',
  'contact.name': 'Name',
  'contact.email': 'Email',
  'contact.message': 'Message',
  'contact.namePh': 'Your name',
  'contact.emailPh': 'you@example.com',
  'contact.messagePh': 'How can we help?',
  'contact.send': 'Send message',
  'contact.thanks': 'Thank you. Your message UI is ready—wire it to Netlify Forms or your inbox next.',

  'footer.blurb':
    'Low-density residential development and high-quality commercial real estate investment across Seattle and the Pacific Northwest.',
  'footer.explore': 'Explore',
  'footer.company': 'Company',
  'footer.portfolio': 'Project portfolio',
  'footer.insights': 'Data insights',
  'footer.story': 'Our story',
  'footer.founded': 'Founded {year}',
  'footer.founder': 'Founder {name}',
  'footer.contact': 'Get in touch',
  'footer.location': 'Washington State · USA',

  'type.condo': 'Condo',
  'type.sfh': 'Single-Family',
  'type.townhouse': 'Townhouse',
  'type.office': 'Office',
  'type.mixed': 'Mixed Residential',
  'status.completed': 'Completed',
  'status.in-progress': 'In Progress',
  'status.acquired': 'Acquired',
  'status.sold': 'Sold',
  'map.legend': 'Legend',
}

const zh: Dict = {
  'nav.home': '首页',
  'nav.projects': '项目',
  'nav.insights': '数据洞察',
  'nav.about': '关于我们',
  'nav.contact': '联系',
  'nav.menu': '菜单',
  'lang.en': 'EN',
  'lang.zh': '中文',

  'hero.eyebrow': '创立于 {year} · 西雅图',
  'hero.lead': '深耕低密度住宅开发与优质商业地产投资，立足西雅图长期布局。',
  'hero.ctaProjects': '查看项目',
  'hero.ctaAbout': '了解我们',

  'home.whoEyebrow': '关于我们',
  'home.whoTitle': '以耐心，营造一方所在',
  'home.whoLead': '专注低密度住宅开发，并稳健布局高品质商业地产。',
  'home.vision':
    '坚持长期主义，以专业与诚信赢得认可；打造具有市场影响力的项目，并为所服务的社区持续创造价值。',
  'home.statListings': '项目数量',
  'home.statSales': '东区住宅销售额*',
  'home.statCities': '覆盖城市',
  'home.statNote': '*四个社区预计销售额（2020–2022）。',

  'home.spotlightEyebrow': '最新收购',
  'home.spotlightTitle': 'Spring District · 贝尔维尤',
  'home.spotlightBody':
    '2024 年 2 月以 1,628 万美元收购甲级写字楼，正对 Meta 园区、步行可达轻轨，并由优质租户长期租约支撑。',
  'home.spotlightCta': '查看办公项目',

  'home.selectedTitle': '塑造区域的代表性项目',
  'home.allProjects': '全部项目',

  'projects.eyebrow': '项目',
  'projects.title': '遍布太平洋西北的项目版图',
  'projects.lead': '可按城市与类型筛选；点选项目即可在地图上定位，列表与地图共用同一份数据。',
  'projects.allCities': '全部城市',
  'projects.allTypes': '全部类型',
  'projects.empty': '暂无符合筛选条件的项目。',
  'projects.clear': '清空筛选',
  'projects.loading': '正在加载项目…',
  'projects.sourceCms': '内容来源：Decap CMS（Git）',
  'projects.sourceEmpty': 'content/projects 中暂无已发布项目',
  'projects.detailEyebrow': '当前项目',
  'projects.viewDetails': '查看详情',
  'projectDetail.back': '返回项目列表',
  'projectDetail.notFound': '未找到该项目',
  'projectDetail.notFoundLead': '该项目可能已下架，或链接不正确。',
  'projectDetail.year': '年份',
  'projectDetail.units': '单元数',
  'projectDetail.buildings': '栋数',
  'projectDetail.saleValue': '售价（百万美元）',
  'projectDetail.acquisition': '收购价（百万美元）',
  'projectDetail.highlights': '亮点',
  'projectDetail.contact': '咨询此项目',
  'nav.cms': '后台',
  'footer.cms': '打开后台',

  'insights.eyebrow': '数据',
  'insights.title': '项目数据洞察',
  'insights.lead':
    '用图表呈现项目规模、区域分布与开发类型。所有图表均由与地图、筛选相同的项目数据自动汇总生成。',

  'about.eyebrow': '关于',
  'about.title': '为长远而建',
  'about.intro':
    '{name} 由 {founder} 于 {year} 年创立，聚焦低密度住宅开发与高品质商业地产投资。',
  'about.vision':
    '坚持长期主义，以专业与诚信赢得认可；打造具有市场影响力的项目，并为所服务的社区持续创造价值。',
  'about.team':
    '团队成员中包括曾就职于 Create World Real Estate Inc. 的伙伴。该公司自 2014 年起专注公寓开发。在 Lu 女士担任 Create World 前首席执行官期间，团队成功完成多项高关注度项目。',
  'about.communityEyebrow': '社区',
  'about.communityTitle': '超越财务数字的领导力',
  'about.community':
    '在商业成就之外，Lu 女士长期投入社区服务，现任华盛顿州华人商会（CCCWA）相关领导职务。该非营利组织致力于促进华盛顿州与中国之间的贸易与投资，会员覆盖金融、医疗等多个行业。',
  'about.returns':
    '两处甲级写字楼均由优质租户长期租约支持，持有期可形成稳健现金回报，并具备资产增值与退出溢价潜力。',

  'contact.eyebrow': '联系',
  'contact.title': '开始对话',
  'contact.lead':
    '欢迎就项目、合作或投资机会与我们联系。当前为设计演示表单，后续可接入 Netlify Forms 或企业邮箱。',
  'contact.name': '姓名',
  'contact.email': '邮箱',
  'contact.message': '留言',
  'contact.namePh': '您的姓名',
  'contact.emailPh': 'you@example.com',
  'contact.messagePh': '请告诉我们您的需求',
  'contact.send': '发送留言',
  'contact.thanks': '感谢提交。表单界面已就绪，下一步可接入 Netlify Forms 或收件邮箱。',

  'footer.blurb':
    '在西雅图与太平洋西北地区，专注低密度住宅开发与高品质商业地产投资。',
  'footer.explore': '探索',
  'footer.company': '公司',
  'footer.portfolio': '项目组合',
  'footer.insights': '数据洞察',
  'footer.story': '我们的故事',
  'footer.founded': '创立于 {year}',
  'footer.founder': '创始人 {name}',
  'footer.contact': '联系我们',
  'footer.location': '华盛顿州 · 美国',

  'type.condo': '公寓',
  'type.sfh': '独栋住宅',
  'type.townhouse': '联排别墅',
  'type.office': '办公',
  'type.mixed': '混合住宅',
  'status.completed': '已完成',
  'status.in-progress': '进行中',
  'status.acquired': '已收购',
  'status.sold': '已出售',
  'map.legend': '图例',
}

const dictionaries: Record<Lang, Dict> = { en, zh }

type I18nContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function format(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`))
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('gl-lang')
    return saved === 'zh' || saved === 'en' ? saved : 'en'
  })

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    localStorage.setItem('gl-lang', next)
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
  }, [lang])

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const table = dictionaries[lang]
      const fallback = dictionaries.en
      return format(table[key] ?? fallback[key] ?? key, vars)
    },
    [lang],
  )

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
