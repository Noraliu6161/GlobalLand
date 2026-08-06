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
  'nav.company': 'Company',
  'nav.news': 'News',
  'nav.about': 'About',
  'nav.contact': 'Contact',
  'nav.menu': 'Menu',
  'nav.insights': 'Company',
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
  'home.discoverMore': 'Discover more',
  'home.newsTitle': 'News',
  'home.newsAll': 'All news',
  'home.newsRead': 'Read more',

  'news.eyebrow': 'Updates',
  'news.title': 'News',
  'news.heroLead': '* Stay up to date with company news and community events.',
  'news.placeholder': 'More articles will appear here as they are published.',
  'news.kind.all': 'All',
  'news.kind.news': 'News',
  'news.kind.event': 'Event',
  'news.archives': 'Event Archives',
  'news.clearArchive': 'Clear archive filter',
  'news.readMore': 'Read More',
  'news.empty': 'No articles match these filters.',
  'news.back': 'Back to News',
  'news.prev': 'Previous',
  'news.next': 'Next',
  'news.notFound': 'Article not found',
  'news.notFoundLead': 'This article may have been removed or the link is incorrect.',
  'news.eventDetails': 'Event Details',

  'projects.eyebrow': 'Portfolio',
  'projects.title': 'Projects across the Pacific Northwest',
  'projects.lead':
    '* Browse by city or property type, then select a project to see it on the map.',
  'projects.allCities': 'All cities',
  'projects.allTypes': 'All types',
  'projects.filter': 'Filter',
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

  'insights.eyebrow': 'Company',
  'insights.title': 'Company Introduction',
  'insights.lead':
    'Long-term residential development and high-quality commercial investment—built on professionalism, integrity, and community impact.',
  'insights.p1':
    'GlobalLand LLC was founded in 2018 by Ms. Lili Lu. The company focuses on low-density residential development and high-end commercial real estate investment. Guided by a long-term approach, professionalism, and integrity, we aim to create landmark projects and empower the communities we serve.',
  'insights.p2':
    'New home Management LLC works in resource synergy with GlobalLand LLC. Formally established in 2016, its core founding team brings more than 20 years of large-scale real estate development experience and manages over 5 million square feet of leasable and developable land reserves in Washington State.',
  'insights.p3':
    'The core team has deep experience in real estate development and operations. Members come from CreateWorld, a firm focused on apartment development for more than a decade. Ms. Lili Lu served as CEO of CreateWorld and led the team in delivering high-profile projects including Mira Flats, The Emerald, Forum South Park, Florera, Evergreen Townhomes, and Belleview Park.',
  'insights.trackEyebrow': 'Track record',
  'insights.trackTitle': 'CreateWorld deliveries',
  'insights.trackCta': 'Invest Now',

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

  'contact.eyebrow': 'Get in touch',
  'contact.title': 'Start a conversation',
  'contact.infoTitle': 'Contact Information',
  'contact.lead':
    'Inquiries about projects, partnerships, or investment opportunities.',
  'contact.formTitle': 'Send Us a Message',
  'contact.formLead': "We'll respond within 1-2 business days.",
  'contact.address': 'Address',
  'contact.phone': 'Phone',
  'contact.hours': 'Office Hours',
  'contact.hoursValue': 'Monday – Friday: 9:00 AM – 5:00 PM',
  'contact.name': 'Name',
  'contact.email': 'Email',
  'contact.subject': 'Subject',
  'contact.subjectPh': 'What is this about?',
  'contact.message': 'Message',
  'contact.messageHint': '* Please include your name in your message below.',
  'contact.namePh': 'Your name',
  'contact.emailPh': 'your@email.com',
  'contact.messagePh': 'Your message...',
  'contact.send': 'Send Message',
  'contact.sending': 'Sending…',
  'contact.thanks': 'Thank you. Your message has been sent — we will get back to you soon.',
  'contact.error': 'Something went wrong. Please try again or email us directly.',

  'footer.blurb':
    'Low-density residential development and high-quality commercial real estate investment across Seattle and the Pacific Northwest.',
  'footer.explore': 'Explore',
  'footer.company': 'Company',
  'footer.portfolio': 'Project portfolio',
  'footer.companyIntro': 'Company overview',
  'footer.news': 'News',
  'footer.insights': 'Company overview',
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
  'nav.company': '公司介绍',
  'nav.news': '新闻资讯',
  'nav.about': '关于我们',
  'nav.contact': '联系方式',
  'nav.menu': '菜单',
  'nav.insights': '公司介绍',
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
  'home.discoverMore': '了解更多',
  'home.newsTitle': '新闻资讯',
  'home.newsAll': '全部资讯',
  'home.newsRead': '阅读更多',

  'news.eyebrow': '动态',
  'news.title': '新闻资讯',
  'news.heroLead': '* 关注公司动态与社区活动最新资讯。',
  'news.placeholder': '更多文章将在此陆续发布。',
  'news.kind.all': '全部',
  'news.kind.news': '新闻',
  'news.kind.event': '活动',
  'news.archives': '活动归档',
  'news.clearArchive': '清除归档筛选',
  'news.readMore': '阅读更多',
  'news.empty': '暂无符合条件的文章。',
  'news.back': '返回新闻',
  'news.prev': '上一篇',
  'news.next': '下一篇',
  'news.notFound': '未找到文章',
  'news.notFoundLead': '该文章可能已下线，或链接不正确。',
  'news.eventDetails': '活动详情',

  'projects.eyebrow': '项目',
  'projects.title': '遍布太平洋西北的项目版图',
  'projects.lead': '* 可按城市或物业类型浏览，点选项目即可在地图上查看位置。',
  'projects.allCities': '全部城市',
  'projects.allTypes': '全部类型',
  'projects.filter': '筛选',
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

  'insights.eyebrow': '公司',
  'insights.title': '公司介绍',
  'insights.lead':
    '深耕低密度住宅开发与优质商业地产投资，以专业与诚信为内核，致力打造标杆项目并赋能属地社区。',
  'insights.p1':
    'GlobalLand LLC 由吕莉莉女士于 2018 年创立，深耕低密度住宅开发与高端商业地产投资。公司秉持长期主义理念，以专业与诚信为内核，致力于打造标杆地产项目，并持续赋能属地社区发展。',
  'insights.p2':
    'New home Management LLC 与 GlobalLand LLC 形成资源协同。该公司于 2016 年正式成立，核心创始团队拥有超 20 年大型地产开发经验，在华盛顿州管理逾 500 万平方英尺可租赁与可开发优质土地储备。',
  'insights.p3':
    '核心团队具备丰富的地产开发运营经验，成员来自专注公寓开发超十年的 CreateWorld 地产公司。吕莉莉女士曾担任 CreateWorld CEO，带领团队完成多项高关注度项目，包括 Mira Flats、The Emerald、Forum South Park、Florera、Evergreen Townhomes、Belleview Park 等。',
  'insights.trackEyebrow': '过往业绩',
  'insights.trackTitle': 'CreateWorld 标杆项目',
  'insights.trackCta': '了解合作',

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

  'contact.eyebrow': '联系我们',
  'contact.title': '开始对话',
  'contact.infoTitle': '联系方式',
  'contact.lead': '欢迎就项目、合作或投资机会与我们联系。',
  'contact.formTitle': '给我们留言',
  'contact.formLead': '我们将在 1–2 个工作日内回复。',
  'contact.address': '地址',
  'contact.phone': '电话',
  'contact.hours': '办公时间',
  'contact.hoursValue': '周一至周五：上午 9:00 – 下午 5:00',
  'contact.name': '姓名',
  'contact.email': '邮箱',
  'contact.subject': '主题',
  'contact.subjectPh': '关于什么？',
  'contact.message': '留言',
  'contact.messageHint': '* 请在下方留言中注明您的姓名。',
  'contact.namePh': '您的姓名',
  'contact.emailPh': 'your@email.com',
  'contact.messagePh': '请输入留言…',
  'contact.send': '发送留言',
  'contact.sending': '发送中…',
  'contact.thanks': '感谢提交。我们已收到您的留言，会尽快回复。',
  'contact.error': '发送失败，请稍后再试，或直接发邮件联系我们。',

  'footer.blurb':
    '在西雅图与太平洋西北地区，专注低密度住宅开发与高品质商业地产投资。',
  'footer.explore': '探索',
  'footer.company': '公司',
  'footer.portfolio': '项目组合',
  'footer.companyIntro': '公司介绍',
  'footer.news': '新闻资讯',
  'footer.insights': '公司介绍',
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
