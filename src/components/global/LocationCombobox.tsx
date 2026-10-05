'use client'

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import LocationIcon from '@/src/components/global/LocationIcon'
import type {LTLocation} from '@/src/utils/types'

interface LocationComboboxProps {
  locations: LTLocation[]
  value: string // название локации
  onChange: (name: string) => void
  placeholder?: string
}

// Выбор одной локации с поиском и иконками (shadcn-версия LocationSelect)
export default function LocationCombobox({
  locations,
  value,
  onChange,
  placeholder = 'Выберите локацию',
}: LocationComboboxProps) {
  const selected = locations.find(l => l.name === value) ?? null

  return (
    <Combobox
      items={locations}
      value={selected}
      itemToStringLabel={(location: LTLocation) => location.name}
      isItemEqualToValue={(a: LTLocation, b: LTLocation) => a.id === b.id}
      onValueChange={(location: LTLocation | null) =>
        onChange(location?.name ?? '')
      }>
      <ComboboxInput aria-label="Локация" placeholder={placeholder} />
      <ComboboxContent>
        <ComboboxEmpty>Ничего не найдено</ComboboxEmpty>
        <ComboboxList>
          {(location: LTLocation) => (
            <ComboboxItem key={location.id} value={location}>
              <LocationIcon className="h-5" locationName={location.name} />
              {location.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
