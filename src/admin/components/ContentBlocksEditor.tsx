import type { AdminLang } from '../lib/i18n'
import type { ContentBlock } from '../../data/newsTypes'
import { newGalleryBlock, newImageBlock, newTextBlock } from '../../lib/newsBlocks'
import { ImageField } from './Fields'
import { RichTextField } from './RichTextField'

export function ContentBlocksEditor({
  lang,
  blocks,
  onChange,
}: {
  lang: AdminLang
  blocks: ContentBlock[]
  onChange: (blocks: ContentBlock[]) => void
}) {
  const zh = lang === 'zh'

  const update = (index: number, next: ContentBlock) => {
    onChange(blocks.map((b, i) => (i === index ? next : b)))
  }

  const remove = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index))
  }

  const move = (index: number, dir: -1 | 1) => {
    const j = index + dir
    if (j < 0 || j >= blocks.length) return
    const copy = [...blocks]
    ;[copy[index], copy[j]] = [copy[j], copy[index]]
    onChange(copy)
  }

  const add = (block: ContentBlock) => onChange([...blocks, block])

  return (
    <div className="admin-blocks">
      <h2 className="admin-blocks-title">{zh ? '文章内容块' : 'Article content blocks'}</h2>

      <div className="admin-blocks-list">
        {blocks.length === 0 ? (
          <p className="admin-blocks-empty">
            {zh
              ? '还没有内容块。请添加文本、图片或图集来组成正文。'
              : 'No content blocks yet. Add text or image blocks to build the article body.'}
          </p>
        ) : (
          blocks.map((block, i) => (
            <div key={block.id} className="admin-block-card">
              <div className="admin-block-card-head">
                <strong>
                  {block.type === 'text'
                    ? zh
                      ? '文本块'
                      : 'Text block'
                    : block.type === 'image'
                      ? zh
                        ? '图片块'
                        : 'Image block'
                      : zh
                        ? '图集'
                        : 'Image gallery'}{' '}
                  <span className="admin-hint">#{i + 1}</span>
                </strong>
                <div className="admin-row-actions">
                  <button type="button" className="admin-btn" disabled={i === 0} onClick={() => move(i, -1)}>
                    ↑
                  </button>
                  <button type="button" className="admin-btn" disabled={i === blocks.length - 1} onClick={() => move(i, 1)}>
                    ↓
                  </button>
                  <button type="button" className="admin-btn admin-btn-danger" onClick={() => remove(i)}>
                    {zh ? '删除' : 'Delete'}
                  </button>
                </div>
              </div>

              {block.type === 'text' && (
                <div className="admin-grid-2">
                  <RichTextField
                    label={zh ? '正文（英文）' : 'Text (EN)'}
                    value={block.textEn}
                    onChange={(textEn) => update(i, { ...block, textEn })}
                    lang={lang}
                    contentKey={`${block.id}-en`}
                  />
                  <RichTextField
                    label={zh ? '正文（中文）' : 'Text (ZH)'}
                    value={block.textZh}
                    onChange={(textZh) => update(i, { ...block, textZh })}
                    lang={lang}
                    contentKey={`${block.id}-zh`}
                  />
                </div>
              )}

              {block.type === 'image' && (
                <>
                  <ImageField
                    label={zh ? '图片' : 'Image'}
                    value={block.src}
                    onChange={(src) => update(i, { ...block, src })}
                    lang={lang}
                  />
                  <div className="admin-grid-2">
                    <label className="admin-field">
                      <span>{zh ? '说明（英文）' : 'Alt (EN)'}</span>
                      <input
                        value={block.altEn || ''}
                        onChange={(e) => update(i, { ...block, altEn: e.target.value })}
                      />
                    </label>
                    <label className="admin-field">
                      <span>{zh ? '说明（中文）' : 'Alt (ZH)'}</span>
                      <input
                        value={block.altZh || ''}
                        onChange={(e) => update(i, { ...block, altZh: e.target.value })}
                      />
                    </label>
                  </div>
                </>
              )}

              {block.type === 'gallery' && (
                <div className="admin-gallery-editor">
                  {block.images.map((img, gi) => (
                    <div key={`${block.id}-${gi}`} className="admin-subcard">
                      <div className="admin-card-head">
                        <h3>
                          {zh ? '图片' : 'Image'} {gi + 1}
                        </h3>
                        <button
                          type="button"
                          className="admin-btn"
                          onClick={() =>
                            update(i, {
                              ...block,
                              images: block.images.filter((_, x) => x !== gi),
                            })
                          }
                        >
                          {zh ? '移除' : 'Remove'}
                        </button>
                      </div>
                      <ImageField
                        label={zh ? '图片' : 'Image'}
                        value={img.src}
                        onChange={(src) => {
                          const images = block.images.map((it, x) => (x === gi ? { ...it, src } : it))
                          update(i, { ...block, images })
                        }}
                        lang={lang}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    className="admin-btn"
                    onClick={() =>
                      update(i, {
                        ...block,
                        images: [...block.images, { src: '', altEn: '', altZh: '' }],
                      })
                    }
                  >
                    {zh ? '+ 向图集添加图片' : '+ Add image to gallery'}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="admin-blocks-actions">
        <button type="button" className="admin-btn" onClick={() => add(newTextBlock())}>
          {zh ? '+ 文本块' : '+ Text block'}
        </button>
        <button type="button" className="admin-btn" onClick={() => add(newImageBlock())}>
          {zh ? '+ 图片块' : '+ Image block'}
        </button>
        <button type="button" className="admin-btn" onClick={() => add(newGalleryBlock())}>
          {zh ? '+ 图集' : '+ Image gallery'}
        </button>
      </div>
    </div>
  )
}
