import {addToast, Autocomplete, AutocompleteItem} from '@heroui/react'
import {useCallback, useEffect, useState} from 'react'
import {LTLocation} from '@/src/utils/types'
import LocationIcon from '@/src/components/global/LocationIcon'
import {useAuth} from '@/src/components/global/providers/authProvider'
import checkPermissions from '@/lib/functions/checkPermissions'

interface LocationSelectProps {
  callback: any
  locationId: number
  labelPlacement?:
    | 'outside'
    | 'outside-left'
    | 'outside-top'
    | 'inside'
    | undefined
  showLabel?: boolean
  className?: string
  includeAll?: boolean
}

export default function LocationSelect({
  callback,
  locationId,
  labelPlacement = 'outside',
  showLabel = true,
  className = '',
  includeAll = false,
}: LocationSelectProps) {
  const [locations, setLocations] = useState<LTLocation[]>([])
  const {worker} = useAuth()
  async function getLocations() {
    const response = await fetch('/api/getLocations')

    const json = await response.json()

    if (response.ok) {
      if (json.data) {
        let sortedLocations: LTLocation[] = json.data.sort(
          (a: LTLocation, b: LTLocation) => a.name.localeCompare(b.name),
        )

        if (includeAll) {
          sortedLocations = [
            {name: 'Все', id: 0, color: ''},
            ...sortedLocations,
          ]
        }

        if (!checkPermissions(['view_full_salary'], worker)) {
          sortedLocations = sortedLocations.filter(d =>
            [locationId, 12].includes(d.id),
          )
        }

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
      className={className}
      clearButtonProps={{hidden: true}}
      label={showLabel ? 'Локация' : ''}
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
