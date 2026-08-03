type AdminLang = 'en' | 'zh'

const copy = {
  en: {
    brand: 'Global Land Admin',
    subtitle: 'Content management',
    overview: 'Overview',
    home: 'Homepage',
    projects: 'Projects',
    news: 'News & Events',
    about: 'About',
    inbox: 'Inbox',
    publish: 'Publish',
    trash: 'Trash',
    help: 'Help',
    legacy: 'Legacy Decap',
    logout: 'Log out',
    login: 'Sign in',
    loginLead: 'Sign in with Netlify Identity to manage Global Land content.',
    save: 'Save changes',
    saving: 'Saving…',
    saved: 'Saved to draft. Open Publish to push these changes to the live website.',
    lang: 'Language',
    unpublished:
      'Menus outside Trash should match the website. Delete unwanted items into Trash first, then Publish.',
  },
  zh: {
    brand: 'Global Land',
    subtitle: '管理后台',
    overview: '概览',
    home: '首页内容',
    projects: '项目',
    news: '新闻与活动',
    about: '关于我们',
    inbox: '收件箱',
    publish: '发布',
    trash: '废纸篓',
    help: '帮助',
    legacy: '旧版 Decap',
    logout: '退出登录',
    login: '登录',
    loginLead: '使用 Netlify Identity 登录后管理 Global Land 网站内容。',
    save: '保存更改',
    saving: '保存中…',
    saved: '已保存到草稿。请到「发布」才能把改动同步到正式网站。',
    lang: '语言',
    unpublished: '废纸篓以外的内容应与网站一致。不想上线的条目请先删进废纸篓，再点发布。',
  },
} as const

export type AdminCopy = (typeof copy)[AdminLang]

export function getCopy(lang: AdminLang): AdminCopy {
  return copy[lang]
}

export type { AdminLang }
