import {addToast, Autocomplete, AutocompleteItem} from '@heroui/react'
import {useCallback, useEffect, useState} from 'react'
import {LTLocation} from '@/src/utils/types'
import LocationIcon from '@/src/components/global/LocationIcon'
import {useAuth} from '@/src/components/global/providers/authProvider'
import checkPermissions from '@/lib/functions/checkPermissions'

interface LocationSelectProps {
  callback: (location: LTLocation | null) => void
  isDisabled?: boolean
  isReadOnly?: boolean
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
  exclude?: (string | number)[]
  locations?: LTLocation[]
}

export default function LocationSelect({
  callback,
  isDisabled = false,
  isReadOnly = false,
  locationId,
  labelPlacement = 'outside',
  showLabel = true,
  className = '',
  includeAll = false,
  exclude = [],
  locations: definedLocations = [],
}: LocationSelectProps) {
  const [locations, setLocations] = useState<LTLocation[]>(definedLocations)
  const [selectedLocation, setSelectedLocation] =
    useState<LTLocation['id']>(locationId)

  const {worker} = useAuth()
  async function getLocations() {
    if (definedLocations.length) return

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
            [worker.locationId, 12].includes(d.id),
          )
        }

        sortedLocations = sortedLocations.filter(
          d =>
            !exclude?.includes(d.id) &&
            !exclude?.includes(d.name.toLowerCase()) &&
            !exclude?.includes(d.name),
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
      setSelectedLocation(locationId)
      callback(locations.find(location => location.id == locationId) || null)
    },
    [callback, locations],
  )

  return (
    <Autocomplete
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      required
      className={className}
      inputProps={{classNames: {inputWrapper: 'h-full'}}}
      clearButtonProps={{hidden: true}}
      label={showLabel ? 'Локация' : ''}
      labelPlacement={labelPlacement}
      onSelectionChange={onChange}
      selectedKey={selectedLocation.toString()}
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
