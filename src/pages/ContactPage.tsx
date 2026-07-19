import { useState, type FormEvent } from 'react'
import { useI18n } from '../i18n'

export function ContactPage() {
  const { t } = useI18n()
  const [sent, setSent] = useState(false)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="container" style={{ paddingBottom: '3.5rem' }}>
      <div className="page-hero reveal">
        <p className="eyebrow">{t('contact.eyebrow')}</p>
        <h1>{t('contact.title')}</h1>
        <p className="section-lead">{t('contact.lead')}</p>
      </div>

      {sent ? (
        <div className="empty-state" style={{ maxWidth: 520 }}>
          <p>{t('contact.thanks')}</p>
        </div>
      ) : (
        <form className="contact-form" onSubmit={onSubmit}>
          <label>
            {t('contact.name')}
            <input name="name" required placeholder={t('contact.namePh')} />
          </label>
          <label>
            {t('contact.email')}
            <input name="email" type="email" required placeholder={t('contact.emailPh')} />
          </label>
          <label>
            {t('contact.message')}
            <textarea name="message" required placeholder={t('contact.messagePh')} />
          </label>
          <button className="btn btn-primary" type="submit">
            {t('contact.send')}
          </button>
        </form>
      )}
    </div>
  )
}
