import ReactMarkdown from 'react-markdown'
import type { Project } from '../data/projects'

function fontClass(family?: string) {
  switch (family) {
    case 'display':
      return 'font-display'
    case 'serif':
      return 'font-serif'
    case 'sans-sc':
      return 'font-sans-sc'
    case 'serif-sc':
      return 'font-serif-sc'
    case 'body':
    default:
      return 'font-body'
  }
}

export function ProjectBody({
  body,
  fallback,
  bodyFont = 'body',
}: {
  body?: string
  fallback: string
  bodyFont?: Project['bodyFont']
}) {
  const rootClass = `project-body ${fontClass(bodyFont)}`
  const markdown = body?.trim() || fallback

  return (
    <div className={rootClass}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="pt-p">{children}</p>,
          h2: ({ children }) => <h2 className="pt-h2">{children}</h2>,
          h3: ({ children }) => <h3 className="pt-h3">{children}</h3>,
          blockquote: ({ children }) => <blockquote className="pt-quote">{children}</blockquote>,
          ul: ({ children }) => <ul className="pt-ul">{children}</ul>,
          ol: ({ children }) => <ol className="pt-ol">{children}</ol>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            <figure className="pt-figure">
              <img src={src || ''} alt={alt || ''} />
            </figure>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
