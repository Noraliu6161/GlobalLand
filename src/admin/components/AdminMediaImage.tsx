import { useEffect, useState } from 'react'
import { resolveAdminMediaSrc } from '../lib/mediaUrl'

/** Admin <img> that resolves cms-branch uploads and shows a fallback if broken. */
export function AdminMediaImage({
  src,
  alt = '',
  className,
}: {
  src: string
  alt?: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const resolved = resolveAdminMediaSrc(src)

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (!src || failed) {
    return <span className={`admin-media-missing ${className || ''}`.trim()} aria-hidden />
  }

  return (
    <img
      className={className}
      src={resolved}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}
