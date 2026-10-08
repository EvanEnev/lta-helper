'use client'

import {useCallback, useEffect, useRef, useState} from 'react'
import dynamic from 'next/dynamic'
import {Loader2, LocateFixed} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'

interface Coords {
  lat: number
  lng: number
  address: string
}

interface Suggestion {
  display_name: string
  lat: string
  lon: string
}

interface LocationPickerProps {
  onSelect: (coords: Coords) => void
  defaultAddress?: string
  defaultCoords?: {lat: number | null; lng: number | null}
}

const Map = dynamic(() => import('./LocationPickerMap'), {ssr: false})

const NOMINATIM = 'https://nominatim.openstreetmap.org'

export function LocationPicker({
  onSelect,
  defaultAddress,
  defaultCoords,
}: LocationPickerProps) {
  const [address, setAddress] = useState(defaultAddress ?? '')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [coords, setCoords] = useState(defaultCoords ?? null)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)
  const requestId = useRef(0)

  const fetchSuggestions = async (value: string) => {
    const id = ++requestId.current

    if (value.length < 3) {
      setSuggestions([])
      return
    }

    try {
      const res = await fetch(
        `${NOMINATIM}/search?q=${encodeURIComponent(value)}&format=json&limit=5&addressdetails=1&accept-language=ru`,
      )
      const data = await res.json()

      if (id === requestId.current) setSuggestions(data)
    } catch {}
  }

  const handleInput = (value: string) => {
    setAddress(value)
    clearTimeout(debounceRef.current ?? undefined)
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 400)
  }

  const selectSuggestion = (s: Suggestion) => {
    const lat = parseFloat(s.lat)
    const lng = parseFloat(s.lon)

    setAddress(s.display_name)
    setCoords({lat, lng})
    setSuggestions([])
    onSelect({lat, lng, address: s.display_name})
  }

  const handleCoords = useCallback(
    async ({lat, lng}: {lat: number; lng: number}, notify = true) => {
      setCoords({lat, lng})

      let name = ''

      try {
        const res = await fetch(
          `${NOMINATIM}/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ru`,
        )
        name = (await res.json()).display_name ?? ''
      } catch {}

      setAddress(name)
      if (notify) onSelect({lat, lng, address: name})
      setLoading(false)
    },
    [onSelect],
  )

  const useMyLocation = () => {
    setLoading(true)

    navigator.geolocation.getCurrentPosition(
      pos =>
        handleCoords({lat: pos.coords.latitude, lng: pos.coords.longitude}),
      () => setLoading(false),
    )
  }

  useEffect(() => {
    if (defaultCoords?.lat && defaultCoords?.lng) {
      handleCoords({lat: defaultCoords.lat, lng: defaultCoords.lng}, false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Input
          placeholder="Введите адрес"
          aria-label="Адрес"
          value={address}
          className="h-10 text-base"
          onChange={e => handleInput(e.target.value)}
        />
        {suggestions.length > 0 && (
          <div className="bg-popover absolute z-[500] mt-1 w-full overflow-hidden rounded-lg border shadow-lg">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                className="hover:bg-muted w-full border-b px-3 py-2.5 text-left text-sm last:border-0"
                onClick={() => selectSuggestion(s)}>
                {s.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <Button
        variant="outline"
        className="h-10 text-base"
        disabled={loading}
        onClick={useMyLocation}>
        {loading ? <Loader2 className="animate-spin" /> : <LocateFixed />}
        Использовать моё местоположение
      </Button>

      <Map
        coords={coords}
        onMapClick={(lat, lng) => handleCoords({lat, lng})}
      />
    </div>
  )
}
