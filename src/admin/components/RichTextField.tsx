import { useEffect, type ReactNode } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import type { AdminLang } from '../lib/i18n'
import { toHtml } from '../../lib/newsHtml'

export function RichTextField({
  label,
  value,
  onChange,
  lang,
  contentKey,
  placeholder,
}: {
  label: string
  value: string | string[] | undefined
  onChange: (html: string) => void
  lang: AdminLang
  /** Remount/reload when article or block identity changes */
  contentKey: string
  placeholder?: string
}) {
  const zh = lang === 'zh'
  const html = toHtml(value)
  const ph = placeholder || (zh ? '输入内容…' : 'Your message...')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
    ],
    content: html,
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return
    const next = toHtml(value)
    if (editor.getHTML() !== next) {
      editor.commands.setContent(next, { emitUpdate: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- contentKey drives external reloads
  }, [contentKey, editor])

  if (!editor) return null

  const empty = editor.isEmpty

  const setLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined
    const url = window.prompt(zh ? '链接地址' : 'Link URL', prev || 'https://')
    if (url === null) return
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
  }

  const btn = (active: boolean, onClick: () => void, labelText: ReactNode, title?: string) => (
    <button type="button" title={title} className={active ? 'is-on' : undefined} onClick={onClick}>
      {labelText}
    </button>
  )

  return (
    <label className="admin-field">
      <span>{label}</span>
      <div className="admin-rte">
        <div className="admin-rte-toolbar">
          <div className="admin-rte-group">
            {btn(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), <strong>B</strong>, 'Bold')}
            {btn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), <em>I</em>, 'Italic')}
            {btn(
              editor.isActive('underline'),
              () => editor.chain().focus().toggleUnderline().run(),
              <span style={{ textDecoration: 'underline' }}>U</span>,
              'Underline',
            )}
          </div>
          <span className="admin-rte-sep" aria-hidden />
          <div className="admin-rte-group">
            {btn(
              editor.isActive('heading', { level: 2 }),
              () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
              'H2',
            )}
            {btn(
              editor.isActive('heading', { level: 3 }),
              () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
              'H3',
            )}
            {btn(
              editor.isActive('paragraph'),
              () => editor.chain().focus().setParagraph().run(),
              '¶',
              zh ? '段落' : 'Paragraph',
            )}
          </div>
          <span className="admin-rte-sep" aria-hidden />
          <div className="admin-rte-group">
            {btn(
              editor.isActive('bulletList'),
              () => editor.chain().focus().toggleBulletList().run(),
              zh ? '• 列表' : '• List',
            )}
            {btn(
              editor.isActive('orderedList'),
              () => editor.chain().focus().toggleOrderedList().run(),
              zh ? '1. 列表' : '1. List',
            )}
          </div>
          <span className="admin-rte-sep" aria-hidden />
          <div className="admin-rte-group">
            {btn(editor.isActive('link'), setLink, zh ? '链接' : 'Link')}
            {btn(
              false,
              () => editor.chain().focus().clearNodes().unsetAllMarks().run(),
              zh ? '清除' : 'Clear',
              zh ? '清除格式' : 'Clear formatting',
            )}
          </div>
        </div>
        <div className="admin-rte-body">
          {empty ? <span className="admin-rte-placeholder">{ph}</span> : null}
          <EditorContent editor={editor} />
        </div>
      </div>
    </label>
  )
}
