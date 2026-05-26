'use client'
import {useEffect, useRef} from 'react'
import Leaflet from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete (Leaflet.Icon.Default.prototype as any)._getIconUrl
Leaflet.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface LeafletMapProps {
  coords: {lat: number | null; lng: number | null} | null
  onMapClick: (lat: number, lng: number) => void
}

export default function LeafletMap({coords, onMapClick}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<Leaflet.Map | null>(null)
  const markerRef = useRef<Leaflet.Marker | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    const map = Leaflet.map(mapRef.current).setView([55.755, 37.617], 10)
    Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map)

    map.on('click', (e: Leaflet.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng)
    })

    mapInstance.current = map
  }, [])

  // Обновляем маркер когда меняются координаты
  useEffect(() => {
    if (!mapInstance.current || !coords) return

    if (markerRef.current) {
      markerRef.current.setLatLng([coords?.lat || 0, coords?.lng || 0])
    } else {
      markerRef.current = Leaflet.marker([
        coords?.lat || 0,
        coords?.lng || 0,
      ]).addTo(mapInstance.current)
    }

    mapInstance.current.setView([coords?.lat || 0, coords?.lng || 0], 15, {
      animate: true,
    })
  }, [coords])

  return (
    <div
      ref={mapRef}
      className="border-divider z-0 h-64 w-full overflow-hidden rounded-lg border"
    />
  )
}
