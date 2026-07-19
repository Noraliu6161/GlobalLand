import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Project, ProjectType } from '../data/projects'
import { useI18n } from '../i18n'
import 'leaflet/dist/leaflet.css'

const typeColors: Record<ProjectType, string> = {
  condo: '#0ea5a4',
  sfh: '#f97316',
  townhouse: '#eab308',
  office: '#3b82f6',
  mixed: '#a855f7',
}

function makePinIcon(color: string, selected: boolean, label: string) {
  const w = selected ? 42 : 34
  const h = selected ? 52 : 42
  const html = `
    <div class="gl-pin ${selected ? 'is-selected' : ''}" style="--pin:${color}">
      <span class="gl-pin-dot"></span>
      <span class="gl-pin-label">${label}</span>
    </div>
  `
  return L.divIcon({
    className: 'gl-pin-wrap',
    html,
    iconSize: [w, h],
    iconAnchor: [w / 2, h - 2],
    popupAnchor: [0, -h + 8],
  })
}

function FitBounds({ projects }: { projects: Project[] }) {
  const map = useMap()
  useEffect(() => {
    if (!projects.length) return
    const bounds = L.latLngBounds(projects.map((p) => [p.lat, p.lng] as [number, number]))
    map.fitBounds(bounds.pad(0.18), { padding: [36, 36], maxZoom: 12 })
  }, [map, projects])
  return null
}

function FlyTo({ project }: { project: Project | null }) {
  const map = useMap()
  useEffect(() => {
    if (!project) return
    map.flyTo([project.lat, project.lng], 14, { duration: 0.85 })
  }, [map, project])
  return null
}

export function ProjectMap({
  projects,
  selectedId,
  onSelect,
}: {
  projects: Project[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const { t } = useI18n()
  const center = useMemo<[number, number]>(() => [47.6, -122.2], [])
  const selected = projects.find((p) => p.id === selectedId) ?? null

  const legendTypes = useMemo(() => {
    const seen = new Set<ProjectType>()
    projects.forEach((p) => seen.add(p.type))
    return Array.from(seen)
  }, [projects])

  return (
    <div className="map-panel">
      <MapContainer center={center} zoom={9} scrollWheelZoom={false} className="gl-map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <FitBounds projects={projects} />
        <FlyTo project={selected} />
        {projects.map((p) => {
          const color = typeColors[p.type]
          const selectedNow = selectedId === p.id
          const short = p.name.split(' ')[0].slice(0, 8)
          return (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={makePinIcon(color, selectedNow, short)}
              eventHandlers={{ click: () => onSelect(p.id) }}
              zIndexOffset={selectedNow ? 1000 : 0}
            >
              <Popup>
                <div className="map-popup">
                  <div className="map-popup-swatch" style={{ background: color }} />
                  <h4>{p.name}</h4>
                  <p>
                    {p.city} · {t(`type.${p.type}`)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      <div className="map-legend" aria-label={t('map.legend')}>
        <strong>{t('map.legend')}</strong>
        <ul>
          {legendTypes.map((type) => (
            <li key={type}>
              <span className="map-legend-dot" style={{ background: typeColors[type] }} />
              {t(`type.${type}`)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
