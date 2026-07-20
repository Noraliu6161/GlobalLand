import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { typeLabels, type Project } from '../data/projects'
import { cityKey, pickText } from '../lib/localized'
import { useI18n } from '../i18n'

const COLORS = ['#2f8f86', '#e07020', '#c9a227', '#4a7c8c', '#6b5b4a', '#1f2a28']

export function InsightsCharts({ projects }: { projects: Project[] }) {
  const { t, lang } = useI18n()
  const byCity = Object.values(
    projects.reduce<Record<string, { name: string; count: number }>>((acc, p) => {
      const key = cityKey(p.city)
      acc[key] = acc[key] || { name: pickText(p.city, lang), count: 0 }
      acc[key].count += 1
      return acc
    }, {}),
  ).sort((a, b) => b.count - a.count)

  const byType = Object.values(
    projects.reduce<Record<string, { name: string; count: number }>>((acc, p) => {
      const name = t(`type.${p.type}`) || typeLabels[p.type]
      acc[p.type] = acc[p.type] || { name, count: 0 }
      acc[p.type].count += 1
      return acc
    }, {}),
  )

  const scale = projects
    .map((p) => {
      const name = pickText(p.name, lang)
      return {
        name: name.length > 16 ? `${name.slice(0, 14)}…` : name,
        units: p.units ?? 0,
        value: p.saleValueM ?? p.acquisitionPriceM ?? 0,
      }
    })
    .filter((d) => d.units > 0 || d.value > 0)

  const unitScale = scale.filter((d) => d.units > 0)
  const moneyScale = scale.filter((d) => d.value > 0)

  return (
    <div className="chart-grid">
      <div className="chart-block">
        <h3>Regional distribution</h3>
        <p className="hint">Project count by city — derived from portfolio data</p>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={byCity} dataKey="count" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
              {byCity.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-block">
        <h3>Development types</h3>
        <p className="hint">Mix of condo, residential, and office assets</p>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={byType} dataKey="count" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
              {byType.map((_, i) => (
                <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-block wide">
        <h3>Project scale — residential units</h3>
        <p className="hint">Unit counts where disclosed in company materials</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={unitScale} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,24,22,0.08)" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="units" fill="#2f8f86" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-block wide">
        <h3>Project scale — reported value ($M)</h3>
        <p className="hint">Sales projections and acquisition prices from portfolio narrative</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={moneyScale} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,24,22,0.08)" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => [`$${v}M`, 'Value']} />
            <Bar dataKey="value" fill="#e07020" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
