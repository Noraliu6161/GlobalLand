import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n'

const concepts = [
  {
    id: 'stacked',
    n: '01',
    titleEn: 'Stacked cards',
    titleZh: '动态堆叠卡片',
    descEn: 'Polaroid stack fans out on hover. Same About copy & community mosaic.',
    descZh: '拍立得叠放，悬停扇形展开。文案与社区区与正式 About 一致。',
  },
  {
    id: 'tilt',
    n: '04',
    titleEn: '3D tilt',
    titleZh: '磁性 3D 悬浮',
    descEn: 'Cursor-driven tilt and highlight on the photo cluster.',
    descZh: '光标驱动轻微 3D 倾斜与高光，像浮在屏幕上。',
  },
  {
    id: 'timeline',
    n: '05',
    titleEn: 'Story timeline',
    titleZh: '交互式时间轴',
    descEn: 'Click year milestones to fade between story photos.',
    descZh: '点击年份节点，右侧主图与说明平滑切换。',
  },
  {
    id: 'carousel',
    n: 'New',
    titleEn: 'Classic carousel',
    titleZh: '经典轮播',
    descEn: 'Single large frame with autoplay, arrows, and dots.',
    descZh: '单图大画幅自动轮播，支持前后翻页与圆点。',
  },
  {
    id: 'trio',
    n: 'New',
    titleEn: 'Trio collage carousel',
    titleZh: '三格排版轮播',
    descEn: 'Screenshot layout (3 slots). Extra photos rotate through the three frames.',
    descZh: '按截图三格排版；多图时轮流出现在左横 / 右竖 / 右下三格。',
  },
] as const

export function AboutConceptsIndex() {
  const { lang } = useI18n()
  const zh = lang === 'zh'

  return (
    <div className="ac-picker">
      <div className="ac-picker-hero">
        <p className="ac-kicker">{zh ? '设计样稿 · 仅改图片区' : 'Design labs · image area only'}</p>
        <h1>{zh ? 'About 图片方案' : 'About image concepts'}</h1>
        <p className="ac-picker-lead">
          {zh
            ? '每页保留正式 About 的标题、正文与社区区块，只替换右侧团队照片表现。请逐一体验后告诉我选用哪一版。'
            : 'Each page keeps live About headline, body, and community section — only the team photo treatment changes. Try them, then tell us which to ship.'}
        </p>
        <Link className="ac-chip" to="/about">
          {zh ? '← 查看当前 About' : '← Current About'}
        </Link>
      </div>

      <ol className="ac-picker-grid">
        {concepts.map((c) => (
          <li key={c.id}>
            <Link className="ac-picker-card" to={`/about-concepts/${c.id}`}>
              <span className="ac-picker-n">{c.n}</span>
              <h2>{zh ? c.titleZh : c.titleEn}</h2>
              <p>{zh ? c.descZh : c.descEn}</p>
              <span className="ac-picker-go">{zh ? '打开体验 →' : 'Open demo →'}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}
