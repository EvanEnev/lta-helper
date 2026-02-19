import {addToast} from '@heroui/react'
import {
  Autocomplete,
  Label,
  SearchField,
  ListBox,
  useFilter,
} from '@heroui/react-beta'
import {useCallback, useEffect, useState} from 'react'
import {LTLocation, LTWorker} from '@/src/utils/types'
import LocationIcon from '@/src/components/global/LocationIcon'
import checkPermissions from '@/lib/functions/checkPermissions'
import {useSession} from '@/lib/auth/authClient'

interface LocationSelectProps {
  callback: (location: LTLocation | null) => void
  isClearable?: boolean
  isDisabled?: boolean
  dynamicLocationId?: boolean
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
  useShortNames?: boolean
  placeholder?: string
}

export default function LocationSelect({
  callback,
  isClearable = false,
  isDisabled = false,
  dynamicLocationId = false,
  isReadOnly = false,
  locationId,
  labelPlacement = 'outside',
  showLabel = true,
  className = '',
  includeAll = false,
  exclude = [],
  locations: definedLocations = [],
  useShortNames = false,
  placeholder = 'Выберите элемент',
}: LocationSelectProps) {
  const worker = useSession().data?.user as LTWorker | undefined
  const [locations, setLocations] = useState<LTLocation[]>(definedLocations)
  const [selectedLocation, setSelectedLocation] =
    useState<LTLocation['id']>(locationId)
  const {contains} = useFilter({sensitivity: 'base'})

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
            {name: 'Все', id: 0, color: '', shortName: 'Все'},
            ...sortedLocations,
          ]
        }

        if (worker && !checkPermissions(['view_full_salary'], worker)) {
          sortedLocations = sortedLocations.filter(d => {
            if ((worker.id === 42 || worker.id === 12) && d.id === 17) {
              return true
            } else {
              return [worker.locationId, 12].includes(d.id)
            }
          })
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

  useEffect(() => {
    if (dynamicLocationId) {
      setSelectedLocation(locationId)
    }
  }, [dynamicLocationId, locationId])

  const onChange = useCallback(
    (locationId: any) => {
      if (isDisabled || isReadOnly) return
      setSelectedLocation(locationId)
      callback(locations.find(location => location?.id == locationId) || null)
    },
    [callback, isDisabled, isReadOnly, locations],
  )

  return (
    <Autocomplete
      placeholder={placeholder}
      isDisabled={isDisabled || isReadOnly}
      variant="secondary"
      selectionMode="single"
      className={className}
      value={selectedLocation}
      onChange={onChange}>
      {showLabel ? <Label>Локация</Label> : null}
      <Autocomplete.Trigger>
        <Autocomplete.Value className="flex items-center gap-2" />
        {isClearable && <Autocomplete.ClearButton />}
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <Autocomplete.Filter filter={contains}>
          <SearchField>
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input />
            </SearchField.Group>
          </SearchField>
          <ListBox>
            {locations.map(location => (
              <ListBox.Item
                className="flex items-center gap-2"
                key={location.id}
                id={location.id}
                textValue={location.name}>
                <LocationIcon
                  className="h-6"
                  locationName={
                    useShortNames ? location.shortName : location.name
                  }
                />
                <p>{useShortNames ? location.shortName : location.name}</p>
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  )
}
