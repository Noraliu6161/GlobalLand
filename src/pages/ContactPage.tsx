import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { company } from '../data/projects'
import { OfficeMap } from '../components/OfficeMap'
import { useI18n } from '../i18n'

function IconPin() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 21s6.5-5.2 6.5-10.2A6.5 6.5 0 0 0 5.5 10.8C5.5 15.8 12 21 12 21Z" />
      <circle cx="12" cy="10.5" r="2.2" />
    </svg>
  )
}

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M7.2 3.8h2.6l1.2 3.2-1.7 1.2a12.4 12.4 0 0 0 5.5 5.5l1.2-1.7 3.2 1.2v2.6c0 .9-.7 1.7-1.6 1.8A15.7 15.7 0 0 1 3.6 5.4c.1-.9.9-1.6 1.8-1.6Z" />
    </svg>
  )
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
      <path d="m4.5 7.5 7.5 6 7.5-6" />
    </svg>
  )
}

function IconHours() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3.5" y="4.5" width="17" height="12.5" rx="1.5" />
      <path d="M8 20.5h8M12 17v3.5" />
    </svg>
  )
}

function ContactItem({
  icon,
  label,
  children,
}: {
  icon: ReactNode
  label: string
  children: ReactNode
}) {
  return (
    <div className="contact-item">
      <div className="contact-item-icon">{icon}</div>
      <div className="contact-item-body">
        <strong>{label}</strong>
        <div className="contact-item-detail">{children}</div>
      </div>
    </div>
  )
}

type FormatCmd = 'bold' | 'italic' | 'underline' | 'insertUnorderedList' | 'insertOrderedList' | 'removeFormat'

function MessageEditor({
  placeholder,
  onChange,
}: {
  placeholder: string
  onChange: (html: string, text: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [empty, setEmpty] = useState(true)

  const run = (cmd: FormatCmd) => {
    ref.current?.focus()
    document.execCommand(cmd, false)
    sync()
  }

  const insertLink = () => {
    const url = window.prompt('URL')
    if (!url) return
    ref.current?.focus()
    document.execCommand('createLink', false, url)
    sync()
  }

  const sync = () => {
    const el = ref.current
    if (!el) return
    const text = el.innerText.replace(/\u00a0/g, ' ').trim()
    setEmpty(!text)
    onChange(el.innerHTML, text)
  }

  return (
    <div className="contact-editor">
      <div className="contact-editor-toolbar" role="toolbar" aria-label="Formatting">
        <button type="button" onClick={() => run('bold')} title="Bold">
          <strong>B</strong>
        </button>
        <button type="button" onClick={() => run('italic')} title="Italic">
          <em>I</em>
        </button>
        <button type="button" onClick={() => run('underline')} title="Underline">
          <span className="contact-editor-u">U</span>
        </button>
        <span className="contact-editor-sep" />
        <button
          type="button"
          onClick={() => {
            document.execCommand('formatBlock', false, 'h2')
            sync()
          }}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => {
            document.execCommand('formatBlock', false, 'h3')
            sync()
          }}
          title="Heading 3"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => {
            document.execCommand('formatBlock', false, 'p')
            sync()
          }}
          title="Paragraph"
        >
          ¶
        </button>
        <span className="contact-editor-sep" />
        <button type="button" onClick={() => run('insertUnorderedList')} title="Bullet list">
          • List
        </button>
        <button type="button" onClick={() => run('insertOrderedList')} title="Numbered list">
          1. List
        </button>
        <button type="button" onClick={insertLink} title="Link">
          Link
        </button>
        <button type="button" onClick={() => run('removeFormat')} title="Clear formatting">
          Clear
        </button>
      </div>
      <div className="contact-editor-body-wrap">
        {empty && <span className="contact-editor-placeholder">{placeholder}</span>}
        <div
          ref={ref}
          className="contact-editor-body"
          contentEditable
          role="textbox"
          aria-multiline="true"
          aria-required="true"
          onInput={sync}
          suppressContentEditableWarning
        />
      </div>
    </div>
  )
}

export function ContactPage() {
  const { t } = useI18n()
  const [sent, setSent] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [messageHtml, setMessageHtml] = useState('')

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!messageText.trim()) return
    // Design-only submit — keep html ready for future form wiring
    void messageHtml
    setSent(true)
  }

  return (
    <div className="container" style={{ paddingBottom: '3.5rem' }}>
      <div className="page-hero reveal">
        <p className="eyebrow">{t('contact.eyebrow')}</p>
        <h1>{t('contact.infoTitle')}</h1>
      </div>

      <div className="contact-layout">
        <div className="contact-info reveal">
          <ContactItem icon={<IconPin />} label={t('contact.address')}>
            <p>{company.addressLine1}</p>
            <p>{company.addressLine2}</p>
          </ContactItem>

          <ContactItem icon={<IconPhone />} label={t('contact.phone')}>
            <a href={`tel:${company.phoneTel}`}>{company.phone}</a>
          </ContactItem>

          <ContactItem icon={<IconMail />} label={t('contact.email')}>
            <a href={`mailto:${company.email}`}>{company.email}</a>
          </ContactItem>

          <ContactItem icon={<IconHours />} label={t('contact.hours')}>
            <p>{t('contact.hoursValue')}</p>
          </ContactItem>

          <OfficeMap />
        </div>

        <div className="contact-aside reveal">
          {sent ? (
            <div className="contact-message-card">
              <div className="empty-state">
                <p>{t('contact.thanks')}</p>
              </div>
            </div>
          ) : (
            <form className="contact-message-card" onSubmit={onSubmit}>
              <div className="contact-message-head">
                <h2>{t('contact.formTitle')}</h2>
                <p>{t('contact.formLead')}</p>
              </div>

              <label className="contact-field">
                <span>
                  {t('contact.email')} <span className="req">*</span>
                </span>
                <input name="email" type="email" required placeholder={t('contact.emailPh')} />
              </label>

              <label className="contact-field">
                <span>{t('contact.subject')}</span>
                <input name="subject" placeholder={t('contact.subjectPh')} />
              </label>

              <div className="contact-field">
                <span className="contact-field-label">
                  {t('contact.message')} <span className="req">*</span>
                </span>
                <p className="contact-field-hint">{t('contact.messageHint')}</p>
                <MessageEditor
                  placeholder={t('contact.messagePh')}
                  onChange={(html, text) => {
                    setMessageHtml(html)
                    setMessageText(text)
                  }}
                />
              </div>

              <button className="contact-send-btn" type="submit" disabled={!messageText.trim()}>
                {t('contact.send')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
