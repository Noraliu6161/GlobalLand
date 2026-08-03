import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { getCopy, type AdminLang } from './lib/i18n'
import { OverviewPage } from './pages/OverviewPage'
import { HomePageEditor } from './pages/HomePageEditor'
import { ProjectEditorPage, ProjectsPage } from './pages/ProjectsPage'
import { NewsEditorPage, NewsPage } from './pages/NewsPage'
import { AboutPageEditor } from './pages/AboutPageEditor'
import { PublishPage } from './pages/PublishPage'
import { TrashPage } from './pages/TrashPage'
import { HelpPage } from './pages/HelpPage'

type User = { email?: string }

function Icon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d={d} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const icons = {
  overview: 'M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z',
  home: 'M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9.5Z',
  projects: 'M4 7h16M4 12h16M4 17h10',
  news: 'M5 5h14v14H5V5Zm3 4h8M8 13h8M8 17h5',
  about: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0',
  publish: 'M12 16V5m0 0 4 4m-4-4-4 4M5 19h14',
  trash: 'M4 7h16M9 7V5h6v2m-8 3v8m4-8v8m4-8v8M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12',
  help: 'M12 17h.01M9.5 9.5a2.5 2.5 0 1 1 3.7 2.2c-.7.4-1.2.9-1.2 1.8V14',
}

export function AdminApp() {
  const [lang, setLang] = useState<AdminLang>(() =>
    (localStorage.getItem('gl-admin-lang') as AdminLang) || 'zh',
  )
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const t = getCopy(lang)

  useEffect(() => {
    localStorage.setItem('gl-admin-lang', lang)
  }, [lang])

  useEffect(() => {
    const id = window.netlifyIdentity
    if (!id) {
      // Local / no Identity widget: treat as signed-in for editing with local API
      setUser(import.meta.env.DEV ? { email: 'local@dev' } : null)
      return
    }
    id.init?.()
    const sync = () => setUser(id.currentUser() as User | null)
    sync()
    id.on('init', sync)
    id.on('login', sync)
    id.on('logout', () => setUser(null))
  }, [])

  if (user === undefined) {
    return <div className="admin-boot">Loading…</div>
  }

  if (!user && !import.meta.env.DEV) {
    return (
      <div className="admin-login">
        <div className="admin-login-card">
          <p className="admin-login-eyebrow">Global Land</p>
          <h1>{t.brand}</h1>
          <p>{t.loginLead}</p>
          <button type="button" className="admin-btn admin-btn-primary" onClick={() => window.netlifyIdentity?.open('login')}>
            {t.login}
          </button>
        </div>
      </div>
    )
  }

  const nav: { to: string; label: string; icon: string; end?: boolean }[] = [
    { to: '/', label: t.overview, icon: icons.overview, end: true },
    { to: '/home', label: t.home, icon: icons.home },
    { to: '/projects', label: t.projects, icon: icons.projects },
    { to: '/news', label: t.news, icon: icons.news },
    { to: '/about', label: t.about, icon: icons.about },
    { to: '/trash', label: t.trash, icon: icons.trash },
    { to: '/publish', label: t.publish, icon: icons.publish },
    { to: '/help', label: t.help, icon: icons.help },
  ]

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <strong>{t.brand}</strong>
          <span>{t.subtitle}</span>
        </div>
        <nav className="admin-nav">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? 'is-active' : '')}>
              <Icon d={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-foot">
          <a className="admin-nav-link" href="/cms/" target="_blank" rel="noreferrer">
            {t.legacy}
          </a>
          <button
            type="button"
            className="admin-nav-link"
            onClick={() => {
              if (window.netlifyIdentity?.currentUser()) window.netlifyIdentity.logout()
              else setUser(null)
            }}
          >
            {t.logout}
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-title" id="admin-page-title" />
          <div className="admin-topbar-actions">
            <div className="admin-lang" role="group" aria-label={t.lang}>
              <button type="button" className={lang === 'en' ? 'is-active' : ''} onClick={() => setLang('en')}>
                EN
              </button>
              <button type="button" className={lang === 'zh' ? 'is-active' : ''} onClick={() => setLang('zh')}>
                中文
              </button>
            </div>
            <span className="admin-user">{user?.email || 'local'}</span>
          </div>
        </header>

        <div className="admin-content">
          <Routes>
            <Route path="/" element={<OverviewPage lang={lang} />} />
            <Route path="/home" element={<HomePageEditor lang={lang} />} />
            <Route path="/projects" element={<ProjectsPage lang={lang} />} />
            <Route path="/projects/:slug" element={<ProjectEditorPage lang={lang} />} />
            <Route path="/news" element={<NewsPage lang={lang} />} />
            <Route path="/news/:id" element={<NewsEditorPage lang={lang} />} />
            <Route path="/about" element={<AboutPageEditor lang={lang} />} />
            <Route path="/trash" element={<TrashPage lang={lang} />} />
            <Route path="/publish" element={<PublishPage lang={lang} />} />
            <Route path="/help" element={<HelpPage lang={lang} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export function PageHeader({
  title,
  back,
  action,
}: {
  title: string
  back?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="admin-page-head">
      {back ? <div className="admin-page-back">{back}</div> : null}
      <div className="admin-page-head-row">
        <h1>{title}</h1>
        {action}
      </div>
    </div>
  )
}
