import { NavLink, Link } from 'react-router-dom'
import { useState } from 'react'
import { company } from '../data/projects'
import { useI18n } from '../i18n'

export function Logo({
  large = false,
  variant = 'default',
}: {
  large?: boolean
  variant?: 'default' | 'light'
}) {
  if (variant === 'light') {
    return (
      <Link to="/" className="logo logo--wordmark" aria-label="Global Land home">
        <span className="logo-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="logo-word" style={large ? { fontSize: '1.35rem' } : undefined}>
          {company.shortName}
        </span>
      </Link>
    )
  }

  return (
    <Link to="/" className="logo" aria-label="Global Land home">
      <img
        className="logo-img"
        src="/images/brand/logo-globalland.png"
        alt=""
        width={large ? 168 : 138}
        height={large ? 36 : 30}
      />
      <span className="sr-only">{company.shortName}</span>
    </Link>
  )
}

export function Header() {
  const [open, setOpen] = useState(false)
  const { t, lang, setLang } = useI18n()

  const links = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/projects', label: t('nav.projects') },
    { to: '/insights', label: t('nav.insights') },
    { to: '/about', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
  ]

  return (
    <header className="site-header">
      <div className="inner">
        <Logo />
        <div className="header-right">
          <button
            className="nav-toggle"
            type="button"
            aria-expanded={open}
            aria-controls="site-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {t('nav.menu')}
          </button>
          <nav id="site-nav" className={`nav-links ${open ? 'open' : ''}`}>
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) => (isActive ? 'active' : undefined)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="lang-switch" role="group" aria-label="Language">
            <button
              type="button"
              className={lang === 'en' ? 'is-active' : ''}
              onClick={() => setLang('en')}
            >
              {t('lang.en')}
            </button>
            <button
              type="button"
              className={lang === 'zh' ? 'is-active' : ''}
              onClick={() => setLang('zh')}
            >
              {t('lang.zh')}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="site-footer">
      <div className="inner">
        <div>
          <Logo variant="light" />
          <p style={{ marginTop: '1rem', maxWidth: '34ch' }}>{t('footer.blurb')}</p>
        </div>
        <div>
          <h4>{t('footer.explore')}</h4>
          <ul>
            <li>
              <Link to="/projects">{t('footer.portfolio')}</Link>
            </li>
            <li>
              <Link to="/insights">{t('footer.insights')}</Link>
            </li>
            <li>
              <Link to="/about">{t('footer.story')}</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4>{t('footer.company')}</h4>
          <ul>
            <li>{t('footer.founded', { year: company.founded })}</li>
            <li>{t('footer.founder', { name: company.founder })}</li>
            <li>
              <Link to="/contact">{t('footer.contact')}</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {company.name}
        </span>
        <span>{t('footer.location')}</span>
      </div>
    </footer>
  )
}
