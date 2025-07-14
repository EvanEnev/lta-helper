import {addToast, Autocomplete, AutocompleteItem} from '@heroui/react'
import {useCallback, useEffect, useState} from 'react'
import {LTLocation} from '@/src/utils/types'
import LocationIcon from '@/src/components/global/LocationIcon'

interface LocationSelectProps {
  callback: any
  locationId: number
  labelPlacement?:
    | 'outside'
    | 'outside-left'
    | 'outside-top'
    | 'inside'
    | undefined
}

export default function LocationSelect({
  callback,
  locationId,
  labelPlacement = 'outside',
}: LocationSelectProps) {
  const [locations, setLocations] = useState<LTLocation[]>([])
  async function getLocations() {
    const response = await fetch('/api/getLocations')

    const json = await response.json()

    if (response.ok) {
      if (json.data) {
        const sortedLocations: LTLocation[] = json.data.sort(
          (a: LTLocation, b: LTLocation) => a.name.localeCompare(b.name),
        )

        setLocations(sortedLocations)
      }
    } else {
      addToast({
        color: 'danger',
        title: 'Ошибка!',
        description: json.message || 'Неизвестная ошибка',
      })
    }
  }

  useEffect(() => {
    getLocations()
  }, [])

  const onChange = useCallback(
    (locationId: any) => {
      callback(locations.find(location => location.id == locationId) || null)
    },
    [callback, locations],
  )

  return (
    <Autocomplete
      required
      clearButtonProps={{hidden: true}}
      label="Локация"
      labelPlacement={labelPlacement}
      onSelectionChange={onChange}
      selectedKey={locationId.toString()}
      aria-label="Выбор локации">
      {locations.map(location => (
        <AutocompleteItem
          startContent={<LocationIcon locationName={location.name} />}
          key={location.id.toString()}>
          {location.name}
        </AutocompleteItem>
      ))}
    </Autocomplete>
  )
}
