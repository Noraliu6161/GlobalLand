import { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { company } from '../data/projects'
import 'leaflet/dist/leaflet.css'

function officePinIcon() {
  const html = `
    <div class="office-pin">
      <span class="office-pin-dot"></span>
    </div>
  `
  return L.divIcon({
    className: 'office-pin-wrap',
    html,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  })
}

export function OfficeMap() {
  const center = useMemo<[number, number]>(() => [company.lat, company.lng], [])
  const icon = useMemo(() => officePinIcon(), [])
  const label = `${company.addressLine1}, ${company.addressLine2}`

  return (
    <div className="office-map">
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={false}
        className="office-map-canvas"
        attributionControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <Marker position={center} icon={icon}>
          <Popup>
            <strong>
              {company.addressLine1}
              <br />
              {company.addressLine2}
            </strong>
          </Popup>
        </Marker>
      </MapContainer>
      <p className="office-map-label" aria-hidden="true">
        {label.split(', ').slice(0, 1).join(', ')},
        <br />
        {company.addressLine2}
      </p>
    </div>
  )
}
