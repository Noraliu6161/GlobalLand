import { useEffect, useRef, useState } from 'react'
import { listMedia, uploadImage } from '../lib/contentApi'
import { resolveAdminMediaSrc } from '../lib/mediaUrl'
import { AdminMediaImage } from './AdminMediaImage'

export function Field({
  label,
  value,
  onChange,
  multiline,
  type = 'text',
  hint,
  className,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  type?: string
  hint?: string
  className?: string
}) {
  return (
    <label className={['admin-field', className].filter(Boolean).join(' ')}>
      <span>{label}</span>
      {multiline ? (
        <textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint ? <em className="admin-field-hint">{hint}</em> : null}
    </label>
  )
}

export function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="admin-field admin-field-toggle">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  )
}

/** Edit string[] as one line per item. */
export function LinesField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string
  value: string[]
  onChange: (v: string[]) => void
  hint?: string
}) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <textarea
        rows={5}
        value={value.join('\n')}
        onChange={(e) =>
          onChange(
            e.target.value
              .split('\n')
              .map((s) => s.trimEnd())
              .filter((s, i, arr) => s.length > 0 || i < arr.length - 1),
          )
        }
      />
      {hint ? <em className="admin-field-hint">{hint}</em> : null}
    </label>
  )
}

export function ImageField({
  label,
  value,
  onChange,
  lang,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  lang: 'en' | 'zh'
}) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [library, setLibrary] = useState<string[]>([])
  const [showLib, setShowLib] = useState(false)
  const [previewOverride, setPreviewOverride] = useState('')
  const uploadedPathRef = useRef('')

  useEffect(() => {
    if (value !== uploadedPathRef.current) {
      setPreviewOverride('')
      uploadedPathRef.current = ''
    }
  }, [value])

  useEffect(() => {
    if (!showLib) return
    void listMedia().then(setLibrary)
  }, [showLib])

  const onFile = async (file: File | null) => {
    if (!file) return
    setBusy(true)
    setErr('')
    const res = await uploadImage(file)
    setBusy(false)
    if (!res.ok || !res.path) {
      setErr(res.ok ? 'No path' : res.error)
      return
    }
    uploadedPathRef.current = res.path
    setPreviewOverride(res.previewUrl || `${res.path}?v=${Date.now()}`)
    onChange(res.path)
  }

  const displaySrc = previewOverride || resolveAdminMediaSrc(value)

  return (
    <div className="admin-field admin-image-field">
      <span>{label}</span>
      <div className="admin-image-row">
        <div className="admin-image-preview">
          {displaySrc ? (
            <img
              key={displaySrc}
              src={displaySrc}
              alt=""
              onError={(e) => {
                const el = e.currentTarget
                // One retry via cms-branch raw URL if site path 404s
                const raw = resolveAdminMediaSrc(value)
                if (value && !previewOverride && raw !== value && el.src !== raw) {
                  el.src = raw
                  return
                }
                el.style.display = 'none'
              }}
            />
          ) : (
            <span>{lang === 'zh' ? '无图片' : 'No image'}</span>
          )}
        </div>
        <div className="admin-image-controls">
          <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="/images/..." />
          <div className="admin-quick">
            <label className="admin-btn">
              {busy ? (lang === 'zh' ? '上传中…' : 'Uploading…') : lang === 'zh' ? '上传图片' : 'Upload'}
              <input
                type="file"
                accept="image/*,.heic,.heif"
                hidden
                disabled={busy}
                onChange={(e) => void onFile(e.target.files?.[0] || null)}
              />
            </label>
            <button type="button" className="admin-btn" onClick={() => setShowLib((v) => !v)}>
              {lang === 'zh' ? '从图库选择' : 'Library'}
            </button>
            {value ? (
              <button
                type="button"
                className="admin-btn"
                onClick={() => {
                  uploadedPathRef.current = ''
                  setPreviewOverride('')
                  onChange('')
                }}
              >
                {zhClear(lang)}
              </button>
            ) : null}
          </div>
          {err ? (
            <em className="admin-field-hint" style={{ color: '#b42318' }}>
              {err}
            </em>
          ) : null}
        </div>
      </div>
      {showLib && (
        <div className="admin-media-grid">
          {library.length === 0 ? (
            <p className="admin-hint">{lang === 'zh' ? '图库为空或仅本地开发可用' : 'Library empty (local dev lists files)'}</p>
          ) : (
            library.map((src) => (
              <button
                key={src}
                type="button"
                className={`admin-media-thumb ${value === src ? 'is-active' : ''}`}
                onClick={() => {
                  setPreviewOverride('')
                  onChange(src)
                  setShowLib(false)
                }}
              >
                <AdminMediaImage src={src} />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function zhClear(lang: 'en' | 'zh') {
  return lang === 'zh' ? '清除' : 'Clear'
}
