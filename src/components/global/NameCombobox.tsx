'use client'

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'

interface NameComboboxProps {
  names: string[]
  value: string
  onChange: (name: string) => void
  placeholder?: string
  label: string
}

export default function NameCombobox({
  names,
  value,
  onChange,
  placeholder = 'Выберите',
  label,
}: NameComboboxProps) {
  return (
    <Combobox
      items={names}
      value={value || null}
      onValueChange={(name: string | null) => onChange(name ?? '')}>
      <ComboboxInput aria-label={label} placeholder={placeholder} />
      <ComboboxContent>
        <ComboboxEmpty>Ничего не найдено</ComboboxEmpty>
        <ComboboxList>
          {(name: string) => (
            <ComboboxItem key={name} value={name}>
              {name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
