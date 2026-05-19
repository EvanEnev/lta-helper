'use client'
import {useCallback, useEffect, useRef, useState} from 'react'
import {Input, Button} from '@heroui/react'
import dynamic from 'next/dynamic'

interface Coords {
  lat: number
  lng: number
  address: string
}

interface LocationPickerProps {
  onSelect: (coords: Coords) => void
  defaultAddress?: string
  defaultCoords?: {lat: number | null; lng: number | null}
}

const Map = dynamic(() => import('./LocationPickerMap'), {ssr: false})

export function LocationPicker({
  onSelect,
  defaultAddress,
  defaultCoords,
}: LocationPickerProps) {
  const [address, setAddress] = useState(defaultAddress ?? '')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [coords, setCoords] = useState<{
    lat: number | null
    lng: number | null
  } | null>(defaultCoords ?? null)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  async function fetchSuggestions(value: string) {
    if (value.length < 3) {
      setSuggestions([])
      return
    }
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=5&addressdetails=1&accept-language=ru`,
      {headers: {'User-Agent': 'your-app'}},
    )
    const data = await res.json()
    setSuggestions(data)
  }

  function handleInput(value: string) {
    setAddress(value)
    clearTimeout(debounceRef.current || -1)
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 400)
  }

  function selectSuggestion(s: any) {
    const lat = parseFloat(s.lat)
    const lng = parseFloat(s.lon)
    setAddress(s.display_name)
    setCoords({lat, lng})
    setSuggestions([])
    onSelect({lat, lng, address: s.display_name})
  }

  const handleCoords = useCallback(
    async ({lat, lng}: {lat: number; lng: number}) => {
      setCoords({lat, lng})
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ru`,
        {headers: {'User-Agent': 'your-app'}},
      )
      const data = await res.json()
      setAddress(data.display_name ?? '')
      onSelect({lat, lng, address: data.display_name ?? ''})
      setLoading(false)
    },
    [onSelect],
  )

  const handleGeo = useCallback(
    async (params?: {coords: {lat: number | null; lng: number | null}}) => {
      const coords = params?.coords
      setLoading(true)
      if (coords?.lat && coords?.lng) {
        return await handleCoords({lat: coords.lat, lng: coords.lng})
      }

      navigator.geolocation.getCurrentPosition(
        async pos => {
          const {latitude: lat, longitude: lng} = pos.coords
          await handleCoords({lat, lng})
        },
        () => setLoading(false),
      )
    },
    [handleCoords],
  )

  async function handleMapClick(lat: number, lng: number) {
    setCoords({lat, lng})
    // Обратное геокодирование
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {headers: {'User-Agent': 'your-app'}},
    )
    const data = await res.json()
    setAddress(data.display_name ?? '')
    onSelect({lat, lng, address: data.display_name ?? ''})
    console.debug(lat, lng)
    await handleCoords({lat, lng})
  }

  useEffect(() => {
    if (defaultCoords?.lat && defaultCoords?.lng) {
      handleGeo({coords: defaultCoords})
    }
  }, [])

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Input
          variant="secondary"
          placeholder="Введите адрес"
          value={address}
          className="w-full"
          onChange={e => handleInput(e.target.value)}
        />
        {suggestions.length > 0 && (
          <div className="bg-surface border-divider absolute z-500 mt-1 w-full overflow-hidden rounded-lg border shadow-lg">
            {suggestions.map((s, i) => (
              <button
                key={i}
                className="hover:bg-content2 border-divider w-full border-b px-3 py-2 text-left text-sm last:border-0"
                onClick={() => selectSuggestion(s)}>
                {s.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <Button
        variant="secondary"
        onPress={() => handleGeo()}
        isPending={loading}>
        Использовать моё местоположение
      </Button>

      <Map coords={coords} onMapClick={handleMapClick} />
    </div>
  )
}
